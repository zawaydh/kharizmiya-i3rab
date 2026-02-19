import { supabase } from "./supabaseClient";

export const TOPICS = [
  { topic_code: "nominal_sentence", name_ar: "الجملة الاسمية", level: "متوسط", desc: "المبتدأ والخبر وصور الخبر." },
];

export async function saveProgress({ topic_code, level, percent }) {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  const user = userData?.user;
  if (!user) throw new Error("NOT_AUTH");

  const payload = { user_id: user.id, topic_code, level, percent, updated_at: new Date().toISOString() };

  const { error } = await supabase.from("progress").upsert(payload, { onConflict: "user_id,topic_code" });
  if (error) throw error;
}

export async function loadProgress() {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return [];

  const { data, error } = await supabase
    .from("progress")
    .select("topic_code, level, percent, updated_at")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
