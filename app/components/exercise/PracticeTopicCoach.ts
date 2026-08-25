import {
  practiceTargetUnit,
  type PracticeGuidance,
  type PracticeTargetUnit,
} from "../../../lib/exercise/practiceGrammarPolicy";

type Facts = Record<string, unknown>;

type CoachArgs = {
  topicId?: string;
  resultText: string;
  target: string;
  sentence?: string;
  facts?: Facts;
  wrongOption?: string;
};

function clean(value: unknown): string {
  return String(value ?? "")
    .normalize("NFKC")
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/gu, "")
    .replace(/\s+/gu, " ")
    .trim();
}

function empty(): PracticeGuidance {
  return { level1: [], level2: [], correction: [] };
}

function resultCase(text: string): "رفع" | "نصب" | "جر" | "جزم" | "" {
  const value = clean(text);
  if (/في محل رفع|مرفوع/u.test(value)) return "رفع";
  if (/في محل نصب|منصوب/u.test(value)) return "نصب";
  if (/في محل جر|مجرور/u.test(value)) return "جر";
  if (/في محل جزم|مجزوم/u.test(value)) return "جزم";
  return "";
}

function nominalShape(facts: Facts, text: string): string {
  const value = clean(text);
  const shape = String(facts.shape || facts.number || "");
  if (shape === "dual" || /مثنى/u.test(value)) return "مثنى";
  if (shape === "jms" || /جمع مذكر سالم/u.test(value)) return "جمع مذكر سالم";
  if (shape === "jfs" || /جمع مؤنث سالم/u.test(value)) return "جمع مؤنث سالم";
  if (shape === "five" || /الأسماء الخمسة/u.test(value)) return "من الأسماء الخمسة";
  if (/منقوص/u.test(value)) return "اسم منقوص";
  if (/مقصور/u.test(value)) return "اسم مقصور";
  if (shape === "singular") return "اسم مفرد";
  return "";
}

function structureOf(text: string): string {
  const value = clean(text);
  if (/شبه جملة من الجار والمجرور|جار ومجرور/u.test(value)) return "جار ومجرور، فهو شبه جملة";
  if (/شبه جملة ظرفية/u.test(value)) return "ظرف، فهو شبه جملة";
  if (/جملة اسمية/u.test(value)) return "جملة اسمية";
  if (/جملة فعلية/u.test(value)) return "جملة فعلية";
  return "";
}

function unitPhrase(unit: PracticeTargetUnit, target: string): string {
  const hasMultipleWords = target.trim().split(/\s+/u).length > 1;
  if (unit === "verbal-sentence") {
    return hasMultipleWords ? `الجملة الفعلية «${target}»` : `الجملة الفعلية التي تبدأ بـ«${target}»`;
  }
  if (unit === "nominal-sentence") {
    return hasMultipleWords ? `الجملة الاسمية «${target}»` : `الجملة الاسمية التي تبدأ بـ«${target}»`;
  }
  if (unit === "shibh-zarf") return `شبه الجملة الظرفية «${target}»`;
  if (unit === "shibh-jar") return `شبه الجملة «${target}»`;
  return `«${target}»`;
}

function unitKindLabel(unit: PracticeTargetUnit): string {
  if (unit === "verbal-sentence") return "جملة فعلية";
  if (unit === "nominal-sentence") return "جملة اسمية";
  if (unit === "shibh-zarf") return "شبه جملة ظرفية";
  if (unit === "shibh-jar") return "شبه جملة من جار ومجرور";
  return "كلمة";
}


function visibleToken(value: unknown): string {
  return String(value ?? "").replace(/[،؛.!؟?]+$/gu, "").trim();
}

function nextWordAfterTarget(sentence: string, target: string): string {
  const tokens = String(sentence || "")
    .split(/\s+/u)
    .map((item) => item.trim())
    .filter(Boolean);
  const targetKey = clean(target).replace(/[،؛.!؟?]+$/gu, "");

  const index = tokens.findIndex(
    (item) => clean(item).replace(/[،؛.!؟?]+$/gu, "") === targetKey,
  );
  if (index < 0 || index + 1 >= tokens.length) return "";
  return visibleToken(tokens[index + 1]);
}

function presentToolDescription(facts: Facts): {
  code: string;
  word: string;
  kind: "ناصب" | "جازم" | "";
  caseName: "نصب" | "جزم" | "رفع";
} {
  const code = String(facts.tool || "none");
  const word = visibleToken(facts.toolWord);
  if (code === "nasb") {
    return { code, word, kind: "ناصب", caseName: "نصب" };
  }
  if (code === "jazm") {
    return { code, word, kind: "جازم", caseName: "جزم" };
  }
  return { code, word, kind: "", caseName: "رفع" };
}

function pastRaf3PronounLabel(facts: Facts): string {
  const type = String(facts.raf3Type || "");
  if (type === "taa_fael") return "تاء الفاعل";
  if (type === "na_faelin") return "نا الفاعلين";
  if (type === "niswa") return "نون النسوة";
  if (type === "alif") return "ألف الاثنين";
  if (type === "waw") return "واو الجماعة";
  return "ضمير رفع";
}

function pastBaseObservation(target: string, facts: Facts): string {
  const base = visibleToken(facts.basePastHuwa);
  if (!base) return `بعد تحديد المتصل، ارجع إلى أصل «${target}» وافحص آخر الفعل.`;

  const baseClean = clean(base);
  if (/[ىا]$/u.test(baseClean)) {
    return `بعد فصل المتصل نعود إلى أصل الفعل «${base}»؛ آخره ألف لينة، فطبّق قاعدة بناء الماضي على هذا الأصل.`;
  }
  if (/ي$/u.test(baseClean)) {
    return `بعد فصل المتصل نعود إلى أصل الفعل «${base}»؛ آخره ياء، فطبّق قاعدة بناء الماضي على هذا الأصل.`;
  }
  if (/و$/u.test(baseClean)) {
    return `بعد فصل المتصل نعود إلى أصل الفعل «${base}»؛ آخره واو، فطبّق قاعدة بناء الماضي على هذا الأصل.`;
  }
  return `بعد فصل المتصل نعود إلى أصل الفعل «${base}»؛ آخره صحيح، فطبّق قاعدة بناء الماضي على هذا الأصل.`;
}

