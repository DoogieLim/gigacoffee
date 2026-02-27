import { NextRequest } from "next/server"
import { productRepo } from "@/lib/db"
import { generateEmbedding } from "@/lib/gemini/embeddings"
import { apiSuccess, apiError } from "@/lib/api/response"
import type { Product } from "@/types/product.types"

type SortBy = "relevance" | "price_asc" | "price_desc"

/**
 * 자연어 쿼리에서 정렬 의도를 추출하고 임베딩용 핵심 쿼리를 반환
 */
function parseSearchIntent(raw: string): { query: string; sortBy: SortBy } {
  const priceAsc = /저렴|싸|가격.*낮|낮은.*가격|최저가|싼\s*순|저렴한\s*순|가격.*오름|price.?asc/i
  const priceDesc = /비싼|가격.*높|높은.*가격|최고가|비싼\s*순|가격.*내림|price.?desc/i

  let sortBy: SortBy = "relevance"
  let query = raw

  if (priceAsc.test(raw)) {
    sortBy = "price_asc"
    // 정렬 관련 표현 제거 후 핵심 검색어만 남김
    query = raw
      .replace(/가격이?\s*(가장\s*)?(저렴|낮)[은한]?\s*(순서로|순|으로)?/gi, "")
      .replace(/가장\s*저렴한\s*(순서로|순|으로)?/gi, "")
      .replace(/싼\s*(순서로|순|으로)?/gi, "")
      .replace(/최저가\s*(순서로|순|으로)?/gi, "")
      .replace(/\s{2,}/g, " ")
      .trim()
  } else if (priceDesc.test(raw)) {
    sortBy = "price_desc"
    query = raw
      .replace(/가격이?\s*(가장\s*)?(비싼|높)[은한]?\s*(순서로|순|으로)?/gi, "")
      .replace(/가장\s*비싼\s*(순서로|순|으로)?/gi, "")
      .replace(/최고가\s*(순서로|순|으로)?/gi, "")
      .replace(/\s{2,}/g, " ")
      .trim()
  }

  // 정렬어만 있고 실제 검색어가 없으면 원본 사용
  if (!query) query = raw

  return { query, sortBy }
}

function applySort(products: Product[], sortBy: SortBy): Product[] {
  if (sortBy === "price_asc") return [...products].sort((a, b) => a.price - b.price)
  if (sortBy === "price_desc") return [...products].sort((a, b) => b.price - a.price)
  return products
}

/**
 * GET /api/products/search?q=시원한 음료&limit=10
 * Gemini 임베딩으로 자연어 상품 검색 + 정렬 의도 파싱
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q")?.trim()
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "10"), 50)

    if (!q) {
      return apiError("검색어(q)가 필요합니다.", 400)
    }

    const { query, sortBy } = parseSearchIntent(q)
    const embedding = await generateEmbedding(query)
    const products = await productRepo.searchByEmbedding(embedding, limit)

    return apiSuccess(applySort(products, sortBy))
  } catch (error) {
    return apiError(`검색 실패: ${String(error)}`, 500)
  }
}
