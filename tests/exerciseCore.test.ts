import { describe, expect, test } from "vitest";
import {
  applyActionsToFlags,
  evaluateAnswer,
  requirementsMet,
  resolveAnswerNext,
} from "../lib/exercise/engine";
import type { ExerciseAnswer, ExerciseExample, ExerciseTree } from "../lib/exercise/model";
import {
  buildEmptyCovered,
  calcPercent,
  getExampleCoverageKeys,
  resolveCoverageKeys,
} from "../lib/exercise/progress";
import { buildRunnerState, pickNextExampleIndex } from "../lib/exercise/runner";
import {
  buildQuizProgressSubmission,
  buildStageResultSubmission,
  parseProgressSubmission,
} from "../lib/progressEvents";

describe("النواة المفصولة من ExercisePlayer", () => {
  test("تحسب التغطية من المفاتيح المطلوبة فقط", () => {
    expect(calcPercent(buildEmptyCovered(["a", "b"]), ["a", "b"])).toBe(0);
    expect(calcPercent({ a: true, b: false, extra: true }, ["a", "b"])).toBe(50);
    expect(calcPercent({ a: true, b: true }, ["a", "b"])).toBe(100);
    expect(calcPercent({}, [])).toBe(0);
  });

  test("تختار مثالًا يغطي مهارة غير منجزة", () => {
    const examples: ExerciseExample[] = [
      { id: "one", covers: ["a"] },
      { id: "two", covers: ["b"] },
      { id: "three", covers: ["c"] },
    ];
    const selected = pickNextExampleIndex(
      examples,
      ["a", "b", "c"],
      { a: true, b: false, c: true },
      0,
      () => 0
    );
    expect(selected).toBe(1);
  });

  test("يستخدم بداية أقصر في التدريب عندما يحددها الباب", () => {
    const tree: ExerciseTree = {
      startNodeId: "learn-start",
      practiceStartNodeId: "practice-start",
      nodes: {
        "learn-start": { id: "learn-start", type: "result", text: "تعلم" },
        "practice-start": { id: "practice-start", type: "result", text: "تدريب" },
      },
    };
    expect(buildRunnerState(tree, "learn", { id: "a", facts: {} }).currentNodeId).toBe("learn-start");
    expect(buildRunnerState(tree, "practice", { id: "a", facts: {} }).currentNodeId).toBe("practice-start");
  });

  test("يبقي فحص ما الكافة أول خطوة في أمثلة إن وأخواتها", () => {
    const tree: ExerciseTree = {
      startNodeId: "start",
      nodes: {
        start: { id: "start", type: "result", text: "نهاية" },
        inna_kaffa_effect: { id: "inna_kaffa_effect", type: "result", text: "نهاية" },
      },
    };
    expect(buildRunnerState(tree, "learn", { id: "a", facts: {} }).currentNodeId).toBe("start");
    expect(
      buildRunnerState(tree, "learn", { id: "b", facts: { hasKaffa: true } }).currentNodeId
    ).toBe("start");
  });

  test("تقيّم الإجابة والانتقال الديناميكي ومتطلبات الأعلام", () => {
    const answer: ExerciseAnswer = {
      id: "a",
      text: "اختيار",
      next: "fallback",
      eval: { fact: "shape", anyOf: ["dual", "plural"] },
      nextByFact: {
        fact: "shape",
        map: { dual: "dual-result" },
        default: "fallback",
      },
      actions: [{ type: "flag.set", key: "shapeKnown" }],
    };
    const facts = { shape: "dual" };
    const flags = applyActionsToFlags({}, answer.actions);

    expect(evaluateAnswer(answer, facts)).toBe(true);
    expect(resolveAnswerNext(answer, facts)).toBe("dual-result");
    expect(requirementsMet(["shapeKnown"], flags)).toBe(true);
  });

  test("تجمع تغطية المثال والنتيجة دون تكرار", () => {
    const tree: ExerciseTree = {
      startNodeId: "result",
      nodes: {
        result: {
          id: "result",
          type: "result",
          text: "نتيجة",
          coverage: "skill.a",
        },
      },
    };
    const example = { id: "one", covers: ["skill.a", "skill.b"] };
    expect(getExampleCoverageKeys(example)).toEqual(["skill.a", "skill.b"]);
    expect(
      resolveCoverageKeys({
        tree,
        example,
        currentNodeId: "result",
        requiredKeys: ["skill.a", "skill.b"],
      })
    ).toEqual(["skill.a", "skill.b"]);
  });
  test("يرسل دليل النتيجة فقط ولا يثق بنسب محسوبة في المتصفح", () => {
    const learn = buildStageResultSubmission({
      mode: "learn",
      topicId: "topic",
      level: 2,
      exampleId: "example-1",
      resultNodeId: "result-1",
    });
    const quiz = buildQuizProgressSubmission({
      topicId: "topic",
      level: 2,
      rows: [{ exampleId: "quiz-1", actualLabel: "الإجابة" }],
    });

    expect(learn).toEqual({
      kind: "stage-result",
      mode: "learn",
      topicId: "topic",
      level: 2,
      exampleId: "example-1",
      resultNodeId: "result-1",
    });
    expect(quiz.answers).toEqual([{ exampleId: "quiz-1", actualLabel: "الإجابة" }]);
    expect(parseProgressSubmission({ ...learn, percent: 100 })).toEqual(learn);
    expect(parseProgressSubmission({ kind: "quiz-complete", topicId: "topic", level: 2, answers: [] })).toBeNull();
  });

});
