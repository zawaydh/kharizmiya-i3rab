export type FollowUpOption = { label: string; correct: boolean; feedback: string };
export type FollowUp = { question: string; options: FollowUpOption[] };
export type Example = {
  id: string;
  sentence: string;
  target: string;
  facts: Record<string, any>;
  covers: string[];
  followUp?: FollowUp;
};

export const presentVerbCoverageKeysOrdered = [
  "present.binaa.niswa", "present.binaa.tawkid",
  "present.raf3.sahih", "present.raf3.alif", "present.raf3.waw_ya", "present.raf3.waw", "present.raf3.yaa", "present.raf3.alif2",
  "present.nasb.sahih", "present.nasb.alif", "present.nasb.waw_ya", "present.nasb.waw", "present.nasb.yaa", "present.nasb.alif2",
  "present.jazm.sahih", "present.jazm.weak", "present.jazm.waw", "present.jazm.yaa", "present.jazm.alif2"
];

const base = { nunNiswa: false, nunTawkid: false };
const noTool = { hasTool: false, tool: "none", toolWord: "" };
const nasb = (toolWord = "لن") => ({ hasTool: true, tool: "nasb", toolWord });
const jazm = (toolWord = "لم") => ({ hasTool: true, tool: "jazm", toolWord });

// هذه الأمثلة ليست مرتبة حسب عقد الخوارزمية عمدًا.
// الخوارزمية هي طريقة التفكير الثابتة، أما المثال فيأتي متنوعًا كي يتعلم الطالب تطبيق المسار على أي جملة.
const allPresentVerbExamples: Example[] = [
  { id: "pr-learn-01", sentence: "الطلابُ يكتبونَ الدرسَ.", target: "يكتبونَ", facts: { ...base, ...noTool, attached: "waw" }, covers: ["present.raf3.waw"] },
  { id: "pr-learn-02", sentence: "لن يتركَ المؤمنُ الأملَ.", target: "يتركَ", facts: { ...base, ...nasb("لن"), attached: "none", ending: "sahih" }, covers: ["present.nasb.sahih"] },
  { id: "pr-learn-03", sentence: "الطالباتُ يكتبْنَ الدرسَ.", target: "يكتبْنَ", facts: { ...base, nunNiswa: true, ...noTool, attached: "none", ending: "sahih" }, covers: ["present.binaa.niswa"] },
  { id: "pr-learn-04", sentence: "لم يرمِ اللاعبُ الكرةَ.", target: "يرمِ", facts: { ...base, ...jazm("لم"), attached: "none", ending: "weak" }, covers: ["present.jazm.weak"] },
  { id: "pr-learn-05", sentence: "يسعى الطالبُ للنجاحِ.", target: "يسعى", facts: { ...base, ...noTool, attached: "none", ending: "weak", weakLetter: "alif" }, covers: ["present.raf3.alif"] },
  { id: "pr-learn-06", sentence: "لن تكتبا الدرسَ.", target: "تكتبا", facts: { ...base, ...nasb("لن"), attached: "alif2" }, covers: ["present.nasb.alif2"] },
  { id: "pr-learn-07", sentence: "واللهِ ليجتهدنَّ الطالبُ.", target: "ليجتهدنَّ", facts: { ...base, nunTawkid: true, ...noTool, attached: "none", ending: "sahih" }, covers: ["present.binaa.tawkid"] },
  { id: "pr-learn-08", sentence: "أنتِ تكتبينَ الواجبَ.", target: "تكتبينَ", facts: { ...base, ...noTool, attached: "yaa" }, covers: ["present.raf3.yaa"] },
  { id: "pr-learn-09", sentence: "لم يكتبْ الطالبُ الدرسَ.", target: "يكتبْ", facts: { ...base, ...jazm("لم"), attached: "none", ending: "sahih" }, covers: ["present.jazm.sahih"] },
  { id: "pr-learn-10", sentence: "يدعو المؤمنُ ربَّه.", target: "يدعو", facts: { ...base, ...noTool, attached: "none", ending: "weak", weakLetter: "waw_ya" }, covers: ["present.raf3.waw_ya"] },
  { id: "pr-learn-11", sentence: "لن يسعى الطالبُ عبثًا.", target: "يسعى", facts: { ...base, ...nasb("لن"), attached: "none", ending: "weak", weakLetter: "alif" }, covers: ["present.nasb.alif"] },
  { id: "pr-learn-12", sentence: "لا تهملي واجبَكِ.", target: "تهملي", facts: { ...base, ...jazm("لا الناهية"), attached: "yaa" }, covers: ["present.jazm.yaa"] },
  { id: "pr-learn-13", sentence: "الطالبتان تكتبانِ القصةَ.", target: "تكتبانِ", facts: { ...base, ...noTool, attached: "alif2" }, covers: ["present.raf3.alif2"] },
  { id: "pr-learn-14", sentence: "لن يدعوَ الصديقُ إلى الخطأ.", target: "يدعوَ", facts: { ...base, ...nasb("لن"), attached: "none", ending: "weak", weakLetter: "waw_ya" }, covers: ["present.nasb.waw_ya"] },
  { id: "pr-learn-15", sentence: "لم تكتبوا الدرسَ.", target: "تكتبوا", facts: { ...base, ...jazm("لم"), attached: "waw" }, covers: ["present.jazm.waw"] },
  { id: "pr-learn-16", sentence: "يكتبُ الطالبُ الدرسَ.", target: "يكتبُ", facts: { ...base, ...noTool, attached: "none", ending: "sahih" }, covers: ["present.raf3.sahih"], followUp: { question: "الفاعل هو:", options: [ { label: "الطالبُ", correct: true, feedback: "صحيح؛ الطالب هو من قام بالفعل." }, { label: "الدرسَ", correct: false, feedback: "هذا مفعول به." }, { label: "يكتبُ", correct: false, feedback: "هذه الكلمة الهدف: فعل مضارع." } ] } },
  { id: "pr-learn-17", sentence: "لن تكتبوا الدرسَ.", target: "تكتبوا", facts: { ...base, ...nasb("لن"), attached: "waw" }, covers: ["present.nasb.waw"] },
  { id: "pr-learn-18", sentence: "لتكتبا الدرسَ.", target: "تكتبا", facts: { ...base, ...jazm("لام الأمر"), attached: "alif2" }, covers: ["present.jazm.alif2"] },
  { id: "pr-learn-19", sentence: "لن تكتبي الدرسَ.", target: "تكتبي", facts: { ...base, ...nasb("لن"), attached: "yaa" }, covers: ["present.nasb.yaa"] }
];