function firstWordCoach(
  target: string,
  facts: Facts,
  sentence: string,
  wrong: string,
): PracticeGuidance {
  const wordType = String(facts.wordType || "");
  const verbType = String(facts.verbType || "");
  const afterParticle = String(facts.afterParticle || "");
  const nextWord = nextWordAfterTarget(sentence, target);
  const wrongText = clean(wrong);

  const verbLabel =
    verbType === "present"
      ? "فعل مضارع"
      : verbType === "past"
        ? "فعل ماضٍ"
        : verbType === "imperative"
          ? "فعل أمر"
          : "فعل";

  if (wordType === "particle") {
    const afterLabel = afterParticle === "verb" ? "فعل" : afterParticle === "noun" ? "اسم" : "";
    const nextQuestion = nextWord
      ? `بعد «${target}» جاءت «${nextWord}»؛ هل هي اسم أم فعل؟`
      : `بعد «${target}» مباشرة: هل جاءت كلمة اسم أم فعل؟`;

    const correctionFirst = wrongText.includes("بعده فعل") && afterParticle === "noun"
      ? `اختيارك افترض أن بعد «${target}» فعلًا، لكن الكلمة التالية «${nextWord || "بعده"}» اسم.`
      : wrongText.includes("بعده اسم") && afterParticle === "verb"
        ? `اختيارك افترض أن بعد «${target}» اسمًا، لكن الكلمة التالية «${nextWord || "بعده"}» فعل.`
        : `«${target}» حرف؛ بقي أن تنظر إلى الكلمة التي جاءت بعده لتحدد اتجاه المسار.`;

    return {
      level1: [
        `انظر إلى «${target}» نفسها: هل تدل على اسم، أم فعل، أم حرف؟`,
        nextQuestion,
      ],
      level2: [
        `«${target}» حرف.`,
        afterLabel
          ? `جاء بعده ${nextWord ? `«${nextWord}» وهي ` : ""}${afterLabel}.`
          : "حدّد نوع الكلمة التي جاءت بعده.",
        "اختر المسار الذي يحافظ على هاتين المعلومتين معًا.",
      ],
      correction: [
        correctionFirst,
        afterLabel
          ? `إذن القرار المطلوب الآن: حرف وبعده ${afterLabel}.`
          : "حدّد نوع ما بعد الحرف قبل اختيار المسار.",
        "عد إلى السؤال واختر المسار الموافق.",
      ],
    };
  }

  if (wordType === "verb") {
    return {
      level1: [
        `انظر إلى «${target}» نفسها: هل تدل على اسم، أم فعل، أم حرف؟`,
        `بعد ثبوت أنها فعل: هل زمنها ماضٍ، أم مضارع، أم أنها تدل على طلب؟`,
      ],
      level2: [
        `«${target}» ${verbLabel}.`,
        "المطلوب هنا اختيار خوارزمية الفعل المناسبة، لا إعرابه النهائي بعد.",
      ],
      correction: [
        wrongText.includes("اسم") || wrongText.includes("حرف")
          ? `اختيارك غيّر نوع «${target}»، مع أنها تدل على حدث مقترن بزمن أو طلب؛ فهي فعل.`
          : `ثبت أن «${target}» ${verbLabel}.`,
        "اختر مسار الفعل الذي يوافق زمنه.",
      ],
    };
  }

  if (wordType === "noun") {
    return {
      level1: [`انظر إلى «${target}» نفسها: هل تدل على اسم، أم فعل، أم حرف؟`],
      level2: [
        `«${target}» اسم.`,
        "لا نُعرب الاسم هنا؛ المطلوب الانتقال إلى مسار الاسم لتحديد موقعه بعد ذلك.",
      ],
      correction: [
        wrongText.includes("فعل") || wrongText.includes("حرف")
          ? `اختيارك غيّر نوع «${target}»، بينما هي اسم في الجملة.`
          : `ثبت أن «${target}» اسم.`,
        "انتقل إلى مسار الاسم، ولا تقفز إلى إعرابه النهائي في هذه الخطوة.",
      ],
    };
  }

  return {
    level1: [`حدّد نوع «${target}» أولًا: اسم، أم فعل، أم حرف؟`],
    level2: [`بعد تحديد النوع، اختر المسار المطابق له.`],
    correction: [`ابدأ بنوع «${target}»؛ فهو الذي يحدد المسار التالي.`],
  };
}

function pastCoach(target: string, facts: Facts, wrong: string): PracticeGuidance {
  const connector = String(facts.connectorKind || "none");
  const weakDeleted = facts.weakDeleted === true;
  const attached = facts.hasAttached === true;
  const raf3Group = String(facts.raf3BuildGroup || "none");
  const connectorLabel =
    connector === "taa_tanith"
      ? "تاء التأنيث الساكنة"
      : connector === "raf3"
        ? pastRaf3PronounLabel(facts)
        : connector === "nasb"
          ? "ضمير نصب"
          : "";
  const wrongText = clean(wrong);
  const baseObservation = pastBaseObservation(target, facts);

  let level2: string[];
  let correction: string[];

  if (connector === "taa_tanith") {
    level2 = [
      `المتصل بـ«${target}» هو تاء التأنيث الساكنة.`,
      "تاء التأنيث ليست ضمير رفع متحركًا؛ لذلك لا تعاملها معاملة تاء الفاعل.",
      baseObservation,
    ];
    correction = [
      /السكون/u.test(wrongText)
        ? `اختيار السكون يعامل التاء في «${target}» كأنها تاء الفاعل، لكنها تاء التأنيث الساكنة.`
        : `التاء في «${target}» تاء التأنيث الساكنة، وليست ضمير رفع متحركًا.`,
      baseObservation,
      weakDeleted
        ? "انتبه إلى حرف العلة في أصل الفعل قبل اختيار صيغة البناء."
        : "عد إلى السؤال واختر البناء الذي يوافق هذه الحالة.",
    ];
  } else if (connector === "raf3" && raf3Group === "sukoon") {
    const pronoun = pastRaf3PronounLabel(facts);
    level2 = [
      `المتصل بـ«${target}» هو ${pronoun}، وهو من ضمائر الرفع المتحركة في هذا المسار.`,
      "هذا النوع من الاتصال هو الذي يحدد بناء الماضي؛ لا تبدأ من الحركة الظاهرة وحدها.",
    ];
    correction = [
      /الفتح|الضم/u.test(wrongText)
        ? `اختيارك تجاهل أثر ${pronoun} المتصل بـ«${target}».`
        : `ثبت أن المتصل بـ«${target}» هو ${pronoun}.`,
      "ميّز ضمير الرفع المتحرك من ألف الاثنين وواو الجماعة.",
      "عد واختر البناء الموافق لهذا الاتصال.",
    ];
  } else if (connector === "raf3" && raf3Group === "alif") {
    level2 = [
      `المتصل بـ«${target}» هو ألف الاثنين، وهي ضمير رفع يدل على فاعلين اثنين.`,
      "ألف الاثنين ليست ضمير رفع متحركًا، وليست واو الجماعة؛ فلا تنقل حكم إحداهما إليها.",
      baseObservation,
    ];
    correction = [
      /السكون/u.test(wrongText)
        ? `اختيار السكون عامل ألف الاثنين كأنها ضمير رفع متحرك؛ وهذا غير صحيح.`
        : /الضم/u.test(wrongText)
          ? `اختيار الضم عامل ألف الاثنين كأنها واو الجماعة؛ وهذا غير صحيح.`
          : `المتصل بـ«${target}» هو ألف الاثنين.`,
      "افصل بين حكم ألف الاثنين وحكم ضمائر الرفع المتحركة وواو الجماعة.",
      baseObservation,
    ];
  } else if (connector === "raf3" && raf3Group === "waw") {
    level2 = [
      `المتصل بـ«${target}» هو واو الجماعة، وهي ضمير رفع يدل على جماعة الفاعلين.`,
      "واو الجماعة لها حكم في بناء الماضي يختلف عن ألف الاثنين وعن ضمائر الرفع المتحركة.",
    ];
    correction = [
      /السكون/u.test(wrongText)
        ? `اختيار السكون عامل واو الجماعة كأنها ضمير رفع متحرك.`
        : /الفتح/u.test(wrongText)
          ? `اختيار الفتح تجاهل أثر واو الجماعة المتصلة بـ«${target}».`
          : `ثبت أن المتصل بـ«${target}» هو واو الجماعة.`,
      "طبّق حكم الماضي مع واو الجماعة، ثم عد إلى الخيارات.",
    ];
  } else if (connector === "nasb") {
    level2 = [
      `المتصل بـ«${target}» ضمير نصب؛ وقع عليه الفعل ولم يقم به.`,
      "ضمير النصب لا يُعامل كضمير رفع متحرك ولا كواو الجماعة.",
      baseObservation,
    ];
    correction = [
      /السكون/u.test(wrongText)
        ? `اختيار السكون يفترض ضمير رفع متحركًا، لكن المتصل بـ«${target}» ضمير نصب.`
        : /الضم/u.test(wrongText)
          ? `اختيار الضم يفترض واو الجماعة، لكن المتصل بـ«${target}» ضمير نصب.`
          : `الضمير المتصل بـ«${target}» ضمير نصب، لا ضمير رفع.`,
      baseObservation,
      "طبّق قاعدة بناء الماضي على أصل الفعل، ثم عد إلى السؤال.",
    ];
  } else {
    level2 = [
      `لم يتصل بـ«${target}» ما ينقله إلى حكم اتصال خاص.`,
      baseObservation,
    ];
    correction = [
      `«${target}» فعل ماضٍ${attached ? "؛ افحص نوع المتصل به بدقة" : " ولم يتصل به ضمير يغيّر مسار البناء"}.`,
      baseObservation,
    ];
  }

  return {
    level1: [
      `«${target}» فعل ماضٍ؛ ما الذي اتصل بآخره${attached ? "" : "، أم لم يتصل به شيء"}؟`,
      attached
        ? "بعد تحديد المتصل: هل هو تاء تأنيث، ضمير نصب، ضمير رفع متحرك، ألف الاثنين، أم واو الجماعة؟"
        : "بعد ذلك ارجع إلى أصل الفعل وانظر إلى آخره.",
    ],
    level2: level2.slice(0, 3),
    correction: correction.slice(0, 3),
  };
}

