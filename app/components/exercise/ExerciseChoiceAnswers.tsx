"use client";

import React from "react";
import type { ExerciseAnswer, ExerciseTree, Mode } from "../../../lib/exercise/model";
import type { AnswerFeedbackState } from "../../../lib/exercise/answerSession";
import { toStudentArabicOption } from "../../../lib/studentOptionText";
import type { QuestionCardPhase } from "./useQuestionMotion";
import { renderSmartText } from "./ExerciseTextViews";
import { SMART_GLOSSARY } from "./ExerciseSharedViews";

type Props = {
  answers: ExerciseAnswer[];
  cardPhase: QuestionCardPhase;
  mode: Mode;
  tree: ExerciseTree;
  feedback: AnswerFeedbackState | null;
  onGlossary: (term: string) => void;
  onPickAnswer: (answer: ExerciseAnswer, event: React.MouseEvent<HTMLButtonElement>) => void;
};

export function ExerciseChoiceAnswers({
  answers,
  cardPhase,
  mode,
  tree,
  feedback,
  onGlossary,
  onPickAnswer,
}: Props) {
  const visibleTerms = React.useMemo(() => {
    const optionText = answers.map((answer) => toStudentArabicOption(answer.text)).join(" ");
    return Object.keys(SMART_GLOSSARY)
      .filter((term) => optionText.includes(term))
      .sort((a, b) => b.length - a.length)
      .slice(0, 6);
  }, [answers]);

  return (
    <>
      <div className="clean-answer-grid stage-one-draggable-grid">
      {answers.map((answer) => {
        const answerClass = [
          "exercise-answer-btn",
          "clean-answer-btn",
          feedback?.wrongId === answer.id ? "is-wrong" : "",
        ].filter(Boolean).join(" ");
        return (
          <button
            type="button"
            key={answer.id}
            disabled={cardPhase !== "idle"}
            draggable={mode === "learn" && cardPhase === "idle"}
            onDragStart={(event) => {
              if (mode !== "learn") return;
              event.dataTransfer.setData("text/answer-id", answer.id);
              event.dataTransfer.setData("text/plain", String(answer.text || ""));
            }}
            onClick={(event) => onPickAnswer(answer, event)}
            className={answerClass}
          >
            <span className="answer-main-text">
              {String(tree.startNodeId || "").includes("past")
                ? toStudentArabicOption(answer.text)
                : renderSmartText(toStudentArabicOption(answer.text), onGlossary, { interactiveTerms: false })}
            </span>
          </button>
        );
      })}
      </div>

      {visibleTerms.length ? (
        <div className="exercise-option-glossary" aria-label="شرح المصطلحات في الخيارات" style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginTop: 10, fontSize: 14 }}>
          <span style={{ fontWeight: 800 }}>مصطلح غير واضح؟</span>
          {visibleTerms.map((term) => (
            <button key={term} type="button" className="smart-term" onClick={() => onGlossary(term)}>
              {term} ؟
            </button>
          ))}
        </div>
      ) : null}
    </>
  );
}
