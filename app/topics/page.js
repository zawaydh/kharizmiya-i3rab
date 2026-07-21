import AuthLockGate from "../components/AuthLockGate";
import { getReadyTopics, getTopicRoutes } from "../../lib/topics";

export default function TopicsPage() {
  const topics = getReadyTopics();

  return (
    <AuthLockGate
      title="اختيار الموضوع يفتح بعد تسجيل الدخول"
      text="سجّل الدخول لاختيار الموضوع."
    >
      <main className="topics-branch-page">
        <section className="card topics-branch-hero student-compact-hero">
          <span className="section-kicker">مدرّب تفكير نحوي موجّه</span>
          <h1 className="h1">اختر الموضوع</h1>
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
      </main>
    </AuthLockGate>
  );
}
