import { test, expect } from "@playwright/test"

test.describe("인증 페이지", () => {
  test("로그인 페이지 접근", async ({ page }) => {
    await page.goto("/login")
    await expect(page.getByRole("heading", { name: /로그인/ })).toBeVisible()
    await expect(page.getByLabel(/이메일/)).toBeVisible()
    await expect(page.getByLabel(/비밀번호/)).toBeVisible()
  })

  test("잘못된 자격증명으로 로그인 실패", async ({ page }) => {
    await page.goto("/login")
    await page.getByLabel(/이메일/).fill("invalid@example.com")
    await page.getByLabel(/비밀번호/).fill("wrongpassword")
    await page.getByRole("button", { name: "로그인", exact: true }).click()
    // 에러 메시지가 표시되어야 함 (Supabase API 응답 대기 포함)
    await expect(page.getByText(/실패|오류|잘못|invalid|credentials/i)).toBeVisible({ timeout: 10000 })
  })

  test("비인증 상태에서 관리자 페이지 접근 시 리다이렉트", async ({ page }) => {
    await page.goto("/admin")
    // 로그인 페이지로 리다이렉트 되어야 함
    await expect(page).toHaveURL(/login/, { timeout: 5000 })
  })
})
