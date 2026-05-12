"use client";

import React, { useMemo, useState } from "react";

/**
 * Backward-compatible TreeRunner:
 * - إذا استدعيت <TreeRunner tree={tree} /> سيعمل مثل السابق.
 *
 * إضافات اختيارية:
 * - mode: "default" | "learn" | "practice" | "quiz"
 * - onAttempt: (payload) => { allowAdvance?: boolean, isCorrect?: boolean, correctLabel?: string, feedback?: string }
 *
 * payload = { node, nodeId, option, ctx }
 *
 * الهدف:
 * - learn: بعد أول محاولة: الخاطئ أحمر + الصحيح أخضر + تلميح (feedback/node.hint)
 * - practice: مثل learn لكن يمنع التقدم حتى يختار الصحيح
 * - quiz: لا تلميح أثناء الحل (تقدر تجمع أخطاء عبر onAttempt خارج TreeRunner)
 */

function isObject(x) {
  return x !== null && typeof x === "object" && !Array.isArray(x);
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function applyActions(actions, ctx) {
  if (!Array.isArray(actions) || actions.length === 0) return ctx;

  const next = deepClone(ctx);
  next.flags ||= {};

  for (const a of actions) {
    if (!isObject(a) || typeof a.op !== "string") continue;

    if (a.op === "flag.set") {
      if (typeof a.key === "string" && a.key) next.flags[a.key] = a.value !== false;
    } else if (a.op === "flag.unset") {
      if (typeof a.key === "string" && a.key) delete next.flags[a.key];
    }
  }

  return next;
}

function checkRequires(expr, ctx) {
  if (expr == null) return true;
  if (!isObject(expr)) return true;

  if (Array.isArray(expr.all)) return expr.all.every((e) => checkRequires(e, ctx));
  if (Array.isArray(expr.any)) return expr.any.some((e) => checkRequires(e, ctx));
  if (expr.not) return !checkRequires(expr.not, ctx);

  if (typeof expr.flag === "string") {
    const wanted = "eq" in expr ? Boolean(expr.eq) : true;
    return Boolean(ctx?.flags?.[expr.flag]) === wanted;
  }

  return true;
}

function indexTree(tree) {
  const nodes = Array.isArray(tree?.nodes) ? tree.nodes : [];
  const byId = {};
  for (const n of nodes) {
    if (n && typeof n.id === "string") byId[n.id] = n;
  }

  const start =
    (tree?.topic?.entry_node && typeof tree.topic.entry_node === "string" && tree.topic.entry_node) ||
    nodes[0]?.id ||
    null;

  return { byId, start };
}

function BlockedResult({ targetId }) {
  return (
    <div style={{ padding: 16, border: "1px solid #eee", borderRadius: 12 }}>
      <h3 style={{ margin: "0 0 8px" }}>غير مسموح الوصول للنتيجة</h3>
      <p style={{ margin: 0, lineHeight: 1.7 }}>
        لا يمكنك الوصول لهذه النتيجة مباشرة. أكمل المسار خطوة بخطوة حتى تتحقق شروط الوصول.
      </p>
      <div style={{ marginTop: 10, opacity: 0.7, fontSize: 12 }}>Target: {targetId}</div>
    </div>
  );
}

export default function TreeRunner({
  tree,
  mode = "default", // "default" | "learn" | "practice" | "quiz"
  onAttempt, // optional evaluator
}) {
  const { byId, start } = useMemo(() => indexTree(tree), [tree]);

  const [ctx, setCtx] = useState({ flags: {} });
  const [history, setHistory] = useState(() => (start ? [start] : []));

  // حالة المحاولة الحالية (للتلوين والتلميح)
  const [attempt, setAttempt] = useState(null);
  // attempt = { nodeId, chosenLabel, isCorrect, correctLabel, feedback }

  const currentId = history.length ? history[history.length - 1] : null;
  const node = currentId ? byId[currentId] : null;

  function goTo(nextId, optionActions = []) {
    if (!nextId || typeof nextId !== "string") return;
    const nextNode = byId[nextId];
    if (!nextNode) return;

    setCtx((prev) => applyActions(optionActions, prev));
    setHistory((prev) => [...prev, nextId]);

    // عند الانتقال: امسح محاولة السؤال السابق
    setAttempt(null);
  }

  function back() {
    setHistory((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
    setAttempt(null);
  }

  function reset() {
    setCtx({ flags: {} });
    setHistory(start ? [start] : []);
    setAttempt(null);
  }

  if (!node) {
    return (
      <div style={{ padding: 16 }}>
        <div>لا توجد عقدة للعرض (تحقق من entry_node و IDs).</div>
        <button onClick={reset} style={{ marginTop: 12 }}>
          إعادة
        </button>
      </div>
    );
  }

  // منع القفز عبر requires على العقدة
  const allowed = checkRequires(node.requires, ctx);
  if (!allowed) {
    return (
      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button onClick={back} disabled={history.length <= 1}>
            رجوع
          </button>
          <button onClick={reset}>إعادة</button>
        </div>
        <BlockedResult targetId={node.id} />
      </div>
    );
  }

  const isResult = node.type === "result";

  const resultTitle = node.result_title || node.title || "النتيجة";
  const resultPoints = Array.isArray(node.result_points) ? node.result_points : null;

  const qText = node.question || node.prompt || node.title || "سؤال";
  const hint = node.hint;

  const isLearn = mode === "learn";
  const isPractice = mode === "practice";
  const isQuiz = mode === "quiz";
  const colorize = isLearn || isPractice;

  function chooseOption(opt) {
    // 1) لو يوجد evaluator (من تدريبات/مفاتيح) نستخدمه لتحديد صح/خطأ
    if (typeof onAttempt === "function") {
      const res = onAttempt({ node, nodeId: node.id, option: opt, ctx }) || {};
      const isCorrect = typeof res.isCorrect === "boolean" ? res.isCorrect : true;
      const correctLabel = typeof res.correctLabel === "string" ? res.correctLabel : null;
      const feedback = typeof res.feedback === "string" ? res.feedback : "";

      // في quiz: لا نعرض تلميح/تلوين (لكن نسجل المحاولة داخليًا إذا أحببت)
      if (!isQuiz) {
        setAttempt({
          nodeId: node.id,
          chosenLabel: opt.label,
          isCorrect,
          correctLabel,
          feedback,
        });
      } else {
        setAttempt(null);
      }

      // learn/practice: لا يتقدم إلا إذا allowAdvance=true (وغالبًا يكون true فقط عند الصحيح)
      const allowAdvance = res.allowAdvance !== false;

      if (!allowAdvance) {
        return; // ابق في نفس السؤال
      }

      // عند السماح: في learn/practice أنتِ اتفقتِ أن التقدم يكون عبر “الصحيح”؛
      // هذا المنطق يكون داخل onAttempt (يعني opt.next للصحيح فقط) أو تجهزين الشجرة.
      goTo(opt.next, opt.actions || []);
      return;
    }

    // 2) بدون evaluator: سلوك قديم طبيعي
    goTo(opt.next, opt.actions || []);
  }

  // لتلوين الأزرار عند الخطأ في learn/practice
  function getButtonStyle(opt) {
    const base = {
      padding: 12,
      borderRadius: 10,
      border: "1px solid #ddd",
      textAlign: "right",
      cursor: "pointer",
    };

    if (!colorize) return base;
    if (!attempt || attempt.nodeId !== node.id) return base;

    // إذا كانت الإجابة صحيحة: ممكن تلوين اختيار الطالب فقط (اختياري)
    if (attempt.isCorrect) {
      if (opt.label === attempt.chosenLabel) {
        return { ...base, border: "1px solid rgba(34,197,94,.7)" };
      }
      return base;
    }

    // إذا خطأ: الصحيح أخضر، المختار أحمر
    if (attempt.correctLabel && opt.label === attempt.correctLabel) {
      return { ...base, border: "1px solid rgba(34,197,94,.8)" };
    }
    if (opt.label === attempt.chosenLabel) {
      return { ...base, border: "1px solid rgba(239,68,68,.85)" };
    }

    return base;
  }

  const showFeedbackBox =
    (isLearn || isPractice) &&
    attempt &&
    attempt.nodeId === node.id &&
    attempt.isCorrect === false;

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button onClick={back} disabled={history.length <= 1}>
          رجوع
        </button>
        <button onClick={reset}>إعادة</button>
      </div>

      {isResult ? (
        <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
          <h3 style={{ margin: "0 0 10px" }}>{resultTitle}</h3>

          {resultPoints ? (
            <ul style={{ margin: 0, paddingInlineStart: 20, lineHeight: 1.8 }}>
              {resultPoints.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          ) : (
            <p style={{ margin: 0, lineHeight: 1.7, whiteSpace: "pre-line" }}>
              {node.text || node.result || ""}
            </p>
          )}
        </div>
      ) : (
        <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
          <h3 style={{ margin: "0 0 8px" }}>{qText}</h3>

          {/* hint العام يظهر في learn/practice قبل أو بعد المحاولة حسب رغبتك:
              - learn: يظهر دائمًا (تعليم)
              - practice: يظهر بعد المحاولة فقط (تدريب)
              - quiz: لا يظهر
          */}
          {(hint && isLearn) ? (
            <div
              style={{
                marginTop: 8,
                marginBottom: 12,
                padding: 10,
                borderRadius: 10,
                background: "#f7f7f7",
                fontSize: 14,
                lineHeight: 1.7,
              }}
            >
              {hint}
            </div>
          ) : null}

          {Array.isArray(node.options) && node.options.length > 0 ? (
            <div style={{ display: "grid", gap: 10 }}>
              {node.options.map((opt, idx) => (
                <button
                  key={`${opt.label || ""}-${idx}`}
                  onClick={() => chooseOption(opt)}
                  style={getButtonStyle(opt)}
                >
                  <strong style={{ marginInlineEnd: 8 }}>{opt.label}</strong>
                  {opt.text}
                </button>
              ))}
            </div>
          ) : (
            <div style={{ opacity: 0.7 }}>لا يوجد خيارات لهذه العقدة.</div>
          )}

          {/* feedback بعد المحاولة (learn/practice) */}
          {showFeedbackBox ? (
            <div
              style={{
                marginTop: 12,
                padding: 12,
                borderRadius: 12,
                border: "1px solid rgba(239,68,68,.25)",
                background: "rgba(239,68,68,.06)",
                lineHeight: 1.7,
                fontSize: 14,
              }}
            >
              <div style={{ fontWeight: 900, marginBottom: 6 }}>إجابة غير صحيحة</div>
              {isPractice ? (
                <div style={{ marginBottom: 6 }}>ارجع واختر الإجابة الصحيحة.</div>
              ) : null}
              {/* في practice نُظهر hint بعد المحاولة فقط */}
              {hint && isPractice ? <div style={{ marginBottom: 6 }}>{hint}</div> : null}
              {attempt.feedback ? <div>{attempt.feedback}</div> : null}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}