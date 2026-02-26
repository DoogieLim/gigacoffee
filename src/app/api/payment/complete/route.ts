import { NextResponse } from "next/server"
import { verifyPayment } from "@/lib/portone/server"
import { orderRepo, paymentRepo } from "@/lib/db"
import { dispatch } from "@/lib/notifications/dispatcher"

export async function POST(request: Request) {
  try {
    const { paymentId, txId, order_id } = await request.json()

    const payment = await verifyPayment(paymentId)
    const order = await orderRepo.findById(order_id)

    if (!order || order.total_amount !== payment.amount.total) {
      return NextResponse.json({ error: "결제 금액 불일치" }, { status: 400 })
    }

    if (payment.status !== "PAID") {
      return NextResponse.json({ error: "결제 미완료 상태" }, { status: 400 })
    }

    await paymentRepo.insert({
      orderId: order_id,
      portonePaymentId: paymentId,
      merchantUid: txId,
      method: payment.method.type,
      status: "paid",
      amount: payment.amount.total,
      rawResponse: payment,
    })

    await orderRepo.updateStatus(order_id, "paid")

    await dispatch({
      recipientId: order.user_id,
      eventType: "ORDER_PAID",
      templateData: { orderId: order_id.slice(0, 8) },
    }).catch(console.error)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