export const presentVerbLearnExamples: Example[] = [
  allPresentVerbExamples[0], allPresentVerbExamples[1], allPresentVerbExamples[2], allPresentVerbExamples[3], allPresentVerbExamples[4], allPresentVerbExamples[5], allPresentVerbExamples[6], allPresentVerbExamples[7], allPresentVerbExamples[8], allPresentVerbExamples[9]
];

export const presentVerbPracticeExamples: Example[] = [
  allPresentVerbExamples[10], allPresentVerbExamples[11], allPresentVerbExamples[12], allPresentVerbExamples[13], allPresentVerbExamples[14], allPresentVerbExamples[15], allPresentVerbExamples[16], allPresentVerbExamples[17], allPresentVerbExamples[18], allPresentVerbExamples[0], allPresentVerbExamples[3], allPresentVerbExamples[6]
];

// يبقى هذا الاسم للتوافق مع باقي المشروع، لكنه لم يعد يعني ترتيبًا تعليميًا بحسب العقد.
export const presentVerbExamples: Example[] = allPresentVerbExamples;

function resultForExample(ex: Example) {
  const cover = ex.covers[0];
  const word = ex.target;
  const f = ex.facts || {};
  const toolPhrase = f.tool === "nasb" ? `بأداة النصب (${f.toolWord || "الأداة"})` : f.tool === "jazm" ? `بأداة الجزم (${f.toolWord || "الأداة"})` : "";
  switch (cover) {
    case "present.binaa.niswa": return `${word}: فعل مضارع مبني على السكون لاتصاله بنون النسوة.`;
    case "present.binaa.tawkid": return `${word}: فعل مضارع مبني على الفتح لاتصاله بنون التوكيد.`;
    case "present.raf3.sahih": return `${word}: فعل مضارع مرفوع وعلامة رفعه الضمة الظاهرة على آخره.`;
    case "present.raf3.alif": return `${word}: فعل مضارع مرفوع وعلامة رفعه الضمة المقدرة على الألف منع من ظهورها التعذر.`;
    case "present.raf3.waw_ya": return `${word}: فعل مضارع مرفوع وعلامة رفعه الضمة المقدرة منع من ظهورها الثقل.`;
    case "present.raf3.waw": return `${word}: فعل مضارع مرفوع وعلامة رفعه ثبوت النون لأنه من الأفعال الخمسة، وواو الجماعة ضمير متصل مبني في محل رفع فاعل.`;
    case "present.raf3.yaa": return `${word}: فعل مضارع مرفوع وعلامة رفعه ثبوت النون لأنه من الأفعال الخمسة، وياء المخاطبة ضمير متصل مبني في محل رفع فاعل.`;
    case "present.raf3.alif2": return `${word}: فعل مضارع مرفوع وعلامة رفعه ثبوت النون لأنه من الأفعال الخمسة، وألف الاثنين ضمير متصل مبني في محل رفع فاعل.`;
    case "present.nasb.sahih": return `${word}: فعل مضارع منصوب ${toolPhrase} وعلامة نصبه الفتحة الظاهرة على آخره.`;
    case "present.nasb.alif": return `${word}: فعل مضارع منصوب ${toolPhrase} وعلامة نصبه الفتحة المقدرة على الألف منع من ظهورها التعذر.`;
    case "present.nasb.waw_ya": return `${word}: فعل مضارع منصوب ${toolPhrase} وعلامة نصبه الفتحة الظاهرة على آخره.`;
    case "present.nasb.waw": return `${word}: فعل مضارع منصوب ${toolPhrase} وعلامة نصبه حذف النون لأنه من الأفعال الخمسة، وواو الجماعة ضمير متصل مبني في محل رفع فاعل.`;
    case "present.nasb.yaa": return `${word}: فعل مضارع منصوب ${toolPhrase} وعلامة نصبه حذف النون لأنه من الأفعال الخمسة، وياء المخاطبة ضمير متصل مبني في محل رفع فاعل.`;
    case "present.nasb.alif2": return `${word}: فعل مضارع منصوب ${toolPhrase} وعلامة نصبه حذف النون لأنه من الأفعال الخمسة، وألف الاثنين ضمير متصل مبني في محل رفع فاعل.`;
    case "present.jazm.sahih": return `${word}: فعل مضارع مجزوم ${toolPhrase} وعلامة جزمه السكون على آخره.`;
    case "present.jazm.weak": return `${word}: فعل مضارع مجزوم ${toolPhrase} وعلامة جزمه حذف حرف العلة.`;
    case "present.jazm.waw": return `${word}: فعل مضارع مجزوم ${toolPhrase} وعلامة جزمه حذف النون لأنه من الأفعال الخمسة، وواو الجماعة ضمير متصل مبني في محل رفع فاعل.`;
    case "present.jazm.yaa": return `${word}: فعل مضارع مجزوم ${toolPhrase} وعلامة جزمه حذف النون لأنه من الأفعال الخمسة، وياء المخاطبة ضمير متصل مبني في محل رفع فاعل.`;
    case "present.jazm.alif2": return `${word}: فعل مضارع مجزوم ${toolPhrase} وعلامة جزمه حذف النون لأنه من الأفعال الخمسة، وألف الاثنين ضمير متصل مبني في محل رفع فاعل.`;
    default: return "";
  }
}

