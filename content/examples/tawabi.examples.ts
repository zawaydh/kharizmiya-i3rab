export type Example = { id: string; sentence: string; target: string; facts: Record<string, unknown>; covers: string[]; followUp?: unknown };

export const tawabiCoverageKeysOrdered = [
  "tawabi.naat",
  "tawabi.atf",
  "tawabi.tawkid",
  "tawabi.tawkid_lafzi",
  "tawabi.tawkid_manawi",
  "tawabi.badal",
  "tawabi.raf3",
  "tawabi.nasb",
  "tawabi.jarr",
  "tawabi.singular",
  "tawabi.dual",
  "tawabi.jms",
  "tawabi.jfs",
  "tawabi.jt",
  "tawabi.five",
  "tawabi.sentence",
  "tawabi.shibh",
  "tawabi.damma",
  "tawabi.fatha",
  "tawabi.kasra",
  "tawabi.alif",
  "tawabi.yaa",
  "tawabi.waw"
];

const base = { roleKind: "mu3rab", entryKind: "dependent" };

function termLabel(term: string) {
  if (term === "naat") return "نعت";
  if (term === "atf") return "معطوف";
  if (term === "tawkid") return "توكيد";
  if (term === "tawkid_lafzi") return "توكيد لفظي";
  if (term === "tawkid_manawi") return "توكيد معنوي";
  if (term === "badal") return "بدل";
  return "تابع";
}

function caseLabel(i3rabCase: string) {
  if (i3rabCase === "raf3") return "مرفوع";
  if (i3rabCase === "nasb") return "منصوب";
  if (i3rabCase === "jarr") return "مجرور";
  return "تابع";
}

function caseNoun(i3rabCase: string) {
  if (i3rabCase === "raf3") return "الرفع";
  if (i3rabCase === "nasb") return "النصب";
  if (i3rabCase === "jarr") return "الجر";
  return "الإعراب";
}

function caseBare(i3rabCase: string) {
  if (i3rabCase === "raf3") return "رفع";
  if (i3rabCase === "nasb") return "نصب";
  if (i3rabCase === "jarr") return "جر";
  return "إعراب";
}

function markName(i3rabCase: string) {
  if (i3rabCase === "raf3") return "رفعه";
  if (i3rabCase === "nasb") return "نصبه";
  if (i3rabCase === "jarr") return "جره";
  return "إعرابه";
}

function isMulhaqBilMuthanna(target?: string) {
  const plain = String(target || "").replace(/[ًٌٍَُِّْـ]/g, "");
  return /^(كلا|كلتا|كلي|كلتي)/.test(plain);
}

function markLabel(mark: string, shape?: string, i3rabCase?: string, target?: string) {
  if (mark === "damma") return "الضمة الظاهرة على آخره";
  if (mark === "fatha") return "الفتحة الظاهرة على آخره";
  if (mark === "kasra" && shape === "jfs" && i3rabCase === "nasb") return "الكسرة نيابة عن الفتحة لأنه جمع مؤنث سالم";
  if (mark === "kasra") return "الكسرة الظاهرة على آخره";
  if (mark === "alif" && shape === "dual") return `الألف لأنه ${isMulhaqBilMuthanna(target) ? "ملحق بالمثنى" : "مثنى"}`;
  if (mark === "alif" && shape === "five") return "الألف لأنه من الأسماء الخمسة";
  if (mark === "yaa" && shape === "dual") return `الياء لأنه ${isMulhaqBilMuthanna(target) ? "ملحق بالمثنى" : "مثنى"}`;
  if (mark === "yaa" && shape === "jms") return "الياء لأنه جمع مذكر سالم";
  if (mark === "yaa" && shape === "five") return "الياء لأنه من الأسماء الخمسة";
  if (mark === "waw" && shape === "jms") return "الواو لأنه جمع مذكر سالم";
  if (mark === "waw" && shape === "five") return "الواو لأنه من الأسماء الخمسة";
  return "العلامة المناسبة";
}

function makeFinal(target: string, term: string, i3rabCase: string, mark: string, matbu3: string, matbu3Role: string, reason: string, shape?: string, extra = "") {
  const name = termLabel(term);
  const status = caseLabel(i3rabCase);
  const sign = markLabel(mark, shape, i3rabCase, target);
  return `${target}: ${name} ${status}، وعلامة ${markName(i3rabCase)} ${sign}.
سبب الإتباع: لأنه تابع لـ(${matbu3})، و${matbu3} ${matbu3Role}؛ لذلك أخذ منه ${caseNoun(i3rabCase)}.
سبب الاختيار: ${reason}${extra ? `\n${extra}` : ""}`;
}

function makeTawkidFinal(target: string, tawkidKind: "lafzi" | "manawi", i3rabCase: string, mark: string, matbu3: string, matbu3Role: string, reason: string, shape?: string, extra = "") {
  return makeFinal(target, tawkidKind === "lafzi" ? "tawkid_lafzi" : "tawkid_manawi", i3rabCase, mark, matbu3, matbu3Role, reason, shape, extra);
}

function makePhraseFinal(target: string, phraseType: string, i3rabCase: string, matbu3: string, matbu3Role: string, reason: string, extra = "") {
  const bareCase = caseBare(i3rabCase);
  return `${target}: ${phraseType} في محل ${bareCase} نعت.
سبب الإتباع: لأن التركيب تابع لـ(${matbu3})، و${matbu3} ${matbu3Role}؛ لذلك جاء في محل ${bareCase}.
سبب الاختيار: ${reason}${extra ? `\n${extra}` : ""}`;
}

