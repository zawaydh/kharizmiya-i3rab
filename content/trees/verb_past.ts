export type ExerciseTree = { startNodeId: string; nodes: Record<string, any> };

export const pastVerbTree: ExerciseTree = {
  "startNodeId": "past_step_1",
  "nodes": {
    "past_step_1": {
      "id": "past_step_1",
      "type": "question",
      "context": "عرفنا أن الكلمة فعل.",
      "text": "ما الخطوة التالية؟",
      "hint": "بعد الفعل نحدد الزمن.",
      "answers": [
        {
          "id": "a",
          "text": "تحديد زمن الفعل",
          "next": "past_tense",
          "correct": true
        },
        {
          "id": "b",
          "text": "تحديد الفاعل مباشرة",
          "next": "past_step_1",
          "correct": false,
          "hint": "قبل الفاعل نثبت زمن الفعل."
        },
        {
          "id": "c",
          "text": "تحديد الخبر",
          "next": "past_step_1",
          "correct": false,
          "hint": "الخبر يخص الجملة الاسمية."
        }
      ]
    },
    "past_tense": {
      "id": "past_tense",
      "type": "question",
      "context": "انتقلنا إلى الزمن.",
      "text": "ما زمن الفعل؟",
      "hint": "الماضي يدل على حدث وقع وانتهى.",
      "answers": [
        {
          "id": "a",
          "text": "ماضٍ",
          "next": "past_has_pronoun",
          "correct": true
        },
        {
          "id": "b",
          "text": "مضارع",
          "next": "past_tense",
          "correct": false,
          "hint": "المضارع يدل على الحاضر أو المستقبل."
        },
        {
          "id": "c",
          "text": "أمر",
          "next": "past_tense",
          "correct": false,
          "hint": "الأمر طلب حدوث الفعل."
        }
      ]
    },
    "past_has_pronoun": {
      "id": "past_has_pronoun",
      "type": "question",
      "context": "عرفنا أنه فعل ماضٍ.",
      "text": "هل اتصل بضمير؟",
      "hint": "اتصال الضمير يغيّر علامة البناء.",
      "answers": [
        {
          "id": "a",
          "text": "لم يتصل بضمير",
          "next": "R_past_fatha",
          "eval": {
            "fact": "hasPronoun",
            "equals": false
          }
        },
        {
          "id": "b",
          "text": "اتصل بضمير",
          "next": "past_pronoun_type",
          "eval": {
            "fact": "hasPronoun",
            "equals": true
          }
        }
      ]
    },
    "past_pronoun_type": {
      "id": "past_pronoun_type",
      "type": "question",
      "context": "عرفنا أن الفعل الماضي اتصل بضمير.",
      "text": "ما نوع الضمير المتصل؟",
      "hint": "نوع الضمير يقودنا لعلامة البناء.",
      "answers": [
        {
          "id": "a",
          "text": "واو الجماعة",
          "next": "R_past_damma_waw",
          "eval": {
            "fact": "pronounType",
            "equals": "waw"
          }
        },
        {
          "id": "b",
          "text": "ألف الاثنين",
          "next": "R_past_fatha_alif",
          "eval": {
            "fact": "pronounType",
            "equals": "alif"
          }
        },
        {
          "id": "c",
          "text": "نون النسوة",
          "next": "R_past_sukoon_niswa",
          "eval": {
            "fact": "pronounType",
            "equals": "niswa"
          }
        },
        {
          "id": "d",
          "text": "ضمير رفع متحرك",
          "next": "R_past_sukoon_moving",
          "eval": {
            "fact": "pronounType",
            "equals": "moving"
          }
        }
      ]
    },
    "R_past_fatha": {
      "id": "R_past_fatha",
      "type": "result",
      "coverage": "past.fatha",
      "text": "فعل ماضٍ مبني على الفتح الظاهر على آخره."
    },
    "R_past_damma_waw": {
      "id": "R_past_damma_waw",
      "type": "result",
      "coverage": "past.damma_waw",
      "text": "فعل ماضٍ مبني على الضم لاتصاله بواو الجماعة، وواو الجماعة ضمير متصل مبني في محل رفع فاعل."
    },
    "R_past_fatha_alif": {
      "id": "R_past_fatha_alif",
      "type": "result",
      "coverage": "past.fatha_alif",
      "text": "فعل ماضٍ مبني على الفتح لاتصاله بألف الاثنين، وألف الاثنين ضمير متصل مبني في محل رفع فاعل."
    },
    "R_past_sukoon_niswa": {
      "id": "R_past_sukoon_niswa",
      "type": "result",
      "coverage": "past.sukoon_niswa",
      "text": "فعل ماضٍ مبني على السكون لاتصاله بنون النسوة، ونون النسوة ضمير متصل مبني في محل رفع فاعل."
    },
    "R_past_sukoon_moving": {
      "id": "R_past_sukoon_moving",
      "type": "result",
      "coverage": "past.sukoon_moving",
      "text": "فعل ماضٍ مبني على السكون لاتصاله بضمير رفع متحرك، والضمير المتصل مبني في محل رفع فاعل."
    }
  }
};
