import { NextRequest } from "next/server"
import { productRepo } from "@/lib/db"
import { generateEmbedding } from "@/lib/gemini/embeddings"
import { parseSearchIntentWithLLM, parseSearchIntentFallback } from "@/lib/gemini/search-parser"
import { apiSuccess, apiError } from "@/lib/api/response"
import type { Product } from "@/types/product.types"
import type { SearchIntent } from "@/lib/gemini/search-parser"

function applySort(products: Product[], sortBy: SearchIntent["sortBy"]): Product[] {
  if (sortBy === "price_asc") return [...products].sort((a, b) => a.price - b.price)
  if (sortBy === "price_desc") return [...products].sort((a, b) => b.price - a.price)
  return products
}

function applyPriceFilter(products: Product[], priceRange: [number, number] | null): Product[] {
  if (!priceRange) return products
  const [min, max] = priceRange
  return products.filter((p) => p.price >= min && p.price <= max)
}

/**
 * GET /api/products/search?q=5000원 이하 달콤한 음료&limit=10
 *
 * 1. Gemini Flash로 자연어 쿼리 파싱 → { semanticQuery, priceRange, categoryHint, sortBy }
 * 2. LLM 실패 시 regex fallback
 * 3. semanticQuery + categoryHint로 임베딩 생성
 * 4. 임베딩 유사도 검색 → 가격 범위 필터 → 정렬
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q")?.trim()
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "10"), 50)

    if (!q) {
      return apiError("검색어(q)가 필요합니다.", 400)
    }

    // LLM 파싱 시도, 실패 시 regex fallback
    const intent = (await parseSearchIntentWithLLM(q)) ?? parseSearchIntentFallback(q)

    // categoryHint가 있으면 임베딩 쿼리에 앞에 붙여 정확도 향상
    const embeddingQuery = intent.categoryHint
      ? `${intent.categoryHint} ${intent.semanticQuery}`
      : intent.semanticQuery

    const embedding = await generateEmbedding(embeddingQuery)

    // 가격 필터가 있을 때 limit보다 더 많이 조회 후 필터링
    const fetchLimit = intent.priceRange ? Math.min(limit * 5, 100) : limit
    const products = await productRepo.searchByEmbedding(embedding, fetchLimit)

    const filtered = applyPriceFilter(products, intent.priceRange)
    const sorted = applySort(filtered, intent.sortBy)

    return apiSuccess(sorted.slice(0, limit))
  } catch (error) {
    return apiError(`검색 실패: ${String(error)}`, 500)
  }
}