function presentCoach(target: string, facts: Facts, wrong: string): PracticeGuidance {
  const connection = String(facts.buildConnection || "none");
  const shape = String(facts.shape || "");
  const weakLetter = String(facts.weakLetter || "");
  const tool = presentToolDescription(facts);
  const wrongText = clean(wrong);

  const toolDisplay = tool.word
    ? `«${tool.word}»`
    : tool.kind
      ? `عامل ${tool.caseName}`
      : "";
  const toolLine = !tool.kind
    ? "لا يسبقه ناصب ولا جازم."
    : `يسبقه ${toolDisplay}، وهو ${tool.kind}؛ لذلك يحدد حالة ${tool.caseName} للمضارع المعرب أو محلها للمبني.`;

  if (connection === "niswa" || connection === "tawkid") {
    const isNiswa = connection === "niswa";
    const attachment = isNiswa ? "نون النسوة" : "نون التوكيد";
    const build = isNiswa ? "السكون" : "الفتح";
    const correctionFirst =
      wrongText.includes(isNiswa ? "نون التوكيد" : "نون النسوة")
        ? `المتصل في «${target}» هو ${attachment}، وليس ${isNiswa ? "نون التوكيد" : "نون النسوة"}.`
        : wrongText.includes("معرب")
          ? `اختيارك جعل «${target}» معربًا، لكن اتصال ${attachment} ينقله إلى البناء.`
          : `ابدأ من آخر «${target}»: المتصل هو ${attachment}.`;

    return {
      level1: [
        `انظر إلى آخر «${target}»: هل المتصل نون النسوة أم نون التوكيد؟`,
        tool.kind
          ? `بعد معرفة البناء، ما أثر ${toolDisplay} في محل الفعل؟`
          : "بعد معرفة البناء، هل سبقه ناصب أو جازم أم لا؟",
      ],
      level2: [
        `اتصلت بـ«${target}» ${attachment}؛ لذلك نثبت أولًا أن بناءه على ${build}.`,
        toolLine,
        "بقي أن تجمع حكم البناء مع المحل الذي يفرضه العامل السابق.",
      ],
      correction: [
        correctionFirst,
        toolLine,
        "لا تعِد سؤال البناء؛ طبّق أثر العامل على محل الفعل ثم عد إلى الخيارات.",
      ],
    };
  }

  const shapeLine =
    shape === "five"
      ? "الفعل من الأفعال الخمسة؛ راقب ثبوت النون أو حذفها."
      : shape === "weak"
        ? weakLetter === "alif"
          ? "الفعل معتل الآخر بالألف."
          : weakLetter === "waw"
            ? "الفعل معتل الآخر بالواو."
            : weakLetter === "ya" || weakLetter === "yaa"
              ? "الفعل معتل الآخر بالياء."
              : "الفعل معتل الآخر."
        : "الفعل صحيح الآخر.";

  let correctionSecond = toolLine;
  if (/مجرور/u.test(wrongText)) {
    correctionSecond = "الفعل المضارع لا يُجر؛ حالاته الإعرابية هنا رفع أو نصب أو جزم بحسب العامل السابق.";
  } else if (/مرفوع/u.test(wrongText) && tool.code === "nasb") {
    correctionSecond = `اختيار الرفع تجاهل ${toolDisplay}؛ وهو ناصب يسبق الفعل.`;
  } else if (/مرفوع/u.test(wrongText) && tool.code === "jazm") {
    correctionSecond = `اختيار الرفع تجاهل ${toolDisplay}؛ وهو جازم يسبق الفعل.`;
  } else if (/منصوب/u.test(wrongText) && tool.code !== "nasb") {
    correctionSecond = tool.code === "jazm"
      ? `اختيار النصب لا يوافق ${toolDisplay}؛ فهو جازم.`
      : "اختيار النصب يحتاج ناصبًا، ولا يوجد هنا ناصب.";
  } else if (/مجزوم/u.test(wrongText) && tool.code !== "jazm") {
    correctionSecond = tool.code === "nasb"
      ? `اختيار الجزم لا يوافق ${toolDisplay}؛ فهو ناصب.`
      : "اختيار الجزم يحتاج جازمًا، ولا يوجد هنا جازم.";
  }

  return {
    level1: [
      `هل اتصل بـ«${target}» نون النسوة أو نون التوكيد؟`,
      "إن لم يتصل به شيء منهما، فما العامل الذي يسبق الفعل؟",
    ],
    level2: [
      `«${target}» مضارع معرب؛ لم تتصل به نون النسوة ولا نون التوكيد.`,
      toolLine,
      shapeLine,
    ],
    correction: [
      `«${target}» فعل مضارع معرب؛ لم تتصل به نون النسوة ولا نون التوكيد.`,
      correctionSecond,
      `${shapeLine} استخدم هذه الصورة لاختيار العلامة المناسبة.`,
    ],
  };
}

