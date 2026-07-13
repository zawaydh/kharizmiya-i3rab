"use client";

export default function HomePage() {
  return (
    <div className="landing-page luxe-home-page">
      <section className="luxe-hero card">
        <div className="luxe-hero-bg" />
        <div className="luxe-hero-copy">
          <img src="/brand-wordmark.svg" alt="خوارزمية الإعراب" className="luxe-wordmark" />
          <h1 className="luxe-method-title">
            <span className="luxe-method-title-main">الإعراب خطوات</span>
            <span className="luxe-method-title-sub">كل خطوة تفتح مسارًا وتغلق آخر.</span>
          </h1>
          <p className="luxe-hero-lead">
            لا نقدّم لك إعرابًا جاهزًا؛ بل تعمل مع مدرّب تفكير نحوي موجّه يبني معك القرار من نوع الكلمة ودورها إلى الحكم والعلامة.
          </p>
          <div className="luxe-thinking-sequence" aria-label="تسلسل التفكير الإعرابي">
            <span>نوع الكلمة</span><b aria-hidden="true">←</b>
            <span>الدور في المعنى</span><b aria-hidden="true">←</b>
            <span>الوظيفة</span><b aria-hidden="true">←</b>
            <span>الحكم</span><b aria-hidden="true">←</b>
            <span>العلامة</span>
          </div>
          <div className="luxe-hero-actions luxe-hero-actions-single">
            <a href="/learn/start" className="btn luxe-primary main-cta addictive-cta">ابدأ تدريب التفكير</a>
          </div>
        </div>
        <div className="luxe-hero-mark" aria-hidden="true">
          <img src="/brand-icon.svg" alt="" />
        </div>
      </section>
    </div>
  );
}
