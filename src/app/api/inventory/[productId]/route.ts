/**
 * PATCH /api/inventory/{productId} — 재고 수동 조정 (관리자/스태프)
 *
 * 입고, 실사 등으로 재고를 수동 조정한다.
 *
 * **입력값:** 최종 수량 (변화량이 아님)
 * 예: 현재 5개 → 10개로 설정 시 `{ quantity: 10 }`
 * 변화량(+5)은 서버가 자동 계산하여 stock_histories에 기록한다.
 *
 * **DB 트리거와의 역할 분리:**
 * - 판매에 의한 자동 차감/환원: DB 트리거 처리 (orders.status 변경 시 자동 실행)
 * - 입고/실사/수동 조정: 이 API로만 처리
 *
 * 인증: admin 또는 staff 역할 필요
 * OpenAPI 스펙: src/lib/api/openapi.ts → /api/inventory/{productId} PATCH
 */
import { NextRequest } from "next/server"
import { inventoryRepo } from "@/lib/db"
import { requireRole } from "@/lib/api/auth"
import { apiSuccess, apiError } from "@/lib/api/response"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    // admin 또는 staff 권한 필요 — 미충족 시 requireRole이 Response를 throw
    const user = await requireRole(request, ["admin", "staff"])

    const { productId } = await params
    const body = await request.json()
    const { quantity, reason } = body as { quantity: number; reason?: string }

    if (typeof quantity !== "number") {
      return apiError("수량이 필요합니다", 400)
    }

    // 현재 재고 조회 (변화량 계산에 필요)
    const existing = await inventoryRepo.findByProduct(productId)
    if (!existing) {
      return apiError("상품을 찾을 수 없습니다", 404)
    }

    // 변화량 = 목표수량 - 현재수량 (음수면 감소, 양수면 증가)
    const changeQty = quantity - existing.quantity

    await inventoryRepo.upsert(productId, quantity)

    // 이력 기록: type='adjust' (입고는 'in', 판매차감은 'out', 취소환원은 'cancel')
    await inventoryRepo.insertHistory({
      productId,
      changeQty,
      reason: reason || "수동 조정",
      type: "adjust",
      createdBy: user.id,
    })

    return apiSuccess({ productId, quantity, changeQty })
  } catch (error) {
    // requireRole이 throw한 Response를 그대로 반환 (401/403 응답)
    if (error instanceof Response) {
      return error
    }
    return apiError(`재고 조정 실패: ${String(error)}`, 500)
  }
}
