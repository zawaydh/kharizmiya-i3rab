"use client";

import React from "react";
import { nominalAdvancedTree } from "../../../content/trees/nominal_advanced";
import { createInitialState } from "../../../lib/exercise/state";
import { chooseAnswer } from "../../../lib/exercise/engine";
import { nominalAdvancedExamples } from "../../../content/examples/nominal_advanced.examples";

type Mode = "learn" | "practice";

type Feedback = null | {
  correctId?: string;
  wrongId?: string;
  hint?: string;
};

export default function Page() {
  const [mode, setMode] = React.useState<Mode>("practice");
  const [exampleIndex, setExampleIndex] = React.useState(0);
  const [feedback, setFeedback] = React.useState<Feedback>(null);

  const example = nominalAdvancedExamples[exampleIndex];

  const [state, setState] = React.useState(() => {
    const s = createInitialState({
      mode: "learn",
      level: 2,
      startNodeId: nominalAdvancedTree.startNodeId,
    });

    return {
      ...s,
      currentExampleId: example?.id,
      currentSentence: example?.sentence,
      currentTarget: example?.target,
      facts: example?.facts,
      currentNodeId: nominalAdvancedTree.startNodeId,
      answers: {},
      attemptCount: {},
      flags: {},
    } as any;
  });

  // عندما يتغير المثال: نعيد ضبط الحالة لبداية الشجرة
  React.useEffect(() => {
    const ex = nominalAdvancedExamples[exampleIndex];
    if (!ex) return;

    setState((prev: any) => ({
      ...prev,
      currentExampleId: ex.id,
      currentSentence: ex.sentence,
      currentTarget: ex.target,
      facts: ex.facts,
      currentNodeId: nominalAdvancedTree.startNodeId,
      answers: {},
      attemptCount: {},
      flags: {},
    }));

    setFeedback(null);
  }, [exampleIndex]);

  const node: any = nominalAdvancedTree.nodes[state.currentNodeId];

  function isAnswerCorrect(answer: any): boolean {
    if (!answer) return false;
    if (answer.eval) {
      const v = state.facts?.[answer.eval.fact];
      return v === answer.eval.equals;
    }
    return !!answer.correct;
  }

  function onPick(answerId: string) {
    if (!node || node.type !== "question") return;

    const picked = node.answers.find((a: any) => a.id === answerId);
    const correctAnswer = node.answers.find((a: any) => isAnswerCorrect(a));
    const ok = isAnswerCorrect(picked);

    if (!ok) {
      // ✅ في learn + practice: نلوّن ونظهر تلميح
      // ✅ في practice: لا ننتقل حتى يختار الصحيح
      setFeedback({
        wrongId: answerId,
        correctId: mode === "learn" || mode === "practice" ? correctAnswer?.id : undefined,
        hint: node.hint,
      });
      return;
    }

    // ✅ الصحيح: ننتقل
    const res = chooseAnswer({
      state,
      tree: nominalAdvancedTree,
      answerId,
    } as any);

    setState(res.nextState as any);
    setFeedback(null);
  }

  function nextExample() {
    setExampleIndex((i) => {
      const next = i + 1;
      return next >= nominalAdvancedExamples.length ? 0 : next;
    });
  }


  function renderSentence(sentence?: string, target?: string) {
    if (!sentence) return null;
    if (!target || !sentence.includes(target)) return sentence;

    const parts = sentence.split(target);
    // Interleave parts with highlighted target (supports multiple occurrences)
    const out: React.ReactNode[] = [];
    for (let i = 0; i < parts.length; i++) {
      if (parts[i]) out.push(parts[i]);
      if (i !== parts.length - 1) {
        out.push(
          <span
            key={`t-${i}`}
            style={{
              textDecoration: "underline",
              fontWeight: 800,
              color: "#1d4ed8",
            }}
          >
            {target}
          </span>
        );
      }
    }
    return out;
  }

  return (
    <div style={{ maxWidth: 760, margin: "40px auto", padding: 16 }}>
      <h2 style={{ marginBottom: 10 }}>الجملة الاسمية — متقدم</h2>

      {/* وضع الصفحة */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <button
          onClick={() => setMode("learn")}
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            border: "1px solid #ccc",
            cursor: "pointer",
            background: mode === "learn" ? "#e6f7ff" : "white",
          }}
        >
          تعلّم
        </button>

        <button
          onClick={() => setMode("practice")}
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            border: "1px solid #ccc",
            cursor: "pointer",
            background: mode === "practice" ? "#e6f7ff" : "white",
          }}
        >
          تدرّب
        </button>
      </div>

      {/* الجملة */}
      <div
        style={{
          padding: 14,
          border: "1px solid #ddd",
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        <div style={{ opacity: 0.6, marginBottom: 6 }}>الجملة:</div>
        <div style={{ fontSize: 22 }}>{renderSentence(state.currentSentence, (state as any).currentTarget)}</div>
      </div>

      {/* المحتوى */}
      <div
        style={{
          padding: 16,
          border: "1px solid #ddd",
          borderRadius: 14,
        }}
      >
        {!node && <div>لا توجد عقدة</div>}

        {node?.type === "question" && (
          <>
            <div style={{ fontSize: 18, marginBottom: 12 }}>{node.text}</div>

            {node.answers.map((a: any) => {
              let bg = "white";

              if (feedback?.wrongId === a.id) bg = "#ffd6d6";
              if (feedback?.correctId === a.id) bg = "#d6ffd9";

              return (
                <button
                  key={a.id}
                  onClick={() => onPick(a.id)}
                  style={{
                    display: "block",
                    width: "100%",
                    marginBottom: 8,
                    padding: 12,
                    borderRadius: 12,
                    border: "1px solid #ccc",
                    textAlign: "right",
                    cursor: "pointer",
                    background: bg,
                  }}
                >
                  {a.text}
                </button>
              );
            })}

            {(mode === "learn" || mode === "practice") && feedback?.hint && (
              <div style={{ marginTop: 10, opacity: 0.8 }}>💡 {feedback.hint}</div>
            )}

            {/* في practice نكتب تنبيه واضح */}
            {mode === "practice" && feedback?.wrongId && (
              <div style={{ marginTop: 10, opacity: 0.9 }}>
                (تدرّب): يجب اختيار الإجابة الصحيحة حتى نكمل.
              </div>
            )}
          </>
        )}

        {node?.type === "result" && (
          <>
            <div style={{ whiteSpace: "pre-line" }}>{node.text}</div>
            <button
              onClick={nextExample}
              style={{
                marginTop: 14,
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid #ccc",
                cursor: "pointer",
              }}
            >
              المثال التالي
            </button>
          </>
        )}
      </div>
    </div>
  );
}