import type { ExerciseExample } from "../../lib/exercise/model";
import { buildTopicQuizExamples } from "./extended_topic_quiz";

export const tamyizCoverageKeysOrdered = [
  "tamyiz.malfuz.measure",
  "tamyiz.malfuz.number",
  "tamyiz.malfuz.weight",
  "tamyiz.malhuz.increase",
  "tamyiz.malhuz.fullness",
  "tamyiz.malhuz.comparison",
];

export const tamyizExamples: ExerciseExample[] = [
  {
    id: "tm-01",
    sentence: "اشتريتُ لترًا ماءً.",
    target: "ماءً",
    facts: {
      isTamyiz: true, tamyizKind: "malfuz", ambiguity: "لترًا", probe: "لترًا من ماذا؟", nasbMark: "fatha",
      finalI3rab: "ماءً: تمييز منصوب، وعلامة نصبه الفتحة الظاهرة على آخره.\nسبب الاختيار: لأنه اسم نكرة جامد أزال الإبهام في مقدار «لترًا». ويصح في هذا المثال التقدير: لترًا من الماء.",
    },
    covers: ["tamyiz.malfuz.measure"],
  },
  {
    id: "tm-02",
    sentence: "في المكتبة عشرون كتابًا.",
    target: "كتابًا",
    facts: {
      isTamyiz: true, tamyizKind: "malfuz", ambiguity: "عشرون", probe: "عشرون ماذا؟", nasbMark: "fatha",
      finalI3rab: "كتابًا: تمييز منصوب، وعلامة نصبه الفتحة الظاهرة على آخره.\nسبب الاختيار: لأنه فسّر العدد «عشرون» وبيّن المعدود.",
    },
    covers: ["tamyiz.malfuz.number"],
  },
  {
    id: "tm-03",
    sentence: "اشتريتُ كيلوغرامًا تفاحًا.",
    target: "تفاحًا",
    facts: {
      isTamyiz: true, tamyizKind: "malfuz", ambiguity: "كيلوغرامًا", probe: "كيلوغرامًا من ماذا؟", nasbMark: "fatha",
      finalI3rab: "تفاحًا: تمييز منصوب، وعلامة نصبه الفتحة الظاهرة على آخره.\nسبب الاختيار: لأنه فسّر مقدار الوزن «كيلوغرامًا» وأزال إبهامه.",
    },
    covers: ["tamyiz.malfuz.weight"],
  },
  {
    id: "tm-04",
    sentence: "ازدادَ الطالبُ علمًا.",
    target: "علمًا",
    facts: {
      isTamyiz: true, tamyizKind: "malhuz", ambiguity: "نسبة الازدياد", probe: "ازداد الطالب من أي جهة؟", nasbMark: "fatha",
      finalI3rab: "علمًا: تمييز منصوب، وعلامة نصبه الفتحة الظاهرة على آخره.\nسبب الاختيار: لأنه أزال الإبهام في نسبة الازدياد وبيّن الشيء الذي ازداد به الطالب.",
    },
    covers: ["tamyiz.malhuz.increase"],
  },
  {
    id: "tm-05",
    sentence: "امتلأَ الكأسُ ماءً.",
    target: "ماءً",
    facts: {
      isTamyiz: true, tamyizKind: "malhuz", ambiguity: "نسبة الامتلاء", probe: "بماذا امتلأ الكأس؟", nasbMark: "fatha",
      finalI3rab: "ماءً: تمييز منصوب، وعلامة نصبه الفتحة الظاهرة على آخره.\nسبب الاختيار: لأنه فسّر نسبة الامتلاء وبيّن ما الذي امتلأ به الكأس.",
    },
    covers: ["tamyiz.malhuz.fullness"],
  },
  {
    id: "tm-06",
    sentence: "محمدٌ أكثرُ علمًا.",
    target: "علمًا",
    facts: {
      isTamyiz: true, tamyizKind: "malhuz", ambiguity: "معنى أكثر", probe: "أكثر من أي جهة؟", nasbMark: "fatha",
      finalI3rab: "علمًا: تمييز منصوب، وعلامة نصبه الفتحة الظاهرة على آخره.\nسبب الاختيار: لأنه أزال الإبهام في اسم التفضيل «أكثر» وبيّن جهة التفاضل.",
    },
    covers: ["tamyiz.malhuz.comparison"],
  },
];

export const tamyizQuizExamples = buildTopicQuizExamples(
  tamyizExamples,
  "ما الإعراب الصحيح للتمييز في المثال؟",
  "صحيح؛ الكلمة أزالت إبهامًا، ثم حددنا أكان الإبهام في اسم قبلها أم في معنى الجملة.",
);
