"use client";

import React from "react";
import {
  QUIZ_PASS_PERCENT,
  buildRemedialTeacherExplanation,
  coverageDisplayLabel,
  explainDistractor,
  isSameQuizAnswer,
  quizOptionDisplayText,
  type QuizAnswerRow,
  type QuizExampleLike,
} from "../../../lib/exercise/quiz";
import { ghostActionStyle, primaryActionStyle } from "./exerciseViewStyles";

type RenderSentence = (sentence?: string, target?: string) => React.ReactNode;

const panelStyle: React.CSSProperties = {
  padding: 16,
  border: "1px solid #d8dee7",
  borderRadius: 18,
  marginBottom: 16,
  background: "#ffffff",
  color: "#172033",
  boxShadow: "0 16px 40px rgba(0,0,0,.18)",
};

const answerButtonStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  marginBottom: 8,
  padding: 12,
  borderRadius: 14,
  border: "1px solid #d8dee7",
  textAlign: "right",
  cursor: "pointer",
  background: "#ffffff",
  color: "#172033",
  fontWeight: 800,
};





export function RemedialTrainingView({
  example,
  options,
  cursor,
  total,
  selected,
  checked,
  expectedLabel,
  isCheckedCorrect,
  renderSentence,
  onBack,
  onSelect,
  onRetry,
  onNext,
}: {
  example?: QuizExampleLike;
  options: string[];
  cursor: number;
  total: number;
  selected: string | null;
  checked: boolean;
  expectedLabel: string;
  isCheckedCorrect: boolean;
  renderSentence: RenderSentence;
  onBack: () => void;
  onSelect: (option: string) => void;
  onRetry: () => void;
  onNext: () => void;
}) {
  return (
    <section className="exercise-panel remedial-stage" style={panelStyle}>
      <div className="remedial-stage-head">
        <div>
          <span>تدرّب على أخطائك</span>
          <h2>نفهم موضع الخطأ ثم نحل مثالًا جديدًا</h2>
          <p>مثال {Math.min(cursor + 1, total)} من {total}</p>
        </div>
        <button type="button" onClick={onBack} style={ghostActionStyle}>العودة للنتيجة</button>
      </div>

      {example ? (
        <>
          {example.facts?.remedialOrigin ? (
            <div className="remedial-origin-card">
              <span>موضع الضعف الذي نعالجه</span>
              <p>{renderSentence(example.facts.remedialOrigin.sentence, example.facts.remedialOrigin.target)}</p>
              <div><strong>اختيارك السابق:</strong> {quizOptionDisplayText(example.facts.remedialOrigin.actualLabel || "لم تُسجَّل إجابة")}</div>
            </div>
          ) : null}

          <section className="remedial-example-card">
            <span className="remedial-example-label">مثال جديد من المهارة نفسها</span>
            <div className="exercise-sentence">{renderSentence(example.sentence, example.target)}</div>
            <p>اختر الإعراب الصحيح للكلمة المحددة.</p>
          </section>

          <div className="quiz-form-card-options remedial-options">
            {options.map((option, index) => {
              const optionSelected = selected === option;
              const optionCorrect = checked && isSameQuizAnswer(option, expectedLabel);
              const optionWrong = checked && optionSelected && !optionCorrect;
              return (
                <button type="button"
                  key={`${option}-${index}`}
                  onClick={() => {
                    if (!checked) onSelect(option);
                  }}
                  className={`exercise-answer-btn quiz-form-option ${optionSelected ? "is-selected" : ""} ${optionCorrect ? "is-correct" : ""} ${optionWrong ? "is-wrong" : ""}`}
                  style={{
                    ...answerButtonStyle,
                    background: optionCorrect ? "#edf9f1" : optionWrong ? "#fff1f3" : optionSelected ? "#edf9f8" : "#ffffff",
                    borderColor: optionCorrect ? "#168544" : optionWrong ? "#c93645" : optionSelected ? "#137f7a" : "#d8dee7",
                  }}
                >
                  <span className="quiz-option-dot">{index + 1}</span>
                  <span>{quizOptionDisplayText(option)}</span>
                </button>
              );
            })}
          </div>

          {checked ? (
            <div className={`remedial-teacher-card ${isCheckedCorrect ? "is-correct" : "is-wrong"}`}>
              <div className="remedial-teacher-title">{isCheckedCorrect ? "أحسنت، ثبتت المهارة" : "لنحلها معًا"}</div>
              {!isCheckedCorrect ? (
                <p className="remedial-choice-reason"><strong>لماذا لم يناسب اختيارك؟</strong> {explainDistractor(selected, expectedLabel, example)}</p>
              ) : null}
              <p><strong>شرح خطوات الحل:</strong> {buildRemedialTeacherExplanation(example, expectedLabel)}</p>
              <div className="remedial-final-answer"><strong>الإجابة الصحيحة:</strong> {quizOptionDisplayText(expectedLabel)}</div>
            </div>
          ) : null}

          <div className="quiz-form-actions remedial-actions">
            <button type="button" onClick={onRetry} style={ghostActionStyle}>إعادة المحاولة</button>
            <button type="button" onClick={onNext} style={primaryActionStyle} disabled={!selected}>
              {checked ? (cursor + 1 >= total ? "إنهاء العلاج" : "مثال جديد من موضع الضعف") : "تحقق من الإجابة"}
            </button>
          </div>
        </>
      ) : (
        <div className="exercise-practice-warning">لا توجد أمثلة علاجية جاهزة الآن.</div>
      )}
    </section>
  );
}

