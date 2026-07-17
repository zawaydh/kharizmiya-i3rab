export type Example = { id: string; sentence: string; target: string; facts: Record<string, any>; covers: string[] };
export const attachedPronounsCoverageKeysOrdered = ["pronoun.raf3.attached", "pronoun.raf3.separate", "pronoun.nasb.attached", "pronoun.nasb.separate", "pronoun.jar"];
export const attachedPronounsExamples: Example[] = [
  { id: "pr-01", sentence: "كتبتُ الدرسَ.", target: "تُ", facts: { position: "raf3", form: "attached", role: "fael" }, covers: ["pronoun.raf3.attached"] },
  { id: "pr-02", sentence: "أنا أقرأُ القصةَ.", target: "أنا", facts: { position: "raf3", form: "separate", role: "mubtada" }, covers: ["pronoun.raf3.separate"] },
  { id: "pr-03", sentence: "أكرمَكَ المعلمُ.", target: "كَ", facts: { position: "nasb", form: "attached", role: "mafool" }, covers: ["pronoun.nasb.attached"] },
  { id: "pr-04", sentence: "إياكَ نعبدُ.", target: "إياكَ", facts: { position: "nasb", form: "separate", role: "mafool_muqaddam" }, covers: ["pronoun.nasb.separate"] },
  { id: "pr-05", sentence: "هذا كتابُهُ.", target: "هُ", facts: { position: "jar", form: "attached", role: "mudaf_ileyh" }, covers: ["pronoun.jar"] }
];
const resultById: Record<string, string> = {
  "pr-01": "ضمير متصل مبني في محل رفع فاعل",
  "pr-02": "ضمير منفصل مبني في محل رفع مبتدأ",
  "pr-03": "ضمير متصل مبني في محل نصب مفعول به",
  "pr-04": "ضمير منفصل مبني في محل نصب مفعول به مقدم",
  "pr-05": "ضمير متصل مبني في محل جر مضاف إليه"
};
const all = Object.values(resultById);
export const attachedPronounsQuizExamples = attachedPronounsExamples.map((ex, i) => {
  const correct = resultById[ex.id];
  const distractors = all.filter((item) => item !== correct);
  const options = [correct, ...distractors.slice(i % distractors.length), ...distractors].filter((v, idx, arr) => arr.indexOf(v) === idx).slice(0, 4);
  return {
    ...ex,
    prompt: `ما الإعراب الكامل للضمير «${ex.target}»؟`,
    options,
    correctI3rab: correct,
    whyCorrect: "حددنا موقع الضمير ثم وظيفته في الجملة، وأتممنا الإعراب بذكر المحل والوظيفة معًا.",
    optionReasons: Object.fromEntries(options.map((o) => [o, o === correct ? `صحيح؛ «${ex.target}» ${correct}.` : `خطأ؛ أعد وضع اسم ظاهر مكان «${ex.target}»، ثم حدد موقعه ووظيفته: فاعل أم مبتدأ أم مفعول به أم مضاف إليه.`]))
  };
});
