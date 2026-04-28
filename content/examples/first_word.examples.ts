export type Example = { id: string; sentence: string; target: string; facts: Record<string, any>; covers: string[] };
export const firstWordCoverageKeysOrdered = ["first.noun", "first.verb.past", "first.verb.present", "first.verb.imperative", "first.particle.verb", "first.particle.noun"];
export const firstWordExamples: Example[] = [
  { id: "fw-01", sentence: "الطالبُ مجتهدٌ.", target: "الطالبُ", facts: { wordType: "noun" }, covers: ["first.noun"] },
  { id: "fw-02", sentence: "كتبَ الطالبُ الدرسَ.", target: "كتبَ", facts: { wordType: "verb", verbType: "past" }, covers: ["first.verb.past"] },
  { id: "fw-03", sentence: "يقرأُ الولدُ القصةَ.", target: "يقرأُ", facts: { wordType: "verb", verbType: "present" }, covers: ["first.verb.present"] },
  { id: "fw-04", sentence: "اكتبْ بخطٍّ جميلٍ.", target: "اكتبْ", facts: { wordType: "verb", verbType: "imperative" }, covers: ["first.verb.imperative"] },
  { id: "fw-05", sentence: "لن يضيعَ الحقُّ.", target: "لن", facts: { wordType: "particle", afterParticle: "verb" }, covers: ["first.particle.verb"] },
  { id: "fw-06", sentence: "في المدرسةِ طلابٌ.", target: "في", facts: { wordType: "particle", afterParticle: "noun" }, covers: ["first.particle.noun"] }
];
const resultByCover: Record<string, string> = {
  "first.noun": "الكلمة الأولى اسم؛ ننتقل بعدها إلى شجرة الاسم لتحديد: معرب/مبني/مصدر مؤول ثم الإعراب الدقيق بحسب موقعها",
  "first.verb.past": "الكلمة الأولى فعل ماضٍ؛ ننتقل إلى خوارزمية الفعل الماضي لتحديد علامة البناء",
  "first.verb.present": "الكلمة الأولى فعل مضارع؛ ننتقل إلى خوارزمية الفعل المضارع بدءًا من الأداة السابقة له",
  "first.verb.imperative": "الكلمة الأولى فعل أمر؛ ننتقل إلى خوارزمية فعل الأمر لتحديد علامة البناء",
  "first.particle.verb": "حرف مبني لا محل له من الإعراب، وبعده فعل فتتجه الجملة إلى تركيب فعلي",
  "first.particle.noun": "حرف مبني لا محل له من الإعراب، وبعده اسم فتتجه الجملة إلى تركيب اسمي أو شبه جملة بحسب الحرف"
};
export const firstWordQuizExamples = firstWordExamples.map((ex) => {
  const correct = resultByCover[ex.covers[0]];
  const options = Object.values(resultByCover).filter(Boolean).slice(0, 4);
  if (!options.includes(correct)) options[0] = correct;
  return { ...ex, prompt: "ما المسار الصحيح للكلمة الأولى؟", options, correctI3rab: correct, whyCorrect: "نبدأ بتحديد نوع الكلمة الأولى، ثم ننتقل إلى الشجرة المناسبة.", optionReasons: Object.fromEntries(options.map((o) => [o, o === correct ? "صحيح؛ هذا هو المسار المناسب للكلمة الأولى." : "خطأ؛ نوع الكلمة الأولى لا يقود إلى هذا المسار."])) };
});
