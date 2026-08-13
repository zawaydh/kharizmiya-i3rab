import type { ExerciseAnswer } from "../../../lib/exercise/model";
import type { PedagogyNode, PedagogyState } from "./ExercisePedagogyTypes";

function factsOf(state?: PedagogyState) {
  return (state?.facts || {}) as Record<string, unknown>;
}
function textFact(facts: Record<string, unknown>, key: string, fallback: string) {
  const value = String(facts[key] || "").trim();
  return value || fallback;
}
function pickedText(picked?: ExerciseAnswer) {
  return String(picked?.text || "").trim();
}

function nextStepCue(id: string, target: string): string {
  const cues: Record<string, string> = {
    hal_relation: `بعد إثبات أن (${target}) تبين الهيئة ننتقل إلى صورة الحال.`,
    hal_kind: `بعد تحديد صورة الحال ننتقل ـ إن كان مفردًا ـ إلى صورة الاسم وعلامة النصب.`,
    hal_shape: `بعد معرفة صورة (${target}) نختار علامة النصب التي تخص هذه الصورة.`,
    hal_mark: `العلامة آخر خطوة بعد ثبوت الوظيفة والحكم والصورة.`,
    tamyiz_function: `بعد إثبات أن (${target}) تزيل الإبهام نحدد أين كان هذا الإبهام.`,
    tamyiz_kind: `بعد تحديد نوع التمييز نصل إلى حكمه وعلامته في هذا المثال.`,
    tamyiz_mark: `لا نختار العلامة قبل أن نثبت وظيفة التمييز ونوعه.`,
    munada_tool: `بعد إثبات أن (${target}) هو المنادى نحدد نوع المنادى.`,
    munada_kind: `نوع المنادى هو الذي يحدد البناء في محل نصب أو الإعراب بالنصب.`,
    munada_shape: `بعد تحديد صورة الاسم نختار علامة النصب المناسبة.`,
    munada_mark: `هذه العلامة نتيجة لما ثبت قبلها: منادى منصوب + صورة الاسم.`,
    istithna_tool: `بعد أداة الاستثناء لا نحكم مباشرة؛ نبحث أولًا عن المستثنى منه.`,
    istithna_complete: `بعد التام أو المفرغ نحدد الخطوة التالية من بنية الجملة نفسها.`,
    istithna_polarity: `في الاستثناء التام يحدد النفي أو الإثبات حكم ما بعد «إلا».`,
    istithna_negative_choice: `اختر الوجه الذي يوافق ضبط (${target}) وعلاقته بالمستثنى منه.`,
    istithna_mufarragh_role: `في المفرغ نعود إلى العامل الحقيقي ونحدد الموقع الإعرابي.`,
    istithna_shape: `بعد ثبوت النصب نحدد صورة الاسم ثم علامته.`,
    istithna_mark: `العلامة تأتي بعد ثبوت الاستثناء والحكم وصورة الاسم.`,
    la_gate: `إذا ثبت أن «لا» عاملة نبحث بعد ذلك عن اسمها.`,
    la_name: `بعد تحديد اسم «لا» نحدد نوعه: مفرد اصطلاحًا أم مضاف أم شبيه بالمضاف.`,
    la_kind: `نوع اسم «لا» هو الذي يحدد البناء أو الإعراب بالنصب.`,
    la_built_shape: `بعد ثبوت البناء نحدد ما الذي يُبنى عليه بحسب صورة الاسم.`,
    la_nasb_shape: `بعد معرفة صورة الاسم نختار علامة نصبه.`,
    la_nasb_mark: `العلامة نتيجة للحكم والصورة اللذين أثبتناهما.`,
    naib_passive: `إذا ثبت البناء للمجهول نبحث عن الاسم الذي أُسند إليه الفعل بعد حذف الفاعل.`,
    naib_role: `بعد ثبوت نائب الفاعل نعرف أن حكمه الرفع، ثم نحدد صورته.`,
    naib_form: `صورة نائب الفاعل تحدد هل نبحث عن علامة رفع أم نقول «في محل رفع».`,
    naib_shape: `بعد معرفة نوع الاسم نختار علامة الرفع المناسبة.`,
    naib_mark: `لا نصل إلى العلامة إلا بعد ثبوت نائب الفاعل والرفع ونوع الاسم.`,
    naib_mabni_type: `بعد تحديد نوع المبني نصوغ النتيجة: مبني في محل رفع نائب فاعل.`,
  };
  return cues[id] || `ارجع إلى ما أثبتناه في الخطوة السابقة، ثم أجب عن هذه الخطوة فقط.`;
}