function imperativeCoach(target: string, facts: Facts, wrong: string): PracticeGuidance {
  const attached = String(
    facts.attached || facts.connectorKind || facts.connection || "none",
  );
  const ending = String(facts.ending || "");
  const weak = String(facts.weakLetter || "");
  const presentBase = visibleToken(facts.presentBase);
  const wrongText = clean(wrong);

  const attachedLabel =
    attached === "alif2"
      ? "ألف الاثنين"
      : attached === "waw"
        ? "واو الجماعة"
        : attached === "yaa" || attached === "ya"
          ? "ياء المخاطبة"
          : attached === "niswa"
            ? "نون النسوة"
            : attached === "tawkid"
              ? "نون التوكيد"
              : "";
  const fiveAttachment = ["alif2", "waw", "yaa", "ya"].includes(attached);
  const weakEnding = ending === "weak" || ["alif", "waw", "ya", "yaa"].includes(weak);

  let level2: string[];
  let correction: string[];

  if (fiveAttachment) {
    level2 = [
      `المتصل بـ«${target}» هو ${attachedLabel}.`,
      "مضارع هذا الفعل مع هذا الضمير من الأفعال الخمسة؛ تذكّر أن الأمر يُبنى على ما يُجزم به مضارعه.",
    ];
    correction = [
      /السكون/u.test(wrongText)
        ? `اختيار السكون تجاهل اتصال ${attachedLabel} بـ«${target}».`
        : /حذف حرف العلة/u.test(wrongText)
          ? `اختيار حذف حرف العلة يركز على آخر الفعل، لكن ${attachedLabel} هو القرينة الأسبق هنا.`
          : `ثبت أن «${target}» متصل بـ${attachedLabel}.`,
      "أعد الفعل إلى مضارعه مع الضمير نفسه، ثم طبّق قاعدة جزم الأفعال الخمسة على الأمر.",
    ];
  } else if (attached === "tawkid") {
    level2 = [
      `اتصلت بـ«${target}» نون التوكيد اتصالًا مباشرًا.`,
      "هذه حالة بناء خاصة؛ لا تعامل الفعل كصحيح الآخر المجرد.",
    ];
    correction = [
      /السكون/u.test(wrongText)
        ? `اختيار السكون تجاهل نون التوكيد المتصلة مباشرة بـ«${target}».`
        : `المتصل بـ«${target}» هو نون التوكيد.`,
      "طبّق حكم فعل الأمر عند اتصال نون التوكيد مباشرة، ثم عد إلى الخيارات.",
    ];
  } else if (attached === "niswa") {
    level2 = [
      `المتصل بـ«${target}» نون النسوة.`,
      "نون النسوة ليست من اتصالات الأفعال الخمسة؛ لا تطبق عليها حذف النون.",
    ];
    correction = [
      /حذف النون/u.test(wrongText)
        ? `اختيار حذف النون عامل نون النسوة كأنها علامة من علامات الأفعال الخمسة، وهذا غير صحيح.`
        : `ثبت أن المتصل بـ«${target}» هو نون النسوة.`,
      "ميّز نون النسوة من ألف الاثنين وواو الجماعة وياء المخاطبة، ثم اختر حكم البناء.",
    ];
  } else if (weakEnding) {
    const weakLabel = weak === "alif" ? "الألف" : weak === "waw" ? "الواو" : "الياء";
    level2 = [
      `لم يتصل بـ«${target}» ضمير يحدد البناء قبل النظر إلى آخره.`,
      presentBase
        ? `نرده إلى مضارعه «${presentBase}»؛ فيظهر أن حرف العلة الأصلي ${weakLabel}.`
        : `آخره معتل؛ حدّد حرف العلة الأصلي قبل اختيار البناء.`,
    ];
    correction = [
      /السكون/u.test(wrongText)
        ? `اختيار السكون عامل «${target}» كفعل صحيح الآخر، لكنه معتل الآخر.`
        : /حذف النون/u.test(wrongText)
          ? `اختيار حذف النون يحتاج اتصالًا من اتصالات الأفعال الخمسة، وهذا غير موجود في «${target}».`
          : `ابدأ بآخر «${target}»؛ فهو معتل.`,
      presentBase
        ? `أعده إلى المضارع «${presentBase}» لتتعرف إلى حرف العلة، ثم طبّق قاعدة الأمر.`
        : "حدّد حرف العلة ثم طبّق قاعدة فعل الأمر المعتل الآخر.",
    ];
  } else {
    level2 = [
      `لم يتصل بـ«${target}» ما يوجب حكمًا خاصًا، وآخره صحيح.`,
      "طبّق قاعدة فعل الأمر الصحيح الآخر بعد استبعاد اتصالات الأفعال الخمسة ونون التوكيد.",
    ];
    correction = [
      /حذف النون/u.test(wrongText)
        ? `اختيار حذف النون يحتاج ألف الاثنين أو واو الجماعة أو ياء المخاطبة، ولا يوجد أحدها في «${target}».`
        : /حذف حرف العلة/u.test(wrongText)
          ? `اختيار حذف حرف العلة يحتاج فعلًا معتل الآخر، بينما «${target}» صحيح الآخر.`
          : `ابدأ بالاتصال وآخر «${target}» معًا.`,
      "بعد الاستبعاد، اختر حكم البناء الموافق للفعل الصحيح الآخر.",
    ];
  }

  return {
    level1: [
      `ما الذي اتصل بآخر «${target}»، إن وُجد؟`,
      fiveAttachment
        ? `هل ${attachedLabel} يجعل مضارع الفعل من الأفعال الخمسة؟`
        : attached === "tawkid"
          ? "هل المتصل نون التوكيد مباشرة؟"
          : attached === "niswa"
            ? "هل المتصل نون النسوة؟"
            : "إذا لم يحدد الاتصال الحكم، فهل آخر الفعل صحيح أم معتل؟",
    ],
    level2: level2.slice(0, 3),
    correction: correction.slice(0, 3),
  };
}

function roleCoach(topicId: string, target: string, facts: Facts, resultText: string, wrong: string): PracticeGuidance {
  const roleLabels: Record<string, string> = {
    fael: "الفاعل",
    "naib-fael": "نائب الفاعل",
    "mafool-bih": "المفعول به",
    hal: "الحال",
    tamyiz: "التمييز",
    khabar: "الخبر",
  };
  const role = roleLabels[topicId] || "الوظيفة النحوية";
  const unit = practiceTargetUnit(facts, resultText);
  const built = unit === "word" && (
    /مبني في محل/u.test(clean(resultText)) ||
    String(facts.roleKind || "") === "mabni" ||
    String(facts.roleKind || "") === "connected"
  );
  const shape = nominalShape(facts, resultText);
  const c = resultCase(resultText);
  const wrongText = clean(wrong);

  if (topicId === "fael" && String(facts.roleKind || "") === "hidden") {
    const hiddenPronoun = visibleToken(facts.hiddenPronoun);
    const nominalSubject = visibleToken(facts.nominalSubject);
    const actionQuestion = String(
      facts.actionQuestion || `من الذي قام بالفعل في «${target}»؟`,
    );
    const hiddenClue =
      hiddenPronoun === "أنا"
        ? "همزة المضارعة في أول الفعل تدل هنا على المتكلم المفرد."
        : hiddenPronoun === "نحن"
          ? "نون المضارعة في أول الفعل تدل هنا على المتكلمين."
          : hiddenPronoun === "أنت"
            ? "فعل الأمر هنا موجّه إلى مخاطب، والفاعل غير ظاهر بعده."
            : nominalSubject
              ? `الفعل يعود على الاسم السابق «${nominalSubject}»؛ حدّد الضمير الذي يناسبه.`
              : "استعن بصيغة الفعل والسياق لتحديد الضمير المستتر.";

    return {
      level1: [
        actionQuestion,
        `الفاعل غير ظاهر بعد «${target}»؛ أي ضمير تفهمه من صيغة الفعل والسياق؟`,
      ],
      level2: [
        `في «${target}» الفاعل ضمير مستتر، وليس الفعل نفسه هو الفاعل.`,
        hiddenClue,
        "اختر تقدير الضمير الذي يطابق هذه القرينة.",
      ],
      correction: [
        `لا نجعل «${target}» نفسها فاعلًا؛ الفاعل هنا ضمير مستتر داخل الفعل.`,
        hiddenClue,
        "عد إلى الخيارات واختر تقدير الضمير الذي يوافق الصيغة والسياق.",
      ],
    };
  }

  if (topicId === "hal" && unit !== "word") {
    const phrase = unitPhrase(unit, target);
    return {
      level1: [
        `هل ${phrase} تبيّن هيئة صاحبها وقت وقوع الفعل؟`,
        `إذا كانت كذلك، فالمطلوب وظيفة ${unitKindLabel(unit)} كلها، لا إعراب كلمة داخلها فقط.`,
      ],
      level2: [
        `${phrase} بيّنت هيئة صاحبها وقت وقوع الفعل؛ فهي حال.`,
        "بقي أن تتذكر: ما محل الجملة أو شبه الجملة إذا وقعت حالًا؟",
      ],
      correction: [
        wrongText.includes("فعل مضارع") || wrongText.includes("مبتدأ") || wrongText.includes("خبر")
          ? `إعراب كلمة داخل ${phrase} لا يكفي هنا؛ المطلوب وظيفة التركيب كله.`
          : `${phrase} هي التي بيّنت الهيئة، لذلك نتعامل معها كوحدة واحدة.`,
        "ثبت أن التركيب كله حال، لا كلمة مفردة مستقلة.",
        "طبّق حكم الحال على التركيب كله، ثم عد إلى الخيارات.",
      ],
    };
  }

  let firstQuestion = `ما علاقة «${target}» بالفعل أو بما حولها؟`;
  if (topicId === "fael") {
    const actionQuestion = String(
      facts.actionQuestion || "من الذي قام بالفعل في الجملة؟",
    ).replace(/[؟?]+$/u, "");
    firstQuestion = `جرّب على «${target}» سؤال الفاعل: «${actionQuestion}؟»`;
  }
  if (topicId === "naib-fael") {
    firstQuestion = `ابدأ بالفعل: هل هو مبني للمجهول؟ ثم اختبر هل «${target}» هو الاسم الذي حلّ محل الفاعل.`;
  }
  if (topicId === "mafool-bih") {
    firstQuestion = `بعد استبعاد المفاعيل الأخرى، جرّب على «${target}»: على من أو ماذا وقع الفعل مباشرة؟`;
  }
  if (topicId === "hal") firstQuestion = `هل «${target}» تصف هيئة صاحبها وقت وقوع الفعل؟`;
  if (topicId === "tamyiz") firstQuestion = `هل «${target}» تزيل إبهامًا في اسم أو نسبة قبلها؟`;

  return {
    level1: [firstQuestion, built ? "إذا كانت الكلمة مبنية، فابحث عن محلها لا عن علامة على آخرها." : `إذا ثبت أنها ${role}، فما حكم ${role}؟`],
    level2: [
      `وظيفة «${target}» هنا هي ${role}.`,
      built ? `«${target}» مبني؛ لذلك المطلوب تحديد المحل الإعرابي.` : shape ? `وهي ${shape}.` : "حدّد صورتها قبل العلامة.",
      built ? `بقي أن تحدد: في أي محل جاءت بوصفها ${role}؟` : c && shape ? `بقيت العلامة: ما علامة ${c} ${shape}؟` : "بقي أن تختار الحكم والعلامة المتوافقين.",
    ],
    correction: [
      wrongText && !wrongText.includes(role) ? `اختيارك أعطى «${target}» وظيفة أخرى؛ ارجع إلى علاقتها بالفعل: هنا موقعها ${role}.` : `ثبت أن «${target}» هي ${role}.`,
      built ? "ولأنها مبنية لا نبحث عن حركة إعراب على آخرها؛ نبحث عن محلها." : c ? `${role} له حكم ثابت هنا؛ اربط هذا الحكم بصورة الاسم.` : "حدّد حكم هذه الوظيفة قبل العلامة.",
      built ? `عد الآن واختر المحل الذي يناسب ${role}.` : shape ? `«${target}» ${shape}؛ اختر العلامة التي توافق الحكم والصورة معًا.` : "عد واختر الإعراب المتوافق.",
    ],
  };
}

