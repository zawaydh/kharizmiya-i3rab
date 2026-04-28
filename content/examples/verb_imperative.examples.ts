export type Example = { id: string; sentence: string; target: string; facts: Record<string, any>; covers: string[] };

export const imperativeVerbCoverageKeysOrdered = [
  "imperative.delete_noon.waw",
  "imperative.delete_noon.yaa",
  "imperative.delete_noon.alif2",
  "imperative.delete_letter",
  "imperative.sukoon"
];

export const imperativeVerbExamples: Example[] = [
  { id: "im-01", sentence: "اكتبوا الواجبَ.", target: "اكتبوا", facts: { attached: "waw" }, covers: ["imperative.delete_noon.waw"] },
  { id: "im-02", sentence: "اكتبي الدرسَ.", target: "اكتبي", facts: { attached: "yaa" }, covers: ["imperative.delete_noon.yaa"] },
  { id: "im-03", sentence: "اكتبا الجملةَ.", target: "اكتبا", facts: { attached: "alif2" }, covers: ["imperative.delete_noon.alif2"] },
  { id: "im-04", sentence: "ارمِ الكرةَ.", target: "ارمِ", facts: { attached: "none", ending: "weak" }, covers: ["imperative.delete_letter"] },
  { id: "im-05", sentence: "ادعُ ربَّك.", target: "ادعُ", facts: { attached: "none", ending: "weak" }, covers: ["imperative.delete_letter"] },
  { id: "im-06", sentence: "اكتبْ بخطٍّ واضحٍ.", target: "اكتبْ", facts: { attached: "none", ending: "sahih" }, covers: ["imperative.sukoon"] }
];

const resultByCover: Record<string, string> = {
  "imperative.delete_noon.waw": "فعل أمر مبني على حذف النون من آخره لاتصاله بواو الجماعة، وواو الجماعة ضمير متصل مبني في محل رفع فاعل",
  "imperative.delete_noon.yaa": "فعل أمر مبني على حذف النون من آخره لاتصاله بياء المخاطبة، وياء المخاطبة ضمير متصل مبني في محل رفع فاعل",
  "imperative.delete_noon.alif2": "فعل أمر مبني على حذف النون من آخره لاتصاله بألف الاثنين، وألف الاثنين ضمير متصل مبني في محل رفع فاعل",
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
    prompt: "ما الإعراب الصحيح لفعل الأمر المحدد؟",
    options,
    correctI3rab: correct,
    whyCorrect: "اتبعنا التسلسل: هل اتصل بواو الجماعة/ياء المخاطبة/ألف الاثنين؟ فإن لم يتصل، نعيده إلى أصله لمعرفة هل هو معتل الآخر.",
    optionReasons: Object.fromEntries(options.map((o) => [o, o === correct ? "صحيح؛ هذه الصياغة توافق الضمير المتصل أو حالة الاعتلال." : "خطأ؛ راجع هل اتصل الفعل بضمير، أو هل حرف العلة محذوف من الأصل."]))
  };
});
