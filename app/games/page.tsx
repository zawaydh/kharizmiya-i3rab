import Link from "next/link";
import "../styles/74-speech-game.css";

export default function GamesPage() {
  return (
    <div className="games-hub-page" dir="rtl">
      <section className="card games-hub-hero">
        <span className="section-kicker">تدريب خفيف بفكرة واضحة</span>
        <h1>الألعاب الإعرابية</h1>
        <p>اختر لعبة تطبّق بها ما تعلّمته، واكتشف سبب الخطأ بدل الاكتفاء بمعرفة الإجابة الصحيحة.</p>
      </section>

      <section className="games-hub-grid" aria-label="الألعاب المتاحة">
        <article className="card games-hub-card games-hub-card-featured">
          <span className="games-hub-icon" aria-hidden="true">⌖</span>
          <div>
            <span className="games-hub-badge">مهمّة تفاعلية</span>
            <h2>أين مكاني؟</h2>
            <p>ضع الكلمة المضبوطة في الجملة التي يقبلها موقعها الإعرابي. سبع دورات متتابعة بأمثلة مختلفة وشرح خاص لكل خطأ.</p>
          </div>
          <Link href="/games/where-is-my-place" className="btn btn-primary">ابدأ مهمّة الكلمة</Link>
        </article>



        <article className="card games-hub-card">
          <span className="games-hub-icon" aria-hidden="true">↟</span>
          <div>
            <span className="games-hub-badge games-hub-badge-secondary">تصنيف سريع</span>
            <h2>مَنْ مَعِي؟</h2>
            <p>اجمع فريق المنصوبات ثم المرفوعات والمجرورات والمبنيات والمجزومات. الصحيح يقفز ثم ينضم إلى فريقه، والخطأ يبقى ويشرح سبب انتمائه إلى فريق آخر.</p>
          </div>
          <Link href="/games/who-is-with-me" className="btn btn-soft games-hub-open-button">ابدأ التصنيف</Link>
        </article>

        <article className="card games-hub-card">
          <span className="games-hub-icon" aria-hidden="true">5</span>
          <div>
            <span className="games-hub-badge games-hub-badge-secondary">المفاعيل الخمسة</span>
            <h2>أيُّ مفعول؟</h2>
            <p>طبّق التسلسل: معه، ثم فيه، ثم المطلق، ثم لأجله، ثم به. كل اختيار خاطئ يشرح لماذا لا تنطبق القرينة.</p>
          </div>
          <Link href="/games/which-object" className="btn btn-soft games-hub-open-button">ابدأ تحدي المفاعيل</Link>
        </article>

        <article className="card games-hub-card games-hub-card-markati">
          <span className="games-hub-icon" aria-hidden="true">◇</span>
          <div>
            <span className="games-hub-badge games-hub-badge-secondary">العلامة الإعرابية</span>
            <h2>علامتي</h2>
            <p>الكلمة تخبرك بحكمها ونوعها، وأنت تختار علامتها. تشمل المثنى والجمع والأسماء الخمسة والمقصور والمنقوص والممنوع من الصرف.</p>
          </div>
          <Link href="/games/markati" className="btn btn-soft games-hub-open-button">ابدأ تحدي العلامة</Link>
        </article>
        <article className="card games-hub-card">
          <span className="games-hub-icon" aria-hidden="true">✦</span>
          <div>
            <span className="games-hub-badge games-hub-badge-secondary">جولات متنوعة</span>
            <h2>الإعراب في كلامنا</h2>
            <p>أكمل الجمل باختيار صورة الكلمة المناسبة، واربط العلامة بالفاعل والمفعول والخبر والناسخ والفعل.</p>
          </div>
          <Link href="/i3rab-in-our-speech" className="btn btn-soft games-hub-open-button">ابدأ اللعبة</Link>
        </article>
      </section>
    </div>
  );
}
