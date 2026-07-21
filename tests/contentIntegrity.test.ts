import { describe, expect, test } from "vitest";
import { TOPICS } from "../lib/topics";

type Facts = Record<string, unknown>;
type Flags = Record<string, boolean>;
type Answer = {
  id: string;
  next: string;
  correct?: boolean;
  eval?: { fact: string; equals?: unknown; anyOf?: unknown[]; notEquals?: unknown };
  nextByFact?: { fact: string; map: Record<string, string>; default?: string };
  actions?: Array<{ type: "flag.set" | "flag.unset"; key: string }>;
};
type QuestionNode = {
  id: string;
  type: "question";
  answers: Answer[];
  requires?: string[];
};
type ResultNode = { id: string; type: "result"; requires?: string[] };
type TreeNode = QuestionNode | ResultNode;

type TopicLike = {
  code: string;
  tree: { startNodeId: string; nodes: Record<string, TreeNode> };
  examples: Array<{
    id: string;
    sentence: string;
    facts: Facts;
    covers?: string[];
  }>;
  coverageKeysOrdered?: string[];
  quizExamples?: Array<{
    id: string;
    sentence: string;
    options: string[];
    correctI3rab: string;
    covers?: string[];
  }>;
  quizCoverageKeysOrdered?: string[];
};

function isCorrect(answer: Answer, facts: Facts) {
  if (!answer.eval) return answer.correct === true;

  const factValue = facts[answer.eval.fact];
  if (Array.isArray(answer.eval.anyOf)) {
    return answer.eval.anyOf.includes(factValue);
  }
  if (Object.prototype.hasOwnProperty.call(answer.eval, "notEquals")) {
    return factValue !== answer.eval.notEquals;
  }
  return factValue === answer.eval.equals;
}

function resolveNext(answer: Answer, facts: Facts) {
  if (!answer.nextByFact) return answer.next;
  return (
    answer.nextByFact.map[String(facts[answer.nextByFact.fact])] ||
    answer.nextByFact.default ||
    answer.next
  );
}

function applyActions(flags: Flags, answer: Answer) {
  const next = { ...flags };
  for (const action of answer.actions || []) {
    next[action.key] = action.type === "flag.set";
  }
  return next;
}

function requirementsMet(requires: string[] | undefined, flags: Flags) {
  return !requires?.length || requires.every((key) => flags[key] === true);
}

function walkExample(topic: TopicLike, example: TopicLike["examples"][number]) {
  const visited: string[] = [];
  const flags: Flags = {};
  let currentId = topic.tree.startNodeId;
  let currentFlags = flags;

  for (let step = 0; step < 100; step += 1) {
    const node = topic.tree.nodes[currentId];
    expect(node, `${topic.code}/${example.id}: العقدة ${currentId} غير موجودة`).toBeTruthy();
    expect(
      requirementsMet(node.requires, currentFlags),
      `${topic.code}/${example.id}: متطلبات العقدة ${currentId} غير متحققة`
    ).toBe(true);

    visited.push(currentId);
    if (node.type === "result") {
      return { resultId: node.id, visited };
    }

    const correctAnswers = node.answers.filter((answer) =>
      isCorrect(answer, example.facts)
    );
    expect(
      correctAnswers,
      `${topic.code}/${example.id}/${node.id}: يجب وجود إجابة صحيحة واحدة فقط`
    ).toHaveLength(1);

    const correctAnswer = correctAnswers[0];
    currentFlags = applyActions(currentFlags, correctAnswer);
    currentId = resolveNext(correctAnswer, example.facts);
  }

  throw new Error(
    `${topic.code}/${example.id}: لم يصل المثال إلى نتيجة خلال 100 خطوة؛ المسار: ${visited.join(" -> ")}`
  );
}

const readyTopics = (TOPICS as TopicLike[]).filter(
  (topic) => topic.tree && Array.isArray(topic.examples)
);

describe("سلامة أشجار المحتوى", () => {
  test("كل انتقال يشير إلى عقدة موجودة", () => {
    for (const topic of readyTopics) {
      expect(
        topic.tree.nodes[topic.tree.startNodeId],
        `${topic.code}: عقدة البداية غير موجودة`
      ).toBeTruthy();

      for (const [nodeId, node] of Object.entries(topic.tree.nodes)) {
        expect(node.id, `${topic.code}/${nodeId}: معرّف العقدة لا يطابق مفتاحها`).toBe(
          nodeId
        );
        if (node.type !== "question") continue;

        for (const answer of node.answers) {
          const targets = [
            answer.next,
            ...Object.values(answer.nextByFact?.map || {}),
            ...(answer.nextByFact?.default ? [answer.nextByFact.default] : []),
          ];
          for (const target of targets) {
            expect(
              topic.tree.nodes[target],
              `${topic.code}/${nodeId}/${answer.id}: الانتقال إلى ${target} مفقود`
            ).toBeTruthy();
          }
        }
      }
    }
  });

  test("لكل مثال إجابة صحيحة واحدة في كل خطوة ويصل إلى نتيجة", () => {
    for (const topic of readyTopics) {
      for (const example of topic.examples) {
        const outcome = walkExample(topic, example);
        expect(outcome.resultId).toBeTruthy();
      }
    }
  });

  test("كل مفتاح تغطية يمكن الوصول إليه عبر مثال ناجح", () => {
    for (const topic of readyTopics) {
      const reachableCoverage = new Set<string>();
      for (const example of topic.examples) {
        walkExample(topic, example);
        for (const key of example.covers || []) reachableCoverage.add(key);
      }

      for (const key of topic.coverageKeysOrdered || []) {
        expect(
          reachableCoverage.has(key),
          `${topic.code}: مفتاح التغطية ${key} لا يغطيه أي مثال ناجح`
        ).toBe(true);
      }

      const declared = new Set(topic.coverageKeysOrdered || []);
      for (const key of Array.from(reachableCoverage)) {
        expect(
          declared.has(key),
          `${topic.code}: المثال يستخدم مفتاح تغطية غير معلن ${key}`
        ).toBe(true);
      }
    }
  });
});

describe("سلامة أسئلة الاختبار النهائي", () => {
  test("كل سؤال يحتوي الإجابة الصحيحة مرة واحدة فقط", () => {
    for (const topic of readyTopics) {
      for (const question of topic.quizExamples || []) {
        expect(
          Array.isArray(question.options),
          `${topic.code}/${question.id}: الخيارات غير موجودة`
        ).toBe(true);
        expect(
          question.options.length,
          `${topic.code}/${question.id}: لا توجد خيارات كافية`
        ).toBeGreaterThanOrEqual(2);
        expect(
          new Set(question.options).size,
          `${topic.code}/${question.id}: توجد خيارات مكررة`
        ).toBe(question.options.length);
        expect(
          question.options.filter((option) => option === question.correctI3rab),
          `${topic.code}/${question.id}: الإجابة الصحيحة غير موجودة مرة واحدة`
        ).toHaveLength(1);
      }
    }
  });

  test("كل مفتاح تغطية مستخدم في سؤال اختبار معلن في الموضوع", () => {
    for (const topic of readyTopics) {
      const declared = new Set(topic.quizCoverageKeysOrdered || []);
      for (const question of topic.quizExamples || []) {
        for (const key of question.covers || []) {
          expect(
            declared.has(key),
            `${topic.code}/${question.id}: مفتاح اختبار غير معلن ${key}`
          ).toBe(true);
        }
      }
    }
  });
});
