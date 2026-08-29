"use client";

import Link from "next/link";
import React from "react";
import { GameSuccessPop, gameBackLinkStyle, gameCompassStyle, gameKickerStyle, gameProgressStyle, gameShellStyle, gameTargetStyle, gameThemeVars, gameWarmCardStyle } from "./games/GameVisualTheme";
import {
  MAFoolKindLabels,
  MAFoolKinds,
  WHICH_MAFOOL_ROUNDS,
  challengesForMafoolRound,
  type MafoolGameKind,
} from "../../content/games/which-mafool";

type Feedback = { kind: MafoolGameKind; correct: boolean; points: number } | null;

function renderSentenceWithTarget(sentence: string, target: string) {
  const start = sentence.indexOf(target);
  if (start < 0) return sentence;
  return <>{sentence.slice(0, start)}<mark className="mafool-game-target" style={gameTargetStyle}>{target}</mark>{sentence.slice(start + target.length)}</>;
}

export default function WhichMafoolGame() {
  const [roundIndex, setRoundIndex] = React.useState(0);
  const [index, setIndex] = React.useState(0);
  const [score, setScore] = React.useState(0);
  const [hadWrong, setHadWrong] = React.useState(false);
  const [hintUsed, setHintUsed] = React.useState(false);
  const [hintVisible, setHintVisible] = React.useState(false);
  const [feedback, setFeedback] = React.useState<Feedback>(null);

  const round = WHICH_MAFOOL_ROUNDS[roundIndex] ?? null;
  const challenges = round ? challengesForMafoolRound(round) : [];
  const challenge = challenges[index] ?? null;
  const roundComplete = Boolean(round) && index >= challenges.length;
  const completed = roundIndex >= WHICH_MAFOOL_ROUNDS.length;
  const progress = completed ? 100 : ((roundIndex + (roundComplete ? 1 : index / Math.max(challenges.length, 1))) / WHICH_MAFOOL_ROUNDS.length) * 100;

  function choose(kind: MafoolGameKind) {
    if (!challenge || feedback?.correct) return;
    if (kind !== challenge.correctKind) {
      setHadWrong(true);
      setFeedback({ kind, correct: false, points: 0 });
      return;
    }
    const points = hadWrong ? 60 : hintUsed ? 80 : 100;
    setScore((value) => value + points);
    setFeedback({ kind, correct: true, points });
  }

  function next() {
    setIndex((value) => value + 1);
    setFeedback(null);
    setHadWrong(false);
    setHintUsed(false);
    setHintVisible(false);
  }

  function nextRound() {
    setRoundIndex((value) => value + 1);
    setIndex(0);
    setFeedback(null);
    setHadWrong(false);
    setHintUsed(false);
    setHintVisible(false);
  }

  function restart() {
    setRoundIndex(0);
    setIndex(0);
    setScore(0);
    setFeedback(null);
    setHadWrong(false);
    setHintUsed(false);
    setHintVisible(false);
  }

  return (
    <div className="place-game-page game-theme-mafool" dir="rtl" style={gameThemeVars("mafool")}>
      <section className="card place-game-shell" style={gameShellStyle("mafool")}>
        <header className="place-game-header">
          <div>
            <span className="place-game-kicker" style={gameKickerStyle}>تطبيق خوارزمية المفاعيل</span>
            <h1>أيُّ مفعول؟</h1>

          </div>
          <Link href="/games" className="place-game-back-link" style={gameBackLinkStyle}>كل الألعاب</Link>
        </header>

        <div className="place-game-status" aria-label="حالة اللعبة">
          <div className="place-game-status-item"><span>الجولة</span><strong>{completed ? WHICH_MAFOOL_ROUNDS.length : roundIndex + 1} من {WHICH_MAFOOL_ROUNDS.length}</strong></div>
          <div className="place-game-status-item is-score"><span>النقاط</span><strong>{score}</strong></div>
          <div className="place-game-status-item"><span>المسار</span><strong>5 فحوص</strong></div>
        </div>

        <div className="place-game-compass" style={gameCompassStyle} aria-label={`تقدم اللعبة ${Math.round(progress)} بالمئة`}>
          <div className="place-game-compass-copy"><span>{completed ? "اكتملت اللعبة" : round?.title}</span><strong>{Math.round(progress)}%</strong></div>
          <div className="place-game-progress-track" aria-hidden="true"><span style={{ width: `${progress}%`, ...gameProgressStyle }} /></div>

        </div>

        {!completed && roundComplete ? (
          <section className="place-game-summary" role="status">
            <span className="place-game-summary-icon" aria-hidden="true">5</span>
            <p className="place-game-kicker">اكتملت {round?.title}</p>
            <h2>مررت على الأنواع الخمسة دون تكرار مثال.</h2>
            <button type="button" className="btn btn-primary" onClick={nextRound}>الجولة التالية</button>
          </section>
        ) : null}

        {!completed && !roundComplete && challenge ? (
          <div className="place-game-stage">
            <div className="place-game-word-card mafool-game-sentence-card" style={gameWarmCardStyle}>
              <span>اقرأ الجملة أولًا — السؤال {index + 1} من {challenges.length}</span>
              <strong>{renderSentenceWithTarget(challenge.sentence, challenge.target)}</strong>
              <small>الكلمة المحددة: {challenge.target}</small>
            </div>

            {!feedback ? (
              <>
                <div className="place-game-prompt"><h2>ما نوع الكلمة المحددة من المفاعيل الخمسة؟</h2><p>طبّق التسلسل، ثم اختر النوع الذي تثبته القرينة.</p></div>
                <div className="place-game-options mafool-game-options">
                  {MAFoolKinds.map((kind, choiceIndex) => <button key={kind} type="button" onClick={() => choose(kind)}><span>{choiceIndex + 1}</span><b>{MAFoolKindLabels[kind]}</b></button>)}
                </div>
                <div className="place-game-help-row">
                  <button type="button" className="place-game-hint-button" onClick={() => { setHintUsed(true); setHintVisible(true); }}>دليل ذكي</button>
                  {hintVisible ? <p className="place-game-hint">{challenge.hint}</p> : null}
                </div>
              </>
            ) : feedback.correct ? (
              <section className="place-game-feedback is-correct" role="status">
                <GameSuccessPop />
                <p className="place-game-kicker">{MAFoolKindLabels[challenge.correctKind]}</p>
                <h2>صحيح؛ وصلت إلى النوع من القرينة.</h2>
                <p>{challenge.whyCorrect}</p>
                <div className="place-game-correction"><span>الإعراب الكامل</span><small>{challenge.finalI3rab}</small></div>
                <div className="place-game-reward"><strong>+{feedback.points}</strong><span>نقطة</span></div>
                <button type="button" className="btn btn-primary" onClick={next}>السؤال التالي</button>
              </section>
            ) : (
              <section className="place-game-feedback is-wrong" role="alert">
                <span className="place-game-feedback-badge">اخترتَ: {MAFoolKindLabels[feedback.kind]}</span>
                <h2>راجع هذا الفحص قبل أن تختار مرة أخرى.</h2>
                <p>{challenge.checks[feedback.kind]}</p>
                <button type="button" className="btn btn-primary" onClick={() => setFeedback(null)}>أعد المحاولة</button>
              </section>
            )}
          </div>
        ) : null}

        {completed ? (
          <section className="place-game-summary" role="status">
            <span className="place-game-summary-icon" aria-hidden="true">✓</span>
            <p className="place-game-kicker">اكتملت الجولات الثلاث</p>
            <h2>طبّقت التسلسل بدل التخمين.</h2>
            <p>بدأت بالأمثلة الواضحة، ثم ميّزت المتشابهات، ثم أنهيت التحدي المختلط بأمثلة جديدة.</p>
            <div className="place-game-summary-stats"><article><strong>{score}</strong><span>نقطة</span></article><article><strong>15</strong><span>مثالًا</span></article><article><strong>5</strong><span>أنواع</span></article></div>
            <div className="place-game-summary-actions"><button type="button" className="btn btn-primary" onClick={restart}>أعد اللعبة</button><Link href="/guide/mafoolat" className="btn btn-soft">تعليمات قبل التدريب</Link><Link href="/learn/mafoolat" className="btn btn-soft">تدرّب في المسار</Link></div>
          </section>
        ) : null}
      </section>
    </div>
  );
}
