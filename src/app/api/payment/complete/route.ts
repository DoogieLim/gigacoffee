import { NextResponse } from "next/server"
import { verifyPayment, cancelPayment } from "@/lib/portone/server"
import { orderRepo, paymentRepo } from "@/lib/db"
import { dispatch, dispatchNewOrderToAdmin } from "@/lib/notifications/dispatcher"

export async function POST(request: Request) {
  let paymentId: string | undefined

  try {
    const body = await request.json()
    paymentId = body.paymentId
    const { txId, order_id, item_count, delivery_type } = body

    // 1) PortOne 결제 조회
    const payment = await verifyPayment(paymentId!)

    if (payment.status !== "PAID") {
      return NextResponse.json(
        { error: "결제가 완료되지 않은 상태입니다. 다시 시도해주세요." },
        { status: 400 }
      )
    }

    // 2) 주문 조회 및 금액 검증
    const order = await orderRepo.findById(order_id)
    if (!order || order.total_amount !== payment.amount.total) {
      // 결제는 됐지만 금액 불일치 → 자동 취소
      await cancelPayment(paymentId!, "주문 금액 불일치로 인한 자동 취소").catch(console.error)
      return NextResponse.json(
        { error: "결제 금액이 주문 금액과 일치하지 않아 자동 취소되었습니다. 다시 시도해주세요." },
        { status: 400 }
      )
    }

    // 3) DB 저장 — 실패 시 결제 자동 취소
    try {
      await paymentRepo.insert({
        orderId: order_id,
        portonePaymentId: paymentId!,
        merchantUid: txId,
        method: payment.method.type,
        status: "paid",
        amount: payment.amount.total,
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

    // 4) 알림 발송 (실패해도 주문은 완료 처리)
    dispatch({
      recipientId: order.user_id,
      eventType: "ORDER_PAID",
      templateData: { orderId: order_id.slice(0, 8) },
    }).catch(console.error)

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
