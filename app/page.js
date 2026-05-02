"use client";

import { useMemo } from "react";
import { getReadyTopics, getTopicRoutes } from "../lib/topics";
import { useAuthUser } from "./components/useAuthUser";

const processSteps = [
  { num: "01", title: "حدّد الكلمة الهدف", text: "لا نشتت الطالب بإعراب الجملة كاملة؛ نبدأ بكلمة واحدة داخل سياق واضح." },
  { num: "02", title: "اتبع الأسئلة", text: "كل اختيار يفتح خطوة جديدة، والطالب يتعلم لماذا وصل إلى الحكم لا ما هو الحكم فقط." },
  { num: "03", title: "راجع السبب", text: "بعد النتيجة تظهر طريقة الوصول للإعراب مع تدريب خفيف على العنصر المرتبط." },
];

const highlights = [
  { title: "مسارات بصرية", text: "رؤية الشجرة قبل التطبيق لتقليل الحفظ العشوائي." },
  { title: "تلميحات موجّهة", text: "التلميح يظهر عند الخطأ ليقود الطالب للسؤال الصحيح." },
  { title: "تدرّج وقياس", text: "تعلم، تدرّب، اختبار، ثم متابعة للتقدم والتغطية." },
];

export default function HomePage() {
  const { isAuthenticated } = useAuthUser();
  const readyTopics = useMemo(() => getReadyTopics(), []);
  const featuredTopic = readyTopics[0] ?? null;
  const featuredRoutes = featuredTopic ? getTopicRoutes(featuredTopic.code) : null;
  const gatedHref = (href) => (isAuthenticated ? href : "/auth");

  return (
    <div className="brand-home-shell">
      <section className="brand-hero-card">
        <div className="brand-hero-glow brand-hero-glow-a" />
        <div className="brand-hero-glow brand-hero-glow-b" />

        <div className="brand-hero-logo-wrap" aria-label="شعار خوارزمية الإعراب">
          <img src="/logo.svg" alt="شعار خوارزمية الإعراب" className="brand-hero-logo" />
        </div>

        <div className="brand-hero-content">
          <p className="brand-kicker">مدرّب تفكير نحوي موجّه</p>
          <h1>تعلّم الإعراب خطوة بخطوة</h1>
          <p className="brand-hero-lead">
            خوارزمية الإعراب منصة تفاعلية تساعد الطالب على الوصول إلى الإعراب
            بنفسه عبر أسئلة متتابعة، مسارات بصرية، وتلميحات تظهر عند الحاجة.
          </p>

          <div className="brand-hero-actions">
            <a href={gatedHref("/topics")} className="btn brand-primary-btn">ابدأ التعلم الآن</a>
            <a href={gatedHref("/paths")} className="btn brand-soft-btn">شاهد المسار البصري</a>
            {isAuthenticated ? (
              <a href="/dashboard" className="btn brand-soft-btn">لوحتي</a>
            ) : (
              <a href="/auth" className="btn brand-soft-btn">تسجيل الدخول</a>
            )}
          </div>
        </div>
      </section>

      <section className="brand-feature-grid" aria-label="مزايا خوارزمية الإعراب">
        {highlights.map((item) => (
          <article key={item.title} className="brand-feature-card">
            <h2>{item.title}</h2>
            <p>{item.text}</p>
          </article>
        ))}
      </section>

      <section className="brand-method-card">
        <div className="section-kicker">كيف تعمل المنصة؟</div>
        <h2>من الحفظ إلى التفكير النحوي</h2>
        <div className="brand-steps-grid">
          {processSteps.map((step) => (
            <article key={step.num} className="brand-step-card">
              <span>{step.num}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="brand-topic-card">
        <div>
          <div className="section-kicker">الموضوع المقترح</div>
          <h2>{featuredTopic ? featuredTopic.name_ar : "ابدأ من أول مسار جاهز"}</h2>
          <p>
            {featuredTopic
              ? featuredTopic.desc
              : "سيظهر هنا أول موضوع جاهز للتعلم والتدرب بمجرد إضافته إلى القائمة."}
          </p>
        </div>
        {featuredTopic && featuredRoutes ? (
          <div className="brand-topic-actions">
            <a className="btn brand-primary-btn" href={gatedHref(featuredRoutes.learn)}>تعلّم</a>
            <a className="btn brand-soft-btn" href={gatedHref(featuredRoutes.paths)}>المسار البصري</a>
          </div>
        ) : null}
      </section>

      <section className="brand-seo-card">
        <h2>تعلم الإعراب بطريقة منظمة</h2>
        <p>
          إذا كان الطالب يجد صعوبة في إعراب الجملة الاسمية أو الفعلية، فإن
          خوارزمية الإعراب تقوده من تحديد نوع الكلمة إلى معرفة موقعها وعلامة
          إعرابها. يتدرّب الطالب على المبتدأ والخبر، الفاعل، المفعول به، الفعل
          الماضي، الفعل المضارع، وفعل الأمر عبر مسار واضح وتغذية راجعة موجّهة.
        </p>
      </section>
    </div>
  );
}
