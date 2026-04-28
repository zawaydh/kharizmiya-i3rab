import AuthLockGate from "../components/AuthLockGate";
import { getReadyTopics, getTopicRoutes } from "../../lib/topics";

export default function TopicsPage() {
  const topics = getReadyTopics();

  return (
    <AuthLockGate
      title="اختيار الموضوع يفتح بعد تسجيل الدخول"
      text="بعد تسجيل الدخول اختَر الموضوع، ثم ابدأ بفرع التعلّم أو المسار البصري."
    >
      <main className="topics-branch-page">
        <section className="card topics-branch-hero">
          <span className="section-kicker">خوارزمية الإعراب</span>
          <h1 className="h1">اختر الموضوع</h1>
          <p className="p">كل موضوع له فرعان مستقلان حتى لا يحدث خلط: تعلّم متسلسل، ومسار بصري للشجرة الكاملة.</p>
        </section>

        <section className="topics-branch-grid">
          {topics.map((topic) => {
            const routes = getTopicRoutes(topic.code);
            return (
              <article className="card topic-branch-card" key={topic.code}>
                <div>
                  <h2>{topic.name_ar}</h2>
                  <p>{topic.desc || topic.subtitle}</p>
                </div>
                <div className="topic-branch-actions">
                  <a href={routes.learn} className="topic-branch-learn">1) تعلّم</a>
                  <a href={routes.paths} className="topic-branch-path">2) المسار البصري</a>
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </AuthLockGate>
  );
}
