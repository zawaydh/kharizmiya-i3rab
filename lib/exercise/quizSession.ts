import type { QuizAnswerRow, QuizExampleLike } from "./quiz";

export type QuizSessionState = {
  order: number[];
  cursor: number;
  answers: QuizAnswerRow[];
  selected: string | null;
  remedialActive: boolean;
  remedialQueue: QuizExampleLike[];
  remedialCursor: number;
  remedialSelected: string | null;
  remedialChecked: boolean;
  remedialResults: QuizAnswerRow[];
};

export type QuizSessionAction =
  | { type: "reset"; exampleCount: number; quizCount: number }
  | { type: "select"; option: string | null }
  | { type: "record-answer"; row: QuizAnswerRow }
  | { type: "previous" }
  | { type: "start-remedial"; queue: QuizExampleLike[] }
  | { type: "close-remedial" }
  | { type: "select-remedial"; option: string | null }
  | { type: "record-remedial"; row: QuizAnswerRow }
  | { type: "retry-remedial" }
  | { type: "next-remedial" };

export function buildQuizOrder(exampleCount: number, quizCount: number) {
  const safeExampleCount = Math.max(0, Math.floor(exampleCount));
  const safeQuizCount = Math.max(0, Math.floor(quizCount));
  const count = Math.min(safeExampleCount, safeQuizCount);
  return Array.from({ length: count }, (_, index) => index);
}

export function createQuizSessionState(exampleCount: number, quizCount: number): QuizSessionState {
  return {
    order: buildQuizOrder(exampleCount, quizCount),
    cursor: 0,
    answers: [],
    selected: null,
    remedialActive: false,
    remedialQueue: [],
    remedialCursor: 0,
    remedialSelected: null,
    remedialChecked: false,
    remedialResults: [],
  };
}

export function quizSessionReducer(state: QuizSessionState, action: QuizSessionAction): QuizSessionState {
  switch (action.type) {
    case "reset":
      return createQuizSessionState(action.exampleCount, action.quizCount);
    case "select":
      return { ...state, selected: action.option };
    case "record-answer": {
      const answers = [...state.answers];
      answers[state.cursor] = action.row;
      const cursor = state.cursor + 1;
      return { ...state, answers, cursor, selected: answers[cursor]?.actualLabel || null };
    }
    case "previous": {
      const cursor = Math.max(0, state.cursor - 1);
      return { ...state, cursor, selected: state.answers[cursor]?.actualLabel || null };
    }
    case "start-remedial":
      return {
        ...state,
        remedialActive: action.queue.length > 0,
        remedialQueue: action.queue,
        remedialCursor: 0,
        remedialSelected: null,
        remedialChecked: false,
        remedialResults: [],
      };
    case "close-remedial":
      return { ...state, remedialActive: false };
    case "select-remedial":
      return { ...state, remedialSelected: action.option };
    case "record-remedial": {
      const remedialResults = [...state.remedialResults];
      remedialResults[state.remedialCursor] = action.row;
      return { ...state, remedialResults, remedialChecked: true };
    }
    case "retry-remedial":
      return { ...state, remedialSelected: null, remedialChecked: false };
    case "next-remedial": {
      const nextCursor = state.remedialCursor + 1;
      if (nextCursor >= state.remedialQueue.length) return { ...state, remedialActive: false };
      return {
        ...state,
        remedialCursor: nextCursor,
        remedialSelected: null,
        remedialChecked: false,
      };
    }
    default:
      return state;
  }
}

export function currentQuizExampleIndex(state: QuizSessionState) {
  return state.order[state.cursor] ?? 0;
}

export function isQuizSessionFinished(state: QuizSessionState) {
  return state.order.length > 0 && state.cursor >= state.order.length;
}
