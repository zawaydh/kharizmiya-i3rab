"use client";

import Link from "next/link";
import React from "react";
import { GameSuccessPop, gameBackLinkStyle, gameCompassStyle, gameKickerStyle, gameProgressStyle, gameShellStyle, gameThemeVars, gameWarmCardStyle } from "./games/GameVisualTheme";
import {
  WHERE_IS_MY_PLACE_CYCLES,
  type PlaceGameChallenge,
  type PlaceGameChoice,
} from "../../content/games/where-is-my-place";

type FeedbackState =
  | { tone: "wrong"; choice: PlaceGameChoice }
  | { tone: "correct"; choice: PlaceGameChoice; points: number; bonus: number; badge: string | null }
  | null;

const ENCOURAGEMENTS = [
  "وجدتَ مكانها.",
  "بوصلة الإعراب تشير إلى الموقع الصحيح.",
  "اختيار دقيق؛ الحركة وافقت الموقع.",
  "أحسنت قراءة العلامة والموقع.",
];

function renderSentence(sentence: string, word?: string) {
  const [before = "", after = ""] = sentence.split("{word}");
  return (
    <>
      {before}
      {word ? <strong className="place-game-inserted-word">{word}</strong> : <span className="place-game-blank" aria-hidden="true">ــــــ</span>}
      {after}
    </>
  );
}

function scoreTitle(score: number, maximum: number) {
  const ratio = maximum > 0 ? score / maximum : 0;
  if (ratio >= 0.9) return "قائد بوصلة الإعراب";
  if (ratio >= 0.72) return "مستكشف إعرابي بارع";
  return "بوصلة تتقدم";
}

function scoreStars(score: number, maximum: number) {
  const ratio = maximum > 0 ? score / maximum : 0;
  if (ratio >= 0.88) return 3;
  if (ratio >= 0.65) return 2;
  return 1;
}

function streakBadge(streak: number) {
  if (streak === 7) return "وسام قائد المواقع";
  if (streak === 5) return "وسام قارئ العلامة";
  if (streak === 3) return "وسام السلسلة الذهبية";
  return null;
}

