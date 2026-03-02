"use server"

import { createClient } from "@/lib/supabase/server"
import { orderRepo, deliveryRepo, paymentRepo } from "@/lib/db"
import { dispatch } from "@/lib/notifications/dispatcher"
import { cancelPayment } from "@/lib/portone/server"
import type { CreateOrderInput, OrderStatus } from "@/types/order.types"
import type { Json } from "@/types/database.types"

export async function createOrder(input: CreateOrderInput) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("로그인이 필요합니다.")

  // 배달 주문 시 주소 필수
  if (input.delivery_type !== "pickup" && !input.delivery_address) {
    throw new Error("배달 주소를 입력해주세요.")
  }

  // 배달비 서버 측 검증
  let verifiedDeliveryFee = 0
  if (input.delivery_type !== "pickup") {
    const settings = await deliveryRepo.findAll(input.store_id ?? null)
    const setting = settings.find((s) => s.type === input.delivery_type)
    if (!setting?.is_enabled) throw new Error("현재 해당 배달 서비스를 이용할 수 없습니다.")
    verifiedDeliveryFee = setting.fee
  }

  const itemTotal = input.items.reduce((sum, item) => {
    const optionTotal = item.options.reduce((s, o) => s + o.price_delta, 0)
    return sum + (item.price + optionTotal) * item.quantity
  }, 0)
  const total = itemTotal + verifiedDeliveryFee

  const order = await orderRepo.create({
    userId: user.id,
    storeId: input.store_id ?? null,
    totalAmount: total,
    memo: input.memo,
    deliveryType: input.delivery_type,
    deliveryAddress: input.delivery_address ?? null,
    deliveryFee: verifiedDeliveryFee,
  })

  await orderRepo.insertItems(
    input.items.map((item) => ({
      orderId: order.id,
      productId: item.product_id,
      productName: item.product_name,
      quantity: item.quantity,
      options: item.options as unknown as Json,
      lineTotal:
        (item.price + item.options.reduce((s, o) => s + o.price_delta, 0)) * item.quantity,
    }))
  )

  return order
}

export async function updateOrderStatus(orderId: string, status: string) {
  // 취소 상태로 변경 시 결제 완료 주문이면 자동 PortOne 환불
  if (status === "cancelled") {
    const payment = await paymentRepo.findByOrderId(orderId)
    if (payment && payment.status === "paid") {
      await cancelPayment(payment.portone_payment_id, "관리자에 의한 주문 취소").catch(console.error)
      await paymentRepo.updateStatus(payment.id, "refunded").catch(console.error)
    }
  }

  const order = await orderRepo.updateStatus(orderId, status as OrderStatus)
  const deliveryType = order.delivery_type // "pickup" | "robot" | "rider" | "dine-in"
  const isDelivery = deliveryType === "robot" || deliveryType === "rider"
  const templateData = {
    orderId: order.id.slice(0, 8),
    deliveryType,
  }

  let eventType: import("@/lib/notifications/dispatcher").NotificationEvent | null = null
  switch (status) {
    case "paid":
      eventType = "ORDER_PAID"
      break
    case "preparing":
      eventType = "ORDER_PREPARING"
      break
    case "out_for_delivery":
      if (isDelivery) eventType = "ORDER_OUT_FOR_DELIVERY"
      break
    case "ready":
      if (!isDelivery) eventType = "ORDER_READY"
      break
    case "completed":
      eventType = "ORDER_COMPLETED"
      break
    case "cancelled":
      eventType = "ORDER_CANCELLED"
      break
  }

  if (eventType) {
    await dispatch({
      recipientId: order.user_id,
      eventType,
      templateData,
    }).catch(console.error)
  }

  return order
}
