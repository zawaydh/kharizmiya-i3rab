export type Example = { id: string; sentence: string; target: string; facts: Record<string, any>; covers: string[] };
export const attachedPronounsCoverageKeysOrdered = ["pronoun.raf3.attached", "pronoun.raf3.separate", "pronoun.nasb.attached", "pronoun.nasb.separate", "pronoun.jar"];
export const attachedPronounsExamples: Example[] = [
  { id: "pr-01", sentence: "كتبتُ الدرسَ.", target: "تُ", facts: { source: "verb", position: "raf3", form: "attached", role: "doer" }, covers: ["pronoun.raf3.attached"] },
  { id: "pr-02", sentence: "أنا أقرأُ القصةَ.", target: "أنا", facts: { source: "separate", position: "raf3", form: "separate", role: "mubtada" }, covers: ["pronoun.raf3.separate"] },
  { id: "pr-03", sentence: "أكرمَكَ المعلمُ.", target: "كَ", facts: { source: "verb", position: "nasb", form: "attached", role: "object" }, covers: ["pronoun.nasb.attached"] },
  { id: "pr-04", sentence: "إياكَ نعبدُ.", target: "إياكَ", facts: { source: "separate", position: "nasb", form: "separate", role: "object" }, covers: ["pronoun.nasb.separate"] },
  { id: "pr-05", sentence: "هذا كتابُهُ.", target: "هُ", facts: { source: "noun", position: "jar", form: "attached", role: "mudaf" }, covers: ["pronoun.jar"] }
];
const resultByCover: Record<string, string> = {
  "pronoun.raf3.attached": "ضمير رفع متصل مبني في محل رفع",
  "pronoun.raf3.separate": "ضمير رفع منفصل مبني في محل رفع",
  "pronoun.nasb.attached": "ضمير نصب متصل مبني في محل نصب",
  "pronoun.nasb.separate": "ضمير نصب منفصل مبني في محل نصب",
  "pronoun.jar": "ضمير متصل مبني في محل جر"
};
const all = Object.values(resultByCover);
export const attachedPronounsQuizExamples = attachedPronounsExamples.map((ex, i) => {
  const correct = resultByCover[ex.covers[0]];
  const options = Array.from(new Set([correct, ...all.slice(i, i + 4), ...all])).slice(0, 4);
  return { ...ex, prompt: "ما التصنيف الصحيح للضمير المحدد؟", options, correctI3rab: correct, whyCorrect: "نحدد هل حل الضمير محل اسم مرفوع أو منصوب أو مجرور، ثم نحدد اتصاله أو انفصاله.", optionReasons: Object.fromEntries(options.map((o) => [o, o === correct ? "صحيح؛ الضمير أخذ محل الاسم الذي ناب عنه." : "خطأ؛ راجع محل الاسم الذي ناب عنه الضمير: مرفوع أم منصوب أم مجرور."])) };
});
