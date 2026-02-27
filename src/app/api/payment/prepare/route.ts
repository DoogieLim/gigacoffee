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

    if (order.user_id !== user.id) {
      return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 })
    }

    return NextResponse.json({
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
