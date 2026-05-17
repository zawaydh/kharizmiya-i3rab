export type ExerciseTree = { startNodeId: string; nodes: Record<string, any> };

export const firstWordTree: ExerciseTree = {
  "startNodeId": "fw_decision_1",
  "nodes": {
    "fw_decision_1": {
      "id": "fw_decision_1",
      "type": "question",
      "context": "نبدأ من الكلمة الأولى فقط.",
      "text": "من أين نبدأ؟",
      "hint": "نحدد نوع الكلمة قبل أي إعراب.",
      "answers": [
        {
          "id": "a",
          "text": "اسم",
          "next": "R_first_noun",
          "eval": {
            "fact": "wordType",
            "equals": "noun"
          }
        },
        {
          "id": "b",
          "text": "فعل",
          "next": "fw_verb_tense",
          "eval": {
            "fact": "wordType",
            "equals": "verb"
          }
        },
        {
          "id": "c",
          "text": "حرف",
          "next": "fw_particle_after",
          "eval": {
            "fact": "wordType",
            "equals": "particle"
          }
        }
      ]
    },
    "fw_verb_tense": {
      "id": "fw_verb_tense",
      "type": "question",
      "context": "عرفنا أن الكلمة فعل.",
      "text": "ماذا نتحقق الآن؟",
      "hint": "بعد الفعل نحدد الزمن.",
      "answers": [
        {
          "id": "a",
          "text": "ماضٍ",
          "next": "R_first_past",
          "eval": {
            "fact": "verbType",
            "equals": "past"
          }
        },
        {
          "id": "b",
          "text": "مضارع",
          "next": "R_first_present",
          "eval": {
            "fact": "verbType",
            "equals": "present"
          }
        },
        {
          "id": "c",
          "text": "أمر",
          "next": "R_first_imperative",
          "eval": {
            "fact": "verbType",
            "equals": "imperative"
          }
        }
      ]
    },
    "fw_particle_after": {
      "id": "fw_particle_after",
      "type": "question",
      "context": "عرفنا أن الكلمة حرف.",
      "text": "ماذا نفحص بعد الحرف؟",
      "hint": "الحرف يوجّه ما بعده.",
      "answers": [
        {
          "id": "a",
          "text": "جاء بعده فعل",
          "next": "R_first_particle_verb",
          "eval": {
            "fact": "afterParticle",
            "equals": "verb"
          }
        },
        {
          "id": "b",
          "text": "جاء بعده اسم",
          "next": "R_first_particle_noun",
          "eval": {
            "fact": "afterParticle",
            "equals": "noun"
          }
        }
      ]
    },
    "R_first_noun": {
      "id": "R_first_noun",
      "type": "result",
      "coverage": "first.noun",
      "text": "الكلمة الأولى اسم؛ ننتقل بعدها إلى مسار الاسم بحسب موقعه."
    },
    "R_first_past": {
      "id": "R_first_past",
      "type": "result",
      "coverage": "first.verb.past",
      "text": "الكلمة الأولى فعل ماضٍ؛ الخطوة التالية تحديد علامة البناء."
    },
    "R_first_present": {
      "id": "R_first_present",
      "type": "result",
      "coverage": "first.verb.present",
      "text": "الكلمة الأولى فعل مضارع؛ الخطوة التالية فحص أداة نصب أو أداة جزم."
    },
    "R_first_imperative": {
      "id": "R_first_imperative",
      "type": "result",
      "coverage": "first.verb.imperative",
      "text": "الكلمة الأولى فعل أمر؛ الخطوة التالية فحص الاتصال وآخر الفعل."
    },
    "R_first_particle_verb": {
      "id": "R_first_particle_verb",
      "type": "result",
      "coverage": "first.particle.verb",
      "text": "حرف مبني لا محل له من الإعراب، وبعده فعل."
    },
    "R_first_particle_noun": {
      "id": "R_first_particle_noun",
      "type": "result",
      "coverage": "first.particle.noun",
      "text": "حرف مبني لا محل له من الإعراب، وبعده اسم."
    }
  }
};
