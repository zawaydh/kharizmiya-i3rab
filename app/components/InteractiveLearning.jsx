"use client";

import { useMemo, useState } from "react";
import { START_END_COPY } from "../../content/dialogueCopy";


const START_GLOSSARY = {
  "الأفعال الخمسة": ["مضارع اتصلت به واو الجماعة أو ياء المخاطبة أو ألف الاثنين.", "ترفع بثبوت النون وتنصب وتجزم بحذف النون."],
  "حروف العلة": ["الألف، الواو، الياء.", "تؤثر في ظهور الحركة أو حذف حرف العلة."],
  "اسم منقوص": ["اسم آخره ياء لازمة مكسور ما قبلها مثل: القاضي."],
  "واو الجماعة": ["ضمير متصل في محل رفع فاعل إذا اتصل بالفعل."],
  "أداة نصب": ["مثل: لن، أن، كي. تجعل المضارع منصوبًا."],
  "أداة جزم": ["مثل: لم، لا الناهية، لام الأمر. تجعل المضارع مجزومًا."]
};

function SmartText({ text, onTerm }) {
  if (!text) return null;
  const terms = Object.keys(START_GLOSSARY).sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");
  return String(text).split(pattern).map((part, idx) => START_GLOSSARY[part]
    ? <button key={`${part}-${idx}`} type="button" className="smart-term" onClick={() => onTerm(part)}>{part}</button>
    : <span key={idx}>{part}</span>
  );
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function plainSentence(sentence) {
  return sentence || "";
}

function getStepLead(stepIndex, step) {
  if (step?.lead) return step.lead;
  if (stepIndex === 0) return "أول خطوة: نميّز الكلمة.";
  return "الآن نكمل بناء الإعراب.";
}

export default function InteractiveLearning({ examples = [] }) {
  const [exampleIndex, setExampleIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [board, setBoard] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [locked, setLocked] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [streak, setStreak] = useState(0);
  const [activeTerm, setActiveTerm] = useState(null);

  const example = examples[exampleIndex] || examples[0];
  const step = example?.steps?.[stepIndex];
  const choices = useMemo(() => shuffle(step?.choices || []), [exampleIndex, stepIndex]);
  const done = example && stepIndex >= example.steps.length;
  const progress = example ? Math.round((Math.min(stepIndex, example.steps.length) / example.steps.length) * 100) : 0;
  const currentBuild = board.length ? board[board.length - 1] : "";

  if (!example) return <main className="interactive-shell">لا توجد أمثلة بعد.</main>;

  function resetExample() {
    setStepIndex(0);
    setBoard([]);
    setFeedback(null);
    setLocked(false);
    setDragOver(false);
    setStreak(0);
  }

  function nextExample() {
    setExampleIndex((i) => (i + 1) % examples.length);
    setStepIndex(0);
    setBoard([]);
    setFeedback(null);
    setLocked(false);
    setDragOver(false);
    setStreak(0);
  }

  function handleAnswer(value) {
    if (locked || done || !step) return;
    setDragOver(false);
    if (value === step.answer) {
      setLocked(true);
      setStreak((s) => s + 1);
      setFeedback({ type: "ok", text: step.reward || "أحسنت، خطوة صحيحة!" });
      setBoard((prev) => [...prev, step.boardText || value]);
      setTimeout(() => {
        setStepIndex((i) => i + 1);
        setFeedback(null);
        setLocked(false);
      }, 900);
    } else {
      setStreak(0);
      setFeedback({ type: "bad", text: step.wrongHint || step.hint || "فكّر في السؤال ثم حاول مرة أخرى." });
    }
  }

  return (
    <main className="interactive-shell" dir="rtl">
      <section className="interactive-card addictive-learning-card">
        <header className="interactive-topline clean-learning-topline">
          <span>{example.topic}</span>
          <button onClick={nextExample} className="soft-mini-btn">مثال جديد</button>
        </header>

        <section className="learning-focus-box">
          <div className="sentence-task-card">
            <div className="task-label">في جملة:</div>
            <p className="interactive-sentence plain-sentence">{plainSentence(example.sentence)}</p>
            <div className="target-task-row">
              <span>المطلوب إعراب</span>
              <mark>{example.target}</mark>
            </div>
          </div>

          {!done ? (
            <div className="compact-step-zone">
              <div
                className={`drop-zone build-drop-zone ${dragOver ? "is-over" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  handleAnswer(e.dataTransfer.getData("text/plain"));
                }}
                aria-label="منطقة بناء الإعراب"
              >
                <span className="build-target">{example.target}:</span>
                <span className={`build-value ${currentBuild ? "has-value" : ""}`}>
                  {currentBuild || "اسحب القرار المناسب هنا"}
                </span>
              </div>

              <h1>
                <span className="step-lead">{getStepLead(stepIndex, step)}</span>
                {step.question}
              </h1>
              <p className="step-hint"><SmartText text={step.hint} onTerm={setActiveTerm} /></p>

              <div className="drag-choices compact-choices">
                {choices.map((choice) => (
                  <button
                    key={choice}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text/plain", choice)}
                    onClick={() => handleAnswer(choice)}
                    className="drag-choice"
                  >
                    {choice}
                  </button>
                ))}
              </div>

              <div className="step-meta-row meta-under-choices">
                <span className="step-count">الخطوة {stepIndex + 1} من {example.steps.length}</span>
                <span className="streak-pill">إنجاز متتالٍ: {streak}</span>
              </div>
            </div>
          ) : (
            <section className="result-card addictive-result-card start-finish-card">
              <div className="success-badge">✓ {START_END_COPY.title}</div>
              <h2>{example.result}</h2>
              <p className="start-finish-body">{START_END_COPY.body}</p>

              <div className="start-next-topics" aria-label="اقتراحات المتابعة">
                <h3>{START_END_COPY.nextTopicsTitle}</h3>
                <div className="start-topic-grid">
                  {START_END_COPY.nextTopics.map((item) => (
                    <a key={item.href} className="start-topic-card" href={item.href}>
                      <strong>{item.label}</strong>
                      <span>{item.desc}</span>
                    </a>
                  ))}
                </div>
              </div>

              <div className="result-actions">
                <a className="btn primary" href={example.nextHref || example.continueHref || START_END_COPY.primaryHref}>{example.nextLabel || example.continueLabel || START_END_COPY.primaryLabel}</a>
                <a className="btn secondary" href={START_END_COPY.secondaryHref}>{START_END_COPY.secondaryLabel}</a>
                <button className="btn ghost" onClick={resetExample}>{START_END_COPY.retryLabel}</button>
              </div>
            </section>
          )}
        </section>

        <section className="i3rab-board addictive-board compact-build-board">
          <div className="board-title-row">
            <h2>مسار البناء</h2>
            <span>{progress}%</span>
          </div>
          <div className="board-progress"><span style={{ width: `${progress}%` }} /></div>
          {board.length === 0 ? <p className="muted">سيظهر كل قرار هنا بعد اختياره.</p> : null}
          <div className="board-steps">
            {board.map((item, i) => <span key={i}>{i + 1}. {item}</span>)}
          </div>
        </section>

        {feedback ? (
          <div className={`feedback-pop ${feedback.type === "ok" ? "ok" : "bad"}`}>
            <strong>{feedback.type === "ok" ? "✓" : "!"}</strong> <SmartText text={feedback.text} onTerm={setActiveTerm} />
          </div>
        ) : null}

        {activeTerm ? (
          <div className="smart-popover" role="dialog">
            <button type="button" className="smart-popover-close" onClick={() => setActiveTerm(null)}>×</button>
            <strong>{activeTerm}</strong>
            <ul>{START_GLOSSARY[activeTerm].map((line) => <li key={line}>{line}</li>)}</ul>
          </div>
        ) : null}
      </section>
    </main>
  );
}
