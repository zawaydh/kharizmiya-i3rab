export type Example = { id: string; sentence: string; target: string; facts: Record<string, any>; covers: string[] };
export const mafoolCoverageKeysOrdered = ["mafool.visible", "mafool.estimated", "mafool.dual", "mafool.jms", "mafool.jfs", "mafool.five", "mafool.pronoun", "mafool.ishara", "mafool.mawsool", "mafool.masdar"];
export const mafoolExamples: Example[] = [
  { id: "mf-01", sentence: "قرأَ الطالبُ الكتابَ.", target: "الكتابَ", facts: { relation: "object", nounKind: "mu3rab", number: "singular", ending: "sahih" }, covers: ["mafool.visible"] },
  { id: "mf-02", sentence: "ساعدَ المعلمُ الفتى.", target: "الفتى", facts: { relation: "object", nounKind: "mu3rab", number: "singular", ending: "moatal" }, covers: ["mafool.estimated"] },
  { id: "mf-03", sentence: "كرّمَ المديرُ الطالبينِ.", target: "الطالبينِ", facts: { relation: "object", nounKind: "mu3rab", number: "dual" }, covers: ["mafool.dual"] },
  { id: "mf-04", sentence: "شكرَ الناسُ المعلمينَ.", target: "المعلمينَ", facts: { relation: "object", nounKind: "mu3rab", number: "jms" }, covers: ["mafool.jms"] },
  { id: "mf-05", sentence: "كرّمتِ المدرسةُ الطالباتِ.", target: "الطالباتِ", facts: { relation: "object", nounKind: "mu3rab", number: "jfs" }, covers: ["mafool.jfs"] },
  { id: "mf-06", sentence: "احترمَ الطالبُ أباكَ.", target: "أباكَ", facts: { relation: "object", nounKind: "mu3rab", number: "five" }, covers: ["mafool.five"] },
  { id: "mf-07", sentence: "إياكَ نعبدُ.", target: "إياكَ", facts: { relation: "object", nounKind: "mabni", mabniType: "damir" }, covers: ["mafool.pronoun"] },
  { id: "mf-08", sentence: "قرأتُ هذا.", target: "هذا", facts: { relation: "object", nounKind: "mabni", mabniType: "ishara" }, covers: ["mafool.ishara"] },
  { id: "mf-09", sentence: "أكرمتُ الذي ساعدني.", target: "الذي", facts: { relation: "object", nounKind: "mabni", mabniType: "mawsool" }, covers: ["mafool.mawsool"] },
  { id: "mf-10", sentence: "أحبُّ أنْ تتعلمَ.", target: "أنْ تتعلمَ", facts: { relation: "object", nounKind: "masdar" }, covers: ["mafool.masdar"] }
];
const resultByCover: Record<string, string> = {
  "mafool.visible": "مفعول به منصوب وعلامة نصبه الفتحة الظاهرة على آخره",
  "mafool.estimated": "مفعول به منصوب وعلامة نصبه الفتحة المقدرة على آخره",
  "mafool.dual": "مفعول به منصوب وعلامة نصبه الياء لأنه مثنى",
  "mafool.jms": "مفعول به منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم",
  "mafool.jfs": "مفعول به منصوب وعلامة نصبه الكسرة نيابة عن الفتحة لأنه جمع مؤنث سالم",
  "mafool.five": "مفعول به منصوب وعلامة نصبه الألف لأنه من الأسماء الخمسة",
  "mafool.pronoun": "ضمير مبني في محل نصب مفعول به",
  "mafool.ishara": "اسم إشارة مبني في محل نصب مفعول به",
  "mafool.mawsool": "اسم موصول مبني في محل نصب مفعول به",
  "mafool.masdar": "مصدر مؤول في محل نصب مفعول به"
};
const base = Object.values(resultByCover);
export const mafoolQuizExamples = mafoolExamples.map((ex, i) => {
  const correct = resultByCover[ex.covers[0]];
  const options = Array.from(new Set([correct, ...base.slice(i % 5, i % 5 + 4), ...base])).slice(0, 4);
  if (!options.includes(correct)) options[0] = correct;
  return { ...ex, prompt: "ما الإعراب الصحيح للمفعول به المحدد؟", options, correctI3rab: correct, whyCorrect: "حدّدنا نوع المفعول به أولًا، ثم طبقنا حكم النصب أو محل النصب.", optionReasons: Object.fromEntries(options.map((o) => [o, o === correct ? "صحيح؛ هذه الصياغة توافق نوع المفعول به وعلامة نصبه." : "خطأ؛ الصياغة قريبة لكنها لا توافق نوع المفعول به أو علامته."])) };
});
