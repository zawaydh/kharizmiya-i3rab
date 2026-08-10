import type { ExerciseExample } from "../../lib/exercise/model";
import { buildTopicQuizExamples } from "./extended_topic_quiz";

export const laNafiyaCoverageKeysOrdered = [
  "la.mufrad.singular",
  "la.mufrad.dual",
  "la.mudaf.singular",
  "la.shibh.singular",
  "la.mudaf.dual",
  "la.mudaf.jms",
  "la.mudaf.five",
];

export const laNafiyaExamples: ExerciseExample[] = [
  {
    id: "la-01",
    sentence: "لا طالبَ مهملٌ.",
    target: "طالبَ",
    facts: {
      laWorks: true, isLaName: true, laNameKind: "mufrad", buildMark: "fatha",
      finalI3rab: "طالبَ: اسم «لا» النافية للجنس مبني على الفتح في محل نصب.\nسبب الاختيار: لأنه اسم «لا» مفرد في اصطلاح الباب؛ أي غير مضاف ولا شبيه بالمضاف.",
    },
    covers: ["la.mufrad.singular"],
  },
  {
    id: "la-02",
    sentence: "لا طالبَيْنِ مهملانِ.",
    target: "طالبَيْنِ",
    facts: {
      laWorks: true, isLaName: true, laNameKind: "mufrad", buildMark: "yaa",
      finalI3rab: "طالبَيْنِ: اسم «لا» النافية للجنس مبني على الياء في محل نصب؛ لأنه مثنى، واسم «لا» المفرد يبنى على ما ينصب به.\nتنبيه: «مفرد» هنا اصطلاح باب «لا» بمعنى غير مضاف ولا شبيه بالمضاف، لا بمعنى واحد في العدد.",
    },
    covers: ["la.mufrad.dual"],
  },
  {
    id: "la-03",
    sentence: "لا طالبَ علمٍ مهملٌ.",
    target: "طالبَ",
    facts: {
      laWorks: true, isLaName: true, laNameKind: "mudaf", shape: "singular", nasbMark: "fatha",
      finalI3rab: "طالبَ: اسم «لا» النافية للجنس منصوب، وعلامة نصبه الفتحة الظاهرة، وهو مضاف.\nعلمٍ: مضاف إليه مجرور.\nسبب الاختيار: لأن اسم «لا» مضاف، والمضاف في هذا الباب معرب منصوب.",
    },
    covers: ["la.mudaf.singular"],
  },
  {
    id: "la-04",
    sentence: "لا طالبًا للعلمِ مهملٌ.",
    target: "طالبًا",
    facts: {
      laWorks: true, isLaName: true, laNameKind: "shibh_mudaf", shape: "singular", nasbMark: "fatha",
      finalI3rab: "طالبًا: اسم «لا» النافية للجنس منصوب، وعلامة نصبه الفتحة الظاهرة؛ لأنه شبيه بالمضاف.\nسبب الاختيار: لأن الجار والمجرور «للعلمِ» تمم معنى الاسم من غير إضافة صريحة.",
    },
    covers: ["la.shibh.singular"],
  },
  {
    id: "la-05",
    sentence: "لا طالبَيِ علمٍ مهملانِ.",
    target: "طالبَيِ",
    facts: {
      laWorks: true, isLaName: true, laNameKind: "mudaf", shape: "dual", nasbMark: "yaa",
      finalI3rab: "طالبَيِ: اسم «لا» النافية للجنس منصوب، وعلامة نصبه الياء لأنه مثنى، وهو مضاف.\nعلمٍ: مضاف إليه مجرور.",
    },
    covers: ["la.mudaf.dual"],
  },
  {
    id: "la-06",
    sentence: "لا معلّمي شرٍّ محبوبونَ.",
    target: "معلّمي",
    facts: {
      laWorks: true, isLaName: true, laNameKind: "mudaf", shape: "jms", nasbMark: "yaa",
      finalI3rab: "معلّمي: اسم «لا» النافية للجنس منصوب، وعلامة نصبه الياء لأنه جمع مذكر سالم، وهو مضاف، وحذفت النون للإضافة.\nشرٍّ: مضاف إليه مجرور.",
    },
    covers: ["la.mudaf.jms"],
  },
  {
    id: "la-07",
    sentence: "لا أخا سوءٍ محبوبٌ.",
    target: "أخا",
    facts: {
      laWorks: true, isLaName: true, laNameKind: "mudaf", shape: "five", nasbMark: "alif", fiveNoun: true,
      finalI3rab: "أخا: اسم «لا» النافية للجنس منصوب، وعلامة نصبه الألف لأنه من الأسماء الخمسة، وقد استوفى شروط إعرابها بالحروف: مفرد، مكبر، مضاف، ومضاف إلى غير ياء المتكلم.\nسوءٍ: مضاف إليه مجرور.",
    },
    covers: ["la.mudaf.five"],
  },
];

export const laNafiyaQuizExamples = buildTopicQuizExamples(
  laNafiyaExamples,
  "ما الإعراب الصحيح لاسم «لا» النافية للجنس؟",
  "صحيح؛ تحققنا من عمل «لا»، ثم حددنا نوع اسمها، وبعد ذلك فرّقنا بين البناء في محل نصب والإعراب بالنصب.",
);