export const tawabiExamples: Example[] = [
  {
    id: "tw-01",
    sentence: "جاءَ الطالبُ المجتهدُ.",
    target: "المجتهدُ",
    facts: {
      ...base,
      relationKind: "description",
      tawabiTerm: "naat",
      case: "raf3",
      shape: "singular",
      mark: "damma",
      matbu3: "الطالبُ",
      matbu3Role: "فاعل مرفوع",
      relationReason: "لأن المجتهد وصفٌ للطالب وبيان لصفته، وليس خبرًا مستقلًا ولا حالًا.",
      finalI3rab: makeFinal("المجتهدُ", "naat", "raf3", "damma", "الطالبُ", "فاعل مرفوع", "لأن المجتهد وصفٌ للطالب وبيان لصفته.", "singular")
    },
    covers: ["tawabi.naat", "tawabi.raf3", "tawabi.singular", "tawabi.damma"]
  },
  {
    id: "tw-02",
    sentence: "كرّمَ المديرُ الطالبَ المجتهدَ.",
    target: "المجتهدَ",
    facts: {
      ...base,
      relationKind: "description",
      tawabiTerm: "naat",
      case: "nasb",
      shape: "singular",
      mark: "fatha",
      matbu3: "الطالبَ",
      matbu3Role: "مفعول به منصوب",
      relationReason: "لأن المجتهد وصف للطالب، أما المفعول به فهو الطالب لا الصفة وحدها.",
      finalI3rab: makeFinal("المجتهدَ", "naat", "nasb", "fatha", "الطالبَ", "مفعول به منصوب", "لأن المجتهد وصفٌ للطالب، وليس هو الذي وقع عليه التكريم وحده.", "singular")
    },
    covers: ["tawabi.naat", "tawabi.nasb", "tawabi.singular", "tawabi.fatha"]
  },
  {
    id: "tw-03",
    sentence: "مررتُ بالطالبِ المجتهدِ.",
    target: "المجتهدِ",
    facts: {
      ...base,
      relationKind: "description",
      tawabiTerm: "naat",
      case: "jarr",
      shape: "singular",
      mark: "kasra",
      matbu3: "الطالبِ",
      matbu3Role: "اسم مجرور بالباء",
      relationReason: "لأن المجتهد يصف الطالب المجرور قبله، ولم يأت مضافًا إليه.",
      finalI3rab: makeFinal("المجتهدِ", "naat", "jarr", "kasra", "الطالبِ", "اسم مجرور بالباء", "لأن المجتهد وصفٌ للطالب المجرور قبله.", "singular")
    },
    covers: ["tawabi.naat", "tawabi.jarr", "tawabi.singular", "tawabi.kasra"]
  },
  {
    id: "tw-04",
    sentence: "حضرَ خالدٌ وعليٌّ.",
    target: "عليٌّ",
    facts: {
      ...base,
      relationKind: "coordination",
      tawabiTerm: "atf",
      connector: "الواو",
      case: "raf3",
      shape: "singular",
      mark: "damma",
      matbu3: "خالدٌ",
      matbu3Role: "فاعل مرفوع",
      relationReason: "لأن الواو ربطت عليًّا بخالد، فشارك خالدًا في حكم الحضور.",
      finalI3rab: makeFinal("عليٌّ", "atf", "raf3", "damma", "خالدٌ", "فاعل مرفوع", "لأن الواو جعلت عليًّا مشاركًا لخالد في حكم الحضور.", "singular", "الواو: حرف عطف لا محل له من الإعراب.")
    },
    covers: ["tawabi.atf", "tawabi.raf3", "tawabi.singular", "tawabi.damma"]
  },
  {
    id: "tw-05",
    sentence: "رأيتُ خالدًا وعليًّا.",
    target: "عليًّا",
    facts: {
      ...base,
      relationKind: "coordination",
      tawabiTerm: "atf",
      connector: "الواو",
      case: "nasb",
      shape: "singular",
      mark: "fatha",
      matbu3: "خالدًا",
      matbu3Role: "مفعول به منصوب",
      relationReason: "لأن عليًّا جاء بعد الواو وشارك خالدًا في وقوع الرؤية عليه.",
      finalI3rab: makeFinal("عليًّا", "atf", "nasb", "fatha", "خالدًا", "مفعول به منصوب", "لأنه شارك خالدًا في وقوع فعل الرؤية عليه بسبب الواو.", "singular", "الواو: حرف عطف لا محل له من الإعراب.")
    },
    covers: ["tawabi.atf", "tawabi.nasb", "tawabi.singular", "tawabi.fatha"]
  },
  {
    id: "tw-06",
    sentence: "سلَّمتُ على خالدٍ وعليٍّ.",
    target: "عليٍّ",
    facts: {
      ...base,
      relationKind: "coordination",
      tawabiTerm: "atf",
      connector: "الواو",
      case: "jarr",
      shape: "singular",
      mark: "kasra",
      matbu3: "خالدٍ",
      matbu3Role: "اسم مجرور بعلى",
      relationReason: "لأن عليًّا جاء بعد الواو وشارك خالدًا في التعلق بحرف الجر.",
      finalI3rab: makeFinal("عليٍّ", "atf", "jarr", "kasra", "خالدٍ", "اسم مجرور بعلى", "لأنه شارك خالدًا في التعلّق بحرف الجر بسبب الواو.", "singular", "الواو: حرف عطف لا محل له من الإعراب.")
    },
    covers: ["tawabi.atf", "tawabi.jarr", "tawabi.singular", "tawabi.kasra"]
  },
  {
    id: "tw-07",
    sentence: "جاءَ المديرُ نفسُهُ.",
    target: "نفسُهُ",
    facts: {
      ...base,
      relationKind: "emphasis",
      tawabiTerm: "tawkid",
      tawkidKind: "manawi",
      case: "raf3",
      shape: "singular",
      mark: "damma",
      matbu3: "المديرُ",
      matbu3Role: "فاعل مرفوع",
      relationReason: "لأن نفسه لم تصف المدير بصفة جديدة، بل أكدت أنه حضر بذاته.",
      finalI3rab: makeTawkidFinal("نفسُهُ", "manawi", "raf3", "damma", "المديرُ", "فاعل مرفوع", "لأن نفسُه أكدت أن المدير حضر بذاته لا نائبه.", "singular", "الهاء: ضمير متصل مبني في محل جر مضاف إليه، وهو الرابط المطلوب في التوكيد المعنوي.")
    },
    covers: ["tawabi.tawkid", "tawabi.tawkid_manawi", "tawabi.raf3", "tawabi.singular", "tawabi.damma"]
  },
  {
    id: "tw-08",
    sentence: "قابلتُ المعلمينَ كلَّهم.",
    target: "كلَّهم",
    facts: {
      ...base,
      relationKind: "emphasis",
      tawabiTerm: "tawkid",
      tawkidKind: "manawi",
      case: "nasb",
      shape: "singular",
      mark: "fatha",
      matbu3: "المعلمينَ",
      matbu3Role: "مفعول به منصوب",
      relationReason: "لأن كلهم أكدت شمول الحكم لجميع المعلمين، ولم تضف وصفًا جديدًا.",
      finalI3rab: makeTawkidFinal("كلَّهم", "manawi", "nasb", "fatha", "المعلمينَ", "مفعول به منصوب", "لأن كلَّهم أكدت شمول المقابلة لجميع المعلمين.", "singular", "الهاء: ضمير متصل مبني في محل جر مضاف إليه، والميم للجمع.")
    },
    covers: ["tawabi.tawkid", "tawabi.tawkid_manawi", "tawabi.nasb", "tawabi.singular", "tawabi.fatha"]
  },
  {
    id: "tw-09",
    sentence: "مررتُ بالطلابِ جميعِهم.",
    target: "جميعِهم",
    facts: {
      ...base,
      relationKind: "emphasis",
      tawabiTerm: "tawkid",
      tawkidKind: "manawi",
      case: "jarr",
      shape: "singular",
      mark: "kasra",
      matbu3: "الطلابِ",
      matbu3Role: "اسم مجرور بالباء",
      relationReason: "لأن جميعهم أكدت الشمول، والهاء فيها عادت على الطلاب.",
      finalI3rab: makeTawkidFinal("جميعِهم", "manawi", "jarr", "kasra", "الطلابِ", "اسم مجرور بالباء", "لأن جميعِهم أكدت شمول المرور بالطلاب كلهم.", "singular", "الهاء: ضمير متصل مبني في محل جر مضاف إليه، والميم للجمع.")
    },
    covers: ["tawabi.tawkid", "tawabi.tawkid_manawi", "tawabi.jarr", "tawabi.singular", "tawabi.kasra"]
  },
  {
    id: "tw-09-lf-raf3",
    sentence: "الصدقُ الصدقُ منجاةٌ.",
    target: "الصدقُ",
    facts: {
      ...base,
      relationKind: "emphasis",
      tawabiTerm: "tawkid",
      tawkidKind: "lafzi",
      case: "raf3",
      shape: "singular",
      mark: "damma",
      matbu3: "الصدقُ",
      matbu3Role: "مبتدأ مرفوع",
      relationReason: "لأن الكلمة الثانية كررت اللفظ نفسه لتقوية المعنى وتثبيته.",
      finalI3rab: makeTawkidFinal("الصدقُ", "lafzi", "raf3", "damma", "الصدقُ", "مبتدأ مرفوع", "لأن اللفظ تكرر نفسه، وهذا توكيد لفظي.", "singular")
    },
    covers: ["tawabi.tawkid", "tawabi.tawkid_lafzi", "tawabi.raf3", "tawabi.singular", "tawabi.damma"]
  },
  {
    id: "tw-09-lf-nasb",
    sentence: "كرّمتُ الطالبَ الطالبَ.",
    target: "الطالبَ",
    facts: {
      ...base,
      relationKind: "emphasis",
      tawabiTerm: "tawkid",
      tawkidKind: "lafzi",
      case: "nasb",
      shape: "singular",
      mark: "fatha",
      matbu3: "الطالبَ",
      matbu3Role: "مفعول به منصوب",
      relationReason: "لأن الكلمة الثانية أعادت اللفظ نفسه لتأكيد المقصود.",
      finalI3rab: makeTawkidFinal("الطالبَ", "lafzi", "nasb", "fatha", "الطالبَ", "مفعول به منصوب", "لأن اللفظ تكرر نفسه، وهذا توكيد لفظي.", "singular")
    },
    covers: ["tawabi.tawkid", "tawabi.tawkid_lafzi", "tawabi.nasb", "tawabi.singular", "tawabi.fatha"]
  },
  {
    id: "tw-09-lf-jarr",
    sentence: "مررتُ بالطالبِ الطالبِ.",
    target: "الطالبِ",
    facts: {
      ...base,
      relationKind: "emphasis",
      tawabiTerm: "tawkid",
      tawkidKind: "lafzi",
      case: "jarr",
      shape: "singular",
      mark: "kasra",
      matbu3: "الطالبِ",
      matbu3Role: "اسم مجرور بالباء",
      relationReason: "لأن الكلمة الثانية كررت اللفظ نفسه لتأكيد المقصود.",
      finalI3rab: makeTawkidFinal("الطالبِ", "lafzi", "jarr", "kasra", "الطالبِ", "اسم مجرور بالباء", "لأن اللفظ تكرر نفسه، وهذا توكيد لفظي.", "singular")
    },
    covers: ["tawabi.tawkid", "tawabi.tawkid_lafzi", "tawabi.jarr", "tawabi.singular", "tawabi.kasra"]
  },
  {
    id: "tw-10",
    sentence: "زارَنا الخليفةُ عمرُ.",
    target: "عمرُ",
    facts: {
      ...base,
      relationKind: "substitution",
      tawabiTerm: "badal",
      badalKind: "مطابق",
      case: "raf3",
      shape: "singular",
      mark: "damma",
      matbu3: "الخليفةُ",
      matbu3Role: "فاعل مرفوع",
      relationReason: "لأن عمر هو المقصود من الخليفة، ويصح أن نقول: زارنا عمرُ.",
      finalI3rab: makeFinal("عمرُ", "badal", "raf3", "damma", "الخليفةُ", "فاعل مرفوع", "لأن عمر هو المقصود الحقيقي من كلمة الخليفة، ويمكن أن نقول: زارنا عمرُ.", "singular", "نوع البدل: بدل مطابق؛ لأن البدل هو المبدل منه نفسه.")
    },
    covers: ["tawabi.badal", "tawabi.raf3", "tawabi.singular", "tawabi.damma"]
  },
  {
    id: "tw-11",
    sentence: "قابلتُ الطبيبَ أحمدَ.",
    target: "أحمدَ",
    facts: {
      ...base,
      relationKind: "substitution",
      tawabiTerm: "badal",
      badalKind: "مطابق",
      case: "nasb",
      shape: "singular",
      mark: "fatha",
      matbu3: "الطبيبَ",
      matbu3Role: "مفعول به منصوب",
      relationReason: "لأن أحمد يفسر من الطبيب المقصود، ويصح أن نقول: قابلتُ أحمدَ.",
      finalI3rab: makeFinal("أحمدَ", "badal", "nasb", "fatha", "الطبيبَ", "مفعول به منصوب", "لأن أحمد يوضح الطبيب المقصود، ويمكن أن نقول: قابلتُ أحمدَ.", "singular", "نوع البدل: بدل مطابق.")
    },
    covers: ["tawabi.badal", "tawabi.nasb", "tawabi.singular", "tawabi.fatha"]
  },
  {
    id: "tw-12",
    sentence: "سلَّمتُ على أخيكَ خالدٍ.",
    target: "خالدٍ",
    facts: {
      ...base,
      relationKind: "substitution",
      tawabiTerm: "badal",
      badalKind: "مطابق",
      case: "jarr",
      shape: "singular",
      mark: "kasra",
      matbu3: "أخيكَ",
      matbu3Role: "اسم مجرور بعلى",
      relationReason: "لأن «خالد» هي المقصودة بـ«أخيك»، ويمكن الاستغناء عن «أخيك» ووضع «خالد» مكانها دون اختلال المعنى: سلّمتُ على خالدٍ.",
      finalI3rab: makeFinal("خالدٍ", "badal", "jarr", "kasra", "أخيكَ", "اسم مجرور بعلى", "لأن «خالد» هي المقصودة بـ«أخيك»، ويمكن الاستغناء عن «أخيك» ووضع «خالد» مكانها دون اختلال المعنى.", "singular", "نوع البدل: بدل مطابق.")
    },
    covers: ["tawabi.badal", "tawabi.jarr", "tawabi.singular", "tawabi.kasra"]
  },
  {
    id: "tw-13",
    sentence: "حضرَ الطالبانِ المجتهدانِ.",
    target: "المجتهدانِ",
    facts: {
      ...base,
      relationKind: "description",
      tawabiTerm: "naat",
      case: "raf3",
      shape: "dual",
      mark: "alif",
      matbu3: "الطالبانِ",
      matbu3Role: "فاعل مرفوع بالألف لأنه مثنى",
      relationReason: "لأن المجتهدان وصف للطالبين وتابع لهما في الرفع.",
      finalI3rab: makeFinal("المجتهدانِ", "naat", "raf3", "alif", "الطالبانِ", "فاعل مرفوع بالألف لأنه مثنى", "لأنه وصف للطالبين وتابع لهما في الرفع.", "dual")
    },
    covers: ["tawabi.naat", "tawabi.raf3", "tawabi.dual", "tawabi.alif"]
  },
  {
    id: "tw-14",
    sentence: "كرّمتُ المعلمينَ المخلصينَ.",
    target: "المخلصينَ",
    facts: {
      ...base,
      relationKind: "description",
      tawabiTerm: "naat",
      case: "nasb",
      shape: "jms",
      mark: "yaa",
      matbu3: "المعلمينَ",
      matbu3Role: "مفعول به منصوب بالياء لأنه جمع مذكر سالم",
      relationReason: "لأن المخلصين وصف للمعلمين، وتابع لهم في النصب لا في الضمة أو الفتحة.",
      finalI3rab: makeFinal("المخلصينَ", "naat", "nasb", "yaa", "المعلمينَ", "مفعول به منصوب بالياء لأنه جمع مذكر سالم", "لأنه وصف للمعلمين وتابع لهم في النصب.", "jms")
    },
    covers: ["tawabi.naat", "tawabi.nasb", "tawabi.jms", "tawabi.yaa"]
  },
  {
    id: "tw-15",
    sentence: "فازتِ الطالباتُ المجتهداتُ.",
    target: "المجتهداتُ",
    facts: {
      ...base,
      relationKind: "description",
      tawabiTerm: "naat",
      case: "raf3",
      shape: "jfs",
      mark: "damma",
      matbu3: "الطالباتُ",
      matbu3Role: "فاعل مرفوع",
      relationReason: "لأن المجتهدات وصف للطالبات وتابع لهن في الرفع.",
      finalI3rab: makeFinal("المجتهداتُ", "naat", "raf3", "damma", "الطالباتُ", "فاعل مرفوع", "لأنه وصف للطالبات وتابع لهن في الرفع.", "jfs")
    },
    covers: ["tawabi.naat", "tawabi.raf3", "tawabi.jfs", "tawabi.damma"]
  },
  {
    id: "tw-16",
    sentence: "رأيتُ نساءً نشيطاتٍ.",
    target: "نشيطاتٍ",
    facts: {
      ...base,
      relationKind: "description",
      tawabiTerm: "naat",
      case: "nasb",
      shape: "jfs",
      mark: "kasra",
      matbu3: "نساءً",
      matbu3Role: "مفعول به منصوب بالفتحة الظاهرة",
      relationReason: "لأن «نشيطاتٍ» وصفت «نساءً» وتبعتها في حالة النصب، مع اختلاف العلامة: المنعوت منصوب بالفتحة، والنعت منصوب بالكسرة نيابة عن الفتحة لأنه جمع مؤنث سالم.",
      finalI3rab: makeFinal("نشيطاتٍ", "naat", "nasb", "kasra", "نساءً", "مفعول به منصوب بالفتحة الظاهرة", "لأنها وصفت نساءً وتبعتها في حالة النصب، ولا يشترط أن تتطابق علامة التابع مع علامة المتبوع.", "jfs")
    },
    covers: ["tawabi.naat", "tawabi.nasb", "tawabi.jfs", "tawabi.kasra"]
  },
  {
    id: "tw-17",
    sentence: "حضرَ الطلابُ والأطفالُ.",
    target: "الأطفالُ",
    facts: {
      ...base,
      relationKind: "coordination",
      tawabiTerm: "atf",
      connector: "الواو",
      case: "raf3",
      shape: "jt",
      mark: "damma",
      matbu3: "الطلابُ",
      matbu3Role: "فاعل مرفوع",
      relationReason: "لأن الأطفال جاءت بعد الواو فشاركت الطلاب في حكم الحضور.",
      finalI3rab: makeFinal("الأطفالُ", "atf", "raf3", "damma", "الطلابُ", "فاعل مرفوع", "لأن الأطفال شاركوا الطلاب في حكم الحضور بسبب الواو، وهو جمع تكسير مرفوع بالضمة.", "jt", "الواو: حرف عطف لا محل له من الإعراب.")
    },
    covers: ["tawabi.atf", "tawabi.raf3", "tawabi.jt", "tawabi.damma"]
  },
  {
    id: "tw-18",
    sentence: "جاءَ أبوكَ وأخوكَ.",
    target: "أخوكَ",
    facts: {
      ...base,
      relationKind: "coordination",
      tawabiTerm: "atf",
      connector: "الواو",
      case: "raf3",
      shape: "five",
      mark: "waw",
      matbu3: "أبوكَ",
      matbu3Role: "فاعل مرفوع بالواو لأنه من الأسماء الخمسة",
      relationReason: "لأن أخوك جاء بعد الواو فشارك أبوك في حكم المجيء، وهو من الأسماء الخمسة.",
      finalI3rab: makeFinal("أخوكَ", "atf", "raf3", "waw", "أبوكَ", "فاعل مرفوع بالواو لأنه من الأسماء الخمسة", "لأنه معطوف على أبوكَ بحرف الواو، فتبعه في الرفع.", "five", "الكاف: ضمير متصل مبني في محل جر مضاف إليه.")
    },
    covers: ["tawabi.atf", "tawabi.raf3", "tawabi.five", "tawabi.waw"]
  },
  {
    id: "tw-19",
    sentence: "استمعتُ إلى خطيبٍ يرفعُ صوتَهُ.",
    target: "يرفعُ صوتَهُ",
    facts: {
      entryKind: "dependent",
      roleKind: "sentence",
      relationKind: "description",
      tawabiTerm: "naat",
      case: "jarr",
      matbu3: "خطيبٍ",
      matbu3Role: "اسم مجرور بإلى",
      phraseKind: "جملة فعلية",
      linkText: "الهاء في (صوتَهُ) تعود على الخطيب",
      relationReason: "لأن جملة يرفع صوته جاءت بعد نكرة وهي خطيب، وفيها رابط يعود على المنعوت.",
      finalI3rab: makePhraseFinal("يرفعُ صوتَهُ", "جملة فعلية", "jarr", "خطيبٍ", "اسم مجرور بإلى", "لأنها وصفت خطيبًا نكرة، والرابط هو الهاء في (صوتَهُ) العائدة على الخطيب.", "الجملة من الفعل والفاعل المستتر والمفعول به في محل جر نعت.")
    },
    covers: ["tawabi.naat", "tawabi.jarr", "tawabi.sentence"]
  },
  {
    id: "tw-20",
    sentence: "هذا طالبٌ أخلاقُهُ حسنةٌ.",
    target: "أخلاقُهُ حسنةٌ",
    facts: {
      entryKind: "dependent",
      roleKind: "sentence",
      relationKind: "description",
      tawabiTerm: "naat",
      case: "raf3",
      matbu3: "طالبٌ",
      matbu3Role: "خبر مرفوع",
      phraseKind: "جملة اسمية",
      linkText: "الهاء في (أخلاقُهُ) تعود على الطالب",
      relationReason: "لأن جملة أخلاقه حسنة جاءت بعد نكرة وهي طالب، وفيها رابط يعود على المنعوت.",
      finalI3rab: makePhraseFinal("أخلاقُهُ حسنةٌ", "جملة اسمية", "raf3", "طالبٌ", "خبر مرفوع", "لأنها وصفت طالبًا نكرة، والرابط هو الهاء في (أخلاقُهُ) العائدة على الطالب.", "الجملة الاسمية في محل رفع نعت.")
    },
    covers: ["tawabi.naat", "tawabi.raf3", "tawabi.sentence"]
  },
  {
    id: "tw-21",
    sentence: "رأيتُ طائرًا فوقَ الشجرةِ.",
    target: "فوقَ الشجرةِ",
    facts: {
      entryKind: "dependent",
      roleKind: "shibh",
      relationKind: "description",
      tawabiTerm: "naat",
      case: "nasb",
      matbu3: "طائرًا",
      matbu3Role: "مفعول به منصوب",
      phraseKind: "شبه جملة ظرفية",
      relationReason: "لأن شبه الجملة فوق الشجرة وصف لطائر نكرة، والتقدير: طائرًا موجودًا فوق الشجرة.",
      finalI3rab: makePhraseFinal("فوقَ الشجرةِ", "شبه جملة ظرفية", "nasb", "طائرًا", "مفعول به منصوب", "لأنها وصفت طائرًا نكرة، والتقدير: طائرًا موجودًا فوق الشجرة.", "فوقَ: ظرف مكان منصوب، وهو مضاف، والشجرةِ مضاف إليه؛ وشبه الجملة في محل نصب نعت.")
    },
    covers: ["tawabi.naat", "tawabi.nasb", "tawabi.shibh"]
  },
  {
    id: "tw-22",
    sentence: "قابلتُ الطالبينِ كليهما.",
    target: "كليهما",
    facts: {
      ...base,
      relationKind: "emphasis",
      tawabiTerm: "tawkid",
      tawkidKind: "manawi",
      case: "nasb",
      shape: "dual",
      mark: "yaa",
      matbu3: "الطالبينِ",
      matbu3Role: "مفعول به منصوب بالياء لأنه مثنى",
      relationReason: "لأن كليهما أكدت شمول المقابلة للطالبين، واتصلت بضمير يعود عليهما.",
      finalI3rab: makeTawkidFinal("كليهما", "manawi", "nasb", "yaa", "الطالبينِ", "مفعول به منصوب بالياء لأنه مثنى", "لأن كليهما أكدت شمول المقابلة للطالبين، واتصلت بضمير يعود على المؤكَّد.", "dual", "كلا وكلتا تعربان إعراب المثنى إذا أضيفتا إلى ضمير؛ وهنا جاءت كليهما منصوبة بالياء.")
    },
    covers: ["tawabi.tawkid", "tawabi.tawkid_manawi", "tawabi.nasb", "tawabi.dual", "tawabi.yaa"]
  },
  {
    id: "tw-23",
    sentence: "قرأتُ الكتابَ فصلَهُ الأولَ.",
    target: "فصلَهُ",
    facts: {
      ...base,
      relationKind: "substitution",
      tawabiTerm: "badal",
      badalKind: "بعض من كل",
      case: "nasb",
      shape: "singular",
      mark: "fatha",
      matbu3: "الكتابَ",
      matbu3Role: "مفعول به منصوب",
      relationReason: "لأن الفصل جزء حقيقي من الكتاب، والهاء في فصلَه تعود على الكتاب.",
      finalI3rab: makeFinal("فصلَهُ", "badal", "nasb", "fatha", "الكتابَ", "مفعول به منصوب", "لأن الفصل جزء من الكتاب، وفيه ضمير يعود على المبدل منه.", "singular", "نوع البدل: بدل بعض من كل. الهاء: ضمير متصل مبني في محل جر مضاف إليه.")
    },
    covers: ["tawabi.badal", "tawabi.nasb", "tawabi.singular", "tawabi.fatha"]
  },
  {
    id: "tw-24",
    sentence: "أعجبني الطالبُ خُلُقُهُ.",
    target: "خُلُقُهُ",
    facts: {
      ...base,
      relationKind: "substitution",
      tawabiTerm: "badal",
      badalKind: "اشتمال",
      case: "raf3",
      shape: "singular",
      mark: "damma",
      matbu3: "الطالبُ",
      matbu3Role: "فاعل مرفوع",
      relationReason: "لأن الخلق ليس جزءًا حسيًا من الطالب، بل معنى يشتمل عليه، والهاء تعود على الطالب.",
      finalI3rab: makeFinal("خُلُقُهُ", "badal", "raf3", "damma", "الطالبُ", "فاعل مرفوع", "لأن الخلق معنى من معاني الطالب لا جزء حسي منه، وفيه ضمير يعود على المبدل منه.", "singular", "نوع البدل: بدل اشتمال. الهاء: ضمير متصل مبني في محل جر مضاف إليه.")
    },
    covers: ["tawabi.badal", "tawabi.raf3", "tawabi.singular", "tawabi.damma"]
  },
  {
    id: "tw-25",
    sentence: "دخلَ الإمامُ فالمأمومُ.",
    target: "المأمومُ",
    facts: {
      ...base,
      relationKind: "coordination",
      tawabiTerm: "atf",
      connector: "الفاء",
      case: "raf3",
      shape: "singular",
      mark: "damma",
      matbu3: "الإمامُ",
      matbu3Role: "فاعل مرفوع",
      relationReason: "لأن الفاء عطفت المأموم على الإمام، ودلت على التعقيب والترتيب.",
      finalI3rab: makeFinal("المأمومُ", "atf", "raf3", "damma", "الإمامُ", "فاعل مرفوع", "لأنه معطوف على الإمام بحرف الفاء، فتبعه في الرفع.", "singular", "الفاء: حرف عطف يفيد الترتيب والتعقيب.")
    },
    covers: ["tawabi.atf", "tawabi.raf3", "tawabi.singular", "tawabi.damma"]
  }
  ,{
    id: "tw-26",
    sentence: "زرتُ عمّانَ ثمَّ العقبةَ.",
    target: "العقبةَ",
    facts: {
      ...base,
      relationKind: "coordination",
      tawabiTerm: "atf",
      connector: "ثمَّ",
      case: "nasb",
      shape: "singular",
      mark: "fatha",
      matbu3: "عمّانَ",
      matbu3Role: "مفعول به منصوب",
      relationReason: "لأن ثمَّ عطفت العقبة على عمّان، ودلت على الترتيب مع التراخي.",
      finalI3rab: makeFinal("العقبةَ", "atf", "nasb", "fatha", "عمّانَ", "مفعول به منصوب", "لأن العقبة شاركت عمّان في وقوع الزيارة عليها بواسطة ثمَّ.", "singular", "ثمَّ: حرف عطف يفيد الترتيب مع التراخي.")
    },
    covers: ["tawabi.atf", "tawabi.nasb", "tawabi.singular", "tawabi.fatha"]
  },
  {
    id: "tw-27",
    sentence: "استفسرتُ من المعلمِ أو المديرِ.",
    target: "المديرِ",
    facts: {
      ...base,
      relationKind: "coordination",
      tawabiTerm: "atf",
      connector: "أو",
      case: "jarr",
      shape: "singular",
      mark: "kasra",
      matbu3: "المعلمِ",
      matbu3Role: "اسم مجرور بمن",
      relationReason: "لأن أو عطفت المدير على المعلم، فشاركَه في الجر بحرف الجر.",
      finalI3rab: makeFinal("المديرِ", "atf", "jarr", "kasra", "المعلمِ", "اسم مجرور بمن", "لأن المدير معطوف على المعلم بحرف أو، فتبعه في الجر.", "singular", "أو: حرف عطف لا محل له من الإعراب.")
    },
    covers: ["tawabi.atf", "tawabi.jarr", "tawabi.singular", "tawabi.kasra"]
  },
  {
    id: "tw-28",
    sentence: "حضرَ الطالبانِ والمعلمانِ.",
    target: "المعلمانِ",
    facts: {
      ...base,
      relationKind: "coordination",
      tawabiTerm: "atf",
      connector: "الواو",
      case: "raf3",
      shape: "dual",
      mark: "alif",
      matbu3: "الطالبانِ",
      matbu3Role: "فاعل مرفوع بالألف لأنه مثنى",
      relationReason: "لأن الواو عطفت المعلمين على الطالبين، فشاركاهما في حكم الحضور.",
      finalI3rab: makeFinal("المعلمانِ", "atf", "raf3", "alif", "الطالبانِ", "فاعل مرفوع بالألف لأنه مثنى", "لأن المعلمين شاركا الطالبين في حكم الحضور بواسطة الواو.", "dual", "الواو: حرف عطف لا محل له من الإعراب.")
    },
    covers: ["tawabi.atf", "tawabi.raf3", "tawabi.dual", "tawabi.alif"]
  },
  {
    id: "tw-29",
    sentence: "نجحَ الفريقُ كلُّهُ.",
    target: "كلُّهُ",
    facts: {
      ...base,
      relationKind: "emphasis",
      tawabiTerm: "tawkid",
      tawkidKind: "manawi",
      case: "raf3",
      shape: "singular",
      mark: "damma",
      matbu3: "الفريقُ",
      matbu3Role: "فاعل مرفوع",
      relationReason: "لأن كلَّه أكدت شمول النجاح لجميع أفراد الفريق، ولم تضف وصفًا جديدًا.",
      finalI3rab: makeTawkidFinal("كلُّهُ", "manawi", "raf3", "damma", "الفريقُ", "فاعل مرفوع", "لأن كلَّه أكدت أن النجاح شمل الفريق كاملًا.", "singular", "الهاء: ضمير متصل مبني في محل جر مضاف إليه يعود على المؤكَّد.")
    },
    covers: ["tawabi.tawkid", "tawabi.tawkid_manawi", "tawabi.raf3", "tawabi.singular", "tawabi.damma"]
  },
  {
    id: "tw-30",
    sentence: "حضرَ الطالبانِ كلاهما.",
    target: "كلاهما",
    facts: {
      ...base,
      relationKind: "emphasis",
      tawabiTerm: "tawkid",
      tawkidKind: "manawi",
      case: "raf3",
      shape: "dual",
      mark: "alif",
      matbu3: "الطالبانِ",
      matbu3Role: "فاعل مرفوع بالألف لأنه مثنى",
      relationReason: "لأن كلاهما أكدت حضور الطالبين معًا، واتصلت بضمير يعود عليهما.",
      finalI3rab: makeTawkidFinal("كلاهما", "manawi", "raf3", "alif", "الطالبانِ", "فاعل مرفوع بالألف لأنه مثنى", "لأن كلاهما أكدت شمول الحضور للطالبين.", "dual", "كلا ملحقة بالمثنى إذا أضيفت إلى ضمير، وهنا مرفوعة بالألف.")
    },
    covers: ["tawabi.tawkid", "tawabi.tawkid_manawi", "tawabi.raf3", "tawabi.dual", "tawabi.alif"]
  },
  {
    id: "tw-31",
    sentence: "سلّمتُ على الطالبتينِ كلتيهما.",
    target: "كلتيهما",
    facts: {
      ...base,
      relationKind: "emphasis",
      tawabiTerm: "tawkid",
      tawkidKind: "manawi",
      case: "jarr",
      shape: "dual",
      mark: "yaa",
      matbu3: "الطالبتينِ",
      matbu3Role: "اسم مجرور بعلى وعلامة جره الياء لأنه مثنى",
      relationReason: "لأن كلتيهما أكدت أن السلام وقع على الطالبتين معًا.",
      finalI3rab: makeTawkidFinal("كلتيهما", "manawi", "jarr", "yaa", "الطالبتينِ", "اسم مجرور بعلى وعلامة جره الياء لأنه مثنى", "لأن كلتيهما أكدت شمول السلام للطالبتين.", "dual", "كلتا ملحقة بالمثنى إذا أضيفت إلى ضمير، وهنا مجرورة بالياء.")
    },
    covers: ["tawabi.tawkid", "tawabi.tawkid_manawi", "tawabi.jarr", "tawabi.dual", "tawabi.yaa"]
  },
  {
    id: "tw-32",
    sentence: "حضرَ المعلمُ سامرٌ.",
    target: "سامرٌ",
    facts: {
      ...base,
      relationKind: "substitution",
      tawabiTerm: "badal",
      badalKind: "مطابق",
      case: "raf3",
      shape: "singular",
      mark: "damma",
      matbu3: "المعلمُ",
      matbu3Role: "فاعل مرفوع",
      relationReason: "لأن سامرًا هو المعلم المقصود نفسه، ويصح أن نقول: حضرَ سامرٌ.",
      finalI3rab: makeFinal("سامرٌ", "badal", "raf3", "damma", "المعلمُ", "فاعل مرفوع", "لأن سامرًا يوضح المعلم المقصود ويمكن أن يحل محله.", "singular", "نوع البدل: بدل مطابق.")
    },
    covers: ["tawabi.badal", "tawabi.raf3", "tawabi.singular", "tawabi.damma"]
  },
  {
    id: "tw-33",
    sentence: "أكلتُ الرغيفَ نصفَهُ.",
    target: "نصفَهُ",
    facts: {
      ...base,
      relationKind: "substitution",
      tawabiTerm: "badal",
      badalKind: "بعض من كل",
      case: "nasb",
      shape: "singular",
      mark: "fatha",
      matbu3: "الرغيفَ",
      matbu3Role: "مفعول به منصوب",
      relationReason: "لأن النصف جزء حقيقي من الرغيف، والهاء تعود على المبدل منه.",
      finalI3rab: makeFinal("نصفَهُ", "badal", "nasb", "fatha", "الرغيفَ", "مفعول به منصوب", "لأن النصف جزء من الرغيف، وفيه ضمير يعود على المبدل منه.", "singular", "نوع البدل: بدل بعض من كل. الهاء: ضمير متصل مبني في محل جر مضاف إليه.")
    },
    covers: ["tawabi.badal", "tawabi.nasb", "tawabi.singular", "tawabi.fatha"]
  },
  {
    id: "tw-34",
    sentence: "قرأتُ الكتابَ صفحاتِهِ.",
    target: "صفحاتِهِ",
    facts: {
      ...base,
      relationKind: "substitution",
      tawabiTerm: "badal",
      badalKind: "بعض من كل",
      case: "nasb",
      shape: "jfs",
      mark: "kasra",
      matbu3: "الكتابَ",
      matbu3Role: "مفعول به منصوب",
      relationReason: "لأن الصفحات أجزاء حقيقية من الكتاب، والهاء تعود على المبدل منه.",
      finalI3rab: makeFinal("صفحاتِهِ", "badal", "nasb", "kasra", "الكتابَ", "مفعول به منصوب", "لأن الصفحات جزء من الكتاب، وفيها ضمير يعود عليه.", "jfs", "نوع البدل: بدل بعض من كل. الهاء: ضمير متصل مبني في محل جر مضاف إليه.")
    },
    covers: ["tawabi.badal", "tawabi.nasb", "tawabi.jfs", "tawabi.kasra"]
  },
  {
    id: "tw-35",
    sentence: "أعجبني الشاعرُ أسلوبُهُ.",
    target: "أسلوبُهُ",
    facts: {
      ...base,
      relationKind: "substitution",
      tawabiTerm: "badal",
      badalKind: "اشتمال",
      case: "raf3",
      shape: "singular",
      mark: "damma",
      matbu3: "الشاعرُ",
      matbu3Role: "فاعل مرفوع",
      relationReason: "لأن الأسلوب معنى يشتمل عليه الشاعر وليس جزءًا ماديًا منه، والهاء تعود عليه.",
      finalI3rab: makeFinal("أسلوبُهُ", "badal", "raf3", "damma", "الشاعرُ", "فاعل مرفوع", "لأن الأسلوب معنى من معاني الشاعر، وفيه ضمير يعود على المبدل منه.", "singular", "نوع البدل: بدل اشتمال.")
    },
    covers: ["tawabi.badal", "tawabi.raf3", "tawabi.singular", "tawabi.damma"]
  },
  {
    id: "tw-36",
    sentence: "أحببتُ المدينةَ هواءَها.",
    target: "هواءَها",
    facts: {
      ...base,
      relationKind: "substitution",
      tawabiTerm: "badal",
      badalKind: "اشتمال",
      case: "nasb",
      shape: "singular",
      mark: "fatha",
      matbu3: "المدينةَ",
      matbu3Role: "مفعول به منصوب",
      relationReason: "لأن الهواء معنى تشتمل عليه المدينة وليس جزءًا محددًا منها، والضمير يعود عليها.",
      finalI3rab: makeFinal("هواءَها", "badal", "nasb", "fatha", "المدينةَ", "مفعول به منصوب", "لأن الهواء مما تشتمل عليه المدينة، وفيه ضمير يعود على المبدل منه.", "singular", "نوع البدل: بدل اشتمال.")
    },
    covers: ["tawabi.badal", "tawabi.nasb", "tawabi.singular", "tawabi.fatha"]
  },
  {
    id: "tw-37",
    sentence: "استفدتُ من الكتابِ أفكارِهِ.",
    target: "أفكارِهِ",
    facts: {
      ...base,
      relationKind: "substitution",
      tawabiTerm: "badal",
      badalKind: "اشتمال",
      case: "jarr",
      shape: "jt",
      mark: "kasra",
      matbu3: "الكتابِ",
      matbu3Role: "اسم مجرور بمن",
      relationReason: "لأن الأفكار معانٍ يشتمل عليها الكتاب، والهاء تعود على المبدل منه.",
      finalI3rab: makeFinal("أفكارِهِ", "badal", "jarr", "kasra", "الكتابِ", "اسم مجرور بمن", "لأن الأفكار مما يشتمل عليه الكتاب، وفيها ضمير يعود عليه.", "jt", "نوع البدل: بدل اشتمال.")
    },
    covers: ["tawabi.badal", "tawabi.jarr", "tawabi.jt", "tawabi.kasra"]
  }

];

