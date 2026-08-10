export type ProgressRecord = {
  user_id: string;
  topic_code: string;
  level: number;
  percent: number;
  coverage: string[];
  practice_percent: number;
  practice_coverage: string[];
  learn_completed: boolean;
  practice_completed: boolean;
  quiz_passed: boolean;
  quiz_score: number | null;
  quiz_total: number | null;
  certificate_earned_at: string | null;
  updated_at: string;
};

export type ProgressLike = Partial<ProgressRecord>;
export type ProgressUpdate = Partial<
  Pick<
    ProgressRecord,
    | "percent"
    | "coverage"
    | "practice_percent"
    | "practice_coverage"
    | "learn_completed"
    | "practice_completed"
    | "quiz_passed"
    | "quiz_score"
    | "quiz_total"
  >
>;

function asArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.length > 0)
    : [];
}

function uniqueMerge(a: unknown, b: unknown): string[] {
  return Array.from(new Set([...asArray(a), ...asArray(b)]));
}

function hasOwn<T extends object>(obj: T | null | undefined, key: PropertyKey): boolean {
  return Object.prototype.hasOwnProperty.call(obj || {}, key);
}

function clampPercent(value: unknown): number {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(100, Math.round(number)));
}

function scorePercent(score: unknown, total: unknown): number {
  const scoreNumber = Number(score);
  const totalNumber = Number(total);
  if (!Number.isFinite(scoreNumber) || !Number.isFinite(totalNumber) || totalNumber <= 0) return -1;
  return scoreNumber / totalNumber;
}

function bestQuizAttempt(existing: ProgressLike | null, update: ProgressUpdate) {
  const existingScore = typeof existing?.quiz_score === "number" ? existing.quiz_score : null;
  const existingTotal = typeof existing?.quiz_total === "number" ? existing.quiz_total : null;
  const updateHasAttempt =
    hasOwn(update, "quiz_score") &&
    hasOwn(update, "quiz_total") &&
    typeof update.quiz_score === "number" &&
    typeof update.quiz_total === "number" &&
    update.quiz_total > 0;

  if (!updateHasAttempt) {
    return { quiz_score: existingScore, quiz_total: existingTotal };
  }

  const updateScore = update.quiz_score as number;
  const updateTotal = update.quiz_total as number;
  const existingPercent = scorePercent(existingScore, existingTotal);
  const updatePercent = scorePercent(updateScore, updateTotal);

  if (
    updatePercent > existingPercent ||
    (updatePercent === existingPercent && updateScore > (existingScore ?? -1))
  ) {
    return { quiz_score: updateScore, quiz_total: updateTotal };
  }

  return { quiz_score: existingScore, quiz_total: existingTotal };
}

function certificateEligible(progress: {
  percent: number;
  practice_percent: number;
  learn_completed: boolean;
  practice_completed: boolean;
  quiz_passed: boolean;
  quiz_score: number | null;
  quiz_total: number | null;
}) {
  const quizPercent = scorePercent(progress.quiz_score, progress.quiz_total) * 100;
  return (
    (progress.learn_completed || progress.percent >= 100) &&
    (progress.practice_completed || progress.practice_percent >= 100) &&
    (progress.quiz_passed || quizPercent >= 80)
  );
}

/**
 * يبني سجل التقدم التالي تصاعديًا: لا يسمح لجلسة قديمة أو محاولة أضعف
 * أن تمحو نسبة أعلى، أو إكمالًا سابقًا، أو نتيجة اختبار أفضل.
 */
export function mergeProgressRecord({
  existing = null,
  update = {},
  userId,
  topicCode,
  level = 2,
  updatedAt = new Date().toISOString(),
}: {
  existing?: ProgressLike | null;
  update?: ProgressUpdate;
  userId: string;
  topicCode: string;
  level?: number;
  updatedAt?: string;
}): ProgressRecord {
  const coverage = hasOwn(update, "coverage") ? asArray(update.coverage) : [];
  const practiceCoverage = hasOwn(update, "practice_coverage")
    ? asArray(update.practice_coverage)
    : [];

  const percent = Math.max(
    clampPercent(existing?.percent),
    hasOwn(update, "percent") ? clampPercent(update.percent) : 0
  );
  const practicePercent = Math.max(
    clampPercent(existing?.practice_percent),
    hasOwn(update, "practice_percent") ? clampPercent(update.practice_percent) : 0
  );
  const learnCompleted = Boolean(existing?.learn_completed) || update.learn_completed === true || percent >= 100;
  const practiceCompleted =
    Boolean(existing?.practice_completed) || update.practice_completed === true || practicePercent >= 100;
  const bestQuiz = bestQuizAttempt(existing, update);
  const quizPassed =
    Boolean(existing?.quiz_passed) ||
    update.quiz_passed === true ||
    scorePercent(bestQuiz.quiz_score, bestQuiz.quiz_total) >= 0.8;

  const mergedCore = {
    percent,
    practice_percent: practicePercent,
    learn_completed: learnCompleted,
    practice_completed: practiceCompleted,
    quiz_passed: quizPassed,
    quiz_score: bestQuiz.quiz_score,
    quiz_total: bestQuiz.quiz_total,
  };

  const certificateEarnedAt =
    existing?.certificate_earned_at ||
    (certificateEligible(mergedCore) ? updatedAt : null);

  return {
    user_id: userId,
    topic_code: topicCode,
    level,
    percent,
    coverage: uniqueMerge(existing?.coverage, coverage),
    practice_percent: practicePercent,
    practice_coverage: uniqueMerge(existing?.practice_coverage, practiceCoverage),
    learn_completed: learnCompleted,
    practice_completed: practiceCompleted,
    quiz_passed: quizPassed,
    quiz_score: bestQuiz.quiz_score,
    quiz_total: bestQuiz.quiz_total,
    certificate_earned_at: certificateEarnedAt,
    updated_at: updatedAt,
  };
}

const COMPARABLE_FIELDS: Array<keyof ProgressRecord> = [
  "percent",
  "coverage",
  "practice_percent",
  "practice_coverage",
  "learn_completed",
  "practice_completed",
  "quiz_passed",
  "quiz_score",
  "quiz_total",
  "certificate_earned_at",
];

/** يمنع كتابةً جديدةً إلى قاعدة البيانات إذا لم يضف الحفظ أي تقدم فعلي. */
export function hasProgressChange(existing: ProgressLike | null, next: ProgressRecord): boolean {
  if (!existing) return true;
  return COMPARABLE_FIELDS.some((field) => {
    const before = existing[field];
    const after = next[field];
    if (Array.isArray(before) || Array.isArray(after)) {
      return JSON.stringify(asArray(before)) !== JSON.stringify(asArray(after));
    }
    return (before ?? null) !== (after ?? null);
  });
}
