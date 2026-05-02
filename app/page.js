import Link from "next/link";

const pillars = [
  {
    title: "مسار واضح",
    text: "ابدأ من سؤال صغير، ثم انتقل خطوة خطوة حتى تصل إلى الإعراب الكامل دون تخمين.",
    icon: "مسار",
  },
  {
    title: "تلميحات موجّهة",
    text: "عند الخطأ يظهر توجيه قريب من اختيار الطالب، فيفهم لماذا لم يكن الجواب مناسبًا.",
    icon: "تلميح",
  },
  {
    title: "تدريب وقياس",
    text: "تعلّم، تدرّب، ثم اختبر نفسك بنظام يحفظ التقدم ويقيس الفروع التي أتقنتها.",
    icon: "إتقان",
  },
];

const steps = [
  "اختر الموضوع",
  "شاهد المسار البصري",
  "تعلّم مع التلميحات",
  "تدرّب ثم اختبر نفسك",
];

export default function HomePage() {
  return (
    <section className="landing-page kh-landing" aria-label="خوارزمية الإعراب">
      <div className="kh-hero">
        <div className="kh-hero-copy">
          <span className="kh-kicker">مدرّب تفكير نحوي موجّه</span>
          <h1>خوارزمية الإعراب</h1>
          <p className="kh-subtitle">
            منصة تفاعلية تساعد الطالب على تعلّم الإعراب خطوة بخطوة عبر مسارات بصرية،
            وأسئلة متتابعة، وتلميحات تظهر عند الحاجة.
          </p>
          <div className="kh-hero-actions">
            <Link className="kh-btn kh-btn-primary" href="/topics">ابدأ التعلم الآن</Link>
            <Link className="kh-btn kh-btn-secondary" href="/paths">شاهد المسار البصري</Link>
            <Link className="kh-btn kh-btn-ghost" href="/dashboard">لوحتي</Link>
          </div>
        </div>

        <div className="kh-hero-logo-card" aria-hidden="true">
          <img src="/logo.svg" alt="" className="kh-hero-logo" />
          <div className="kh-logo-caption">فكّر قبل أن تُعرب</div>
        </div>
      </div>

      <div className="kh-pillars">
        {pillars.map((item) => (
          <article key={item.title} className="kh-pillar-card">
            <span className="kh-pillar-icon">{item.icon}</span>
            <h2>{item.title}</h2>
            <p>{item.text}</p>
          </article>
        ))}
      </div>

      <section className="kh-steps-card" aria-label="طريقة العمل">
        <div>
          <span className="kh-kicker">كيف يعمل؟</span>
          <h2>رحلة قصيرة ومنظمة</h2>
          <p>
            لا يبدأ الطالب من الإعراب النهائي، بل من تحديد نوع الكلمة وموقعها،
            ثم يتدرج حتى يفهم سبب العلامة أو محل الإعراب.
          </p>
        </div>
        <ol className="kh-steps">
          {steps.map((step, index) => (
            <li key={step}>
              <span>{index + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      <section className="kh-seo-card">
        <h2>تعلّم الإعراب بطريقة تفكير لا بطريقة حفظ</h2>
        <p>
          تساعد خوارزمية الإعراب الطالب على فهم الجملة الاسمية والفعلية،
          وتمييز المبتدأ والخبر والفاعل والمفعول به والأفعال، من خلال مسارات
          واضحة تسأل: ما نوع الكلمة؟ ما موقعها؟ وما علامة إعرابها؟
        </p>
      </section>
    </section>
  );
}
