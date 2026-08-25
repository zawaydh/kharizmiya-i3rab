import type { Facts } from "./model";

export type DiagnosticFeedbackInput = {
  nodeId?: string;
  pickedText?: string;
  facts?: Facts;
  target?: string;
  sentence?: string;
};

const ROLE_LABELS: Record<string, string> = {
  fael: "فاعل",
  mubtada: "مبتدأ",
  mafool: "مفعول به",
  mafool_muqaddam: "مفعول به مقدّم",
  mudaf_ileyh: "مضاف إليه",
};

function clean(value: unknown): string {
  return String(value || "").trim();
}

function targetLabel(target?: string): string {
  return clean(target) || "الكلمة المحددة";
}

function sentenceLabel(sentence?: string): string {
  const value = clean(sentence);
  return value ? ` في جملة «${value}»` : "";
}

function nounClue(target: string): string {
  return target.replace(/[ًٌٍَُِّْـ]/g, "").startsWith("ال")
    ? `وتظهر فيها «الـ»، وهي قرينة لا تدخل على الفعل ولا على الحرف`
    : `وتدل على مسمّى أو معنى من غير أن تحمل زمنًا بنفسها`;
}

function firstWordDiagnostic(input: DiagnosticFeedbackInput): string | null {
  const id = clean(input.nodeId);
  if (!id.startsWith("fw_")) return null;

  const picked = clean(input.pickedText);
  const facts = input.facts || {};
  const target = targetLabel(input.target);
  const inSentence = sentenceLabel(input.sentence);

  if (id === "fw_decision_1") {
    const actual = clean(facts.wordType);
    if (picked.includes("اسم") && actual !== "noun") {
      return actual === "verb"
        ? `اخترتَ «اسم». الاسم لا يحمل حدثًا مرتبطًا بزمن، بينما «${target}»${inSentence} تحمل حدثًا ويمكن ربط معناها بزمن وقوعه. اعتمد هذه القرينة ثم عد إلى الخيارات.`
        : `اخترتَ «اسم». الاسم يدل على مسمّى أو معنى يستقل في نفسه، بينما «${target}»${inSentence} لا يكتمل معناها وحدها بل تربط ما بعدها بما قبلها. اعتمد وظيفة الكلمة لا طولها.`;
    }
    if (picked.includes("فعل") && actual !== "verb") {
      return actual === "noun"
        ? `اخترتَ «فعل». الفعل لا بد أن يجمع حدثًا وزمنًا، لكن «${target}»${inSentence} ${nounClue(target)}. ابحث عن هذه العلامة في المثال ثم أعد الاختيار.`
        : `اخترتَ «فعل». الفعل يحمل حدثًا وزمنًا، لكن «${target}»${inSentence} لا تدل على حدث؛ معناها يتضح من علاقتها بما بعدها. ميّز الوظيفة قبل اختيار النوع.`;
    }
    if (picked.includes("حرف") && actual !== "particle") {
      return actual === "noun"
        ? `اخترتَ «حرف». الحرف لا يستقل معناه غالبًا، لكن «${target}»${inSentence} ${nounClue(target)}. اختبر هذه القرينة في الكلمة نفسها ثم عد إلى السؤال.`
        : `اخترتَ «حرف». الحرف لا يحمل حدثًا وزمنًا، بينما «${target}»${inSentence} تدل على حدث يمكن ربطه بوقت وقوعه. استخدم اجتماع الحدث والزمن للحكم.`;
    }
  }

  if (id === "fw_verb_tense") {
    const actual = clean(facts.verbType);
    if (picked.includes("ماض") && actual !== "past") {
      return actual === "present"
        ? `اخترتَ «ماضٍ»، والماضي يقتضي حدثًا وقع وانتهى. أمّا «${target}»${inSentence} فمعناها يقع الآن أو يتجدد؛ جرّب معها «الآن» ثم اختر الزمن الذي يوافق المعنى.`
        : `اخترتَ «ماضٍ»، والماضي يخبر عن حدث انتهى. أمّا «${target}»${inSentence} فالصيغة موجّهة إلى مخاطب لطلب حصول الحدث؛ حدّد الزمن من معنى الطلب.`;
    }
    if (picked.includes("مضارع") && actual !== "present") {
      return actual === "past"
        ? `اخترتَ «مضارع»، والمضارع يناسب حدثًا يقع أو يتجدد. أمّا «${target}»${inSentence} فتحكي حدثًا وقع قبل زمن الكلام؛ جرّب معها «أمس» ثم أعد الاختيار.`
        : `اخترتَ «مضارع»، لكنه يخبر عن حدث يقع أو يتجدد. «${target}»${inSentence} لا تخبر هنا، بل تطلب من مخاطب أن يُحدث الفعل؛ استخدم دلالة الطلب للحكم.`;
    }
    if (picked.includes("أمر") && actual !== "imperative") {
      return actual === "past"
        ? `اخترتَ «أمر»، والأمر يتضمن طلبًا من مخاطب. «${target}»${inSentence} لا تطلب فعلًا، بل تحكي حدثًا وقع وانتهى؛ اربطها بزمن الحدث ثم أعد الاختيار.`
        : `اخترتَ «أمر»، والأمر يطلب حصول الحدث. «${target}»${inSentence} تخبر عن حدث يقع أو يتجدد من غير طلب مباشر؛ استخدم هذا الفرق عند العودة للسؤال.`;
    }
  }

  if (id === "fw_particle_after") {
    const actual = clean(facts.afterParticle);
    if (picked.includes("فعل") && actual !== "verb") {
      return `اخترتَ أن بعد «${target}» فعلًا. اقرأ الكلمة التي تليها${inSentence}: هي تدل على مسمّى أو معنى من غير حدث وزمن. صنّف الكلمة التالية من هذه القرينة ثم عد إلى الخيارين.`;
    }
    if (picked.includes("اسم") && actual !== "noun") {
      return `اخترتَ أن بعد «${target}» اسمًا. اقرأ الكلمة التي تليها${inSentence}: هي تحمل حدثًا مرتبطًا بزمن. استخدم اجتماع الحدث والزمن لتحديد نوع ما بعد الحرف.`;
    }
  }

  return null;
}

