import { expect, test } from "@playwright/test";

const START_ANSWERS = [
  "فعل",
  "مضارع",
  "سبق بأداة جزم",
  "نعم، من الأفعال الخمسة",
] as const;

test("the starter workspace matches its verified visual states", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/learn/start");
  await page.evaluate(() => document.fonts.ready);

  const activity = page.locator(".start-activity-frame");
  await expect(activity).toBeVisible();
  await expect(activity).toHaveScreenshot("starter-workspace.png", {
    animations: "disabled",
    caret: "hide",
    maxDiffPixelRatio: 0.025,
    threshold: 0.25,
  });

  for (const answer of START_ANSWERS) {
    await page.getByRole("button", { name: answer, exact: true }).click();
  }
  const result = page.locator(".start-finish-card");
  await expect(result).toBeVisible({ timeout: 4_000 });
  await result.getByText("عرض التفسير والاقتراحات").click();
  await expect(result.locator(".start-topic-card").first()).toBeVisible();
  await expect(result).toHaveScreenshot("starter-result.png", {
    animations: "disabled",
    caret: "hide",
    maxDiffPixelRatio: 0.025,
    threshold: 0.25,
  });
});
