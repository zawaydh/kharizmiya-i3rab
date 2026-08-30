import DynamicPathTree from "../components/DynamicPathTree";
import { getTopicByCode } from "../../lib/topics";
import { getTopicMeta, getTopicRoutes, hasVisualPath } from "../../lib/topicCatalog";

type PageProps = {
  searchParams?: Promise<{ topic?: string | string[] }>;
};

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const rawTopic = Array.isArray(resolvedSearchParams?.topic) ? resolvedSearchParams?.topic[0] : resolvedSearchParams?.topic;
  const topicCode = rawTopic || "nominal-advanced";
  const nextHref = rawTopic ? `/paths?topic=${encodeURIComponent(rawTopic)}` : "/paths";
  const topicMeta = getTopicMeta(topicCode);

  let content;
  if (!topicMeta) {
    content = (
      <div className="paths-embed-page mubtada-paths-page paths-direct-workspace">
        <section className="card paths-unavailable-notice" role="alert">
          <span className="section-kicker">تعذر فتح المسار</span>
          <h1>الموضوع المطلوب غير موجود</h1>
          <p>اختر أحد المسارات البصرية المتاحة للجملة الاسمية أو الجملة الفعلية.</p>
          <div className="paths-unavailable-actions">
            <a className="btn btn-primary" href="/paths?topic=nominal-advanced">افتح مسار الجملة الاسمية</a>
            <a className="btn btn-soft" href="/topics">العودة إلى مدرّب التفكير</a>
          </div>
        </section>
      </div>
    );
  } else if (!hasVisualPath(topicCode)) {
    const routes = getTopicRoutes(topicCode);
    content = (
      <div className="paths-embed-page mubtada-paths-page paths-direct-workspace">
        <section className="card paths-unavailable-notice" role="status" aria-live="polite">
          <span className="section-kicker">تنبيه</span>
          <h1>لا يوجد مسار بصري لهذا الموضوع</h1>
          <p>
            المسارات البصرية مخصّصة للجملة الاسمية والجملة الفعلية؛ لأنها المسارات التأسيسية
            الأنسب لعرض خطوات التفكير بصريًا. يمكنك متابعة موضوع <strong>{topicMeta.name_ar}</strong>
            كاملًا من خلال التعلّم الموجّه والتدريب والاختبار النهائي.
          </p>
          <div className="paths-unavailable-actions">
            <a className="btn btn-primary" href={routes.learn}>ابدأ التعلّم الموجّه</a>
            <a className="btn btn-soft" href="/topics">العودة إلى مدرّب التفكير</a>
          </div>
        </section>
      </div>
    );
  } else {
    const topic = getTopicByCode(topicCode);
    content = topic ? (
      <div className="paths-embed-page mubtada-paths-page paths-direct-workspace">
        <DynamicPathTree
          key={topic.code}
          tree={topic.tree}
          examples={topic.examples}
          title={topic.name_ar}
          subtitle={topic.subtitle}
          topicCode={topic.code}
        />
      </div>
    ) : <section className="card"><p className="p">هذا المسار البصري غير جاهز بعد.</p></section>;
  }

  return content;
}
