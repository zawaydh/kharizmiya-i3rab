import type { PedagogyNode, PedagogyState } from "./ExercisePedagogyTypes";

const DIACRITICS = /[ًٌٍَُِّْـ]/g;
const clean = (value: unknown) => String(value ?? "").replace(DIACRITICS, "").trim();
const factText = (state: PedagogyState | undefined, key: string) => String(state?.facts?.[key] ?? "").trim();

function shapeValue(state?: PedagogyState) {
  return factText(state, "shape") || factText(state, "number");
}

function shapeClue(target: string, shape: string) {
  if (shape === "dual")
    return `ركّز على عدد ما تدل عليه «${target}»: هي تدل على اثنين، وراقب علامة التثنية في آخرها. حدّد الصورة من هذه القرينة قبل التفكير في علامة الإعراب.`;
  if (shape === "jms")
    return `«${target}» تدل على جماعة مذكرين، ومفردها يبقى سالم البنية عند الجمع. افحص النهاية التي تلحق هذا النوع من الجموع، ثم اختر صورته.`;
  if (shape === "jfs")
    return `«${target}» تدل على جماعة مؤنثة، وراقب «ات» في آخرها؛ هذه قرينة صرفية مهمة لاختيار صورة الاسم.`;
  if (shape === "jt")
    return `قارن «${target}» بمفردها: صورة المفرد تتغير عند الجمع، ولا تظهر علامة جمع سالم ثابتة في آخرها. استخدم هذا الفرق لاختيار الصورة.`;
  if (shape === "five")
    return `لا يكفي أن «${target}» تدل على واحد. افحص هل هي من: أب، أخ، حم، فو، ذو، مع تحقق الشروط: أن تكون مكبّرة، مضافة، ومضافة إلى غير ياء المتكلم. إذا تحققت فتعامل معها ضمن باب الأسماء الخمسة.`;
  if (shape === "singular_or_jt")
    return `في هذا المسار جُمعت صورتان لهما العلامة الأصلية نفسها. افحص «${target}»: إن دلت على واحد فهي مفرد، وإن دلت على جمع تغيّرت فيه صورة المفرد فهي جمع تكسير؛ وكلاهما يسلك هنا المسار نفسه.`;
  return `انظر إلى مدلول «${target}» نفسه: هل يدل على فرد واحد من غير علامة تثنية أو جمع سالم، وليس من الأسماء الخمسة؟ استخدم العدد والبنية، لا الحركة الأخيرة، لتحديد الصورة.`;
}

function markClue(target: string, shape: string, grammaticalCase: "raf3" | "nasb" | "jarr") {
  if (shape === "five") {
    if (grammaticalCase === "raf3")
      return `ثبت أن «${target}» من الأسماء الخمسة. تذكّر ترتيب حروفها: حرف الرفع يختلف عن ألف النصب وياء الجر. اختر حرف الرفع.`;
    if (grammaticalCase === "nasb")
      return `ثبت أن «${target}» من الأسماء الخمسة. لا تستعمل حركة النصب الأصلية هنا؛ اختر الحرف الذي تقابل به الأسماء الخمسة واو الرفع وياء الجر.`;
    return `ثبت أن «${target}» من الأسماء الخمسة. في الجر لا تستعمل الكسرة، بل الحرف الثالث من علامات هذا الباب بعد واو الرفع وألف النصب.`;
  }
  if (shape === "dual") {
    if (grammaticalCase === "raf3")
      return `ثبت أن «${target}» مثنى ومرفوع. المثنى يرفع بحرف يختلف عن الحرف الذي يستعمله في النصب والجر؛ انظر إلى آخر الكلمة قبل النون واختر حرف الرفع.`;
    return `ثبت أن «${target}» مثنى و${grammaticalCase === "nasb" ? "منصوب" : "مجرور"}. المثنى يستعمل في النصب والجر الحرف نفسه قبل النون؛ حدده من صورة الكلمة.`;
  }
  if (shape === "jms") {
    if (grammaticalCase === "raf3")
      return `ثبت أن «${target}» جمع مذكر سالم ومرفوع. هذا الجمع لا يرفع بالضمة في هذا الباب؛ اختر حرف الرفع الخاص به.`;
    return `ثبت أن «${target}» جمع مذكر سالم و${grammaticalCase === "nasb" ? "منصوب" : "مجرور"}. النصب والجر فيه يشتركان في حرف واحد؛ ابحث عنه قبل النون.`;
  }
  if (shape === "jfs" && grammaticalCase === "nasb")
    return `ثبت أن «${target}» جمع مؤنث سالم منصوب. هنا تنوب حركة الجر عن الفتحة في النصب؛ اختر تلك الحركة.`;
  if (grammaticalCase === "raf3")
    return `ثبت أن «${target}» مرفوع وصورته لا تحتاج حرفًا نائبًا في الرفع. استبعد علامات النصب والجر، واختر حركة الرفع الأصلية على آخر الاسم.`;
  if (grammaticalCase === "nasb")
    return `ثبت أن «${target}» منصوب وصورته لا تحتاج حرفًا نائبًا في النصب. استبعد علامات الرفع والجر، واختر حركة النصب الأصلية على آخر الاسم.`;
  return `ثبت أن «${target}» مجرور وصورته لا تحتاج حرفًا نائبًا في الجر. اختر حركة الجر الأصلية على آخر الاسم.`;
}