export function QuizSummaryView({
  score,
  percent,
  answers,
  canDownloadCertificate,
  canStartRemedial,
  certificateHref,
  textsHref,
  renderSentence,
  onStartRemedial,
  onRestart,
}: {
  score: number;
  percent: number;
  answers: QuizAnswerRow[];
  canDownloadCertificate: boolean;
  canStartRemedial: boolean;
  certificateHref: string;
  textsHref: string;
  renderSentence: RenderSentence;
  onStartRemedial: () => void;
  onRestart: () => void;
}) {
  return (
    <section className="exercise-panel exercise-quiz-summary" style={panelStyle}>
      <div className="exercise-summary-head">
        <div>
          <div className="exercise-summary-kicker">النتيجة النهائية</div>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>انتهى الاختبار النهائي</div>
          <div style={{ opacity: 0.9 }}>نتيجتك: {score} / {answers.length} ({percent}%)</div>
        </div>
        <div className={`exercise-result-pill ${percent >= QUIZ_PASS_PERCENT ? "is-pass" : "is-fail"}`}>
          {percent >= QUIZ_PASS_PERCENT ? "نجاح" : "بحاجة إلى إعادة"}
        </div>
      </div>

      <div style={{ marginBottom: 12, opacity: 0.85 }}>معيار النجاح: {QUIZ_PASS_PERCENT}% أو أكثر</div>
      <div className="quiz-form-actions" style={{ marginBottom: 16, justifyContent: "flex-start", flexWrap: "wrap" }}>
        {canDownloadCertificate ? (
          <a href={certificateHref} style={{ ...primaryActionStyle, display: "inline-flex", textDecoration: "none" }}>
            تحميل الشهادة
          </a>
        ) : (
          <button type="button" style={{ ...primaryActionStyle, background: "#e8edf2", color: "#536174", border: "1px solid #8795a7", opacity: 1, cursor: "not-allowed" }} disabled>
            تحميل الشهادة
          </button>
        )}
        <button
          type="button"
          onClick={onStartRemedial}
          style={{ ...primaryActionStyle, background: canStartRemedial ? undefined : "#e8edf2", color: canStartRemedial ? undefined : "#536174", border: canStartRemedial ? undefined : "1px solid #8795a7", opacity: 1, cursor: canStartRemedial ? "pointer" : "not-allowed" }}
          disabled={!canStartRemedial}
        >
          عالج ضعفي
        </button>
        <a
          href={textsHref}
          style={{ ...primaryActionStyle, display: "inline-flex", textDecoration: "none", background: "#e0b84c", color: "#172033", border: "1px solid #624b10" }}
        >
          لعبة النصوص
        </a>
      </div>
      {!canDownloadCertificate ? (
        <div className="exercise-practice-warning" style={{ marginBottom: 16 }}>الشهادة لا تُتاح إلا بعد النجاح بنسبة 80% فأكثر.</div>
      ) : null}
      {!canStartRemedial ? (
        <div className="exercise-practice-warning" style={{ marginBottom: 16 }}>لا توجد أخطاء ظاهرة لبناء تدريب علاجي منها.</div>
      ) : null}

      <div style={{ display: "grid", gap: 10 }}>
        {answers.map((answer, index) => (
          <div key={answer.exampleId} className={`exercise-review-card ${answer.isCorrect ? "is-correct" : "is-wrong"}`} style={{ padding: 12, border: `1px solid ${answer.isCorrect ? "#168544" : "#c93645"}`, borderRadius: 16, background: answer.isCorrect ? "#edf9f1" : "#fff1f3", color: answer.isCorrect ? "#145a31" : "#852433" }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>السؤال {index + 1}: {answer.isCorrect ? "✅ صحيح" : "❌ خطأ"}</div>
            <div style={{ marginBottom: 6 }}>الجملة: <span style={{ fontSize: 18 }}>{renderSentence(answer.sentence, answer.target)}</span></div>
            <div style={{ marginBottom: 4 }}><strong>إجابتك:</strong> {quizOptionDisplayText(answer.actualLabel || "لم يختر إجابة")}</div>
            <div style={{ marginBottom: 4 }}><strong>الإجابة الصحيحة:</strong> {quizOptionDisplayText(answer.expectedLabel || coverageDisplayLabel(answer.expectedCoverage))}</div>
            {!answer.isCorrect && answer.actualOptionReason ? <div style={{ marginTop: 6, color: "#852433", lineHeight: 1.8 }}><strong>سبب خطأ اختيارك:</strong> {answer.actualOptionReason}</div> : null}
            {!answer.isCorrect && answer.whyCorrect ? <div style={{ marginTop: 6, color: "#145a31", lineHeight: 1.8 }}><strong>كيف نصل إلى الصواب:</strong> {answer.whyCorrect}</div> : null}
          </div>
        ))}
      </div>

      <button type="button" onClick={onRestart} style={ghostActionStyle}>إعادة الاختبار النهائي</button>
    </section>
  );
}

export function QuizQuestionView({
  cursor,
  total,
  example,
  prompt,
  options,
  selected,
  renderSentence,
  onSelect,
  onPrevious,
  onRestart,
  onNext,
}: {
  cursor: number;
  total: number;
  example?: QuizExampleLike;
  prompt: string;
  options: string[];
  selected: string | null;
  renderSentence: RenderSentence;
  onSelect: (option: string) => void;
  onPrevious: () => void;
  onRestart: () => void;
  onNext: () => void;
}) {
  return (
    <section className="exercise-panel quiz-workspace-panel" style={panelStyle}>
      <div className="quiz-workspace-progress">السؤال {cursor + 1} من {total}</div>

      <div className="quiz-workspace-sentence" aria-label="الجملة">
        <span>الجملة</span>
        <div className="exercise-sentence">{renderSentence(example?.sentence, example?.target)}</div>
      </div>

      <div className="quiz-question-with-instruction">
        {prompt}
        <span className="question-choice-prompt"> اختر الإجابة الصحيحة مما يأتي:</span>
      </div>

      <div className="quiz-form-card-options">
        {options.map((option, index) => (
          <button type="button"
            key={`${option}-${index}`}
            onClick={() => onSelect(option)}
            className={`exercise-answer-btn quiz-form-option ${selected === option ? "is-selected" : ""}`}
            style={{
              ...answerButtonStyle,
              background: selected === option ? "#edf9f8" : "#ffffff",
              borderColor: selected === option ? "#137f7a" : "#d8dee7",
            }}
          >
            <span className="quiz-option-dot">{index + 1}</span>
            <span>{quizOptionDisplayText(option)}</span>
          </button>
        ))}
      </div>

      <div className="quiz-form-actions">
        <button type="button" onClick={onPrevious} style={ghostActionStyle} disabled={cursor <= 0}>السابق</button>
        <button type="button" onClick={onRestart} style={ghostActionStyle}>إعادة الاختبار من البداية</button>
        <button type="button" onClick={onNext} style={primaryActionStyle} disabled={!selected}>
          {cursor + 1 >= total ? "تسليم الاختبار النهائي" : "التالي"}
        </button>
      </div>
    </section>
  );
}
