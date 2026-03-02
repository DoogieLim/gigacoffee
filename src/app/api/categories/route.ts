/**
 * GET /api/categories
 *
 * `is_active: true`인 카테고리 목록을 반환한다.
 * `sort_order` 오름차순으로 정렬된다.
 *
 * 인증: 불필요 (Public)
 * OpenAPI 스펙: src/lib/api/openapi.ts → /api/categories GET
 */
import { NextRequest } from "next/server"
import { productRepo } from "@/lib/db"
import { apiSuccess, apiError } from "@/lib/api/response"

export async function GET(request: NextRequest) {
  try {
    // true 파라미터: activeOnly 필터 적용 (비활성 카테고리 제외)
    const categories = await productRepo.findCategories(true)
    return apiSuccess(categories)
  } catch (error) {
    return apiError(`카테고리 조회 실패: ${String(error)}`, 500)
  }
}
