import { describe, expect, test } from "vitest";
import {
  buildGlobalProgress,
  buildHeroProgress,
  stageCompletionCopy,
} from "../lib/exercise/presentation";

describe("نماذج عرض تقدم التعلّم والاختبار", () => {
  test("يعرض نسبة الإنجاز كما هي في التعلّم", () => {
    expect(buildHeroProgress({
      mode: "learn",
      coveredPercent: 60,
      quizCursor: 0,
      quizTotal: 0,
      quizCount: 10,
      quizFinished: false,
    })).toEqual({ label: "نسبة الإنجاز", value: "60%", fillPercent: 60 });
  });

  test("يعرض السؤال الحالي في الاختبار مع حد أدنى مرئي للشريط", () => {
    expect(buildHeroProgress({
      mode: "quiz",
      coveredPercent: 0,
      quizCursor: 0,
      quizTotal: 10,
      quizCount: 10,
      quizFinished: false,
    })).toEqual({ label: "تقدّم الاختبار النهائي", value: "1 / 10", fillPercent: 10 });
  });

  test("يكمل شريط الاختبار عند انتهاء جميع الأسئلة", () => {
    expect(buildHeroProgress({
      mode: "quiz",
      coveredPercent: 0,
      quizCursor: 9,
      quizTotal: 10,
      quizCount: 10,
      quizFinished: true,
    }).fillPercent).toBe(100);
  });

  test("يحافظ الشريط السفلي على طريقة العد الحالية للاختبار", () => {
    expect(buildGlobalProgress({
      mode: "quiz",
      coveredDone: 0,
      coverageTotal: 0,
      quizCursor: 2,
      quizTotal: 10,
      quizCount: 10,
      quizFinished: false,
    })).toEqual({ label: "تقدّم الاختبار", displayDone: 3, total: 10, fillPercent: 20 });
  });

  test("يعرض تقدم التغطية في التعلّم دون ربطه بعدد أسئلة الاختبار", () => {
    expect(buildGlobalProgress({
      mode: "practice",
      coveredDone: 4,
      coverageTotal: 8,
      quizCursor: 0,
      quizTotal: 0,
      quizCount: 10,
      quizFinished: false,
    })).toEqual({ label: "تقدّم المرحلة", displayDone: 4, total: 8, fillPercent: 50 });
  });

  test("يعطي نص إتمام مستقلًا لكل مرحلة", () => {
    expect(stageCompletionCopy("learn").resetLabel).toBe("إعادة التعلّم الموجّه");
    expect(stageCompletionCopy("practice").resetLabel).toBe("إعادة التدريب");
  });
});
