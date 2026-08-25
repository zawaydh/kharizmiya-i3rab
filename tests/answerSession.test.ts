import { describe, expect, test } from "vitest";
import {
  buildWrongFeedback,
  deterministicPraise,
  findCorrectAnswer,
  isHintAnswerOption,
  resolveAnswerAttempt,
} from "../lib/exercise/answerSession";
import type { ExerciseTree, QuestionNode } from "../lib/exercise/model";
import { buildRunnerState } from "../lib/exercise/runner";

const node: QuestionNode = {
  id: "q1",
  type: "question",
  text: "اختر",
  answers: [
    { id: "wrong", text: "خاطئة", next: "result", correct: false },
    { id: "correct", text: "صحيحة", next: "result", correct: true },
    { id: "help", text: "لا أعلم", next: "q1", isHelp: true },
  ],
};

const tree: ExerciseTree = {
  startNodeId: "q1",
  nodes: {
    q1: node,
    result: { id: "result", type: "result", text: "النهاية" },
  },
};

describe("جلسة إجابة السؤال", () => {
  test("تتعرف إلى جميع صيغ طلب التلميح", () => {
    expect(isHintAnswerOption({ id: "__help", text: "مساعدة" })).toBe(true);
    expect(isHintAnswerOption({ id: "x", text: "أحتاج تلميحًا" })).toBe(true);
    expect(isHintAnswerOption({ id: "x", text: "إجابة" })).toBe(false);
  });

  test("تجد إجابة صحيحة واحدة وفق حقائق المثال", () => {
    const evaluatedNode: QuestionNode = {
      ...node,
      answers: [
        { id: "a", text: "أ", next: "result", eval: { fact: "kind", equals: "a" } },
        { id: "b", text: "ب", next: "result", eval: { fact: "kind", equals: "b" } },
      ],
    };
    expect(findCorrectAnswer(evaluatedNode, { kind: "b" })?.id).toBe("b");
  });

  test("لا تنتقل عند اختيار إجابة خاطئة", () => {
    const state = buildRunnerState(tree, "learn", { id: "one", facts: {} });
    const attempt = resolveAnswerAttempt({ tree, node, state, answerId: "wrong" });
    expect(attempt.kind).toBe("wrong");
    expect(attempt.kind === "wrong" ? attempt.correctAnswer?.id : null).toBe("correct");
    expect(state.currentNodeId).toBe("q1");
  });

  test("تنقل الإجابة الصحيحة إلى العقدة التالية", () => {
    const state = buildRunnerState(tree, "learn", { id: "one", facts: {} });
    const attempt = resolveAnswerAttempt({ tree, node, state, answerId: "correct" });
    expect(attempt.kind).toBe("correct");
    expect(attempt.kind === "correct" ? attempt.nextNodeId : null).toBe("result");
    expect(attempt.kind === "correct" ? attempt.blocked : true).toBe(false);
  });

  test("تعيد حالة تلميح بدل تنفيذ الانتقال", () => {
    const state = buildRunnerState(tree, "learn", { id: "one", facts: {} });
    expect(resolveAnswerAttempt({ tree, node, state, answerId: "help" }).kind).toBe("help");
  });

  test("لا يكشف الإجابة الصحيحة عند الخطأ بل يميز الاختيار الخاطئ فقط", () => {
    expect(buildWrongFeedback({ answerId: "a", hint: "راجع" }))
      .toEqual({ wrongId: "a", hint: "راجع" });
  });

  test("التعزيز ثابت لنفس السؤال والاختيار", () => {
    const first = deterministicPraise({ mode: "learn", nodeId: "q", answerId: "a", target: "محمد" });
    const second = deterministicPraise({ mode: "learn", nodeId: "q", answerId: "a", target: "محمد" });
    expect(first).toBe(second);
    expect(first.length).toBeGreaterThan(0);
  });
});
