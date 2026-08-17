import type { ExerciseTree } from "../../lib/exercise/model";

export const naibFaelTree: ExerciseTree = {
  startNodeId: "naib_passive",
  nodes: {
    naib_passive: {
      id: "naib_passive",
      type: "question",
      context: "نبدأ من الفعل؛ لأن نائب الفاعل لا يظهر إلا بعد بناء الفعل للمجهول.",
      text: "هل الفعل في الجملة مبني للمجهول؟",
      hint: "في الماضي المبني للمجهول يُضم أوله ويُكسر ما قبل آخره غالبًا: كُتِبَ، كُرِّمَ. وفي المضارع يُضم أوله ويُفتح ما قبل آخره: يُكتَبُ، يُكرَمُ. لا تبحث عن نائب الفاعل قبل التحقق من بناء الفعل للمجهول.",
      answers: [
        { id: "yes", text: "نعم، الفعل مبني للمجهول", next: "naib_role", eval: { fact: "isPassive", equals: true }, hint: "إذا بُني الفعل للمجهول حُذف الفاعل، ونبحث عمّا أُسند إليه الفعل بعد حذفه." },
        { id: "no", text: "لا، الفعل مبني للمعلوم", next: "naib_role", eval: { fact: "isPassive", equals: false }, hint: "إذا كان الفعل مبنيًا للمعلوم فابحث عن الفاعل، لا نائب الفاعل." },
      ],
    },
    naib_role: {
      id: "naib_role",
      type: "question",
      context: "ثبت أن الفعل مبني للمجهول؛ نبحث الآن عمّن أُسند إليه الفعل بعد حذف الفاعل.",
      text: "هل الكلمة المحددة هي الاسم أو الضمير الذي أُسند إليه الفعل بعد حذف الفاعل؟",
      hint: "اسأل: ما الذي كُتب؟ من الذي كُرِّم؟ لا تسأل «من قام بالفعل؟» لأن الفاعل غير مذكور. الاسم الذي صار عمدة بعد الفعل المبني للمجهول هو نائب الفاعل.",
      answers: [
        { id: "yes", text: "نعم، أُسند إليها الفعل بعد حذف الفاعل", next: "naib_form", eval: { fact: "isNaib", equals: true }, hint: "إذن الكلمة نائب فاعل، وحكم نائب الفاعل الرفع. بقي أن نحدد صورة الكلمة لنعرف علامة الرفع أو المحل." },
        { id: "no", text: "لا، ليست هي التي أُسند إليها الفعل", next: "naib_form", eval: { fact: "isNaib", equals: false }, hint: "لا تجعل كل اسم بعد فعل مبني للمجهول نائب فاعل. حدّد الاسم الذي أُسند إليه الفعل وصار عمدة في الجملة." },
      ],
    },
    naib_form: {
      id: "naib_form",
      type: "question",
      context: "بما أن الكلمة نائب فاعل وحكمه الرفع، نحدد أولًا هل الاسم معرب أم مبني قبل تحديد نوعه.",
      text: "هل نائب الفاعل اسم معرب أم اسم مبني؟",
      hint: "الاسم المعرب تتغير علامته بحسب موقعه، أما الاسم المبني ـ ومنه الضمائر ـ فيلزم صورة واحدة ويكون هنا في محل رفع نائب فاعل.",
      answers: [
        { id: "visible", text: "اسم معرب", next: "naib_shape", eval: { fact: "roleKind", equals: "visible" }, hint: "الاسم المعرب تظهر عليه علامة الرفع أو ما ينوب عنها، لذلك نحدد صورته بعد ذلك." },
        { id: "mabni", text: "اسم مبني", next: "naib_mabni_type", eval: { fact: "roleKind", anyOf: ["mabni", "connected"] }, hint: "الضمائر وأسماء الإشارة والأسماء الموصولة من المبنيات؛ لذلك نحدد نوع الاسم المبني في الخطوة التالية." },
      ],
    },
    naib_shape: {
      id: "naib_shape",
      type: "question",
      context: "عرفنا أن نائب الفاعل اسم ظاهر معرب مرفوع؛ نحدد نوع الاسم قبل العلامة.",
      text: "ما نوع الاسم المحدد؟",
      hint: "حدد صورة الاسم: مفرد، مثنى، جمع مذكر سالم، جمع مؤنث سالم، جمع تكسير، أم من الأسماء الخمسة.",
      answers: [
        { id: "singular", text: "مفرد", next: "naib_mark", eval: { fact: "shape", equals: "singular" }, hint: "المفرد يرفع في الأصل بالضمة." },
        { id: "dual", text: "مثنى", next: "naib_mark", eval: { fact: "shape", equals: "dual" }, hint: "المثنى يرفع بالألف." },
        { id: "jms", text: "جمع مذكر سالم", next: "naib_mark", eval: { fact: "shape", equals: "jms" }, hint: "جمع المذكر السالم يرفع بالواو." },
        { id: "jfs", text: "جمع مؤنث سالم", next: "naib_mark", eval: { fact: "shape", equals: "jfs" }, hint: "جمع المؤنث السالم يرفع بالضمة." },
        { id: "jt", text: "جمع تكسير", next: "naib_mark", eval: { fact: "shape", equals: "jt" }, hint: "جمع التكسير يرفع في الأصل بالضمة." },
        { id: "five", text: "من الأسماء الخمسة", next: "naib_mark", eval: { fact: "shape", equals: "five" }, hint: "الأسماء الخمسة ترفع بالواو إذا كانت مفردة، مكبرة، مضافة، ومضافة إلى غير ياء المتكلم؛ ومع «ذو» تكون بمعنى صاحب، ومع «فو» تكون خالية من الميم." },
      ],
    },
    naib_mark: {
      id: "naib_mark",
      type: "question",
      context: "ثبت أن الكلمة نائب فاعل مرفوع وعرفنا نوعها؛ بقيت علامة الرفع.",
      text: "ما علامة رفع نائب الفاعل؟",
      hint: "الضمة للمفرد وجمع التكسير وجمع المؤنث السالم، والألف للمثنى، والواو لجمع المذكر السالم والأسماء الخمسة المستوفية للشروط.",
      answers: [
        { id: "damma", text: "الضمة الظاهرة", next: "R_naib_visible", eval: { fact: "raf3Mark", equals: "damma" }, hint: "الضمة علامة الرفع الأصلية للمفرد وجمع التكسير وجمع المؤنث السالم." },
        { id: "alif", text: "الألف", next: "R_naib_visible", eval: { fact: "raf3Mark", equals: "alif" }, hint: "الألف علامة رفع المثنى." },
        { id: "waw", text: "الواو", next: "R_naib_visible", eval: { fact: "raf3Mark", equals: "waw" }, hint: "الواو علامة رفع جمع المذكر السالم، وعلامة رفع الأسماء الخمسة إذا استوفت شروط الإعراب بالحروف." },
      ],
    },
    naib_mabni_type: {
      id: "naib_mabni_type",
      type: "question",
      context: "عرفنا أن نائب الفاعل اسم مبني؛ نحدد نوعه قبل النتيجة.",
      text: "ما نوع الاسم المبني؟",
      hint: "بعد أن ثبت أن نائب الفاعل اسم مبني، نحدد نوعه من الكلمة نفسها: اسم إشارة، اسم موصول، أم ضمير متصل.",
      answers: [
        { id: "ishara", text: "اسم إشارة", next: "R_naib_mabni", eval: { fact: "mabniType", equals: "ishara" }, hint: "اسم الإشارة مثل «هذا» مبني، فإذا أُسند إليه الفعل المبني للمجهول يكون في محل رفع نائب فاعل." },
        { id: "mawsool", text: "اسم موصول", next: "R_naib_mabni", eval: { fact: "mabniType", equals: "mawsool" }, hint: "الاسم الموصول مبني، وتأتي بعده صلة توضحه؛ فإذا أُسند إليه الفعل المبني للمجهول يكون في محل رفع نائب فاعل." },
        { id: "connected", text: "ضمير متصل", next: "R_naib_connected", eval: { fact: "roleKind", equals: "connected" }, hint: "الضمير المتصل من الأسماء المبنية، مثل واو الجماعة؛ وإذا أُسند إليه الفعل المبني للمجهول يكون في محل رفع نائب فاعل." },
      ],
    },
    R_naib_visible: { id: "R_naib_visible", type: "result", text: "نائب فاعل مرفوع، وتحدد العلامة بحسب صورة الاسم." },
    R_naib_mabni: { id: "R_naib_mabni", type: "result", text: "اسم مبني في محل رفع نائب فاعل." },
    R_naib_connected: { id: "R_naib_connected", type: "result", text: "ضمير متصل مبني في محل رفع نائب فاعل." },
  },
};
