import { NextRequest } from "next/server"
import { orderRepo } from "@/lib/db"
import { dispatch } from "@/lib/notifications/dispatcher"
import { requireRole } from "@/lib/api/auth"
import { apiSuccess, apiError } from "@/lib/api/response"
import type { OrderStatus } from "@/types/order.types"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // admin 또는 staff 권한 필요
    await requireRole(request, ["admin", "staff"])

    const { id } = await params
    const body = await request.json()
    const { status } = body as { status: OrderStatus }

    if (!status) {
      return apiError("상태 값이 필요합니다", 400)
    }

    const order = await orderRepo.updateStatus(id, status)

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

    return apiSuccess(order)
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    return apiError(`주문 상태 변경 실패: ${String(error)}`, 500)
  }
}