function mafoolatCoach(target: string, facts: Facts, resultText: string, wrong: string): PracticeGuidance {
  const type = String(facts.mafoolType || "");
  const wrongText = clean(String(wrong || "").split(/\.\s+/u)[0] || "");
  const verb = visibleToken(facts.verb);
  const verbMasdar = visibleToken(facts.verbMasdar);
  const whenWhere = visibleToken(facts.whenWhereQuestion);
  const whyQuestion = visibleToken(facts.whyQuestion);
  const objectQuestion = visibleToken(facts.objectQuestion);

  const wrongType =
    /مفعول معه/u.test(wrongText)
      ? "المفعول معه"
      : /مفعول فيه/u.test(wrongText)
        ? "المفعول فيه"
        : /مفعول مطلق/u.test(wrongText)
          ? "المفعول المطلق"
          : /مفعول لأجله/u.test(wrongText)
            ? "المفعول لأجله"
            : /مفعول به/u.test(wrongText)
              ? "المفعول به"
              : /حال/u.test(wrongText)
                ? "الحال"
                : /تمييز/u.test(wrongText)
                  ? "التمييز"
                  : "";

  const wrongDiagnosis = (() => {
    if (!wrongType) return `اختيارك لا يطابق العلاقة التي تؤديها «${target}» في الجملة.`;
    if (wrongType === "المفعول فيه") {
      return `اختيارك جعله مفعولًا فيه؛ اختبر ذلك بسؤال «متى؟» أو «أين؟» عن الفعل.`;
    }
    if (wrongType === "المفعول لأجله") {
      return `اختيارك جعله مفعولًا لأجله؛ اختبر ذلك بسؤال «لماذا؟» وتحقق من كونه مصدرًا قلبيًا.`;
    }
    if (wrongType === "المفعول المطلق") {
      return `اختيارك جعله مفعولًا مطلقًا؛ قارن «${target}» بمصدر الفعل${verbMasdar ? ` «${verbMasdar}»` : ""}.`;
    }
    if (wrongType === "المفعول معه") {
      return `اختيارك جعله مفعولًا معه؛ هذا يحتاج واوًا بمعنى «مع» تدل على المصاحبة.`;
    }
    if (wrongType === "المفعول به") {
      return `اختيارك جعله مفعولًا به؛ لا نصل إلى المفعول به إلا بعد سقوط المعية والظرف والمطلق والسبب.`;
    }
    if (wrongType === "الحال") {
      return `اختيارك جعله حالًا؛ الحال يجيب عن «كيف؟» ويصف هيئة صاحبه وقت الفعل.`;
    }
    return `اختيارك جعله تمييزًا؛ التمييز يزيل إبهامًا في اسم أو نسبة قبله.`;
  })();

  if (type === "hal") {
    return {
      level1: [
        `هل «${target}» يجيب عن «كيف؟» ويصف هيئة صاحبه وقت وقوع الفعل؟`,
        "إذا كان كذلك، فهو خارج المفاعيل الخمسة.",
      ],
      level2: [
        `«${target}» بيّن الهيئة وقت الفعل؛ فهذا اختبار الحال.`,
        "لا تجبر الكلمة على أحد المفاعيل الخمسة إذا أثبت المعنى أنها حال.",
      ],
      correction: [
        wrongDiagnosis,
        `جرّب سؤال «كيف؟» على «${target}»؛ ستجد أنه يصف الهيئة.`,
        "ارجع إلى السؤال واختر الوظيفة التي أثبتها هذا الاختبار.",
      ],
    };
  }

  if (type === "tamyiz") {
    return {
      level1: [
        `هل «${target}» أزال إبهامًا في كلمة أو مقدار قبله؟`,
        "إذا كان كذلك، فهو تمييز وليس واحدًا من المفاعيل الخمسة.",
      ],
      level2: [
        `«${target}» فسّر المبهم قبله، وهذا هو عمل التمييز.`,
        "لا تنتقل إلى المفعول به لمجرد أن الكلمة منصوبة.",
      ],
      correction: [
        wrongDiagnosis,
        `انظر إلى ما قبل «${target}»: هل يحتاج إلى ما يوضّح المقصود منه؟`,
        "إذا زال الإبهام بها فالمسار هو التمييز، ثم عد إلى السؤال.",
      ],
    };
  }

  if (type === "maah") {
    return {
      level1: [
        `هل سبقت «${target}» واو يمكن أن تكون بمعنى «مع»؟`,
        "هل المعنى مصاحبة، لا مشاركة حقيقية في الفعل؟",
      ],
      level2: [
        `الواو مع «${target}» تفيد المصاحبة في هذا المثال.`,
        "اختبر المعنى بإبدال الواو بـ«مع»؛ إذا استقام فهو اختبار المفعول معه.",
      ],
      correction: [
        wrongDiagnosis,
        `في «${target}» القرينة الحاسمة هي الواو بمعنى «مع».`,
        "طبّق اختبار المصاحبة ثم عد واختر النوع الموافق.",
      ],
    };
  }

  if (type === "fih") {
    return {
      level1: [
        whenWhere
          ? `جرّب على «${target}» السؤال: «${whenWhere}؟»`
          : `هل «${target}» يجيب عن «متى؟» أو «أين؟» وقع ${verb || "الفعل"}؟`,
        "إذا حدّد زمان الفعل أو مكانه، فما نوع المفعول؟",
      ],
      level2: [
        `«${target}» يحدد ${String(facts.fihKind || "") === "place" ? "مكان" : "زمان"} وقوع الفعل.`,
        "هذا هو اختبار الظرف: متى؟ أو أين؟",
      ],
      correction: [
        wrongDiagnosis,
        whenWhere || `اسأل عن ${verb || "الفعل"}: متى أو أين وقع؟`,
        "إذا كانت «${target}» هي الجواب، فاختر النوع الموافق لهذا الاختبار.",
      ],
    };
  }

  if (type === "mutlaq") {
    return {
      level1: [
        `هل «${target}» مصدر يدل على الحدث نفسه الذي يدل عليه ${verb ? `«${verb}»` : "الفعل"}؟`,
        verbMasdar ? `قارنها بمصدر الفعل «${verbMasdar}».` : "قارنها بمصدر الفعل نفسه.",
      ],
      level2: [
        `«${target}» من مادة الحدث نفسه، فهي تؤكد الحدث أو تبين نوعه أو عدده.`,
        "هذا هو الاختبار الذي يسبق الانتقال إلى المفعول لأجله أو المفعول به.",
      ],
      correction: [
        wrongDiagnosis,
        verbMasdar
          ? `ارجع إلى مصدر الفعل «${verbMasdar}» وقارنه بـ«${target}».`
          : `ارجع إلى مصدر الفعل وقارنه بـ«${target}».`,
        "إذا اتحد الحدث فاختر نوع المفعول الموافق.",
      ],
    };
  }

  if (type === "liajlih") {
    return {
      level1: [
        whyQuestion
          ? `جرّب على «${target}» السؤال: «${whyQuestion}؟»`
          : `هل «${target}» تجيب عن سؤال «لماذا ${verb || "وقع الفعل"}؟»`,
        "هل هي مصدر قلبي يبين سبب وقوع الفعل؟",
      ],
      level2: [
        `«${target}» بيّنت سبب وقوع الفعل.`,
        "تحقق من المصدر القلبي واتحاد الفاعل والزمن، ثم اختر النوع.",
      ],
      correction: [
        wrongDiagnosis,
        whyQuestion || `اسأل: لماذا وقع ${verb || "الفعل"}؟`,
        "إذا كانت «${target}» سببًا مصدرًا مستوفيًا للشروط فاختر النوع الموافق.",
      ],
    };
  }

  return {
    level1: [
      "بعد إسقاط المعية والظرف والمطلق والسبب: هل وقع الفعل على «" + target + "» مباشرة؟",
      objectQuestion || "من أو ماذا وقع عليه الفعل؟",
    ],
    level2: [
      `وصلنا إلى «${target}» بعد سقوط الأنواع السابقة.`,
      `اختبر الآن وقوع ${verb ? `«${verb}»` : "الفعل"} عليها مباشرة.`,
    ],
    correction: [
      wrongDiagnosis,
      "المفعول به هو آخر هذا التسلسل؛ لا تبدأ به قبل إسقاط الأنواع السابقة.",
      objectQuestion || `اسأل: على من أو ماذا وقع ${verb || "الفعل"} مباشرة؟`,
    ],
  };
}

