export type ExerciseTree = { startNodeId: string; nodes: Record<string, any> };

export const pastVerbTree: ExerciseTree = {
  startNodeId: "past_has_pronoun",
  nodes: {
    past_has_pronoun: {
      id: "past_has_pronoun",
      type: "question",
      text: "هل اتصل بالفعل الماضي ضمير؟",
      teaching_note: "نبدأ من اتصال الضمير؛ لأن بناء الفعل الماضي يتغير باختلاف الضمير المتصل به.",
      hint: "إذا لم يتصل به ضمير مؤثر فالأصل: فعل ماضٍ مبني على الفتح.",
      answers: [
        { id: "a", text: "نعم، اتصل به ضمير", next: "past_pronoun_type", eval: { fact: "hasPronoun", equals: true } },
        { id: "b", text: "لا، لم يتصل به ضمير", next: "R_past_fatha", eval: { fact: "hasPronoun", equals: false } }
      ]
    },
    past_pronoun_type: {
      id: "past_pronoun_type",
      type: "question",
      text: "ما نوع الضمير المتصل بالفعل؟",
      teaching_note: "لا نجمع كل الضمائر في حكم واحد: واو الجماعة تبني الماضي على الضم، وألف الاثنين لا تسلب الفتح، أما ضمائر الرفع المتحركة ونون النسوة فتبنيه على السكون.",
      hint: "ميّز بين: واو الجماعة، ألف الاثنين، نون النسوة، وضمائر الرفع المتحركة: تُ، تَ، تِ، نا، تم، تما.",
      answers: [
        { id: "a", text: "واو الجماعة", next: "R_past_damma_waw", eval: { fact: "pronounType", equals: "waw" } },
        { id: "b", text: "ألف الاثنين", next: "R_past_fatha_alif", eval: { fact: "pronounType", equals: "alif" } },
        { id: "c", text: "نون النسوة", next: "R_past_sukoon_niswa", eval: { fact: "pronounType", equals: "niswa" } },
        { id: "d", text: "ضمير رفع متحرك", next: "R_past_sukoon_moving", eval: { fact: "pronounType", equals: "moving" } }
      ]
    },
    R_past_fatha: { id: "R_past_fatha", type: "result", coverage: "past.fatha", text: "فعل ماضٍ مبني على الفتح" },
    R_past_damma_waw: { id: "R_past_damma_waw", type: "result", coverage: "past.damma_waw", text: "فعل ماضٍ مبني على الضم لاتصاله بواو الجماعة، وواو الجماعة ضمير متصل مبني في محل رفع فاعل" },
    R_past_fatha_alif: { id: "R_past_fatha_alif", type: "result", coverage: "past.fatha_alif", text: "فعل ماضٍ مبني على الفتح لاتصاله بألف الاثنين، وألف الاثنين ضمير متصل مبني في محل رفع فاعل" },
    R_past_sukoon_niswa: { id: "R_past_sukoon_niswa", type: "result", coverage: "past.sukoon_niswa", text: "فعل ماضٍ مبني على السكون لاتصاله بنون النسوة، ونون النسوة ضمير متصل مبني في محل رفع فاعل" },
    R_past_sukoon_moving: { id: "R_past_sukoon_moving", type: "result", coverage: "past.sukoon_moving", text: "فعل ماضٍ مبني على السكون لاتصاله بضمير رفع متحرك، والضمير المتصل مبني في محل رفع فاعل" }
  }
};