const distractors = [
  "فعل مضارع مبني على السكون لاتصاله بنون النسوة.",
  "فعل مضارع مبني على الفتح لاتصاله بنون التوكيد.",
  "فعل مضارع مرفوع وعلامة رفعه الضمة الظاهرة على آخره.",
  "فعل مضارع منصوب بأداة النصب وعلامة نصبه الفتحة الظاهرة على آخره.",
  "فعل مضارع مجزوم بأداة الجزم وعلامة جزمه السكون على آخره.",
  "فعل مضارع مرفوع وعلامة رفعه ثبوت النون لأنه من الأفعال الخمسة.",
  "فعل مضارع منصوب وعلامة نصبه حذف النون لأنه من الأفعال الخمسة.",
  "فعل مضارع مجزوم وعلامة جزمه حذف حرف العلة."
];

const quizSource = [
  allPresentVerbExamples[8], allPresentVerbExamples[10], allPresentVerbExamples[0], allPresentVerbExamples[13], allPresentVerbExamples[15], allPresentVerbExamples[6], allPresentVerbExamples[17], allPresentVerbExamples[4], allPresentVerbExamples[18], allPresentVerbExamples[2], allPresentVerbExamples[14], allPresentVerbExamples[12]
];

export const presentVerbQuizExamples = quizSource.map((ex, i) => {
  const correct = resultForExample(ex);
  const pool = [...distractors.slice(i % 4, i % 4 + 4), ...distractors];
  const options = Array.from(new Set([correct, ...pool.filter((o) => o !== correct)])).slice(0, 4);
  if (!options.includes(correct)) options[0] = correct;
  return {
    ...ex,
    prompt: "بعد تتبّع طريقة التفكير الثابتة، ما الإعراب الصحيح للفعل المضارع المحدد؟",
    options,
    correctI3rab: correct,
    whyCorrect: "لم نرتّب المثال حسب العقد؛ بل طبقنا المسار نفسه: أستبعد البناء، ثم أفحص العامل، ثم الأفعال الخمسة، ثم آخر الفعل، ثم أبني الإعراب.",
    optionReasons: Object.fromEntries(options.map((o) => [o, o === correct ? "صحيح؛ الصياغة توافق مسار التفكير والعلامة في هذا المثال." : "خطأ؛ الصياغة لا توافق إحدى مراحل المسار: البناء، العامل، الأفعال الخمسة، أو آخر الفعل."]))
  };
});
