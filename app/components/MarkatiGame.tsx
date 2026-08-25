"use client";

import Link from "next/link";
import React from "react";
import { GameSuccessPop, gameBackLinkStyle, gameCompassStyle, gameKickerStyle, gameProgressStyle, gameShellStyle, gameTargetStyle, gameThemeVars, gameWarmCardStyle } from "./games/GameVisualTheme";
import { MARKATI_ROUNDS, type MarkatiChoice } from "../../content/games/markati";

type Feedback = { choice: MarkatiChoice; correct: boolean } | null;

const FINAL_I3RAB_MARKS = /[\u064B-\u0652\u0670]+$/u;

function concealedI3rab(target: string) {
  return target.replace(FINAL_I3RAB_MARKS, "");
}

function sentenceWithTarget(sentence: string, target: string, revealI3rab: boolean) {
  const index = sentence.indexOf(target);
  if (index < 0) return sentence;
  const shownTarget = revealI3rab ? target : concealedI3rab(target);
  return <>{sentence.slice(0, index)}<mark className="markati-target" style={gameTargetStyle}>{shownTarget}</mark>{sentence.slice(index + target.length)}</>;
}

export default function MarkatiGame() {
  const [roundIndex, setRoundIndex] = React.useState(0);
  const [challengeIndex, setChallengeIndex] = React.useState(0);
  const [score, setScore] = React.useState(0);
  const [hadWrong, setHadWrong] = React.useState(false);
  const [feedback, setFeedback] = React.useState<Feedback>(null);

  const round = MARKATI_ROUNDS[roundIndex] ?? null;
  const challenge = round?.challenges[challengeIndex] ?? null;
  const roundComplete = Boolean(round) && challengeIndex >= (round?.challenges.length ?? 0);
  const gameComplete = roundIndex >= MARKATI_ROUNDS.length;
  const progress = gameComplete ? 100 : ((roundIndex + (roundComplete ? 1 : challengeIndex / Math.max(1, round?.challenges.length ?? 1))) / MARKATI_ROUNDS.length) * 100;

  function choose(choice: MarkatiChoice) {
    if (!challenge || feedback?.correct) return;
    const correct = choice.id === challenge.correctChoiceId;
    if (!correct) setHadWrong(true);
    if (correct) setScore((value) => value + (hadWrong ? 60 : 100));
    setFeedback({ choice, correct });
  }

  function nextChallenge() {
    setChallengeIndex((value) => value + 1);
    setFeedback(null);
    setHadWrong(false);
  }

  function nextRound() {
    setRoundIndex((value) => value + 1);
    setChallengeIndex(0);
    setFeedback(null);
    setHadWrong(false);
  }

  function restart() {
    setRoundIndex(0);
    setChallengeIndex(0);
    setScore(0);
    setFeedback(null);
    setHadWrong(false);
  }

  return (
    <div className="place-game-page game-theme-mark" dir="rtl" style={gameThemeVars("mark")}>
      <section className="card place-game-shell" style={gameShellStyle("mark")}>
        <header className="place-game-header">
          <div>
            <span className="place-game-kicker" style={gameKickerStyle}>لعبة العلامة الإعرابية</span>
            <h1>علامتي</h1>
            <p>الكلمة تخبرك بحكمها ونوعها، وأنت تربط بينهما لتختار العلامة. هنا نتدرّب على الأصلية والفرعية والمقدرة والحالات الخاصة.</p>
          </div>
          <Link href="/games" className="place-game-back-link" style={gameBackLinkStyle}>كل الألعاب</Link>
        </header>

        <div className="place-game-status">
          <div className="place-game-status-item"><span>الجولة</span><strong>{gameComplete ? MARKATI_ROUNDS.length : roundIndex + 1} من {MARKATI_ROUNDS.length}</strong></div>
          <div className="place-game-status-item is-score"><span>النقاط</span><strong>{score}</strong></div>
          <div className="place-game-status-item"><span>الفكرة</span><strong>الحكم + النوع</strong></div>
        </div>

        <div className="place-game-compass" style={gameCompassStyle}>
          <div className="place-game-compass-copy"><span>{gameComplete ? "اكتملت اللعبة" : round?.title}</span><strong>{Math.round(progress)}%</strong></div>
          <div className="place-game-progress-track" aria-hidden="true"><span style={{ width: `${progress}%`, ...gameProgressStyle }} /></div>
          <small>{gameComplete ? "أحسنت الربط بين الحكم والصورة والعلامة." : round?.subtitle}</small>
        </div>

        {!gameComplete && roundComplete ? (
          <section className="place-game-summary" role="status">
            <span className="place-game-summary-icon" aria-hidden="true">◆</span>
            <p className="place-game-kicker">اكتملت {round?.title}</p>
            <h2>عرفت العلامة من الحكم ونوع الاسم.</h2>
            <button type="button" className="btn btn-primary" onClick={nextRound}>الجولة التالية</button>
          </section>
        ) : null}

        {!gameComplete && !roundComplete && challenge ? (
          <section className="place-game-stage" aria-live="polite">
            <div className="place-game-word-card markati-sentence-card" style={{ ...gameWarmCardStyle, padding: "14px 16px" }}>
              <span>في الجملة:</span>
              <strong className="markati-sentence-text">{sentenceWithTarget(challenge.sentence, challenge.target, feedback?.correct === true)}</strong>
            </div>
            <div className="place-game-word-card markati-speaking-card" style={{ ...gameWarmCardStyle, padding: "19px 18px" }}>
              <span className="markati-quote" aria-hidden="true">❞</span>
              <p className="markati-speaking-line">تقول <strong>{feedback?.correct === true ? challenge.target : concealedI3rab(challenge.target)}</strong>:</p>
              <h2 className="markati-prompt">{challenge.prompt}</h2>
              <small style={{ color: "var(--game-accent-strong)", fontWeight: 750 }}>{challenge.roleLabel} — {challenge.caseLabel} — {challenge.kindLabel}</small>
            </div>

            {!feedback ? (
              <div className="place-game-options markati-options">
                {challenge.choices.map((item, index) => (
                  <button key={item.id} type="button" onClick={() => choose(item)} style={{ borderColor: "color-mix(in srgb, var(--game-accent) 30%, var(--clean-border-strong))" }}>
                    <span aria-hidden="true" style={{ color: "var(--game-accent-strong)", background: "var(--game-soft)" }}>{index + 1}</span>
                    <b>{item.label}</b>
                  </button>
                ))}
              </div>
            ) : feedback.correct ? (
              <section className="place-game-feedback is-correct" role="status">
                <GameSuccessPop />
                <p className="place-game-kicker">صح — ربطت الحكم بالنوع</p>
                <h2>{feedback.choice.label}</h2>
                <p>{feedback.choice.reason}</p>
                <div className="place-game-correction"><span>الإعراب الكامل</span><small>{challenge.finalI3rab}</small></div>
                <button type="button" className="btn btn-primary" onClick={nextChallenge}>الكلمة التالية</button>
              </section>
            ) : (
              <section className="place-game-feedback is-wrong" role="alert">
                <span className="place-game-success-mark place-game-wrong-mark" aria-hidden="true">×</span>
                <span className="place-game-feedback-badge">هذه العلامة لا تناسب النوع والحكم معًا</span>
                <p>{feedback.choice.reason}</p>
                <button type="button" className="btn btn-primary" onClick={() => setFeedback(null)}>أعد المحاولة</button>
              </section>
            )}
          </section>
        ) : null}

        {gameComplete ? (
          <section className="place-game-summary" role="status">
            <span className="place-game-summary-icon" aria-hidden="true">★</span>
            <p className="place-game-kicker">اكتملت «علامتي»</p>
            <h2>ربطت الحكم بصورة الاسم بدل حفظ حركة منفصلة.</h2>
            <p>مررت بالرفع والنصب والجر، ثم الحالات الخاصة: الأسماء الخمسة، المثنى والجمع، المقصور والمنقوص، والممنوع من الصرف، وحتى الاسم المبني في المحل.</p>
            <div className="place-game-summary-stats"><article><strong>{score}</strong><span>نقطة</span></article><article><strong>{MARKATI_ROUNDS.length}</strong><span>جولات</span></article><article><strong>{MARKATI_ROUNDS.reduce((sum, item) => sum + item.challenges.length, 0)}</strong><span>كلمة</span></article></div>
            <div className="place-game-summary-actions"><button type="button" className="btn btn-primary" onClick={restart}>أعد اللعبة</button><Link href="/games" className="btn btn-soft">كل الألعاب</Link></div>
          </section>
        ) : null}
      </section>
    </div>
  );
}
