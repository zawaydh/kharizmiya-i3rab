import { describe, expect, test } from "vitest";
import type { ExerciseTree } from "../lib/exercise/model";
import {
  QUIZ_PASS_PERCENT,
  buildCloseQuizOptions,
  buildRemedialQueueFromMistakes,
  createQuizAnswerRow,
  createRemedialAnswerRow,
  isSameQuizAnswer,
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

  test("خيارات السؤال تحتوي الإجابة الصحيحة مرة واحدة", () => {
    const options = buildCloseQuizOptions(example, "stable-seed", 2);
    expect(options).toHaveLength(4);
    expect(new Set(options).size).toBe(4);
    expect(options.filter((option) => isSameQuizAnswer(option, example.correctI3rab))).toHaveLength(1);
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
