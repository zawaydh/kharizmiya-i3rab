"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { START_END_COPY } from "../../content/dialogueCopy";
import { toStudentArabicOption } from "../../lib/studentOptionText";
import { firstLevelHintText } from "../../lib/hintText";

const START_GLOSSARY = {
  "الأفعال الخمسة": ["كل فعل مضارع اتصلت به واو الجماعة أو ياء المخاطبة أو ألف الاثنين.", "ترفع بثبوت النون، وتنصب وتجزم بحذف النون."],
  "حروف العلة": ["الألف، الواو، الياء.", "ننتبه لها في آخر الفعل أو الاسم؛ لأنها قد تجعل الحركة مقدّرة أو تجعل حرف العلة يُحذف."],
  "اسم منقوص": ["اسم آخره ياء لازمة مكسور ما قبلها، مثل: القاضي، الساعي."],
  "واو الجماعة": ["ضمير متصل يدل على جماعة الذكور.", "إذا اتصل بالفعل يكون غالبًا في محل رفع فاعل."],
  "أداة نصب": ["مثل: لن، أن، كي.", "إذا جاءت قبل المضارع جعلته منصوبًا."],
  "أداة جزم": ["مثل: لم، لا الناهية، لام الأمر.", "إذا جاءت قبل المضارع جعلته مجزومًا."],
  "معتل الآخر": ["فعل آخره حرف علة: ألف أو واو أو ياء.", "مثل: يرمي، يدعو، يسعى."],
  "مبني": ["لا نبحث له عن رفع أو نصب أو جزم بالطريقة المعتادة.", "نثبت علامة بنائه حسب حالته."],
  "معرب": ["يدخل في مسار الإعراب: رفع، نصب، جزم، أو جرّ بحسب نوع الكلمة والعامل."]
};

function SmartText({ text, onTerm }) {
  if (!text) return null;
  const terms = Object.keys(START_GLOSSARY).sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");
  return String(text).split(pattern).map((part, idx) => START_GLOSSARY[part]
    ? (
      <span key={`${part}-${idx}`} className="term-with-info">
        <span className="term-label-text">{part}</span>
        <button type="button" className="term-info-btn" onClick={() => onTerm(part)} aria-label={`معلومات عن ${part}`}>i</button>
      </span>
    )
    : <span key={idx}>{part}</span>
  );
}

function shuffle(arr) {
  // Deterministic order prevents Next hydration mismatch between server and client.
  return [...arr];
}

function getStepLead(stepIndex, step) {
  if (step?.lead) return step.lead;
  if (stepIndex === 0) return "أول خطوة: نميّز الكلمة.";
  return "نكمل إعراب الكلمة نفسها.";
}

function refinedQuestion(example, step, stepIndex) {
  const target = example?.target || "الكلمة";
  const q = String(step?.question || "").trim();

  if (stepIndex === 0 && q.includes("اسم") && q.includes("فعل") && q.includes("حرف")) {
    return `في جملة «${example.sentence}» نركّز على (${target}): هل هي اسم أم فعل أم حرف؟`;
  }

  if (q.includes("زمن الفعل")) {
    return `عرفنا أن (${target}) فعل. الآن نسأل: هل يدل على الماضي أم المضارع أم الأمر؟`;
  }

  if (q.includes("أداة تؤثر")) {
    return `بما أن (${target}) فعل مضارع معرب، ننظر قبله: هل سبقته أداة نصب أم أداة جزم؟`;
  }

  if (q.includes("الأفعال الخمسة") || q.includes("سبب علامة الجزم")) {
    return `هل الفعل (${target}) من الأفعال الخمسة؟ وهي أفعال مضارعة اتصلت بألف الاثنين أو ياء المخاطبة أو واو الجماعة.`;
  }

  return q;
}

function refinedHint(example, step, stepIndex) {
  const q = String(step?.question || "");
  const target = example?.target || "الكلمة";

  if (example?.id === "kana" && stepIndex === 0) {
    return `اسأل: ما المعلومة التي أضافتها «${target}» عن الجو بعد دخول كان؟`;
  }
  if (example?.id === "inna" && stepIndex === 0) {
    return `احذف إن مؤقتًا، ثم اسأل: عن أي اسم بدأنا الحديث؟ تتبع الاسم نفسه بعد عودة إن.`;
  }
  if (stepIndex === 0 && q.includes("اسم") && q.includes("فعل") && q.includes("حرف")) {
    return `هل تدل «${target}» على حدث وزمن، أم على معنى بلا زمن، أم لا يظهر معناها إلا مع غيرها؟`;
  }
  return firstLevelHintText(step?.id || `${example?.id || "start"}_${stepIndex}`, step?.hint, target, q);
}

