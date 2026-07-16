"use client";

export default function HomePage() {
  return (
    <div className="landing-page home-clean-page">
      <section className="card home-clean-hero home-balanced-hero">
        <div className="home-brand-column">
          <div className="home-clean-mark" aria-hidden="true">
            <img src="/brand-icon.svg" alt="" />
          </div>
          <div className="home-clean-kicker">مدرّب تفكير نحوي موجّه</div>
        </div>

        <div className="home-clean-copy home-message-column">
          <h1>الإعراب خطوات؛ كل خطوة تفتح مسارًا وتغلق آخر.</h1>
          <p className="home-entry-lead">ابدأ بتجربة قصيرة ترى فيها أثر الموقع الإعرابي في صورة الكلمة، ثم انتقل إلى التعلّم المنظّم.</p>
          <div className="home-entry-actions">
            <a href="/i3rab-in-our-speech" className="btn home-game-primary">جرّب الإعراب في كلامنا</a>
            <a href="/learn/start" className="btn home-learning-secondary">ابدأ التعلّم المنظّم</a>
          </div>
        </div>
      </section>

      <section className="card home-speech-game home-speech-explainer" aria-labelledby="speech-game-how-title">
        <div className="home-speech-game-copy">
          <span className="section-kicker">كيف تعمل التجربة؟</span>
          <h2 id="speech-game-how-title">اختر، ثم اكتشف السبب</h2>
          <p>تضع الصورة المناسبة في الجملة، ثم يربط التعليل بين الموقع أو العامل، والوظيفة، والحكم، ونوع الكلمة أو الفعل، والعلامة.</p>
        </div>
        <div className="home-speech-game-preview" aria-label="أمثلة على تغير الصورة">
          <span>المزارعونَ ← المزارعينَ</span>
          <i aria-hidden="true">•</i>
          <span>يكتبُ ← لن يكتبَ ← لم يكتبْ</span>
        </div>
      </section>

      <section className="card home-clean-journey" aria-labelledby="journey-title">
        <div className="home-clean-section-head">
          <span className="section-kicker">رحلتك في كل موضوع</span>
          <h2 id="journey-title">ثلاث مراحل واضحة</h2>
        </div>

        <div className="home-clean-stages">
          <article className="home-clean-stage">
            <span>1</span>
            <div><h3>تعلّم</h3><p>اكتشف مسار الحل خطوة خطوة.</p></div>
          </article>
          <article className="home-clean-stage">
            <span>2</span>
            <div><h3>تدرّب</h3><p>طبّق ما فهمته في أمثلة أسرع.</p></div>
          </article>
          <article className="home-clean-stage">
            <span>3</span>
            <div><h3>اختبر نفسي</h3><p>حل باستقلال وأثبت إتقانك.</p></div>
          </article>
        </div>

        <div className="home-clean-after">
          <h3>بعد الاختبار</h3>
          <div className="home-clean-after-grid">
            <article><strong>لعبة النصوص</strong><span>طبّق التشكيل والضبط داخل نص.</span></article>
            <article><strong>عالج ضعفي</strong><span>ارجع إلى موضع الخطأ وتدرّب عليه.</span></article>
            <article><strong>تحميل الشهادة</strong><span>احتفظ بشهادة إتمام الموضوع.</span></article>
          </div>
        </div>
      </section>
    </div>
  );
}
