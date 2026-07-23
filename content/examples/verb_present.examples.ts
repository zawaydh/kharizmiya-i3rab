export type FollowUpOption = { label: string; correct: boolean; feedback: string };
export type FollowUp = { question: string; options: FollowUpOption[] };
export type Example = { id: string; sentence: string; target: string; facts: Record<string, any>; covers: string[]; followUp?: FollowUp };

export const presentVerbCoverageKeysOrdered = [
  "present.binaa.niswa",
  "present.binaa.tawkid",
  "present.raf3.sahih",
  "present.raf3.alif",
  "present.raf3.waw",
  "present.raf3.ya",
  "present.raf3.five",
  "present.nasb.sahih",
  "present.nasb.alif",
  "present.nasb.waw",
  "present.nasb.ya",
  "present.nasb.five",
  "present.jazm.sahih",
  "present.jazm.weak.alif",
  "present.jazm.weak.waw",
  "present.jazm.weak.ya",
  "present.jazm.five"
];

const base = {
  wordKind: "verb",
  tense: "present",
  buildConnection: "none",
  hasTool: false,
  tool: "none",
  toolWord: "",
  shape: "sahih",
  attached: "none",
  ending: "sahih",
  weakLetter: "none",
};

export const presentVerbExamples: Example[] = [
  {
    id: "pr-binaa-niswa",
    sentence: "المعلماتُ يشرحْنَ الدرسَ.",
    target: "يشرحْنَ",
    facts: { ...base, buildConnection: "niswa", shape: "built_niswa" },
    covers: ["present.binaa.niswa"],
  },
  {
    id: "pr-binaa-tawkid",
    sentence: "واللهِ لأذاكرَنَّ الدرسَ.",
    target: "أذاكرَنَّ",
    facts: { ...base, buildConnection: "tawkid", shape: "built_tawkid" },
    covers: ["present.binaa.tawkid"],
  },

  {
    id: "pr-raf3-sahih",
    sentence: "يقرأُ الطالبُ القصةَ.",
    target: "يقرأُ",
    facts: { ...base, shape: "sahih", ending: "sahih" },
    covers: ["present.raf3.sahih"],
    followUp: {
      question: "الفاعل هو:",
      options: [
        { label: "الطالبُ", correct: true, feedback: "صحيح؛ الطالب هو من قام بالفعل." },
        { label: "القصةَ", correct: false, feedback: "هذا مفعول به، لا فاعل." },
        { label: "يقرأُ", correct: false, feedback: "هذه الكلمة الهدف: فعل مضارع." },
      ],
    },
  },
  {
    id: "pr-raf3-alif",
    sentence: "يسعى الطالبُ إلى النجاحِ.",
    target: "يسعى",
    facts: { ...base, shape: "weak", ending: "weak", weakLetter: "alif" },
    covers: ["present.raf3.alif"],
  },
  {
    id: "pr-raf3-waw",
    sentence: "يدعو المؤمنُ ربَّه.",
    target: "يدعو",
    facts: { ...base, shape: "weak", ending: "weak", weakLetter: "waw" },
    covers: ["present.raf3.waw"],
  },
  {
    id: "pr-raf3-ya",
    sentence: "يرمي اللاعبُ الكرةَ.",
    target: "يرمي",
    facts: { ...base, shape: "weak", ending: "weak", weakLetter: "ya" },
    covers: ["present.raf3.ya"],
  },
  {
    id: "pr-raf3-five-waw",
    sentence: "الطلابُ يكتبونَ الدرسَ.",
    target: "يكتبونَ",
    facts: { ...base, shape: "five", attached: "waw" },
    covers: ["present.raf3.five"],
  },
  {
    id: "pr-raf3-five-yaa",
    sentence: "أنتِ تراجعينَ الدرسَ.",
    target: "تراجعينَ",
    facts: { ...base, shape: "five", attached: "yaa" },
    covers: ["present.raf3.five"],
  },
  {
    id: "pr-raf3-five-alif",
    sentence: "الطالبانِ يقرآنِ القصةَ.",
    target: "يقرآنِ",
    facts: { ...base, shape: "five", attached: "alif2" },
    covers: ["present.raf3.five"],
  },

  {
    id: "pr-nasb-sahih-an",
    sentence: "أحبُّ أن يقرأَ الطالبُ القصةَ.",
    target: "يقرأَ",
    facts: { ...base, hasTool: true, tool: "nasb", toolWord: "أن", shape: "sahih", ending: "sahih" },
    covers: ["present.nasb.sahih"],
  },
  {
    id: "pr-nasb-alif-kay",
    sentence: "يجتهدُ الطالبُ كي يسعى إلى التفوقِ.",
    target: "يسعى",
    facts: { ...base, hasTool: true, tool: "nasb", toolWord: "كي", shape: "weak", ending: "weak", weakLetter: "alif" },
    covers: ["present.nasb.alif"],
  },
  {
    id: "pr-nasb-waw-lan",
    sentence: "لن يدعوَ الصديقُ إلى الخطأ.",
    target: "يدعوَ",
    facts: { ...base, hasTool: true, tool: "nasb", toolWord: "لن", shape: "weak", ending: "weak", weakLetter: "waw" },
    covers: ["present.nasb.waw"],
  },
  {
    id: "pr-nasb-ya-an",
    sentence: "أرجو أن يرميَ اللاعبُ الكرةَ.",
    target: "يرميَ",
    facts: { ...base, hasTool: true, tool: "nasb", toolWord: "أن", shape: "weak", ending: "weak", weakLetter: "ya" },
    covers: ["present.nasb.ya"],
  },
  {
    id: "pr-nasb-five-waw-lan",
    sentence: "لن يشاركوا في المسابقةِ.",
    target: "يشاركوا",
    facts: { ...base, hasTool: true, tool: "nasb", toolWord: "لن", shape: "five", attached: "waw" },
    covers: ["present.nasb.five"],
  },
  {
    id: "pr-nasb-five-alif2-kay",
    sentence: "يتعاونُ الطالبانِ كي يرسما اللوحةَ.",
    target: "يرسما",
    facts: { ...base, hasTool: true, tool: "nasb", toolWord: "كي", shape: "five", attached: "alif2" },
    covers: ["present.nasb.five"],
  },
  {
    id: "pr-nasb-five-yaa-an",
    sentence: "أريدُ أن تكتبي الواجبَ.",
    target: "تكتبي",
    facts: { ...base, hasTool: true, tool: "nasb", toolWord: "أن", shape: "five", attached: "yaa" },
    covers: ["present.nasb.five"],
  },

  {
    id: "pr-jazm-sahih-lam",
    sentence: "لم يقرأْ الطالبُ القصةَ.",
    target: "يقرأْ",
    facts: { ...base, hasTool: true, tool: "jazm", toolWord: "لم", shape: "sahih", ending: "sahih" },
    covers: ["present.jazm.sahih"],
  },
  {
    id: "pr-jazm-alif-la",
    sentence: "لا تسعَ في الأذى.",
    target: "تسعَ",
    facts: { ...base, hasTool: true, tool: "jazm", toolWord: "لا الناهية", shape: "weak", ending: "weak", weakLetter: "alif" },
    covers: ["present.jazm.weak.alif"],
  },
  {
    id: "pr-jazm-waw-lam-amr",
    sentence: "لِيدعُ المؤمنُ إلى الخيرِ.",
    target: "يدعُ",
    facts: { ...base, hasTool: true, tool: "jazm", toolWord: "لام الأمر", shape: "weak", ending: "weak", weakLetter: "waw" },
    covers: ["present.jazm.weak.waw"],
  },
  {
    id: "pr-jazm-ya-lam",
    sentence: "لم يرمِ اللاعبُ الكرةَ.",
    target: "يرمِ",
    facts: { ...base, hasTool: true, tool: "jazm", toolWord: "لم", shape: "weak", ending: "weak", weakLetter: "ya" },
    covers: ["present.jazm.weak.ya"],
  },
  {
    id: "pr-jazm-five-waw-lam",
    sentence: "لم يشاركوا في المسابقةِ.",
    target: "يشاركوا",
    facts: { ...base, hasTool: true, tool: "jazm", toolWord: "لم", shape: "five", attached: "waw" },
    covers: ["present.jazm.five"],
  },
  {
    id: "pr-jazm-five-alif2-lam-amr",
    sentence: "لِيكتبا الدرسَ بخطٍّ واضحٍ.",
    target: "يكتبا",
    facts: { ...base, hasTool: true, tool: "jazm", toolWord: "لام الأمر", shape: "five", attached: "alif2" },
    covers: ["present.jazm.five"],
  },
  {
    id: "pr-jazm-five-yaa-la",
    sentence: "لا تهملي الواجبَ.",
    target: "تهملي",
    facts: { ...base, hasTool: true, tool: "jazm", toolWord: "لا الناهية", shape: "five", attached: "yaa" },
    covers: ["present.jazm.five"],
  },
];

