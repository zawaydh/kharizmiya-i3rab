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

/**
 * يبني سجل التقدم التالي من دون أن يمحو بيانات مرحلة لم تُرسل في التحديث الحالي.
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
  const coverage = hasOwn(update, "coverage") ? asArray(update.coverage) : undefined;
  const practiceCoverage = hasOwn(update, "practice_coverage")
    ? asArray(update.practice_coverage)
    : undefined;

  return {
    user_id: userId,
    topic_code: topicCode,
    level,
    percent: typeof update.percent === "number" ? update.percent : Number(existing?.percent) || 0,
    coverage:
      coverage !== undefined ? uniqueMerge(existing?.coverage, coverage) : asArray(existing?.coverage),
    practice_percent:
      typeof update.practice_percent === "number"
        ? update.practice_percent
        : Number(existing?.practice_percent) || 0,
    practice_coverage:
      practiceCoverage !== undefined
        ? uniqueMerge(existing?.practice_coverage, practiceCoverage)
        : asArray(existing?.practice_coverage),
    learn_completed:
      typeof update.learn_completed === "boolean"
        ? update.learn_completed
        : existing?.learn_completed ?? false,
    practice_completed:
      typeof update.practice_completed === "boolean"
        ? update.practice_completed
        : existing?.practice_completed ?? false,
    quiz_passed:
      typeof update.quiz_passed === "boolean"
        ? update.quiz_passed
        : existing?.quiz_passed ?? false,
    quiz_score:
      typeof update.quiz_score === "number" || update.quiz_score === null
        ? update.quiz_score
        : existing?.quiz_score ?? null,
    quiz_total:
      typeof update.quiz_total === "number" || update.quiz_total === null
        ? update.quiz_total
        : existing?.quiz_total ?? null,
    updated_at: updatedAt,
  };
}
