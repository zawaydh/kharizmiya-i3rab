import { describe, expect, test } from "vitest";
import type { ExerciseExample, ExerciseTree } from "../lib/exercise/model";
import {
  addUsedExampleId,
  applyCurrentCoverage,
  buildStageMetrics,
  findNextStageExample,
  hydrateStageProgress,
} from "../lib/exercise/stageSession";

const tree: ExerciseTree = {
  startNodeId: "start",
  nodes: {
    start: { id: "start", type: "question", text: "سؤال", answers: [] },
    result: { id: "result", type: "result", text: "نتيجة", coverage: "skill.a" },
  },
};

const examples: ExerciseExample[] = [
  { id: "a", covers: ["skill.a"] },
  { id: "b", covers: ["skill.b"] },
  { id: "c", covers: ["skill.c"] },
];

describe("جلسة التعلّم والتدريب", () => {
  test("تستعيد تغطية المرحلة المناسبة فقط", () => {
    const row = {
      coverage: ["skill.a"],
      practice_coverage: ["skill.b"],
      learn_completed: true,
      practice_completed: false,
    };
    expect(hydrateStageProgress("learn", ["skill.a", "skill.b"], row).covered).toEqual({
      "skill.a": true,
      "skill.b": false,
    });
    expect(hydrateStageProgress("practice", ["skill.a", "skill.b"], row).covered).toEqual({
      "skill.a": false,
      "skill.b": true,
    });
  });

  test("تحسب ملخص المرحلة وحالة فتح المرحلة التالية", () => {
    expect(buildStageMetrics({
      mode: "learn",
      covered: { a: true, b: false },
      orderedKeys: ["a", "b"],
      learnReady: false,
      practiceReady: false,
    })).toEqual({
      totalCount: 2,
      doneCount: 1,
      percent: 50,
      isDone: false,
      nextStageReady: false,
      nextCoverageKey: "b",
    });
  });

  test("تضيف تغطية النتيجة والمثال دون فقد التغطية السابقة", () => {
    const update = applyCurrentCoverage({
      tree,
      example: { id: "a", covers: ["skill.b"] },
      currentNodeId: "result",
      orderedKeys: ["skill.a", "skill.b", "skill.c"],
      covered: { "skill.a": false, "skill.b": false, "skill.c": true },
    });
    expect(update.covered).toEqual({
      "skill.a": true,
      "skill.b": true,
      "skill.c": true,
    });
    expect(update.percent).toBe(100);
  });

  test("تختار مثالًا غير مستخدم يغطي المفتاح الناقص", () => {
    expect(findNextStageExample({
      examples,
      currentIndex: 0,
      covered: { "skill.a": true, "skill.b": false, "skill.c": true },
      orderedKeys: ["skill.a", "skill.b", "skill.c"],
      usedIds: ["a"],
      allowPreviouslyUsed: true,
    })).toBe(1);
  });

  test("تسمح بالتكرار الموجّه عند نفاد الأمثلة الجديدة", () => {
    expect(findNextStageExample({
      examples,
      currentIndex: 0,
      covered: { "skill.a": true, "skill.b": false, "skill.c": true },
      orderedKeys: ["skill.a", "skill.b", "skill.c"],
      usedIds: ["a", "b", "c"],
      allowPreviouslyUsed: true,
    })).toBe(1);
  });

  test("لا تعيد مثالًا مستخدمًا عند طلب الإكمال الصريح", () => {
    expect(findNextStageExample({
      examples,
      currentIndex: 0,
      covered: { "skill.a": true, "skill.b": false, "skill.c": true },
      orderedKeys: ["skill.a", "skill.b", "skill.c"],
      usedIds: ["a", "b", "c"],
      allowPreviouslyUsed: false,
    })).toBeNull();
  });

  test("تسجل المثال المستخدم مرة واحدة", () => {
    expect(addUsedExampleId(["a"], { id: "a" }, 0)).toEqual(["a"]);
    expect(addUsedExampleId(["a"], { id: "b" }, 1)).toEqual(["a", "b"]);
  });
});
