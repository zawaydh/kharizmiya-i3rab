export type FollowUpOption = { label: string; correct: boolean; feedback: string };
export type FollowUp = { question: string; options: FollowUpOption[] };
export type Example = { id: string; sentence: string; target: string; facts: Record<string, any>; covers: string[]; followUp?: FollowUp };

export const presentVerbCoverageKeysOrdered = [
  "present.binaa.niswa", "present.binaa.tawkid",
  "present.raf3.sahih", "present.raf3.alif", "present.raf3.waw_ya", "present.raf3.waw", "present.raf3.yaa", "present.raf3.alif2",
  "present.nasb.sahih", "present.nasb.alif", "present.nasb.waw_ya", "present.nasb.waw", "present.nasb.yaa", "present.nasb.alif2",
  "present.jazm.sahih", "present.jazm.weak", "present.jazm.waw", "present.jazm.yaa", "present.jazm.alif2"
];

const base = { nunNiswa: false, nunTawkid: false };

export const presentVerbExamples: Example[] = [
  { id: "pr-00a", sentence: "الطالباتُ يكتبْنَ الدرسَ.", target: "يكتبْنَ", facts: { ...base, nunNiswa: true, hasTool: false, tool: "none", attached: "none", ending: "sahih" }, covers: ["present.binaa.niswa"] },
  { id: "pr-00b", sentence: "واللهِ ليجتهدنَّ الطالبُ.", target: "ليجتهدنَّ", facts: { ...base, nunTawkid: true, hasTool: false, tool: "none", attached: "none", ending: "sahih" }, covers: ["present.binaa.tawkid"] },

  { id: "pr-01", sentence: "يكتبُ الطالبُ الدرسَ.", target: "يكتبُ", facts: { ...base, hasTool: false, tool: "none", attached: "none", ending: "sahih" }, covers: ["present.raf3.sahih"], followUp: { question: "الفاعل هو:", options: [ { label: "الطالبُ", correct: true, feedback: "صحيح؛ الطالب هو من قام بالفعل." }, { label: "الدرسَ", correct: false, feedback: "هذا مفعول به." }, { label: "يكتبُ", correct: false, feedback: "هذه الكلمة الهدف: فعل مضارع." } ] } },
  { id: "pr-02", sentence: "يسعى الطالبُ للنجاحِ.", target: "يسعى", facts: { ...base, hasTool: false, tool: "none", attached: "none", ending: "weak", weakLetter: "alif" }, covers: ["present.raf3.alif"] },
  { id: "pr-03", sentence: "يدعو المؤمنُ ربَّه.", target: "يدعو", facts: { ...base, hasTool: false, tool: "none", attached: "none", ending: "weak", weakLetter: "waw_ya" }, covers: ["present.raf3.waw_ya"] },
  { id: "pr-04", sentence: "الطلابُ يكتبونَ الدرسَ.", target: "يكتبونَ", facts: { ...base, hasTool: false, tool: "none", attached: "waw" }, covers: ["present.raf3.waw"] },
  { id: "pr-05", sentence: "أنتِ تكتبينَ الواجبَ.", target: "تكتبينَ", facts: { ...base, hasTool: false, tool: "none", attached: "yaa" }, covers: ["present.raf3.yaa"] },
  { id: "pr-06", sentence: "الطالبتان تكتبانِ القصةَ.", target: "تكتبانِ", facts: { ...base, hasTool: false, tool: "none", attached: "alif2" }, covers: ["present.raf3.alif2"] },

  { id: "pr-07", sentence: "لن يتركَ المؤمنُ الأملَ.", target: "يتركَ", facts: { ...base, hasTool: true, tool: "nasb", attached: "none", ending: "sahih" }, covers: ["present.nasb.sahih"] },
  { id: "pr-08", sentence: "لن يسعى الطالبُ عبثًا.", target: "يسعى", facts: { ...base, hasTool: true, tool: "nasb", attached: "none", ending: "weak", weakLetter: "alif" }, covers: ["present.nasb.alif"] },
  { id: "pr-09", sentence: "لن يدعوَ الصديقُ إلى الخطأ.", target: "يدعوَ", facts: { ...base, hasTool: true, tool: "nasb", attached: "none", ending: "weak", weakLetter: "waw_ya" }, covers: ["present.nasb.waw_ya"] },
  { id: "pr-10", sentence: "لن تكتبوا الدرسَ.", target: "تكتبوا", facts: { ...base, hasTool: true, tool: "nasb", attached: "waw" }, covers: ["present.nasb.waw"] },
  { id: "pr-11", sentence: "لن تكتبي الدرسَ.", target: "تكتبي", facts: { ...base, hasTool: true, tool: "nasb", attached: "yaa" }, covers: ["present.nasb.yaa"] },
  { id: "pr-12", sentence: "لن تكتبا الدرسَ.", target: "تكتبا", facts: { ...base, hasTool: true, tool: "nasb", attached: "alif2" }, covers: ["present.nasb.alif2"] },

  { id: "pr-13", sentence: "لم يكتبْ الطالبُ الدرسَ.", target: "يكتبْ", facts: { ...base, hasTool: true, tool: "jazm", attached: "none", ending: "sahih" }, covers: ["present.jazm.sahih"] },
  { id: "pr-14", sentence: "لم يرمِ اللاعبُ الكرةَ.", target: "يرمِ", facts: { ...base, hasTool: true, tool: "jazm", attached: "none", ending: "weak" }, covers: ["present.jazm.weak"] },
  { id: "pr-15", sentence: "لم تكتبوا الدرسَ.", target: "تكتبوا", facts: { ...base, hasTool: true, tool: "jazm", attached: "waw" }, covers: ["present.jazm.waw"] },
  { id: "pr-16", sentence: "لا تهملي واجبَكِ.", target: "تهملي", facts: { ...base, hasTool: true, tool: "jazm", attached: "yaa" }, covers: ["present.jazm.yaa"] },
  { id: "pr-17", sentence: "لتكتبا الدرسَ.", target: "تكتبا", facts: { ...base, hasTool: true, tool: "jazm", attached: "alif2" }, covers: ["present.jazm.alif2"] }
];

