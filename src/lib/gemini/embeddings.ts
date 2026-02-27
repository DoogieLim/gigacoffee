/**
 * Gemini text-embedding-004 유틸리티
 * - 768차원 벡터 생성
 * - 무료 티어: 분당 1,500회, 일 100만 회
 * - https://ai.google.dev/gemini-api/docs/embeddings
 */

const GEMINI_EMBEDDING_MODEL = "gemini-embedding-001"

/**
 * 텍스트를 768차원 임베딩 벡터로 변환 (Gemini API 사용)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error("GEMINI_API_KEY 환경변수가 설정되지 않았습니다.")

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_EMBEDDING_MODEL}:embedContent?key=${apiKey}`

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: `models/${GEMINI_EMBEDDING_MODEL}`,
      content: {
        parts: [{ text }],
      },
      outputDimensionality: 768,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Gemini embedding 생성 실패 (${res.status}): ${body}`)
  }

  const json = await res.json()
  return json.embedding.values as number[]
}

/**
 * 상품 임베딩용 텍스트 조합
 * 카테고리명 + 상품명 + 설명을 합쳐 의미 있는 표현 생성
 */
export function buildProductEmbeddingText(product: {
  name: string
  description?: string | null
  categoryName?: string | null
}): string {
  return [product.categoryName, product.name, product.description]
    .filter(Boolean)
    .join(" ")
}
