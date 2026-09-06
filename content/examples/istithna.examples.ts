import type { ExerciseExample } from "../../lib/exercise/model";
import { buildTopicQuizExamples } from "./extended_topic_quiz";

export const istithnaCoverageKeysOrdered = [
  "istithna.complete.affirmative.singular",
  "istithna.complete.affirmative.dual",
  "istithna.complete.affirmative.jfs",
  "istithna.complete.affirmative.jt",
  "istithna.complete.negative.nasb",
  "istithna.complete.negative.follow",
  "istithna.mufarragh.fael",
  "istithna.mufarragh.mafool",
  "istithna.mufarragh.majrur",
];

export const istithnaExamples: ExerciseExample[] = [
  {
    id: "is-01",
    sentence: "حضرَ الطلابُ إلا خالدًا.",
    target: "خالدًا",
    facts: {
      hasIlla: true, isComplete: true, isAffirmative: true, exceptRole: "must_nasb", shape: "singular", nasbMark: "fatha",
      excludedFrom: "الطلاب",
      finalI3rab: "خالدًا: مستثنى منصوب بـ«إلا»، وعلامة نصبه الفتحة الظاهرة.\nسبب الاختيار: لأن الاستثناء تام مثبت؛ ذُكر المستثنى منه «الطلابُ» ولم تسبق الجملة بأداة نفي.",
    },
    covers: ["istithna.complete.affirmative.singular"],
  },
  {
    id: "is-02",
    sentence: "حضرَ الطلابُ إلا طالبَيْنِ.",
    target: "طالبَيْنِ",
    facts: {
      hasIlla: true, isComplete: true, isAffirmative: true, exceptRole: "must_nasb", shape: "dual", nasbMark: "yaa",
      excludedFrom: "الطلاب",
      finalI3rab: "طالبَيْنِ: مستثنى منصوب بـ«إلا»، وعلامة نصبه الياء لأنه مثنى.\nسبب الاختيار: لأن الاستثناء تام مثبت.",
    },
    covers: ["istithna.complete.affirmative.dual"],
  },
  {
    id: "is-03",
    sentence: "ما حضرَ الطلابُ إلا خالدًا.",
    target: "خالدًا",
    facts: {
      hasIlla: true, isComplete: true, isAffirmative: false, exceptRole: "allowed_nasb", shape: "singular", nasbMark: "fatha",
      excludedFrom: "الطلاب",
      finalI3rab: "خالدًا: مستثنى منصوب، وعلامة نصبه الفتحة الظاهرة.\nسبب الاختيار: لأن الاستثناء تام منفي، ويجوز فيه نصب المستثنى على الاستثناء، وهذا هو الوجه الذي جاءت عليه الكلمة في المثال.",
    },
    covers: ["istithna.complete.negative.nasb"],
  },
  {
    id: "is-04",
    sentence: "ما حضرَ الطلابُ إلا خالدٌ.",
    target: "خالدٌ",
    facts: {
      hasIlla: true, isComplete: true, isAffirmative: false, exceptRole: "follow",
      excludedFrom: "الطلاب",
      finalI3rab: "خالدٌ: بدل مرفوع من «الطلابُ»، وعلامة رفعه الضمة الظاهرة.\nسبب الاختيار: لأن الاستثناء تام منفي، ويجوز إتباع ما بعد «إلا» للمستثنى منه، وهذا هو الوجه المستعمل هنا.",
    },
    covers: ["istithna.complete.negative.follow"],
  },
  {
    id: "is-05",
    sentence: "ما حضرَ إلا خالدٌ.",
    target: "خالدٌ",
    facts: {
      hasIlla: true, isComplete: false, mufarraghRole: "fael",
      finalI3rab: "خالدٌ: فاعل مرفوع، وعلامة رفعه الضمة الظاهرة.\nسبب الاختيار: لأن الاستثناء مفرغ؛ لم يذكر المستثنى منه، فنعرب ما بعد «إلا» حسب موقعه، و«خالدٌ» هو الذي أسند إليه فعل الحضور.",
    },
    covers: ["istithna.mufarragh.fael"],
  },
  {
    id: "is-06",
    sentence: "ما قرأتُ إلا كتابًا.",
    target: "كتابًا",
    facts: {
      hasIlla: true, isComplete: false, mufarraghRole: "mafool",
      finalI3rab: "كتابًا: مفعول به منصوب، وعلامة نصبه الفتحة الظاهرة.\nسبب الاختيار: لأن الاستثناء مفرغ، و«كتابًا» هو الشيء الذي وقع عليه فعل القراءة.",
    },
    covers: ["istithna.mufarragh.mafool"],
  },
  {
    id: "is-07",
    sentence: "ما مررتُ إلا بخالدٍ.",
    target: "خالدٍ",
    facts: {
      hasIlla: true, isComplete: false, mufarraghRole: "majrur",
      finalI3rab: "خالدٍ: اسم مجرور بالباء، وعلامة جره الكسرة الظاهرة.\nسبب الاختيار: لأن الاستثناء مفرغ، وحرف الجر «الباء» هو العامل في «خالدٍ».",
    },
    covers: ["istithna.mufarragh.majrur"],
  },
  {
    id: "is-08",
    sentence: "حضرَ الناسُ إلا الطالباتِ.",
    target: "الطالباتِ",
    facts: { hasIlla: true, isComplete: true, isAffirmative: true, exceptRole: "must_nasb", shape: "jfs", nasbMark: "kasra", excludedFrom: "الناس", finalI3rab: "الطالباتِ: مستثنى منصوب بـ«إلا»، وعلامة نصبه الكسرة نيابةً عن الفتحة؛ لأنه جمع مؤنث سالم.\nسبب الاختيار: لأن الاستثناء تام مثبت." },
    covers: ["istithna.complete.affirmative.jfs"],
  },
  {
    id: "is-09",
    sentence: "حضرَ القومُ إلا رجالًا.",
    target: "رجالًا",
    facts: { hasIlla: true, isComplete: true, isAffirmative: true, exceptRole: "must_nasb", shape: "jt", nasbMark: "fatha", excludedFrom: "القوم", finalI3rab: "رجالًا: مستثنى منصوب بـ«إلا»، وعلامة نصبه الفتحة الظاهرة؛ لأنه جمع تكسير.\nسبب الاختيار: لأن الاستثناء تام مثبت." },
    covers: ["istithna.complete.affirmative.jt"],
  },];

export const istithnaQuizExamples = buildTopicQuizExamples(
  istithnaExamples,
  "ما الإعراب الصحيح لما بعد «إلا» في هذا المثال؟",
  "صحيح؛ فحصنا ذكر المستثنى منه أولًا، ثم النفي والإثبات، ولم نفترض أن كل اسم بعد «إلا» منصوب.",
);