const resultByCover: Record<string, string> = {
  "present.binaa.niswa": "فعل مضارع مبني على السكون لاتصاله بنون النسوة.\nنون النسوة: ضمير متصل مبني في محل رفع فاعل.",
  "present.binaa.tawkid": "فعل مضارع مبني على الفتح لاتصاله بنون التوكيد.\nنون التوكيد: حرف توكيد لا محل له من الإعراب.",
  "present.raf3.sahih": "فعل مضارع مرفوع.\nعلامة رفعه: الضمة الظاهرة على آخره.",
  "present.raf3.alif": "فعل مضارع مرفوع.\nعلامة رفعه: الضمة المقدرة على الألف منع من ظهورها التعذر.",
  "present.raf3.waw": "فعل مضارع مرفوع.\nعلامة رفعه: الضمة المقدرة على الواو منع من ظهورها الثقل.",
  "present.raf3.ya": "فعل مضارع مرفوع.\nعلامة رفعه: الضمة المقدرة على الياء منع من ظهورها الثقل.",
  "present.raf3.five": "فعل مضارع مرفوع.\nعلامة رفعه: ثبوت النون؛ لأنه من الأفعال الخمسة.",
  "present.nasb.sahih": "فعل مضارع منصوب.\nعلامة نصبه: الفتحة الظاهرة على آخره.",
  "present.nasb.alif": "فعل مضارع منصوب.\nعلامة نصبه: الفتحة المقدرة على الألف منع من ظهورها التعذر.",
  "present.nasb.waw": "فعل مضارع منصوب.\nعلامة نصبه: الفتحة الظاهرة على آخره.",
  "present.nasb.ya": "فعل مضارع منصوب.\nعلامة نصبه: الفتحة الظاهرة على آخره.",
  "present.nasb.five": "فعل مضارع منصوب.\nعلامة نصبه: حذف النون؛ لأنه من الأفعال الخمسة.",
  "present.jazm.sahih": "فعل مضارع مجزوم.\nعلامة جزمه: السكون.",
  "present.jazm.weak.alif": "فعل مضارع مجزوم.\nعلامة جزمه: حذف حرف العلة.\nحرف العلة المحذوف: الألف.",
  "present.jazm.weak.waw": "فعل مضارع مجزوم.\nعلامة جزمه: حذف حرف العلة.\nحرف العلة المحذوف: الواو.",
  "present.jazm.weak.ya": "فعل مضارع مجزوم.\nعلامة جزمه: حذف حرف العلة.\nحرف العلة المحذوف: الياء.",
  "present.jazm.five": "فعل مضارع مجزوم.\nعلامة جزمه: حذف النون؛ لأنه من الأفعال الخمسة.",
};

