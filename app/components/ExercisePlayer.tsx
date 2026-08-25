"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { saveProgress } from "../../lib/db";
import type {
  ExerciseExample,
  ExerciseTree,
  Mode,
} from "../../lib/exercise/model";
import type { RunnerState } from "../../lib/exercise/runner";
import { resolveCoverageKeys } from "../../lib/exercise/progress";
import { buildRunnerState } from "../../lib/exercise/runner";
import { isHintAnswerOption } from "../../lib/exercise/answerSession";
import { buildQuizProgressSubmission } from "../../lib/progressEvents";
import {
  coverageDisplayLabel,
  type QuizExampleLike,
  type QuizSummary,
} from "../../lib/exercise/quiz";
import { useQuizSession } from "./exercise/useQuizSession";
import { useStageSession } from "./exercise/useStageSession";
import { useQuestionMotion } from "./exercise/useQuestionMotion";
import { useExerciseUiState } from "./exercise/useExerciseUiState";
import { useExercisePracticeFlow } from "./exercise/useExercisePracticeFlow";
import {
  createExerciseNavigationActions,
  progressSaveFailureMessage,
} from "./exercise/ExerciseNavigationActions";
import { createExerciseQuestionActions } from "./exercise/ExerciseQuestionActions";
import {
  getStageMeta,
  stageLearningTitle,
} from "./exercise/exercisePresentationText";
import { renderSmartText } from "./exercise/ExerciseTextViews";
import { box, toastStyle } from "./exercise/ExercisePlayerStyles";
import {
  ClickSuccessPop,
  ExerciseHeroView,
  GlobalExerciseProgress,
  SmartGlossaryPopover,
  StageBottomNavigation,
  StageCompletionBanner,
} from "./exercise/ExerciseSharedViews";
import { ExerciseResultStage } from "./exercise/ExerciseResultStage";
import { ExerciseQuizStage } from "./exercise/ExerciseQuizStage";
import { createExerciseQuizActions } from "./exercise/ExerciseQuizActions";
import { ExerciseQuestionStage } from "./exercise/ExerciseQuestionStage";

import {
  buildStageProgressMeta,
  finalI3rabSubject,
  finalThinkingTextForDisplay,
  innaNasikhFinalIntro,
  isPresentBuiltResult,
  kanaNasikhFinalIntro,
  normalizeThinkingNode,
  presentBuiltClosureNote,
} from "./exercise/ExercisePedagogy";

type Props = {
  title: string;
  mode: Mode;
  tree: ExerciseTree;
  examples: ExerciseExample[];
  coverageKeysOrdered: string[];
  stepLabels?: Record<string, string>;
  quizCount?: number;
  topicId?: string;
  level?: number;
};

const STAGED_QUESTION_EXIT_MS = 180;
const STAGED_QUESTION_ENTER_MS = 320;

