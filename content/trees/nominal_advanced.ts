// content/trees/nominal_advanced.ts

// عدّلي مسار النوع ExerciseTree حسب مشروعك
// إذا عندك النوع في مكان آخر، فقط عدلي هذا الاستيراد
import type { ExerciseTree } from "../../lib/exercise/types";

export const nominalAdvancedTree: ExerciseTree = {
  startNodeId: "start",

  nodes: {
    // 1) بداية الجملة (كما اتفقنا)
    start: {
      id: "start",
      type: "question",
      text: "بماذا بدأت الجملة؟",
      hint: "حدد: اسم صريح أم شبه جملة.",
      answers: [
        {
          id: "a",
          text: "بدأت باسم صريح",
          next: "wordType",
          eval: { fact: "startType", equals: "explicitNoun" },
        },
        {
          id: "b",
          text: "بدأت بشبه جملة",
          next: "ppCheck",
          eval: { fact: "startType", equals: "pp" },
        },
        {
          id: "c",
          text: "ليست ضمن هذا المسار",
          next: "notPath",
          eval: { fact: "startType", equals: "other" },
        },
      ],
    },

    notPath: {
      id: "notPath",
      type: "result",
      text: "هذه الجملة ليست ضمن هذا المسار.",
    },

    // 2) شبه الجملة (مؤقتًا كما عندك)
    ppCheck: {
      id: "ppCheck",
      type: "question",
      text: "هل الاسم بعدها نكرة؟",
      hint: "إذا كان بعدها نكرة غالبًا تكون شبه الجملة خبرًا مقدمًا والاسم مبتدأ مؤخرًا.",
      answers: [
        {
          id: "a",
          text: "نعم",
          next: "ppResult",
          eval: { fact: "ppNextIsNakira", equals: true },
        },
        {
          id: "b",
          text: "لا",
          next: "ppNot",
          eval: { fact: "ppNextIsNakira", equals: false },
        },
      ],
    },

    ppResult: {
      id: "ppResult",
      type: "result",
      text:
        "شبه الجملة: خبر مقدّم.\n" +
        "الاسم بعدها: مبتدأ مؤخر مرفوع.",
    },

    ppNot: {
      id: "ppNot",
      type: "result",
      text: "ليست حالة خبر مقدم.",
    },

    // =========================
    // نظام المبتدأ (الكلمة الهدف)
    // =========================

    // 3) أول خطوة يا بني: نحدد نوع الكلمة الهدف (اسم/فعل/حرف)
    wordType: {
      id: "wordType",
      type: "question",
      text: "أول خطوة يا بني: نحدد نوع الكلمة الهدف. ما نوعها؟",
      hint:
        "من علامات الاسم: دخول (الـ)، وحرف الجر، والتنوين. والفعل يقبل (قد/سوف/السين/تاء التأنيث الساكنة للماضي).",
      answers: [
        {
          id: "a",
          text: "اسم",
          next: "nounKind",
          eval: { fact: "targetWordType", equals: "noun" },
        },
        {
          id: "b",
          text: "فعل",
          next: "R_not_mubtada",
          eval: { fact: "targetWordType", equals: "verb" },
        },
        {
          id: "c",
          text: "حرف",
          next: "R_not_mubtada",
          eval: { fact: "targetWordType", equals: "harf" },
        },
      ],
    },

    R_not_mubtada: {
      id: "R_not_mubtada",
      type: "result",
      text:
        "هذه الكلمة ليست مبتدأ؛ لأن المبتدأ يكون اسمًا.",
    },

    // 4) إن كان اسمًا: معرب/مبني/مصدر مؤول
    nounKind: {
      id: "nounKind",
      type: "question",
      text: "هل الاسم معرب أم مبني أم مصدر مؤول؟",
      hint:
        "المصدر المؤول غالبًا يكون (أنْ + فعل مضارع) ويعامل معاملة الاسم: أن تدرسَ = دراستُك.",
      answers: [
        {
          id: "a",
          text: "اسم معرب",
          next: "i3rabNumber",
          eval: { fact: "targetNounKind", equals: "mu3rab" },
        },
        {
          id: "b",
          text: "اسم مبني",
          next: "mabniType",
          eval: { fact: "targetNounKind", equals: "mabni" },
        },
        {
          id: "c",
          text: "مصدر مؤول",
          next: "R_source_mubtada",
          eval: { fact: "targetNounKind", equals: "sourceMuawwal" },
        },
      ],
    },

    // 5) إن كان معربًا: مفرد/مثنى/جمع
    i3rabNumber: {
      id: "i3rabNumber",
      type: "question",
      text: "هل الاسم مفرد أم مثنى أم جمع؟",
      hint:
        "المثنى: ينتهي بـ (ان/ين). جمع المذكر السالم: (ون/ين). جمع المؤنث السالم: (ات).",
      answers: [
        {
          id: "a",
          text: "مفرد",
          next: "singularKind",
          eval: { fact: "targetNumber", equals: "singular" },
        },
        {
          id: "b",
          text: "مثنى",
          next: "R_mubtada_muthanna",
          eval: { fact: "targetNumber", equals: "dual" },
        },
        {
          id: "c",
          text: "جمع مذكر سالم",
          next: "R_mubtada_jms",
          eval: { fact: "targetNumber", equals: "jms" },
        },
        {
          id: "d",
          text: "جمع مؤنث سالم",
          next: "R_mubtada_jfs",
          eval: { fact: "targetNumber", equals: "jfs" },
        },
        {
          id: "e",
          text: "جمع تكسير",
          next: "R_mubtada_jt",
          eval: { fact: "targetNumber", equals: "jt" },
        },
      ],
    },

    // 6) إن كان مفردًا: صحيح الآخر/معتل الآخر/أسماء خمسة
    singularKind: {
      id: "singularKind",
      type: "question",
      text: "إن كان مفردًا: هل هو صحيح الآخر أم معتل الآخر أم من الأسماء الخمسة؟",
      hint:
        "حروف العلة: الألف والواو والياء. والأسماء الخمسة: أبو، أخو، حمو، ذو، فو.",
      answers: [
        {
          id: "a",
          text: "صحيح الآخر",
          next: "R_mubtada_sahih",
          eval: { fact: "targetSingularKind", equals: "sahih" },
        },
        {
          id: "b",
          text: "معتل الآخر",
          next: "R_mubtada_moatal",
          eval: { fact: "targetSingularKind", equals: "moatal" },
        },
        {
          id: "c",
          text: "من الأسماء الخمسة",
          next: "R_mubtada_5",
          eval: { fact: "targetSingularKind", equals: "asma5" },
        },
      ],
    },

    // 7) إن كان مبنيًا: ضمير/إشارة/موصول/استفهام/شرط/كم خبرية
    mabniType: {
      id: "mabniType",
      type: "question",
      text: "إن كان الاسم مبنيًا: ما نوعه؟",
      hint:
        "المبنيات المشهورة هنا: الضمير المنفصل، أسماء الإشارة، الأسماء الموصولة، أسماء الاستفهام، أسماء الشرط، كم الخبرية.",
      answers: [
        {
          id: "a",
          text: "ضمير منفصل",
          next: "R_mubtada_damir",
          eval: { fact: "targetMabniType", equals: "damir" },
        },
        {
          id: "b",
          text: "اسم إشارة",
          next: "R_mubtada_ishara",
          eval: { fact: "targetMabniType", equals: "ishara" },
        },
        {
          id: "c",
          text: "اسم موصول",
          next: "R_mubtada_mawsool",
          eval: { fact: "targetMabniType", equals: "mawsool" },
        },
        {
          id: "d",
          text: "اسم استفهام",
          next: "R_mubtada_istifham",
          eval: { fact: "targetMabniType", equals: "istifham" },
        },
        {
          id: "e",
          text: "اسم شرط",
          next: "R_mubtada_shart",
          eval: { fact: "targetMabniType", equals: "shart" },
        },
        {
          id: "f",
          text: "كم الخبرية",
          next: "R_mubtada_kam_khabariyya",
          eval: { fact: "targetMabniType", equals: "kam" },
        },
      ],
    },

    // =========================
    // النتائج بصياغتك النهائية
    // =========================

    R_mubtada_sahih: {
      id: "R_mubtada_sahih",
      type: "result",
      text:
        "مبتدأ مرفوع وعلامة رفعه الضمة الظاهرة على آخره.\n" +
        "أمثلة:\n" +
        "1 الطالبُ مجتهدٌ\n2 المؤمنُ محبوبٌ\n3 القراءةُ ممتعةٌ\n4 بابُ المدرسةِ مفتوحٌ.\n\n" +
        "تلميح: انتبه يا بني أن من علامات الاسم يقبل دخول (الـ) وحرف الجر والتنوين.",
    },

    R_mubtada_moatal: {
      id: "R_mubtada_moatal",
      type: "result",
      text:
        "مبتدأ مرفوع وعلامة رفعه الضمة المقدرة على آخره.\n" +
        "أمثلة:\n" +
        "1 جنى طالبةٌ مجتهدةٌ\n2 قصي يعملُ بجدٍ\n3 منى تدرسُ بجدٍ\n4 سامي يسافرُ كثيرًا.\n\n" +
        "تلميح: يا بني حروف العلة هي الألف والواو والياء؛ هل ينتهي الاسم بأيٍ منها؟",
    },

    R_mubtada_5: {
      id: "R_mubtada_5",
      type: "result",
      text:
        "مبتدأ مرفوع وعلامة رفعه الواو لأنه من الأسماء الخمسة.\n" +
        "أمثلة:\n" +
        "1 أبوكَ رجلٌ فاضلٌ\n2 ذو العلمِ محترمٌ\n3 أخوكَ متسامحٌ\n4 فوكَ ينطقُ دُررًا.\n\n" +
        "تلميح: الأسماء الخمسة: أبو، أخو، حمو، ذو، فو.\n" +
        "ومن شروط إعرابها بالحروف: أن تكون مفردة، مضافة، إضافتها لغير ياء المتكلم، (ذو) بمعنى صاحب، و(فو) تحذف منها الميم.\n" +
        "إذا اختل شرط → تعرب بالحركات.",
    },

    R_mubtada_muthanna: {
      id: "R_mubtada_muthanna",
      type: "result",
      text:
        "مبتدأ مرفوع وعلامة رفعه الألف لأنه مثنى.\n" +
        "أمثلة:\n" +
        "1 الجداران مرتفعان\n2 المعلمتان مخلصتان\n3 الولدان يستخدمان وسائل التواصل الاجتماعي\n4 المبرمجان يعملان بجد.",
    },

    R_mubtada_jms: {
      id: "R_mubtada_jms",
      type: "result",
      text:
        "مبتدأ مرفوع وعلامة رفعه الواو لأنه جمع مذكر سالم.\n" +
        "أمثلة:\n" +
        "1 المؤمنون أشداء\n2 المعلمون مخلصون\n3 المزارعون نشيطون\n4 مدخلو البيانات مثابرون على العمل.\n\n" +
        "تلميح: جمع المذكر السالم إذا جاء مضافًا قد تُحذف نونه.",
    },

    R_mubtada_jfs: {
      id: "R_mubtada_jfs",
      type: "result",
      text:
        "مبتدأ مرفوع وعلامة رفعه الضمة الظاهرة على آخره.",
    },

    R_mubtada_jt: {
      id: "R_mubtada_jt",
      type: "result",
      text:
        "مبتدأ مرفوع وعلامة رفعه الضمة الظاهرة على آخره.",
    },

    R_mubtada_damir: {
      id: "R_mubtada_damir",
      type: "result",
      text:
        "ضمير منفصل مبني في محل رفع مبتدأ.\n" +
        "أمثلة:\n" +
        "1 أنا أحب الحياة\n2 هو يجتهد في عمله\n3 نحن نتعاون دائمًا\n4 هم يتواصلون دائمًا.",
    },

    R_mubtada_ishara: {
      id: "R_mubtada_ishara",
      type: "result",
      text:
        "اسم إشارة مبني في محل رفع مبتدأ.\n" +
        "أمثلة:\n" +
        "1 هذا طالبٌ مجتهدٌ\n2 هؤلاء بناةُ المستقبل\n3 هذه فتاةٌ متعاونةٌ\n4 أولئك المعلمون مخلصون.",
    },

    R_mubtada_mawsool: {
      id: "R_mubtada_mawsool",
      type: "result",
      text:
        "اسم موصول مبني في محل رفع مبتدأ.\n" +
        "أمثلة:\n" +
        "1 الذي يعمل بجد مجتهدٌ\n2 اللواتي يدرسن جيدًا ينلن العلا\n3 الذين يؤمنون بالله لا يؤذون غيرهم\n4 التي تسعى تنل ما تريد.",
    },

    R_mubtada_istifham: {
      id: "R_mubtada_istifham",
      type: "result",
      text:
        "اسم استفهام مبني في محل رفع مبتدأ.\n" +
        "مثال: مَن المجتهدُ؟ / ما الحلُّ؟",
    },

    R_mubtada_shart: {
      id: "R_mubtada_shart",
      type: "result",
      text:
        "اسم شرط مبني في محل رفع مبتدأ.\n" +
        "مثال: مَن يجتهدْ ينجحْ.",
    },

    R_mubtada_kam_khabariyya: {
      id: "R_mubtada_kam_khabariyya",
      type: "result",
      text:
        "كم الخبرية اسم مبني في محل رفع مبتدأ.\n" +
        "أمثلة:\n" +
        "1 كم طالبٍ نجحَ!\n2 كم عالمٍ أفادَ الناسَ!\n3 كم نعمةٍ أنعمَ اللهُ بها علينا!\n4 كم يومٍ صبرتُ على الشدائد!\n\n" +
        "تلميح: كم الخبرية تدل على الكثرة، وليست سؤالًا.",
    },

    R_source_mubtada: {
      id: "R_source_mubtada",
      type: "result",
      text:
        "مصدر مؤول (أن + الفعل المضارع) في محل رفع مبتدأ.\n" +
        "أمثلة:\n" +
        "1 أن تحفظَ القرآنَ فضلٌ عظيمٌ.\n" +
        "2 أن تدرسوا بانتظامٍ نجاحٌ.\n" +
        "3 أن تساعدَ المحتاجَ عملٌ نبيلٌ.\n" +
        "4 أن تتقنَ عملك تميّزٌ.",
    },
  },
};