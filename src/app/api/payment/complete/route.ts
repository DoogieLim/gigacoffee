/**
 * POST /api/payment/complete — PortOne 결제 완료 검증 및 확정
 *
 * PortOne SDK가 결제창에서 완료 콜백을 받으면 클라이언트가 이 API를 호출한다.
 *
 * **보안 핵심:** 클라이언트가 보낸 금액을 절대 신뢰하지 않는다.
 * 반드시 PortOne 서버 API를 직접 호출하여 결제 상태와 금액을 검증한다.
 *
 * **장애 안전성 설계 (Fail-Safe):**
 * 단계별로 실패 시 자동 취소가 발동하여 결제금은 돌아가고 주문은 무효화된다.
 * - 금액 불일치 → PortOne 자동 취소
 * - DB 저장 실패 → PortOne 자동 취소
 * 알림 발송 실패는 주문 완료에 영향을 주지 않는다 (fire-and-forget).
 *
 * 인증: 로그인 필수 + 주문 소유자 검증 (본인 결제만 완료 가능)
 * OpenAPI 스펙: src/lib/api/openapi.ts → /api/payment/complete POST
 */
import { NextRequest, NextResponse } from "next/server"
import { verifyPayment, cancelPayment } from "@/lib/portone/server"
import { orderRepo, paymentRepo } from "@/lib/db"
import { dispatch, dispatchNewOrderToAdmin } from "@/lib/notifications/dispatcher"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  // 인증 확인: 로그인한 사용자만 결제 완료 가능
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
  }
  // paymentId를 외부 스코프에서 선언: catch 블록에서 자동 취소 시 접근 필요
  let paymentId: string | undefined

  try {
    const body = await request.json()
    paymentId = body.paymentId
    const { txId, order_id, item_count, delivery_type } = body

    // 1) PortOne 서버에서 결제 상태 직접 조회 (클라이언트 전달값 무시)
    const payment = await verifyPayment(paymentId!)

    if (payment.status !== "PAID") {
      return NextResponse.json(
        { error: "결제가 완료되지 않은 상태입니다. 다시 시도해주세요." },
        { status: 400 }
      )
    }

    // 2) 주문 금액 vs PortOne 결제 금액 비교 (가격 조작 방지)
    const order = await orderRepo.findById(order_id)
    // 소유자 검증: 본인 주문만 결제 완료 가능
    if (order && order.user_id !== user.id) {
      await cancelPayment(paymentId!, "주문 소유자 불일치로 인한 자동 취소").catch(console.error)
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 })
    }
    if (!order || order.total_amount !== payment.amount.total) {
      // 결제는 됐지만 금액 불일치 → PortOne 자동 취소로 결제금 환원
      await cancelPayment(paymentId!, "주문 금액 불일치로 인한 자동 취소").catch(console.error)
      return NextResponse.json(
        { error: "결제 금액이 주문 금액과 일치하지 않아 자동 취소되었습니다. 다시 시도해주세요." },
        { status: 400 }
      )
    }

    // 3) DB 저장 — 실패 시 결제 자동 취소 (고객이 결제금을 잃지 않도록)
    try {
      await paymentRepo.insert({
        orderId: order_id,
        portonePaymentId: paymentId!,
        merchantUid: txId,
        method: payment.method.type,
        status: "paid",
        amount: payment.amount.total,
        // rawResponse: PortOne 원본 응답 전체 저장 (환불/분쟁 시 증빙)
        rawResponse: payment,
      })
      await orderRepo.updateStatus(order_id, "paid")
    } catch (dbError) {
      console.error("[결제 DB 저장 실패]", dbError)
      await cancelPayment(paymentId!, "주문 처리 오류로 인한 자동 취소").catch(console.error)
      return NextResponse.json(
        { error: "주문 처리 중 오류가 발생하여 결제가 자동 취소되었습니다. 잠시 후 다시 시도해주세요." },
        { status: 500 }
      )
    }

    // 4) 알림 발송 (비동기 fire-and-forget — 알림 실패가 결제 완료를 막지 않음)
    // 고객 알림: ORDER_PAID 이벤트 (카카오 알림톡 + FCM 푸시)
    dispatch({
      recipientId: order.user_id,
      eventType: "ORDER_PAID",
      templateData: { orderId: order_id.slice(0, 8) },
    }).catch(console.error)

    // 관리자 신규 주문 알림: 주문 아이템 조회 후 발송 (아이템 목록이 알림 본문에 포함)
    orderRepo.findItemsByOrderId(order_id).then((orderItems) => {
      dispatchNewOrderToAdmin({
        orderId: order_id,
        totalAmount: order.total_amount,
        itemCount: orderItems.length || (item_count ?? 1),
        deliveryType: delivery_type ?? order.delivery_type ?? "pickup",
        items: orderItems,
      }).catch(console.error)
    }).catch(console.error)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[payment/complete 오류]", error)
    return NextResponse.json(
      { error: "결제 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    )
  }
}
