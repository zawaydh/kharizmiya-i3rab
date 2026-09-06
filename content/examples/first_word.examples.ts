import { requireCoverageResult, requirePrimaryCoverage } from "./exampleCoverage";
export type Example = { id: string; sentence: string; target: string; facts: Record<string, unknown>; covers: string[] };
export const firstWordCoverageKeysOrdered = ["first.noun", "first.verb.past", "first.verb.present", "first.verb.imperative", "first.particle.verb", "first.particle.noun"];
export const firstWordExamples: Example[] = [
  { id: "fw-01", sentence: "الطالبُ مجتهدٌ.", target: "الطالبُ", facts: { wordType: "noun", finalI3rab: "مبتدأ مرفوع وعلامة رفعه الضمة الظاهرة على آخره." }, covers: ["first.noun"] },
  { id: "fw-02", sentence: "كتبَ الطالبُ الدرسَ.", target: "كتبَ", facts: { wordType: "verb", verbType: "past" }, covers: ["first.verb.past"] },
  { id: "fw-03", sentence: "يقرأُ الولدُ القصةَ.", target: "يقرأُ", facts: { wordType: "verb", verbType: "present" }, covers: ["first.verb.present"] },
  { id: "fw-04", sentence: "اكتبْ بخطٍّ جميلٍ.", target: "اكتبْ", facts: { wordType: "verb", verbType: "imperative" }, covers: ["first.verb.imperative"] },
  { id: "fw-05", sentence: "لن يضيعَ الحقُّ.", target: "لن", facts: { wordType: "particle", afterParticle: "verb", afterVerbType: "present" }, covers: ["first.particle.verb"] },
  { id: "fw-06", sentence: "في المدرسةِ طلابٌ.", target: "في", facts: { wordType: "particle", afterParticle: "noun", particleEffect: "jarr" }, covers: ["first.particle.noun"] },
  { id: "fw-07", sentence: "العلمُ نورٌ.", target: "العلمُ", facts: { wordType: "noun", finalI3rab: "مبتدأ مرفوع وعلامة رفعه الضمة الظاهرة على آخره." }, covers: ["first.noun"] },
  { id: "fw-08", sentence: "نجحَ الفريقُ.", target: "نجحَ", facts: { wordType: "verb", verbType: "past" }, covers: ["first.verb.past"] },
  { id: "fw-09", sentence: "تشرقُ الشمسُ صباحًا.", target: "تشرقُ", facts: { wordType: "verb", verbType: "present" }, covers: ["first.verb.present"] },
  { id: "fw-10", sentence: "احفظْ وقتَكَ.", target: "احفظْ", facts: { wordType: "verb", verbType: "imperative" }, covers: ["first.verb.imperative"] },
  { id: "fw-11", sentence: "لم يتأخرْ القطارُ.", target: "لم", facts: { wordType: "particle", afterParticle: "verb", afterVerbType: "present" }, covers: ["first.particle.verb"] },
  { id: "fw-12", sentence: "على الطاولةِ كتابٌ.", target: "على", facts: { wordType: "particle", afterParticle: "noun", particleEffect: "jarr" }, covers: ["first.particle.noun"] }
];
const resultByCover: Record<string, string> = {
  "first.noun": "عرفت مفتاح الجملة: الكلمة الأولى اسم. إذا كانت البداية جملة اسمية فابدأ بفحص المبتدأ والخبر، ولا تحكم بأن كل اسم في أول الكلام مبتدأ قبل النظر إلى تركيب الجملة.",
  "first.verb.past": "عرفت مفتاح الجملة: الكلمة الأولى فعل ماضٍ. راجع باب الفعل الماضي لاستكمال تعلّم أحكامه وعلامات بنائه",
  "first.verb.present": "عرفت مفتاح الجملة: الكلمة الأولى فعل مضارع. راجع باب الفعل المضارع لاستكمال تعلّم رفعه ونصبه وجزمه وبنائه",
  "first.verb.imperative": "عرفت مفتاح الجملة: الكلمة الأولى فعل أمر. راجع باب فعل الأمر لاستكمال تعلّم أحكامه وعلامات بنائه",
  "first.particle.verb": "حرف وبعده فعل: حدّد زمن الفعل وأثر الحرف، ثم اختر الباب المناسب",
  "first.particle.noun": "حرف وبعده اسم: حدّد نوع الحرف وأثره، ثم اختر الباب المناسب"
};
function firstWordOptionReason(ex: Example, option: string, correct: string): string {
  if (option === correct) return `صحيح؛ الكلمة «${ex.target}» تقود إلى هذا المسار بعد تحديد نوعها وما يتصل به.`;
  if (option.includes("اسم")) return `هذا المسار يبدأ باسم، لكن «${ex.target}» في الجملة ${ex.facts.wordType === "verb" ? "تدل على حدث وزمن فهي فعل" : "حرف يوجّه ما بعده"}.`;
  if (option.includes("ماض")) return `هذا مسار الفعل الماضي، أمّا «${ex.target}» ${ex.facts.wordType !== "verb" ? "فليست فعلًا أصلًا" : ex.facts.verbType === "present" ? "فتدل على حدث يقع أو يتجدد، فهي مضارع" : "فتطلب حصول الحدث، فهي أمر"}.`;
  if (option.includes("مضارع")) return `هذا مسار الفعل المضارع، أمّا «${ex.target}» ${ex.facts.wordType !== "verb" ? "فليست فعلًا أصلًا" : ex.facts.verbType === "past" ? "فتحكي حدثًا وقع وانتهى، فهي ماضٍ" : "فتطلب فعلًا من المخاطب، فهي أمر"}.`;
  if (option.includes("أمر")) return `هذا مسار فعل الأمر، أمّا «${ex.target}» ${ex.facts.wordType !== "verb" ? "فليست فعلًا أصلًا" : ex.facts.verbType === "past" ? "فتخبر عن حدث وقع، فهي ماضٍ" : "فتخبر عن حدث يقع أو يتجدد، فهي مضارع"}.`;
  if (option.includes("بعده فعل")) return `هذا المسار يناسب حرفًا جاء بعده فعل، أمّا «${ex.target}» ${ex.facts.wordType !== "particle" ? "فليست حرفًا" : "فجاء بعدها اسم"}.`;
  if (option.includes("بعده اسم")) return `هذا المسار يناسب حرفًا جاء بعده اسم، أمّا «${ex.target}» ${ex.facts.wordType !== "particle" ? "فليست حرفًا" : "فجاء بعدها فعل"}.`;
  return `هذا المسار لا يطابق نوع «${ex.target}» ولا الخطوة التي تقود إليها في الجملة.`;
}

export const firstWordQuizExamples = firstWordExamples.map((ex) => {
  const correct = requireCoverageResult(resultByCover, ex);
  const options = Object.values(resultByCover).filter(Boolean).slice(0, 4);
  if (!options.includes(correct)) options[0] = correct;
  return { ...ex, prompt: "ما المسار الصحيح للكلمة الأولى؟", options, correctI3rab: correct, whyCorrect: "نبدأ بتحديد نوع الكلمة الأولى، ثم ننتقل إلى الشجرة المناسبة.", optionReasons: Object.fromEntries(options.map((o) => [o, firstWordOptionReason(ex, o, correct)])) };
});
