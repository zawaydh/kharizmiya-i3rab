import AuthLockGate from "../../components/AuthLockGate";
import StageAccessGate from "../../components/StageAccessGate";
import DiacriticsTextGame from "../../components/DiacriticsTextGame";
import { getTopicByCode, getTopicRoutes } from "../../../lib/topics";
import { getDiacriticsTexts } from "../../../content/diacriticsTexts";
import "../../styles/72-text-game.css";

export default async function TextGameTopicPage({ params }: { params: Promise<{ topicCode: string }> }) {
  const { topicCode } = await params;
  const topic = getTopicByCode(topicCode);
  if (!topic || !topic.isReady) return <div className="card">هذا الموضوع غير متاح بعد.</div>;

  const texts = getDiacriticsTexts(topic.code);
  const routes = getTopicRoutes(topic.code);

  return (
    <AuthLockGate title="سجّل الدخول للانتقال إلى لعبة النصوص" text="سجّل الدخول حتى تبقى رحلتك التعليمية مرتبطة بحسابك.">
      <StageAccessGate topicCode={topic.code} level={topic.level ?? 2} require="texts">
        <DiacriticsTextGame key={topic.code} topicName={topic.name_ar} texts={texts} backHref={routes.dashboard || "/dashboard"} />
      </StageAccessGate>
    </AuthLockGate>
  );
}
