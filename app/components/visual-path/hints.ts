import type { Example, PositionedNode, VisualChoice } from "./types";

function canonicalNodeId(node: PositionedNode): string {
  return String(node.originalNode?.id || node.id);
}

function quoted(value?: unknown, fallback = "الكلمة المحددة") {
  const text = String(value || "").trim();
  return text ? `«${text}»` : fallback;
}

function chosen(label: string, criterion: string, instruction: string) {
  return `اختيار «${label}» يقتضي ${criterion}. ${instruction}`;
}

function namedLetter(label: string) {
  return label.startsWith("ال") ? label : `ال${label}`;
}

function commonCriterion(label: string): string | undefined {
  const criteria: Record<string, string> = {
    "اسم معرب": "أن تتغير علامة آخر الاسم بحسب موقعه الإعرابي",
    "اسم ظاهر معرب": "أن تكون الكلمة اسمًا ظاهرًا تقبل علامة إعراب",
    "اسم مبني": "أن يلزم الاسم صورة واحدة ويُعرب في محل",
    "ضمير متصل": "أن تكون الكلمة جزءًا متصلًا بما قبلها وتدل على متكلم أو مخاطب أو غائب",
    "ضمير منفصل": "أن تكون الكلمة ضميرًا مستقلًا مثل أنا أو أنت أو هو",
    "ضمير": "أن تدل الكلمة على متكلم أو مخاطب أو غائب",
    "اسم إشارة": "أن تدل الكلمة على مشار إليه مثل هذا وهذه وهؤلاء",
    "اسم موصول": "أن تكون الكلمة اسمًا يحتاج صلة بعده مثل الذي والتي",
    "اسم استفهام": "أن تستعمل الكلمة لطلب جواب في سؤال",
    "اسم شرط": "أن تربط الكلمة بين فعل الشرط وجوابه",
    "كم الخبرية": "أن تكون الكلمة «كم» الدالة على الكثرة من غير طلب جواب",
    "مصدر مؤول": "أن يكون المحدد تركيبًا من حرف مصدري وفعل يمكن تأويله بمصدر صريح",
    "تركيب في تأويل اسم": "أن يكون المحدد تركيبًا من أكثر من كلمة ويمكن تحويله إلى اسم صريح يؤدي معناه",
    "كلمة مفردة": "أن يكون المحدد كلمة واحدة لا تركيبًا من حرف مصدري وفعل",
    "مفرد": "أن يدل الاسم على واحد أو واحدة من غير علامة تثنية أو جمع",
    "مفرد أو جمع تكسير": "ألا يحمل الاسم علامة المثنى أو الجمع السالم أو الأسماء الخمسة",
    "مثنى": "أن يدل الاسم على اثنين وتظهر فيه علامة التثنية «ان/ين»",
    "جمع مذكر سالم": "أن يدل الاسم على جماعة ذكور عاقلة وينتهي غالبًا بـ«ون/ين»",
    "جمع مؤنث سالم": "أن ينتهي الجمع بألف وتاء زائدتين غالبًا",
    "جمع تكسير": "أن يدل الاسم على جمع مع تغير صورة مفرده",
    "من الأسماء الخمسة": "أن يكون الاسم أبًا أو أخًا أو حمًا أو فمًا أو ذا بمعنى صاحب مع تحقق الشروط",
    "متصل بياء المتكلم": "أن تنتهي الكلمة بياء تدل على المتكلم وتكون مضافة إليها",
    "صحيح الآخر": "أن يكون الحرف الأصلي الأخير غير الألف والواو والياء",
    "أصله صحيح الآخر": "أن يكون الحرف الأصلي الأخير غير الألف والواو والياء",
    "آخره صحيح ظاهر": "أن يكون آخر الفعل حرفًا صحيحًا ظاهرًا لا ألفًا لينة",
    "معتل الآخر": "أن يكون الحرف الأصلي الأخير ألفًا أو واوًا أو ياءً",
    "من الأفعال الخمسة": "أن يتصل المضارع بألف الاثنين أو واو الجماعة أو ياء المخاطبة",
    "معتل بالألف": "أن ينتهي الأصل بألف لازمة",
    "آخره ألف لينة": "أن ينتهي الفعل بألف مقصورة أو ممدودة",
    "مقصور آخره ألف لازمة": "أن ينتهي الاسم بألف لازمة",
    "منقوص آخره ياء لازمة": "أن ينتهي الاسم بياء لازمة قبلها كسرة",
    "جملة اسمية": "أن يبدأ التركيب باسم ويحتوي إسنادًا اسميًا",
    "جملة فعلية": "أن يبدأ التركيب بفعل ويحتوي فاعلًا ظاهرًا أو مقدرًا",
    "جملة": "أن يكون الخبر تركيبًا فيه إسناد كامل",
    "شبه جملة": "أن يكون الخبر جارًا ومجرورًا أو ظرفًا",
    "جار ومجرور": "أن يبدأ التركيب بحرف جر ويتبعه اسم مجرور",
    "ظرف": "أن يبدأ التركيب باسم زمان أو مكان مثل عند وفوق وأمام",
    "خبر مفرد": "ألا يكون الخبر جملة ولا شبه جملة، ولو كان مثنى أو جمعًا",
    "خبر جملة": "أن يحتوي الخبر إسنادًا داخليًا اسميًا أو فعليًا",
    "خبر شبه جملة": "أن يكون الخبر جارًا ومجرورًا أو ظرفًا",
  };
  return criteria[label];
}

