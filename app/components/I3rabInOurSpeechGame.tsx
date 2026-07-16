"use client";

import React from "react";
import {
  I3RAB_IN_OUR_SPEECH_ROUNDS,
  type SpeechGameRound,
} from "../../content/games/i3rab_in_our_speech";

function renderRound(
  round: SpeechGameRound,
  activeIndex: number,
  answers: Record<string, string>
) {
  const byId = new Map(round.blanks.map((blank) => [blank.id, blank]));

  return round.template
    .split(/(\{[a-zA-Z0-9_-]+\})/g)
    .filter(Boolean)
    .map((part, index) => {
      const match = part.match(/^\{([a-zA-Z0-9_-]+)\}$/);
      if (!match) return <React.Fragment key={`text-${index}`}>{part}</React.Fragment>;

      const id = match[1];
      const blank = byId.get(id);
      if (!blank) return <React.Fragment key={`missing-${id}`}>______</React.Fragment>;

      const indexInRound = round.blanks.findIndex((item) => item.id === id);
      const answer = answers[id];
      const active = indexInRound === activeIndex;

      return (
        <span
          key={id}
          className={`speech-game-blank ${
            answer ? "is-solved" : active ? "is-active" : "is-waiting"
          }`}
          aria-current={active ? "step" : undefined}
        >
          {answer || "ــــــــــــ"}
        </span>
      );
    });
}

export default function I3rabInOurSpeechGame() {
  const rounds = I3RAB_IN_OUR_SPEECH_ROUNDS;
  const [roundIndex, setRoundIndex] = React.useState(0);
  const [blankIndex, setBlankIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [feedback, setFeedback] = React.useState<{
    tone: "correct" | "wrong";
    text: string;
  } | null>(null);
  const [wrongChoice, setWrongChoice] = React.useState<string | null>(null);

  const round = rounds[roundIndex];
  const activeBlank = round.blanks[blankIndex] || null;
  const finished = blankIndex >= round.blanks.length;
  const solvedCurrent = Boolean(activeBlank && answers[activeBlank.id]);
  const roundProgress = ((roundIndex + (finished ? 1 : blankIndex / round.blanks.length)) / rounds.length) * 100;

  function choose(value: string) {
    if (!activeBlank || finished || solvedCurrent) return;

    if (value !== activeBlank.correct) {
      setWrongChoice(value);
      setFeedback({ tone: "wrong", text: activeBlank.wrongFeedback });
      return;
    }

    setWrongChoice(null);
    setAnswers((current) => ({ ...current, [activeBlank.id]: value }));
    setFeedback({ tone: "correct", text: activeBlank.feedback });
  }

  function continueStep() {
    if (!activeBlank) return;

    setAnswers((current) => ({
      ...current,
      [activeBlank.id]: activeBlank.correct,
    }));
    setFeedback(null);
    setWrongChoice(null);
    setBlankIndex((current) => current + 1);
  }

  function nextRound() {
    setRoundIndex((current) => (current + 1) % rounds.length);
    setBlankIndex(0);
    setAnswers({});
    setFeedback(null);
    setWrongChoice(null);
  }

  function restart() {
    setBlankIndex(0);
    setAnswers({});
    setFeedback(null);
    setWrongChoice(null);
  }

  return (
    <main className="speech-game-page" dir="rtl">
      <section className="card speech-game-hero">
        <span>مدخل تطبيقي لفكرة الخوارزمية</span>
        <h1>الإعراب في كلامنا</h1>
        <p>
          الكلمة أو الفعل واحد، لكن صورته تتغيّر عندما يتغيّر موقعه الإعرابي أو العامل الذي سبقه.
        </p>
        <div className="speech-game-algorithm" aria-label="تسلسل التفكير في اللعبة">
          <span>الموقع</span><i>←</i><span>الوظيفة</span><i>←</i><span>الحكم</span><i>←</i><span>العلامة</span><i>←</i><strong>الصورة الصحيحة</strong>
        </div>
      </section>

      <section className="card speech-game-card">
        <div className="speech-game-progress">
          <div>
            <span>النص {roundIndex + 1} من {rounds.length}</span>
            <small>{round.domain}</small>
          </div>
          <strong>{finished ? "اكتمل النص" : `الفراغ ${blankIndex + 1} من ${round.blanks.length}`}</strong>
        </div>
        <div className="speech-game-progress-track" aria-hidden="true">
          <i style={{ width: `${Math.max(4, roundProgress)}%` }} />
        </div>

        <div className="speech-game-round-head">
          <div>
            <span>{round.focus}</span>
            <h2>{round.title}</h2>
          </div>
          <em>اختر الصورة المناسبة للفراغ المضيء</em>
        </div>

        <div className="speech-game-sentence">
          {renderRound(round, blankIndex, answers)}
        </div>

        {!finished && activeBlank ? (
          <div className="speech-game-workspace">
            <div className="speech-game-question">
              أي صورة تلائم هذا الموقع في الجملة؟
            </div>
            <div className="speech-game-options">
              {round.choices.map((value) => (
                <button
                  key={value}
                  type="button"
                  disabled={solvedCurrent}
                  className={
                    wrongChoice === value
                      ? "is-wrong"
                      : answers[activeBlank.id] === value
                      ? "is-correct"
                      : ""
                  }
                  onClick={() => choose(value)}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {feedback && activeBlank ? (
          <div
            className={`speech-game-feedback ${
              feedback.tone === "correct" ? "is-correct" : "is-wrong"
            }`}
            aria-live="polite"
          >
            <span className="speech-game-feedback-role">{activeBlank.role}</span>
            <strong>
              {feedback.tone === "correct"
                ? "أحسنت، ربطت الصورة بالموقع الإعرابي"
                : "هذه الصورة لا تلائم هذا الموقع"}
            </strong>
            <p>{feedback.text}</p>
            <div className="speech-game-feedback-actions">
              <a href={activeBlank.learnHref} className="btn btn-soft">
                أكمل تعلّم {activeBlank.learnLabel}
              </a>
              <button type="button" className="btn btn-primary" onClick={continueStep}>
                تابع التحدي
              </button>
            </div>
          </div>
        ) : null}

        {finished ? (
          <div className="speech-game-finished">
            <span>الموقع غيّر الصورة، والخوارزمية فسّرت السبب</span>
            <h2>أكملت النص وربطت كل صورة بوظيفتها وحكمها وعلامتها.</h2>
            <div className="speech-game-solution-grid">
              {round.blanks.map((blank) => (
                <article key={blank.id}>
                  <strong>{blank.correct}</strong>
                  <small>{blank.role}</small>
                </article>
              ))}
            </div>
            <div className="speech-game-finished-actions">
              <button type="button" className="btn btn-primary" onClick={nextRound}>
                تابع إلى نص جديد
              </button>
              <a href="/learn/start" className="btn btn-soft">
                ابدأ التعلّم المنظّم
              </a>
              <button type="button" className="btn btn-soft" onClick={restart}>
                أعد هذا النص
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
