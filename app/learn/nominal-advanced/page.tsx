"use client";

import ExercisePlayer from "../../components/ExercisePlayer";
import AuthLockGate from "../../components/AuthLockGate";
import { saveProgress } from "../../../lib/db";
import { getTopicByCode, getTopicRoutes } from "../../../lib/topics";

export default function LearnNominalAdvancedPage() {
  const topic = getTopicByCode("nominal-advanced");

  if (!topic || !topic.tree || !topic.examples || !topic.coverageKeysOrdered) {
    return null;
  }

  return (
    <AuthLockGate title="سجّل الدخول لتكمل التعلّم" text="صفحة البداية مفتوحة للجميع، أما متابعة الموضوعات وحفظ التقدم فتحتاج إلى حساب.">
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
    </AuthLockGate>
  );
}
