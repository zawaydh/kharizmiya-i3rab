import { getTopicByCode } from "../../lib/topics";
import AuthLockGate from "./AuthLockGate";
import ExercisePlayer from "./ExercisePlayer";
import StageAccessGate from "./StageAccessGate";
import { stageExampleVariants } from "../../lib/exercise/stageExampleVariants";

type ExercisePageMode = "learn" | "practice" | "quiz";

type Props = {
  topicCode: string;
  mode: ExercisePageMode;
};

const PAGE_COPY: Record<ExercisePageMode, { authTitle: string; authText: string }> = {
  learn: {
    authTitle: "سجّل الدخول لتبدأ التعلّم الموجّه",
    authText: "سجّل الدخول حتى تُحفظ مهاراتك خطوة بخطوة.",
  },
  practice: {
    authTitle: "سجّل الدخول لتبدأ التدريب",
    authText: "سجّل الدخول حتى يُحفظ تقدمك في التدريب واستعدادك للاختبار النهائي.",
  },
  quiz: {
    authTitle: "سجّل الدخول للاختبار النهائي",
    authText: "سجّل الدخول حتى تُحفظ نتيجتك.",
  },
};

function buildStageTitle(mode: ExercisePageMode, topicName: string) {
  if (mode === "quiz") return `الاختبار النهائي — ${topicName}`;
  return `${topicName} — ${mode === "learn" ? "التعلّم الموجّه" : "التدريب"}`;
}

export default function TopicExercisePage({ topicCode, mode }: Props) {
  const topic = getTopicByCode(topicCode);
  const isQuiz = mode === "quiz";
  const sourceExamples = isQuiz ? topic?.quizExamples : topic?.examples;
  const coverageKeys = isQuiz ? topic?.quizCoverageKeysOrdered : topic?.coverageKeysOrdered;

  if (!topic || !topic.isReady || !topic.tree || !sourceExamples || !coverageKeys) {
    return <div className="card">هذا الموضوع غير متاح بعد.</div>;
  }

  const examples = stageExampleVariants(sourceExamples, mode);

  const topicIntro = topic.code === "mafoolat" ? (
    <section className="card" dir="rtl" style={{ marginBottom: 16, textAlign: "right" }}>
      <h1 style={{ margin: 0 }}>المفاعيل</h1>
      <p style={{ margin: "8px 0 0", lineHeight: 1.9 }}>
        (المفعول به، المفعول المطلق، المفعول فيه، المفعول لأجله، المفعول معه)
      </p>
      <p style={{ margin: "6px 0 0" }}>سنتعلم كيف نميّز بينها، ثم نحدد حكم الكلمة وعلامة إعرابها.</p>
    </section>
  ) : null;

  const player = (
    <>
      {topicIntro}
      <ExercisePlayer
      key={`${mode}-${topic.code}`}
      title={buildStageTitle(mode, topic.name_ar)}
      mode={mode}
      tree={topic.tree}
      examples={examples}
      coverageKeysOrdered={coverageKeys}
      quizCount={isQuiz ? topic.quizCount ?? coverageKeys.length : undefined}
      topicId={topic.code}
      level={topic.level ?? 2}
      />
    </>
  );

  const gatedPlayer = mode === "learn" ? player : (
    <StageAccessGate
      topicCode={topic.code}
      level={topic.level ?? 2}
      require={mode}
    >
      {player}
    </StageAccessGate>
  );

  const copy = PAGE_COPY[mode];
  return (
    <AuthLockGate title={copy.authTitle} text={copy.authText}>
      {gatedPlayer}
    </AuthLockGate>
  );
}
