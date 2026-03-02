/**
 * PATCH /api/orders/{id} — 주문 상태 변경 (관리자/스태프 전용)
 *
 * 관리자가 주문 상태를 수동으로 변경한다. 상태 변경 시 고객에게 알림이 발송된다.
 *
 * **알림 이벤트 매핑:**
 * - paid → ORDER_PAID | preparing → ORDER_PREPARING
 * - ready → ORDER_READY | cancelled → ORDER_CANCELLED
 * - out_for_delivery, completed는 알림 없음 (라이더/시스템이 처리)
 *
 * 인증: admin 또는 staff 역할 필요
 * OpenAPI 스펙: src/lib/api/openapi.ts → /api/orders/{id} PATCH
 */
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
    // admin 또는 staff 권한 필요 — 미충족 시 requireRole이 Response를 throw
    await requireRole(request, ["admin", "staff"])

    const { id } = await params
    const body = await request.json()
    const { status } = body as { status: OrderStatus }

    if (!status) {
      return apiError("상태 값이 필요합니다", 400)
    }

    const order = await orderRepo.updateStatus(id, status)

    // 상태별 알림 이벤트 매핑 (모든 상태 변경이 알림을 트리거하지는 않음)
    const eventMap: Record<string, "ORDER_PAID" | "ORDER_PREPARING" | "ORDER_READY" | "ORDER_CANCELLED"> = {
      paid: "ORDER_PAID",
      preparing: "ORDER_PREPARING",
      ready: "ORDER_READY",
      cancelled: "ORDER_CANCELLED",
    }

    const eventType = eventMap[status]
    if (eventType) {
      // 알림 실패해도 상태 변경은 완료 처리 (비동기 fire-and-forget)
      await dispatch({
        recipientId: order.user_id,
        eventType,
        templateData: { orderId: order.id.slice(0, 8) },
      }).catch(console.error)
    }

    return apiSuccess(order)
  } catch (error) {
    // requireRole이 throw한 Response를 그대로 반환 (401/403 응답)
    if (error instanceof Response) {
      return error
    }
    return apiError(`주문 상태 변경 실패: ${String(error)}`, 500)
  }
}
