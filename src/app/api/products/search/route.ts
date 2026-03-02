/**
 * GET /api/products/search — 자연어 시맨틱 상품 검색
 *
 * **처리 흐름:**
 * 1. Gemini Flash가 자연어 쿼리를 파싱 → { semanticQuery, priceRange, categoryHint, sortBy }
 * 2. LLM 실패 시 regex fallback 파서 사용 (서비스 가용성 보장)
 * 3. semanticQuery + categoryHint를 합쳐 Gemini embedding-001(768차원) 벡터 생성
 * 4. product_embeddings 테이블에서 코사인 유사도 계산 (TypeScript 계산, 이유 아래 참고)
 * 5. 가격 범위 필터 → 정렬 적용 후 limit 수만큼 반환
 *
 * **pgvector 미사용 이유:**
 * Supabase의 pgvector RPC 함수가 float4[] 직렬화 시 정밀도 손실 문제가 있었음.
 * 이를 우회하기 위해 TypeScript에서 코사인 유사도를 직접 계산하는 방식 채택.
 * 향후 pgvector 버전 업그레이드 후 재검토 예정.
 *
 * 인증: 불필요 (Public)
 * OpenAPI 스펙: src/lib/api/openapi.ts → /api/products/search GET
 */
import { NextRequest } from "next/server"
import { productRepo } from "@/lib/db"
import { generateEmbedding } from "@/lib/gemini/embeddings"
import { parseSearchIntentWithLLM, parseSearchIntentFallback } from "@/lib/gemini/search-parser"
import { apiSuccess, apiError } from "@/lib/api/response"
import type { Product } from "@/types/product.types"
import type { SearchIntent } from "@/lib/gemini/search-parser"

/**
 * 상품 목록을 가격 기준으로 정렬한다.
 * 원본 배열을 변경하지 않도록 스프레드 연산자로 복사 후 정렬.
 */
function applySort(products: Product[], sortBy: SearchIntent["sortBy"]): Product[] {
  if (sortBy === "price_asc") return [...products].sort((a, b) => a.price - b.price)
  if (sortBy === "price_desc") return [...products].sort((a, b) => b.price - a.price)
  return products
}

/**
 * 가격 범위 필터를 적용한다.
 * priceRange가 null이면 필터 없이 원본 반환.
 */
function applyPriceFilter(products: Product[], priceRange: [number, number] | null): Product[] {
  if (!priceRange) return products
  const [min, max] = priceRange
  return products.filter((p) => p.price >= min && p.price <= max)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q")?.trim()
    // 최대 50개 제한: Gemini API 호출 비용 및 응답 크기 고려
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "10"), 50)

    if (!q) {
      return apiError("검색어(q)가 필요합니다.", 400)
    }

    // LLM 파싱 시도 → 실패 시 regex fallback (Gemini API 장애 시에도 검색 기능 유지)
    const intent = (await parseSearchIntentWithLLM(q)) ?? parseSearchIntentFallback(q)

    // categoryHint가 있으면 임베딩 쿼리 앞에 붙여 카테고리 관련성 강화
    // 예: "달콤한" → "음료 달콤한" (카테고리 힌트: "음료")
    const embeddingQuery = intent.categoryHint
      ? `${intent.categoryHint} ${intent.semanticQuery}`
      : intent.semanticQuery

    const embedding = await generateEmbedding(embeddingQuery)

    // 가격 필터가 있을 때: limit×5만큼 먼저 조회 후 TypeScript에서 필터링
    // 이유: DB에서 가격 조건 + 벡터 유사도를 동시에 처리하면 유사도가 낮은 결과가 포함될 수 있음
    const fetchLimit = intent.priceRange ? Math.min(limit * 5, 100) : limit
    const products = await productRepo.searchByEmbedding(embedding, fetchLimit)

    const filtered = applyPriceFilter(products, intent.priceRange)
    const sorted = applySort(filtered, intent.sortBy)

    return apiSuccess(sorted.slice(0, limit))
  } catch (error) {
    return apiError(`검색 실패: ${String(error)}`, 500)
  }
}
