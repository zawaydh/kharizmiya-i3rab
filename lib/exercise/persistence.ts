import type { Mode } from "./model";
import { calcPercent, type CoveredMap } from "./progress";

export type StageCompletionUpdate = {
  learn_completed?: boolean;
  practice_completed?: boolean;
  quiz_passed?: boolean;
  quiz_score?: number | null;
  quiz_total?: number | null;
};

export type ProgressSavePayload = StageCompletionUpdate & {
  topicId: string;
  level: number;
  percent?: number;
  coverage?: string[];
  practice_percent?: number;
  practice_coverage?: string[];
};

export function buildStageProgressPayload(params: {
  mode: Mode;
  topicId: string;
  level: number;
  covered: CoveredMap;
  coverageKeys: string[];
  extra?: StageCompletionUpdate;
}): ProgressSavePayload {
  const { mode, topicId, level, covered, coverageKeys, extra = {} } = params;
  const percent = calcPercent(covered, coverageKeys);
  const coverage = coverageKeys.filter((key) => covered[key]);

  const payload: ProgressSavePayload = {
    topicId,
    level,
    learn_completed:
      mode === "learn" ? percent >= 100 : extra.learn_completed,
    practice_completed:
      mode === "practice" ? percent >= 100 : extra.practice_completed,
    quiz_passed: extra.quiz_passed,
    quiz_score: extra.quiz_score,
    quiz_total: extra.quiz_total,
  };

  if (mode === "learn") {
    payload.percent = percent;
    payload.coverage = coverage;
  }
  if (mode === "practice") {
    payload.practice_percent = percent;
    payload.practice_coverage = coverage;
  }

  return payload;
}
