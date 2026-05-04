export type Example = { id: string; sentence: string; target: string; facts: Record<string, any>; covers: string[] };
export const attachedPronounsCoverageKeysOrdered = ["pronoun.raf3.attached", "pronoun.raf3.separate", "pronoun.nasb.attached", "pronoun.nasb.separate", "pronoun.jar"];
export const attachedPronounsExamples: Example[] = [
  { id: "pr-01", sentence: "كتبتُ الدرسَ.", target: "تُ", facts: { position: "raf3", form: "attached" }, covers: ["pronoun.raf3.attached"] },
  { id: "pr-02", sentence: "أنا أقرأُ القصةَ.", target: "أنا", facts: { position: "raf3", form: "separate" }, covers: ["pronoun.raf3.separate"] },
  { id: "pr-03", sentence: "أكرمَكَ المعلمُ.", target: "كَ", facts: { position: "nasb", form: "attached" }, covers: ["pronoun.nasb.attached"] },
  { id: "pr-04", sentence: "إياكَ نعبدُ.", target: "إياكَ", facts: { position: "nasb", form: "separate" }, covers: ["pronoun.nasb.separate"] },
  { id: "pr-05", sentence: "هذا كتابُهُ.", target: "هُ", facts: { position: "jar" }, covers: ["pronoun.jar"] }
];
const resultByCover: Record<string, string> = {
  "pronoun.raf3.attached": "ضمير متصل مبني في محل رفع فاعل",
  "pronoun.raf3.separate": "ضمير منفصل مبني في محل رفع مبتدأ",
  "pronoun.nasb.attached": "ضمير متصل مبني في محل نصب مفعول به",
  "pronoun.nasb.separate": "ضمير منفصل مبني في محل نصب مفعول به",
  "pronoun.jar": "ضمير متصل مبني في محل جر مضاف إليه"
};
const all = Object.values(resultByCover);
export const attachedPronounsQuizExamples = attachedPronounsExamples.map((ex, i) => {
  const correct = resultByCover[ex.covers[0]];
  const options = Array.from(new Set([correct, ...all.slice(i, i + 4), ...all])).slice(0, 4);
  return { ...ex, prompt: "ما التصنيف الصحيح للضمير المحدد؟", options, correctI3rab: correct, whyCorrect: "نثبت الصياغة أولًا: ضمير متصل/منفصل مبني في محل... ثم نحدد المحل: رفع أو نصب أو جر حسب الاسم الذي حلّ محله أو موقعه في الجملة.", optionReasons: Object.fromEntries(options.map((o) => [o, o === correct ? "صحيح؛ بدأنا بعبارة الضمير المبني، ثم حددنا محله الإعرابي حسب موقعه في الجملة." : "خطأ؛ لا نغيّر عبارة (ضمير متصل/منفصل مبني في محل)، بل نراجع المحل: هل حلّ محل مرفوع أو منصوب أو مجرور؟"])) };
});
