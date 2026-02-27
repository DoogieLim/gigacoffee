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

    if (order.user_id !== user.id) {
      return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 })
    }

    const payment = await paymentRepo.findByOrderId(order_id)
    if (payment && payment.portone_payment_id && payment.status === "paid") {
      await cancelPayment(payment.portone_payment_id, reason)
      await paymentRepo.updateStatus(payment.id, "cancelled")
    }

    await orderRepo.updateStatus(order_id, "cancelled")

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
