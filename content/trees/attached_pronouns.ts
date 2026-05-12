export type ExerciseTree = { startNodeId: string; nodes: Record<string, any> };

export const attachedPronounsTree: ExerciseTree = {
  "startNodeId": "pronoun_source",
  "nodes": {
    "pronoun_source": {
      "id": "pronoun_source",
      "type": "question",
      "context": "نبدأ من العامل: ما الكلمة التي اتصل بها الضمير أو جاء في موقعها؟",
      "text": "أين وجدنا الضمير في الجملة؟",
      "hint": "العامل يساعدنا على معرفة محل الضمير.",
      "answers": [
        { "id": "a", "text": "متصل بفعل", "next": "pronoun_verb_role", "eval": { "fact": "source", "equals": "verb" } },
        { "id": "b", "text": "متصل باسم", "next": "R_pronoun_jar_idafa", "eval": { "fact": "source", "equals": "noun" } },
        { "id": "c", "text": "متصل بحرف جر", "next": "R_pronoun_jar_harf", "eval": { "fact": "source", "equals": "harf_jar" } },
        { "id": "d", "text": "متصل بحرف ناسخ", "next": "R_pronoun_nasikh", "eval": { "fact": "source", "equals": "nasikh" } },
        { "id": "e", "text": "ضمير منفصل", "next": "pronoun_separate_kind", "eval": { "fact": "source", "equals": "separate" } }
      ]
    },
    "pronoun_verb_role": {
      "id": "pronoun_verb_role",
      "type": "question",
      "context": "الضمير اتصل بفعل. الآن نسأل عن وظيفته.",
      "text": "هل قام الضمير بالفعل أم وقع عليه الفعل؟",
      "hint": "من قام بالفعل يكون في محل رفع فاعل، ومن وقع عليه الفعل يكون في محل نصب مفعول به.",
      "answers": [
        { "id": "a", "text": "قام بالفعل", "next": "R_pronoun_raf3_attached", "eval": { "fact": "role", "equals": "fael" } },
        { "id": "b", "text": "وقع عليه الفعل", "next": "R_pronoun_nasb_attached", "eval": { "fact": "role", "equals": "mafool" } }
      ]
    },
    "pronoun_separate_kind": {
      "id": "pronoun_separate_kind",
      "type": "question",
      "context": "الضمير منفصل. نحدد: هل هو من ضمائر الرفع أم النصب؟",
      "text": "ما نوع الضمير المنفصل؟",
      "hint": "أنا/نحن/هو من ضمائر الرفع، وإياك/إياه من ضمائر النصب.",
      "answers": [
        { "id": "a", "text": "ضمير رفع منفصل", "next": "R_pronoun_raf3_separate", "eval": { "fact": "separateKind", "equals": "raf3" } },
        { "id": "b", "text": "ضمير نصب منفصل", "next": "R_pronoun_nasb_separate", "eval": { "fact": "separateKind", "equals": "nasb" } }
      ]
    },
    "R_pronoun_raf3_attached": { "id": "R_pronoun_raf3_attached", "type": "result", "coverage": "pronoun.raf3.attached", "text": "ضمير رفع متصل مبني في محل رفع فاعل." },
    "R_pronoun_raf3_separate": { "id": "R_pronoun_raf3_separate", "type": "result", "coverage": "pronoun.raf3.separate", "text": "ضمير رفع منفصل مبني في محل رفع بحسب موقعه." },
    "R_pronoun_nasb_attached": { "id": "R_pronoun_nasb_attached", "type": "result", "coverage": "pronoun.nasb.attached", "text": "ضمير نصب متصل مبني في محل نصب مفعول به." },
    "R_pronoun_nasb_separate": { "id": "R_pronoun_nasb_separate", "type": "result", "coverage": "pronoun.nasb.separate", "text": "ضمير نصب منفصل مبني في محل نصب مفعول به." },
    "R_pronoun_jar_idafa": { "id": "R_pronoun_jar_idafa", "type": "result", "coverage": "pronoun.jar", "text": "ضمير متصل مبني في محل جر مضاف إليه." },
    "R_pronoun_jar_harf": { "id": "R_pronoun_jar_harf", "type": "result", "coverage": "pronoun.jar", "text": "ضمير متصل مبني في محل جر بحرف الجر." },
    "R_pronoun_nasikh": { "id": "R_pronoun_nasikh", "type": "result", "coverage": "pronoun.nasb.attached", "text": "ضمير متصل مبني في محل نصب اسم الحرف الناسخ." }
  }
};
