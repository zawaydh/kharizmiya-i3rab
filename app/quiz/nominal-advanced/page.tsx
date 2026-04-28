"use client";

import ExercisePlayer from "../../components/ExercisePlayer";
import { saveProgress } from "../../../lib/db";
import { getTopicByCode, getTopicRoutes } from "../../../lib/topics";

export default function QuizNominalAdvancedPage() {
  const topic = getTopicByCode("nominal-advanced");

  if (!topic || !topic.tree || !topic.quizExamples || !topic.quizCoverageKeysOrdered) {
    return null;
  }

  return (
    <ExercisePlayer
      title={`اختبر نفسي — ${topic.name_ar}`}
      mode="quiz"
      tree={topic.tree}
      examples={topic.quizExamples}
      coverageKeysOrdered={topic.quizCoverageKeysOrdered}
      quizCount={topic.quizCount ?? topic.quizCoverageKeysOrdered.length}
      nav={getTopicRoutes(topic.code)}
      topicId={topic.code}
      level={topic.level ?? 2}
      onSaveProgress={saveProgress}
    />
  );
}