function pronounDiagnostic(input: DiagnosticFeedbackInput): string | null {
  const id = clean(input.nodeId);
  if (!id.startsWith("pronoun_")) return null;

  const picked = clean(input.pickedText);
  const facts = input.facts || {};
  const target = targetLabel(input.target);
  const inSentence = sentenceLabel(input.sentence);
  const position = clean(facts.position);
  const role = clean(facts.role);
  const expectedRole = ROLE_LABELS[role] || "وظيفته في الجملة";

  if (id === "pronoun_relation_gate") {
    if (picked.includes("حركة")) {
      return `اخترتَ البحث عن حركة آخر الضمير «${target}»، لكن الضمير اسم مبني فلا تتبدل حركة آخره لتكشف الإعراب. ضع اسمًا ظاهرًا مكانه${inSentence} وحدد الوظيفة التي شغلها أولًا.`;
    }
    if (picked.includes("فاعل")) {
      return `اخترتَ عدَّ «${target}» فاعلًا مباشرة، لكن الضمير قد يشغل وظائف مختلفة. استبدله باسم ظاهر${inSentence} واسأل: أهو من قام بالفعل، أم وقع عليه الفعل، أم بدأنا الحديث عنه، أم جاء في إضافة؟`;
    }
  }

  if (id === "pronoun_position") {
    if (picked.includes("رفع") && position !== "raf3") {
      return `اخترتَ محل الرفع، وهو يناسب وظائف مثل الفاعل والمبتدأ. أمّا «${target}»${inSentence} فقد شغل وظيفة ${expectedRole}. حوّل هذه الوظيفة إلى محلها الإعرابي ثم عد إلى السؤال.`;
    }
    if (picked.includes("نصب") && position !== "nasb") {
      return `اخترتَ محل النصب، وهو يناسب المفعول به ونحوه. أمّا «${target}»${inSentence} فقد شغل وظيفة ${expectedRole}. استبدله باسم ظاهر واعرب ذلك الاسم لتعرف المحل.`;
    }
    if (picked.includes("جر") && position !== "jar") {
      return `اخترتَ محل الجر، والجر يحتاج حرف جر أو إضافة أو تبعية لمجرور. أمّا «${target}»${inSentence} فقد شغل وظيفة ${expectedRole}. اربط الوظيفة بالحالة التي تقتضيها.`;
    }
  }

  if (id === "pronoun_form_raf3" || id === "pronoun_form_nasb") {
    const form = clean(facts.form);
    if (picked.includes("متصل") && form !== "attached") {
      return `اخترتَ «ضمير متصل». المتصل لا يقف كلمة مستقلة، بل يلتصق بما قبله مثل التاء في «كتبتُ». أمّا «${target}»${inSentence} فتظهر كلمة مستقلة؛ استخدم شكلها الكتابي للحكم.`;
    }
    if (picked.includes("منفصل") && form !== "separate") {
      return `اخترتَ «ضمير منفصل». المنفصل يقف كلمة مستقلة مثل «أنا» و«إيّاك». أمّا «${target}»${inSentence} فملتصق بكلمة قبله ولا يمكن فصله عنها في هذا الاستعمال؛ راجع الصورة.`;
    }
  }

  return null;
}