function requireFinalI3rab(ex: Example): string {
  const value = ex.facts.finalI3rab;
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`المثال ${ex.id} لا يحتوي إعرابًا نهائيًا صالحًا.`);
  }
  return value;
}

const resultByCover: Record<string, string> = Object.fromEntries(
  tawabiExamples.map((ex) => [ex.id, requireFinalI3rab(ex).split("\n")[0] || ""])
);
const allResults = Array.from(new Set(Object.values(resultByCover)));

export const tawabiQuizExamples = tawabiExamples.map((ex, i) => {
  const correct = resultByCover[ex.id];
  const options = Array.from(new Set([correct, ...allResults.slice(i % allResults.length), ...allResults])).slice(0, 4);
  if (!options.includes(correct)) options[0] = correct;
  return {
    ...ex,
    prompt: "ما الإعراب الصحيح للتابع المحدد؟",
    options,
    correctI3rab: correct,
    whyCorrect: "بدأنا بالسؤال: هل الكلمة ترجع إلى اسم قبلها؟ ثم حددنا العلاقة، ثم المتبوع، ثم نقلنا الحالة الإعرابية، ثم اخترنا الصورة والعلامة أو المحل.",
    optionReasons: Object.fromEntries(options.map((o) => [
      o,
      o === correct
        ? "صحيح؛ هذه الصياغة وافقت العلاقة بالمتبوع وحالته وصورة التابع."
        : "خطأ؛ لا تبدأ بالعلامة. راجع: هل العلاقة نعت أو عطف أو توكيد أو بدل؟ ثم أعرب المتبوع وانقل حالته إلى التابع."
    ]))
  };
});

