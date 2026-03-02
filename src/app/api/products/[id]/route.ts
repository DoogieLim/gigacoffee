/**
 * GET /api/products/{id}
 *
 * UUID로 특정 상품을 단건 조회한다.
 * 카테고리 정보를 JOIN하여 반환한다.
 *
 * 인증: 불필요 (Public)
 * OpenAPI 스펙: src/lib/api/openapi.ts → /api/products/{id} GET
 */
import { NextRequest } from "next/server"
import { productRepo } from "@/lib/db"
import { apiSuccess, apiError } from "@/lib/api/response"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await productRepo.findById(id)

    if (!product) {
      return apiError("상품을 찾을 수 없습니다", 404)
    }

    return apiSuccess(product)
  } catch (error) {
    return apiError(`상품 조회 실패: ${String(error)}`, 500)
  }
}
