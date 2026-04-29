import Link from "next/link";

export default function HomePage() {
  return (
    <main className="home-page">
      <section className="hero-card">
        <div className="hero-badge">مدرّب تفكير نحوي موجّه</div>

        <h1>تعلّم الإعراب خطوة بخطوة</h1>

        <p className="hero-text">
          خوارزمية الإعراب منصة تعليمية تفاعلية تساعد الطالب على فهم الإعراب
          من خلال أسئلة متتابعة ومسارات بصرية واضحة، بدل الحفظ العشوائي.
        </p>

        <div className="hero-actions">
          <Link href="/topics" className="primary-btn">
            ابدأ التعلم الآن
          </Link>
          <Link href="/paths" className="secondary-btn">
            شاهد المسار البصري
          </Link>
        </div>
      </section>

      <section className="features-grid">
        <article>
          <h2>كيف تعمل المنصة؟</h2>
          <p>
            تبدأ بجملة وكلمة هدف، ثم تجيب عن أسئلة صغيرة تقودك إلى الإعراب
            النهائي خطوة بخطوة.
          </p>
        </article>

        <article>
          <h2>لماذا خوارزمية؟</h2>
          <p>
            لأن الطالب لا يحفظ الإجابة فقط، بل يتعلم كيف يفكر: هل الكلمة اسم؟
            هل هي مبنية؟ ما موقعها؟ وما علامة إعرابها؟
          </p>
        </article>

        <article>
          <h2>ما الذي يميزها؟</h2>
          <p>
            مسارات بصرية، تلميحات عند الخطأ، تدريب متدرج، واختبار يقيس الفهم لا
            التخمين.
          </p>
        </article>
      </section>

      <section className="seo-section">
        <h2>تعلم الإعراب بطريقة منظمة</h2>
        <p>
          إذا كنت تجد صعوبة في إعراب الجملة الاسمية أو الفعلية، فهذه المنصة
          تساعدك على تحليل الجملة خطوة خطوة. تبدأ بتحديد نوع الكلمة، ثم موقعها
          في الجملة، ثم تصل إلى الإعراب الكامل مثل: مبتدأ مرفوع، خبر مرفوع،
          فاعل مرفوع، أو مفعول به منصوب.
        </p>
      </section>
    </main>
  );
}