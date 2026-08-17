import type { Dispatch, SetStateAction } from "react";
import type { ExerciseExample, ExerciseTree, Mode } from "../../../lib/exercise/model";
import { buildRunnerState, type RunnerState } from "../../../lib/exercise/runner";
import type { useStageSession } from "./useStageSession";
import type { ExerciseUiState } from "./useExerciseUiState";

type StageSession = ReturnType<typeof useStageSession>;

export function progressSaveFailureMessage(code?: string): string {
  if (code === "SERVER_PROGRESS_CONFIGURATION_MISSING") {
    return "تعذر حفظ التقدم لأن إعداد خادم Supabase غير مكتمل";
  }
  if (code === "NOT_AUTH" || code === "NOT_AUTHENTICATED") {
    return "انتهت جلسة الدخول؛ سجّل الدخول مجددًا ليُحفظ التقدم";
  }
  return "تعذر حفظ التقدم الآن";
}

type Args = {
  ui: ExerciseUiState;
  resetInteractiveUi: (options?: { clearToast?: boolean }) => void;
  stageSession: StageSession;
  currentIndex: number;
  example?: ExerciseExample;
  currentNodeId?: string;
  tree: ExerciseTree;
  mode: Mode;
  examples: ExerciseExample[];
  topicId?: string;
  nextHrefPrefix: string;
  navigate: (href: string) => void;
  setState: Dispatch<SetStateAction<RunnerState>>;
};

export function createExerciseNavigationActions({
  ui,
  resetInteractiveUi,
  stageSession,
  currentIndex,
  example,
  currentNodeId,
  tree,
  mode,
  examples,
  topicId,
  nextHrefPrefix,
  navigate,
  setState,
}: Args) {
  const releaseNavLock = () => {
    window.setTimeout(() => {
      ui.exampleNavLockRef.current = false;
    }, 350);
  };

  const resetStageVisualState = (nextIndex: number) => {
    resetInteractiveUi();
    setState(buildRunnerState(tree, mode, examples[nextIndex]));
    ui.bringWorkAreaIntoView("center", 120);
  };

  async function goNextExample() {
    if (ui.exampleNavLockRef.current) return;
    ui.exampleNavLockRef.current = true;
    const result = await stageSession.advance({
      currentIndex,
      example,
      currentNodeId,
    });

    if (result.saveFailed) {
      ui.setToast(progressSaveFailureMessage(result.saveError));
    } else if (result.missingCoverage) {
      ui.setToast("وصلتِ للنتيجة، لكن هذا المسار لا يملك مفتاح تغطية بعد");
    }

    if (result.status === "stage-complete") {
      if (nextHrefPrefix && topicId) {
        navigate(`${nextHrefPrefix}${topicId}`);
        return;
      }
      releaseNavLock();
      return;
    }

    if (result.status === "blocked") {
      ui.setToast("لم يبق مثال جديد يغطي مهارة غير منجزة");
      releaseNavLock();
      return;
    }

    if (result.status === "next") resetStageVisualState(result.nextIndex);
    releaseNavLock();
  }

  async function completeCurrentAndGoNextStage() {
    if (ui.exampleNavLockRef.current) return;
    ui.exampleNavLockRef.current = true;
    const result = await stageSession.advance({
      currentIndex,
      example,
      currentNodeId,
      forceComplete: true,
    });

    if (result.status === "save-failed") {
      ui.setToast(`تمت المرحلة، لكن ${progressSaveFailureMessage(result.saveError)}`);
      releaseNavLock();
      return;
    }
    if (result.missingCoverage) {
      ui.setToast("وصلتِ للنتيجة، لكن هذا المسار لا يملك مفتاح تغطية بعد");
    }
    if (result.status === "next") {
      resetStageVisualState(result.nextIndex);
      releaseNavLock();
      return;
    }
    if (nextHrefPrefix && topicId) {
      navigate(`${nextHrefPrefix}${topicId}`);
      return;
    }
    releaseNavLock();
  }

  function goPreviousExample() {
    if (ui.exampleNavLockRef.current || !stageSession.canPrevious) return;
    ui.exampleNavLockRef.current = true;
    const previousIndex = stageSession.previous();
    if (previousIndex !== null) resetStageVisualState(previousIndex);
    releaseNavLock();
  }

  function resetTraining() {
    stageSession.reset();
    resetInteractiveUi();
    setState(buildRunnerState(tree, mode, examples[0]));
    ui.bringWorkAreaIntoView("center", 120);
  }

  function resetCurrentExample() {
    if (ui.correctAdvanceTimerRef.current) {
      window.clearTimeout(ui.correctAdvanceTimerRef.current);
      ui.correctAdvanceTimerRef.current = null;
    }
    ui.answerAdvanceLockRef.current = false;
    ui.exampleNavLockRef.current = false;
    resetInteractiveUi({ clearToast: true });
    setState(buildRunnerState(tree, mode, example));
    ui.bringWorkAreaIntoView("center", 40);
  }

  return {
    goPreviousExample,
    goNextExample,
    completeCurrentAndGoNextStage,
    resetTraining,
    resetCurrentExample,
  };
}
