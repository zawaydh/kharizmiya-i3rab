"use client";

import ExercisePlayer from "../../components/ExercisePlayer";
import AuthLockGate from "../../components/AuthLockGate";
import StageAccessGate from "../../components/StageAccessGate";
import { saveProgress } from "../../../lib/db";
import { getTopicByCode, getTopicRoutes } from "../../../lib/topics";

export default function TrainTopicPage({ params }: { params: { topicCode: string } }) {
  const topic = getTopicByCode(params.topicCode);

  if (!topic || !topic.isReady || !topic.tree || !topic.examples || !topic.coverageKeysOrdered) {
    return <div className="card">هذا الموضوع غير متاح بعد.</div>;
  }

  return (
    <AuthLockGate title="سجّل الدخول لتكمل الالمرحلة الثانية" text="سجّل الدخول حتى يُحفظ تدريبك.">
    <StageAccessGate topicCode={topic.code} level={topic.level ?? 2} require="practice">
    <ExercisePlayer
      title={`${topic.name_ar} — المرحلة الثانية`}
      mode="practice"
      tree={topic.tree}
      examples={topic.practiceExamples || topic.examples}
      coverageKeysOrdered={topic.coverageKeysOrdered}
      nav={getTopicRoutes(topic.code)}
      topicId={topic.code}
      level={topic.level ?? 2}
      onSaveProgress={saveProgress}
    />
    </StageAccessGate>
    </AuthLockGate>
  );
}
