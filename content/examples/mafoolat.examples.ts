import { requireCoverageResult, requirePrimaryCoverage } from "./exampleCoverage";

export type MafoolatExample = {
  id: string;
  sentence: string;
  target: string;
  facts: Record<string, unknown>;
  covers: string[];
};

export const mafoolatCoverageKeysOrdered = [
  "mafoolat.maah",
  "mafoolat.fih.time",
  "mafoolat.fih.place",
  "mafoolat.mutlaq",
  "mafoolat.mutlaq.dual",
  "mafoolat.liajlih",
  "mafoolat.bih.singular",
  "mafoolat.bih.dual",
  "mafoolat.bih.jms",
  "mafoolat.bih.jfs",
  "mafoolat.bih.five",
  "mafoolat.bih.mabni",
  "mafoolat.bih.connected",
  "mafoolat.bih.masdar",
  "mafoolat.redirect.hal",
  "mafoolat.redirect.tamyiz",
];

const visible = { roleKind: "visible" };
const singular = { ...visible, shape: "singular", nasbMark: "fatha" };
const dual = { ...visible, shape: "dual", nasbMark: "yaa" };

export const mafoolatExamples: MafoolatExample[] = [
  {
    id: "mfs-01",
    sentence: "سرتُ والنهرَ.",
    target: "النهرَ",
    facts: {
      mafoolType: "maah",
      mafoolLabel: "مفعول معه",
      verb: "سرتُ",
      verbMasdar: "السير",
      maahParaphrase: "سرتُ مع النهر",
      ...singular,
      finalI3rab: "النهرَ: مفعول معه منصوب، وعلامة نصبه الفتحة الظاهرة على آخره.\nالواو: واو المعية؛ لأنها بمعنى «مع»، ولا يصح أن يكون «النهر» مشاركًا للمتكلم في فعل السير.",
    },
    covers: ["mafoolat.maah"],
  },
  {
    id: "mfs-02",
    sentence: "سافرتُ ليلًا.",
    target: "ليلًا",
    facts: {
      mafoolType: "fih",
      mafoolLabel: "مفعول فيه (ظرف زمان)",
      verb: "سافرتُ",
      verbMasdar: "السفر",
      whenWhereQuestion: "متى سافرتُ؟",
      fihKind: "time",
      ...singular,
      finalI3rab: "ليلًا: مفعول فيه (ظرف زمان) منصوب، وعلامة نصبه الفتحة الظاهرة على آخره.\nسبب الاختيار: لأنه أجاب عن سؤال «متى سافرتُ؟» وحدد زمان وقوع الفعل.",
    },
    covers: ["mafoolat.fih.time"],
  },
  {
    id: "mfs-17",
    sentence: "جلستُ أمامَ البيتِ.",
    target: "أمامَ",
    facts: {
      mafoolType: "fih",
      mafoolLabel: "مفعول فيه (ظرف مكان)",
      verb: "جلستُ",
      verbMasdar: "الجلوس",
      whenWhereQuestion: "أين جلستُ؟",
      fihKind: "place",
      ...singular,
      finalI3rab: "أمامَ: مفعول فيه (ظرف مكان) منصوب، وعلامة نصبه الفتحة الظاهرة على آخره، وهو مضاف.\nالبيتِ: مضاف إليه مجرور، وعلامة جره الكسرة الظاهرة.\nسبب الاختيار: لأن «أمامَ» أجابت عن سؤال «أين جلستُ؟» وحددت مكان وقوع الفعل.",
    },
    covers: ["mafoolat.fih.place"],
  },
  {
    id: "mfs-04",
    sentence: "فهمتُ الدرسَ فهمًا.",
    target: "فهمًا",
    facts: {
      mafoolType: "mutlaq",
      mafoolLabel: "مفعول مطلق",
      verb: "فهمتُ",
      verbMasdar: "الفهم",
      ...singular,
      finalI3rab: "فهمًا: مفعول مطلق منصوب، وعلامة نصبه الفتحة الظاهرة على آخره.\nسبب الاختيار: لأنه مصدر يدل على الحدث نفسه الذي يدل عليه الفعل «فهمتُ».",
    },
    covers: ["mafoolat.mutlaq"],
  },
  {
    id: "mfs-05",
    sentence: "طرقتُ البابَ طرقتينِ.",
    target: "طرقتينِ",
    facts: {
      mafoolType: "mutlaq",
      mafoolLabel: "مفعول مطلق",
      verb: "طرقتُ",
      verbMasdar: "الطَّرْق",
      mutlaqKind: "number",
      ...dual,
      finalI3rab: "طرقتينِ: مفعول مطلق مبين للعدد منصوب، وعلامة نصبه الياء لأنه مثنى.\nسبب الاختيار: «طرقتُ» تعني أنني قمت بعملية الطَّرْق، و«طرقتينِ» بيّنت عدد مرات وقوع الطَّرْق: مرتين.",
    },
    covers: ["mafoolat.mutlaq.dual"],
  },
  {
    id: "mfs-06",
    sentence: "وقفتُ إجلالًا للمعلمِ.",
    target: "إجلالًا",
    facts: {
      mafoolType: "liajlih",
      mafoolLabel: "مفعول لأجله",
      verb: "وقفتُ",
      verbMasdar: "الوقوف",
      whyQuestion: "لماذا وقفتُ؟",
      ...singular,
      finalI3rab: "إجلالًا: مفعول لأجله منصوب، وعلامة نصبه الفتحة الظاهرة على آخره.\nسبب الاختيار: لأنه مصدر قلبي بيّن علة الوقوف، ويجيب عن سؤال «لماذا وقفتُ؟»، واتحد مع فعله في الفاعل والزمن.",
    },
    covers: ["mafoolat.liajlih"],
  },
  {
    id: "mfs-07",
    sentence: "قرأَ الطالبُ الكتابَ.",
    target: "الكتابَ",
    facts: {
      mafoolType: "bih",
      mafoolLabel: "مفعول به",
      verb: "قرأَ",
      verbMasdar: "القراءة",
      objectQuestion: "ماذا قرأ الطالب؟",
      ...singular,
      finalI3rab: "الكتابَ: مفعول به منصوب، وعلامة نصبه الفتحة الظاهرة على آخره.\nسبب الاختيار: لأن فعل القراءة وقع على الكتاب.",
    },
    covers: ["mafoolat.bih.singular"],
  },
  {
    id: "mfs-08",
    sentence: "كرّمَ المعلمُ الطالبينِ.",
    target: "الطالبينِ",
    facts: {
      mafoolType: "bih",
      mafoolLabel: "مفعول به",
      verb: "كرّمَ",
      verbMasdar: "التكريم",
      objectQuestion: "مَن الذي كرَّمه المعلمُ؟",
      ...dual,
      finalI3rab: "الطالبينِ: مفعول به منصوب، وعلامة نصبه الياء لأنه مثنى.\nسبب الاختيار: لأن فعل التكريم وقع على الطالبين.",
    },
    covers: ["mafoolat.bih.dual"],
  },
  {
    id: "mfs-09",
    sentence: "شجعتُ المجتهدينَ.",
    target: "المجتهدينَ",
    facts: {
      mafoolType: "bih",
      mafoolLabel: "مفعول به",
      verb: "شجعتُ",
      verbMasdar: "التشجيع",
      objectQuestion: "من شجعتُ؟",
      roleKind: "visible",
      shape: "jms",
      nasbMark: "yaa",
      finalI3rab: "المجتهدينَ: مفعول به منصوب، وعلامة نصبه الياء لأنه جمع مذكر سالم.\nسبب الاختيار: لأن فعل التشجيع وقع على المجتهدين.",
    },
    covers: ["mafoolat.bih.jms"],
  },
  {
    id: "mfs-10",
    sentence: "كرّمَ المديرُ الموظفاتِ.",
    target: "الموظفاتِ",
    facts: {
      mafoolType: "bih",
      mafoolLabel: "مفعول به",
      verb: "كرّمَ",
      verbMasdar: "التكريم",
      objectQuestion: "من كرّم المدير؟",
      roleKind: "visible",
      shape: "jfs",
      nasbMark: "kasra",
      finalI3rab: "الموظفاتِ: مفعول به منصوب، وعلامة نصبه الكسرة نيابة عن الفتحة لأنه جمع مؤنث سالم.\nسبب الاختيار: لأن فعل التكريم وقع على الموظفات.",
    },
    covers: ["mafoolat.bih.jfs"],
  },
  {
    id: "mfs-11",
    sentence: "احترمتُ أباكَ.",
    target: "أباكَ",
    facts: {
      mafoolType: "bih",
      mafoolLabel: "مفعول به",
      verb: "احترمتُ",
      verbMasdar: "الاحترام",
      objectQuestion: "من احترمتُ؟",
      roleKind: "visible",
      shape: "five",
      nasbMark: "alif",
      finalI3rab: "أباكَ: مفعول به منصوب، وعلامة نصبه الألف لأنه من الأسماء الخمسة، وقد استوفى شروط إعرابها بالحروف: مفرد، مكبر، مضاف، ومضاف إلى غير ياء المتكلم.\nوالكاف: ضمير متصل مبني في محل جر مضاف إليه.",
    },
    covers: ["mafoolat.bih.five"],
  },
  {
    id: "mfs-12",
    sentence: "رأيتُ هذا.",
    target: "هذا",
    facts: {
      mafoolType: "bih",
      mafoolLabel: "مفعول به",
      verb: "رأيتُ",
      verbMasdar: "الرؤية",
      objectQuestion: "ماذا رأيتُ؟",
      roleKind: "mabni",
      mabniType: "ishara",
      finalI3rab: "هذا: اسم إشارة مبني في محل نصب مفعول به.\nسبب الاختيار: لأن اسم الإشارة دل على الشيء الذي وقع عليه فعل الرؤية.",
    },
    covers: ["mafoolat.bih.mabni"],
  },
  {
    id: "mfs-13",
    sentence: "ساعدَكَ المعلمُ.",
    target: "كَ",
    facts: {
      mafoolType: "bih",
      mafoolLabel: "مفعول به",
      verb: "ساعدَ",
      verbMasdar: "المساعدة",
      objectQuestion: "مَن الذي ساعدَه المعلمُ؟",
      roleKind: "connected",
      finalI3rab: "الكاف في «ساعدَكَ»: ضمير متصل مبني في محل نصب مفعول به.\nسبب الاختيار: لأن فعل المساعدة وقع على المخاطَب الذي دل عليه الضمير.",
    },
    covers: ["mafoolat.bih.connected"],
  },
  {
    id: "mfs-14",
    sentence: "أحببتُ أن تنجحَ.",
    target: "أن تنجحَ",
    facts: {
      mafoolType: "bih",
      mafoolLabel: "مفعول به",
      verb: "أحببتُ",
      verbMasdar: "الحب",
      objectQuestion: "ماذا أحببتُ؟",
      roleKind: "masdar",
      finalI3rab: "أن تنجحَ: مصدر مؤول في محل نصب مفعول به.\nوالتقدير: أحببتُ نجاحَك.",
    },
    covers: ["mafoolat.bih.masdar"],
  },
  {
    id: "mfs-15",
    sentence: "عادَ الطالبُ مسرورًا.",
    target: "مسرورًا",
    facts: {
      mafoolType: "hal",
      otherType: "hal",
      verb: "عادَ",
      verbMasdar: "العودة",
      halSentence: "عادَ الطالبُ وهو مسرورٌ",
      finalI3rab: "مسرورًا: حال منصوب، وعلامة نصبه الفتحة الظاهرة على آخره.\nليست من المفاعيل الخمسة؛ لأنها تجيب عن «كيف عاد الطالب؟» ويصح تحويل المعنى إلى جملة حالية: عادَ الطالبُ وهو مسرورٌ.\nراجع موضوع الحال.",
    },
    covers: ["mafoolat.redirect.hal"],
  },
  {
    id: "mfs-16",
    sentence: "اشتريتُ لترًا ماءً.",
    target: "ماءً",
    facts: {
      mafoolType: "tamyiz",
      otherType: "tamyiz",
      verb: "اشتريتُ",
      verbMasdar: "الشراء",
      finalI3rab: "ماءً: تمييز منصوب، وعلامة نصبه الفتحة الظاهرة على آخره.\nليست من المفاعيل الخمسة؛ لأنها اسم نكرة جامد أزال الإبهام في «لترًا». ويصح في هذا المثال التقدير: لترًا من الماء.\nراجع موضوع التمييز.",
    },
    covers: ["mafoolat.redirect.tamyiz"],
  },
];

