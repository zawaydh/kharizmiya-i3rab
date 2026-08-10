import type { ExerciseTree } from "../../lib/exercise/model";

export const halTree: ExerciseTree = {
  startNodeId: "hal_relation",
  nodes: {
    hal_relation: {
      id: "hal_relation",
      type: "question",
      context: "نبدأ من المعنى قبل المصطلح: نبحث عن هيئة صاحب الكلمة وقت وقوع الفعل.",
      text: "هل تجيب الكلمة المحددة عن «كيف؟» وتبين هيئة صاحبها وقت حدوث الفعل؟",
      hint: "اسأل عن صاحب الحال وقت وقوع الفعل: كيف كان؟ ثم جرّب أن تحول المعنى إلى جملة تبدأ بـ«وهو» أو «وهي». إذا استقام المعنى فهذه قرينة قوية على الحال.",
      answers: [
        { id: "yes", text: "نعم، تبين الهيئة وتجيب عن «كيف؟»", next: "hal_kind", eval: { fact: "isHal", equals: true }, hint: "إذا بينت الكلمة هيئة صاحبها وقت وقوع الفعل، فهي حال. ننتقل الآن إلى نوع الحال." },
        { id: "no", text: "لا، لا تبين هيئة صاحبها", next: "hal_kind", eval: { fact: "isHal", equals: false }, hint: "لا تجعل كل منصوب حالًا. الحال يصف هيئة صاحبه وقت الفعل ويصلح غالبًا جوابًا عن «كيف؟»." },
      ],
    },
    hal_kind: {
      id: "hal_kind",
      type: "question",
      context: "ثبتت وظيفة الحال، فنحدد الآن صورته قبل الإعراب النهائي.",
      text: "ما صورة الحال في هذا المثال؟",
      hint: "الحال قد يكون مفردًا، أو جملة اسمية، أو جملة فعلية، أو شبه جملة. حدّد الصورة من المثال نفسه.",
      answers: [
        { id: "single", text: "حال مفرد", next: "hal_shape", eval: { fact: "halKind", equals: "single" }, hint: "الحال المفرد ليس المقصود به واحدًا في العدد، بل كلمة واحدة ليست جملة ولا شبه جملة." },
        { id: "nominal", text: "جملة اسمية في محل نصب حال", next: "R_hal_sentence", eval: { fact: "halKind", equals: "nominal_sentence" }, hint: "إذا جاء الحال جملة اسمية تصف الهيئة وترتبط بصاحبها بضمير أو رابط، فالجملة في محل نصب حال." },
        { id: "verbal", text: "جملة فعلية في محل نصب حال", next: "R_hal_sentence", eval: { fact: "halKind", equals: "verbal_sentence" }, hint: "إذا جاء الحال جملة فعلية تصف الهيئة وقت الفعل، فالجملة في محل نصب حال." },
        { id: "shibh", text: "شبه جملة في محل نصب حال", next: "R_hal_sentence", eval: { fact: "halKind", equals: "shibh" }, hint: "إذا جاء جار ومجرور أو ظرف يبين الهيئة، فشبه الجملة يتعلق بمحذوف حال ويعرب في محل نصب حال في هذا المستوى." },
      ],
    },
    hal_shape: {
      id: "hal_shape",
      type: "question",
      context: "عرفنا أن الحال مفرد منصوب، والآن نحدد صورة الاسم لاختيار علامة النصب.",
      text: "ما صورة الاسم الذي وقع حالًا؟",
      hint: "افحص الكلمة نفسها: مفرد، مثنى، جمع مذكر سالم، جمع مؤنث سالم، أم جمع تكسير؟",
      answers: [
        { id: "singular", text: "مفرد", next: "hal_mark", eval: { fact: "shape", equals: "singular" }, hint: "المفرد المنصوب علامته الأصلية الفتحة." },
        { id: "dual", text: "مثنى", next: "hal_mark", eval: { fact: "shape", equals: "dual" }, hint: "المثنى ينصب بالياء." },
        { id: "jms", text: "جمع مذكر سالم", next: "hal_mark", eval: { fact: "shape", equals: "jms" }, hint: "جمع المذكر السالم ينصب بالياء." },
        { id: "jfs", text: "جمع مؤنث سالم", next: "hal_mark", eval: { fact: "shape", equals: "jfs" }, hint: "جمع المؤنث السالم ينصب بالكسرة نيابة عن الفتحة." },
        { id: "jt", text: "جمع تكسير", next: "hal_mark", eval: { fact: "shape", equals: "jt" }, hint: "جمع التكسير ينصب في الأصل بالفتحة." },
      ],
    },
    hal_mark: {
      id: "hal_mark",
      type: "question",
      context: "عرفنا الوظيفة والحكم والصورة؛ بقيت علامة النصب.",
      text: "ما علامة نصب الحال هنا؟",
      hint: "اربط العلامة بصورة الاسم: الفتحة للمفرد وجمع التكسير، الياء للمثنى وجمع المذكر السالم، والكسرة لجمع المؤنث السالم.",
      answers: [
        { id: "fatha", text: "الفتحة الظاهرة", next: "R_hal_single", eval: { fact: "nasbMark", equals: "fatha" }, hint: "الفتحة علامة النصب الأصلية للمفرد وجمع التكسير." },
        { id: "yaa", text: "الياء", next: "R_hal_single", eval: { fact: "nasbMark", equals: "yaa" }, hint: "الياء علامة نصب المثنى وجمع المذكر السالم." },
        { id: "kasra", text: "الكسرة نيابةً عن الفتحة", next: "R_hal_single", eval: { fact: "nasbMark", equals: "kasra" }, hint: "الكسرة تنوب عن الفتحة في نصب جمع المؤنث السالم." },
      ],
    },
    R_hal_single: { id: "R_hal_single", type: "result", text: "حال منصوب، وتحدد العلامة بحسب صورة الاسم." },
    R_hal_sentence: { id: "R_hal_sentence", type: "result", text: "تركيب في محل نصب حال." },
  },
};
