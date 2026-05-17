export type ExerciseTree = { startNodeId: string; nodes: Record<string, any> };

export const cleanMubtadaTree: ExerciseTree = {
  "startNodeId": "mubtada_start",
  "nodes": {
    "mubtada_start": {
      "id": "mubtada_start",
      "type": "question",
      "context": "عرفنا موقع الكلمة: مبتدأ.",
      "text": "ماذا نتحقق الآن؟",
      "hint": "نحدد هل هي اسم معرب أو اسم مبني أو مصدر مؤول.",
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
          "next": "mubtada_built",
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
    "mubtada_built": {
      "id": "mubtada_built",
      "type": "question",
      "context": "عرفنا أنها اسم مبني.",
      "text": "ما نوع الاسم المبني؟",
      "hint": "الاسم المبني يعرب في محلّه.",
      "answers": [
        {
          "id": "a",
          "text": "ضمير منفصل",
          "next": "R_mubtada_damir",
          "eval": {
            "fact": "mabniType",
            "equals": "damir"
          }
        },
        {
          "id": "b",
          "text": "اسم إشارة",
          "next": "R_mubtada_ishara",
          "eval": {
            "fact": "mabniType",
            "equals": "ishara"
          }
        },
        {
          "id": "c",
          "text": "اسم موصول",
          "next": "R_mubtada_mawsool",
          "eval": {
            "fact": "mabniType",
            "equals": "mawsool"
          }
        },
        {
          "id": "d",
          "text": "اسم استفهام",
          "next": "R_mubtada_istifham",
          "eval": {
            "fact": "mabniType",
            "equals": "istifham"
          }
        },
        {
          "id": "e",
          "text": "اسم شرط",
          "next": "R_mubtada_shart",
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
      "context": "عرفنا أنه اسم معرب.",
      "text": "ماذا نتحقق الآن؟",
      "hint": "العدد والنوع يقودان إلى العلامة.",
      "answers": [
        {
          "id": "a",
          "text": "مفرد",
          "next": "mubtada_ending",
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
          "next": "mubtada_ending",
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
    "mubtada_ending": {
      "id": "mubtada_ending",
      "type": "question",
      "context": "الاسم يعامل معاملة المفرد أو جمع التكسير.",
      "text": "ما حالة آخره؟",
      "hint": "الصحيح تظهر عليه العلامة، والمعتل تقدر عليه.",
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
    "R_mubtada_visible": {
      "id": "R_mubtada_visible",
      "type": "result",
      "coverage": "mubtada.visible",
      "text": "مبتدأ مرفوع وعلامة رفعه الضمة الظاهرة على آخره."
    },
    "R_mubtada_estimated": {
      "id": "R_mubtada_estimated",
      "type": "result",
      "coverage": "mubtada.estimated",
      "text": "مبتدأ مرفوع وعلامة رفعه الضمة المقدرة على آخره."
    },
    "R_mubtada_dual": {
      "id": "R_mubtada_dual",
      "type": "result",
      "coverage": "mubtada.dual",
      "text": "مبتدأ مرفوع وعلامة رفعه الألف لأنه مثنى."
    },
    "R_mubtada_jms": {
      "id": "R_mubtada_jms",
      "type": "result",
      "coverage": "mubtada.jms",
      "text": "مبتدأ مرفوع وعلامة رفعه الواو لأنه جمع مذكر سالم."
    },
    "R_mubtada_jfs": {
      "id": "R_mubtada_jfs",
      "type": "result",
      "coverage": "mubtada.jfs",
      "text": "مبتدأ مرفوع وعلامة رفعه الضمة الظاهرة على آخره لأنه جمع مؤنث سالم."
    },
    "R_mubtada_five": {
      "id": "R_mubtada_five",
      "type": "result",
      "coverage": "mubtada.five",
      "text": "مبتدأ مرفوع وعلامة رفعه الواو لأنه من الأسماء الخمسة."
    },
    "R_mubtada_damir": {
      "id": "R_mubtada_damir",
      "type": "result",
      "coverage": "mubtada.damir",
      "text": "ضمير مبني في محل رفع مبتدأ."
    },
    "R_mubtada_ishara": {
      "id": "R_mubtada_ishara",
      "type": "result",
      "coverage": "mubtada.ishara",
      "text": "اسم إشارة مبني في محل رفع مبتدأ."
    },
    "R_mubtada_mawsool": {
      "id": "R_mubtada_mawsool",
      "type": "result",
      "coverage": "mubtada.mawsool",
      "text": "اسم موصول مبني في محل رفع مبتدأ."
    },
    "R_mubtada_istifham": {
      "id": "R_mubtada_istifham",
      "type": "result",
      "coverage": "mubtada.istifham",
      "text": "اسم استفهام مبني في محل رفع مبتدأ."
    },
    "R_mubtada_shart": {
      "id": "R_mubtada_shart",
      "type": "result",
      "coverage": "mubtada.shart",
      "text": "اسم شرط مبني في محل رفع مبتدأ."
    },
    "R_mubtada_kam": {
      "id": "R_mubtada_kam",
      "type": "result",
      "coverage": "mubtada.kam",
      "text": "كم الخبرية مبنية في محل رفع مبتدأ."
    },
    "R_mubtada_masdar": {
      "id": "R_mubtada_masdar",
      "type": "result",
      "coverage": "mubtada.masdar",
      "text": "مصدر مؤول في محل رفع مبتدأ."
    }
  }
};
