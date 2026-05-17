export type ExerciseTree = { startNodeId: string; nodes: Record<string, any> };

export const faelTree: ExerciseTree = {
  "startNodeId": "fael_start",
  "nodes": {
    "fael_start": {
      "id": "fael_start",
      "type": "question",
      "context": "عرفنا موقع الكلمة: فاعل.",
      "text": "ماذا نتحقق الآن؟",
      "hint": "نحدد هل هي اسم معرب أو اسم مبني أو مصدر مؤول.",
      "answers": [
        {
          "id": "a",
          "text": "اسم معرب",
          "next": "fael_number",
          "eval": {
            "fact": "nounKind",
            "equals": "mu3rab"
          }
        },
        {
          "id": "b",
          "text": "اسم مبني",
          "next": "fael_built",
          "eval": {
            "fact": "nounKind",
            "equals": "mabni"
          }
        },
        {
          "id": "c",
          "text": "مصدر مؤول",
          "next": "R_fael_masdar",
          "eval": {
            "fact": "nounKind",
            "equals": "masdar"
          }
        }
      ]
    },
    "fael_built": {
      "id": "fael_built",
      "type": "question",
      "context": "عرفنا أنها اسم مبني.",
      "text": "ما نوع الاسم المبني؟",
      "hint": "الاسم المبني يعرب في محلّه.",
      "answers": [
        {
          "id": "a",
          "text": "ضمير منفصل",
          "next": "R_fael_damir",
          "eval": {
            "fact": "mabniType",
            "equals": "damir"
          }
        },
        {
          "id": "b",
          "text": "اسم إشارة",
          "next": "R_fael_ishara",
          "eval": {
            "fact": "mabniType",
            "equals": "ishara"
          }
        },
        {
          "id": "c",
          "text": "اسم موصول",
          "next": "R_fael_mawsool",
          "eval": {
            "fact": "mabniType",
            "equals": "mawsool"
          }
        },
        {
          "id": "d",
          "text": "اسم استفهام",
          "next": "R_fael_istifham",
          "eval": {
            "fact": "mabniType",
            "equals": "istifham"
          }
        },
        {
          "id": "e",
          "text": "اسم شرط",
          "next": "R_fael_shart",
          "eval": {
            "fact": "mabniType",
            "equals": "shart"
          }
        },
        {
          "id": "f",
          "text": "كم الخبرية",
          "next": "R_fael_kam",
          "eval": {
            "fact": "mabniType",
            "equals": "kam"
          }
        }
      ]
    },
    "fael_number": {
      "id": "fael_number",
      "type": "question",
      "context": "عرفنا أنه اسم معرب.",
      "text": "ماذا نتحقق الآن؟",
      "hint": "العدد والنوع يقودان إلى العلامة.",
      "answers": [
        {
          "id": "a",
          "text": "مفرد",
          "next": "fael_ending",
          "eval": {
            "fact": "number",
            "equals": "singular"
          }
        },
        {
          "id": "b",
          "text": "مثنى",
          "next": "R_fael_dual",
          "eval": {
            "fact": "number",
            "equals": "dual"
          }
        },
        {
          "id": "c",
          "text": "جمع مذكر سالم",
          "next": "R_fael_jms",
          "eval": {
            "fact": "number",
            "equals": "jms"
          }
        },
        {
          "id": "d",
          "text": "جمع مؤنث سالم",
          "next": "R_fael_jfs",
          "eval": {
            "fact": "number",
            "equals": "jfs"
          }
        },
        {
          "id": "e",
          "text": "جمع تكسير",
          "next": "fael_ending",
          "eval": {
            "fact": "number",
            "equals": "jt"
          }
        },
        {
          "id": "f",
          "text": "من الأسماء الخمسة",
          "next": "R_fael_five",
          "eval": {
            "fact": "number",
            "equals": "five"
          }
        }
      ]
    },
    "fael_ending": {
      "id": "fael_ending",
      "type": "question",
      "context": "الاسم يعامل معاملة المفرد أو جمع التكسير.",
      "text": "ما حالة آخره؟",
      "hint": "الصحيح تظهر عليه العلامة، والمعتل تقدر عليه.",
      "answers": [
        {
          "id": "a",
          "text": "صحيح الآخر",
          "next": "R_fael_visible",
          "eval": {
            "fact": "ending",
            "equals": "sahih"
          }
        },
        {
          "id": "b",
          "text": "معتل الآخر",
          "next": "R_fael_estimated",
          "eval": {
            "fact": "ending",
            "equals": "moatal"
          }
        }
      ]
    },
    "R_fael_visible": {
      "id": "R_fael_visible",
      "type": "result",
      "coverage": "fael.visible",
      "text": "فاعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره."
    },
    "R_fael_estimated": {
      "id": "R_fael_estimated",
      "type": "result",
      "coverage": "fael.estimated",
      "text": "فاعل مرفوع وعلامة رفعه الضمة المقدرة على آخره."
    },
    "R_fael_dual": {
      "id": "R_fael_dual",
      "type": "result",
      "coverage": "fael.dual",
      "text": "فاعل مرفوع وعلامة رفعه الألف لأنه مثنى."
    },
    "R_fael_jms": {
      "id": "R_fael_jms",
      "type": "result",
      "coverage": "fael.jms",
      "text": "فاعل مرفوع وعلامة رفعه الواو لأنه جمع مذكر سالم."
    },
    "R_fael_jfs": {
      "id": "R_fael_jfs",
      "type": "result",
      "coverage": "fael.jfs",
      "text": "فاعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره لأنه جمع مؤنث سالم."
    },
    "R_fael_five": {
      "id": "R_fael_five",
      "type": "result",
      "coverage": "fael.five",
      "text": "فاعل مرفوع وعلامة رفعه الواو لأنه من الأسماء الخمسة."
    },
    "R_fael_damir": {
      "id": "R_fael_damir",
      "type": "result",
      "coverage": "fael.damir",
      "text": "ضمير مبني في محل رفع فاعل."
    },
    "R_fael_ishara": {
      "id": "R_fael_ishara",
      "type": "result",
      "coverage": "fael.ishara",
      "text": "اسم إشارة مبني في محل رفع فاعل."
    },
    "R_fael_mawsool": {
      "id": "R_fael_mawsool",
      "type": "result",
      "coverage": "fael.mawsool",
      "text": "اسم موصول مبني في محل رفع فاعل."
    },
    "R_fael_istifham": {
      "id": "R_fael_istifham",
      "type": "result",
      "coverage": "fael.istifham",
      "text": "اسم استفهام مبني في محل رفع فاعل."
    },
    "R_fael_shart": {
      "id": "R_fael_shart",
      "type": "result",
      "coverage": "fael.shart",
      "text": "اسم شرط مبني في محل رفع فاعل."
    },
    "R_fael_kam": {
      "id": "R_fael_kam",
      "type": "result",
      "coverage": "fael.kam",
      "text": "كم الخبرية مبنية في محل رفع فاعل."
    },
    "R_fael_masdar": {
      "id": "R_fael_masdar",
      "type": "result",
      "coverage": "fael.masdar",
      "text": "مصدر مؤول في محل رفع فاعل."
    }
  }
};
