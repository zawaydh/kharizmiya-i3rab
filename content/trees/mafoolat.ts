import type { ExerciseTree } from "../../lib/exercise/model";

export const mafoolatTree: ExerciseTree = {
  startNodeId: "mafoolat_maah_check",
  nodes: {
    mafoolat_maah_check: {
      id: "mafoolat_maah_check",
      type: "question",
      context: "نبدأ بأوضح قرينة حرفية قبل الانتقال إلى المعنى.",
      text: "هل سُبقت الكلمة المحددة بواو بمعنى «مع»؟",
      hint: "ابحث قبل الكلمة مباشرة: هل توجد واو يمكن أن نستبدلها بـ«مع»؟ وإذا وُجدت، افحص هل يصح العطف أم أن المعنى يقتضي المصاحبة.",
      answers: [
        {
          id: "maah",
          text: "نعم",
          next: "mafoolat_form",
          eval: { fact: "mafoolType", equals: "maah" },
          hint: "إذا سبقت الكلمة واو بمعنى «مع» ولم يصح حمل ما بعدها على حكم ما قبلها في المعنى، فهي مفعول معه.",
        },
        {
          id: "not-maah",
          text: "لا",
          next: "mafoolat_fih_check",
          eval: { fact: "mafoolType", notEquals: "maah" },
          hint: "إذا لم تسبق الكلمة واو للمعية، أو كانت الواو لا تدل على «مع»، نستبعد المفعول معه وننتقل إلى فحص الزمان والمكان.",
        },
      ],
    },

    mafoolat_fih_check: {
      id: "mafoolat_fih_check",
      type: "question",
      context: "استبعدنا المفعول معه، فنفحص الآن هل الكلمة تحدد زمان الفعل أو مكانه.",
      text: "هل تجيب الكلمة المحددة عن «متى؟» أو «أين؟» بالنسبة إلى الفعل؟",
      hint: "اسأل عن الفعل: متى حدث؟ أو أين حدث؟ إذا كانت الكلمة المحددة هي الجواب وتحدد زمان الفعل أو مكانه، فهي مفعول فيه.",
      answers: [
        {
          id: "fih",
          text: "تجيب عن «متى؟» أو «أين؟» وتحدد زمان الفعل أو مكانه",
          next: "mafoolat_form",
          eval: { fact: "mafoolType", equals: "fih" },
          hint: "إذا كانت الكلمة جوابًا عن «متى؟» أو «أين؟» وحددت زمان وقوع الفعل أو مكانه، فهي مفعول فيه.",
        },
        {
          id: "not-fih",
          text: "لا تحدد زمان الفعل ولا مكانه",
          next: "mafoolat_mutlaq_check",
          eval: { fact: "mafoolType", notEquals: "fih" },
          hint: "إذا لم تصلح الكلمة جوابًا عن «متى؟» أو «أين؟»، نستبعد المفعول فيه وننتقل إلى فحص المصدر.",
        },
      ],
    },

    mafoolat_mutlaq_check: {
      id: "mafoolat_mutlaq_check",
      type: "question",
      context: "استبعدنا المفعول معه والمفعول فيه، فنفحص الآن صلة الكلمة بحدث الفعل نفسه.",
      text: "هل الكلمة المحددة مصدر يدل على الحدث نفسه الذي يدل عليه فعل الجملة؟",
      hint: "خذ فعل الجملة وحوّله إلى اسم يدل على الحدث، مثل: ساهمَ ← المساهمة. ثم قارن هذا المصدر بالكلمة المحددة.",
      answers: [
        {
          id: "mutlaq",
          text: "هي مصدر يدل على حدث الفعل نفسه",
          next: "mafoolat_form",
          eval: { fact: "mafoolType", equals: "mutlaq" },
          hint: "إذا كانت الكلمة مصدرًا يدل على حدث الفعل نفسه، فهي مفعول مطلق، وقد تؤكد الفعل أو تبين نوعه أو عدده.",
        },
        {
          id: "not-mutlaq",
          text: "ليست مصدرًا لحدث الفعل نفسه",
          next: "mafoolat_liajlih_check",
          eval: { fact: "mafoolType", notEquals: "mutlaq" },
          hint: "إذا لم تكن الكلمة مصدرًا لحدث الفعل نفسه، نستبعد المفعول المطلق وننتقل إلى فحص سبب حدوث الفعل.",
        },
      ],
    },

    mafoolat_liajlih_check: {
      id: "mafoolat_liajlih_check",
      type: "question",
      context: "استبعدنا المفعول معه والمفعول فيه والمفعول المطلق، فنفحص الآن سبب حدوث الفعل.",
      text: "هل الكلمة المحددة مصدر قلبي يبين سبب الفعل ويجيب عن «لماذا؟»، ويتحد مع الفعل في الفاعل والزمن؟",
      hint: "اسأل: لماذا حدث الفعل؟ ثم تحقق من ثلاثة أمور: أن الكلمة مصدر قلبي يدل على دافع أو شعور، وأن فاعلها هو فاعل الفعل نفسه، وأن زمن السبب مقارن لزمن الفعل. إذا تحققت هذه الشروط فهي مفعول لأجله.",
      answers: [
        {
          id: "liajlih",
          text: "مصدر قلبي يبين السبب ويتحد مع الفعل في الفاعل والزمن",
          next: "mafoolat_form",
          eval: { fact: "mafoolType", equals: "liajlih" },
          hint: "إذا كانت الكلمة مصدرًا قلبيًا يبين علة الفعل، ويشترك مع الفعل في الفاعل والزمن، فهي مفعول لأجله.",
        },
        {
          id: "not-liajlih",
          text: "لا تتحقق شروط المفعول لأجله",
          next: "mafoolat_bih_check",
          eval: { fact: "mafoolType", notEquals: "liajlih" },
          hint: "إذا لم تكن الكلمة مصدرًا قلبيًا يبين سبب الفعل، أو لم يتحد السبب مع الفعل في الفاعل والزمن، فلا تكون مفعولًا لأجله، وننتقل إلى فحص علاقة الكلمة بالفعل نفسه.",
        },
      ],
    },

    mafoolat_bih_check: {
      id: "mafoolat_bih_check",
      type: "question",
      context: "استبعدنا المفعول معه والمفعول فيه والمفعول المطلق والمفعول لأجله؛ وبما أنها ليست واحدًا منها، نفحص الآن علاقتها بالفعل.",
      text: "هل وقع فعل الفاعل على الكلمة المحددة أو تعدّى إليها؟",
      hint: "اسأل عن الفعل: على من أو على ماذا وقع؟ لا تجعل المفعول به نتيجة تلقائية؛ لا بد أن تثبت علاقته بالفعل.",
      answers: [
        {
          id: "bih",
          text: "وقع عليها الفعل أو تعدّى إليها",
          next: "mafoolat_form",
          eval: { fact: "mafoolType", equals: "bih" },
          hint: "إذا وقع الفعل على الكلمة أو تعدّى إليها، فهي مفعول به.",
        },
        {
          id: "not-bih",
          text: "لم يقع عليها الفعل ولم يتعدَّ إليها",
          next: "R_mafoolat_remaining_accusatives",
          eval: { fact: "mafoolType", notEquals: "bih" },
          hint: "إذا لم يقع الفعل على الكلمة ولم يتعدَّ إليها، فلا نجعلها مفعولًا به. بذلك استبعدنا المفاعيل الخمسة، وننتقل إلى شريحة تجمع أهم المنصوبات الأخرى والقرينة التي تقود إلى كل باب.",
        },
      ],
    },

    mafoolat_form: {
      id: "mafoolat_form",
      type: "question",
      context: "اكتشفنا الموقع النحوي وحكمه. قبل العلامة أو المحل نميز هل المحدد كلمة مفردة أم تركيبًا في تأويل اسم.",
      text: "هل المحدد كلمة مفردة أم تركيب في تأويل اسم؟",
      hint: "إذا أمكن تأويل التركيب بمصدر صريح، مثل «أن تنجح» = «نجاحك»، فهو تركيب في تأويل اسم. أما الاسم أو الضمير فهو كلمة مفردة في هذا المستوى.",
      answers: [
        { id: "word", text: "كلمة مفردة", next: "mafoolat_word_inflection", eval: { fact: "roleKind", anyOf: ["visible", "mabni", "connected"] }, hint: "إذا كان المحدد اسمًا أو ضميرًا مفردًا ننتقل إلى تحديد: معرب أم مبني." },
        { id: "masdar", text: "تركيب في تأويل اسم", next: "mafoolat_masdar_term", eval: { fact: "roleKind", equals: "masdar" }, hint: "إذا أمكن تأويل التركيب بمصدر صريح فقد ثبت أنه تركيب في تأويل اسم؛ نحدد اسمه النحوي في الخطوة التالية." },
      ],
    },

    mafoolat_word_inflection: {
      id: "mafoolat_word_inflection",
      type: "question",
      context: "بما أن المحدد كلمة مفردة، نحدد هل الاسم معرب أم مبني قبل العلامة أو المحل.",
      text: "هل الكلمة اسم معرب أم اسم مبني؟",
      hint: "الاسم المعرب تتغير علامته بحسب موقعه، أما الاسم المبني ـ ومنه الضمائر ـ فيلزم صورة واحدة.",
      answers: [
        { id: "visible", text: "اسم معرب", next: "mafoolat_shape", eval: { fact: "roleKind", equals: "visible" }, hint: "الاسم المعرب تظهر عليه علامة النصب أو علامة تنوب عنها؛ لذلك نحدد صورته بعد ذلك." },
        { id: "mabni", text: "اسم مبني", next: "mafoolat_mabni_type", eval: { fact: "roleKind", anyOf: ["mabni", "connected"] }, hint: "الضمائر وأسماء الإشارة والأسماء الموصولة من المبنيات؛ نحدد نوع المبني في الخطوة التالية." },
      ],
    },

    mafoolat_shape: {
      id: "mafoolat_shape",
      type: "question",
      context: "عرفنا أن الكلمة اسم ظاهر معرب في موقع منصوب؛ نحدد الآن نوع الاسم قبل اختيار العلامة.",
      text: "ما نوع الاسم المحدد؟",
      hint: "حدد صورة الاسم نفسه: مفرد، مثنى، جمع مذكر سالم، جمع مؤنث سالم، جمع تكسير، أم من الأسماء الخمسة.",
      answers: [
        { id: "singular", text: "مفرد", next: "mafoolat_mark", eval: { fact: "shape", equals: "singular" }, hint: "المفرد يدل على واحد، وينصب في الأصل بالفتحة." },
        { id: "dual", text: "مثنى", next: "mafoolat_mark", eval: { fact: "shape", equals: "dual" }, hint: "المثنى يدل على اثنين، وعلامة نصبه الياء." },
        { id: "jms", text: "جمع مذكر سالم", next: "mafoolat_mark", eval: { fact: "shape", equals: "jms" }, hint: "جمع المذكر السالم يدل على أكثر من اثنين مع سلامة بناء المفرد، وينصب بالياء." },
        { id: "jfs", text: "جمع مؤنث سالم", next: "mafoolat_mark", eval: { fact: "shape", equals: "jfs" }, hint: "جمع المؤنث السالم ينتهي غالبًا بـ«ات»، وينصب بالكسرة نيابة عن الفتحة." },
        { id: "jt", text: "جمع تكسير", next: "mafoolat_mark", eval: { fact: "shape", equals: "jt" }, hint: "جمع التكسير يتغير فيه بناء المفرد، وينصب في الأصل بالفتحة." },
        { id: "five", text: "من الأسماء الخمسة", next: "mafoolat_mark", eval: { fact: "shape", equals: "five" }, hint: "الأسماء الخمسة تنصب بالألف إذا كانت مفردة، مكبرة، مضافة، ومضافة إلى غير ياء المتكلم؛ ومع «ذو» تكون بمعنى «صاحب»، ومع «فو» تكون خالية من الميم." },
      ],
    },

    mafoolat_mark: {
      id: "mafoolat_mark",
      type: "question",
      context: "عرفنا الموقع وحكمه النصب، وعرفنا نوع الاسم؛ بقيت علامة النصب.",
      text: "ما علامة النصب المناسبة للكلمة المحددة؟",
      hint: "اربط العلامة بنوع الاسم: الفتحة للمفرد وجمع التكسير في الأصل، والياء للمثنى وجمع المذكر السالم، والكسرة لجمع المؤنث السالم، والألف للأسماء الخمسة.",
      answers: [
        { id: "fatha", text: "الفتحة الظاهرة", next: "R_mafoolat_mu3rab", eval: { fact: "nasbMark", equals: "fatha" }, hint: "الفتحة علامة النصب الأصلية للمفرد وجمع التكسير إذا لم يوجد مانع من ظهورها." },
        { id: "yaa", text: "الياء", next: "R_mafoolat_mu3rab", eval: { fact: "nasbMark", equals: "yaa" }, hint: "الياء علامة نصب المثنى وجمع المذكر السالم." },
        { id: "kasra", text: "الكسرة نيابةً عن الفتحة", next: "R_mafoolat_mu3rab", eval: { fact: "nasbMark", equals: "kasra" }, hint: "الكسرة تنوب عن الفتحة في نصب جمع المؤنث السالم." },
        { id: "alif", text: "الألف", next: "R_mafoolat_mu3rab", eval: { fact: "nasbMark", equals: "alif" }, hint: "الألف علامة نصب الأسماء الخمسة إذا استوفت شروط الإعراب بالحروف: مفردة، مكبرة، مضافة، ومضافة إلى غير ياء المتكلم؛ ومع «ذو» تكون بمعنى «صاحب»، ومع «فو» تكون خالية من الميم." },
      ],
    },

    mafoolat_mabni_type: {
      id: "mafoolat_mabni_type",
      type: "question",
      context: "عرفنا أن الكلمة مبنية في موقع منصوب؛ نحدد نوع المبني قبل صياغة الإعراب النهائي.",
      text: "ما نوع الاسم المبني؟",
      hint: "مثل اسم الإشارة أو الاسم الموصول. المبني لا نبحث له عن فتحة أو ياء، بل نقول: مبني في محل نصب.",
      answers: [
        { id: "ishara", text: "اسم إشارة", next: "R_mafoolat_mabni", eval: { fact: "mabniType", equals: "ishara" }, hint: "اسم الإشارة مثل: هذا، هذه، هؤلاء." },
        { id: "mawsool", text: "اسم موصول", next: "R_mafoolat_mabni", eval: { fact: "mabniType", equals: "mawsool" }, hint: "الاسم الموصول مثل: الذي، التي، الذين." },
        { id: "connected", text: "ضمير متصل", next: "R_mafoolat_connected", eval: { fact: "roleKind", equals: "connected" }, hint: "الضمير المتصل من الأسماء المبنية، وإذا شغل موقع المفعول به يكون في محل نصب مفعول به." },
      ],
    },

    R_mafoolat_mu3rab: { id: "R_mafoolat_mu3rab", type: "result", text: "اسم منصوب؛ وتحدد الوظيفة والعلامة في النتيجة الكاملة." },
    R_mafoolat_mabni: { id: "R_mafoolat_mabni", type: "result", text: "اسم مبني في محل نصب بحسب الوظيفة المكتشفة." },
    R_mafoolat_connected: { id: "R_mafoolat_connected", type: "result", text: "ضمير متصل مبني في محل نصب مفعول به." },
    mafoolat_masdar_term: {
      id: "mafoolat_masdar_term",
      type: "question",
      context: "ثبت أن المحدد تركيب في تأويل اسم؛ بقي أن نسمي هذا النوع قبل الإعراب النهائي.",
      text: "ماذا يسمى هذا التركيب؟",
      hint: "التركيب الذي يؤول بمصدر صريح يسمى مصدرًا مؤولًا، ثم يأخذ محل الموقع النحوي الذي شغله.",
      answers: [
        { id: "source", text: "مصدر مؤول", next: "R_mafoolat_masdar", correct: true },
        { id: "word", text: "اسم ظاهر معرب", next: "mafoolat_masdar_term", correct: false, hint: "المحدد ليس كلمة اسمية مفردة؛ هو تركيب كامل يؤول بمصدر صريح." },
      ],
    },
    R_mafoolat_masdar: { id: "R_mafoolat_masdar", type: "result", text: "مصدر مؤول في محل نصب مفعول به." },
    R_mafoolat_remaining_accusatives: {
      id: "R_mafoolat_remaining_accusatives",
      type: "result",
      text: "لم تكن الكلمة من المفاعيل الخمسة.\nافحص بقية المنصوبات الأساسية: \n• إذا أجابت عن «كيف؟» وبيّنت هيئة صاحبها → حال.\n• إذا كانت اسمًا نكرةً جامدًا يزيل إبهامًا في اسم قبله أو في معنى الجملة → تمييز.\n• إذا كانت هي المبتدأ قبل دخول «إنَّ وأخواتها» → اسم إنَّ وأخواتها.\n• إذا كانت هي الخبر قبل دخول «كان وأخواتها» → خبر كان وأخواتها.\n• إذا سبقتها «لا» النافية للجنس وكانت هي الاسم الذي وقع عليه النفي → اسم لا النافية للجنس؛ ثم يحدد نوعه أهو مبني في محل نصب أم منصوب.\n• إذا جاءت بعد أداة استثناء مثل «إلا» → افحص نوع الاستثناء؛ ففي التام المثبت يكون المستثنى منصوبًا، وفي غيره قد يختلف الحكم.\n• إذا سبقتها أداة نداء → منادى؛ ثم يحدد نوعه أهو منصوب أم مبني في محل نصب.\n• إذا كانت نعتًا أو معطوفًا أو توكيدًا أو بدلًا تابعًا لاسم منصوب → تابع منصوب.\nراجع الباب الذي تنطبق قرينته قبل إصدار الحكم النهائي.",
    },
  },
};
