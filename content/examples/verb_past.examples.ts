import { requireCoverageResult, requirePrimaryCoverage } from "./exampleCoverage";
export type FollowUpOption = { label: string; correct: boolean; feedback: string };
export type FollowUp = { question: string; options: FollowUpOption[] };
export type Example = { id: string; sentence: string; target: string; facts: Record<string, unknown>; covers: string[]; followUp?: FollowUp };

export const pastVerbCoverageKeysOrdered = [
  "past.fatha",
  "past.fatha_estimated_alif",
  "past.fatha_taa",
  "past.weak_taa_alif",
  "past.fatha_nasb",
  "past.fatha_nasb_estimated_alif",
  "past.sukoon_taa_fael",
  "past.sukoon_na_faelin",
  "past.sukoon_niswa",
  "past.fatha_alif",
  "past.fatha_alif_weak",
  "past.damma_waw",
  "past.weak_waw_alif",
  "past.weak_waw_yaa"
];

const baseFacts = {
  wordKind: "verb",
  verbTense: "past",
  weakOrigin: false
};

export const pastVerbExamples: Example[] = [
  {
    id: "pv-01",
    sentence: "قرأَ الطالبُ القصةَ.",
    target: "قرأَ",
    facts: { ...baseFacts, hasAttached: false, connectorKind: "none", raf3BuildGroup: "none", raf3Type: "none", weakEnding: "none", weakDeleted: false, basePastHuwa: "قرأ", deletedLetter: "none" },
    covers: ["past.fatha"],
    followUp: {
      question: "الفاعل هو:",
      options: [
        { label: "الطالبُ", correct: true, feedback: "صحيح؛ الطالب هو من قام بالفعل." },
        { label: "القصةَ", correct: false, feedback: "هذا مفعول به وقع عليه الفعل." },
        { label: "قرأَ", correct: false, feedback: "هذه هي الكلمة الهدف: فعل ماضٍ." }
      ]
    }
  },
  {
    id: "pv-02",
    sentence: "سعى العاملُ في الخير.",
    target: "سعى",
    facts: { ...baseFacts, hasAttached: false, connectorKind: "none", raf3BuildGroup: "none", raf3Type: "none", weakEnding: "alif_visible", weakDeleted: false, basePastHuwa: "سعى", deletedLetter: "none" },
    covers: ["past.fatha_estimated_alif"]
  },
  {
    id: "pv-03",
    sentence: "نجحتْ ليلى في الاختبار.",
    target: "نجحتْ",
    facts: { ...baseFacts, hasAttached: true, connectorKind: "taa_tanith", raf3BuildGroup: "none", raf3Type: "none", weakEnding: "none", weakDeleted: false, basePastHuwa: "نجح", deletedLetter: "none" },
    covers: ["past.fatha_taa"]
  },
  {
    id: "pv-04",
    sentence: "مشتْ هندٌ إلى المدرسة.",
    target: "مشتْ",
    facts: { ...baseFacts, hasAttached: true, connectorKind: "taa_tanith", raf3BuildGroup: "none", raf3Type: "none", weakEnding: "none", weakDeleted: true, basePastHuwa: "مشى", deletedLetter: "alif" },
    covers: ["past.weak_taa_alif"]
  },
  {
    id: "pv-05",
    sentence: "حفظَهُ التلميذُ سريعًا.",
    target: "حفظَهُ",
    facts: { ...baseFacts, hasAttached: true, connectorKind: "nasb", raf3BuildGroup: "none", raf3Type: "none", weakEnding: "none", weakDeleted: false, basePastHuwa: "حفظ", deletedLetter: "none" },
    covers: ["past.fatha_nasb"]
  },
  {
    id: "pv-06",
    sentence: "رماهُ اللاعبُ بقوة.",
    target: "رماهُ",
    facts: { ...baseFacts, hasAttached: true, connectorKind: "nasb", raf3BuildGroup: "none", raf3Type: "none", weakEnding: "alif_visible", weakDeleted: false, basePastHuwa: "رمى", deletedLetter: "none" },
    covers: ["past.fatha_nasb_estimated_alif"]
  },
  {
    id: "pv-07",
    sentence: "فهمتُ الدرسَ.",
    target: "فهمتُ",
    facts: { ...baseFacts, hasAttached: true, connectorKind: "raf3", raf3BuildGroup: "sukoon", raf3Type: "taa_fael", weakEnding: "none", weakDeleted: false, basePastHuwa: "فهم", deletedLetter: "none" },
    covers: ["past.sukoon_taa_fael"]
  },
  {
    id: "pv-08",
    sentence: "حفظنا النشيدَ.",
    target: "حفظنا",
    facts: { ...baseFacts, hasAttached: true, connectorKind: "raf3", raf3BuildGroup: "sukoon", raf3Type: "na_faelin", weakEnding: "none", weakDeleted: false, basePastHuwa: "حفظ", deletedLetter: "none" },
    covers: ["past.sukoon_na_faelin"]
  },
  {
    id: "pv-09",
    sentence: "الطالباتُ جلسنَ بهدوء.",
    target: "جلسنَ",
    facts: { ...baseFacts, hasAttached: true, connectorKind: "raf3", raf3BuildGroup: "sukoon", raf3Type: "niswa", weakEnding: "none", weakDeleted: false, basePastHuwa: "جلس", deletedLetter: "none" },
    covers: ["past.sukoon_niswa"]
  },
  {
    id: "pv-10",
    sentence: "الفائزانِ حضرا الحفلَ.",
    target: "حضرا",
    facts: { ...baseFacts, hasAttached: true, connectorKind: "raf3", raf3BuildGroup: "alif", raf3Type: "alif", weakEnding: "none", weakDeleted: false, basePastHuwa: "حضر", deletedLetter: "none" },
    covers: ["past.fatha_alif"]
  },
  {
    id: "pv-11",
    sentence: "الصديقانِ سعيا إلى الخير.",
    target: "سعيا",
    facts: { ...baseFacts, hasAttached: true, connectorKind: "raf3", raf3BuildGroup: "alif", raf3Type: "alif", weakEnding: "none", weakDeleted: false, weakOrigin: true, basePastHuwa: "سعى", deletedLetter: "none" },
    covers: ["past.fatha_alif_weak"]
  },
  {
    id: "pv-12",
    sentence: "المسافرونَ رجعوا مساءً.",
    target: "رجعوا",
    facts: { ...baseFacts, hasAttached: true, connectorKind: "raf3", raf3BuildGroup: "waw", raf3Type: "waw", weakEnding: "none", weakDeleted: false, basePastHuwa: "رجع", deletedLetter: "none" },
    covers: ["past.damma_waw"]
  },
  {
    id: "pv-13",
    sentence: "مَضَوْا في الطريق.",
    target: "مَضَوْا",
    facts: { ...baseFacts, hasAttached: true, connectorKind: "raf3", raf3BuildGroup: "waw", raf3Type: "waw", weakEnding: "none", weakDeleted: true, basePastHuwa: "مضى", deletedLetter: "alif" },
    covers: ["past.weak_waw_alif"]
  },
  {
    id: "pv-14",
    sentence: "بَقُوا في البيت.",
    target: "بَقُوا",
    facts: { ...baseFacts, hasAttached: true, connectorKind: "raf3", raf3BuildGroup: "waw", raf3Type: "waw", weakEnding: "none", weakDeleted: true, basePastHuwa: "بقي", deletedLetter: "yaa" },
    covers: ["past.weak_waw_yaa"]
  }
];

