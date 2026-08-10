"use client";

import type { RunnerState } from "../../../lib/exercise/runner";
import { toStudentArabicOption } from "../../../lib/studentOptionText";
import type { QuestionCardPhase } from "./useQuestionMotion";
import type { PracticeWrongPanel } from "./ExerciseQuestionStageTypes";
import { renderSmartText } from "./ExerciseTextViews";
import { practiceTeacherNarrative } from "./ExercisePedagogy";

type Props = {
  target?: string;
  cardPhase: QuestionCardPhase;
  wrongPanel: PracticeWrongPanel | null;
  retryReady: boolean;
  directOptions: string[];
  successNudge: string | null;
  onGlossary: (term: string) => void;
  onRetry: () => void;
  onContinue: (nextState: RunnerState) => void;
  onPickOption: (option: string, optionIndex: number) => void;
};

export function ExercisePracticeQuestion({
  target,
  cardPhase,
  wrongPanel,
  retryReady,
  directOptions,
  successNudge,
  onGlossary,
  onRetry,
  onContinue,
  onPickOption,
}: Props) {
  const currentTarget = target || "الكلمة المحددة";
  return (
    <div className="practice-direct-board" aria-label="تحدي الإعراب السريع">
      {wrongPanel ? (
        <div className="practice-wrong-sequence is-primary-panel" role="alert" aria-live="assertive">
          <div className="practice-wrong-title">دعنا نراجعها معًا</div>
          <div className="practice-wrong-subtitle">
            سأربط لك الفكرة حتى تصل إلى الإعراب الصحيح:
          </div>
          <div className="practice-teacher-explanation">
            {renderSmartText(
              practiceTeacherNarrative(wrongPanel.steps, currentTarget),
              onGlossary,
            )}
          </div>
          <div className="practice-wrong-actions">
            <button type="button" onClick={onRetry}>أعد المحاولة</button>
            <button
              type="button"
              className="secondary"
              onClick={() => onContinue(wrongPanel.nextState)}
            >
              أكمل بعد التصحيح
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="practice-direct-kicker">طبّق ما تعلّمته</div>
          <div className="practice-direct-prompt">
            ما الإعراب الصحيح لـ <strong>«{currentTarget}»</strong>؟
          </div>
          <div className="practice-direct-note">فكّر سريعًا، ثم اختر النتيجة النهائية.</div>
          {retryReady ? (
            <div className="practice-retry-message">
              عدت إلى السؤال نفسه. طبّق الآن التسلسل الذي صححناه.
            </div>
          ) : null}
          <div className="practice-direct-options">
            {directOptions.map((option, index) => (
              <button
                key={`${option}-${index}`}
                type="button"
                className="practice-direct-option"
                disabled={cardPhase !== "idle"}
                onClick={() => onPickOption(option, index)}
              >
                <span>{index + 1}</span>
                <strong>{renderSmartText(toStudentArabicOption(option), onGlossary, { interactiveTerms: false })}</strong>
              </button>
            ))}
          </div>
        </>
      )}
      {cardPhase === "success" ? (
        <div className="practice-success-pulse">✓ {successNudge}</div>
      ) : null}
    </div>
  );
}
