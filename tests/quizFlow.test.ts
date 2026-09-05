import { describe, expect, test } from "vitest";
import type { ExerciseTree } from "../lib/exercise/model";
import { getExampleCoverageKeys } from "../lib/exercise/progress";
import { TOPICS } from "../lib/topics";
import {
  QUIZ_PASS_PERCENT,
  buildCloseQuizOptions,
  buildRemedialQueueFromMistakes,
  createQuizAnswerRow,
  createRemedialAnswerRow,
  isSameQuizAnswer,
  localQuizExpectedLabel,
  quizOptionDisplayText,
  safeFinalLabel,
  summarizeQuizAnswers,
  type QuizAnswerRow,
  type QuizExampleLike,
} from "../lib/exercise/quiz";

const example: QuizExampleLike = {
  id: "quiz-1",
  sentence: "كتبَ الطالبُ الدرسَ.",
  target: "الطالبُ",
  correctI3rab: "الطالبُ: فاعل مرفوع وعلامة رفعه الضمة الظاهرة.",
  options: [
    "الطالبُ: فاعل مرفوع وعلامة رفعه الضمة الظاهرة.",
    "الطالبُ: مفعول به منصوب وعلامة نصبه الفتحة الظاهرة.",
    "الطالبُ: مبتدأ مرفوع وعلامة رفعه الضمة الظاهرة.",
    "الطالبُ: اسم مجرور وعلامة جره الكسرة الظاهرة.",
  ],
  covers: ["fael.damma"],
};

