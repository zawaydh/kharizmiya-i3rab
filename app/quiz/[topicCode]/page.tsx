"use client";

import ExercisePlayer from "../../components/ExercisePlayer";
import { saveProgress } from "../../../lib/db";
import { getTopicByCode, getTopicRoutes } from "../../../lib/topics";

export default function QuizTopicPage({ params }: { params: { topicCode: string } }) {
  const topic = getTopicByCode(params.topicCode);

  if (
    !topic ||
    !topic.isReady ||
    !topic.tree ||
    !topic.quizExamples ||
    !topic.quizCoverageKeysOrdered
  ) {
    return <div className="card">هذا الموضوع غير متاح بعد.</div>;
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