const resultByCover: Record<string, string> = {
  "past.fatha": "فعل ماضٍ مبني على الفتح الظاهر على آخره",
  "past.fatha_estimated_alif": "فعل ماضٍ مبني على الفتح المقدر على الألف",
  "past.fatha_taa": "نجحتْ: فعل ماضٍ مبني على الفتح الظاهر على آخره. والتاء: تاء تأنيث ساكنة لا محل لها من الإعراب",
  "past.weak_taa_alif": "مشتْ: فعل ماضٍ مبني على الفتح المقدر على الألف المحذوفة. والتاء: تاء تأنيث ساكنة لا محل لها من الإعراب",
  "past.fatha_nasb": "فعل ماضٍ مبني على الفتح الظاهر على آخره، والهاء ضمير متصل مبني في محل نصب مفعول به",
  "past.fatha_nasb_estimated_alif": "فعل ماضٍ مبني على الفتح المقدر على الألف، والهاء ضمير متصل مبني في محل نصب مفعول به",
  "past.sukoon_taa_fael": "فهمتُ: فعل ماضٍ مبني على السكون لاتصاله بضمير رفع متحرك (تاء الفاعل). والتاء: ضمير متصل مبني في محل رفع فاعل",
  "past.sukoon_na_faelin": "حفظنا: فعل ماضٍ مبني على السكون لاتصاله بضمير رفع متحرك (نا الفاعلين). نا: ضمير متصل مبني في محل رفع فاعل",
  "past.sukoon_niswa": "جلسنَ: فعل ماضٍ مبني على السكون لاتصاله بضمير رفع متحرك (نون النسوة). ونون النسوة: ضمير متصل مبني على الفتح في محل رفع فاعل",
  "past.fatha_alif": "حضرا: فعل ماضٍ مبني على الفتح لاتصاله بألف الاثنين. وألف الاثنين: ضمير متصل مبني في محل رفع فاعل",
  "past.fatha_alif_weak": "سعيا: فعل ماضٍ مبني على الفتح لاتصاله بألف الاثنين. وألف الاثنين: ضمير متصل مبني في محل رفع فاعل. وأصل الفعل: سعى",
  "past.damma_waw": "رجعوا: فعل ماضٍ مبني على الضم لاتصاله بواو الجماعة. وواو الجماعة: ضمير متصل مبني في محل رفع فاعل. والألف: ألف فارقة لا محل لها من الإعراب",
  "past.weak_waw_alif": "مَضَوْا: فعل ماضٍ مبني على الضم المقدر على الألف المحذوفة لاتصاله بواو الجماعة. وواو الجماعة: ضمير متصل مبني في محل رفع فاعل. والألف: ألف فارقة لا محل لها من الإعراب",
  "past.weak_waw_yaa": "بَقُوا: فعل ماضٍ مبني على الضم المقدر على الياء المحذوفة لاتصاله بواو الجماعة. وواو الجماعة: ضمير متصل مبني في محل رفع فاعل. والألف: ألف فارقة لا محل لها من الإعراب"
};

