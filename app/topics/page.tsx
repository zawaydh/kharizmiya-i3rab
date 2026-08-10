import AuthLockGate from "../components/AuthLockGate";
import { getReadyTopicMetadata, getTopicRoutes } from "../../lib/topicCatalog";

export default function TopicsPage() {
  const topics = getReadyTopicMetadata();

  return (
    <AuthLockGate
      title="اختيار الموضوع يفتح بعد تسجيل الدخول"
      text="سجّل الدخول لاختيار الموضوع."
    >
      <div className="topics-branch-page">
        <section className="card topics-branch-hero student-compact-hero">
          <span className="section-kicker">تطبيق خوارزمية الإعراب خطوةً خطوة</span>
          <h1 className="h1">مدرّب التفكير</h1>
          <p>اختر الموضوع وطبّق خوارزميته على أمثلة تفاعلية متدرجة.</p>
        </section>

        <section className="topics-branch-grid">
          {topics.map((topic) => {
            const routes = getTopicRoutes(topic.code);
            return (
              <article className="card topic-branch-card" key={topic.code}>
                <div>
                  <h2>{topic.name_ar}</h2>
                  
                </div>
                <div className="topic-branch-actions single-topic-action">
                  <a href={routes.learn} className="topic-branch-learn">ابدأ التعلّم الموجّه</a>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </AuthLockGate>
  );
}
