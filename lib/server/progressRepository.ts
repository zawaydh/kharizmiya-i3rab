import type { SupabaseClient } from "@supabase/supabase-js";
import { calcPercent } from "../exercise/progress";
import {
  hasProgressChange,
  mergeProgressRecord,
  type ProgressLike,
  type ProgressRecord,
  type ProgressUpdate,
} from "../progressMerge";
import type { VerifiedProgress } from "./progressVerification";

type ErrorLike = { code?: unknown; message?: unknown } | null | undefined;

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.length > 0)
    : [];
}

function nextUpdatedAt(previousValue?: string | null): string {
  const now = Date.now();
  const previous = previousValue ? new Date(previousValue).getTime() : 0;
  const next = Number.isFinite(previous) ? Math.max(now, previous + 1) : now;
  return new Date(next).toISOString();
}

function isUniqueConflict(error: ErrorLike): boolean {
  const code = String(error?.code || "");
  const message = String(error?.message || "").toLowerCase();
  return code === "23505" || message.includes("duplicate key");
}

export function buildAuthoritativeProgressUpdate(
  existing: ProgressLike | null,
  verified: VerifiedProgress,
): ProgressUpdate {
  if (verified.kind === "quiz-complete") {
    return {
      quiz_passed: verified.passed,
      quiz_score: verified.score,
      quiz_total: verified.total,
    };
  }

  const requiredKeys = verified.topic.coverageKeysOrdered;
  const saved = verified.mode === "learn"
    ? stringArray(existing?.coverage)
    : stringArray(existing?.practice_coverage);
  const merged = Array.from(new Set([...saved, ...verified.coverageKeys]))
    .filter((key) => requiredKeys.includes(key));
  const covered = Object.fromEntries(requiredKeys.map((key) => [key, merged.includes(key)]));
  const percent = calcPercent(covered, requiredKeys);

  return verified.mode === "learn"
    ? { coverage: merged, percent, learn_completed: percent >= 100 }
    : {
        practice_coverage: merged,
        practice_percent: percent,
        practice_completed: percent >= 100,
      };
}

export async function saveVerifiedProgress(params: {
  admin: SupabaseClient;
  userId: string;
  verified: VerifiedProgress;
}): Promise<ProgressRecord> {
  const { admin, userId, verified } = params;
  const topicCode = verified.topic.code;
  const maxAttempts = 5;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const { data: rawExisting, error: fetchError } = await admin
      .from("progress")
      .select("*")
      .eq("user_id", userId)
      .eq("topic_code", topicCode)
      .eq("level", verified.level)
      .maybeSingle();
    if (fetchError) throw fetchError;

    const existing = rawExisting as ProgressRecord | null;
    const update = buildAuthoritativeProgressUpdate(existing, verified);
    const next = mergeProgressRecord({
      existing,
      update,
      userId,
      topicCode,
      level: verified.level,
      updatedAt: nextUpdatedAt(existing?.updated_at),
    });
    if (existing && !hasProgressChange(existing, next)) return existing;

    const writeResult = existing
      ? await admin
          .from("progress")
          .update(next)
          .eq("user_id", userId)
          .eq("topic_code", topicCode)
          .eq("level", verified.level)
          .eq("updated_at", existing.updated_at)
          .select("*")
          .maybeSingle()
      : await admin.from("progress").insert(next).select("*").single();

    if (writeResult.error && !isUniqueConflict(writeResult.error)) throw writeResult.error;
    if (writeResult.data) return writeResult.data as ProgressRecord;
  }

  throw new Error("PROGRESS_CONFLICT_RETRY_EXHAUSTED");
}
