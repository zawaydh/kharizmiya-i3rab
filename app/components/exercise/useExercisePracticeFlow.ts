"use client";

import React from "react";
import type { Dispatch, SetStateAction } from "react";
import type { ExerciseExample, ExerciseTree, Mode } from "../../../lib/exercise/model";
import type { RunnerState } from "../../../lib/exercise/runner";
import { isSameQuizAnswer } from "../../../lib/exercise/quiz";
import {
  buildPracticeCorrectRoute,
  buildPracticeDirectOptions,
  practiceExpectedLabelFromRoute,
} from "./ExercisePracticeFlow";
import type { QuestionCardPhase } from "./useQuestionMotion";
import type { ExerciseUiState } from "./useExerciseUiState";

type Args = {
  ui: ExerciseUiState;
  topicId?: string;
  tree: ExerciseTree;
  mode: Mode;
  example?: ExerciseExample;
  state: RunnerState;
  setState: Dispatch<SetStateAction<RunnerState>>;
  cardPhase: QuestionCardPhase;
  setCardPhase: Dispatch<SetStateAction<QuestionCardPhase>>;
  beginQuestionTransition: (commit: () => void, onDone?: () => void) => void;
};

export function useExercisePracticeFlow({
  ui,
  topicId,
  tree,
  mode,
  example,
  state,
  setState,
  cardPhase,
  setCardPhase,
  beginQuestionTransition,
}: Args) {
  const nextLockRef = React.useRef(false);
  const isPracticeMode = mode === "practice";
  const expectedLabel = isPracticeMode
    ? practiceExpectedLabelFromRoute({ tree, mode, example })
    : "";
  const context = React.useMemo(() => ({
    tree,
    mode,
    example,
    state,
    practiceExpectedLabel: expectedLabel,
    topicId,
  }), [example, expectedLabel, mode, state, topicId, tree]);

  const directOptions = React.useMemo(() => {
    if (!isPracticeMode) return [];
    return buildPracticeDirectOptions(context);
  }, [context, isPracticeMode]);

  React.useEffect(() => {
    nextLockRef.current = false;
  }, [example?.id, mode, state.currentNodeId]);

  function continueAfterCorrection(nextState: RunnerState) {
    if (nextLockRef.current) return;
    nextLockRef.current = true;
    ui.setPracticeWrongPanel(null);
    ui.setPracticeRetryReady(false);
    ui.setDialogBubble(null);
    ui.setFeedback(null);
    ui.setSuccessNudge("واصل. في التدريب نثبت السرعة والدقة معًا.");
    setCardPhase("success");
    ui.scheduleCorrectAdvance(() => {
      beginQuestionTransition(() => setState(nextState), () => {
        nextLockRef.current = false;
      });
    });
  }

  function pickDirectOption(option: string, optionIndex: number) {
    if (cardPhase !== "idle" || nextLockRef.current) return;
    if (!isSameQuizAnswer(option, expectedLabel)) {
      const route = buildPracticeCorrectRoute({
        ...context,
        wrongOption: option,
      });
      ui.setFeedback({ wrongId: String(optionIndex) });
      ui.setPracticeWrongPanel({
        steps: route.steps,
        finalAnswer: route.finalAnswer,
        nextState: route.nextState,
      });
      ui.setPracticeRetryReady(false);
      ui.setDialogBubble(null);
      ui.bringWorkAreaIntoView("center", 40);
      return;
    }

    const route = buildPracticeCorrectRoute(context);
    nextLockRef.current = true;
    ui.setSuccessNudge(
      ui.practiceRetryReady
        ? "أحسنت. صححت المسار ووصلت إلى النتيجة بنفسك."
        : "إجابة دقيقة. طبّقت الخوارزمية بسرعة ووضوح.",
    );
    ui.setPracticeWrongPanel(null);
    setCardPhase("success");
    ui.scheduleCorrectAdvance(() => {
      beginQuestionTransition(() => {
        setState(route.nextState);
        ui.setPracticeRetryReady(false);
      }, () => {
        nextLockRef.current = false;
      });
    });
  }

  return {
    isPracticeMode,
    directOptions,
    continueAfterCorrection,
    pickDirectOption,
  };
}
