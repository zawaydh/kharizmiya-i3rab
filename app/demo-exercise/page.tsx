"use client";

import React from "react";
import { demoTree } from "../../content/trees/demoTree";
import { createInitialState } from "../../lib/exercise/state";
import { chooseAnswer } from "../../lib/exercise/engine";

const MODES = ["learn", "practice", "quiz"] as const;
type Mode = (typeof MODES)[number];

export default function DemoExercisePage() {
  const [mode, setMode] = React.useState<Mode>("learn");

  const [state, setState] = React.useState(() =>
    createInitialState({
      mode: "learn",
      level: 1,
      startNodeId: demoTree.startNodeId,
    })
  );

  const node = demoTree.nodes[state.currentNodeId];

  const [blockedMsg, setBlockedMsg] = React.useState<string | null>(null);
  const [feedback, setFeedback] = React.useState<{
    isCorrect: boolean;
    showHint: boolean;
    revealCorrectness: boolean;
  } | null>(null);

  function reset(nextMode?: Mode) {
    const m = nextMode ?? mode;
    setState(
      createInitialState({
        mode: m,
        level: 1,
        startNodeId: demoTree.startNodeId,
      })
    );
    setBlockedMsg(null);
    setFeedback(null);
  }

  function cycleMode() {
    const idx = MODES.indexOf(mode);
    const nextMode = MODES[(idx + 1) % MODES.length];
    setMode(nextMode);
    reset(nextMode);
  }

  function onPick(answerId: string) {
    const res = chooseAnswer({ state, tree: demoTree, answerId });
    setState(res.nextState);
    setFeedback(res.feedback ?? null);
    setBlockedMsg(res.blocked ? "غير مسموح (requires)" : null);
  }

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1>Demo Exercise</h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button
          onClick={cycleMode}
          style={{ padding: 10, borderRadius: 10, border: "1px solid #ccc", cursor: "pointer" }}
        >
          mode: {mode} (اضغط للتبديل)
        </button>

        <button
          onClick={() => reset()}
          style={{ padding: 10, borderRadius: 10, border: "1px solid #ccc", cursor: "pointer" }}
        >
          Reset
        </button>
      </div>

      <div style={{ opacity: 0.75, marginBottom: 10 }}>
        node: {state.currentNodeId}
      </div>

      {blockedMsg && (
        <div style={{ padding: 10, background: "#fff3cd", marginBottom: 10 }}>
          {blockedMsg}
        </div>
      )}

      {node.type === "question" ? (
        <>
          <div style={{ fontSize: 18, marginBottom: 12 }}>{node.text}</div>

          <div style={{ display: "grid", gap: 8 }}>
            {node.answers.map((a) => (
              <button
                key={a.id}
                onClick={() => onPick(a.id)}
                style={{
                  padding: 10,
                  border: "1px solid #ccc",
                  borderRadius: 10,
                  cursor: "pointer",
                  textAlign: "right",
                }}
              >
                {a.text}
              </button>
            ))}
          </div>

          {/* feedback rules */}
          {feedback && (
            <div style={{ marginTop: 12 }}>
              {feedback.revealCorrectness && (
                <div>{feedback.isCorrect ? "✅ صحيح" : "❌ خطأ"}</div>
              )}

              {node.hint && feedback.showHint && (
                <div style={{ marginTop: 6 }}>💡 {node.hint}</div>
              )}

              {mode === "quiz" && (
                <div style={{ marginTop: 6, opacity: 0.8 }}>
                  (Quiz: لا نعرض صحيح/خطأ ولا تلميح أثناء الحل)
                </div>
              )}

              {mode === "practice" && !feedback.isCorrect && (
                <div style={{ marginTop: 6, opacity: 0.9 }}>
                  (Practice: لازم تختار الإجابة الصحيحة حتى تكمل)
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          <div style={{ fontSize: 18 }}>{node.text}</div>

          <div style={{ marginTop: 10, opacity: 0.8 }}>
            flags: {JSON.stringify(state.flags)}
          </div>

          {mode === "quiz" && (
            <div style={{ marginTop: 10, opacity: 0.8 }}>
              quiz results: {JSON.stringify(state.correctNodeIds)}
            </div>
          )}
        </>
      )}
    </div>
  );
}