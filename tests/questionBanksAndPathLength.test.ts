import { describe, expect, test } from "vitest";
import { TOPICS, getTopicByCode } from "../lib/topics";
import { buildRunnerState } from "../lib/exercise/runner";
import { evaluateAnswer, resolveAnswerNext } from "../lib/exercise/engine";
import type { ExerciseExample, ExerciseTree, Mode, QuestionNode } from "../lib/exercise/model";

function topic(code: string) {
  const value = getTopicByCode(code);
  expect(value, `الموضوع ${code} غير موجود`).toBeTruthy();
  return value!;
}

function countCorrectPathQuestions(tree: ExerciseTree, example: ExerciseExample, mode: Mode) {
  const state = buildRunnerState(tree, mode, example);
  let nodeId = state.currentNodeId;
  let count = 0;
  const visited = new Set<string>();

  while (nodeId && !visited.has(nodeId)) {
    visited.add(nodeId);
    const node = tree.nodes[nodeId];
    expect(node, `العقدة ${nodeId} غير موجودة`).toBeTruthy();
    if (node.type === "result") return count;
    const question = node as QuestionNode;
    const correct = question.answers.filter((answer) => evaluateAnswer(answer, example.facts || {}));
    expect(correct, `${example.id}/${nodeId}: إجابة صحيحة واحدة`).toHaveLength(1);
    count += 1;
    nodeId = resolveAnswerNext(correct[0]!, example.facts || {});
  }

  throw new Error(`${example.id}: لم يصل المسار إلى نتيجة`);
}

function assertUniqueAndTargeted(code: string) {
  const value = topic(code);
  const sentences = value.examples.map((example: ExerciseExample) => String(example.sentence || ""));
  expect(new Set(sentences).size, `${code}: جمل مكررة`).toBe(sentences.length);
  for (const example of value.examples as ExerciseExample[]) {
    expect(String(example.sentence || "")).toContain(String(example.target || ""));
  }
}

describe("اتساع بنوك الأسئلة وتنوعها", () => {
  test("البنوك الصغيرة أصبحت كافية لإعادة الاختبار دون حفظ الأسئلة", () => {
    expect(topic("first-word-key").quizExamples.length).toBeGreaterThanOrEqual(12);
    expect(topic("attached-pronouns").quizExamples.length).toBeGreaterThanOrEqual(15);
    expect(topic("ism-manqous").quizExamples.length).toBeGreaterThanOrEqual(15);
    expect(topic("tawabi-atf").quizExamples.length).toBeGreaterThanOrEqual(9);
    expect(topic("tawabi-tawkid").quizExamples.length).toBeGreaterThanOrEqual(10);
    expect(topic("tawabi-badal").quizExamples.length).toBeGreaterThanOrEqual(11);
  });

  test("الجمل متنوعة والكلمة المستهدفة موجودة فعلًا", () => {
    for (const code of ["first-word-key", "attached-pronouns", "ism-manqous", "tawabi-atf", "tawabi-tawkid", "tawabi-badal"]) {
      assertUniqueAndTargeted(code);
    }
  });

  test("الضمائر والاسم المنقوص يقدمان أكثر من مثال لكل مهارة", () => {
    for (const code of ["attached-pronouns", "ism-manqous"]) {
      const value = topic(code);
      const counts = new Map<string, number>();
      for (const example of value.examples as ExerciseExample[]) {
        for (const key of example.covers || []) counts.set(key, (counts.get(key) || 0) + 1);
      }
      for (const key of value.coverageKeysOrdered) {
        expect(counts.get(key) || 0, `${code}/${key}: أمثلة غير كافية`).toBeGreaterThanOrEqual(3);
      }
    }
  });

  test("التوابع تنوع العلاقات الفرعية لا العلامات وحدها", () => {
    const badalKinds = new Map<string, number>();
    for (const example of topic("tawabi-badal").examples as ExerciseExample[]) {
      const kind = String(example.facts?.badalKind || "");
      badalKinds.set(kind, (badalKinds.get(kind) || 0) + 1);
    }
    expect(badalKinds.get("مطابق") || 0).toBeGreaterThanOrEqual(4);
    expect(badalKinds.get("بعض من كل") || 0).toBeGreaterThanOrEqual(2);
    expect(badalKinds.get("اشتمال") || 0).toBeGreaterThanOrEqual(3);

    const connectors = new Set(
      (topic("tawabi-atf").examples as ExerciseExample[]).map((example) => String(example.facts?.connector || ""))
    );
    expect(connectors.size).toBeGreaterThanOrEqual(4);
  });
});

describe("تقليل الخطوات المتكررة", () => {
  test("الضمائر والاسم المنقوص لا يعيدان سؤالين تمهيديين متشابهين", () => {
    for (const code of ["attached-pronouns", "ism-manqous"]) {
      const value = topic(code);
      const learnMax = Math.max(...value.examples.map((example: ExerciseExample) => countCorrectPathQuestions(value.tree, example, "learn")));
      const practiceMax = Math.max(...value.examples.map((example: ExerciseExample) => countCorrectPathQuestions(value.tree, example, "practice")));
      expect(learnMax, `${code}: مسار التعلم طويل`).toBeLessThanOrEqual(4);
      expect(practiceMax, `${code}: مسار التدريب طويل`).toBeLessThanOrEqual(2);
    }
  });

  test("فروع التوابع المنفصلة أقصر من التدريب المختلط", () => {
    const limits: Record<string, { learn: number; practice: number }> = {
      "tawabi-naat": { learn: 4, practice: 4 },
      "tawabi-atf": { learn: 4, practice: 4 },
      "tawabi-tawkid": { learn: 5, practice: 5 },
      "tawabi-badal": { learn: 4, practice: 4 },
    };

    for (const [code, limit] of Object.entries(limits)) {
      const value = topic(code);
      const learnMax = Math.max(...value.examples.map((example: ExerciseExample) => countCorrectPathQuestions(value.tree, example, "learn")));
      const practiceMax = Math.max(...value.examples.map((example: ExerciseExample) => countCorrectPathQuestions(value.tree, example, "practice")));
      expect(learnMax, `${code}: مسار التعلم أطول من المطلوب`).toBeLessThanOrEqual(limit.learn);
      expect(practiceMax, `${code}: مسار التدريب أطول من المطلوب`).toBeLessThanOrEqual(limit.practice);
    }

    const mixed = topic("tawabi");
    const mixedMax = Math.max(...mixed.examples.map((example: ExerciseExample) => countCorrectPathQuestions(mixed.tree, example, "learn")));
    expect(mixedMax, "مسار التوابع المختلط ما زال طويلًا").toBeLessThanOrEqual(8);
  });

  test("محاولة الاختبار تبقى قصيرة رغم اتساع البنك", () => {
    for (const value of TOPICS) {
      if (!value.quizExamples?.length) continue;
      expect(value.quizCount).toBeLessThanOrEqual(value.quizExamples.length);
      if (["attached-pronouns", "ism-manqous", "tawabi-atf", "tawabi-tawkid", "tawabi-badal"].includes(value.code)) {
        expect(value.quizCount).toBeLessThanOrEqual(8);
      }
    }
  });
});
