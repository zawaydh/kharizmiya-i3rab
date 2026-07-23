import { describe, expect, it } from "vitest";
import { evaluateAnswer, resolveAnswerNext } from "../lib/exercise/engine";
import { diagnosticFeedbackForChoice } from "../lib/exercise/diagnosticFeedback";
import type { ExerciseExample, ExerciseTree, QuestionNode } from "../lib/exercise/model";
import { firstWordTree } from "../content/trees/first_word";
import { attachedPronounsTree } from "../content/trees/attached_pronouns";
import { ismManqousTree } from "../content/trees/ism_manqous";
import { firstWordExamples, firstWordQuizExamples } from "../content/examples/first_word.examples";
import { attachedPronounsExamples, attachedPronounsQuizExamples } from "../content/examples/attached_pronouns.examples";
import { ismManqousExamples, ismManqousQuizExamples } from "../content/examples/ism_manqous.examples";

function auditWrongDiagnostics(tree: ExerciseTree, examples: ExerciseExample[]) {
  for (const example of examples) {
    const facts = example.facts || {};
    let nodeId = tree.startNodeId;
    const visited = new Set<string>();

    while (true) {
      expect(visited.has(nodeId), `cycle while auditing ${String(example.id)} at ${nodeId}`).toBe(false);
      visited.add(nodeId);
      const node = tree.nodes[nodeId];
      expect(node, `missing node ${nodeId}`).toBeTruthy();
      if (!node || node.type === "result") break;

      const question = node as QuestionNode;
      const correctAnswers = question.answers.filter((answer) => evaluateAnswer(answer, facts));
      expect(correctAnswers, `${String(example.id)}:${nodeId} should have one correct answer`).toHaveLength(1);

      const wrongMessages = question.answers
        .filter((answer) => !evaluateAnswer(answer, facts))
        .map((answer) => {
          const message = diagnosticFeedbackForChoice({
            nodeId,
            pickedText: answer.text,
            facts,
            target: String(example.target || ""),
            sentence: String(example.sentence || ""),
          });
          expect(message, `${String(example.id)}:${nodeId}:${answer.text} lacks specific feedback`).toBeTruthy();
          expect(String(message).length).toBeGreaterThan(55);
          expect(message).toContain(String(example.target || ""));
          return message;
        });

      expect(new Set(wrongMessages).size, `${String(example.id)}:${nodeId} repeats one diagnostic for different mistakes`).toBe(wrongMessages.length);
      nodeId = resolveAnswerNext(correctAnswers[0]!, facts);
    }
  }
}

function auditQuizReasons(questions: Array<Record<string, any>>) {
  for (const question of questions) {
    const wrongReasons = question.options
      .filter((option: string) => option !== question.correctI3rab)
      .map((option: string) => String(question.optionReasons?.[option] || ""));

    expect(wrongReasons.every((reason: string) => reason.length > 45), `${question.id} has a short/generic option reason`).toBe(true);
    expect(new Set(wrongReasons).size, `${question.id} repeats one reason for different distractors`).toBe(wrongReasons.length);
    for (const reason of wrongReasons) {
      expect(reason).not.toMatch(/^خطأ؛\s*(راجع|نوع الكلمة|أعد وضع)/);
    }
  }
}

describe("choice-specific diagnostic feedback", () => {
  it("diagnoses every reachable wrong choice in the first-word path", () => {
    auditWrongDiagnostics(firstWordTree as ExerciseTree, firstWordExamples);
  });

  it("diagnoses every reachable wrong choice in the pronoun path", () => {
    auditWrongDiagnostics(attachedPronounsTree as ExerciseTree, attachedPronounsExamples);
  });

  it("diagnoses every reachable wrong choice in the defective-noun path", () => {
    auditWrongDiagnostics(ismManqousTree as ExerciseTree, ismManqousExamples);
  });

  it("gives each first-word quiz distractor its own reason", () => {
    auditQuizReasons(firstWordQuizExamples);
  });

  it("gives each pronoun quiz distractor its own reason", () => {
    auditQuizReasons(attachedPronounsQuizExamples);
  });

  it("gives each defective-noun quiz distractor its own reason", () => {
    auditQuizReasons(ismManqousQuizExamples);
  });
});
