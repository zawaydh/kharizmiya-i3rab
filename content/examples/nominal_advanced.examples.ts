// content/examples/nominal_advanced.examples.ts

export type NominalAdvancedFacts = {
  startType: "explicitNoun" | "pp" | "other";
  ppNextIsNakira?: boolean;
  khabarType?: "mufrad" | "jumlaFi3liyya" | "jumlaIsmiyya" | "pp" | "zarf";
  // حقائق المبتدأ (الكلمة الهدف)
  targetWordType?: "noun" | "verb" | "harf";
  targetNounKind?: "mu3rab" | "mabni" | "sourceMuawwal";
  targetNumber?: "singular" | "dual" | "jms" | "jfs" | "jt";
  targetSingularKind?: "sahih" | "moatal" | "asma5";
  targetMabniType?: "damir" | "ishara" | "mawsool" | "istifham" | "shart" | "kam";
};

export type ExamplePack = {
  id: string;
  sentence: string;
  target: string; // Target word/phrase to highlight
  facts: NominalAdvancedFacts;
  covers: string[]; // Coverage keys
  primaryCover?: string; // Main coverage key for sequencing
};




export const nominalAdvancedCoverageKeys = [
  "start.explicitNoun",
  "start.pp",
  "pp.nakiraYes",
  "pp.nakiraNo",
  "khabar.mufrad",
  "khabar.jumlaFi3liyya",
  "khabar.jumlaIsmiyya",
  "khabar.pp",
  "khabar.zarf",
] as const;

export const nominalAdvancedCoverageKeysOrdered = [
  ...nominalAdvancedCoverageKeys,
] as const;

export const nominalAdvancedExamples: ExamplePack[] = [
  {
    id: "ex_pp_yes",
    sentence: "في البيتِ رجلٌ",
    target: "رجلٌ",
    facts: { startType: "pp", ppNextIsNakira: true,  targetWordType: "noun", targetNounKind: "mu3rab", targetNumber: "singular", targetSingularKind: "sahih" },
    covers: ["start.pp", "pp.nakiraYes", "mubtada.wordType", "mubtada.nounKind", "mubtada.i3rabNumber", "mubtada.singularKind", "R_mubtada_sahih"],
    primaryCover: "pp.nakiraYes",
  },
  {
    id: "ex_pp_no",
    sentence: "في البيتِ الرجلُ",
    target: "الرجلُ",
    facts: { startType: "pp", ppNextIsNakira: false,  targetWordType: "noun", targetNounKind: "mu3rab", targetNumber: "singular", targetSingularKind: "sahih" },
    covers: ["start.pp", "pp.nakiraNo", "mubtada.wordType", "mubtada.nounKind", "mubtada.i3rabNumber", "mubtada.singularKind", "R_mubtada_sahih"],
    primaryCover: "pp.nakiraNo",
  },
  {
    id: "ex_mufrad",
    sentence: "الطالبُ مجتهدٌ",
    target: "الطالبُ",
    facts: { startType: "explicitNoun", khabarType: "mufrad",  targetWordType: "noun", targetNounKind: "mu3rab", targetNumber: "singular", targetSingularKind: "sahih" },
    covers: ["start.explicitNoun", "mubtada.wordType", "mubtada.nounKind", "mubtada.i3rabNumber", "mubtada.singularKind", "R_mubtada_sahih"],
    primaryCover: "khabar.mufrad",
  },
  {
    id: "ex_jumla_fi3liyya",
    sentence: "المزارعُ يزرعُ الحقلَ",
    target: "المزارعُ",
    facts: { startType: "explicitNoun", khabarType: "jumlaFi3liyya",  targetWordType: "noun", targetNounKind: "mu3rab", targetNumber: "singular", targetSingularKind: "sahih" },
    covers: ["start.explicitNoun", "mubtada.wordType", "mubtada.nounKind", "mubtada.i3rabNumber", "mubtada.singularKind", "R_mubtada_sahih"],
    primaryCover: "khabar.jumlaFi3liyya",
  },
  {
    id: "ex_jumla_ismiyya",
    sentence: "المدرسةُ أبوابُها مفتوحةٌ",
    target: "المدرسةُ",
    facts: { startType: "explicitNoun", khabarType: "jumlaIsmiyya",  targetWordType: "noun", targetNounKind: "mu3rab", targetNumber: "singular", targetSingularKind: "sahih" },
    covers: ["start.explicitNoun", "mubtada.wordType", "mubtada.nounKind", "mubtada.i3rabNumber", "mubtada.singularKind", "R_mubtada_sahih"],
    primaryCover: "khabar.jumlaIsmiyya",
  },
  {
    id: "ex_khabar_pp",
    sentence: "الطالبُ في المدرسةِ",
    target: "الطالبُ",
    facts: { startType: "explicitNoun", khabarType: "pp",  targetWordType: "noun", targetNounKind: "mu3rab", targetNumber: "singular", targetSingularKind: "sahih" },
    covers: ["start.explicitNoun", "mubtada.wordType", "mubtada.nounKind", "mubtada.i3rabNumber", "mubtada.singularKind", "R_mubtada_sahih"],
    primaryCover: "khabar.pp",
  },
  {
    id: "ex_khabar_zarf",
    sentence: "الطالبُ عندَك",
    target: "الطالبُ",
    facts: { startType: "explicitNoun", khabarType: "zarf",  targetWordType: "noun", targetNounKind: "mu3rab", targetNumber: "singular", targetSingularKind: "sahih" },
    covers: ["start.explicitNoun", "mubtada.wordType", "mubtada.nounKind", "mubtada.i3rabNumber", "mubtada.singularKind", "R_mubtada_sahih"],
    primaryCover: "khabar.zarf",
  },
];