export default function WhereIsMyPlaceGame() {
  const cycles = WHERE_IS_MY_PLACE_CYCLES;
  const [cycleIndex, setCycleIndex] = React.useState(0);
  const [challengeIndex, setChallengeIndex] = React.useState(0);
  const [score, setScore] = React.useState(0);
  const [streak, setStreak] = React.useState(0);
  const [bestStreak, setBestStreak] = React.useState(0);
  const [hadWrongAttempt, setHadWrongAttempt] = React.useState(false);
  const [hintUsed, setHintUsed] = React.useState(false);
  const [feedback, setFeedback] = React.useState<FeedbackState>(null);
  const [hintVisible, setHintVisible] = React.useState(false);

  const cycle = cycles[cycleIndex] ?? cycles[0] ?? null;
  const challenge = cycle?.challenges[challengeIndex] ?? null;
  const completed = Boolean(cycle && challengeIndex >= cycle.challenges.length);
  const maximumScore = (cycle?.challenges.length ?? 0) * 120;
  const progress = cycle && cycle.challenges.length > 0
    ? Math.min(100, (challengeIndex / cycle.challenges.length) * 100)
    : 0;

  function choose(choice: PlaceGameChoice) {
    if (!challenge || feedback?.tone === "correct") return;

    if (choice.id !== challenge.correctChoiceId) {
      setHadWrongAttempt(true);
      setStreak(0);
      setFeedback({ tone: "wrong", choice });
      return;
    }

    const basePoints = hadWrongAttempt ? 60 : hintUsed ? 80 : 100;
    const nextStreak = streak + 1;
    const bonus = nextStreak >= 3 ? 20 : 0;
    const points = basePoints + bonus;
    setScore((current) => current + points);
    setStreak(nextStreak);
    setBestStreak((current) => Math.max(current, nextStreak));
    setFeedback({ tone: "correct", choice, points, bonus, badge: streakBadge(nextStreak) });
  }

  function retry() {
    setFeedback(null);
    setHintVisible(false);
  }

  function revealHint() {
    setHintUsed(true);
    setHintVisible(true);
  }

  function nextChallenge() {
    if (!cycle) return;
    setChallengeIndex((current) => Math.min(current + 1, cycle.challenges.length));
    setFeedback(null);
    setHintVisible(false);
    setHadWrongAttempt(false);
    setHintUsed(false);
  }

  function resetCycle() {
    setChallengeIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setFeedback(null);
    setHintVisible(false);
    setHadWrongAttempt(false);
    setHintUsed(false);
  }

  function nextCycle() {
    if (cycles.length === 0) return;
    setCycleIndex((current) => (current + 1) % cycles.length);
    resetCycle();
  }

  if (!cycle) return <section className="card">لا توجد دورات متاحة بعد.</section>;

  const earnedStars = scoreStars(score, maximumScore);

  return (
    <div className="place-game-page game-theme-place" dir="rtl" style={gameThemeVars("place")}>
      <section className="card place-game-shell" style={gameShellStyle("place")}>
        <header className="place-game-header">
          <div>
            <span className="place-game-kicker" style={gameKickerStyle}>مهمّة إنقاذ الكلمة</span>
            <h1>أين مكاني؟</h1>

          </div>
          <Link href="/games" className="place-game-back-link" style={gameBackLinkStyle}>كل الألعاب</Link>
        </header>

        <div className="place-game-status" aria-label="حالة الجولة">
          <div className="place-game-status-item"><span>الدورة</span><strong>{cycleIndex + 1} من {cycles.length}</strong></div>
          <div className="place-game-status-item is-score"><span>النقاط</span><strong>{score}</strong></div>
          <div className={`place-game-status-item ${streak >= 3 ? "is-hot" : ""}`}><span>السلسلة</span><strong>{streak} 🔥</strong></div>
        </div>

        <div className="place-game-compass" style={gameCompassStyle} aria-label={`تقدم الدورة ${Math.round(progress)} بالمئة`}>
          <div className="place-game-compass-copy">
            <span>خريطة الإنقاذ</span>
            <strong>{completed ? "اكتملت الدورة" : `${challengeIndex + 1} من ${cycle.challenges.length}`}</strong>
          </div>
          <div className="place-game-route" aria-label="محطات المهمة">
            {cycle.challenges.map((item, index) => {
              const state = index < challengeIndex ? "is-done" : index === challengeIndex && !completed ? "is-current" : "is-ahead";
              return <span key={item.id} className={state} aria-current={state === "is-current" ? "step" : undefined}>{state === "is-done" ? "✓" : index + 1}</span>;
            })}
          </div>
          <div className="place-game-progress-track" aria-hidden="true"><span style={{ width: `${completed ? 100 : progress}%`, ...gameProgressStyle }} /></div>

        </div>

        {!completed && challenge ? (
          <PlaceChallenge
            challenge={challenge}
            feedback={feedback}
            hintVisible={hintVisible}
            missionNumber={challengeIndex + 1}
            missionTotal={cycle.challenges.length}
            encouragement={ENCOURAGEMENTS[(challengeIndex + cycleIndex) % ENCOURAGEMENTS.length] ?? "أحسنت."}
            onChoose={choose}
            onRetry={retry}
            onShowHint={revealHint}
            onNext={nextChallenge}
          />
        ) : null}

        {completed ? (
          <section className="place-game-summary" role="status">
            <span className="place-game-summary-icon" aria-hidden="true">⌖</span>
            <p className="place-game-kicker">اكتملت {cycle.title}</p>
            <div className="place-game-stars" aria-label={`${earnedStars} من 3 نجوم`}>
              {[1, 2, 3].map((star) => <span key={star} className={star <= earnedStars ? "is-earned" : ""}>★</span>)}
            </div>
            <h2>{scoreTitle(score, maximumScore)}</h2>
            <p>أنقذت كلمات من موضوعات متنوعة، وربطت الحركة بالموقع الإعرابي بدل الاعتماد على المعنى وحده.</p>
            <div className="place-game-summary-stats">
              <article><strong>{score}</strong><span>نقطة</span></article>
              <article><strong>{bestStreak}</strong><span>أفضل سلسلة</span></article>
              <article><strong>{cycle.challenges.length}</strong><span>كلمات أُنقذت</span></article>
            </div>
            <div className="place-game-summary-actions">
              <button type="button" className="btn btn-primary" onClick={nextCycle}>افتح دورة جديدة</button>
              <button type="button" className="btn btn-soft" onClick={resetCycle}>أعد هذه الدورة</button>
              <Link href="/games" className="btn btn-soft">العودة إلى الألعاب</Link>
            </div>
          </section>
        ) : null}
      </section>
    </div>
  );
}

