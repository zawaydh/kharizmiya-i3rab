import type {
  ExerciseAction,
  ExerciseAnswer,
  ExerciseTree,
  Facts,
  Flags,
} from "./model";
import type { ExerciseState } from "./state";

export type AnswerFeedback = {
  isCorrect: boolean;
  showHint: boolean;
  revealCorrectness: boolean;
};

export function requirementsMet(
  requires: string[] | undefined,
  flags: Flags
): boolean {
  if (!requires || requires.length === 0) return true;
  return requires.every((key) => flags[key] === true);
}

export function evaluateAnswer(answer: ExerciseAnswer, facts: Facts): boolean {
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

export function resolveAnswerNext(answer: ExerciseAnswer, facts: Facts): string {
  if (!answer.nextByFact) return answer.next;
  return (
    answer.nextByFact.map[String(facts[answer.nextByFact.fact])] ||
    answer.nextByFact.default ||
    answer.next
  );
}

export function applyActionsToFlags(
  flags: Flags,
  actions: ExerciseAction[] | undefined
): Flags {
  if (!actions?.length) return flags;
  const nextFlags = { ...flags };
  for (const action of actions) {
    nextFlags[action.key] = action.type === "flag.set";
  }
  return nextFlags;
}

export function applyActions(
  state: ExerciseState,
  actions: ExerciseAction[] | undefined
): ExerciseState {
  const nextFlags = applyActionsToFlags(state.flags, actions);
  return nextFlags === state.flags ? state : { ...state, flags: nextFlags };
}

/**
 * ينفذ اختيارًا واحدًا مع الحفاظ على اختلاف سلوك التعلّم والتدريب والاختبار.
 */
export function chooseAnswer(params: {
  state: ExerciseState;
  tree: ExerciseTree;
  answerId: string;
}): {
  nextState: ExerciseState;
  blocked?: boolean;
  feedback?: AnswerFeedback;
} {
  const { state, tree, answerId } = params;
  const node = tree.nodes[state.currentNodeId];

  if (!node || node.type !== "question") {
    return { nextState: state, blocked: true };
  }

  const picked = node.answers.find((answer) => answer.id === answerId);
  if (!picked) return { nextState: state, blocked: true };

  const attemptCount = {
    ...state.attemptCount,
    [node.id]: (state.attemptCount[node.id] ?? 0) + 1,
  };
  const answers = { ...state.answers, [node.id]: picked.id };
  const isCorrect = evaluateAnswer(picked, state.facts);

  const correctNodeIds = { ...state.correctNodeIds };
  if (state.mode === "quiz") correctNodeIds[node.id] = isCorrect;

  let nextState: ExerciseState = {
    ...state,
    attemptCount,
    answers,
    correctNodeIds,
  };

  const feedback: AnswerFeedback = {
    isCorrect,
    revealCorrectness: state.mode !== "quiz",
    showHint: state.mode !== "quiz",
  };

  if (state.mode === "practice" && !isCorrect) {
    return { nextState, feedback };
  }

  if (isCorrect) nextState = applyActions(nextState, picked.actions);

  const nextNodeId = resolveAnswerNext(picked, state.facts);
  const nextNode = tree.nodes[nextNodeId];
  if (!nextNode) return { nextState, blocked: true };

  if (!requirementsMet(nextNode.requires, nextState.flags)) {
    return { nextState, blocked: true, feedback };
  }

  return {
    nextState: { ...nextState, currentNodeId: nextNode.id },
    feedback,
  };
}
