"use client";

import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { START_END_COPY } from "../../content/dialogueCopy";
import { toStudentArabicOption } from "../../lib/studentOptionText";
import { firstLevelHintText } from "../../lib/hintText";

export type StartLearningStep = {
  id?: string;
  question: string;
  hint?: string;
  choices: string[];
  answer: string;
  boardText?: string;
  lead?: string;
  reward?: string;
  wrongReasons?: Record<string, string>;
};

export type StartLearningExample = {
  id: string;
  topic: string;
  sentence: string;
  target: string;
  steps: StartLearningStep[];
  result: string;
  nextHref?: string;
  nextLabel?: string;
  continueHref?: string;
  continueLabel?: string;
};

type Feedback = { type: "ok" | "bad"; text: string };

const START_GLOSSARY: Record<string, string[]> = {
  "الأفعال الخمسة": ["كل فعل مضارع اتصلت به واو الجماعة أو ياء المخاطبة أو ألف الاثنين.", "ترفع بثبوت النون، وتنصب وتجزم بحذف النون."],
  "حروف العلة": ["الألف، الواو، الياء.", "ننتبه لها في آخر الفعل أو الاسم؛ لأنها قد تجعل الحركة مقدّرة أو تجعل حرف العلة يُحذف."],
  "اسم منقوص": ["اسم آخره ياء لازمة مكسور ما قبلها، مثل: القاضي، الساعي."],
  "واو الجماعة": ["ضمير متصل يدل على جماعة الذكور.", "يكون في محل رفع، وتحدد وظيفته من بناء الفعل والسياق؛ فقد يكون فاعلًا أو نائب فاعل أو اسمًا لناسخ."],
  "أداة نصب": ["مثل: لن، أن، كي.", "إذا جاءت قبل المضارع جعلته منصوبًا."],
  "أداة جزم": ["مثل: لم، لا الناهية، لام الأمر.", "إذا جاءت قبل المضارع جعلته مجزومًا."],
  "معتل الآخر": ["فعل آخره حرف علة: ألف أو واو أو ياء.", "مثل: يرمي، يدعو، يسعى."],
  "العامل": ["كلمة أو أداة أو علاقة نحوية تؤثر في حكم كلمة أخرى، مثل «لن» التي تنصب المضارع و«لم» التي تجزمه."],
  "المحل الإعرابي": ["الموقع الذي تشغله الكلمة المبنية أو الجملة: مثل محل رفع أو نصب أو جر، ويكون للفعل المضارع المبني محل جزم أيضًا بحسب العامل."],
  "مبني": ["يلزم صورة واحدة ولا يتغير آخره بتغير موقعه.", "نذكر علامة بنائه، وإذا كان له موقع في الجملة نذكر محله الإعرابي أيضًا."],
  "معرب": ["يتغير آخره بحسب موقعه أو العامل المؤثر فيه: رفعًا أو نصبًا أو جرًا أو جزمًا بحسب نوع الكلمة."]
};

function SmartText({ text, onTerm }: { text?: string; onTerm: Dispatch<SetStateAction<string | null>> }) {
  if (!text) return null;
  const terms = Object.keys(START_GLOSSARY).sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");
  return String(text).split(pattern).map((part, idx) => START_GLOSSARY[part]
    ? (
      <button
        key={`${part}-${idx}`}
        type="button"
        className="smart-term start-smart-term"
        onClick={() => onTerm(part)}
        aria-label={`شرح ${part}`}
      >
        {part}
      </button>
    )
    : <span key={idx}>{part}</span>
  );
}



function HighlightedSentence({ sentence, target }: { sentence: string; target: string }) {
  const source = String(sentence || "");
  const wanted = String(target || "");
  const targetIndex = wanted ? source.indexOf(wanted) : -1;

  if (targetIndex < 0) return <span>{source}</span>;

  return (
    <>
      <span>{source.slice(0, targetIndex)}</span>
      <mark>{wanted}</mark>
      <span>{source.slice(targetIndex + wanted.length)}</span>
    </>
  );
}

