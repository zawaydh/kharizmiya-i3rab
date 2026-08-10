import { describe, expect, it } from "vitest";
import { evaluateAnswer, resolveAnswerNext } from "../lib/exercise/engine";
import { getTopicByCode } from "../lib/topics";
import { studentHintText } from "../app/components/exercise/ExerciseStudentHints";
import { finalThinkingTextForDisplay } from "../app/components/exercise/ExerciseNodePedagogy";

const CODES = ["hal", "tamyiz", "munada", "istithna", "la-nafiya", "naib-fael"] as const;

function walk(code: string, exampleIndex: number) {
  const topic = getTopicByCode(code);
  if (!topic) throw new Error(`TOPIC_MISSING:${code}`);
  const example = topic.examples[exampleIndex];
  if (!example) throw new Error(`EXAMPLE_MISSING:${code}:${exampleIndex}`);
  const facts = example.facts || {};
  let nodeId = topic.tree.startNodeId;
  const visited = new Set<string>();
  const wrongHints: string[] = [];

  for (let step = 0; step < 20; step += 1) {
    expect(visited.has(nodeId), `${code}:${example.id}:cycle:${nodeId}`).toBe(false);
    visited.add(nodeId);
    const node = topic.tree.nodes[nodeId];
    expect(node, `${code}:${example.id}:missing-node:${nodeId}`).toBeTruthy();
    if (!node) throw new Error("NODE_MISSING");

    if (node.type === "result") {
      const final = finalThinkingTextForDisplay(node, {
        facts,
        currentSentence: example.sentence,
        currentTarget: example.target,
      });
      return { nodeId, final, wrongHints, visited: [...visited] };
    }

    const correct = node.answers.filter((answer) => evaluateAnswer(answer, facts));
    expect(correct, `${code}:${example.id}:${nodeId}:correct-count`).toHaveLength(1);

    for (const wrong of node.answers.filter((answer) => !evaluateAnswer(answer, facts))) {
      const hint = studentHintText(
        node,
        wrong,
        { facts, currentSentence: example.sentence, currentTarget: example.target },
      );
      wrongHints.push(hint);
      expect(hint.length, `${code}:${example.id}:${nodeId}:${wrong.id}:hint-length`).toBeGreaterThan(35);
      expect(hint, `${code}:${example.id}:${nodeId}:${wrong.id}:generic-hint`).not.toContain("فكّر في السؤال الحالي فقط");
    }

    nodeId = resolveAnswerNext(correct[0]!, facts);
  }
  throw new Error(`PATH_TOO_LONG:${code}:${example.id}`);
}

describe("extended grammar topics", () => {
  it("registers every completed topic with matching coverage and guide-ready metadata", () => {
    for (const code of CODES) {
      const topic = getTopicByCode(code);
      expect(topic, code).toBeTruthy();
      expect(topic?.isReady, code).toBe(true);
      expect(topic?.coverageKeysOrdered.length, code).toBe(topic?.coverageCount);
      expect(topic?.examples.length, code).toBeGreaterThanOrEqual(topic?.coverageCount || 0);
      expect(topic?.quizExamples.length, code).toBeGreaterThanOrEqual(Math.min(topic?.quizCount || 0, topic?.examples.length || 0));
    }
  });

  it("gives every example exactly one path to a result with its full final i3rab", () => {
    for (const code of CODES) {
      const topic = getTopicByCode(code)!;
      topic.examples.forEach((example, index) => {
        const result = walk(code, index);
        const expected = String(example.facts?.finalI3rab || "").trim();
        expect(expected.length, `${code}:${example.id}:final-i3rab`).toBeGreaterThan(20);
        expect(result.final, `${code}:${example.id}:result`).toBe(expected);
      });
    }
  });

  it("keeps diagnostic hints active on every wrong branch reached by every example", () => {
    for (const code of CODES) {
      const topic = getTopicByCode(code)!;
      topic.examples.forEach((_example, index) => {
        const result = walk(code, index);
        expect(result.wrongHints.length, `${code}:${index}:wrong-hints`).toBeGreaterThan(0);
      });
    }
  });

  it("repeats the five-noun conditions wherever a new topic uses letter inflection", () => {
    for (const code of ["munada", "la-nafiya", "naib-fael"]) {
      const topic = getTopicByCode(code)!;
      const fiveExamples = topic.examples.filter((example) => example.facts?.fiveNoun === true);
      expect(fiveExamples.length, `${code}:five-noun-example`).toBeGreaterThan(0);
      for (const example of fiveExamples) {
        const final = String(example.facts?.finalI3rab || "");
        expect(final).toContain("مفرد");
        expect(final).toContain("مكبر");
        expect(final).toContain("مضاف");
        expect(final).toContain("غير ياء المتكلم");
      }
    }
  });
});