export default function ExercisePlayer({
  title,
  mode,
  tree,
  examples,
  coverageKeysOrdered,
  stepLabels,
  quizCount = 10,
  topicId,
  level = 2,
}: Props) {
  const stageMeta = getStageMeta(mode);
  const router = useRouter();

  const stageSession = useStageSession({
    mode,
    tree,
    examples,
    orderedKeys: coverageKeysOrdered,
    topicId,
    level,
    onSaveProgress: saveProgress,
  });

  const {
    covered,
    exampleIndex,
    metrics: stageMetrics,
    recordResult,
  } = stageSession;

  const persistQuizSummary = React.useCallback(async (summary: QuizSummary) => {
    if (!topicId) return;
    const submission = buildQuizProgressSubmission({
      topicId,
      level,
      rows: summary.answeredRows,
    });
    await saveProgress(submission);
  }, [level, topicId]);

  const quizSession = useQuizSession({
    mode,
    tree,
    examples: examples as QuizExampleLike[],
    quizCount,
    topicId,
    onComplete: persistQuizSummary,
  });

  const {
    order: quizOrder,
    cursor: quizCursor,
  } = quizSession;


  const currentIdx = mode === "quiz" ? quizSession.currentIndex : exampleIndex;
  const example = examples[currentIdx];
  const [state, setState] = React.useState<RunnerState>(() => buildRunnerState(tree, mode, example));
  const ui = useExerciseUiState({
    mode,
    exampleIndex,
    quizCursor,
    currentNodeId: state.currentNodeId,
  });
  const {
    activeCardRef,
    activeGlossary,
    bringWorkAreaIntoView,
    clickCheck,
    dialogBubble,
    dropOver,
    droppedChoice,
    feedback,
    followUpChoice,
    pendingStageComplete,
    practiceRetryReady,
    practiceWrongPanel,
    resetUiState,
    setActiveGlossary,
    setDialogBubble,
    setDropOver,
    setFeedback,
    setFollowUpChoice,
    setPendingStageComplete,
    setPracticeRetryReady,
    setPracticeWrongPanel,
    setToast,
    successNudge,
    toast,
    workAreaRef,
  } = ui;

  const autoSavedResultRef = React.useRef<string | null>(null);
  const selectedExampleMatchesRunner = example?.id !== undefined
    && state.currentExampleId !== undefined
    && String(example.id) === String(state.currentExampleId);

  if (mode !== "quiz" && example && !selectedExampleMatchesRunner) {
    // React discards this render and immediately retries with the selected example's runner state.
    // Keeping the synchronization in render avoids a stale frame and the set-state-in-effect lint error.
    setState(buildRunnerState(tree, mode, example));
  }

  const node = tree?.nodes?.[state.currentNodeId];

  React.useEffect(() => {
    if (
      mode === "quiz"
      || !selectedExampleMatchesRunner
      || node?.type !== "result"
      || example?.id === undefined
      || !topicId
    ) return undefined;
    const resultKey = `${mode}:${String(example.id)}:${node.id}`;
    if (autoSavedResultRef.current === resultKey) return undefined;
    autoSavedResultRef.current = resultKey;

    let active = true;
    void recordResult({
      currentIndex: currentIdx,
      example,
      currentNodeId: node.id,
    }).then((result) => {
      if (!active || !result.saveFailed) return;
      autoSavedResultRef.current = null;
      setToast(progressSaveFailureMessage(result.saveError));
    });

    return () => {
      active = false;
    };
  }, [
    currentIdx,
    example,
    mode,
    node,
    recordResult,
    selectedExampleMatchesRunner,
    setToast,
    topicId,
  ]);

  const thinkingNode = normalizeThinkingNode(node, state);
  const {
    cardPhase,
    setCardPhase,
    questionMotionRef,
    questionMotionHeight,
    beginUnifiedQuestionTransition,
    lockQuestionMotionHeight,
    resetQuestionMotion,
  } = useQuestionMotion({
    isQuestion: node?.type === "question",
    currentNodeId: state.currentNodeId,
    dialogBubble,
    practiceWrongPanel,
    practiceRetryReady,
    exitDurationMs: STAGED_QUESTION_EXIT_MS,
    enterDurationMs: STAGED_QUESTION_ENTER_MS,
  });
  const resetInteractiveUi = React.useCallback((options?: { clearToast?: boolean }) => {
    resetQuestionMotion();
    resetUiState(options);
  }, [resetQuestionMotion, resetUiState]);

  // التلميح والتعزيز يبقيان ظاهرين حتى ينقر الطالب لإغلاقهما.

  const {
    totalCount,
    doneCount,
    percent: coveredPercent,
    isDone,
    nextStageReady,
    nextCoverageKey: stepLabel,
  } = stageMetrics;
  const quizFinished = quizSession.finished;

  const stageMetaProgress = buildStageProgressMeta(tree, state);
  const currentStageStep = stageMetaProgress.current;
  const stageProgressPercent = stageMetaProgress.completedPercent;
  const currentChoiceAnswers = node?.type === "question"
    ? (thinkingNode?.answers || []).filter((answer) => !isHintAnswerOption(answer))
    : [];
  const resultCoverageKeys = node?.type === "result" ? resolveCoverageKeys({ tree, example, currentNodeId: state?.currentNodeId, requiredKeys: coverageKeysOrdered }) : [];
  const resultWouldCompleteStage = mode !== "quiz" && node?.type === "result" && (coverageKeysOrdered.length > 0 && coverageKeysOrdered.every((key) => covered[key] || resultCoverageKeys.includes(key)));
  // لا نعرض بطاقة انتهاء المرحلة قبل أن يرى الطالب نتيجة المثال الأخير.
  // تظهر نتيجة الإعراب أولًا، ثم ينقله الزر بعدها إلى المرحلة التالية.
  const currentFollowUp = (example as QuizExampleLike | undefined)?.followUp;
  const chosenFollowUp = currentFollowUp?.options?.find((option) => option.label === followUpChoice);
  const followUpIsCorrect = Boolean(chosenFollowUp?.correct);
  const canMoveAfterResult = !currentFollowUp || mode === "learn" || followUpIsCorrect;

  const navigation = createExerciseNavigationActions({
    ui,
    resetInteractiveUi,
    stageSession,
    currentIndex: currentIdx,
    example,
    currentNodeId: state.currentNodeId,
    tree,
    mode,
    examples,
    topicId,
    nextHrefPrefix: stageMeta.nextHrefPrefix,
    navigate: router.push,
    setState,
  });
  const questionActions = createExerciseQuestionActions({
    ui,
    topicId,
    node,
    thinkingNode,
    mode,
    tree,
    state,
    setState,
    cardPhase,
    setCardPhase,
    beginQuestionTransition: beginUnifiedQuestionTransition,
    lockQuestionMotionHeight,
    questionExitDurationMs: STAGED_QUESTION_EXIT_MS,
  });
  const practice = useExercisePracticeFlow({
    ui,
    topicId,
    tree,
    mode,
    example,
    state,
    setState,
    cardPhase,
    setCardPhase,
    beginQuestionTransition: beginUnifiedQuestionTransition,
  });

  const {
    finalizeQuizExample,
    previousQuizQuestion,
    restartQuiz,
    startRemedialTraining,
    goNextRemedial,
  } = createExerciseQuizActions({
    session: quizSession,
    notify: setToast,
    bringWorkAreaIntoView,
  });

  const stageTitle = stageLearningTitle(stageMeta.badge, title);
  return (
    <div className={`exercise-page-shell ${practice.isPracticeMode ? "practice-game-shell" : ""}`}>
      <ClickSuccessPop point={clickCheck} />
      <ExerciseHeroView
        stageTitle={stageTitle}
        mode={mode}
        doneCount={doneCount}
        totalCount={totalCount}
        nextStepLabel={stepLabels?.[stepLabel] || coverageDisplayLabel(stepLabel)}
        coveredPercent={coveredPercent}
        quizCursor={quizCursor}
        quizTotal={quizOrder.length}
        quizCount={quizCount}
        quizFinished={quizFinished}
      />


      {mode !== "quiz" && isDone && node?.type === "result" ? (
        <StageCompletionBanner mode={mode} onReset={navigation.resetTraining} />
      ) : null}

      {mode === "quiz" ? (
        <ExerciseQuizStage
          session={quizSession}
          topicId={topicId}
          level={level}
          onFinalize={finalizeQuizExample}
          onPrevious={previousQuizQuestion}
          onRestart={restartQuiz}
          onStartRemedial={startRemedialTraining}
          onNextRemedial={goNextRemedial}
        />
      ) : (
        <>
          <div className="thinking-layout start-style-layout">
          <section ref={workAreaRef} className="exercise-panel exercise-core-card clean-thinking-card sequential-stage-shell" style={box}>
            {node?.type === "question" ? (
              <div className="solution-step-progress solution-step-progress-sticky" aria-label="تقدم خطوات حل المثال">
                <div className="solution-step-progress-head">
                  <strong>الخطوة {currentStageStep}</strong>
                  <span>{stageProgressPercent}%</span>
                </div>
                <div className="solution-step-progress-track" aria-hidden="true">
                  <i style={{ width: `${Math.max(4, stageProgressPercent)}%` }} />
                </div>
              </div>
            ) : null}

            {node?.type === "question" ? (
              <ExerciseQuestionStage
                activeCardRef={activeCardRef}
                isPracticeMode={practice.isPracticeMode}
                dropOver={dropOver}
                cardPhase={cardPhase}
                mode={mode}
                state={state}
                tree={tree}
                title={title}
                thinkingNode={thinkingNode}
                questionMotionHeight={questionMotionHeight}
                questionMotionRef={questionMotionRef}
                dialogBubble={dialogBubble}
                practiceWrongPanel={practiceWrongPanel}
                practiceRetryReady={practiceRetryReady}
                practiceDirectOptions={practice.directOptions}
                currentChoiceAnswers={currentChoiceAnswers}
                feedback={feedback}
                droppedChoice={droppedChoice}
                successNudge={successNudge}
                onDropOverChange={setDropOver}
                onLearnDrop={questionActions.handleLearnDrop}
                onDismissHint={() => {
                  setDialogBubble(null);
                  bringWorkAreaIntoView("soft", 40);
                }}
                onGlossary={setActiveGlossary}
                onRetryPractice={() => {
                  setPracticeWrongPanel(null);
                  setFeedback(null);
                  setPracticeRetryReady(true);
                  bringWorkAreaIntoView("center", 40);
                }}
                onContinuePractice={practice.continueAfterCorrection}
                onPickPracticeOption={practice.pickDirectOption}
                onPickAnswer={questionActions.pickAnswer}
                onOpenHint={questionActions.openCurrentHint}
                canPreviousExample={stageSession.canPrevious}
                onPreviousExample={navigation.goPreviousExample}
                onReset={navigation.resetCurrentExample}
              />
            ) : node?.type === "result" ? (
              <ExerciseResultStage
                activeCardRef={activeCardRef}
                mode={mode}
                pendingStageComplete={pendingStageComplete}
                nextStageLabel={stageMeta.nextLabel}
                canMoveAfterResult={canMoveAfterResult}
                onCompleteStage={navigation.completeCurrentAndGoNextStage}
                isPracticeMode={practice.isPracticeMode}
                builtClosureNote={isPresentBuiltResult(tree, thinkingNode || undefined)
                  ? presentBuiltClosureNote(thinkingNode || undefined)
                  : undefined}
                finalSubject={finalI3rabSubject(tree, title)}
                currentTarget={state.currentTarget}
                finalText={finalThinkingTextForDisplay(thinkingNode, state)}
                kanaNote={String(tree?.startNodeId || "").includes("kana") ? kanaNasikhFinalIntro(state) : undefined}
                innaNote={String(tree?.startNodeId || "").includes("inna") ? innaNasikhFinalIntro(state) : undefined}
                renderText={(text) => renderSmartText(text, setActiveGlossary)}
                followUp={currentFollowUp}
                followUpChoice={followUpChoice}
                onPickFollowUp={setFollowUpChoice}
                resultWouldCompleteStage={resultWouldCompleteStage}
                onPrepareStageComplete={() => setPendingStageComplete(true)}
                canPreviousExample={stageSession.canPrevious}
                onPreviousExample={navigation.goPreviousExample}
                onNextExample={navigation.goNextExample}
              />
            ) : (
              <div>لا توجد عقدة للعرض</div>
            )}
          </section>

          </div>

          <StageBottomNavigation
            visible={isDone}
            ready={nextStageReady}
            label={stageMeta.nextLabel}
            onClick={() => {
              if (!nextStageReady) {
                setToast(mode === "learn" ? "أكمل التعلّم الموجّه أولًا" : "أكمل التدريب أولًا");
                return;
              }
              router.push(`${stageMeta.nextHrefPrefix}${topicId}`);
            }}
          />
        </>
      )}

      <GlobalExerciseProgress
        mode={mode}
        coveredDone={doneCount}
        coverageTotal={coverageKeysOrdered.length}
        quizCursor={quizCursor}
        quizTotal={quizOrder.length}
        quizCount={quizCount}
        quizFinished={quizFinished}
      />

      <SmartGlossaryPopover term={activeGlossary} onClose={() => setActiveGlossary(null)} />
      {toast ? <div style={toastStyle}>{toast}</div> : null}
    </div>
  );
}