function attachedPronounI3rab(ex: Example) {
  if (ex.facts?.attached === "waw") return "واو الجماعة: ضمير متصل مبني في محل رفع فاعل.\nالألف: ألف فارقة لا محل لها من الإعراب.";
  if (ex.facts?.attached === "alif2") return "ألف الاثنين: ضمير متصل مبني في محل رفع فاعل.";
  if (ex.facts?.attached === "yaa") return "ياء المخاطبة: ضمير متصل مبني في محل رفع فاعل.";
  return "";
}

function resultForExample(ex: Example) {
  const baseResult = resultByCover[ex.covers[0]] || "";
  const toolWord = ex.facts?.toolWord;
  const withTool = toolWord && (ex.facts?.tool === "nasb" || ex.facts?.tool === "jazm")
    ? baseResult.replace("فعل مضارع منصوب", `فعل مضارع منصوب بـ ${toolWord}`).replace("فعل مضارع مجزوم", `فعل مضارع مجزوم بـ ${toolWord}`)
    : baseResult;
  if (ex.facts?.shape !== "five") return withTool;
  const pronoun = attachedPronounI3rab(ex);
  return pronoun ? `${withTool}\n${pronoun}` : withTool;
}

const distractors = Object.values(resultByCover);

export const presentVerbQuizExamples = presentVerbExamples.map((ex, i) => {
  const correct = resultForExample(ex);
  const pool = [...distractors.slice(i % 5, i % 5 + 5), ...distractors];
  const options = Array.from(new Set([correct, ...pool.filter((o) => o !== correct)])).slice(0, 4);
  if (!options.includes(correct)) options[0] = correct;
  return {
    ...ex,
    prompt: "بعد تتبّع القرارات، ما الإعراب الصحيح للفعل المضارع المحدد؟",
    options,
    correctI3rab: correct,
    whyCorrect: "اتبعنا المسار: نوع الكلمة، زمن الفعل، هل هو مبني أو معرب، ثم العامل السابق، ثم صورة الفعل وعلامته.",
    optionReasons: Object.fromEntries(
      options.map((o) => [
        o,
        o === correct
          ? "صحيح؛ الصياغة توافق حالة الفعل وعلامته والضمير المتصل إن وجد."
          : "خطأ؛ الصياغة قريبة لكنها لا توافق البناء/الإعراب أو العلامة في هذا المثال.",
      ])
    ),
  };
});
