import type { ExerciseTree } from "../../lib/exercise/model";

export const munadaTree: ExerciseTree = {
  startNodeId: "munada_tool",
  nodes: {
    munada_tool: {
      id: "munada_tool",
      type: "question",
      context: "نبدأ من الأداة التي فتحت أسلوب النداء قبل الحكم على الكلمة.",
      text: "هل سبقت الكلمة المحددة أداة نداء، وهي المقصودة بالنداء؟",
      hint: "ابحث عن أداة نداء مثل «يا». ثم اسأل: من الذي أُناديه؟ الكلمة التي تدل على المنادى هي التي نتابع إعرابها.",
      answers: [
        { id: "yes", text: "نعم، سبقتها أداة نداء وهي المقصودة", next: "munada_kind", eval: { fact: "isMunada", equals: true }, hint: "إذا سبقت الكلمة أداة نداء وكانت هي المقصودة بالنداء، ننتقل إلى نوع المنادى؛ لأن النوع هو الذي يحدد هل يبنى في محل نصب أم ينصب." },
        { id: "no", text: "لا، ليست هي المقصودة بالنداء", next: "munada_kind", eval: { fact: "isMunada", equals: false }, hint: "لا يكفي وجود «يا» في الجملة؛ حدّد الاسم الذي وقع عليه النداء نفسه." },
      ],
    },
    munada_kind: {
      id: "munada_kind",
      type: "question",
      context: "ثبت أن الكلمة منادى، فنحدد نوعه لأن الحكم يختلف باختلاف النوع.",
      text: "ما نوع المنادى في هذا المثال؟",
      hint: "المفرد العلم والنكرة المقصودة يبنيان على ما يرفعان به في محل نصب. أما المضاف والشبيه بالمضاف والنكرة غير المقصودة فتعرب منصوبة.",
      answers: [
        { id: "alam", text: "مفرد علم", next: "R_munada_built", eval: { fact: "munadaKind", equals: "alam" }, hint: "إذا كان اسم علم مفردًا مقصودًا بذاته، فهو منادى مبني على ما يرفع به في محل نصب." },
        { id: "maqsuda", text: "نكرة مقصودة", next: "R_munada_built", eval: { fact: "munadaKind", equals: "nakira_maqsuda" }, hint: "إذا ناديت نكرة تقصد بها شخصًا معينًا حاضرًا، فهي نكرة مقصودة، وتبنى على ما ترفع به في محل نصب." },
        { id: "mudaf", text: "مضاف", next: "munada_shape", eval: { fact: "munadaKind", equals: "mudaf" }, hint: "إذا جاء بعد المنادى مضاف إليه يتمم معناه، فالمنادى مضاف ويكون منصوبًا." },
        { id: "shibh", text: "شبيه بالمضاف", next: "munada_shape", eval: { fact: "munadaKind", equals: "shibh_mudaf" }, hint: "الشبيه بالمضاف اتصل به ما يتمم معناه، مثل جار ومجرور أو معمول، من غير أن يكون مضافًا صريحًا؛ وحكمه النصب." },
        { id: "ghayr", text: "نكرة غير مقصودة", next: "munada_shape", eval: { fact: "munadaKind", equals: "nakira_ghayr_maqsuda" }, hint: "إذا ناديت أي فرد غير معين من الجنس، فهي نكرة غير مقصودة وحكمها النصب." },
      ],
    },
    munada_shape: {
      id: "munada_shape",
      type: "question",
      context: "عرفنا أن هذا النوع من المنادى منصوب، فنعود إلى صورة الاسم لتحديد العلامة.",
      text: "ما صورة الاسم المنادى؟",
      hint: "افحص الاسم نفسه: مفرد، مثنى، جمع مذكر سالم، أم من الأسماء الخمسة؟",
      answers: [
        { id: "singular", text: "مفرد", next: "munada_mark", eval: { fact: "shape", equals: "singular" }, hint: "المفرد المنصوب علامته الأصلية الفتحة." },
        { id: "dual", text: "مثنى", next: "munada_mark", eval: { fact: "shape", equals: "dual" }, hint: "المثنى ينصب بالياء." },
        { id: "jms", text: "جمع مذكر سالم", next: "munada_mark", eval: { fact: "shape", equals: "jms" }, hint: "جمع المذكر السالم ينصب بالياء." },
        { id: "five", text: "من الأسماء الخمسة", next: "munada_mark", eval: { fact: "shape", equals: "five" }, hint: "الأسماء الخمسة تنصب بالألف إذا استوفت شروط الإعراب بالحروف: مفردة، مكبرة، مضافة، ومضافة إلى غير ياء المتكلم؛ ومع «ذو» تكون بمعنى صاحب، ومع «فو» تكون خالية من الميم." },
      ],
    },
    munada_mark: {
      id: "munada_mark",
      type: "question",
      context: "ثبت أن المنادى معرب منصوب، وعرفنا صورة الاسم؛ بقيت علامة النصب.",
      text: "ما علامة نصب المنادى هنا؟",
      hint: "الفتحة للمفرد، والياء للمثنى وجمع المذكر السالم، والألف للأسماء الخمسة المستوفية للشروط.",
      answers: [
        { id: "fatha", text: "الفتحة الظاهرة", next: "R_munada_nasb", eval: { fact: "nasbMark", equals: "fatha" }, hint: "الفتحة علامة النصب الأصلية للمفرد." },
        { id: "yaa", text: "الياء", next: "R_munada_nasb", eval: { fact: "nasbMark", equals: "yaa" }, hint: "الياء علامة نصب المثنى وجمع المذكر السالم." },
        { id: "alif", text: "الألف", next: "R_munada_nasb", eval: { fact: "nasbMark", equals: "alif" }, hint: "الألف علامة نصب الأسماء الخمسة إذا كانت مفردة، مكبرة، مضافة، ومضافة إلى غير ياء المتكلم." },
      ],
    },
    R_munada_built: { id: "R_munada_built", type: "result", text: "منادى مبني على ما يرفع به في محل نصب." },
    R_munada_nasb: { id: "R_munada_nasb", type: "result", text: "منادى منصوب، وتحدد العلامة بحسب صورة الاسم." },
  },
};
