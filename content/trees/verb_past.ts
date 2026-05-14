export type ExerciseTree = { startNodeId: string; nodes: Record<string, any> };

export const pastVerbTree: ExerciseTree = {
  startNodeId: "past_has_pronoun",
  nodes: {
    past_has_pronoun: {
      id: "past_has_pronoun",
      type: "question",
      context: "نبدأ بالفعل الماضي بسؤال الاتصال؛ لأن اتصال الضمير يغيّر علامة البناء.",
      text: "هل اتصل الفعل الماضي بضمير؟",
      hint: "إذا لم يتصل بضمير فالأصل أنه يبنى على الفتح. وإذا اتصل بضمير نحدد نوع الضمير.",
      answers: [
        { id: "a", text: "غير متصل بأي ضمير", next: "R_past_fatha", eval: { fact: "hasPronoun", equals: false } },
        { id: "b", text: "متصل بضمير", next: "past_is_waw", eval: { fact: "hasPronoun", equals: true } }
      ]
    },

    past_is_waw: {
      id: "past_is_waw",
      type: "question",
      context: "عرفنا أن الفعل الماضي اتصل بضمير، فنبدأ بأوضح علامة: واو الجماعة.",
      text: "هل اتصل بواو الجماعة؟",
      hint: "مثل: كتبوا، خرجوا. الماضي إذا اتصل بواو الجماعة يبنى على الضم.",
      answers: [
        { id: "a", text: "نعم، اتصل بواو الجماعة", next: "R_past_damma_waw", eval: { fact: "pronounType", equals: "waw" } },
        { id: "b", text: "لا", next: "past_is_sukoon_set", eval: { fact: "isWaw", equals: false } }
      ]
    },

    past_is_sukoon_set: {
      id: "past_is_sukoon_set",
      type: "question",
      context: "لم يتصل بواو الجماعة، فنفحص ضمائر السكون.",
      text: "هل اتصل بتاء الفاعل أو نا الفاعلين أو نون النسوة؟",
      hint: "هذه الضمائر تجعل الفعل الماضي مبنيًا على السكون: كتبتُ، كتبنا، كتبنَ.",
      answers: [
        { id: "a", text: "نعم، اتصل بأحد هذه الضمائر", next: "past_sukoon_type", eval: { fact: "sukoonSet", equals: true } },
        { id: "b", text: "لا", next: "past_is_alif", eval: { fact: "sukoonSet", equals: false } }
      ]
    },

    past_sukoon_type: {
      id: "past_sukoon_type",
      type: "question",
      context: "عرفنا أن علامة البناء السكون، ونحدد الضمير لتكون النتيجة دقيقة.",
      text: "ما الضمير الذي اتصل بالفعل؟",
      hint: "نون النسوة لها صياغة مستقلة، أما تاء الفاعل ونا الفاعلين فهما من ضمائر الرفع المتحركة.",
      answers: [
        { id: "a", text: "نون النسوة", next: "R_past_sukoon_niswa", eval: { fact: "pronounType", equals: "niswa" } },
        { id: "b", text: "تاء الفاعل أو نا الفاعلين", next: "R_past_sukoon_moving", eval: { fact: "pronounType", equals: "moving" } }
      ]
    },

    past_is_alif: {
      id: "past_is_alif",
      type: "question",
      context: "لم تكن واو الجماعة ولا ضمائر السكون، فنفحص ألف الاثنين.",
      text: "هل اتصل بألف الاثنين؟",
      hint: "مثل: كتبا، ذهبا. الماضي مع ألف الاثنين يبنى على الفتح.",
      answers: [
        { id: "a", text: "نعم، اتصل بألف الاثنين", next: "R_past_fatha_alif", eval: { fact: "pronounType", equals: "alif" } },
        { id: "b", text: "لا", next: "R_past_fatha", eval: { fact: "pronounType", equals: "none" } }
      ]
    },

    R_past_fatha: {
      id: "R_past_fatha",
      type: "result",
      coverage: "past.fatha",
      text: "فعل ماضٍ مبني على الفتح الظاهر على آخره."
    },
    R_past_damma_waw: {
      id: "R_past_damma_waw",
      type: "result",
      coverage: "past.damma_waw",
      text: "فعل ماضٍ مبني على الضم لاتصاله بواو الجماعة، وواو الجماعة ضمير متصل مبني في محل رفع فاعل."
    },
    R_past_fatha_alif: {
      id: "R_past_fatha_alif",
      type: "result",
      coverage: "past.fatha_alif",
      text: "فعل ماضٍ مبني على الفتح لاتصاله بألف الاثنين، وألف الاثنين ضمير متصل مبني في محل رفع فاعل."
    },
    R_past_sukoon_niswa: {
      id: "R_past_sukoon_niswa",
      type: "result",
      coverage: "past.sukoon_niswa",
      text: "فعل ماضٍ مبني على السكون لاتصاله بنون النسوة، ونون النسوة ضمير متصل مبني في محل رفع فاعل."
    },
    R_past_sukoon_moving: {
      id: "R_past_sukoon_moving",
      type: "result",
      coverage: "past.sukoon_moving",
      text: "فعل ماضٍ مبني على السكون لاتصاله بضمير رفع متحرك، والضمير المتصل مبني في محل رفع فاعل."
    }
  }
};
