"use client";

import type React from "react";
import type { ExerciseAnswer, ExerciseTree, Mode } from "../../../lib/exercise/model";
import type { AnswerFeedbackState } from "../../../lib/exercise/answerSession";
import { toStudentArabicOption } from "../../../lib/studentOptionText";
import type { QuestionCardPhase } from "./useQuestionMotion";
import { renderSmartText } from "./ExerciseTextViews";

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
  return (
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
  );
}
