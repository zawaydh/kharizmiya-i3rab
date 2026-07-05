export type ExerciseTree = { startNodeId: string; nodes: Record<string, any> };

export const attachedPronounsTree: ExerciseTree = {
  "startNodeId": "pronoun_relation_gate",
  "nodes": {
    "pronoun_relation_gate": {
      "id": "pronoun_relation_gate",
      "type": "question",
      "context": "الضمير اسم مبني، لذلك لا نبحث عن حركة آخره أولًا، بل نسأل: ما الموقع الذي شغله في الجملة؟",
      "text": "كيف نبدأ إعراب الضمير المتصل أو المنفصل؟",
      "hint": "استبدل الضمير باسم ظاهر لتفهم العلاقة: مثل هذا كتابه، أي هذا كتاب محمد. عندها تعرف هل هو في رفع أو نصب أو جر، وهل الجر بحرف أو بالإضافة.",
      "answers": [
        { "id": "a", "text": "أحدد علاقته وموقعه: رفع أم نصب أم جر", "next": "pronoun_step_1", "correct": true },
        { "id": "b", "text": "أبحث عن حركة آخره فقط", "next": "pronoun_relation_gate", "correct": false, "hint": "الضمائر مبنية؛ لذلك الأهم هو المحل الإعرابي لا الحركة الظاهرة." },
        { "id": "c", "text": "أعدّه دائمًا فاعلًا", "next": "pronoun_relation_gate", "correct": false, "hint": "الضمير قد يكون في محل رفع أو نصب أو جر بحسب علاقته في الجملة." }
      ]
    },
    "pronoun_step_1": {
      "id": "pronoun_step_1",
      "type": "question",
      "context": "عرفنا أن الكلمة ضمير، والضمائر مبنية، لذلك نبحث عن المحل الإعرابي الذي شغله الضمير.",
      "text": "ما الخطوة الصحيحة الآن؟",
      "hint": "ضع اسمًا ظاهرًا مكان الضمير لتعرف موقعه. مثل: هذا كتابه، أصلها هذا كتاب محمد؛ فالهاء دلت على المضاف إليه. عد للسؤال وانقر على الإجابة الصحيحة لنكمل الإعراب.",
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
      "hint": "ضع اسمًا ظاهرًا مكان الضمير. مثال: هذا كتابه = هذا كتاب محمد؛ فإذا صار الاسم بعد مضاف فهو في محل جر بالإضافة، وإذا جاء بعد حرف جر فهو في محل جر بحرف الجر. عد للسؤال وانقر على الإجابة الصحيحة لنكمل الإعراب.",
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
      "hint": "الضمير المتصل لا يستقل بنفسه مثل التاء في كتبتُ، والضمير المنفصل كلمة مستقلة مثل أنا وهو.",
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
      "hint": "إياك ضمير منفصل في محل نصب، والكاف أو الهاء إذا اتصلتا بالفعل فهما ضميران متصلان في محل نصب.",
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
      "text": "ضمير متصل مبني في محل رفع."
    },
    "R_pronoun_raf3_separate": {
      "id": "R_pronoun_raf3_separate",
      "type": "result",
      "coverage": "pronoun.raf3.separate",
      "text": "ضمير منفصل مبني في محل رفع."
    },
    "R_pronoun_nasb_attached": {
      "id": "R_pronoun_nasb_attached",
      "type": "result",
      "coverage": "pronoun.nasb.attached",
      "text": "ضمير متصل مبني في محل نصب."
    },
    "R_pronoun_nasb_separate": {
      "id": "R_pronoun_nasb_separate",
      "type": "result",
      "coverage": "pronoun.nasb.separate",
      "text": "ضمير منفصل مبني في محل نصب."
    },
    "R_pronoun_jar": {
      "id": "R_pronoun_jar",
      "type": "result",
      "coverage": "pronoun.jar",
      "text": "إذن إعراب الكلمة: ضمير متصل مبني في محل جر، ويحدد السياق هل هو جر بحرف الجر أو جر بالإضافة."
    }
  }
};
