"use client";

import Link from "next/link";
import React from "react";
import { GameSuccessPop, gameBackLinkStyle, gameCompassStyle, gameKickerStyle, gameProgressStyle, gameShellStyle, gameThemeVars, gameWarmCardStyle } from "./games/GameVisualTheme";
import {
  WHO_WITH_ME_CYCLES,
  WHO_WITH_ME_GROUPS,
  WHO_WITH_ME_GROUP_GUIDANCE,
  WHO_WITH_ME_GROUP_LABELS,
  cardsForRound,
  type WhoWithMeCard,
  type WhoWithMeGroup,
} from "../../content/games/who-is-with-me";

type Feedback =
  | { tone: "wrong"; card: WhoWithMeCard }
  | { tone: "correct"; word: string }
  | null;

const POSITIVE = ["صح", "أحسنت", "من فريقك", "اختيار دقيق"];

export default function WhoIsWithMeGame() {
  const [cycleIndex, setCycleIndex] = React.useState(0);
  const [roundIndex, setRoundIndex] = React.useState(0);
  const [removedIds, setRemovedIds] = React.useState<Set<string>>(() => new Set());
  const [feedback, setFeedback] = React.useState<Feedback>(null);
  const [streak, setStreak] = React.useState(0);
  const [score, setScore] = React.useState(0);
  const [jumpingId, setJumpingId] = React.useState<string | null>(null);

  const cycle = WHO_WITH_ME_CYCLES[cycleIndex] ?? WHO_WITH_ME_CYCLES[0];
  const target = WHO_WITH_ME_GROUPS[roundIndex] ?? null;
  const cards = cycle && target ? cardsForRound(cycle, target) : [];
  const correctCards = target ? cards.filter((card) => card.group === target) : [];
  const collectedCards = correctCards.filter((card) => removedIds.has(card.id));
  const found = collectedCards.length;
  const roundComplete = Boolean(target) && found === correctCards.length && correctCards.length > 0;
  const cycleComplete = roundIndex >= WHO_WITH_ME_GROUPS.length;

  function clearRoundState() {
    setRemovedIds(new Set());
    setFeedback(null);
    setJumpingId(null);
    setStreak(0);
  }

  async function choose(card: WhoWithMeCard, button: HTMLButtonElement) {
    if (!target || removedIds.has(card.id) || jumpingId) return;

    if (card.group !== target) {
      setStreak(0);
      setFeedback({ tone: "wrong", card });
      return;
    }

    const nextStreak = streak + 1;
    setStreak(nextStreak);
    setScore((value) => value + 10 + (nextStreak >= 3 ? 5 : 0));
    setFeedback({ tone: "correct", word: card.word });
    setJumpingId(card.id);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduceMotion && typeof button.animate === "function") {
      const animation = button.animate(
        [
          { transform: "translateY(0) scale(1)", opacity: 1 },
          { transform: "translateY(-18px) scale(1.06)", opacity: 1, offset: 0.35 },
          { transform: "translateY(3px) scale(1.02)", opacity: 1, offset: 0.62 },
          { transform: "translateY(-32px) scale(.9)", opacity: 0 },
        ],
        { duration: 560, easing: "cubic-bezier(.2,.8,.2,1)" },
      );

      try {
        await animation.finished;
      } catch {
        // If motion is interrupted, still complete the correct selection.
      }
    }

    setRemovedIds((current) => new Set([...current, card.id]));
    setJumpingId(null);
    window.setTimeout(() => setFeedback((current) => current?.tone === "correct" ? null : current), 350);
  }

  function nextRound() {
    setRoundIndex((value) => value + 1);
    clearRoundState();
  }

  function restartCycle() {
    setRoundIndex(0);
    setScore(0);
    clearRoundState();
  }

  function nextCycle() {
    setCycleIndex((value) => (value + 1) % WHO_WITH_ME_CYCLES.length);
    setRoundIndex(0);
    setScore(0);
    clearRoundState();
  }

  if (!cycle) return <section className="card">لا توجد أمثلة متاحة بعد.</section>;

  const positiveMessage = POSITIVE[Math.floor(score / 10) % POSITIVE.length] ?? "صح";

  return (
    <div className="place-game-page game-theme-team" dir="rtl" style={gameThemeVars("team")}>
      <section className="card place-game-shell" style={gameShellStyle("team")}>
        <header className="place-game-header">
          <div>
            <span className="place-game-kicker" style={gameKickerStyle}>لعبة التصنيف الإعرابي</span>
            <h1>مَنْ مَعِي؟</h1>

          </div>
          <Link href="/games" className="place-game-back-link" style={gameBackLinkStyle}>كل الألعاب</Link>
        </header>

        <div className="place-game-status" aria-label="حالة اللعبة">
          <div className="place-game-status-item"><span>الدورة</span><strong>{cycleIndex + 1} من {WHO_WITH_ME_CYCLES.length}</strong></div>
          <div className="place-game-status-item is-score"><span>النقاط</span><strong>{score}</strong></div>
          <div className="place-game-status-item"><span>السلسلة</span><strong>{streak}</strong></div>
        </div>

        {!cycleComplete && target ? (
          <>
            <div className="place-game-compass" style={gameCompassStyle}>
              <div className="place-game-compass-copy">
                <span>{cycle.title}</span>
                <strong>الجولة {roundIndex + 1} من {WHO_WITH_ME_GROUPS.length}</strong>
              </div>
              <div className="place-game-progress-track" aria-hidden="true">
                <span style={{ width: `${((roundIndex + (roundComplete ? 1 : 0)) / WHO_WITH_ME_GROUPS.length) * 100}%`, ...gameProgressStyle }} />
              </div>

            </div>

            {!roundComplete ? (
              <section className="place-game-stage" aria-live="polite">
                <div className="place-game-word-card" style={gameWarmCardStyle}>
                  <span>اجمع فريقك</span>
                  <strong>مَنْ مَعِي؟ — {WHO_WITH_ME_GROUP_LABELS[target]}</strong>
                  <small>{WHO_WITH_ME_GROUP_GUIDANCE[target]}</small>
                </div>

                <div className="place-game-prompt">
                  <h2>اختر كل الكلمات التي تنتمي إلى {WHO_WITH_ME_GROUP_LABELS[target]}</h2>
                  <p>اقرأ السياق الصغير تحت الكلمة؛ فالموقع في الجملة هو الذي يحكم.</p>
                </div>

                <section
                  aria-label={`فريق ${WHO_WITH_ME_GROUP_LABELS[target]}`}
                  style={{
                    border: "1px dashed currentColor",
                    borderRadius: 18,
                    padding: 8,
                    marginBottom: 14,
                    minHeight: 58,
                    textAlign: "center",
                  }}
                >
                  <strong style={{ display: "block", marginBottom: 8 }}>
                    فريق {WHO_WITH_ME_GROUP_LABELS[target]} — {found} من {correctCards.length}
                  </strong>
                  {collectedCards.length ? (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 8,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      {collectedCards.map((card) => (
                        <span
                          key={`collected-${card.id}`}
                          className="games-hub-badge"
                          title={card.context}
                          style={{ fontWeight: 800 }}
                        >
                          ✓ {card.word}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <small>لم تنضم أي كلمة بعد. ابحث عن أول عضو في الفريق.</small>
                  )}
                </section>

                <div className="place-game-options" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
                  {cards.filter((card) => !removedIds.has(card.id)).map((card) => (
                    <button
                      key={card.id}
                      type="button"
                      onClick={(event) => choose(card, event.currentTarget)}
                      disabled={jumpingId === card.id}
                      aria-label={`${card.word}. ${card.context}`}
                      style={{ position: "relative" }}
                    >
                      <span aria-hidden="true">{jumpingId === card.id ? "✓" : "•"}</span>
                      <b>
                        <strong style={{ display: "block", fontSize: "1.1em" }}>{card.word}</strong>
                        <small style={{ display: "block", marginTop: 3, fontWeight: 500 }}>{card.context}</small>
                      </b>
                      {jumpingId === card.id ? (
                        <em style={{ position: "absolute", insetInlineEnd: 10, top: 6, fontStyle: "normal", fontWeight: 800 }}>صح ✓</em>
                      ) : null}
                    </button>
                  ))}
                </div>

                <div className="place-game-help-row">
                  <span className="games-hub-badge">وجدت {found} من {correctCards.length}</span>
                  <span className="games-hub-badge">الصحيح يقفز ثم ينضم إلى الفريق</span>
                </div>

                {feedback?.tone === "wrong" ? (
                  <section className="place-game-feedback is-wrong" role="alert">
                    <span className="place-game-wrong-mark place-game-success-mark" aria-hidden="true">×</span>
                    <span className="place-game-feedback-badge">ليست مع هذا الفريق</span>
                    <h2>{feedback.card.word}</h2>
                    <p>في الجملة: «{feedback.card.context}»</p>
                    <p>{feedback.card.reason}</p>
                    <div className="place-game-correction">
                      <span>مكانها الصحيح في هذه اللعبة</span>
                      <strong>{WHO_WITH_ME_GROUP_LABELS[feedback.card.group]}</strong>
                      <small>راجع الحكم في السياق، ولا تعتمد على شكل الحركة وحده.</small>
                    </div>
                    <button type="button" className="btn btn-primary" onClick={() => setFeedback(null)}>فهمت، أبحث من جديد</button>
                  </section>
                ) : null}

                <p aria-live="polite" style={{ minHeight: 24, textAlign: "center", margin: 0, fontWeight: 800 }}>
                  {feedback?.tone === "correct" ? <><GameSuccessPop inline />{`${positiveMessage} — انضمت ${feedback.word} إلى الفريق`}</> : ""}
                </p>
              </section>
            ) : (
              <section className="place-game-summary" role="status">
                <span className="place-game-summary-icon" aria-hidden="true">✓</span>
                <p className="place-game-kicker">اكتمل فريق {WHO_WITH_ME_GROUP_LABELS[target]}</p>
                <h2>جمعت الكلمات الصحيحة كلها.</h2>
                <p>{WHO_WITH_ME_GROUP_GUIDANCE[target]}</p>
                <button type="button" className="btn btn-primary" onClick={nextRound}>
                  {roundIndex + 1 < WHO_WITH_ME_GROUPS.length ? `إلى ${WHO_WITH_ME_GROUP_LABELS[WHO_WITH_ME_GROUPS[roundIndex + 1]!]}` : "إلى نتيجة الدورة"}
                </button>
              </section>
            )}
          </>
        ) : (
          <section className="place-game-summary" role="status">
            <span className="place-game-summary-icon" aria-hidden="true">★</span>
            <p className="place-game-kicker">اكتملت {cycle.title}</p>
            <h2>فرّقت بين الحكم الإعرابي والبناء والجزم.</h2>
            <p>مررت بالمنصوبات والمرفوعات والمجرورات، ثم فصلت المبني عن المعرب، وأخيرًا ميّزت المضارع المجزوم من الفعل المبني.</p>
            <div className="place-game-summary-stats">
              <article><strong>{score}</strong><span>نقطة</span></article>
              <article><strong>5</strong><span>فرق</span></article>
              <article><strong>{cycle.cards.length}</strong><span>كلمة في البنك</span></article>
            </div>
            <div className="place-game-summary-actions">
              <button type="button" className="btn btn-primary" onClick={nextCycle}>دورة جديدة بأمثلة أخرى</button>
              <button type="button" className="btn btn-soft" onClick={restartCycle}>أعد هذه الدورة</button>
              <Link href="/games" className="btn btn-soft">العودة إلى الألعاب</Link>
            </div>
          </section>
        )}
      </section>
    </div>
  );
}