function tawabiCoach(topicId: string, target: string, facts: Facts, resultText: string, wrong: string): PracticeGuidance {
  const value = clean(resultText);
  const role = /نعت/u.test(value) ? "نعت" : /معطوف/u.test(value) ? "معطوف" : /توكيد/u.test(value) ? "توكيد" : /بدل/u.test(value) ? "بدل" : topicId === "tawabi-naat" ? "نعت" : topicId === "tawabi-atf" ? "معطوف" : topicId === "tawabi-tawkid" ? "توكيد" : topicId === "tawabi-badal" ? "بدل" : "تابع";
  const c = resultCase(resultText);
  const unit = practiceTargetUnit(facts, resultText);
  const wrongText = clean(wrong);

  if (unit !== "word") {
    const phrase = unitPhrase(unit, target);
    return {
      level1: [
        `ما علاقة ${phrase} بالاسم الذي قبلها: هل تصفه أم تؤدي وظيفة أخرى؟`,
        "إذا كانت وصفًا، فانظر إلى إعراب الاسم الذي تصفه لتعرف محل التركيب كله.",
      ],
      level2: [
        `${phrase} وصفت الاسم الذي قبلها؛ لذلك هي نعت له.`,
        "الجملة أو شبه الجملة لا نبحث لها عن حركة على آخرها؛ نحدد محلها بحسب المتبوع.",
        "بقي أن تختار المحل الذي يوافق إعراب المتبوع.",
      ],
      correction: [
        wrongText.includes("فعل") || wrongText.includes("مبتدأ") || wrongText.includes("خبر")
          ? `إعراب كلمة داخل ${phrase} لا يجيب عن المطلوب؛ المطلوب وظيفة التركيب كله.`
          : `${phrase} جاءت لوصف الاسم الذي قبلها، فنتعامل معها كوحدة واحدة.`,
        "ثبت أن التركيب كله نعت.",
        "انقل حالة المتبوع إلى محل النعت، ثم عد إلى الخيارات.",
      ],
    };
  }

  return {
    level1: [`ما العلاقة بين «${target}» والكلمة التي قبلها: وصف، عطف، توكيد، أم بدل؟`, "بعد تحديد نوع التابع، انظر إلى إعراب المتبوع."],
    level2: [`«${target}» هنا ${role}.`, `التابع يتبع متبوعه في الإعراب؛ حدّد حالة المتبوع أولًا.`, c ? `بقيت العلامة التي تناسب حالة ${c} وصورة «${target}».` : "بقي اختيار العلامة المناسبة."],
    correction: [wrongText && !wrongText.includes(clean(role)) ? `العلاقة التي اخترتها لا تطابق ما بين «${target}» ومتبوعها؛ هنا العلاقة ${role}.` : `ثبت أن «${target}» ${role}.`, "الآن لا تبدأ إعرابًا جديدًا؛ انقل حكم المتبوع إلى التابع.", "ثم اختر العلامة التي تناسب صورة التابع."],
  };
}

function pronounCoach(target: string, facts: Facts, resultText: string, wrong: string): PracticeGuidance {
  const value = clean(resultText);
  const c = resultCase(resultText);
  const role = value.match(/في محل (?:رفع|نصب|جر) ([^.،]+)/u)?.[1] || "وظيفته في الجملة";
  return {
    level1: [`بماذا اتصل الضمير في «${target}»، وماذا يدل عليه؟`, "الضمير مبني؛ لذلك ابحث عن وظيفته ومحلّه، لا عن حركة على آخره."],
    level2: [`«${target}» ضمير مبني.`, `حدّد وظيفته من علاقته بما اتصل به: ${role}.`, c ? `بقي أن تختار المحل الإعرابي الذي يناسب هذه الوظيفة.` : "بقي تحديد المحل الإعرابي."],
    correction: [clean(wrong).includes("علامة") ? "الضمير مبني؛ لا نبحث له عن علامة رفع أو نصب أو جر ظاهرة." : `ابدأ من وظيفة الضمير في «${target}»، لا من شكله وحده.`, `وظيفته هنا ${role}.`, "عد واختر المحل الذي تفرضه هذه الوظيفة."],
  };
}

function manqousCoach(target: string, facts: Facts, resultText: string, wrong: string): PracticeGuidance {
  const c = resultCase(resultText);
  const kept = facts.yStatus === "kept";
  const wrongText = clean(wrong);
  const wrongCase = /منصوب/u.test(wrongText)
    ? "نصب"
    : /مرفوع/u.test(wrongText)
      ? "رفع"
      : /مجرور/u.test(wrongText)
        ? "جر"
        : "";
  const wrongDeleted = /الياء المحذوفة/u.test(wrongText);
  const wrongKept = /على الياء/u.test(wrongText) && !wrongDeleted;

  let diagnosis = `ابدأ بموقع «${target}» في الجملة، ثم طبّق قاعدة الاسم المنقوص.`;
  if (wrongCase && c && wrongCase !== c) {
    diagnosis = `اختيارك بنى الإعراب على ${wrongCase}، لكن موقع «${target}» في الجملة هو الذي يحدد الحالة أولًا.`;
  } else if (wrongDeleted && kept) {
    diagnosis = `اختيارك افترض حذف الياء، لكن الياء ظاهرة في «${target}» في هذه الصورة.`;
  } else if (wrongKept && !kept && facts.yStatus === "deleted") {
    diagnosis = `اختيارك افترض بقاء الياء، لكن صورة «${target}» هنا تدل على حذفها.`;
  }

  return {
    level1: [
      `هل «${target}» اسم منقوص: آخره ياء لازمة مكسور ما قبلها في أصله؟`,
      "ما موقعه الإعرابي في الجملة؟",
    ],
    level2: [
      `«${target}» اسم منقوص${c ? `، وحالته هنا ${c}` : ""}.`,
      kept ? "الياء ثابتة في هذه الصورة." : facts.yStatus === "deleted" ? "الياء محذوفة في هذه الصورة." : "في النصب تبقى الياء وتظهر الفتحة عليها.",
      c ? `بقيت العلامة: هل تظهر حركة ${c} على الياء أم تُقدَّر؟` : "بقيت العلامة المناسبة.",
    ],
    correction: [
      diagnosis,
      c ? `ثبّت حالة ${c} من الموقع قبل التفكير في الياء.` : "ثبّت الحالة الإعرابية أولًا.",
      kept
        ? "بعد ذلك طبّق قاعدة الاسم المنقوص مع بقاء الياء."
        : facts.yStatus === "deleted"
          ? "بعد ذلك طبّق قاعدة الاسم المنقوص مع حذف الياء."
          : "في حالة النصب افحص ظهور الفتحة على الياء.",
    ],
  };
}

