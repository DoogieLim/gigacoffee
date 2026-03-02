/**
 * POST /api/payment/cancel — 고객 직접 결제 취소
 *
 * 고객이 자신의 주문을 취소한다. 결제 완료 상태인 경우 PortOne 환불도 함께 처리한다.
 *
 * **결제 상태별 처리:**
 * - `pending` (미결제): orders.status만 'cancelled'로 변경 (PortOne 호출 없음)
 * - `paid` (결제완료): PortOne cancelPayment → payments.status='cancelled' → orders.status='cancelled'
 *
 * **관리자 취소:** 이 API 대신 Server Action `updateOrderStatus(id, 'cancelled')`를 사용한다.
 * Server Action은 PortOne 환불 자동 호출 + 더 상세한 로그 기록을 포함한다.
 *
 * 인증: 로그인 사용자 필요 (주문 소유권 검증 포함)
 * OpenAPI 스펙: src/lib/api/openapi.ts → /api/payment/cancel POST
 */
import { NextRequest, NextResponse } from "next/server"
import { cancelPayment } from "@/lib/portone/server"
import { orderRepo, paymentRepo } from "@/lib/db"
import { dispatch } from "@/lib/notifications/dispatcher"
import { getAuthUser } from "@/lib/api/auth"

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 })
    }

    const { order_id, reason = "고객 요청 취소" } = await request.json()
    if (!order_id) {
      return NextResponse.json({ error: "order_id가 필요합니다" }, { status: 400 })
    }

    const order = await orderRepo.findById(order_id)
    if (!order) {
      return NextResponse.json({ error: "주문을 찾을 수 없습니다" }, { status: 404 })
    }

    // 타인의 주문 취소 시도 방지
    if (order.user_id !== user.id) {
      return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 })
    }

    // 결제 완료 상태인 경우에만 PortOne 환불 처리 (미결제 주문은 DB 상태만 변경)
    const payment = await paymentRepo.findByOrderId(order_id)
    if (payment && payment.portone_payment_id && payment.status === "paid") {
      await cancelPayment(payment.portone_payment_id, reason)
      await paymentRepo.updateStatus(payment.id, "cancelled")
    }

    await orderRepo.updateStatus(order_id, "cancelled")

    // 취소 알림 발송 (실패해도 취소 자체는 완료 처리)
    await dispatch({
      recipientId: order.user_id,
      eventType: "ORDER_CANCELLED",
      templateData: { orderId: order_id.slice(0, 8) },
    }).catch(console.error)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
