import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { WHERE_IS_MY_PLACE_CYCLES } from "../content/games/where-is-my-place";

const ARABIC_DIACRITIC = /[\u064B-\u0652\u0670]/u;

describe("Where Is My Place content", () => {
  it("offers several full cycles with fresh examples", () => {
    expect(WHERE_IS_MY_PLACE_CYCLES.length).toBeGreaterThanOrEqual(5);
    for (const cycle of WHERE_IS_MY_PLACE_CYCLES) {
      expect(cycle.challenges.length).toBeGreaterThanOrEqual(6);
    }

    const challengeIds = WHERE_IS_MY_PLACE_CYCLES.flatMap((cycle) =>
      cycle.challenges.map((challenge) => challenge.id),
    );
    expect(new Set(challengeIds).size).toBe(challengeIds.length);
  });

  it("keeps every target diacritized and every challenge uniquely solvable", () => {
    for (const cycle of WHERE_IS_MY_PLACE_CYCLES) {
      for (const challenge of cycle.challenges) {
        expect(challenge.word).toMatch(ARABIC_DIACRITIC);
        expect(challenge.choices).toHaveLength(3);
        expect(challenge.choices.every((choice) => choice.sentence.includes("{word}"))).toBe(true);

        const matchingChoices = challenge.choices.filter(
          (choice) => choice.requiredForm === challenge.word,
        );
        expect(matchingChoices).toHaveLength(1);
        expect(matchingChoices[0]?.id).toBe(challenge.correctChoiceId);

        for (const choice of challenge.choices) {
          expect(choice.explanation.length).toBeGreaterThan(30);
          expect(choice.requiredForm.length).toBeGreaterThan(1);
          expect(choice.role.length).toBeGreaterThan(3);
        }
      }
    }
  });


  it("keeps the game logic and content cycles split into maintainable files", () => {
    const root = resolve(process.cwd());
    const componentLines = readFileSync(
      resolve(root, "app/components/WhereIsMyPlaceGame.tsx"),
      "utf8",
    ).split(/\r?\n/u).length;
    expect(componentLines).toBeLessThan(350);

    for (let index = 1; index <= WHERE_IS_MY_PLACE_CYCLES.length; index += 1) {
      const cycleLines = readFileSync(
        resolve(root, `content/games/where-is-my-place/cycle-${index}.ts`),
        "utf8",
      ).split(/\r?\n/u).length;
      expect(cycleLines).toBeLessThan(260);
    }
  });

  it("covers varied grammar topics instead of repeating one case pattern", () => {
    const topics = new Set(
      WHERE_IS_MY_PLACE_CYCLES.flatMap((cycle) =>
        cycle.challenges.map((challenge) => challenge.topic),
      ),
    );

    for (const requiredTopic of [
      "الفاعل",
      "المفعول به",
      "المبتدأ",
      "الخبر",
      "كان وأخواتها",
      "إن وأخواتها",
      "النعت",
      "التوكيد",
      "البدل",
      "العطف",
      "الفعل المضارع",
      "الفعل الماضي",
      "فعل الأمر",
      "الأفعال الخمسة",
      "الاسم المنقوص",
    ]) {
      expect(topics.has(requiredTopic), `الموضوع غير ممثل: ${requiredTopic}`).toBe(true);
    }
  });
});
