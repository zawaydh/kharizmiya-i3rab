import { describe, expect, it } from "vitest";
import { TOPICS, VISUAL_PATH_TOPIC_CODES } from "../lib/topics";
import {
  actionIsCorrect,
  buildConceptVisualMap,
  buildGenericVisualMap,
  buildKanaVisualMap,
  buildPresentVerbVisualMap,
  presentVerbResultText,
} from "../app/components/visual-path/model";
import { buildTreeLayout } from "../app/components/visual-path/graphLayout";
import { visualPathWrongHint } from "../app/components/visual-path/hints";
import { shuffledExampleOrder } from "../app/components/visual-path/exampleOrder";
import type { Example, PositionedNode, VisualMap, VisualNode } from "../app/components/visual-path/types";

function mapForTopic(code: string, tree: Parameters<typeof buildGenericVisualMap>[0], example: Example): VisualMap {
  const base = code === "present-verb"
    ? buildPresentVerbVisualMap(example)
    : code === "kana-wa-akhawatuha"
      ? buildKanaVisualMap(example)
      : buildGenericVisualMap(tree, example);
  return buildConceptVisualMap(base);
}

function optionStem(label: string) {
  return (label.split(/[：:]/u)[0] ?? "")
    .replace(/^(?:خبر|اسم|فعل)\s+/u, "")
    .trim();
}

function positioned(node: VisualNode): PositionedNode {
  return { ...node, x: 0, y: 0, w: 330, h: 126 };
}

