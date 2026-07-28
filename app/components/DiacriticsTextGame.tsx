"use client";

import React from "react";
import type { DiacriticsText, TextBlank } from "../../content/diacriticsTexts";

function renderTemplate(
  template: string,
  blanks: TextBlank[],
  activeBlankId: string | null,
  answers: Record<string, string>
) {
  const blankMap = new Map(blanks.map((blank) => [blank.id, blank]));
  const parts = template.split(/(\{[a-zA-Z0-9_-]+\})/g).filter(Boolean);

  return parts.map((part, index) => {
    const match = part.match(/^\{([a-zA-Z0-9_-]+)\}$/);
    if (!match) return <React.Fragment key={`text-${index}`}>{part}</React.Fragment>;

    const id = match[1];
    const blank = blankMap.get(id);
    if (!blank) return <React.Fragment key={`missing-${id}`}>______</React.Fragment>;

    const answer = answers[id];
    const isActive = activeBlankId === id;
    return (
      <span
        key={id}
        className={`text-game-blank ${answer ? "is-solved" : isActive ? "is-active" : "is-waiting"}`}
        aria-current={isActive ? "step" : undefined}
      >
        {answer || "ــــــــــ"}
      </span>
    );
  });
}

export default function DiacriticsTextGame({
  topicName,
  texts,
  backHref,
}: {
  topicName: string;
  texts: DiacriticsText[];
  backHref: string;
}) {
  const [textIndex, setTextIndex] = React.useState(0);
  const [blankIndex, setBlankIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [feedback, setFeedback] = React.useState<{ tone: "correct" | "wrong"; text: string } | null>(null);
  const [wrongChoice, setWrongChoice] = React.useState<string | null>(null);
  const [advancing, setAdvancing] = React.useState(false);
  const timerRef = React.useRef<number | null>(null);

  const text = texts[textIndex];
  const activeBlank = text?.blanks?.[blankIndex] || null;
  const finished = Boolean(text) && blankIndex >= text.blanks.length;

  React.useEffect(() => {
    setBlankIndex(0);
    setAnswers({});
    setFeedback(null);
    setWrongChoice(null);
    setAdvancing(false);
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, [textIndex]);

  React.useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  if (!text) {
    return (
      <section className="card text-game-empty">
        <h1>لعبة النصوص غير متاحة لهذا الموضوع بعد</h1>
        <a href={backHref} className="btn btn-primary">العودة إلى الموضوع</a>
      </section>
    );
  }

  function choose(textValue: string) {
    if (!activeBlank || finished || advancing) return;
    const selected = activeBlank.choices.find((item) => item.text === textValue);
    if (!selected) return;

    if (!selected.correct) {
      setWrongChoice(textValue);
      setFeedback({
        tone: "wrong",
        text: selected.feedback || activeBlank.wrongFeedback || "حدّد موقع الفراغ في الجملة، ثم اختر صورة الكلمة التي توافق حكمه الإعرابي.",
      });
      return;
    }

    setWrongChoice(null);
    setAnswers((current) => ({ ...current, [activeBlank.id]: textValue }));
    setFeedback({ tone: "correct", text: selected.feedback || activeBlank.correctFeedback });
    setAdvancing(true);

    timerRef.current = window.setTimeout(() => {
      setBlankIndex((current) => current + 1);
      setFeedback(null);
      setAdvancing(false);
    }, 1350);
  }

  function restartCurrentText() {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setBlankIndex(0);
    setAnswers({});
    setFeedback(null);
    setWrongChoice(null);
    setAdvancing(false);
  }

  function nextText() {
    setTextIndex((current) => (current + 1) % texts.length);
  }

  const activeId = finished ? null : activeBlank?.id || null;
  const completedCount = Math.min(blankIndex, text.blanks.length);
  const progress = Math.round((completedCount / Math.max(1, text.blanks.length)) * 100);

  return (
    <div className="text-game-page text-game-page-clean" dir="rtl">
      <section className="card text-game-clean-head">
        <div>
          <span>لعبة النصوص: التشكيل والضبط</span>
          <h1>{topicName}</h1>
        </div>
        <strong>النص {textIndex + 1} من {texts.length}</strong>
      </section>

      <section className="card text-game-card text-game-card-clean">
        <div className="text-game-clean-progress">
          <span>{finished ? "اكتمل النص" : `الفراغ ${blankIndex + 1} من ${text.blanks.length}`}</span>
          <i><b style={{ width: `${progress}%` }} /></i>
        </div>

        <div className="text-game-direct-question">
          اختر الكلمة المناسبة حسب الموقع الإعرابي ونوع الكلمة.
        </div>

        <div className="text-game-passage">
          {renderTemplate(text.template, text.blanks, activeId, answers)}
        </div>

        {!finished && activeBlank ? (
          <div className="text-game-workspace text-game-workspace-clean">
            <div className="text-game-options">
              {activeBlank.choices.map((item) => (
                <button
                  key={item.text}
                  type="button"
                  onClick={() => choose(item.text)}
                  disabled={advancing}
                  className={`text-game-option ${wrongChoice === item.text ? "is-wrong" : ""}`}
                >
                  {item.text}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {feedback ? (
          <div className={`text-game-feedback ${feedback.tone === "correct" ? "is-correct" : "is-wrong"}`} aria-live="polite">
            <strong>{feedback.tone === "correct" ? "أحسنت، هذا هو الضبط المناسب" : "راجع الموقع الإعرابي"}</strong>
            <p>{feedback.text}</p>
            {feedback.tone === "correct" && advancing ? <span className="text-game-next-cue">ينتقل الآن إلى الفراغ التالي…</span> : null}
          </div>
        ) : null}

        {finished ? (
          <div className="text-game-finished text-game-finished-clean">
            <h3>أكملت ضبط النص.</h3>
            <div className="text-game-actions">
              <a href={backHref} className="btn btn-primary">إنهاء</a>
              {texts.length > 1 ? <button type="button" className="btn btn-soft" onClick={nextText}>جرّب نصًا آخر</button> : null}
              <button type="button" className="btn btn-soft" onClick={restartCurrentText}>أعد النص</button>
            </div>
          </div>
        ) : (
          <div className="text-game-secondary-actions">
            <button type="button" className="text-link-button" onClick={restartCurrentText}>إعادة النص</button>
          </div>
        )}
      </section>
    </div>
  );
}
