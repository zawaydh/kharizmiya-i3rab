export type ExerciseTree = { startNodeId: string; nodes: Record<string, any> };

export const imperativeVerbTree: ExerciseTree = {
  "startNodeId": "imp_step_1",
  "nodes": {
    "imp_step_1": {
      "id": "imp_step_1",
      "type": "question",
      "context": "عرفنا أن الكلمة فعل.",
      "text": "ما الخطوة التالية؟",
      "hint": "نحدد هل يدل على طلب.",
      "answers": [
        {
          "id": "a",
          "text": "تحديد نوع الفعل",
          "next": "imp_type",
          "correct": true
        },
        {
          "id": "b",
          "text": "تحديد الخبر",
          "next": "imp_step_1",
          "correct": false,
          "hint": "الخبر لا يخص فعل الأمر."
        }
      ]
    },
    "imp_type": {
      "id": "imp_type",
      "type": "question",
      "context": "نفحص معنى الفعل.",
      "text": "هل يدل على طلب؟",
      "hint": "فعل الأمر يطلب حدوث الفعل.",
      "answers": [
        {
          "id": "a",
          "text": "نعم، فعل أمر",
          "next": "imp_attached",
          "correct": true
        },
        {
          "id": "b",
          "text": "لا، فعل ماضٍ",
          "next": "imp_type",
          "correct": false,
          "hint": "الماضي لا يطلب."
        },
        {
          "id": "c",
          "text": "لا، مضارع",
          "next": "imp_type",
          "correct": false,
          "hint": "المضارع يدل على الحاضر أو المستقبل."
        }
      ]
    },
    "imp_attached": {
      "id": "imp_attached",
      "type": "question",
      "context": "عرفنا أنه فعل أمر.",
      "text": "هل اتصل بألف الاثنين أو واو الجماعة أو ياء المخاطبة؟",
      "hint": "في فعل الأمر نكتفي بفحص الضمير المتصل، ثم نستنتج علامة البناء.",
      "answers": [
        {
          "id": "a",
          "text": "واو الجماعة",
          "next": "R_imperative_delete_noon_waw",
          "eval": {
            "fact": "attached",
            "equals": "waw"
          }
        },
        {
          "id": "b",
          "text": "ياء المخاطبة",
          "next": "R_imperative_delete_noon_yaa",
          "eval": {
            "fact": "attached",
            "equals": "yaa"
          }
        },
        {
          "id": "c",
          "text": "ألف الاثنين",
          "next": "R_imperative_delete_noon_alif2",
          "eval": {
            "fact": "attached",
            "equals": "alif2"
          }
        },
        {
          "id": "d",
          "text": "لا",
          "next": "imp_ending",
          "eval": {
            "fact": "attached",
            "equals": "none"
          }
        }
      ]
    },
    "imp_ending": {
      "id": "imp_ending",
      "type": "question",
      "context": "لم يتصل بألف الاثنين أو واو الجماعة أو ياء المخاطبة.",
      "text": "ما حالة آخر الفعل؟",
      "hint": "الصحيح يبنى على السكون، والمعتل على حذف حرف العلة.",
      "answers": [
        {
          "id": "a",
          "text": "صحيح الآخر",
          "next": "R_imperative_sukoon",
          "eval": {
            "fact": "ending",
            "equals": "sahih"
          }
        },
        {
          "id": "b",
          "text": "معتل الآخر",
          "next": "R_imperative_delete_letter",
          "eval": {
            "fact": "ending",
            "equals": "weak"
          }
        }
      ]
    },
    "R_imperative_delete_noon_waw": {
      "id": "R_imperative_delete_noon_waw",
      "type": "result",
      "coverage": "imperative.delete_noon.waw",
      "text": "فعل أمر مبني على حذف النون لاتصاله بواو الجماعة، وواو الجماعة ضمير متصل مبني في محل رفع فاعل."
    },
    "R_imperative_delete_noon_yaa": {
      "id": "R_imperative_delete_noon_yaa",
      "type": "result",
      "coverage": "imperative.delete_noon.yaa",
      "text": "فعل أمر مبني على حذف النون لاتصاله بياء المخاطبة، وياء المخاطبة ضمير متصل مبني في محل رفع فاعل."
    },
    "R_imperative_delete_noon_alif2": {
      "id": "R_imperative_delete_noon_alif2",
      "type": "result",
      "coverage": "imperative.delete_noon.alif2",
      "text": "فعل أمر مبني على حذف النون لاتصاله بألف الاثنين، وألف الاثنين ضمير متصل مبني في محل رفع فاعل."
    },
    "R_imperative_delete_letter": {
      "id": "R_imperative_delete_letter",
      "type": "result",
      "coverage": "imperative.delete_letter",
      "text": "فعل أمر مبني على حذف حرف العلة من آخره."
    },
    "R_imperative_sukoon": {
      "id": "R_imperative_sukoon",
      "type": "result",
      "coverage": "imperative.sukoon",
      "text": "فعل أمر مبني على السكون على آخره."
    }
  }
};
