export type FollowUpOption = { label: string; correct: boolean; feedback: string };
export type FollowUp = { question: string; options: FollowUpOption[] };
export type Example = { id: string; sentence: string; target: string; facts: Record<string, any>; covers: string[]; followUp?: FollowUp };

export const pastVerbCoverageKeysOrdered = [
  "past.fatha",
  "past.damma_waw",
  "past.fatha_alif",
  "past.sukoon_niswa",
  "past.sukoon_moving"
];

export const pastVerbExamples: Example[] = [
  { id: "pv-01", sentence: "كتبَ الطالبُ الدرسَ.", target: "كتبَ", facts: { hasPronoun: false }, covers: ["past.fatha"], followUp: { question: "الفاعل هو:", options: [ { label: "الطالبُ", correct: true, feedback: "صحيح؛ الطالب هو من قام بالفعل." }, { label: "الدرسَ", correct: false, feedback: "هذا مفعول به وقع عليه الفعل." }, { label: "كتبَ", correct: false, feedback: "هذه هي الكلمة الهدف: فعل ماضٍ." } ] } },
  { id: "pv-02", sentence: "كتبوا الواجبَ.", target: "كتبوا", facts: { hasPronoun: true, pronounType: "waw" }, covers: ["past.damma_waw"] },
  { id: "pv-03", sentence: "كتبا الواجبَ.", target: "كتبا", facts: { hasPronoun: true, pronounType: "alif" }, covers: ["past.fatha_alif"] },
  { id: "pv-04", sentence: "كتبنَ الدرسَ.", target: "كتبنَ", facts: { hasPronoun: true, pronounType: "niswa" }, covers: ["past.sukoon_niswa"] },
  { id: "pv-05", sentence: "كتبتُ الملخصَ.", target: "كتبتُ", facts: { hasPronoun: true, pronounType: "moving" }, covers: ["past.sukoon_moving"] },
  { id: "pv-06", sentence: "حفظتما القصيدةَ.", target: "حفظتما", facts: { hasPronoun: true, pronounType: "moving" }, covers: ["past.sukoon_moving"] }
];

const commonOptions = [
  "فعل ماضٍ مبني على الفتح",
  "فعل ماضٍ مبني على الضم لاتصاله بواو الجماعة، وواو الجماعة ضمير متصل مبني في محل رفع فاعل",
  "فعل ماضٍ مبني على الفتح لاتصاله بألف الاثنين، وألف الاثنين ضمير متصل مبني في محل رفع فاعل",
  "فعل ماضٍ مبني على السكون لاتصاله بضمير رفع متحرك، والضمير المتصل مبني في محل رفع فاعل"
];

export const pastVerbQuizExamples = pastVerbExamples.slice(0, 5).map((ex) => {
  const result: Record<string, string> = {
    "past.fatha": commonOptions[0],
    "past.damma_waw": commonOptions[1],
    "past.fatha_alif": commonOptions[2],
    "past.sukoon_niswa": "فعل ماضٍ مبني على السكون لاتصاله بنون النسوة، ونون النسوة ضمير متصل مبني في محل رفع فاعل",
    "past.sukoon_moving": commonOptions[3]
  };
  const correct = result[ex.covers[0]];
  const options = Array.from(new Set([correct, ...commonOptions, result["past.sukoon_niswa"]])).slice(0, 4).includes(correct)
    ? Array.from(new Set([correct, ...commonOptions, result["past.sukoon_niswa"]])).slice(0, 4)
    : [correct, ...commonOptions.slice(0, 3)];
  return {
    ...ex,
    prompt: "بعد تتبّع القرارات، ما الإعراب الصحيح للفعل الماضي المحدد؟",
    options,
    correctI3rab: correct,
    whyCorrect: "اتبعنا التسلسل: هل اتصل ضمير؟ ثم حددنا نوع الضمير، ثم اخترنا علامة البناء مع إعراب الضمير عند اتصاله بالفعل.",
    optionReasons: Object.fromEntries(options.map((o) => [o, o === correct ? "صحيح؛ هذه الصياغة تطابق الضمير المتصل وحكم بناء الفعل." : "خطأ؛ الصياغة قريبة لكنها لا تطابق نوع الضمير أو علامة البناء في هذا المثال."]))
  };
});