function caseClue(caseValue: string, sentence?: string): string {
  const sentenceText = clean(sentence);
  if (caseValue === "nasb") {
    return sentenceText.includes("رأيت")
      ? "وقع عليه فعل الرؤية؛ فاستخرج الحالة التي يأخذها المفعول به"
      : "موقعه يؤدي وظيفة تحتاج حالة النصب؛ استخرجها من العامل قبل النظر إلى الياء";
  }
  if (caseValue === "raf3") {
    return sentenceText.includes("جاء")
      ? "هو الذي أسند إليه فعل المجيء؛ فاستخرج الحالة التي يأخذها الفاعل"
      : "موقعه يؤدي وظيفة تحتاج حالة الرفع؛ استخرجها من العامل قبل النظر إلى الياء";
  }
  if (caseValue === "jar") {
    return /(?:^|\s)[بكل](?:ال|\S)/u.test(sentenceText) || sentenceText.includes("ب")
      ? "سبقه حرف جر؛ فاستخرج الحالة التي يفرضها حرف الجر"
      : "دخل في إضافة أو سياق جر؛ استخرج الحالة من العامل قبل تطبيق قاعدة المنقوص";
  }
  return "حدّد موقعه النحوي من العامل في الجملة قبل تطبيق قاعدة الاسم المنقوص";
}

function manqousDiagnostic(input: DiagnosticFeedbackInput): string | null {
  const id = clean(input.nodeId);
  if (!id.startsWith("manqous_")) return null;

  const picked = clean(input.pickedText);
  const facts = input.facts || {};
  const target = targetLabel(input.target);
  const inSentence = sentenceLabel(input.sentence);
  const caseValue = clean(facts.case);
  const hasAl = facts.hasAl === true;
  const isAdded = facts.isAdded === true;

  if (id === "manqous_identity" && picked.includes("ليست")) {
    return `اخترتَ أن «${target}» ليست من هذا الباب. أعدها إلى صورتها الأصلية أو إلى صورة معرفة بـ«الـ»${inSentence}: إذا ظهرت ياء لازمة قبلها كسرة مثل «القاضي»، فهذه هي العلامة التي يجب أن تبني عليها حكمك حتى لو حذفت الياء في «قاضٍ».`;
  }

  if (id === "manqous_has_al") {
    if (picked.includes("معرّف") && !hasAl) {
      return `اخترتَ أنها معرفة بـ«الـ»، لكن انظر إلى «${target}» نفسها${inSentence}: بدايتها لا تحتوي «الـ». افحص الرسم الظاهر للكلمة فقط في هذه الخطوة، ثم عد إلى السؤال.`;
    }
    if (picked.includes("ليس معرّفًا") && hasAl) {
      return `اخترتَ أنها غير معرفة بـ«الـ»، لكن «${target}»${inSentence} تبدأ بـ«الـ» ظاهرة. هذه الخطوة لا تسأل عن الإضافة أو الحالة بعد؛ ركّز على أداة التعريف نفسها.`;
    }
  }

  if (id === "manqous_is_added") {
    if (picked.includes("هو مضاف") && !isAdded) {
      return `اخترتَ أن «${target}» مضافة، لكن لا يأتي بعدها اسم مجرور أو ضمير يتمم معناها${inSentence}. اختبر الإضافة بسؤال: «${target} مَن/ماذا؟» ثم راجع الخيار.`;
    }
    if (picked.includes("غير مضافة") && isAdded) {
      return `اخترتَ أن «${target}» غير مضافة، لكن معناها يتصل مباشرة باسم أو ضمير بعدها${inSentence}. هذا الارتباط هو الذي يجب فحصه قبل الانتقال إلى الحالة الإعرابية.`;
    }
  }

  if (id === "manqous_case_kept" || id === "manqous_indef_case") {
    const choseNasb = picked.includes("منصوب");
    const choseRaf3 = picked.includes("مرفوع");
    const choseJar = picked.includes("مجرور");
    const isWrong = (choseNasb && caseValue !== "nasb") || (choseRaf3 && caseValue !== "raf3") || (choseJar && caseValue !== "jar");
    if (isWrong) {
      const pickedReason = choseNasb
        ? "اخترتَ النصب، لكنه يحتاج عاملًا أو موقعًا يطلب النصب؛ لا تستدل من بقاء الياء وحده"
        : choseRaf3
          ? "اخترتَ الرفع، لكنه يحتاج موقعًا كالفاعل أو المبتدأ أو نائب الفاعل؛ لا تستدل من شكل الياء وحده"
          : "اخترتَ الجر، لكنه يحتاج حرف جر أو إضافة أو تبعية لمجرور؛ لا تستدل من شكل الياء وحده";
      return `${pickedReason}. أمّا «${target}»${inSentence} فـ${caseClue(caseValue, input.sentence)}. بعد تحديد الحالة طبّق قاعدة المنقوص: في النصب تثبت الياء، وفي النكرة غير المضافة وغير المعرفة بـ«الـ» تحذف في الرفع والجر.`;
    }
  }

  return null;
}

export function diagnosticFeedbackForChoice(input: DiagnosticFeedbackInput): string | null {
  return firstWordDiagnostic(input) || pronounDiagnostic(input) || manqousDiagnostic(input);
}
