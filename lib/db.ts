import { supabase } from "./supabaseClient";
import type { ProgressSubmission } from "./progressEvents";
import type { ProgressRecord } from "./progressMerge";

export type TopicProgressRecord = Omit<ProgressRecord, "certificate_earned_at"> & {
  certificate_earned_at?: string | null;
  topic_id?: string;
};

type ProgressApiResponse = {
  progress?: TopicProgressRecord;
  error?: string;
};

export async function saveProgress(
  submission: ProgressSubmission,
): Promise<TopicProgressRecord> {
  const { data, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  const token = data.session?.access_token;
  if (!token) throw new Error("NOT_AUTH");

  const response = await fetch("/api/progress", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(submission),
    cache: "no-store",
  });
  const result = await response.json().catch(() => ({})) as ProgressApiResponse;
  if (!response.ok || !result.progress) {
    throw new Error(result.error || "PROGRESS_SAVE_FAILED");
  }
  return result.progress;
}

export async function loadProgress(): Promise<TopicProgressRecord[]> {
  return getMyProgress();
}

export async function getMyProgress(): Promise<TopicProgressRecord[]> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  const user = userData?.user;
  if (!user) return [];

  const { data, error } = await supabase
    .from("progress")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as TopicProgressRecord[];
}

export async function getTopicProgress(
  topicCode: string,
  level = 2,
): Promise<TopicProgressRecord | null> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  const user = userData?.user;
  if (!user) return null;

  const { data, error } = await supabase
    .from("progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("topic_code", topicCode)
    .eq("level", level)
    .maybeSingle();
  if (error) throw error;
  return data as TopicProgressRecord | null;
}
