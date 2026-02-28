/**
 * Gemini 생성 모델로 자연어 검색 쿼리를 구조화된 의도로 파싱
 *
 * 예시:
 *   "5000원 이하 달콤한 음료" → { semanticQuery: "달콤한 음료", priceRange: [0, 5000], categoryHint: "음료", sortBy: "relevance" }
 *   "가장 저렴한 아메리카노" → { semanticQuery: "아메리카노", priceRange: null, categoryHint: null, sortBy: "price_asc" }
 *   "비싼 케이크" → { semanticQuery: "케이크", priceRange: null, categoryHint: "케이크", sortBy: "price_desc" }
 */

const GEMINI_FLASH_MODEL = "gemini-2.0-flash"

export interface SearchIntent {
  /** 의미 기반 임베딩 검색에 사용할 핵심 쿼리 */
  semanticQuery: string
  /** 가격 범위 [min, max]. null이면 필터 없음 */
  priceRange: [number, number] | null
  /** 카테고리 힌트 (있으면 임베딩 쿼리 앞에 붙임). null이면 없음 */
  categoryHint: string | null
  /** 결과 정렬 기준 */
  sortBy: "relevance" | "price_asc" | "price_desc"
}

const SYSTEM_PROMPT = `당신은 카페 메뉴 검색 쿼리를 파싱하는 AI입니다.
사용자의 자연어 쿼리를 분석해 JSON 형식으로 반환하세요.

반환 형식:
{
  "semanticQuery": "임베딩 검색에 사용할 핵심 검색어 (가격/정렬 관련 표현 제거)",
  "priceRange": [최솟값, 최댓값] 또는 null,
  "categoryHint": "카테고리 힌트 문자열" 또는 null,
  "sortBy": "relevance" | "price_asc" | "price_desc"
}

규칙:
- semanticQuery: 가격/정렬/수량 관련 표현을 제거한 순수 의미 쿼리. 비어있으면 원본 사용.
- priceRange: "N원 이하" → [0, N], "N원 이상" → [N, 999999], "N~M원" → [N, M]. 없으면 null.
- categoryHint: 음료, 커피, 케이크, 베이커리, 디저트, 스무디, 티 등 카테고리를 명확히 언급한 경우만. 없으면 null.
- sortBy: 저렴/싸/낮은가격 → price_asc, 비싼/높은가격 → price_desc, 나머지 → relevance.

JSON만 반환하고 다른 텍스트는 포함하지 마세요.`

/**
 * Gemini Flash로 자연어 검색 의도를 파싱
 * 실패 시 null 반환 (호출자가 regex fallback 처리)
 */
export async function parseSearchIntentWithLLM(raw: string): Promise<SearchIntent | null> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_FLASH_MODEL}:generateContent?key=${apiKey}`

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: raw }],
          },
        ],
        generationConfig: {
          temperature: 0,
          responseMimeType: "application/json",
        },
      }),
    })

    if (!res.ok) return null

    const json = await res.json()
    const text: string = json.candidates?.[0]?.content?.parts?.[0]?.text ?? ""
    if (!text) return null

    const parsed = JSON.parse(text) as Partial<SearchIntent>

    return {
      semanticQuery: typeof parsed.semanticQuery === "string" && parsed.semanticQuery.trim()
        ? parsed.semanticQuery.trim()
        : raw,
      priceRange: Array.isArray(parsed.priceRange) && parsed.priceRange.length === 2
        ? [Number(parsed.priceRange[0]), Number(parsed.priceRange[1])]
        : null,
      categoryHint: typeof parsed.categoryHint === "string" ? parsed.categoryHint : null,
      sortBy: (["relevance", "price_asc", "price_desc"] as const).includes(parsed.sortBy as "relevance")
        ? (parsed.sortBy as SearchIntent["sortBy"])
        : "relevance",
    }
  } catch {
    return null
  }
}

/**
 * Regex 기반 정렬 파싱 (LLM 실패 시 fallback)
 */
export function parseSearchIntentFallback(raw: string): SearchIntent {
  const priceAsc = /저렴|싸|가격.*낮|낮은.*가격|최저가|싼\s*순|저렴한\s*순|가격.*오름|price.?asc/i
  const priceDesc = /비싼|가격.*높|높은.*가격|최고가|비싼\s*순|가격.*내림|price.?desc/i

  let sortBy: SearchIntent["sortBy"] = "relevance"
  let query = raw

  if (priceAsc.test(raw)) {
    sortBy = "price_asc"
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

  return {
    semanticQuery: query || raw,
    priceRange: null,
    categoryHint: null,
    sortBy,
  }
}
