"use client";

export default function HomePage() {
  return (
    <div className="landing-page luxe-home-page">
      <section className="luxe-hero card">
        <div className="luxe-hero-bg" />
        <div className="luxe-hero-copy">
          <img src="/brand-wordmark.svg" alt="خوارزمية الإعراب" className="luxe-wordmark" />
          <h1>تعلّم الإعراب خطوة بخطوة</h1>
          <p className="luxe-hero-lead">
            تعلّم الإعراب عبر خطوات قصيرة: اقرأ السؤال، انقر على الإجابة الصحيحة، وشاهد مسار الإعراب يُبنى أمامك حتى تصل إلى النتيجة الكاملة.
          </p>
          <div className="luxe-hero-actions luxe-hero-actions-single">
            <a href="/learn/start" className="btn luxe-primary main-cta addictive-cta">ابدأ التعلّم</a>
          </div>
        </div>
        <div className="luxe-hero-mark" aria-hidden="true">
          <img src="/brand-icon.svg" alt="" />
        </div>
      </section>
    </div>
  );
}
