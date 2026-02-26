import { NextRequest } from "next/server"
import { inventoryRepo } from "@/lib/db"
import { requireRole } from "@/lib/api/auth"
import { apiSuccess, apiError } from "@/lib/api/response"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    // admin 또는 staff 권한 필요
    const user = await requireRole(request, ["admin", "staff"])

    const { productId } = await params
    const body = await request.json()
    const { quantity, reason } = body as { quantity: number; reason?: string }

    if (typeof quantity !== "number") {
      return apiError("수량이 필요합니다", 400)
    }

    // 기존 재고 조회
    const existing = await inventoryRepo.findByProduct(productId)
    if (!existing) {
      return apiError("상품을 찾을 수 없습니다", 404)
    }

    // 변경량 계산
    const changeQty = quantity - existing.quantity

    // 재고 업데이트
    await inventoryRepo.upsert(productId, quantity)

    // 이력 기록
    await inventoryRepo.insertHistory({
      productId,
      changeQty,
      reason: reason || "수동 조정",
      type: "adjust",
      createdBy: user.id,
    })

    return apiSuccess({ productId, quantity, changeQty })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    return apiError(`재고 조정 실패: ${String(error)}`, 500)
  }
}
