export type Example = { id: string; sentence: string; target: string; facts: Record<string, any>; covers: string[] };
export const attachedPronounsCoverageKeysOrdered = ["pronoun.raf3.attached", "pronoun.raf3.separate", "pronoun.nasb.attached", "pronoun.nasb.separate", "pronoun.jar"];
export const attachedPronounsExamples: Example[] = [
  { id: "pr-01", sentence: "كتبتُ الدرسَ.", target: "تُ", facts: { source: "verb", role: "fael" }, covers: ["pronoun.raf3.attached"] },
  { id: "pr-02", sentence: "أنا أقرأُ القصةَ.", target: "أنا", facts: { source: "separate", separateKind: "raf3" }, covers: ["pronoun.raf3.separate"] },
  { id: "pr-03", sentence: "أكرمَكَ المعلمُ.", target: "كَ", facts: { source: "verb", role: "mafool" }, covers: ["pronoun.nasb.attached"] },
  { id: "pr-04", sentence: "إياكَ نعبدُ.", target: "إياكَ", facts: { source: "separate", separateKind: "nasb" }, covers: ["pronoun.nasb.separate"] },
  { id: "pr-05", sentence: "هذا كتابُهُ.", target: "هُ", facts: { source: "noun" }, covers: ["pronoun.jar"] },
  { id: "pr-06", sentence: "مررتُ بهِ.", target: "هِ", facts: { source: "harf_jar" }, covers: ["pronoun.jar"] }
];
const resultByCover: Record<string, string> = {
  "pronoun.raf3.attached": "ضمير رفع متصل مبني في محل رفع فاعل",
  "pronoun.raf3.separate": "ضمير رفع منفصل مبني في محل رفع بحسب موقعه",
  "pronoun.nasb.attached": "ضمير نصب متصل مبني في محل نصب مفعول به",
  "pronoun.nasb.separate": "ضمير نصب منفصل مبني في محل نصب مفعول به",
  "pronoun.jar": "ضمير متصل مبني في محل جر"
};
const all = Object.values(resultByCover);
export const attachedPronounsQuizExamples = attachedPronounsExamples.map((ex, i) => {
  const correct = resultByCover[ex.covers[0]];
  const options = Array.from(new Set([correct, ...all.slice(i, i + 4), ...all])).slice(0, 4);
  return { ...ex, prompt: "بعد تتبع العامل ووظيفة الضمير، ما التصنيف الصحيح؟", options, correctI3rab: correct, whyCorrect: "بدأنا من العامل أو موقع الضمير، ثم سألنا: هل قام بالفعل، وقع عليه، أو جُرّ باسم/حرف؟", optionReasons: Object.fromEntries(options.map((o) => [o, o === correct ? "صحيح؛ التصنيف يوافق العامل وموقع الضمير." : "خطأ؛ ارجع للسؤال: بماذا اتصل الضمير؟ وما وظيفته؟"])) };
});
