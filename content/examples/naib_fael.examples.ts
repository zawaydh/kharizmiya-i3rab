import type { ExerciseExample } from "../../lib/exercise/model";
import { buildTopicQuizExamples } from "./extended_topic_quiz";

export const naibFaelCoverageKeysOrdered = [
  "naib.singular.past",
  "naib.singular.present",
  "naib.dual",
  "naib.jms",
  "naib.jfs",
  "naib.jt",
  "naib.five",
  "naib.mabni.ishara",
  "naib.connected.taa",
  "naib.connected.waw",
];

const visible = { isPassive: true, isNaib: true, roleKind: "visible" };

export const naibFaelExamples: ExerciseExample[] = [
  {
    id: "nf-01",
    sentence: "كُتِبَ الدرسُ.",
    target: "الدرسُ",
    facts: {
      ...visible, passiveVerb: "كُتِبَ", passiveTense: "past", shape: "singular", raf3Mark: "damma",
      finalI3rab: "الدرسُ: نائب فاعل مرفوع، وعلامة رفعه الضمة الظاهرة.\nسبب الاختيار: لأن الفعل «كُتِبَ» مبني للمجهول، وحُذف الفاعل، وأُسند فعل الكتابة إلى «الدرسُ».",
    },
    covers: ["naib.singular.past"],
  },
  {
    id: "nf-02",
    sentence: "يُقرَأُ الكتابُ.",
    target: "الكتابُ",
    facts: {
      ...visible, passiveVerb: "يُقرَأُ", passiveTense: "present", shape: "singular", raf3Mark: "damma",
      finalI3rab: "الكتابُ: نائب فاعل مرفوع، وعلامة رفعه الضمة الظاهرة.\nسبب الاختيار: لأن «يُقرَأُ» فعل مضارع مبني للمجهول، وأُسندت القراءة إلى «الكتابُ» بعد حذف الفاعل.",
    },
    covers: ["naib.singular.present"],
  },
  {
    id: "nf-03",
    sentence: "كُرِّمَ الطالبانِ.",
    target: "الطالبانِ",
    facts: {
      ...visible, passiveVerb: "كُرِّمَ", passiveTense: "past", shape: "dual", raf3Mark: "alif",
      finalI3rab: "الطالبانِ: نائب فاعل مرفوع، وعلامة رفعه الألف لأنه مثنى.\nسبب الاختيار: لأن الفعل «كُرِّمَ» مبني للمجهول، وأُسند التكريم إلى الطالبين بعد حذف الفاعل.",
    },
    covers: ["naib.dual"],
  },
  {
    id: "nf-04",
    sentence: "كُوفِئَ المجتهدونَ.",
    target: "المجتهدونَ",
    facts: {
      ...visible, passiveVerb: "كُوفِئَ", passiveTense: "past", shape: "jms", raf3Mark: "waw",
      finalI3rab: "المجتهدونَ: نائب فاعل مرفوع، وعلامة رفعه الواو لأنه جمع مذكر سالم.\nسبب الاختيار: لأن الفعل مبني للمجهول وأُسندت المكافأة إلى المجتهدين.",
    },
    covers: ["naib.jms"],
  },
  {
    id: "nf-05",
    sentence: "كُرِّمَتِ الطالباتُ.",
    target: "الطالباتُ",
    facts: {
      ...visible, passiveVerb: "كُرِّمَتْ", passiveTense: "past", shape: "jfs", raf3Mark: "damma",
      finalI3rab: "الطالباتُ: نائب فاعل مرفوع، وعلامة رفعه الضمة الظاهرة؛ لأنه جمع مؤنث سالم.\nسبب الاختيار: لأن الفعل مبني للمجهول وأُسند التكريم إلى الطالبات.",
    },
    covers: ["naib.jfs"],
  },
  {
    id: "nf-06",
    sentence: "فُتِحَتِ الأبوابُ.",
    target: "الأبوابُ",
    facts: {
      ...visible, passiveVerb: "فُتِحَتْ", passiveTense: "past", shape: "jt", raf3Mark: "damma",
      finalI3rab: "الأبوابُ: نائب فاعل مرفوع، وعلامة رفعه الضمة الظاهرة؛ لأنه جمع تكسير.\nسبب الاختيار: لأن الفعل مبني للمجهول وأُسند الفتح إلى الأبواب.",
    },
    covers: ["naib.jt"],
  },
  {
    id: "nf-07",
    sentence: "كُرِّمَ أبوكَ.",
    target: "أبوكَ",
    facts: {
      ...visible, passiveVerb: "كُرِّمَ", passiveTense: "past", shape: "five", raf3Mark: "waw", fiveNoun: true,
      finalI3rab: "أبوكَ: نائب فاعل مرفوع، وعلامة رفعه الواو لأنه من الأسماء الخمسة، وقد استوفى شروط إعرابها بالحروف: مفرد، مكبر، مضاف، ومضاف إلى غير ياء المتكلم.\nالكاف: ضمير متصل مبني في محل جر مضاف إليه.",
    },
    covers: ["naib.five"],
  },
  {
    id: "nf-08",
    sentence: "كُرِّمَ هذا.",
    target: "هذا",
    facts: {
      isPassive: true, isNaib: true, roleKind: "mabni", mabniType: "ishara", passiveVerb: "كُرِّمَ",
      finalI3rab: "هذا: اسم إشارة مبني في محل رفع نائب فاعل.\nسبب الاختيار: لأن الفعل «كُرِّمَ» مبني للمجهول، وأُسند التكريم إلى اسم الإشارة بعد حذف الفاعل.",
    },
    covers: ["naib.mabni.ishara"],
  },
  {
    id: "nf-09",
    sentence: "كُرِّمتُ.",
    target: "التاء في «كُرِّمتُ»",
    facts: {
      isPassive: true, isNaib: true, roleKind: "connected", connectedType: "taa", passiveVerb: "كُرِّمتُ",
      finalI3rab: "التاء في «كُرِّمتُ»: ضمير متصل مبني في محل رفع نائب فاعل.\nسبب الاختيار: لأن الفعل مبني للمجهول، والضمير هو الذي أُسند إليه فعل التكريم بعد حذف الفاعل.",
    },
    covers: ["naib.connected.taa"],
  },
  {
    id: "nf-10",
    sentence: "كُرِّموا.",
    target: "واو الجماعة في «كُرِّموا»",
    facts: {
      isPassive: true, isNaib: true, roleKind: "connected", connectedType: "waw", passiveVerb: "كُرِّموا",
      finalI3rab: "واو الجماعة في «كُرِّموا»: ضمير متصل مبني في محل رفع نائب فاعل.\nالألف: ألف فارقة لا محل لها من الإعراب.\nسبب الاختيار: لأن الفعل مبني للمجهول، وواو الجماعة هي التي أُسند إليها فعل التكريم بعد حذف الفاعل.",
    },
    covers: ["naib.connected.waw"],
  },
];

export const naibFaelQuizExamples = buildTopicQuizExamples(
  naibFaelExamples,
  "ما الإعراب الصحيح لنائب الفاعل في المثال؟",
  "صحيح؛ تحققنا أولًا من بناء الفعل للمجهول، ثم حددنا ما أُسند إليه الفعل، ثم عدنا إلى صورة الكلمة وعلامة الرفع أو المحل.",
);