function nasikhCoach(topicId: string, target: string, facts: Facts, resultText: string, wrong: string): PracticeGuidance {
  const value = clean(resultText);
  const isKana = topicId === "kana-wa-akhawatuha";
  const nasikh = isKana ? "كان وأخواتها" : "إن وأخواتها";
  const targetRole = String(facts.targetRole || "");
  const isName = targetRole === "ism" || (isKana ? /اسم (?:كان|الفعل الناسخ)/u.test(value) : /اسم إن/u.test(value));
  const isKhabar = targetRole === "khabar" || (isKana ? /خبر (?:كان|الفعل الناسخ)/u.test(value) : /خبر إن/u.test(value));
  const unit = practiceTargetUnit(facts, resultText);
  const built = unit === "word" && (/ضمير.*مبني|اسم (?:إشارة|موصول).*مبني/u.test(value) || /في محل/u.test(value));
  const c = resultCase(resultText);
  const role = isName ? `اسم ${nasikh}` : isKhabar ? `خبر ${nasikh}` : "جزء الناسخ";
  const wrongText = clean(wrong);

  if (unit !== "word") {
    const phrase = unitPhrase(unit, target);
    const kind = unitKindLabel(unit);
    const isSentence = unit === "verbal-sentence" || unit === "nominal-sentence";

    if (isKhabar) {
      return {
        level1: [
          `اسم الناسخ موجود في الجملة؛ فما الذي أتم المعنى عنه؟`,
          isSentence
            ? `هل «${target}» كلمة مفردة فقط، أم تبدأ بها ${kind} تؤدي وظيفة الخبر؟`
            : `هل «${target}» كلمة مفردة أم ${kind} تؤدي وظيفة الخبر؟`,
        ],
        level2: [
          `${phrase} أتمت المعنى بعد اسم الناسخ؛ فهي خبره.`,
          `بقي أن تتذكر: ما محل خبر ${nasikh} من الإعراب؟`,
        ],
        correction: [
          wrongText.includes("اسم")
            ? `اسم الناسخ موجود بالفعل في الجملة؛ أما ${phrase} فهي التي أخبرتنا عنه.`
            : wrongText.includes("لا محل")
              ? `${phrase} ليست مستقلة هنا؛ جاءت لتؤدي وظيفة الخبر، لذلك لها محل إعرابي.`
              : wrongText.includes("مجرور") && (unit === "shibh-jar" || unit === "shibh-zarf")
                ? `قد يوجد جر داخل ${phrase}، لكن المطلوب محل التركيب كله بوصفه خبرًا.`
                : `ثبت أن ${phrase} هي خبر ${nasikh}.`,
          "لا تخلط بين إعراب كلمات الجملة من الداخل وبين محل الجملة أو شبه الجملة كلها.",
          `طبّق حكم خبر ${nasikh} على التركيب كله، ثم عد إلى الخيارات.`,
        ],
      };
    }

    return {
      level1: [`حدّد وظيفة ${phrase} مع الناسخ أولًا.`, `بعد ثبوت الوظيفة، ابحث عن محل ${kind} كلها.`],
      level2: [`${phrase} شغلت موقع ${role}.`, `بقي أن تختار المحل الذي يوافق حكم ${role}.`],
      correction: [`لا تعرب كلمة داخل ${phrase} بمعزل عن التركيب كله.`, `ثبت أن ${phrase} شغلت موقع ${role}.`, `طبّق حكم هذه الوظيفة على التركيب كله ثم عد إلى الخيارات.`],
    };
  }

  if (built) {
    return {
      level1: [`ما وظيفة «${target}» مع الناسخ: اسم أم خبر؟`, "إذا كانت الكلمة مبنية، فالمطلوب محلها الإعرابي لا علامة على آخرها."],
      level2: [`«${target}» مبني، وقد شغل موقع ${role}.`, `لا نبحث عن علامة ظاهرة؛ نبحث عن محل ${role}.`, "بقي أن تختار المحل الذي يوافق حكم هذه الوظيفة."],
      correction: [wrongText.includes(isName ? "خبر" : "اسم") ? `اختيارك بدّل الوظيفة. «${target}» هنا ${role}.` : `ثبت أن «${target}» شغل موقع ${role}.`, "ولأنه مبني فلا نبحث عن حركة على آخره.", `تذكّر حكم ${role}، ثم عد واختر المحل الموافق.`],
    };
  }

  const shape = nominalShape(facts, resultText);
  return {
    level1: [`هل «${target}» هو اسم الناسخ أم خبره؟`, `بعد تحديد الوظيفة، ما حكم ${role}؟`],
    level2: [`«${target}» هنا ${role}.`, shape ? `وهي ${shape}.` : "حدّد صورة الاسم.", c && shape ? `بقيت العلامة: ما علامة ${c} ${shape}؟` : "بقي اختيار الحكم والعلامة المتوافقين."],
    correction: [wrongText.includes(isName ? "خبر" : "اسم") ? `اختيارك بدّل الاسم والخبر؛ ارجع إلى وظيفة «${target}»: هي ${role}.` : `ثبت أن «${target}» ${role}.`, c ? `لهذه الوظيفة حكم ثابت؛ اربطه بصورة الاسم بدل تغيير الوظيفة.` : "حدّد حكم الوظيفة أولًا.", shape ? `«${target}» ${shape}؛ عد واختر العلامة التي تناسب الحكم والصورة.` : "عد واختر الإعراب المتوافق."],
  };
}


function khabarCoach(target: string, facts: Facts, resultText: string, wrong: string): PracticeGuidance {
  const unit = practiceTargetUnit(facts, resultText);
  const wrongText = clean(wrong);
  if (unit !== "word") {
    const phrase = unitPhrase(unit, target);
    const kind = unitKindLabel(unit);
    return {
      level1: [
        `ما الذي أتم المعنى عن المبتدأ في الجملة؟`,
        `هل «${target}» كلمة مفردة فقط، أم ${kind} تؤدي وظيفة الخبر؟`,
      ],
      level2: [
        `${phrase} أتمت المعنى عن المبتدأ؛ فهي الخبر.`,
        "بقي أن تحدد محل الخبر عندما يأتي جملة أو شبه جملة.",
      ],
      correction: [
        wrongText.includes("لا محل")
          ? `${phrase} ليست مستقلة؛ جاءت لتخبر عن المبتدأ، لذلك لها محل إعرابي.`
          : wrongText.includes("مجرور") && (unit === "shibh-jar" || unit === "shibh-zarf")
            ? `لا تجعل جر كلمة داخل ${phrase} حكمًا للخبر كله.`
            : `ثبت أن ${phrase} هي الخبر.`,
        `المطلوب محل ${kind} كلها، لا إعراب كلمة داخلها فقط.`,
        "طبّق حكم الخبر على التركيب كله، ثم عد إلى الخيارات.",
      ],
    };
  }
  return roleCoach("khabar", target, facts, resultText, wrong);
}


