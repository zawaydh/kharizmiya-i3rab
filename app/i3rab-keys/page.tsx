import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "مفاتيح الإعراب",
  description: "مرجع مبسّط يساعد الطالب على معرفة نقطة البداية في الجملة: اسم، فعل، أداة، أو شبه جملة، ثم يوجهه إلى الباب المناسب.",
};

const workingTools = [
  {
    title: "إنَّ وأخواتها — عاملة",
    examples: "إنَّ، أنَّ، كأنَّ، لكنَّ، ليتَ، لعلَّ",
    effect: "تدخل على الجملة الاسمية؛ تنصب الاسم وترفع الخبر.",
    route: "/learn/inna-wa-akhawatuha",
    routeLabel: "باب إنَّ وأخواتها",
  },
  {
    title: "لا النافية للجنس — عاملة",
    examples: "لا طالبَ مهملٌ.",
    effect: "لها باب خاص؛ نثبت أولًا أنها النافية للجنس وأن شروط عملها متحققة.",
    route: "/learn/la-nafiya",
    routeLabel: "باب لا النافية للجنس",
  },
  {
    title: "نواصب المضارع — عاملة",
    examples: "أنْ، لن، كي، إذنْ بشروطها",
    effect: "إذا دخلت على المضارع غيّرت حالته إلى النصب؛ لذلك لا نتجاوزها.",
    route: "/learn/present-verb",
    routeLabel: "باب الفعل المضارع",
  },
  {
    title: "جوازم المضارع — عاملة",
    examples: "لم، لمّا، لام الأمر، لا الناهية",
    effect: "إذا دخلت على المضارع غيّرت حالته إلى الجزم؛ لذلك نقرأ الأداة مع الفعل بعدها.",
    route: "/learn/present-verb",
    routeLabel: "باب الفعل المضارع",
  },
  {
    title: "حروف الجر — عاملة",
    examples: "مِن، إلى، عن، على، في، الباء، الكاف، اللام، رُبَّ",
    effect: "تجر الاسم بعدها. وإذا بدأت بها الجملة فقد تكوّن مع الاسم شبه جملة، ثم نفحص موقع شبه الجملة.",
    route: "/learn/khabar",
    routeLabel: "باب الخبر",
  },
  {
    title: "إنْ الشرطية — عاملة",
    examples: "إنْ تجتهدْ تنجحْ.",
    effect: "حرف شرط جازم. لا تخلط بينها وبين «إنَّ» الناسخة.",
    route: "/learn/present-verb",
    routeLabel: "باب الفعل المضارع",
  },
] as const;

const nonWorkingTools = [
  {
    title: "هل / همزة الاستفهام — غير عاملة",
    examples: "هل حضرَ الطالب؟ أَحضرَ الطالب؟",
    effect: "نتعرّف أداة الاستفهام، ثم ننظر إلى الكلمة بعدها لأنها لا تغيّر إعرابها.",
  },
  {
    title: "قد — غير عاملة في الإعراب",
    examples: "قد نجحَ الطالب. قد ينجحُ الطالب.",
    effect: "تفيد معنى مع الفعل، لكنها لا تنصبه ولا تجزمه. بعد معرفتها نحدد نوع الفعل بعدها.",
  },
  {
    title: "السين وسوف — غير عاملتين في الإعراب",
    examples: "سيكتبُ. سوف يكتبُ.",
    effect: "تدلان على الاستقبال، ولا تغيّران رفع المضارع من جهتهما.",
  },
  {
    title: "حرف عطف أو استئناف في البداية",
    examples: "وكتبَ الطالب... فبدأَ الدرس...",
    effect: "تعرّف الحرف أولًا، ثم افحص ما بعده. وجود الواو أو الفاء لا يجعل الكلمة التالية اسمًا أو فعلًا بعينه.",
  },
  {
    title: "يا — أداة نداء",
    examples: "يا طالبُ، انتبه.",
    effect: "ليست من عوامل الرفع والنصب والجر والجزم بالطريقة السابقة، لكنها مفتاح مباشر لباب المنادى؛ فلا نتجاوز دلالتها.",
    route: "/learn/munada",
    routeLabel: "باب المنادى",
  },
] as const;

