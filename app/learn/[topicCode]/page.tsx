"use client";

import ExercisePlayer from "../../components/ExercisePlayer";
import { saveProgress } from "../../../lib/db";
import { getTopicByCode, getTopicRoutes } from "../../../lib/topics";

export default function LearnTopicPage({ params }: { params: { topicCode: string } }) {
  const topic = getTopicByCode(params.topicCode);

  if (!topic || !topic.isReady || !topic.tree || !topic.examples || !topic.coverageKeysOrdered) {
    return <div className="card">هذا الموضوع غير متاح بعد.</div>;
  }

  return (
    <ExercisePlayer
      title={`${topic.name_ar} — تعلّم`}
      mode="learn"
      tree={topic.tree}
      examples={topic.examples}
      coverageKeysOrdered={topic.coverageKeysOrdered}
      nav={getTopicRoutes(topic.code)}
      topicId={topic.code}
      level={topic.level ?? 2}
      onSaveProgress={saveProgress}
    />
  );
}
