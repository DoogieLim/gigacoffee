import { NextRequest } from "next/server"
import { orderRepo, deliveryRepo } from "@/lib/db"
import { dispatch } from "@/lib/notifications/dispatcher"
import { getAuthUser } from "@/lib/api/auth"
import { apiSuccess, apiError } from "@/lib/api/response"
import type { CreateOrderInput, OrderStatus } from "@/types/order.types"
import type { Json } from "@/types/database.types"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)

    if (!user) {
      return apiError("인증이 필요합니다", 401)
    }

    const orders = await orderRepo.findByUser(user.id)
    return apiSuccess(orders)
  } catch (error) {
    return apiError(`주문 조회 실패: ${String(error)}`, 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)

    if (!user) {
      return apiError("인증이 필요합니다", 401)
    }

    const body = await request.json()
    const input = body as CreateOrderInput

    const deliveryType = input.delivery_type ?? "pickup"

    let verifiedDeliveryFee = 0
    if (deliveryType !== "pickup") {
      const settings = await deliveryRepo.findAll()
      const setting = settings.find((s) => s.type === deliveryType)
      if (!setting?.is_enabled) return apiError("현재 해당 배달 서비스를 이용할 수 없습니다.", 400)
      verifiedDeliveryFee = setting.fee
    }

    const itemTotal = input.items.reduce((sum, item) => {
      const optionTotal = item.options.reduce((s, o) => s + o.price_delta, 0)
      return sum + (item.price + optionTotal) * item.quantity
    }, 0)
    const total = itemTotal + verifiedDeliveryFee

    const order = await orderRepo.create({
      userId: user.id,
      totalAmount: total,
      memo: input.memo,
      deliveryType,
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
          (item.price + item.options.reduce((s, o) => s + o.price_delta, 0)) *
          item.quantity,
      }))
    )

    return apiSuccess(order, 201)
  } catch (error) {
    return apiError(`주문 생성 실패: ${String(error)}`, 500)
  }
}
