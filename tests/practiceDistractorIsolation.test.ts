import { describe, expect, test } from "vitest";
import { pastVerbTree } from "../content/trees/verb_past";
import { pastVerbExamples } from "../content/examples/verb_past.examples";
import { buildRunnerState } from "../lib/exercise/runner";
import { isSameQuizAnswer, safeFinalLabel, type QuizExampleLike } from "../lib/exercise/quiz";
import { stageExampleVariant } from "../lib/exercise/stageExampleVariants";
import {
  buildPracticeDirectOptions,
  practiceExpectedLabelForExample,
} from "../app/components/exercise/ExercisePracticeFlow";

const normalize = (value: unknown) =>
  String(value ?? "")
    .normalize("NFKC")
    .replace(/[\u064B-\u065F\u0670\u0640]/gu, "")
    .replace(/\s+/gu, " ")
    .trim();

describe("عزل خيارات تدرّب عن الأمثلة الأخرى", () => {
  test("كل مثال في الفعل الماضي يعيد بناء مشتتاته من المثال الحالي فقط", () => {
    const foreignTargets = pastVerbExamples.map((item) => normalize(item.target)).filter(Boolean);

    for (const source of pastVerbExamples) {
      const example = stageExampleVariant(source, "practice");
      const state = buildRunnerState(pastVerbTree, "practice", example);
      const coverage = example.covers[0] || "";
      const rawExpected = safeFinalLabel(pastVerbTree, example as QuizExampleLike, coverage);
      const expected = practiceExpectedLabelForExample(rawExpected, example);
      const options = buildPracticeDirectOptions({
        tree: pastVerbTree,
        mode: "practice",
        example,
        state,
        practiceExpectedLabel: expected,
      });

      expect(new Set(options.map(normalize)).size).toBe(options.length);
      expect(options.filter((option) => isSameQuizAnswer(option, expected))).toHaveLength(1);

      const currentTarget = normalize(example.target);
      const otherTargets = foreignTargets.filter(
        (target) => target && target !== normalize(source.target) && target !== currentTarget,
      );
      for (const option of options) {
        for (const otherTarget of otherTargets) {
          expect(
            normalize(option).includes(otherTarget),
            `${source.id}: لا يجوز أن يتسرّب هدف مثال آخر «${otherTarget}» إلى الخيار «${option}»`,
          ).toBe(false);
        }
      }
    }
  });
});