export function extendedTopicStudentHintText(
  node: PedagogyNode | null | undefined,
  picked?: ExerciseAnswer,
  state?: PedagogyState,
): string | undefined {
  const id = String(node?.id || "");
  if (!/^(hal_|tamyiz_|munada_|istithna_|la_|naib_)/.test(id)) return undefined;

  const facts = factsOf(state);
  const target = String(state?.currentTarget || "الكلمة المحددة").trim();
  const sentence = String(state?.currentSentence || state?.sentence || "").trim();
  const chosen = pickedText(picked);
  const pickedDiagnostic = String(picked?.hint || "").replace(/^💡\s*/, "").trim();

  if (chosen && pickedDiagnostic) {
    return `اختيار «${chosen}» لا يطابق هذه الخطوة في الجملة «${sentence}». ${pickedDiagnostic} ${nextStepCue(id, target)}`;
  }

  if (id === "hal_relation") {
    const owner = textFact(facts, "owner", "صاحب الحال");
    const question = textFact(facts, "howQuestion", `كيف كان ${owner} وقت وقوع الفعل؟`);
    const paraphrase = textFact(facts, "halParaphrase", `ضع «وهو/وهي» قبل معنى (${target})`);
    return `اسأل من معنى الجملة: ${question} إذا كانت (${target}) تجيب عن «كيف؟» وتبين هيئة ${owner} وقت الفعل، فهذا هو الدليل المطلوب. جرّب أيضًا: ${paraphrase}. إذا استقام المعنى، فهذه قرينة قوية على وظيفة الكلمة.`;
  }
  if (id === "hal_kind") {
    const kind = String(facts.halKind || "");
    const correct = kind === "single" ? "كلمة واحدة" : kind === "nominal_sentence" ? "جملة اسمية" : kind === "verbal_sentence" ? "جملة فعلية" : "شبه جملة";
    return `ثبت أن (${target}) يؤدي وظيفة الحال. الآن لا نعيد سؤال الوظيفة؛ نحدد الصورة فقط. انظر إلى المحدد في «${sentence}»: هو ${correct}. تذكّر أن «الحال المفرد» في هذا الباب يعني كلمة واحدة، لا أنه مفرد في العدد بالضرورة.`;
  }
  if (id === "hal_shape" || id === "hal_mark") {
    const shape = String(facts.shape || "");
    const label = shape === "dual" ? "مثنى" : shape === "jms" ? "جمع مذكر سالم" : shape === "jfs" ? "جمع مؤنث سالم" : shape === "jt" ? "جمع تكسير" : "مفرد";
    const mark = String(facts.nasbMark || "") === "yaa" ? "الياء" : String(facts.nasbMark || "") === "kasra" ? "الكسرة نيابةً عن الفتحة" : "الفتحة";
    return `عرفنا أن (${target}) حال مفرد منصوب. صورة الكلمة هي «${label}»، ولذلك علامة النصب المناسبة هي ${mark}. لا تنقل علامة صاحب الحال إلى الحال؛ العلامة تأتي من صورة الحال نفسه.`;
  }

  if (id === "tamyiz_function") {
    const ambiguity = textFact(facts, "ambiguity", "الجزء المبهم");
    const probe = textFact(facts, "probe", "ما الذي توضحه هذه الكلمة؟");
    return `اسأل: ${probe} في الجملة «${sentence}». (${target}) لا تصف هيئة صاحبها، بل تفسر ${ambiguity} وتزيل إبهامه. هذا هو جوهر التمييز. وتقدير «من» مجرد قرينة مساعدة في بعض الأمثلة، وليس شرطًا عامًا.`;
  }
  if (id === "tamyiz_kind") {
    const kind = String(facts.tamyizKind || "");
    return kind === "malfuz"
      ? `الإبهام هنا موجود في اسم مذكور قبل (${target}) مثل عدد أو مقدار أو وزن؛ لذلك هو تمييز ملفوظ. حدّد موضع الإبهام أولًا ولا تعتمد على حفظ الاسم.`
      : `الإبهام هنا ليس في اسم مقدار بعينه، بل في معنى النسبة كلها: ما الذي ازداد أو امتلأ أو فُضِّل من جهته؟ لذلك هو تمييز ملحوظ.`;
  }
  if (id === "tamyiz_mark") {
    return `بعد أن أثبتنا أن (${target}) تمييز، نصل إلى الحكم: التمييز في هذا المثال منصوب. والكلمة مفردة نكرة ظاهرة، فعلامة نصبها الفتحة. لا تبدأ بالفتحة قبل إثبات وظيفة التمييز.`;
  }

  if (id === "munada_tool") {
    return `انظر إلى «${sentence}». ابحث عن أداة النداء ثم اسأل: من الذي أُناديه؟ إذا كانت الإجابة هي (${target}) فقد ثبت موقع المنادى.`;
  }
  if (id === "munada_kind") {
    const kind = String(facts.munadaKind || "");
    const explanation =
      kind === "alam" ? "اسم علم مفرد مقصود بذاته؛ فيبنى على ما يرفع به في محل نصب" :
      kind === "nakira_maqsuda" ? "نكرة يقصد بها شخص معين؛ فتبنى على ما ترفع به في محل نصب" :
      kind === "mudaf" ? "أضيفت إلى اسم بعدها يتمم معناها؛ فهي مضاف ومعربة منصوبة" :
      kind === "shibh_mudaf" ? "تعلق بها ما يتمم معناها من غير إضافة صريحة؛ فهي شبيه بالمضاف ومنصوبة" :
      "نكرة لا يقصد بها شخص معين؛ فهي نكرة غير مقصودة ومنصوبة";
    return `لقد ثبت أن (${target}) منادى. الآن نوعه هو الذي يحكم الطريق: ${explanation}. عد إلى السؤال واختر النوع الذي يصف المثال نفسه.`;
  }
  if (id === "munada_shape" || id === "munada_mark") {
    const shape = String(facts.shape || "");
    const mark = String(facts.nasbMark || "");
    if (shape === "five") {
      return `(${target}) من الأسماء الخمسة. لا يكفي الاسم وحده؛ تحقق من شروط الإعراب بالحروف: مفرد، مكبر، مضاف، ومضاف إلى غير ياء المتكلم؛ ومع «ذو» تكون بمعنى صاحب، ومع «فو» تكون خالية من الميم. بعد تحقق الشروط تكون علامة النصب الألف.`;
    }
    const label = shape === "dual" ? "مثنى" : shape === "jms" ? "جمع مذكر سالم" : "مفرد";
    const markLabel = mark === "yaa" ? "الياء" : "الفتحة";
    return `عرفنا أن هذا النوع من المنادى منصوب. (${target}) ${label}، ولذلك علامة نصبه ${markLabel}.`;
  }

  if (id === "istithna_tool") {
    return `ابدأ من الأداة في «${sentence}»: هل جاءت (${target}) بعد «إلا»؟ إذا نعم فلا تحكم بالنصب بعد؛ الخطوة التالية هي معرفة هل ذُكر المستثنى منه.`;
  }
  if (id === "istithna_complete") {
    const complete = Boolean(facts.isComplete);
    const excludedFrom = textFact(facts, "excludedFrom", "المستثنى منه");
    return complete
      ? `ابحث عن المجموعة التي أُخرجت منها (${target}). هي مذكورة في الجملة: ${excludedFrom}. إذن الاستثناء تام، وننتقل إلى النفي أو الإثبات.`
      : `لا توجد في الجملة مجموعة مذكورة أُخرجت منها (${target}). إذن الاستثناء مفرغ. في المفرغ لا نعرب ما بعد «إلا» مستثنى؛ بل حسب موقعه الحقيقي.`;
  }
  if (id === "istithna_polarity") {
    return Boolean(facts.isAffirmative)
      ? `الجملة لا تحتوي أداة نفي، فهي تامة مثبتة. في التام المثبت يجب نصب المستثنى بـ«إلا».`
      : `الجملة تامة لكنها منفية. هنا لا يوجد حكم واحد آلي: يجوز النصب على الاستثناء، ويجوز الإتباع للمستثنى منه. اقرأ ضبط (${target}) في المثال لتعرف الوجه المستعمل.`;
  }
  if (id === "istithna_negative_choice") {
    return String(facts.exceptRole || "") === "follow"
      ? `في «${sentence}» جاءت (${target}) موافقة للمستثنى منه في الإعراب، فهذا وجه الإتباع، ويعرب في هذا المستوى بدلًا منه.`
      : `في «${sentence}» جاءت (${target}) منصوبة؛ فهذا هو وجه النصب على الاستثناء، وهو جائز في الاستثناء التام المنفي.`;
  }
  if (id === "istithna_mufarragh_role") {
    const role = String(facts.mufarraghRole || "");
    const label = role === "fael" ? "فاعلًا" : role === "mafool" ? "مفعولًا به" : "اسمًا مجرورًا";
    return `الاستثناء مفرغ، فاحذف «إلا» ذهنيًا مع بقاء النفي واسأل عن العامل: ما الموقع الذي يحتاجه؟ في هذا المثال تؤدي (${target}) وظيفة ${label}. لذلك لا تسمها مستثنى.`;
  }
  if (id === "istithna_shape" || id === "istithna_mark") {
    const shape = String(facts.shape || "");
    const label = shape === "dual" ? "مثنى" : shape === "jms" ? "جمع مذكر سالم" : "مفرد";
    const mark = String(facts.nasbMark || "") === "yaa" ? "الياء" : "الفتحة";
    return `ثبت أن (${target}) مستثنى منصوب في هذا المثال. صورته ${label}، ولذلك علامة نصبه ${mark}.`;
  }

  if (id === "la_gate") {
    return `افحص معنى «لا» في «${sentence}». هل تنفي الحكم عن الجنس كله، واسمها نكرة جاء بعدها مباشرة؟ إذا تحققت شروط العمل فهي «لا» النافية للجنس العاملة عمل «إنَّ».`;
  }
  if (id === "la_name") {
    return `بعد ثبوت عمل «لا»، اسأل: ما الجنس الذي وقع عليه النفي؟ الكلمة التي تسمي هذا الجنس هي اسم «لا». في هذا المثال هي (${target}).`;
  }
  if (id === "la_kind") {
    const kind = String(facts.laNameKind || "");
    if (kind === "mufrad") return `«مفرد» في باب «لا» لا يعني واحدًا في العدد؛ بل يعني غير مضاف ولا شبيه بالمضاف. (${target}) كذلك، لذلك يبنى على ما ينصب به في محل نصب.`;
    if (kind === "mudaf") return `انظر إلى ما بعد (${target}): هناك مضاف إليه يتمم معناه، لذلك اسم «لا» مضاف، والمضاف هنا معرب منصوب.`;
    return `تعلق بـ(${target}) ما يتمم معناه من غير إضافة صريحة، لذلك هو شبيه بالمضاف، وحكمه الإعراب بالنصب لا البناء.`;
  }
  if (id === "la_built_shape") {
    return String(facts.buildMark || "") === "yaa"
      ? `اسم «لا» مفرد اصطلاحًا لكنه مثنى أو جمع مذكر سالم في الصورة، لذلك يبنى على الياء ـ أي على ما ينصب به ـ في محل نصب.`
      : `اسم «لا» مفرد اصطلاحًا ومفرد في الصورة، لذلك يبنى على الفتح في محل نصب.`;
  }
  if (id === "la_nasb_shape" || id === "la_nasb_mark") {
    const shape = String(facts.shape || "");
    if (shape === "five") {
      return `(${target}) من الأسماء الخمسة، وهو هنا اسم «لا» مضاف معرب منصوب. تحقق دائمًا من الشروط: مفرد، مكبر، مضاف، ومضاف إلى غير ياء المتكلم؛ ومع «ذو» بمعنى صاحب، ومع «فو» بلا ميم. لذلك علامة نصبه الألف.`;
    }
    const label = shape === "dual" ? "مثنى" : shape === "jms" ? "جمع مذكر سالم" : "مفرد";
    const mark = String(facts.nasbMark || "") === "yaa" ? "الياء" : "الفتحة";
    return `عرفنا أن اسم «لا» هنا معرب منصوب لأنه مضاف أو شبيه بالمضاف. صورته ${label}، ولذلك علامة نصبه ${mark}.`;
  }

  if (id === "naib_passive") {
    const verb = textFact(facts, "passiveVerb", "فعل الجملة");
    const tense = String(facts.passiveTense || "");
    return tense === "present"
      ? `افحص الفعل (${verb}): في المضارع المبني للمجهول يُضم أوله ويُفتح ما قبل آخره غالبًا، مثل «يُكتَبُ». إذا ثبت البناء للمجهول نبحث عن نائب الفاعل.`
      : `افحص الفعل (${verb}): في الماضي المبني للمجهول يُضم أوله ويُكسر ما قبل آخره غالبًا، مثل «كُتِبَ». إذا ثبت البناء للمجهول نبحث عما أُسند إليه الفعل بعد حذف الفاعل.`;
  }
  if (id === "naib_role") {
    const verb = textFact(facts, "passiveVerb", "الفعل المبني للمجهول");
    return `لا تسأل «من قام بالفعل؟»؛ الفاعل محذوف. اسأل: ما الذي أُسند إليه (${verb}) بعد حذف الفاعل؟ في هذا المثال الإجابة هي (${target})، ولذلك هي نائب فاعل.`;
  }
  if (id === "naib_form") {
    const kind = String(facts.roleKind || "");
    const label = kind === "connected" ? "ضمير متصل" : kind === "mabni" ? "اسم مبني" : "اسم ظاهر معرب";
    return `عرفنا أن (${target}) نائب فاعل وحكمه الرفع. الآن نحدد صورته فقط: هو ${label}. هذه الخطوة هي التي تقودنا إلى علامة الرفع أو إلى قولنا «في محل رفع».`;
  }
  if (id === "naib_shape" || id === "naib_mark") {
    const shape = String(facts.shape || "");
    if (shape === "five") {
      return `(${target}) من الأسماء الخمسة. كرر شروط الإعراب بالحروف: مفرد، مكبر، مضاف، ومضاف إلى غير ياء المتكلم؛ ومع «ذو» بمعنى صاحب، ومع «فو» خالية من الميم. إذا تحققت الشروط فعلامة الرفع الواو.`;
    }
    const label = shape === "dual" ? "مثنى" : shape === "jms" ? "جمع مذكر سالم" : shape === "jfs" ? "جمع مؤنث سالم" : shape === "jt" ? "جمع تكسير" : "مفرد";
    const mark = String(facts.raf3Mark || "") === "alif" ? "الألف" : String(facts.raf3Mark || "") === "waw" ? "الواو" : "الضمة";
    return `ثبت أن (${target}) نائب فاعل مرفوع. صورته ${label}، ولذلك علامة رفعه ${mark}.`;
  }
  if (id === "naib_mabni_type") {
    return `الاسم المبني لا نبحث له عن ضمة أو ألف أو واو. حدّد نوع (${target})، ثم تكون النتيجة: اسم مبني في محل رفع نائب فاعل.`;
  }

  return chosen ? `راجع اختيارك «${chosen}» في ضوء الجملة «${sentence}»، وطبّق خطوة السؤال الحالية فقط.` : undefined;
}
