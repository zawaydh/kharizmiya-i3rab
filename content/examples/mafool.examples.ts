export type Example = { id: string; sentence: string; target: string; facts: Record<string, any>; covers: string[]; followUp?: any };

export const mafoolCoverageKeysOrdered = [
  "mafool.singular",
  "mafool.dual",
  "mafool.jms",
  "mafool.jfs",
  "mafool.jt",
  "mafool.five",
  "mafool.ishara",
  "mafool.mawsool",
  "mafool.connected_haa",
  "mafool.connected_yaa",
  "mafool.connected_na",
  "mafool.masdar_an",
  "mafool.masdar_arju",
  "mafool.masdar_ma"
];

const verbal = { contextType: "verbal" };
const fiveConditions = "مفردة، مضافة، ومضافة إلى غير ياء المتكلم";

export const mafoolExamples: Example[] = [
  {
    id: "mf-01",
    sentence: "كتبَ الطالبُ الواجبَ.",
    target: "الواجبَ",
    facts: {
      ...verbal,
      roleKind: "visible",
      shape: "singular",
      nasbMark: "fatha",
      objectQuestion: "ماذا كتب الطالب؟",
      actor: "الطالبُ",
      finalI3rab: `الواجبَ: مفعول به منصوب، وعلامة نصبه الفتحة الظاهرة على آخره.\nوالعامل في نصبه الفعل الوارد في الجملة: كتبَ.\nسبب الاختيار: لأن الواجب هو الشيء الذي وقع عليه فعل الكتابة.`
    },
    covers: ["mafool.singular"]
  },
  {
    id: "mf-02",
    sentence: "رأيتُ الطالبينِ.",
    target: "الطالبينِ",
    facts: {
      ...verbal,
      roleKind: "visible",
      shape: "dual",
      nasbMark: "yaa",
      objectQuestion: "من رأيت؟",
      actor: "تاء الفاعل في رأيتُ",
      finalI3rab: `الطالبينِ: مفعول به منصوب، وعلامة نصبه الياء لأنه مثنى.\nوالعامل في نصبه الفعل الوارد في الجملة: رأيتُ.\nسبب الاختيار: لأن الطالبين هما من وقع عليهما فعل الرؤية.`
    },
    covers: ["mafool.dual"]
  },
  {
    id: "mf-03",
    sentence: "كرّمَ المديرُ المعلمينَ.",
    target: "المعلمينَ",
    facts: {
      ...verbal,
      roleKind: "visible",
      shape: "jms",
      nasbMark: "yaa",
      objectQuestion: "من كرّم المدير؟",
      actor: "المديرُ",
      finalI3rab: `المعلمينَ: مفعول به منصوب، وعلامة نصبه الياء لأنه جمع مذكر سالم.\nوالعامل في نصبه الفعل الوارد في الجملة: كرّمَ.\nسبب الاختيار: لأن المعلمين وقع عليهم فعل التكريم.`
    },
    covers: ["mafool.jms"]
  },
  {
    id: "mf-04",
    sentence: "شكرَتِ المعلمةُ الطالباتِ.",
    target: "الطالباتِ",
    facts: {
      ...verbal,
      roleKind: "visible",
      shape: "jfs",
      nasbMark: "kasra",
      objectQuestion: "من شكرت المعلمة؟",
      actor: "المعلمةُ",
      finalI3rab: `الطالباتِ: مفعول به منصوب، وعلامة نصبه الكسرة نيابة عن الفتحة لأنه جمع مؤنث سالم.\nوالعامل في نصبه الفعل الوارد في الجملة: شكرَتِ.\nسبب الاختيار: لأن الطالبات وقع عليهن فعل الشكر.`
    },
    covers: ["mafool.jfs"]
  },
  {
    id: "mf-05",
    sentence: "قرأَ الطفلُ القصصَ.",
    target: "القصصَ",
    facts: {
      ...verbal,
      roleKind: "visible",
      shape: "jt",
      nasbMark: "fatha",
      objectQuestion: "ماذا قرأ الطفل؟",
      actor: "الطفلُ",
      finalI3rab: `القصصَ: مفعول به منصوب، وعلامة نصبه الفتحة الظاهرة على آخره.\nوالعامل في نصبه الفعل الوارد في الجملة: قرأَ.\nسبب الاختيار: لأن القصص وقع عليها فعل القراءة.`
    },
    covers: ["mafool.jt"]
  },
  {
    id: "mf-06",
    sentence: "رأيتُ أباكَ.",
    target: "أباكَ",
    facts: {
      ...verbal,
      roleKind: "visible",
      shape: "five",
      nasbMark: "alif",
      fiveNoun: true,
      objectQuestion: "من رأيت؟",
      actor: "تاء الفاعل في رأيتُ",
      finalI3rab: `أباكَ: مفعول به منصوب، وعلامة نصبه الألف لأنه من الأسماء الخمسة، وقد تحققت شروط إعرابها بالحروف: ${fiveConditions}.\nوالكاف: ضمير متصل مبني في محل جر مضاف إليه.\nوالعامل في نصبه الفعل الوارد في الجملة: رأيتُ.`
    },
    covers: ["mafool.five"]
  },
  {
    id: "mf-07",
    sentence: "رأيتُ هذا.",
    target: "هذا",
    facts: {
      ...verbal,
      roleKind: "mabni",
      mabniType: "ishara",
      objectQuestion: "ماذا رأيت؟",
      finalI3rab: `هذا: اسم إشارة مبني في محل نصب مفعول به.\nوالعامل في محل نصبه الفعل الوارد في الجملة: رأيتُ.\nسبب الاختيار: لأن اسم الإشارة دل على الشيء الذي وقع عليه فعل الرؤية.`
    },
    covers: ["mafool.ishara"]
  },
  {
    id: "mf-08",
    sentence: "ساعدتُ الذي احتاجَ إليَّ.",
    target: "الذي",
    facts: {
      ...verbal,
      roleKind: "mabni",
      mabniType: "mawsool",
      objectQuestion: "من ساعدت؟",
      finalI3rab: `الذي: اسم موصول مبني في محل نصب مفعول به.\nوجملة احتاجَ إليَّ صلة الموصول لا محل لها من الإعراب.\nوالعامل في محل نصبه الفعل الوارد في الجملة: ساعدتُ.`
    },
    covers: ["mafool.mawsool"]
  },
  {
    id: "mf-09",
    sentence: "كتبَهُ الطالبُ.",
    target: "الهاء في (كتبَهُ)",
    facts: {
      ...verbal,
      roleKind: "connected",
      mabniType: "connected",
      connectedType: "haa",
      pronounMeaning: "هو",
      objectQuestion: "ماذا كتب الطالب؟",
      actor: "الطالبُ",
      finalI3rab: `الهاء: ضمير متصل مبني في محل نصب مفعول به.\nوالعامل في محل نصبه الفعل الوارد في الجملة: كتبَهُ.\nسبب الاختيار: لأن الهاء دلت على الشيء الذي وقع عليه فعل الكتابة، أما الفاعل فهو الطالبُ.`
    },
    covers: ["mafool.connected_haa"]
  },
  {
    id: "mf-10",
    sentence: "ساعدَني المعلمُ.",
    target: "الياء في (ساعدَني)",
    facts: {
      ...verbal,
      roleKind: "connected",
      mabniType: "connected",
      connectedType: "yaa",
      pronounMeaning: "أنا",
      objectQuestion: "من ساعد المعلم؟",
      actor: "المعلمُ",
      finalI3rab: `الياء: ضمير متصل مبني في محل نصب مفعول به.\nوالعامل في محل نصبه الفعل الوارد في الجملة: ساعدَني.\nسبب الاختيار: لأن الياء دلت على من وقع عليه فعل المساعدة، أما الفاعل فهو المعلمُ.`
    },
    covers: ["mafool.connected_yaa"]
  },
  {
    id: "mf-11",
    sentence: "شكرَنا المديرُ.",
    target: "نا في (شكرَنا)",
    facts: {
      ...verbal,
      roleKind: "connected",
      mabniType: "connected",
      connectedType: "na",
      pronounMeaning: "نحن",
      objectQuestion: "من شكر المدير؟",
      actor: "المديرُ",
      finalI3rab: `نا: ضمير متصل مبني في محل نصب مفعول به.\nوالعامل في محل نصبه الفعل الوارد في الجملة: شكرَنا.\nسبب الاختيار: لأن نا دلت على من وقع عليهم فعل الشكر، أما الفاعل فهو المديرُ.\nتنبيه: لا نحكم على (نا) من شكلها فقط. في حفظْنا القصيدةَ تكون نا فاعلين، ويسكن آخر الفعل لاتصاله بضمير رفع. أما في شكرَنا المديرُ فهي نا المفعولين، ولا تؤثر في بناء الفعل؛ فيبقى مبنيًا على الفتح قبلها.`
    },
    covers: ["mafool.connected_na"]
  },
  {
    id: "mf-12",
    sentence: "أحببتُ أن تنجحَ.",
    target: "أن تنجحَ",
    facts: {
      ...verbal,
      roleKind: "masdar",
      objectQuestion: "ماذا أحببت؟",
      taweel: "نجاحَك",
      finalI3rab: `أن تنجحَ: مصدر مؤول في محل نصب مفعول به.\nوالتقدير: أحببتُ نجاحَك.\nسبب الاختيار: لأن الذي أحببته هو نجاحك، لا كلمة مفردة ظاهرة.`
    },
    covers: ["mafool.masdar_an"]
  },
  {
    id: "mf-13",
    sentence: "أرجو أن تفهمَ الدرسَ.",
    target: "أن تفهمَ الدرسَ",
    facts: {
      ...verbal,
      roleKind: "masdar",
      objectQuestion: "ماذا أرجو؟",
      taweel: "فهمَك الدرسَ",
      finalI3rab: `أن تفهمَ الدرسَ: مصدر مؤول في محل نصب مفعول به.\nوالتقدير: أرجو فهمَك الدرسَ.\nسبب الاختيار: لأن الشيء المرجو هو فهمك الدرس.`
    },
    covers: ["mafool.masdar_arju"]
  },
  {
    id: "mf-14",
    sentence: "كرهتُ ما فعلتَ.",
    target: "ما فعلتَ",
    facts: {
      ...verbal,
      roleKind: "masdar",
      objectQuestion: "ماذا كرهت؟",
      taweel: "فعلَك",
      finalI3rab: `ما فعلتَ: مصدر مؤول في محل نصب مفعول به.\nوالتقدير: كرهتُ فعلَك.\nسبب الاختيار: لأن الذي كرهته هو فعلك.`
    },
    covers: ["mafool.masdar_ma"]
  }
];

const resultByCover: Record<string, string> = Object.fromEntries(mafoolExamples.map((ex) => [ex.covers[0], ex.facts.finalI3rab.split("\n")[0]]));
const allResults = Array.from(new Set(Object.values(resultByCover)));

export const mafoolQuizExamples = mafoolExamples.map((ex, i) => {
  const correct = resultByCover[ex.covers[0]];
  const options = Array.from(new Set([correct, ...allResults.slice(i % allResults.length), ...allResults])).slice(0, 4);
  if (!options.includes(correct)) options[0] = correct;
  return {
    ...ex,
    prompt: "ما الإعراب الصحيح للمفعول به المحدد؟",
    options,
    correctI3rab: correct,
    whyCorrect: "حدّدنا المفعول به أولًا، ثم طبقنا حكم النصب أو محل النصب حسب صورته.",
    optionReasons: Object.fromEntries(options.map((o) => [o, o === correct ? "صحيح؛ هذه الصياغة توافق صورة المفعول به وعلامة نصبه أو محل نصبه." : "خطأ؛ راجع نوع المفعول به: اسم معرب، اسم مبني، ضمير متصل، أو مصدر مؤول."]))
  };
});
