"use server"

import { orderRepo, productRepo } from "@/lib/db"
import { generateEmbedding } from "@/lib/gemini/embeddings"
import type { Product } from "@/types/product.types"

/**
 * 사용자 구매 이력 기반 맞춤 메뉴 추천
 *
 * 알고리즘:
 * 1. 최근 10개 주문에서 구매 상품명 추출
 * 2. 상품명을 하나의 텍스트로 결합 → Gemini 임베딩으로 취향 프로파일 생성
 * 3. 유사 상품 검색 후 이미 구매한 상품 제외 → 최대 5개 반환
 */
export async function getPersonalizedRecommendations(userId: string): Promise<Product[]> {
  try {
    const orders = await orderRepo.findByUser(userId)
    if (!orders.length) return []

    // 최근 10개 주문에서 구매 상품명 수집
    const purchasedNames = new Set<string>()
    orders.slice(0, 10).forEach((order) => {
      const items = order.order_items as { product_name: string }[] | undefined
      items?.forEach((item) => purchasedNames.add(item.product_name))
    })

    if (purchasedNames.size === 0) return []

    // 구매 이력 텍스트 → 임베딩 (취향 프로파일)
    const purchaseText = Array.from(purchasedNames).join(" ")
    const embedding = await generateEmbedding(purchaseText)

    // 유사 상품 검색 → 이미 구매한 상품 제외 → 판매 가능 상품만 → 최대 5개
    const similar = await productRepo.searchByEmbedding(embedding, 15)
    return similar
      .filter((p) => !purchasedNames.has(p.name) && p.is_available)
      .slice(0, 5)
  } catch {
    // 추천 실패는 조용히 처리 (메인 기능에 영향 없도록)
    return []
  }
}
