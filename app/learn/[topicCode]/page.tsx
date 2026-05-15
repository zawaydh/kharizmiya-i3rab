"use client";

import ExercisePlayer from "../../components/ExercisePlayer";
import AuthLockGate from "../../components/AuthLockGate";
import { saveProgress } from "../../../lib/db";
import { getTopicByCode, getTopicRoutes } from "../../../lib/topics";

export default function LearnTopicPage({ params }: { params: { topicCode: string } }) {
  const topic = getTopicByCode(params.topicCode);

  if (!topic || !topic.isReady || !topic.tree || !topic.examples || !topic.coverageKeysOrdered) {
    return <div className="card">هذا الموضوع غير متاح بعد.</div>;
  }

  return (
    <AuthLockGate title="سجّل الدخول لتكمل الالمرحلة الأولى" text="سجّل الدخول حتى يُحفظ تقدمك.">
    <ExercisePlayer
      title={`${topic.name_ar} — المرحلة الأولى`}
      mode="learn"
      tree={topic.tree}
      examples={topic.learnExamples || topic.examples}
      coverageKeysOrdered={topic.coverageKeysOrdered}
      nav={getTopicRoutes(topic.code)}
      topicId={topic.code}
      level={topic.level ?? 2}
      onSaveProgress={saveProgress}
    />
    </AuthLockGate>
  );
}
