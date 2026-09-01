import type { Metadata } from "next";
import Link from "next/link";
import "../styles/83-home-glossary.css";
import { PLATFORM_NAME, PLATFORM_TAGLINE } from "../../lib/brand";

export const metadata: Metadata = {
  title: "عن المنصة",
  description: `${PLATFORM_NAME}: ${PLATFORM_TAGLINE}. منصة تساعد الطالب على فهم خطوات الوصول إلى الإعراب بطريقة تفاعلية ومتدرجة.`,
};

export default function AboutPage() {
  return (
    <div className="landing-page home-clean-page">
      <section className="card home-clean-journey" aria-labelledby="about-title">
        <div className="home-clean-section-head">
          <span className="section-kicker">عن {PLATFORM_NAME}</span>
          <h1 id="about-title">تعلّم الإعراب عبر التفكير التفاعلي لا التلقين</h1>
        </div>

        <div className="home-clean-after">
          <p className="home-entry-lead">
            {PLATFORM_NAME} منصة تعليمية تساعد الطالب على فهم طريقة الوصول إلى الإعراب،
            لا حفظ الإجابة فقط. تقوده خطوة خطوة ليحدد نوع الكلمة ووظيفتها في الجملة،
            ثم يستنتج حكمها ويختار علامة الإعراب المناسبة.
          </p>
        </div>
      </section>

      <section className="card home-clean-journey" aria-labelledby="about-learning-title">
        <div className="home-clean-section-head">
          <span className="section-kicker">كيف أتعلم؟</span>
          <h2 id="about-learning-title">مسار واضح في كل موضوع</h2>
        </div>

        <div className="home-clean-stages">
          <article className="home-clean-stage">
            <span>1</span>
            <div>
              <h3>تعلّم</h3>
              <p>افهم مسار الحل وسبب كل خطوة.</p>
            </div>
          </article>

          <article className="home-clean-stage">
            <span>2</span>
            <div>
              <h3>تدرّب</h3>
              <p>طبّق ما فهمته، واستفد من التلميحات عند الحاجة.</p>
            </div>
          </article>

          <article className="home-clean-stage">
            <span>3</span>
            <div>
              <h3>اختبر نفسك</h3>
              <p>حل باستقلال وتحقق من إتقانك.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="card home-learning-tools" aria-labelledby="about-tools-title">
        <div className="home-tools-heading">
          <span className="section-kicker">أدوات مساندة</span>
          <h2 id="about-tools-title">افهم الطريق وثبّت المهارة</h2>
        </div>

        <div className="home-tools-grid">
          <article className="home-tool-card home-tool-trainer">
            <span className="home-tool-number" aria-hidden="true">1</span>
            <div>
              <h3>المسارات البصرية</h3>
              <p>تُظهر تسلسل القرار الإعرابي بصورة مختصرة وواضحة.</p>
            </div>
          </article>

          <article className="home-tool-card home-tool-guide">
            <span className="home-tool-number" aria-hidden="true">2</span>
            <div>
              <h3>الألعاب</h3>
              <p>تمنحك فرصة إضافية لتثبيت المهارة بطريقة أخف بعد التعلّم والتدريب.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="card home-clean-journey" aria-labelledby="about-difference-title">
        <div className="home-clean-section-head">
          <span className="section-kicker">الفكرة الأساسية</span>
          <h2 id="about-difference-title">ليس المهم أن تعرف الإجابة فقط</h2>
        </div>

        <div className="home-clean-after">
          <h3>السؤال الذي نريد أن تتعلم الإجابة عنه:</h3>
          <p className="home-entry-lead"><strong>كيف وصلتُ إلى هذا الإعراب؟</strong></p>
          <p className="home-registration-note">
            عند الخطأ، تساعدك التلميحات والمراجعة على العودة إلى خطوات التفكير واكتشاف موضع الخطأ.
          </p>
        </div>

        <div className="home-entry-actions">
          <Link href="/guide" className="btn home-guide-primary">اقرأ تعليمات قبل التدريب</Link>
          <Link href="/topics" className="btn home-trainer-secondary">ابدأ بمدرّب التفكير</Link>
        </div>
      </section>
    </div>
  );
}