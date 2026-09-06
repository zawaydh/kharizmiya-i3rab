import type { ExerciseTree } from "../../lib/exercise/model";

export const munadaTree: ExerciseTree = {
  startNodeId: "munada_tool",
  nodes: {
    munada_tool: {
      id: "munada_tool",
      type: "question",
      context: "نبدأ من أداة النداء، ثم نكتشف خصائص المنادى من المثال قبل أن نسمي نوعه.",
      text: "هل سبقت الكلمة المحددة أداة نداء، وهي المقصودة بالنداء؟",
      hint: "ابحث عن أداة نداء مثل «يا»، ثم اسأل: من الذي أناديه في الجملة؟ إذا كانت الكلمة المحددة هي المقصودة بالنداء فقد ثبت أنها منادى.",
      answers: [
        { id: "yes", text: "نعم، سبقتها أداة نداء وهي المقصودة", next: "munada_kind", eval: { fact: "isMunada", equals: true } },
        { id: "no", text: "لا، ليست هي المقصودة بالنداء", next: "munada_tool", eval: { fact: "isMunada", equals: false }, hint: "لا يكفي وجود «يا» في الجملة؛ حدّد الاسم الذي وقع عليه النداء نفسه." },
      ],
    },
    munada_kind: {
      id: "munada_kind",
      type: "question",
      context: "ثبت أن المحدد منادى. بدل حفظ أسماء الأنواع أولًا، ننظر الآن إلى الخاصية الظاهرة في المثال.",
      text: "أي وصف يطابق المنادى في هذا المثال؟",
      hint: "هل المنادى اسم علم معيّن مثل «محمد»، أم نكرة مثل «طالب»، أم اتصل به ما بعده ليتمم معناه مثل «طالبَ العلم» أو «طالبًا للعلم»؟",
      answers: [
        { id: "alam", text: "اسم علم معيّن بذاته", next: "munada_alam_term", eval: { fact: "munadaKind", equals: "alam" } },
        { id: "nakira", text: "اسم نكرة لم يتصل به متمم", next: "munada_nakira_intent", eval: { fact: "munadaKind", anyOf: ["nakira_maqsuda", "nakira_ghayr_maqsuda"] } },
        { id: "completed", text: "اتصل به ما بعده ليتمم معناه", next: "munada_completion_kind", eval: { fact: "munadaKind", anyOf: ["mudaf", "shibh_mudaf"] } },
      ],
    },
    munada_alam_term: {
      id: "munada_alam_term",
      type: "question",
      context: "عرفنا أن المنادى اسم علم معيّن بذاته، فنربط الخاصية بالمصطلح النحوي.",
      text: "ما اسم هذا النوع من المنادى؟",
      hint: "إذا كان المنادى اسم علم مفردًا مقصودًا بذاته، مثل «يا محمدُ»، يسمى منادى مفرد علم.",
      answers: [
        { id: "alam", text: "مفرد علم", next: "R_munada_built", correct: true },
        { id: "mudaf", text: "مضاف", next: "munada_alam_term", correct: false, hint: "المضاف يحتاج اسمًا بعده يجر بالإضافة، مثل «يا طالبَ العلم». أما اسم العلم هنا فمستقل." },
        { id: "shibh", text: "شبيه بالمضاف", next: "munada_alam_term", correct: false, hint: "الشبيه بالمضاف يتعلق به ما يتمم معناه، أما اسم العلم هنا فمقصود بذاته." },
      ],
    },
    munada_nakira_intent: {
      id: "munada_nakira_intent",
      type: "question",
      context: "عرفنا أن المنادى نكرة. الآن نميّز هل يقصد المتكلم فردًا معيّنًا أم أي فرد من الجنس.",
      text: "هل يقصد المتكلم شخصًا معيّنًا حاضرًا بهذا النداء؟",
      hint: "في «يا طالبُ، افتح كتابك» قد يكون المتكلم يخاطب طالبًا بعينه أمامه. أما «يا غافلًا، انتبه» فيمكن أن يوجَّه إلى أي غافل من غير تعيين.",
      answers: [
        { id: "yes", text: "نعم، يقصد شخصًا معيّنًا", next: "munada_maqsuda_term", eval: { fact: "munadaKind", equals: "nakira_maqsuda" } },
        { id: "no", text: "لا، النداء لأي فرد من الجنس", next: "munada_ghayr_term", eval: { fact: "munadaKind", equals: "nakira_ghayr_maqsuda" } },
      ],
    },
    munada_maqsuda_term: {
      id: "munada_maqsuda_term",
      type: "question",
      context: "ثبت أن المنادى نكرة، لكن المتكلم قصد بها شخصًا معيّنًا.",
      text: "ما اسم هذا النوع؟",
      hint: "النكرة التي يقصد بها فرد معيّن تسمى نكرة مقصودة، وتبنى على ما ترفع به في محل نصب.",
      answers: [
        { id: "correct", text: "نكرة مقصودة", next: "R_munada_built", correct: true },
        { id: "wrong", text: "نكرة غير مقصودة", next: "munada_maqsuda_term", correct: false, hint: "غير المقصودة لا يعيّن المتكلم فردًا بعينه، أما هنا فقد ثبت أنه يقصد شخصًا معيّنًا." },
      ],
    },
    munada_ghayr_term: {
      id: "munada_ghayr_term",
      type: "question",
      context: "ثبت أن المنادى نكرة ولم يقصد المتكلم فردًا معيّنًا.",
      text: "ما اسم هذا النوع؟",
      hint: "النكرة التي يوجَّه النداء فيها إلى أي فرد من الجنس تسمى نكرة غير مقصودة، وحكمها النصب.",
      answers: [
        { id: "correct", text: "نكرة غير مقصودة", next: "munada_shape", correct: true },
        { id: "wrong", text: "نكرة مقصودة", next: "munada_ghayr_term", correct: false, hint: "المقصودة تعني أن المتكلم عيّن شخصًا بعينه، وهذا لم يحدث في المثال." },
      ],
    },
    munada_completion_kind: {
      id: "munada_completion_kind",
      type: "question",
      context: "عرفنا أن معنى المنادى اكتمل بما بعده. نحدد الآن نوع هذه الصلة قبل تسمية نوع المنادى.",
      text: "كيف تمّم ما بعد المنادى معناه؟",
      hint: "اسأل: هل ما بعد المنادى اسم مجرور بالإضافة مثل «طالبَ العلمِ»، أم جار ومجرور أو معمول يتمم المعنى من غير إضافة صريحة مثل «طالبًا للعلمِ»؟",
      answers: [
        { id: "mudaf", text: "جاء بعده مضاف إليه مجرور", next: "munada_mudaf_term", eval: { fact: "munadaKind", equals: "mudaf" } },
        { id: "shibh", text: "تعلّق به ما يتمم معناه من غير إضافة صريحة", next: "munada_shibh_term", eval: { fact: "munadaKind", equals: "shibh_mudaf" } },
      ],
    },
    munada_mudaf_term: {
      id: "munada_mudaf_term",
      type: "question",
      context: "ثبت أن المنادى أضيف إلى اسم بعده يجر بالإضافة.",
      text: "ما اسم هذا النوع من المنادى؟",
      hint: "إذا أضيف المنادى إلى اسم بعده، مثل «يا طالبَ العلمِ»، فهو منادى مضاف، وحكمه النصب.",
      answers: [
        { id: "correct", text: "منادى مضاف", next: "munada_shape", correct: true },
        { id: "wrong", text: "منادى شبيه بالمضاف", next: "munada_mudaf_term", correct: false, hint: "الشبيه بالمضاف لا يكون بعده مضاف إليه صريح، أما هنا فقد ثبت وجود الإضافة." },
      ],
    },
    munada_shibh_term: {
      id: "munada_shibh_term",
      type: "question",
      context: "ثبت أن بالمنادى ما يتمم معناه، لكنه ليس مضافًا إلى اسم مجرور بالإضافة.",
      text: "ما اسم هذا النوع من المنادى؟",
      hint: "إذا تعلق بالمنادى جار ومجرور أو معمول يتمم معناه من غير إضافة صريحة، مثل «يا طالبًا للعلمِ»، فهو شبيه بالمضاف، وحكمه النصب.",
      answers: [
        { id: "correct", text: "منادى شبيه بالمضاف", next: "munada_shape", correct: true },
        { id: "wrong", text: "منادى مضاف", next: "munada_shibh_term", correct: false, hint: "المضاف يحتاج مضافًا إليه مجرورًا بعده، وهذا غير موجود في هذا المثال." },
      ],
    },
    munada_shape: {
      id: "munada_shape",
      type: "question",
      context: "ثبت أن هذا النوع من المنادى معرب منصوب. بقي أن نحدد صورة الاسم حتى نختار علامة النصب.",
      text: "ما صورة الاسم المنادى؟",
      hint: "افحص الاسم نفسه: مفرد، مثنى، جمع مذكر سالم، جمع مؤنث سالم، جمع تكسير، أم من الأسماء الخمسة؟",
      answers: [
        { id: "singular", text: "مفرد", next: "munada_mark", eval: { fact: "shape", equals: "singular" } },
        { id: "dual", text: "مثنى", next: "munada_mark", eval: { fact: "shape", equals: "dual" } },
        { id: "jms", text: "جمع مذكر سالم", next: "munada_mark", eval: { fact: "shape", equals: "jms" } },
        { id: "jfs", text: "جمع مؤنث سالم", next: "munada_mark", eval: { fact: "shape", equals: "jfs" } },
        { id: "jt", text: "جمع تكسير", next: "munada_mark", eval: { fact: "shape", equals: "jt" } },
        { id: "five", text: "من الأسماء الخمسة", next: "munada_mark", eval: { fact: "shape", equals: "five" } },
      ],
    },
    munada_mark: {
      id: "munada_mark",
      type: "question",
      context: "ثبت أن المنادى منصوب، وعرفنا صورة الاسم؛ بقيت علامة النصب التي تناسب هذه الصورة.",
      text: "ما علامة نصب المنادى هنا؟",
      hint: "الفتحة للمفرد وجمع التكسير، والياء للمثنى وجمع المذكر السالم، والكسرة لجمع المؤنث السالم، والألف للأسماء الخمسة المستوفية لشروطها.",
      answers: [
        { id: "fatha", text: "الفتحة الظاهرة", next: "R_munada_nasb", eval: { fact: "nasbMark", equals: "fatha" } },
        { id: "yaa", text: "الياء", next: "R_munada_nasb", eval: { fact: "nasbMark", equals: "yaa" } },
        { id: "kasra", text: "الكسرة نيابةً عن الفتحة", next: "R_munada_nasb", eval: { fact: "nasbMark", equals: "kasra" } },
        { id: "alif", text: "الألف", next: "R_munada_nasb", eval: { fact: "nasbMark", equals: "alif" } },
      ],
    },
    R_munada_built: { id: "R_munada_built", type: "result", text: "منادى مبني على ما يرفع به في محل نصب." },
    R_munada_nasb: { id: "R_munada_nasb", type: "result", text: "منادى منصوب، وتحدد علامة نصبه بحسب صورة الاسم." },
  },
};
