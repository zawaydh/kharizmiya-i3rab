import { expect, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { getExampleCoverageKeys } from "../lib/exercise/progress";
import {
  localQuizExpectedLabel,
  safeFinalLabel,
  type QuizExampleLike,
} from "../lib/exercise/quiz";
import { resolveExpectedResultNodeId } from "../lib/server/progressVerification";
import { getTopicByCode } from "../lib/topics";
import type { ProgressSubmission } from "../lib/progressEvents";

const LIVE_RUN_ENABLED = process.env.RUN_AUTHENTICATED_E2E === "1";
const TOPIC_CODE = process.env.SUPABASE_INTEGRATION_TOPIC_CODE?.trim() || "ism-manqous";

function requiredEnvironment(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`LIVE_E2E_ENV_MISSING:${name}`);
  return value;
}

test.describe("live authenticated completion journey", () => {
  test("login → learn → practice → quiz → dashboard → certificate", async ({ page }, testInfo) => {
    test.skip(!LIVE_RUN_ENABLED, "Set RUN_AUTHENTICATED_E2E=1 to run the live journey.");
    test.skip(testInfo.project.name !== "desktop-chromium", "The live account journey runs once.");

    const supabaseUrl = requiredEnvironment("NEXT_PUBLIC_SUPABASE_URL");
    const anonKey = requiredEnvironment("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    const email = requiredEnvironment("SUPABASE_INTEGRATION_EMAIL");
    const password = requiredEnvironment("SUPABASE_INTEGRATION_PASSWORD");
    const topic = getTopicByCode(TOPIC_CODE);
    if (!topic) throw new Error(`LIVE_E2E_TOPIC_MISSING:${TOPIC_CODE}`);

    const apiClient = createClient(supabaseUrl, anonKey, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    });
    const login = await apiClient.auth.signInWithPassword({ email, password });
    if (login.error) throw new Error(`LIVE_E2E_LOGIN_FAILED:${login.error.message}`);
    const accessToken = login.data.session?.access_token;
    if (!accessToken) throw new Error("LIVE_E2E_SESSION_MISSING");

    const learnPath = `/learn/${topic.code}`;
    await page.goto(`/auth?next=${encodeURIComponent(learnPath)}`);
    await page.getByLabel("البريد الإلكتروني").fill(email);
    await page.getByLabel("كلمة المرور").fill(password);
    await page.getByRole("button", { name: "تسجيل الدخول", exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${learnPath.replace("/", "\\/")}$`, "u"), {
      timeout: 15_000,
    });
    await expect(page.getByText(`${topic.name_ar} — التعلّم الموجّه`, { exact: true })).toBeVisible();

    const save = async (submission: ProgressSubmission) => {
      const response = await page.request.post("/api/progress", {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: submission,
      });
      const text = await response.text();
      expect(response.status(), text).toBe(200);
      const body = JSON.parse(text) as { progress?: Record<string, unknown> };
      expect(body.progress).toBeTruthy();
      return body.progress as Record<string, unknown>;
    };

    for (const example of topic.examples) {
      if (example.id === undefined) throw new Error(`LIVE_E2E_EXAMPLE_ID_MISSING:${topic.code}`);
      await save({
        kind: "stage-result",
        topicId: topic.code,
        level: topic.level,
        mode: "learn",
        exampleId: String(example.id),
        resultNodeId: resolveExpectedResultNodeId(topic.tree, example, "learn"),
      });
    }

    await page.goto(`/train/${topic.code}`);
    await expect(page.getByText(`${topic.name_ar} — التدريب`, { exact: true })).toBeVisible();
    await expect(page.getByText("أكمل التعلّم الموجّه أولًا", { exact: false })).toHaveCount(0);

    for (const example of topic.examples) {
      if (example.id === undefined) throw new Error(`LIVE_E2E_EXAMPLE_ID_MISSING:${topic.code}`);
      await save({
        kind: "stage-result",
        topicId: topic.code,
        level: topic.level,
        mode: "practice",
        exampleId: String(example.id),
        resultNodeId: resolveExpectedResultNodeId(topic.tree, example, "practice"),
      });
    }

    await page.goto(`/quiz/${topic.code}`);
    await expect(page.getByText(`الاختبار النهائي — ${topic.name_ar}`, { exact: true })).toBeVisible();
    await expect(page.getByText("أكمل التعلّم الموجّه والتدريب أولًا", { exact: false })).toHaveCount(0);

    const quizExamples = topic.quizExamples.slice(0, topic.quizCount) as QuizExampleLike[];
    if (quizExamples.length !== topic.quizCount) {
      throw new Error(`LIVE_E2E_QUIZ_EXAMPLES_MISSING:${topic.code}`);
    }
    const quizProgress = await save({
      kind: "quiz-complete",
      topicId: topic.code,
      level: topic.level,
      answers: quizExamples.map((example) => {
        const coverage = getExampleCoverageKeys(example)[0] || "";
        return {
          exampleId: String(example.id),
          actualLabel: localQuizExpectedLabel(
            safeFinalLabel(topic.tree, example, coverage),
            example,
          ),
        };
      }),
    });
    expect(quizProgress.learn_completed).toBe(true);
    expect(quizProgress.practice_completed).toBe(true);
    expect(quizProgress.quiz_passed).toBe(true);
    expect(quizProgress.certificate_earned_at).toEqual(expect.any(String));

    await page.goto("/dashboard");
    const topicCard = page.locator(".dashboard-topic-card").filter({ hasText: topic.name_ar });
    await expect(topicCard).toBeVisible({ timeout: 15_000 });
    await expect(topicCard.locator(".dashboard-progress-line")).toHaveCount(3);
    for (const line of await topicCard.locator(".dashboard-progress-line").all()) {
      await expect(line).toContainText("100%");
    }
    const certificateLink = topicCard.getByRole("link", { name: "الشهادة", exact: true });
    await expect(certificateLink).toBeVisible();
    await certificateLink.click();

    await expect(page.getByText("شهادة إتمام", { exact: true })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(`${topic.name_ar} — المستوى الثاني`, { exact: true })).toBeVisible();
    await expect(page.getByText("ناجح", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "طباعة / حفظ PDF" })).toBeVisible();
  });
});
