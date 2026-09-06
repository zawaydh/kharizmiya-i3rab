import { expect, test, type Page } from "@playwright/test";
import axe from "axe-core";

type AxeRuntime = {
  run: (
    root: Document,
    options: { runOnly: { type: "tag"; values: string[] } },
  ) => Promise<{
    violations: Array<{
      id: string;
      impact: string | null;
      nodes: Array<{ html: string; target: string[]; failureSummary?: string }>;
    }>;
  }>;
};

async function seriousAccessibilityViolations(page: Page) {
  await page.addScriptTag({ content: axe.source });
  return page.evaluate(async () => {
    const result = await (window as unknown as { axe: AxeRuntime }).axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] },
    });
    return result.violations
      .filter((violation) => violation.impact === "critical" || violation.impact === "serious")
      .map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        nodes: violation.nodes.map((node) => ({
          html: node.html,
          target: node.target,
          failureSummary: node.failureSummary,
        })),
      }));
  });
}

type DesktopShellMetrics = {
  bodyPaddingInlineStart: number;
  mainLeft: number;
  mainRight: number;
  mainWidth: number;
  sidebarLeft: number;
  sidebarWidth: number;
  overflow: number;
};

async function readDesktopShell(page: Page): Promise<DesktopShellMetrics | null> {
  return page.evaluate(() => {
    const main = document.querySelector("main.platform-main")?.getBoundingClientRect();
    const sidebarElement = document.querySelector<HTMLElement>(".app-sidebar");
    const sidebar = sidebarElement?.getBoundingClientRect();
    if (!main || !sidebar || !sidebarElement) return null;

    return {
      bodyPaddingInlineStart: Number.parseFloat(getComputedStyle(document.body).paddingInlineStart) || 0,
      mainLeft: main.left,
      mainRight: main.right,
      mainWidth: main.width,
      sidebarLeft: sidebar.left,
      sidebarWidth: sidebar.width,
      overflow: Math.max(
        document.documentElement.scrollWidth - document.documentElement.clientWidth,
        document.body.scrollWidth - document.body.clientWidth,
      ),
    };
  });
}

async function expectDesktopShellToTrackSidebar(page: Page) {
  const viewport = page.viewportSize();
  if (!viewport || viewport.width <= 960) return;

  const body = page.locator("body");
  if (await body.evaluate((element) => element.classList.contains("nav-collapsed"))) {
    await page.getByRole("button", { name: "توسيع القائمة" }).click();
    await expect(body).not.toHaveClass(/nav-collapsed/u);
    await page.waitForTimeout(240);
  }

  const expanded = await readDesktopShell(page);
  expect(expanded).not.toBeNull();
  expect(Math.abs(expanded!.bodyPaddingInlineStart - expanded!.sidebarWidth)).toBeLessThanOrEqual(1);
  expect(expanded!.mainRight).toBeLessThanOrEqual(expanded!.sidebarLeft + 1);
  expect(expanded!.overflow).toBeLessThanOrEqual(1);

  await page.getByRole("button", { name: "طي القائمة" }).click();
  await expect(body).toHaveClass(/nav-collapsed/u);
  await page.waitForTimeout(240);

  const collapsed = await readDesktopShell(page);
  expect(collapsed).not.toBeNull();
  expect(Math.abs(collapsed!.bodyPaddingInlineStart - collapsed!.sidebarWidth)).toBeLessThanOrEqual(1);
  expect(collapsed!.mainRight).toBeLessThanOrEqual(collapsed!.sidebarLeft + 1);
  expect(collapsed!.mainWidth).toBeGreaterThan(expanded!.mainWidth + 30);
  expect(collapsed!.overflow).toBeLessThanOrEqual(1);

  await page.getByRole("button", { name: "توسيع القائمة" }).click();
  await expect(body).not.toHaveClass(/nav-collapsed/u);
  await page.waitForTimeout(240);
}

