export type ExerciseTree = { startNodeId: string; nodes: Record<string, any> };

export const attachedPronounsTree: ExerciseTree = {
  "startNodeId": "pronoun_step_1",
  "nodes": {
    "pronoun_step_1": {
      "id": "pronoun_step_1",
      "type": "question",
      "context": "عرفنا أن الكلمة ضمير.",
      "text": "ما القرار التالي؟",
      "hint": "الضمير يأخذ محل الاسم الذي ناب عنه.",
      "answers": [
        {
          "id": "a",
          "text": "تحديد المحل الإعرابي",
          "next": "pronoun_position",
          "correct": true
        },
        {
          "id": "b",
          "text": "تحديد الحركة فقط",
          "next": "pronoun_step_1",
          "correct": false,
          "hint": "الضمائر مبنية؛ المهم المحل."
        }
      ]
    },
    "pronoun_position": {
      "id": "pronoun_position",
      "type": "question",
      "context": "نبحث عن موقع الضمير.",
      "text": "هل حلّ محل اسم مرفوع أم منصوب أم مجرور؟",
      "hint": "ضع اسمًا ظاهرًا مكان الضمير.",
      "answers": [
        {
          "id": "a",
          "text": "محل رفع",
          "next": "pronoun_form_raf3",
          "eval": {
            "fact": "position",
            "equals": "raf3"
          }
        },
        {
          "id": "b",
          "text": "محل نصب",
          "next": "pronoun_form_nasb",
          "eval": {
            "fact": "position",
            "equals": "nasb"
          }
        },
        {
          "id": "c",
          "text": "محل جر",
          "next": "R_pronoun_jar",
          "eval": {
            "fact": "position",
            "equals": "jar"
          }
        }
      ]
    },
    "pronoun_form_raf3": {
      "id": "pronoun_form_raf3",
      "type": "question",
      "context": "عرفنا أن محل الضمير رفع.",
      "text": "ما شكل الضمير؟",
      "hint": "ضمير متصل أو ضمير منفصل.",
      "answers": [
        {
          "id": "a",
          "text": "ضمير رفع متصل",
          "next": "R_pronoun_raf3_attached",
          "eval": {
            "fact": "form",
            "equals": "attached"
          }
        },
        {
          "id": "b",
          "text": "ضمير رفع منفصل",
          "next": "R_pronoun_raf3_separate",
          "eval": {
            "fact": "form",
            "equals": "separate"
          }
        }
      ]
    },
    "pronoun_form_nasb": {
      "id": "pronoun_form_nasb",
      "type": "question",
      "context": "عرفنا أن محل الضمير نصب.",
      "text": "ما شكل الضمير؟",
      "hint": "إياك ضمير منفصل، والكاف/الهاء ضمائر متصلة.",
      "answers": [
        {
          "id": "a",
          "text": "ضمير نصب متصل",
          "next": "R_pronoun_nasb_attached",
          "eval": {
            "fact": "form",
            "equals": "attached"
          }
        },
        {
          "id": "b",
          "text": "ضمير نصب منفصل",
          "next": "R_pronoun_nasb_separate",
          "eval": {
            "fact": "form",
            "equals": "separate"
          }
        }
      ]
    },
    "R_pronoun_raf3_attached": {
      "id": "R_pronoun_raf3_attached",
      "type": "result",
      "coverage": "pronoun.raf3.attached",
      "text": "ضمير رفع متصل مبني في محل رفع."
    },
    "R_pronoun_raf3_separate": {
      "id": "R_pronoun_raf3_separate",
      "type": "result",
      "coverage": "pronoun.raf3.separate",
      "text": "ضمير رفع منفصل مبني في محل رفع."
    },
    "R_pronoun_nasb_attached": {
      "id": "R_pronoun_nasb_attached",
      "type": "result",
      "coverage": "pronoun.nasb.attached",
      "text": "ضمير نصب متصل مبني في محل نصب."
    },
    "R_pronoun_nasb_separate": {
      "id": "R_pronoun_nasb_separate",
      "type": "result",
      "coverage": "pronoun.nasb.separate",
      "text": "ضمير نصب منفصل مبني في محل نصب."
    },
    "R_pronoun_jar": {
      "id": "R_pronoun_jar",
      "type": "result",
      "coverage": "pronoun.jar",
      "text": "ضمير متصل مبني في محل جر."
    }
  }
};
