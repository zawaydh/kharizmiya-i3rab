export type ExerciseTree = { startNodeId: string; nodes: Record<string, any> };

export const ismManqousTree: ExerciseTree = {
  "startNodeId": "manqous_relation_gate",
  "nodes": {
    "manqous_relation_gate": {
      "id": "manqous_relation_gate",
      "type": "question",
      "context": "في الاسم المنقوص لا نبدأ بشكل الياء وحده، بل نبدأ بالموقع الإعرابي: رفع أو نصب أو جر، ثم نفسر ظهور العلامة أو تقديرها.",
      "text": "ما أول خطوة صحيحة في الاسم المنقوص؟",
      "hint": "الموقع الإعرابي أولًا؛ لأن النصب تظهر فيه الفتحة، أما الرفع والجر فتقدر العلامة غالبًا للثقل، وقد تحذف الياء في بعض الصور.",
      "answers": [
        { "id": "a", "text": "أحدد موقعه الإعرابي أولًا، ثم أفحص صورة الياء", "next": "manqous_step_1", "correct": true },
        { "id": "b", "text": "أحكم عليه من وجود الياء فقط", "next": "manqous_relation_gate", "correct": false, "hint": "وجود الياء أو حذفها لا يكفي وحده؛ نحتاج الموقع الإعرابي أولًا." },
        { "id": "c", "text": "أبحث عن زمن الفعل", "next": "manqous_relation_gate", "correct": false, "hint": "الاسم المنقوص اسم، وليس فعلًا؛ لذلك لا نسأل عن الزمن." }
      ]
    },
    "manqous_step_1": {
      "id": "manqous_step_1",
      "type": "question",
      "context": "نبدأ من الموقع الإعرابي ثم ننتبه إلى صورة الاسم المنقوص؛ لأن العلامة قد تكون مقدرة أو تظهر في النصب.",
      "text": "ما الخطوة الصحيحة؟",
      "hint": "الاسم المنقوص اسم آخره ياء لازمة قبلها كسرة. بعد تحديد أنه اسم، نحدد موقعه: رفع أو نصب أو جر، ثم نعلل حذف الياء أو بقاءها. عد للسؤال وانقر على الإجابة الصحيحة لنكمل الإعراب.",
      "answers": [
        {
          "id": "a",
          "text": "فحص الاسم المنقوص",
          "next": "manqous_identity",
          "correct": true
        },
        {
          "id": "b",
          "text": "تحديد زمن الفعل",
          "next": "manqous_step_1",
          "correct": false,
          "hint": "الزمن للفعل لا للاسم."
        }
      ]
    },
    "manqous_identity": {
      "id": "manqous_identity",
      "type": "question",
      "context": "نفحص آخر الاسم.",
      "text": "هل آخره ياء لازمة قبلها كسرة؟",
      "hint": "الاسم المنقوص ينتهي بياء لازمة قبلها كسرة، مثل: القاضي، الداعي. وقد تحذف الياء في بعض المواضع ويبقى التنوين دليلاً عليها. عد للسؤال وانقر على الإجابة الصحيحة لنكمل الإعراب.",
      "answers": [
        {
          "id": "a",
          "text": "نعم، اسم منقوص",
          "next": "manqous_case",
          "correct": true
        },
        {
          "id": "b",
          "text": "لا",
          "next": "manqous_identity",
          "correct": false,
          "hint": "في أمثلة هذا المسار الكلمة اسم منقوص."
        }
      ]
    },
    "manqous_case": {
      "id": "manqous_case",
      "type": "question",
      "context": "عرفنا أنه اسم منقوص.",
      "text": "ما موقعه الإعرابي؟",
      "hint": "في الاسم المنقوص: تظهر الفتحة في النصب، وتقدر الضمة في الرفع والكسرة في الجر بسبب الثقل. وإذا حذفت الياء نذكر أنها محذوفة. عد للسؤال وانقر على الإجابة الصحيحة لنكمل الإعراب.",
      "answers": [
        {
          "id": "a",
          "text": "منصوب",
          "next": "R_manqous_nasb",
          "eval": {
            "fact": "case",
            "equals": "nasb"
          }
        },
        {
          "id": "b",
          "text": "مرفوع",
          "next": "manqous_y_raf3",
          "eval": {
            "fact": "case",
            "equals": "raf3"
          }
        },
        {
          "id": "c",
          "text": "مجرور",
          "next": "manqous_y_jar",
          "eval": {
            "fact": "case",
            "equals": "jar"
          }
        }
      ]
    },
    "manqous_y_raf3": {
      "id": "manqous_y_raf3",
      "type": "question",
      "context": "عرفنا أنه مرفوع.",
      "text": "هل الياء مذكورة أم محذوفة؟",
      "hint": "في النكرة غالبًا تحذف الياء ويظهر التنوين.",
      "answers": [
        {
          "id": "a",
          "text": "الياء مذكورة",
          "next": "R_manqous_raf3_kept",
          "eval": {
            "fact": "yStatus",
            "equals": "kept"
          }
        },
        {
          "id": "b",
          "text": "الياء محذوفة",
          "next": "R_manqous_raf3_deleted",
          "eval": {
            "fact": "yStatus",
            "equals": "deleted"
          }
        }
      ]
    },
    "manqous_y_jar": {
      "id": "manqous_y_jar",
      "type": "question",
      "context": "عرفنا أنه مجرور.",
      "text": "هل الياء مذكورة أم محذوفة؟",
      "hint": "في الجر تقدر الكسرة على الياء المحذوفة أو المذكورة.",
      "answers": [
        {
          "id": "a",
          "text": "الياء مذكورة",
          "next": "R_manqous_jar_kept",
          "eval": {
            "fact": "yStatus",
            "equals": "kept"
          }
        },
        {
          "id": "b",
          "text": "الياء محذوفة",
          "next": "R_manqous_jar_deleted",
          "eval": {
            "fact": "yStatus",
            "equals": "deleted"
          }
        }
      ]
    },
    "R_manqous_nasb": {
      "id": "R_manqous_nasb",
      "type": "result",
      "coverage": "manqous.nasb",
      "text": "اسم منقوص منصوب وعلامة نصبه الفتحة الظاهرة على آخره."
    },
    "R_manqous_raf3_kept": {
      "id": "R_manqous_raf3_kept",
      "type": "result",
      "coverage": "manqous.raf3.kept",
      "text": "اسم منقوص مرفوع وعلامة رفعه الضمة المقدرة على الياء منع من ظهورها الثقل."
    },
    "R_manqous_raf3_deleted": {
      "id": "R_manqous_raf3_deleted",
      "type": "result",
      "coverage": "manqous.raf3.deleted",
      "text": "اسم منقوص مرفوع وعلامة رفعه الضمة المقدرة على الياء المحذوفة منع من ظهورها الثقل."
    },
    "R_manqous_jar_kept": {
      "id": "R_manqous_jar_kept",
      "type": "result",
      "coverage": "manqous.jar.kept",
      "text": "اسم منقوص مجرور وعلامة جره الكسرة المقدرة على الياء منع من ظهورها الثقل."
    },
    "R_manqous_jar_deleted": {
      "id": "R_manqous_jar_deleted",
      "type": "result",
      "coverage": "manqous.jar.deleted",
      "text": "اسم منقوص مجرور وعلامة جره الكسرة المقدرة على الياء المحذوفة منع من ظهورها الثقل."
    }
  }
};
