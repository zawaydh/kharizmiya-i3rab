export type ExerciseTree = { startNodeId: string; nodes: Record<string, any> };

export const mafoolTree: ExerciseTree = {
  "startNodeId": "mafool_start",
  "nodes": {
    "mafool_start": {
      "id": "mafool_start",
      "type": "question",
      "context": "عرفنا موقع الكلمة: مفعول به.",
      "text": "ما القرار التالي؟",
      "hint": "نحدد هل هي اسم معرب أو اسم مبني أو مصدر مؤول.",
      "answers": [
        {
          "id": "a",
          "text": "اسم معرب",
          "next": "mafool_number",
          "eval": {
            "fact": "nounKind",
            "equals": "mu3rab"
          }
        },
        {
          "id": "b",
          "text": "اسم مبني",
          "next": "mafool_built",
          "eval": {
            "fact": "nounKind",
            "equals": "mabni"
          }
        },
        {
          "id": "c",
          "text": "مصدر مؤول",
          "next": "R_mafool_masdar",
          "eval": {
            "fact": "nounKind",
            "equals": "masdar"
          }
        }
      ]
    },
    "mafool_built": {
      "id": "mafool_built",
      "type": "question",
      "context": "عرفنا أنها اسم مبني.",
      "text": "ما نوع الاسم المبني؟",
      "hint": "الاسم المبني يعرب في محلّه.",
      "answers": [
        {
          "id": "a",
          "text": "ضمير منفصل",
          "next": "R_mafool_damir",
          "eval": {
            "fact": "mabniType",
            "equals": "damir"
          }
        },
        {
          "id": "b",
          "text": "اسم إشارة",
          "next": "R_mafool_ishara",
          "eval": {
            "fact": "mabniType",
            "equals": "ishara"
          }
        },
        {
          "id": "c",
          "text": "اسم موصول",
          "next": "R_mafool_mawsool",
          "eval": {
            "fact": "mabniType",
            "equals": "mawsool"
          }
        },
        {
          "id": "d",
          "text": "اسم استفهام",
          "next": "R_mafool_istifham",
          "eval": {
            "fact": "mabniType",
            "equals": "istifham"
          }
        },
        {
          "id": "e",
          "text": "اسم شرط",
          "next": "R_mafool_shart",
          "eval": {
            "fact": "mabniType",
            "equals": "shart"
          }
        },
        {
          "id": "f",
          "text": "كم الخبرية",
          "next": "R_mafool_kam",
          "eval": {
            "fact": "mabniType",
            "equals": "kam"
          }
        }
      ]
    },
    "mafool_number": {
      "id": "mafool_number",
      "type": "question",
      "context": "عرفنا أنه اسم معرب.",
      "text": "ما الخطوة التالية؟",
      "hint": "العدد والنوع يقودان إلى العلامة.",
      "answers": [
        {
          "id": "a",
          "text": "مفرد",
          "next": "mafool_ending",
          "eval": {
            "fact": "number",
            "equals": "singular"
          }
        },
        {
          "id": "b",
          "text": "مثنى",
          "next": "R_mafool_dual",
          "eval": {
            "fact": "number",
            "equals": "dual"
          }
        },
        {
          "id": "c",
          "text": "جمع مذكر سالم",
          "next": "R_mafool_jms",
          "eval": {
            "fact": "number",
            "equals": "jms"
          }
        },
        {
          "id": "d",
          "text": "جمع مؤنث سالم",
          "next": "R_mafool_jfs",
          "eval": {
            "fact": "number",
            "equals": "jfs"
          }
        },
        {
          "id": "e",
          "text": "جمع تكسير",
          "next": "mafool_ending",
          "eval": {
            "fact": "number",
            "equals": "jt"
          }
        },
        {
          "id": "f",
          "text": "من الأسماء الخمسة",
          "next": "R_mafool_five",
          "eval": {
            "fact": "number",
            "equals": "five"
          }
        }
      ]
    },
    "mafool_ending": {
      "id": "mafool_ending",
      "type": "question",
      "context": "الاسم يعامل معاملة المفرد أو جمع التكسير.",
      "text": "ما حالة آخره؟",
      "hint": "الصحيح تظهر عليه العلامة، والمعتل تقدر عليه.",
      "answers": [
        {
          "id": "a",
          "text": "صحيح الآخر",
          "next": "R_mafool_visible",
          "eval": {
            "fact": "ending",
            "equals": "sahih"
          }
        },
        {
          "id": "b",
          "text": "معتل الآخر",
          "next": "R_mafool_estimated",
          "eval": {
            "fact": "ending",
            "equals": "moatal"
          }
        }
      ]
    },
    "R_mafool_visible": {
      "id": "R_mafool_visible",
      "type": "result",
      "coverage": "mafool.visible",
      "text": "مفعول به منصوب وعلامة نصبه الفتحة الظاهرة على آخره."
    },
    "R_mafool_estimated": {
      "id": "R_mafool_estimated",
      "type": "result",
      "coverage": "mafool.estimated",
      "text": "مفعول به منصوب وعلامة نصبه الفتحة المقدرة على آخره."
    },
    "R_mafool_dual": {
      "id": "R_mafool_dual",
      "type": "result",
      "coverage": "mafool.dual",
      "text": "مفعول به منصوب وعلامة نصبه الياء لأنه مثنى."
    },
    "R_mafool_jms": {
      "id": "R_mafool_jms",
      "type": "result",
      "coverage": "mafool.jms",
      "text": "مفعول به منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم."
    },
    "R_mafool_jfs": {
      "id": "R_mafool_jfs",
      "type": "result",
      "coverage": "mafool.jfs",
      "text": "مفعول به منصوب وعلامة نصبه الكسرة نيابة عن الفتحة لأنه جمع مؤنث سالم."
    },
    "R_mafool_five": {
      "id": "R_mafool_five",
      "type": "result",
      "coverage": "mafool.five",
      "text": "مفعول به منصوب وعلامة نصبه الألف لأنه من الأسماء الخمسة."
    },
    "R_mafool_damir": {
      "id": "R_mafool_damir",
      "type": "result",
      "coverage": "mafool.damir",
      "text": "ضمير مبني في محل نصب مفعول به."
    },
    "R_mafool_ishara": {
      "id": "R_mafool_ishara",
      "type": "result",
      "coverage": "mafool.ishara",
      "text": "اسم إشارة مبني في محل نصب مفعول به."
    },
    "R_mafool_mawsool": {
      "id": "R_mafool_mawsool",
      "type": "result",
      "coverage": "mafool.mawsool",
      "text": "اسم موصول مبني في محل نصب مفعول به."
    },
    "R_mafool_istifham": {
      "id": "R_mafool_istifham",
      "type": "result",
      "coverage": "mafool.istifham",
      "text": "اسم استفهام مبني في محل نصب مفعول به."
    },
    "R_mafool_shart": {
      "id": "R_mafool_shart",
      "type": "result",
      "coverage": "mafool.shart",
      "text": "اسم شرط مبني في محل نصب مفعول به."
    },
    "R_mafool_kam": {
      "id": "R_mafool_kam",
      "type": "result",
      "coverage": "mafool.kam",
      "text": "كم الخبرية مبنية في محل نصب مفعول به."
    },
    "R_mafool_masdar": {
      "id": "R_mafool_masdar",
      "type": "result",
      "coverage": "mafool.masdar",
      "text": "مصدر مؤول في محل نصب مفعول به."
    }
  }
};
