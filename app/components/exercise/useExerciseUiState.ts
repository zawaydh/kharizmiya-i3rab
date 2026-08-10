"use client";

import React from "react";
import type { Mode } from "../../../lib/exercise/model";
import type { AnswerFeedbackState } from "../../../lib/exercise/answerSession";
import type {
  DialogueBubble,
  DroppedChoice,
  PracticeWrongPanel,
} from "./ExerciseQuestionStage";

export type ClickCheckPoint = { x: number; y: number; id: number };

type UseExerciseUiStateArgs = {
  mode: Mode;
  exampleIndex: number;
  quizCursor: number;
  currentNodeId?: string;
};

type ResetUiOptions = {
  clearToast?: boolean;
};

export function useExerciseUiState({
  mode,
  exampleIndex,
  quizCursor,
  currentNodeId,
}: UseExerciseUiStateArgs) {
  const [feedback, setFeedback] = React.useState<AnswerFeedbackState | null>(null);
  const [toast, setToast] = React.useState("");
  const [followUpChoice, setFollowUpChoice] = React.useState<string | null>(null);
  const [activeGlossary, setActiveGlossary] = React.useState<string | null>(null);
  const [dialogBubble, setDialogBubble] = React.useState<DialogueBubble | null>(null);
  const [clickCheck, setClickCheck] = React.useState<ClickCheckPoint | null>(null);
  const [successNudge, setSuccessNudge] = React.useState<string | null>(null);
  const [pendingStageComplete, setPendingStageComplete] = React.useState(false);
  const [dropOver, setDropOver] = React.useState(false);
  const [droppedChoice, setDroppedChoice] = React.useState<DroppedChoice | null>(null);
  const [practiceRetryReady, setPracticeRetryReady] = React.useState(false);
  const [practiceWrongPanel, setPracticeWrongPanel] = React.useState<PracticeWrongPanel | null>(null);
  const workAreaRef = React.useRef<HTMLElement | null>(null);
  const activeCardRef = React.useRef<HTMLDivElement | null>(null);
  const correctAdvanceTimerRef = React.useRef<number | null>(null);
  const answerAdvanceLockRef = React.useRef(false);
  const exampleNavLockRef = React.useRef(false);

  const resetUiState = React.useCallback(({
    clearToast = false,
  }: ResetUiOptions = {}) => {
    setFeedback(null);
    setFollowUpChoice(null);
    setActiveGlossary(null);
    setDialogBubble(null);
    setClickCheck(null);
    setSuccessNudge(null);
    setPendingStageComplete(false);
    setDropOver(false);
    setDroppedChoice(null);
    setPracticeRetryReady(false);
    setPracticeWrongPanel(null);
    if (clearToast) setToast("");
  }, []);

  const bringWorkAreaIntoView = React.useCallback((
    placement: "soft" | "center" = "soft",
    delay = 80,
  ) => {
    window.setTimeout(() => {
      const target = activeCardRef.current || workAreaRef.current;
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const headerOffset = window.innerWidth <= 700 ? 78 : 92;
      const extra = placement === "center"
        ? Math.max(0, (window.innerHeight - rect.height) / 2 - headerOffset)
        : 10;
      const top = window.scrollY + rect.top - headerOffset - extra;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    }, delay);
  }, []);

  const scheduleCorrectAdvance = React.useCallback((action: () => void, delay = 220) => {
    if (correctAdvanceTimerRef.current !== null) {
      window.clearTimeout(correctAdvanceTimerRef.current);
    }
    correctAdvanceTimerRef.current = window.setTimeout(() => {
      correctAdvanceTimerRef.current = null;
      action();
    }, delay);
  }, []);

  React.useEffect(() => () => {
    if (correctAdvanceTimerRef.current) {
      window.clearTimeout(correctAdvanceTimerRef.current);
    }
  }, []);

  React.useEffect(() => {
    answerAdvanceLockRef.current = false;
    exampleNavLockRef.current = false;
  }, [mode, exampleIndex, quizCursor, currentNodeId]);

  React.useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 2500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return {
    feedback,
    setFeedback,
    toast,
    setToast,
    followUpChoice,
    setFollowUpChoice,
    activeGlossary,
    setActiveGlossary,
    dialogBubble,
    setDialogBubble,
    clickCheck,
    setClickCheck,
    successNudge,
    setSuccessNudge,
    pendingStageComplete,
    setPendingStageComplete,
    dropOver,
    setDropOver,
    droppedChoice,
    setDroppedChoice,
    practiceRetryReady,
    setPracticeRetryReady,
    practiceWrongPanel,
    setPracticeWrongPanel,
    workAreaRef,
    activeCardRef,
    correctAdvanceTimerRef,
    answerAdvanceLockRef,
    exampleNavLockRef,
    resetUiState,
    bringWorkAreaIntoView,
    scheduleCorrectAdvance,
  };
}

export type ExerciseUiState = ReturnType<typeof useExerciseUiState>;
