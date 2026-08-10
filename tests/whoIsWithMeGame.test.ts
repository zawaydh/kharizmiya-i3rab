import { describe, expect, it } from "vitest";
import {
  WHO_WITH_ME_CYCLES,
  WHO_WITH_ME_GROUPS,
  WHO_WITH_ME_GROUP_LABELS,
  cardsForRound,
  WHO_WITH_ME_GROUP_GUIDANCE,
} from "../content/games/who-is-with-me";

describe("من معي؟", () => {
  it("covers the five requested grammar groups in the intended order", () => {
    expect(WHO_WITH_ME_GROUPS).toEqual(["mansubat", "marfuat", "majrurat", "mabniyat", "majzumat"]);
    expect(WHO_WITH_ME_GROUP_LABELS).toEqual({
      mansubat: "المنصوبات",
      marfuat: "المرفوعات",
      majrurat: "المجرورات",
      mabniyat: "المبنيات",
      majzumat: "المجزومات",
    });
  });

  it("offers two cycles with a balanced bank of new examples", () => {
    expect(WHO_WITH_ME_CYCLES).toHaveLength(2);
    for (const cycle of WHO_WITH_ME_CYCLES) {
      expect(cycle.cards).toHaveLength(25);
      expect(new Set(cycle.cards.map((card) => card.id)).size).toBe(25);
      for (const group of WHO_WITH_ME_GROUPS) {
        expect(cycle.cards.filter((card) => card.group === group)).toHaveLength(5);
      }
    }
  });

  it("builds each round with all five targets plus distractors", () => {
    for (const cycle of WHO_WITH_ME_CYCLES) {
      for (const group of WHO_WITH_ME_GROUPS) {
        const cards = cardsForRound(cycle, group);
        expect(cards.filter((card) => card.group === group)).toHaveLength(5);
        expect(cards).toHaveLength(10);
        expect(cards.some((card) => card.group !== group)).toBe(true);
      }
    }
  });

  it("keeps every card grounded in a context and a reason", () => {
    for (const cycle of WHO_WITH_ME_CYCLES) {
      for (const card of cycle.cards) {
        expect(card.word.trim().length).toBeGreaterThan(0);
        expect(card.context.trim().length).toBeGreaterThan(4);
        expect(card.reason.trim().length).toBeGreaterThan(12);
        expect(WHO_WITH_ME_GROUPS).toContain(card.group);
      }
    }
  });
  it("keeps the five teams mutually exclusive by convention and explains the convention", () => {
    expect(WHO_WITH_ME_GROUP_GUIDANCE.mansubat).toContain("فريق المبنيات");
    expect(WHO_WITH_ME_GROUP_GUIDANCE.marfuat).toContain("فريق المبنيات");
    expect(WHO_WITH_ME_GROUP_GUIDANCE.majrurat).toContain("فريق المبنيات");
    expect(WHO_WITH_ME_GROUP_GUIDANCE.majzumat).toContain("فعل الأمر");
    expect(WHO_WITH_ME_GROUP_GUIDANCE.majzumat).toContain("نون النسوة");
  });

});
