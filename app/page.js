"use client";


import { useMemo } from "react";
import { getReadyTopics, getTopicRoutes } from "../lib/topics";
import { useAuthUser } from "./components/useAuthUser";

const journeySteps = [
  { title: "افتح المسار", text: "ابدأ من الخريطة البصرية حتى ترى الطريق قبل التطبيق.", icon: "🧭" },
  { title: "تابع العقد", text: "انتقل مع الأسئلة خطوة خطوة حتى تصل إلى الإعراب النهائي.", icon: "🧩" },
  { title: "تعلّم ← تدرّب ← اختبر", text: "طبّق التسلسل الكامل حتى يثبت التفكير النحوي في ذهن الطالب.", icon: "🚀" },
];

const highlights = [
  { value: "مسارات تفاعلية", label: "رؤية بصرية قبل التطبيق" },
  { value: "تسلسل واضح", label: "مسار ← تعلّم ← تدرّب ← اختبار" },
  { value: "شهادة", label: "بعد استكمال الشروط والنجاح" },
];

export default function HomePage() {
  const { isAuthenticated } = useAuthUser();
  const readyTopics = useMemo(() => getReadyTopics(), []);
  const featuredTopic = readyTopics[0] ?? null;
  const featuredRoutes = featuredTopic ? getTopicRoutes(featuredTopic.code) : null;
  const gatedHref = (href) => (isAuthenticated ? href : "/auth");

  return (
    <div className="home-shell modern-home-shell">
      <section className="home-hero modern-hero card card-glow glass-hero home-hero-clean home-hero-logo-only hero-logo-focus">
        <div className="hero-orb hero-orb-a" />
        <div className="hero-orb hero-orb-b" />

        <div className="home-brand-mark home-brand-mark-plain home-brand-mark-large home-brand-mark-visible">
          <img src="/logo-khwarizmia-main-new.png" alt="شعار خوارزمية الإعراب" className="home-brand-logo contain-logo home-brand-logo-boost" />
        </div>

        <div className="home-cta-row modern-home-cta-row compact-home-cta">
          <a href={gatedHref("/paths")} className="btn btn-primary btn-hero">ابدأ من المسارات</a>
          <a href={gatedHref("/paths")} className="btn btn-soft">صفحة المسارات</a>
          {isAuthenticated ? <a href="/dashboard" className="btn btn-soft">لوحتي</a> : <a href="/auth" className="btn btn-soft">تسجيل الدخول</a>}
        </div>

        <div className="hero-highlight-strip hero-highlight-grid">
          {highlights.map((item) => (
            <div key={item.label} className="hero-highlight-item">
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="home-feature-grid home-feature-grid-tight">
        <article className="card modern-info-card card-glow-soft">
          <div className="section-kicker">رحلة الطالب</div>
          <h2 className="home-card-title">ابدأ من المسار البصري</h2>
          <div className="journey-steps-grid">
            {journeySteps.map((step, index) => (
              <div key={step.title} className="journey-step-card">
                <div className="journey-step-top">
                  <span className="journey-step-icon">{step.icon}</span>
                  <span className="journey-step-index">{index + 1}</span>
                </div>
                <strong>{step.title}</strong>
                <p>{step.text}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="card featured-topic-card card-glow-soft">
          <div className="section-kicker">الموضوع المقترح</div>
          <h2 className="home-card-title">ابدأ من هذا الباب</h2>
          {featuredTopic && featuredRoutes ? (
            <>
              <div className="featured-topic-name">{featuredTopic.name_ar}</div>
              <div className="featured-topic-subtitle">{featuredTopic.subtitle}</div>
              <p className="p">{featuredTopic.desc}</p>
              <div className="featured-topic-actions">
                <a className="btn btn-primary" href={gatedHref(featuredRoutes.paths)}>المسارات أولًا</a>
                <a className="btn btn-soft" href={gatedHref(featuredRoutes.learn)}>ابدأ التعلّم</a>
              </div>
            </>
          ) : (
            <p className="p">سيظهر هنا أول مسار جاهز تلقائيًا.</p>
          )}
        </article>
      </section>

      <section className="home-value-grid home-value-grid-modern">
        <article className="card value-card value-card-accent">
          <div className="value-icon">👁️</div>
          <h3>الطالب يرى الطريق</h3>
          <p>صفحة المسارات تسبق التطبيق، لذلك لا يدخل الطالب التمرين دون تصور بصري للمسار.</p>
        </article>

        <article className="card value-card value-card-accent">
          <div className="value-icon">🧠</div>
          <h3>تفكير نحوي منظّم</h3>
          <p>كل خطوة في الشجرة تقود إلى الخطوة التالية حتى يصل الطالب إلى الحكم النهائي بثبات.</p>
        </article>

        <article className="card value-card value-card-accent">
          <div className="value-icon">📈</div>
          <h3>متابعة تقدّمك</h3>
          <p>ارجع إلى لوحتك في أي وقت لمعرفة ما أنجزته في المسارات والتعلّم والتدرّب والاختبار.</p>
        </article>
      </section>
    </div>
  );
}
