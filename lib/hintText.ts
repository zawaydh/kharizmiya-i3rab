function quoteTarget(target?: string) {
  const clean = String(target || "").trim();
  return clean ? `«${clean}»` : "الكلمة";
}

function normalizeSpaces(text: string) {
  return text
    .replace(/[ \t]+/g, " ")
    .replace(/\s+([،؛:.؟])/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * ينظف التلميح التشخيصي ويخصصه للكلمة الموجودة في المثال.
 * لا يختصر الشرح بعد الخطأ؛ بل يزيل العبارات الميتا ويضبط المصطلحات.
 */
export function diagnosticHintText(rawHint?: string, target?: string) {
  const quoted = quoteTarget(target);
  let text = String(rawHint || "").trim();
  if (!text) return "ارجع إلى الكلمة في المثال، وحدد الدليل الذي لا ينسجم مع اختيارك.";

  text = text
    .replace(/الكلمة المحددة|الكلمة المستهدفة|الكلمة المطلوبة/g, quoted)
    .replace(/الفعل المحدد/g, `الفعل ${quoted}`)
    .replace(/الاسم المحدد/g, `الاسم ${quoted}`)
    .replace(/المحدد نفسه|المحددة نفسها|المحدد/g, quoted)
    .replace(/التفاصيل الأخرى (?:تظهر|تترك) في التلميح(?: لا في الأزرار)?[.،]?/g, "")
    .replace(/سيربط التلميح الصورة بالمثال مباشرة[.،]?/g, "")
    .replace(/اختر ما يثبته المثال نفسه[.،]?/g, "")
    .replace(/عد للسؤال[\s\S]*$/g, "")
    .replace(/انقر على الإجابة الصحيحة(?: لنكمل الإعراب)?[.،]?/g, "")
    .replace(/اضغط «فهمت»[\s\S]*$/g, "")
    .replace(/ضمير الرفع يضمر الفاعل/g, "ضمير الرفع يدل على الفاعل ويشغل موقعه")
    .replace(/ضمير النصب يضمر المفعول به/g, "ضمير النصب يدل على المفعول به ويشغل موقعه")
    .replace(/في رفع أو نصب أو جر/g, "في محل رفع أو نصب أو جر")
    .replace(/في محل جر بالإضافة/g, "في محل جر مضاف إليه")
    .replace(/الجر بالإضافة/g, "الجر بوصفه مضافًا إليه")
    .replace(/المثنى ينصب بالياء/g, "علامة نصب المثنى الياء")
    .replace(/المثنى يرفع بالألف/g, "علامة رفع المثنى الألف")
    .replace(/جمع المذكر السالم ينصب بالياء/g, "علامة نصب جمع المذكر السالم الياء")
    .replace(/جمع المذكر السالم يرفع بالواو/g, "علامة رفع جمع المذكر السالم الواو")
    .replace(/جمع المؤنث السالم ينصب بالكسرة/g, "علامة نصب جمع المؤنث السالم الكسرة")
    .replace(/جمع المؤنث السالم يرفع بالضمة/g, "علامة رفع جمع المؤنث السالم الضمة")
    .replace(/المفرد ينصب بالفتحة/g, "علامة نصب المفرد الفتحة")
    .replace(/المفرد يرفع بالضمة/g, "علامة رفع المفرد الضمة")
    .replace(/جمع التكسير ينصب بالفتحة/g, "علامة نصب جمع التكسير الفتحة")
    .replace(/جمع التكسير يرفع بالضمة/g, "علامة رفع جمع التكسير الضمة")
    .replace(/في النكرة غالبًا تحذف الياء ويظهر التنوين/g, "إذا كان الاسم المنقوص نكرة مرفوعًا أو مجرورًا، غير مضاف ولا معرف بـ«أل»، حذفت ياؤه وعوض عنها بتنوين الكسر")
    .replace(/في النكرة غالبًا تحذف الياء/g, "إذا كان الاسم المنقوص نكرة مرفوعًا أو مجرورًا، غير مضاف ولا معرف بـ«أل»، حذفت ياؤه")
    .replace(/اختبار البدل: احذف الاسم السابق وضع ([^.]+) مكانه\. إذا بقي المعنى مستقيمًا غالبًا، فالعلاقة بدل\./g,
      "في البدل المطابق يمكن إحلال $1 محل الاسم السابق. أما بدل البعض والاشتمال فقد يحتاج ضميرًا يعود على المبدل منه.");

  return normalizeSpaces(text);
}

/**
 * تلميح المستوى الأول: قصير، يبدأ من المثال، ولا يصرح بالمصطلح المطلوب.
 */
export function firstLevelHintText(
  nodeId?: string,
  rawHint?: string,
  target?: string,
  question?: string
) {
  const id = String(nodeId || "");
  const quoted = quoteTarget(target);
  const q = String(question || "");

  if (id === "present_word_kind" || id === "past_word_kind" || id === "imperative_word_kind")
    return `هل تدل ${quoted} على حدث وزمن، أم على معنى بلا زمن، أم لا يظهر معناها إلا مع غيرها؟`;
  if (id === "present_tense" || id === "past_tense" || id === "imperative_meaning")
    return `هل يدل ${quoted} على حدث وقع، أم يقع الآن أو مستقبلًا، أم يطلب حدوثه؟`;
  if (id === "present_build_check")
    return `انظر إلى آخر ${quoted}: هل اتصلت به نون النسوة أو نون التوكيد؟`;
  if (id === "present_tool_presence")
    return `انظر إلى الكلمة السابقة لـ${quoted}: هل هي ناصب أو جازم؟`;
  if (/^present_(raf3|nasb|jazm)_shape$/.test(id))
    return `افحص آخر ${quoted} واتصاله: أهو صحيح الآخر، معتل الآخر، أم من الأفعال الخمسة؟`;
  if (/^present_(raf3|nasb)_weak_letter$/.test(id))
    return `انظر إلى آخر ${quoted}: أهو ألف أم واو أم ياء؟`;
  if (id === "present_jazm_weak_letter" || id === "imperative_weak_letter")
    return `قارن ${quoted} بأصله: أي حرف علة يظهر في الأصل ويغيب هنا؟`;

  if (id === "past_has_attachment")
    return `أسند ${quoted} إلى «هو» في الماضي، ثم قارن آخر الصورتين: هل ظهرت زيادة؟`;
  if (id === "past_no_attachment_weak")
    return `انظر إلى آخر ${quoted}: أهو حرف صحيح أم ألف لينة؟`;
  if (id === "past_connector_kind")
    return `ما دلالة الجزء المتصل بآخر ${quoted}: فاعل، مفعول به، أم علامة تأنيث؟`;
  if (id === "past_nasb_weak")
    return `احذف ضمير النصب من ${quoted} مؤقتًا، ثم افحص آخر أصل الفعل.`;
  if (id === "past_taa_weak" || id === "past_waw_weak")
    return `أسند ${quoted} إلى «هو» في الماضي: هل يظهر حرف علة غير موجود في الصورة الحالية؟`;
  if (id === "past_weak_base_taa" || id === "past_weak_base_waw")
    return `أعد ${quoted} إلى صورته الماضية مع «هو»، لا إلى المضارع.`;
  if (id === "past_deleted_letter_taa" || id === "past_deleted_letter_waw")
    return `أي حرف يظهر في أصل ${quoted} مع «هو» ولا يظهر في الكلمة الحالية؟`;
  if (id === "past_raf3_type" || id === "past_sukoon_raf3_type")
    return `انظر إلى الجزء المتصل بآخر ${quoted}: أي ضمير رفع هو؟`;

  if (id === "imperative_connection")
    return `قارن ${quoted} بأصله: هل انتهى الفعل وحده أم اتصل به ضمير أو نون؟`;
  if (id === "imperative_attached_kind")
    return `ما دلالة الجزء المتصل بآخر ${quoted}: نسوة، توكيد، أم مخاطبون؟`;
  if (id === "imperative_ending")
    return `انظر إلى أصل آخر ${quoted}: أهو حرف صحيح أم حرف علة؟`;

  if (id === "mubtada_start" || id === "kana_ism_start")
    return `هل يتغير آخر ${quoted} بحسب موقعه، أم يلزم صورة واحدة، أم هو تركيب يمكن تأويله باسم؟`;
  if (id === "inna_base_mubtada")
    return `احذف الحرف الناسخ مؤقتًا: عن أي اسم بدأ الكلام، وما المعلومة التي أتمت المعنى عنه؟`;
  if (id === "khabar_single_start" || id === "kana_khabar_single_start")
    return `هل يتغير آخر ${quoted} بحسب موقعه، أم يلزم صورة واحدة، أم يمكن تأويله بمصدر صريح؟`;

  if (id === "khabar_kind")
    return `افحص ${quoted}: هل هو إسناد كامل، أم جار ومجرور أو ظرف، أم ليس جملة ولا شبه جملة؟`;
  if (id.includes("khabar_shibh_position"))
    return `انظر إلى ترتيب الجملة: هل تقدم شبه الجملة ثم جاء بعده اسم نكرة؟`;
  if (id === "mubtada_ending" || id.includes("single_ending") || id === "inna_ism_ending")
    return `افحص آخر ${quoted}: أهو صحيح الآخر، مقصور بألف لازمة، أم منقوص بياء لازمة قبلها كسرة؟`;

  if (id === "inna_kaffa_gate")
    return `قارن الحرف الناسخ في المثال بصورته دون «ما»: هل بقي عمله كما هو؟`;
  if (id === "inna_kaffa_effect")
    return `انظر إلى ما بعد «إنما»: هل ظهرت علامة نصب الاسم أم عادت الجملة إلى أصلها؟`;
  if (id === "inna_meaning")
    return `اربط الحرف الناسخ في المثال بالمعنى الذي أضافه إلى الجملة كاملة.`;
  if (id === "inna_khabar_kind")
    return `افحص ${quoted}: هل فيه إسناد كامل، أم هو جار ومجرور أو ظرف، أم ليس جملة ولا شبه جملة؟`;
  if (id === "inna_khabar_single_start")
    return `هل ${quoted} يتغير آخره، أم يلزم صورة واحدة، أم يمكن تأويله بمصدر صريح؟`;
  if (id === "inna_khabar_sentence_type")
    return `انظر إلى أول كلمة في تركيب ${quoted}: أهي اسم أم فعل؟`;
  if (id === "inna_khabar_shibh_type")
    return `هل بدأ ${quoted} بحرف جر، أم دل على زمان أو مكان؟`;

  if (id === "inna_after_nasikh_effect")
    return `بعد دخول الحرف الناسخ تغير حكم الاسم الذي بدأنا الحديث عنه. ما الحكم الجديد؟`;
  if (id === "inna_after_khabar_effect")
    return `بعد دخول الحرف الناسخ بقيت المعلومة متممة للمعنى، لكن تغير اسم وظيفتها. ما الوظيفة الجديدة؟`;
  if (id === "kana_hidden_ism_site")
    return `انظر بعد الفعل الناسخ: هل ظهر اسم صريح، أم دل السياق على صاحب المعنى دون أن يذكر؟`;
  if (id === "kana_hidden_ism_estimate")
    return `طابق الضمير المقدر مع جنس الاسم المتقدم وعدده.`;
  if (id === "kana_khabar_nominal_starter" || id === "kana_khabar_sentence_type")
    return `انظر إلى أول كلمة في تركيب ${quoted}: أهي اسم أم فعل؟`;
  if (id === "kana_khabar_shibh_type")
    return `هل بدأ ${quoted} بحرف جر، أم دل على زمان أو مكان؟`;
  if (id === "kana_damir_connected")
    return `هل الجزء الدال على صاحب المعنى في ${quoted} مستقل، أم ملتصق بالفعل؟`;
  if (id === "kana_attached_ya_origin")
    return `افصل ${quoted} إلى أصل الاسم وما أضيف إليه: هل تبقى الياء في أصل الكلمة؟`;
  if (id === "kana_attached_ya_pronoun")
    return `على من تدل الياء في ${quoted}: على جزء من أصل الاسم أم على صاحبه؟`;
  if (id === "kana_masdar_source_gate")
    return `انظر إلى ما قبل الفعل في ${quoted}: هل سبقه حرف يحوله مع فعله إلى معنى اسم؟`;
  if (id === "kana_masdar_name")
    return `جرّب تأويل ${quoted} بمصدر صريح: ما اسم هذا التركيب الذي يعمل عمل الاسم؟`;
  if (id === "kana_masdar_site")
    return `ما المعلومة التي أضافها التركيب ${quoted} عن الاسم قبله؟`;
  if (id === "kana_verbal_sentence_kind")
    return `هل ${quoted} فعل وحده، أم فعل مع فاعله كوّنا إسنادًا كاملًا؟`;
  if (id === "kana_shibh_result_gate")
    return `ما المعلومة التي أضافتها شبه الجملة عن اسم الفعل الناسخ؟`;
  if (id === "kana_connected_pronoun_i3rab")
    return `في ${quoted}، اسأل: من صاحب معنى الفعل الناسخ؟ وأين دل عليه داخل الفعل؟`;
  if (id === "kana_damir_name")
    return `ما الاسم الذي تدل عليه ${quoted}: متكلم أم مخاطب أم غائب؟`;

  if (id === "manqous_identity")
    return `أعد ${quoted} إلى صورته المعرفة أو المضافة: هل آخره ياء لازمة مكسور ما قبلها؟`;
  if (id === "manqous_case")
    return `حدد موقع ${quoted} أولًا: أهو مرفوع أم منصوب أم مجرور؟`;
  if (id === "manqous_y_raf3" || id === "manqous_y_jar")
    return `هل ${quoted} معرفة بـ«أل» أو مضافة، أم نكرة غير مضافة؟`;

  if (id === "fael_hukm" || id === "mafool_hukm")
    return `بعد تحديد وظيفة ${quoted}، ما الحالة الإعرابية الأصلية لهذه الوظيفة؟`;
  if (id === "fael_role_verbal")
    return `اسأل عن ${quoted}: من الذي قام بالفعل؟`;
  if (id === "mafool_role")
    return `بعد معرفة الفعل والفاعل، اسأل: على من أو على ماذا وقع الفعل؟`;
  if (id === "tawabi_relation")
    return `ما العلاقة بين ${quoted} والاسم السابق: وصف، مشاركة بحرف، تأكيد، أم توضيح للمقصود؟`;
  if (id === "tawabi_follow_source" || id === "tawabi_case")
    return `حدد حالة الاسم المتبوع قبل ${quoted}؛ فالـتابع يأخذ الحالة نفسها.`;
  if (id === "tawabi_mark")
    return `خذ الحالة من المتبوع، ثم اختر العلامة من صورة ${quoted}.`;

  if (id === "pronoun_relation_gate" || id === "pronoun_step_1" || id === "pronoun_position")
    return `ضع اسمًا ظاهرًا مكان ${quoted}: ما الموقع الذي يشغله الاسم البديل؟`;
  if (id === "pronoun_form_raf3" || id === "pronoun_form_nasb")
    return `هل ${quoted} كلمة مستقلة، أم جزء ملتصق بكلمة قبلها؟`;
  if (id === "tawabi_term")
    return `ارجع إلى العلاقة التي اكتشفتها بين ${quoted} والاسم السابق، ثم اختر اسمها النحوي.`;
  if (id === "tawabi_tawkid_kind")
    return `هل تكرر اللفظ نفسه، أم استعملت كلمة مثل «نفس» أو «كل» أو «جميع»؟`;
  if (id === "manqous_relation_gate")
    return `أي قرار يسبق النظر إلى بقاء الياء في ${quoted}: تحديد الموقع أم الحكم على الصورة؟`;
  if (id === "manqous_step_1")
    return `افحص آخر ${quoted} أولًا، ثم حدد موقعه في الجملة.`;
  if (id === "past_alif_weak")
    return `أعد ${quoted} إلى صورته مع «هو»: هل أصل آخره حرف صحيح أم حرف علة؟`;

  if (/_number$|_shape$|_form$/.test(id))
    return `افحص صورة ${quoted}: أهي مفرد، مثنى، جمع، اسم مبني، أم تركيب؟`;
  if (/_mark$/.test(id))
    return `بعد معرفة الحالة وصورة ${quoted}، ما العلامة التي تناسبهما؟`;
  if (/_case$/.test(id))
    return `حدد موقع ${quoted} في الجملة قبل اختيار العلامة.`;
  if (/_role$|_target$|_entry$/.test(id))
    return `ما الدور الذي أدته ${quoted} في معنى الجملة؟`;
  if (/_built$|_built_type$|_mabni/.test(id))
    return `هل ${quoted} ضمير، اسم إشارة، اسم موصول، أم اسم مبني آخر؟`;

  const cleaned = diagnosticHintText(rawHint, target);
  if (!cleaned) return `انظر إلى ${quoted} في المثال، وحدد الدليل المرتبط بالسؤال الحالي.`;

  // نكتفي بأول جملة قصيرة في المستوى الأول.
  const firstSentence = cleaned.split(/(?<=[.؟!])\s+/)[0] || cleaned;
  const words = firstSentence.split(/\s+/).filter(Boolean);
  if (words.length <= 22) return firstSentence;
  return `${words.slice(0, 22).join(" ")}…`;
}
