import { describe, expect, test } from "vitest";
import { imperativeVerbTree } from "../content/trees/verb_imperative";
import { imperativeVerbExamples } from "../content/examples/verb_imperative.examples";
import { buildRunnerState } from "../lib/exercise/runner";
import { safeFinalLabel, type QuizExampleLike } from "../lib/exercise/quiz";
import {
  buildPracticeCorrectRoute,
  buildPracticeDirectOptions,
} from "../app/components/exercise/ExercisePracticeFlow";

describe("مسار التدريب السريع المفصول", () => {
  test("يبني خيارات فريدة تتضمن النتيجة الصحيحة", () => {
    const example = imperativeVerbExamples.find((item) => item.id === "im-delete-letter-alif");
    expect(example).toBeDefined();
    if (!example) return;

    const state = buildRunnerState(imperativeVerbTree, "practice", example);
    const coverageKey = example.covers[0] || "";
    const expected = safeFinalLabel(
      imperativeVerbTree,
      example as QuizExampleLike,
      coverageKey,
    );
    const options = buildPracticeDirectOptions({
      tree: imperativeVerbTree,
      mode: "practice",
      example,
      state,
      practiceExpectedLabel: expected,
    });

    expect(options).toContain(expected);
    expect(new Set(options).size).toBe(options.length);
    expect(options.length).toBeGreaterThanOrEqual(2);
    expect(options.length).toBeLessThanOrEqual(3);
  });

  test("يشرح حرف العلة ويصل إلى عقدة النتيجة", () => {
    const example = imperativeVerbExamples.find((item) => item.id === "im-delete-letter-alif");
    expect(example).toBeDefined();
    if (!example) return;

    const state = buildRunnerState(imperativeVerbTree, "practice", example);
    const expected = safeFinalLabel(
      imperativeVerbTree,
      example as QuizExampleLike,
      example.covers[0] || "",
    );
    const route = buildPracticeCorrectRoute({
      tree: imperativeVerbTree,
      mode: "practice",
      example,
      state,
      practiceExpectedLabel: expected,
    });

    expect(route.steps.join(" ")).toContain("حرف العلة المحذوف: الألف");
    expect(route.steps.join(" ")).toContain(expected.replace(/[.!؟]+$/u, ""));
    expect(route.steps.join(" ")).not.toContain("..");
    expect(imperativeVerbTree.nodes[route.nextState.currentNodeId]?.type).toBe("result");
  });
});
