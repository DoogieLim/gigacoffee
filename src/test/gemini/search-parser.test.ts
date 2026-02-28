import { describe, it, expect } from "vitest"
import { parseSearchIntentFallback } from "@/lib/gemini/search-parser"

describe("parseSearchIntentFallback", () => {
  it("가격 오름차순 의도 파싱 - 저렴", () => {
    const result = parseSearchIntentFallback("저렴한 아메리카노")
    expect(result.sortBy).toBe("price_asc")
    expect(result.semanticQuery).toContain("아메리카노")
  })

  it("가격 오름차순 의도 파싱 - 최저가", () => {
    const result = parseSearchIntentFallback("최저가 커피")
    expect(result.sortBy).toBe("price_asc")
    expect(result.semanticQuery).toContain("커피")
  })

  it("가격 내림차순 의도 파싱 - 비싼", () => {
    const result = parseSearchIntentFallback("비싼 케이크")
    expect(result.sortBy).toBe("price_desc")
    expect(result.semanticQuery).toContain("케이크")
  })

  it("가격 내림차순 의도 파싱 - 최고가", () => {
    const result = parseSearchIntentFallback("최고가 음료")
    expect(result.sortBy).toBe("price_desc")
  })

  it("정렬 의도 없음 → relevance", () => {
    const result = parseSearchIntentFallback("달콤한 음료")
    expect(result.sortBy).toBe("relevance")
    expect(result.semanticQuery).toBe("달콤한 음료")
  })

  it("정렬어만 있고 검색어 없으면 원본 반환", () => {
    const result = parseSearchIntentFallback("저렴한")
    expect(result.semanticQuery).toBeTruthy()
  })

  it("priceRange는 항상 null (fallback은 가격 필터 미지원)", () => {
    const result = parseSearchIntentFallback("5000원 이하 음료")
    expect(result.priceRange).toBeNull()
  })

  it("categoryHint는 항상 null (fallback은 카테고리 파싱 미지원)", () => {
    const result = parseSearchIntentFallback("아이스 음료")
    expect(result.categoryHint).toBeNull()
  })
})