function examplesByTerm(term: string) {
  return tawabiExamples.filter((ex) => ex.facts?.tawabiTerm === term);
}

function quizExamplesByTerm(term: string) {
  return tawabiQuizExamples.filter((ex) => ex.facts?.tawabiTerm === term);
}

function coverageKeysForExamples(examples: Example[]) {
  const covered = new Set(examples.flatMap((ex) => ex.covers || []));
  return tawabiCoverageKeysOrdered.filter((key) => covered.has(key));
}

export const tawabiNaatExamples = examplesByTerm("naat");
export const tawabiAtfExamples = examplesByTerm("atf");
export const tawabiTawkidExamples = examplesByTerm("tawkid");
export const tawabiBadalExamples = examplesByTerm("badal");

export const tawabiNaatCoverageKeysOrdered = coverageKeysForExamples(tawabiNaatExamples);
export const tawabiAtfCoverageKeysOrdered = coverageKeysForExamples(tawabiAtfExamples);
export const tawabiTawkidCoverageKeysOrdered = coverageKeysForExamples(tawabiTawkidExamples);
export const tawabiBadalCoverageKeysOrdered = coverageKeysForExamples(tawabiBadalExamples);

export const tawabiNaatQuizExamples = quizExamplesByTerm("naat");
export const tawabiAtfQuizExamples = quizExamplesByTerm("atf");
export const tawabiTawkidQuizExamples = quizExamplesByTerm("tawkid");
export const tawabiBadalQuizExamples = quizExamplesByTerm("badal");
