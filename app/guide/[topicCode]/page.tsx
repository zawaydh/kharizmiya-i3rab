import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTopicMeta, getTopicRoutes, hasVisualPath } from "../../../lib/topicCatalog";
import { getTopicGuide, type TopicGuideStep } from "../../../lib/topicGuides";

type TopicGuidePageProps = { params: Promise<{ topicCode: string }> };

export async function generateMetadata({ params }: TopicGuidePageProps): Promise<Metadata> {
  const { topicCode } = await params;
  const topic = getTopicMeta(topicCode);
  if (!topic) return { title: "تعليمات قبل التدريب" };
  return {
    title: `خوارزمية ${topic.name_ar}`,
    description: `ملخص قاعدة ${topic.name_ar}، ثم أسئلة مترابطة توضّح كيف يحدد كل سؤال مسار التحليل الصحيح.`,
  };
}

function getStepDirection(step: TopicGuideStep, nextStep: TopicGuideStep | undefined, isLast: boolean): string {
  if (step.path) return step.path;
  if (isLast) return "بعد تثبيت هذه الإجابة نجمع ما سبق، ثم نصوغ النتيجة كاملة من غير خلط بين الوظيفة والحكم والعلامة.";
  const nextTitle = nextStep?.title || "الخطوة التالية";
  const isYesNoQuestion = /^(هل|أهو|أهي|إن كان|إن كانت)/.test(step.question.trim());
  return isYesNoQuestion
    ? `إن انطبقت الإجابة نكمل داخل هذا المسار إلى «${nextTitle}». وإن لم تنطبق، نستبعد هذا الباب قبل إصدار أي حكم.`
    : `الإجابة هنا تختار الفرع الصحيح، ثم تنقلنا إلى «${nextTitle}» بدل القفز إلى حكم لا يناسب الكلمة.`;
}

