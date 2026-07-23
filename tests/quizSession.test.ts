import { describe, expect, test } from "vitest";
import type { QuizAnswerRow, QuizExampleLike } from "../lib/exercise/quiz";
import {
  buildQuizOrder,
  createQuizSessionState,
  currentQuizExampleIndex,
  isQuizSessionFinished,
  quizSessionReducer,
} from "../lib/exercise/quizSession";

function answerRow(index: number, isCorrect = true): QuizAnswerRow {
  return {
    exampleId: `example-${index}`,
    expectedCoverage: `skill-${index}`,
    expectedLabel: `الإجابة ${index}`,
    actualCoverage: isCorrect ? `skill-${index}` : null,
    actualLabel: isCorrect ? `الإجابة ${index}` : `خاطئة ${index}`,
    isCorrect,
  };
}

function remedialExample(index: number): QuizExampleLike {
  return {
    id: `remedial-${index}`,
    sentence: `مثال ${index}`,
    correctI3rab: `الإجابة ${index}`,
    covers: [`skill-${index}`],
  };
}

describe("حالة جلسة الاختبار النهائي", () => {
  test("يبني ترتيبًا متنوعًا وثابتًا للبذرة نفسها ولا يتجاوز العدد المطلوب", () => {
    const first = buildQuizOrder(12, 5, 17);
    const same = buildQuizOrder(12, 5, 17);
    const another = buildQuizOrder(12, 5, 18);
    expect(first).toHaveLength(5);
    expect(new Set(first).size).toBe(5);
    expect(same).toEqual(first);
    expect(another).not.toEqual(first);
    expect(buildQuizOrder(3, 10, 3)).toHaveLength(3);
    expect(buildQuizOrder(-2, 10, 3)).toEqual([]);
  });

  test("تسجيل الإجابة ينقل للسؤال التالي ويحفظ الإجابة المختارة", () => {
    let state = createQuizSessionState(3, 3);
    state = quizSessionReducer(state, { type: "select", option: "الإجابة 0" });
    state = quizSessionReducer(state, { type: "record-answer", row: answerRow(0) });
    expect(state.cursor).toBe(1);
    expect(state.answers[0]?.actualLabel).toBe("الإجابة 0");
    expect(state.selected).toBeNull();
    expect(currentQuizExampleIndex(state)).toBe(state.order[1]);
  });

  test("العودة إلى سؤال سابق تستعيد إجابته ولا تمحو الإجابات اللاحقة", () => {
    let state = createQuizSessionState(3, 3);
    state = quizSessionReducer(state, { type: "record-answer", row: answerRow(0) });
    state = quizSessionReducer(state, { type: "record-answer", row: answerRow(1, false) });
    state = quizSessionReducer(state, { type: "previous" });
    expect(state.cursor).toBe(1);
    expect(state.selected).toBe("خاطئة 1");
    expect(state.answers).toHaveLength(2);
  });

  test("يعلن انتهاء الجلسة فقط بعد الإجابة عن جميع الأسئلة", () => {
    let state = createQuizSessionState(2, 2);
    expect(isQuizSessionFinished(state)).toBe(false);
    state = quizSessionReducer(state, { type: "record-answer", row: answerRow(0) });
    expect(isQuizSessionFinished(state)).toBe(false);
    state = quizSessionReducer(state, { type: "record-answer", row: answerRow(1) });
    expect(isQuizSessionFinished(state)).toBe(true);
  });

  test("بدء العلاج وإعادة المحاولة والانتقال لا يغير إجابات الاختبار", () => {
    const initial = quizSessionReducer(createQuizSessionState(2, 2), {
      type: "record-answer",
      row: answerRow(0, false),
    });
    const queue = [remedialExample(0), remedialExample(1)];
    let state = quizSessionReducer(initial, { type: "start-remedial", queue });
    state = quizSessionReducer(state, { type: "select-remedial", option: "خاطئة" });
    state = quizSessionReducer(state, { type: "record-remedial", row: answerRow(10, false) });
    state = quizSessionReducer(state, { type: "retry-remedial" });
    state = quizSessionReducer(state, { type: "select-remedial", option: "الإجابة 0" });
    state = quizSessionReducer(state, { type: "record-remedial", row: answerRow(11) });
    state = quizSessionReducer(state, { type: "next-remedial" });
    expect(state.remedialCursor).toBe(1);
    expect(state.remedialSelected).toBeNull();
    expect(state.remedialChecked).toBe(false);
    expect(state.answers[0]?.isCorrect).toBe(false);
  });

  test("إعادة الاختبار تنظف الجلسة والعلاج مع إبقاء عدد الأسئلة الصحيح", () => {
    let state = createQuizSessionState(4, 3);
    state = quizSessionReducer(state, { type: "record-answer", row: answerRow(0) });
    state = quizSessionReducer(state, { type: "start-remedial", queue: [remedialExample(0)] });
    state = quizSessionReducer(state, { type: "reset", exampleCount: 4, quizCount: 3, seed: 9 });
    expect(state.order).toEqual(buildQuizOrder(4, 3, 9));
    expect(state.cursor).toBe(0);
    expect(state.answers).toEqual([]);
    expect(state.remedialActive).toBe(false);
    expect(state.remedialQueue).toEqual([]);
  });
});
