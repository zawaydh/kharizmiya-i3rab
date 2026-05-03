"use client";

import { useMemo } from "react";
import { getReadyTopics, getTopicRoutes } from "../lib/topics";
import { useAuthUser } from "./components/useAuthUser";

const studentCards = [
  {
    title: "اختَر كلمة واحدة",
    text: "لا نحل الجملة دفعة واحدة؛ نبدأ بالكلمة الهدف حتى لا يتشتّت الطالب.",
    icon: "🎯",
  },
  {
    title: "اتبع السؤال التالي",
    text: "كل إجابة تفتح خطوة جديدة: نوع الكلمة، موقعها، ثم علامة الإعراب.",
    icon: "🧭",
  },
  {
    title: "افهم سبب الإعراب",
    text: "التلميحات تظهر عند الحاجة لتشرح لماذا اخترنا هذا المسار.",
    icon: "💡",
  },
];

export default function HomePage() {
  const { isAuthenticated } = useAuthUser();
  const readyTopics = useMemo(() => getReadyTopics(), []);
  const featuredTopic = readyTopics[0] ?? null;
  const featuredRoutes = featuredTopic ? getTopicRoutes(featuredTopic.code) : null;
  const gatedHref = (href) => (isAuthenticated ? href : "/auth");

  return (
    <div className="landing-shell student-home">
      <section className="student-hero card">
        <div className="student-hero-bg" />
        <div className="student-logo-wrap">
          <img
            src="/logo-khwarizmia-main-new.png"
            alt="شعار خوارزمية الإعراب"
            className="student-main-logo"
          />
        </div>

        <h1 className="student-title">خوارزمية الإعراب</h1>
        <p className="student-tagline">مدرّب تفكير نحوي موجّه</p>

        <p className="student-lead">
          تعلّم الإعراب بطريقة هادئة وجذّابة: اختر الكلمة الهدف، اتبع المسار،
          ثم اكتشف كيف وصلت إلى الإعراب الكامل خطوة بخطوة.
        </p>

        <div className="student-actions">
          <a href={gatedHref("/topics")} className="btn btn-primary student-primary-btn">
            ابدأ التعلّم الآن
          </a>
          <a href={gatedHref("/paths")} className="btn btn-soft student-secondary-btn">
            شاهد المسار البصري
          </a>
          {isAuthenticated ? (
            <a href="/dashboard" className="btn btn-soft student-secondary-btn">لوحتي</a>
          ) : (
            <a href="/auth" className="btn btn-soft student-secondary-btn">تسجيل الدخول</a>
          )}
        </div>
      </section>

      <section className="student-cards-grid">
        {studentCards.map((card) => (
          <article className="student-card card" key={card.title}>
            <div className="student-card-icon">{card.icon}</div>
            <h2>{card.title}</h2>
            <p>{card.text}</p>
          </article>
        ))}
      </section>

      <section className="student-start-panel card">
        <div>
          <div className="section-kicker">رحلة قصيرة للطالب</div>
          <h2>من الرؤية إلى الإتقان</h2>
          <p>
            ابدأ بالمسار البصري لتفهم الطريق، ثم انتقل إلى التعلّم والتدرّب،
            وبعدها اختبر نفسك عندما يكتمل الاستعداد.
          </p>
        </div>
        {featuredTopic && featuredRoutes ? (
          <div className="student-topic-callout">
            <span>الموضوع المقترح</span>
            <strong>{featuredTopic.name_ar}</strong>
            <a href={gatedHref(featuredRoutes.learn)} className="btn btn-primary">ابدأ هذا الموضوع</a>
          </div>
        ) : null}
      </section>
    </div>
  );
}