describe("منطق الاختبار النهائي المفصول", () => {
  test("مقارنة الإجابات لا تتأثر بالحركات أو علامات الترقيم", () => {
    expect(isSameQuizAnswer("الطالبُ: فاعلٌ مرفوعٌ", "الطالب فاعل مرفوع")).toBe(true);
    expect(isSameQuizAnswer("فاعل مرفوع", "مفعول به منصوب")).toBe(false);
  });

  test("لا تهمل الأسطر التي تميز حرف العلة أو الضمير", () => {
    const alif = "فعل أمر مبني على حذف حرف العلة.\nحرف العلة المحذوف: الألف.";
    const waw = "فعل أمر مبني على حذف حرف العلة.\nحرف العلة المحذوف: الواو.";
    expect(isSameQuizAnswer(alif, waw)).toBe(false);
  });

  test("خيارات السؤال تحتوي الإجابة الصحيحة مرة واحدة", () => {
    const options = buildCloseQuizOptions(example, "stable-seed", 2);
    expect(options).toHaveLength(4);
    expect(new Set(options).size).toBe(4);
    expect(options.filter((option) => isSameQuizAnswer(option, example.correctI3rab))).toHaveLength(1);
  });

  test("يحافظ مولد الخيارات على السطر المميز في الإجابات المركبة", () => {
    const weakImperative: QuizExampleLike = {
      id: "weak-imperative",
      sentence: "اسعَ إلى الخير.",
      target: "اسعَ",
      correctI3rab: "فعل أمر مبني على حذف حرف العلة.\nحرف العلة المحذوف: الألف.",
      options: [
        "فعل أمر مبني على حذف حرف العلة.\nحرف العلة المحذوف: الألف.",
        "فعل أمر مبني على حذف حرف العلة.\nحرف العلة المحذوف: الواو.",
        "فعل أمر مبني على حذف حرف العلة.\nحرف العلة المحذوف: الياء.",
        "فعل أمر مبني على السكون.",
      ],
    };
    const options = buildCloseQuizOptions(weakImperative, "weak-seed", 0);
    expect(options).toHaveLength(4);
    expect(options.every((option) => option.includes("حرف العلة المحذوف") || option.includes("السكون"))).toBe(true);
    expect(options.filter((option) => isSameQuizAnswer(option, weakImperative.correctI3rab))).toHaveLength(1);
  });

  test("كل خيارات الاختبار الظاهرة مختلفة والإجابة الكاملة تُحتسب صحيحة", () => {
    const issues: string[] = [];
    let checked = 0;

    for (const topic of TOPICS.filter((item) => item.isReady)) {
      for (const quizExample of topic.quizExamples) {
        checked += 1;
        const example = quizExample as QuizExampleLike;
        const coverage = getExampleCoverageKeys(quizExample)[0] || "";
        const expected = localQuizExpectedLabel(
          safeFinalLabel(topic.tree, example, coverage),
          example,
        );
        const options = buildCloseQuizOptions(
          example,
          `quiz-visible-audit-${topic.code}-${example.id}`,
          checked,
        );

        const visible = options.map((option) => quizOptionDisplayText(option));
        const duplicateVisible = visible.filter(
          (value, index) => visible.indexOf(value) !== index,
        );

        if (options.length < 2) {
          issues.push(`${topic.code}/${example.id}: fewer than two options`);
        }
        if (visible.some((value) => !value.trim())) {
          issues.push(`${topic.code}/${example.id}: empty visible option`);
        }
        if (duplicateVisible.length) {
          issues.push(
            `${topic.code}/${example.id}: duplicate visible options: ${[
              ...new Set(duplicateVisible),
            ].join(" | ")}`,
          );
        }

        const matching = options.filter((option) =>
          isSameQuizAnswer(option, expected),
        );
        if (matching.length !== 1) {
          issues.push(
            `${topic.code}/${example.id}: expected answer appears ${matching.length} times`,
          );
        } else {
          const row = createQuizAnswerRow({
            example,
            expectedCoverage: coverage,
            expectedLabel: expected,
            actualLabel: matching[0]!,
          });
          if (!row.isCorrect) {
            issues.push(
              `${topic.code}/${example.id}: exact displayed correct option was scored wrong`,
            );
          }
        }

        if (expected.includes("\n")) {
          const secondLine = expected
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean)[1];
          if (
            secondLine &&
            !quizOptionDisplayText(expected).includes(
              quizOptionDisplayText(secondLine),
            )
          ) {
            issues.push(
              `${topic.code}/${example.id}: distinguishing second line is hidden`,
            );
          }
        }
      }
    }

    expect(checked).toBeGreaterThan(0);
    expect(issues, issues.join("\n")).toEqual([]);
  });
  test("يبني سجل الإجابة الصحيحة والخاطئة مع سبب تشخيصي", () => {
    const correctRow = createQuizAnswerRow({
      example,
      expectedCoverage: "fael.damma",
      expectedLabel: example.correctI3rab || "",
      actualLabel: example.correctI3rab || "",
    });
    const wrongRow = createQuizAnswerRow({
      example,
      expectedCoverage: "fael.damma",
      expectedLabel: example.correctI3rab || "",
      actualLabel: example.options?.[1] || "",
    });

    expect(correctRow.isCorrect).toBe(true);
    expect(correctRow.actualCoverage).toBe("fael.damma");
    expect(wrongRow.isCorrect).toBe(false);
    expect(wrongRow.actualCoverage).toBeNull();
    expect(wrongRow.actualOptionReason).toContain("سبب الخطأ");
  });

  test("حساب النتيجة يطبق حد النجاح نفسه المستخدم للشهادة", () => {
    const passingRows: QuizAnswerRow[] = Array.from({ length: 10 }, (_, index) => ({
      exampleId: String(index),
      expectedCoverage: "skill",
      expectedLabel: "الإجابة",
      actualCoverage: index < 8 ? "skill" : null,
      actualLabel: index < 8 ? "الإجابة" : "خاطئة",
      isCorrect: index < 8,
    }));
    const summary = summarizeQuizAnswers(passingRows);

    expect(QUIZ_PASS_PERCENT).toBe(80);
    expect(summary.score).toBe(8);
    expect(summary.percent).toBe(80);
    expect(summary.passed).toBe(true);
    expect(summary.wrongRows).toHaveLength(2);
  });

  test("التدريب العلاجي يولد مثالًا من المهارة نفسها مع حفظ أصل الخطأ", () => {
    const alternative: QuizExampleLike = {
      ...example,
      id: "quiz-2",
      sentence: "نجحَ المجتهدُ.",
      target: "المجتهدُ",
    };
    const wrongRow = createRemedialAnswerRow({
      example,
      expectedCoverage: "fael.damma",
      expectedLabel: example.correctI3rab || "",
      actualLabel: example.options?.[1] || "",
    });
    const queue = buildRemedialQueueFromMistakes([wrongRow], [example, alternative]);

    expect(queue).toHaveLength(1);
    expect(queue[0]?.id).toContain("remedial-");
    expect(queue[0]?.sentence).toBe(alternative.sentence);
    expect(queue[0]?.facts?.remedialOrigin?.actualLabel).toBe(wrongRow.actualLabel);
  });

  test("الإعراب النهائي يقرأ من المثال ثم يرجع إلى نتيجة الشجرة عند الحاجة", () => {
    const tree: ExerciseTree = {
      startNodeId: "result",
      nodes: {
        result: {
          id: "result",
          type: "result",
          text: "الكلمة: فاعل مرفوع وعلامة رفعه الضمة.",
          coverage: "fael.damma",
        },
      },
    };

    expect(safeFinalLabel(tree, example, "fael.damma")).toContain("فاعل مرفوع");
    expect(safeFinalLabel(tree, { id: "without-label" }, "fael.damma")).toContain("فاعل مرفوع");
  });
});
