import type { ExerciseTree } from "../../lib/exercise/model";

export const laNafiyaTree: ExerciseTree = {
  startNodeId: "la_gate",
  nodes: {
    la_gate: {
      id: "la_gate",
      type: "question",
      context: "نبدأ من «لا» نفسها قبل إعراب الاسم بعدها.",
      text: "هل «لا» هنا نافية للجنس عاملة عمل «إنَّ»؟",
      hint: "تحقق من المعنى والبناء: هل تنفي الحكم عن الجنس كله؟ وهل اسمها نكرة جاء بعدها من غير فاصل؟ في أمثلة هذا المسار تعمل «لا» عمل «إنَّ»: تنصب الاسم وترفع الخبر.",
      answers: [
        { id: "yes", text: "نعم، تنفي الجنس وتعمل عمل «إنَّ»", next: "la_name", eval: { fact: "laWorks", equals: true }, hint: "إذا نفت «لا» الجنس كله واستوفت شروط العمل، فهي تعمل عمل «إنَّ»: اسمها منصوب أو في محل نصب، وخبرها مرفوع." },
        { id: "no", text: "لا، ليست عاملة عمل «إنَّ»", next: "la_name", eval: { fact: "laWorks", equals: false }, hint: "لا تخلط «لا» النافية للجنس بـ«لا» الناهية أو «لا» النافية غير العاملة. انظر إلى الاسم النكرة بعدها وإلى معنى نفي الجنس كله." },
      ],
    },
    la_name: {
      id: "la_name",
      type: "question",
      context: "عرفنا أن «لا» نافية للجنس عاملة؛ نحدد الآن دور الكلمة المطلوبة.",
      text: "هل الكلمة المحددة هي اسم «لا» الذي وقع عليه نفي الجنس؟",
      hint: "اسأل: ما الجنس الذي نفته «لا»؟ الاسم الذي يدل عليه مباشرة هو اسم «لا»، أما الجزء الذي يتمم الحكم بعده فهو الخبر.",
      answers: [
        { id: "name", text: "نعم، هي اسم «لا»", next: "la_kind", eval: { fact: "isLaName", equals: true }, hint: "ثبت أنها اسم «لا». الآن نحدد نوع اسم «لا»؛ لأن المفرد يبنى، والمضاف والشبيه بالمضاف يعربان منصوبين." },
        { id: "not-name", text: "لا، ليست اسم «لا»", next: "la_kind", eval: { fact: "isLaName", equals: false }, hint: "لا تُعرب الخبر اسمًا لـ«لا». حدّد الاسم الذي وقع عليه نفي الجنس أولًا." },
      ],
    },
    la_kind: {
      id: "la_kind",
      type: "question",
      context: "وصلنا إلى اسم «لا»، ونوعه هو الذي يحدد البناء أو الإعراب.",
      text: "ما نوع اسم «لا» في هذا المثال؟",
      hint: "في باب «لا» كلمة «مفرد» تعني: غير مضاف ولا شبيه بالمضاف، ولا تعني بالضرورة واحدًا في العدد. المفرد يبنى على ما ينصب به في محل نصب؛ والمضاف والشبيه بالمضاف معربان منصوبان.",
      answers: [
        { id: "mufrad", text: "مفرد: غير مضاف ولا شبيه بالمضاف", next: "la_built_shape", eval: { fact: "laNameKind", equals: "mufrad" }, hint: "إذا لم يتعلق بالاسم مضاف إليه ولا ما يتمم معناه، فهو مفرد في باب «لا»، ويبنى على ما ينصب به في محل نصب." },
        { id: "mudaf", text: "مضاف", next: "la_nasb_shape", eval: { fact: "laNameKind", equals: "mudaf" }, hint: "إذا أضيف اسم «لا» إلى اسم بعده، فهو مضاف ومعرب منصوب." },
        { id: "shibh", text: "شبيه بالمضاف", next: "la_nasb_shape", eval: { fact: "laNameKind", equals: "shibh_mudaf" }, hint: "إذا اتصل باسم «لا» ما يتمم معناه، كجار ومجرور أو معمول، من غير إضافة صريحة، فهو شبيه بالمضاف ومعرب منصوب." },
      ],
    },
    la_built_shape: {
      id: "la_built_shape",
      type: "question",
      context: "عرفنا أن اسم «لا» مفرد في اصطلاح الباب؛ لذلك يبنى على ما كان سينصب به.",
      text: "على أي علامة يُبنى اسم «لا» المفرد هنا؟",
      hint: "المفرد الحقيقي يبنى على الفتح، والمثنى وجمع المذكر السالم يبنيان على الياء؛ وكل ذلك في محل نصب اسم «لا».",
      answers: [
        { id: "fatha", text: "على الفتح في محل نصب", next: "R_la_built", eval: { fact: "buildMark", equals: "fatha" }, hint: "إذا كان اسم «لا» المفرد اسمًا مفردًا حقيقيًا، يبنى على الفتح في محل نصب." },
        { id: "yaa", text: "على الياء في محل نصب", next: "R_la_built", eval: { fact: "buildMark", equals: "yaa" }, hint: "إذا كان اسم «لا» المفرد مثنى أو جمع مذكر سالم، يبنى على الياء لأنه يبنى على ما ينصب به." },
      ],
    },
    la_nasb_shape: {
      id: "la_nasb_shape",
      type: "question",
      context: "عرفنا أن اسم «لا» مضاف أو شبيه بالمضاف، فهو معرب منصوب؛ نحدد الآن صورة الاسم.",
      text: "ما صورة اسم «لا» المعرب؟",
      hint: "حدد صورة الاسم نفسه قبل العلامة: مفرد، مثنى، جمع مذكر سالم، أم من الأسماء الخمسة؟",
      answers: [
        { id: "singular", text: "مفرد", next: "la_nasb_mark", eval: { fact: "shape", equals: "singular" }, hint: "المفرد المعرب المنصوب علامته الفتحة." },
        { id: "dual", text: "مثنى", next: "la_nasb_mark", eval: { fact: "shape", equals: "dual" }, hint: "المثنى المنصوب علامته الياء." },
        { id: "jms", text: "جمع مذكر سالم", next: "la_nasb_mark", eval: { fact: "shape", equals: "jms" }, hint: "جمع المذكر السالم ينصب بالياء." },
        { id: "five", text: "من الأسماء الخمسة", next: "la_nasb_mark", eval: { fact: "shape", equals: "five" }, hint: "الأسماء الخمسة تنصب بالألف إذا كانت مفردة، مكبرة، مضافة، ومضافة إلى غير ياء المتكلم؛ ومع «ذو» تكون بمعنى صاحب، ومع «فو» تكون خالية من الميم." },
      ],
    },
    la_nasb_mark: {
      id: "la_nasb_mark",
      type: "question",
      context: "ثبت أن اسم «لا» معرب منصوب وعرفنا صورته؛ بقيت العلامة.",
      text: "ما علامة النصب المناسبة؟",
      hint: "الفتحة للمفرد، والياء للمثنى وجمع المذكر السالم، والألف للأسماء الخمسة المستوفية للشروط.",
      answers: [
        { id: "fatha", text: "الفتحة الظاهرة", next: "R_la_nasb", eval: { fact: "nasbMark", equals: "fatha" }, hint: "الفتحة علامة النصب الأصلية للمفرد." },
        { id: "yaa", text: "الياء", next: "R_la_nasb", eval: { fact: "nasbMark", equals: "yaa" }, hint: "الياء علامة نصب المثنى وجمع المذكر السالم." },
        { id: "alif", text: "الألف", next: "R_la_nasb", eval: { fact: "nasbMark", equals: "alif" }, hint: "الألف علامة نصب الأسماء الخمسة عند استيفاء شروط الإعراب بالحروف." },
      ],
    },
    R_la_built: { id: "R_la_built", type: "result", text: "اسم «لا» مبني على ما ينصب به في محل نصب." },
    R_la_nasb: { id: "R_la_nasb", type: "result", text: "اسم «لا» منصوب، وتحدد العلامة بحسب صورة الاسم." },
  },
};
