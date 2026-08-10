import { requireCoverageResult, requirePrimaryCoverage } from "./exampleCoverage";
export type Example = { id: string; sentence: string; target: string; facts: Record<string, unknown>; covers: string[]; followUp?: unknown };

export const faelCoverageKeysOrdered = [
  "fael.singular",
  "fael.dual",
  "fael.jms",
  "fael.jfs",
  "fael.jt",
  "fael.five",
  "fael.ishara",
  "fael.mawsool",
  "fael.connected_taa",
  "fael.connected_na",
  "fael.connected_niswa",
  "fael.connected_alif2",
  "fael.connected_waw",
  "fael.connected_yaa",
  "fael.hidden_huwa",
  "fael.hidden_hiya",
  "fael.hidden_ana",
  "fael.hidden_nahnu",
  "fael.hidden_anta",
  "fael.masdar_an",
  "fael.masdar_ma"
];

const verbal = { contextType: "verbal" };
const nominal = { contextType: "nominal_with_verb", roleKind: "hidden" };
const nominalConnected = { contextType: "nominal_connected" };
const verbalHidden = { contextType: "verbal_hidden", roleKind: "hidden" };

export const faelExamples: Example[] = [
  {
    id: "fa-01",
    sentence: "كتبَ الطالبُ الواجبَ.",
    target: "الطالبُ",
    facts: { ...verbal, roleKind: "visible", shape: "singular", raf3Mark: "damma", finalI3rab: `الطالبُ: فاعل مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.
والعامل في رفعه الفعل الوارد في الجملة: كتبَ.
سبب الاختيار: لأن الطالب هو الذي قام بفعل الكتابة.` },
    covers: ["fael.singular"]
  },
  {
    id: "fa-02",
    sentence: "حضرَ الوالدانِ الاجتماعَ.",
    target: "الوالدانِ",
    facts: { ...verbal, roleKind: "visible", shape: "dual", raf3Mark: "alif", finalI3rab: `الوالدانِ: فاعل مرفوع، وعلامة رفعه الألف لأنه مثنى.
والعامل في رفعه الفعل الوارد في الجملة: حضرَ.
سبب الاختيار: لأن الوالدين هما اللذان قاما بالحضور.` },
    covers: ["fael.dual"]
  },
  {
    id: "fa-03",
    sentence: "ساعدَ المعلمونَ الطلابَ.",
    target: "المعلمونَ",
    facts: { ...verbal, roleKind: "visible", shape: "jms", raf3Mark: "waw", finalI3rab: `المعلمونَ: فاعل مرفوع، وعلامة رفعه الواو لأنه جمع مذكر سالم.
والعامل في رفعه الفعل الوارد في الجملة: ساعدَ.
سبب الاختيار: لأن المعلمين هم الذين قاموا بالمساعدة.` },
    covers: ["fael.jms"]
  },
  {
    id: "fa-04",
    sentence: "رتَّبتِ الطالباتُ الصفَّ.",
    target: "الطالباتُ",
    facts: { ...verbal, roleKind: "visible", shape: "jfs", raf3Mark: "damma", finalI3rab: `الطالباتُ: فاعل مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.
والعامل في رفعه الفعل الوارد في الجملة: رتبتِ.
سبب الاختيار: لأن الطالبات هن اللواتي قمن بالترتيب.` },
    covers: ["fael.jfs"]
  },
  {
    id: "fa-05",
    sentence: "لعبَ الأطفالُ في الحديقة.",
    target: "الأطفالُ",
    facts: { ...verbal, roleKind: "visible", shape: "jt", raf3Mark: "damma", finalI3rab: `الأطفالُ: فاعل مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.
والعامل في رفعه الفعل الوارد في الجملة: لعبَ.
سبب الاختيار: لأن الأطفال هم الذين قاموا باللعب.` },
    covers: ["fael.jt"]
  },
  {
    id: "fa-06",
    sentence: "عادَ أبوكَ من العمل.",
    target: "أبوكَ",
    facts: { ...verbal, roleKind: "visible", shape: "five", raf3Mark: "waw", fiveNoun: true, finalI3rab: `أبوك: فاعل مرفوع، وعلامة رفعه الواو لأنه من الأسماء الخمسة، وقد تحققت شروط إعرابها بالحروف: مفردة، مضافة، ومضافة إلى غير ياء المتكلم.
والكاف: ضمير متصل مبني في محل جر مضاف إليه.
والعامل في رفعه الفعل الوارد في الجملة: عادَ.` },
    covers: ["fael.five"]
  },
  {
    id: "fa-07",
    sentence: "جاءَ هذا مبكرًا.",
    target: "هذا",
    facts: { ...verbal, roleKind: "mabni", mabniType: "ishara", finalI3rab: `هذا: اسم إشارة مبني في محل رفع فاعل.
والعامل في محل رفعه الفعل الوارد في الجملة: جاءَ.
سبب الاختيار: لأن اسم الإشارة دل على من قام بالمجيء.` },
    covers: ["fael.ishara"]
  },
  {
    id: "fa-08",
    sentence: "نجحَ الذي اجتهدَ.",
    target: "الذي",
    facts: { ...verbal, roleKind: "mabni", mabniType: "mawsool", finalI3rab: `الذي: اسم موصول مبني في محل رفع فاعل.
وجملة اجتهدَ صلة الموصول لا محل لها من الإعراب.
والعامل في محل رفعه الفعل الوارد في الجملة: نجحَ.` },
    covers: ["fael.mawsool"]
  },
  {
    id: "fa-10",
    sentence: "فهمتُ الدرسَ.",
    target: "التاء في (فهمتُ)",
    facts: { ...verbal, roleKind: "connected", mabniType: "connected", connectedType: "taa", pronounMeaning: "أنا", actionQuestion: "من الذي فهم؟", finalI3rab: `التاء: ضمير متصل مبني في محل رفع فاعل.
والعامل في محل رفعه الفعل الوارد في الجملة: فهمتُ.
سبب الاختيار: لأن التاء دلت على من قام بالفعل، والمعنى: أنا فهمتُ.` },
    covers: ["fael.connected_taa"]
  },
  {
    id: "fa-11",
    sentence: "حفظنا القصيدةَ.",
    target: "نا في (حفظنا)",
    facts: { ...verbal, roleKind: "connected", mabniType: "connected", connectedType: "na", pronounMeaning: "نحن", actionQuestion: "من الذين حفظوا؟", finalI3rab: `نا: ضمير متصل مبني في محل رفع فاعل.
والعامل في محل رفعه الفعل الوارد في الجملة: حفظْنا.
سبب الاختيار: لأن نا دلت على من قام بالفعل، والمعنى: نحن حفظنا.
تنبيه: في حفظْنا سكن آخر الفعل الماضي لاتصاله بضمير رفع متحرك. أما في حفظَنا اللهُ أو شكرَنا المديرُ فـ(نا) مفعول به، ولا تؤثر في بناء الفعل الماضي؛ فيبقى مبنيًا على الفتح قبلها.` },
    covers: ["fael.connected_na"]
  },
  {
    id: "fa-12",
    sentence: "الممرضاتُ حضرنَ مبكرًا.",
    target: "نون النسوة في (حضرنَ)",
    facts: { ...nominalConnected, roleKind: "connected", mabniType: "connected", connectedType: "niswa", nominalSubject: "الممرضات", verbalKhabar: "حضرنَ مبكرًا", pronounMeaning: "هن", actionQuestion: "من اللاتي حضرن؟", finalI3rab: `نون النسوة: ضمير متصل مبني على الفتح في محل رفع فاعل.
والعامل في محل رفعه الفعل الوارد في الجملة: حضرنَ.
سبب الاختيار: لأن نون النسوة دلت على جماعة الإناث اللواتي قمن بالحضور.
وجملة (حضرنَ مبكرًا) جملة فعلية في محل رفع خبر للمبتدأ الممرضاتُ.` },
    covers: ["fael.connected_niswa"]
  },
  {
    id: "fa-13",
    sentence: "المهندسانِ وصلا إلى الموقعِ.",
    target: "ألف الاثنين في (وصلا)",
    facts: { ...nominalConnected, roleKind: "connected", mabniType: "connected", connectedType: "alif2", nominalSubject: "المهندسان", verbalKhabar: "وصلا إلى الموقعِ", pronounMeaning: "هما", actionQuestion: "من اللذان وصلا؟", finalI3rab: `ألف الاثنين: ضمير متصل مبني في محل رفع فاعل.
والعامل في محل رفعه الفعل الوارد في الجملة: وصلا.
سبب الاختيار: لأن ألف الاثنين دلت على الاثنين اللذين قاما بالوصول.
وجملة (وصلا إلى الموقعِ) جملة فعلية في محل رفع خبر للمبتدأ المهندسانِ.` },
    covers: ["fael.connected_alif2"]
  },
  {
    id: "fa-14",
    sentence: "المعلمونَ شرحوا الدرسَ.",
    target: "واو الجماعة في (شرحوا)",
    facts: { ...nominalConnected, roleKind: "connected", mabniType: "connected", connectedType: "waw", nominalSubject: "المعلمون", verbalKhabar: "شرحوا الدرسَ", pronounMeaning: "هم", actionQuestion: "من الذين شرحوا؟", finalI3rab: `واو الجماعة: ضمير متصل مبني في محل رفع فاعل.
والعامل في محل رفعه الفعل الوارد في الجملة: شرحوا.
سبب الاختيار: لأن واو الجماعة دلت على الجماعة الذين قاموا بالشرح.
الألف بعد الواو في شرحوا ألف فارقة لا محل لها من الإعراب.
وجملة (شرحوا الدرسَ) جملة فعلية في محل رفع خبر للمبتدأ المعلمونَ.` },
    covers: ["fael.connected_waw"]
  },
  {
    id: "fa-15",
    sentence: "اكتبي الدرسَ.",
    target: "ياء المخاطبة في (اكتبي)",
    facts: { ...verbal, roleKind: "connected", mabniType: "connected", connectedType: "yaa", pronounMeaning: "أنتِ", actionQuestion: "من المخاطبة بالكتابة؟", finalI3rab: `ياء المخاطبة: ضمير متصل مبني في محل رفع فاعل.
والعامل في محل رفعه فعل الأمر الوارد في الجملة: اكتبي.
سبب الاختيار: لأن ياء المخاطبة دلت على المخاطبة التي طُلب منها فعل الكتابة.` },
    covers: ["fael.connected_yaa"]
  },
  {
    id: "fa-16",
    sentence: "محمدٌ يقرأُ الدرسَ.",
    target: "يقرأُ",
    facts: { ...nominal, hiddenPronoun: "هو", nominalSubject: "محمد", verbalKhabar: "يقرأُ الدرسَ", actionQuestion: "من الذي يقرأ؟", finalI3rab: `يقرأُ: فعل مضارع مرفوع، وعلامة رفعه الضمة الظاهرة.
والفاعل: ضمير مستتر تقديره هو يعود على محمد.
تنبيه: محمدٌ ليس فاعلًا هنا؛ لأنه جاء قبل الفعل، بل هو مبتدأ.
وجملة يقرأُ الدرسَ في محل رفع خبر للمبتدأ محمدٌ.` },
    covers: ["fael.hidden_huwa"]
  },
  {
    id: "fa-17",
    sentence: "فاطمةُ تكتبُ الواجبَ.",
    target: "تكتبُ",
    facts: { ...nominal, hiddenPronoun: "هي", nominalSubject: "فاطمة", verbalKhabar: "تكتبُ الواجبَ", actionQuestion: "من التي تكتب؟", pastConversion: "فاطمةُ كتبتْ الواجبَ", finalI3rab: `تكتبُ: فعل مضارع مرفوع، وعلامة رفعه الضمة الظاهرة.
والفاعل: ضمير مستتر تقديره هي يعود على فاطمة.
تنبيه: فاطمةُ مبتدأ، وليست فاعلًا؛ لأن الفاعل لا يتقدم على الفعل.
وجملة تكتبُ الواجبَ في محل رفع خبر للمبتدأ فاطمةُ.` },
    covers: ["fael.hidden_hiya"]
  },
  {
    id: "fa-18",
    sentence: "أقرأُ الدرسَ الآن.",
    target: "أقرأُ",
    facts: { ...verbalHidden, hiddenPronoun: "أنا", finalI3rab: `أقرأُ: فعل مضارع مرفوع، وعلامة رفعه الضمة الظاهرة.
والفاعل: ضمير مستتر تقديره أنا.
سبب الاختيار: لأن الفعل بدأ بالهمزة الدالة على المتكلم.` },
    covers: ["fael.hidden_ana"]
  },

  {
    id: "fa-18b",
    sentence: "نساعدُ المحتاجينَ.",
    target: "نساعدُ",
    facts: { ...verbalHidden, hiddenPronoun: "نحن", actionQuestion: "من الذين يساعدون؟", finalI3rab: `نساعدُ: فعل مضارع مرفوع، وعلامة رفعه الضمة الظاهرة.
والفاعل: ضمير مستتر تقديره نحن.
سبب الاختيار: لأن الفعل بدأ بالنون الدالة على المتكلمين.` },
    covers: ["fael.hidden_nahnu"]
  },
  {
    id: "fa-19",
    sentence: "اقرأْ الصفحةَ.",
    target: "اقرأْ",
    facts: { ...verbalHidden, hiddenPronoun: "أنت", finalI3rab: `اقرأْ: فعل أمر مبني على السكون.
والفاعل: ضمير مستتر وجوبًا تقديره أنت.
سبب الاختيار: لأن فعل الأمر موجّه إلى مخاطب، ولم يظهر بعده فاعل.` },
    covers: ["fael.hidden_anta"]
  },
  {
    id: "fa-20",
    sentence: "يسرُّني أن تنجحَ.",
    target: "أن تنجحَ",
    facts: { ...verbal, roleKind: "masdar", finalI3rab: `أن تنجحَ: مصدر مؤول في محل رفع فاعل.
والتقدير: يسرُّني نجاحُك.
سبب الاختيار: لأن الذي سرّني هو نجاحك، لا كلمة مفردة ظاهرة.` },
    covers: ["fael.masdar_an"]
  },
  {
    id: "fa-21",
    sentence: "أعجبني ما فعلتَ.",
    target: "ما فعلتَ",
    facts: { ...verbal, roleKind: "masdar", finalI3rab: `ما فعلتَ: مصدر مؤول في محل رفع فاعل.
والتقدير: أعجبني فعلُك.
سبب الاختيار: لأن الذي أعجبني هو فعلك.` },
    covers: ["fael.masdar_ma"]
  }
];

