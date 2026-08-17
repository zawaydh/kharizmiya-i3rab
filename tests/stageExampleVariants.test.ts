import { describe, expect, test } from "vitest";
import { TOPICS } from "../lib/topics";
import { stageExampleVariant } from "../lib/exercise/stageExampleVariants";

const normalize = (value: unknown) =>
  String(value ?? "")
    .normalize("NFKC")
    .replace(/[\u064B-\u065F\u0670\u0640]/gu, "")
    .replace(/\s+/gu, " ")
    .trim();

describe("تنويع الأمثلة بين المراحل", () => {
  test("يحافظ على هوية المثال ومفاتيح التغطية ولا يغيّر المصدر", () => {
    for (const topic of TOPICS) {
      for (const example of topic.examples) {
        const snapshot = JSON.stringify(example);
        const practice = stageExampleVariant(example, "practice");
        const quiz = stageExampleVariant(example, "quiz");

        expect(practice.id).toBe(example.id);
        expect(quiz.id).toBe(example.id);
        expect(practice.covers).toEqual(example.covers);
        expect(quiz.covers).toEqual(example.covers);
        expect(JSON.stringify(example)).toBe(snapshot);
      }
    }
  });

  test("إذا كان الهدف ظاهرًا في الجملة الأصلية يبقى ظاهرًا بعد التنويع", () => {
    for (const topic of TOPICS) {
      for (const example of topic.examples) {
        const sourceSentence = normalize(example.sentence);
        const sourceTarget = normalize(example.target);
        if (!sourceTarget || !sourceSentence.includes(sourceTarget)) continue;

        for (const mode of ["practice", "quiz"] as const) {
          const varied = stageExampleVariant(example, mode);
          expect(
            normalize(varied.sentence).includes(normalize(varied.target)),
            `${topic.code}/${example.id}/${mode}: الهدف يجب أن يبقى داخل الجملة بعد التنويع`,
          ).toBe(true);
        }
      }
    }
  });
});
