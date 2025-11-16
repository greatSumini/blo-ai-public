import { test, expect } from "@playwright/test";

test.describe("New Article Generation Flow", () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 후 /new-article로 이동
    // (실제 인증 로직에 따라 조정 필요)
    await page.goto("/new-article");
  });

  test("should complete article generation flow", async ({ page }) => {
    // Form 입력
    await page.getByPlaceholder(/예: React 19/).fill("Test topic");
    await page.getByRole("button", { name: /생성하기/ }).click();

    // Generating 상태 확인
    await expect(page.getByText(/생성 중/)).toBeVisible();

    // Complete 상태 확인 (타임아웃: 30초)
    await expect(page.getByText(/초안이 준비되었습니다/)).toBeVisible({
      timeout: 30000
    });

    // 메타데이터 토글
    await page.getByText(/메타데이터 보기/).click();
    await expect(page.getByText(/키워드/)).toBeVisible();

    // 편집 버튼 클릭
    await page.getByRole("button", { name: /초안 편집하기/ }).click();
    await expect(page).toHaveURL(/\/articles\/.*\/edit/);
  });

  test("should cancel generation", async ({ page }) => {
    await page.getByPlaceholder(/예: React 19/).fill("Test topic");
    await page.getByRole("button", { name: /생성하기/ }).click();

    // Generating 상태에서 취소
    await page.getByRole("button", { name: /취소/ }).click();

    // Form으로 돌아왔는지 확인
    await expect(page.getByPlaceholder(/예: React 19/)).toBeVisible();
  });

  test("should regenerate article", async ({ page }) => {
    // Complete 모드까지 진행
    await page.getByPlaceholder(/예: React 19/).fill("Test topic");
    await page.getByRole("button", { name: /생성하기/ }).click();
    await expect(page.getByText(/초안이 준비되었습니다/)).toBeVisible({
      timeout: 30000
    });

    // 다시 생성
    await page.getByRole("button", { name: /다시 생성/ }).click();
    await expect(page.getByPlaceholder(/예: React 19/)).toBeVisible();
  });
});
