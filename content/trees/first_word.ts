export type ExerciseTree = { startNodeId: string; nodes: Record<string, any> };

export const firstWordTree: ExerciseTree = {
  startNodeId: "first_word_type",
  nodes: {
    first_word_type: {
      id: "first_word_type",
      type: "question",
      text: "هل الكلمة الأولى اسم أم فعل أم حرف؟",
      teaching_note: "عزيزي الطالب، أول خطوة لإعراب الكلمة الأولى هي تحديد نوعها؛ لأن تصنيف الكلمة يحدد مسار الإعراب الخاص بها.",
      hint: "انتبه: الاسم يقبل أل التعريف أو التنوين، والفعل مرتبط بزمن، والحرف لا يدل على معنى كامل وحده بل يؤدي وظيفة في الجملة.",
      answers: [
        { id: "a", text: "اسم", next: "R_first_noun", eval: { fact: "wordType", equals: "noun" } },
        { id: "b", text: "فعل", next: "first_verb_type", eval: { fact: "wordType", equals: "verb" } },
        { id: "c", text: "حرف", next: "first_particle_after", eval: { fact: "wordType", equals: "particle" } }
      ]
    },
    first_verb_type: {
      id: "first_verb_type",
      type: "question",
      text: "ما نوع الفعل؟",
      teaching_note: "بعد معرفة أنه فعل نحدد زمنه: ماضٍ، مضارع، أمر، ثم نرجع إلى شجرة الفعل المناسبة.",
      hint: "اسأل عن الزمن: حدث وانتهى؟ يحدث الآن/مستقبلًا؟ طلب؟",
      answers: [
        { id: "a", text: "فعل ماضٍ", next: "R_first_past", eval: { fact: "verbType", equals: "past" } },
        { id: "b", text: "فعل مضارع", next: "R_first_present", eval: { fact: "verbType", equals: "present" } },
        { id: "c", text: "فعل أمر", next: "R_first_imperative", eval: { fact: "verbType", equals: "imperative" } }
      ]
    },
    first_particle_after: {
      id: "first_particle_after",
      type: "question",
      text: "ماذا جاء بعد الحرف؟",
      teaching_note: "الحرف نفسه مبني لا محل له، لكن معرفة ما بعده تساعد الطالب على تصور نوع الجملة.",
      hint: "حرف + فعل يمهد لجملة فعلية، وحرف + اسم يمهد لجملة اسمية أو شبه جملة بحسب الحرف.",
      answers: [
        { id: "a", text: "جاء بعده فعل", next: "R_first_particle_verb", eval: { fact: "afterParticle", equals: "verb" } },
        { id: "b", text: "جاء بعده اسم", next: "R_first_particle_noun", eval: { fact: "afterParticle", equals: "noun" } }
      ]
    },
    R_first_noun: { id: "R_first_noun", type: "result", coverage: "first.noun", text: "الكلمة الأولى اسم؛ ننتقل بعدها إلى شجرة الاسم لتحديد: معرب/مبني/مصدر مؤول ثم الإعراب الدقيق بحسب موقعها" },
    R_first_past: { id: "R_first_past", type: "result", coverage: "first.verb.past", text: "الكلمة الأولى فعل ماضٍ؛ ننتقل إلى خوارزمية الفعل الماضي لتحديد علامة البناء" },
    R_first_present: { id: "R_first_present", type: "result", coverage: "first.verb.present", text: "الكلمة الأولى فعل مضارع؛ ننتقل إلى خوارزمية الفعل المضارع بدءًا من الأداة السابقة له" },
    R_first_imperative: { id: "R_first_imperative", type: "result", coverage: "first.verb.imperative", text: "الكلمة الأولى فعل أمر؛ ننتقل إلى خوارزمية فعل الأمر لتحديد علامة البناء" },
    R_first_particle_verb: { id: "R_first_particle_verb", type: "result", coverage: "first.particle.verb", text: "حرف مبني لا محل له من الإعراب، وبعده فعل فتتجه الجملة إلى تركيب فعلي" },
    R_first_particle_noun: { id: "R_first_particle_noun", type: "result", coverage: "first.particle.noun", text: "حرف مبني لا محل له من الإعراب، وبعده اسم فتتجه الجملة إلى تركيب اسمي أو شبه جملة بحسب الحرف" }
  }
};
