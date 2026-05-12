export type ExerciseTree = { startNodeId: string; nodes: Record<string, any> };

export const firstWordTree: ExerciseTree = {
  "startNodeId": "fw_decision_1",
  "nodes": {
    "fw_decision_1": {
      "id": "fw_decision_1",
      "type": "question",
      "context": "نبدأ من الكلمة المحددة فقط؛ لا نقفز إلى الإعراب.",
      "text": "ما نوع الكلمة المحددة؟",
      "hint": "نحدد: اسم، فعل، أو حرف؛ ثم نبحث عن العامل إن وجد.",
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
      "context": "عرفنا أنها فعل. الآن نحدد الزمن؛ لأن الزمن يفتح المسار المناسب.",
      "text": "ما زمن الفعل؟",
      "hint": "الماضي وقع وانتهى، المضارع للحاضر أو المستقبل، والأمر طلب.",
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
      "context": "عرفنا أنها حرف. الحرف قد يكون عاملًا يؤثر فيما بعده.",
      "text": "ماذا جاء بعد هذا الحرف؟",
      "hint": "العامل: كلمة تؤثر في إعراب ما بعدها.",
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
      "text": "الكلمة المحددة اسم؛ نبحث بعدها عن موقعه وهل سبق بعامل يؤثر فيه."
    },
    "R_first_past": {
      "id": "R_first_past",
      "type": "result",
      "coverage": "first.verb.past",
      "text": "الكلمة المحددة فعل ماضٍ؛ ننتقل إلى مسار البناء بحسب الاتصال."
    },
    "R_first_present": {
      "id": "R_first_present",
      "type": "result",
      "coverage": "first.verb.present",
      "text": "الكلمة المحددة فعل مضارع؛ نبحث عن العامل: أداة نصب أو أداة جزم أو لا عامل."
    },
    "R_first_imperative": {
      "id": "R_first_imperative",
      "type": "result",
      "coverage": "first.verb.imperative",
      "text": "الكلمة المحددة فعل أمر؛ نفحص الضمير وآخر الفعل لبناء العلامة."
    },
    "R_first_particle_verb": {
      "id": "R_first_particle_verb",
      "type": "result",
      "coverage": "first.particle.verb",
      "text": "حرف مبني لا محل له من الإعراب، وبعده فعل؛ ننتقل لمسار الفعل."
    },
    "R_first_particle_noun": {
      "id": "R_first_particle_noun",
      "type": "result",
      "coverage": "first.particle.noun",
      "text": "حرف مبني لا محل له من الإعراب، وقد يعمل في الاسم بعده بحسب نوع الحرف."
    }
  }
};