describe("تدقيق المسارات البصرية", () => {
  it("يوصل كل مثال إلى نتيجة واحدة بخيارات واضحة وتلميحات مرتبطة بالخيار", () => {
    let checkedExamples = 0;
    let checkedDecisions = 0;
    let checkedWrongChoices = 0;

    for (const code of VISUAL_PATH_TOPIC_CODES) {
      const topic = TOPICS.find((item) => item.code === code);
      expect(topic, `الموضوع ${code} غير موجود`).toBeDefined();
      if (!topic) continue;

      for (const sourceExample of topic.examples) {
        const example = sourceExample as Example;
        const map = mapForTopic(code, topic.tree, example);
        const nodeById = new Map(map.nodes.map((node) => [node.id, node]));
        const visited = new Set<string>();
        let activeId = map.rootId;
        let reachedResult = false;

        while (activeId && !visited.has(activeId)) {
          visited.add(activeId);
          const node = nodeById.get(activeId);
          expect(node, `عقدة مفقودة في ${code}: ${activeId}`).toBeDefined();
          if (!node) break;

          if (node.kind === "outcome") {
            activeId = node.autoNextId ?? "";
            continue;
          }
          if (node.kind === "result") {
            reachedResult = true;
            break;
          }

          checkedDecisions += 1;
          const choices = node.choices ?? [];
          expect(choices.length, `سؤال بلا خيارات في ${code}: ${node.text}`).toBeGreaterThan(1);
          expect(node.text.length, `سؤال طويل في ${code}: ${node.text}`).toBeLessThanOrEqual(110);
          expect(node.text).not.toMatch(/^(?:حدّد|اختر)\b/u);
          expect(node.text).not.toContain("شيء «");
          expect(node.text).not.toContain("هنا «");
          expect(choices.some((choice) => /^(?:الخيار|إجابة)\s*\d+$/u.test(choice.label))).toBe(false);
          expect(choices.some((choice) => choice.label.includes("…"))).toBe(false);

          const uniqueStems = [...new Set(choices.map((choice) => optionStem(choice.label)).filter((label) => label.length >= 2))];
          const repeatedInsideQuestion = uniqueStems.filter((label) => node.text.includes(label));
          expect(
            repeatedInsideQuestion.length,
            `تكررت الخيارات داخل السؤال في ${code}: ${node.text}`,
          ).toBeLessThan(2);

          const correctChoices = choices.filter((choice) => actionIsCorrect(choice.action, example));
          expect(correctChoices, `عدد الإجابات الصحيحة غير سليم في ${code}: ${node.text}`).toHaveLength(1);

          for (const choice of choices) {
            if (choice === correctChoices[0]) continue;
            checkedWrongChoices += 1;
            const hint = visualPathWrongHint(positioned(node), choice, example);
            expect(hint.length, `تلميح قصير في ${code}: ${choice.label}`).toBeGreaterThanOrEqual(40);
            expect(hint.length, `تلميح طويل في ${code}: ${choice.label}`).toBeLessThanOrEqual(230);
            expect(hint).toContain(`اختيار «${choice.label}»`);
            expect(hint).not.toMatch(/راجع اختيار .+ في ضوء المثال/u);
            expect(hint).not.toContain("ابحث عن الدليل الذي يوافق السؤال الحالي");
            expect(hint).not.toContain("الإجابة الصحيحة");
            expect(hint).not.toContain("الجواب الصحيح");
            expect(hint).not.toContain("الصواب هو");
            expect(hint).not.toContain("مضارع الفعل مع «هو»،");
            expect(hint).not.toContain("أن يطابق معنى الخيار وصيغته ما يطلبه السؤال الحالي");
            expect(hint).not.toMatch(/(?:إذن|لذلك)\s+(?:هو|هي|الإجابة|الجواب|الصواب)/u);
            const correctLabel = correctChoices[0]?.label;
            if (correctLabel && !["نعم", "لا"].includes(correctLabel)) {
              expect(hint).not.toContain(`«${correctLabel}»`);
            }
            const originalNodeId = node.originalNode?.id ?? node.id;
            if (code === "imperative-verb" && ["imperative_connection", "imperative_attached_kind"].includes(originalNodeId)) {
              expect(hint).toContain("المخاطب المفرد «أنتَ»");
              expect(hint).not.toContain("المضارع مع «هو»");
            }
          }

          activeId = correctChoices[0]?.action.targetId ?? "";
        }

        expect(reachedResult, `لم يصل المثال إلى نتيجة في ${code}: ${example.sentence ?? example.target}`).toBe(true);
        checkedExamples += 1;
      }
    }

    expect(checkedExamples).toBeGreaterThanOrEqual(170);
    expect(checkedDecisions).toBeGreaterThanOrEqual(700);
    expect(checkedWrongChoices).toBeGreaterThanOrEqual(1400);
  });

  it("يصنّف صورة المضارع بخيارات مسمّاة من دون بوابة نعم أو لا", () => {
    const topic = TOPICS.find((item) => item.code === "present-verb");
    const example = topic?.examples.find((item) => item.facts?.shape === "five") as Example | undefined;
    expect(topic && example).toBeTruthy();
    if (!topic || !example) return;

    const map = buildPresentVerbVisualMap(example);
    const shapeNodes = map.nodes.filter((node) => node.id.endsWith(":shape"));
    expect(shapeNodes.length).toBeGreaterThan(0);
    for (const node of shapeNodes) {
      const labels = (node.choices ?? []).map((choice) => choice.label);
      expect(labels).toContain("صحيح الآخر");
      expect(labels).toContain("معتل الآخر");
      expect(labels).toContain("من الأفعال الخمسة");
      expect(labels).not.toContain("نعم");
      expect(labels).not.toContain("لا");
    }
  });

  it("يربط أسئلة الناسخين بخياراتها ولا يضع الكلمة في سؤال عن معنى الحرف", () => {
    const kana = TOPICS.find((item) => item.code === "kana-wa-akhawatuha");
    const kanaExample = kana?.examples.find((item) => String(item.target).includes("واو الجماعة")) as Example | undefined;
    expect(kana && kanaExample).toBeTruthy();
    if (!kana || !kanaExample) return;
    const kanaMap = mapForTopic(kana.code, kana.tree, kanaExample);
    expect(kanaMap.nodes.find((node) => node.id === "kana:role")?.text).toBe("ما الوظيفة الإعرابية لـ«واو الجماعة» في «انفكّوا»؟");
    expect(kanaMap.nodes.find((node) => node.id === "kana:ism:kind")?.text).toContain("ما طبيعة اسم الناسخ");

    const inna = TOPICS.find((item) => item.code === "inna-wa-akhawatuha");
    const innaExample = inna?.examples.find((item) => String(item.target).includes("القاضي")) as Example | undefined;
    expect(inna && innaExample).toBeTruthy();
    if (!inna || !innaExample) return;
    const innaMap = mapForTopic(inna.code, inna.tree, innaExample);
    const gate = innaMap.nodes.find((node) => node.originalNode?.id === "inna_kaffa_gate");
    const meaning = innaMap.nodes.find((node) => node.originalNode?.id === "inna_meaning");
    expect(gate?.text).toBe("هل اتصلت «ما» بـ«أنَّ» في الجملة؟");
    expect(meaning?.text).toBe("ما الذي يشمله معنى «أنَّ» في الجملة؟");
    expect(meaning?.text).not.toContain("القاضي");
  });

  it("يوسع نتيجة المضارع المبني حتى يظهر الإعراب والملاحظة وإعراب نون النسوة", () => {
    const topic = TOPICS.find((item) => item.code === "present-verb");
    expect(topic).toBeDefined();
    const example = topic?.examples[0] as Example | undefined;
    expect(example).toBeDefined();
    if (!topic || !example) return;

    const resultText = presentVerbResultText(example);
    expect(resultText).toContain("فعل مضارع مبني على السكون لاتصاله بنون النسوة، في محل رفع");
    expect(resultText).toContain("الفعل هو في محل رفع؛ لأنه لم يُسبق بناصب أو جازم");
    expect(resultText).toContain("نون النسوة: ضمير متصل مبني على الفتح في محل رفع فاعل");

    const map = mapForTopic("present-verb", topic.tree, example);
    const finalId = "present:result:niswa:raf";
    const mapWithFullResult: VisualMap = {
      ...map,
      nodes: map.nodes.map((node) => node.id === finalId ? { ...node, fullText: resultText } : node),
    };
    const finalNode = buildTreeLayout(mapWithFullResult).nodes.find((node) => node.id === finalId);
    expect(finalNode?.w).toBeGreaterThanOrEqual(336);
    expect(finalNode?.h).toBeGreaterThanOrEqual(180);
  });
});

describe("ترتيب الأمثلة العشوائي", () => {
  it("يعرض كل مثال مرة قبل إعادة الخلط", () => {
    const values = [0.91, 0.13, 0.72, 0.28, 0.55, 0.04];
    let cursor = 0;
    const order = shuffledExampleOrder(6, () => values[cursor++ % values.length] ?? 0.5);
    expect(order).toHaveLength(6);
    expect([...order].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(new Set(order).size).toBe(6);
  });

  it("يمنع تكرار آخر مثال مباشرة بعد دورة خلط جديدة", () => {
    const order = shuffledExampleOrder(4, () => 0, 1);
    expect(order[0]).not.toBe(1);
    expect([...order].sort((a, b) => a - b)).toEqual([0, 1, 2, 3]);
  });
});
