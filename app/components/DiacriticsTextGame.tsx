"use client";

import React from "react";
import type { DiacriticsText, TextBlank } from "../../content/diacriticsTexts";

function correctChoice(blank: TextBlank) {
  return blank.choices.find((item) => item.correct)?.text || "";
}

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

  const text = texts[textIndex];
  const activeBlank = text?.blanks?.[blankIndex] || null;
  const finished = Boolean(text) && blankIndex >= text.blanks.length;

  React.useEffect(() => {
    setBlankIndex(0);
    setAnswers({});
    setFeedback(null);
    setWrongChoice(null);
  }, [textIndex]);

  if (!text) {
    return (
      <section className="card text-game-empty">
        <h1>لعبة النصوص غير متاحة لهذا الموضوع بعد</h1>
        <a href={backHref} className="btn btn-primary">العودة إلى الموضوع</a>
      </section>
    );
  }

  function choose(textValue: string) {
    if (!activeBlank || finished) return;
    const selected = activeBlank.choices.find((item) => item.text === textValue);
    if (!selected) return;

    if (!selected.correct) {
      setWrongChoice(textValue);
      setFeedback({
        tone: "wrong",
        text: selected.feedback || activeBlank.wrongFeedback || "أعد قراءة الجملة وحدد موقع الكلمة قبل اختيار ضبطها.",
      });
      return;
    }

    setWrongChoice(null);
    setAnswers((current) => ({ ...current, [activeBlank.id]: textValue }));
    setFeedback({ tone: "correct", text: selected.feedback || activeBlank.correctFeedback });
    setBlankIndex((current) => current + 1);
  }

  function restartCurrentText() {
    setBlankIndex(0);
    setAnswers({});
    setFeedback(null);
    setWrongChoice(null);
  }

  function nextText() {
    setTextIndex((current) => (current + 1) % texts.length);
  }

  const activeId = finished ? null : activeBlank?.id || null;
  const progress = Math.round((Math.min(blankIndex, text.blanks.length) / Math.max(1, text.blanks.length)) * 100);

  return (
    <main className="text-game-page" dir="rtl">
      <section className="card text-game-hero">
        <div>
          <span className="section-kicker">لعبة النصوص: التشكيل والضبط</span>
          <h1>{topicName}</h1>
          <p>حدّد موقع الكلمة أولًا، ثم اختر صورتها المضبوطة. كل إجابة صحيحة تضيء الفراغ التالي.</p>
        </div>
        <div className="text-game-counter">النص {textIndex + 1} من {texts.length}</div>
      </section>

      <section className="card text-game-card">
        <div className="text-game-card-head">
          <div>
            <span>{text.domain}</span>
            <h2>{text.title}</h2>
          </div>
          <div className="text-game-progress-meta">
            <strong>{Math.min(blankIndex + 1, text.blanks.length)} / {text.blanks.length}</strong>
            <span>{finished ? "اكتمل النص" : "موضع نشط"}</span>
          </div>
        </div>

        <div className="text-game-progress-track" aria-label="تقدم حل النص">
          <i style={{ width: `${progress}%` }} />
        </div>

        <div className="text-game-passage">
          {renderTemplate(text.template, text.blanks, activeId, answers)}
        </div>

        {!finished && activeBlank ? (
          <div className="text-game-workspace">
            <div className="text-game-instruction">اختر الصورة الدقيقة للكلمة في الموضع المضيء:</div>
            <div className="text-game-options">
              {activeBlank.choices.map((item) => (
                <button
                  key={item.text}
                  type="button"
                  onClick={() => choose(item.text)}
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
            <strong>{feedback.tone === "correct" ? "أحسنت" : "راجع المسار"}</strong>
            <p>{feedback.text}</p>
          </div>
        ) : null}

        {finished ? (
          <div className="text-game-finished">
            <span>اكتمل النص</span>
            <h3>حوّلتَ الموقع الإعرابي إلى ضبط صحيح داخل نص غير مشكول.</h3>
            <div className="text-game-actions">
              <a href={backHref} className="btn btn-primary">إنهاء</a>
              {texts.length > 1 ? <button type="button" className="btn btn-soft" onClick={nextText}>جرّب نصًا آخر</button> : null}
              <button type="button" className="btn btn-soft" onClick={restartCurrentText}>أعد النص</button>
            </div>
          </div>
        ) : (
          <div className="text-game-secondary-actions">
            <button type="button" className="text-link-button" onClick={restartCurrentText}>إعادة النص من البداية</button>
          </div>
        )}
      </section>
    </main>
  );
}
