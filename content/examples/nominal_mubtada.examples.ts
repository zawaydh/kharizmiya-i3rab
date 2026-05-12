// content/examples/nominal_mubtada.examples.ts
export type Example = {
  id: string;
  sentence: string;
  target: string;
  facts: Record<string, any>;
  covers: string[];
};

export const nominalMubtadaCoverageKeysOrdered = [
  "mubtada.sahih",
  "mubtada.moatal",
  "mubtada.five",
  "mubtada.muthanna",
  "mubtada.jms",
  "mubtada.jfs",
  "mubtada.jt",
  "mubtada.damir",
  "mubtada.ishara",
  "mubtada.mawsool",
  "mubtada.istifham",
  "mubtada.shart",
  "mubtada.kam",
  "mubtada.masdar",
];

export const nominalMubtadaExamples: Example[] = [
  // 1) صحيح الآخر
  {
    id: "mub-01-sahih",
    sentence: "الطالبُ مجتهدٌ.",
    target: "الطالبُ",
    facts: {
      wordType: "noun",
      nounKind: "mu3rab",
      number: "singular",
      ending: "sahih",
    },
    covers: ["mubtada.sahih"],
  },

  // 2) صحيح الآخر (مثال إضافي لتثبيت الفكرة) — يبقى ضمن نفس المسار
  {
    id: "mub-02-sahih-2",
    sentence: "المؤمنُ محبوبٌ.",
    target: "المؤمنُ",
    facts: {
      wordType: "noun",
      nounKind: "mu3rab",
      number: "singular",
      ending: "sahih",
    },
    covers: ["mubtada.sahih"],
  },

  // 3) معتل الآخر
  {
    id: "mub-03-moatal",
    sentence: "جنى طالبةٌ مجتهدةٌ.",
    target: "جنى",
    facts: {
      wordType: "noun",
      nounKind: "mu3rab",
      number: "singular",
      ending: "moatal",
    },
    covers: ["mubtada.moatal"],
  },

  // 4) الأسماء الخمسة
  {
    id: "mub-04-five",
    sentence: "أبوك رجلٌ فاضلٌ.",
    target: "أبوك",
    facts: {
      wordType: "noun",
      nounKind: "mu3rab",
      number: "singular",
      ending: "five",
    },
    covers: ["mubtada.five"],
  },

  // 5) مثنى
  {
    id: "mub-05-dual",
    sentence: "الجدارانِ مرتفعانِ.",
    target: "الجدارانِ",
    facts: {
      wordType: "noun",
      nounKind: "mu3rab",
      number: "dual",
    },
    covers: ["mubtada.muthanna"],
  },

  // 6) جمع مذكر سالم
  {
    id: "mub-06-jms",
    sentence: "المعلمون مخلصون.",
    target: "المعلمون",
    facts: {
      wordType: "noun",
      nounKind: "mu3rab",
      number: "plural",
      pluralType: "jms",
    },
    covers: ["mubtada.jms"],
  },

  // 7) جمع مؤنث سالم
  {
    id: "mub-07-jfs",
    sentence: "الطالباتُ مجتهداتٌ.",
    target: "الطالباتُ",
    facts: {
      wordType: "noun",
      nounKind: "mu3rab",
      number: "plural",
      pluralType: "jfs",
    },
    covers: ["mubtada.jfs"],
  },

  // 8) جمع تكسير
  {
    id: "mub-08-jt",
    sentence: "الكتبُ مفيدةٌ.",
    target: "الكتبُ",
    facts: {
      wordType: "noun",
      nounKind: "mu3rab",
      number: "plural",
      pluralType: "jt",
    },
    covers: ["mubtada.jt"],
  },

  // 9) ضمير
  {
    id: "mub-09-damir",
    sentence: "أنا أحبُّ الحياةَ.",
    target: "أنا",
    facts: {
      wordType: "noun",
      nounKind: "mabni",
      mabniType: "damir",
    },
    covers: ["mubtada.damir"],
  },

  // 10) اسم إشارة
  {
    id: "mub-10-ishara",
    sentence: "هذا طالبٌ مجتهدٌ.",
    target: "هذا",
    facts: {
      wordType: "noun",
      nounKind: "mabni",
      mabniType: "ishara",
    },
    covers: ["mubtada.ishara"],
  },

  // 11) اسم موصول
  {
    id: "mub-11-mawsool",
    sentence: "الذي يعملُ بجدٍ مجتهدٌ.",
    target: "الذي",
    facts: {
      wordType: "noun",
      nounKind: "mabni",
      mabniType: "mawsool",
    },
    covers: ["mubtada.mawsool"],
  },

  // 12) اسم استفهام
  {
    id: "mub-12-istifham",
    sentence: "مَن المجتهدُ؟",
    target: "مَن",
    facts: {
      wordType: "noun",
      nounKind: "mabni",
      mabniType: "istifham",
    },
    covers: ["mubtada.istifham"],
  },

  // 13) اسم شرط
  {
    id: "mub-13-shart",
    sentence: "مَن يجتهدْ ينجحْ.",
    target: "مَن",
    facts: {
      wordType: "noun",
      nounKind: "mabni",
      mabniType: "shart",
    },
    covers: ["mubtada.shart"],
  },

  // 14) كم الخبرية
  {
    id: "mub-14-kam",
    sentence: "كم طالبٍ نجحَ!",
    target: "كم",
    facts: {
      wordType: "noun",
      nounKind: "mabni",
      mabniType: "kam",
    },
    covers: ["mubtada.kam"],
  },

  // 15) مصدر مؤول (أن + فعل مضارع)
  {
    id: "mub-15-masdar",
    sentence: "أن تحفظ القرآن فضلٌ عظيمٌ.",
    target: "أن تحفظَ",
    facts: {
      wordType: "noun",
      nounKind: "masdar",
    },
    covers: ["mubtada.masdar"],
  },
];