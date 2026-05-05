"use client";

import { useMemo } from "react";
import { getReadyTopics, getTopicRoutes } from "../lib/topics";
import { useAuthUser } from "./components/useAuthUser";

const featureCards = [
  { title: "مسار بصري قبل الحل", text: "يرى الطالب طريق الإعراب كاملًا قبل أن يبدأ، فيفهم لماذا ينتقل من خطوة إلى أخرى.", icon: "🧭" },
  { title: "تلميحات موجّهة", text: "تظهر التلميحات عند الحاجة لتقود الطالب إلى طريقة التفكير الصحيحة دون تشتيت.", icon: "💡" },
  { title: "اختبار سهل التعامل", text: "أسئلة منظمة مثل النماذج، بخيارات متوازنة ومراجعة نهائية بعد التسليم.", icon: "📝" },
];

export default function HomePage() {
  const { isAuthenticated } = useAuthUser();
  const readyTopics = useMemo(() => getReadyTopics(), []);
  const featuredTopic = readyTopics[0] ?? null;
  const featuredRoutes = featuredTopic ? getTopicRoutes(featuredTopic.code) : null;
const gatedHref = (href) => (isAuthenticated ? href : "/auth");

  return (
    <div className="landing-page luxe-home-page">
      <section className="luxe-hero card">
        <div className="luxe-hero-bg" />
        <div className="luxe-hero-copy">
          <img src="/brand-wordmark.svg" alt="خوارزمية الإعراب" className="luxe-wordmark" />
          <h1>تعلّم الإعراب خطوة بخطوة</h1>
          <p className="luxe-hero-lead">
            منصة تفاعلية تساعد الطالب على الوصول إلى الإعراب بنفسه عبر أسئلة متتابعة،
            مسارات بصرية، وتلميحات تظهر عند الحاجة.
          </p>
          <div className="luxe-hero-actions">
            <a href={gatedHref("/learn/start")} className="btn luxe-primary">
  ابدأ بالتعلّم
</a>
            <a href={gatedHref(featuredRoutes?.learn || "/topics")} className="btn luxe-primary">ابدأ التعلّم الآن</a>
            <a href={gatedHref(featuredRoutes?.paths || "/paths")} className="btn luxe-soft">شاهد المسار البصري</a>
            <a href={isAuthenticated ? "/dashboard" : "/auth"} className="btn luxe-ghost">لوحتي</a>
          </div>
        </div>
        <div className="luxe-hero-mark" aria-hidden="true">
          <img src="/brand-icon.svg" alt="" />
        </div>
      </section>

      <section className="luxe-feature-grid">
        {featureCards.map((card) => (
          <article className="card luxe-feature-card" key={card.title}>
            <span className="luxe-feature-icon">{card.icon}</span>
            <h2>{card.title}</h2>
            <p>{card.text}</p>
          </article>
        ))}
      </section>

      <section className="card luxe-topic-strip">
        <div>
          <span className="section-kicker">الموضوع المقترح</span>
          <h2>{featuredTopic?.name_ar || "ابدأ من أول مسار"}</h2>
          <p>{featuredTopic?.desc || "اختر موضوعًا لتبدأ رحلة الإعراب بطريقة منظمة."}</p>
        </div>
        <div className="luxe-topic-actions">
          {featuredRoutes ? <a href={gatedHref(featuredRoutes.paths)} className="btn luxe-soft">المسار البصري</a> : null}
          {featuredRoutes ? <a href={gatedHref(featuredRoutes.learn)} className="btn luxe-primary">تعلّم</a> : null}
        </div>
      </section>
    </div>
  );
}
