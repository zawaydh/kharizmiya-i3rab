"use client";

import React from "react";

export type QuestionCardPhase = "idle" | "success" | "leaving" | "entering";

type UseQuestionMotionArgs = {
  isQuestion: boolean;
  currentNodeId?: string;
  dialogBubble: unknown;
  practiceWrongPanel: unknown;
  practiceRetryReady: boolean;
  exitDurationMs: number;
  enterDurationMs: number;
};

function measuredQuestionHeight(element: HTMLDivElement | null): number {
  if (!element) return 0;
  return Math.ceil(Math.max(element.scrollHeight, element.getBoundingClientRect().height));
}

export function useQuestionMotion({
  isQuestion,
  currentNodeId,
  dialogBubble,
  practiceWrongPanel,
  practiceRetryReady,
  exitDurationMs,
  enterDurationMs,
}: UseQuestionMotionArgs) {
  const questionMotionRef = React.useRef<HTMLDivElement | null>(null);
  const transitionTimerRef = React.useRef<number | null>(null);
  const [questionMotionHeight, setQuestionMotionHeight] = React.useState<number | null>(null);
  const [cardPhase, setCardPhase] = React.useState<QuestionCardPhase>("idle");

  const clearTransitionTimer = React.useCallback(() => {
    if (transitionTimerRef.current !== null) {
      window.clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
  }, []);

  React.useEffect(() => clearTransitionTimer, [clearTransitionTimer]);

  const lockQuestionMotionHeight = React.useCallback(() => {
    const height = measuredQuestionHeight(questionMotionRef.current);
    if (height > 0) {
      setQuestionMotionHeight((current) => Math.max(current || 0, height));
    }
  }, []);

  const beginUnifiedQuestionTransition = React.useCallback((
    commit: () => void,
    onDone?: () => void,
  ) => {
    clearTransitionTimer();
    lockQuestionMotionHeight();
    setCardPhase("leaving");

    transitionTimerRef.current = window.setTimeout(() => {
      commit();
      setCardPhase("entering");

      transitionTimerRef.current = window.setTimeout(() => {
        setCardPhase("idle");
        transitionTimerRef.current = null;
        onDone?.();
      }, enterDurationMs);
    }, exitDurationMs);
  }, [clearTransitionTimer, enterDurationMs, exitDurationMs, lockQuestionMotionHeight]);

  const resetQuestionMotion = React.useCallback(() => {
    clearTransitionTimer();
    setQuestionMotionHeight(null);
    setCardPhase("idle");
  }, [clearTransitionTimer]);

  React.useLayoutEffect(() => {
    if (!isQuestion) return undefined;

    const element = questionMotionRef.current;
    if (!element) return undefined;

    const keepLargestStageHeight = () => {
      const nextHeight = measuredQuestionHeight(element);
      if (nextHeight > 0) {
        setQuestionMotionHeight((current) => Math.max(current || 0, nextHeight));
      }
    };

    keepLargestStageHeight();
    if (typeof ResizeObserver === "undefined") return undefined;

    const observer = new ResizeObserver(keepLargestStageHeight);
    observer.observe(element);
    return () => observer.disconnect();
  }, [
    currentNodeId,
    dialogBubble,
    isQuestion,
      practiceRetryReady,
    practiceWrongPanel,
  ]);

  return {
    cardPhase,
    setCardPhase,
    questionMotionRef,
    questionMotionHeight: isQuestion ? questionMotionHeight : null,
    beginUnifiedQuestionTransition,
    lockQuestionMotionHeight,
    resetQuestionMotion,
  };
}
