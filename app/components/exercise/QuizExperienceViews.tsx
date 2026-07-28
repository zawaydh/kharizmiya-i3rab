"use client";

import React from "react";
import {
  QUIZ_PASS_PERCENT,
  buildRemedialTeacherExplanation,
  coverageDisplayLabel,
  explainDistractor,
  isSameQuizAnswer,
  type QuizAnswerRow,
  type QuizExampleLike,
} from "../../../lib/exercise/quiz";
import { toStudentArabicOption } from "../../../lib/studentOptionText";

type RenderSentence = (sentence?: string, target?: string) => React.ReactNode;

const panelStyle: React.CSSProperties = {
  padding: 16,
  border: "1px solid rgba(255,255,255,.12)",
  borderRadius: 18,
  marginBottom: 16,
  background: "linear-gradient(180deg, rgba(15,23,42,.88), rgba(15,23,42,.72))",
  color: "#eef4ff",
  boxShadow: "0 16px 40px rgba(0,0,0,.18)",
};

const answerButtonStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  marginBottom: 8,
  padding: 12,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,.14)",
  textAlign: "right",
  cursor: "pointer",
  background: "rgba(255,255,255,.05)",
  color: "#eef4ff",
  fontWeight: 800,
};

const ghostButtonStyle: React.CSSProperties = {
  marginTop: 12,
  padding: "10px 14px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,.18)",
  cursor: "pointer",
  background: "rgba(255,255,255,.06)",
  color: "#eef4ff",
  fontWeight: 800,
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "14px 22px",
  borderRadius: 14,
  border: "none",
  cursor: "pointer",
  fontWeight: 900,
  fontSize: 16,
  color: "#04111d",
  background: "linear-gradient(135deg,#22c55e,#67e8f9)",
  boxShadow: "0 10px 30px rgba(0,0,0,.12)",
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
          <span>عالج ضعفي</span>
          <h2>نفهم موضع الخطأ ثم نحل مثالًا جديدًا</h2>
          <p>مثال {Math.min(cursor + 1, total)} من {total}</p>
        </div>
        <button type="button" onClick={onBack} style={ghostButtonStyle}>العودة للنتيجة</button>
      </div>

      {example ? (
        <>
          {example.facts?.remedialOrigin ? (
            <div className="remedial-origin-card">
              <span>موضع الضعف الذي نعالجه</span>
              <p>{renderSentence(example.facts.remedialOrigin.sentence, example.facts.remedialOrigin.target)}</p>
              <div><strong>اختيارك السابق:</strong> {toStudentArabicOption(example.facts.remedialOrigin.actualLabel || "لم تُسجَّل إجابة")}</div>
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
                <button
                  key={`${option}-${index}`}
                  onClick={() => {
                    if (!checked) onSelect(option);
                  }}
                  className={`exercise-answer-btn quiz-form-option ${optionSelected ? "is-selected" : ""} ${optionCorrect ? "is-correct" : ""} ${optionWrong ? "is-wrong" : ""}`}
                  style={{
                    ...answerButtonStyle,
                    background: optionCorrect ? "rgba(34,197,94,.18)" : optionWrong ? "rgba(251,146,60,.18)" : optionSelected ? "rgba(47,158,158,.22)" : "rgba(255,255,255,.05)",
                    borderColor: optionCorrect ? "rgba(34,197,94,.65)" : optionWrong ? "rgba(251,146,60,.65)" : optionSelected ? "#2f9e9e" : "rgba(255,255,255,.14)",
                  }}
                >
                  <span className="quiz-option-dot">{index + 1}</span>
                  <span>{toStudentArabicOption(option)}</span>
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
              <div className="remedial-final-answer"><strong>الإجابة الصحيحة:</strong> {expectedLabel}</div>
            </div>
          ) : null}

          <div className="quiz-form-actions remedial-actions">
            <button type="button" onClick={onRetry} style={ghostButtonStyle}>إعادة المحاولة</button>
            <button type="button" onClick={onNext} style={primaryButtonStyle} disabled={!selected}>
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
          <a href={certificateHref} style={{ ...primaryButtonStyle, display: "inline-flex", textDecoration: "none" }}>
            تحميل الشهادة
          </a>
        ) : (
          <button type="button" style={{ ...primaryButtonStyle, opacity: 0.45, cursor: "not-allowed" }} disabled>
            تحميل الشهادة
          </button>
        )}
        <button
          type="button"
          onClick={onStartRemedial}
          style={{ ...primaryButtonStyle, background: canStartRemedial ? undefined : "rgba(255,255,255,.12)", opacity: canStartRemedial ? 1 : 0.48, cursor: canStartRemedial ? "pointer" : "not-allowed" }}
          disabled={!canStartRemedial}
        >
          عالج ضعفي
        </button>
        <a
          href={textsHref}
          style={{ ...primaryButtonStyle, display: "inline-flex", textDecoration: "none", background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}
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
          <div key={answer.exampleId} className={`exercise-review-card ${answer.isCorrect ? "is-correct" : "is-wrong"}`} style={{ padding: 12, border: "1px solid rgba(255,255,255,.12)", borderRadius: 16, background: answer.isCorrect ? "rgba(34,197,94,.12)" : "rgba(251,146,60,.12)" }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>السؤال {index + 1}: {answer.isCorrect ? "✅ صحيح" : "❌ خطأ"}</div>
            <div style={{ marginBottom: 6 }}>الجملة: <span style={{ fontSize: 18 }}>{renderSentence(answer.sentence, answer.target)}</span></div>
            <div style={{ marginBottom: 4 }}><strong>إجابتك:</strong> {answer.actualLabel || "لم يختر إجابة"}</div>
            <div style={{ marginBottom: 4 }}><strong>الإجابة الصحيحة:</strong> {answer.expectedLabel || coverageDisplayLabel(answer.expectedCoverage)}</div>
            {!answer.isCorrect && answer.actualOptionReason ? <div style={{ marginTop: 6, color: "#ffd5a8", lineHeight: 1.8 }}><strong>سبب خطأ اختيارك:</strong> {answer.actualOptionReason}</div> : null}
            {!answer.isCorrect && answer.whyCorrect ? <div style={{ marginTop: 6, color: "#b8ffd4", lineHeight: 1.8 }}><strong>كيف نصل إلى الصواب:</strong> {answer.whyCorrect}</div> : null}
          </div>
        ))}
      </div>

      <button onClick={onRestart} style={ghostButtonStyle}>إعادة الاختبار النهائي</button>
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
          <button
            key={`${option}-${index}`}
            onClick={() => onSelect(option)}
            className={`exercise-answer-btn quiz-form-option ${selected === option ? "is-selected" : ""}`}
            style={{
              ...answerButtonStyle,
              background: selected === option ? "rgba(47,158,158,.22)" : "rgba(255,255,255,.05)",
              borderColor: selected === option ? "#2f9e9e" : "rgba(255,255,255,.14)",
            }}
          >
            <span className="quiz-option-dot">{index + 1}</span>
            <span>{toStudentArabicOption(option)}</span>
          </button>
        ))}
      </div>

      <div className="quiz-form-actions">
        <button onClick={onPrevious} style={ghostButtonStyle} disabled={cursor <= 0}>السابق</button>
        <button onClick={onRestart} style={ghostButtonStyle}>إعادة</button>
        <button onClick={onNext} style={primaryButtonStyle} disabled={!selected}>
          {cursor + 1 >= total ? "تسليم الاختبار النهائي" : "التالي"}
        </button>
      </div>
    </section>
  );
}
