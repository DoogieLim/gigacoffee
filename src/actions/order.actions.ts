"use server"

import { createClient } from "@/lib/supabase/server"
import { orderRepo } from "@/lib/db"
import { dispatch } from "@/lib/notifications/dispatcher"
import type { CreateOrderInput, OrderStatus } from "@/types/order.types"
import type { Json } from "@/types/database.types"

export async function createOrder(input: CreateOrderInput) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("로그인이 필요합니다.")

  const total = input.items.reduce((sum, item) => {
    const optionTotal = item.options.reduce((s, o) => s + o.price_delta, 0)
    return sum + (item.price + optionTotal) * item.quantity
  }, 0)

  const order = await orderRepo.create({ userId: user.id, totalAmount: total, memo: input.memo })

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
  const order = await orderRepo.updateStatus(orderId, status as OrderStatus)

  const eventMap: Record<string, "ORDER_PAID" | "ORDER_PREPARING" | "ORDER_READY" | "ORDER_CANCELLED"> = {
    paid: "ORDER_PAID",
    preparing: "ORDER_PREPARING",
    ready: "ORDER_READY",
    cancelled: "ORDER_CANCELLED",
  }

  const eventType = eventMap[status]
  if (eventType) {
    await dispatch({
      recipientId: order.user_id,
      eventType,
      templateData: { orderId: order.id.slice(0, 8) },
    }).catch(console.error)
  }

  return order
}
