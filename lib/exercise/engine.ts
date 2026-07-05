// src/lib/exercise/engine.ts

import type { ExerciseState } from "./state";

export type Action =
  | { type: "flag.set"; key: string }
  | { type: "flag.unset"; key: string };

export type AnswerOption = {
  id: string; // مثل "a", "b"
  text: string;
  next: string; // id للعقدة التالية
  nextByFact?: { fact: string; map: Record<string, string>; default?: string };
  correct?: boolean; // مهم لـ learn/practice/quiz
  eval?: { fact: string; equals?: any; anyOf?: any[]; notEquals?: any };
  hint?: string;
  actions?: Action[];
};

export type Node =
  | {
      id: string;
      type: "question";
      text: string;
      hint?: string; // تلميح يظهر حسب mode
      answers: AnswerOption[];
      requires?: string[]; // flags يجب أن تكون true
    }
  | {
      id: string;
      type: "result";
      text: string;
      requires?: string[];
    };

export type ExerciseTree = {
  startNodeId: string;
  nodes: Record<string, Node>;
};

export function requirementsMet(
  requires: string[] | undefined,
  flags: Record<string, boolean>
): boolean {
  if (!requires || requires.length === 0) return true;
  return requires.every((k) => flags[k] === true);
}

export function applyActions(
  state: ExerciseState,
  actions: Action[] | undefined
): ExerciseState {
  if (!actions || actions.length === 0) return state;

  const nextFlags = { ...state.flags };
  for (const a of actions) {
    if (a.type === "flag.set") nextFlags[a.key] = true;
    if (a.type === "flag.unset") nextFlags[a.key] = false;
  }
  return { ...state, flags: nextFlags };
}

/**
 * الخطوة الأساسية عند اختيار إجابة:
 * - يسجل الإجابة
 * - يزيد attemptCount
 * - (حسب mode) يقرر هل يبقى في السؤال أو ينتقل
 * - يطبق actions
 * - يفحص requires للعقدة التالية لمنع القفز
 */
export function chooseAnswer(params: {
  state: ExerciseState;
  tree: ExerciseTree;
  answerId: string;
}): {
  nextState: ExerciseState;
  blocked?: boolean;
  feedback?: {
    isCorrect: boolean;
    showHint: boolean;
    revealCorrectness: boolean;
  };
} {
  const { state, tree, answerId } = params;
  const node = tree.nodes[state.currentNodeId];

  if (!node || node.type !== "question") {
    return { nextState: state, blocked: true };
  }

  const picked = node.answers.find((a) => a.id === answerId);
  if (!picked) return { nextState: state, blocked: true };

  const attemptCount = {
    ...state.attemptCount,
    [node.id]: (state.attemptCount[node.id] ?? 0) + 1,
  };

  const answers = { ...state.answers, [node.id]: picked.id };
  const factValue = picked.eval ? state.facts?.[picked.eval.fact] : undefined;
  const isCorrect = picked.eval
    ? Array.isArray(picked.eval.anyOf)
      ? picked.eval.anyOf.includes(factValue)
      : Object.prototype.hasOwnProperty.call(picked.eval, "notEquals")
        ? factValue !== picked.eval.notEquals
        : factValue === picked.eval.equals
    : picked.correct === true;

  // تحديث correctNodeIds (مفيد لـ quiz summary)
  const correctNodeIds = { ...state.correctNodeIds };
  if (state.mode === "quiz") {
    correctNodeIds[node.id] = isCorrect;
  }

  let nextState: ExerciseState = {
    ...state,
    attemptCount,
    answers,
    correctNodeIds,
  };

  // Learn: بعد أول محاولة نكشف الصحيح/الخطأ + التلميح، لكن نسمح بالمتابعة
  // Practice: إذا خطأ -> ابق في نفس السؤال
  // Quiz: لا تلميح أثناء الحل، نسمح بالمتابعة دائماً
  const revealCorrectness = state.mode !== "quiz";
  const showHint =
    state.mode === "learn"
      ? true // بعد المحاولة (بما فيها الأولى) نسمح بإظهار hint + تلوين
      : state.mode === "practice"
        ? true // يظهر بعد المحاولة
        : false;

  if (state.mode === "practice" && !isCorrect) {
    // يظل في نفس العقدة، لكن نطبق actions؟ عادة لا نطبق actions على الخطأ
    // هنا: لا نطبق actions إلا لو كانت الإجابة صحيحة
    return {
      nextState,
      feedback: { isCorrect, showHint, revealCorrectness },
    };
  }

  // إذا صحيحة (أو learn/quiz حيث نسمح بالمتابعة) نطبق actions
  if (isCorrect) {
    nextState = applyActions(nextState, picked.actions);
  }

  // فحص requires للعقدة التالية، مع دعم توجيه بسيط حسب معلومة المثال عند الحاجة
  const dynamicNext = picked.nextByFact
    ? picked.nextByFact.map?.[String(state.facts?.[picked.nextByFact.fact])] || picked.nextByFact.default || picked.next
    : picked.next;
  const nextNode = tree.nodes[dynamicNext];
  if (!nextNode) return { nextState, blocked: true };

  const ok = requirementsMet(nextNode.requires, nextState.flags);
  if (!ok) {
    return {
      nextState,
      blocked: true,
      feedback: { isCorrect, showHint, revealCorrectness },
    };
  }

  // الانتقال
  nextState = { ...nextState, currentNodeId: nextNode.id };

  return {
    nextState,
    feedback: { isCorrect, showHint, revealCorrectness },
  };
}