export type TopicMetadata = {
  code: string;
  name_ar: string;
  subtitle: string;
  shortLabel: string;
  slogan?: string;
  desc: string;
  coverageCount: number;
  quizCount: number;
  level: number;
  isReady: boolean;
  isListed?: boolean;
};

export type TopicRoutes = {
  topics: string;
  paths: string;
  guide: string;
  learn: string;
  practice: string;
  quiz: string;
  texts: string;
  dashboard: string;
};

export type VisualPathResolution =
  | { status: "not-found"; code: string; topic: null }
  | { status: "unavailable"; code: string; topic: TopicMetadata }
  | { status: "available"; code: string; topic: TopicMetadata; isDefault: boolean };

export const VISUAL_PATH_TOPIC_CODES = [
  "first-word-key",
  "nominal-advanced",
  "khabar",
  "kana-wa-akhawatuha",
  "inna-wa-akhawatuha",
  "past-verb",
  "present-verb",
  "imperative-verb",
  "fael",
  "mafool-bih",
] as const;

const VISUAL_PATH_TOPIC_CODE_SET = new Set<string>(VISUAL_PATH_TOPIC_CODES);

export const TOPIC_CATALOG: TopicMetadata[] = [
  {
    code: "first-word-key",
    name_ar: "مفتاح الكلمة الأولى",
    subtitle: "اسم / فعل / حرف مع الحفاظ على التسلسل الأول",
    shortLabel: "الكلمة الأولى",
    desc: "مسار يدرّب الطالب على بدء التفكير النحوي من نوع الكلمة الأولى قبل الإعراب.",
    coverageCount: 6,
    quizCount: 8,
    level: 2,
    isReady: true,
  },
  {
    code: "past-verb",
    name_ar: "الفعل الماضي",
    subtitle: "الفتح / الضم / السكون مع إعراب الضمير المتصل",
    shortLabel: "الماضي",
    desc: "تدريب على بناء الفعل الماضي حسب اتصال الضمائر: واو الجماعة، ألف الاثنين، نون النسوة، وضمائر الرفع المتحركة.",
    coverageCount: 14,
    quizCount: 8,
    level: 2,
    isReady: true,
  },
  {
    code: "present-verb",
    name_ar: "الفعل المضارع",
    subtitle: "نون النسوة / نون التوكيد / الأداة / الأفعال الخمسة / صحيح ومعتل الآخر",
    shortLabel: "المضارع",
    desc: "خوارزمية المضارع: نبدأ بفحص نون النسوة ونون التوكيد. إن كان مبنيًا نحدد محله من العامل السابق، وإن كان معربًا نحدد حالته من العامل، ثم نميز الصحيح والمعتل والأفعال الخمسة لاختيار العلامة.",
    coverageCount: 17,
    quizCount: 12,
    level: 2,
    isReady: true,
  },
  {
    code: "imperative-verb",
    name_ar: "فعل الأمر",
    subtitle: "حذف النون / حذف حرف العلة / السكون",
    shortLabel: "الأمر",
    desc: "مسار فعل الأمر دون خلطه بالمضارع: نلاحظ اتصال واو الجماعة أو ياء المخاطبة أو ألف الاثنين، ثم نرجع للأصل عند المعتل.",
    coverageCount: 9,
    quizCount: 8,
    level: 2,
    isReady: true,
  },
  {
    code: "fael",
    name_ar: "الفاعل",
    subtitle: "فاعل مرفوع أو مبني في محل رفع",
    shortLabel: "الفاعل",
    desc: "تحديد نوع الفاعل أولًا ثم الوصول إلى علامة الرفع أو محل الرفع.",
    coverageCount: 21,
    quizCount: 14,
    level: 2,
    isReady: true,
  },
  {
    code: "mafool-bih",
    name_ar: "المفعول به",
    subtitle: "مفعول به منصوب أو مبني في محل نصب",
    shortLabel: "المفعول به",
    desc: "تحديد نوع المفعول به أولًا ثم الوصول إلى علامة النصب أو محل النصب.",
    coverageCount: 14,
    quizCount: 14,
    level: 2,
    isReady: true,
    isListed: false,
  },
  {
    code: "mafoolat",
    name_ar: "المفاعيل",
    subtitle: "المفعول به، المفعول المطلق، المفعول فيه، المفعول لأجله، المفعول معه",
    shortLabel: "المفاعيل",
    desc: "وحدة واحدة تعلّم الطالب المفاعيل الخمسة وتدربه على التمييز بينها من القرائن بالترتيب، ثم تعيده إلى صورة الكلمة لتحديد علامة النصب أو المحل.",
    coverageCount: 16,
    quizCount: 10,
    level: 2,
    isReady: true,
  },
  {
    code: "tawabi-naat",
    name_ar: "النعت",
    subtitle: "تمييز النعت عن الخبر والإضافة ثم إتباع المنعوت",
    shortLabel: "النعت",
    desc: "فرع من باب التوابع يدرّب الطالب على أن النعت يصف اسمًا قبله ويتبعه في الإعراب والتعريف والتنكير والنوع والعدد.",
    coverageCount: 15,
    quizCount: 8,
    level: 2,
    isReady: true,
  },
  {
    code: "tawabi-atf",
    name_ar: "العطف",
    subtitle: "حروف العطف ومشاركة المعطوف عليه في الحكم والإعراب",
    shortLabel: "العطف",
    desc: "فرع من باب التوابع يدرّب الطالب على أن المعطوف يأتي بعد حرف عطف ويشارك ما قبله في الحكم ويتبعه في الإعراب.",
    coverageCount: 13,
    quizCount: 8,
    level: 2,
    isReady: true,
  },
  {
    code: "tawabi-tawkid",
    name_ar: "التوكيد",
    subtitle: "اكتشاف التوكيد اللفظي والمعنوي دون إطالة المسار",
    shortLabel: "التوكيد",
    desc: "فرع من باب التوابع يدرّب الطالب على أن التوكيد يقوّي ما قبله، ثم يميّز سريعًا بين التوكيد اللفظي بتكرار اللفظ والتوكيد المعنوي بألفاظه المشهورة.",
    coverageCount: 13,
    quizCount: 6,
    level: 2,
    isReady: true,
  },
  {
    code: "tawabi-badal",
    name_ar: "البدل",
    subtitle: "البدل والمبدل منه وأنواع البدل الأساسية",
    shortLabel: "البدل",
    desc: "فرع من باب التوابع يدرّب الطالب على أن البدل يوضح المقصود من الاسم السابق ويمكن غالبًا أن يحل محله.",
    coverageCount: 10,
    quizCount: 6,
    level: 2,
    isReady: true,
  },
  {
    code: "tawabi",
    name_ar: "التوابع — تدريب مختلط",
    subtitle: "تمييز النعت، العطف، التوكيد، والبدل في مسار واحد",
    shortLabel: "التدريب المختلط",
    desc: "مسار يدرّب الطالب على اكتشاف العلاقة بالمعنى أولًا، ثم تسمية التابع، ثم إتباع المتبوع في الرفع أو النصب أو الجر مع اختيار العلامة المناسبة.",
    coverageCount: 23,
    quizCount: 12,
    level: 2,
    isReady: true,
  },
  {
    code: "attached-pronouns",
    name_ar: "الضمائر المتصلة والمنفصلة",
    subtitle: "ضمائر الرفع والنصب والجر بحسب محل الاسم الذي تنوب عنه",
    shortLabel: "الضمائر",
    desc: "يتعلم الطالب أن الضمير يأخذ محل الاسم الذي ناب عنه: رفعًا أو نصبًا أو جرًا، مع التمييز بين المتصل والمنفصل.",
    coverageCount: 5,
    quizCount: 8,
    level: 2,
    isReady: true,
    isListed: false,
  },
  {
    code: "ism-manqous",
    name_ar: "الاسم المنقوص",
    subtitle: "«الـ» / الإضافة / النكرة ثم بقاء الياء أو حذفها والعلامة",
    shortLabel: "الاسم المنقوص",
    desc: "شجرة مترابطة للاسم المنقوص: نفحص التعريف بـ«الـ» ثم الإضافة، فإن كان نكرة مجردة ربطنا الحالة الإعرابية ببقاء الياء أو حذفها، ثم حددنا العلامة.",
    coverageCount: 5,
    quizCount: 8,
    level: 2,
    isReady: true,
  },
  {
    code: "nominal-advanced",
    name_ar: "الجملة الاسمية",
    subtitle: "مسار المبتدأ — شجرة نظيفة قابلة للتوسعة",
    shortLabel: "المبتدأ",
    slogan: "تدريب موجّه بخوارزميات الإعراب التفاعلية",
    desc: "تعلّم مسار المبتدأ: الاسم المعرب، الاسم المبني، والمصدر المؤول مع صياغة إعراب ثابتة.",
    coverageCount: 13,
    quizCount: 12,
    level: 2,
    isReady: true,
  },
  {
    code: "khabar",
    name_ar: "الخبر",
    subtitle: "خبر مفرد، جملة، وشبه جملة",
    shortLabel: "الخبر",
    desc: "مسارات الخبر المفرد والجملة وشبه الجملة، مع تحديد نوع الاسم المبني قبل الإعراب.",
    coverageCount: 16,
    quizCount: 12,
    level: 2,
    isReady: true,
  },
  {
    code: "kana-wa-akhawatuha",
    name_ar: "كان وأخواتها",
    subtitle: "اسم كان مرفوع وخبر كان منصوب",
    shortLabel: "كان وأخواتها",
    desc: "نفس منطق الجملة الاسمية بعد دخول كان: اسم كان مرفوع وخبر كان منصوب.",
    coverageCount: 22,
    quizCount: 10,
    level: 2,
    isReady: true,
  },
  {
    code: "inna-wa-akhawatuha",
    name_ar: "إن وأخواتها",
    subtitle: "اسم إن منصوب وخبر إن مرفوع",
    shortLabel: "إن وأخواتها",
    desc: "نفس منطق الجملة الاسمية بعد دخول إن: اسم إن منصوب وخبر إن مرفوع.",
    coverageCount: 28,
    quizCount: 10,
    level: 2,
    isReady: true,
  },
  {
    code: "naib-fael",
    name_ar: "نائب الفاعل",
    subtitle: "الفعل المبني للمجهول → نائب الفاعل → الرفع → الصورة والعلامة",
    shortLabel: "نائب الفاعل",
    desc: "مسار يبدأ بالتحقق من بناء الفعل للمجهول، ثم يحدد ما أُسند إليه الفعل بعد حذف الفاعل، ثم يعود إلى صورة الكلمة لتحديد علامة الرفع أو محل الرفع.",
    coverageCount: 10,
    quizCount: 10,
    level: 2,
    isReady: true,
  },
  {
    code: "hal",
    name_ar: "الحال",
    subtitle: "كيف؟ → الهيئة → نوع الحال → علامة النصب أو المحل",
    shortLabel: "الحال",
    desc: "مسار يكتشف الحال من معنى الهيئة وسؤال «كيف؟»، ثم يميز الحال المفرد والجملة وشبه الجملة، ويحدد العلامة أو المحل.",
    coverageCount: 8,
    quizCount: 8,
    level: 2,
    isReady: true,
  },
  {
    code: "tamyiz",
    name_ar: "التمييز",
    subtitle: "إزالة الإبهام → ملفوظ أو ملحوظ → النصب",
    shortLabel: "التمييز",
    desc: "مسار يفرق التمييز عن الحال والمفاعيل من وظيفته في إزالة الإبهام، ثم يميز الملفوظ والملحوظ ويصل إلى الإعراب الصحيح.",
    coverageCount: 6,
    quizCount: 6,
    level: 2,
    isReady: true,
  },
  {
    code: "munada",
    name_ar: "المنادى",
    subtitle: "أداة النداء → نوع المنادى → البناء في محل نصب أو النصب",
    shortLabel: "المنادى",
    desc: "مسار يحدد نوع المنادى: مفرد علم، نكرة مقصودة، مضاف، شبيه بالمضاف، أو نكرة غير مقصودة، ثم يختار الحكم والعلامة.",
    coverageCount: 8,
    quizCount: 8,
    level: 2,
    isReady: true,
  },
  {
    code: "istithna",
    name_ar: "الاستثناء",
    subtitle: "إلا → تام أو مفرغ → مثبت أو منفي → الحكم",
    shortLabel: "الاستثناء",
    desc: "مسار للاستثناء بـ«إلا» يميز التام المثبت والتام المنفي والمفرغ، ويمنع الحكم الآلي على كل ما بعد إلا بالنصب.",
    coverageCount: 7,
    quizCount: 7,
    level: 2,
    isReady: true,
  },
  {
    code: "la-nafiya",
    name_ar: "لا النافية للجنس",
    subtitle: "عمل لا → اسمها → مفرد أو مضاف أو شبيه بالمضاف",
    shortLabel: "لا النافية للجنس",
    desc: "مسار يثبت عمل «لا» النافية للجنس، ثم يحدد اسمها ونوعه، ويفرق بين البناء في محل نصب والإعراب بالنصب.",
    coverageCount: 7,
    quizCount: 7,
    level: 2,
    isReady: true,
  },
];

export function getTopicMeta(code: string): TopicMetadata | null {
  return TOPIC_CATALOG.find((topic) => topic.code === code) ?? null;
}

export function getReadyTopicMetadata(): TopicMetadata[] {
  return TOPIC_CATALOG.filter((topic) => topic.isReady && topic.isListed !== false);
}

export function hasVisualPath(code: string): boolean {
  return VISUAL_PATH_TOPIC_CODE_SET.has(code);
}

export function resolveVisualPathTopic(requestedCode?: string | null): VisualPathResolution {
  const code = requestedCode || "nominal-advanced";
  const topic = getTopicMeta(code);

  if (!topic) return { status: "not-found", code, topic: null };
  if (!hasVisualPath(code)) return { status: "unavailable", code, topic };

  return { status: "available", code, topic, isDefault: !requestedCode };
}

export function getTopicRoutes(code: string): TopicRoutes {
  return {
    topics: "/topics",
    paths: `/paths?topic=${code}`,
    guide: `/guide/${code}`,
    learn: `/learn/${code}`,
    practice: `/train/${code}`,
    quiz: `/quiz/${code}`,
    texts: `/texts/${code}`,
    dashboard: "/dashboard",
  };
}
