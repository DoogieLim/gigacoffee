import { describe, it, expect } from "vitest"
import { cn } from "@/lib/utils/cn"

describe("cn", () => {
  it("클래스 문자열 결합", () => {
    expect(cn("foo", "bar")).toBe("foo bar")
  })

  it("조건부 클래스 처리", () => {
    expect(cn("base", false && "hidden", "active")).toBe("base active")
  })

  it("Tailwind 충돌 클래스 병합 (뒤 클래스 우선)", () => {
    expect(cn("px-2", "px-4")).toBe("px-4")
    expect(cn("text-sm", "text-lg")).toBe("text-lg")
  })

  it("객체 형태 클래스 조건부 처리", () => {
    expect(cn({ "text-red-500": true, "text-blue-500": false })).toBe("text-red-500")
  })

  it("undefined/null 무시", () => {
    expect(cn("base", undefined, null as unknown as string, "end")).toBe("base end")
  })
})