function wrongFeedbackFor(choice, step, example, stepIndex) {
  const target = example?.target || "الكلمة";
  const answer = step?.answer;
  const q = String(step?.question || "");

  if (step?.wrongReasons?.[choice]) return `${step.wrongReasons[choice]} انقر على الإجابة الصحيحة.`;

  if (stepIndex === 0 && q.includes("اسم") && q.includes("فعل") && q.includes("حرف")) {
    if (choice === "اسم") return `ليست اسمًا هنا؛ (${target}) تدل على حدث وزمن. انقر على الإجابة الصحيحة.`;
    if (choice === "حرف") return `ليست حرفًا؛ (${target}) كلمة لها معنى وزمن. انقر على الإجابة الصحيحة.`;
    return `فكّر: هل (${target}) تدل على حدث وزمن؟ انقر على الإجابة الصحيحة.`;
  }

  if (q.includes("زمن الفعل")) {
    return `قارن المعنى: متى وقع الفعل؟ ثم انقر على الإجابة الصحيحة.`;
  }

  if (q.includes("أداة تؤثر")) {
    return `انظر إلى الكلمة التي قبل (${target}) مباشرة: هل هي أداة نصب أم أداة جزم؟ انقر على الإجابة الصحيحة.`;
  }

  if (q.includes("الأفعال الخمسة") || q.includes("سبب علامة الجزم")) {
    return `اسأل: هل الفعل من الأفعال الخمسة؟ وهي أفعال مضارعة اتصلت بألف الاثنين أو واو الجماعة أو ياء المخاطبة. انقر على الإجابة الصحيحة.`;
  }

  return `هذه الإجابة لا تناسب هذه الخطوة. انقر على الإجابة الصحيحة: ${answer}.`;
}

