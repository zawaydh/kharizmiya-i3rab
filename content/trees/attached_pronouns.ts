export type ExerciseTree = { startNodeId: string; nodes: Record<string, any> };

export const attachedPronounsTree: ExerciseTree = {
  startNodeId: "pronoun_position",
  nodes: {
    pronoun_position: {
      id: "pronoun_position",
      type: "question",
      text: "هل حلّ الضمير محل اسم مرفوع أم منصوب أم مجرور؟",
      teaching_note: "نحدد محل الاسم الذي ناب عنه الضمير: إن ناب عن مرفوع فهو ضمير رفع، وإن ناب عن منصوب فهو ضمير نصب، وإن ناب عن مجرور فهو في محل جر.",
      hint: "اسأل: لو وضعنا اسمًا ظاهرًا مكان الضمير، هل يكون مرفوعًا أم منصوبًا أم مجرورًا؟ الضمير يأخذ محل ذلك الاسم.",
      answers: [
        { id: "a", text: "محل اسم مرفوع", next: "pronoun_form_raf3", eval: { fact: "position", equals: "raf3" } },
        { id: "b", text: "محل اسم منصوب", next: "pronoun_form_nasb", eval: { fact: "position", equals: "nasb" } },
        { id: "c", text: "محل اسم مجرور", next: "R_pronoun_jar", eval: { fact: "position", equals: "jar" } }
      ]
    },
    pronoun_form_raf3: {
      id: "pronoun_form_raf3",
      type: "question",
      text: "هل الضمير متصل أم منفصل؟",
      teaching_note: "ضمائر الرفع قد تكون متصلة بالفعل أو منفصلة ظاهرة وحدها.",
      hint: "المتصل يلتصق بالفعل مثل: كتبتُ، كتبوا. والمنفصل يظهر وحده مثل: أنا، نحن، هو، هم.",
      answers: [
        { id: "a", text: "ضمير رفع متصل", next: "R_pronoun_raf3_attached", eval: { fact: "form", equals: "attached" } },
        { id: "b", text: "ضمير رفع منفصل", next: "R_pronoun_raf3_separate", eval: { fact: "form", equals: "separate" } }
      ]
    },
    pronoun_form_nasb: {
      id: "pronoun_form_nasb",
      type: "question",
      text: "هل الضمير متصل أم منفصل؟",
      teaching_note: "ضمائر النصب قد تتصل بالفعل أو تأتي منفصلة للتوكيد أو الحصر.",
      hint: "المتصل مثل: أكرمَكَ، شاهدَه. والمنفصل مثل: إياكَ، إياه، إيانا.",
      answers: [
        { id: "a", text: "ضمير نصب متصل", next: "R_pronoun_nasb_attached", eval: { fact: "form", equals: "attached" } },
        { id: "b", text: "ضمير نصب منفصل", next: "R_pronoun_nasb_separate", eval: { fact: "form", equals: "separate" } }
      ]
    },
    R_pronoun_raf3_attached: { id: "R_pronoun_raf3_attached", type: "result", coverage: "pronoun.raf3.attached", text: "ضمير متصل مبني في محل رفع فاعل" },
    R_pronoun_raf3_separate: { id: "R_pronoun_raf3_separate", type: "result", coverage: "pronoun.raf3.separate", text: "ضمير منفصل مبني في محل رفع مبتدأ" },
    R_pronoun_nasb_attached: { id: "R_pronoun_nasb_attached", type: "result", coverage: "pronoun.nasb.attached", text: "ضمير متصل مبني في محل نصب مفعول به" },
    R_pronoun_nasb_separate: { id: "R_pronoun_nasb_separate", type: "result", coverage: "pronoun.nasb.separate", text: "ضمير منفصل مبني في محل نصب مفعول به" },
    R_pronoun_jar: { id: "R_pronoun_jar", type: "result", coverage: "pronoun.jar", text: "ضمير متصل مبني في محل جر مضاف إليه" }
  }
};