function endingClue(target: string, ending: string) {
  if (ending === "ya" || ending === "manqous")
    return `انظر إلى آخر «${target}» بعد حذف الحركة فقط: هل تنتهي بياء لازمة قبلها كسرة؟ هذه هي القرينة التي تحتاجها في هذه الخطوة.`;
  if (ending === "alif" || ending === "maqsur" || ending === "weak")
    return `انظر إلى الحرف الأصلي الأخير في «${target}»، لا إلى الحركة: هل ينتهي الاسم بألف لازمة أو بحرف علة يمنع ظهور بعض الحركات؟`;
  if (ending === "yaa_mutakallim")
    return `لاحظ ياء المتكلم المتصلة بآخر «${target}». اتصال هذه الياء يحجب ظهور الحركة على ما قبلها، فميّز هذه الحالة عن الاسم الصحيح الآخر.`;
  return `افحص الحرف الأخير من «${target}» بعد تجاهل الحركة الإعرابية: هل هو حرف صحيح ظاهر، أم ألف/ياء لازمة تؤثر في ظهور العلامة؟`;
}

function inflectionClue(target: string, built: boolean) {
  if (built)
    return `اختبر ثبات صورة «${target}» عند تغير الموقع. الأسماء المبنية تبقى صورتها ثابتة، فنقول في الإعراب «في محل…» بدل البحث عن ضمة أو فتحة أو كسرة ظاهرة على آخرها.`;
  return `جرّب نقل «${target}» بين مواقع الرفع والنصب والجر ذهنيًا. إذا كان آخر الاسم يقبل تغير العلامة بحسب الموقع فنحن نتابع مسار الاسم المعرب، لا مسار «في محل…».`;
}

function builtTypeClue(target: string, kind: string) {
  if (kind === "ishara")
    return `وظيفة «${target}» هنا أن تشير إلى معيّن حاضر أو معروف، مثل: هذا/هذه/هؤلاء. سمِّ نوع الاسم المبني من وظيفته.`;
  if (kind === "mawsul" || kind === "mawsool")
    return `«${target}» لا يكتمل المقصود بها وحدها؛ تأتي بعدها جملة توضّح من المراد بها، وتسمى تلك الجملة صلة. استخدم هذه الخاصية لاختيار النوع.`;
  if (kind === "damir" || kind === "connected")
    return `«${target}» تحيل إلى متكلم أو مخاطب أو غائب بدل إعادة الاسم. إن كانت ملتصقة بكلمة قبلها فانتبه إلى كونها ضميرًا متصلًا، وإن استقلت فافحص صورة الضمير المنفصل.`;
  if (kind === "detached")
    return `«${target}» تدل على متكلم أو مخاطب أو غائب، لكنها تقف كلمة مستقلة ولا تتصل بما قبلها. هذه القرينة تميز نوع المبني.`;
  if (kind === "istifham")
    return `«${target}» تستعمل لطلب جواب عن مجهول في صيغة سؤال. سمِّ نوع الاسم المبني من هذه الوظيفة.`;
  if (kind === "shart")
    return `«${target}» تربط حصول جواب بحصول شرط بعدَها. هذه العلاقة بين جملتين هي القرينة التي تحدد نوع الاسم المبني.`;
  if (kind === "kam_khabariyya" || kind === "kam")
    return `«${target}» هنا لا تطلب عددًا مجهولًا، بل تخبر عن كثرة. فرّق بين الاستفهام الحقيقي والإخبار عن الكثرة قبل اختيار النوع.`;
  return `لا تعتمد على كون «${target}» مبنية فقط؛ اسأل عن وظيفتها في الجملة: أتشير، أم تصل باسم بجملة، أم تحيل إلى متكلم/مخاطب/غائب، أم تستفهم أو تشترط؟`;
}

function wordOrSourceClue(target: string, roleKind: string) {
  const normalized = clean(target);
  if (roleKind === "masdar" || roleKind === "source" || /^(أن|أنّ|ما)\s/u.test(normalized) || normalized.includes(" "))
    return `اقرأ المحدد كاملًا «${target}»، لا كلمةً واحدة منه. جرّب استبداله باسم صريح يؤدي المعنى نفسه؛ مثل «أن تنجح» ← «نجاحك». إذا أمكن ذلك فالمحدد تركيب يؤدي وظيفة الاسم.`;
  return `انظر إلى حدود التحديد في الجملة: «${target}» وحدة لفظية واحدة، وليست «أنْ/أنَّ» مع فعل أو جملة يمكن تأويلها باسم صريح. اختر الصورة على هذا الأساس.`;
}

function sentenceTypeClue(target: string) {
  const first = clean(target).split(/\s+/)[0] || target;
  return `ابدأ من أول كلمة في التركيب «${target}»: «${first}». إذا بدأت الجملة بفعل فهي فعلية، وإذا بدأت باسم وأُسند إليه خبر فهي اسمية. لا تحكم من آخر كلمة في التركيب.`;
}

