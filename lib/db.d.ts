import type { ProgressSavePayload } from "./exercise/persistence";

export type TopicProgressRecord = {
  user_id?: string;
  topic_code?: string;
  level?: number;
  percent?: number;
  coverage?: string[];
  practice_percent?: number;
  practice_coverage?: string[];
  learn_completed?: boolean;
  practice_completed?: boolean;
  quiz_passed?: boolean;
  quiz_score?: number | null;
  quiz_total?: number | null;
  updated_at?: string;
};

export function calcCoveragePercent(coverage?: string[], requiredKeys?: string[]): number;
export function saveProgress(
  payload: ProgressSavePayload | string,
  level?: number,
  percent?: number
): Promise<TopicProgressRecord | null>;
export function loadProgress(): Promise<TopicProgressRecord[]>;
export function getMyProgress(): Promise<TopicProgressRecord[]>;
export function getTopicProgress(
  topicCode: string,
  level?: number
): Promise<TopicProgressRecord | null>;
