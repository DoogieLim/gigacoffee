/**
 * GET  /api/orders — 내 주문 목록 조회
 * POST /api/orders — 주문 생성
 *
 * 인증: 로그인 사용자 필요
 * OpenAPI 스펙: src/lib/api/openapi.ts → /api/orders
 */
import { NextRequest } from "next/server"
import { orderRepo, deliveryRepo } from "@/lib/db"
import { dispatch } from "@/lib/notifications/dispatcher"
import { getAuthUser } from "@/lib/api/auth"
import { apiSuccess, apiError } from "@/lib/api/response"
import type { CreateOrderInput, OrderStatus } from "@/types/order.types"
import type { Json } from "@/types/database.types"

/** GET /api/orders — 로그인 사용자의 주문 목록 (최신순) */
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

/**
 * POST /api/orders — 주문 생성
 *
 * **보안 중요:** 클라이언트가 전달한 가격을 신뢰하지 않고 서버에서 재계산한다.
 * 배달비도 DB(delivery_settings)에서 직접 조회하여 클라이언트 전달값을 무시한다.
 *
 * 이 엔드포인트는 status='pending' 주문을 생성한다.
 * 실제 결제 확정은 /api/payment/complete에서 처리한다.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)

    if (!user) {
      return apiError("인증이 필요합니다", 401)
    }

    const body = await request.json()
    const input = body as CreateOrderInput

    const deliveryType = input.delivery_type ?? "pickup"

    // 배달비 서버 검증: 클라이언트가 임의로 배달비를 0으로 조작하는 것을 방지
    let verifiedDeliveryFee = 0
    if (deliveryType !== "pickup") {
      const settings = await deliveryRepo.findAll()
      const setting = settings.find((s) => s.type === deliveryType)
      if (!setting?.is_enabled) return apiError("현재 해당 배달 서비스를 이용할 수 없습니다.", 400)
      verifiedDeliveryFee = setting.fee
    }

    // 금액 서버 재계산: (기본가 + 옵션 합산) × 수량으로 계산 (클라이언트 전달 금액 무시)
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
        // options는 자유 형식 JSON (옵션명, 가격 등 포함)
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
