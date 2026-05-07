export type ExerciseTree = { startNodeId: string; nodes: Record<string, any> };

export const cleanInnaTree: ExerciseTree = {
  "startNodeId": "inna_target",
  "nodes": {
    "inna_ism_start": {
      "id": "inna_ism_start",
      "type": "question",
      "context": "عرفنا موقع الكلمة: اسم إن.",
      "text": "ما القرار التالي؟",
      "hint": "نحدد هل هي اسم معرب أو اسم مبني أو مصدر مؤول.",
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
          "next": "inna_ism_built",
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
    "inna_ism_built": {
      "id": "inna_ism_built",
      "type": "question",
      "context": "عرفنا أنها اسم مبني.",
      "text": "ما نوع الاسم المبني؟",
      "hint": "الاسم المبني يعرب في محلّه.",
      "answers": [
        {
          "id": "a",
          "text": "ضمير منفصل",
          "next": "R_inna_ism_damir",
          "eval": {
            "fact": "mabniType",
            "equals": "damir"
          }
        },
        {
          "id": "b",
          "text": "اسم إشارة",
          "next": "R_inna_ism_ishara",
          "eval": {
            "fact": "mabniType",
            "equals": "ishara"
          }
        },
        {
          "id": "c",
          "text": "اسم موصول",
          "next": "R_inna_ism_mawsool",
          "eval": {
            "fact": "mabniType",
            "equals": "mawsool"
          }
        },
        {
          "id": "d",
          "text": "اسم استفهام",
          "next": "R_inna_ism_istifham",
          "eval": {
            "fact": "mabniType",
            "equals": "istifham"
          }
        },
        {
          "id": "e",
          "text": "اسم شرط",
          "next": "R_inna_ism_shart",
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
      "context": "عرفنا أنه اسم معرب.",
      "text": "ما الخطوة التالية؟",
      "hint": "العدد والنوع يقودان إلى العلامة.",
      "answers": [
        {
          "id": "a",
          "text": "مفرد",
          "next": "inna_ism_ending",
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
          "next": "inna_ism_ending",
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
    "inna_ism_ending": {
      "id": "inna_ism_ending",
      "type": "question",
      "context": "الاسم يعامل معاملة المفرد أو جمع التكسير.",
      "text": "ما حالة آخره؟",
      "hint": "الصحيح تظهر عليه العلامة، والمعتل تقدر عليه.",
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
    "R_inna_ism_visible": {
      "id": "R_inna_ism_visible",
      "type": "result",
      "coverage": "inna_ism.visible",
      "text": "اسم إن منصوب وعلامة نصبه الفتحة الظاهرة على آخره."
    },
    "R_inna_ism_estimated": {
      "id": "R_inna_ism_estimated",
      "type": "result",
      "coverage": "inna_ism.estimated",
      "text": "اسم إن منصوب وعلامة نصبه الفتحة المقدرة على آخره."
    },
    "R_inna_ism_dual": {
      "id": "R_inna_ism_dual",
      "type": "result",
      "coverage": "inna_ism.dual",
      "text": "اسم إن منصوب وعلامة نصبه الياء لأنه مثنى."
    },
    "R_inna_ism_jms": {
      "id": "R_inna_ism_jms",
      "type": "result",
      "coverage": "inna_ism.jms",
      "text": "اسم إن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم."
    },
    "R_inna_ism_jfs": {
      "id": "R_inna_ism_jfs",
      "type": "result",
      "coverage": "inna_ism.jfs",
      "text": "اسم إن منصوب وعلامة نصبه الكسرة نيابة عن الفتحة لأنه جمع مؤنث سالم."
    },
    "R_inna_ism_five": {
      "id": "R_inna_ism_five",
      "type": "result",
      "coverage": "inna_ism.five",
      "text": "اسم إن منصوب وعلامة نصبه الألف لأنه من الأسماء الخمسة."
    },
    "R_inna_ism_damir": {
      "id": "R_inna_ism_damir",
      "type": "result",
      "coverage": "inna_ism.damir",
      "text": "ضمير مبني في محل نصب اسم إن."
    },
    "R_inna_ism_ishara": {
      "id": "R_inna_ism_ishara",
      "type": "result",
      "coverage": "inna_ism.ishara",
      "text": "اسم إشارة مبني في محل نصب اسم إن."
    },
    "R_inna_ism_mawsool": {
      "id": "R_inna_ism_mawsool",
      "type": "result",
      "coverage": "inna_ism.mawsool",
      "text": "اسم موصول مبني في محل نصب اسم إن."
    },
    "R_inna_ism_istifham": {
      "id": "R_inna_ism_istifham",
      "type": "result",
      "coverage": "inna_ism.istifham",
      "text": "اسم استفهام مبني في محل نصب اسم إن."
    },
    "R_inna_ism_shart": {
      "id": "R_inna_ism_shart",
      "type": "result",
      "coverage": "inna_ism.shart",
      "text": "اسم شرط مبني في محل نصب اسم إن."
    },
    "R_inna_ism_kam": {
      "id": "R_inna_ism_kam",
      "type": "result",
      "coverage": "inna_ism.kam",
      "text": "كم الخبرية مبني في محل نصب اسم إن."
    },
    "R_inna_ism_masdar": {
      "id": "R_inna_ism_masdar",
      "type": "result",
      "coverage": "inna_ism.masdar",
      "text": "مصدر مؤول في محل نصب اسم إن."
    },
    "inna_khabar_single_start": {
      "id": "inna_khabar_single_start",
      "type": "question",
      "context": "عرفنا موقع الكلمة: خبر إن.",
      "text": "ما القرار التالي؟",
      "hint": "نحدد هل هي اسم معرب أو اسم مبني أو مصدر مؤول.",
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
          "next": "inna_khabar_single_built",
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
    "inna_khabar_single_built": {
      "id": "inna_khabar_single_built",
      "type": "question",
      "context": "عرفنا أنها اسم مبني.",
      "text": "ما نوع الاسم المبني؟",
      "hint": "الاسم المبني يعرب في محلّه.",
      "answers": [
        {
          "id": "a",
          "text": "ضمير منفصل",
          "next": "R_inna_khabar_single_damir",
          "eval": {
            "fact": "mabniType",
            "equals": "damir"
          }
        },
        {
          "id": "b",
          "text": "اسم إشارة",
          "next": "R_inna_khabar_single_ishara",
          "eval": {
            "fact": "mabniType",
            "equals": "ishara"
          }
        },
        {
          "id": "c",
          "text": "اسم موصول",
          "next": "R_inna_khabar_single_mawsool",
          "eval": {
            "fact": "mabniType",
            "equals": "mawsool"
          }
        },
        {
          "id": "d",
          "text": "اسم استفهام",
          "next": "R_inna_khabar_single_istifham",
          "eval": {
            "fact": "mabniType",
            "equals": "istifham"
          }
        },
        {
          "id": "e",
          "text": "اسم شرط",
          "next": "R_inna_khabar_single_shart",
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
      "context": "عرفنا أنه اسم معرب.",
      "text": "ما الخطوة التالية؟",
      "hint": "العدد والنوع يقودان إلى العلامة.",
      "answers": [
        {
          "id": "a",
          "text": "مفرد",
          "next": "inna_khabar_single_ending",
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
          "next": "inna_khabar_single_ending",
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
    "inna_khabar_single_ending": {
      "id": "inna_khabar_single_ending",
      "type": "question",
      "context": "الاسم يعامل معاملة المفرد أو جمع التكسير.",
      "text": "ما حالة آخره؟",
      "hint": "الصحيح تظهر عليه العلامة، والمعتل تقدر عليه.",
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
    "R_inna_khabar_single_visible": {
      "id": "R_inna_khabar_single_visible",
      "type": "result",
      "coverage": "inna_khabar_single.visible",
      "text": "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره."
    },
    "R_inna_khabar_single_estimated": {
      "id": "R_inna_khabar_single_estimated",
      "type": "result",
      "coverage": "inna_khabar_single.estimated",
      "text": "خبر إن مرفوع وعلامة رفعه الضمة المقدرة على آخره."
    },
    "R_inna_khabar_single_dual": {
      "id": "R_inna_khabar_single_dual",
      "type": "result",
      "coverage": "inna_khabar_single.dual",
      "text": "خبر إن مرفوع وعلامة رفعه الألف لأنه مثنى."
    },
    "R_inna_khabar_single_jms": {
      "id": "R_inna_khabar_single_jms",
      "type": "result",
      "coverage": "inna_khabar_single.jms",
      "text": "خبر إن مرفوع وعلامة رفعه الواو لأنه جمع مذكر سالم."
    },
    "R_inna_khabar_single_jfs": {
      "id": "R_inna_khabar_single_jfs",
      "type": "result",
      "coverage": "inna_khabar_single.jfs",
      "text": "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره لأنه جمع مؤنث سالم."
    },
    "R_inna_khabar_single_five": {
      "id": "R_inna_khabar_single_five",
      "type": "result",
      "coverage": "inna_khabar_single.five",
      "text": "خبر إن مرفوع وعلامة رفعه الواو لأنه من الأسماء الخمسة."
    },
    "R_inna_khabar_single_damir": {
      "id": "R_inna_khabar_single_damir",
      "type": "result",
      "coverage": "inna_khabar_single.damir",
      "text": "ضمير مبني في محل رفع خبر إن."
    },
    "R_inna_khabar_single_ishara": {
      "id": "R_inna_khabar_single_ishara",
      "type": "result",
      "coverage": "inna_khabar_single.ishara",
      "text": "اسم إشارة مبني في محل رفع خبر إن."
    },
    "R_inna_khabar_single_mawsool": {
      "id": "R_inna_khabar_single_mawsool",
      "type": "result",
      "coverage": "inna_khabar_single.mawsool",
      "text": "اسم موصول مبني في محل رفع خبر إن."
    },
    "R_inna_khabar_single_istifham": {
      "id": "R_inna_khabar_single_istifham",
      "type": "result",
      "coverage": "inna_khabar_single.istifham",
      "text": "اسم استفهام مبني في محل رفع خبر إن."
    },
    "R_inna_khabar_single_shart": {
      "id": "R_inna_khabar_single_shart",
      "type": "result",
      "coverage": "inna_khabar_single.shart",
      "text": "اسم شرط مبني في محل رفع خبر إن."
    },
    "R_inna_khabar_single_kam": {
      "id": "R_inna_khabar_single_kam",
      "type": "result",
      "coverage": "inna_khabar_single.kam",
      "text": "كم الخبرية مبني في محل رفع خبر إن."
    },
    "R_inna_khabar_single_masdar": {
      "id": "R_inna_khabar_single_masdar",
      "type": "result",
      "coverage": "inna_khabar_single.masdar",
      "text": "مصدر مؤول في محل رفع خبر إن."
    },
    "inna_target": {
      "id": "inna_target",
      "type": "question",
      "context": "دخلت إن على الجملة.",
      "text": "ما وظيفة الكلمة المستهدفة؟",
      "hint": "إن تنصب الاسم وترفع الخبر.",
      "answers": [
        {
          "id": "a",
          "text": "اسم إن",
          "next": "inna_ism_start",
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
    "inna_khabar_kind": {
      "id": "inna_khabar_kind",
      "type": "question",
      "context": "عرفنا أنها خبر إن.",
      "text": "ما صورة الخبر؟",
      "hint": "خبر إن قد يكون مفردًا أو جملة أو شبه جملة.",
      "answers": [
        {
          "id": "a",
          "text": "خبر مفرد",
          "next": "inna_khabar_single_start",
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
    "inna_khabar_sentence_type": {
      "id": "inna_khabar_sentence_type",
      "type": "question",
      "context": "خبر إن جملة.",
      "text": "ما نوع الجملة؟",
      "hint": "ننظر إلى بداية الخبر.",
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
      "context": "خبر إن شبه جملة.",
      "text": "ما نوع شبه الجملة؟",
      "hint": "جار ومجرور أو ظرف.",
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
      "coverage": "inna_khabar.verbal_sentence",
      "text": "جملة فعلية في محل رفع خبر إن."
    },
    "R_inna_khabar_nominal_sentence": {
      "id": "R_inna_khabar_nominal_sentence",
      "type": "result",
      "coverage": "inna_khabar.nominal_sentence",
      "text": "جملة اسمية في محل رفع خبر إن."
    },
    "R_inna_khabar_jar": {
      "id": "R_inna_khabar_jar",
      "type": "result",
      "coverage": "inna_khabar.jar",
      "text": "شبه جملة من الجار والمجرور في محل رفع خبر إن."
    },
    "R_inna_khabar_zarf": {
      "id": "R_inna_khabar_zarf",
      "type": "result",
      "coverage": "inna_khabar.zarf",
      "text": "شبه جملة ظرفية في محل رفع خبر إن."
    }
  }
};