const optionsBase = Object.values(resultByCover);

export const pastVerbQuizExamples = pastVerbExamples.map((ex, i) => {
  const correct = requireCoverageResult(resultByCover, ex);
  const distractors = optionsBase.filter((o) => o !== correct);
  if (distractors.length === 0) {
    throw new Error(`${ex.id}: لا توجد مشتتات كافية لبناء سؤال الفعل الماضي.`);
  }
  const options = [correct, ...distractors.slice(i % Math.max(1, distractors.length - 3), i % Math.max(1, distractors.length - 3) + 3)];
  while (options.length < 4) {
    const candidate = distractors[options.length % distractors.length];
    if (candidate && !options.includes(candidate)) options.push(candidate);
  }

  return {
    ...ex,
    prompt: "بعد تتبّع القرارات، ما الإعراب الصحيح للفعل الماضي المحدد؟",
    options,
    correctI3rab: correct,
    whyCorrect: "اتبعنا التسلسل: نوع الكلمة، نوع الفعل، هل اتصل بالفعل شيء، نوع المتصل، ثم أثره في علامة البناء. وإذا حُذف حرف علة رددنا الفعل إلى الماضي مع الضمير هو.",
    optionReasons: Object.fromEntries(options.map((o) => [
      o,
      o === correct
        ? "صحيح؛ هذه الصياغة تطابق نوع المتصل وحكم بناء الفعل."
        : "خطأ؛ راجع نوع المتصل بالفعل أولًا، ثم انتبه إن كان الفعل ناقصًا وحُذف منه حرف علة."
    ]))
  };
});