test.describe("public and protected flows", () => {
  test("the home page leads to the algorithm guide", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/إِعْرَابُكَ/u);
    await expect(page.getByRole("heading", {
      level: 1,
      name: "الإعراب خطوات؛ كل خطوة تفتح مسارًا وتغلق آخر.",
    })).toBeVisible();

    await expectDesktopShellToTrackSidebar(page);

    await page.getByRole("link", { name: "اقرأ تعليمات قبل التدريب" }).click();
    await expect(page).toHaveURL(/\/guide$/u);
    await expect(page.getByRole("heading", { level: 1, name: "تعليمات قبل التدريب" })).toBeVisible();
   
  });

  test("the desktop shell adapts every representative page to the sidebar width", async ({ page }) => {
    const routes = [
      "/",
      "/guide",
      "/learn/start",
      "/auth",
      "/paths?topic=present-verb",
      "/i3rab-in-our-speech",
      "/games",
      "/games/where-is-my-place",
    ];

    for (const route of routes) {
      await test.step(route, async () => {
        const response = await page.goto(route);
        expect(response?.status()).toBe(200);
        await expect(page.locator("main.platform-main")).toBeVisible();
        await expectDesktopShellToTrackSidebar(page);
      });
    }
  });


  test("the place game explains a wrong location and accepts the correct one", async ({ page }) => {
    await page.goto("/games/where-is-my-place");

    await expect(page.getByRole("heading", { level: 1, name: "أين مكاني؟" })).toBeVisible();
    await page.getByRole("button", { name: /كَرَّمَ المُعَلِّمُ/u }).click();
    await expect(page.getByText("هذه البوابة تحتاج صورة أخرى للكلمة")).toBeVisible();
    await expect(page.getByText("الطَّالِبَ", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "جرّب مكانًا آخر" }).click();
    await page.getByRole("button", { name: /حَضَرَ/u }).click();
    await expect(page.getByText("+60")).toBeVisible();
    await expect(page.getByRole("button", { name: "إلى المهمّة التالية" })).toBeVisible();
  });

  test("ready nested routes are registered and never fall through to 404", async ({ page }) => {
    const protectedLearningRoutes = [
      "/learn/inna-wa-akhawatuha",
      "/learn/ism-manqous",
      "/learn/la-nafiya",
      "/learn/hal",
      "/learn/naib-fael",
      "/learn/mafoolat",
    ];
    for (const route of protectedLearningRoutes) {
      await test.step(route, async () => {
        const response = await page.goto(route);
        expect(response?.status()).toBe(200);
        await expect(page.getByRole("heading", {
          level: 1,
          name: "سجّل الدخول لتبدأ التعلّم الموجّه",
        })).toBeVisible();
        await expect(page.getByText("This page could not be found", { exact: false })).toHaveCount(0);
      });
    }

    for (const route of [
      "/guide/ism-manqous",
      "/guide/la-nafiya",
      "/guide/hal",
      "/guide/naib-fael",
      "/guide/mafoolat",
      "/games/where-is-my-place",
      "/games/which-object",
      "/games/who-is-with-me",
      "/games/markati",
    ]) {
      await test.step(route, async () => {
        const response = await page.goto(route);
        expect(response?.status()).toBe(200);
        await expect(page.getByText("This page could not be found", { exact: false })).toHaveCount(0);
      });
    }
  });

  test("a public visual path opens without authentication", async ({ page }) => {
    await page.goto("/paths?topic=present-verb");
    await expect(page.locator(".visual-path-card")).toBeVisible();
    await expect(page.locator(".visual-path-stage")).toBeVisible();
    await expect(page).toHaveURL(/\/paths\?topic=present-verb/);
  });

  test("the progress API rejects unauthenticated writes", async ({ request }) => {
    const response = await request.post("/api/progress", {
      data: {
        kind: "stage-result",
        topicId: "present-verb",
        level: 2,
        mode: "learn",
        exampleId: "forged-example",
        resultNodeId: "forged-result",
      },
    });

    expect(response.status()).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "NOT_AUTHENTICATED" });
  });

  test("public responses include the browser security baseline", async ({ request }) => {
    const response = await request.get("/");
    expect(response.status()).toBe(200);
    const headers = response.headers();
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["permissions-policy"]).toContain("camera=()");
    expect(headers["strict-transport-security"]).toBe("max-age=31536000");
  });

  test("the guide has no horizontal overflow", async ({ page }) => {
    await page.goto("/guide");
    await expect(page.getByRole("heading", { level: 1, name: "تعليمات قبل التدريب" })).toBeVisible();

    const overflow = await page.evaluate(() => ({
      document: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      body: document.body.scrollWidth - document.body.clientWidth,
    }));
    expect(overflow.document).toBeLessThanOrEqual(1);
    expect(overflow.body).toBeLessThanOrEqual(1);
  });

  test("the public starter lesson completes through real answer clicks", async ({ page }) => {
    await page.goto("/learn/start");

    const progressStyle = await page.locator(".start-sticky-progress-top").evaluate((element) => {
      const style = getComputedStyle(element);
      return { display: style.display, justifyContent: style.justifyContent, gap: style.gap };
    });
    expect(progressStyle).toEqual({
      display: "flex",
      justifyContent: "space-between",
      gap: "10px",
    });

    const choiceStyle = await page.locator(".drag-choice").first().evaluate((element) => {
      const style = getComputedStyle(element);
      return { color: style.color, backgroundColor: style.backgroundColor };
    });
    expect(choiceStyle).toEqual({
      color: "rgb(23, 32, 51)",
      backgroundColor: "rgb(255, 255, 255)",
    });

    const steps = [
      { question: "ما نوع كلمة «يأتوا»؟", answer: "فعل" },
      { question: "ما نوع الفعل «يأتوا»؟", answer: "مضارع" },
      { question: "ما العامل الذي سبق الفعل «يأتوا»؟", answer: "سبق بأداة جزم" },
      { question: "هل الفعل «يأتوا» من الأفعال الخمسة؟", answer: "نعم، من الأفعال الخمسة" },
    ];

    for (const [index, step] of steps.entries()) {
      await expect(page.locator("#start-current-question")).toContainText(step.question);
      if (index === 2) {
        await page.getByRole("button", { name: "أحتاج تلميحًا" }).click();
        await page.getByRole("button", { name: "شرح أداة نصب" }).click();
        const glossary = page.getByRole("dialog");
        await expect(glossary).toBeVisible();
        const glossarySurface = await glossary.evaluate((element) => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return {
            position: style.position,
            backgroundColor: style.backgroundColor,
            left: rect.left,
            right: rect.right,
            viewport: window.innerWidth,
          };
        });
        expect(glossarySurface.position).toBe("fixed");
        expect(glossarySurface.backgroundColor).toBe("rgb(255, 248, 223)");
        expect(glossarySurface.left).toBeGreaterThanOrEqual(-1);
        expect(glossarySurface.right).toBeLessThanOrEqual(glossarySurface.viewport + 1);
        await glossary.getByRole("button", { name: "×" }).click();
      }
      await page.getByRole("button", { name: step.answer, exact: true }).click();
      if (index < steps.length - 1) {
        await expect(page.locator("#start-current-question"))
          .toContainText(steps[index + 1].question, { timeout: 4_000 });
      }
    }

    const resultCard = page.locator(".start-finish-card");
    await expect(resultCard).toBeVisible({ timeout: 4_000 });
    await expect(resultCard.locator("h2")).toContainText("فعل مضارع مجزوم بـ(لم)");
    await expect(resultCard).toHaveCSS("display", "grid");
    await resultCard.getByText("عرض التفسير والاقتراحات").click();
    const firstTopic = resultCard.locator(".start-topic-card").first();
    await expect(firstTopic).toBeVisible();
    await expect(firstTopic).toHaveCSS("background-color", "rgb(237, 249, 248)");
    await expect(firstTopic.locator("strong")).toHaveCSS("color", "rgb(15, 118, 110)");
    expect(await seriousAccessibilityViolations(page), "مخالفات الوصول بعد إكمال المثال").toEqual([]);
    const resultBounds = await resultCard.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { left: rect.left, right: rect.right, viewport: window.innerWidth };
    });
    expect(resultBounds.left).toBeGreaterThanOrEqual(-1);
    expect(resultBounds.right).toBeLessThanOrEqual(resultBounds.viewport + 1);
  });

  test("public learning pages have no serious Axe violations", async ({ page }) => {
    for (const path of ["/", "/guide", "/learn/start"]) {
      await page.goto(path);
      await expect(page.getByRole("main")).toBeVisible();
      expect(await seriousAccessibilityViolations(page), `مخالفات الوصول في ${path}`).toEqual([]);
    }
  });
});