export default function InteractiveLearning({ examples = [] }) {
  const [exampleIndex, setExampleIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [board, setBoard] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [locked, setLocked] = useState(false);
  const [streak, setStreak] = useState(0);
  const [activeTerm, setActiveTerm] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const feedbackRef = useRef(null);

  const example = examples[exampleIndex] || examples[0];
  const step = example?.steps?.[stepIndex];
  const choices = useMemo(() => shuffle(step?.choices || []), [exampleIndex, stepIndex]);
  const done = example && stepIndex >= example.steps.length;
  const progress = example ? Math.round((Math.min(stepIndex, example.steps.length) / example.steps.length) * 100) : 0;
  const visualProgress = example ? Math.round((Math.min(stepIndex + 1, example.steps.length) / example.steps.length) * 100) : 0;
  const currentBuild = board.length ? board[board.length - 1] : "";

  useEffect(() => {
    setShowHint(false);
  }, [exampleIndex, stepIndex]);

  useEffect(() => {
    if (feedback?.type === "bad") {
      window.setTimeout(() => {
        feedbackRef.current?.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      }, 80);
    }
  }, [feedback]);

  if (!example) return <main className="interactive-shell">لا توجد أمثلة بعد.</main>;

  function resetExample() {
    setStepIndex(0);
    setBoard([]);
    setFeedback(null);
    setLocked(false);
    setStreak(0);
    setActiveTerm(null);
    setShowHint(false);
  }

  function nextExample() {
    setExampleIndex((i) => (i + 1) % examples.length);
    setStepIndex(0);
    setBoard([]);
    setFeedback(null);
    setLocked(false);
    setStreak(0);
    setActiveTerm(null);
    setShowHint(false);
  }

  function handleAnswer(value) {
    if (locked || done || !step) return;
    if (value === step.answer) {
      setLocked(true);
      setShowHint(false);
      setStreak((s) => s + 1);
      setFeedback({ type: "ok", text: step.reward || "أحسنت؛ أغلقت هذا القرار وفتحت الخطوة التالية في مسار الإعراب." });
      setBoard((prev) => [...prev, step.boardText || value]);
      setTimeout(() => {
        setStepIndex((i) => i + 1);
        setFeedback(null);
        setLocked(false);
      }, 1100);
    } else {
      setStreak(0);
      setFeedback({ type: "bad", text: wrongFeedbackFor(value, step, example, stepIndex) });
    }
  }

  return (
    <main className="interactive-shell start-learning-refined" dir="rtl">
      <section className="interactive-card addictive-learning-card">
        <header className="interactive-topline clean-learning-topline">
          <div className="start-coach-copy">
            <strong>مدرّب تفكير نحوي موجّه</strong>
            <span>{example.topic}</span>
          </div>
          <button onClick={nextExample} className="soft-mini-btn">مثال جديد</button>
        </header>


        <section className="learning-focus-box">
          <div className="start-sticky-progress" aria-label="تقدم صفحة البداية">
            <div className="start-sticky-progress-top">
              <strong>{done ? "اكتمل المثال" : `الخطوة ${Math.min(stepIndex + 1, example.steps.length)} من ${example.steps.length}`}</strong>
              <span>{done ? "100%" : `${visualProgress}%`}</span>
            </div>
            <div className="start-sticky-progress-bar"><i style={{ width: `${done ? 100 : Math.max(7, visualProgress)}%` }} /></div>
          </div>
          <div className="sentence-task-card refined-sentence-task-card start-target-only-card">
            <div className="target-task-row">
              <span>المطلوب إعراب</span>
              <mark>{example.target}</mark>
            </div>
          </div>

          {!done ? (
            <div className="compact-step-zone refined-step-zone">
              <div className="start-progress-row" aria-label="تقدّم المثال">
                <span>الخطوة {stepIndex + 1} من {example.steps.length}</span>
                <div className="start-progress-track"><i style={{ width: `${Math.max(8, visualProgress)}%` }} /></div>
                <span>{visualProgress}%</span>
              </div>

              <h1>
                <span className="step-lead">{getStepLead(stepIndex, step)}</span>
                <SmartText text={refinedQuestion(example, step, stepIndex)} onTerm={setActiveTerm} />
              </h1>
              <div className="start-hint-control">
                <button
                  type="button"
                  className="soft-mini-btn start-hint-request"
                  onClick={() => setShowHint((value) => !value)}
                  aria-expanded={showHint}
                >
                  {showHint ? "إخفاء التلميح" : "أحتاج تلميحًا"}
                </button>
              </div>
              {showHint ? (
                <p className="step-hint" role="status">
                  <SmartText text={refinedHint(example, step, stepIndex)} onTerm={setActiveTerm} />
                </p>
              ) : null}

              <div className="drag-choices compact-choices">
                {choices.map((choice) => (
                  <button
                    key={choice}
                    disabled={locked}
                    onClick={() => handleAnswer(choice)}
                    className="drag-choice"
                  >
                    {toStudentArabicOption(choice)}
                  </button>
                ))}
              </div>

              <div className="click-guidance-note refined-click-guidance-note" aria-live="polite">
                <span>{currentBuild ? `آخر خطوة: ${currentBuild}` : "انقر على الإجابة الصحيحة للانتقال إلى الخطوة التالية."}</span>
              </div>

              {feedback ? (
                <div ref={feedbackRef} className={`feedback-pop inline-feedback ${feedback.type === "ok" ? "ok" : "bad"}`}>
                  <strong>{feedback.type === "ok" ? "✓" : "!"}</strong> <SmartText text={feedback.text} onTerm={setActiveTerm} />
                </div>
              ) : null}

              <div className="step-meta-row meta-under-choices">
                <span className="streak-pill">إنجاز متتالٍ: {streak}</span>
              </div>
            </div>
          ) : (
            <section className="result-card addictive-result-card start-finish-card">
              <div className="start-celebration-mark" aria-hidden="true">✓</div>
              <div className="success-badge">✓ {START_END_COPY.title}</div>
              <h2>{example.result}</h2>
              <p className="start-finish-body">{START_END_COPY.body}</p>

              <div className="start-next-topics" aria-label="اقتراحات المتابعة">
                <h3>{START_END_COPY.nextTopicsTitle}</h3>
                <div className="start-topic-grid start-stage-grid-horizontal">
                  {START_END_COPY.nextTopics.map((item) => (
                    <a key={item.href} className="start-topic-card" href={item.href}>
                      <strong>{item.label}</strong>
                      <span>{item.desc}</span>
                    </a>
                  ))}
                </div>
              </div>

              <div className="result-actions">
                <a className="btn btn-primary" href={example.nextHref || example.continueHref || START_END_COPY.primaryHref}>{example.nextLabel || example.continueLabel || START_END_COPY.primaryLabel}</a>
                <a className="btn secondary" href={START_END_COPY.secondaryHref}>{START_END_COPY.secondaryLabel}</a>
                <button className="btn btn-soft" onClick={resetExample}>{START_END_COPY.retryLabel}</button>
              </div>
            </section>
          )}
        </section>

        <section className="i3rab-board addictive-board compact-build-board">
          <div className="board-title-row">
            <h2>مسار القرار الإعرابي</h2>
            <span>{progress}%</span>
          </div>
          <div className="board-progress"><span style={{ width: `${progress}%` }} /></div>
          {board.length === 0 ? <p className="muted">سيظهر كل قرار هنا بعد اختياره.</p> : null}
          <div className="board-steps">
            {board.map((item, i) => <span key={i}>{i + 1}. {item}</span>)}
          </div>
        </section>

        {activeTerm ? (
          <div className="smart-popover start-smart-popover" role="dialog">
            <button type="button" className="smart-popover-close" onClick={() => setActiveTerm(null)}>×</button>
            <strong>{activeTerm}</strong>
            <ul>{START_GLOSSARY[activeTerm].map((line) => <li key={line}>{line}</li>)}</ul>
          </div>
        ) : null}
      </section>
    </main>
  );
}
