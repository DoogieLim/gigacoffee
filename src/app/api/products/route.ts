/**
 * GET /api/products
 *
 * 판매 가능한 상품 목록을 반환한다.
 * `availableOnly: true`가 기본 적용되어 비활성화 상품은 제외된다.
 *
 * 주요 사용처: 메뉴 페이지, 키오스크 상품 목록
 * 인증: 불필요 (Public)
 * OpenAPI 스펙: src/lib/api/openapi.ts → /api/products GET
 */
import { NextRequest } from "next/server"
import { productRepo } from "@/lib/db"
import { apiSuccess, apiError } from "@/lib/api/response"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    // categoryId 미전달 시 undefined → 전체 카테고리 반환
    const categoryId = searchParams.get("categoryId") || undefined

    const products = await productRepo.findAll({
      categoryId,
      availableOnly: true,
    })

    return apiSuccess(products)
  } catch (error) {
    return apiError(`상품 조회 실패: ${String(error)}`, 500)
  }
}