function requireFinalI3rab(ex: MafoolatExample): string {
  const value = ex.facts.finalI3rab;
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`المثال ${ex.id} لا يحتوي إعرابًا نهائيًا صالحًا.`);
  }
  return value;
}

const resultByCover: Record<string, string> = Object.fromEntries(
  mafoolatExamples.map((ex) => [requirePrimaryCoverage(ex), requireFinalI3rab(ex).split("\n")[0] || ""]),
);
const allResults = Array.from(new Set(Object.values(resultByCover)));

export const mafoolatQuizExamples = mafoolatExamples.map((ex, index) => {
  const correct = requireCoverageResult(resultByCover, ex);
  const rotated = [...allResults.slice(index % allResults.length), ...allResults.slice(0, index % allResults.length)];
  const options = Array.from(new Set([correct, ...rotated.filter((value) => value !== correct)])).slice(0, 4);
  if (!options.includes(correct)) options[0] = correct;
  return {
    ...ex,
    prompt: "ما الإعراب الصحيح للكلمة المحددة بعد تطبيق تسلسل المفاعيل؟",
    options,
    correctI3rab: correct,
    whyCorrect: "حددنا الموقع أولًا بالتسلسل الدلالي، ثم عدنا إلى صورة الكلمة لتحديد علامة النصب أو محلها.",
    optionReasons: Object.fromEntries(
      options.map((option) => [
        option,
        option === correct
          ? "صحيح؛ الوظيفة والعلامة توافقان مسار المثال."
          : "راجع التسلسل: المعية، ثم الزمان/المكان، ثم مصدر الفعل، ثم السبب، ثم وقوع الفعل على الكلمة؛ وبعد تحديد الموقع افحص صورة الكلمة لتحديد العلامة.",
      ]),
    ),
  };
});
