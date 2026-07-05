export type Example = { id: string; sentence: string; target: string; facts: Record<string, any>; covers: string[] };
export const cleanInnaCoverageKeysOrdered = [
  "inna_ism.visible",
  "inna_ism.maqsur",
  "inna_ism.manqous",
  "inna_ism.dual",
  "inna_ism.jms",
  "inna_ism.jfs",
  "inna_ism.five",
  "inna_ism.connected_damir",
  "inna_ism.ishara",
  "inna_ism.mawsool",
  "inna_khabar_single.visible",
  "inna_khabar_single.maqsur",
  "inna_khabar_single.manqous",
  "inna_khabar_single.dual",
  "inna_khabar_single.jms",
  "inna_khabar_single.jfs",
  "inna_khabar_single.five",
  "inna_khabar_single.damir",
  "inna_khabar_single.ishara",
  "inna_khabar_single.mawsool",
  "inna_khabar_single.masdar",
  "inna_khabar.verbal_sentence",
  "inna_khabar.nominal_sentence",
  "inna_khabar.jar",
  "inna_khabar.zarf",
  "inna_khabar.jar_advanced",
  "inna_khabar.zarf_advanced",
  "inna_kaffa.cancelled"
];
export const cleanInnaExamples: Example[] = [
  {
    "id": "in-01",
    "sentence": "إن الطالبَ نشيطٌ.",
    "target": "الطالبَ",
    "facts": {
      "targetRole": "ism",
      "nounKind": "mu3rab",
      "number": "singular_or_jt",
      "ending": "sahih",
      "semanticAnswer": "judgment",
      "semanticQuestion": "ما الذي أكّدته إنَّ؟",
      "particleLabel": "إنَّ",
      "particleMeaning": "tawkid",
      "meaningSubject": "الطالب.",
      "meaningPredicate": "نشيط.",
      "meaningJudgment": "الطالب نشيط.",
      "baseStart": "ism",
      "baseFirstRole": "mubtada",
      "nasikhEffect": "mubtada_to_ism"
    },
    "covers": [
      "inna_ism.visible"
    ]
  },
  {
    "id": "in-02",
    "sentence": "لعل الفتى حاضرٌ.",
    "target": "الفتى",
    "facts": {
      "targetRole": "ism",
      "nounKind": "mu3rab",
      "number": "singular_or_jt",
      "ending": "maqsur",
      "semanticAnswer": "judgment",
      "semanticQuestion": "ما الشيء المرجو؟",
      "particleLabel": "لعل",
      "particleMeaning": "tarajji",
      "meaningSubject": "الفتى.",
      "meaningPredicate": "حاضر.",
      "meaningJudgment": "الفتى حاضر.",
      "baseStart": "ism",
      "baseFirstRole": "mubtada",
      "nasikhEffect": "mubtada_to_ism"
    },
    "covers": [
      "inna_ism.maqsur"
    ]
  },
  {
    "id": "in-03",
    "sentence": "علمتُ أنَّ القاضيَ عادلٌ.",
    "target": "القاضيَ",
    "facts": {
      "targetRole": "ism",
      "nounKind": "mu3rab",
      "number": "singular_or_jt",
      "ending": "manqous",
      "semanticAnswer": "judgment",
      "semanticQuestion": "ما الذي أكّدته أنَّ؟",
      "particleLabel": "أنَّ",
      "particleMeaning": "tawkid",
      "meaningSubject": "القاضي.",
      "meaningPredicate": "عادل.",
      "meaningJudgment": "القاضي عادل.",
      "baseStart": "ism",
      "baseFirstRole": "mubtada",
      "nasikhEffect": "mubtada_to_ism"
    },
    "covers": [
      "inna_ism.manqous"
    ]
  },
  {
    "id": "in-04",
    "sentence": "علمتُ أنَّ الطالبينِ حاضرانِ.",
    "target": "الطالبينِ",
    "facts": {
      "targetRole": "ism",
      "nounKind": "mu3rab",
      "number": "dual",
      "semanticAnswer": "judgment",
      "semanticQuestion": "ما الذي أكّدته أنَّ؟",
      "particleLabel": "أنَّ",
      "particleMeaning": "tawkid",
      "meaningSubject": "الطالبان.",
      "meaningPredicate": "حاضران.",
      "meaningJudgment": "الطالبان حاضران.",
      "baseStart": "ism",
      "baseFirstRole": "mubtada",
      "nasikhEffect": "mubtada_to_ism"
    },
    "covers": [
      "inna_ism.dual"
    ]
  },
  {
    "id": "in-05",
    "sentence": "لعل المعلمينَ مخلصون.",
    "target": "المعلمينَ",
    "facts": {
      "targetRole": "ism",
      "nounKind": "mu3rab",
      "number": "jms",
      "semanticAnswer": "judgment",
      "semanticQuestion": "ما الشيء المرجو؟",
      "particleLabel": "لعل",
      "particleMeaning": "tarajji",
      "meaningSubject": "المعلمون.",
      "meaningPredicate": "مخلصون.",
      "meaningJudgment": "المعلمون مخلصون.",
      "baseStart": "ism",
      "baseFirstRole": "mubtada",
      "nasikhEffect": "mubtada_to_ism"
    },
    "covers": [
      "inna_ism.jms"
    ]
  },
  {
    "id": "in-06",
    "sentence": "ليت الطالباتِ مجتهداتٌ.",
    "target": "الطالباتِ",
    "facts": {
      "targetRole": "ism",
      "nounKind": "mu3rab",
      "number": "jfs",
      "semanticAnswer": "judgment",
      "semanticQuestion": "ما الشيء المتمنى؟",
      "particleLabel": "ليت",
      "particleMeaning": "tamanni",
      "meaningSubject": "الطالبات.",
      "meaningPredicate": "مجتهدات.",
      "meaningJudgment": "الطالبات مجتهدات.",
      "baseStart": "ism",
      "baseFirstRole": "mubtada",
      "nasikhEffect": "mubtada_to_ism"
    },
    "covers": [
      "inna_ism.jfs"
    ]
  },
  {
    "id": "in-07",
    "sentence": "إن أباك كريمٌ.",
    "target": "أباك",
    "facts": {
      "targetRole": "ism",
      "nounKind": "mu3rab",
      "number": "five",
      "semanticAnswer": "judgment",
      "semanticQuestion": "ما الذي أكّدته إنَّ؟",
      "particleLabel": "إنَّ",
      "particleMeaning": "tawkid",
      "meaningSubject": "أبوك.",
      "meaningPredicate": "كريم.",
      "meaningJudgment": "أبوك كريم.",
      "baseStart": "ism",
      "baseFirstRole": "mubtada",
      "nasikhEffect": "mubtada_to_ism"
    },
    "covers": [
      "inna_ism.five"
    ]
  },
  {
    "id": "in-08",
    "sentence": "لعلهم فائزون.",
    "target": "هم",
    "facts": {
      "targetRole": "ism",
      "nounKind": "connected_damir",
      "semanticAnswer": "judgment",
      "semanticQuestion": "ما الشيء المرجو؟",
      "particleLabel": "لعل",
      "particleMeaning": "tarajji",
      "meaningSubject": "هم.",
      "meaningPredicate": "فائزون.",
      "meaningJudgment": "هم فائزون.",
      "baseStart": "ism",
      "baseFirstRole": "mubtada",
      "nasikhEffect": "mubtada_to_ism"
    },
    "covers": [
      "inna_ism.connected_damir"
    ]
  },
  {
    "id": "in-09",
    "sentence": "كأن هذا جبلٌ.",
    "target": "هذا",
    "facts": {
      "targetRole": "ism",
      "nounKind": "mabni",
      "mabniType": "ishara",
      "semanticAnswer": "judgment",
      "semanticQuestion": "ما صورة التشبيه الكاملة التي أفادتها كأنَّ؟",
      "particleLabel": "كأن",
      "particleMeaning": "tashbih",
      "meaningSubject": "هذا.",
      "meaningPredicate": "جبل.",
      "meaningJudgment": "هذا جبل.",
      "baseStart": "ism",
      "baseFirstRole": "mubtada",
      "nasikhEffect": "mubtada_to_ism"
    },
    "covers": [
      "inna_ism.ishara"
    ]
  },
  {
    "id": "in-10",
    "sentence": "الكلام كثيرٌ لكنَّ الذي صدقَ محبوبٌ.",
    "target": "الذي",
    "facts": {
      "targetRole": "ism",
      "nounKind": "mabni",
      "mabniType": "mawsool",
      "semanticAnswer": "judgment",
      "semanticQuestion": "ما المعنى الذي استدركته لكنَّ؛ أي منعنا به فهمًا خاطئًا مما قبلها أو أثبتناه بعد نفي؟",
      "particleLabel": "لكنَّ",
      "particleMeaning": "istidrak",
      "meaningSubject": "الذي صدق.",
      "meaningPredicate": "محبوب.",
      "meaningJudgment": "الذي صدق محبوب.",
      "baseStart": "ism",
      "baseFirstRole": "mubtada",
      "nasikhEffect": "mubtada_to_ism"
    },
    "covers": [
      "inna_ism.mawsool"
    ]
  },
  {
    "id": "in-11",
    "sentence": "علمتُ أنَّ الطالبَ نشيطٌ.",
    "target": "نشيطٌ",
    "facts": {
      "targetRole": "khabar",
      "khabarKind": "single",
      "nounKind": "mu3rab",
      "number": "singular_or_jt",
      "ending": "sahih",
      "semanticAnswer": "judgment",
      "semanticQuestion": "ما الذي أكّدته أنَّ؟",
      "particleLabel": "أنَّ",
      "particleMeaning": "tawkid",
      "meaningSubject": "الطالب.",
      "meaningPredicate": "نشيط.",
      "meaningJudgment": "الطالب نشيط.",
      "baseStart": "ism",
      "baseFirstRole": "mubtada",
      "nasikhEffect": "mubtada_to_ism"
    },
    "covers": [
      "inna_khabar_single.visible"
    ]
  },
  {
    "id": "in-12",
    "sentence": "ليت الهدفَ أسمى.",
    "target": "أسمى",
    "facts": {
      "targetRole": "khabar",
      "khabarKind": "single",
      "nounKind": "mu3rab",
      "number": "singular_or_jt",
      "ending": "maqsur",
      "semanticAnswer": "judgment",
      "semanticQuestion": "ما الشيء المتمنى؟",
      "particleLabel": "ليت",
      "particleMeaning": "tamanni",
      "meaningSubject": "الهدف.",
      "meaningPredicate": "أسمى.",
      "meaningJudgment": "الهدف أسمى.",
      "baseStart": "ism",
      "baseFirstRole": "mubtada",
      "nasikhEffect": "mubtada_to_ism"
    },
    "covers": [
      "inna_khabar_single.maqsur"
    ]
  },
  {
    "id": "in-13",
    "sentence": "إن القاضيَ راضٍ.",
    "target": "راضٍ",
    "facts": {
      "targetRole": "khabar",
      "khabarKind": "single",
      "nounKind": "mu3rab",
      "number": "singular_or_jt",
      "ending": "manqous",
      "semanticAnswer": "judgment",
      "semanticQuestion": "ما الذي أكّدته إنَّ؟",
      "particleLabel": "إنَّ",
      "particleMeaning": "tawkid",
      "meaningSubject": "القاضي.",
      "meaningPredicate": "راضٍ.",
      "meaningJudgment": "القاضي راضٍ.",
      "baseStart": "ism",
      "baseFirstRole": "mubtada",
      "nasikhEffect": "mubtada_to_ism"
    },
    "covers": [
      "inna_khabar_single.manqous"
    ]
  },
  {
    "id": "in-14",
    "sentence": "لعل الطالبينِ حاضرانِ.",
    "target": "حاضرانِ",
    "facts": {
      "targetRole": "khabar",
      "khabarKind": "single",
      "nounKind": "mu3rab",
      "number": "dual",
      "semanticAnswer": "judgment",
      "semanticQuestion": "ما الشيء المرجو؟",
      "particleLabel": "لعل",
      "particleMeaning": "tarajji",
      "meaningSubject": "الطالبان.",
      "meaningPredicate": "حاضران.",
      "meaningJudgment": "الطالبان حاضران.",
      "baseStart": "ism",
      "baseFirstRole": "mubtada",
      "nasikhEffect": "mubtada_to_ism"
    },
    "covers": [
      "inna_khabar_single.dual"
    ]
  },
  {
    "id": "in-15",
    "sentence": "إن المعلمينَ مخلصون.",
    "target": "مخلصون",
    "facts": {
      "targetRole": "khabar",
      "khabarKind": "single",
      "nounKind": "mu3rab",
      "number": "jms",
      "semanticAnswer": "judgment",
      "semanticQuestion": "ما الذي أكّدته إنَّ؟",
      "particleLabel": "إنَّ",
      "particleMeaning": "tawkid",
      "meaningSubject": "المعلمون.",
      "meaningPredicate": "مخلصون.",
      "meaningJudgment": "المعلمون مخلصون.",
      "baseStart": "ism",
      "baseFirstRole": "mubtada",
      "nasikhEffect": "mubtada_to_ism"
    },
    "covers": [
      "inna_khabar_single.jms"
    ]
  },
  {
    "id": "in-16",
    "sentence": "ليت الطالباتِ مجتهداتٌ.",
    "target": "مجتهداتٌ",
    "facts": {
      "targetRole": "khabar",
      "khabarKind": "single",
      "nounKind": "mu3rab",
      "number": "jfs",
      "semanticAnswer": "judgment",
      "semanticQuestion": "ما الشيء المتمنى؟",
      "particleLabel": "ليت",
      "particleMeaning": "tamanni",
      "meaningSubject": "الطالبات.",
      "meaningPredicate": "مجتهدات.",
      "meaningJudgment": "الطالبات مجتهدات.",
      "baseStart": "ism",
      "baseFirstRole": "mubtada",
      "nasikhEffect": "mubtada_to_ism"
    },
    "covers": [
      "inna_khabar_single.jfs"
    ]
  },
  {
    "id": "in-17",
    "sentence": "إن أباك ذو فضلٍ.",
    "target": "ذو",
    "facts": {
      "targetRole": "khabar",
      "khabarKind": "single",
      "nounKind": "mu3rab",
      "number": "five",
      "semanticAnswer": "judgment",
      "semanticQuestion": "ما الذي أكّدته إنَّ؟",
      "particleLabel": "إنَّ",
      "particleMeaning": "tawkid",
      "meaningSubject": "أبوك.",
      "meaningPredicate": "ذو فضل.",
      "meaningJudgment": "أبوك ذو فضل.",
      "baseStart": "ism",
      "baseFirstRole": "mubtada",
      "nasikhEffect": "mubtada_to_ism"
    },
    "covers": [
      "inna_khabar_single.five"
    ]
  },
  {
    "id": "in-18",
    "sentence": "العمل كثيرٌ لكنَّ المسؤولَ أنتَ.",
    "target": "أنتَ",
    "facts": {
      "targetRole": "khabar",
      "khabarKind": "single",
      "nounKind": "mabni",
      "mabniType": "damir",
      "semanticAnswer": "judgment",
      "semanticQuestion": "ما المعنى الذي استدركته لكنَّ؛ أي منعنا به فهمًا خاطئًا مما قبلها أو أثبتناه بعد نفي؟",
      "particleLabel": "لكنَّ",
      "particleMeaning": "istidrak",
      "meaningSubject": "المسؤول.",
      "meaningPredicate": "أنت.",
      "meaningJudgment": "المسؤول أنت.",
      "baseStart": "ism",
      "baseFirstRole": "mubtada",
      "nasikhEffect": "mubtada_to_ism"
    },
    "covers": [
      "inna_khabar_single.damir"
    ]
  },
  {
    "id": "in-19",
    "sentence": "كأن الحلَّ هذا.",
    "target": "هذا",
    "facts": {
      "targetRole": "khabar",
      "khabarKind": "single",
      "nounKind": "mabni",
      "mabniType": "ishara",
      "semanticAnswer": "judgment",
      "semanticQuestion": "ما صورة التشبيه الكاملة التي أفادتها كأنَّ؟",
      "particleLabel": "كأن",
      "particleMeaning": "tashbih",
      "meaningSubject": "الحل.",
      "meaningPredicate": "هذا.",
      "meaningJudgment": "الحل هذا.",
      "baseStart": "ism",
      "baseFirstRole": "mubtada",
      "nasikhEffect": "mubtada_to_ism"
    },
    "covers": [
      "inna_khabar_single.ishara"
    ]
  },
  {
    "id": "in-20",
    "sentence": "إن الفائزَ مَن صبرَ.",
    "target": "مَن",
    "facts": {
      "targetRole": "khabar",
      "khabarKind": "single",
      "nounKind": "mabni",
      "mabniType": "mawsool",
      "semanticAnswer": "judgment",
      "semanticQuestion": "ما الذي أكّدته إنَّ؟",
      "particleLabel": "إنَّ",
      "particleMeaning": "tawkid",
      "meaningSubject": "الفائز.",
      "meaningPredicate": "من صبر.",
      "meaningJudgment": "الفائز من صبر.",
      "baseStart": "ism",
      "baseFirstRole": "mubtada",
      "nasikhEffect": "mubtada_to_ism"
    },
    "covers": [
      "inna_khabar_single.mawsool"
    ]
  },
  {
    "id": "in-21",
    "sentence": "إن هدفَك أن تنجحَ.",
    "target": "أن تنجحَ",
    "facts": {
      "targetRole": "khabar",
      "khabarKind": "single",
      "nounKind": "masdar",
      "semanticAnswer": "judgment",
      "semanticQuestion": "ما الذي أكّدته إنَّ؟",
      "particleLabel": "إنَّ",
      "particleMeaning": "tawkid",
      "meaningSubject": "هدفك.",
      "meaningPredicate": "أن تنجح.",
      "meaningJudgment": "هدفك أن تنجح.",
      "baseStart": "ism",
      "baseFirstRole": "mubtada",
      "nasikhEffect": "mubtada_to_ism"
    },
    "covers": [
      "inna_khabar_single.masdar"
    ]
  },
  {
    "id": "in-22",
    "sentence": "ليت الطالبَ يقرأُ.",
    "target": "يقرأُ",
    "facts": {
      "targetRole": "khabar",
      "khabarKind": "sentence",
      "sentenceType": "verbal",
      "semanticAnswer": "judgment",
      "semanticQuestion": "ما الشيء المتمنى؟",
      "particleLabel": "ليت",
      "particleMeaning": "tamanni",
      "meaningSubject": "الطالب.",
      "meaningPredicate": "يقرأ.",
      "meaningJudgment": "الطالب يقرأ.",
      "baseStart": "ism",
      "baseFirstRole": "mubtada",
      "nasikhEffect": "mubtada_to_ism"
    },
    "covers": [
      "inna_khabar.verbal_sentence"
    ]
  },
  {
    "id": "in-23",
    "sentence": "إن الطالبَ أخلاقُه حسنةٌ.",
    "target": "أخلاقُه حسنةٌ",
    "facts": {
      "targetRole": "khabar",
      "khabarKind": "sentence",
      "sentenceType": "nominal",
      "semanticAnswer": "judgment",
      "semanticQuestion": "ما الذي أكّدته إنَّ؟",
      "particleLabel": "إنَّ",
      "particleMeaning": "tawkid",
      "meaningSubject": "الطالب.",
      "meaningPredicate": "أخلاقه حسنة.",
      "meaningJudgment": "الطالب أخلاقه حسنة.",
      "baseStart": "ism",
      "baseFirstRole": "mubtada",
      "nasikhEffect": "mubtada_to_ism"
    },
    "covers": [
      "inna_khabar.nominal_sentence"
    ]
  },
  {
    "id": "in-24",
    "sentence": "لعل الكتابَ في الحقيبةِ.",
    "target": "في الحقيبةِ",
    "facts": {
      "targetRole": "khabar",
      "khabarKind": "shibh",
      "shibhType": "jar",
      "shibhPosition": "normal",
      "semanticAnswer": "judgment",
      "semanticQuestion": "ما الشيء المرجو؟",
      "particleLabel": "لعل",
      "particleMeaning": "tarajji",
      "meaningSubject": "الكتاب.",
      "meaningPredicate": "في الحقيبة.",
      "meaningJudgment": "الكتاب في الحقيبة.",
      "baseStart": "ism",
      "baseFirstRole": "mubtada",
      "nasikhEffect": "mubtada_to_ism"
    },
    "covers": [
      "inna_khabar.jar"
    ]
  },
  {
    "id": "in-25",
    "sentence": "ليت اللقاءَ غدًا.",
    "target": "غدًا",
    "facts": {
      "targetRole": "khabar",
      "khabarKind": "shibh",
      "shibhType": "zarf",
      "shibhPosition": "normal",
      "semanticAnswer": "judgment",
      "semanticQuestion": "ما الشيء المتمنى؟",
      "particleLabel": "ليت",
      "particleMeaning": "tamanni",
      "meaningSubject": "اللقاء.",
      "meaningPredicate": "غدًا.",
      "meaningJudgment": "اللقاء غدًا.",
      "baseStart": "ism",
      "baseFirstRole": "mubtada",
      "nasikhEffect": "mubtada_to_ism"
    },
    "covers": [
      "inna_khabar.zarf"
    ]
  },
  {
    "id": "in-26",
    "sentence": "إن في البيتِ رجلًا.",
    "target": "في البيتِ",
    "facts": {
      "targetRole": "khabar",
      "khabarKind": "shibh",
      "shibhType": "jar",
      "shibhPosition": "advanced",
      "semanticAnswer": "judgment",
      "semanticQuestion": "ما الذي أكّدته إنَّ؟",
      "particleLabel": "إنَّ",
      "particleMeaning": "tawkid",
      "meaningSubject": "رجل.",
      "meaningPredicate": "في البيت.",
      "meaningJudgment": "في البيت رجل.",
      "baseStart": "shibh",
      "baseFirstRole": "khabar_muqaddam",
      "nasikhEffect": "preposed_shibh"
    },
    "covers": [
      "inna_khabar.jar_advanced"
    ]
  },
  {
    "id": "in-27",
    "sentence": "إن عندنا ضيفًا.",
    "target": "عندنا",
    "facts": {
      "targetRole": "khabar",
      "khabarKind": "shibh",
      "shibhType": "zarf",
      "shibhPosition": "advanced",
      "semanticAnswer": "judgment",
      "semanticQuestion": "ما الذي أكّدته إنَّ؟",
      "particleLabel": "إنَّ",
      "particleMeaning": "tawkid",
      "meaningSubject": "ضيف.",
      "meaningPredicate": "عندنا.",
      "meaningJudgment": "عندنا ضيف.",
      "baseStart": "shibh",
      "baseFirstRole": "khabar_muqaddam",
      "nasikhEffect": "preposed_shibh"
    },
    "covers": [
      "inna_khabar.zarf_advanced"
    ]
  }

  ,{
    "id": "in-28",
    "sentence": "إنما المؤمنون إخوةٌ.",
    "target": "المؤمنون",
    "facts": {
      "hasKaffa": true,
      "kaffaTargetRole": "mubtada",
      "targetRole": "mubtada",
      "semanticAnswer": "subject",
      "semanticQuestion": "ماذا فعلت ما الكافة في إنما؟",
      "particleLabel": "إنما",
      "particleMeaning": "kaffa",
      "meaningSubject": "المؤمنون.",
      "meaningPredicate": "إخوة.",
      "meaningJudgment": "المؤمنون إخوة.",
      "baseStart": "ism",
      "baseFirstRole": "mubtada"
    },
    "covers": [
      "inna_kaffa.cancelled"
    ]
  }
];
export const cleanInnaQuizExamples = [
  {
    "id": "in-01",
    "sentence": "إن الطالبَ نشيطٌ.",
    "target": "الطالبَ",
    "facts": {
      "targetRole": "ism",
      "nounKind": "mu3rab",
      "number": "singular_or_jt",
      "ending": "sahih"
    },
    "covers": [
      "inna_ism.visible"
    ],
    "prompt": "بعد اتباع خطوات التفكير، ما الإعراب النهائي للكلمة المحددة؟",
    "options": [
      "اسم إن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم",
      "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره",
      "خبر إن مرفوع وعلامة رفعه الواو لأنه جمع مذكر سالم",
      "اسم إن منصوب وعلامة نصبه الفتحة الظاهرة على آخره"
    ],
    "correctI3rab": "اسم إن منصوب وعلامة نصبه الفتحة الظاهرة على آخره",
    "whyCorrect": "نبدأ من المحدد: هل هو اسم الحرف الناسخ أم خبره؟ ثم نحدد صورته، ثم نختار العلامة أو المحل الإعرابي.",
    "optionReasons": {
      "اسم إن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "خبر إن مرفوع وعلامة رفعه الواو لأنه جمع مذكر سالم": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "اسم إن منصوب وعلامة نصبه الفتحة الظاهرة على آخره": "صحيح؛ لأن المسار يطابق موقع الكلمة المحددة وصورتها وعلامتها في هذا المثال."
    }
  },
  {
    "id": "in-02",
    "sentence": "لعل الفتى حاضرٌ.",
    "target": "الفتى",
    "facts": {
      "targetRole": "ism",
      "nounKind": "mu3rab",
      "number": "singular_or_jt",
      "ending": "maqsur"
    },
    "covers": [
      "inna_ism.maqsur"
    ],
    "prompt": "بعد اتباع خطوات التفكير، ما الإعراب النهائي للكلمة المحددة؟",
    "options": [
      "اسم لعل منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم",
      "خبر لعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره",
      "اسم لعل منصوب وعلامة نصبه الفتحة المقدرة على الألف منع من ظهورها التعذر",
      "اسم لعل منصوب وعلامة نصبه الفتحة الظاهرة على آخره"
    ],
    "correctI3rab": "اسم لعل منصوب وعلامة نصبه الفتحة المقدرة على الألف منع من ظهورها التعذر",
    "whyCorrect": "نبدأ من المحدد: هل هو اسم الحرف الناسخ أم خبره؟ ثم نحدد صورته، ثم نختار العلامة أو المحل الإعرابي.",
    "optionReasons": {
      "اسم لعل منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "خبر لعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "اسم لعل منصوب وعلامة نصبه الفتحة المقدرة على الألف منع من ظهورها التعذر": "صحيح؛ لأن المسار يطابق موقع الكلمة المحددة وصورتها وعلامتها في هذا المثال.",
      "اسم لعل منصوب وعلامة نصبه الفتحة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها."
    }
  },
  {
    "id": "in-03",
    "sentence": "علمتُ أنَّ القاضيَ عادلٌ.",
    "target": "القاضيَ",
    "facts": {
      "targetRole": "ism",
      "nounKind": "mu3rab",
      "number": "singular_or_jt",
      "ending": "manqous"
    },
    "covers": [
      "inna_ism.manqous"
    ],
    "prompt": "بعد اتباع خطوات التفكير، ما الإعراب النهائي للكلمة المحددة؟",
    "options": [
      "خبر أن مرفوع وعلامة رفعه الضمة الظاهرة على آخره",
      "اسم أن منصوب وعلامة نصبه الفتحة الظاهرة على الياء لأنه اسم منقوص منصوب",
      "اسم أن منصوب وعلامة نصبه الفتحة الظاهرة على آخره",
      "اسم أن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم"
    ],
    "correctI3rab": "اسم أن منصوب وعلامة نصبه الفتحة الظاهرة على الياء لأنه اسم منقوص منصوب",
    "whyCorrect": "نبدأ من المحدد: هل هو اسم الحرف الناسخ أم خبره؟ ثم نحدد صورته، ثم نختار العلامة أو المحل الإعرابي.",
    "optionReasons": {
      "خبر أن مرفوع وعلامة رفعه الضمة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "اسم أن منصوب وعلامة نصبه الفتحة الظاهرة على الياء لأنه اسم منقوص منصوب": "صحيح؛ لأن المسار يطابق موقع الكلمة المحددة وصورتها وعلامتها في هذا المثال.",
      "اسم أن منصوب وعلامة نصبه الفتحة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "اسم أن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها."
    }
  },
  {
    "id": "in-04",
    "sentence": "علمتُ أنَّ الطالبينِ حاضرانِ.",
    "target": "الطالبينِ",
    "facts": {
      "targetRole": "ism",
      "nounKind": "mu3rab",
      "number": "dual"
    },
    "covers": [
      "inna_ism.dual"
    ],
    "prompt": "بعد اتباع خطوات التفكير، ما الإعراب النهائي للكلمة المحددة؟",
    "options": [
      "اسم أن منصوب وعلامة نصبه الياء لأنه مثنى",
      "اسم أن منصوب وعلامة نصبه الفتحة الظاهرة على آخره",
      "اسم أن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم",
      "خبر أن مرفوع وعلامة رفعه الضمة الظاهرة على آخره"
    ],
    "correctI3rab": "اسم أن منصوب وعلامة نصبه الياء لأنه مثنى",
    "whyCorrect": "نبدأ من المحدد: هل هو اسم الحرف الناسخ أم خبره؟ ثم نحدد صورته، ثم نختار العلامة أو المحل الإعرابي.",
    "optionReasons": {
      "اسم أن منصوب وعلامة نصبه الياء لأنه مثنى": "صحيح؛ لأن المسار يطابق موقع الكلمة المحددة وصورتها وعلامتها في هذا المثال.",
      "اسم أن منصوب وعلامة نصبه الفتحة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "اسم أن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "خبر أن مرفوع وعلامة رفعه الضمة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها."
    }
  },
  {
    "id": "in-05",
    "sentence": "إن المعلمينَ مخلصون.",
    "target": "المعلمينَ",
    "facts": {
      "targetRole": "ism",
      "nounKind": "mu3rab",
      "number": "jms"
    },
    "covers": [
      "inna_ism.jms"
    ],
    "prompt": "بعد اتباع خطوات التفكير، ما الإعراب النهائي للكلمة المحددة؟",
    "options": [
      "اسم إن منصوب وعلامة نصبه الفتحة الظاهرة على آخره",
      "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره",
      "خبر إن مرفوع وعلامة رفعه الواو لأنه جمع مذكر سالم",
      "اسم إن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم"
    ],
    "correctI3rab": "اسم إن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم",
    "whyCorrect": "نبدأ من المحدد: هل هو اسم الحرف الناسخ أم خبره؟ ثم نحدد صورته، ثم نختار العلامة أو المحل الإعرابي.",
    "optionReasons": {
      "اسم إن منصوب وعلامة نصبه الفتحة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "خبر إن مرفوع وعلامة رفعه الواو لأنه جمع مذكر سالم": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "اسم إن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم": "صحيح؛ لأن المسار يطابق موقع الكلمة المحددة وصورتها وعلامتها في هذا المثال."
    }
  },
  {
    "id": "in-06",
    "sentence": "إن الطالباتِ مجتهداتٌ.",
    "target": "الطالباتِ",
    "facts": {
      "targetRole": "ism",
      "nounKind": "mu3rab",
      "number": "jfs"
    },
    "covers": [
      "inna_ism.jfs"
    ],
    "prompt": "بعد اتباع خطوات التفكير، ما الإعراب النهائي للكلمة المحددة؟",
    "options": [
      "اسم إن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم",
      "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره",
      "اسم إن منصوب وعلامة نصبه الكسرة نيابة عن الفتحة لأنه جمع مؤنث سالم",
      "اسم إن منصوب وعلامة نصبه الفتحة الظاهرة على آخره"
    ],
    "correctI3rab": "اسم إن منصوب وعلامة نصبه الكسرة نيابة عن الفتحة لأنه جمع مؤنث سالم",
    "whyCorrect": "نبدأ من المحدد: هل هو اسم الحرف الناسخ أم خبره؟ ثم نحدد صورته، ثم نختار العلامة أو المحل الإعرابي.",
    "optionReasons": {
      "اسم إن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "اسم إن منصوب وعلامة نصبه الكسرة نيابة عن الفتحة لأنه جمع مؤنث سالم": "صحيح؛ لأن المسار يطابق موقع الكلمة المحددة وصورتها وعلامتها في هذا المثال.",
      "اسم إن منصوب وعلامة نصبه الفتحة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها."
    }
  },
  {
    "id": "in-07",
    "sentence": "إن أباك كريمٌ.",
    "target": "أباك",
    "facts": {
      "targetRole": "ism",
      "nounKind": "mu3rab",
      "number": "five"
    },
    "covers": [
      "inna_ism.five"
    ],
    "prompt": "بعد اتباع خطوات التفكير، ما الإعراب النهائي للكلمة المحددة؟",
    "options": [
      "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره",
      "اسم إن منصوب وعلامة نصبه الألف لأنه من الأسماء الخمسة",
      "اسم إن منصوب وعلامة نصبه الفتحة الظاهرة على آخره",
      "اسم إن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم"
    ],
    "correctI3rab": "اسم إن منصوب وعلامة نصبه الألف لأنه من الأسماء الخمسة",
    "whyCorrect": "نبدأ من المحدد: هل هو اسم الحرف الناسخ أم خبره؟ ثم نحدد صورته، ثم نختار العلامة أو المحل الإعرابي.",
    "optionReasons": {
      "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "اسم إن منصوب وعلامة نصبه الألف لأنه من الأسماء الخمسة": "صحيح؛ لأن المسار يطابق موقع الكلمة المحددة وصورتها وعلامتها في هذا المثال.",
      "اسم إن منصوب وعلامة نصبه الفتحة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "اسم إن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها."
    }
  },
  {
    "id": "in-08",
    "sentence": "لعلهم فائزون.",
    "target": "هم",
    "facts": {
      "targetRole": "ism",
      "nounKind": "connected_damir"
    },
    "covers": [
      "inna_ism.connected_damir"
    ],
    "prompt": "بعد اتباع خطوات التفكير، ما الإعراب النهائي للكلمة المحددة؟",
    "options": [
      "ضمير متصل مبني في محل نصب اسم لعل",
      "اسم لعل منصوب وعلامة نصبه الفتحة الظاهرة على آخره",
      "اسم لعل منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم",
      "خبر لعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره"
    ],
    "correctI3rab": "ضمير متصل مبني في محل نصب اسم لعل",
    "whyCorrect": "نبدأ من المحدد: هل هو اسم الحرف الناسخ أم خبره؟ ثم نحدد صورته، ثم نختار العلامة أو المحل الإعرابي.",
    "optionReasons": {
      "ضمير متصل مبني في محل نصب اسم لعل": "صحيح؛ لأن المسار يطابق موقع الكلمة المحددة وصورتها وعلامتها في هذا المثال.",
      "اسم لعل منصوب وعلامة نصبه الفتحة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "اسم لعل منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "خبر لعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها."
    }
  },
  {
    "id": "in-09",
    "sentence": "إن هذا مفيدٌ.",
    "target": "هذا",
    "facts": {
      "targetRole": "ism",
      "nounKind": "mabni",
      "mabniType": "ishara"
    },
    "covers": [
      "inna_ism.ishara"
    ],
    "prompt": "بعد اتباع خطوات التفكير، ما الإعراب النهائي للكلمة المحددة؟",
    "options": [
      "اسم إن منصوب وعلامة نصبه الفتحة الظاهرة على آخره",
      "اسم إن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم",
      "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره",
      "اسم إشارة مبني في محل نصب اسم إن"
    ],
    "correctI3rab": "اسم إشارة مبني في محل نصب اسم إن",
    "whyCorrect": "نبدأ من المحدد: هل هو اسم الحرف الناسخ أم خبره؟ ثم نحدد صورته، ثم نختار العلامة أو المحل الإعرابي.",
    "optionReasons": {
      "اسم إن منصوب وعلامة نصبه الفتحة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "اسم إن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "اسم إشارة مبني في محل نصب اسم إن": "صحيح؛ لأن المسار يطابق موقع الكلمة المحددة وصورتها وعلامتها في هذا المثال."
    }
  },
  {
    "id": "in-10",
    "sentence": "إن الذي صدقَ محبوبٌ.",
    "target": "الذي",
    "facts": {
      "targetRole": "ism",
      "nounKind": "mabni",
      "mabniType": "mawsool"
    },
    "covers": [
      "inna_ism.mawsool"
    ],
    "prompt": "بعد اتباع خطوات التفكير، ما الإعراب النهائي للكلمة المحددة؟",
    "options": [
      "اسم إن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم",
      "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره",
      "اسم موصول مبني في محل نصب اسم إن، وجملة الصلة بعده لا محل لها من الإعراب",
      "اسم إن منصوب وعلامة نصبه الفتحة الظاهرة على آخره"
    ],
    "correctI3rab": "اسم موصول مبني في محل نصب اسم إن، وجملة الصلة بعده لا محل لها من الإعراب",
    "whyCorrect": "نبدأ من المحدد: هل هو اسم الحرف الناسخ أم خبره؟ ثم نحدد صورته، ثم نختار العلامة أو المحل الإعرابي.",
    "optionReasons": {
      "اسم إن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "اسم موصول مبني في محل نصب اسم إن، وجملة الصلة بعده لا محل لها من الإعراب": "صحيح؛ لأن المسار يطابق موقع الكلمة المحددة وصورتها وعلامتها في هذا المثال.",
      "اسم إن منصوب وعلامة نصبه الفتحة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها."
    }
  },
  {
    "id": "in-11",
    "sentence": "إن الطالبَ نشيطٌ.",
    "target": "نشيطٌ",
    "facts": {
      "targetRole": "khabar",
      "khabarKind": "single",
      "nounKind": "mu3rab",
      "number": "singular_or_jt",
      "ending": "sahih"
    },
    "covers": [
      "inna_khabar_single.visible"
    ],
    "prompt": "بعد اتباع خطوات التفكير، ما الإعراب النهائي للكلمة المحددة؟",
    "options": [
      "خبر إن مرفوع وعلامة رفعه الواو لأنه جمع مذكر سالم",
      "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره",
      "اسم إن منصوب وعلامة نصبه الفتحة الظاهرة على آخره",
      "اسم إن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم"
    ],
    "correctI3rab": "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره",
    "whyCorrect": "نبدأ من المحدد: هل هو اسم الحرف الناسخ أم خبره؟ ثم نحدد صورته، ثم نختار العلامة أو المحل الإعرابي.",
    "optionReasons": {
      "خبر إن مرفوع وعلامة رفعه الواو لأنه جمع مذكر سالم": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره": "صحيح؛ لأن المسار يطابق موقع الكلمة المحددة وصورتها وعلامتها في هذا المثال.",
      "اسم إن منصوب وعلامة نصبه الفتحة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "اسم إن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها."
    }
  },
  {
    "id": "in-12",
    "sentence": "إن الهدفَ أسمى.",
    "target": "أسمى",
    "facts": {
      "targetRole": "khabar",
      "khabarKind": "single",
      "nounKind": "mu3rab",
      "number": "singular_or_jt",
      "ending": "maqsur"
    },
    "covers": [
      "inna_khabar_single.maqsur"
    ],
    "prompt": "بعد اتباع خطوات التفكير، ما الإعراب النهائي للكلمة المحددة؟",
    "options": [
      "خبر إن مرفوع وعلامة رفعه الضمة المقدرة على الألف منع من ظهورها التعذر",
      "اسم إن منصوب وعلامة نصبه الفتحة الظاهرة على آخره",
      "اسم إن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم",
      "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره"
    ],
    "correctI3rab": "خبر إن مرفوع وعلامة رفعه الضمة المقدرة على الألف منع من ظهورها التعذر",
    "whyCorrect": "نبدأ من المحدد: هل هو اسم الحرف الناسخ أم خبره؟ ثم نحدد صورته، ثم نختار العلامة أو المحل الإعرابي.",
    "optionReasons": {
      "خبر إن مرفوع وعلامة رفعه الضمة المقدرة على الألف منع من ظهورها التعذر": "صحيح؛ لأن المسار يطابق موقع الكلمة المحددة وصورتها وعلامتها في هذا المثال.",
      "اسم إن منصوب وعلامة نصبه الفتحة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "اسم إن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها."
    }
  },
  {
    "id": "in-13",
    "sentence": "إن القاضيَ راضٍ.",
    "target": "راضٍ",
    "facts": {
      "targetRole": "khabar",
      "khabarKind": "single",
      "nounKind": "mu3rab",
      "number": "singular_or_jt",
      "ending": "manqous"
    },
    "covers": [
      "inna_khabar_single.manqous"
    ],
    "prompt": "بعد اتباع خطوات التفكير، ما الإعراب النهائي للكلمة المحددة؟",
    "options": [
      "اسم إن منصوب وعلامة نصبه الفتحة الظاهرة على آخره",
      "اسم إن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم",
      "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره",
      "خبر إن مرفوع وعلامة رفعه الضمة المقدرة على الياء للثقل"
    ],
    "correctI3rab": "خبر إن مرفوع وعلامة رفعه الضمة المقدرة على الياء للثقل",
    "whyCorrect": "نبدأ من المحدد: هل هو اسم الحرف الناسخ أم خبره؟ ثم نحدد صورته، ثم نختار العلامة أو المحل الإعرابي.",
    "optionReasons": {
      "اسم إن منصوب وعلامة نصبه الفتحة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "اسم إن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "خبر إن مرفوع وعلامة رفعه الضمة المقدرة على الياء للثقل": "صحيح؛ لأن المسار يطابق موقع الكلمة المحددة وصورتها وعلامتها في هذا المثال."
    }
  },
  {
    "id": "in-14",
    "sentence": "إن الطالبينِ حاضرانِ.",
    "target": "حاضرانِ",
    "facts": {
      "targetRole": "khabar",
      "khabarKind": "single",
      "nounKind": "mu3rab",
      "number": "dual"
    },
    "covers": [
      "inna_khabar_single.dual"
    ],
    "prompt": "بعد اتباع خطوات التفكير، ما الإعراب النهائي للكلمة المحددة؟",
    "options": [
      "اسم إن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم",
      "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره",
      "خبر إن مرفوع وعلامة رفعه الألف لأنه مثنى",
      "اسم إن منصوب وعلامة نصبه الفتحة الظاهرة على آخره"
    ],
    "correctI3rab": "خبر إن مرفوع وعلامة رفعه الألف لأنه مثنى",
    "whyCorrect": "نبدأ من المحدد: هل هو اسم الحرف الناسخ أم خبره؟ ثم نحدد صورته، ثم نختار العلامة أو المحل الإعرابي.",
    "optionReasons": {
      "اسم إن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "خبر إن مرفوع وعلامة رفعه الألف لأنه مثنى": "صحيح؛ لأن المسار يطابق موقع الكلمة المحددة وصورتها وعلامتها في هذا المثال.",
      "اسم إن منصوب وعلامة نصبه الفتحة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها."
    }
  },
  {
    "id": "in-15",
    "sentence": "إن المعلمينَ مخلصون.",
    "target": "مخلصون",
    "facts": {
      "targetRole": "khabar",
      "khabarKind": "single",
      "nounKind": "mu3rab",
      "number": "jms"
    },
    "covers": [
      "inna_khabar_single.jms"
    ],
    "prompt": "بعد اتباع خطوات التفكير، ما الإعراب النهائي للكلمة المحددة؟",
    "options": [
      "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره",
      "خبر إن مرفوع وعلامة رفعه الواو لأنه جمع مذكر سالم",
      "اسم إن منصوب وعلامة نصبه الفتحة الظاهرة على آخره",
      "اسم إن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم"
    ],
    "correctI3rab": "خبر إن مرفوع وعلامة رفعه الواو لأنه جمع مذكر سالم",
    "whyCorrect": "نبدأ من المحدد: هل هو اسم الحرف الناسخ أم خبره؟ ثم نحدد صورته، ثم نختار العلامة أو المحل الإعرابي.",
    "optionReasons": {
      "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "خبر إن مرفوع وعلامة رفعه الواو لأنه جمع مذكر سالم": "صحيح؛ لأن المسار يطابق موقع الكلمة المحددة وصورتها وعلامتها في هذا المثال.",
      "اسم إن منصوب وعلامة نصبه الفتحة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "اسم إن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها."
    }
  },
  {
    "id": "in-16",
    "sentence": "إن الطالباتِ مجتهداتٌ.",
    "target": "مجتهداتٌ",
    "facts": {
      "targetRole": "khabar",
      "khabarKind": "single",
      "nounKind": "mu3rab",
      "number": "jfs"
    },
    "covers": [
      "inna_khabar_single.jfs"
    ],
    "prompt": "بعد اتباع خطوات التفكير، ما الإعراب النهائي للكلمة المحددة؟",
    "options": [
      "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره لأنه جمع مؤنث سالم",
      "اسم إن منصوب وعلامة نصبه الفتحة الظاهرة على آخره",
      "اسم إن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم",
      "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره"
    ],
    "correctI3rab": "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره لأنه جمع مؤنث سالم",
    "whyCorrect": "نبدأ من المحدد: هل هو اسم الحرف الناسخ أم خبره؟ ثم نحدد صورته، ثم نختار العلامة أو المحل الإعرابي.",
    "optionReasons": {
      "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره لأنه جمع مؤنث سالم": "صحيح؛ لأن المسار يطابق موقع الكلمة المحددة وصورتها وعلامتها في هذا المثال.",
      "اسم إن منصوب وعلامة نصبه الفتحة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "اسم إن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها."
    }
  },
  {
    "id": "in-17",
    "sentence": "إن أباك ذو فضلٍ.",
    "target": "ذو",
    "facts": {
      "targetRole": "khabar",
      "khabarKind": "single",
      "nounKind": "mu3rab",
      "number": "five"
    },
    "covers": [
      "inna_khabar_single.five"
    ],
    "prompt": "بعد اتباع خطوات التفكير، ما الإعراب النهائي للكلمة المحددة؟",
    "options": [
      "اسم إن منصوب وعلامة نصبه الفتحة الظاهرة على آخره",
      "اسم إن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم",
      "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره",
      "خبر إن مرفوع وعلامة رفعه الواو لأنه من الأسماء الخمسة"
    ],
    "correctI3rab": "خبر إن مرفوع وعلامة رفعه الواو لأنه من الأسماء الخمسة",
    "whyCorrect": "نبدأ من المحدد: هل هو اسم الحرف الناسخ أم خبره؟ ثم نحدد صورته، ثم نختار العلامة أو المحل الإعرابي.",
    "optionReasons": {
      "اسم إن منصوب وعلامة نصبه الفتحة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "اسم إن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "خبر إن مرفوع وعلامة رفعه الواو لأنه من الأسماء الخمسة": "صحيح؛ لأن المسار يطابق موقع الكلمة المحددة وصورتها وعلامتها في هذا المثال."
    }
  },
  {
    "id": "in-18",
    "sentence": "إن المسؤولَ أنتَ.",
    "target": "أنتَ",
    "facts": {
      "targetRole": "khabar",
      "khabarKind": "single",
      "nounKind": "mabni",
      "mabniType": "damir"
    },
    "covers": [
      "inna_khabar_single.damir"
    ],
    "prompt": "بعد اتباع خطوات التفكير، ما الإعراب النهائي للكلمة المحددة؟",
    "options": [
      "اسم إن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم",
      "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره",
      "ضمير منفصل مبني في محل رفع خبر إن",
      "اسم إن منصوب وعلامة نصبه الفتحة الظاهرة على آخره"
    ],
    "correctI3rab": "ضمير منفصل مبني في محل رفع خبر إن",
    "whyCorrect": "نبدأ من المحدد: هل هو اسم الحرف الناسخ أم خبره؟ ثم نحدد صورته، ثم نختار العلامة أو المحل الإعرابي.",
    "optionReasons": {
      "اسم إن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "ضمير منفصل مبني في محل رفع خبر إن": "صحيح؛ لأن المسار يطابق موقع الكلمة المحددة وصورتها وعلامتها في هذا المثال.",
      "اسم إن منصوب وعلامة نصبه الفتحة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها."
    }
  },
  {
    "id": "in-19",
    "sentence": "إن الحلَّ هذا.",
    "target": "هذا",
    "facts": {
      "targetRole": "khabar",
      "khabarKind": "single",
      "nounKind": "mabni",
      "mabniType": "ishara"
    },
    "covers": [
      "inna_khabar_single.ishara"
    ],
    "prompt": "بعد اتباع خطوات التفكير، ما الإعراب النهائي للكلمة المحددة؟",
    "options": [
      "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره",
      "اسم إشارة مبني في محل رفع خبر إن",
      "اسم إن منصوب وعلامة نصبه الفتحة الظاهرة على آخره",
      "اسم إن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم"
    ],
    "correctI3rab": "اسم إشارة مبني في محل رفع خبر إن",
    "whyCorrect": "نبدأ من المحدد: هل هو اسم الحرف الناسخ أم خبره؟ ثم نحدد صورته، ثم نختار العلامة أو المحل الإعرابي.",
    "optionReasons": {
      "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "اسم إشارة مبني في محل رفع خبر إن": "صحيح؛ لأن المسار يطابق موقع الكلمة المحددة وصورتها وعلامتها في هذا المثال.",
      "اسم إن منصوب وعلامة نصبه الفتحة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "اسم إن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها."
    }
  },
  {
    "id": "in-20",
    "sentence": "إن الفائزَ مَن صبرَ.",
    "target": "مَن",
    "facts": {
      "targetRole": "khabar",
      "khabarKind": "single",
      "nounKind": "mabni",
      "mabniType": "mawsool"
    },
    "covers": [
      "inna_khabar_single.mawsool"
    ],
    "prompt": "بعد اتباع خطوات التفكير، ما الإعراب النهائي للكلمة المحددة؟",
    "options": [
      "اسم موصول مبني في محل رفع خبر إن، وجملة الصلة بعده لا محل لها من الإعراب",
      "اسم إن منصوب وعلامة نصبه الفتحة الظاهرة على آخره",
      "اسم إن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم",
      "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره"
    ],
    "correctI3rab": "اسم موصول مبني في محل رفع خبر إن، وجملة الصلة بعده لا محل لها من الإعراب",
    "whyCorrect": "نبدأ من المحدد: هل هو اسم الحرف الناسخ أم خبره؟ ثم نحدد صورته، ثم نختار العلامة أو المحل الإعرابي.",
    "optionReasons": {
      "اسم موصول مبني في محل رفع خبر إن، وجملة الصلة بعده لا محل لها من الإعراب": "صحيح؛ لأن المسار يطابق موقع الكلمة المحددة وصورتها وعلامتها في هذا المثال.",
      "اسم إن منصوب وعلامة نصبه الفتحة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "اسم إن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها."
    }
  },
  {
    "id": "in-21",
    "sentence": "إن هدفَك أن تنجحَ.",
    "target": "أن تنجحَ",
    "facts": {
      "targetRole": "khabar",
      "khabarKind": "single",
      "nounKind": "masdar"
    },
    "covers": [
      "inna_khabar_single.masdar"
    ],
    "prompt": "بعد اتباع خطوات التفكير، ما الإعراب النهائي للكلمة المحددة؟",
    "options": [
      "اسم أن منصوب وعلامة نصبه الفتحة الظاهرة على آخره",
      "اسم أن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم",
      "خبر أن مرفوع وعلامة رفعه الضمة الظاهرة على آخره",
      "مصدر مؤول في محل رفع خبر أن"
    ],
    "correctI3rab": "مصدر مؤول في محل رفع خبر أن",
    "whyCorrect": "نبدأ من المحدد: هل هو اسم الحرف الناسخ أم خبره؟ ثم نحدد صورته، ثم نختار العلامة أو المحل الإعرابي.",
    "optionReasons": {
      "اسم أن منصوب وعلامة نصبه الفتحة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "اسم أن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "خبر أن مرفوع وعلامة رفعه الضمة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "مصدر مؤول في محل رفع خبر أن": "صحيح؛ لأن المسار يطابق موقع الكلمة المحددة وصورتها وعلامتها في هذا المثال."
    }
  },
  {
    "id": "in-22",
    "sentence": "إن الطالبَ يقرأُ.",
    "target": "يقرأُ",
    "facts": {
      "targetRole": "khabar",
      "khabarKind": "sentence",
      "sentenceType": "verbal"
    },
    "covers": [
      "inna_khabar.verbal_sentence"
    ],
    "prompt": "بعد اتباع خطوات التفكير، ما الإعراب النهائي للكلمة المحددة؟",
    "options": [
      "اسم إن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم",
      "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره",
      "جملة فعلية في محل رفع خبر إن",
      "اسم إن منصوب وعلامة نصبه الفتحة الظاهرة على آخره"
    ],
    "correctI3rab": "جملة فعلية في محل رفع خبر إن",
    "whyCorrect": "نبدأ من المحدد: هل هو اسم الحرف الناسخ أم خبره؟ ثم نحدد صورته، ثم نختار العلامة أو المحل الإعرابي.",
    "optionReasons": {
      "اسم إن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "جملة فعلية في محل رفع خبر إن": "صحيح؛ لأن المسار يطابق موقع الكلمة المحددة وصورتها وعلامتها في هذا المثال.",
      "اسم إن منصوب وعلامة نصبه الفتحة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها."
    }
  },
  {
    "id": "in-23",
    "sentence": "إن الطالبَ أخلاقُه حسنةٌ.",
    "target": "أخلاقُه حسنةٌ",
    "facts": {
      "targetRole": "khabar",
      "khabarKind": "sentence",
      "sentenceType": "nominal"
    },
    "covers": [
      "inna_khabar.nominal_sentence"
    ],
    "prompt": "بعد اتباع خطوات التفكير، ما الإعراب النهائي للكلمة المحددة؟",
    "options": [
      "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره",
      "جملة اسمية في محل رفع خبر إن",
      "اسم إن منصوب وعلامة نصبه الفتحة الظاهرة على آخره",
      "اسم إن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم"
    ],
    "correctI3rab": "جملة اسمية في محل رفع خبر إن",
    "whyCorrect": "نبدأ من المحدد: هل هو اسم الحرف الناسخ أم خبره؟ ثم نحدد صورته، ثم نختار العلامة أو المحل الإعرابي.",
    "optionReasons": {
      "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "جملة اسمية في محل رفع خبر إن": "صحيح؛ لأن المسار يطابق موقع الكلمة المحددة وصورتها وعلامتها في هذا المثال.",
      "اسم إن منصوب وعلامة نصبه الفتحة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "اسم إن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها."
    }
  },
  {
    "id": "in-24",
    "sentence": "إن الكتابَ في الحقيبةِ.",
    "target": "في الحقيبةِ",
    "facts": {
      "targetRole": "khabar",
      "khabarKind": "shibh",
      "shibhType": "jar",
      "shibhPosition": "normal"
    },
    "covers": [
      "inna_khabar.jar"
    ],
    "prompt": "بعد اتباع خطوات التفكير، ما الإعراب النهائي للكلمة المحددة؟",
    "options": [
      "شبه جملة من الجار والمجرور في محل رفع خبر إن",
      "اسم إن منصوب وعلامة نصبه الفتحة الظاهرة على آخره",
      "اسم إن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم",
      "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره"
    ],
    "correctI3rab": "شبه جملة من الجار والمجرور في محل رفع خبر إن",
    "whyCorrect": "نبدأ من المحدد: هل هو اسم الحرف الناسخ أم خبره؟ ثم نحدد صورته، ثم نختار العلامة أو المحل الإعرابي.",
    "optionReasons": {
      "شبه جملة من الجار والمجرور في محل رفع خبر إن": "صحيح؛ لأن المسار يطابق موقع الكلمة المحددة وصورتها وعلامتها في هذا المثال.",
      "اسم إن منصوب وعلامة نصبه الفتحة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "اسم إن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها."
    }
  },
  {
    "id": "in-25",
    "sentence": "إن اللقاءَ غدًا.",
    "target": "غدًا",
    "facts": {
      "targetRole": "khabar",
      "khabarKind": "shibh",
      "shibhType": "zarf",
      "shibhPosition": "normal"
    },
    "covers": [
      "inna_khabar.zarf"
    ],
    "prompt": "بعد اتباع خطوات التفكير، ما الإعراب النهائي للكلمة المحددة؟",
    "options": [
      "اسم إن منصوب وعلامة نصبه الفتحة الظاهرة على آخره",
      "اسم إن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم",
      "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره",
      "شبه جملة ظرفية في محل رفع خبر إن"
    ],
    "correctI3rab": "شبه جملة ظرفية في محل رفع خبر إن",
    "whyCorrect": "نبدأ من المحدد: هل هو اسم الحرف الناسخ أم خبره؟ ثم نحدد صورته، ثم نختار العلامة أو المحل الإعرابي.",
    "optionReasons": {
      "اسم إن منصوب وعلامة نصبه الفتحة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "اسم إن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "شبه جملة ظرفية في محل رفع خبر إن": "صحيح؛ لأن المسار يطابق موقع الكلمة المحددة وصورتها وعلامتها في هذا المثال."
    }
  },
  {
    "id": "in-26",
    "sentence": "إن في البيتِ رجلًا.",
    "target": "في البيتِ",
    "facts": {
      "targetRole": "khabar",
      "khabarKind": "shibh",
      "shibhType": "jar",
      "shibhPosition": "advanced"
    },
    "covers": [
      "inna_khabar.jar_advanced"
    ],
    "prompt": "بعد اتباع خطوات التفكير، ما الإعراب النهائي للكلمة المحددة؟",
    "options": [
      "اسم إن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم",
      "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره",
      "شبه جملة من الجار والمجرور في محل رفع خبر إن مقدم، والاسم النكرة بعدها اسم إن مؤخر منصوب",
      "اسم إن منصوب وعلامة نصبه الفتحة الظاهرة على آخره"
    ],
    "correctI3rab": "شبه جملة من الجار والمجرور في محل رفع خبر إن مقدم، والاسم النكرة بعدها اسم إن مؤخر منصوب",
    "whyCorrect": "نبدأ من المحدد: هل هو اسم الحرف الناسخ أم خبره؟ ثم نحدد صورته، ثم نختار العلامة أو المحل الإعرابي.",
    "optionReasons": {
      "اسم إن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "شبه جملة من الجار والمجرور في محل رفع خبر إن مقدم، والاسم النكرة بعدها اسم إن مؤخر منصوب": "صحيح؛ لأن المسار يطابق موقع الكلمة المحددة وصورتها وعلامتها في هذا المثال.",
      "اسم إن منصوب وعلامة نصبه الفتحة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها."
    }
  },
  {
    "id": "in-27",
    "sentence": "إن عندنا ضيفًا.",
    "target": "عندنا",
    "facts": {
      "targetRole": "khabar",
      "khabarKind": "shibh",
      "shibhType": "zarf",
      "shibhPosition": "advanced"
    },
    "covers": [
      "inna_khabar.zarf_advanced"
    ],
    "prompt": "بعد اتباع خطوات التفكير، ما الإعراب النهائي للكلمة المحددة؟",
    "options": [
      "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره",
      "شبه جملة ظرفية في محل رفع خبر إن مقدم، والاسم النكرة بعدها اسم إن مؤخر منصوب",
      "اسم إن منصوب وعلامة نصبه الفتحة الظاهرة على آخره",
      "اسم إن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم"
    ],
    "correctI3rab": "شبه جملة ظرفية في محل رفع خبر إن مقدم، والاسم النكرة بعدها اسم إن مؤخر منصوب",
    "whyCorrect": "نبدأ من المحدد: هل هو اسم الحرف الناسخ أم خبره؟ ثم نحدد صورته، ثم نختار العلامة أو المحل الإعرابي.",
    "optionReasons": {
      "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "شبه جملة ظرفية في محل رفع خبر إن مقدم، والاسم النكرة بعدها اسم إن مؤخر منصوب": "صحيح؛ لأن المسار يطابق موقع الكلمة المحددة وصورتها وعلامتها في هذا المثال.",
      "اسم إن منصوب وعلامة نصبه الفتحة الظاهرة على آخره": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها.",
      "اسم إن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم": "خطأ؛ هذه صياغة قريبة لكنها لا توافق موقع المحدد أو صورته بعد دخول إن أو إحدى أخواتها."
    }
  }
];
