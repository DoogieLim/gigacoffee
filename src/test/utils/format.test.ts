import { describe, it, expect } from "vitest"
import { formatPrice, formatDate, formatDateTime, formatPhoneNumber } from "@/lib/utils/format"

describe("formatPrice", () => {
  it("정수 금액을 한국 원화 형식으로 변환", () => {
    expect(formatPrice(5000)).toBe("₩5,000")
  })

  it("0원 처리", () => {
    expect(formatPrice(0)).toBe("₩0")
  })

  it("큰 금액 처리", () => {
    expect(formatPrice(1000000)).toBe("₩1,000,000")
  })
})

describe("formatDate", () => {
  it("날짜 문자열을 한국 형식으로 변환", () => {
    const result = formatDate("2024-03-15")
    expect(result).toMatch(/2024/)
    expect(result).toMatch(/03/)
    expect(result).toMatch(/15/)
  })
})

describe("formatDateTime", () => {
  it("날짜+시간 문자열을 한국 형식으로 변환", () => {
    const result = formatDateTime("2024-03-15T10:30:00")
    expect(result).toMatch(/2024/)
    expect(result).toMatch(/10/)
    expect(result).toMatch(/30/)
  })
})

describe("formatPhoneNumber", () => {
  it("11자리 숫자를 전화번호 형식으로 변환", () => {
    expect(formatPhoneNumber("01012345678")).toBe("010-1234-5678")
  })
})
