import type { ExerciseTree } from "../../lib/exercise/model";



export const mafoolTree: ExerciseTree = {
  startNodeId: "mafool_context",
  nodes: {
    mafool_context: {
      id: "mafool_context",
      type: "question",
      context: "نبدأ بالفعل الذي تتعلق به الكلمة، لا بشكل بداية الجملة الكبرى.",
      text: "هل يوجد في الجملة فعل تتعلق به الكلمة المحددة؟",
      hint: "قد تبدأ الجملة بفعل، وقد تبدأ باسم ويأتي في خبرها فعل مثل «الطالبُ كتبَ الواجبَ». في الحالتين نبحث عن الفعل الذي وقع على الكلمة.",
      answers: [
        { id: "with-verb", text: "نعم، ترتبط بفعل داخل الجملة", next: "mafool_role", eval: { fact: "contextType", anyOf: ["verbal", "nominal_with_verb"] } },
        { id: "without-verb", text: "لا يوجد فعل تتعلق به", next: "mafool_context", correct: false, hint: "ابحث في الجملة كلها عن الفعل الذي يمكن أن يتعلق بالكلمة، ولا تحكم من أول كلمة فقط." },
      ]
    },

    mafool_role: {
      id: "mafool_role",
      type: "question",
      context: "بما أن الكلمة ترتبط بفعل داخل الجملة، فلنحدد دورها بالنسبة إلى هذا الفعل.",
      text: "ما دور الكلمة المحددة في الجملة؟",
      hint: "اسأل: من الذي فعل؟ فهذا هو الفاعل. ثم اسأل: على من أو على ماذا وقع الفعل؟ فهذا هو المفعول به.",
      answers: [
        {
          id: "verb",
          text: "فعل",
          next: "mafool_role",
          correct: false,
          hint: "الفعل يدل على حدث وزمن، أما المحدد هنا فاسم أو ضمير أو تركيب في معنى اسم وقع عليه الفعل."
        },
        {
          id: "fael",
          text: "فاعل",
          next: "mafool_role",
          correct: false,
          hint: "الفاعل هو ما أُسند إليه الفعل: من قام به أو اتصف به. أما المفعول به فهو ما وقع عليه الفعل."
        },
        {
          id: "mafool",
          text: "مفعول به",
          next: "mafool_hukm",
          eval: { fact: "roleKind", anyOf: ["visible", "mabni", "connected", "masdar"] },
          hint: "صحيح؛ المفعول به هو ما وقع عليه فعل الفاعل."
        },
      ]
    },

    mafool_hukm: {
      id: "mafool_hukm",
      type: "question",
      context: "بعد اكتشاف أنه مفعول به، ننتقل مباشرة إلى الحكم الإعرابي.",
      text: "ما حكم المفعول به؟",
      hint: "المفعول به حكمه النصب، فإن كان اسمًا معربًا ظهرت علامة النصب أو ناب عنها حرف، وإن كان مبنيًا أو مصدرًا مؤولًا قلنا: في محل نصب.",
      answers: [
        { id: "nasb", text: "منصوب أو في محل نصب", next: "mafool_form", correct: true, hint: "صحيح؛ المفعول به يكون منصوبًا، أو في محل نصب إذا كان مبنيًا أو مصدرًا مؤولًا." },
        { id: "raf3", text: "مرفوع", next: "mafool_hukm", correct: false, hint: "الرفع يناسب الفاعل غالبًا؛ لأنه من قام بالفعل. أما المفعول به فقد وقع عليه الفعل، وحكمه النصب أو في محل نصب." },
        { id: "jarr", text: "مجرور", next: "mafool_hukm", correct: false, hint: "الجر يكون بعد حرف جر أو بالإضافة. أما المفعول به فحكمه النصب أو في محل نصب." },
      ]
    },

    mafool_form: {
      id: "mafool_form",
      type: "question",
      context: "ثبت أن المحدد مفعول به. قبل العلامة أو المحل ننظر إلى حدود الجزء المحدد.",
      text: "هل المحدد كلمة واحدة أم مصدر مؤول؟",
      hint: "المصدر المؤول تركيب من حرف مصدري وما بعده، مثل «أن تنجح»، ويؤول بمصدر صريح: «نجاحك». يعمل عمل الاسم، وهنا يكون في محل نصب مفعول به.",
      answers: [
        { id: "word", text: "كلمة واحدة", next: "mafool_word_inflection", eval: { fact: "roleKind", anyOf: ["visible", "mabni", "connected"] }, hint: "المقصود كلمة واحدة في الكتابة، لا مفردًا في العدد." },
        { id: "masdar", text: "مصدر مؤول", next: "R_mafool_masdar", eval: { fact: "roleKind", equals: "masdar" }, hint: "المصدر المؤول مثل «أن تنجح» ويؤول بـ«نجاحك». يعمل عمل الاسم، وهنا هو في محل نصب مفعول به." },
      ]
    },

    mafool_word_inflection: {
      id: "mafool_word_inflection",
      type: "question",
      context: "بما أن المفعول به كلمة واحدة، نختبر الآن: هل تتغير علامة آخره أم تلزم صورته؟",
      text: "هل المفعول به اسم معرب أم اسم مبني؟",
      hint: "المعرب يقبل حركة موقعه وتتغير حركة آخره، فنقول: مرفوع أو منصوب أو مجرور. أما المبني فلا تتغير حركة آخره، فنقول: مبني في محل رفع أو نصب أو جر؛ مثل الضمائر وأسماء الإشارة والأسماء الموصولة.",
      answers: [
        { id: "mu3rab", text: "اسم معرب", next: "mafool_mu3rab_shape", eval: { fact: "roleKind", equals: "visible" }, hint: "الاسم المعرب تظهر عليه علامة نصب أو ما ينوب عنها، لذلك نحدد صورته بعد ذلك." },
        { id: "mabni", text: "اسم مبني", next: "mafool_mabni_type", eval: { fact: "roleKind", anyOf: ["mabni", "connected"] }, hint: "الضمائر وأسماء الإشارة والأسماء الموصولة من المبنيات؛ نحدد نوع المبني في الخطوة التالية." },
      ]
    },

    mafool_mu3rab_shape: {
      id: "mafool_mu3rab_shape",
      type: "question",
      context: "بما أن المفعول به اسم ظاهر معرب، نحدد صورته حتى نعرف علامة نصبه.",
      text: "ما صورة المفعول به المعرب؟",
      hint: "افحص صورة الكلمة: هل تدل على واحد، اثنين، جماعة، أم هي من الأسماء الخمسة؟",
      answers: [
        { id: "singular", text: "مفرد", next: "mafool_nasb_mark", eval: { fact: "shape", equals: "singular" }, hint: "المفرد العادي يدل على واحد أو واحدة وينصب غالبًا بالفتحة، مثل: الواجبَ." },
        { id: "dual", text: "مثنى", next: "mafool_nasb_mark", eval: { fact: "shape", equals: "dual" }, hint: "المثنى يدل على اثنين أو اثنتين، وينصب بالياء مثل: الطالبينِ." },
        { id: "jms", text: "جمع مذكر سالم", next: "mafool_nasb_mark", eval: { fact: "shape", equals: "jms" }, hint: "جمع المذكر السالم يدل على جماعة ذكور عاقلة، وينصب بالياء مثل: المعلمينَ." },
        { id: "jfs", text: "جمع مؤنث سالم", next: "mafool_nasb_mark", eval: { fact: "shape", equals: "jfs" }, hint: "جمع المؤنث السالم ينتهي غالبًا بألف وتاء زائدتين، وينصب بالكسرة نيابة عن الفتحة مثل: الطالباتِ." },
        { id: "jt", text: "جمع تكسير", next: "mafool_nasb_mark", eval: { fact: "shape", equals: "jt" }, hint: "جمع التكسير تتغير فيه صورة المفرد عند الجمع، مثل: قصة ← قصص، وينصب بالفتحة غالبًا." },
        { id: "five", text: "من الأسماء الخمسة", next: "mafool_nasb_mark", eval: { fact: "shape", equals: "five" }, hint: "الأسماء الخمسة هي: أب، أخ، حم، فو، ذو. تعرب بالحروف إذا كانت مفردة، مكبرة، مضافة، ومضافة إلى غير ياء المتكلم." },
      ]
    },

    mafool_nasb_mark: {
      id: "mafool_nasb_mark",
      type: "question",
      context: "بما أن المفعول به منصوب وقد عرفنا صورته، نختار علامة نصبه.",
      text: "ما علامة نصب الكلمة المحددة؟",
      hint: "اختر علامة النصب من صورة الكلمة نفسها: الفتحة للمفرد وجمع التكسير، والياء للمثنى وجمع المذكر السالم، والكسرة لجمع المؤنث السالم، والألف للأسماء الخمسة.",
      answers: [
        { id: "fatha", text: "الفتحة الظاهرة", next: "R_mafool_mu3rab", eval: { fact: "nasbMark", equals: "fatha" }, hint: "الفتحة تناسب المفرد العادي وجمع التكسير إذا ظهرت الحركة على آخر الكلمة." },
        { id: "yaa", text: "الياء", next: "R_mafool_mu3rab", eval: { fact: "nasbMark", equals: "yaa" }, hint: "الياء علامة نصب المثنى وجمع المذكر السالم، مثل: الطالبينِ والمعلمينَ." },
        { id: "kasra", text: "الكسرة نيابةً عن الفتحة", next: "R_mafool_mu3rab", eval: { fact: "nasbMark", equals: "kasra" }, hint: "الكسرة تنوب عن الفتحة في نصب جمع المؤنث السالم، مثل: الطالباتِ." },
        { id: "alif", text: "الألف", next: "R_mafool_mu3rab", eval: { fact: "nasbMark", equals: "alif" }, hint: "الألف علامة نصب الأسماء الخمسة إذا استوفت شروطها: مفردة، مكبرة، مضافة، ومضافة إلى غير ياء المتكلم." },
      ]
    },

    mafool_mabni_type: {
      id: "mafool_mabni_type",
      type: "question",
      context: "بما أن المفعول به اسم مبني، لا نبحث عن فتحة على آخره، بل نحدد نوعه.",
      text: "اختر نوع الاسم المبني:",
      hint: "بعد أن عرفنا أن الكلمة مبنية، نحدد نوع المبني نفسه: اسم إشارة، اسم موصول، أو ضمير متصل. ثم نقول: مبني في محل نصب مفعول به.",
      answers: [
        { id: "ishara", text: "اسم إشارة", next: "R_mafool_mabni", eval: { fact: "mabniType", equals: "ishara" }, hint: "اسم الإشارة مثل: هذا وهذه. إذا وقع عليه الفعل فهو في محل نصب مفعول به." },
        { id: "mawsool", text: "اسم موصول", next: "R_mafool_mabni", eval: { fact: "mabniType", equals: "mawsool" }, hint: "الاسم الموصول مثل: الذي والتي، وتأتي بعده صلة توضحه." },
        { id: "connected", text: "ضمير متصل", next: "R_mafool_connected", eval: { fact: "roleKind", equals: "connected" }, hint: "الضمير المتصل من الأسماء المبنية، مثل الهاء في كتبَهُ، والياء في ساعدَني، ونا في شكرَنا." },
      ]
    },

    R_mafool_mu3rab: { id: "R_mafool_mu3rab", type: "result", coverage: "mafool.mu3rab", text: "مفعول به منصوب." },
    R_mafool_mabni: { id: "R_mafool_mabni", type: "result", coverage: "mafool.mabni", text: "اسم مبني في محل نصب مفعول به." },
    R_mafool_connected: { id: "R_mafool_connected", type: "result", coverage: "mafool.connected", text: "ضمير متصل مبني في محل نصب مفعول به." },
    R_mafool_masdar: { id: "R_mafool_masdar", type: "result", coverage: "mafool.masdar", text: "مصدر مؤول في محل نصب مفعول به." }
  }
};
