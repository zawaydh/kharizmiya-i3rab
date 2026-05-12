export type ExerciseTree = { startNodeId: string; nodes: Record<string, any> };

export const attachedPronounsTree: ExerciseTree = {
  startNodeId: "pronoun_source",
  nodes: {
    pronoun_source: { id: "pronoun_source", type: "question", context: "الضمير لا نعربه من شكله فقط؛ ننظر إلى العامل أو الكلمة التي اتصل بها.", text: "أين جاء الضمير؟", hint: "اسأل: اتصل باسم؟ بفعل؟ بحرف؟ أم جاء منفصلًا؟", answers: [ { id: "a", text: "اتصل باسم", next: "R_pronoun_jar", eval: { fact: "source", equals: "noun" } }, { id: "b", text: "اتصل بفعل", next: "pronoun_verb_role", eval: { fact: "source", equals: "verb" } }, { id: "c", text: "جاء ضميرًا منفصلًا", next: "pronoun_separate_role", eval: { fact: "source", equals: "separate" } }, { id: "d", text: "اتصل بحرف جر", next: "R_pronoun_jar", eval: { fact: "source", equals: "prep" } }, { id: "e", text: "اتصل بحرف ناسخ", next: "R_pronoun_nasb_attached", eval: { fact: "source", equals: "nasikh" } } ] },
    pronoun_verb_role: { id: "pronoun_verb_role", type: "question", context: "الضمير اتصل بفعل؛ الآن نحدد وظيفته: هل فعل الحدث أم وقع عليه الحدث؟", text: "ما علاقة الضمير بالفعل؟", hint: "إذا قام بالفعل فهو فاعل، وإذا وقع عليه الفعل فهو مفعول به.", answers: [ { id: "a", text: "قام بالفعل", next: "R_pronoun_raf3_attached", eval: { fact: "role", equals: "doer" } }, { id: "b", text: "وقع عليه الفعل", next: "R_pronoun_nasb_attached", eval: { fact: "role", equals: "object" } } ] },
    pronoun_separate_role: { id: "pronoun_separate_role", type: "question", context: "الضمير المنفصل قد يكون في محل رفع أو نصب بحسب وظيفته.", text: "ما وظيفة الضمير المنفصل هنا؟", hint: "أنا/هو غالبًا رفع، وإياك/إياه ضمائر نصب منفصلة.", answers: [ { id: "a", text: "بدأت به الجملة أو ناب عن فاعل", next: "R_pronoun_raf3_separate", eval: { fact: "position", equals: "raf3" } }, { id: "b", text: "وقع عليه الفعل مثل: إياك", next: "R_pronoun_nasb_separate", eval: { fact: "position", equals: "nasb" } } ] },
    R_pronoun_raf3_attached: { id: "R_pronoun_raf3_attached", type: "result", coverage: "pronoun.raf3.attached", text: "ضمير رفع متصل مبني في محل رفع فاعل." },
    R_pronoun_raf3_separate: { id: "R_pronoun_raf3_separate", type: "result", coverage: "pronoun.raf3.separate", text: "ضمير رفع منفصل مبني في محل رفع." },
    R_pronoun_nasb_attached: { id: "R_pronoun_nasb_attached", type: "result", coverage: "pronoun.nasb.attached", text: "ضمير نصب متصل مبني في محل نصب مفعول به." },
    R_pronoun_nasb_separate: { id: "R_pronoun_nasb_separate", type: "result", coverage: "pronoun.nasb.separate", text: "ضمير نصب منفصل مبني في محل نصب مفعول به." },
    R_pronoun_jar: { id: "R_pronoun_jar", type: "result", coverage: "pronoun.jar", text: "ضمير متصل مبني في محل جر." }
  }
};
