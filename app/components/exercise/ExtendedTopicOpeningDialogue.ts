import type { PedagogyNode, PedagogyState } from "./ExercisePedagogyTypes";

function question(node: PedagogyNode | null | undefined): string {
  return String(node?.text || "").replace(/[.!]+$/g, "").trim();
}

export function extendedTopicOpeningDialogueLine(
  node: PedagogyNode | null | undefined,
  state: PedagogyState,
  target: string,
): string | undefined {
  const id = String(node?.id || "");
  const sentence = String(state?.currentSentence || state?.sentence || "الجملة").trim();
  const facts = (state?.facts || {}) as Record<string, unknown>;

  if (id === "hal_relation") {
    return `نبدأ من المعنى في «${sentence}». ننظر إلى (${target}) ونسأل عن صاحبها وقت وقوع الفعل: كيف كان؟ هل تبين (${target}) هيئته في تلك اللحظة؟`;
  }
  if (id === "hal_kind") {
    return `ثبت أن (${target}) تبين هيئة صاحبها وقت الفعل، فهي حال. الآن لا نعيد سؤال الوظيفة؛ نحدد صورة الحال في الجملة: أهي كلمة واحدة، أم جملة، أم شبه جملة؟`;
  }
  if (id === "hal_shape") {
    return `عرفنا أن الحال هنا كلمة واحدة منصوبة. بقي أن نحدد صورة الاسم (${target})؛ لأن صورة الاسم هي التي ستقودنا إلى علامة النصب.`;
  }
  if (id === "hal_mark") {
    return `عرفنا أن (${target}) حال منصوب، وحددنا صورة الاسم. ما علامة النصب التي تناسب هذه الصورة؟`;
  }

  if (id === "tamyiz_function") {
    return `ننظر إلى (${target}) في «${sentence}». بدل أن نبدأ بالحركة، نسأل: هل جاءت الكلمة لتزيل إبهامًا في اسم قبلها أو في معنى الجملة كلها؟`;
  }
  if (id === "tamyiz_kind") {
    return `ثبت أن (${target}) تزيل إبهامًا، فهي تمييز. الآن نحدد موضع الإبهام: أكان في اسم مقدار أو عدد قبلها، أم في معنى النسبة كلها؟`;
  }
  if (id === "tamyiz_mark") {
    return `عرفنا وظيفة (${target}) ونوع التمييز. بقي الحكم والعلامة: التمييز في هذا المثال منصوب، فما علامة نصبه؟`;
  }

  if (id === "munada_tool") {
    return `نبدأ من النداء في «${sentence}». ابحث عن أداة النداء، ثم اسأل: مَن الذي يُنادى؟ هل (${target}) هو المقصود بالنداء؟`;
  }
  if (id === "munada_kind") {
    return `ثبت أن (${target}) منادى. لا نبدأ بحفظ المصطلحات؛ ننظر إلى الخاصية الظاهرة في المثال: أهو اسم علم معيّن، أم نكرة، أم اتصل به ما يتمم معناه؟`;
  }
  if (id === "munada_nakira_intent") {
    return `عرفنا أن (${target}) نكرة. هل يقصد المتكلم بها شخصًا معيّنًا حاضرًا، أم يوجّه النداء إلى أي فرد من الجنس؟`;
  }
  if (id === "munada_completion_kind") {
    return `عرفنا أن معنى (${target}) اكتمل بما بعدها. هل جاءت بعدها إضافة صريحة بمضاف إليه مجرور، أم تعلق بها ما يتمم المعنى من غير إضافة؟`;
  }
  if (/^munada_(alam|maqsuda|ghayr|mudaf|shibh)_term$/.test(id)) {
    return `بعد أن اكتشفنا الخاصية من المثال، نربطها الآن بالمصطلح النحوي المناسب دون قفز.`;
  }
  if (id === "munada_shape") {
    return `عرفنا أن هذا النوع من المنادى معرب منصوب. لنحدد صورة الاسم (${target}) قبل اختيار علامة النصب.`;
  }
  if (id === "munada_mark") {
    return `ثبت أن (${target}) منادى منصوب وحددنا صورة الاسم. ما علامة النصب المناسبة لهذه الصورة؟`;
  }

  if (id === "istithna_tool") {
    return `نبدأ من تركيب الاستثناء في «${sentence}». هل جاءت (${target}) بعد أداة استثناء مثل «إلا»؟`;
  }
  if (id === "istithna_complete") {
    return `ثبت وجود أداة الاستثناء قبل (${target}). قبل الحكم على ما بعدها نسأل: هل ذُكر المستثنى منه في الجملة، أم أن الاستثناء مفرغ؟`;
  }
  if (id === "istithna_polarity") {
    return `عرفنا أن الاستثناء تام لأن المستثنى منه مذكور. الآن نحدد الحكم من نوع الجملة: أهي مثبتة أم منفية؟`;
  }
  if (id === "istithna_negative_choice") {
    return `عرفنا أن الاستثناء تام منفي، ولذلك يجوز أكثر من وجه. انظر إلى ضبط (${target}) وعلاقته بالمستثنى منه: أي الوجهين استُعمل هنا؟`;
  }
  if (id === "istithna_mufarragh_role") {
    return `ثبت أن الاستثناء مفرغ؛ لذلك لا نسمي (${target}) مستثنى. احذف «إلا» ذهنيًا مع بقاء النفي، ثم اسأل: ما الموقع الذي يحتاجه العامل في الجملة؟`;
  }
  if (id === "istithna_shape") {
    return `وصلنا إلى أن (${target}) مستثنى منصوب في هذا المثال. نحدد الآن صورة الاسم حتى نعرف علامة النصب.`;
  }
  if (id === "istithna_mark") {
    return `عرفنا أن (${target}) مستثنى منصوب وحددنا صورته. ما علامة النصب المناسبة؟`;
  }

  if (id === "la_gate") {
    return `نبدأ من «لا» في «${sentence}». هل تنفي الحكم عن الجنس كله، وجاء بعدها اسم نكرة مباشرة حتى تعمل عمل «إنَّ»؟`;
  }
  if (id === "la_name") {
    return `ثبت أن «لا» نافية للجنس عاملة. الآن نسأل: ما الجنس الذي وقع عليه النفي؟ هل الكلمة (${target}) هي اسم «لا»؟`;
  }
  if (id === "la_kind") {
    return `عرفنا أن (${target}) اسم «لا». بقي أن نحدد نوعه؛ لأن المفرد اصطلاحًا يُبنى، أما المضاف والشبيه بالمضاف فيُعربان منصوبين.`;
  }
  if (id === "la_built_shape") {
    return `عرفنا أن اسم «لا» هنا مفرد اصطلاحًا، ولذلك يُبنى على ما يُنصب به. ما صورة (${target}) التي تحدد علامة البناء؟`;
  }
  if (id === "la_nasb_shape") {
    return `عرفنا أن اسم «لا» هنا مضاف أو شبيه بالمضاف، ولذلك هو معرب منصوب. ما صورة الاسم (${target})؟`;
  }
  if (id === "la_nasb_mark") {
    return `ثبت أن (${target}) اسم «لا» منصوب وحددنا صورته. ما علامة النصب المناسبة لهذه الصورة؟`;
  }

  if (id === "naib_passive") {
    const verb = String(facts.passiveVerb || "الفعل").trim();
    return `نبدأ بالفعل (${verb}) في «${sentence}». هل صيغته مبنية للمجهول بحيث حُذف الفاعل من الجملة؟`;
  }
  if (id === "naib_role") {
    const verb = String(facts.passiveVerb || "الفعل المبني للمجهول").trim();
    return `ثبت أن (${verb}) مبني للمجهول. لا نسأل «من قام بالفعل؟»؛ بل نسأل: ما الاسم الذي أُسند إليه الفعل بعد حذف الفاعل؟ هل هو (${target})؟`;
  }
  if (id === "naib_form") {
    return `ثبت أن (${target}) نائب فاعل، ونائب الفاعل مرفوع. الآن نحدد أولًا: هل هو اسم معرب فتظهر له علامة رفع، أم اسم مبني فنقول «في محل رفع»؟`;
  }
  if (id === "naib_shape") {
    return `عرفنا أن (${target}) نائب فاعل ظاهر معرب مرفوع. بقي أن نحدد نوع الاسم قبل اختيار علامة الرفع.`;
  }
  if (id === "naib_mark") {
    return `ثبت أن (${target}) نائب فاعل مرفوع وحددنا نوع الاسم. ما علامة الرفع المناسبة؟`;
  }
  if (id === "naib_mabni_type") {
    return `عرفنا أن نائب الفاعل (${target}) اسم مبني، لذلك لا نبحث عن علامة رفع ظاهرة. ما نوع هذا الاسم المبني حتى نصوغ الإعراب كاملًا؟`;
  }

  if (id === "manqous_identity") {
    return `نبدأ من بنية (${target}) نفسها. هل أصلها اسم معرب آخره ياء لازمة مكسور ما قبلها، مثل «القاضي» و«الساعي»؟`;
  }
  if (id === "manqous_has_al") {
    return `ثبت أن (${target}) اسم منقوص. أول ما يحدد بقاء الياء هو التعريف: هل دخلت عليه «الـ»؟`;
  }
  if (id === "manqous_is_added") {
    return `استبعدنا التعريف بـ«الـ». نفحص السبب الثاني لبقاء الياء: هل (${target}) مضاف إلى اسم أو ضمير بعده؟`;
  }
  if (id === "manqous_case_kept") {
    return `ثبتت ياء الاسم المنقوص لأنه معرّف بـ«الـ» أو مضاف. بقي أن نحدد حالته الإعرابية؛ فهي التي تحدد ظهور الفتحة أو تقدير الضمة والكسرة.`;
  }
  if (id === "manqous_indef_case") {
    return `عرفنا أن (${target}) اسم منقوص نكرة غير مضاف. الآن الحالة الإعرابية هي التي تحدد: هل تثبت الياء في النصب أم تحذف في الرفع والجر؟`;
  }

  if (/^(hal_|tamyiz_|munada_|istithna_|la_|naib_|manqous_)/.test(id)) {
    const context = String(node?.context || "نكمل من النتيجة التي وصلنا إليها").replace(/[.،؛]+$/g, "").trim();
    return `${context}؛ ${question(node)}`;
  }

  return undefined;
}
