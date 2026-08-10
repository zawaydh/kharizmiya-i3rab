import { requireCoverageResult, requirePrimaryCoverage } from "./exampleCoverage";
export type Example = { id: string; sentence: string; target: string; facts: Record<string, unknown>; covers: string[] };

export const imperativeVerbCoverageKeysOrdered = [
  "imperative.sukoon.sahih",
  "imperative.sukoon.niswa",
  "imperative.delete_letter.alif",
  "imperative.delete_letter.waw",
  "imperative.delete_letter.ya",
  "imperative.delete_noon.alif2",
  "imperative.delete_noon.waw",
  "imperative.delete_noon.yaa",
  "imperative.fath_tawkid"
];

const base = {
  wordKind: "verb",
  commandMeaning: "command",
  attached: "none",
  ending: "sahih",
  weakLetter: "none",
};

export const imperativeVerbExamples: Example[] = [
  {
    id: "im-sukoon-sahih",
    sentence: "اكتبْ واجبَك.",
    target: "اكتبْ",
    facts: { ...base, attached: "none", ending: "sahih" },
    covers: ["imperative.sukoon.sahih"],
  },
  {
    id: "im-sukoon-niswa",
    sentence: "اكتبْنَ الدرسَ يا طالباتُ.",
    target: "اكتبْنَ",
    facts: { ...base, attached: "niswa", ending: "sahih" },
    covers: ["imperative.sukoon.niswa"],
  },
  {
    id: "im-delete-letter-alif",
    sentence: "اسعَ إلى الخيرِ.",
    target: "اسعَ",
    facts: { ...base, attached: "none", ending: "weak", weakLetter: "alif", presentBase: "يسعى" },
    covers: ["imperative.delete_letter.alif"],
  },
  {
    id: "im-delete-letter-waw",
    sentence: "ادعُ ربَّك.",
    target: "ادعُ",
    facts: { ...base, attached: "none", ending: "weak", weakLetter: "waw", presentBase: "يدعو" },
    covers: ["imperative.delete_letter.waw"],
  },
  {
    id: "im-delete-letter-ya",
    sentence: "ارمِ الكرةَ.",
    target: "ارمِ",
    facts: { ...base, attached: "none", ending: "weak", weakLetter: "ya", presentBase: "يرمي" },
    covers: ["imperative.delete_letter.ya"],
  },
  {
    id: "im-delete-noon-alif2",
    sentence: "اكتبا الدرسَ.",
    target: "اكتبا",
    facts: { ...base, attached: "alif2", ending: "sahih" },
    covers: ["imperative.delete_noon.alif2"],
  },
  {
    id: "im-delete-noon-waw",
    sentence: "اكتبوا الدرسَ.",
    target: "اكتبوا",
    facts: { ...base, attached: "waw", ending: "sahih" },
    covers: ["imperative.delete_noon.waw"],
  },
  {
    id: "im-delete-noon-yaa",
    sentence: "اكتبي الدرسَ.",
    target: "اكتبي",
    facts: { ...base, attached: "yaa", ending: "sahih" },
    covers: ["imperative.delete_noon.yaa"],
  },
  {
    id: "im-fath-tawkid",
    sentence: "اكتبَنَّ الدرسَ.",
    target: "اكتبَنَّ",
    facts: { ...base, attached: "tawkid", ending: "sahih" },
    covers: ["imperative.fath_tawkid"],
  },
];

const resultByCover: Record<string, string> = {
  "imperative.sukoon.sahih": "فعل أمر مبني على السكون.\nالفاعل: ضمير مستتر وجوبًا تقديره أنت.",
  "imperative.sukoon.niswa": "فعل أمر مبني على السكون لاتصاله بنون النسوة.\nنون النسوة: ضمير متصل مبني على الفتح في محل رفع فاعل.",
  "imperative.delete_letter.alif": "فعل أمر مبني على حذف حرف العلة.\nحرف العلة المحذوف: الألف.\nالفاعل: ضمير مستتر وجوبًا تقديره أنت.",
  "imperative.delete_letter.waw": "فعل أمر مبني على حذف حرف العلة.\nحرف العلة المحذوف: الواو.\nالفاعل: ضمير مستتر وجوبًا تقديره أنت.",
  "imperative.delete_letter.ya": "فعل أمر مبني على حذف حرف العلة.\nحرف العلة المحذوف: الياء.\nالفاعل: ضمير مستتر وجوبًا تقديره أنت.",
  "imperative.delete_noon.alif2": "فعل أمر مبني على حذف النون؛ لأنه اتصل بألف الاثنين.\nألف الاثنين: ضمير متصل مبني في محل رفع فاعل.",
  "imperative.delete_noon.waw": "فعل أمر مبني على حذف النون؛ لأنه اتصل بواو الجماعة.\nواو الجماعة: ضمير متصل مبني في محل رفع فاعل.\nالألف: ألف فارقة لا محل لها من الإعراب.",
  "imperative.delete_noon.yaa": "فعل أمر مبني على حذف النون؛ لأنه اتصل بياء المخاطبة.\nياء المخاطبة: ضمير متصل مبني في محل رفع فاعل.",
  "imperative.fath_tawkid": "فعل أمر مبني على الفتح لاتصاله بنون التوكيد.\nنون التوكيد: حرف توكيد لا محل له من الإعراب.",
};

const optionsBase = Object.values(resultByCover);
export const imperativeVerbQuizExamples = imperativeVerbExamples.map((ex, i) => {
  const correct = requireCoverageResult(resultByCover, ex);
  const options = Array.from(new Set([correct, ...optionsBase.slice(i % 3, i % 3 + 4), ...optionsBase])).slice(0, 4);
  if (!options.includes(correct)) options[0] = correct;
  return {
    ...ex,
    prompt: "بعد التحقق خطوة خطوة، ما الإعراب الصحيح لفعل الأمر المحدد؟",
    options,
    correctI3rab: correct,
    whyCorrect: "اتبعنا المسار: نوع الكلمة، دلالة الطلب، ثم الاتصال أو آخر الفعل لتحديد علامة البناء.",
    optionReasons: Object.fromEntries(options.map((o) => [
      o,
      o === correct
        ? "صحيح؛ هذه الصياغة توافق اتصال فعل الأمر أو حالة آخره."
        : "خطأ؛ راجع الاتصال بالفعل أو حالة آخره قبل اختيار علامة البناء."
    ]))
  };
});
