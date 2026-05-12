export type Example = { id: string; sentence: string; target: string; facts: Record<string, any>; covers: string[] };
export const ismManqousCoverageKeysOrdered = ["manqous.nasb", "manqous.raf3.kept", "manqous.raf3.deleted", "manqous.jar.kept", "manqous.jar.deleted"];
export const ismManqousExamples: Example[] = [
  { id: "mn-01", sentence: "رأيتُ قاضيًا عادلًا.", target: "قاضيًا", facts: { case: "nasb" }, covers: ["manqous.nasb"] },
  { id: "mn-02", sentence: "جاءَ القاضيُ.", target: "القاضيُ", facts: { case: "raf3", yStatus: "kept" }, covers: ["manqous.raf3.kept"] },
  { id: "mn-03", sentence: "جاءَ قاضٍ عادلٌ.", target: "قاضٍ", facts: { case: "raf3", yStatus: "deleted" }, covers: ["manqous.raf3.deleted"] },
  { id: "mn-04", sentence: "مررتُ بالقاضيِ.", target: "القاضيِ", facts: { case: "jar", yStatus: "kept" }, covers: ["manqous.jar.kept"] },
  { id: "mn-05", sentence: "مررتُ بقاضٍ عادلٍ.", target: "قاضٍ", facts: { case: "jar", yStatus: "deleted" }, covers: ["manqous.jar.deleted"] }
];
const resultByCover: Record<string, string> = {
  "manqous.nasb": "اسم منقوص منصوب وعلامة نصبه الفتحة الظاهرة على آخره",
  "manqous.raf3.kept": "اسم منقوص مرفوع وعلامة رفعه الضمة المقدرة على الياء للثقل",
  "manqous.raf3.deleted": "اسم منقوص مرفوع وعلامة رفعه الضمة المقدرة على الياء المحذوفة",
  "manqous.jar.kept": "اسم منقوص مجرور وعلامة جره الكسرة المقدرة على الياء للثقل",
  "manqous.jar.deleted": "اسم منقوص مجرور وعلامة جره الكسرة المقدرة على الياء المحذوفة"
};
const all = Object.values(resultByCover);
export const ismManqousQuizExamples = ismManqousExamples.map((ex, i) => {
  const correct = resultByCover[ex.covers[0]];
  const options = Array.from(new Set([correct, ...all.slice(i, i + 4), ...all])).slice(0, 4);
  return { ...ex, prompt: "ما إعراب الاسم المنقوص المحدد؟", options, correctI3rab: correct, whyCorrect: "نحدد الموقع الإعرابي أولًا، ثم نسأل عن بقاء الياء أو حذفها.", optionReasons: Object.fromEntries(options.map((o) => [o, o === correct ? "صحيح؛ الموقع وبقاء الياء/حذفها مطابقان." : "خطأ؛ راجع هل الاسم منصوب أو مرفوع/مجرور، وهل الياء باقية أم محذوفة."])) };
});
