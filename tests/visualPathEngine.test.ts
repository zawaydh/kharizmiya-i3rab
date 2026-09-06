import { describe, expect, it } from "vitest";
import {
  buildConceptVisualMap,
  buildGenericVisualMap,
  buildPresentVerbVisualMap,
} from "../app/components/visual-path/model";
import { buildTreeLayout, edgePath } from "../app/components/visual-path/graphLayout";
import type { Example, ExerciseTree } from "../app/components/visual-path/types";

const presentExample: Example = {
  id: "present-built-nasb",
  sentence: "لن يكتبْنَ الدرسَ.",
  target: "يكتبْنَ",
  covers: ["present.binaa.niswa"],
  facts: {
    buildConnection: "niswa",
    tool: "nasb",
    shape: "built_niswa",
    finalI3rab: "فعل مضارع مبني على السكون لاتصاله بنون النسوة في محل نصب بلن.",
  },
};

describe("محرك الخرائط المفاهيمية التفاعلية", () => {
  it("يعرض فروع المضارع كلها ويبدأ بالبناء ثم العامل ثم صورة الفعل", () => {
    const map = buildConceptVisualMap(buildPresentVerbVisualMap(presentExample));
    expect(map.rootId).toBe("present:connection");
    expect(map.nodes.some((node) => node.id === "present:niswa:factor")).toBe(true);
    expect(map.nodes.some((node) => node.id === "present:tawkid:factor")).toBe(true);
    expect(map.nodes.some((node) => node.id === "present:factor")).toBe(true);
    for (const state of ["nasb", "jazm", "raf"]) {
      const shape = map.nodes.find((node) => node.id === `present:${state}:shape`);
      expect(shape).toBeDefined();
      expect(shape?.choices?.map((choice) => choice.label)).toEqual([
        "صحيح الآخر",
        "معتل الآخر",
        "من الأفعال الخمسة",
      ]);
    }

    const niswaFactor = map.nodes.find((node) => node.id === "present:niswa:factor");
    expect(niswaFactor?.text).toContain("هل سُبق الفعل");
    expect(niswaFactor?.choices?.map((choice) => choice.label)).toEqual(["ناصب", "جازم", "لا ناصب ولا جازم قبله"]);
    expect(niswaFactor?.choices?.every((choice) => choice.action.targetId?.includes("present:result:niswa"))).toBe(true);

    const connectionOutcome = map.nodes.find((node) => node.kind === "outcome" && node.text.includes("مبني على السكون"));
    expect(connectionOutcome?.autoNextId).toBe("present:niswa:factor");
  });

  it("يضع خط النهاية أسفل جميع العقد ويرسم الفرع من زر الاختيار بزوايا مستقيمة", () => {
    const map = buildConceptVisualMap(buildPresentVerbVisualMap(presentExample));
    const layout = buildTreeLayout(map);
    const lowestNode = Math.max(...layout.nodes.map((node) => node.y + node.h));
    expect(layout.terminalY).toBeGreaterThan(lowestNode);
    const decisionEdge = layout.edges.find((edge) => edge.from === "present:connection");
    const from = layout.nodes.find((node) => node.id === decisionEdge?.from);
    const to = layout.nodes.find((node) => node.id === decisionEdge?.to);
    expect(from).toBeTruthy();
    expect(to).toBeTruthy();
    const route = edgePath(from!, to!, decisionEdge);
    expect(route).toMatch(/^M /);
    expect(route).toContain(" V ");
    expect(route).toContain(" H ");
    expect(route).not.toMatch(/[CQAS]/);
  });

  it("يحافظ على مسميات الخيارات ويعرض جميع الفروع لا مسار الإجابة وحده", () => {
    const tree: ExerciseTree = {
      startNodeId: "shape",
      nodes: {
        shape: {
          id: "shape",
          type: "question",
          text: "ما صورة الفعل؟",
          answers: [
            { id: "sound", text: "صحيح الآخر", next: "sound-result", eval: { fact: "shape", equals: "sound" } },
            { id: "weak", text: "معتل الآخر", next: "weak-result", eval: { fact: "shape", equals: "weak" } },
          ],
        },
        "sound-result": { id: "sound-result", type: "result", text: "صحيح الآخر" },
        "weak-result": { id: "weak-result", type: "result", text: "معتل الآخر" },
      },
    };
    const example: Example = {
      id: "sound-example",
      sentence: "يكتبُ الطالبُ.",
      target: "يكتبُ",
      covers: [],
      facts: { shape: "sound" },
    };
    const map = buildGenericVisualMap(tree, example);
    const decision = map.nodes.find((node) => node.kind === "decision");
    expect(decision?.choices?.map((choice) => choice.label)).toEqual(["صحيح الآخر", "معتل الآخر"]);
    expect(map.nodes.filter((node) => node.kind === "result")).toHaveLength(2);
    expect(map.edges.filter((edge) => edge.from === decision?.id)).toHaveLength(2);
  });

  it("يضيف نتيجة مرحلية بين القرار والسؤال التالي في جميع المسارات", () => {
    const tree: ExerciseTree = {
      startNodeId: "role",
      nodes: {
        role: {
          id: "role",
          type: "question",
          text: "ما وظيفة الكلمة؟",
          answers: [
            { id: "subject", text: "فاعل", next: "form", eval: { fact: "role", equals: "subject" } },
            { id: "object", text: "مفعول به", next: "object-result", eval: { fact: "role", equals: "object" } },
          ],
        },
        form: {
          id: "form",
          type: "question",
          text: "ما نوع الفاعل؟",
          answers: [{ id: "noun", text: "اسم ظاهر", next: "subject-result", correct: true }],
        },
        "subject-result": { id: "subject-result", type: "result", text: "فاعل مرفوع" },
        "object-result": { id: "object-result", type: "result", text: "مفعول به منصوب" },
      },
    };
    const example: Example = { sentence: "كتبَ الطالبُ الدرسَ.", target: "الطالبُ", facts: { role: "subject" } };
    const map = buildConceptVisualMap(buildGenericVisualMap(tree, example));
    const outcome = map.nodes.find((node) => node.kind === "outcome" && node.text === "فاعل");
    expect(outcome).toBeTruthy();
    expect(outcome?.autoNextId).toContain("decision:form");
    expect(map.edges.some((edge) => edge.to === outcome?.id)).toBe(true);
    expect(map.edges.some((edge) => edge.from === outcome?.id && edge.to === outcome?.autoNextId)).toBe(true);
  });
  it("يعرض الخيارات الخاطئة ذات العودة إلى السؤال ولا يحول السؤال إلى إجابة جاهزة", () => {
    const tree: ExerciseTree = {
      startNodeId: "role",
      nodes: {
        role: {
          id: "role",
          type: "question",
          text: "ما الدور الذي أدته الكلمة؟",
          hint: "فرّق بين الخبر والنعت والفاعل من خلال المعنى.",
          answers: [
            { id: "a", text: "أتمت معنى الجملة", next: "kind", correct: true },
            { id: "b", text: "وصفت الاسم قبلها", next: "role", correct: false, hint: "النعت يصف اسمًا قبله ويطابقه." },
            { id: "c", text: "قامت بالفعل", next: "role", correct: false, hint: "الفاعل يكون مع فعل يدل على الحدث." },
          ],
        },
        kind: { id: "kind", type: "result", text: "خبر" },
      },
    };
    const map = buildGenericVisualMap(tree, { sentence: "الجندي شجاع.", target: "شجاع", facts: {} });
    const decision = map.nodes.find((node) => node.kind === "decision");
    expect(decision?.choices?.map((choice) => choice.label)).toEqual([
      "أتمت معنى الجملة",
      "وصفت الاسم قبلها",
      "قامت بالفعل",
    ]);
    expect(decision?.choices?.[1].action.hint).toContain("النعت");
    expect(map.edges.filter((edge) => edge.from === decision?.id)).toHaveLength(1);
  });

  it("لا يعرض مسميات مؤقتة مثل الخيار 1 والخيار 2 في أسئلة نعم ولا", () => {
    const tree: ExerciseTree = {
      startNodeId: "attached",
      nodes: {
        attached: {
          id: "attached",
          type: "question",
          text: "ما حال آخر الفعل؟",
          answers: [
            { id: "yes", text: "نعم", next: "with", correct: true, hint: "وجدت لاحقة متصلة بالفعل." },
            { id: "no", text: "لا", next: "without", correct: false, hint: "لم توجد لاحقة متصلة بالفعل." },
          ],
        },
        with: { id: "with", type: "result", text: "متصل" },
        without: { id: "without", type: "result", text: "غير متصل" },
      },
    };
    const map = buildGenericVisualMap(tree, { sentence: "قرأَ الطالبُ.", target: "قرأَ", facts: {} });
    const labels = map.nodes.find((node) => node.kind === "decision")?.choices?.map((choice) => choice.label) || [];
    expect(labels).not.toContain("الخيار 1");
    expect(labels).not.toContain("الخيار 2");
    expect(labels.every((label) => !/^الخيار\s+\d+$/u.test(label))).toBe(true);
  });

});