function weakVerbBase(target: string, weak: string, imperative = false) {
  const t = clean(target).replace(/^[ولفبك]?ِ?/u, "");
  if (weak === "alif") return imperative || /سع/u.test(t) ? "هو يسعى" : "أعده إلى صورة الرفع مع «هو»";
  if (weak === "waw") return imperative || /دع/u.test(t) ? "هو يدعو" : "أعده إلى صورة الرفع مع «هو»";
  if (weak === "ya") return imperative || /رم/u.test(t) ? "هو يرمي" : "أعده إلى صورة الرفع مع «هو»";
  return "أعده إلى صورة الرفع مع «هو»";
}

function firstWordClue(target: string, state?: PedagogyState) {
  const wordType = factText(state, "wordType");
  const bare = clean(target);
  if (wordType === "noun") {
    if (bare.startsWith("ال"))
      return `لاحظ «الـ» في «${target}». دخول «الـ» من العلامات التي تميّز الاسم؛ فهي لا تدخل على الفعل ولا على الحرف. طبّق هذه القرينة على الكلمة المطلوبة.`;
    return `جرّب مع «${target}» إحدى خصائص الأسماء التي يسمح بها السياق: الجر، أو التنوين، أو النداء، أو دخول «الـ». ابحث عن قرينة اسمية فعلية بدل مقارنة طول الكلمة بالخيارات.`;
  }
  if (wordType === "verb") {
    const tense = factText(state, "verbType");
    if (tense === "imperative") return `«${target}» توجه طلبًا إلى مخاطب ليُحدث الفعل. وجود حدث مع طلب حصوله قرينة فعلية واضحة؛ استخدمها لتحديد نوع الكلمة.`;
    if (tense === "past") return `«${target}» تحكي حدثًا وقع قبل زمن الكلام ويمكن ربطها بـ«أمس». اجتماع الحدث والزمن قرينة تميز الفعل عن الاسم والحرف.`;
    return `«${target}» تحمل حدثًا يقع الآن أو يتجدد ويمكن ربطها بـ«الآن». اجتماع الحدث والزمن هو القرينة الحاسمة في هذه الخطوة.`;
  }
  const after = factText(state, "afterParticle");
  return `جرّب أخذ «${target}» وحدها: معناها هنا لا يكتمل كاسم لشيء ولا كحدث ذي زمن؛ وظيفتها أن تربط ما بعدها بما قبلها. لاحظ أيضًا أن ما بعدها في هذا المثال ${after === "verb" ? "يحمل حدثًا وزمنًا" : "اسم"}.`;
}

function tenseClue(target: string, tense: string) {
  if (tense === "past")
    return `ضع «أمس» مع معنى «${target}». الحدث في الجملة وقع وانتهى قبل زمن الكلام؛ اختر الزمن الذي يطابق هذه القرينة.`;
  if (tense === "present")
    return `ضع «الآن» مع معنى «${target}». الحدث يقع أو يتجدد وقت الكلام، وليس طلبًا موجهًا إلى مخاطب؛ اختر الزمن الذي يوافق ذلك.`;
  return `اسأل هل «${target}» تخبر عن حدث أم تطلب حصوله. هنا الصيغة موجهة إلى مخاطب ليقوم بالفعل؛ حدّد الزمن من معنى الطلب.`;
}

function relationClue(state?: PedagogyState) {
  const target = String(state?.currentTarget || "التابع");
  const matbu3 = factText(state, "matbu3") || "الاسم السابق";
  const relation = factText(state, "relationKind");
  if (relation === "description")
    return `جرّب حذف «${target}» ثم اسأل: ماذا أضافت إلى «${matbu3}»؟ هي تبين صفة فيه، ولا تنشئ حكمًا مستقلًا عنه. استخدم علاقة الوصف لاختيار نوع التابع.`;
  if (relation === "coordination")
    return `ابحث بين «${matbu3}» و«${target}» عن حرف عطف. وجود الحرف يجعل الثاني يشارك الأول في الحكم من غير أن يكون وصفًا له أو توكيدًا.`;
  if (relation === "emphasis")
    return `اسأل هل «${target}» أضافت شخصًا أو صفة جديدة، أم شددت شمول «${matbu3}» أو عينه. إذا لم تضف معنى جديدًا وإنما أكدت المتبوع فهذه هي القرينة الحاسمة.`;
  if (relation === "substitution")
    return `اختبر الاستبدال: هل يمكن أن تحل «${target}» محل «${matbu3}» في الجملة، أو تدل على جزء منه أو معنى يشتمل عليه؟ هذه العلاقة الموازية للمتبوع تميز هذا النوع من التوابع.`;
  return `حدّد العلاقة بين «${target}» و«${matbu3}» من المعنى: وصف، مشاركة بحرف، توكيد، أم إمكان إحلال الثاني محل الأول أو بيان جزء/معنى منه.`;
}

function badalKindClue(state?: PedagogyState) {
  const target = String(state?.currentTarget || "البدل");
  const matbu3 = factText(state, "matbu3") || "المبدل منه";
  const kind = factText(state, "badalKind");
  if (kind === "مطابق")
    return `جرّب حذف «${matbu3}» ووضع «${target}» مكانه. إذا بقي المقصود نفسه واستقامت الجملة، فالعلاقة بين الاسمين تطابق في المقصود، لا جزءًا منه ولا صفةً مشتملة عليه.`;
  if (kind.includes("بعض"))
    return `اسأل: هل «${target}» جزء حقيقي يمكن عده من «${matbu3}»؟ الجزء المادي أو العددي يقود إلى نوع يختلف عن التطابق وعن معنى الاشتمال.`;
  return `اسأل هل «${target}» جزء مادي من «${matbu3}» أم معنى/صفة تتعلق به مثل خُلُقه أو علمه. هنا العلاقة معنوية وليست جزءًا محسوسًا ولا الاسم نفسه.`;
}

