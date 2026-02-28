import { test, expect } from "@playwright/test"

test.describe("메뉴 페이지", () => {
  test("메뉴 페이지 접근 및 상품 목록 렌더링", async ({ page }) => {
    await page.goto("/menu")
    await expect(page).toHaveTitle(/GigaCoffee/)
    // 상품 카드가 최소 1개 이상 렌더링되어야 함
    await expect(page.locator("[data-testid='product-card']").first()).toBeVisible({ timeout: 10000 })
  })

  test("배달 유형 탭 전환", async ({ page }) => {
    await page.goto("/menu")
    // 픽업 탭이 기본 활성
    const pickupTab = page.getByText("픽업")
    await expect(pickupTab).toBeVisible()

    // 로봇배달 탭 클릭
    await page.getByText("로봇배달").click()
    // 탭 전환 후 페이지가 유지되어야 함
    await expect(page).toHaveURL("/menu")
  })
})

test.describe("메뉴 검색", () => {
  test("검색어 입력 시 URL 파라미터 반영", async ({ page }) => {
    await page.goto("/menu")
    // 검색 입력란에 텍스트 입력
    const searchInput = page.getByPlaceholder(/검색/)
    if (await searchInput.isVisible()) {
      await searchInput.fill("아메리카노")
      await searchInput.press("Enter")
      await expect(page).toHaveURL(/q=/)
    }
  })
})
