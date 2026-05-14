export type FollowUpOption = { label: string; correct: boolean; feedback: string };
export type FollowUp = { question: string; options: FollowUpOption[] };
export type Example = { id: string; sentence: string; target: string; facts: Record<string, any>; covers: string[]; followUp?: FollowUp };

export const pastVerbCoverageKeysOrdered = [
  "past.fatha",
  "past.damma_waw",
  "past.sukoon_moving",
  "past.sukoon_niswa",
  "past.fatha_alif"
];

export const pastVerbExamples: Example[] = [
  {
    id: "pv-01",
    sentence: "كتبَ الطالبُ الدرسَ.",
    target: "كتبَ",
    facts: { hasPronoun: false, pronounType: "none" },
    covers: ["past.fatha"],
    followUp: {
      question: "الفاعل هو:",
      options: [
        { label: "الطالبُ", correct: true, feedback: "صحيح؛ الطالب هو من قام بالفعل." },
        { label: "الدرسَ", correct: false, feedback: "هذا مفعول به وقع عليه الفعل." },
        { label: "كتبَ", correct: false, feedback: "هذه هي الكلمة الهدف: فعل ماضٍ." }
      ]
    }
  },
  { id: "pv-02", sentence: "كتبوا الواجبَ.", target: "كتبوا", facts: { hasPronoun: true, pronounType: "waw", isWaw: true, sukoonSet: false }, covers: ["past.damma_waw"] },
  { id: "pv-03", sentence: "كتبتُ الملخصَ.", target: "كتبتُ", facts: { hasPronoun: true, pronounType: "moving", isWaw: false, sukoonSet: true }, covers: ["past.sukoon_moving"] },
  { id: "pv-04", sentence: "كتبنا الدرسَ.", target: "كتبنا", facts: { hasPronoun: true, pronounType: "moving", isWaw: false, sukoonSet: true }, covers: ["past.sukoon_moving"] },
  { id: "pv-05", sentence: "كتبنَ الدرسَ.", target: "كتبنَ", facts: { hasPronoun: true, pronounType: "niswa", isWaw: false, sukoonSet: true }, covers: ["past.sukoon_niswa"] },
  { id: "pv-06", sentence: "كتبا الواجبَ.", target: "كتبا", facts: { hasPronoun: true, pronounType: "alif", isWaw: false, sukoonSet: false }, covers: ["past.fatha_alif"] }
];

const resultByCover: Record<string, string> = {
  "past.fatha": "فعل ماضٍ مبني على الفتح الظاهر على آخره",
  "past.damma_waw": "فعل ماضٍ مبني على الضم لاتصاله بواو الجماعة، وواو الجماعة ضمير متصل مبني في محل رفع فاعل",
  "past.fatha_alif": "فعل ماضٍ مبني على الفتح لاتصاله بألف الاثنين، وألف الاثنين ضمير متصل مبني في محل رفع فاعل",
  "past.sukoon_niswa": "فعل ماضٍ مبني على السكون لاتصاله بنون النسوة، ونون النسوة ضمير متصل مبني في محل رفع فاعل",
  "past.sukoon_moving": "فعل ماضٍ مبني على السكون لاتصاله بضمير رفع متحرك، والضمير المتصل مبني في محل رفع فاعل"
};

const optionsBase = Object.values(resultByCover);

export const pastVerbQuizExamples = pastVerbExamples.map((ex, i) => {
  const correct = resultByCover[ex.covers[0]];
  const options = Array.from(new Set([correct, ...optionsBase.slice(i % 2, i % 2 + 4), ...optionsBase])).slice(0, 4);
  if (!options.includes(correct)) options[0] = correct;

  return {
    ...ex,
    prompt: "بعد تتبّع القرارات، ما الإعراب الصحيح للفعل الماضي المحدد؟",
    options,
    correctI3rab: correct,
    whyCorrect: "اتبعنا التسلسل: هل اتصل بضمير؟ ثم هل هو واو الجماعة؟ ثم هل هو من ضمائر السكون؟ ثم ألف الاثنين عند الحاجة.",
    optionReasons: Object.fromEntries(options.map((o) => [
      o,
      o === correct
        ? "صحيح؛ هذه الصياغة تطابق نوع الضمير المتصل وحكم بناء الفعل."
        : "خطأ؛ راجع نوع الضمير المتصل أولًا ثم علامة البناء."
    ]))
  };
});
