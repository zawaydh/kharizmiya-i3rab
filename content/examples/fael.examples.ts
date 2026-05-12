export type Example = { id: string; sentence: string; target: string; facts: Record<string, any>; covers: string[] };
export const faelCoverageKeysOrdered = ["fael.visible", "fael.estimated", "fael.dual", "fael.jms", "fael.jfs", "fael.five", "fael.pronoun", "fael.ishara", "fael.mawsool", "fael.masdar"];
export const faelExamples: Example[] = [
  { id: "fa-01", sentence: "كتبَ الطالبُ الدرسَ.", target: "الطالبُ", facts: { relation: "doer", nounKind: "mu3rab", number: "singular", ending: "sahih" }, covers: ["fael.visible"] },
  { id: "fa-02", sentence: "حضرَ الفتى مبكرًا.", target: "الفتى", facts: { relation: "doer", nounKind: "mu3rab", number: "singular", ending: "moatal" }, covers: ["fael.estimated"] },
  { id: "fa-03", sentence: "فازَ الطالبانِ.", target: "الطالبانِ", facts: { relation: "doer", nounKind: "mu3rab", number: "dual" }, covers: ["fael.dual"] },
  { id: "fa-04", sentence: "اجتهدَ المعلمونَ.", target: "المعلمونَ", facts: { relation: "doer", nounKind: "mu3rab", number: "jms" }, covers: ["fael.jms"] },
  { id: "fa-05", sentence: "نجحتِ الطالباتُ.", target: "الطالباتُ", facts: { relation: "doer", nounKind: "mu3rab", number: "jfs" }, covers: ["fael.jfs"] },
  { id: "fa-06", sentence: "حضرَ أبوكَ.", target: "أبوكَ", facts: { relation: "doer", nounKind: "mu3rab", number: "five" }, covers: ["fael.five"] },
  { id: "fa-07", sentence: "حضرَ هوَ.", target: "هوَ", facts: { relation: "doer", nounKind: "mabni", mabniType: "damir" }, covers: ["fael.pronoun"] },
  { id: "fa-08", sentence: "نجحَ هذا.", target: "هذا", facts: { relation: "doer", nounKind: "mabni", mabniType: "ishara" }, covers: ["fael.ishara"] },
  { id: "fa-09", sentence: "فازَ الذي اجتهدَ.", target: "الذي", facts: { relation: "doer", nounKind: "mabni", mabniType: "mawsool" }, covers: ["fael.mawsool"] },
  { id: "fa-10", sentence: "يسرُّني أنْ تنجحَ.", target: "أنْ تنجحَ", facts: { relation: "doer", nounKind: "masdar" }, covers: ["fael.masdar"] }
];
const resultByCover: Record<string, string> = {
  "fael.visible": "فاعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره",
  "fael.estimated": "فاعل مرفوع وعلامة رفعه الضمة المقدرة على آخره",
  "fael.dual": "فاعل مرفوع وعلامة رفعه الألف لأنه مثنى",
  "fael.jms": "فاعل مرفوع وعلامة رفعه الواو لأنه جمع مذكر سالم",
  "fael.jfs": "فاعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره لأنه جمع مؤنث سالم",
  "fael.five": "فاعل مرفوع وعلامة رفعه الواو لأنه من الأسماء الخمسة",
  "fael.pronoun": "ضمير مبني في محل رفع فاعل",
  "fael.ishara": "اسم إشارة مبني في محل رفع فاعل",
  "fael.mawsool": "اسم موصول مبني في محل رفع فاعل",
  "fael.masdar": "مصدر مؤول في محل رفع فاعل"
};
const base = Object.values(resultByCover);
export const faelQuizExamples = faelExamples.map((ex, i) => {
  const correct = resultByCover[ex.covers[0]];
  const options = Array.from(new Set([correct, ...base.slice(i % 5, i % 5 + 4), ...base])).slice(0, 4);
  if (!options.includes(correct)) options[0] = correct;
  return { ...ex, prompt: "ما الإعراب الصحيح للفاعل المحدد؟", options, correctI3rab: correct, whyCorrect: "حدّدنا نوع الفاعل أولًا، ثم طبقنا حكم الرفع أو محل الرفع.", optionReasons: Object.fromEntries(options.map((o) => [o, o === correct ? "صحيح؛ هذه الصياغة توافق نوع الفاعل وعلامة رفعه." : "خطأ؛ الصياغة قريبة لكنها لا توافق نوع الفاعل أو علامته."])) };
});