type PlaceChallengeProps = {
  challenge: PlaceGameChallenge;
  feedback: FeedbackState;
  hintVisible: boolean;
  missionNumber: number;
  missionTotal: number;
  encouragement: string;
  onChoose: (choice: PlaceGameChoice) => void;
  onRetry: () => void;
  onShowHint: () => void;
  onNext: () => void;
};

function PlaceChallenge({ challenge, feedback, hintVisible, missionNumber, missionTotal, encouragement, onChoose, onRetry, onShowHint, onNext }: PlaceChallengeProps) {
  return (
    <section className="place-game-stage" aria-live="polite">
      <div className="place-game-word-card" style={gameWarmCardStyle}>
        <span className="games-hub-badge place-game-mission-chip">المهمّة {missionNumber} من {missionTotal}</span>
        <span>الكلمة تبحث عن مكانها</span>
        <strong>{challenge.word}</strong>
        <small>{challenge.topic} — {challenge.skill}</small>
      </div>

      {!feedback ? (
        <>
          <div className="place-game-prompt">
            <h2>أي بوابة تقبل الكلمة بهذه الحركة؟</h2>
            <p>الجمل الثلاث مناسبة في المعنى، لكن الموقع الإعرابي يفتح بوابة واحدة فقط.</p>
          </div>
          <div className="place-game-options">
            {challenge.choices.map((choice, index) => (
              <button key={choice.id} type="button" onClick={() => onChoose(choice)}>
                <span aria-hidden="true">{index + 1}</span>
                <b>{renderSentence(choice.sentence)}</b>
              </button>
            ))}
          </div>
          <div className="place-game-feedback-actions place-game-reward-rules" aria-label="نظام النقاط">
            <span className="games-hub-badge">100 من أول محاولة</span><span className="games-hub-badge">80 مع الدليل</span><span className="games-hub-badge">60 بعد التصحيح</span>
          </div>
          <div className="place-game-help-row">
            <button type="button" className="place-game-hint-button" onClick={onShowHint} aria-expanded={hintVisible}>دليل ذكي</button>
            {hintVisible ? <p className="place-game-hint">{challenge.hint}</p> : null}
          </div>
        </>
      ) : null}

      {feedback?.tone === "wrong" ? (
        <div className="place-game-feedback is-wrong" role="alert">
          <span className="place-game-success-mark place-game-wrong-mark" aria-hidden="true">×</span>
          <span className="place-game-feedback-badge">هذه البوابة تحتاج صورة أخرى للكلمة</span>
          <h2>{renderSentence(feedback.choice.sentence, challenge.word)}</h2>
          <p>{feedback.choice.explanation}</p>
          <div className="place-game-correction">
            <span>الصورة التي تفتح هذه البوابة:</span>
            <strong>{feedback.choice.requiredForm}</strong>
            <small>{feedback.choice.role}</small>
          </div>
          <div className="place-game-feedback-actions">
            <button type="button" className="btn btn-primary" onClick={onRetry}>جرّب مكانًا آخر</button>
            <button type="button" className="btn btn-soft" onClick={onShowHint}>اعرض الدليل</button>
          </div>
          {hintVisible ? <p className="place-game-hint">{challenge.hint}</p> : null}
        </div>
      ) : null}

      {feedback?.tone === "correct" ? (
        <div className="place-game-feedback is-correct" role="status">
          <GameSuccessPop />
          <p className="place-game-kicker">تم إنقاذ الكلمة — {encouragement}</p>
          <h2>{renderSentence(feedback.choice.sentence, challenge.word)}</h2>
          <p>{feedback.choice.explanation}</p>
          {feedback.badge ? <strong className="games-hub-badge games-hub-badge-secondary place-game-badge-unlocked">فُتح {feedback.badge}</strong> : null}
          <div className="place-game-reward"><strong>+{feedback.points}</strong><span>نقطة للبوصلة</span></div>
          {feedback.bonus > 0 ? <small className="place-game-kicker place-game-combo-bonus">منها +{feedback.bonus} مكافأة السلسلة</small> : null}
          <button type="button" className="btn btn-primary" onClick={onNext}>إلى المهمّة التالية</button>
        </div>
      ) : null}
    </section>
  );
}
