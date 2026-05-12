export type ExerciseTree = { startNodeId: string; nodes: Record<string, any> };

export const cleanKanaTree: ExerciseTree = {
  "startNodeId": "kana_target",
  "nodes": {
    "kana_ism_start": {
      "id": "kana_ism_start",
      "type": "question",
      "context": "عرفنا موقع الكلمة: اسم كان.",
      "text": "ما القرار التالي؟",
      "hint": "نحدد هل هي اسم معرب أو اسم مبني أو مصدر مؤول.",
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
          "next": "kana_ism_built",
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
    "kana_ism_built": {
      "id": "kana_ism_built",
      "type": "question",
      "context": "عرفنا أنها اسم مبني.",
      "text": "ما نوع الاسم المبني؟",
      "hint": "الاسم المبني يعرب في محلّه.",
      "answers": [
        {
          "id": "a",
          "text": "ضمير منفصل",
          "next": "R_kana_ism_damir",
          "eval": {
            "fact": "mabniType",
            "equals": "damir"
          }
        },
        {
          "id": "b",
          "text": "اسم إشارة",
          "next": "R_kana_ism_ishara",
          "eval": {
            "fact": "mabniType",
            "equals": "ishara"
          }
        },
        {
          "id": "c",
          "text": "اسم موصول",
          "next": "R_kana_ism_mawsool",
          "eval": {
            "fact": "mabniType",
            "equals": "mawsool"
          }
        },
        {
          "id": "d",
          "text": "اسم استفهام",
          "next": "R_kana_ism_istifham",
          "eval": {
            "fact": "mabniType",
            "equals": "istifham"
          }
        },
        {
          "id": "e",
          "text": "اسم شرط",
          "next": "R_kana_ism_shart",
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
      "context": "عرفنا أنه اسم معرب.",
      "text": "ما الخطوة التالية؟",
      "hint": "العدد والنوع يقودان إلى العلامة.",
      "answers": [
        {
          "id": "a",
          "text": "مفرد",
          "next": "kana_ism_ending",
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
          "next": "kana_ism_ending",
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
    "kana_ism_ending": {
      "id": "kana_ism_ending",
      "type": "question",
      "context": "الاسم يعامل معاملة المفرد أو جمع التكسير.",
      "text": "ما حالة آخره؟",
      "hint": "الصحيح تظهر عليه العلامة، والمعتل تقدر عليه.",
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
    "R_kana_ism_visible": {
      "id": "R_kana_ism_visible",
      "type": "result",
      "coverage": "kana_ism.visible",
      "text": "اسم كان مرفوع وعلامة رفعه الضمة الظاهرة على آخره."
    },
    "R_kana_ism_estimated": {
      "id": "R_kana_ism_estimated",
      "type": "result",
      "coverage": "kana_ism.estimated",
      "text": "اسم كان مرفوع وعلامة رفعه الضمة المقدرة على آخره."
    },
    "R_kana_ism_dual": {
      "id": "R_kana_ism_dual",
      "type": "result",
      "coverage": "kana_ism.dual",
      "text": "اسم كان مرفوع وعلامة رفعه الألف لأنه مثنى."
    },
    "R_kana_ism_jms": {
      "id": "R_kana_ism_jms",
      "type": "result",
      "coverage": "kana_ism.jms",
      "text": "اسم كان مرفوع وعلامة رفعه الواو لأنه جمع مذكر سالم."
    },
    "R_kana_ism_jfs": {
      "id": "R_kana_ism_jfs",
      "type": "result",
      "coverage": "kana_ism.jfs",
      "text": "اسم كان مرفوع وعلامة رفعه الضمة الظاهرة على آخره لأنه جمع مؤنث سالم."
    },
    "R_kana_ism_five": {
      "id": "R_kana_ism_five",
      "type": "result",
      "coverage": "kana_ism.five",
      "text": "اسم كان مرفوع وعلامة رفعه الواو لأنه من الأسماء الخمسة."
    },
    "R_kana_ism_damir": {
      "id": "R_kana_ism_damir",
      "type": "result",
      "coverage": "kana_ism.damir",
      "text": "ضمير مبني في محل رفع اسم كان."
    },
    "R_kana_ism_ishara": {
      "id": "R_kana_ism_ishara",
      "type": "result",
      "coverage": "kana_ism.ishara",
      "text": "اسم إشارة مبني في محل رفع اسم كان."
    },
    "R_kana_ism_mawsool": {
      "id": "R_kana_ism_mawsool",
      "type": "result",
      "coverage": "kana_ism.mawsool",
      "text": "اسم موصول مبني في محل رفع اسم كان."
    },
    "R_kana_ism_istifham": {
      "id": "R_kana_ism_istifham",
      "type": "result",
      "coverage": "kana_ism.istifham",
      "text": "اسم استفهام مبني في محل رفع اسم كان."
    },
    "R_kana_ism_shart": {
      "id": "R_kana_ism_shart",
      "type": "result",
      "coverage": "kana_ism.shart",
      "text": "اسم شرط مبني في محل رفع اسم كان."
    },
    "R_kana_ism_kam": {
      "id": "R_kana_ism_kam",
      "type": "result",
      "coverage": "kana_ism.kam",
      "text": "كم الخبرية مبنية في محل رفع اسم كان."
    },
    "R_kana_ism_masdar": {
      "id": "R_kana_ism_masdar",
      "type": "result",
      "coverage": "kana_ism.masdar",
      "text": "مصدر مؤول في محل رفع اسم كان."
    },
    "kana_khabar_single_start": {
      "id": "kana_khabar_single_start",
      "type": "question",
      "context": "عرفنا موقع الكلمة: خبر كان.",
      "text": "ما القرار التالي؟",
      "hint": "نحدد هل هي اسم معرب أو اسم مبني أو مصدر مؤول.",
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
          "next": "kana_khabar_single_built",
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
    "kana_khabar_single_built": {
      "id": "kana_khabar_single_built",
      "type": "question",
      "context": "عرفنا أنها اسم مبني.",
      "text": "ما نوع الاسم المبني؟",
      "hint": "الاسم المبني يعرب في محلّه.",
      "answers": [
        {
          "id": "a",
          "text": "ضمير منفصل",
          "next": "R_kana_khabar_single_damir",
          "eval": {
            "fact": "mabniType",
            "equals": "damir"
          }
        },
        {
          "id": "b",
          "text": "اسم إشارة",
          "next": "R_kana_khabar_single_ishara",
          "eval": {
            "fact": "mabniType",
            "equals": "ishara"
          }
        },
        {
          "id": "c",
          "text": "اسم موصول",
          "next": "R_kana_khabar_single_mawsool",
          "eval": {
            "fact": "mabniType",
            "equals": "mawsool"
          }
        },
        {
          "id": "d",
          "text": "اسم استفهام",
          "next": "R_kana_khabar_single_istifham",
          "eval": {
            "fact": "mabniType",
            "equals": "istifham"
          }
        },
        {
          "id": "e",
          "text": "اسم شرط",
          "next": "R_kana_khabar_single_shart",
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
      "context": "عرفنا أنه اسم معرب.",
      "text": "ما الخطوة التالية؟",
      "hint": "العدد والنوع يقودان إلى العلامة.",
      "answers": [
        {
          "id": "a",
          "text": "مفرد",
          "next": "kana_khabar_single_ending",
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
          "next": "kana_khabar_single_ending",
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
    "kana_khabar_single_ending": {
      "id": "kana_khabar_single_ending",
      "type": "question",
      "context": "الاسم يعامل معاملة المفرد أو جمع التكسير.",
      "text": "ما حالة آخره؟",
      "hint": "الصحيح تظهر عليه العلامة، والمعتل تقدر عليه.",
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
    "R_kana_khabar_single_visible": {
      "id": "R_kana_khabar_single_visible",
      "type": "result",
      "coverage": "kana_khabar_single.visible",
      "text": "خبر كان منصوب وعلامة نصبه الفتحة الظاهرة على آخره."
    },
    "R_kana_khabar_single_estimated": {
      "id": "R_kana_khabar_single_estimated",
      "type": "result",
      "coverage": "kana_khabar_single.estimated",
      "text": "خبر كان منصوب وعلامة نصبه الفتحة المقدرة على آخره."
    },
    "R_kana_khabar_single_dual": {
      "id": "R_kana_khabar_single_dual",
      "type": "result",
      "coverage": "kana_khabar_single.dual",
      "text": "خبر كان منصوب وعلامة نصبه الياء لأنه مثنى."
    },
    "R_kana_khabar_single_jms": {
      "id": "R_kana_khabar_single_jms",
      "type": "result",
      "coverage": "kana_khabar_single.jms",
      "text": "خبر كان منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم."
    },
    "R_kana_khabar_single_jfs": {
      "id": "R_kana_khabar_single_jfs",
      "type": "result",
      "coverage": "kana_khabar_single.jfs",
      "text": "خبر كان منصوب وعلامة نصبه الكسرة نيابة عن الفتحة لأنه جمع مؤنث سالم."
    },
    "R_kana_khabar_single_five": {
      "id": "R_kana_khabar_single_five",
      "type": "result",
      "coverage": "kana_khabar_single.five",
      "text": "خبر كان منصوب وعلامة نصبه الألف لأنه من الأسماء الخمسة."
    },
    "R_kana_khabar_single_damir": {
      "id": "R_kana_khabar_single_damir",
      "type": "result",
      "coverage": "kana_khabar_single.damir",
      "text": "ضمير مبني في محل نصب خبر كان."
    },
    "R_kana_khabar_single_ishara": {
      "id": "R_kana_khabar_single_ishara",
      "type": "result",
      "coverage": "kana_khabar_single.ishara",
      "text": "اسم إشارة مبني في محل نصب خبر كان."
    },
    "R_kana_khabar_single_mawsool": {
      "id": "R_kana_khabar_single_mawsool",
      "type": "result",
      "coverage": "kana_khabar_single.mawsool",
      "text": "اسم موصول مبني في محل نصب خبر كان."
    },
    "R_kana_khabar_single_istifham": {
      "id": "R_kana_khabar_single_istifham",
      "type": "result",
      "coverage": "kana_khabar_single.istifham",
      "text": "اسم استفهام مبني في محل نصب خبر كان."
    },
    "R_kana_khabar_single_shart": {
      "id": "R_kana_khabar_single_shart",
      "type": "result",
      "coverage": "kana_khabar_single.shart",
      "text": "اسم شرط مبني في محل نصب خبر كان."
    },
    "R_kana_khabar_single_kam": {
      "id": "R_kana_khabar_single_kam",
      "type": "result",
      "coverage": "kana_khabar_single.kam",
      "text": "كم الخبرية مبنية في محل نصب خبر كان."
    },
    "R_kana_khabar_single_masdar": {
      "id": "R_kana_khabar_single_masdar",
      "type": "result",
      "coverage": "kana_khabar_single.masdar",
      "text": "مصدر مؤول في محل نصب خبر كان."
    },
    "kana_target": {
      "id": "kana_target",
      "type": "question",
      "context": "دخلت كان على الجملة.",
      "text": "ما وظيفة الكلمة المستهدفة؟",
      "hint": "كان ترفع الاسم وتنصب الخبر.",
      "answers": [
        {
          "id": "a",
          "text": "اسم كان",
          "next": "kana_ism_start",
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
    "kana_khabar_kind": {
      "id": "kana_khabar_kind",
      "type": "question",
      "context": "عرفنا أنها خبر كان.",
      "text": "ما صورة الخبر؟",
      "hint": "خبر كان قد يكون مفردًا أو جملة أو شبه جملة.",
      "answers": [
        {
          "id": "a",
          "text": "خبر مفرد",
          "next": "kana_khabar_single_start",
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
    "kana_khabar_sentence_type": {
      "id": "kana_khabar_sentence_type",
      "type": "question",
      "context": "خبر كان جملة.",
      "text": "ما نوع الجملة؟",
      "hint": "ننظر إلى بداية الخبر.",
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
      "context": "خبر كان شبه جملة.",
      "text": "ما نوع شبه الجملة؟",
      "hint": "جار ومجرور أو ظرف.",
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
      "coverage": "kana_khabar.verbal_sentence",
      "text": "جملة فعلية في محل نصب خبر كان."
    },
    "R_kana_khabar_nominal_sentence": {
      "id": "R_kana_khabar_nominal_sentence",
      "type": "result",
      "coverage": "kana_khabar.nominal_sentence",
      "text": "جملة اسمية في محل نصب خبر كان."
    },
    "R_kana_khabar_jar": {
      "id": "R_kana_khabar_jar",
      "type": "result",
      "coverage": "kana_khabar.jar",
      "text": "شبه جملة من الجار والمجرور في محل نصب خبر كان."
    },
    "R_kana_khabar_zarf": {
      "id": "R_kana_khabar_zarf",
      "type": "result",
      "coverage": "kana_khabar.zarf",
      "text": "شبه جملة ظرفية في محل نصب خبر كان."
    }
  }
};
