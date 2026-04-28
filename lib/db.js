import { supabase } from "./supabaseClient";

export const TOPICS = [
  {
    topic_code: "nominal-advanced",
    name_ar: "الجملة الاسمية",
    level: "متوسط",
    desc: "مسار المبتدأ خطوة خطوة مع حفظ التقدم بحسب المسارات المتقنة.",
  },
];

function asArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function uniqueMerge(a = [], b = []) {
  return Array.from(new Set([...asArray(a), ...asArray(b)]));
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

  const nextCoverage = coverage !== undefined ? uniqueMerge(existing?.coverage, coverage) : asArray(existing?.coverage);
  const nextPracticeCoverage = practice_coverage !== undefined ? uniqueMerge(existing?.practice_coverage, practice_coverage) : asArray(existing?.practice_coverage);

  const nextPercent = typeof percent === "number" ? percent : (Number(existing?.percent) || 0);
  const nextPracticePercent = typeof practice_percent === "number" ? practice_percent : (Number(existing?.practice_percent) || 0);

  const payload = {
    user_id: user.id,
    topic_code,
    level,
    percent: nextPercent,
    coverage: nextCoverage,
    practice_percent: nextPracticePercent,
    practice_coverage: nextPracticeCoverage,
    learn_completed:
      typeof learn_completed === "boolean"
        ? learn_completed
        : (existing?.learn_completed ?? false),
    practice_completed:
      typeof practice_completed === "boolean"
        ? practice_completed
        : (existing?.practice_completed ?? false),
    quiz_passed:
      typeof quiz_passed === "boolean"
        ? quiz_passed
        : (existing?.quiz_passed ?? false),
    quiz_score:
      typeof quiz_score === "number" || quiz_score === null
        ? quiz_score
        : (existing?.quiz_score ?? null),
    quiz_total:
      typeof quiz_total === "number" || quiz_total === null
        ? quiz_total
        : (existing?.quiz_total ?? null),
    updated_at: new Date().toISOString(),
  };

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
