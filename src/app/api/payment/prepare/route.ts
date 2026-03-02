/**
 * POST /api/payment/prepare — PortOne 결제 준비
 *
 * PortOne 브라우저 SDK(`requestPayment`)에 전달할 파라미터를 반환한다.
 *
 * **흐름:**
 * 클라이언트 → 이 API (파라미터 조회) → PortOne SDK → 결제창 표시 → /api/payment/complete (검증)
 *
 * **paymentId 설계:** PortOne의 paymentId로 order_id를 재사용한다.
 * 별도 ID 생성 없이 주문과 결제를 1:1로 연결할 수 있어 중간 테이블 없이 추적 가능.
 *
 * 인증: 로그인 사용자 필요 (주문 소유권 검증 포함)
 * OpenAPI 스펙: src/lib/api/openapi.ts → /api/payment/prepare POST
 */
import { NextRequest, NextResponse } from "next/server"
import { orderRepo } from "@/lib/db"
import { getAuthUser } from "@/lib/api/auth"

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 })
    }

    const { order_id } = await request.json()
    if (!order_id) {
      return NextResponse.json({ error: "order_id가 필요합니다" }, { status: 400 })
    }

    const order = await orderRepo.findById(order_id)
    if (!order) {
      return NextResponse.json({ error: "주문을 찾을 수 없습니다" }, { status: 404 })
    }

    // 타인의 주문에 대한 결제 시도 방지
    if (order.user_id !== user.id) {
      return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 })
    }

    return NextResponse.json({
      // paymentId = order_id 재사용 (PortOne → DB 결제 추적 단순화)
      paymentId: order_id,
      amount: order.total_amount,
      orderName: "GigaCoffee 주문",
      customerName: user.name,
      customerEmail: user.email,
      customerPhone: user.phone ?? undefined,
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
