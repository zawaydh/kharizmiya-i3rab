// content/trees/nominal_mubtada.ts
export type ExerciseTree = {
  startNodeId: string;
  nodes: Record<string, any>;
};

export const nominalMubtadaTree: ExerciseTree = {
  startNodeId: "m0_wordType",
  nodes: {
    // 0) نوع الكلمة
    m0_wordType: {
      id: "m0_wordType",
      type: "question",
      text: "أول خطوة: نحدد نوع الكلمة الهدف. هل هي:",
      teaching_note:
        "نبدأ دائمًا بتحديد نوع الكلمة؛ فإذا كانت اسمًا يمكن أن تكون مبتدأً، أما الفعل والحرف فليسَا من مسار المبتدأ هنا.",
      hint:
        "الاسم يقبل (ال) والتنوين وحرف الجر. الفعل يقبل قد/السين/سوف/تاء التأنيث. الحرف لا يقبل علامات الاسم ولا الفعل.",
      answers: [
        { id: "a", text: "اسم", next: "m1_nounKind", eval: { fact: "wordType", equals: "noun" } },
        { id: "b", text: "فعل", next: "m_notPath", eval: { fact: "wordType", equals: "verb" } },
        { id: "c", text: "حرف", next: "m_notPath", eval: { fact: "wordType", equals: "harf" } },
      ],
    },

    m_notPath: {
      id: "m_notPath",
      type: "result",
      text: `توقف المسار هنا: الكلمة الهدف ليست مبتدأ في هذا المثال.`,
      teaching_note:
        "توقف المسار هنا لأن الكلمة ليست اسمًا؛ والمبتدأ لا يكون فعلًا ولا حرفًا.",
    },

    // 1) نوع الاسم: معرب/مبني/مصدر مؤول
    m1_nounKind: {
      id: "m1_nounKind",
      type: "question",
      text: "الآن: هل الاسم:",
      teaching_note:
        "عرفنا أنها اسم، والآن نحدد: هل هو معرب أم مبني أم مصدر مؤول، لأن ذلك يؤثر في طريقة الإعراب وعلامته.",
      hint:
        "الاسم المعرب تتغير حركته/علامته حسب موقعه. الاسم المبني يلزم آخره حالة واحدة. المصدر المؤول يكون غالبًا: (أنْ + فعل مضارع) ويعامل معاملة الاسم.",
      answers: [
        { id: "a", text: "اسم معرب", next: "m2_number", eval: { fact: "nounKind", equals: "mu3rab" } },
        { id: "b", text: "اسم مبني", next: "m2_mabniType", eval: { fact: "nounKind", equals: "mabni" } },
        { id: "c", text: "مصدر مؤول", next: "R_source_mubtada", eval: { fact: "nounKind", equals: "masdar" } },
      ],
    },

    // 2) إذا كان معربًا: هل هو مفرد/مثنى/جمع
    m2_number: {
      id: "m2_number",
      type: "question",
      text: "إذا كان اسمًا معربًا: هل هو:",
      teaching_note:
        "بعد أن تبين أنه اسم معرب، نحدد عدده لأن علامة الرفع تختلف بين المفرد والمثنى والجمع.",
      hint:
        "المثنى علامة رفعه الألف. الجمع له أنواع: مذكر سالم/مؤنث سالم/تكسير.",
      answers: [
        { id: "a", text: "مفرد", next: "m3_singularKind", eval: { fact: "number", equals: "singular" } },
        { id: "b", text: "مثنى", next: "R_mubtada_muthanna", eval: { fact: "number", equals: "dual" } },
        { id: "c", text: "جمع", next: "m3_pluralType", eval: { fact: "number", equals: "plural" } },
      ],
    },

    // 3) إذا كان مفردًا: صحيح/معتل/أسماء خمسة
    m3_singularKind: {
      id: "m3_singularKind",
      type: "question",
      text: "إذا كان مفردًا: هل هو:",
      teaching_note:
        "الآن نركز على آخر الكلمة؛ لأنه هو الذي يحدد هل الضمة ظاهرة أم مقدرة أو تتحول إلى علامة أخرى.",
      hint:
        "حروف العلة: الألف والواو والياء. الأسماء الخمسة: أبو/أخو/حمو/ذو/فو (بشروط).",
      answers: [
        { id: "a", text: "صحيح الآخر", next: "R_mubtada_sahih", eval: { fact: "ending", equals: "sahih" } },
        { id: "b", text: "معتل الآخر", next: "R_mubtada_moatal", eval: { fact: "ending", equals: "moatal" } },
        { id: "c", text: "من الأسماء الخمسة", next: "R_mubtada_5", eval: { fact: "ending", equals: "five" } },
      ],
    },

    // 3) إذا كان جمعًا: نوع الجمع
    m3_pluralType: {
      id: "m3_pluralType",
      type: "question",
      text: "إذا كان جمعًا: هل هو:",
      teaching_note:
        "نوع الجمع مهم جدًا، لأنه يحدد علامة الرفع: الواو في جمع المذكر السالم، أو الضمة في غيره هنا.",
      hint:
        "جمع المذكر السالم يرفع بالواو. جمع المؤنث السالم يرفع بالضمة. جمع التكسير يرفع بالضمة.",
      answers: [
        { id: "a", text: "جمع مذكر سالم", next: "R_mubtada_jms", eval: { fact: "pluralType", equals: "jms" } },
        { id: "b", text: "جمع مؤنث سالم", next: "R_mubtada_jfs", eval: { fact: "pluralType", equals: "jfs" } },
        { id: "c", text: "جمع تكسير", next: "R_mubtada_jt", eval: { fact: "pluralType", equals: "jt" } },
      ],
    },

    // 2) إذا كان مبنيًا: نوع المبني
    m2_mabniType: {
      id: "m2_mabniType",
      type: "question",
      text: "إذا كان اسمًا مبنيًا: هل هو:",
      teaching_note:
        "الأسماء المبنية لا تتغير أواخرها، لذلك نحدد نوعها لنعرف كيف نعربها: ضميرًا أو اسم إشارة أو غير ذلك، وكلها هنا في محل رفع مبتدأ.",
      hint:
        "المبنيات هنا: الضمائر، أسماء الإشارة، الأسماء الموصولة، أسماء الاستفهام، أسماء الشرط، (كم الخبرية).",
      answers: [
        { id: "a", text: "ضمير منفصل", next: "R_mubtada_damir", eval: { fact: "mabniType", equals: "damir" } },
        { id: "b", text: "اسم إشارة", next: "R_mubtada_ishara", eval: { fact: "mabniType", equals: "ishara" } },
        { id: "c", text: "اسم موصول", next: "R_mubtada_mawsool", eval: { fact: "mabniType", equals: "mawsool" } },
        { id: "d", text: "اسم استفهام", next: "R_mubtada_istifham", eval: { fact: "mabniType", equals: "istifham" } },
        { id: "e", text: "اسم شرط", next: "R_mubtada_shart", eval: { fact: "mabniType", equals: "shart" } },
        { id: "f", text: "كم الخبرية", next: "R_mubtada_kam_khabariyya", eval: { fact: "mabniType", equals: "kam" } },
      ],
    },

    R_mubtada_sahih: {
      id: "R_mubtada_sahih",
      type: "result",
      teaching_note:
        "الآن اكتمل المسار: الكلمة اسم معرب مفرد صحيح الآخر، لذلك أُعربت مبتدأً مرفوعًا وعلامة رفعه الضمة الظاهرة.",
      text: `مبتدأ مرفوع وعلامة رفعه الضمة الظاهرة على آخره.`,
    },

    R_mubtada_moatal: {
      id: "R_mubtada_moatal",
      type: "result",
      teaching_note:
        "الكلمة اسم معرب مفرد معتل الآخر، لذلك تكون الضمة مقدرة على آخره ولا تظهر نطقًا.",
      text: `مبتدأ مرفوع وعلامة رفعه الضمة المقدرة على آخره.`,
    },

    R_mubtada_5: {
      id: "R_mubtada_5",
      type: "result",
      teaching_note:
        "وصلنا إلى أن الكلمة من الأسماء الخمسة، لذلك تكون علامة رفعها الواو إذا تحققت شروطها المعروفة.",
      text: `مبتدأ مرفوع وعلامة رفعه الواو لأنه من الأسماء الخمسة.`,
    },

    R_mubtada_muthanna: {
      id: "R_mubtada_muthanna",
      type: "result",
      teaching_note:
        "بما أن الكلمة مثنى، فإن علامة الرفع تتحول إلى الألف بدل الضمة.",
      text: `مبتدأ مرفوع وعلامة رفعه الألف لأنه مثنى.`,
    },

    R_mubtada_jms: {
      id: "R_mubtada_jms",
      type: "result",
      teaching_note:
        "جمع المذكر السالم يرفع بالواو، لذلك كانت علامة الرفع هنا الواو.",
      text: `مبتدأ مرفوع وعلامة رفعه الواو لأنه جمع مذكر سالم.`,
    },

    R_mubtada_jfs: {
      id: "R_mubtada_jfs",
      type: "result",
      teaching_note:
        "جمع المؤنث السالم يرفع بالضمة، لذلك كانت علامة الرفع الضمة الظاهرة.",
      text: `مبتدأ مرفوع وعلامة رفعه الضمة الظاهرة على آخره.`,
    },

    R_mubtada_jt: {
      id: "R_mubtada_jt",
      type: "result",
      teaching_note:
        "جمع التكسير هنا مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.",
      text: `مبتدأ مرفوع وعلامة رفعه الضمة الظاهرة على آخره.`,
    },

    R_mubtada_damir: {
      id: "R_mubtada_damir",
      type: "result",
      teaching_note:
        "الضمير اسم مبني، لذلك لا تظهر عليه علامة إعراب، ويكون في محل رفع مبتدأ.",
      text: `ضمير منفصل مبني في محل رفع مبتدأ.`,
    },

    R_mubtada_ishara: {
      id: "R_mubtada_ishara",
      type: "result",
      teaching_note:
        "اسم الإشارة اسم مبني، لذلك نعربه: اسم إشارة مبني في محل رفع مبتدأ.",
      text: `اسم إشارة مبني في محل رفع مبتدأ.`,
    },

    R_mubtada_mawsool: {
      id: "R_mubtada_mawsool",
      type: "result",
      teaching_note:
        "الاسم الموصول من الأسماء المبنية، لذلك نعربه في محل رفع مبتدأ هنا.",
      text: `اسم موصول مبني في محل رفع مبتدأ.`,
    },

    R_mubtada_istifham: {
      id: "R_mubtada_istifham",
      type: "result",
      teaching_note:
        "اسم الاستفهام هنا اسم مبني، وقد وقع في محل رفع مبتدأ لأنه ليس متبوعًا بفعل يخرجه من هذا المسار.",
      text: `اسم استفهام مبني في محل رفع مبتدأ.`,
    },

    R_mubtada_shart: {
      id: "R_mubtada_shart",
      type: "result",
      teaching_note:
        "اسم الشرط من الأسماء المبنية، ولذلك نعربه هنا في محل رفع مبتدأ.",
      text: `اسم شرط مبني في محل رفع مبتدأ.`,
    },

    R_mubtada_kam_khabariyya: {
      id: "R_mubtada_kam_khabariyya",
      type: "result",
      teaching_note:
        "كم الخبرية اسم مبني، وهي هنا في محل رفع مبتدأ لأنها لا تسأل بل تدل على الكثرة.",
      text: `كم الخبرية مبنية في محل رفع مبتدأ.`,
    },

    R_source_mubtada: {
      id: "R_source_mubtada",
      type: "result",
      teaching_note:
        "المصدر المؤول يُعامل معاملة الاسم، ولذلك وقع هنا في محل رفع مبتدأ.",
      text: `مصدر مؤول في محل رفع مبتدأ.`,
    },
  },
};
