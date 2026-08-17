"use client";

import React from "react";
import type { Dispatch, SetStateAction } from "react";
import type { ExerciseExample, ExerciseTree, Mode } from "../../../lib/exercise/model";
import { getExampleCoverageKeys } from "../../../lib/exercise/progress";
import type { RunnerState } from "../../../lib/exercise/runner";
import { safeFinalLabel, type QuizExampleLike } from "../../../lib/exercise/quiz";
import {
  buildPracticeCorrectRoute,
  buildPracticeDirectOptions,
  practiceExpectedLabelForExample,
} from "./ExercisePracticeFlow";
import type { QuestionCardPhase } from "./useQuestionMotion";
import type { ExerciseUiState } from "./useExerciseUiState";

type Args = {
  ui: ExerciseUiState;
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
  const expectedCoverage = isPracticeMode ? (getExampleCoverageKeys(example)[0] || "") : "";
  const expectedLabel = isPracticeMode
    ? practiceExpectedLabelForExample(
        safeFinalLabel(tree, example as QuizExampleLike | undefined, expectedCoverage),
        example,
      )
    : "";
  const context = React.useMemo(() => ({
    tree,
    mode,
    example,
    state,
    practiceExpectedLabel: expectedLabel,
  }), [example, expectedLabel, mode, state, tree]);

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
    const route = buildPracticeCorrectRoute(context);

    if (option !== expectedLabel) {
      ui.setFeedback({ wrongId: String(optionIndex) });
      ui.setPracticeWrongPanel({
        wrongLabel: option,
        steps: route.steps,
        nextState: route.nextState,
      });
      ui.setPracticeRetryReady(false);
      ui.setDialogBubble(null);
      ui.bringWorkAreaIntoView("center", 40);
      return;
    }

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