export default async function TopicAlgorithmGuidePage({ params }: TopicGuidePageProps) {
  const { topicCode } = await params;
  const topic = getTopicMeta(topicCode);
  const topicGuide = getTopicGuide(topicCode);
  if (!topic || !topic.isReady || !topicGuide) notFound();
  const routes = getTopicRoutes(topic.code);

  return (
    <article className="algorithm-guide-page">
      <header className="algorithm-guide-hero">
        <div className="algorithm-guide-breadcrumbs" aria-label="مسار الصفحة"><Link href="/guide">تعليمات قبل التدريب</Link><span aria-hidden="true">/</span><span>{topic.name_ar}</span></div>
        <span className="algorithm-guide-eyebrow">أفهم القاعدة ثم أتبع الأسئلة</span>
        <h1>{topic.code === "mafoolat" ? "المفاعيل" : `خوارزمية ${topic.name_ar}`}</h1>
        {topic.code === "mafoolat" ? <p><strong>(المفعول به، المفعول المطلق، المفعول فيه، المفعول لأجله، المفعول معه)</strong></p> : null}
        <p>اقرأ الملخص أولًا، ثم سر مع الأسئلة بالترتيب. كل سؤال يمنع حكمًا خاطئًا ويفتح الطريق المناسب.</p>
      </header>

      <nav className="algorithm-reading-map" aria-label="أجزاء شرح الخوارزمية">
        <a href="#rule-summary">ملخص القاعدة</a><a href="#thinking-path">خطوات التفكير</a><a href="#worked-example">مثال كامل</a><a href="#common-mistakes">أخطاء شائعة</a>
      </nav>

      <section id="rule-summary" className="algorithm-rule-summary card" aria-labelledby="rule-summary-title">
        <div className="algorithm-summary-icon" aria-hidden="true">قاعدة</div>
        <div className="algorithm-summary-content"><span className="algorithm-card-label">ملخص القاعدة</span><h2 id="rule-summary-title">ما الذي يجب أن أفهمه أولًا؟</h2><p>{topicGuide.goal}</p><div className="algorithm-start-point"><span>ابدأ من هنا</span><strong>{topicGuide.start}</strong></div></div>
      </section>

      <section id="thinking-path" className="algorithm-guide-section" aria-labelledby="algorithm-steps-title">
        <div className="algorithm-guide-section-heading"><span className="algorithm-section-kicker">المسار</span><div><h2 id="algorithm-steps-title">خطوات التفكير</h2><p>لا تحفظ الأحكام منفصلة؛ دع كل إجابة تقودك إلى السؤال التالي.</p></div></div>
        <ol className="algorithm-steps-list">
          {topicGuide.steps.map((step, index) => {
            const direction = getStepDirection(step, topicGuide.steps[index + 1], index === topicGuide.steps.length - 1);
            return (
              <li className="algorithm-step-card card" key={`${step.title}-${index}`}>
                <div className="algorithm-step-rail" aria-hidden="true"><span className="algorithm-step-number">{String(index + 1).padStart(2, "0")}</span>{index < topicGuide.steps.length - 1 ? <span className="algorithm-step-line" /> : null}</div>
                <div className="algorithm-step-content">
                  <div className="algorithm-step-heading"><span>الخطوة {index + 1}</span><h3>{step.title}</h3></div>
                  <div className="algorithm-step-block algorithm-step-question-block"><span>اسأل نفسك</span><p>{step.question}</p></div>
                  <div className="algorithm-step-explanation-grid"><div className="algorithm-step-block algorithm-step-why"><span>لماذا؟</span><p>{step.why}</p></div><div className="algorithm-step-block algorithm-step-direction"><span>بناءً على إجابتك</span><p>{direction}</p></div></div>
                  {step.example ? <div className="algorithm-step-block algorithm-step-example"><span>مثال توضيحي</span><p>{step.example}</p></div> : null}
                  {step.branches?.length ? <div className="algorithm-step-branches" aria-label={`خلاصة ${step.title}`}>{step.branches.map((branch) => <div className="algorithm-step-branch" key={`${step.title}-${branch.label}`}><strong>{branch.label}</strong><p>{branch.text}</p></div>)}</div> : null}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section id="worked-example" className="algorithm-guide-section" aria-labelledby="algorithm-example-title">
        <div className="algorithm-guide-section-heading"><span className="algorithm-section-kicker">تطبيق</span><div><h2 id="algorithm-example-title">مثال كامل</h2><p>نطبق الأسئلة بالترتيب نفسه حتى نصل إلى نتيجة صحيحة.</p></div></div>
        <div className="algorithm-example-card card">
          <div className="algorithm-example-sentence"><span>المثال</span><strong>{topicGuide.example.sentence}</strong></div>
          <div className="algorithm-example-target"><span>الكلمة المحددة</span><strong>{topicGuide.example.target}</strong></div>
          <ol className="algorithm-example-walkthrough">{topicGuide.example.walkthrough.map((line, index) => <li key={`${index}-${line}`}><span>{index + 1}</span><p>{line}</p></li>)}</ol>
          <div className="algorithm-example-result"><span>النتيجة النهائية</span><p>{topicGuide.example.result}</p></div>
        </div>
      </section>

      <section id="common-mistakes" className="algorithm-guide-section" aria-labelledby="algorithm-errors-title">
        <div className="algorithm-guide-section-heading"><span className="algorithm-section-kicker">انتبه</span><div><h2 id="algorithm-errors-title">أخطاء شائعة</h2><p>راجعها قبل التدريب؛ فهي أكثر النقاط التي تخرجك إلى مسار غير صحيح.</p></div></div>
        <ul className="algorithm-mistakes-card card">{topicGuide.commonMistakes.map((mistake) => <li key={mistake}>{mistake}</li>)}</ul>
      </section>

      <footer className="algorithm-guide-actions card"><div><span className="algorithm-card-label">الخطوة التالية</span><h2>انتقل من الفهم إلى التطبيق</h2><p>طبّق الخوارزمية على أمثلة متدرجة داخل مدرّب التفكير.</p></div><div className="algorithm-guide-action-buttons"><a href={routes.learn} className="algorithm-primary-action">ابدأ مدرّب التفكير</a>{topic.code === "mafoolat" ? <Link href="/games/which-object" className="algorithm-secondary-action">طبّق في لعبة «أيُّ مفعول؟»</Link> : null}{hasVisualPath(topic.code) ? <a href={routes.paths} className="algorithm-secondary-action">شاهد المسار البصري</a> : null}<Link href="/guide" className="algorithm-secondary-action">كل التعليمات</Link></div></footer>
    </article>
  );
}