function tawabiCaseClue(state?: PedagogyState) {
  const target = String(state?.currentTarget || "التابع");
  const matbu3 = factText(state, "matbu3") || "المتبوع";
  const role = factText(state, "matbu3Role");
  return `لا تعرب «${target}» مستقلة عن «${matbu3}». استخرج حالة المتبوع من قوله: «${role || "حدّد موقع المتبوع أولًا"}»، ثم انقل **الحالة الإعرابية نفسها** إلى التابع؛ أما العلامة فستأتي في خطوة لاحقة من صورة التابع.`;
}

function kanaTargetClue(state?: PedagogyState) {
  const sentence = String(state?.currentSentence || "الجملة");
  const base = factText(state, "baseStart");
  if (base)
    return `أعد الجملة قبل دخول الناسخ إلى أصلها الاسمي: «${base}». الاسم الذي كان مبتدأً في الأصل هو الذي صار يحمل معنى الناسخ، ثم يأتي الخبر ليتم المعنى عنه.`;
  return `احذف «كان» أو أختها ذهنيًا من «${sentence}» وأعد الجملة إلى أصلها الاسمي. حدّد الاسم الذي تبدأ به الجملة الأصلية، لا الكلمة الأقرب إلى الناسخ شكلًا.`;
}

function khabarKindClue(state?: PedagogyState) {
  const target = String(state?.currentTarget || "الخبر");
  const kind = factText(state, "khabarKind");
  if (/^(أن|أنّ)\s/u.test(clean(target)))
    return `اقرأ «${target}» كوحدة واحدة. جرّب تأويلها باسم صريح؛ مثل «أن أتميّز» ← «تميّزي». إذا أدى التركيب وظيفة اسم فلا تعامله كجملة خبر مستقلة لمجرد وجود فعل داخله.`;
  if (kind === "sentence")
    return `انظر إلى «${target}» كاملًا: داخله إسناد مستقل، أي فعل مع فاعله أو مبتدأ مع خبره. وجود هذا الإسناد هو الذي يحدد صورة الخبر، لا عدد الكلمات وحده.`;
  if (kind === "shibh")
    return `«${target}» لا تحتوي إسنادًا كاملًا، لكنها تبدأ بحرف جر أو ظرف ويتعلق معناها بمحذوف تقديره كائن/مستقر. هذه القرينة تميز صورتها عن الجملة والكلمة المفردة.`;
  return `اختبر «${target}»: هل فيها إسناد داخلي كامل؟ وهل تبدأ بحرف جر أو ظرف؟ إذا لم يتحقق واحد من هذين فاختر الصورة المتبقية في هذا التصنيف، حتى لو كان الاسم مثنى أو جمعًا أو احتاج متممًا.`;
}

function shibhClue(target: string, state?: PedagogyState) {
  const kind = factText(state, "shibhType");
  if (kind === "jar")
    return `انظر إلى أول «${target}»: إذا بدأت بحرف جر ثم اسم مجرور فسمِّ شبه الجملة من هذا التركيب، ولا تخلطها بالظرف.`;
  return `فتّش في «${target}» عن كلمة تدل على زمان أو مكان ويتلوها غالبًا مضاف إليه؛ هذه هي القرينة التي تفرق هذا النوع من شبه الجملة عن الجار والمجرور.`;
}

