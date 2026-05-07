export type ExerciseTree = { startNodeId: string; nodes: Record<string, any> };

export const cleanKhabarTree: ExerciseTree = {
  "startNodeId": "khabar_kind",
  "nodes": {
    "khabar_single_start": {
      "id": "khabar_single_start",
      "type": "question",
      "context": "عرفنا موقع الكلمة: خبر.",
      "text": "ما القرار التالي؟",
      "hint": "نحدد هل هي اسم معرب أو اسم مبني أو مصدر مؤول.",
      "answers": [
        {
          "id": "a",
          "text": "اسم معرب",
          "next": "khabar_single_number",
          "eval": {
            "fact": "nounKind",
            "equals": "mu3rab"
          }
        },
        {
          "id": "b",
          "text": "اسم مبني",
          "next": "khabar_single_built",
          "eval": {
            "fact": "nounKind",
            "equals": "mabni"
          }
        },
        {
          "id": "c",
          "text": "مصدر مؤول",
          "next": "R_khabar_single_masdar",
          "eval": {
            "fact": "nounKind",
            "equals": "masdar"
          }
        }
      ]
    },
    "khabar_single_built": {
      "id": "khabar_single_built",
      "type": "question",
      "context": "عرفنا أنها اسم مبني.",
      "text": "ما نوع الاسم المبني؟",
      "hint": "الاسم المبني يعرب في محلّه.",
      "answers": [
        {
          "id": "a",
          "text": "ضمير منفصل",
          "next": "R_khabar_single_damir",
          "eval": {
            "fact": "mabniType",
            "equals": "damir"
          }
        },
        {
          "id": "b",
          "text": "اسم إشارة",
          "next": "R_khabar_single_ishara",
          "eval": {
            "fact": "mabniType",
            "equals": "ishara"
          }
        },
        {
          "id": "c",
          "text": "اسم موصول",
          "next": "R_khabar_single_mawsool",
          "eval": {
            "fact": "mabniType",
            "equals": "mawsool"
          }
        },
        {
          "id": "d",
          "text": "اسم استفهام",
          "next": "R_khabar_single_istifham",
          "eval": {
            "fact": "mabniType",
            "equals": "istifham"
          }
        },
        {
          "id": "e",
          "text": "اسم شرط",
          "next": "R_khabar_single_shart",
          "eval": {
            "fact": "mabniType",
            "equals": "shart"
          }
        },
        {
          "id": "f",
          "text": "كم الخبرية",
          "next": "R_khabar_single_kam",
          "eval": {
            "fact": "mabniType",
            "equals": "kam"
          }
        }
      ]
    },
    "khabar_single_number": {
      "id": "khabar_single_number",
      "type": "question",
      "context": "عرفنا أنه اسم معرب.",
      "text": "ما الخطوة التالية؟",
      "hint": "العدد والنوع يقودان إلى العلامة.",
      "answers": [
        {
          "id": "a",
          "text": "مفرد",
          "next": "khabar_single_ending",
          "eval": {
            "fact": "number",
            "equals": "singular"
          }
        },
        {
          "id": "b",
          "text": "مثنى",
          "next": "R_khabar_single_dual",
          "eval": {
            "fact": "number",
            "equals": "dual"
          }
        },
        {
          "id": "c",
          "text": "جمع مذكر سالم",
          "next": "R_khabar_single_jms",
          "eval": {
            "fact": "number",
            "equals": "jms"
          }
        },
        {
          "id": "d",
          "text": "جمع مؤنث سالم",
          "next": "R_khabar_single_jfs",
          "eval": {
            "fact": "number",
            "equals": "jfs"
          }
        },
        {
          "id": "e",
          "text": "جمع تكسير",
          "next": "khabar_single_ending",
          "eval": {
            "fact": "number",
            "equals": "jt"
          }
        },
        {
          "id": "f",
          "text": "من الأسماء الخمسة",
          "next": "R_khabar_single_five",
          "eval": {
            "fact": "number",
            "equals": "five"
          }
        }
      ]
    },
    "khabar_single_ending": {
      "id": "khabar_single_ending",
      "type": "question",
      "context": "الاسم يعامل معاملة المفرد أو جمع التكسير.",
      "text": "ما حالة آخره؟",
      "hint": "الصحيح تظهر عليه العلامة، والمعتل تقدر عليه.",
      "answers": [
        {
          "id": "a",
          "text": "صحيح الآخر",
          "next": "R_khabar_single_visible",
          "eval": {
            "fact": "ending",
            "equals": "sahih"
          }
        },
        {
          "id": "b",
          "text": "معتل الآخر",
          "next": "R_khabar_single_estimated",
          "eval": {
            "fact": "ending",
            "equals": "moatal"
          }
        }
      ]
    },
    "R_khabar_single_visible": {
      "id": "R_khabar_single_visible",
      "type": "result",
      "coverage": "khabar_single.visible",
      "text": "خبر مرفوع وعلامة رفعه الضمة الظاهرة على آخره."
    },
    "R_khabar_single_estimated": {
      "id": "R_khabar_single_estimated",
      "type": "result",
      "coverage": "khabar_single.estimated",
      "text": "خبر مرفوع وعلامة رفعه الضمة المقدرة على آخره."
    },
    "R_khabar_single_dual": {
      "id": "R_khabar_single_dual",
      "type": "result",
      "coverage": "khabar_single.dual",
      "text": "خبر مرفوع وعلامة رفعه الألف لأنه مثنى."
    },
    "R_khabar_single_jms": {
      "id": "R_khabar_single_jms",
      "type": "result",
      "coverage": "khabar_single.jms",
      "text": "خبر مرفوع وعلامة رفعه الواو لأنه جمع مذكر سالم."
    },
    "R_khabar_single_jfs": {
      "id": "R_khabar_single_jfs",
      "type": "result",
      "coverage": "khabar_single.jfs",
      "text": "خبر مرفوع وعلامة رفعه الضمة الظاهرة على آخره لأنه جمع مؤنث سالم."
    },
    "R_khabar_single_five": {
      "id": "R_khabar_single_five",
      "type": "result",
      "coverage": "khabar_single.five",
      "text": "خبر مرفوع وعلامة رفعه الواو لأنه من الأسماء الخمسة."
    },
    "R_khabar_single_damir": {
      "id": "R_khabar_single_damir",
      "type": "result",
      "coverage": "khabar_single.damir",
      "text": "ضمير مبني في محل رفع خبر."
    },
    "R_khabar_single_ishara": {
      "id": "R_khabar_single_ishara",
      "type": "result",
      "coverage": "khabar_single.ishara",
      "text": "اسم إشارة مبني في محل رفع خبر."
    },
    "R_khabar_single_mawsool": {
      "id": "R_khabar_single_mawsool",
      "type": "result",
      "coverage": "khabar_single.mawsool",
      "text": "اسم موصول مبني في محل رفع خبر."
    },
    "R_khabar_single_istifham": {
      "id": "R_khabar_single_istifham",
      "type": "result",
      "coverage": "khabar_single.istifham",
      "text": "اسم استفهام مبني في محل رفع خبر."
    },
    "R_khabar_single_shart": {
      "id": "R_khabar_single_shart",
      "type": "result",
      "coverage": "khabar_single.shart",
      "text": "اسم شرط مبني في محل رفع خبر."
    },
    "R_khabar_single_kam": {
      "id": "R_khabar_single_kam",
      "type": "result",
      "coverage": "khabar_single.kam",
      "text": "كم الخبرية مبنية في محل رفع خبر."
    },
    "R_khabar_single_masdar": {
      "id": "R_khabar_single_masdar",
      "type": "result",
      "coverage": "khabar_single.masdar",
      "text": "مصدر مؤول في محل رفع خبر."
    },
    "khabar_kind": {
      "id": "khabar_kind",
      "type": "question",
      "context": "عرفنا أننا نبحث عن الخبر.",
      "text": "ما الخطوة التالية؟",
      "hint": "نحدد صورة الخبر أولًا.",
      "answers": [
        {
          "id": "a",
          "text": "خبر مفرد",
          "next": "khabar_single_start",
          "eval": {
            "fact": "khabarKind",
            "equals": "single"
          }
        },
        {
          "id": "b",
          "text": "جملة",
          "next": "khabar_sentence_type",
          "eval": {
            "fact": "khabarKind",
            "equals": "sentence"
          }
        },
        {
          "id": "c",
          "text": "شبه جملة",
          "next": "khabar_shibh_type",
          "eval": {
            "fact": "khabarKind",
            "equals": "shibh"
          }
        }
      ]
    },
    "khabar_sentence_type": {
      "id": "khabar_sentence_type",
      "type": "question",
      "context": "عرفنا أن الخبر جملة.",
      "text": "ما نوع الجملة؟",
      "hint": "الجملة الفعلية تبدأ بفعل، والجملة الاسمية تبدأ باسم.",
      "answers": [
        {
          "id": "a",
          "text": "جملة فعلية",
          "next": "R_khabar_verbal_sentence",
          "eval": {
            "fact": "sentenceType",
            "equals": "verbal"
          }
        },
        {
          "id": "b",
          "text": "جملة اسمية",
          "next": "R_khabar_nominal_sentence",
          "eval": {
            "fact": "sentenceType",
            "equals": "nominal"
          }
        }
      ]
    },
    "khabar_shibh_type": {
      "id": "khabar_shibh_type",
      "type": "question",
      "context": "عرفنا أن الخبر شبه جملة.",
      "text": "ما نوع شبه الجملة؟",
      "hint": "شبه الجملة: جار ومجرور أو ظرف.",
      "answers": [
        {
          "id": "a",
          "text": "جار ومجرور",
          "next": "R_khabar_jar",
          "eval": {
            "fact": "shibhType",
            "equals": "jar"
          }
        },
        {
          "id": "b",
          "text": "ظرف",
          "next": "R_khabar_zarf",
          "eval": {
            "fact": "shibhType",
            "equals": "zarf"
          }
        }
      ]
    },
    "R_khabar_verbal_sentence": {
      "id": "R_khabar_verbal_sentence",
      "type": "result",
      "coverage": "khabar.verbal_sentence",
      "text": "جملة فعلية في محل رفع خبر."
    },
    "R_khabar_nominal_sentence": {
      "id": "R_khabar_nominal_sentence",
      "type": "result",
      "coverage": "khabar.nominal_sentence",
      "text": "جملة اسمية في محل رفع خبر."
    },
    "R_khabar_jar": {
      "id": "R_khabar_jar",
      "type": "result",
      "coverage": "khabar.jar",
      "text": "شبه جملة من الجار والمجرور في محل رفع خبر."
    },
    "R_khabar_zarf": {
      "id": "R_khabar_zarf",
      "type": "result",
      "coverage": "khabar.zarf",
      "text": "شبه جملة ظرفية في محل رفع خبر."
    }
  }
};
