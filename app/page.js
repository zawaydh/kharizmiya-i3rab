"use client";

export default function HomePage() {
  return (
    <div className="landing-page luxe-home-page">
      <section className="luxe-hero card">
        <div className="luxe-hero-bg" />
        <div className="luxe-hero-copy">
          <div className="platform-name-chip">منصة خوارزمية الإعراب</div>
          <img src="/brand-wordmark.svg" alt="منصة خوارزمية الإعراب" className="luxe-wordmark" />
          <h1 className="luxe-method-title">
            <span className="luxe-method-title-main">مدرّب تفكير نحوي موجّه</span>
            <span className="luxe-method-title-sub">الإعراب خطوات؛ كل خطوة تفتح مسارًا وتغلق آخر.</span>
          </h1>
          <p className="luxe-hero-lead">
            لا نعطي الطالب الإعراب جاهزًا؛ بل ندربه على اكتشاف موقع الكلمة، والتمييز بين الاحتمالات، ثم نقل ما تعلّمه إلى جمل ونصوص غير مشكولة.
          </p>
          <div className="luxe-thinking-sequence" aria-label="تسلسل التفكير الإعرابي">
            <span>نوع الكلمة</span><b aria-hidden="true">←</b>
            <span>الدور في المعنى</span><b aria-hidden="true">←</b>
            <span>الوظيفة</span><b aria-hidden="true">←</b>
            <span>الحكم</span><b aria-hidden="true">←</b>
            <span>العلامة</span><b aria-hidden="true">←</b>
            <span>الضبط في النص</span>
          </div>
          <div className="luxe-hero-actions luxe-hero-actions-single">
            <a href="/learn/start" className="btn luxe-primary main-cta addictive-cta">ابدأ تدريب التفكير</a>
          </div>
        </div>
        <div className="luxe-hero-mark" aria-hidden="true">
          <img src="/brand-icon.svg" alt="" />
        </div>
      </section>

      <section className="card home-learning-journey">
        <div className="home-journey-head">
          <span className="section-kicker">رحلتك في كل موضوع</span>
          <h2>ثلاث مراحل للإتقان، ثم تختار خطوتك التالية</h2>
          <p>تبدأ بمساعدة كاملة، ثم تقل المساعدة تدريجيًا حتى تطبق باستقلال داخل الاختبار والنصوص.</p>
        </div>

        <div className="home-core-stages" aria-label="المراحل الأساسية">
          <article className="home-stage-card">
            <span className="home-stage-number">1</span>
            <h3>تعلّم</h3>
            <p>اكتشف مسار التفكير خطوة خطوة مع التلميحات والتغذية الراجعة.</p>
          </article>
          <i aria-hidden="true">←</i>
          <article className="home-stage-card">
            <span className="home-stage-number">2</span>
            <h3>تدرّب</h3>
            <p>طبّق ما فهمته في أمثلة أسرع وبمساعدة أقل.</p>
          </article>
          <i aria-hidden="true">←</i>
          <article className="home-stage-card">
            <span className="home-stage-number">3</span>
            <h3>اختبر نفسي</h3>
            <p>حل باستقلال، واكتشف مواضع القوة والضعف.</p>
          </article>
        </div>

        <div className="home-after-quiz">
          <div className="home-after-title">بعد الاختبار اختر ما يناسبك</div>
          <div className="home-after-grid">
            <article><strong>لعبة النصوص</strong><span>اضبط كلمات نص غير مشكول اعتمادًا على الموقع الإعرابي.</span></article>
            <article><strong>عالج ضعفي</strong><span>تدرّب على المهارات التي أخطأت فيها بأمثلة جديدة.</span></article>
            <article><strong>تحميل الشهادة</strong><span>احتفظ بشهادة إتمام الموضوع بعد النجاح.</span></article>
          </div>
        </div>
      </section>
    </div>
  );
}
