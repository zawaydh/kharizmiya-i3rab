"use client";

import { useSearchParams } from "next/navigation";
import DynamicPathTree from "../components/DynamicPathTree";
import { getTopicRoutes, resolveVisualPathTopic } from "../../lib/topics";

export default function PathsClient() {
  const searchParams = useSearchParams();
  const requestedTopic = searchParams.get("topic");
  const resolution = resolveVisualPathTopic(requestedTopic);
  const requestedTopicMeta = resolution.topic;

  if (resolution.status === "unavailable" && requestedTopicMeta) {
    const routes = getTopicRoutes(requestedTopicMeta.code);
    return (
      <div className="paths-embed-page mubtada-paths-page paths-direct-workspace">
        <section className="card paths-unavailable-notice" role="status" aria-live="polite">
          <span className="section-kicker">تنبيه</span>
          <h1>لا يوجد مسار بصري لهذا الموضوع</h1>
          <p>
            المسارات البصرية مخصّصة للجملة الاسمية والجملة الفعلية؛ لأنها المسارات التأسيسية
            الأنسب لعرض خطوات التفكير بصريًا. يمكنك متابعة موضوع <strong>{requestedTopicMeta.name_ar}</strong>
            كاملًا من خلال التعلّم الموجّه والتدريب والاختبار النهائي.
          </p>
          <div className="paths-unavailable-actions">
            <a className="btn btn-primary" href={routes.learn}>ابدأ التعلّم الموجّه</a>
            <a className="btn btn-soft" href="/topics">العودة إلى الموضوعات</a>
          </div>
        </section>
      </div>
    );
  }

  if (resolution.status === "not-found" || !requestedTopicMeta) {
    return (
      <div className="paths-embed-page mubtada-paths-page paths-direct-workspace">
        <section className="card paths-unavailable-notice" role="alert">
          <span className="section-kicker">تعذر فتح المسار</span>
          <h1>الموضوع المطلوب غير موجود</h1>
          <p>اختر أحد المسارات البصرية المتاحة للجملة الاسمية أو الجملة الفعلية.</p>
          <div className="paths-unavailable-actions">
            <a className="btn btn-primary" href="/paths?topic=nominal-advanced">افتح مسار الجملة الاسمية</a>
            <a className="btn btn-soft" href="/topics">العودة إلى الموضوعات</a>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="paths-embed-page mubtada-paths-page paths-direct-workspace">
      {requestedTopicMeta.tree && requestedTopicMeta.examples ? (
        <DynamicPathTree
          key={requestedTopicMeta.code}
          tree={requestedTopicMeta.tree}
          examples={requestedTopicMeta.examples}
          title={requestedTopicMeta.name_ar}
          subtitle={requestedTopicMeta.subtitle}
        />
      ) : (
        <section className="card"><p className="p">هذا المسار البصري غير جاهز بعد.</p></section>
      )}
    </div>
  );
}
