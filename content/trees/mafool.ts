export type ExerciseTree = { startNodeId: string; nodes: Record<string, any> };

export const mafoolTree: ExerciseTree = {
  startNodeId: "mafool_type",
  nodes: {
    mafool_type: {
      id: "mafool_type", type: "question", text: "هل المفعول به اسم معرب أم اسم مبني أم مصدر مؤول؟",
      teaching_note: "المفعول به منصوب، لكننا نبدأ بتحديد نوع الكلمة الهدف ثم نصل إلى علامة النصب أو محل النصب.",
      hint: "اسأل: وقع عليه فعل الفاعل؟ ثم حدّد نوع الكلمة الهدف.",
      answers: [
        { id: "a", text: "اسم معرب", next: "mafool_number", eval: { fact: "nounKind", equals: "mu3rab" } },
        { id: "b", text: "اسم مبني", next: "mafool_built_type", eval: { fact: "nounKind", equals: "mabni" } },
        { id: "c", text: "مصدر مؤول", next: "R_mafool_masdar", eval: { fact: "nounKind", equals: "masdar" } }
      ]
    },
    mafool_built_type: {
      id: "mafool_built_type", type: "question", text: "ما نوع الاسم المبني؟",
      teaching_note: "نحدد نوع الاسم المبني ثم نبدأ الإعراب باسمه في محل نصب مفعول به.",
      hint: "مثل: إياه/هذا/الذي: نبدأ باسم النوع ثم نقول مبني في محل نصب مفعول به.",
      answers: [
        { id: "a", text: "ضمير", next: "R_mafool_pronoun", eval: { fact: "mabniType", equals: "damir" } },
        { id: "b", text: "اسم إشارة", next: "R_mafool_ishara", eval: { fact: "mabniType", equals: "ishara" } },
        { id: "c", text: "اسم موصول", next: "R_mafool_mawsool", eval: { fact: "mabniType", equals: "mawsool" } }
      ]
    },
    mafool_number: {
      id: "mafool_number", type: "question", text: "هل المفعول به مفرد أم مثنى أم جمع؟",
      teaching_note: "النصب له علامات: الفتحة، الياء في المثنى وجمع المذكر السالم، والكسرة نيابة عن الفتحة في جمع المؤنث السالم، والألف في الأسماء الخمسة.",
      hint: "حدد البنية قبل العلامة: مفرد/مثنى/جمع/أسماء خمسة.",
      answers: [
        { id: "a", text: "مفرد أو جمع تكسير", next: "mafool_ending", eval: { fact: "number", equals: "singular" } },
        { id: "b", text: "مثنى", next: "R_mafool_dual", eval: { fact: "number", equals: "dual" } },
        { id: "c", text: "جمع مذكر سالم", next: "R_mafool_jms", eval: { fact: "number", equals: "jms" } },
        { id: "d", text: "جمع مؤنث سالم", next: "R_mafool_jfs", eval: { fact: "number", equals: "jfs" } },
        { id: "e", text: "من الأسماء الخمسة", next: "R_mafool_five", eval: { fact: "number", equals: "five" } }
      ]
    },
    mafool_ending: {
      id: "mafool_ending", type: "question", text: "هل آخر المفعول به صحيح أم معتل؟",
      teaching_note: "صحيح الآخر تظهر عليه الفتحة، والمعتل بالألف تُقدر عليه الفتحة للتعذر.",
      hint: "الكتابَ: فتحة ظاهرة. الفتى: فتحة مقدرة للتعذر.",
      answers: [
        { id: "a", text: "صحيح الآخر", next: "R_mafool_visible", eval: { fact: "ending", equals: "sahih" } },
        { id: "b", text: "معتل الآخر", next: "R_mafool_estimated", eval: { fact: "ending", equals: "moatal" } }
      ]
    },
    R_mafool_visible: { id: "R_mafool_visible", type: "result", coverage: "mafool.visible", text: "مفعول به منصوب وعلامة نصبه الفتحة الظاهرة على آخره" },
    R_mafool_estimated: { id: "R_mafool_estimated", type: "result", coverage: "mafool.estimated", text: "مفعول به منصوب وعلامة نصبه الفتحة المقدرة على آخره" },
    R_mafool_dual: { id: "R_mafool_dual", type: "result", coverage: "mafool.dual", text: "مفعول به منصوب وعلامة نصبه الياء لأنه مثنى" },
    R_mafool_jms: { id: "R_mafool_jms", type: "result", coverage: "mafool.jms", text: "مفعول به منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم" },
    R_mafool_jfs: { id: "R_mafool_jfs", type: "result", coverage: "mafool.jfs", text: "مفعول به منصوب وعلامة نصبه الكسرة نيابة عن الفتحة لأنه جمع مؤنث سالم" },
    R_mafool_five: { id: "R_mafool_five", type: "result", coverage: "mafool.five", text: "مفعول به منصوب وعلامة نصبه الألف لأنه من الأسماء الخمسة" },
    R_mafool_pronoun: { id: "R_mafool_pronoun", type: "result", coverage: "mafool.pronoun", text: "ضمير مبني في محل نصب مفعول به" },
    R_mafool_ishara: { id: "R_mafool_ishara", type: "result", coverage: "mafool.ishara", text: "اسم إشارة مبني في محل نصب مفعول به" },
    R_mafool_mawsool: { id: "R_mafool_mawsool", type: "result", coverage: "mafool.mawsool", text: "اسم موصول مبني في محل نصب مفعول به" },
    R_mafool_masdar: { id: "R_mafool_masdar", type: "result", coverage: "mafool.masdar", text: "مصدر مؤول في محل نصب مفعول به" }
  }
};
