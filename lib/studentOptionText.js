const EXACT_STUDENT_LABELS = {
  "tawabi.naat": "النعت",
  "tawabi.atf": "العطف",
  "tawabi.tawkid": "التوكيد",
  "tawabi.tawkid_lafzi": "التوكيد اللفظي",
  "tawabi.tawkid_manawi": "التوكيد المعنوي",
  "tawabi.badal": "البدل",
  "tawabi.raf3": "الرفع",
  "tawabi.nasb": "النصب",
  "tawabi.jarr": "الجر",
  "tawabi.damma": "الضمة",
  "tawabi.fatha": "الفتحة",
  "tawabi.kasra": "الكسرة",
  "tawabi.alif": "الألف",
  "tawabi.yaa": "الياء",
  "tawabi.waw": "الواو",
  "kana_ism.connected_damir": "اسم كان: ضمير متصل",
  "inna_ism.connected_damir": "اسم إن: ضمير متصل",
};

const TOKEN_LABELS = {
  R: "النتيجة",
  first: "الكلمة الأولى",
  noun: "اسم",
  particle: "حرف",
  verb: "فعل",
  imperative: "أمر",
  past: "ماضٍ",
  present: "مضارع",
  fael: "فاعل",
  mafool: "مفعول به",
  mubtada: "مبتدأ",
  khabar: "خبر",
  kana: "كان وأخواتها",
  inna: "إن وأخواتها",
  ism: "اسم",
  tawkid: "توكيد",
  lafzi: "لفظي",
  manawi: "معنوي",
  tawabi: "التوابع",
  naat: "نعت",
  atf: "عطف",
  badal: "بدل",
  connected: "ضمير متصل",
  attached: "متصل",
  separate: "منفصل",
  damir: "ضمير",
  hidden: "ضمير مستتر",
  ana: "أنا",
  anta: "أنت",
  hiya: "هي",
  huwa: "هو",
  nahnu: "نحن",
  taa: "تاء الفاعل",
  haa: "هاء الغائب",
  na: "نا",
  niswa: "نون النسوة",
  waw: "الواو",
  yaa: "الياء",
  ya: "الياء",
  alif: "الألف",
  alif2: "ألف الاثنين",
  dual: "مثنى",
  singular: "مفرد",
  five: "الأسماء أو الأفعال الخمسة",
  jms: "جمع مذكر سالم",
  jfs: "جمع مؤنث سالم",
  jt: "جمع تكسير",
  ishara: "اسم إشارة",
  mawsool: "اسم موصول",
  istifham: "اسم استفهام",
  shart: "اسم شرط",
  kam: "كم الخبرية",
  masdar: "مصدر مؤول",
  an: "أن والفعل",
  ma: "ما والفعل",
  arju: "أرجو والفعل",
  visible: "بعلامة ظاهرة",
  estimated: "بعلامة مقدرة",
  maqsur: "اسم مقصور",
  manqous: "اسم منقوص",
  jar: "جار ومجرور",
  zarf: "ظرف",
  advanced: "متقدم",
  nominal: "جملة اسمية",
  verbal: "جملة فعلية",
  sentence: "جملة",
  shibh: "شبه جملة",
  raf3: "رفع",
  nasb: "نصب",
  jazm: "جزم",
  jarr: "جر",
  damma: "الضمة",
  fatha: "الفتحة",
  fath: "الفتح",
  kasra: "الكسرة",
  sukoon: "السكون",
  sahih: "صحيح الآخر",
  weak: "معتل الآخر",
  binaa: "مبني",
  delete: "حذف",
  deleted: "محذوفة",
  kept: "ثابتة",
  letter: "حرف العلة",
  noon: "النون",
  cancelled: "مكفوف عن العمل",
  kaffa: "ما الكافة",
};

export function containsArabicText(value) {
  return /[\u0600-\u06FF]/.test(String(value || ""));
}

export function looksLikeProgrammingOption(value) {
  const raw = String(value || "").trim();
  if (!raw) return false;
  if (EXACT_STUDENT_LABELS[raw]) return true;
  return !containsArabicText(raw) && (
    /^[A-Za-z][A-Za-z0-9_-]*(?:[._:/-][A-Za-z0-9_-]+)+$/.test(raw) ||
    /^[A-Za-z_][A-Za-z0-9_]*$/.test(raw)
  );
}

export function toStudentArabicOption(value, fallback = "الخيار النحوي المناسب") {
  const raw = String(value || "").split("\n")[0].trim();
  if (!raw) return fallback;
  if (EXACT_STUDENT_LABELS[raw]) return EXACT_STUDENT_LABELS[raw];
  if (containsArabicText(raw) && !looksLikeProgrammingOption(raw)) return raw;

  const parts = raw.split(/[._:/-]+/).filter(Boolean);
  const translated = parts
    .map((part) => TOKEN_LABELS[part])
    .filter(Boolean);

  if (translated.length) return Array.from(new Set(translated)).join(" — ");
  return fallback;
}