function shuffle(arr: readonly string[]): string[] {
  // Deterministic order prevents Next hydration mismatch between server and client.
  return [...arr];
}

function getStepLead(stepIndex: number, step?: StartLearningStep): string {
  const q = String(step?.question || "");
  if (q.includes("اسم") && q.includes("فعل") && q.includes("حرف")) return "تحديد نوع الكلمة";
  if (q.includes("زمن")) return "تحديد نوع الفعل";
  if (q.includes("أداة") || q.includes("العامل")) return "تحديد العامل";
  if (q.includes("الأفعال الخمسة") || q.includes("علامة")) return "تحديد العلامة";
  if (q.includes("مبني أم معرب")) return "تحديد نوع الاسم";
  if (q.includes("موقع")) return "تحديد الموقع الإعرابي";

  const lead = String(step?.lead || "").replace(/[.!؟]+$/g, "").trim();
  if (lead && !/أول خطوة|الآن نكمل|بقي أن|نكمل بناء/.test(lead)) return lead;
  return `الخطوة ${stepIndex + 1}`;
}


function refinedQuestion(example: StartLearningExample, step: StartLearningStep | undefined, stepIndex: number): string {
  const target = example?.target || "الكلمة";
  const q = String(step?.question || "").trim().replace(/[.!]+$/g, "");

  if (stepIndex === 0 && q.includes("اسم") && q.includes("فعل") && q.includes("حرف")) {
    return `ما نوع كلمة «${target}»؟`;
  }

  if (q.includes("نوع الفعل")) {
    return `ما نوع الفعل «${target}»؟`;
  }

  if (q.includes("أداة تؤثر")) {
    return `ما العامل الذي سبق الفعل «${target}»؟`;
  }

  if (q.includes("الأفعال الخمسة") || q.includes("سبب علامة الجزم")) {
    return `هل الفعل «${target}» من الأفعال الخمسة؟`;
  }

  return q;
}


