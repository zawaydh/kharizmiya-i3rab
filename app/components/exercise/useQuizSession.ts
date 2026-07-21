"use client";

import React from "react";
import type { Mode, ExerciseTree } from "../../../lib/exercise/model";
import { getExampleCoverageKeys } from "../../../lib/exercise/progress";
import {
  buildCloseQuizOptions,
  buildRemedialQueueFromMistakes,
  createQuizAnswerRow,
  createRemedialAnswerRow,
  isSameQuizAnswer,
  localQuizExpectedLabel,
  safeFinalLabel,
  summarizeQuizAnswers,
  type QuizExampleLike,
  type QuizSummary,
} from "../../../lib/exercise/quiz";
import {
  createQuizSessionState,
  currentQuizExampleIndex,
  isQuizSessionFinished,
  quizSessionReducer,
} from "../../../lib/exercise/quizSession";

export type QuizFinalizeResult =
  | { status: "advanced" }
  | { status: "completed"; summary: QuizSummary }
  | { status: "save-failed"; summary: QuizSummary }
  | { status: "missing-selection" }
  | { status: "missing-example" }
  | { status: "locked" };

export type RemedialActionResult =
  | "checked"
  | "advanced"
  | "completed"
  | "missing-example"
  | "missing-selection";

type UseQuizSessionArgs = {
  mode: Mode;
  tree: ExerciseTree;
  examples: QuizExampleLike[];
  quizCount: number;
  topicId?: string;
  onComplete?: (summary: QuizSummary) => Promise<void> | void;
};

export function useQuizSession({ mode, tree, examples, quizCount, topicId, onComplete }: UseQuizSessionArgs) {
  const [state, dispatch] = React.useReducer(
    quizSessionReducer,
    undefined,
    () => createQuizSessionState(mode === "quiz" ? examples.length : 0, mode === "quiz" ? quizCount : 0)
  );
  const finalizeLockRef = React.useRef(false);

  React.useEffect(() => {
    if (mode !== "quiz") return;
    dispatch({ type: "reset", exampleCount: examples.length, quizCount });
    finalizeLockRef.current = false;
  }, [mode, examples, quizCount]);

  const currentIndex = currentQuizExampleIndex(state);
  const example = examples[currentIndex];
  const finished = mode === "quiz" && isQuizSessionFinished(state);
  const summary = React.useMemo(() => summarizeQuizAnswers(state.answers), [state.answers]);

  const options = React.useMemo(() => {
    if (mode !== "quiz" || !example) return [];
    return buildCloseQuizOptions(
      example,
      `${topicId || "topic"}-${example.id || currentIndex}-${state.cursor}`,
      state.cursor
    );
  }, [mode, example, currentIndex, state.cursor, topicId]);

  const remedialExample = state.remedialQueue[state.remedialCursor];
  const remedialOptions = React.useMemo(() => {
    if (!remedialExample) return [];
    return buildCloseQuizOptions(
      remedialExample,
      `${topicId || "topic"}-remedial-${remedialExample.id}-${state.remedialCursor}`,
      state.remedialCursor
    );
  }, [remedialExample, state.remedialCursor, topicId]);

  const remedialExpectedLabel = remedialExample
    ? localQuizExpectedLabel(
        safeFinalLabel(tree, remedialExample, getExampleCoverageKeys(remedialExample)[0] || ""),
        remedialExample
      )
    : "";
  const remedialIsCheckedCorrect = state.remedialChecked && isSameQuizAnswer(state.remedialSelected, remedialExpectedLabel);

  const finalizeCurrent = React.useCallback(async (): Promise<QuizFinalizeResult> => {
    if (finalizeLockRef.current) return { status: "locked" };
    if (!state.selected) return { status: "missing-selection" };
    if (!example) return { status: "missing-example" };

    finalizeLockRef.current = true;
    const expectedCoverage = getExampleCoverageKeys(example)[0] || "";
    const expectedLabel = localQuizExpectedLabel(safeFinalLabel(tree, example, expectedCoverage), example);
    const row = createQuizAnswerRow({ example, expectedCoverage, expectedLabel, actualLabel: state.selected });
    const nextAnswers = [...state.answers];
    nextAnswers[state.cursor] = row;
    const nextCursor = state.cursor + 1;
    dispatch({ type: "record-answer", row });

    try {
      if (nextCursor >= state.order.length) {
        const nextSummary = summarizeQuizAnswers(nextAnswers);
        try {
          await onComplete?.(nextSummary);
          return { status: "completed", summary: nextSummary };
        } catch {
          return { status: "save-failed", summary: nextSummary };
        }
      }
      return { status: "advanced" };
    } finally {
      window.setTimeout(() => {
        finalizeLockRef.current = false;
      }, 250);
    }
  }, [example, onComplete, state.answers, state.cursor, state.order.length, state.selected, tree]);

  const previousQuestion = React.useCallback(() => {
    dispatch({ type: "previous" });
    finalizeLockRef.current = false;
  }, []);

  const restart = React.useCallback(() => {
    dispatch({ type: "reset", exampleCount: examples.length, quizCount });
    finalizeLockRef.current = false;
  }, [examples.length, quizCount]);

  const startRemedial = React.useCallback(() => {
    const queue = buildRemedialQueueFromMistakes(summary.answeredRows, examples);
    if (!queue.length) return false;
    dispatch({ type: "start-remedial", queue });
    return true;
  }, [summary.answeredRows, examples]);

  const checkRemedial = React.useCallback((): RemedialActionResult => {
    if (!remedialExample) return "missing-example";
    if (!state.remedialSelected) return "missing-selection";
    const expectedCoverage = getExampleCoverageKeys(remedialExample)[0] || "";
    const expectedLabel = localQuizExpectedLabel(safeFinalLabel(tree, remedialExample, expectedCoverage), remedialExample);
    const row = createRemedialAnswerRow({
      example: remedialExample,
      expectedCoverage,
      expectedLabel,
      actualLabel: state.remedialSelected,
    });
    dispatch({ type: "record-remedial", row });
    return "checked";
  }, [remedialExample, state.remedialSelected, tree]);

  const nextRemedial = React.useCallback((): RemedialActionResult => {
    if (!state.remedialChecked) return checkRemedial();
    const completed = state.remedialCursor + 1 >= state.remedialQueue.length;
    dispatch({ type: "next-remedial" });
    return completed ? "completed" : "advanced";
  }, [checkRemedial, state.remedialChecked, state.remedialCursor, state.remedialQueue.length]);

  return {
    order: state.order,
    cursor: state.cursor,
    answers: state.answers,
    selected: state.selected,
    currentIndex,
    example,
    finished,
    summary,
    options,
    canDownloadCertificate: finished && summary.passed,
    canStartRemedial: finished && summary.wrongRows.length > 0,
    remedialActive: state.remedialActive,
    remedialQueue: state.remedialQueue,
    remedialCursor: state.remedialCursor,
    remedialSelected: state.remedialSelected,
    remedialChecked: state.remedialChecked,
    remedialResults: state.remedialResults,
    remedialExample,
    remedialOptions,
    remedialExpectedLabel,
    remedialIsCheckedCorrect,
    setSelected: (option: string | null) => dispatch({ type: "select", option }),
    setRemedialSelected: (option: string | null) => dispatch({ type: "select-remedial", option }),
    closeRemedial: () => dispatch({ type: "close-remedial" }),
    retryRemedial: () => dispatch({ type: "retry-remedial" }),
    finalizeCurrent,
    previousQuestion,
    restart,
    startRemedial,
    checkRemedial,
    nextRemedial,
  };
}
