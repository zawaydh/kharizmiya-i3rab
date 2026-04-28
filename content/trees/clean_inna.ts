export type ExerciseTree = { startNodeId: string; nodes: Record<string, any> };

export const cleanInnaTree: ExerciseTree = {
  "startNodeId": "inna_target",
  "nodes": {
    "inna_target": {
      "id": "inna_target",
      "type": "question",
      "text": "ما الكلمة المراد إعرابها؟",
      "teaching_note": "بعد دخول الناسخ نحدد: هل الكلمة اسم الناسخ أم خبره؟ لأن الحكم الإعرابي يختلف.",
      "hint": "بعد دخول الناسخ نحدد: هل الكلمة اسم الناسخ أم خبره؟ لأن الحكم الإعرابي يختلف.",
      "answers": [
        {
          "id": "a",
          "text": "اسم إن",
          "next": "inna_ism_type",
          "eval": {
            "fact": "targetRole",
            "equals": "ism"
          }
        },
        {
          "id": "b",
          "text": "خبر إن",
          "next": "inna_khabar_kind",
          "eval": {
            "fact": "targetRole",
            "equals": "khabar"
          }
        }
      ]
    },
    "inna_ism_type": {
      "id": "inna_ism_type",
      "type": "question",
      "text": "في مسار اسم إن: هل الكلمة المستهدفة اسم معرب أم اسم مبني أم مصدر مؤول؟",
      "teaching_note": "نبدأ بتحديد طبيعة الاسم؛ لأن الاسم المعرب تظهر عليه علامة الإعراب، أما الاسم المبني فيُعرب في محل، والمصدر المؤول يعامل معاملة الاسم.",
      "hint": "نبدأ بتحديد طبيعة الاسم؛ لأن الاسم المعرب تظهر عليه علامة الإعراب، أما الاسم المبني فيُعرب في محل، والمصدر المؤول يعامل معاملة الاسم.",
      "answers": [
        {
          "id": "a",
          "text": "اسم معرب",
          "next": "inna_ism_number",
          "eval": {
            "fact": "nounKind",
            "equals": "mu3rab"
          }
        },
        {
          "id": "b",
          "text": "اسم مبني",
          "next": "inna_ism_built_type",
          "eval": {
            "fact": "nounKind",
            "equals": "mabni"
          }
        },
        {
          "id": "c",
          "text": "مصدر مؤول",
          "next": "R_inna_ism_masdar",
          "eval": {
            "fact": "nounKind",
            "equals": "masdar"
          }
        }
      ]
    },
    "inna_ism_built_type": {
      "id": "inna_ism_built_type",
      "type": "question",
      "text": "ما نوع الاسم المبني؟",
      "teaching_note": "نحدد اسم المبني أولًا، ثم نبدأ الإعراب باسمه: ضمير منفصل/اسم إشارة/اسم موصول... مبني في محل نصب اسم إن.",
      "hint": "نحدد اسم المبني أولًا، ثم نبدأ الإعراب باسمه: ضمير منفصل/اسم إشارة/اسم موصول... مبني في محل نصب اسم إن.",
      "answers": [
        {
          "id": "a",
          "text": "ضمير متصل",
          "next": "R_inna_ism_pronoun",
          "eval": {
            "fact": "mabniType",
            "equals": "damir"
          }
        },
        {
          "id": "b",
          "text": "اسم إشارة",
          "next": "R_inna_ism_demonstrative",
          "eval": {
            "fact": "mabniType",
            "equals": "ishara"
          }
        },
        {
          "id": "c",
          "text": "اسم موصول",
          "next": "R_inna_ism_relative",
          "eval": {
            "fact": "mabniType",
            "equals": "mawsool"
          }
        },
        {
          "id": "d",
          "text": "اسم استفهام",
          "next": "R_inna_ism_interrogative",
          "eval": {
            "fact": "mabniType",
            "equals": "istifham"
          }
        },
        {
          "id": "e",
          "text": "اسم شرط",
          "next": "R_inna_ism_conditional",
          "eval": {
            "fact": "mabniType",
            "equals": "shart"
          }
        },
        {
          "id": "f",
          "text": "كم الخبرية",
          "next": "R_inna_ism_kam",
          "eval": {
            "fact": "mabniType",
            "equals": "kam"
          }
        }
      ]
    },
    "inna_ism_number": {
      "id": "inna_ism_number",
      "type": "question",
      "text": "هل الاسم مفرد أم مثنى أم جمع؟",
      "teaching_note": "العدد يحدد العلامة: المفرد غالبًا بالضمة/الفتحة، المثنى بالألف رفعًا والياء نصبًا، وجمع المذكر السالم بالواو رفعًا والياء نصبًا.",
      "hint": "العدد يحدد العلامة: المفرد غالبًا بالضمة/الفتحة، المثنى بالألف رفعًا والياء نصبًا، وجمع المذكر السالم بالواو رفعًا والياء نصبًا.",
      "answers": [
        {
          "id": "a",
          "text": "مفرد",
          "next": "inna_ism_singular_ending",
          "eval": {
            "fact": "number",
            "equals": "singular"
          }
        },
        {
          "id": "b",
          "text": "مثنى",
          "next": "R_inna_ism_dual",
          "eval": {
            "fact": "number",
            "equals": "dual"
          }
        },
        {
          "id": "c",
          "text": "جمع مذكر سالم",
          "next": "R_inna_ism_jms",
          "eval": {
            "fact": "number",
            "equals": "jms"
          }
        },
        {
          "id": "d",
          "text": "جمع مؤنث سالم",
          "next": "R_inna_ism_jfs",
          "eval": {
            "fact": "number",
            "equals": "jfs"
          }
        },
        {
          "id": "e",
          "text": "جمع تكسير",
          "next": "inna_ism_broken_ending",
          "eval": {
            "fact": "number",
            "equals": "jt"
          }
        },
        {
          "id": "f",
          "text": "من الأسماء الخمسة",
          "next": "R_inna_ism_five",
          "eval": {
            "fact": "number",
            "equals": "five"
          }
        }
      ]
    },
    "inna_ism_singular_ending": {
      "id": "inna_ism_singular_ending",
      "type": "question",
      "text": "ما حالة آخر الاسم؟",
      "teaching_note": "ننظر إلى آخر الاسم: صحيح الآخر تظهر عليه العلامة، ومعتل الآخر تُقدّر عليه العلامة.",
      "hint": "ننظر إلى آخر الاسم: صحيح الآخر تظهر عليه العلامة، ومعتل الآخر تُقدّر عليه العلامة.",
      "answers": [
        {
          "id": "a",
          "text": "صحيح الآخر",
          "next": "R_inna_ism_visible",
          "eval": {
            "fact": "ending",
            "equals": "sahih"
          }
        },
        {
          "id": "b",
          "text": "معتل الآخر",
          "next": "R_inna_ism_estimated",
          "eval": {
            "fact": "ending",
            "equals": "moatal"
          }
        }
      ]
    },
    "inna_ism_broken_ending": {
      "id": "inna_ism_broken_ending",
      "type": "question",
      "text": "ما حالة آخر جمع التكسير؟",
      "teaching_note": "جمع التكسير يعامل غالبًا معاملة المفرد في العلامة: تظهر العلامة على الصحيح وتقدر على المعتل.",
      "hint": "جمع التكسير يعامل غالبًا معاملة المفرد في العلامة: تظهر العلامة على الصحيح وتقدر على المعتل.",
      "answers": [
        {
          "id": "a",
          "text": "صحيح الآخر",
          "next": "R_inna_ism_visible",
          "eval": {
            "fact": "ending",
            "equals": "sahih"
          }
        },
        {
          "id": "b",
          "text": "معتل الآخر",
          "next": "R_inna_ism_estimated",
          "eval": {
            "fact": "ending",
            "equals": "moatal"
          }
        }
      ]
    },
    "R_inna_ism_pronoun": {
      "id": "R_inna_ism_pronoun",
      "type": "result",
      "text": "ضمير متصل مبني في محل نصب اسم إن",
      "coverage": "inna_ism.damir",
      "teaching_note": "ضمير منفصل مبني في محل نصب اسم إن"
    },
    "R_inna_ism_demonstrative": {
      "id": "R_inna_ism_demonstrative",
      "type": "result",
      "text": "اسم إشارة مبني في محل نصب اسم إن",
      "coverage": "inna_ism.ishara",
      "teaching_note": "اسم إشارة مبني في محل نصب اسم إن"
    },
    "R_inna_ism_relative": {
      "id": "R_inna_ism_relative",
      "type": "result",
      "text": "اسم موصول مبني في محل نصب اسم إن",
      "coverage": "inna_ism.mawsool",
      "teaching_note": "اسم موصول مبني في محل نصب اسم إن"
    },
    "R_inna_ism_interrogative": {
      "id": "R_inna_ism_interrogative",
      "type": "result",
      "text": "اسم استفهام مبني في محل نصب اسم إن",
      "coverage": "inna_ism.istifham",
      "teaching_note": "اسم استفهام مبني في محل نصب اسم إن"
    },
    "R_inna_ism_conditional": {
      "id": "R_inna_ism_conditional",
      "type": "result",
      "text": "اسم شرط مبني في محل نصب اسم إن",
      "coverage": "inna_ism.shart",
      "teaching_note": "اسم شرط مبني في محل نصب اسم إن"
    },
    "R_inna_ism_kam": {
      "id": "R_inna_ism_kam",
      "type": "result",
      "text": "كم الخبرية اسم مبني في محل نصب اسم إن",
      "coverage": "inna_ism.kam",
      "teaching_note": "كم الخبرية اسم مبني في محل نصب اسم إن"
    },
    "R_inna_ism_masdar": {
      "id": "R_inna_ism_masdar",
      "type": "result",
      "text": "مصدر مؤول في محل نصب اسم إن",
      "coverage": "inna_ism.masdar",
      "teaching_note": "مصدر مؤول في محل نصب اسم إن"
    },
    "R_inna_ism_visible": {
      "id": "R_inna_ism_visible",
      "type": "result",
      "text": "اسم إن منصوب وعلامة نصبه الفتحة الظاهرة على آخره",
      "coverage": "inna_ism.visible",
      "teaching_note": "اسم إن منصوب وعلامة نصبه الفتحة الظاهرة على آخره"
    },
    "R_inna_ism_estimated": {
      "id": "R_inna_ism_estimated",
      "type": "result",
      "text": "اسم إن منصوب وعلامة نصبه الفتحة المقدرة على آخره",
      "coverage": "inna_ism.estimated",
      "teaching_note": "اسم إن منصوب وعلامة نصبه الفتحة المقدرة على آخره"
    },
    "R_inna_ism_dual": {
      "id": "R_inna_ism_dual",
      "type": "result",
      "text": "اسم إن منصوب وعلامة نصبه الياء لأنه مثنى",
      "coverage": "inna_ism.dual",
      "teaching_note": "اسم إن منصوب وعلامة نصبه الياء لأنه مثنى"
    },
    "R_inna_ism_jms": {
      "id": "R_inna_ism_jms",
      "type": "result",
      "text": "اسم إن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم",
      "coverage": "inna_ism.jms",
      "teaching_note": "اسم إن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم"
    },
    "R_inna_ism_jfs": {
      "id": "R_inna_ism_jfs",
      "type": "result",
      "text": "اسم إن منصوب وعلامة نصبه الكسرة نيابة عن الفتحة لأنه جمع مؤنث سالم",
      "coverage": "inna_ism.jfs",
      "teaching_note": "اسم إن منصوب وعلامة نصبه الكسرة نيابة عن الفتحة لأنه جمع مؤنث سالم"
    },
    "R_inna_ism_five": {
      "id": "R_inna_ism_five",
      "type": "result",
      "text": "اسم إن منصوب وعلامة نصبه الألف لأنه من الأسماء الخمسة",
      "coverage": "inna_ism.five",
      "teaching_note": "اسم إن منصوب وعلامة نصبه الألف لأنه من الأسماء الخمسة"
    },
    "inna_khabar_kind": {
      "id": "inna_khabar_kind",
      "type": "question",
      "text": "في مسار خبر إن: ما نوع الخبر؟",
      "teaching_note": "الخبر قد يكون مفردًا، أو جملة، أو شبه جملة. الخبر المفرد نحدد إعرابه وعلامته، والجملة وشبه الجملة تكون في محل رفع خبر إن.",
      "hint": "الخبر قد يكون مفردًا، أو جملة، أو شبه جملة. الخبر المفرد نحدد إعرابه وعلامته، والجملة وشبه الجملة تكون في محل رفع خبر إن.",
      "answers": [
        {
          "id": "a",
          "text": "خبر مفرد",
          "next": "inna_khabar_single_type",
          "eval": {
            "fact": "khabarKind",
            "equals": "single"
          }
        },
        {
          "id": "b",
          "text": "جملة",
          "next": "inna_khabar_sentence_type",
          "eval": {
            "fact": "khabarKind",
            "equals": "sentence"
          }
        },
        {
          "id": "c",
          "text": "شبه جملة",
          "next": "inna_khabar_shibh_type",
          "eval": {
            "fact": "khabarKind",
            "equals": "shibh"
          }
        }
      ]
    },
    "inna_khabar_single_type": {
      "id": "inna_khabar_single_type",
      "type": "question",
      "text": "في مسار خبر إن: هل الكلمة المستهدفة اسم معرب أم اسم مبني أم مصدر مؤول؟",
      "teaching_note": "نبدأ بتحديد طبيعة الاسم؛ لأن الاسم المعرب تظهر عليه علامة الإعراب، أما الاسم المبني فيُعرب في محل، والمصدر المؤول يعامل معاملة الاسم.",
      "hint": "نبدأ بتحديد طبيعة الاسم؛ لأن الاسم المعرب تظهر عليه علامة الإعراب، أما الاسم المبني فيُعرب في محل، والمصدر المؤول يعامل معاملة الاسم.",
      "answers": [
        {
          "id": "a",
          "text": "اسم معرب",
          "next": "inna_khabar_single_number",
          "eval": {
            "fact": "nounKind",
            "equals": "mu3rab"
          }
        },
        {
          "id": "b",
          "text": "اسم مبني",
          "next": "inna_khabar_single_built_type",
          "eval": {
            "fact": "nounKind",
            "equals": "mabni"
          }
        },
        {
          "id": "c",
          "text": "مصدر مؤول",
          "next": "R_inna_khabar_single_masdar",
          "eval": {
            "fact": "nounKind",
            "equals": "masdar"
          }
        }
      ]
    },
    "inna_khabar_single_built_type": {
      "id": "inna_khabar_single_built_type",
      "type": "question",
      "text": "ما نوع الاسم المبني؟",
      "teaching_note": "نحدد اسم المبني أولًا، ثم نبدأ الإعراب باسمه: ضمير منفصل/اسم إشارة/اسم موصول... مبني في محل رفع خبر إن.",
      "hint": "نحدد اسم المبني أولًا، ثم نبدأ الإعراب باسمه: ضمير منفصل/اسم إشارة/اسم موصول... مبني في محل رفع خبر إن.",
      "answers": [
        {
          "id": "a",
          "text": "ضمير منفصل",
          "next": "R_inna_khabar_single_pronoun",
          "eval": {
            "fact": "mabniType",
            "equals": "damir"
          }
        },
        {
          "id": "b",
          "text": "اسم إشارة",
          "next": "R_inna_khabar_single_demonstrative",
          "eval": {
            "fact": "mabniType",
            "equals": "ishara"
          }
        },
        {
          "id": "c",
          "text": "اسم موصول",
          "next": "R_inna_khabar_single_relative",
          "eval": {
            "fact": "mabniType",
            "equals": "mawsool"
          }
        },
        {
          "id": "d",
          "text": "اسم استفهام",
          "next": "R_inna_khabar_single_interrogative",
          "eval": {
            "fact": "mabniType",
            "equals": "istifham"
          }
        },
        {
          "id": "e",
          "text": "اسم شرط",
          "next": "R_inna_khabar_single_conditional",
          "eval": {
            "fact": "mabniType",
            "equals": "shart"
          }
        },
        {
          "id": "f",
          "text": "كم الخبرية",
          "next": "R_inna_khabar_single_kam",
          "eval": {
            "fact": "mabniType",
            "equals": "kam"
          }
        }
      ]
    },
    "inna_khabar_single_number": {
      "id": "inna_khabar_single_number",
      "type": "question",
      "text": "هل الاسم مفرد أم مثنى أم جمع؟",
      "teaching_note": "العدد يحدد العلامة: المفرد غالبًا بالضمة/الفتحة، المثنى بالألف رفعًا والياء نصبًا، وجمع المذكر السالم بالواو رفعًا والياء نصبًا.",
      "hint": "العدد يحدد العلامة: المفرد غالبًا بالضمة/الفتحة، المثنى بالألف رفعًا والياء نصبًا، وجمع المذكر السالم بالواو رفعًا والياء نصبًا.",
      "answers": [
        {
          "id": "a",
          "text": "مفرد",
          "next": "inna_khabar_single_singular_ending",
          "eval": {
            "fact": "number",
            "equals": "singular"
          }
        },
        {
          "id": "b",
          "text": "مثنى",
          "next": "R_inna_khabar_single_dual",
          "eval": {
            "fact": "number",
            "equals": "dual"
          }
        },
        {
          "id": "c",
          "text": "جمع مذكر سالم",
          "next": "R_inna_khabar_single_jms",
          "eval": {
            "fact": "number",
            "equals": "jms"
          }
        },
        {
          "id": "d",
          "text": "جمع مؤنث سالم",
          "next": "R_inna_khabar_single_jfs",
          "eval": {
            "fact": "number",
            "equals": "jfs"
          }
        },
        {
          "id": "e",
          "text": "جمع تكسير",
          "next": "inna_khabar_single_broken_ending",
          "eval": {
            "fact": "number",
            "equals": "jt"
          }
        },
        {
          "id": "f",
          "text": "من الأسماء الخمسة",
          "next": "R_inna_khabar_single_five",
          "eval": {
            "fact": "number",
            "equals": "five"
          }
        }
      ]
    },
    "inna_khabar_single_singular_ending": {
      "id": "inna_khabar_single_singular_ending",
      "type": "question",
      "text": "ما حالة آخر الاسم؟",
      "teaching_note": "ننظر إلى آخر الاسم: صحيح الآخر تظهر عليه العلامة، ومعتل الآخر تُقدّر عليه العلامة.",
      "hint": "ننظر إلى آخر الاسم: صحيح الآخر تظهر عليه العلامة، ومعتل الآخر تُقدّر عليه العلامة.",
      "answers": [
        {
          "id": "a",
          "text": "صحيح الآخر",
          "next": "R_inna_khabar_single_visible",
          "eval": {
            "fact": "ending",
            "equals": "sahih"
          }
        },
        {
          "id": "b",
          "text": "معتل الآخر",
          "next": "R_inna_khabar_single_estimated",
          "eval": {
            "fact": "ending",
            "equals": "moatal"
          }
        }
      ]
    },
    "inna_khabar_single_broken_ending": {
      "id": "inna_khabar_single_broken_ending",
      "type": "question",
      "text": "ما حالة آخر جمع التكسير؟",
      "teaching_note": "جمع التكسير يعامل غالبًا معاملة المفرد في العلامة: تظهر العلامة على الصحيح وتقدر على المعتل.",
      "hint": "جمع التكسير يعامل غالبًا معاملة المفرد في العلامة: تظهر العلامة على الصحيح وتقدر على المعتل.",
      "answers": [
        {
          "id": "a",
          "text": "صحيح الآخر",
          "next": "R_inna_khabar_single_visible",
          "eval": {
            "fact": "ending",
            "equals": "sahih"
          }
        },
        {
          "id": "b",
          "text": "معتل الآخر",
          "next": "R_inna_khabar_single_estimated",
          "eval": {
            "fact": "ending",
            "equals": "moatal"
          }
        }
      ]
    },
    "R_inna_khabar_single_pronoun": {
      "id": "R_inna_khabar_single_pronoun",
      "type": "result",
      "text": "ضمير منفصل مبني في محل رفع خبر إن",
      "coverage": "inna_khabar_single.damir",
      "teaching_note": "ضمير منفصل مبني في محل رفع خبر إن"
    },
    "R_inna_khabar_single_demonstrative": {
      "id": "R_inna_khabar_single_demonstrative",
      "type": "result",
      "text": "اسم إشارة مبني في محل رفع خبر إن",
      "coverage": "inna_khabar_single.ishara",
      "teaching_note": "اسم إشارة مبني في محل رفع خبر إن"
    },
    "R_inna_khabar_single_relative": {
      "id": "R_inna_khabar_single_relative",
      "type": "result",
      "text": "اسم موصول مبني في محل رفع خبر إن",
      "coverage": "inna_khabar_single.mawsool",
      "teaching_note": "اسم موصول مبني في محل رفع خبر إن"
    },
    "R_inna_khabar_single_interrogative": {
      "id": "R_inna_khabar_single_interrogative",
      "type": "result",
      "text": "اسم استفهام مبني في محل رفع خبر إن",
      "coverage": "inna_khabar_single.istifham",
      "teaching_note": "اسم استفهام مبني في محل رفع خبر إن"
    },
    "R_inna_khabar_single_conditional": {
      "id": "R_inna_khabar_single_conditional",
      "type": "result",
      "text": "اسم شرط مبني في محل رفع خبر إن",
      "coverage": "inna_khabar_single.shart",
      "teaching_note": "اسم شرط مبني في محل رفع خبر إن"
    },
    "R_inna_khabar_single_kam": {
      "id": "R_inna_khabar_single_kam",
      "type": "result",
      "text": "كم الخبرية اسم مبني في محل رفع خبر إن",
      "coverage": "inna_khabar_single.kam",
      "teaching_note": "كم الخبرية اسم مبني في محل رفع خبر إن"
    },
    "R_inna_khabar_single_masdar": {
      "id": "R_inna_khabar_single_masdar",
      "type": "result",
      "text": "مصدر مؤول في محل رفع خبر إن",
      "coverage": "inna_khabar_single.masdar",
      "teaching_note": "مصدر مؤول في محل رفع خبر إن"
    },
    "R_inna_khabar_single_visible": {
      "id": "R_inna_khabar_single_visible",
      "type": "result",
      "text": "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره",
      "coverage": "inna_khabar_single.visible",
      "teaching_note": "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره"
    },
    "R_inna_khabar_single_estimated": {
      "id": "R_inna_khabar_single_estimated",
      "type": "result",
      "text": "خبر إن مرفوع وعلامة رفعه الضمة المقدرة على آخره",
      "coverage": "inna_khabar_single.estimated",
      "teaching_note": "خبر إن مرفوع وعلامة رفعه الضمة المقدرة على آخره"
    },
    "R_inna_khabar_single_dual": {
      "id": "R_inna_khabar_single_dual",
      "type": "result",
      "text": "خبر إن مرفوع وعلامة رفعه الألف لأنه مثنى",
      "coverage": "inna_khabar_single.dual",
      "teaching_note": "خبر إن مرفوع وعلامة رفعه الألف لأنه مثنى"
    },
    "R_inna_khabar_single_jms": {
      "id": "R_inna_khabar_single_jms",
      "type": "result",
      "text": "خبر إن مرفوع وعلامة رفعه الواو لأنه جمع مذكر سالم",
      "coverage": "inna_khabar_single.jms",
      "teaching_note": "خبر إن مرفوع وعلامة رفعه الواو لأنه جمع مذكر سالم"
    },
    "R_inna_khabar_single_jfs": {
      "id": "R_inna_khabar_single_jfs",
      "type": "result",
      "text": "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره لأنه جمع مؤنث سالم",
      "coverage": "inna_khabar_single.jfs",
      "teaching_note": "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره لأنه جمع مؤنث سالم"
    },
    "R_inna_khabar_single_five": {
      "id": "R_inna_khabar_single_five",
      "type": "result",
      "text": "خبر إن مرفوع وعلامة رفعه الواو لأنه من الأسماء الخمسة",
      "coverage": "inna_khabar_single.five",
      "teaching_note": "خبر إن مرفوع وعلامة رفعه الواو لأنه من الأسماء الخمسة"
    },
    "inna_khabar_sentence_type": {
      "id": "inna_khabar_sentence_type",
      "type": "question",
      "text": "هل الخبر جملة فعلية أم جملة اسمية؟",
      "teaching_note": "ننظر إلى بداية الخبر: إن بدأ بفعل فهو جملة فعلية، وإن كان تركيبًا اسميًا من مبتدأ وخبر فهو جملة اسمية.",
      "hint": "ننظر إلى بداية الخبر: إن بدأ بفعل فهو جملة فعلية، وإن كان تركيبًا اسميًا من مبتدأ وخبر فهو جملة اسمية.",
      "answers": [
        {
          "id": "a",
          "text": "جملة فعلية",
          "next": "R_inna_khabar_verbal_sentence",
          "eval": {
            "fact": "sentenceType",
            "equals": "verbal"
          }
        },
        {
          "id": "b",
          "text": "جملة اسمية",
          "next": "R_inna_khabar_nominal_sentence",
          "eval": {
            "fact": "sentenceType",
            "equals": "nominal"
          }
        }
      ]
    },
    "inna_khabar_shibh_type": {
      "id": "inna_khabar_shibh_type",
      "type": "question",
      "text": "ما نوع شبه الجملة؟",
      "teaching_note": "شبه الجملة إما جار ومجرور مثل: في البيت، أو ظرف مثل: أمام المدرسة.",
      "hint": "شبه الجملة إما جار ومجرور مثل: في البيت، أو ظرف مثل: أمام المدرسة.",
      "answers": [
        {
          "id": "a",
          "text": "جار ومجرور",
          "next": "R_inna_khabar_jar",
          "eval": {
            "fact": "shibhType",
            "equals": "jar"
          }
        },
        {
          "id": "b",
          "text": "ظرف",
          "next": "R_inna_khabar_zarf",
          "eval": {
            "fact": "shibhType",
            "equals": "zarf"
          }
        }
      ]
    },
    "R_inna_khabar_verbal_sentence": {
      "id": "R_inna_khabar_verbal_sentence",
      "type": "result",
      "text": "جملة فعلية في محل رفع خبر إن",
      "coverage": "inna_khabar.verbal_sentence",
      "teaching_note": "جملة فعلية في محل رفع خبر إن"
    },
    "R_inna_khabar_nominal_sentence": {
      "id": "R_inna_khabar_nominal_sentence",
      "type": "result",
      "text": "جملة اسمية في محل رفع خبر إن",
      "coverage": "inna_khabar.nominal_sentence",
      "teaching_note": "جملة اسمية في محل رفع خبر إن"
    },
    "R_inna_khabar_jar": {
      "id": "R_inna_khabar_jar",
      "type": "result",
      "text": "شبه جملة من الجار والمجرور في محل رفع خبر إن",
      "coverage": "inna_khabar.jar",
      "teaching_note": "شبه جملة من الجار والمجرور في محل رفع خبر إن"
    },
    "R_inna_khabar_zarf": {
      "id": "R_inna_khabar_zarf",
      "type": "result",
      "text": "شبه جملة ظرفية في محل رفع خبر إن",
      "coverage": "inna_khabar.zarf",
      "teaching_note": "شبه جملة ظرفية في محل رفع خبر إن"
    }
  }
};
