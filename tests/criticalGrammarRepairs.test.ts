import { describe, expect, it } from "vitest";
import { presentVerbTree } from "../content/trees/verb_present";
import { presentVerbExamples, presentVerbQuizExamples } from "../content/examples/verb_present.examples";
import { faelQuizExamples } from "../content/examples/fael.examples";
import { cleanInnaQuizExamples } from "../content/examples/clean_inna.examples";

function walkPresent(example: (typeof presentVerbExamples)[number]) {
  let nodeId = presentVerbTree.startNodeId;
  for (let step = 0; step < 20; step += 1) {
    const node = presentVerbTree.nodes[nodeId];
    expect(node, `العقدة ${nodeId} غير موجودة`).toBeTruthy();
    if (node.type === "result") return node;
    const correct = node.answers.filter((answer: any) => {
      if (!answer.eval) return answer.correct === true;
      return example.facts[answer.eval.fact] === answer.eval.equals;
    });
    expect(correct, `${example.id}/${nodeId}`).toHaveLength(1);
    nodeId = correct[0].next;
  }
  throw new Error(`لم يصل ${example.id} إلى نتيجة`);
}

describe("الإصلاحات النحوية الحرجة", () => {
  it("يبدأ مسار المضارع بفحص النونين دون تكرار نوع الكلمة والزمن", () => {
    expect(presentVerbTree.startNodeId).toBe("present_build_check");
    expect(presentVerbTree.nodes.present_word_kind).toBeUndefined();
    expect(presentVerbTree.nodes.present_tense).toBeUndefined();
  });

  it("يحدد محل المضارع المبني بحسب العامل السابق", () => {
    const builtExamples = presentVerbExamples.filter((example) => example.facts.buildConnection !== "none");
    expect(builtExamples.length).toBeGreaterThanOrEqual(6);

    for (const example of builtExamples) {
      const result = walkPresent(example);
      const expectedPosition = example.facts.tool === "nasb" ? "نصب" : example.facts.tool === "jazm" ? "جزم" : "رفع";
      expect(result.text).toContain(`في محل ${expectedPosition}`);
    }
  });

  it("يعرض اختبار المضارع المبني علامة البناء والمحل معًا", () => {
    const builtQuestions = presentVerbQuizExamples.filter((example) => example.facts.buildConnection !== "none");
    for (const example of builtQuestions) {
      const expectedPosition = example.facts.tool === "nasb" ? "نصب" : example.facts.tool === "jazm" ? "جزم" : "رفع";
      expect(example.correctI3rab).toContain("فعل مضارع مبني");
      expect(example.correctI3rab).toContain(`في محل ${expectedPosition}`);
      expect(example.options).toContain(example.correctI3rab);
    }
  });

  it("يسأل اختبار الفاعل المستتر عن الضمير لا عن إعراب الفعل", () => {
    const hiddenQuestions = faelQuizExamples.filter((example) => example.facts.roleKind === "hidden");
    expect(hiddenQuestions).toHaveLength(5);
    for (const example of hiddenQuestions) {
      expect(example.prompt).toContain("تقدير الفاعل المستتر");
      expect(example.correctI3rab).toMatch(/^الفاعل: ضمير مستتر/);
      expect(example.options).toContain(example.correctI3rab);
      expect(example.correctI3rab).not.toMatch(/^(يقرأ|تكتب|أقرأ|نساعد|اقرأ)/);
    }
  });

  it("يعرب المصدر المؤول في مثال هدفك خبرًا لإنَّ", () => {
    const example = cleanInnaQuizExamples.find((item) => item.id === "in-21");
    expect(example).toBeTruthy();
    expect(example?.correctI3rab).toBe("مصدر مؤول في محل رفع خبر إن");
    expect(example?.options).toContain("مصدر مؤول في محل رفع خبر إن");
    expect(example?.optionReasons?.["مصدر مؤول في محل رفع خبر إن"]).toContain("خبر إن");
  });
});
