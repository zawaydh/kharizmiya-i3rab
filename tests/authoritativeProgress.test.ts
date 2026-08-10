import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";
import { getExampleCoverageKeys } from "../lib/exercise/progress";
import {
  localQuizExpectedLabel,
  safeFinalLabel,
  type QuizExampleLike,
} from "../lib/exercise/quiz";
import { TOPIC_CATALOG } from "../lib/topicCatalog";
import { TOPICS, getTopicByCode } from "../lib/topics";
import { buildAuthoritativeProgressUpdate } from "../lib/server/progressRepository";
import {
  ProgressVerificationError,
  resolveExpectedResultNodeId,
  verifyProgressSubmission,
} from "../lib/server/progressVerification";

const root = resolve(process.cwd());
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("الحفظ الموثوق من الخادم", () => {
  test("يفصل الفهرس الخفيف عن الأشجار ويحافظ على أعداد التغطية", () => {
    expect(TOPIC_CATALOG).toHaveLength(TOPICS.length);
    for (const topic of TOPICS) {
      const metadata = TOPIC_CATALOG.find((item) => item.code === topic.code);
      expect(metadata?.coverageCount, topic.code).toBe(topic.coverageKeysOrdered.length);
      expect(metadata?.quizCount, topic.code).toBe(topic.quizCount);
    }
  });

  test("يصل الخادم إلى النتيجة الصحيحة لكل مثال في التعلّم والتدريب", () => {
    for (const topic of TOPICS) {
      for (const example of topic.examples) {
        for (const mode of ["learn", "practice"] as const) {
          const resultId = resolveExpectedResultNodeId(topic.tree, example, mode);
          expect(topic.tree.nodes[resultId]?.type, `${topic.code}:${String(example.id)}:${mode}`).toBe("result");
        }
      }
    }
  });

  test("يربط مثال القاضي المنقوص بنتيجته الصحيحة ولا يقبله كنتيجة مقصور", () => {
    const topic = getTopicByCode("inna-wa-akhawatuha");
    const example = topic?.examples.find((item) => String(item.id) === "in-03");
    if (!topic || !example) throw new Error("TEST_INNA_EXAMPLE_MISSING");

    expect(resolveExpectedResultNodeId(topic.tree, example, "learn")).toBe("R_inna_ism_manqous");
    expect(() => verifyProgressSubmission({
      kind: "stage-result",
      topicId: topic.code,
      level: topic.level,
      mode: "learn",
      exampleId: "in-03",
      resultNodeId: "R_inna_ism_maqsur",
    })).toThrowError(ProgressVerificationError);
  });

  test("يرفض ادعاء الوصول إلى نتيجة غير نتيجة المثال", () => {
    const topic = getTopicByCode("present-verb");
    if (!topic || topic.examples[0]?.id === undefined) throw new Error("TEST_TOPIC_MISSING");

    expect(() => verifyProgressSubmission({
      kind: "stage-result",
      topicId: topic.code,
      level: topic.level,
      mode: "learn",
      exampleId: String(topic.examples[0].id),
      resultNodeId: "R_present_forged",
    })).toThrowError(ProgressVerificationError);
  });

  test("يشتق التغطية والنسبة من المحتوى الموثوق لا من المتصفح", () => {
    const topic = getTopicByCode("first-word-key");
    const example = topic?.examples[0];
    if (!topic || !example || example.id === undefined) throw new Error("TEST_TOPIC_MISSING");
    const resultNodeId = resolveExpectedResultNodeId(topic.tree, example, "learn");
    const verified = verifyProgressSubmission({
      kind: "stage-result",
      topicId: topic.code,
      level: topic.level,
      mode: "learn",
      exampleId: String(example.id),
      resultNodeId,
    });
    const update = buildAuthoritativeProgressUpdate(null, verified);

    expect(update.coverage).toEqual(getExampleCoverageKeys(example));
    expect(update.percent).toBeGreaterThan(0);
    expect(update.percent).toBeLessThanOrEqual(100);
    expect(update).not.toHaveProperty("quiz_score");
    expect(update).not.toHaveProperty("certificate_earned_at");
  });

  test("يعيد حساب نتيجة الاختبار من الإجابات الفعلية", () => {
    const topic = getTopicByCode("present-verb");
    if (!topic) throw new Error("TEST_TOPIC_MISSING");
    const answers = topic.quizExamples.slice(0, topic.quizCount).map((rawExample) => {
      const example = rawExample as QuizExampleLike;
      const coverage = getExampleCoverageKeys(example)[0] || "";
      return {
        exampleId: String(example.id),
        actualLabel: localQuizExpectedLabel(safeFinalLabel(topic.tree, example, coverage), example),
      };
    });
    answers[0] = { ...answers[0]!, actualLabel: "إجابة مزورة" };

    const verified = verifyProgressSubmission({
      kind: "quiz-complete",
      topicId: topic.code,
      level: topic.level,
      answers,
    });
    expect(verified.kind).toBe("quiz-complete");
    if (verified.kind !== "quiz-complete") throw new Error("TEST_VERIFICATION_KIND");
    expect(verified.score).toBe(topic.quizCount - 1);
    expect(verified.total).toBe(topic.quizCount);
  });

  test("يحفظ نتيجة المثال فور الوصول إليها قبل الانتقال أو تحديث الصفحة", () => {
    const player = read("app/components/ExercisePlayer.tsx");
    const stageSession = read("app/components/exercise/useStageSession.ts");

    expect(player).toContain('node?.type !== "result"');
    expect(player).toContain("void recordResult({");
    expect(player).toContain("selectedExampleMatchesRunner");
    expect(player).not.toContain("React.useLayoutEffect");
    expect(player).toContain('if (mode !== "quiz" && example && !selectedExampleMatchesRunner)');
    expect(player).toContain("setState(buildRunnerState(tree, mode, example))");
    expect(stageSession).toContain("const recordResult = React.useCallback");
    expect(stageSession).toContain("savedResultKeysRef");
    expect(stageSession).toContain("saveInFlightRef");
  });

  test("لا يبقي أي كتابة مباشرة للتقدم في المتصفح أو RLS", () => {
    const clientDb = read("lib/db.ts");
    const schema = read("supabase/schema.sql");
    const migration = read("supabase/migrations/20260805_server_authoritative_progress.sql");

    expect(clientDb).not.toContain('.from("progress").update');
    expect(clientDb).not.toContain('.from("progress").insert');
    expect(schema).not.toContain('create policy "Progress: update own"');
    expect(schema).toContain("revoke insert, update, delete on public.progress from anon, authenticated");
    expect(migration).toContain('drop policy if exists "Progress: update own"');
  });
});
