import Image from "next/image";
import Link from "next/link";
import "./styles/83-home-glossary.css";
import { PLATFORM_TAGLINE } from "../lib/brand";

export default function HomePage() {
  return (
    <div className="landing-page home-clean-page">
      <section className="card home-clean-hero home-balanced-hero">
        <div className="home-brand-column">
          <div
            className="home-clean-mark"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", direction: "rtl" }}
          >
            <Image
              src="/brand-icon.svg"
              alt=""
              aria-hidden="true"
              width={112}
              height={112}
              priority
              style={{ width: "clamp(68px, 8vw, 104px)", height: "auto", flex: "0 0 auto" }}
            />
            <div style={{ display: "grid", gap: "3px", textAlign: "right" }}>
              <strong style={{ color: "#0B2942", fontSize: "clamp(28px, 3.3vw, 42px)", lineHeight: 1.25, fontWeight: 900 }}>إِعْرَابُكَ</strong>
              <span style={{ color: "#2F8F8F", fontSize: "clamp(13px, 1.5vw, 18px)", fontWeight: 700 }}>{PLATFORM_TAGLINE}</span>
            </div>
          </div>
        </div>

        <div className="home-clean-copy home-message-column">
          <h1>الإعراب خطوات؛ كل خطوة تفتح مسارًا وتغلق آخر.</h1>
          <p className="home-entry-lead">ابدأ بتعليمات قبل التدريب لفهم مسار التفكير، ثم طبّق ما فهمته في مدرّب التفكير.</p>
          <div className="home-entry-actions">
            <Link href="/guide" className="btn home-guide-primary">اقرأ تعليمات قبل التدريب</Link>
            <a href="/topics" className="btn home-trainer-secondary">ادخل إلى مدرّب التفكير</a>
          </div>
          <p className="home-registration-note">التسجيل مخصّص لحفظ تقدم الطالب وتمييز مرحلته الحالية في التعلّم والتدريب والاختبار.</p>
        </div>
      </section>

      <section className="card home-learning-tools" aria-labelledby="learning-tools-title">
        <div className="home-tools-heading">
          <span className="section-kicker">افهم الطريق ثم طبّقه</span>
          <h2 id="learning-tools-title">أداتان تساعدانك على التفكير</h2>
        </div>

        <div className="home-tools-grid">
          <article className="home-tool-card home-tool-guide">
            <span className="home-tool-number" aria-hidden="true">1</span>
            <div>
              <h3>تعليمات قبل التدريب</h3>
              <p>يلخّص القاعدة، ويشرح لماذا نسأل كل سؤال وكيف تحدد الإجابة المسار الصحيح.</p>
              <Link href="/guide">اقرأ التعليمات</Link>
            </div>
          </article>

          <article className="home-tool-card home-tool-trainer">
            <span className="home-tool-number" aria-hidden="true">2</span>
            <div>
              <h3>مدرّب التفكير</h3>
              <p>يحوّل القاعدة إلى أسئلة تفاعلية تقودك خطوةً خطوة حتى الإعراب النهائي.</p>
              <a href="/topics">ابدأ التدريب</a>
            </div>
          </article>
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
            <div><h3>التعلّم الموجّه</h3><p>اكتشف مسار الحل خطوة خطوة.</p></div>
          </article>
          <article className="home-clean-stage">
            <span>2</span>
            <div><h3>التدريب</h3><p>طبّق ما فهمته في أمثلة أسرع.</p></div>
          </article>
          <article className="home-clean-stage">
            <span>3</span>
            <div><h3>الاختبار النهائي</h3><p>حل باستقلال وأثبت إتقانك.</p></div>
          </article>
        </div>

        <div className="home-clean-after">
          <h3>بعد الاختبار</h3>
          <div className="home-clean-after-grid">
            <article><strong>الألعاب الإعرابية</strong><span>طبّق الحركة والموقع في «أين مكاني؟»، واجمع الكلمات في فرقها في «مَنْ مَعِي؟»، وميّز المفاعيل في «أيُّ مفعول؟»، ثم ثبّت الضبط في لعبة النصوص.</span></article>
            <article><strong>عالج ضعفي</strong><span>ارجع إلى موضع الخطأ وتدرّب عليه.</span></article>
            <article><strong>تحميل الشهادة</strong><span>احتفظ بشهادة إتمام الموضوع.</span></article>
          </div>
        </div>
      </section>
      </div>
  );
}