export default function I3rabKeysPage() {
  return (
    <div className="algorithm-guide-page i3rab-keys-page">
      <section className="algorithm-guide-hero">
        <span className="algorithm-guide-eyebrow">إذا عرفت البداية، عرفت أين تذهب</span>
        <h1>مفاتيح الإعراب</h1>
        <p>
          أمامك جملة ولا تعرف من أين تبدأ؟ لا تحاول إعرابها كلها دفعة واحدة.
          تعرّف أول ما تقابله: اسم، فعل، أداة، أو شبه جملة. ثم اسأل سؤالًا واحدًا:
          ما الباب الذي يقودني إليه هذا المفتاح؟
        </p>

        <nav className="algorithm-reading-map" aria-label="أقسام مفاتيح الإعراب">
          <a href="#name-key">بدأت باسم</a>
          <a href="#verb-key">بدأت بفعل</a>
          <a href="#tool-key">بدأت بأداة</a>
          <a href="#shibh-key">بدأت بشبه جملة</a>
          <a href="#confusing-key">مفاتيح تتشابه</a>
        </nav>
      </section>

      <section className="algorithm-rule-summary card">
        <div className="algorithm-summary-icon" aria-hidden="true">المفتاح</div>
        <div className="algorithm-summary-content">
          <h2>القاعدة التي تنقذك من التشتت</h2>
          <p>
            لا تبدأ بالحركة الإعرابية. ابدأ بتحديد نوع البداية وعملها.
            الاسم يقودك إلى موقع الاسم، والفعل يقودك إلى زمنه، والأداة لا نتجاوزها
            قبل أن نعرف: هل تعمل فيما بعدها أم لا؟
          </p>
          <div className="algorithm-start-point">
            <span>تذكّر</span>
            <strong>النوع أولًا ← العمل أو الموقع ← الباب المناسب ← الإعراب.</strong>
          </div>
        </div>
      </section>

      <section id="name-key" className="algorithm-guide-section">
        <div className="algorithm-guide-section-heading">
          <span className="algorithm-section-kicker">اسم</span>
          <div>
            <h2>بدأت الجملة باسم؟</h2>
            <p>أثبت أنه اسم أولًا، ثم افحص موقعه. لا تجعل «الـ» الاختبار الوحيد للاسم.</p>
          </div>
        </div>

        <ol className="algorithm-steps-list">
          <li className="algorithm-step-card card">
            <div className="algorithm-step-rail">
              <span className="algorithm-step-number">01</span>
              <span className="algorithm-step-line" />
            </div>
            <div className="algorithm-step-content">
              <div className="algorithm-step-heading">
                <span>قرينة مفيدة</span>
                <h3>قبول «الـ» علامة على الاسم، لكنه ليس شرطًا</h3>
              </div>
              <div className="algorithm-step-block algorithm-step-question-block">
                <span>مثال</span>
                <p>الطالبُ ← اسم؛ لأنه يقبل «الـ». لكن «أنا، هو، هذا، الذي، مَن» أسماء أيضًا مع أنها لا تقبل «الـ» بهذه الصورة.</p>
              </div>
              <div className="algorithm-step-block algorithm-step-direction">
                <span>إلى أين أذهب؟</span>
                <p>إذا بدأ كلام اسمي باسم من غير عامل قبله، فابدأ بفحصه في باب المبتدأ والخبر.</p>
              </div>
              <a href="/learn/nominal-advanced" className="algorithm-guide-open-link">افتح باب المبتدأ</a>
            </div>
          </li>

          <li className="algorithm-step-card card">
            <div className="algorithm-step-rail">
              <span className="algorithm-step-number">02</span>
              <span className="algorithm-step-line" />
            </div>
            <div className="algorithm-step-content">
              <div className="algorithm-step-heading">
                <span>لا تتردد</span>
                <h3>الضمير واسم الإشارة والاسم الموصول أسماء</h3>
              </div>
              <div className="algorithm-step-branches">
                <div className="algorithm-step-branch">
                  <strong>ضمير</strong>
                  <p>أنا، نحن، أنت، هو، هي... كلها أسماء مبنية.</p>
                </div>
                <div className="algorithm-step-branch">
                  <strong>اسم إشارة</strong>
                  <p>هذا، هذه، هؤلاء... أسماء، وليست حروفًا.</p>
                </div>
                <div className="algorithm-step-branch">
                  <strong>اسم موصول</strong>
                  <p>الذي، التي، الذين... أسماء، ثم تأتي بعدها صلة الموصول.</p>
                </div>
              </div>
              <div className="algorithm-step-block algorithm-step-example">
                <span>مثال سريع</span>
                <p>هذا كتابٌ. «هذا» اسم إشارة مبني، وقد بدأ به كلام اسمي؛ فنفحصه مبتدأً، وإذا ثبت ذلك نقول: مبني في محل رفع مبتدأ.</p>
              </div>
            </div>
          </li>

          <li className="algorithm-step-card card">
            <div className="algorithm-step-rail">
              <span className="algorithm-step-number">03</span>
            </div>
            <div className="algorithm-step-content">
              <div className="algorithm-step-heading">
                <span>انتبه للموقع</span>
                <h3>أسماء الاستفهام والشرط أسماء أيضًا، لكن موقعها يتغير</h3>
              </div>
              <div className="algorithm-step-branches">
                <div className="algorithm-step-branch">
                  <strong>استفهام</strong>
                  <p>مَن، ما، متى، أين، كيف، أيّ... أسماء استفهام بحسب الاستعمال.</p>
                </div>
                <div className="algorithm-step-branch">
                  <strong>شرط</strong>
                  <p>مَن، ما، مهما، متى، أينما، أيّ... أسماء شرط بحسب الاستعمال.</p>
                </div>
              </div>
              <div className="algorithm-step-block algorithm-step-why">
                <span>لماذا لا أقول مبتدأ دائمًا؟</span>
                <p>لأن كون الكلمة اسمًا ثابت، أمّا موقعها فيتحدد من الجملة. «مَن حضر؟» غير «مَن رأيتَ؟» في الموقع الإعرابي.</p>
              </div>
            </div>
          </li>
        </ol>
      </section>

      <section id="verb-key" className="algorithm-guide-section">
        <div className="algorithm-guide-section-heading">
          <span className="algorithm-section-kicker">فعل</span>
          <div>
            <h2>بدأت بفعل؟ حدّد الزمن مباشرة</h2>
            <p>لا تدخل في علامة البناء أو الإعراب هنا؛ يكفي أن تعرف أي باب ستفتح.</p>
          </div>
        </div>

        <div className="algorithm-example-card card">
          <div className="algorithm-step-branches">
            <div className="algorithm-step-branch">
              <strong>حدث وقع وانتهى ← ماضٍ</strong>
              <p>كتبَ، نجحَ، عادَ...</p>
              <a href="/learn/past-verb" className="algorithm-guide-open-link">باب الفعل الماضي</a>
            </div>
            <div className="algorithm-step-branch">
              <strong>حدث يقع أو يتجدد ← مضارع</strong>
              <p>يكتبُ، ينجحُ، يعودُ...</p>
              <a href="/learn/present-verb" className="algorithm-guide-open-link">باب الفعل المضارع</a>
            </div>
            <div className="algorithm-step-branch">
              <strong>طلب حصول الحدث ← أمر</strong>
              <p>اكتبْ، اجتهدْ، انتبهْ...</p>
              <a href="/learn/imperative-verb" className="algorithm-guide-open-link">باب فعل الأمر</a>
            </div>
            <div className="algorithm-step-branch">
              <strong>فعل ناسخ</strong>
              <p>كان، أصبح، صار، ليس... فعل، لكنه يفتح بابًا خاصًا لأنه يعمل في الجملة الاسمية.</p>
              <a href="/learn/kana-wa-akhawatuha" className="algorithm-guide-open-link">باب كان وأخواتها</a>
            </div>
          </div>
        </div>
      </section>

      <section id="tool-key" className="algorithm-guide-section">
        <div className="algorithm-guide-section-heading">
          <span className="algorithm-section-kicker">أداة</span>
          <div>
            <h2>بدأت بأداة أو حرف؟ اسأل: تعمل أم لا؟</h2>
            <p>العاملة لا نتجاوز أثرها، وغير العاملة نتعرّفها ثم نفحص ما بعدها.</p>
          </div>
        </div>

        <div className="algorithm-step-card card">
          <div className="algorithm-step-rail">
            <span className="algorithm-step-number">أ</span>
            <span className="algorithm-step-line" />
          </div>
          <div className="algorithm-step-content">
            <div className="algorithm-step-heading">
              <span>لا أتجاوزها</span>
              <h3>أدوات عاملة</h3>
            </div>
            <div className="algorithm-step-branches">
              {workingTools.map((tool) => (
                <article className="algorithm-step-branch" key={tool.title}>
                  <strong>{tool.title}</strong>
                  <p><b>أمثلة:</b> {tool.examples}</p>
                  <p>{tool.effect}</p>
                  <a href={tool.route} className="algorithm-guide-open-link">{tool.routeLabel}</a>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="algorithm-step-card card">
          <div className="algorithm-step-rail">
            <span className="algorithm-step-number">ب</span>
          </div>
          <div className="algorithm-step-content">
            <div className="algorithm-step-heading">
              <span>أعرفها ثم أنظر بعدها</span>
              <h3>أدوات غير عاملة إعرابيًا في الكلمة التالية</h3>
            </div>
            <div className="algorithm-step-branches">
              {nonWorkingTools.map((tool) => (
                <article className="algorithm-step-branch" key={tool.title}>
                  <strong>{tool.title}</strong>
                  <p><b>مثال:</b> {tool.examples}</p>
                  <p>{tool.effect}</p>
                  {"route" in tool ? (
                    <a href={tool.route} className="algorithm-guide-open-link">{tool.routeLabel}</a>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="algorithm-start-point card">
          <span>أداة لم تجدها في القائمة؟</span>
          <strong>
            حدّد نوعها أولًا، ثم اسأل هل تغيّر رفعًا أو نصبًا أو جرًا أو جزمًا،
            أو تفتح بابًا نحويًا خاصًا. إن لم تعمل، أثبت معناها ثم انظر إلى ما بعدها.
          </strong>
        </div>
      </section>

      <section id="shibh-key" className="algorithm-guide-section">
        <div className="algorithm-guide-section-heading">
          <span className="algorithm-section-kicker">شبه</span>
          <div>
            <h2>بدأت بجر ومجرور أو ظرف؟</h2>
            <p>لا تقل «خبر مقدم» آليًا. كوّن شبه الجملة أولًا، ثم انظر إلى ما يتمم المعنى بعدها.</p>
          </div>
        </div>

        <div className="algorithm-example-card card">
          <div className="algorithm-example-sentence">
            <span>مثال 1</span>
            <strong>في الفصلِ طلابٌ.</strong>
          </div>
          <div className="algorithm-example-target">
            <span>المفتاح</span>
            <strong>«في الفصل» شبه جملة، وبعدها اسم مرفوع يتم المعنى.</strong>
          </div>
          <ol className="algorithm-example-walkthrough">
            <li><span>1</span><p>«في» حرف جر عامل، و«الفصل» اسم مجرور.</p></li>
            <li><span>2</span><p>الجار والمجرور كوّنا شبه جملة.</p></li>
            <li><span>3</span><p>نفحص هنا الخبر المقدم والمبتدأ المؤخر في باب الخبر.</p></li>
          </ol>
          <div className="algorithm-example-result">
            <span>لكن انتبه</span>
            <p>في الفصلِ يدرسُ الطلابُ. هنا بعد شبه الجملة جملة فعلية؛ فلا نحكم بأن «الطلاب» مبتدأ مؤخر.</p>
          </div>
          <a href="/learn/khabar" className="algorithm-guide-open-link">راجع باب الخبر وشبه الجملة</a>
        </div>
      </section>

      <section id="confusing-key" className="algorithm-guide-section">
        <div className="algorithm-guide-section-heading">
          <span className="algorithm-section-kicker">انتبه</span>
          <div>
            <h2>مفاتيح تتشابه في الشكل ولا تتشابه في الحكم</h2>
            <p>هذه الكلمات لا نحكم عليها من الرسم وحده؛ الحركة والمعنى وما بعدها تحدد الباب.</p>
          </div>
        </div>

        <div className="algorithm-step-branches">
          <article className="algorithm-step-branch card">
            <strong>مِنْ / مَن</strong>
            <p>«مِنْ» حرف جر عامل. أمّا «مَن» فاسم استفهام أو شرط بحسب السياق.</p>
          </article>
          <article className="algorithm-step-branch card">
            <strong>إنَّ / إنْ</strong>
            <p>«إنَّ» حرف ناسخ يعمل في الاسم والخبر. «إنْ» قد تكون شرطية جازمة؛ فلا تخلط البابين.</p>
          </article>
          <article className="algorithm-step-branch card">
            <strong>لا</strong>
            <p>قد تكون نافية للجنس، أو ناهية، أو نافية غير عاملة. انظر إلى المعنى وما بعدها قبل اختيار المسار.</p>
          </article>
          <article className="algorithm-step-branch card">
            <strong>ما</strong>
            <p>قد تكون اسم استفهام أو شرط أو موصولًا، وقد تأتي حرفًا في استعمالات أخرى. السياق هو المفتاح.</p>
          </article>
        </div>
      </section>

      <section className="algorithm-guide-actions card">
        <div>
          <span className="algorithm-card-label">جرّب المفتاح بدل حفظه</span>
          <h2>ارجع إلى «مفتاح الكلمة الأولى»</h2>
          <p>هناك ستطبّق القرار بسرعة، وإذا احتجت تفسيرًا ترجع إلى هذه الصفحة.</p>
        </div>
        <a href="/learn/first-word-key" className="algorithm-guide-open-link">ابدأ مفتاح الكلمة الأولى</a>
      </section>
    </div>
  );
}
