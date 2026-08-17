import type { ExerciseTree } from "../../lib/exercise/model";


export const cleanKhabarTree: ExerciseTree = {
  startNodeId: "khabar_meaning_gate",
  nodes: {
    khabar_meaning_gate: {
      id: "khabar_meaning_gate",
      type: "question",
      context: "لكي نعرب المحدد في الجملة لا نبدأ بالمصطلح، بل نبدأ من المعنى والدور الذي أداه في الكلام.",
      text: "ما الدور الذي أداه المحدد في الجملة؟",
      hint: "اسأل: ماذا أضاف المحدد إلى معنى الجملة؟ إن قدّم معلومة تتم بها الجملة فهو يسير في مسار الخبر. وإن كان تابعًا يصف اسمًا قبله فهو نعت. وإن كان مع فعل فقد يكون فاعلًا، أما هنا فنبحث أولًا عن دوره في إتمام المعنى.",
      answers: [
        { id: "a", text: "أخبرنا بمعلومة وأتم المعنى", next: "khabar_kind", correct: true },
        { id: "b", text: "نعتت الاسم الذي قبلها أو وصفته", next: "khabar_meaning_gate", correct: false, hint: "النعت تابع يصف الاسم قبله ويطابقه في التعريف والتنكير والتذكير والتأنيث والعدد والحالة الإعرابية. أما الخبر فيعطي معلومة جديدة يتم بها معنى الجملة. مثال: الجندي شجاع؛ كلمة شجاع أخبرت عن الجندي وليست نعتًا له، لأنها لم تطابقه في التعريف والتنكير." },
        { id: "c", text: "كانت فاعلًا له", next: "khabar_meaning_gate", correct: false, hint: "الفاعل يكون مع فعل. إذا لم يكن المحدد فعلًا ولا طلب فاعلًا، فلا نسمي ما قبله فاعلًا له. في باب الخبر نسأل: هل أخبر المحدد عن المبتدأ وأتم المعنى؟" }
      ]
    },

    khabar_kind: {
      id: "khabar_kind",
      type: "question",
      context: "بما أننا عرفنا أن المحدد قدّم المعلومة التي أتمت معنى الجملة، فقد وصلنا إلى وظيفته النحوية: خبر.",
      text: "لنحدد صورة الخبر: هل هو مفرد، أم جملة، أم شبه جملة؟",
      hint: "افحص الخبر في المثال: هل فيه إسناد كامل؟ هل بدأ بحرف جر أو كان ظرفًا؟ إن لم يكن جملة ولا شبه جملة فهو خبر مفرد، ولو جاء معه مضاف إليه أو تابع.",
      answers: [
        { id: "a", text: "خبر مفرد: ليس جملة ولا شبه جملة", next: "khabar_single_start", eval: { fact: "khabarKind", equals: "single" }, hint: "الخبر المفرد هنا لا يعني أنه يدل على واحد فقط، بل يعني أنه ليس جملة كاملة ولا شبه جملة. قد يكون كلمة معربة مثل: شجاع، أو مثنى مثل: حاضران، أو جمعًا مثل: مخلصون، أو اسمًا مبنيًا مثل: هو، هذا، الذي، وقد يكون مصدرًا مؤولًا مثل: أن تنجح بمعنى نجاحك." },
        { id: "b", text: "خبر جملة", next: "khabar_sentence_type", eval: { fact: "khabarKind", equals: "sentence" }, hint: "خبر الجملة يكون جملة كاملة فيها إسناد: جملة فعلية مثل: الطالب يذاكر، أو جملة اسمية مثل: الطالب أخلاقه حسنة. لكن انتبه للمثال نفسه: (الذي) اسم موصول مفرد وليس جملة، و(خلقنا) صلة الموصول. وكذلك (أن تنجح) يحتوي فعلًا مضارعًا، لكنه سبق بحرف مصدري هو (أن)، فيؤول بمصدر: أن تنجح = نجاحك، فلا نعربه هنا خبر جملة بل مصدرًا مؤولًا في محل رفع خبر." },
        { id: "c", text: "خبر شبه جملة", next: "khabar_shibh_type", eval: { fact: "khabarKind", equals: "shibh" }, hint: "خبر شبه الجملة لا يكون كلمة مفردة مثل: هذا أو شجاع، ولا جملة كاملة مثل: يذاكر أو أخلاقه حسنة. يكون جارًا ومجرورًا مثل: في الحقيبة، أو ظرفًا مثل: فوق الشجرة. فإذا كان المحدد اسمًا واحدًا مثل (هذا) فهو ليس شبه جملة، وإذا كان تركيبًا مثل (أن تنجح) فهو مصدر مؤول لا جار ومجرور ولا ظرف." }
      ]
    },

    khabar_single_start: {
      id: "khabar_single_start",
      type: "question",
      context: "ثبت أن الخبر ليس جملة ولا شبه جملة. نميز الآن هل المحدد كلمة مفردة أم تركيبًا في تأويل اسم.",
      text: "هل الخبر كلمة مفردة أم تركيب في تأويل اسم؟",
      hint: "إذا أمكن تأويل التركيب بمصدر صريح مثل «أن تنجح» = «نجاحك»، فهو تركيب في تأويل اسم. أما الاسم المفرد فينتقل بعد ذلك إلى سؤال: معرب أم مبني.",
      answers: [
        { id: "word", text: "كلمة مفردة", next: "khabar_single_inflection", eval: { fact: "nounKind", anyOf: ["mu3rab", "mabni"] }, hint: "إذا كان الخبر كلمة واحدة نحدد بعد ذلك هل هي معربة أم مبنية." },
        { id: "source", text: "تركيب في تأويل اسم", next: "khabar_masdar_discovery", eval: { fact: "nounKind", equals: "masdar" }, hint: "جرّب التأويل بمصدر صريح: «أن تنجح» = «نجاحك». إذا استقام المعنى فهو مصدر مؤول." }
      ]
    },

    khabar_single_inflection: {
      id: "khabar_single_inflection",
      type: "question",
      context: "بما أن الخبر كلمة مفردة، نحدد هل الاسم معرب أم مبني قبل العلامة أو المحل.",
      text: "هل الخبر اسم معرب أم اسم مبني؟",
      hint: "الاسم المعرب تتغير علامته بحسب موقعه، أما الاسم المبني فيلزم صورة واحدة ويكون هنا في محل رفع خبر.",
      answers: [
        { id: "mu3rab", text: "اسم معرب", next: "khabar_single_number", eval: { fact: "nounKind", equals: "mu3rab" }, hint: "الاسم المعرب إذا وقع خبرًا يكون مرفوعًا بعلامة ظاهرة أو مقدرة أو فرعية." },
        { id: "mabni", text: "اسم مبني", next: "khabar_single_built", eval: { fact: "nounKind", equals: "mabni" }, hint: "الاسم المبني يلزم صورة واحدة؛ فإذا وقع خبرًا قلنا: مبني في محل رفع خبر." }
      ]
    },

    khabar_single_built: {
      id: "khabar_single_built",
      type: "question",
      context: "عرفنا أن الخبر اسم مبني. والاسم المبني إذا جاء خبرًا يكون في محل رفع؛ لأن الخبر مرفوع دائمًا.",
      text: "ما نوع الاسم المبني هنا؟",
      hint: "في باب الخبر نكتفي بأشهر الأسماء المبنية التي ترد خبرًا: الضمائر مثل أنا، نحن، هو، هي، أنت؛ وأسماء الإشارة مثل هذا، هذه، ذلك، تلك، هؤلاء؛ والأسماء الموصولة مثل الذي، التي، الذين، اللاتي.",
      answers: [
        { id: "a", text: "ضمير منفصل", next: "R_khabar_single_damir", hint: "الضمير المنفصل كلمة مستقلة تدل على متكلم أو مخاطب أو غائب، مثل: أنا، نحن، أنت، هو، هي، هم.", eval: { fact: "mabniType", equals: "damir" } },
        { id: "b", text: "اسم إشارة", next: "R_khabar_single_ishara", hint: "اسم الإشارة يدل على شيء نشير إليه، مثل: هذا، هذه، هؤلاء، ذلك، تلك.", eval: { fact: "mabniType", equals: "ishara" } },
        { id: "c", text: "اسم موصول", next: "R_khabar_single_mawsool", hint: "الاسم الموصول يحتاج جملة بعده توضحه تسمى صلة الموصول، مثل: الذي خلقنا، التي اجتهدت.", eval: { fact: "mabniType", equals: "mawsool" } }
      ]
    },

    khabar_masdar_discovery: {
      id: "khabar_masdar_discovery",
      type: "question",
      context: "المصدر المؤول تركيب يؤدي وظيفة الاسم. نكتشفه بتحويله إلى مصدر صريح.",
      text: "لو حولنا المصدر المؤول إلى كلمة واحدة، ماذا يصبح غالبًا؟",
      hint: "المصدر المؤول قد يبدو كأنه جملة لأنه يحتوي فعلًا مضارعًا، لكن إذا سبق الفعل بحرف مصدري مثل (أن) فإنه يؤول بمصدر. جرّب السؤال: ما الذي سرني؟ أن تنجح. ثم نؤولها: نجاحك. وكذلك: هدفي أن تنجح، أي هدفي نجاحك.",
      answers: [
        { id: "a", text: "مصدر صريح مثل: نجاحك أو تفوقك", next: "R_khabar_single_masdar", correct: true },
        { id: "b", text: "صفة مفردة مثل: ناجح", next: "khabar_masdar_discovery", correct: false, hint: "المصدر المؤول لا يتحول إلى صفة، بل إلى مصدر صريح: أن تنجح تعني نجاحك." },
        { id: "c", text: "فعل مستقل لا علاقة له بما قبله", next: "khabar_masdar_discovery", correct: false, hint: "نعم، في التركيب فعل مضارع، لكنه مسبوق بحرف مصدري هو (أن)، لذلك لا نعده جملة فعلية مستقلة هنا، بل نؤوله بمصدر: أن تنجح = نجاحك." }
      ]
    },

    khabar_single_number: {
      id: "khabar_single_number",
      type: "question",
      context: "بما أننا عرفنا أن الخبر اسم معرب، نحدد صورته؛ لأن صورة الاسم هي التي ترشدنا إلى علامة رفعه.",
      text: "ما صورة الاسم المعرب هنا؟",
      hint: "اختر الصورة التي تدل عليها الكلمة نفسها: هل تدل على واحد، أم اثنين، أم جمع من نوع محدد؟ المفرد يدل على واحد، والمثنى يدل على اثنين، وجمع المذكر السالم غالبًا ينتهي بواو ونون أو ياء ونون، وجمع المؤنث السالم ينتهي بألف وتاء، وجمع التكسير تتغير فيه صورة المفرد.",
      answers: [
        { id: "a", text: "مفرد", next: "khabar_single_ending", eval: { fact: "number", equals: "singular" }, hint: "المفرد يدل على واحد لا على مثنى ولا جمع. افحص الكلمة المطلوبة نفسها: هل تدل على واحد، أم على اثنين، أم على جمع؟" },
        { id: "b", text: "مثنى", next: "R_khabar_single_dual", eval: { fact: "number", equals: "dual" }, hint: "المثنى يدل على اثنين أو اثنتين، وغالبًا ينتهي بألف ونون في الرفع مثل: الطالبان، الولدان، حاضران، أو بياء ونون في النصب والجر مثل: الطالبين. إذا كانت الكلمة تدل على اثنين فمسارها مثنى." },
        { id: "c", text: "جمع مذكر سالم", next: "R_khabar_single_jms", eval: { fact: "number", equals: "jms" }, hint: "جمع المذكر السالم يدل غالبًا على جماعة ذكور عاقلين، وينتهي في الرفع بواو ونون مثل: المعلمون، مخلصون، وفي النصب والجر بياء ونون مثل: المعلمين، مخلصين." },
        { id: "d", text: "جمع مؤنث سالم", next: "R_khabar_single_jfs", eval: { fact: "number", equals: "jfs" }, hint: "جمع المؤنث السالم يدل غالبًا على جماعة مؤنثة، وينتهي بألف وتاء زائدتين، مثل: الطالبات، المعلمات، مجتهدات. يرفع غالبًا بالضمة." },
        { id: "e", text: "جمع تكسير", next: "khabar_single_ending", eval: { fact: "number", equals: "jt" }, hint: "جمع التكسير يدل على جماعة، لكن صورة المفرد تتغير عند الجمع، مثل: كتاب ← كتب، رجل ← رجال، قلم ← أقلام. إذا لم تجد علامة مثنى أو جمع سالم، فانظر هل تغير بناء المفرد." },
        { id: "f", text: "من الأسماء الخمسة", next: "R_khabar_single_five", eval: { fact: "number", equals: "five" }, hint: "الأسماء الخمسة تعرب بالحروف إذا تحققت شروطها: مفردة، مكبرة، مضافة، وغير مضافة إلى ياء المتكلم." }
      ]
    },

    khabar_single_ending: {
      id: "khabar_single_ending",
      type: "question",
      context: "بقي أن نعرف هل تظهر الضمة على آخر الاسم أم تقدر عليه.",
      text: "ما حالة آخر الاسم؟",
      hint: "افحص آخر الاسم. حروف العلة هي: الألف والواو والياء. الصحيح الآخر لا ينتهي بحرف علة أصلي، والمقصور آخره ألف لازمة فتقدر عليه الضمة للتعذر، والمنقوص آخره ياء لازمة مكسور ما قبلها فتقدر عليه الضمة للثقل.",
      answers: [
        { id: "a", text: "صحيح الآخر", next: "R_khabar_single_visible", eval: { fact: "ending", equals: "sahih" } },
        { id: "b", text: "معتل الآخر", next: "R_khabar_single_estimated", eval: { fact: "ending", equals: "moatal" } }
      ]
    },

    khabar_sentence_type: {
      id: "khabar_sentence_type",
      type: "question",
      context: "بما أننا عرفنا أن الخبر جاء جملة، فالجملة كلها في محل رفع خبر، لا كلمة واحدة منها فقط.",
      text: "هل بدأت جملة الخبر باسم أم بفعل؟",
      hint: "إذا بدأت جملة الخبر بفعل فهي جملة فعلية. وإذا بدأت باسم فهي جملة اسمية. مثال الجملة الاسمية: الطالب أخلاقه حسنة؛ أخلاقه مبتدأ ثانٍ، والهاء ضمير متصل مبني في محل جر مضاف إليه يعود على الطالب، وحسنة خبر المبتدأ الثاني، والجملة كلها خبر للمبتدأ الأول.",
      answers: [
        { id: "a", text: "جملة فعلية", next: "R_khabar_verbal_sentence", eval: { fact: "sentenceType", equals: "verbal" } },
        { id: "b", text: "جملة اسمية", next: "R_khabar_nominal_sentence", eval: { fact: "sentenceType", equals: "nominal" } }
      ]
    },

    khabar_shibh_type: {
      id: "khabar_shibh_type",
      type: "question",
      context: "بما أننا عرفنا أن الخبر شبه جملة، نحدد نوعه: جار ومجرور أو ظرف.",
      text: "ما نوع شبه الجملة؟",
      hint: "شبه الجملة إما جار ومجرور مثل: في الحقيبة، أو ظرف مثل: فوق الشجرة. ليست جملة اسمية لأنها لا تتكون من مبتدأ وخبر، وليست جملة فعلية لأنها لا تبدأ بفعل.",
      answers: [
        { id: "a", text: "جار ومجرور", next: "khabar_shibh_position_jar", eval: { fact: "shibhType", equals: "jar" } },
        { id: "b", text: "ظرف", next: "khabar_shibh_position_zarf", eval: { fact: "shibhType", equals: "zarf" } }
      ]
    },

    khabar_shibh_position_jar: {
      id: "khabar_shibh_position_jar",
      type: "question",
      context: "بعد أن عرفنا أن الخبر شبه جملة من جار ومجرور، ننظر الآن إلى موقعه في الجملة لنقرر هل جاء في موضعه المعتاد أم تقدم على اسم نكرة.",
      text: "هل جاء بعد هذا الجار والمجرور اسم نكرة مثل: في البيت رجل؟",
      hint: "ابدأ بالمعنى: (في البيت) أخبرنا بمكان وجود شيء. ثم انظر إلى الاسم الذي جاء بعده: (رجل) اسم نكرة. في العربية إذا تقدم شبه الجملة وجاء بعده اسم نكرة، نعرب شبه الجملة خبرًا مقدمًا، والاسم النكرة مبتدأ مؤخرًا. لو جاء بعد المبتدأ لوجدنا اسمًا في أول الجملة ثم الخبر بعده. أما هنا فقد بدأ الكلام بشبه الجملة (في البيت)، ثم جاءت النكرة (رجل) بعدها.",
      answers: [
        { id: "a", text: "نعم، تقدّم على مبتدأ نكرة", next: "R_khabar_jar_advanced", eval: { fact: "shibhPosition", equals: "advanced" } },
        { id: "b", text: "لا، جاء بعد المبتدأ", next: "R_khabar_jar", eval: { fact: "shibhPosition", equals: "normal" } }
      ]
    },

    khabar_shibh_position_zarf: {
      id: "khabar_shibh_position_zarf",
      type: "question",
      context: "بعد أن عرفنا أن الخبر شبه جملة ظرفية، ننظر الآن إلى موقعه في الجملة لنقرر هل جاء في موضعه المعتاد أم تقدم على اسم نكرة.",
      text: "هل جاء بعد هذا الظرف اسم نكرة مثل: عندنا ضيف؟",
      hint: "ابدأ بالمعنى: (عندنا) أخبرنا بوجود ضيف عندنا. ثم انظر إلى الاسم الذي جاء بعده: (ضيف) اسم نكرة. إذا تقدم الظرف وجاء بعده اسم نكرة، نعرب الظرف خبرًا مقدمًا، والاسم النكرة مبتدأ مؤخرًا. أما في: العصفور فوق الشجرة، فالخبر جاء بعد المبتدأ.",
      answers: [
        { id: "a", text: "نعم، تقدّم على مبتدأ نكرة", next: "R_khabar_zarf_advanced", eval: { fact: "shibhPosition", equals: "advanced" } },
        { id: "b", text: "لا، جاء بعد المبتدأ", next: "R_khabar_zarf", eval: { fact: "shibhPosition", equals: "normal" } }
      ]
    },

    R_khabar_single_visible: { id: "R_khabar_single_visible", type: "result", coverage: "khabar_single.visible", text: "خبر مرفوع وعلامة رفعه الضمة الظاهرة على آخره." },
    R_khabar_single_estimated: { id: "R_khabar_single_estimated", type: "result", coverage: "khabar_single.estimated", text: "خبر مرفوع وعلامة رفعه الضمة المقدرة على الألف منع من ظهورها التعذر." },
    R_khabar_single_dual: { id: "R_khabar_single_dual", type: "result", coverage: "khabar_single.dual", text: "خبر مرفوع وعلامة رفعه الألف لأنه مثنى." },
    R_khabar_single_jms: { id: "R_khabar_single_jms", type: "result", coverage: "khabar_single.jms", text: "خبر مرفوع وعلامة رفعه الواو لأنه جمع مذكر سالم." },
    R_khabar_single_jfs: { id: "R_khabar_single_jfs", type: "result", coverage: "khabar_single.jfs", text: "خبر مرفوع وعلامة رفعه الضمة الظاهرة على آخره لأنه جمع مؤنث سالم." },
    R_khabar_single_five: { id: "R_khabar_single_five", type: "result", coverage: "khabar_single.five", text: "خبر مرفوع وعلامة رفعه الواو لأنه من الأسماء الخمسة، وقد استوفى شروط إعرابها بالحروف: مفرد، مكبر، مضاف، ومضاف إلى غير ياء المتكلم." },
    R_khabar_single_damir: { id: "R_khabar_single_damir", type: "result", coverage: "khabar_single.damir", text: "ضمير منفصل مبني في محل رفع خبر." },
    R_khabar_single_ishara: { id: "R_khabar_single_ishara", type: "result", coverage: "khabar_single.ishara", text: "اسم إشارة مبني في محل رفع خبر." },
    R_khabar_single_mawsool: { id: "R_khabar_single_mawsool", type: "result", coverage: "khabar_single.mawsool", text: "اسم موصول مبني في محل رفع خبر. والجملة بعده صلة موصول لا محل لها من الإعراب." },
    R_khabar_single_masdar: { id: "R_khabar_single_masdar", type: "result", coverage: "khabar_single.masdar", text: "مصدر مؤول في محل رفع خبر؛ لأنه أدى وظيفة الاسم وأخبر عن المبتدأ، مثل: هدفي أن تنجح، أي هدفي نجاحك." },
    R_khabar_verbal_sentence: { id: "R_khabar_verbal_sentence", type: "result", coverage: "khabar.verbal_sentence", text: "جملة فعلية في محل رفع خبر. الجملة كلها هي الخبر، لا الفعل وحده." },
    R_khabar_nominal_sentence: { id: "R_khabar_nominal_sentence", type: "result", coverage: "khabar.nominal_sentence", text: "جملة اسمية في محل رفع خبر. داخلها مبتدأ ثانٍ وخبره؛ مثل: المدير أبوه حاضر. أبوه: مبتدأ ثانٍ، والهاء ضمير متصل مبني في محل جر مضاف إليه يعود على المبتدأ الأول، وحاضر: خبر المبتدأ الثاني، والجملة الاسمية كلها في محل رفع خبر للمبتدأ الأول." },
    R_khabar_jar: { id: "R_khabar_jar", type: "result", coverage: "khabar.jar", text: "شبه جملة من الجار والمجرور في محل رفع خبر." },
    R_khabar_zarf: { id: "R_khabar_zarf", type: "result", coverage: "khabar.zarf", text: "شبه جملة ظرفية في محل رفع خبر." },
    R_khabar_jar_advanced: { id: "R_khabar_jar_advanced", type: "result", coverage: "khabar.jar_advanced", text: "شبه جملة من الجار والمجرور في محل رفع خبر مقدم، والاسم النكرة بعدها مبتدأ مؤخر مرفوع. مثل: في البيت: شبه جملة في محل رفع خبر مقدم، رجل: مبتدأ مؤخر مرفوع." },
    R_khabar_zarf_advanced: { id: "R_khabar_zarf_advanced", type: "result", coverage: "khabar.zarf_advanced", text: "شبه جملة ظرفية في محل رفع خبر مقدم، والاسم النكرة بعدها مبتدأ مؤخر مرفوع. مثل: عندنا: شبه جملة ظرفية في محل رفع خبر مقدم، ضيف: مبتدأ مؤخر مرفوع." }
  }
};
