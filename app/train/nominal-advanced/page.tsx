"use client";

import ExercisePlayer from "../../components/ExercisePlayer";
import AuthLockGate from "../../components/AuthLockGate";
import { saveProgress } from "../../../lib/db";
import { getTopicByCode, getTopicRoutes } from "../../../lib/topics";

export default function TrainNominalAdvancedPage() {
  const topic = getTopicByCode("nominal-advanced");

  if (!topic || !topic.tree || !topic.examples || !topic.coverageKeysOrdered) {
    return null;
  }

  return (
    <AuthLockGate title="سجّل الدخول لتكمل التدرّب" text="التدرّب وحفظ الإنجاز مرتبطان بحساب الطالب.">
    <ExercisePlayer
      title={`${topic.name_ar} — تدرّب`}
      mode="practice"
      tree={topic.tree}
      examples={topic.examples}
      coverageKeysOrdered={topic.coverageKeysOrdered}
      nav={getTopicRoutes(topic.code)}
      topicId={topic.code}
      level={topic.level ?? 2}
      onSaveProgress={saveProgress}
    />
    </AuthLockGate>
  );
}