function strictFirstHint(node: PedagogyNode, state?: PedagogyState): string | undefined {
  const id = String(node.id || "");
  const target = String(state?.currentTarget || "الكلمة المحددة");
  const facts = state?.facts || {};
  const roleKind = factText(state, "roleKind") || factText(state, "nounKind");
  const shape = shapeValue(state);

  if (id === "fw_decision_1") return firstWordClue(target, state);
  if (id === "fw_verb_tense") return tenseClue(target, factText(state, "verbType"));

  if (["present_raf3_weak_letter", "present_nasb_weak_letter", "present_jazm_weak_letter"].includes(id)) {
    const base = weakVerbBase(target, factText(state, "weakLetter"));
    return `لا تستدل من الحركة الباقية في آخر «${target}» وحدها. أعد الفعل إلى صورته الكاملة مع «هو»: ${base}. ثم انظر إلى **الحرف الأخير من الأصل**؛ هو الذي تحدده في هذه الخطوة.`;
  }
  if (id === "imperative_weak_letter") {
    const base = factText(state, "presentBase") || weakVerbBase(target, factText(state, "weakLetter"), true).replace(/^هو\s+/u, "");
    return `لنكشف الحرف المحذوف، ردّ فعل الأمر «${target}» إلى مضارعه مع «هو»: هو ${base}. انظر إلى آخر المضارع، ثم اختر حرف العلة الذي حُذف في الأمر.`;
  }
  if (["present_raf3_shape", "present_nasb_shape", "present_jazm_shape"].includes(id)) {
    const verbShape = factText(state, "shape");
    if (verbShape === "five")
      return `افحص اتصال «${target}» بضمير المخاطب أو الجماعة: أترى ألف الاثنين أو واو الجماعة أو ياء المخاطبة مع صيغة المضارع؟ هذا الاتصال هو القرينة التي تميز صورته قبل اختيار العلامة.`;
    if (verbShape === "weak") {
      const base = weakVerbBase(target, factText(state, "weakLetter"));
      return `ردّ «${target}» إلى صورته الكاملة مع «هو»: ${base}. انظر إلى الحرف الأخير من الأصل: هل هو أحد حروف العلة الثلاثة؟ احكم من الأصل، لا من الحركة الظاهرة.`;
    }
    return `افحص أصل آخر «${target}» بعد إبعاده عن النواصب والجوازم: الحرف الأخير ليس ألفًا ولا واوًا ولا ياءً أصلية، ولم تتصل به علامة تجعله من صيغ الأفعال الخمسة. استخدم هاتين القرينتين لاختيار الصورة.`;
  }
  if (id === "imperative_ending") {
    const base = factText(state, "presentBase");
    return `ردّ «${target}» إلى مضارعه مع «هو»${base ? `: هو ${base}` : ""}. افحص آخر أصل الفعل: أهو ألف أو واو أو ياء أصلية، أم حرف صحيح؟ من هذا الأصل تحدد المسار.`;
  }

  if (id === "present_build_check") {
    const connection = factText(state, "buildConnection");
    if (connection === "niswa")
      return `انظر إلى النون في آخر «${target}»: هي ضمير يدل على جماعة الإناث ويقوم مقام الفاعل، وليست نون توكيد ولا نون الأفعال الخمسة. حدّد أثر هذا الاتصال في بناء المضارع.`;
    if (connection === "tawkid")
      return `انظر إلى النون في آخر «${target}»: لا تدل على فاعلات، بل جاءت لتقوية معنى الفعل وتوكيده، وغالبًا تكون مشددة. حدّد نوع الاتصال من هذه الوظيفة.`;
    return `افحص آخر «${target}» نفسه. لا تعدّ واو الجماعة أو ألف الاثنين أو ياء المخاطبة من نون البناء؛ المطلوب فقط نون تدل على النسوة أو نون تقوي الفعل بالتوكيد. هل ترى واحدة منهما؟`;
  }
  if (id === "imperative_attached_kind") {
    const attached = factText(state, "attached");
    const clue = attached === "waw" ? "المتصل يدل على جماعة المخاطبين" : attached === "alif2" ? "المتصل يدل على مخاطبين اثنين" : attached === "yaa" ? "المتصل يدل على مخاطبة مفردة" : attached === "niswa" ? "المتصل يدل على جماعة الإناث" : "المتصل لا يدل على فاعل، بل يقوي الطلب بالتوكيد";
    return `افصل آخر «${target}» عن أصل فعل الأمر واسأل ماذا يدل المتصل: ${clue}. سمِّ المتصل من دلالته، لا من مجرد شكل الحرف الأخير.`;
  }
  if (["past_taa_weak", "past_waw_weak"].includes(id)) {
    const base = factText(state, "basePastHuwa");
    return `قارن الفعل كما هو مكتوب بـصورته الماضية مع «هو»: «${target}» ← «هو ${base}». إذا ظهر في صورة «هو» حرف أخير اختفى قبل المتصل فقد وقع حذف؛ وإذا بقي الأصل كاملًا فلا حذف.`;
  }
  if (id === "past_deleted_letter_taa") {
    const base = factText(state, "basePastHuwa");
    return `ردّ «${target}» إلى الماضي مع «هو»: «هو ${base}». لا تنظر إلى تاء التأنيث؛ الحرف الذي كان في **آخر أصل الفعل** ثم اختفى هو المطلوب.`;
  }
  if (id === "past_raf3_type")
    return `انظر إلى آخر «${target}» نفسه وحدد دلالة الضمير: أيدل على متكلم/متكلمين أو نسوة، أم على اثنين، أم على جماعة مذكرين؟ الدلالة العددية للمتصل تحسم المجموعة.`;
  if (id === "past_sukoon_raf3_type")
    return `ثبت أن المتصل من المجموعة التي تبني الماضي على السكون. الآن اقرأ اللاحقة نفسها في «${target}»: هل هي تاء تدل على الفاعل، أم «نا» الدالة على المتكلمين، أم نون تدل على جماعة الإناث؟`;

  if (["fael_form", "mafool_form", "mafoolat_form", "inna_khabar_single_start", "kana_ism_start", "kana_khabar_single_start"].includes(id))
    return wordOrSourceClue(target, roleKind || factText(state, "nounKind"));
  if (id === "fael_masdar_term")
    return `أعد صياغة التركيب المحدد باسم صريح: مثل «أن تنجح» ← «نجاحك». المطلوب الآن اسم المصطلح النحوي لهذا التركيب الذي يبدأ بحرف مصدري ويؤول مع ما بعده باسم.`;

  if (id === "fael_context" || id === "mafool_context") {
    const sentence = String(state?.currentSentence || "الجملة");
    const first = sentence.replace(/[.؟!،]/g, " ").trim().split(/\s+/)[0] || "أول كلمة";
    const contextType = factText(state, "contextType");
    if (contextType.startsWith("nominal"))
      return `ابدأ من أول الجملة نفسها، لا من الكلمة المستهدفة: «${first}» تدل هنا على اسم أو مسمّى من غير زمن. نوع الجملة يتحدد بما بدأت به قبل النظر إلى الفعل الذي قد يأتي داخل الخبر.`;
    return `ابدأ من أول الجملة نفسها، لا من الكلمة المستهدفة: «${first}» تحمل حدثًا مرتبطًا بزمن. استخدم نوع أول كلمة لتحديد سياق الجملة قبل البحث عن الفاعل أو المفعول.`;
  }
  if (id === "fael_role_hidden") {
    const sentence = String(state?.currentSentence || "الجملة");
    return `في «${sentence}» لا يكفي وجود اسم في الجملة كي يكون صاحب الفعل. انظر بعد الفعل نفسه: إذا لم يظهر اسم أسند إليه الحدث، فاستخرج صاحبه من صيغة الفعل والضمير الذي تفهمه منها.`;
  }

  if (id === "fael_role_verbal") {
    const q = factText(state, "actionQuestion") || `من الذي قام بالفعل في الجملة؟`;
    return `لا تبدأ من الحركة. اسأل عن الفعل نفسه: «${q}». الكلمة أو التركيب الذي يجيب عن هذا السؤال هو صاحب الحدث، ومن هنا تحدد وظيفته.`;
  }
  if (id === "mafool_role") {
    const q = factText(state, "objectQuestion") || "على ماذا وقع الفعل مباشرة؟";
    return `بعد معرفة الفاعل، اسأل عن أثر الفعل: «${q}». حدّد الشيء الذي وقع عليه الفعل مباشرة، ولا تخلطه بمن قام بالفعل.`;
  }

  if (["fael_word_inflection", "mafool_word_inflection", "mafoolat_word_inflection", "naib_form", "inna_ism_start", "inna_khabar_single_inflection", "khabar_single_inflection", "kana_ism_inflection"].includes(id)) {
    const built = ["mabni", "connected", "detached"].includes(roleKind) || factText(state, "mabniType") !== "";
    return inflectionClue(target, built);
  }
  if (["fael_mabni_type", "mafool_mabni_type", "mafoolat_mabni_type", "naib_mabni_type", "mubtada_built", "khabar_single_built", "inna_ism_built", "inna_khabar_single_built", "kana_ism_built"].includes(id))
    return builtTypeClue(target, factText(state, "mabniType") || factText(state, "roleKind"));

  if (["fael_mu3rab_shape", "mafool_mu3rab_shape", "mafoolat_shape", "naib_shape", "hal_shape", "munada_shape", "la_nasb_shape", "tawabi_shape"].includes(id))
    return shapeClue(target, shape);
  if (["mubtada_number", "khabar_single_number", "kana_ism_number", "kana_khabar_single_number", "inna_ism_number", "inna_khabar_single_number"].includes(id))
    return shapeClue(target, factText(state, "number"));

  if (["fael_raf3_mark", "naib_mark"].includes(id)) return markClue(target, shape, "raf3");
  if (["mafool_nasb_mark", "mafoolat_mark", "hal_mark", "munada_mark", "la_nasb_mark", "istithna_mark"].includes(id)) return markClue(target, shape, "nasb");
  if (id === "tawabi_mark") return markClue(target, shape, factText(state, "case") === "nasb" ? "nasb" : factText(state, "case") === "jarr" ? "jarr" : "raf3");

  if (["mubtada_ending", "khabar_single_ending", "kana_ism_ending", "inna_ism_ending", "inna_khabar_single_ending"].includes(id))
    return endingClue(target, factText(state, "ending"));

  if (id === "fael_hidden_estimate" || id === "kana_hidden_ism_estimate") {
    const sentence = String(state?.currentSentence || "الجملة");
    return `الضمير المستتر لا يظهر لفظًا؛ استخرجه من صيغة الفعل وسياق «${sentence}». اسأل: من المتكلم أو المخاطب أو الغائب الذي تدل عليه صيغة الفعل؟`;
  }

  if (id === "tawabi_naat_discovery" || id === "tawabi_badal_discovery" || id === "tawabi_term") return relationClue(state);
  if (id === "tawabi_badal_kind") return badalKindClue(state);
  if (id === "tawabi_case") return tawabiCaseClue(state);
  if (id === "tawabi_form") {
    const phraseKind = factText(state, "phraseKind");
    const role = factText(state, "roleKind");
    if (role === "sentence") return `التحديد هو «${target}» كاملًا، وداخله إسناد من فعل وفاعله أو مبتدأ وخبر؛ لذلك لا تتعامل معه ككلمة واحدة. افحص بداية التركيب في الخطوة التالية.`;
    if (role === "shibh") return `التحديد «${target}» لا يكوّن إسنادًا كاملًا، لكنه يبدأ بحرف جر أو ظرف. هذه البنية هي التي تحدد صورته قبل معرفة محله.`;
    return `«${target}» هنا اسم ظاهر واحد يتبع ما قبله، وليس داخله إسناد مستقل ولا يبدأ بحرف جر أو ظرف. استخدم هذه القرينة لاختيار الصورة.`;
  }
  if (id === "tawabi_sentence_type") return sentenceTypeClue(target);

  if (id === "mafoolat_maah_check") {
    const paraphrase = factText(state, "maahParaphrase");
    if (paraphrase) return `جرّب استبدال الواو قبل «${target}» بـ«مع»: ${paraphrase}. إذا استقام المعنى وصار المقصود المصاحبة لا المشاركة في الفعل، فقد عرفت وظيفة الواو.`;
    return `لا تبحث عن كل واو في الجملة. افحص الواو التي تسبق «${target}» فقط، وجرّب وضع «مع» مكانها؛ ثم راقب هل يبقى المعنى مستقيمًا.`;
  }
  if (id === "mafoolat_liajlih_check") {
    const why = factText(state, "whyQuestion") || `لماذا حدث الفعل؟`;
    return `اسأل سؤال السبب نفسه: «${why}». ثم اختبر «${target}»: هل هي **مصدر** يدل على دافع نفسي/قلبي للفعل، وصاحب السبب هو صاحب الفعل وفي الزمن نفسه؟ لا يكفي أن تأتي الكلمة بعد الفعل.`;
  }

  if (id === "naib_form") return inflectionClue(target, roleKind === "mabni");

  if (id === "munada_kind") {
    const kind = factText(state, "munadaKind");
    if (kind === "alam") return `افحص «${target}»: هل هي اسم شخص أو مكان معيّن بذاته، لا نكرة تصف أي فرد؟ ابدأ بهذه الخاصية قبل حفظ اسم النوع.`;
    if (kind === "nakira_maqsuda" || kind === "nakira_ghayr_maqsuda") return `«${target}» نكرة لم يتصل بها متمم. لا تسمِّ النوع بعد؛ اسأل أولًا: هل المتكلم يقصد فردًا معيّنًا حاضرًا، أم ينادي أي فرد من الجنس؟`;
    return `انظر إلى ما بعد «${target}»: هل يوجد لفظ يتمم معناها؟ إذا وجد، افحص هل هو مضاف إليه مجرور أم معمول آخر؛ هذه الخطوة تفصل المضاف عن الشبيه بالمضاف.`;
  }
  if (id === "munada_alam_term") return `ثبت في الخطوة السابقة أن «${target}» اسم عَلَم معيّن بذاته وليس نكرة. الآن اختر المصطلح الذي يجمع كونه عَلَمًا وكونه غير مضاف ولا شبيهًا بالمضاف.`;
  if (id === "munada_maqsuda_term") return `ثبت أن «${target}» نكرة، لكن المتكلم يقصد بها شخصًا معيّنًا حاضرًا. اختر المصطلح الذي يعبّر عن **قصد فرد بعينه** من النكرة.`;
  if (id === "munada_ghayr_term") return `ثبت أن «${target}» نكرة والنداء لا يعيّن شخصًا بعينه. اختر المصطلح الذي يعبّر عن غياب القصد إلى فرد محدد.`;

  if (id === "istithna_polarity") {
    const sentence = String(state?.currentSentence || "الجملة");
    return `فتّش في «${sentence}» عن أداة نفي قبل الحكم: ما، لا، لم، لن ونحوها. وجود النفي أو غيابه هو وحده المطلوب في هذه الخطوة، لا حركة المستثنى.`;
  }
  if (id === "istithna_mufarragh_role") {
    const sentence = String(state?.currentSentence || "الجملة");
    return `ثبت أن الاستثناء مفرغ. احذف «إلا» ذهنيًا من «${sentence}» مع إبقاء بقية الجملة، ثم أعرب «${target}» حسب العامل الذي يطلبه: فعل، أو حرف جر، أو غيرهما. لا تعربها مستثنى لمجرد مجيئها بعد «إلا».`;
  }
  if (id === "istithna_shape") return shapeClue(target, shape);

  if (id === "la_kind") {
    const kind = factText(state, "laNameKind");
    if (kind === "mufrad") return `في باب «لا»، كلمة «مفرد» لا تعني واحدًا في العدد. افحص «${target}»: هل هي **غير مضافة** ولا متعلق بعدها يتمم معناها؟ إذا نعم فاختر النوع الاصطلاحي المناسب.`;
    if (kind === "mudaf") return `اسأل «${target} ماذا؟» وانظر إلى الاسم المجرور بعدها الذي يتمم معناها. وجود اسم مجرور مرتبط بها مباشرة ليكمل معناها هو القرينة التي تميز هذا النوع.`;
    return `ما بعد «${target}» يتمم معناها، لكنه ليس مضافًا إليه مجرورًا؛ قد يكون جارًا ومجرورًا أو معمولًا. هذه البنية تميزها عن المضاف الصريح وعن المفرد الاصطلاحي.`;
  }
  if (id === "la_built_shape") {
    const buildMark = factText(state, "buildMark");
    return buildMark === "yaa"
      ? `ثبت أن اسم «لا» مفرد اصطلاحًا، لكن صورته مثنى أو جمع مذكر سالم. قاعدة البناء هنا: يبنى على **ما ينصب به**؛ استخرج علامة نصب هذه الصورة ثم اختر البناء الموافق لها.`
      : `ثبت أن اسم «لا» مفرد اصطلاحًا وصورته لا تحتاج علامة فرعية في النصب. قاعدة البناء: يبنى على **ما ينصب به**؛ اختر الحركة التي ينصب بها المفرد.`;
  }

  if (id === "inna_kaffa_gate") {
    const particle = factText(state, "particleLabel") || "الحرف الناسخ";
    return `اقرأ «${particle}» كما ظهرت في الجملة حرفًا حرفًا. المطلوب فحص اتصال «ما» بالحرف نفسه؛ لا تنظر إلى معنى الخبر ولا إلى حركة الاسم قبل حسم هذه البوابة.`;
  }
  if (id === "inna_meaning") {
    const q = factText(state, "semanticQuestion");
    const meaning = factText(state, "particleMeaning");
    if (meaning === "kaffa") return `عند اتصال «ما» الكافة يتوقف الحرف الناسخ عن عمل النصب والرفع. اقرأ الجملة بعد «إنما» كجملة اسمية عادية، ثم اختر الوصف الذي يعبّر عن هذا الأثر.`;
    return `لا تجعل أثر الحرف متعلقًا بكلمة منفردة. ${q ? `${q} ` : ""}احذف الحرف مؤقتًا وانظر إلى العلاقة الكاملة بين طرفي الجملة؛ الناسخ يضيف معناه إلى **الحكم كله**.`;
  }
  if (id === "kana_connected_pronoun_i3rab") {
    const sentence = String(state?.currentSentence || "الجملة");
    return `في «${sentence}» قد يعود معنى الفعل الناسخ إلى اسم ظاهر قبله، لكن المطلوب هو اللفظ الذي شغل موقع الاسم داخل تركيب الناسخ. افصل ما اتصل بآخر الفعل وحدد الجزء الذي يدل على صاحب المعنى.`;
  }
  if (id === "inna_kaffa_base_role") {
    const sentence = String(state?.currentSentence || "الجملة");
    return `بعد ثبوت أن «ما» كفّت الحرف عن العمل، اقرأ «${sentence}» بوصفها جملة اسمية عادية: أي طرف بدأنا الحديث عنه، وأي طرف جاء بالمعلومة عنه؟ حدّد الوظيفة من المعنى لا من الحركة وحدها.`;
  }
  if (id === "kana_target") return kanaTargetClue(state);
  if (id === "khabar_kind" || id === "kana_khabar_entry" || id === "inna_khabar_kind") return khabarKindClue(state);
  if (id === "kana_masdar_name") return `أعد صياغة «${target}» باسم صريح يؤدي معناها؛ مثل «أنْ تتجاهل» ← «تجاهل». المطلوب اسم التركيب الناتج من حرف مصدري مع ما بعده حين يؤدي في الجملة وظيفة اسم.`;
  if (id === "khabar_sentence_type" || id === "inna_khabar_sentence_type") return sentenceTypeClue(target);
  if (id === "khabar_shibh_type" || id === "kana_khabar_shibh_type" || id === "inna_khabar_shibh_type") return shibhClue(target, state);

  if (id === "mubtada_word_type") {
    const wordType = factText(state, "wordType");
    if (wordType === "taweel" || roleKind === "masdar") return wordOrSourceClue(target, "source");
    const mabniType = factText(state, "mabniType");
    if (mabniType) return `${builtTypeClue(target, mabniType)} هذه الوظيفة نفسها تثبت أولًا أن المحدد اسم، ثم ننتقل في الخطوة التالية إلى نوع بنائه.`;
    const bare = clean(target);
    if (bare.startsWith("ال")) return `لاحظ «الـ» في «${target}». دخول «الـ» قرينة اسمية مباشرة. بعد إثبات النوع ننتقل إلى كونه معربًا أو مبنيًا، فلا تقفز إلى الإعراب الآن.`;
    return `اسأل أولًا هل «${target}» تحمل حدثًا وزمنًا أم تدل على ذات/معنى بلا زمن. استخدم قرينة الاسم نفسها قبل الانتقال إلى صورته وعلامة رفعه.`;
  }

  if (id === "khabar_single_built") return builtTypeClue(target, factText(state, "mabniType"));

  // العقد التي تحمل الإجابة في التلميح القديم ولا تحتاج إلا قاعدة عامة دقيقة.
  if (id === "istithna_mark") return markClue(target, shape, "nasb");
  if (id === "la_nasb_shape") return shapeClue(target, shape);
  if (id === "la_nasb_mark") return markClue(target, shape, "nasb");

  // لا نغطي عقدة جيدة بتلميح عام؛ إن لم توجد معالجة صريحة نترك التلميح المتخصص الحالي.
  void facts;
  return undefined;
}

/**
 * التلميح الأول هو دفعة تفكير مرتبطة بالمثال، لا تشخيصًا لاختيار خاطئ.
 * العقد غير المذكورة هنا تظل تستخدم تلميحها التخصصي القائم.
 */
export function firstLevelStudentHintText(
  node: PedagogyNode | null | undefined,
  state?: PedagogyState,
): string | undefined {
  if (!node || node.type !== "question") return undefined;
  return strictFirstHint(node, state);
}