const resultByCover: Record<string, string> = {
  "present.binaa.niswa": "فعل مضارع مبني على السكون لاتصاله بنون النسوة",
  "present.binaa.tawkid": "فعل مضارع مبني على الفتح لاتصاله بنون التوكيد",
  "present.raf3.sahih": "فعل مضارع مرفوع وعلامة رفعه الضمة الظاهرة على آخره",
  "present.raf3.alif": "فعل مضارع مرفوع وعلامة رفعه الضمة المقدرة على آخره منع من ظهورها التعذر",
  "present.raf3.waw_ya": "فعل مضارع مرفوع وعلامة رفعه الضمة المقدرة على آخره منع من ظهورها الثقل",
  "present.raf3.waw": "فعل مضارع مرفوع وعلامة رفعه ثبوت النون لأنه من الأفعال الخمسة، وواو الجماعة ضمير متصل مبني في محل رفع فاعل",
  "present.raf3.yaa": "فعل مضارع مرفوع وعلامة رفعه ثبوت النون لأنه من الأفعال الخمسة، وياء المخاطبة ضمير متصل مبني في محل رفع فاعل",
  "present.raf3.alif2": "فعل مضارع مرفوع وعلامة رفعه ثبوت النون لأنه من الأفعال الخمسة، وألف الاثنين ضمير متصل مبني في محل رفع فاعل",
  "present.nasb.sahih": "فعل مضارع منصوب وعلامة نصبه الفتحة الظاهرة على آخره",
  "present.nasb.alif": "فعل مضارع منصوب وعلامة نصبه الفتحة المقدرة على آخره منع من ظهورها التعذر",
  "present.nasb.waw_ya": "فعل مضارع منصوب وعلامة نصبه الفتحة الظاهرة على آخره",
  "present.nasb.waw": "فعل مضارع منصوب وعلامة نصبه حذف النون من آخره لأنه من الأفعال الخمسة، وواو الجماعة ضمير متصل مبني في محل رفع فاعل",
  "present.nasb.yaa": "فعل مضارع منصوب وعلامة نصبه حذف النون من آخره لأنه من الأفعال الخمسة، وياء المخاطبة ضمير متصل مبني في محل رفع فاعل",
  "present.nasb.alif2": "فعل مضارع منصوب وعلامة نصبه حذف النون من آخره لأنه من الأفعال الخمسة، وألف الاثنين ضمير متصل مبني في محل رفع فاعل",
  "present.jazm.sahih": "فعل مضارع مجزوم وعلامة جزمه السكون على آخره",
  "present.jazm.weak": "فعل مضارع مجزوم وعلامة جزمه حذف حرف العلة",
  "present.jazm.waw": "فعل مضارع مجزوم وعلامة جزمه حذف النون من آخره لأنه من الأفعال الخمسة، وواو الجماعة ضمير متصل مبني في محل رفع فاعل",
  "present.jazm.yaa": "فعل مضارع مجزوم وعلامة جزمه حذف النون من آخره لأنه من الأفعال الخمسة، وياء المخاطبة ضمير متصل مبني في محل رفع فاعل",
  "present.jazm.alif2": "فعل مضارع مجزوم وعلامة جزمه حذف النون من آخره لأنه من الأفعال الخمسة، وألف الاثنين ضمير متصل مبني في محل رفع فاعل"
};

const distractors = [
  "فعل مضارع مبني على السكون لاتصاله بنون النسوة",
  "فعل مضارع مبني على الفتح لاتصاله بنون التوكيد",
  "فعل مضارع مرفوع وعلامة رفعه الضمة الظاهرة على آخره",
  "فعل مضارع منصوب وعلامة نصبه الفتحة الظاهرة على آخره",
  "فعل مضارع مجزوم وعلامة جزمه السكون على آخره",
  "فعل مضارع مرفوع وعلامة رفعه ثبوت النون لأنه من الأفعال الخمسة، وواو الجماعة ضمير متصل مبني في محل رفع فاعل",
  "فعل مضارع منصوب وعلامة نصبه حذف النون من آخره لأنه من الأفعال الخمسة، وياء المخاطبة ضمير متصل مبني في محل رفع فاعل",
  "فعل مضارع مجزوم وعلامة جزمه حذف حرف العلة"
];

export const presentVerbQuizExamples = presentVerbExamples.map((ex, i) => {
  const correct = resultByCover[ex.covers[0]];
  const pool = [...distractors.slice(i % 4, i % 4 + 4), ...distractors];
  const options = Array.from(new Set([correct, ...pool.filter((o) => o !== correct)])).slice(0, 4);
  if (!options.includes(correct)) options[0] = correct;
  return {
    ...ex,
    prompt: "بعد تتبّع القرارات، ما الإعراب الصحيح للفعل المضارع المحدد؟",
    options,
    correctI3rab: correct,
    whyCorrect: "اتبعنا مسار التفكير الجديد: نون النسوة، ثم نون التوكيد، ثم أداة النصب أو الجزم، ثم الأفعال الخمسة، ثم صحيح الآخر أو معتل الآخر عند الحاجة.",
    optionReasons: Object.fromEntries(options.map((o) => [o, o === correct ? "صحيح؛ الصياغة توافق البناء/الإعراب والعلامة." : "خطأ؛ الصياغة قريبة لكنها لا توافق حالة الفعل أو علامة الإعراب في هذا المثال."]))
  };
});
