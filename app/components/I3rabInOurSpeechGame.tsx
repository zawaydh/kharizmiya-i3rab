"use client";

import React from "react";
import {
  I3RAB_IN_OUR_SPEECH_ROUNDS,
  type SpeechGameRound,
} from "../../content/games/i3rab_in_our_speech";

const CORRECT_ENCOURAGEMENT = [
  "اختيار صحيح. أكمل الفراغ التالي.",
  "ربط صحيح بين الموقع وصورة الكلمة.",
  "أحسنت الاختيار. تابع الجولة.",
  "إجابة صحيحة. انتقل إلى الفراغ التالي.",
];

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
          aria-label={`الفراغ ${indexInRound + 1}${answer ? `: ${answer}` : ""}`}
        >
          <small aria-hidden="true">{indexInRound + 1}</small>
          <b>{answer || "ــــــ"}</b>
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
  const encouragement = CORRECT_ENCOURAGEMENT[(roundIndex + blankIndex) % CORRECT_ENCOURAGEMENT.length];

  function choose(value: string) {
    if (!activeBlank || finished || solvedCurrent || feedback) return;

    if (value !== activeBlank.correct) {
      setWrongChoice(value);
      setFeedback({ tone: "wrong", text: activeBlank.wrongFeedback });
      return;
    }

    setWrongChoice(null);
    setAnswers((current) => ({ ...current, [activeBlank.id]: value }));
    setFeedback({ tone: "correct", text: activeBlank.feedback });
  }

  function acknowledgeFeedback() {
    if (!feedback || !activeBlank) return;

    if (feedback.tone === "correct") {
      setBlankIndex((current) => current + 1);
    }

    setFeedback(null);
    setWrongChoice(null);
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
    <div className="speech-game-page speech-game-page-compact" dir="rtl">
      <section className="card speech-game-card speech-game-card-unified">
        <header className="speech-game-compact-head">
          <h1>الإعراب في كلامنا</h1>
          <p>أكمل الجملة باختيار الصيغة الصحيحة.</p>
        </header>

        <div className="speech-game-meta" aria-label="موضعك في اللعبة">
          <span>
            الجولة {roundIndex + 1} من {rounds.length}
            {!finished ? ` — الفراغ ${blankIndex + 1} من ${round.blanks.length}` : " — اكتملت الجولة"}
          </span>
        </div>

        <div className="speech-game-swap-zone" aria-live="polite">
          {!feedback && !finished && activeBlank ? (
            <div className="speech-game-challenge speech-game-challenge-direct">
              <div className="speech-game-sentence">
                {renderRound(round, blankIndex, answers)}
              </div>
              <div className="speech-game-question">اختر الصيغة المناسبة:</div>
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
              className={`speech-game-feedback-screen ${
                feedback.tone === "correct" ? "is-correct" : "is-wrong"
              }`}
              role="status"
            >
              {feedback.tone === "correct" ? (
                <div className="speech-game-correct-pop" aria-label="إجابة صحيحة">
                  <span aria-hidden="true">✓</span>
                  <strong>صحيح</strong>
                </div>
              ) : null}

              <h2>
                {feedback.tone === "correct"
                  ? encouragement
                  : "اقتربت من الإجابة. اقرأ السبب ثم حاول من جديد."}
              </h2>
              <p>{feedback.text}</p>

              <strong className="speech-game-return-copy">
                {feedback.tone === "correct"
                  ? "عُد وأكمل فراغات النص."
                  : "عُد إلى النص واختر الصورة التي تناسب هذا الموقع."}
              </strong>
              <button type="button" className="btn btn-primary speech-game-ok-btn" onClick={acknowledgeFeedback}>
                حسنًا
              </button>
            </div>
          ) : null}

          {finished ? (
            <div className="speech-game-finished speech-game-finished-inline">
              <span>أكملت الجولة</span>
              <h2>أكملت الجملة وربطت كل كلمة بموقعها الصحيح.</h2>
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
                  تابع إلى جولة جديدة
                </button>
                <a href="/learn/start" className="btn btn-soft">
                  ابدأ التعلّم الموجّه
                </a>
                <button type="button" className="btn btn-soft" onClick={restart}>
                  أعد هذه الجولة
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
