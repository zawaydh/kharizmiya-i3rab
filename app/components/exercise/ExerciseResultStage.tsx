"use client";

import React from "react";
import type { Mode } from "../../../lib/exercise/model";
import type { FollowUp } from "../../../lib/exercise/quiz";
import { answerBtn, primaryNavBtn } from "./ExercisePlayerStyles";

type ExerciseResultStageProps = {
  activeCardRef: React.RefObject<HTMLDivElement>;
  mode: Mode;
  pendingStageComplete: boolean;
  nextStageLabel?: string;
  canMoveAfterResult: boolean;
  onCompleteStage: () => void;
  isPracticeMode: boolean;
  builtClosureNote?: string;
  finalSubject: string;
  currentTarget?: string;
  finalText: string;
  kanaNote?: string;
  innaNote?: string;
  renderText: (text: string) => React.ReactNode;
  followUp?: FollowUp;
  followUpChoice: string | null;
  onPickFollowUp: (label: string) => void;
  resultWouldCompleteStage: boolean;
  onPrepareStageComplete: () => void;
  onNextExample: () => void;
};

export function ExerciseResultStage({
  activeCardRef,
  mode,
  pendingStageComplete,
  nextStageLabel,
  canMoveAfterResult,
  onCompleteStage,
  isPracticeMode,
  builtClosureNote,
  finalSubject,
  currentTarget,
  finalText,
  kanaNote,
  innaNote,
  renderText,
  followUp,
  followUpChoice,
  onPickFollowUp,
  resultWouldCompleteStage,
  onPrepareStageComplete,
  onNextExample,
}: ExerciseResultStageProps) {
  const chosenFollowUp = followUp?.options.find((option) => option.label === followUpChoice);

  if (pendingStageComplete) {
    return (
      <div className="stage-focus-next-panel stage-complete-only" aria-live="polite">
        <strong>{mode === "learn" ? "اكتمل التعلّم الموجّه" : "اكتمل التدريب"}</strong>
        <span>
          {mode === "learn"
            ? "أنهيت مهارات هذا المستوى، والزر التالي ينقلك إلى التدريب."
            : "أنهيت التدريب، والزر التالي ينقلك إلى الاختبار النهائي."}
        </span>
        <button
          type="button"
          onClick={onCompleteStage}
          className="next-example-glow stage-focus-next-btn"
          style={{ ...primaryNavBtn, cursor: canMoveAfterResult ? "pointer" : "not-allowed" }}
          disabled={!canMoveAfterResult}
        >
          {nextStageLabel || "انتقل إلى المرحلة التالية"}
        </button>
      </div>
    );
  }

  return (
    <>
      <div ref={activeCardRef} className="clean-result-block algorithm-step-card algorithm-final-card pro-final-focus">
        <div className="final-achievement-mark" aria-hidden="true">{isPracticeMode ? "🏆" : "✓"}</div>
        <div className="clean-final-label">{isPracticeMode ? "اكتملت جولة التدريب" : "اكتمل المسار"}</div>
        {builtClosureNote ? <div className="built-closure-note" role="note">{builtClosureNote}</div> : null}
        <div className="exercise-result-text clean-result-text final-glow-result final-single-i3rab final-structured-i3rab" style={{ whiteSpace: "pre-line" }}>
          <strong className="final-result-heading">
            {finalText.startsWith("لم تكن الكلمة من المفاعيل الخمسة")
              ? "افحص بقية المنصوبات"
              : <>إعراب {finalSubject} {renderText(currentTarget || "")}:</>}
          </strong>
          <span className="final-i3rab-line">{renderText(finalText)}</span>
          {kanaNote ? (
            <span className="final-i3rab-line final-nasikh-note">{renderText(`انتبه:\n${kanaNote}`)}</span>
          ) : null}
          {innaNote ? (
            <span className="final-i3rab-line final-nasikh-note">{renderText(innaNote)}</span>
          ) : null}
        </div>
      </div>

      {followUp ? (
        <div className="exercise-followup-box clean-followup-box">
          <div className="clean-followup-title">تثبيت سريع بعد الإعراب: {followUp.question}</div>
          {followUp.options.map((option) => {
            const picked = followUpChoice === option.label;
            const className = picked ? (option.correct ? "is-correct" : "is-wrong") : "";
            return (
              <button
                type="button"
                key={option.label}
                onClick={() => onPickFollowUp(option.label)}
                className={`exercise-answer-btn clean-answer-btn ${className}`}
                style={answerBtn}
              >
                {option.label}
              </button>
            );
          })}
          {followUpChoice ? (
            <div className={`thinking-bubble ${chosenFollowUp?.correct ? "success" : "hint"}`}>
              {chosenFollowUp?.correct ? "إجابة صحيحة: " : "راجع الإجابة: "}
              {chosenFollowUp?.feedback || (chosenFollowUp?.correct ? "صحيح." : "راجع العلاقة النحوية في الجملة.")}
            </div>
          ) : null}
        </div>
      ) : null}

      <button
        type="button"
        onClick={resultWouldCompleteStage ? onPrepareStageComplete : onNextExample}
        className="next-example-glow"
        style={{ ...primaryNavBtn, cursor: canMoveAfterResult ? "pointer" : "not-allowed" }}
        disabled={!canMoveAfterResult}
      >
        {resultWouldCompleteStage ? "انتقل إلى المرحلة التالية" : "انتقل إلى المثال التالي"}
      </button>
    </>
  );
}
