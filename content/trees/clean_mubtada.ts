export type ExerciseTree = { startNodeId: string; nodes: Record<string, any> };

export const cleanMubtadaTree: ExerciseTree = {
  "startNodeId": "mubtada_type",
  "nodes": {
    "mubtada_type": {
      "id": "mubtada_type",
      "type": "question",
      "text": "هل الكلمة المستهدفة اسم معرب أم اسم مبني أم مصدر مؤول؟",
      "teaching_note": "يا بطل، نبدأ بتحديد طبيعة الاسم: المعرب تظهر عليه علامة الإعراب، والمبني نحدّد نوعه أولًا ثم نقول: مبني في محل...، أما المصدر المؤول فهو تركيب مثل (أن + فعل مضارع) يؤول بمصدر صريح ويعامل معاملة الاسم.",
      "hint": "اسأل نفسك: هل الكلمة اسم معرب؟ أم اسم مبني مثل هذا/الذي/هو؟ أم تركيب يمكن تأويله بمصدر صريح مثل: أن تحفظ = حفظك؟",
      "answers": [
        {
          "id": "a",
          "text": "اسم معرب",
          "next": "mubtada_number",
          "eval": {
            "fact": "nounKind",
            "equals": "mu3rab"
          }
        },
        {
          "id": "b",
          "text": "اسم مبني",
          "next": "mubtada_built_type",
          "eval": {
            "fact": "nounKind",
            "equals": "mabni"
          }
        },
        {
          "id": "c",
          "text": "مصدر مؤول",
          "next": "R_mubtada_masdar",
          "eval": {
            "fact": "nounKind",
            "equals": "masdar"
          }
        }
      ]
    },
    "mubtada_built_type": {
      "id": "mubtada_built_type",
      "type": "question",
      "text": "ما نوع الاسم المبني؟",
      "teaching_note": "نحدد اسم المبني أولًا، ثم نبدأ الإعراب باسمه: ضمير منفصل/اسم إشارة/اسم موصول... مبني في محل رفع مبتدأ.",
      "hint": "نحدد اسم المبني أولًا، ثم نبدأ الإعراب باسمه: ضمير منفصل/اسم إشارة/اسم موصول... مبني في محل رفع مبتدأ.",
      "answers": [
        {
          "id": "a",
          "text": "ضمير منفصل",
          "next": "R_mubtada_pronoun",
          "eval": {
            "fact": "mabniType",
            "equals": "damir"
          }
        },
        {
          "id": "b",
          "text": "اسم إشارة",
          "next": "R_mubtada_demonstrative",
          "eval": {
            "fact": "mabniType",
            "equals": "ishara"
          }
        },
        {
          "id": "c",
          "text": "اسم موصول",
          "next": "R_mubtada_relative",
          "eval": {
            "fact": "mabniType",
            "equals": "mawsool"
          }
        },
        {
          "id": "d",
          "text": "اسم استفهام",
          "next": "R_mubtada_interrogative",
          "eval": {
            "fact": "mabniType",
            "equals": "istifham"
          }
        },
        {
          "id": "e",
          "text": "اسم شرط",
          "next": "R_mubtada_conditional",
          "eval": {
            "fact": "mabniType",
            "equals": "shart"
          }
        },
        {
          "id": "f",
          "text": "كم الخبرية",
          "next": "R_mubtada_kam",
          "eval": {
            "fact": "mabniType",
            "equals": "kam"
          }
        }
      ]
    },
    "mubtada_number": {
      "id": "mubtada_number",
      "type": "question",
      "text": "هل الاسم مفرد أم مثنى أم جمع؟",
      "teaching_note": "العدد يحدد العلامة: المفرد غالبًا بالضمة/الفتحة، المثنى بالألف رفعًا والياء نصبًا، وجمع المذكر السالم بالواو رفعًا والياء نصبًا.",
      "hint": "العدد يحدد العلامة: المفرد غالبًا بالضمة/الفتحة، المثنى بالألف رفعًا والياء نصبًا، وجمع المذكر السالم بالواو رفعًا والياء نصبًا.",
      "answers": [
        {
          "id": "a",
          "text": "مفرد",
          "next": "mubtada_singular_ending",
          "eval": {
            "fact": "number",
            "equals": "singular"
          }
        },
        {
          "id": "b",
          "text": "مثنى",
          "next": "R_mubtada_dual",
          "eval": {
            "fact": "number",
            "equals": "dual"
          }
        },
        {
          "id": "c",
          "text": "جمع مذكر سالم",
          "next": "R_mubtada_jms",
          "eval": {
            "fact": "number",
            "equals": "jms"
          }
        },
        {
          "id": "d",
          "text": "جمع مؤنث سالم",
          "next": "R_mubtada_jfs",
          "eval": {
            "fact": "number",
            "equals": "jfs"
          }
        },
        {
          "id": "e",
          "text": "جمع تكسير",
          "next": "mubtada_broken_ending",
          "eval": {
            "fact": "number",
            "equals": "jt"
          }
        },
        {
          "id": "f",
          "text": "من الأسماء الخمسة",
          "next": "R_mubtada_five",
          "eval": {
            "fact": "number",
            "equals": "five"
          }
        }
      ]
    },
    "mubtada_singular_ending": {
      "id": "mubtada_singular_ending",
      "type": "question",
      "text": "ما حالة آخر الاسم؟",
      "teaching_note": "ننظر إلى آخر الاسم: صحيح الآخر تظهر عليه العلامة، ومعتل الآخر تُقدّر عليه العلامة.",
      "hint": "ننظر إلى آخر الاسم: صحيح الآخر تظهر عليه العلامة، ومعتل الآخر تُقدّر عليه العلامة.",
      "answers": [
        {
          "id": "a",
          "text": "صحيح الآخر",
          "next": "R_mubtada_visible",
          "eval": {
            "fact": "ending",
            "equals": "sahih"
          }
        },
        {
          "id": "b",
          "text": "معتل الآخر",
          "next": "R_mubtada_estimated",
          "eval": {
            "fact": "ending",
            "equals": "moatal"
          }
        }
      ]
    },
    "mubtada_broken_ending": {
      "id": "mubtada_broken_ending",
      "type": "question",
      "text": "ما حالة آخر جمع التكسير؟",
      "teaching_note": "جمع التكسير يعامل غالبًا معاملة المفرد في العلامة: تظهر العلامة على الصحيح وتقدر على المعتل.",
      "hint": "جمع التكسير يعامل غالبًا معاملة المفرد في العلامة: تظهر العلامة على الصحيح وتقدر على المعتل.",
      "answers": [
        {
          "id": "a",
          "text": "صحيح الآخر",
          "next": "R_mubtada_visible",
          "eval": {
            "fact": "ending",
            "equals": "sahih"
          }
        },
        {
          "id": "b",
          "text": "معتل الآخر",
          "next": "R_mubtada_estimated",
          "eval": {
            "fact": "ending",
            "equals": "moatal"
          }
        }
      ]
    },
    "R_mubtada_pronoun": {
      "id": "R_mubtada_pronoun",
      "type": "result",
      "text": "ضمير منفصل مبني في محل رفع مبتدأ",
      "coverage": "mubtada.damir",
      "teaching_note": "ضمير منفصل مبني في محل رفع مبتدأ"
    },
    "R_mubtada_demonstrative": {
      "id": "R_mubtada_demonstrative",
      "type": "result",
      "text": "اسم إشارة مبني في محل رفع مبتدأ",
      "coverage": "mubtada.ishara",
      "teaching_note": "اسم إشارة مبني في محل رفع مبتدأ"
    },
    "R_mubtada_relative": {
      "id": "R_mubtada_relative",
      "type": "result",
      "text": "اسم موصول مبني في محل رفع مبتدأ",
      "coverage": "mubtada.mawsool",
      "teaching_note": "اسم موصول مبني في محل رفع مبتدأ"
    },
    "R_mubtada_interrogative": {
      "id": "R_mubtada_interrogative",
      "type": "result",
      "text": "اسم استفهام مبني في محل رفع مبتدأ",
      "coverage": "mubtada.istifham",
      "teaching_note": "اسم استفهام مبني في محل رفع مبتدأ"
    },
    "R_mubtada_conditional": {
      "id": "R_mubtada_conditional",
      "type": "result",
      "text": "اسم شرط مبني في محل رفع مبتدأ",
      "coverage": "mubtada.shart",
      "teaching_note": "اسم شرط مبني في محل رفع مبتدأ"
    },
    "R_mubtada_kam": {
      "id": "R_mubtada_kam",
      "type": "result",
      "text": "كم الخبرية اسم مبني في محل رفع مبتدأ",
      "coverage": "mubtada.kam",
      "teaching_note": "كم الخبرية اسم مبني في محل رفع مبتدأ"
    },
    "R_mubtada_masdar": {
      "id": "R_mubtada_masdar",
      "type": "result",
      "text": "مصدر مؤول في محل رفع مبتدأ",
      "coverage": "mubtada.masdar",
      "teaching_note": "المصدر المؤول تركيب مثل (أن + الفعل المضارع) يُقدَّر بمصدر صريح؛ مثل: أن تحفظ = حفظك. لذلك يعامل معاملة الاسم، وهنا وقع في محل رفع مبتدأ."
    },
    "R_mubtada_visible": {
      "id": "R_mubtada_visible",
      "type": "result",
      "text": "مبتدأ مرفوع وعلامة رفعه الضمة الظاهرة على آخره",
      "coverage": "mubtada.visible",
      "teaching_note": "مبتدأ مرفوع وعلامة رفعه الضمة الظاهرة على آخره"
    },
    "R_mubtada_estimated": {
      "id": "R_mubtada_estimated",
      "type": "result",
      "text": "مبتدأ مرفوع وعلامة رفعه الضمة المقدرة على آخره",
      "coverage": "mubtada.estimated",
      "teaching_note": "مبتدأ مرفوع وعلامة رفعه الضمة المقدرة على آخره"
    },
    "R_mubtada_dual": {
      "id": "R_mubtada_dual",
      "type": "result",
      "text": "مبتدأ مرفوع وعلامة رفعه الألف لأنه مثنى",
      "coverage": "mubtada.dual",
      "teaching_note": "مبتدأ مرفوع وعلامة رفعه الألف لأنه مثنى"
    },
    "R_mubtada_jms": {
      "id": "R_mubtada_jms",
      "type": "result",
      "text": "مبتدأ مرفوع وعلامة رفعه الواو لأنه جمع مذكر سالم",
      "coverage": "mubtada.jms",
      "teaching_note": "مبتدأ مرفوع وعلامة رفعه الواو لأنه جمع مذكر سالم"
    },
    "R_mubtada_jfs": {
      "id": "R_mubtada_jfs",
      "type": "result",
      "text": "مبتدأ مرفوع وعلامة رفعه الضمة الظاهرة على آخره لأنه جمع مؤنث سالم",
      "coverage": "mubtada.jfs",
      "teaching_note": "مبتدأ مرفوع وعلامة رفعه الضمة الظاهرة على آخره لأنه جمع مؤنث سالم"
    },
    "R_mubtada_five": {
      "id": "R_mubtada_five",
      "type": "result",
      "text": "مبتدأ مرفوع وعلامة رفعه الواو لأنه من الأسماء الخمسة",
      "coverage": "mubtada.five",
      "teaching_note": "مبتدأ مرفوع وعلامة رفعه الواو لأنه من الأسماء الخمسة"
    }
  }
};
