"use client";

import Link from "next/link";
import { useMemo } from "react";
import { getReadyTopics, getTopicRoutes } from "../lib/topics";
import { useAuthUser } from "./components/useAuthUser";

const features = [
  {
    title: "مسار تفكير واضح",
    text: "يسير الطالب في خطوات قصيرة: نوع الكلمة، موقعها، ثم الإعراب الكامل.",
    icon: "🧭",
  },
  {
    title: "معلّم لطيف عند الخطأ",
    text: "التلميح لا يعطي الجواب فقط؛ بل يشرح لماذا اختار الطالب هذا المسار.",
    icon: "💡",
  },
  {
    title: "اختبار يشبه النماذج",
    text: "أسئلة مريحة، خيارات متوازنة، مراجعة نهائية وسبب لكل إجابة.",
    icon: "📝",
  },
];

const quickSteps = [
  "اختر الموضوع",
  "اتبع الأسئلة",
  "افهم سبب الإعراب",
  "اختبر نفسك",
];

export default function HomePage() {
  const { isAuthenticated } = useAuthUser();
  const readyTopics = useMemo(() => getReadyTopics(), []);
  const featuredTopic = readyTopics[0] ?? null;
  const featuredRoutes = featuredTopic ? getTopicRoutes(featuredTopic.code) : null;
  const gatedHref = (href) => (isAuthenticated ? href : "/auth");

  return (
    <div className="student-home-page">
      <section className="student-hero-card">
        <div className="student-hero-glow" aria-hidden="true" />

        <div className="student-hero-copy">
          <div className="student-brand-lockup" aria-label="خوارزمية الإعراب">
            <img src="/brand-icon.svg" alt="" className="student-brand-icon" />
            <div>
              <h1>خوارزمية الإعراب</h1>
              <p>مدرّب تفكير نحوي موجّه</p>
            </div>
          </div>

          <h2>تعلّم الإعراب خطوة بخطوة، لا بالحفظ العشوائي</h2>
          <p className="student-hero-lead">
            منصة تفاعلية تساعد الطالب على الوصول إلى الإعراب بنفسه عبر أسئلة متتابعة،
            مسارات بصرية هادئة، وتلميحات تظهر عند الحاجة مثل معلّم يرافقه في كل خطوة.
          </p>

          <div className="student-hero-actions">
            <Link href={gatedHref(featuredRoutes?.learn || "/topics")} className="student-btn student-btn-primary">
              ابدأ التعلّم الآن
            </Link>
            <Link href={gatedHref(featuredRoutes?.paths || "/paths")} className="student-btn student-btn-secondary">
              شاهد المسار البصري
            </Link>
            <Link href={isAuthenticated ? "/dashboard" : "/auth"} className="student-btn student-btn-ghost">
              لوحتي
            </Link>
          </div>
        </div>

        <div className="student-hero-visual" aria-hidden="true">
          <div className="student-orbit-card">
            <img src="/brand-icon.svg" alt="" />
            <span>فكّر</span>
            <span>حلّل</span>
            <span>أعرب</span>
          </div>
        </div>
      </section>

      <section className="student-steps-strip" aria-label="كيف تعمل المنصة">
        {quickSteps.map((step, idx) => (
          <div className="student-step" key={step}>
            <span>{idx + 1}</span>
            <strong>{step}</strong>
          </div>
        ))}
      </section>

      <section className="student-feature-grid">
        {features.map((feature) => (
          <article className="student-feature-card" key={feature.title}>
            <span className="student-feature-icon">{feature.icon}</span>
            <h3>{feature.title}</h3>
            <p>{feature.text}</p>
          </article>
        ))}
      </section>

      <section className="student-topic-card">
        <div>
          <span className="student-kicker">الموضوع المقترح</span>
          <h3>{featuredTopic?.name_ar || "ابدأ من أول مسار"}</h3>
          <p>{featuredTopic?.desc || "اختر موضوعًا لتبدأ رحلة الإعراب بطريقة منظمة."}</p>
        </div>
        <div className="student-topic-actions">
          {featuredRoutes ? <Link href={gatedHref(featuredRoutes.paths)} className="student-btn student-btn-secondary">المسار البصري</Link> : null}
          {featuredRoutes ? <Link href={gatedHref(featuredRoutes.learn)} className="student-btn student-btn-primary">تعلّم</Link> : null}
        </div>
      </section>
    </div>
  );
}
