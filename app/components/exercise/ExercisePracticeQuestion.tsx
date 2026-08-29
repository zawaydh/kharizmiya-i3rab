"use client";

import type { RunnerState } from "../../../lib/exercise/runner";
import { toStudentArabicOption } from "../../../lib/studentOptionText";
import type { QuestionCardPhase } from "./useQuestionMotion";
import type { PracticeWrongPanel } from "./ExerciseQuestionStageTypes";
import { renderSmartText } from "./ExerciseTextViews";
import { cleanPracticeTeacherPart } from "./ExercisePedagogy";
import { practiceOptionScope } from "./ExercisePracticeFlow";
import { practiceTargetUnit } from "../../../lib/exercise/practiceGrammarPolicy";

type Props = {
  target?: string;
  cardPhase: QuestionCardPhase;
  wrongPanel: PracticeWrongPanel | null;
  retryReady: boolean;
  directOptions: string[];
  facts?: Record<string, unknown>;
  successNudge: string | null;
  onGlossary: (term: string) => void;
  onRetry: () => void;
  onContinue: (nextState: RunnerState) => void;
  onPickOption: (option: string, optionIndex: number) => void;
  onOpenHint: () => void;
};

export function ExercisePracticeQuestion({
  target,
  cardPhase,
  wrongPanel,
  retryReady,
  directOptions,
  facts,
  successNudge,
  onGlossary,
  onRetry,
  onPickOption,
  onOpenHint,
}: Props) {
  const currentTarget = target || "الكلمة المحددة";
  const routingChallenge =
    directOptions.length > 0 &&
    directOptions.every((option) => practiceOptionScope(option) === "routing");
  const targetUnit = practiceTargetUnit(facts || {}, directOptions[0] || "");
  const targetHasMultipleWords = currentTarget.trim().split(/\s+/u).length > 1;

  const structurePrompt =
    targetUnit === "verbal-sentence"
      ? targetHasMultipleWords
        ? <>أي تحليل إعرابي كامل صحيح للجملة الفعلية <strong>«{currentTarget}»</strong>؟</>
        : <>أي تحليل إعرابي كامل صحيح للجملة الفعلية التي تبدأ بـ <strong>«{currentTarget}»</strong>؟</>
      : targetUnit === "nominal-sentence"
        ? targetHasMultipleWords
          ? <>أي تحليل إعرابي كامل صحيح للجملة الاسمية <strong>«{currentTarget}»</strong>؟</>
          : <>أي تحليل إعرابي كامل صحيح للجملة الاسمية التي تبدأ بـ <strong>«{currentTarget}»</strong>؟</>
        : targetUnit === "shibh-jar" || targetUnit === "shibh-zarf"
          ? <>أي تحليل إعرابي كامل صحيح لشبه الجملة <strong>«{currentTarget}»</strong>؟</>
          : null;

  return (
    <div className="practice-direct-board" aria-label="تحدي الإعراب السريع">
      {wrongPanel ? (
        <div className="practice-wrong-sequence is-primary-panel" role="alert" aria-live="assertive">
          <div className="practice-wrong-title">دعنا نراجعها معًا</div>
          <div className="practice-wrong-subtitle">
            اتبع خطوات الحل بالترتيب، ثم ثبّت النتيجة الصحيحة:
          </div>
          <ol className="practice-teacher-steps">
            {wrongPanel.steps
              .map(cleanPracticeTeacherPart)
              .filter(Boolean)
              .map((step, index) => (
                <li key={`${step}-${index}`}>{renderSmartText(step, onGlossary)}</li>
              ))}
          </ol>
          <div className="practice-correction-result">
            <span>النتيجة الصحيحة</span>
            <strong>
              {renderSmartText(
                toStudentArabicOption(wrongPanel.finalAnswer),
                onGlossary,
                { interactiveTerms: false },
              )}
            </strong>
          </div>
          <div className="practice-wrong-actions">
            <button type="button" onClick={onRetry}>أعد المحاولة</button>
          </div>
        </div>
      ) : (
        <>
          <div className="practice-direct-kicker">طبّق ما تعلّمته</div>
          <div className="practice-direct-prompt">
            {routingChallenge ? (
              <>ما القرار الصحيح التالي لـ <strong>«{currentTarget}»</strong>؟</>
            ) : structurePrompt ? (
              structurePrompt
            ) : (
              <>أي نتيجة إعرابية كاملة صحيحة لـ <strong>«{currentTarget}»</strong>؟</>
            )}
          </div>
          <div className="practice-direct-note">
            {routingChallenge
              ? "حدّد النوع والمسار، ثم اختر القرار المناسب."
              : "طبّق المسار، ثم اختر النتيجة النهائية."}
          </div>
          {retryReady ? (
            <div className="practice-retry-message">
              عدت إلى السؤال نفسه. استخدم ما راجعته ثم اختر بنفسك.
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
                <strong>
                  {renderSmartText(
                    toStudentArabicOption(option),
                    onGlossary,
                    { interactiveTerms: false },
                  )}
                </strong>
              </button>
            ))}
          </div>
          <div className="hint-after-options practice-hint-inline">
            <button
              type="button"
              className="hint-after-options-btn"
              onClick={onOpenHint}
              disabled={cardPhase !== "idle"}
            >
              أحتاج تلميحًا
            </button>
          </div>
        </>
      )}
      {cardPhase === "success" ? (
        <div className="practice-success-pulse">✓ {successNudge}</div>
      ) : null}
    </div>
  );
}
