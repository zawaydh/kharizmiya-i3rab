import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { MARKATI_ROUNDS } from "../content/games/markati";

const read = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");

describe("لعبة علامتي", () => {
  it("تغطي الرفع والنصب والجر ثم تحديًا مختلطًا", () => {
    expect(MARKATI_ROUNDS.map((round) => round.id)).toEqual(["raf3", "nasb", "jarr", "mixed"]);
    expect(MARKATI_ROUNDS.every((round) => round.challenges.length === 5)).toBe(true);
    const all = MARKATI_ROUNDS.flatMap((round) => round.challenges);
    expect(all).toHaveLength(20);
    expect(new Set(all.map((challenge) => challenge.id)).size).toBe(20);
    for (const challenge of all) {
      expect(challenge.sentence).toContain(challenge.target);
      expect(challenge.prompt.length).toBeGreaterThan(25);
      expect(challenge.finalI3rab.length).toBeGreaterThan(30);
      expect(challenge.choices.some((choice) => choice.id === challenge.correctChoiceId)).toBe(true);
      for (const choice of challenge.choices) {
        const threshold = choice.id === challenge.correctChoiceId ? 20 : 35;
        expect(choice.reason.length, `${challenge.id}/${choice.id}`).toBeGreaterThan(threshold);
      }
    }
  });

  it("يتضمن الحالات الخاصة بدل إبقائها أبوابًا مغلقة", () => {
    const text = JSON.stringify(MARKATI_ROUNDS);
    for (const term of ["مثنى", "جمع مذكر سالم", "جمع مؤنث سالم", "الأسماء الخمسة", "اسم مقصور", "اسم منقوص", "ممنوع من الصرف", "في محل جر"]) {
      expect(text).toContain(term);
    }
    expect(text).toContain("ذَهَبْتُ إِلَى الفَنِّيِّينَ");
    expect(text).toContain("أنا اسم مجرور، ونوعي جمع مذكر سالم؛ فما علامة جرّي؟");
  });

  it("ترتبط بمركز الألعاب وتعرض حركة النجاح", () => {
    const hub = read("app/games/page.tsx");
    const page = read("app/games/markati/page.tsx");
    const component = read("app/components/MarkatiGame.tsx");
    expect(hub).toContain('href="/games/markati"');
    expect(page).toContain("MarkatiGame");
    expect(component).toContain("game-theme-mark");
    expect(component).toContain("GameSuccessPop");
    expect(component).toContain("FINAL_I3RAB_MARKS");
    expect(component).toContain("concealedI3rab");
    expect(component).toContain("feedback?.correct === true");
  });
});