function refinedHint(example: StartLearningExample, step: StartLearningStep | undefined, stepIndex: number): string {
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

function wrongFeedbackFor(choice: string, step: StartLearningStep, example: StartLearningExample, stepIndex: number): string {
  const target = example?.target || "الكلمة";
  const q = String(step?.question || "");

  if (step?.wrongReasons?.[choice]) {
    return String(step.wrongReasons[choice]).replace(/\s*انقر على الإجابة الصحيحة[.!؟]?\s*$/g, "");
  }

  if (stepIndex === 0 && q.includes("اسم") && q.includes("فعل") && q.includes("حرف")) {
    const correctType = String(step?.answer || "");

    if (correctType === "اسم") {
      if (/^(هذا|هذه|هذان|هاتان|هؤلاء)$/.test(target)) {
        return `«${target}» اسم إشارة يدل على معيّن، لذلك هو اسم وليس ${choice === "فعل" ? "فعلًا" : "حرفًا"}.`;
      }
      return choice === "فعل"
        ? `«${target}» اسم يدل على معنى بلا زمن، لذلك ليست فعلًا.`
        : `«${target}» اسم له معنى مستقل، لذلك ليست حرفًا.`;
    }

    if (correctType === "فعل") {
      return choice === "اسم"
        ? `«${target}» تدل على حدث مرتبط بزمن، لذلك ليست اسمًا.`
        : `«${target}» تدل على حدث مرتبط بزمن، لذلك ليست حرفًا.`;
    }

    if (correctType === "حرف") {
      return `«${target}» حرف لا يظهر معناه كاملًا إلا مع غيره، لذلك ليست ${choice === "اسم" ? "اسمًا" : "فعلًا"}.`;
    }

    return `راجع معنى «${target}»، ثم حدّد هل هي اسم أم فعل أم حرف.`;
  }

  if (q.includes("نوع الفعل")) {
    return `حدّد زمن الحدث في الجملة، ثم أعد الاختيار.`;
  }

  if (q.includes("أداة تؤثر") || q.includes("العامل")) {
    return `انظر إلى الكلمة السابقة للفعل «${target}» مباشرة؛ فهي التي تحدد العامل.`;
  }

  if (q.includes("الأفعال الخمسة") || q.includes("سبب علامة الجزم")) {
    return `افحص آخر الفعل: هل اتصلت به واو الجماعة أو ألف الاثنين أو ياء المخاطبة؟`;
  }

  return `راجع السؤال، ثم اختر الإجابة التي تناسب هذه الخطوة.`;
}

export default function InteractiveLearning({ examples = [] }: { examples?: StartLearningExample[] }) {
  const [exampleIndex, setExampleIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [board, setBoard] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [locked, setLocked] = useState(false);
  const [activeTerm, setActiveTerm] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const feedbackRef = useRef<HTMLDivElement | null>(null);

  const example = examples[exampleIndex] || examples[0];
  const step = example?.steps?.[stepIndex];
  const choices = useMemo(() => shuffle(step?.choices || []), [step?.choices]);
  const done = example && stepIndex >= example.steps.length;
  const progress = example ? Math.round((Math.min(stepIndex, example.steps.length) / example.steps.length) * 100) : 0;
  const visualProgress = example ? Math.round((Math.min(stepIndex + 1, example.steps.length) / example.steps.length) * 100) : 0;

  useEffect(() => {
    if (feedback?.type === "bad") {
      window.setTimeout(() => {
        feedbackRef.current?.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      }, 80);
    }
  }, [feedback]);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
    return () => window.cancelAnimationFrame(id);
  }, []);

  if (!example) return <div className="interactive-shell">لا توجد أمثلة بعد.</div>;

  function resetExample() {
    setStepIndex(0);
    setBoard([]);
    setFeedback(null);
    setLocked(false);
    setActiveTerm(null);
    setShowHint(false);
  }

  function nextExample() {
    setExampleIndex((i) => (i + 1) % examples.length);
    setStepIndex(0);
    setBoard([]);
    setFeedback(null);
    setLocked(false);
    setActiveTerm(null);
    setShowHint(false);
  }

  function handleAnswer(value: string) {
    if (locked || done || !step) return;
    if (value === step.answer) {
      setLocked(true);
      setShowHint(false);
      const reward = String(step.reward || "إجابة صحيحة. ننتقل إلى الخطوة التالية.")
        .replace(/!+/g, ".")
        .replace(/\.{2,}/g, ".")
        .trim();
      setFeedback({ type: "ok", text: reward });
      setBoard((prev) => [...prev, step.boardText || value]);
      setTimeout(() => {
        setStepIndex((i) => i + 1);
        setFeedback(null);
        setLocked(false);
      }, 1100);
    } else {
        setFeedback({ type: "bad", text: wrongFeedbackFor(value, step, example, stepIndex) });
    }
  }

  return (
    <div className="interactive-shell start-learning-refined" dir="rtl">
      <section className="interactive-card addictive-learning-card activity-frame start-activity-frame">
        <header className="interactive-topline clean-learning-topline start-page-header">
          <div className="start-coach-copy">
            <span className="start-page-eyebrow">تجربة تمهيدية قصيرة</span>
            <strong>ابنِ الإعراب خطوة خطوة</strong>
            <span>{example.topic}</span>
          </div>
          <button type="button" onClick={nextExample} className="soft-mini-btn start-new-example-btn">مثال جديد</button>
        </header>

        <p className="start-page-intro">اقرأ الجملة، ثم أجب عن سؤال واحد في كل خطوة.</p>

        <section className={`learning-focus-box activity-workspace ${done ? "is-finished" : ""}`}>
          <div className="start-sticky-progress" aria-label="تقدم صفحة البداية">
            <div className="start-sticky-progress-top">
              <strong>{done ? "اكتمل المثال" : `الخطوة ${Math.min(stepIndex + 1, example.steps.length)} من ${example.steps.length}`}</strong>
              <span>{done ? "100%" : `${visualProgress}%`}</span>
            </div>
            <div className="start-sticky-progress-bar"><i style={{ width: `${done ? 100 : Math.max(7, visualProgress)}%` }} /></div>
          </div>
          {!done ? (
            <section className="start-example-card" aria-label="الجملة المطلوب تحليلها">
              <p className="start-example-sentence">
                <HighlightedSentence sentence={example.sentence} target={example.target} />
              </p>
            </section>
          ) : null}

          {!done ? (
            <div className="compact-step-zone refined-step-zone">
              <section className="start-question-card" aria-labelledby="start-current-question">
                <span className="step-lead">{getStepLead(stepIndex, step)}</span>
                <h1 id="start-current-question">
                  <SmartText text={refinedQuestion(example, step, stepIndex)} onTerm={setActiveTerm} />
                </h1>
                <p className="start-choice-instruction">اختر الإجابة:</p>
              </section>

              <div className="drag-choices compact-choices" role="group" aria-labelledby="start-current-question">
                {choices.map((choice) => (
                  <button type="button"
                    key={choice}
                    disabled={locked}
                    onClick={() => handleAnswer(choice)}
                    className="drag-choice"
                  >
                    {toStudentArabicOption(choice)}
                  </button>
                ))}
              </div>

              <div className="start-help-row">
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
                <div className="step-hint start-visible-hint" role="status">
                  <strong>تلميح</strong>
                  <p><SmartText text={refinedHint(example, step, stepIndex)} onTerm={setActiveTerm} /></p>
                </div>
              ) : null}

              {feedback ? (
                <div ref={feedbackRef} className={`feedback-pop inline-feedback ${feedback.type === "ok" ? "ok" : "bad"}`}>
                  <strong>{feedback.type === "ok" ? "صحيح" : "راجع الإجابة"}</strong>
                  <SmartText text={feedback.text} onTerm={setActiveTerm} />
                </div>
              ) : null}

            </div>
          ) : (
            <section className="result-card addictive-result-card start-finish-card" aria-live="polite">
              <div className="start-celebration-mark" aria-hidden="true">✓</div>
              <div className="success-badge">✓ {START_END_COPY.title}</div>
              <h2>{example.result}</h2>

              <details className="start-result-more">
                <summary>عرض التفسير والاقتراحات</summary>
                <p className="start-finish-body">{START_END_COPY.body}</p>
                <div className="start-next-topics" aria-label="اقتراحات المتابعة">
                  <div className="start-topic-grid start-stage-grid-horizontal">
                    {START_END_COPY.nextTopics.map((item) => (
                      <a key={item.href} className="start-topic-card" href={item.href}>
                        <strong>{item.label}</strong>
                      </a>
                    ))}
                  </div>
                </div>
              </details>

              <div className="result-actions">
                <a className="btn btn-primary" href={example.nextHref || example.continueHref || START_END_COPY.primaryHref}>{example.nextLabel || example.continueLabel || START_END_COPY.primaryLabel}</a>
                <a className="btn secondary" href={START_END_COPY.secondaryHref}>{START_END_COPY.secondaryLabel}</a>
                <button type="button" className="btn btn-soft" onClick={resetExample}>{START_END_COPY.retryLabel}</button>
              </div>
            </section>
          )}
        </section>

        <details className="i3rab-board addictive-board compact-build-board activity-progress-details">
          <summary className="board-title-row">
            <h2>مسار القرار الإعرابي</h2>
            <span>{progress}%</span>
          </summary>
          <div className="board-progress"><span style={{ width: `${progress}%` }} /></div>
          {board.length === 0 ? <p className="muted">سيظهر كل قرار هنا بعد اختياره.</p> : null}
          <div className="board-steps">
            {board.map((item, i) => <span key={i}>{i + 1}. {item}</span>)}
          </div>
        </details>

        {activeTerm ? (
          <div className="smart-popover start-smart-popover" role="dialog">
            <button type="button" className="smart-popover-close" onClick={() => setActiveTerm(null)}>×</button>
            <strong>{activeTerm}</strong>
            <ul>{START_GLOSSARY[activeTerm]?.map((line) => <li key={line}>{line}</li>)}</ul>
          </div>
        ) : null}
      </section>
    </div>
  );
}
