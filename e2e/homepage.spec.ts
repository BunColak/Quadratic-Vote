import { test, expect } from "@playwright/test";
import { getCookies, goToAndCheckLogin } from "./testUtils";

test.describe("homepage", () => {
  test.use({
    baseURL: "http://localhost:3000",
  });

  test("should not allow creating polls when not logged in", async ({
    page,
  }) => {
    await page.goto("/");

    // Two login warnings, one on navbar one in existing polls
    await expect(page.getByTestId("login-warning")).toHaveCount(2);

    // There shouldn't be any links to create page
    await expect(page.locator('a[href="/create"]')).toHaveCount(0);

    // Google login should be visible
    await page.waitForLoadState("networkidle"); // required for google script to load properly
    await page.waitForTimeout(2000)
    const googleItemCount = await page.locator('[id*="gsi"]').count();
    await expect(googleItemCount).toBeGreaterThan(0);
  });

  test("should not allow going to create page", async ({ page }) => {
    const response = await page.goto("/create");

    const errorContent = await page.getByTestId("error-page");
    await expect(errorContent).toHaveCount(1);
    await expect(errorContent.locator('a[href="/"]')).toHaveCount(1);
    await expect(response?.status()).toBe(403);
  });

  test("should show create links when logged in", async ({
    browser,
  }) => {
    const page = await goToAndCheckLogin(browser, '/')

    await expect(await page.locator('a[href="/create"]').count()).toBeGreaterThan(0)
  });

  test('should show existing polls', async ({ browser }) => {
    const page = await goToAndCheckLogin(browser, '/')

    await expect(page.getByTestId('existing-polls')).toHaveCount(1)
  })
});