function munadaCoach(target: string, facts: Facts, resultText: string, wrong: string): PracticeGuidance {
  const value = clean(resultText);
  const kind = value.match(/منادى (مضاف|شبيه بالمضاف|نكرة غير مقصودة|نكرة مقصودة|علم مفرد)/u)?.[1] || "";
  const built = /مبني/u.test(value);
  return {
    level1: [`انظر إلى «${target}» بعد أداة النداء: هل هو علم، نكرة مقصودة، مضاف، أم شبيه بالمضاف؟`, "نوع المنادى هو الذي يحدد: بناء أم نصب؟"],
    level2: [kind ? `«${target}» منادى ${kind}.` : `حدّد نوع «${target}» من صور المنادى.`, built ? "هذه الصورة من المنادى مبنية؛ ابحث عن محلها." : "هذه الصورة من المنادى معربة منصوبة.", "بقي أن تختار الصياغة التي توافق النوع والحكم معًا."],
    correction: [clean(wrong) && kind && !clean(wrong).includes(clean(kind)) ? `المشكلة في نوع المنادى: «${target}» هنا ${kind}.` : `ثبت نوع «${target}» في باب النداء${kind ? `: ${kind}` : ""}.`, built ? "لا تبحث عن علامة نصب ظاهرة لكلمة مبنية؛ راعِ البناء والمحل." : "اربط هذا النوع بحكمه في باب النداء.", "عد واختر النتيجة الموافقة لهذا النوع."],
  };
}

function istithnaCoach(target: string, facts: Facts, resultText: string, wrong: string): PracticeGuidance {
  const value = clean(resultText);
  const isMufarragh = /مفرغ|حسب موقعه/u.test(value) || facts.isMufarragh === true;
  return {
    level1: ["افحص جملة الاستثناء: هل هي تامة أم مفرغة؟ وهل هي مثبتة أم منفية؟", `بعد ذلك انظر إلى موقع «${target}» في الجملة.`],
    level2: [isMufarragh ? "الاستثناء هنا مفرغ؛ ما بعد «إلا» يعرب حسب موقعه." : "الاستثناء هنا غير مفرغ؛ طبّق حكم المستثنى المناسب لنوع الجملة.", `لا تحكم على «${target}» من وجود «إلا» وحدها.`, "بقي اختيار الإعراب الذي يوافق نوع الاستثناء وموقع الكلمة."],
    correction: [clean(wrong).includes("مستثنى") && isMufarragh ? "وجود «إلا» لا يعني أن ما بعدها مستثنى منصوب دائمًا؛ في الاستثناء المفرغ يعرب حسب موقعه." : "ابدأ بنوع جملة الاستثناء قبل الحكم على الكلمة.", `ثم حدّد موقع «${target}» نفسه.`, "عد واختر النتيجة التي تجمع نوع الاستثناء والموقع معًا."],
  };
}

function laCoach(target: string, facts: Facts, resultText: string, wrong: string): PracticeGuidance {
  const value = clean(resultText);
  const kind = facts.laNameKind === "mudaf" ? "مضاف" : facts.laNameKind === "shibh" ? "شبيه بالمضاف" : facts.laNameKind === "mufrad" ? "مفرد" : /شبيه بالمضاف/u.test(value) ? "شبيه بالمضاف" : /مضاف/u.test(value) ? "مضاف" : "";
  const built = /مبني/u.test(value);
  return {
    level1: ["هل «لا» هنا نافية للجنس عاملة عمل «إنَّ»؟", `إذا كانت عاملة، فما نوع اسمها «${target}»: مفرد، مضاف، أم شبيه بالمضاف؟`],
    level2: [`«لا» هنا عاملة، و«${target}» اسمها.`, kind ? `نوع اسم «لا» هنا: ${kind}.` : "حدّد نوع اسم «لا».", built ? "هذه الصورة مبنية؛ بقي تحديد البناء والمحل." : "هذه الصورة معربة؛ بقي اختيار علامة النصب المناسبة."],
    correction: [clean(wrong).includes("خبر") ? `اختيارك جعل «${target}» خبرًا، لكن موقعها هنا اسم «لا».` : `ثبت أن «${target}» اسم «لا» النافية للجنس.`, kind ? `ونوعه ${kind}؛ وهذا هو الذي يحدد طريقة إعرابه.` : "حدّد نوع اسم «لا» قبل العلامة.", "عد واختر الصياغة التي توافق الوظيفة والنوع معًا."],
  };
}

function mubtadaCoach(target: string, facts: Facts, resultText: string, wrong: string): PracticeGuidance {
  const value = clean(resultText);
  const built = /مبني في محل/u.test(value);
  const shape = nominalShape(facts, resultText);
  return {
    level1: [`هل بدأت الجملة الاسمية بالحديث عن «${target}»؟`, built ? "إذا كان المبتدأ مبنيًا، فابحث عن محله لا عن حركة على آخره." : "إذا ثبت أنه مبتدأ، فما حكم المبتدأ؟"],
    level2: [`«${target}» هو المبتدأ الذي بدأنا الحديث عنه.`, built ? "وهو مبني؛ لذلك نحدد محلّه الإعرابي." : shape ? `وهو ${shape}.` : "حدّد صورة الاسم.", built ? "بقي اختيار المحل المناسب للمبتدأ." : "بقي اختيار علامة الرفع التي تناسب صورته."],
    correction: [clean(wrong).includes("فاعل") ? `لا تجعل «${target}» فاعلًا لمجرد وجود فعل لاحقًا؛ الجملة بدأت به قبل الفعل، فهو المبتدأ.` : `«${target}» هو الاسم الذي بدأنا الحديث عنه؛ موقعه مبتدأ.`, built ? "لأنه مبني نبحث عن المحل، لا عن علامة ظاهرة." : "المبتدأ مرفوع؛ اربط ذلك بصورة الاسم.", "عد واختر الإعراب المتوافق."],
  };
}

function simpleTopicCoach(
  topicId: string,
  target: string,
  sentence: string,
  facts: Facts,
  resultText: string,
  wrong: string,
): PracticeGuidance | null {
  if (topicId === "first-word-key") return firstWordCoach(target, facts, sentence, wrong);
  if (topicId === "past-verb") return pastCoach(target, facts, wrong);
  if (topicId === "present-verb") return presentCoach(target, facts, wrong);
  if (topicId === "imperative-verb") return imperativeCoach(target, facts, wrong);
  if (["fael", "naib-fael", "mafool-bih", "hal", "tamyiz"].includes(topicId)) return roleCoach(topicId, target, facts, resultText, wrong);
  if (topicId === "mafoolat") return mafoolatCoach(target, facts, resultText, wrong);
  if (topicId === "munada") return munadaCoach(target, facts, resultText, wrong);
  if (topicId === "istithna") return istithnaCoach(target, facts, resultText, wrong);
  if (topicId === "la-nafiya") return laCoach(target, facts, resultText, wrong);
  if (["tawabi", "tawabi-naat", "tawabi-atf", "tawabi-tawkid", "tawabi-badal"].includes(topicId)) return tawabiCoach(topicId, target, facts, resultText, wrong);
  if (topicId === "attached-pronouns") return pronounCoach(target, facts, resultText, wrong);
  if (topicId === "ism-manqous") return manqousCoach(target, facts, resultText, wrong);
  if (topicId === "nominal-advanced") return mubtadaCoach(target, facts, resultText, wrong);
  if (topicId === "khabar") return khabarCoach(target, facts, resultText, wrong);
  if (topicId === "kana-wa-akhawatuha" || topicId === "inna-wa-akhawatuha") return nasikhCoach(topicId, target, facts, resultText, wrong);
  return null;
}

export function buildPracticeTopicGuidance(args: CoachArgs): PracticeGuidance {
  const topicId = String(args.topicId || "").trim();
  if (!topicId) return empty();
  return simpleTopicCoach(
    topicId,
    args.target,
    args.sentence || "",
    args.facts || {},
    args.resultText,
    args.wrongOption || "",
  ) || empty();
}
