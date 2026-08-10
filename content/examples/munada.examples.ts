import type { ExerciseExample } from "../../lib/exercise/model";
import { buildTopicQuizExamples } from "./extended_topic_quiz";

export const munadaCoverageKeysOrdered = [
  "munada.alam",
  "munada.nakira_maqsuda",
  "munada.mudaf.singular",
  "munada.shibh",
  "munada.nakira_ghayr",
  "munada.mudaf.dual",
  "munada.mudaf.jms",
  "munada.five",
];

export const munadaExamples: ExerciseExample[] = [
  {
    id: "mn-01",
    sentence: "يا محمدُ، اجتهدْ.",
    target: "محمدُ",
    facts: {
      isMunada: true, munadaKind: "alam", buildMark: "damma",
      finalI3rab: "محمدُ: منادى مفرد علم مبني على الضم في محل نصب.\nسبب الاختيار: لأنه علم مفرد مقصود بالنداء.",
    },
    covers: ["munada.alam"],
  },
  {
    id: "mn-02",
    sentence: "يا طالبُ، انتبهْ.",
    target: "طالبُ",
    facts: {
      isMunada: true, munadaKind: "nakira_maqsuda", buildMark: "damma",
      finalI3rab: "طالبُ: منادى نكرة مقصودة مبني على الضم في محل نصب.\nسبب الاختيار: لأن المتكلم ينادي طالبًا معينًا حاضرًا يقصده بالخطاب.",
    },
    covers: ["munada.nakira_maqsuda"],
  },
  {
    id: "mn-03",
    sentence: "يا طالبَ العلمِ، اجتهدْ.",
    target: "طالبَ",
    facts: {
      isMunada: true, munadaKind: "mudaf", shape: "singular", nasbMark: "fatha",
      finalI3rab: "طالبَ: منادى مضاف منصوب، وعلامة نصبه الفتحة الظاهرة، وهو مضاف.\nالعلمِ: مضاف إليه مجرور.\nسبب الاختيار: لأن المنادى أضيف إلى «العلمِ».",
    },
    covers: ["munada.mudaf.singular"],
  },
  {
    id: "mn-04",
    sentence: "يا طالبًا للعلمِ، اجتهدْ.",
    target: "طالبًا",
    facts: {
      isMunada: true, munadaKind: "shibh_mudaf", shape: "singular", nasbMark: "fatha",
      finalI3rab: "طالبًا: منادى شبيه بالمضاف منصوب، وعلامة نصبه الفتحة الظاهرة.\nسبب الاختيار: لأن الجار والمجرور «للعلمِ» تمم معنى المنادى من غير إضافة صريحة.",
    },
    covers: ["munada.shibh"],
  },
  {
    id: "mn-05",
    sentence: "يا غافلًا، انتبهْ.",
    target: "غافلًا",
    facts: {
      isMunada: true, munadaKind: "nakira_ghayr_maqsuda", shape: "singular", nasbMark: "fatha",
      finalI3rab: "غافلًا: منادى نكرة غير مقصودة منصوب، وعلامة نصبه الفتحة الظاهرة.\nسبب الاختيار: لأن النداء موجّه إلى أي غافل من غير تعيين شخص بعينه.",
    },
    covers: ["munada.nakira_ghayr"],
  },
  {
    id: "mn-06",
    sentence: "يا طالبَيِ العلمِ، اجتهدا.",
    target: "طالبَيِ",
    facts: {
      isMunada: true, munadaKind: "mudaf", shape: "dual", nasbMark: "yaa",
      finalI3rab: "طالبَيِ: منادى مضاف منصوب، وعلامة نصبه الياء لأنه مثنى، وهو مضاف.\nالعلمِ: مضاف إليه مجرور.",
    },
    covers: ["munada.mudaf.dual"],
  },
  {
    id: "mn-07",
    sentence: "يا معلّمي الخيرِ، أحسنوا.",
    target: "معلّمي",
    facts: {
      isMunada: true, munadaKind: "mudaf", shape: "jms", nasbMark: "yaa",
      finalI3rab: "معلّمي: منادى مضاف منصوب، وعلامة نصبه الياء لأنه جمع مذكر سالم، وهو مضاف، وحذفت النون للإضافة.\nالخيرِ: مضاف إليه مجرور.",
    },
    covers: ["munada.mudaf.jms"],
  },
  {
    id: "mn-08",
    sentence: "يا أبا خالدٍ، أقبلْ.",
    target: "أبا",
    facts: {
      isMunada: true, munadaKind: "mudaf", shape: "five", nasbMark: "alif", fiveNoun: true,
      finalI3rab: "أبا: منادى مضاف منصوب، وعلامة نصبه الألف لأنه من الأسماء الخمسة، وقد استوفى شروط إعرابها بالحروف: مفرد، مكبر، مضاف، ومضاف إلى غير ياء المتكلم.\nخالدٍ: مضاف إليه مجرور.",
    },
    covers: ["munada.five"],
  },
];

export const munadaQuizExamples = buildTopicQuizExamples(
  munadaExamples,
  "ما الإعراب الصحيح للمنادى في المثال؟",
  "صحيح؛ حددنا نوع المنادى أولًا، ثم عرفنا هل هو مبني في محل نصب أم معرب منصوب، ثم اخترنا العلامة.",
);
