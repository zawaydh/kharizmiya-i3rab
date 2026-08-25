"use client";

import React from "react";
import type { ExerciseAnswer, ExerciseTree, Mode } from "../../../lib/exercise/model";
import type { RunnerState } from "../../../lib/exercise/runner";
import type { AnswerFeedbackState } from "../../../lib/exercise/answerSession";
import type { PedagogyNode } from "./ExercisePedagogyTypes";
import type { QuestionCardPhase } from "./useQuestionMotion";
import { ghostBtn } from "./ExercisePlayerStyles";
import { renderSentence, renderSmartText } from "./ExerciseTextViews";
import {
  dialogueQuestionNote,
  dialogueQuestionText,
} from "./ExercisePedagogy";
import { ExerciseChoiceAnswers } from "./ExerciseChoiceAnswers";
import { ExercisePracticeQuestion } from "./ExercisePracticeQuestion";
import type {
  DialogueBubble,
  DroppedChoice,
  PracticeWrongPanel,
} from "./ExerciseQuestionStageTypes";

export type {
  DialogueBubble,
  DroppedChoice,
  PracticeWrongPanel,
} from "./ExerciseQuestionStageTypes";

type Props = {
  activeCardRef: React.RefObject<HTMLDivElement>;
  isPracticeMode: boolean;
  dropOver: boolean;
  cardPhase: QuestionCardPhase;
  mode: Mode;
  state: RunnerState;
  tree: ExerciseTree;
  title: string;
  thinkingNode: PedagogyNode | null | undefined;
  questionMotionHeight: number | null;
  questionMotionRef: React.RefObject<HTMLDivElement>;
  dialogBubble: DialogueBubble | null;
  practiceWrongPanel: PracticeWrongPanel | null;
  practiceRetryReady: boolean;
  practiceDirectOptions: string[];
  currentChoiceAnswers: ExerciseAnswer[];
  feedback: AnswerFeedbackState | null;
  droppedChoice: DroppedChoice | null;
  successNudge: string | null;
  onDropOverChange: (value: boolean) => void;
  onLearnDrop: (answerId: string, label: string) => void;
  onDismissHint: () => void;
  onGlossary: (term: string) => void;
  onRetryPractice: () => void;
  onContinuePractice: (nextState: RunnerState) => void;
  onPickPracticeOption: (option: string, optionIndex: number) => void;
  onPickAnswer: (answer: ExerciseAnswer, event: React.MouseEvent<HTMLButtonElement>) => void;
  onOpenHint: () => void;
  canPreviousExample: boolean;
  onPreviousExample: () => void;
  onReset: () => void;
};

export function ExerciseQuestionStage({
  activeCardRef,
  isPracticeMode,
  dropOver,
  cardPhase,
  mode,
  state,
  tree,
  title,
  thinkingNode,
  questionMotionHeight,
  questionMotionRef,
  dialogBubble,
  practiceWrongPanel,
  practiceRetryReady,
  practiceDirectOptions,
  currentChoiceAnswers,
  feedback,
  successNudge,
  onDropOverChange,
  onLearnDrop,
  onDismissHint,
  onGlossary,
  onRetryPractice,
  onPickPracticeOption,
  onPickAnswer,
  onOpenHint,
  canPreviousExample,
  onPreviousExample,
  onReset,
}: Props) {
  return (
    <div
      ref={activeCardRef}
      className={`clean-question-block algorithm-step-card algorithm-active-card sequential-active-card ${isPracticeMode ? "practice-challenge-card" : ""} ${dropOver ? "is-drop-over" : ""} phase-${cardPhase}`}
      onDragOver={(event) => {
        if (mode === "learn") {
          event.preventDefault();
          onDropOverChange(true);
        }
      }}
      onDragLeave={() => onDropOverChange(false)}
      onDrop={(event) => {
        if (mode !== "learn") return;
        event.preventDefault();
        onDropOverChange(false);
        const answerId = event.dataTransfer.getData("text/answer-id");
        const label = event.dataTransfer.getData("text/plain");
        if (answerId) onLearnDrop(answerId, label);
      }}
    >
      <div className="sequential-sentence-line" aria-label="الجملة">
        <span className="dialogue-label">في الجملة:</span>
        <span className="dialogue-sentence-text">
          {renderSentence(state.currentSentence, state.currentTarget, onGlossary)}
        </span>
      </div>
      <div
        className="question-slide-viewport"
        style={questionMotionHeight ? { minHeight: `${questionMotionHeight}px` } : undefined}
      >
        <div
          key={state.currentNodeId}
          ref={questionMotionRef}
          className={`question-content-motion question-text-${cardPhase}`}
          aria-live="polite"
        >
          {dialogBubble?.tone === "hint" ? (
            <div className="inline-correction-hint" role="note" aria-live="polite">
              <span className="inline-correction-hint-title">
                {isPracticeMode && dialogBubble.hintLevel === 2
                  ? "لنوضّحها أكثر"
                  : "فكّر معي"}
              </span>
              <div className="inline-correction-hint-text">
                {renderSmartText(dialogBubble.text, onGlossary)}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                {isPracticeMode && dialogBubble.hintLevel === 1 ? (
                  <button
                    type="button"
                    className="inline-correction-hint-btn"
                    onClick={onOpenHint}
                  >
                    ما زلت لا أفهم
                  </button>
                ) : null}
                <button
                  type="button"
                  className="inline-correction-hint-btn"
                  onClick={onDismissHint}
                >
                  {isPracticeMode ? "سأحاول" : "فهمت"}
                </button>
              </div>
            </div>
          ) : (
            <>
              {!isPracticeMode ? (
                <>
                  <div className="exercise-question-title clean-question-title">
                    {renderSmartText(
                      dialogueQuestionText(thinkingNode, state.currentTarget, mode, state, tree, title),
                      onGlossary,
                    )}
                    <span className="question-choice-prompt"> اختر الإجابة الصحيحة مما يأتي:</span>
                  </div>
                  {dialogueQuestionNote(thinkingNode) ? (
                    <div className="dialogue-question-note">{dialogueQuestionNote(thinkingNode)}</div>
                  ) : null}
                </>
              ) : null}

              {isPracticeMode ? (
                <ExercisePracticeQuestion
                  target={state.currentTarget}
                  cardPhase={cardPhase}
                  wrongPanel={practiceWrongPanel}
                  retryReady={practiceRetryReady}
                  directOptions={practiceDirectOptions}
                  facts={state.facts as Record<string, unknown>}
                  successNudge={successNudge}
                  onGlossary={onGlossary}
                  onRetry={onRetryPractice}
                  onContinue={() => undefined}
                  onPickOption={onPickPracticeOption}
                  onOpenHint={onOpenHint}
                />
              ) : (
                <ExerciseChoiceAnswers
                  answers={currentChoiceAnswers}
                  cardPhase={cardPhase}
                  mode={mode}
                  tree={tree}
                  feedback={feedback}
                  onGlossary={onGlossary}
                  onPickAnswer={onPickAnswer}
                />
              )}

              {!isPracticeMode && !practiceWrongPanel ? (
                <div className="hint-after-options">
                  <button
                    type="button"
                    className="hint-after-options-btn"
                    onClick={onOpenHint}
                    disabled={cardPhase !== "idle"}
                  >
                    أحتاج تلميحًا
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      <div className="clean-question-nav">
        {canPreviousExample ? (
          <button type="button" onClick={onPreviousExample} style={ghostBtn}>المثال السابق</button>
        ) : null}
        <button type="button" onClick={onReset} style={ghostBtn}>إعادة المثال</button>
      </div>
    </div>
  );
}
