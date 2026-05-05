"use client";

import { useMemo, useState } from "react";

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function InteractiveLearning({ examples = [] }) {
  const [exampleIndex, setExampleIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [board, setBoard] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [locked, setLocked] = useState(false);

  const example = examples[exampleIndex] || examples[0];
  const step = example?.steps?.[stepIndex];
  const choices = useMemo(() => shuffle(step?.choices || []), [exampleIndex, stepIndex]);
  const done = example && stepIndex >= example.steps.length;

  if (!example) return <main className="interactive-shell">لا توجد أمثلة بعد.</main>;

  function resetExample() {
    setStepIndex(0);
    setBoard([]);
    setFeedback(null);
    setLocked(false);
  }

  function nextExample() {
    setExampleIndex((i) => (i + 1) % examples.length);
    setStepIndex(0);
    setBoard([]);
    setFeedback(null);
    setLocked(false);
  }

  function handleAnswer(value) {
    if (locked || done) return;
    if (value === step.answer) {
      setLocked(true);
      setFeedback({ type: "ok", text: "أحسنت! خطوة صحيحة." });
      setBoard((prev) => [...prev, step.boardText || value]);
      setTimeout(() => {
        setStepIndex((i) => i + 1);
        setFeedback(null);
        setLocked(false);
      }, 850);
    } else {
      setFeedback({ type: "bad", text: step.hint || "راجع السؤال وحاول مرة أخرى." });
    }
  }

  return (
    <main className="interactive-shell" dir="rtl">
      <section className="interactive-card">
        <div className="interactive-topline">
          <span>{example.topic}</span>
          <button onClick={nextExample} className="soft-mini-btn">مثال جديد</button>
        </div>

        <h1>هيا نتعلم كيف نُعرب الكلمة المحددة</h1>

        <p className="interactive-sentence">
          {example.sentence.split(example.target)[0]}
          <mark>{example.target}</mark>
          {example.sentence.split(example.target).slice(1).join(example.target)}
        </p>

        <div className="i3rab-board">
          <h2>لوحة الإعراب</h2>
          {board.length === 0 ? <p className="muted">ستُبنى اللوحة أمامك خطوة بخطوة.</p> : null}
          <div className="board-steps">
            {board.map((item, i) => <span key={i}>{i + 1}. {item}</span>)}
          </div>
        </div>

        {!done ? (
          <section className="drag-step">
            <div className="step-count">الخطوة {stepIndex + 1} من {example.steps.length}</div>
            <h2>{step.question}</h2>
            <p className="step-hint">{step.hint}</p>

            <div className="drop-zone" aria-label="منطقة الإجابة">
              اسحب الإجابة هنا أو اضغط عليها
            </div>

            <div className="drag-choices">
              {choices.map((choice) => (
                <button
                  key={choice}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", choice)}
                  onDragEnd={(e) => e.currentTarget.blur()}
                  onClick={() => handleAnswer(choice)}
                  onDragOver={(e) => e.preventDefault()}
                  className="drag-choice"
                >
                  {choice}
                </button>
              ))}
            </div>

            <div
              className="drop-catcher"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleAnswer(e.dataTransfer.getData("text/plain"));
              }}
            />

            {feedback ? (
              <div className={`feedback-pop ${feedback.type === "ok" ? "ok" : "bad"}`}>
                {feedback.type === "ok" ? "✓" : "!"} {feedback.text}
              </div>
            ) : null}
          </section>
        ) : (
          <section className="result-card">
            <div className="success-badge">✓ أنجزت الإعراب</div>
            <h2>{example.result}</h2>
            <div className="result-actions">
              <a className="btn primary" href={example.nextHref}>{example.nextLabel}</a>
              <button className="btn secondary" onClick={nextExample}>مثال جديد</button>
              <button className="btn ghost" onClick={resetExample}>إعادة</button>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
