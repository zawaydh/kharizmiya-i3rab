import type { ExerciseTree } from "../../lib/exercise/model";



export const faelTree: ExerciseTree = {
  startNodeId: "fael_context",
  nodes: {
    fael_context: {
      id: "fael_context",
      type: "question",
      context: "نبدأ من السياق قبل أن نحدد الدور.",
      text: "ما السياق الذي وردت فيه الكلمة المحددة؟",
      hint: "انظر إلى بداية الجملة: هل بدأت بفعل، أم بدأت باسم؟ ",
      answers: [
        {
          id: "verbal",
          text: "جملة فعلية",
          next: "fael_role_verbal",
          nextByFact: { fact: "contextType", map: { verbal_hidden: "fael_role_hidden" } },
          eval: { fact: "contextType", anyOf: ["verbal", "verbal_hidden"] },
          hint: "إذا بدأت الجملة باسم فهي جملة اسمية، ولو كان خبرها جملة فعلية ندرسه في الخطوة التالية."
        },
        {
          id: "nominal",
          text: "جملة اسمية",
          next: "fael_role_hidden",
          nextByFact: { fact: "contextType", map: { nominal_connected: "fael_role_verbal", nominal_with_verb: "fael_role_hidden" } },
          eval: { fact: "contextType", anyOf: ["nominal_with_verb", "nominal_connected"] },
          hint: "إذا بدأت الجملة بفعل فهي جملة فعلية غالبًا، أما إذا بدأت باسم فهي جملة اسمية."
        },
      ]
    },

    fael_role_verbal: {
      id: "fael_role_verbal",
      type: "question",
      context: "بما أن الكلمة وردت في سياق فيه فعل، فلنحدد دورها في هذه الجملة.",
      text: "ما دور الكلمة المحددة في الجملة؟",
      hint: "اسأل: من الذي فعل؟ أو ما الذي فعل؟ الجواب هو الفاعل. أما ما وقع عليه الفعل فهو المفعول به.",
      answers: [
        {
          id: "a",
          text: "فعل",
          next: "fael_role_verbal",
          correct: false,
          hint: "الفعل يدل على حدث وزمن، أما المحدد هنا فقد يكون اسمًا أو ضميرًا أو تركيبًا في معنى اسم."
        },
        {
          id: "b",
          text: "فاعل",
          next: "fael_hukm",
          eval: { fact: "roleKind", anyOf: ["visible", "mabni", "connected", "masdar"] },
          hint: "الفاعل هو من قام بالفعل أو ما دل على سبب الفعل."
        },
        {
          id: "c",
          text: "مفعول به",
          next: "fael_role_verbal",
          correct: false,
          hint: "المفعول به هو ما وقع عليه الفعل، أما الفاعل فهو من قام بالفعل أو ما أحدثه."
        },
      ]
    },

    fael_role_hidden: {
      id: "fael_role_hidden",
      type: "question",
      context: "عرفنا أن الفعل يحتاج إلى فاعل. فإذا لم يظهر بعد الفعل اسم قام به، نبحث عن ضمير مستتر داخل الفعل.",
      text: "أين فاعل الفعل المحدد؟",
      hint: "اسأل: من الذي فعل؟ إذا لم تجد بعد الفعل اسمًا ظاهرًا قام بالفعل، فالفاعل ضمير مستتر يناسب معنى الفعل وصيغته.",
      answers: [
        {
          id: "a",
          text: "ضمير مستتر داخل الفعل",
          next: "fael_hidden_estimate",
          eval: { fact: "roleKind", equals: "hidden" },
          hint: "إذا لم يظهر بعد الفعل اسم يقوم بالفعل، نقدّر فاعلًا مستترًا يناسب المعنى."
        },
        {
          id: "b",
          text: "اسم ظاهر في الجملة",
          next: "fael_role_hidden",
          correct: false,
          hint: "لو كان الفاعل اسمًا ظاهرًا لوجدناه مرتبطًا بالفعل مباشرة بعده غالبًا. أما هنا فنبحث عن ضمير مستتر داخل الفعل."
        },
        {
          id: "c",
          text: "المفعول به هو الفاعل",
          next: "fael_role_hidden",
          correct: false,
          hint: "المفعول به وقع عليه الفعل، ولا يكون هو من قام بالفعل."
        },
      ]
    },

    fael_hidden_estimate: {
      id: "fael_hidden_estimate",
      type: "question",
      context: "بما أن الفاعل ضمير مستتر، نحدد تقديره من معنى الجملة وصيغة الفعل.",
      text: "ما تقدير الضمير المستتر؟",
      hint: "نقدر الضمير بحسب الفعل ومعناه: هو للمفرد المذكر، هي للمفرد المؤنث، أنا للمتكلم، نحن للمتكلمين، وأنت للمخاطب في الأمر.",
      answers: [
        { id: "a", text: "هو", next: "R_fael_hidden", eval: { fact: "hiddenPronoun", equals: "هو" }, hint: "هو يناسب المفرد المذكر الغائب، مثل: محمدٌ يقرأُ." },
        { id: "b", text: "هي", next: "R_fael_hidden", eval: { fact: "hiddenPronoun", equals: "هي" }, hint: "هي تناسب المفرد المؤنث الغائب، مثل: فاطمةُ تكتبُ." },
        { id: "c", text: "أنا", next: "R_fael_hidden", eval: { fact: "hiddenPronoun", equals: "أنا" }, hint: "أنا تناسب الفعل الذي يبدأ بهمزة المتكلم، مثل: أقرأُ." },
        { id: "d", text: "نحن", next: "R_fael_hidden", eval: { fact: "hiddenPronoun", equals: "نحن" }, hint: "نحن تناسب الفعل الذي يبدأ بنون المتكلمين، مثل: نساعدُ." },
        { id: "e", text: "أنت", next: "R_fael_hidden", eval: { fact: "hiddenPronoun", equals: "أنت" }, hint: "أنت تناسب فعل الأمر الموجه للمخاطب، مثل: اقرأْ." },
      ]
    },

    fael_hukm: {
      id: "fael_hukm",
      type: "question",
      context: "بعد اكتشاف أنه فاعل، ننتقل مباشرة إلى الإعراب.",
      text: "ما حكم الفاعل؟",
      hint: "الفاعل حكمه الرفع دائمًا، فإن كان اسمًا معربًا ظهرت علامة الرفع أو قدرت، وإن كان مبنيًا أو مصدرًا مؤولًا قلنا: في محل رفع.",
      answers: [
        { id: "a", text: "مرفوع أو في محل رفع", next: "fael_form", correct: true, hint: "صحيح؛ الفاعل يكون مرفوعًا، أو في محل رفع إذا كان مبنيًا أو مصدرًا مؤولًا." },
        { id: "b", text: "منصوب", next: "fael_hukm", correct: false, hint: "النصب يناسب المفعول به غالبًا، أما الفاعل فحكمه الرفع دائمًا." },
        { id: "c", text: "مجرور", next: "fael_hukm", correct: false, hint: "الجر يكون بعد حرف جر أو بالإضافة، أما الفاعل فحكمه الرفع دائمًا." },
      ]
    },

    fael_form: {
      id: "fael_form",
      type: "question",
      context: "لكي نحدد هل نعرب الفاعل مرفوعًا بعلامة رفع أم في محل رفع، نحدد صورته.",
      text: "ما صورة الكلمة المحددة؟",
      hint: "انظر إلى الكلمة المحددة نفسها: الاسم الظاهر المعرب نكمل معه إلى علامة الرفع. أما الاسم المبني والضمير المتصل فنقول: في محل رفع فاعل. وأما المصدر المؤول فليس اسمًا مبنيًا؛ بل نقول: مصدر مؤول في محل رفع فاعل.",
      answers: [
        { id: "a", text: "اسم ظاهر معرب", next: "fael_mu3rab_shape", eval: { fact: "roleKind", equals: "visible" }, hint: "الاسم الظاهر المعرب كلمة مستقلة تظهر عليها علامة رفع أو تكون مقدرة، مثل: الطالبُ والوالدانِ والمعلمونَ." },
        { id: "b", text: "اسم مبني", next: "fael_mabni_type", eval: { fact: "roleKind", equals: "mabni" }, hint: "الاسم المبني مثل اسم الإشارة والاسم الموصول، ولا تظهر عليه علامة رفع، بل يكون في محل رفع فاعل." },
        { id: "c", text: "ضمير متصل", next: "R_fael_connected", eval: { fact: "roleKind", equals: "connected" }, hint: "الضمير المتصل بالفعل من الأسماء المبنية، ويكون في محل رفع فاعل إذا دل على من قام بالفعل." },
        { id: "d", text: "مصدر مؤول", next: "R_fael_masdar", eval: { fact: "roleKind", equals: "masdar" }, hint: "المصدر المؤول تركيب يؤول بمصدر في معنى اسم، مثل: أن تنجحَ = نجاحك، وما فعلتَ = فعلك." },
      ]
    },

    fael_mu3rab_shape: {
      id: "fael_mu3rab_shape",
      type: "question",
      context: "بما أن الفاعل اسم ظاهر معرب، نحدد صورته حتى نعرف علامة رفعه.",
      text: "ما صورة الفاعل المعرب؟",
      hint: "افحص صورة الكلمة: هل تدل على واحد، اثنين، جماعة، أم هي من الأسماء الخمسة؟",
      answers: [
        { id: "a", text: "مفرد", next: "fael_raf3_mark", eval: { fact: "shape", equals: "singular" }, hint: "المفرد العادي يدل على واحد أو واحدة ويُرفع غالبًا بالضمة، مثل: الطالبُ." },
        { id: "b", text: "مثنى", next: "fael_raf3_mark", eval: { fact: "shape", equals: "dual" }, hint: "المثنى يدل على اثنين أو اثنتين، وغالبًا ينتهي بـ انِ في الرفع مثل: الوالدانِ." },
        { id: "c", text: "جمع مذكر سالم", next: "fael_raf3_mark", eval: { fact: "shape", equals: "jms" }, hint: "جمع المذكر السالم يدل على جماعة ذكور عاقلة وينتهي في الرفع بـ ونَ، مثل: المعلمونَ." },
        { id: "d", text: "جمع مؤنث سالم", next: "fael_raf3_mark", eval: { fact: "shape", equals: "jfs" }, hint: "جمع المؤنث السالم يدل على جماعة إناث وينتهي غالبًا بـ ات، مثل: الطالباتُ." },
        { id: "e", text: "جمع تكسير", next: "fael_raf3_mark", eval: { fact: "shape", equals: "jt" }, hint: "جمع التكسير تتغير فيه صورة المفرد عند الجمع، مثل: طفل ← أطفال." },
        { id: "f", text: "من الأسماء الخمسة", next: "fael_raf3_mark", eval: { fact: "shape", equals: "five" }, hint: "الأسماء الخمسة هي: أب، أخ، حم، فو، ذو. تعرب بالحروف إذا كانت مفردة، مضافة، ومضافة إلى غير ياء المتكلم." },
      ]
    },

    fael_raf3_mark: {
      id: "fael_raf3_mark",
      type: "question",
      context: "بما أن الفاعل مرفوع وقد عرفنا صورته، نختار علامة رفعه.",
      text: "ما علامة رفع الكلمة المحددة؟",
      hint: "اختر علامة الرفع من صورة الكلمة نفسها: المفرد وجمع التكسير وعلامة رفع جمع المؤنث السالم الضمة، والمثنى بالألف، وجمع المذكر السالم والأسماء الخمسة بالواو.",
      answers: [
        { id: "a", text: "الضمة الظاهرة", next: "R_fael_mu3rab", eval: { fact: "raf3Mark", equals: "damma" }, hint: "الضمة تناسب المفرد العادي وجمع التكسير وجمع المؤنث السالم إذا ظهرت الحركة على آخر الكلمة." },
        { id: "b", text: "الألف", next: "R_fael_mu3rab", eval: { fact: "raf3Mark", equals: "alif" }, hint: "الألف علامة رفع المثنى، مثل: الوالدانِ والصديقانِ." },
        { id: "c", text: "الواو", next: "R_fael_mu3rab", eval: { fact: "raf3Mark", equals: "waw" }, hint: "الواو علامة رفع جمع المذكر السالم، وتكون علامة رفع الأسماء الخمسة إذا استوفت شروطها: مفردة، مضافة، ومضافة إلى غير ياء المتكلم." },
        { id: "d", text: "ثبوت النون", next: "fael_raf3_mark", correct: false, hint: "ثبوت النون ليس علامة رفع للأسماء، بل يخص الفعل المضارع المتصل بألف الاثنين أو واو الجماعة أو ياء المخاطبة." },
      ]
    },

    fael_mabni_type: {
      id: "fael_mabni_type",
      type: "question",
      context: "بما أن الفاعل اسم مبني، لا نبحث عن ضمة على آخره، بل نحدد نوعه.",
      text: "اختر نوع الاسم المبني:",
      hint: "بعد أن عرفنا أن الكلمة مبنية، نحدد نوع المبني نفسه: اسم إشارة، اسم موصول، أو ضمير متصل. ثم نقول: مبني في محل رفع فاعل.",
      answers: [
        { id: "a", text: "اسم إشارة", next: "R_fael_mabni", eval: { fact: "mabniType", equals: "ishara" }, hint: "اسم الإشارة مثل: هذا وهذه. إذا دل على من قام بالفعل فهو في محل رفع فاعل." },
        { id: "b", text: "اسم موصول", next: "R_fael_mabni", eval: { fact: "mabniType", equals: "mawsool" }, hint: "الاسم الموصول مثل: الذي والتي، وتأتي بعده صلة توضحه." },
        { id: "c", text: "ضمير متصل", next: "R_fael_connected", eval: { fact: "roleKind", equals: "connected" }, hint: "الضمير المتصل من الأسماء المبنية، مثل التاء في فهمتُ ونا في حفظنا وواو الجماعة ونون النسوة وألف الاثنين وياء المخاطبة." },
      ]
    },

    R_fael_mu3rab: { id: "R_fael_mu3rab", type: "result", coverage: "fael.mu3rab", text: "فاعل مرفوع." },
    R_fael_mabni: { id: "R_fael_mabni", type: "result", coverage: "fael.mabni", text: "اسم مبني في محل رفع فاعل." },
    R_fael_connected: { id: "R_fael_connected", type: "result", coverage: "fael.connected", text: "ضمير متصل مبني في محل رفع فاعل." },
    R_fael_hidden: { id: "R_fael_hidden", type: "result", coverage: "fael.hidden", text: "الفاعل ضمير مستتر." },
    R_fael_masdar: { id: "R_fael_masdar", type: "result", coverage: "fael.masdar", text: "مصدر مؤول في محل رفع فاعل." }
  }
};