function faelQuizAnswer(ex: Example) {
  const lines = String(ex.facts.finalI3rab || "").split("\n").map((line) => line.trim()).filter(Boolean);
  if (ex.facts.roleKind === "hidden") {
    const hiddenLine = lines.find((line) => line.includes("الفاعل:") && line.includes("ضمير مستتر"));
    return String(hiddenLine || "").replace(/^و/, "");
  }
  return lines[0] || "";
}

const resultByCover: Record<string, string> = Object.fromEntries(
  faelExamples.map((ex) => [requirePrimaryCoverage(ex), faelQuizAnswer(ex)])
);

const allResults = Array.from(new Set(Object.values(resultByCover).filter(Boolean)));
const hiddenResults = Array.from(new Set(
  faelExamples.filter((example) => example.facts.roleKind === "hidden").map(faelQuizAnswer).filter(Boolean)
));

export const faelQuizExamples = faelExamples.map((ex, i) => {
  const correct = requireCoverageResult(resultByCover, ex);
  const hidden = ex.facts.roleKind === "hidden";
  const resultPool = hidden ? hiddenResults : allResults;
  const options = Array.from(new Set([correct, ...resultPool.slice(i % resultPool.length), ...resultPool])).filter(Boolean).slice(0, 4);
  if (!options.includes(correct)) options[0] = correct;
  return {
    ...ex,
    prompt: hidden
      ? "ما تقدير الفاعل المستتر في الفعل المحدد، وما إعرابه؟"
      : "ما الإعراب الصحيح للفاعل المحدد؟",
    options,
    correctI3rab: correct,
    whyCorrect: hidden
      ? "بحثنا عمّن قام بالفعل، فلم نجد فاعلًا ظاهرًا أو ضميرًا متصلًا؛ لذلك قدّرنا الضمير المستتر المناسب للمتكلم أو المخاطب أو الغائب."
      : "حدّدنا الفاعل أولًا، ثم طبقنا حكم الرفع أو محل الرفع حسب صورته.",
    optionReasons: Object.fromEntries(options.map((o) => [
      o,
      o === correct
        ? hidden ? "صحيح؛ هذا هو الضمير المستتر الذي يدل عليه الفعل والسياق." : "صحيح؛ هذه الصياغة توافق صورة الفاعل."
        : "خطأ؛ راجع نوع الفاعل: معرب، مبني، ضمير متصل، ضمير مستتر، أو مصدر مؤول."
    ]))
  };
});
