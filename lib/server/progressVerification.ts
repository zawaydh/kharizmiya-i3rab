import { chooseAnswer, evaluateAnswer } from "../exercise/engine";
import type { ExerciseExample, ExerciseTree } from "../exercise/model";
import { isHintAnswerOption } from "../exercise/answerSession";
import { getExampleCoverageKeys, resolveCoverageKeys } from "../exercise/progress";
import { buildRunnerState, type RunnerState } from "../exercise/runner";
import {
  isSameQuizAnswer,
  localQuizExpectedLabel,
  safeFinalLabel,
  type QuizExampleLike,
} from "../exercise/quiz";
import type { ProgressSubmission } from "../progressEvents";
import { getTopicByCode, type TopicDefinition } from "../topics";

export type VerifiedStageProgress = {
  kind: "stage-result";
  topic: TopicDefinition;
  level: number;
  mode: "learn" | "practice";
  exampleId: string;
  resultNodeId: string;
  coverageKeys: string[];
};

export type VerifiedQuizProgress = {
  kind: "quiz-complete";
  topic: TopicDefinition;
  level: number;
  score: number;
  total: number;
  passed: boolean;
};

export type VerifiedProgress = VerifiedStageProgress | VerifiedQuizProgress;

export class ProgressVerificationError extends Error {
  constructor(public readonly code: string) {
    super(code);
    this.name = "ProgressVerificationError";
  }
}

function findExample(examples: ExerciseExample[], exampleId: string): ExerciseExample | null {
  return examples.find((example) => String(example.id) === exampleId) ?? null;
}

export function resolveExpectedResultNodeId(
  tree: ExerciseTree,
  example: ExerciseExample,
  mode: "learn" | "practice",
): string {
  let state: RunnerState = buildRunnerState(tree, mode, example);
  const visited = new Set<string>();
  const maxSteps = Object.keys(tree.nodes).length + 2;

  for (let step = 0; step < maxSteps; step += 1) {
    const node = tree.nodes[state.currentNodeId];
    if (!node) throw new ProgressVerificationError("RESULT_PATH_MISSING_NODE");
    if (node.type === "result") return node.id;
    if (visited.has(node.id)) throw new ProgressVerificationError("RESULT_PATH_CYCLE");
    visited.add(node.id);

    const correctAnswer = node.answers.find(
      (answer) => !isHintAnswerOption(answer) && evaluateAnswer(answer, state.facts),
    );
    if (!correctAnswer) throw new ProgressVerificationError("RESULT_PATH_NO_CORRECT_ANSWER");

    const transition = chooseAnswer({ state, tree, answerId: correctAnswer.id });
    if (transition.blocked || transition.nextState.currentNodeId === state.currentNodeId) {
      throw new ProgressVerificationError("RESULT_PATH_BLOCKED");
    }
    state = transition.nextState as RunnerState;
  }

  throw new ProgressVerificationError("RESULT_PATH_TOO_LONG");
}

function verifyStage(
  submission: Extract<ProgressSubmission, { kind: "stage-result" }>,
  topic: TopicDefinition,
): VerifiedStageProgress {
  const example = findExample(topic.examples, submission.exampleId);
  if (!example) throw new ProgressVerificationError("STAGE_EXAMPLE_NOT_FOUND");

  const expectedResultNodeId = resolveExpectedResultNodeId(topic.tree, example, submission.mode);
  if (submission.resultNodeId !== expectedResultNodeId) {
    throw new ProgressVerificationError("STAGE_RESULT_NOT_REACHED");
  }

  const coverageKeys = resolveCoverageKeys({
    tree: topic.tree,
    example,
    currentNodeId: expectedResultNodeId,
    requiredKeys: topic.coverageKeysOrdered,
  });
  if (!coverageKeys.length) throw new ProgressVerificationError("STAGE_COVERAGE_MISSING");

  return {
    kind: submission.kind,
    topic,
    level: submission.level,
    mode: submission.mode,
    exampleId: submission.exampleId,
    resultNodeId: expectedResultNodeId,
    coverageKeys,
  };
}

function verifyQuiz(
  submission: Extract<ProgressSubmission, { kind: "quiz-complete" }>,
  topic: TopicDefinition,
): VerifiedQuizProgress {
  if (submission.answers.length !== topic.quizCount) {
    throw new ProgressVerificationError("QUIZ_ANSWER_COUNT_INVALID");
  }

  const seen = new Set<string>();
  let score = 0;
  for (const evidence of submission.answers) {
    if (seen.has(evidence.exampleId)) {
      throw new ProgressVerificationError("QUIZ_EXAMPLE_DUPLICATED");
    }
    seen.add(evidence.exampleId);

    const example = findExample(topic.quizExamples, evidence.exampleId) as QuizExampleLike | null;
    if (!example) throw new ProgressVerificationError("QUIZ_EXAMPLE_NOT_FOUND");
    const expectedCoverage = getExampleCoverageKeys(example)[0] || "";
    const expectedLabel = localQuizExpectedLabel(
      safeFinalLabel(topic.tree, example, expectedCoverage),
      example,
    );
    if (isSameQuizAnswer(evidence.actualLabel, expectedLabel)) score += 1;
  }

  const total = submission.answers.length;
  return {
    kind: submission.kind,
    topic,
    level: submission.level,
    score,
    total,
    passed: total > 0 && score / total >= 0.8,
  };
}

export function verifyProgressSubmission(submission: ProgressSubmission): VerifiedProgress {
  const topic = getTopicByCode(submission.topicId);
  if (!topic || !topic.isReady) throw new ProgressVerificationError("TOPIC_NOT_FOUND");
  if (submission.level !== topic.level) throw new ProgressVerificationError("TOPIC_LEVEL_INVALID");
  return submission.kind === "stage-result"
    ? verifyStage(submission, topic)
    : verifyQuiz(submission, topic);
}