function visualChoiceHint(node: PositionedNode, choice: VisualChoice, example: Example | null): string | undefined {
  const id = canonicalNodeId(node);
  const label = choice.label;
  const target = quoted(example?.target);
  const sentence = quoted(example?.sentence, "الجملة");
  const facts = example?.facts || {};
  const basePast = quoted(facts.basePastHuwa, "صورة الفعل مع «هو»");
  const rawPresentBase = String(facts.presentBase || "").trim();
  const presentBase = rawPresentBase ? quoted(rawPresentBase) : "";
  const presentBaseStep = rawPresentBase
    ? `حوّل ${target} إلى المضارع مع «هو»: ${presentBase}`
    : `حوّل ${target} بنفسك إلى المضارع مع «هو»`;
  const singularCommandStep = `أسند الطلب إلى المخاطب المفرد «أنتَ»، ثم قارن صيغة الأمر المفرد بـ${target}`;
  const common = commonCriterion(label);

  if (id === "fw_decision_1") {
    const criteria: Record<string, string> = {
      "اسم": "أن تدل الكلمة على شخص أو شيء أو معنى من غير زمن",
      "فعل": "أن تدل الكلمة على حدث مقترن بزمن أو طلب",
      "حرف": "ألا يستقل معناها إلا مع كلمة أخرى مثل في ولن ولم",
    };
    return chosen(label, criteria[label] || "أن يوافق نوع الكلمة معناها", `اقرأ ${target} وحدها داخل ${sentence}، ثم اسأل: هل تدل على اسم أم حدث أم أداة ربط؟`);
  }
  if (id === "fw_verb_tense") {
    const criteria: Record<string, string> = {
      "ماضٍ": "أن يخبر الفعل عن حدث وقع وانتهى",
      "مضارع": "أن يخبر الفعل عن حدث يقع الآن أو يتجدد أو سيقع",
      "أمر": "أن يطلب الفعل من المخاطب القيام بحدث",
    };
    return chosen(label, criteria[label] || "أن توافق صيغة الفعل زمنه", `اقرأ ${target} في ${sentence} وحدد: أهو خبر عن حدث أم طلب؟ ومتى يقع الحدث؟`);
  }
  if (id === "fw_particle_after") {
    const criterion = label.includes("فعل")
      ? "أن تدل الكلمة التالية للحرف على حدث وزمن"
      : "أن تدل الكلمة التالية للحرف على شخص أو شيء أو معنى بلا زمن";
    return chosen(label, criterion, `انظر إلى الكلمة الواقعة بعد ${target} مباشرة في ${sentence}، ثم حدّد نوعها.`);
  }

  if (id === "past_word_kind" || id === "imperative_word_kind" || id === "mubtada_word_type") {
    if (label === "اسم") return chosen(label, "ألا تدل الكلمة بذاتها على حدث مقترن بزمن أو طلب", `اختبر معنى ${target} داخل ${sentence}.`);
    if (label === "فعل") return chosen(label, "أن تدل الكلمة على حدث مرتبط بزمن أو طلب", `اختبر معنى ${target} داخل ${sentence}.`);
    if (label === "حرف") return chosen(label, "ألا يستقل معناه إلا مع غيره مثل في ومن وإلى", `هل ${target} أداة ربط أم كلمة تحمل معنى مستقلًا؟`);
  }

  if (id === "past_tense") {
    const criterion = label === "مضارع" ? "أن يدل الفعل على حدث يقع الآن أو يُستقبل" : "أن يكون الفعل طلبًا موجّهًا إلى مخاطب";
    return chosen(label, criterion, `اقرأ ${target} في سياق ${sentence} وحدد زمن الحدث قبل النظر إلى العلامة.`);
  }
  if (id === "imperative_meaning") {
    const criterion = label.includes("وقع") ? "أن يخبر الفعل عن حدث انتهى" : "أن يخبر عن حدث يقع الآن أو سيقع";
    return chosen(label, criterion, `اسأل: هل ${target} خبر عن حدث، أم طلب من المخاطب أن يقوم به؟`);
  }

  if (id === "past_has_attachment") {
    return chosen(label, label.startsWith("اتصل") ? "وجود لاحقة بعد أصل الفعل" : "بقاء الفعل على صورة الماضي مع «هو» بلا لاحقة", `قارن ${target} بـ${basePast}، وحدد ما بقي بعد أصل الفعل.`);
  }
  if (id === "past_connector_kind") {
    const criteria: Record<string, string> = {
      "تاء التأنيث الساكنة": "أن تكون اللاحقة تاءً ساكنة تدل على تأنيث الفاعل ولا تشغل موقعه",
      "ضمير رفع يدل على الفاعل": "أن يدل المتصل نفسه على من قام بالفعل",
      "ضمير نصب يدل على المفعول به": "أن يدل المتصل على من وقع عليه الفعل",
    };
    return chosen(label, criteria[label] || "أن توافق اللاحقة وظيفتها في الجملة", `افصل اللاحقة في ${target}، ثم اسأل: من قام بالفعل، وعلى من وقع؟`);
  }
  if (id === "past_taa_weak" || id === "past_waw_weak") {
    return chosen(label, label.startsWith("حُذف") ? "أن ينتهي أصل الماضي بحرف علة غير ظاهر بعد الاتصال" : "ألا يختفي من أصل الماضي حرف علة", `قارن ${target} بـ${basePast} حرفًا حرفًا، ولا ترجع إلى المضارع.`);
  }
  if (id === "past_deleted_letter_taa" || id === "past_deleted_letter_waw") {
    return chosen(label, `أن يكون آخر ${basePast} هو ${quoted(label, "الحرف المختار")}`, `انظر إلى آخر صورة الماضي مع «هو»، ثم قارنها بصورة ${target} بعد الاتصال.`);
  }
  if (id === "past_no_attachment_weak" || id === "past_nasb_weak") {
    return common ? chosen(label, common, `ارجع إلى ${basePast} وافحص الحرف الأصلي الأخير نفسه؛ فحروف العلة هي الألف والواو والياء.`) : undefined;
  }
  if (id === "past_raf3_type") {
    const criteria: Record<string, string> = {
      "تاء الفاعل ونا ونون النسوة": "ظهور تاء فاعل أو «نا» الدالة على الفاعلين أو نون النسوة",
      "ألف الاثنين": "أن تدل اللاحقة على فاعلين اثنين",
      "واو الجماعة": "أن تدل الواو على جماعة ويأتي بعدها غالبًا ألف فارقة",
    };
    return chosen(label, criteria[label] || "أن تطابق اللاحقة الظاهرة", `انظر إلى نهاية ${target} ودلالة الضمير المتصل، لا إلى عدد كلمات الجملة.`);
  }
  if (id === "past_sukoon_raf3_type") {
    const criteria: Record<string, string> = {
      "تاء الفاعل": "أن تكون اللاحقة تاءً متحركة تدل على المتكلم أو المخاطب",
      "نا الفاعلين": "أن تكون «نا» هي التي قامت بالفعل لا التي وقع عليها",
      "نون النسوة": "أن تكون النون ضميرًا يدل على جماعة الإناث",
    };
    return chosen(label, criteria[label] || "أن يطابق الضمير دلالته", `افحص آخر ${target}، ثم اسأل: من الذي قام بالفعل؟`);
  }

  if (id === "present:connection") {
    const criteria: Record<string, string> = {
      "نون النسوة": "أن تكون النون ضميرًا لفاعل جمع مؤنث وتبقى غير مشددة",
      "نون التوكيد": "أن تكون النون للتقوية والتأكيد وتكون مشددة غالبًا",
      "غير متصل بهما": "ألا تظهر بعد أصل الفعل نون نسوة ولا نون توكيد",
    };
    return chosen(label, criteria[label] || "أن توافق النون وظيفتها", `أسند ${target} إلى «هو»، ثم قارن آخر الصورتين وحدد دلالة النون إن وجدت.`);
  }
  if (/^present:(?:niswa:factor|tawkid:factor|factor)$/.test(id)) {
    const built = id !== "present:factor";
    const criteria: Record<string, string> = {
      "ناصب": "وجود أداة نصب مؤثرة مباشرة قبل الفعل مثل لن أو أن أو كي",
      "جازم": "وجود أداة جزم مؤثرة مباشرة قبل الفعل مثل لم أو لا الناهية أو لام الأمر",
      "لم يُسبق بعامل": "خلو السياق السابق من ناصب وجازم مؤثرين",
    };
    const reminder = built ? "اتصال النون يحدد بناء الفعل، أمّا العامل السابق فيحدد محله." : "العامل السابق هو الذي يحدد حالة الفعل المعرب.";
    return chosen(label, criteria[label] || "أن يوافق العامل السابق", `${reminder} اقرأ ما قبل ${target} مباشرة في ${sentence}.`);
  }
  if (/^present:(?:raf|nasb|jazm):five$/.test(id)) {
    const selectedFive = label === "نعم";
    return chosen(label, selectedFive ? "اتصال المضارع بألف الاثنين أو واو الجماعة أو ياء المخاطبة" : "غياب ألف الاثنين وواو الجماعة وياء المخاطبة عن آخر المضارع", `الأفعال الخمسة أفعال مضارعة اتصلت بأحد هذه الضمائر؛ افصل آخر ${target} عن أصل الفعل.`);
  }
  if (/^present:(?:raf|nasb|jazm):shape$/.test(id) && common) {
    const instruction = label === "من الأفعال الخمسة"
      ? `افصل آخر ${target} عن أصل الفعل، وحدد هل المتصل ألف الاثنين أو واو الجماعة أو ياء المخاطبة.`
      : `أسند ${target} إلى «هو» وافحص الحرف الأصلي الأخير، لا الحركة الإعرابية الظاهرة.`;
    return chosen(label, common, instruction);
  }
  if (/^present:(?:raf|nasb):letter$/.test(id)) {
    const letter = namedLetter(label);
    return chosen(label, `أن يظهر ${quoted(letter)} في آخر أصل الفعل عند إسناده إلى «هو»`, `أعد ${target} إلى صورته مع «هو»، ثم قارن الحرف الأخير دون الاعتماد على الحركة أو الحذف.`);
  }

  if (id === "imperative_connection") {
    return chosen(label, label.startsWith("اتصل") ? "وجود ضمير أو نون بعد أصل فعل الأمر" : "بقاء فعل الأمر بلا لاحقة", `${singularCommandStep} وحدد ما زاد في آخر الفعل.`);
  }
  if (id === "imperative_attached_kind") {
    const criteria: Record<string, string> = {
      "نون النسوة": "أن تدل النون على جماعة المخاطبات وتكون غير مشددة",
      "نون التوكيد": "أن تكون النون للتأكيد لا للدلالة على الفاعلات، وتكون مشددة غالبًا",
      "ألف الاثنين": "أن تدل اللاحقة على مخاطبين اثنين",
      "واو الجماعة": "أن تدل الواو على جماعة المخاطبين",
      "ياء المخاطبة": "أن تدل الياء على مخاطبة مفردة مؤنثة",
    };
    return chosen(label, criteria[label] || "أن تطابق اللاحقة دلالتها", `${singularCommandStep} وحدد اللاحقة الزائدة ودلالتها.`);
  }
  if (id === "imperative_ending" && common) {
    return chosen(label, common, `${presentBaseStep}، ثم افحص الحرف الأصلي الأخير.`);
  }
  if (id === "imperative_weak_letter") {
    const letter = namedLetter(label);
    return chosen(label, `أن ينتهي ${presentBase || "مضارع الفعل مع «هو»"} بالحرف ${quoted(letter)}`, `${presentBaseStep}، ثم حدّد الحرف الذي غاب من آخر ${target}.`);
  }

  if (id === "fael_context" || id === "mafool_context") {
    return common ? chosen(label, common, `اقرأ الكلمة الأولى في ${sentence} قبل البحث عن الفاعل أو المفعول به.`) : undefined;
  }
  if (id === "fael_role_verbal") {
    if (label === "فعل") return chosen(label, "أن تكون الكلمة هي الحدث نفسه", `حدّد الفعل في ${sentence} أولًا، ثم اسأل: ${String(facts.actionQuestion || "من الذي قام بالفعل؟")}`);
    if (label === "مفعول به") return chosen(label, "أن يقع الفعل على الكلمة لا أن تقوم هي به", `استخدم سؤال الفاعل: ${String(facts.actionQuestion || "من الذي قام بالفعل؟")}`);
  }
  if (id === "mafool_role") {
    if (label === "فعل") return chosen(label, "أن تكون الكلمة هي الحدث نفسه", `حدّد الفعل والفاعل في ${sentence}، ثم اسأل: ${String(facts.objectQuestion || "على من أو ماذا وقع الفعل؟")}`);
    if (label === "فاعل") return chosen(label, "أن تكون الكلمة هي التي قامت بالفعل", `المطلوب هنا ما وقع عليه الفعل؛ استخدم السؤال: ${String(facts.objectQuestion || "على من أو ماذا وقع الفعل؟")}`);
  }
  if (id === "fael_hukm" || id === "mafool_hukm") {
    const criterion = label === "مرفوع" ? "أن تكون الوظيفة من وظائف الرفع" : label === "منصوب" ? "أن تكون الوظيفة من وظائف النصب" : "أن يسبق الاسم حرف جر أو يكون مضافًا إليه";
    return chosen(label, criterion, `ثبّت وظيفة ${target} أولًا، ثم اختر الحكم الملازم لهذه الوظيفة.`);
  }
  if (id === "fael_form" || id === "mafool_form" || id === "mubtada_start" || id === "khabar_single_start" || id === "kana:ism:kind" || id === "inna_ism_start" || id === "inna_khabar_single_start") {
    return common ? chosen(label, common, `افحص بنية ${target} نفسها: كلمة معربة، اسم ثابت الصورة، ضمير متصل، أم تركيب مؤول؟`) : undefined;
  }
  if (id === "fael_mu3rab_shape" || id === "mafool_mu3rab_shape" || id === "mubtada_number" || id === "khabar_single_number" || id === "kana:ism:form" || id === "kana:khabar:single-form" || id === "inna_ism_number" || id === "inna_khabar_single_number") {
    return common ? chosen(label, common, `قارن دلالة ${target} وصيغته، ولا تنتقل إلى علامة الإعراب قبل تحديد الصورة.`) : undefined;
  }
  if (id === "fael_raf3_mark") {
    const criteria: Record<string, string> = {
      "الضمة الظاهرة": "أن يكون الفاعل مفردًا أو جمع تكسير أو جمع مؤنث سالم صحيح الآخر",
      "الألف": "أن يكون الفاعل مثنى",
      "الواو": "أن يكون الفاعل جمع مذكر سالمًا أو اسمًا من الأسماء الخمسة",
      "ثبوت النون": "أن يكون المحدد فعلًا مضارعًا من الأفعال الخمسة، لا اسمًا",
    };
    return chosen(label, criteria[label] || "أن توافق العلامة صورة الاسم", `ارجع إلى صورة ${target} التي حددتها في الخطوة السابقة.`);
  }
  if (id === "mafool_nasb_mark") {
    const criteria: Record<string, string> = {
      "الفتحة الظاهرة": "أن يكون المفعول به مفردًا أو جمع تكسير صحيح الآخر",
      "الياء": "أن يكون المفعول به مثنى أو جمع مذكر سالمًا",
      "الكسرة نيابةً عن الفتحة": "أن يكون المفعول به جمع مؤنث سالمًا",
      "الألف": "أن يكون المفعول به اسمًا من الأسماء الخمسة مستوفيًا شروطها",
    };
    return chosen(label, criteria[label] || "أن توافق العلامة صورة الاسم", `ارجع إلى صورة ${target} التي حددتها في الخطوة السابقة.`);
  }
  if (id === "fael_mabni_type" || id === "mafool_mabni_type" || id === "mubtada_built" || id === "khabar_single_built" || id === "kana:ism:mabni-type" || id === "inna_ism_built" || id === "inna_khabar_single_built") {
    return common ? chosen(label, common, `طابق ${target} مع تعريف النوع، ولا تعتمد على موقعه الإعرابي وحده.`) : undefined;
  }
  if (id === "fael_role_hidden") {
    const criterion = label === "اسم ظاهر في الجملة" ? "وجود اسم ظاهر بعد الفعل يدل على من قام به" : "أن يكون الاسم الواقع عليه الفعل هو نفسه من قام به";
    return chosen(label, criterion, `ابحث بعد الفعل في ${sentence}، واسأل: ${String(facts.actionQuestion || "من الذي قام بالفعل؟")}`);
  }
  if (id === "fael_hidden_estimate") {
    const person: Record<string, string> = {
      "هو": "مفرد غائب مذكر",
      "هي": "مفرد غائب مؤنث",
      "أنا": "متكلم مفرد",
      "نحن": "متكلمين أو متكلمًا مع غيره",
      "أنت": "مخاطب مفرد",
    };
    return chosen(label, `أن تدل صيغة الفعل والسياق على ${person[label] || "هذا الضمير"}`, `طابق أول الفعل ومعناه مع المتكلم أو المخاطب أو الغائب في ${sentence}.`);
  }

  if (id === "mubtada_function_gate") {
    const criterion = label.includes("قامت") ? "أن يسبق الكلمة فعل وتدل هي على من قام به" : "أن يسبقها فعل ويقع أثره عليها";
    return chosen(label, criterion, `اقرأ بداية ${sentence}: هل بدأ الكلام بفعل، أم بدأنا الحديث عن ${target} ثم أخبرنا عنه؟`);
  }
  if (id === "mubtada_ending" || id === "khabar_single_ending" || id === "kana:ism:form" || id === "kana:khabar:single-form" || id === "inna_ism_ending" || id === "inna_khabar_single_ending") {
    return common ? chosen(label, common, `افحص الحرف الأصلي الأخير في ${target}، ولا تسمِّ الاسم فعلًا ولا تحكم من الحركة وحدها.`) : undefined;
  }

  if (id === "khabar_meaning_gate") {
    if (label.startsWith("نعتت")) return chosen(label, "أن تتبع الكلمة اسمًا قبلها وتصفه مع مطابقته", `اسأل في ${sentence}: هل ${target} مجرد وصف تابع، أم المعلومة التي اكتمل بها المعنى؟`);
    if (label.includes("فاعل")) return chosen(label, "أن يسبق الكلمة فعل وتدل هي على من قام به", `حدّد الفعل أولًا، ثم اسأل هل ${target} قامت به أم أخبرت عن الاسم السابق؟`);
  }
  if (id === "khabar_kind" || id === "kana:khabar:kind" || id === "inna_khabar_kind") {
    return common ? chosen(label, common, `افحص ${target} كاملًا: كلمة واحدة، إسناد داخلي، أم جار ومجرور أو ظرف؟`) : undefined;
  }
  if (id === "khabar_masdar_discovery") {
    const criterion = label.startsWith("صفة") ? "أن يتحول التركيب إلى وصف لا إلى اسم حدث" : "أن يبقى الفعل مستقلًا عن الحرف المصدري السابق";
    return chosen(label, criterion, `حوّل التركيب المحدد إلى اسم واحد يؤدي معناه، ثم اختبر هل بقيت العلاقة بين الحرف والفعل.`);
  }
  if (id === "khabar_sentence_type" || id === "kana:khabar:sentence" || id === "inna_khabar_sentence_type") {
    return common ? chosen(label, common, `انظر إلى أول كلمة في الخبر ${target}، لا إلى كلمة لاحقة داخله.`) : undefined;
  }
  if (id === "khabar_shibh_type" || id === "kana:khabar:shibh" || id === "inna_khabar_shibh_type") {
    return common ? chosen(label, common, `افحص أول كلمة في ${target}: أهي حرف جر أم اسم زمان أو مكان؟`) : undefined;
  }
  if (id === "khabar_shibh_position_jar" || id === "khabar_shibh_position_zarf") {
    const criterion = label.startsWith("تقدّم") ? "أن يتقدم شبه الجملة على مبتدأ نكرة" : "أن يأتي شبه الجملة بعد المبتدأ";
    return chosen(label, criterion, `رتّب عناصر ${sentence} وحدد موضع ${target} بالنسبة إلى المبتدأ.`);
  }
  if (id === "kana:khabar:jar-position" || id === "kana:khabar:zarf-position") {
    const criterion = label === "خبر مقدم" ? "أن يسبق شبه الجملة اسم الناسخ" : "أن يأتي شبه الجملة بعد اسم الناسخ";
    return chosen(label, criterion, `رتّب عناصر ${sentence} وحدد موضع ${target} بالنسبة إلى اسم الناسخ.`);
  }
  if (id === "inna_khabar_shibh_position_jar" || id === "inna_khabar_shibh_position_zarf") {
    const criterion = label.startsWith("تقدم") ? "أن يتقدم شبه الجملة على اسم الحرف الناسخ النكرة" : "أن يأتي شبه الجملة بعد اسم الحرف الناسخ";
    return chosen(label, criterion, `رتّب عناصر ${sentence} وحدد موضع ${target} بالنسبة إلى اسم الحرف الناسخ.`);
  }

  if (id === "kana:role") {
    const criteria: Record<string, string> = {
      "اسم الناسخ": "أن يكون المحدد صاحب المعنى الذي أُسند إليه الخبر بعد الناسخ",
      "خبر الناسخ": "أن يكون المحدد المعلومة التي أتمت المعنى عن اسم الناسخ",
      "اسم مستتر": "ألا يظهر في الجملة اسم أو ضمير متصل يشغل موقع اسم الناسخ",
    };
    return chosen(label, criteria[label] || "أن توافق الوظيفة معنى الجملة", `اسأل في ${sentence}: من الذي كان أو صار؟ وما المعلومة عنه؟`);
  }

  if (id === "inna_kaffa_gate") {
    return chosen(label, label.startsWith("اتصلت") ? "ظهور «ما» متصلة بالحرف الناسخ في رسم الكلمة" : "ورود الحرف الناسخ من غير «ما» الكافة", `انظر إلى الحرف نفسه في ${sentence} قبل الانتقال إلى أثره الإعرابي.`);
  }
  if (id === "inna_kaffa_effect") {
    return chosen(label, "بقاء الحرف الناسخ عاملًا فينصب الاسم ويرفع الخبر", `افحص ما إذا كانت «ما» الكافة قد منعت هذا العمل قبل إعراب ما بعدها.`);
  }
  if (id === "inna_meaning") {
    const part = label === "الاسم وحده" ? "الاسم فقط" : "الخبر فقط";
    return chosen(label, `انحصار معنى الحرف في ${part}`, `احذف الحرف مؤقتًا واقرأ العلاقة الكاملة بين طرفي ${sentence}: هل المعنى متعلق بكلمة واحدة أم بالحكم كله؟`);
  }
  if (id === "inna_compact_role") {
    const criterion = label === "اسم الحرف الناسخ" ? "أن يكون المحدد الاسم الذي يدور عليه الحكم بعد الحرف" : "أن يكون المحدد المعلومة المسندة إلى اسم الحرف الناسخ";
    return chosen(label, criterion, `ارجع إلى أصل الجملة الاسمية في ${sentence}: ما الاسم الذي نتحدث عنه، وما المعلومة عنه؟`);
  }
  if (id === "inna_kaffa_base_role") {
    const criteria: Record<string, string> = {
      "مبتدأ": "أن يكون المحدد الاسم الذي بدأ به الحكم بعد كف الحرف عن العمل",
      "خبر": "أن يكون المحدد المعلومة التي أتمت معنى المبتدأ",
      "اسم الحرف الناسخ": "أن يبقى الحرف عاملًا فينصب اسمه",
    };
    return chosen(label, criteria[label] || "أن توافق الوظيفة أثر «ما» الكافة", `بعد تحديد أثر «ما»، اقرأ ما بعدها كجملة كاملة وحدد وظيفة ${target}.`);
  }

  if (common) return chosen(label, common, `افحص ${target} في ${sentence}، وطابق الدلالة والصيغة قبل الانتقال.`);
  return undefined;
}

export function visualPathWrongHint(node: PositionedNode, choice: VisualChoice, example: Example | null): string {
  const manual = visualChoiceHint(node, choice, example);
  if (manual) return manual;

  const target = quoted(example?.target);
  const sentence = quoted(example?.sentence, "الجملة");
  const question = String(node.text || node.originalNode?.text || "السؤال الحالي")
    .replace(/\s+/g, " ")
    .trim();
  const compactQuestion = question.length > 72 ? `${question.slice(0, 69).trimEnd()}…` : question;
  const fallback = chosen(
    choice.label,
    "وجود دليل مباشر في المثال يثبت الخاصية التي يصفها هذا الخيار",
    `ارجع إلى سؤال «${compactQuestion}»، ثم افحص ${target} داخل ${sentence} وحدد القرينة التي تؤيد هذا الاختيار أو تستبعده.`,
  );
  return fallback.length > 230 ? `${fallback.slice(0, 227).trimEnd()}…` : fallback;
}
