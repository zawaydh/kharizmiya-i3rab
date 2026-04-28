"use client";

import ExercisePlayer from "../../components/ExercisePlayer";
import { saveProgress } from "../../../lib/db";
import { getTopicByCode, getTopicRoutes } from "../../../lib/topics";

export default function LearnNominalAdvancedPage() {
  const topic = getTopicByCode("nominal-advanced");

  if (!topic || !topic.tree || !topic.examples || !topic.coverageKeysOrdered) {
    return null;
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
