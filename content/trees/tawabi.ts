export type ExerciseTree = { startNodeId: string; nodes: Record<string, any> };

const help = { id: "help", text: "أحتاج تلميحًا", next: "tawabi_relation", isHelp: true, correct: false };

export const tawabiTree: ExerciseTree = {
  startNodeId: "tawabi_entry",
  nodes: {
    tawabi_entry: {
      id: "tawabi_entry",
      type: "question",
      context: "في الجملة قد تكون الكلمة ركنًا مستقلًا، وقد تكون راجعة إلى اسم قبلها تكمله أو تؤكده أو تشاركه أو تفسره. نبدأ من هذا الفرق قبل المصطلح.",
      text: "هل الكلمة المحددة تؤدي وظيفة مستقلة، أم ترجع إلى اسم قبلها؟",
      hint: "اسأل: هل الكلمة تخبر عن شيء أو تبين هيئة وقت الفعل أو تأتي مجرورة بالإضافة؟ أم أنها لا تبدأ حكمًا جديدًا بل تعود إلى اسم قبلها؟ إذا رجعت إلى اسم قبلها فهي مدخل باب التوابع.",
      answers: [
        {
          id: "dependent_on_previous_noun",
          text: "ترجع إلى اسم قبلها وتكمله",
          next: "tawabi_relation",
          correct: true,
          hint: "هذا هو مدخل التوابع: الكلمة مرتبطة باسم سابق، ثم نحدد نوع هذه العلاقة: وصف، عطف، توكيد، أو بدل."
        },
        {
          id: "predicate_or_pillar",
          text: "تؤدي معنى مستقلًا يتمم الجملة",
          next: "tawabi_entry",
          correct: false,
          hint: "هذا يناسب الخبر أو ركنًا أصليًا من الجملة. أما التابع فلا يبدأ معنى مستقلًا؛ بل يرجع إلى اسم قبله ويتبعه في الإعراب."
        },
        {
          id: "state_of_action",
          text: "تبيّن هيئة صاحبها وقت حدوث الفعل",
          next: "tawabi_entry",
          correct: false,
          hint: "هذه علامة الحال، مثل: جاء الطالبُ مسرورًا. الحال يبين الهيئة وقت الفعل، أما التابع فيرتبط باسم قبله ويتبعه في الرفع أو النصب أو الجر."
        },
        {
          id: "idafa_completion",
          text: "تكمل اسمًا قبلها بملكية أو تخصيص وتجرّ بالإضافة",
          next: "tawabi_entry",
          correct: false,
          hint: "هذا أقرب إلى المضاف إليه، مثل: كتابُ الطالبِ. المضاف إليه مجرور بالإضافة، أما التابع فحكمه يتغير بحسب المتبوع: رفعًا أو نصبًا أو جرًّا."
        },
        { ...help, next: "tawabi_entry" }
      ]
    },

    tawabi_relation: {
      id: "tawabi_relation",
      type: "question",
      context: "عرفنا أن الكلمة رجعت إلى اسم قبلها. الآن نحدد العلاقة بالمعنى قبل أن نسميها.",
      text: "ما نوع العلاقة بين الكلمة المحددة والاسم السابق؟",
      hint: "لا تبدأ بالحركة. اسأل: هل وصفت الاسم السابق؟ هل سبقها حرف عطف فأشركها؟ هل أكدت الاسم ونفت الشك؟ أم أوضحت المقصود منه ويمكن أن تحل محله؟",
      answers: [
        {
          id: "description",
          text: "وصفته أو خصصته بصفة فيه",
          next: "tawabi_term",
          eval: { fact: "relationKind", equals: "description" },
          hint: "الوصف يبين صفة في الاسم السابق. وفي النعت الجملة أو شبه الجملة يكون المنعوت غالبًا نكرة، وتوجد رابطة أو تقدير يربط النعت بالمنعوت."
        },
        {
          id: "coordination",
          text: "شاركته في الحكم بواسطة حرف عطف",
          next: "tawabi_term",
          eval: { fact: "relationKind", equals: "coordination" },
          hint: "العطف يحتاج حرفًا يربط بين المعطوف والمعطوف عليه، مثل: الواو، الفاء، ثم، أو. ما بعد الحرف يشارك ما قبله في الحكم الإعرابي."
        },
        {
          id: "emphasis",
          text: "أكدته ولم تضف صفة جديدة",
          next: "tawabi_term",
          eval: { fact: "relationKind", equals: "emphasis" },
          hint: "التوكيد يثبت المعنى أو يرفع الشك. من ألفاظه: نفس، عين، كل، جميع، كلا، كلتا، بشرط أن يعود الضمير على المؤكَّد في التوكيد المعنوي."
        },
        {
          id: "substitution",
          text: "فسرته ويمكن أن يحل محله",
          next: "tawabi_term",
          eval: { fact: "relationKind", equals: "substitution" },
          hint: "اختبار البدل: احذف الاسم السابق وضع الكلمة المحددة مكانه. إذا بقي المعنى مستقيمًا غالبًا، فالعلاقة بدل."
        },
        { ...help, next: "tawabi_relation" }
      ]
    },

    tawabi_term: {
      id: "tawabi_term",
      type: "question",
      context: "بعد فهم العلاقة ننتقل إلى المصطلح. المصطلح نتيجة للمعنى وليس نقطة البداية.",
      text: "ما الاسم النحوي لهذه العلاقة؟",
      hint: "النعت يصف، والمعطوف يأتي بعد حرف عطف، والتوكيد يثبت المعنى أو ينفي الشك، والبدل يفسر المقصود من الاسم السابق.",
      answers: [
        { id: "naat", text: "نعت", next: "tawabi_follow_source", eval: { fact: "tawabiTerm", equals: "naat" }, hint: "النعت تابع يصف منعوته. وقد يكون مفردًا، أو جملة فيها رابط، أو شبه جملة متعلقًا بتقدير مثل: كائن أو موجود." },
        { id: "atf", text: "معطوف", next: "tawabi_follow_source", eval: { fact: "tawabiTerm", equals: "atf" }, hint: "المعطوف تابع يقع بعد حرف عطف ويشارك المعطوف عليه في الحكم والإعراب." },
        { id: "tawkid", text: "توكيد", next: "tawabi_follow_source", eval: { fact: "tawabiTerm", equals: "tawkid" }, hint: "التوكيد لا يضيف صفة جديدة، بل يرسّخ المعنى أو يرفع احتمال المجاز أو النقص." },
        { id: "badal", text: "بدل", next: "tawabi_follow_source", eval: { fact: "tawabiTerm", equals: "badal" }, hint: "البدل يزيل الغموض عن المبدل منه. قد يكون مطابقًا، أو بعضًا من كل، أو اشتمالًا." },
        { ...help, next: "tawabi_term" }
      ]
    },

    tawabi_follow_source: {
      id: "tawabi_follow_source",
      type: "question",
      context: "عرفنا نوع التابع. الآن نحدد مصدر الحكم الإعرابي قبل العلامة.",
      text: "من أين نأخذ حالة الكلمة المحددة: رفعًا أو نصبًا أو جرًّا؟",
      hint: "القاعدة الثابتة: التابع يتبع المتبوع في الحالة الإعرابية، لا في العلامة دائمًا. نعرف إعراب المتبوع أولًا، ثم ننقل الحالة إلى التابع.",
      answers: [
        {
          id: "from_matbu3",
          text: "من الاسم المتبوع قبلها",
          next: "tawabi_case",
          correct: true,
          hint: "صحيح؛ لا نحكم على التابع منفصلًا. إن كان المتبوع مرفوعًا فالفرع مرفوع، وإن كان منصوبًا فالفرع منصوب، وإن كان مجرورًا فالفرع مجرور."
        },
        {
          id: "from_meaning_only",
          text: "من معناها وحده دون ربطها بالمتبوع",
          next: "tawabi_follow_source",
          correct: false,
          hint: "المعنى يحدد نوع التابع، لكنه لا يكفي لتحديد الرفع أو النصب أو الجر. الحالة الإعرابية تؤخذ من المتبوع."
        },
        {
          id: "from_end_only",
          text: "من حركة آخرها مباشرة قبل معرفة المتبوع",
          next: "tawabi_follow_source",
          correct: false,
          hint: "الحركة أو الحرف علامة نهائية، وليست البداية. قد يتبع التابع متبوعه في الرفع لكن تختلف العلامة؛ مثل: الطلابُ المجتهدونَ."
        },
        { ...help, next: "tawabi_follow_source" }
      ]
    },

    tawabi_case: {
      id: "tawabi_case",
      type: "question",
      context: "أعرب المتبوع أولًا، ثم انقل حالته إلى التابع.",
      text: "ما الحالة الإعرابية التي أخذتها الكلمة المحددة من متبوعها؟",
      hint: "ابحث عن المتبوع قبل الكلمة المحددة: أهو مرفوع أم منصوب أم مجرور؟ هذه الحالة نفسها تنتقل إلى التابع.",
      answers: [
        { id: "raf3", text: "الرفع", next: "tawabi_form", eval: { fact: "case", equals: "raf3" }, hint: "إذا كان المتبوع مرفوعًا، فالفرع التابع له مرفوع أيضًا، ولو اختلفت علامة الرفع." },
        { id: "nasb", text: "النصب", next: "tawabi_form", eval: { fact: "case", equals: "nasb" }, hint: "إذا كان المتبوع منصوبًا، فالفرع التابع له منصوب أيضًا، ثم نبحث عن العلامة المناسبة لصورة التابع." },
        { id: "jarr", text: "الجر", next: "tawabi_form", eval: { fact: "case", equals: "jarr" }, hint: "إذا كان المتبوع مجرورًا، فالفرع التابع له مجرور أيضًا، سواء كان نعتًا أو معطوفًا أو توكيدًا أو بدلًا." },
        { ...help, next: "tawabi_case" }
      ]
    },

    tawabi_form: {
      id: "tawabi_form",
      type: "question",
      context: "بعد معرفة الحالة، نحدد صورة التابع. هذه الخطوة تمنع الخلط بين الحالة والعلامة.",
      text: "ما صورة الكلمة أو التركيب المحدد؟",
      hint: "قد يكون التابع اسمًا ظاهرًا معربًا، أو اسمًا مبنيًا في محل إعراب، وقد يأتي النعت خاصة جملة أو شبه جملة في محل رفع أو نصب أو جر.",
      answers: [
        { id: "mu3rab", text: "اسم ظاهر معرب", next: "tawabi_shape", eval: { fact: "roleKind", equals: "mu3rab" }, hint: "الاسم الظاهر المعرب تتغير علامته بحسب موقعه، مثل: المجتهدُ، المجتهدَ، المجتهدِ." },
        { id: "mabni", text: "اسم مبني", next: "R_tawabi_mabni", eval: { fact: "roleKind", equals: "mabni" }, hint: "الاسم المبني يلزم صورة واحدة، فنقول: في محل رفع أو نصب أو جر تابعًا لما قبله." },
        { id: "sentence", text: "جملة", next: "R_tawabi_sentence", eval: { fact: "roleKind", equals: "sentence" }, hint: "النعت الجملة يأتي بعد نكرة، ويحتاج رابطًا يعود على المنعوت؛ مثل: خطيبٍ يرفعُ صوتَهُ." },
        { id: "shibh", text: "شبه جملة", next: "R_tawabi_shibh", eval: { fact: "roleKind", equals: "shibh" }, hint: "النعت شبه الجملة يكون جارًا ومجرورًا أو ظرفًا، ويتعلق بتقدير مثل: كائن أو موجود." },
        { id: "verb", text: "فعل وحده", next: "tawabi_form", correct: false, hint: "إذا كان المحدد جملة فعلية فلا نعرب الفعل وحده تابعًا؛ بل نعرب الجملة كلها في محل إعراب تابع، إذا تحققت شروط النعت الجملة." },
        { ...help, next: "tawabi_form" }
      ]
    },

    tawabi_shape: {
      id: "tawabi_shape",
      type: "question",
      context: "بما أن التابع اسم ظاهر معرب، نحدد صورته لنصل إلى العلامة الصحيحة.",
      text: "ما صورة التابع المعرب؟",
      hint: "انتبه: هنا كلمة مفرد تعني من جهة العدد والصيغة، لا تعني نعتًا مفردًا مقابل النعت الجملة وشبه الجملة. انظر إلى الكلمة نفسها: واحد، اثنان، جمع، أم من الأسماء الخمسة؟",
      answers: [
        { id: "singular", text: "مفرد في العدد", next: "tawabi_mark", eval: { fact: "shape", equals: "singular" }, hint: "المفرد هنا يدل على واحد أو واحدة، ويعرب غالبًا بالحركات الظاهرة." },
        { id: "dual", text: "مثنى", next: "tawabi_mark", eval: { fact: "shape", equals: "dual" }, hint: "المثنى يدل على اثنين أو اثنتين، وعلامته الألف في الرفع والياء في النصب والجر." },
        { id: "jms", text: "جمع مذكر سالم", next: "tawabi_mark", eval: { fact: "shape", equals: "jms" }, hint: "جمع المذكر السالم يدل على جماعة ذكور عاقلة، وعلامته الواو في الرفع والياء في النصب والجر." },
        { id: "jfs", text: "جمع مؤنث سالم", next: "tawabi_mark", eval: { fact: "shape", equals: "jfs" }, hint: "جمع المؤنث السالم ينتهي غالبًا بألف وتاء زائدتين، وينصب بالكسرة نيابة عن الفتحة." },
        { id: "jt", text: "جمع تكسير", next: "tawabi_mark", eval: { fact: "shape", equals: "jt" }, hint: "جمع التكسير تتغير فيه صورة المفرد، مثل: طفل ← أطفال، ويعرب غالبًا بالحركات." },
        { id: "five", text: "من الأسماء الخمسة", next: "tawabi_mark", eval: { fact: "shape", equals: "five" }, hint: "الأسماء الخمسة تعرب بالحروف إذا كانت مفردة، مضافة، ومضافة إلى غير ياء المتكلم." },
        { ...help, next: "tawabi_shape" }
      ]
    },

    tawabi_mark: {
      id: "tawabi_mark",
      type: "question",
      context: "الحالة جاءت من المتبوع، أما العلامة فتأتي من صورة التابع نفسه.",
      text: "ما علامة الإعراب المناسبة للكلمة المحددة؟",
      hint: "لا تقل: التابع يأخذ علامة المتبوع دائمًا. الأدق: يأخذ حالته، ثم نختار العلامة حسب صورته؛ فقد يكون المتبوع مرفوعًا بالضمة والتابع مرفوعًا بالواو.",
      answers: [
        { id: "damma", text: "الضمة", next: "R_tawabi_mu3rab", eval: { fact: "mark", equals: "damma" }, hint: "الضمة تناسب الرفع في المفرد وجمع التكسير وجمع المؤنث السالم." },
        { id: "fatha", text: "الفتحة", next: "R_tawabi_mu3rab", eval: { fact: "mark", equals: "fatha" }, hint: "الفتحة تناسب النصب في المفرد وجمع التكسير." },
        { id: "kasra", text: "الكسرة", next: "R_tawabi_mu3rab", eval: { fact: "mark", equals: "kasra" }, hint: "الكسرة تناسب الجر في المفرد وجمع التكسير، وتنوب عن الفتحة في نصب جمع المؤنث السالم." },
        { id: "alif", text: "الألف", next: "R_tawabi_mu3rab", eval: { fact: "mark", equals: "alif" }, hint: "الألف علامة رفع المثنى، وعلامة نصب الأسماء الخمسة إذا تحققت شروطها." },
        { id: "yaa", text: "الياء", next: "R_tawabi_mu3rab", eval: { fact: "mark", equals: "yaa" }, hint: "الياء علامة نصب وجر المثنى وجمع المذكر السالم، وعلامة جر الأسماء الخمسة." },
        { id: "waw", text: "الواو", next: "R_tawabi_mu3rab", eval: { fact: "mark", equals: "waw" }, hint: "الواو علامة رفع جمع المذكر السالم، وعلامة رفع الأسماء الخمسة إذا تحققت شروطها." },
        { ...help, next: "tawabi_mark" }
      ]
    },

    R_tawabi_mu3rab: { id: "R_tawabi_mu3rab", type: "result", coverage: "tawabi.mu3rab", text: "تابع معرب يتبع متبوعه في الحالة الإعرابية، وتحدد علامته من صورته." },
    R_tawabi_mabni: { id: "R_tawabi_mabni", type: "result", coverage: "tawabi.mabni", text: "اسم مبني في محل إعراب تابع لما قبله." },
    R_tawabi_sentence: { id: "R_tawabi_sentence", type: "result", coverage: "tawabi.sentence", text: "جملة في محل إعراب تابع لما قبلها." },
    R_tawabi_shibh: { id: "R_tawabi_shibh", type: "result", coverage: "tawabi.shibh", text: "شبه جملة في محل إعراب تابع لما قبلها." }
  }
};
