import { supabase } from "./supabaseClient";
import { mergeProgressRecord } from "./progressMerge";

function asArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj || {}, key);
}

export function calcCoveragePercent(coverage = [], requiredKeys = []) {
  const keys = asArray(requiredKeys);
  if (!keys.length) return 0;
  const covered = new Set(asArray(coverage));
  const done = keys.filter((k) => covered.has(k)).length;
  return Math.round((done / keys.length) * 100);
}

export async function saveProgress(arg1, arg2, arg3) {
  const isObject = typeof arg1 === "object" && arg1 !== null;
  const topic_code = isObject ? (arg1?.topic_code ?? arg1?.topicId) : arg1;
  const level = isObject ? (arg1?.level ?? 2) : (arg2 ?? 2);

  // مهم: لا نضع 0 افتراضيًا هنا؛ لأن حفظ التدريب أو الاختبار يجب ألا يمسح نسبة التعلّم.
  const percent = isObject && typeof arg1?.percent === "number" ? arg1.percent : (typeof arg3 === "number" ? arg3 : undefined);
  const coverage = isObject && hasOwn(arg1, "coverage") ? asArray(arg1.coverage) : undefined;

  const practice_percent = isObject && typeof arg1?.practice_percent === "number" ? arg1.practice_percent : undefined;
  const practice_coverage = isObject && hasOwn(arg1, "practice_coverage") ? asArray(arg1.practice_coverage) : undefined;

  const learn_completed = isObject && typeof arg1?.learn_completed === "boolean" ? arg1.learn_completed : undefined;
  const practice_completed = isObject && typeof arg1?.practice_completed === "boolean" ? arg1.practice_completed : undefined;
  const quiz_passed = isObject && typeof arg1?.quiz_passed === "boolean" ? arg1.quiz_passed : undefined;
  const quiz_score = isObject && hasOwn(arg1, "quiz_score") ? arg1.quiz_score : undefined;
  const quiz_total = isObject && hasOwn(arg1, "quiz_total") ? arg1.quiz_total : undefined;

  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;

  const user = userData?.user;
  if (!user) throw new Error("NOT_AUTH");
  if (!topic_code) return null;

  const { data: existing, error: fetchError } = await supabase
    .from("progress")
    .select(
      `
      user_id,
      topic_code,
      level,
      percent,
      coverage,
      practice_percent,
      practice_coverage,
      learn_completed,
      practice_completed,
      quiz_passed,
      quiz_score,
      quiz_total,
      updated_at
      `
    )
    .eq("user_id", user.id)
    .eq("topic_code", topic_code)
    .eq("level", level)
    .maybeSingle();

  if (fetchError) throw fetchError;

  const payload = mergeProgressRecord({
    existing,
    update: {
      ...(typeof percent === "number" ? { percent } : {}),
      ...(coverage !== undefined ? { coverage } : {}),
      ...(typeof practice_percent === "number" ? { practice_percent } : {}),
      ...(practice_coverage !== undefined ? { practice_coverage } : {}),
      ...(typeof learn_completed === "boolean" ? { learn_completed } : {}),
      ...(typeof practice_completed === "boolean" ? { practice_completed } : {}),
      ...(typeof quiz_passed === "boolean" ? { quiz_passed } : {}),
      ...(typeof quiz_score === "number" || quiz_score === null ? { quiz_score } : {}),
      ...(typeof quiz_total === "number" || quiz_total === null ? { quiz_total } : {}),
    },
    userId: user.id,
    topicCode: topic_code,
    level,
  });

  const { error } = await supabase
    .from("progress")
    .upsert(payload, { onConflict: "user_id,topic_code,level" });

  if (error) throw error;
  return payload;
}

export async function loadProgress() {
  return getMyProgress();
}

export async function getMyProgress() {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;

  const user = userData?.user;
  if (!user) return [];

  const { data, error } = await supabase
    .from("progress")
    .select(
      `
      user_id,
      topic_code,
      level,
      percent,
      coverage,
      practice_percent,
      practice_coverage,
      learn_completed,
      practice_completed,
      quiz_passed,
      quiz_score,
      quiz_total,
      updated_at
      `
    )
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getTopicProgress(topicCode, level = 2) {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;

  const user = userData?.user;
  if (!user) return null;

  const { data, error } = await supabase
    .from("progress")
    .select(
      `
      user_id,
      topic_code,
      level,
      percent,
      coverage,
      practice_percent,
      practice_coverage,
      learn_completed,
      practice_completed,
      quiz_passed,
      quiz_score,
      quiz_total,
      updated_at
      `
    )
    .eq("user_id", user.id)
    .eq("topic_code", topicCode)
    .eq("level", level)
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
}
