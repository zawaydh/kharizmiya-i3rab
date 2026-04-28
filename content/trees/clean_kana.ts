export type ExerciseTree = { startNodeId: string; nodes: Record<string, any> };

export const cleanKanaTree: ExerciseTree = {
  "startNodeId": "kana_target",
  "nodes": {
    "kana_target": {
      "id": "kana_target",
      "type": "question",
      "text": "ما الكلمة المراد إعرابها؟",
      "teaching_note": "بعد دخول الناسخ نحدد: هل الكلمة اسم الناسخ أم خبره؟ لأن الحكم الإعرابي يختلف.",
      "hint": "بعد دخول الناسخ نحدد: هل الكلمة اسم الناسخ أم خبره؟ لأن الحكم الإعرابي يختلف.",
      "answers": [
        {
          "id": "a",
          "text": "اسم كان",
          "next": "kana_ism_type",
          "eval": {
            "fact": "targetRole",
            "equals": "ism"
          }
        },
        {
          "id": "b",
          "text": "خبر كان",
          "next": "kana_khabar_kind",
          "eval": {
            "fact": "targetRole",
            "equals": "khabar"
          }
        }
      ]
    },
    "kana_ism_type": {
      "id": "kana_ism_type",
      "type": "question",
      "text": "في مسار اسم كان: هل الكلمة المستهدفة اسم معرب أم اسم مبني أم مصدر مؤول؟",
      "teaching_note": "نبدأ بتحديد طبيعة الاسم؛ لأن الاسم المعرب تظهر عليه علامة الإعراب، أما الاسم المبني فيُعرب في محل، والمصدر المؤول يعامل معاملة الاسم.",
      "hint": "نبدأ بتحديد طبيعة الاسم؛ لأن الاسم المعرب تظهر عليه علامة الإعراب، أما الاسم المبني فيُعرب في محل، والمصدر المؤول يعامل معاملة الاسم.",
      "answers": [
        {
          "id": "a",
          "text": "اسم معرب",
          "next": "kana_ism_number",
          "eval": {
            "fact": "nounKind",
            "equals": "mu3rab"
          }
        },
        {
          "id": "b",
          "text": "اسم مبني",
          "next": "kana_ism_built_type",
          "eval": {
            "fact": "nounKind",
            "equals": "mabni"
          }
        },
        {
          "id": "c",
          "text": "مصدر مؤول",
          "next": "R_kana_ism_masdar",
          "eval": {
            "fact": "nounKind",
            "equals": "masdar"
          }
        }
      ]
    },
    "kana_ism_built_type": {
      "id": "kana_ism_built_type",
      "type": "question",
      "text": "ما نوع الاسم المبني؟",
      "teaching_note": "نحدد اسم المبني أولًا، ثم نبدأ الإعراب باسمه: ضمير منفصل/اسم إشارة/اسم موصول... مبني في محل رفع اسم كان.",
      "hint": "نحدد اسم المبني أولًا، ثم نبدأ الإعراب باسمه: ضمير منفصل/اسم إشارة/اسم موصول... مبني في محل رفع اسم كان.",
      "answers": [
        {
          "id": "a",
          "text": "ضمير متصل",
          "next": "R_kana_ism_pronoun",
          "eval": {
            "fact": "mabniType",
            "equals": "damir"
          }
        },
        {
          "id": "b",
          "text": "اسم إشارة",
          "next": "R_kana_ism_demonstrative",
          "eval": {
            "fact": "mabniType",
            "equals": "ishara"
          }
        },
        {
          "id": "c",
          "text": "اسم موصول",
          "next": "R_kana_ism_relative",
          "eval": {
            "fact": "mabniType",
            "equals": "mawsool"
          }
        },
        {
          "id": "d",
          "text": "اسم استفهام",
          "next": "R_kana_ism_interrogative",
          "eval": {
            "fact": "mabniType",
            "equals": "istifham"
          }
        },
        {
          "id": "e",
          "text": "اسم شرط",
          "next": "R_kana_ism_conditional",
          "eval": {
            "fact": "mabniType",
            "equals": "shart"
          }
        },
        {
          "id": "f",
          "text": "كم الخبرية",
          "next": "R_kana_ism_kam",
          "eval": {
            "fact": "mabniType",
            "equals": "kam"
          }
        }
      ]
    },
    "kana_ism_number": {
      "id": "kana_ism_number",
      "type": "question",
      "text": "هل الاسم مفرد أم مثنى أم جمع؟",
      "teaching_note": "العدد يحدد العلامة: المفرد غالبًا بالضمة/الفتحة، المثنى بالألف رفعًا والياء نصبًا، وجمع المذكر السالم بالواو رفعًا والياء نصبًا.",
      "hint": "العدد يحدد العلامة: المفرد غالبًا بالضمة/الفتحة، المثنى بالألف رفعًا والياء نصبًا، وجمع المذكر السالم بالواو رفعًا والياء نصبًا.",
      "answers": [
        {
          "id": "a",
          "text": "مفرد",
          "next": "kana_ism_singular_ending",
          "eval": {
            "fact": "number",
            "equals": "singular"
          }
        },
        {
          "id": "b",
          "text": "مثنى",
          "next": "R_kana_ism_dual",
          "eval": {
            "fact": "number",
            "equals": "dual"
          }
        },
        {
          "id": "c",
          "text": "جمع مذكر سالم",
          "next": "R_kana_ism_jms",
          "eval": {
            "fact": "number",
            "equals": "jms"
          }
        },
        {
          "id": "d",
          "text": "جمع مؤنث سالم",
          "next": "R_kana_ism_jfs",
          "eval": {
            "fact": "number",
            "equals": "jfs"
          }
        },
        {
          "id": "e",
          "text": "جمع تكسير",
          "next": "kana_ism_broken_ending",
          "eval": {
            "fact": "number",
            "equals": "jt"
          }
        },
        {
          "id": "f",
          "text": "من الأسماء الخمسة",
          "next": "R_kana_ism_five",
          "eval": {
            "fact": "number",
            "equals": "five"
          }
        }
      ]
    },
    "kana_ism_singular_ending": {
      "id": "kana_ism_singular_ending",
      "type": "question",
      "text": "ما حالة آخر الاسم؟",
      "teaching_note": "ننظر إلى آخر الاسم: صحيح الآخر تظهر عليه العلامة، ومعتل الآخر تُقدّر عليه العلامة.",
      "hint": "ننظر إلى آخر الاسم: صحيح الآخر تظهر عليه العلامة، ومعتل الآخر تُقدّر عليه العلامة.",
      "answers": [
        {
          "id": "a",
          "text": "صحيح الآخر",
          "next": "R_kana_ism_visible",
          "eval": {
            "fact": "ending",
            "equals": "sahih"
          }
        },
        {
          "id": "b",
          "text": "معتل الآخر",
          "next": "R_kana_ism_estimated",
          "eval": {
            "fact": "ending",
            "equals": "moatal"
          }
        }
      ]
    },
    "kana_ism_broken_ending": {
      "id": "kana_ism_broken_ending",
      "type": "question",
      "text": "ما حالة آخر جمع التكسير؟",
      "teaching_note": "جمع التكسير يعامل غالبًا معاملة المفرد في العلامة: تظهر العلامة على الصحيح وتقدر على المعتل.",
      "hint": "جمع التكسير يعامل غالبًا معاملة المفرد في العلامة: تظهر العلامة على الصحيح وتقدر على المعتل.",
      "answers": [
        {
          "id": "a",
          "text": "صحيح الآخر",
          "next": "R_kana_ism_visible",
          "eval": {
            "fact": "ending",
            "equals": "sahih"
          }
        },
        {
          "id": "b",
          "text": "معتل الآخر",
          "next": "R_kana_ism_estimated",
          "eval": {
            "fact": "ending",
            "equals": "moatal"
          }
        }
      ]
    },
    "R_kana_ism_pronoun": {
      "id": "R_kana_ism_pronoun",
      "type": "result",
      "text": "ضمير متصل مبني في محل رفع اسم كان",
      "coverage": "kana_ism.damir",
      "teaching_note": "ضمير منفصل مبني في محل رفع اسم كان"
    },
    "R_kana_ism_demonstrative": {
      "id": "R_kana_ism_demonstrative",
      "type": "result",
      "text": "اسم إشارة مبني في محل رفع اسم كان",
      "coverage": "kana_ism.ishara",
      "teaching_note": "اسم إشارة مبني في محل رفع اسم كان"
    },
    "R_kana_ism_relative": {
      "id": "R_kana_ism_relative",
      "type": "result",
      "text": "اسم موصول مبني في محل رفع اسم كان",
      "coverage": "kana_ism.mawsool",
      "teaching_note": "اسم موصول مبني في محل رفع اسم كان"
    },
    "R_kana_ism_interrogative": {
      "id": "R_kana_ism_interrogative",
      "type": "result",
      "text": "اسم استفهام مبني في محل رفع اسم كان",
      "coverage": "kana_ism.istifham",
      "teaching_note": "اسم استفهام مبني في محل رفع اسم كان"
    },
    "R_kana_ism_conditional": {
      "id": "R_kana_ism_conditional",
      "type": "result",
      "text": "اسم شرط مبني في محل رفع اسم كان",
      "coverage": "kana_ism.shart",
      "teaching_note": "اسم شرط مبني في محل رفع اسم كان"
    },
    "R_kana_ism_kam": {
      "id": "R_kana_ism_kam",
      "type": "result",
      "text": "كم الخبرية اسم مبني في محل رفع اسم كان",
      "coverage": "kana_ism.kam",
      "teaching_note": "كم الخبرية اسم مبني في محل رفع اسم كان"
    },
    "R_kana_ism_masdar": {
      "id": "R_kana_ism_masdar",
      "type": "result",
      "text": "مصدر مؤول في محل رفع اسم كان",
      "coverage": "kana_ism.masdar",
      "teaching_note": "مصدر مؤول في محل رفع اسم كان"
    },
    "R_kana_ism_visible": {
      "id": "R_kana_ism_visible",
      "type": "result",
      "text": "اسم كان مرفوع وعلامة رفعه الضمة الظاهرة على آخره",
      "coverage": "kana_ism.visible",
      "teaching_note": "اسم كان مرفوع وعلامة رفعه الضمة الظاهرة على آخره"
    },
    "R_kana_ism_estimated": {
      "id": "R_kana_ism_estimated",
      "type": "result",
      "text": "اسم كان مرفوع وعلامة رفعه الضمة المقدرة على آخره",
      "coverage": "kana_ism.estimated",
      "teaching_note": "اسم كان مرفوع وعلامة رفعه الضمة المقدرة على آخره"
    },
    "R_kana_ism_dual": {
      "id": "R_kana_ism_dual",
      "type": "result",
      "text": "اسم كان مرفوع وعلامة رفعه الألف لأنه مثنى",
      "coverage": "kana_ism.dual",
      "teaching_note": "اسم كان مرفوع وعلامة رفعه الألف لأنه مثنى"
    },
    "R_kana_ism_jms": {
      "id": "R_kana_ism_jms",
      "type": "result",
      "text": "اسم كان مرفوع وعلامة رفعه الواو لأنه جمع مذكر سالم",
      "coverage": "kana_ism.jms",
      "teaching_note": "اسم كان مرفوع وعلامة رفعه الواو لأنه جمع مذكر سالم"
    },
    "R_kana_ism_jfs": {
      "id": "R_kana_ism_jfs",
      "type": "result",
      "text": "اسم كان مرفوع وعلامة رفعه الضمة الظاهرة على آخره لأنه جمع مؤنث سالم",
      "coverage": "kana_ism.jfs",
      "teaching_note": "اسم كان مرفوع وعلامة رفعه الضمة الظاهرة على آخره لأنه جمع مؤنث سالم"
    },
    "R_kana_ism_five": {
      "id": "R_kana_ism_five",
      "type": "result",
      "text": "اسم كان مرفوع وعلامة رفعه الواو لأنه من الأسماء الخمسة",
      "coverage": "kana_ism.five",
      "teaching_note": "اسم كان مرفوع وعلامة رفعه الواو لأنه من الأسماء الخمسة"
    },
    "kana_khabar_kind": {
      "id": "kana_khabar_kind",
      "type": "question",
      "text": "في مسار خبر كان: ما نوع الخبر؟",
      "teaching_note": "الخبر قد يكون مفردًا، أو جملة، أو شبه جملة. الخبر المفرد نحدد إعرابه وعلامته، والجملة وشبه الجملة تكون في محل نصب خبر كان.",
      "hint": "الخبر قد يكون مفردًا، أو جملة، أو شبه جملة. الخبر المفرد نحدد إعرابه وعلامته، والجملة وشبه الجملة تكون في محل نصب خبر كان.",
      "answers": [
        {
          "id": "a",
          "text": "خبر مفرد",
          "next": "kana_khabar_single_type",
          "eval": {
            "fact": "khabarKind",
            "equals": "single"
          }
        },
        {
          "id": "b",
          "text": "جملة",
          "next": "kana_khabar_sentence_type",
          "eval": {
            "fact": "khabarKind",
            "equals": "sentence"
          }
        },
        {
          "id": "c",
          "text": "شبه جملة",
          "next": "kana_khabar_shibh_type",
          "eval": {
            "fact": "khabarKind",
            "equals": "shibh"
          }
        }
      ]
    },
    "kana_khabar_single_type": {
      "id": "kana_khabar_single_type",
      "type": "question",
      "text": "في مسار خبر كان: هل الكلمة المستهدفة اسم معرب أم اسم مبني أم مصدر مؤول؟",
      "teaching_note": "نبدأ بتحديد طبيعة الاسم؛ لأن الاسم المعرب تظهر عليه علامة الإعراب، أما الاسم المبني فيُعرب في محل، والمصدر المؤول يعامل معاملة الاسم.",
      "hint": "نبدأ بتحديد طبيعة الاسم؛ لأن الاسم المعرب تظهر عليه علامة الإعراب، أما الاسم المبني فيُعرب في محل، والمصدر المؤول يعامل معاملة الاسم.",
      "answers": [
        {
          "id": "a",
          "text": "اسم معرب",
          "next": "kana_khabar_single_number",
          "eval": {
            "fact": "nounKind",
            "equals": "mu3rab"
          }
        },
        {
          "id": "b",
          "text": "اسم مبني",
          "next": "kana_khabar_single_built_type",
          "eval": {
            "fact": "nounKind",
            "equals": "mabni"
          }
        },
        {
          "id": "c",
          "text": "مصدر مؤول",
          "next": "R_kana_khabar_single_masdar",
          "eval": {
            "fact": "nounKind",
            "equals": "masdar"
          }
        }
      ]
    },
    "kana_khabar_single_built_type": {
      "id": "kana_khabar_single_built_type",
      "type": "question",
      "text": "ما نوع الاسم المبني؟",
      "teaching_note": "نحدد اسم المبني أولًا، ثم نبدأ الإعراب باسمه: ضمير منفصل/اسم إشارة/اسم موصول... مبني في محل نصب خبر كان.",
      "hint": "نحدد اسم المبني أولًا، ثم نبدأ الإعراب باسمه: ضمير منفصل/اسم إشارة/اسم موصول... مبني في محل نصب خبر كان.",
      "answers": [
        {
          "id": "a",
          "text": "ضمير منفصل",
          "next": "R_kana_khabar_single_pronoun",
          "eval": {
            "fact": "mabniType",
            "equals": "damir"
          }
        },
        {
          "id": "b",
          "text": "اسم إشارة",
          "next": "R_kana_khabar_single_demonstrative",
          "eval": {
            "fact": "mabniType",
            "equals": "ishara"
          }
        },
        {
          "id": "c",
          "text": "اسم موصول",
          "next": "R_kana_khabar_single_relative",
          "eval": {
            "fact": "mabniType",
            "equals": "mawsool"
          }
        },
        {
          "id": "d",
          "text": "اسم استفهام",
          "next": "R_kana_khabar_single_interrogative",
          "eval": {
            "fact": "mabniType",
            "equals": "istifham"
          }
        },
        {
          "id": "e",
          "text": "اسم شرط",
          "next": "R_kana_khabar_single_conditional",
          "eval": {
            "fact": "mabniType",
            "equals": "shart"
          }
        },
        {
          "id": "f",
          "text": "كم الخبرية",
          "next": "R_kana_khabar_single_kam",
          "eval": {
            "fact": "mabniType",
            "equals": "kam"
          }
        }
      ]
    },
    "kana_khabar_single_number": {
      "id": "kana_khabar_single_number",
      "type": "question",
      "text": "هل الاسم مفرد أم مثنى أم جمع؟",
      "teaching_note": "العدد يحدد العلامة: المفرد غالبًا بالضمة/الفتحة، المثنى بالألف رفعًا والياء نصبًا، وجمع المذكر السالم بالواو رفعًا والياء نصبًا.",
      "hint": "العدد يحدد العلامة: المفرد غالبًا بالضمة/الفتحة، المثنى بالألف رفعًا والياء نصبًا، وجمع المذكر السالم بالواو رفعًا والياء نصبًا.",
      "answers": [
        {
          "id": "a",
          "text": "مفرد",
          "next": "kana_khabar_single_singular_ending",
          "eval": {
            "fact": "number",
            "equals": "singular"
          }
        },
        {
          "id": "b",
          "text": "مثنى",
          "next": "R_kana_khabar_single_dual",
          "eval": {
            "fact": "number",
            "equals": "dual"
          }
        },
        {
          "id": "c",
          "text": "جمع مذكر سالم",
          "next": "R_kana_khabar_single_jms",
          "eval": {
            "fact": "number",
            "equals": "jms"
          }
        },
        {
          "id": "d",
          "text": "جمع مؤنث سالم",
          "next": "R_kana_khabar_single_jfs",
          "eval": {
            "fact": "number",
            "equals": "jfs"
          }
        },
        {
          "id": "e",
          "text": "جمع تكسير",
          "next": "kana_khabar_single_broken_ending",
          "eval": {
            "fact": "number",
            "equals": "jt"
          }
        },
        {
          "id": "f",
          "text": "من الأسماء الخمسة",
          "next": "R_kana_khabar_single_five",
          "eval": {
            "fact": "number",
            "equals": "five"
          }
        }
      ]
    },
    "kana_khabar_single_singular_ending": {
      "id": "kana_khabar_single_singular_ending",
      "type": "question",
      "text": "ما حالة آخر الاسم؟",
      "teaching_note": "ننظر إلى آخر الاسم: صحيح الآخر تظهر عليه العلامة، ومعتل الآخر تُقدّر عليه العلامة.",
      "hint": "ننظر إلى آخر الاسم: صحيح الآخر تظهر عليه العلامة، ومعتل الآخر تُقدّر عليه العلامة.",
      "answers": [
        {
          "id": "a",
          "text": "صحيح الآخر",
          "next": "R_kana_khabar_single_visible",
          "eval": {
            "fact": "ending",
            "equals": "sahih"
          }
        },
        {
          "id": "b",
          "text": "معتل الآخر",
          "next": "R_kana_khabar_single_estimated",
          "eval": {
            "fact": "ending",
            "equals": "moatal"
          }
        }
      ]
    },
    "kana_khabar_single_broken_ending": {
      "id": "kana_khabar_single_broken_ending",
      "type": "question",
      "text": "ما حالة آخر جمع التكسير؟",
      "teaching_note": "جمع التكسير يعامل غالبًا معاملة المفرد في العلامة: تظهر العلامة على الصحيح وتقدر على المعتل.",
      "hint": "جمع التكسير يعامل غالبًا معاملة المفرد في العلامة: تظهر العلامة على الصحيح وتقدر على المعتل.",
      "answers": [
        {
          "id": "a",
          "text": "صحيح الآخر",
          "next": "R_kana_khabar_single_visible",
          "eval": {
            "fact": "ending",
            "equals": "sahih"
          }
        },
        {
          "id": "b",
          "text": "معتل الآخر",
          "next": "R_kana_khabar_single_estimated",
          "eval": {
            "fact": "ending",
            "equals": "moatal"
          }
        }
      ]
    },
    "R_kana_khabar_single_pronoun": {
      "id": "R_kana_khabar_single_pronoun",
      "type": "result",
      "text": "ضمير منفصل مبني في محل نصب خبر كان",
      "coverage": "kana_khabar_single.damir",
      "teaching_note": "ضمير منفصل مبني في محل نصب خبر كان"
    },
    "R_kana_khabar_single_demonstrative": {
      "id": "R_kana_khabar_single_demonstrative",
      "type": "result",
      "text": "اسم إشارة مبني في محل نصب خبر كان",
      "coverage": "kana_khabar_single.ishara",
      "teaching_note": "اسم إشارة مبني في محل نصب خبر كان"
    },
    "R_kana_khabar_single_relative": {
      "id": "R_kana_khabar_single_relative",
      "type": "result",
      "text": "اسم موصول مبني في محل نصب خبر كان",
      "coverage": "kana_khabar_single.mawsool",
      "teaching_note": "اسم موصول مبني في محل نصب خبر كان"
    },
    "R_kana_khabar_single_interrogative": {
      "id": "R_kana_khabar_single_interrogative",
      "type": "result",
      "text": "اسم استفهام مبني في محل نصب خبر كان",
      "coverage": "kana_khabar_single.istifham",
      "teaching_note": "اسم استفهام مبني في محل نصب خبر كان"
    },
    "R_kana_khabar_single_conditional": {
      "id": "R_kana_khabar_single_conditional",
      "type": "result",
      "text": "اسم شرط مبني في محل نصب خبر كان",
      "coverage": "kana_khabar_single.shart",
      "teaching_note": "اسم شرط مبني في محل نصب خبر كان"
    },
    "R_kana_khabar_single_kam": {
      "id": "R_kana_khabar_single_kam",
      "type": "result",
      "text": "كم الخبرية اسم مبني في محل نصب خبر كان",
      "coverage": "kana_khabar_single.kam",
      "teaching_note": "كم الخبرية اسم مبني في محل نصب خبر كان"
    },
    "R_kana_khabar_single_masdar": {
      "id": "R_kana_khabar_single_masdar",
      "type": "result",
      "text": "مصدر مؤول في محل نصب خبر كان",
      "coverage": "kana_khabar_single.masdar",
      "teaching_note": "مصدر مؤول في محل نصب خبر كان"
    },
    "R_kana_khabar_single_visible": {
      "id": "R_kana_khabar_single_visible",
      "type": "result",
      "text": "خبر كان منصوب وعلامة نصبه الفتحة الظاهرة على آخره",
      "coverage": "kana_khabar_single.visible",
      "teaching_note": "خبر كان منصوب وعلامة نصبه الفتحة الظاهرة على آخره"
    },
    "R_kana_khabar_single_estimated": {
      "id": "R_kana_khabar_single_estimated",
      "type": "result",
      "text": "خبر كان منصوب وعلامة نصبه الفتحة المقدرة على آخره",
      "coverage": "kana_khabar_single.estimated",
      "teaching_note": "خبر كان منصوب وعلامة نصبه الفتحة المقدرة على آخره"
    },
    "R_kana_khabar_single_dual": {
      "id": "R_kana_khabar_single_dual",
      "type": "result",
      "text": "خبر كان منصوب وعلامة نصبه الياء لأنه مثنى",
      "coverage": "kana_khabar_single.dual",
      "teaching_note": "خبر كان منصوب وعلامة نصبه الياء لأنه مثنى"
    },
    "R_kana_khabar_single_jms": {
      "id": "R_kana_khabar_single_jms",
      "type": "result",
      "text": "خبر كان منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم",
      "coverage": "kana_khabar_single.jms",
      "teaching_note": "خبر كان منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم"
    },
    "R_kana_khabar_single_jfs": {
      "id": "R_kana_khabar_single_jfs",
      "type": "result",
      "text": "خبر كان منصوب وعلامة نصبه الكسرة نيابة عن الفتحة لأنه جمع مؤنث سالم",
      "coverage": "kana_khabar_single.jfs",
      "teaching_note": "خبر كان منصوب وعلامة نصبه الكسرة نيابة عن الفتحة لأنه جمع مؤنث سالم"
    },
    "R_kana_khabar_single_five": {
      "id": "R_kana_khabar_single_five",
      "type": "result",
      "text": "خبر كان منصوب وعلامة نصبه الألف لأنه من الأسماء الخمسة",
      "coverage": "kana_khabar_single.five",
      "teaching_note": "خبر كان منصوب وعلامة نصبه الألف لأنه من الأسماء الخمسة"
    },
    "kana_khabar_sentence_type": {
      "id": "kana_khabar_sentence_type",
      "type": "question",
      "text": "هل الخبر جملة فعلية أم جملة اسمية؟",
      "teaching_note": "ننظر إلى بداية الخبر: إن بدأ بفعل فهو جملة فعلية، وإن كان تركيبًا اسميًا من مبتدأ وخبر فهو جملة اسمية.",
      "hint": "ننظر إلى بداية الخبر: إن بدأ بفعل فهو جملة فعلية، وإن كان تركيبًا اسميًا من مبتدأ وخبر فهو جملة اسمية.",
      "answers": [
        {
          "id": "a",
          "text": "جملة فعلية",
          "next": "R_kana_khabar_verbal_sentence",
          "eval": {
            "fact": "sentenceType",
            "equals": "verbal"
          }
        },
        {
          "id": "b",
          "text": "جملة اسمية",
          "next": "R_kana_khabar_nominal_sentence",
          "eval": {
            "fact": "sentenceType",
            "equals": "nominal"
          }
        }
      ]
    },
    "kana_khabar_shibh_type": {
      "id": "kana_khabar_shibh_type",
      "type": "question",
      "text": "ما نوع شبه الجملة؟",
      "teaching_note": "شبه الجملة إما جار ومجرور مثل: في البيت، أو ظرف مثل: أمام المدرسة.",
      "hint": "شبه الجملة إما جار ومجرور مثل: في البيت، أو ظرف مثل: أمام المدرسة.",
      "answers": [
        {
          "id": "a",
          "text": "جار ومجرور",
          "next": "R_kana_khabar_jar",
          "eval": {
            "fact": "shibhType",
            "equals": "jar"
          }
        },
        {
          "id": "b",
          "text": "ظرف",
          "next": "R_kana_khabar_zarf",
          "eval": {
            "fact": "shibhType",
            "equals": "zarf"
          }
        }
      ]
    },
    "R_kana_khabar_verbal_sentence": {
      "id": "R_kana_khabar_verbal_sentence",
      "type": "result",
      "text": "جملة فعلية في محل نصب خبر كان",
      "coverage": "kana_khabar.verbal_sentence",
      "teaching_note": "جملة فعلية في محل نصب خبر كان"
    },
    "R_kana_khabar_nominal_sentence": {
      "id": "R_kana_khabar_nominal_sentence",
      "type": "result",
      "text": "جملة اسمية في محل نصب خبر كان",
      "coverage": "kana_khabar.nominal_sentence",
      "teaching_note": "جملة اسمية في محل نصب خبر كان"
    },
    "R_kana_khabar_jar": {
      "id": "R_kana_khabar_jar",
      "type": "result",
      "text": "شبه جملة من الجار والمجرور في محل نصب خبر كان",
      "coverage": "kana_khabar.jar",
      "teaching_note": "شبه جملة من الجار والمجرور في محل نصب خبر كان"
    },
    "R_kana_khabar_zarf": {
      "id": "R_kana_khabar_zarf",
      "type": "result",
      "text": "شبه جملة ظرفية في محل نصب خبر كان",
      "coverage": "kana_khabar.zarf",
      "teaching_note": "شبه جملة ظرفية في محل نصب خبر كان"
    }
  }
};
