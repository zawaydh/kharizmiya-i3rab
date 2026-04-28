export type ExerciseTree = { startNodeId: string; nodes: Record<string, any> };

export const faelTree: ExerciseTree = {
  startNodeId: "fael_type",
  nodes: {
    fael_type: {
      id: "fael_type", type: "question", text: "هل الفاعل اسم ظاهر أم اسم مبني أم مصدر مؤول؟",
      teaching_note: "نحافظ على الكلمة الهدف: إذا كان الهدف فاعلًا نحدد أولًا نوعه، ثم نصل إلى علامة الرفع أو محل الرفع.",
      hint: "اسأل: من قام بالفعل؟ ثم حدد نوع الكلمة: اسم ظاهر/مبني/مصدر مؤول.",
      answers: [
        { id: "a", text: "اسم ظاهر معرب", next: "fael_number", eval: { fact: "nounKind", equals: "mu3rab" } },
        { id: "b", text: "اسم مبني", next: "fael_built_type", eval: { fact: "nounKind", equals: "mabni" } },
        { id: "c", text: "مصدر مؤول", next: "R_fael_masdar", eval: { fact: "nounKind", equals: "masdar" } }
      ]
    },
    fael_built_type: {
      id: "fael_built_type", type: "question", text: "ما نوع الاسم المبني؟",
      teaching_note: "نحدد نوع الاسم المبني ثم نبدأ الإعراب باسمه: ضمير/اسم إشارة/اسم موصول مبني في محل رفع فاعل.",
      hint: "لا تقل: فاعل مبني فقط؛ ابدأ باسمه: ضمير، اسم إشارة، اسم موصول...",
      answers: [
        { id: "a", text: "ضمير", next: "R_fael_pronoun", eval: { fact: "mabniType", equals: "damir" } },
        { id: "b", text: "اسم إشارة", next: "R_fael_ishara", eval: { fact: "mabniType", equals: "ishara" } },
        { id: "c", text: "اسم موصول", next: "R_fael_mawsool", eval: { fact: "mabniType", equals: "mawsool" } }
      ]
    },
    fael_number: {
      id: "fael_number", type: "question", text: "هل الفاعل مفرد أم مثنى أم جمع؟",
      teaching_note: "الفاعل دائمًا مرفوع، لكن علامة الرفع تختلف بحسب النوع والعدد.",
      hint: "مفرد/جمع تكسير: غالبًا الضمة، مثنى: الألف، جمع مذكر سالم: الواو.",
      answers: [
        { id: "a", text: "مفرد أو جمع تكسير", next: "fael_ending", eval: { fact: "number", equals: "singular" } },
        { id: "b", text: "مثنى", next: "R_fael_dual", eval: { fact: "number", equals: "dual" } },
        { id: "c", text: "جمع مذكر سالم", next: "R_fael_jms", eval: { fact: "number", equals: "jms" } },
        { id: "d", text: "جمع مؤنث سالم", next: "R_fael_jfs", eval: { fact: "number", equals: "jfs" } },
        { id: "e", text: "من الأسماء الخمسة", next: "R_fael_five", eval: { fact: "number", equals: "five" } }
      ]
    },
    fael_ending: {
      id: "fael_ending", type: "question", text: "هل آخر الفاعل صحيح أم معتل؟",
      teaching_note: "صحيح الآخر تظهر عليه الضمة، والمعتل تُقدر عليه الضمة.",
      hint: "القاضي/الفتى: ضمة مقدرة، أما الطالب/الرجال: ضمة ظاهرة.",
      answers: [
        { id: "a", text: "صحيح الآخر", next: "R_fael_visible", eval: { fact: "ending", equals: "sahih" } },
        { id: "b", text: "معتل الآخر", next: "R_fael_estimated", eval: { fact: "ending", equals: "moatal" } }
      ]
    },
    R_fael_visible: { id: "R_fael_visible", type: "result", coverage: "fael.visible", text: "فاعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره" },
    R_fael_estimated: { id: "R_fael_estimated", type: "result", coverage: "fael.estimated", text: "فاعل مرفوع وعلامة رفعه الضمة المقدرة على آخره" },
    R_fael_dual: { id: "R_fael_dual", type: "result", coverage: "fael.dual", text: "فاعل مرفوع وعلامة رفعه الألف لأنه مثنى" },
    R_fael_jms: { id: "R_fael_jms", type: "result", coverage: "fael.jms", text: "فاعل مرفوع وعلامة رفعه الواو لأنه جمع مذكر سالم" },
    R_fael_jfs: { id: "R_fael_jfs", type: "result", coverage: "fael.jfs", text: "فاعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره لأنه جمع مؤنث سالم" },
    R_fael_five: { id: "R_fael_five", type: "result", coverage: "fael.five", text: "فاعل مرفوع وعلامة رفعه الواو لأنه من الأسماء الخمسة" },
    R_fael_pronoun: { id: "R_fael_pronoun", type: "result", coverage: "fael.pronoun", text: "ضمير مبني في محل رفع فاعل" },
    R_fael_ishara: { id: "R_fael_ishara", type: "result", coverage: "fael.ishara", text: "اسم إشارة مبني في محل رفع فاعل" },
    R_fael_mawsool: { id: "R_fael_mawsool", type: "result", coverage: "fael.mawsool", text: "اسم موصول مبني في محل رفع فاعل" },
    R_fael_masdar: { id: "R_fael_masdar", type: "result", coverage: "fael.masdar", text: "مصدر مؤول في محل رفع فاعل" }
  }
};
