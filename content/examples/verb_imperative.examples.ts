export type Example = { id: string; sentence: string; target: string; facts: Record<string, any>; covers: string[] };

export const imperativeVerbCoverageKeysOrdered = [
  "imperative.fath_tawkid",
  "imperative.delete_noon.waw",
  "imperative.delete_noon.yaa",
  "imperative.delete_noon.alif2",
  "imperative.delete_letter",
  "imperative.sukoon"
];

export const imperativeVerbExamples: Example[] = [
  { id: "im-00", sentence: "اكتبنَّ الواجبَ.", target: "اكتبنَّ", facts: { nunTawkid: true, attached: "none", ending: "sahih" }, covers: ["imperative.fath_tawkid"] },
  { id: "im-01", sentence: "اكتبوا الواجبَ.", target: "اكتبوا", facts: { nunTawkid: false, attached: "waw" }, covers: ["imperative.delete_noon.waw"] },
  { id: "im-02", sentence: "اكتبي الدرسَ.", target: "اكتبي", facts: { nunTawkid: false, attached: "yaa" }, covers: ["imperative.delete_noon.yaa"] },
  { id: "im-03", sentence: "اكتبا الجملةَ.", target: "اكتبا", facts: { nunTawkid: false, attached: "alif2" }, covers: ["imperative.delete_noon.alif2"] },
  { id: "im-04", sentence: "ارمِ الكرةَ.", target: "ارمِ", facts: { nunTawkid: false, attached: "none", ending: "weak" }, covers: ["imperative.delete_letter"] },
  { id: "im-05", sentence: "ادعُ ربَّك.", target: "ادعُ", facts: { nunTawkid: false, attached: "none", ending: "weak" }, covers: ["imperative.delete_letter"] },
  { id: "im-06", sentence: "اكتبْ بخطٍّ واضحٍ.", target: "اكتبْ", facts: { nunTawkid: false, attached: "none", ending: "sahih" }, covers: ["imperative.sukoon"] }
];

const resultByCover: Record<string, string> = {
  "imperative.fath_tawkid": "فعل أمر مبني على الفتح لاتصاله بنون التوكيد",
  "imperative.delete_noon.waw": "فعل أمر مبني على حذف النون",
  "imperative.delete_noon.yaa": "فعل أمر مبني على حذف النون",
  "imperative.delete_noon.alif2": "فعل أمر مبني على حذف النون",
  "imperative.delete_letter": "فعل أمر مبني على حذف حرف العلة من آخره",
  "imperative.sukoon": "فعل أمر مبني على السكون"
};

const optionsBase = Object.values(resultByCover);
export const imperativeVerbQuizExamples = imperativeVerbExamples.map((ex, i) => {
  const correct = resultByCover[ex.covers[0]];
  const options = Array.from(new Set([correct, ...optionsBase.slice(i % 2, i % 2 + 4), ...optionsBase])).slice(0, 4);
  if (!options.includes(correct)) options[0] = correct;
  return {
    ...ex,
    prompt: "بعد التحقق خطوة خطوة، ما الإعراب الصحيح لفعل الأمر المحدد؟",
    options,
    correctI3rab: correct,
    whyCorrect: "اتبعنا التسلسل: نون التوكيد أولًا، ثم الاتصال المؤثر، ثم صحيح الآخر أو معتل الآخر.",
    optionReasons: Object.fromEntries(options.map((o) => [
      o,
      o === correct
        ? "صحيح؛ هذه الصياغة توافق نون التوكيد أو الضمير المتصل أو حالة آخر الفعل."
        : "خطأ؛ راجع: نون التوكيد، ثم الاتصال المؤثر، ثم صحيح/معتل الآخر."
    ]))
  };
});
