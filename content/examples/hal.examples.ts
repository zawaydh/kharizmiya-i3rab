import type { ExerciseExample } from "../../lib/exercise/model";
import { buildTopicQuizExamples } from "./extended_topic_quiz";

export const halCoverageKeysOrdered = [
  "hal.single.singular",
  "hal.single.dual",
  "hal.single.jms",
  "hal.single.jfs",
  "hal.single.jt",
  "hal.sentence.nominal",
  "hal.sentence.verbal",
  "hal.shibh",
];

export const halExamples: ExerciseExample[] = [
  {
    id: "hal-01",
    sentence: "عادَ الطالبُ مسرورًا.",
    target: "مسرورًا",
    facts: {
      isHal: true, halKind: "single", owner: "الطالب", howQuestion: "كيف عاد الطالب؟", halParaphrase: "عاد الطالب وهو مسرور",
      shape: "singular", nasbMark: "fatha",
      finalI3rab: "مسرورًا: حال منصوب، وعلامة نصبه الفتحة الظاهرة على آخره.\nسبب الاختيار: لأنه بيّن هيئة الطالب وقت العودة، ويجيب عن «كيف عاد الطالب؟»، ويصح المعنى: عاد الطالب وهو مسرور.",
    },
    covers: ["hal.single.singular"],
  },
  {
    id: "hal-02",
    sentence: "عادَ الطالبانِ مسرورَيْنِ.",
    target: "مسرورَيْنِ",
    facts: {
      isHal: true, halKind: "single", owner: "الطالبان", howQuestion: "كيف عاد الطالبان؟", halParaphrase: "عاد الطالبان وهما مسروران",
      shape: "dual", nasbMark: "yaa",
      finalI3rab: "مسرورَيْنِ: حال منصوب، وعلامة نصبه الياء لأنه مثنى.\nسبب الاختيار: لأنه بيّن هيئة الطالبين وقت العودة، ويصح المعنى: عاد الطالبان وهما مسروران.",
    },
    covers: ["hal.single.dual"],
  },
  {
    id: "hal-03",
    sentence: "عادَ المعلمونَ مسرورينَ.",
    target: "مسرورينَ",
    facts: {
      isHal: true, halKind: "single", owner: "المعلمون", howQuestion: "كيف عاد المعلمون؟", halParaphrase: "عاد المعلمون وهم مسرورون",
      shape: "jms", nasbMark: "yaa",
      finalI3rab: "مسرورينَ: حال منصوب، وعلامة نصبه الياء لأنه جمع مذكر سالم.\nسبب الاختيار: لأنه بيّن هيئة المعلمين وقت العودة.",
    },
    covers: ["hal.single.jms"],
  },
  {
    id: "hal-04",
    sentence: "دخلتِ الطالباتُ مسرعاتٍ.",
    target: "مسرعاتٍ",
    facts: {
      isHal: true, halKind: "single", owner: "الطالبات", howQuestion: "كيف دخلت الطالبات؟", halParaphrase: "دخلت الطالبات وهن مسرعات",
      shape: "jfs", nasbMark: "kasra",
      finalI3rab: "مسرعاتٍ: حال منصوب، وعلامة نصبه الكسرة نيابةً عن الفتحة لأنه جمع مؤنث سالم.\nسبب الاختيار: لأنه بيّن هيئة الطالبات وقت الدخول.",
    },
    covers: ["hal.single.jfs"],
  },
  {
    id: "hal-05",
    sentence: "عادَ الضيوفُ كرامًا.",
    target: "كرامًا",
    facts: {
      isHal: true, halKind: "single", owner: "الضيوف", howQuestion: "كيف عاد الضيوف؟", halParaphrase: "عاد الضيوف وهم كرام",
      shape: "jt", nasbMark: "fatha",
      finalI3rab: "كرامًا: حال منصوب، وعلامة نصبه الفتحة الظاهرة على آخره؛ لأنه جمع تكسير لكلمة «كريم».\nسبب الاختيار: لأنه بيّن هيئة الضيوف وقت العودة.",
    },
    covers: ["hal.single.jt"],
  },
  {
    id: "hal-06",
    sentence: "دخلَ الطالبُ وهو مبتسمٌ.",
    target: "وهو مبتسمٌ",
    facts: {
      isHal: true, halKind: "nominal_sentence", owner: "الطالب", howQuestion: "كيف دخل الطالب؟", halParaphrase: "دخل الطالب وهو مبتسم",
      finalI3rab: "الواو: واو الحال.\nهو: ضمير منفصل مبني في محل رفع مبتدأ.\nمبتسمٌ: خبر مرفوع.\nوالجملة الاسمية «هو مبتسمٌ» في محل نصب حال من «الطالب».",
    },
    covers: ["hal.sentence.nominal"],
  },
  {
    id: "hal-07",
    sentence: "جاءَ الطفلُ يضحكُ.",
    target: "يضحكُ",
    facts: {
      isHal: true, halKind: "verbal_sentence", owner: "الطفل", howQuestion: "كيف جاء الطفل؟", halParaphrase: "جاء الطفل وهو يضحك",
      finalI3rab: "يضحكُ: فعل مضارع مرفوع، والفاعل ضمير مستتر تقديره هو يعود على الطفل.\nوالجملة الفعلية «يضحكُ» في محل نصب حال من «الطفل»؛ لأنها بيّنت هيئته وقت المجيء.",
    },
    covers: ["hal.sentence.verbal"],
  },
  {
    id: "hal-08",
    sentence: "جاءَ الضيفُ في هدوءٍ.",
    target: "في هدوءٍ",
    facts: {
      isHal: true, halKind: "shibh", owner: "الضيف", howQuestion: "كيف جاء الضيف؟", halParaphrase: "جاء الضيف هادئًا",
      finalI3rab: "في هدوءٍ: جار ومجرور متعلقان بمحذوف في محل نصب حال من «الضيف».\nسبب الاختيار: لأن شبه الجملة بيّن هيئة الضيف وقت المجيء، والمعنى: جاء الضيف هادئًا.",
    },
    covers: ["hal.shibh"],
  },
];

export const halQuizExamples = buildTopicQuizExamples(
  halExamples,
  "ما الإعراب الصحيح للحال في المثال؟",
  "صحيح؛ حددنا أولًا أن التركيب يبين الهيئة، ثم حددنا نوع الحال وصورته وعلامته أو محله.",
);
