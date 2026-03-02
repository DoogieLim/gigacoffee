import { test, expect } from "@playwright/test"

/**
 * 매장 선택 후 메뉴 페이지로 이동하는 헬퍼
 * 다중 매장 아키텍처 적용 이후 /menu 접근 시 /stores 리다이렉트됨
 */
async function selectStoreAndGoToMenu(page: import("@playwright/test").Page) {
  await page.goto("/stores")
  await expect(page.getByRole("heading", { name: "매장 선택" })).toBeVisible({ timeout: 10000 })
  const storeCard = page.locator("[data-testid='store-card']").first()
  await expect(storeCard).toBeVisible()
  await storeCard.click()
  await page.waitForURL(/\/menu/, { timeout: 10000 })
}

test.describe("매장 선택 페이지", () => {
  test("매장 목록이 렌더링됨", async ({ page }) => {
    await page.goto("/stores")
    await expect(page.getByRole("heading", { name: "매장 선택" })).toBeVisible({ timeout: 10000 })
    await expect(page.locator("[data-testid='store-card']").first()).toBeVisible()
  })
})

test.describe("메뉴 페이지", () => {
  test("매장 선택 후 메뉴 페이지 접근 및 상품 목록 렌더링", async ({ page }) => {
    await selectStoreAndGoToMenu(page)
    await expect(page).toHaveTitle(/GigaCoffee/)
    // 상품 카드가 최소 1개 이상 렌더링되어야 함
    await expect(page.locator("[data-testid='product-card']").first()).toBeVisible({ timeout: 10000 })
  })

  test("매장 미선택 상태에서 /menu 접근 시 /stores로 리다이렉트", async ({ page }) => {
    // 새 컨텍스트(localStorage 비어있음)에서 /menu 직접 접근 → /stores 리다이렉트
    await page.goto("/menu")
    await page.waitForURL(/\/stores/, { timeout: 5000 })
    await expect(page).toHaveURL(/\/stores/)
  })

  test("메뉴 제목과 상품 목록이 렌더링됨", async ({ page }) => {
    await selectStoreAndGoToMenu(page)
    // 메뉴 제목 확인
    await expect(page.getByRole("heading", { name: "메뉴", exact: true })).toBeVisible()
    // 상품이 렌더링될 때까지 대기
    await expect(page.locator("[data-testid='product-card']").first()).toBeVisible({ timeout: 10000 })
  })
})

test.describe("메뉴 검색", () => {
  test("검색어 입력 시 상품 검색 결과 표시", async ({ page }) => {
    await selectStoreAndGoToMenu(page)
    const searchInput = page.getByPlaceholder(/검색/)
    if (await searchInput.isVisible()) {
      await searchInput.fill("아메리카노")
      // 디바운스 300ms + 네트워크 대기
      await page.waitForTimeout(600)
      // 검색 결과 텍스트 표시 확인
      await expect(page.getByText(/검색 결과/)).toBeVisible({ timeout: 8000 })
    }
  })
})
