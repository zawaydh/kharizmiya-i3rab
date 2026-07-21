"use client";

import { useEffect, useState } from "react";
import { getTopicProgress } from "../../lib/db";
import { useAuthUser } from "./useAuthUser";

const DEFAULT_TEXT = {
  practice: "أكمل التعلّم الموجّه أولًا، ثم افتح التدريب.",
  quiz: "أكمل التعلّم الموجّه والتدريب أولًا، ثم افتح الاختبار النهائي.",
  certificate: "الشهادة تظهر بعد إكمال التعلّم الموجّه والتدريب والنجاح في الاختبار النهائي.",
  texts: "تفتح لعبة النصوص بعد إنهاء الاختبار النهائي مرة واحدة على الأقل.",
};

export default function StageAccessGate({ topicCode, level = 2, require = "learn", children }) {
  const { isAuthenticated, isLoading } = useAuthUser();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;

    async function check() {
      if (isLoading) return;
      if (!isAuthenticated) {
        setStatus("auth");
        return;
      }
      if (!topicCode || require === "learn") {
        setStatus("allowed");
        return;
      }

      try {
        const row = await getTopicProgress(topicCode, level);
        const learnOk = Boolean(row?.learn_completed || Number(row?.percent) >= 100);
        const practiceOk = Boolean(row?.practice_completed || Number(row?.practice_percent) >= 100);
        const quizOk = Boolean(row?.quiz_passed);
        const quizAttempted = Number(row?.quiz_total || 0) > 0;
        const allowed =
          require === "practice"
            ? learnOk
            : require === "quiz"
              ? learnOk && practiceOk
              : require === "certificate"
                ? learnOk && practiceOk && quizOk
                : require === "texts"
                  ? learnOk && practiceOk && quizAttempted
                  : true;
        if (active) setStatus(allowed ? "allowed" : "blocked");
      } catch {
        if (active) setStatus("blocked");
      }
    }

    check();
    return () => {
      active = false;
    };
  }, [isLoading, isAuthenticated, topicCode, level, require]);

  if (status === "allowed") return children;

  if (status === "loading" || isLoading) {
    return <div className="student-flow-gate card">جارٍ التحقق من التقدم...</div>;
  }

  const nextLearn = topicCode ? `/learn/${topicCode}` : "/topics";
  const nextPractice = topicCode ? `/train/${topicCode}` : "/topics";
  const nextQuiz = topicCode ? `/quiz/${topicCode}` : "/topics";

  return (
    <section className="student-flow-gate card card-glow" dir="rtl">
      <span className="mini-kicker">خطوة ناقصة</span>
      <h1>{DEFAULT_TEXT[require] || "أكمل الخطوة السابقة أولًا."}</h1>
      <div className="student-flow-gate-actions">
        {require === "practice" ? <a className="btn btn-primary" href={nextLearn}>اذهب إلى التعلّم الموجّه</a> : null}
        {require === "quiz" || require === "certificate" ? <a className="btn btn-primary" href={nextPractice}>اذهب إلى التدريب</a> : null}
        {require === "texts" ? <a className="btn btn-primary" href={nextQuiz}>اذهب إلى الاختبار النهائي</a> : null}
        <a className="btn btn-soft" href="/dashboard">لوحتي</a>
      </div>
    </section>
  );
}
