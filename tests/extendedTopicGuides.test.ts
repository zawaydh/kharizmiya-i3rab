import { describe, expect, it } from "vitest";
import { getTopicGuide } from "../lib/topicGuides";

describe("extended topic guides", () => {
  it("keeps each completed topic aligned with the same reasoning used in training", () => {
    const required: Record<string, string[]> = {
      hal: ["كيف؟", "وهو", "حال مفرد"],
      tamyiz: ["إبهام", "ملفوظ", "ملحوظ"],
      munada: ["مفرد علم", "نكرة مقصودة", "شبيه بالمضاف"],
      istithna: ["تام", "مفرغ", "التام المنفي"],
      "la-nafiya": ["مفرد", "مضاف", "شبيه بالمضاف"],
      "naib-fael": ["مبني للمجهول", "بعد حذف الفاعل", "الأسماء الخمسة"],
    };
    for (const [code, phrases] of Object.entries(required)) {
      const guide = getTopicGuide(code);
      expect(guide, code).toBeTruthy();
      const text = JSON.stringify(guide);
      for (const phrase of phrases) expect(text, `${code}:${phrase}`).toContain(phrase);
    }
  });

  it("does not teach the dangerous shortcuts the new topics were designed to prevent", () => {
    const istithna = JSON.stringify(getTopicGuide("istithna"));
    expect(istithna).toContain("لا تقل: بعد «إلا» منصوب");
    const la = JSON.stringify(getTopicGuide("la-nafiya"));
    expect(la).toContain("«مفرد» في باب «لا»");
    const tamyiz = JSON.stringify(getTopicGuide("tamyiz"));
    expect(tamyiz).toContain("ليس شرطًا عامًا");
  });
});
