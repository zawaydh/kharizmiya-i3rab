import { describe, expect, it } from "vitest";
import {
  buildI3rabDraft,
  buildStageProgressMeta,
  buildStageTrailItems,
  isPresentBuiltResult,
  presentBuiltClosureNote,
} from "../app/components/exercise/ExerciseStagePresentation";

describe("عرض تقدم المسار وصياغة الإعراب", () => {
  it("يبني مسودة موجزة دون تكرار نوع الفعل أو حالته", () => {
    const tree = {
      startNodeId: "present_tense",
      nodes: {
        present_tense: {
          id: "present_tense",
          type: "question",
          answers: [
            { id: "present", text: "فعل مضارع", next: "present_tool" },
          ],
        },
        present_tool: {
          id: "present_tool",
          type: "question",
          answers: [
            { id: "nasb", text: "سبقه حرف نصب", next: "present_result" },
          ],
        },
        present_result: { id: "present_result", type: "result", text: "منصوب" },
      },
    };
    const draft = buildI3rabDraft(tree, {
      answers: { present_tense: "present", present_tool: "nasb" },
    });
    expect(draft).toBe("فعل مضارع منصوب");
  });

  it("يحسب التقدم من المسار الصحيح ويتوقف عند النتيجة", () => {
    const tree = {
      startNodeId: "q1",
      nodes: {
        q1: {
          id: "q1",
          type: "question",
          answers: [
            { id: "a", text: "أ", next: "q2", eval: { fact: "kind", equals: "a" } },
            { id: "b", text: "ب", next: "r2", eval: { fact: "kind", equals: "b" } },
          ],
        },
        q2: {
          id: "q2",
          type: "question",
          answers: [{ id: "done", text: "تم", next: "r1", correct: true }],
        },
        r1: { id: "r1", type: "result", text: "النتيجة الأولى" },
        r2: { id: "r2", type: "result", text: "النتيجة الثانية" },
      },
    };
    expect(buildStageProgressMeta(tree, {
      answers: { q1: "a" },
      facts: { kind: "a" },
      currentNodeId: "q2",
    })).toEqual({
      answered: 1,
      remaining: 1,
      total: 2,
      current: 2,
      completedPercent: 50,
      atResult: false,
    });
    expect(buildStageProgressMeta(tree, {
      answers: { q1: "a", q2: "done" },
      facts: { kind: "a" },
      currentNodeId: "r1",
    }).atResult).toBe(true);
  });

  it("يبقي آخر ست نتائج فقط في أثر المسار", () => {
    const cards = Array.from({ length: 8 }, (_, index) => ({ result: `الخطوة ${index + 1}` }));
    expect(buildStageTrailItems(cards)).toEqual([
      "الخطوة 3",
      "الخطوة 4",
      "الخطوة 5",
      "الخطوة 6",
      "الخطوة 7",
      "الخطوة 8",
    ]);
  });

  it("يشرح المضارع المبني مع المحل الإعرابي ولا يوقف التفكير عند البناء", () => {
    const tree = { startNodeId: "present_connection", nodes: {} };
    const node = { id: "present_binaa_niswa", type: "result", text: "فعل مضارع مبني لاتصاله بنون النسوة" };
    expect(isPresentBuiltResult(tree, node)).toBe(true);
    expect(presentBuiltClosureNote(node)).toContain("العامل السابق");
    expect(presentBuiltClosureNote(node)).toContain("رفعًا أو نصبًا أو جزمًا");
  });
});
