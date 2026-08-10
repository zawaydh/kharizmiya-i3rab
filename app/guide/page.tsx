import type { Metadata } from "next";
import { getReadyTopicMetadata, getTopicRoutes } from "../../lib/topicCatalog";
import { getTopicGuide } from "../../lib/topicGuides";

export const metadata: Metadata = {
  title: "تعليمات قبل التدريب",
  description: "ملخص القاعدة ومسار التفكير في كل موضوع نحوي قبل التطبيق داخل مدرّب التفكير.",
};

export default function AlgorithmGuideIndexPage() {
  const topics = getReadyTopicMetadata().filter((topic) => getTopicGuide(topic.code));

  return (
    <div className="algorithm-guide-index">
      <section className="algorithm-guide-index-hero">
        <span className="algorithm-guide-eyebrow">القاعدة أولًا، ثم الأسئلة</span>
        <h1>تعليمات قبل التدريب</h1>
        <p>اختر موضوعًا. ستبدأ بملخص القاعدة، ثم تعرف لماذا نطرح كل سؤال وكيف تقود الإجابة إلى المسار الصحيح.</p>
        <div className="algorithm-index-flow" aria-label="طريقة استخدام التعليمات">
          <span>1. افهم القاعدة</span><span>2. اتبع الأسئلة</span><span>3. شاهد المثال</span><span>4. ابدأ التدريب</span>
        </div>
      </section>

      <section className="algorithm-guide-grid" aria-label="موضوعات تعليمات قبل التدريب">
        {topics.map((topic, index) => {
          const routes = getTopicRoutes(topic.code);
          const topicGuide = getTopicGuide(topic.code);
          if (!topicGuide) return null;
          return (
            <article className="algorithm-guide-topic-card card" key={topic.code}>
              <div className="algorithm-topic-card-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</div>
              <div className="algorithm-topic-card-copy">
                <span className="algorithm-card-label">قبل أن تبدأ</span>
                <h2>{topic.name_ar}</h2>
                <p>{topicGuide.goal}</p>
              </div>
              <a href={routes.guide} className="algorithm-guide-open-link">اقرأ التعليمات والخطوات</a>
            </article>
          );
        })}
      </section>
    </div>
  );
}
