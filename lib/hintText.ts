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
    if (!text)
        return "ارجع إلى الكلمة في المثال، وحدد الدليل الذي لا ينسجم مع اختيارك.";
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
        .replace(/اختبار البدل: احذف الاسم السابق وضع ([^.]+) مكانه\. إذا بقي المعنى مستقيمًا غالبًا، فالعلاقة بدل\./g, "في البدل المطابق يمكن إحلال $1 محل الاسم السابق. أما بدل البعض والاشتمال فقد يحتاج ضميرًا يعود على المبدل منه.");
    return normalizeSpaces(text);
}
/**
 * تلميح المستوى الأول: قصير، يبدأ من المثال، ولا يصرح بالمصطلح المطلوب.
 */
export function firstLevelHintText(nodeId?: string, rawHint?: string, target?: string, question?: string) {
    const id = String(nodeId || "");
    const quoted = quoteTarget(target);
    const q = String(question || "");
    if (id === "fw_decision_1")
        return `هل تدل ${quoted} على اسم أو معنى بلا زمن، أم على حدث وزمن، أم لا يظهر معناها كاملًا إلا مع غيرها؟`;
    if (id === "fw_verb_tense")
        return `هل يدل ${quoted} على حدث وقع وانتهى، أم على حدث يقع أو يتجدد، أم على طلب حصول الحدث؟`;
    if (id === "present_word_kind" || id === "past_word_kind" || id === "imperative_word_kind")
        return `هل تدل ${quoted} على حدث وزمن، أم على معنى بلا زمن، أم لا يظهر معناها إلا مع غيرها؟`;
    if (id === "present_tense" || id === "past_tense" || id === "imperative_meaning")
        return `هل يدل ${quoted} على حدث وقع، أم يقع الآن أو مستقبلًا، أم يطلب حدوثه؟`;
    if (id === "present_build_check")
        return `انظر إلى آخر ${quoted}: هل اتصلت به نون النسوة أو نون التوكيد؟`;
    if (id === "present_tool_presence")
        return `افحص ما قبل الفعل ${quoted} مباشرة، بما في ذلك الأداة المتصلة بحرف عطف أو استئناف مثل «فلن» و«ولم»: هل سبقه ناصب أو جازم؟`;
    if (/^present_(raf3|nasb|jazm)_shape$/.test(id))
        return `افحص آخر ${quoted} واتصاله: أهو صحيح الآخر، معتل الآخر، أم من الأفعال الخمسة؟`;
    if (/^present_(raf3|nasb)_weak_letter$/.test(id))
        return `انظر إلى آخر ${quoted}: أهو ألف أم واو أم ياء؟`;
    if (id === "present_jazm_weak_letter")
        return `قارن ${quoted} بأصله: أي حرف علة يظهر في الأصل ويغيب هنا؟`;
    if (id === "imperative_weak_letter") {
        const cleanTarget = String(target || "");
        const presentBase = cleanTarget.includes("ادع")
            ? "يدعو"
            : cleanTarget.includes("ارم")
              ? "يرمي"
              : cleanTarget.includes("اسع")
                ? "يسعى"
                : "";
        return presentBase
            ? `رُدَّ ${quoted} إلى مضارعه مع «هو»: هو ${presentBase}. أي حرف يظهر في آخر الأصل ويغيب في فعل الأمر؟`
            : `رُدَّ ${quoted} إلى مضارعه مع «هو». أي حرف يظهر في آخر الأصل ويغيب في فعل الأمر؟`;
    }
    if (id === "past_has_attachment")
        return `افصل ما اتصل بآخر ${quoted} عن أصل الفعل: هل توجد تاء أو «نا» أو ألف الاثنين أو واو الجماعة أو نون النسوة أو ضمير نصب؟ لا تعتمد على طول الكلمة وحده.`;
    if (id === "past_no_attachment_weak")
        return `انظر إلى آخر ${quoted}: أهو حرف صحيح أم ألف لينة؟`;
    if (id === "past_connector_kind")
        return `ما دلالة الجزء المتصل بآخر ${quoted}: فاعل، مفعول به، أم علامة تأنيث؟`;
    if (id === "past_nasb_weak")
        return `احذف ضمير النصب من ${quoted} مؤقتًا، ثم افحص آخر أصل الفعل.`;
    if (id === "past_taa_weak" || id === "past_waw_weak")
        return `أسند ${quoted} إلى «هو» في الماضي: هل يظهر حرف علة غير موجود في الصورة الحالية؟`;
    if (id === "past_deleted_letter_taa" || id === "past_deleted_letter_waw")
        return `أي حرف يظهر في أصل ${quoted} مع «هو» ولا يظهر في الكلمة الحالية؟`;
    if (id === "past_raf3_type" || id === "past_sukoon_raf3_type")
        return `انظر إلى الجزء المتصل بآخر ${quoted}: أي ضمير رفع هو؟`;
    if (id === "imperative_connection")
        return `قارن ${quoted} بأصله: هل انتهى الفعل وحده أم اتصل به ضمير أو نون؟`;
    if (id === "imperative_attached_kind") {
        const clean = String(target || "");
        const choices = "نون النسوة، نون التوكيد، ألف الاثنين، واو الجماعة، ياء المخاطبة";
        if (/وا(?:$|[ًٌٍَُِّْ])/u.test(clean)) return `قارن آخر ${quoted} بهذه المتصلات: ${choices}. ركّز على الواو: على مَن تدل في صيغة الأمر؟`;
        if (/ي(?:$|[ًٌٍَُِّْ])/u.test(clean)) return `قارن آخر ${quoted} بهذه المتصلات: ${choices}. ركّز على الياء: هل تدل على مخاطبة مؤنثة؟`;
        if (/ا(?:$|[ًٌٍَُِّْ])/u.test(clean)) return `قارن آخر ${quoted} بهذه المتصلات: ${choices}. ركّز على الألف: هل تدل على مخاطبَين اثنين؟`;
        if (/نَّ/u.test(clean)) return `قارن آخر ${quoted} بهذه المتصلات: ${choices}. ركّز على النون المشددة: هل جاءت لتوكيد الطلب؟`;
        if (/نَ/u.test(clean)) return `قارن آخر ${quoted} بهذه المتصلات: ${choices}. ركّز على النون: على أي جماعة تدل؟`;
        return `قارن الجزء المتصل بآخر ${quoted} بهذه الصور: ${choices}، ثم حدّد دلالته في صيغة الأمر.`;
    }
    if (id === "imperative_ending")
        return `انظر إلى أصل آخر ${quoted}: أهو حرف صحيح أم حرف علة؟`;
    if (id === "mubtada_start" || id === "kana_ism_start")
        return `هل يتغير آخر ${quoted} بحسب موقعه، أم يلزم صورة واحدة، أم هو تركيب يمكن تأويله باسم؟`;
    if (id === "khabar_single_start" || id === "kana_khabar_single_start")
        return `هل يتغير آخر ${quoted} بحسب موقعه، أم يلزم صورة واحدة، أم يمكن تأويله بمصدر صريح؟`;
    if (id === "khabar_kind")
        return `افحص ${quoted}: هل هو إسناد كامل، أم جار ومجرور أو ظرف، أم ليس جملة ولا شبه جملة؟`;
    if (id.includes("khabar_shibh_position"))
        return `انظر إلى ترتيب الجملة: هل تقدم شبه الجملة ثم جاء بعده اسم نكرة؟`;
    if (id === "mubtada_ending" || id.includes("single_ending") || id === "inna_ism_ending")
        return `افحص آخر ${quoted}: أهو صحيح الآخر، مقصور بألف لازمة، أم منقوص بياء لازمة قبلها كسرة؟`;
    if (id === "inna_kaffa_gate")
        return `ابدأ من الحرف الناسخ نفسه في المثال: هل اتصلت به «ما» الكافة أم لم تتصل؟`;
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
    if (id === "inna_kaffa_base_role")
        return `بعد «إنما» عاد التركيب إلى جملة اسمية عادية: هل ${quoted} هي الاسم الذي بدأنا الحديث عنه، أم المعلومة التي أتمت معناه؟`;
    if (id === "inna_compact_role")
        return `بعد الحرف الناسخ، هل ${quoted} هي الاسم أو الضمير الذي نتحدث عنه، أم الخبر الذي أتم المعنى عنه؟`;
    if (id === "kana_hidden_ism_site") {
        if (String(rawHint || "").trim()) return diagnosticHintText(rawHint, target);
        return `افحص الجملة كلها بعد الفعل الناسخ، لا الكلمة التالية فقط؛ فقد يأتي خبر مقدم ثم يظهر اسم الناسخ في آخر الجملة، مثل: كان في البيت رجلٌ.`;
    }
    if (id === "kana_target") {
        if (String(rawHint || "").trim()) return diagnosticHintText(rawHint, target);
        return `اربط ${quoted} بالفعل الناسخ الظاهر في المثال، ثم اسأل: أهي صاحبة المعنى أم المعلومة التي أتمت المعنى عنها؟`;
    }
    if (id === "kana_hidden_ism_estimate")
        return `طابق الضمير المقدر مع جنس الاسم المتقدم وعدده.`;
    if (id === "kana_khabar_nominal_starter" || id === "kana_khabar_sentence_type")
        return `انظر إلى أول كلمة في تركيب ${quoted}: أهي اسم أم فعل؟`;
    if (id === "kana_khabar_shibh_type")
        return `هل بدأ ${quoted} بحرف جر، أم دل على زمان أو مكان؟`;
    if (id === "kana_damir_connected")
        return `هل الجزء الدال على صاحب المعنى في ${quoted} مستقل، أم ملتصق بالفعل؟`;
    if (id === "kana_attached_ya_pronoun")
        return `على من تدل الياء في ${quoted}: على جزء من أصل الاسم أم على صاحبه؟`;
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
        return `عرفنا أن ${quoted} تدل على متكلم أو مخاطب أو غائب؛ ما اسم هذا النوع من الأسماء؟`;
    if (id === "manqous_identity")
        return `أعد ${quoted} إلى صورته المعرفة أو المضافة: هل آخره ياء لازمة مكسور ما قبلها؟`;
    if (id === "manqous_case")
        return `حدد موقع ${quoted} أولًا: أهو مرفوع أم منصوب أم مجرور؟`;
    if (id === "manqous_y_raf3" || id === "manqous_y_jar")
        return `هل ${quoted} معرفة بـ«أل» أو مضافة، أم نكرة غير مضافة؟`;
    if (id === "hal_relation")
        return `ابحث عن صاحب ${quoted} ثم حوّل المعنى إلى صيغة «وهو/وهي ...». إذا عبّرت ${quoted} عن هيئة صاحبها وقت وقوع الفعل، فهذه قرينة الحال؛ مثل «جاء الضيف في هدوء» = «جاء الضيف هادئًا».`;
    if (id === "hal_kind")
        return `بعد أن ثبتت وظيفة الحال، افحص ${quoted}: أهي كلمة واحدة، أم جملة كاملة، أم شبه جملة؟`;
    if (id === "munada_tool")
        return `ابدأ بأداة النداء: أشهرها «يا». اقرأ الاسم الذي تتجه إليه المناداة بعدها، واسأل: من الذي يخاطبه المتكلم مباشرة؟ هذه القرينة تحدد المنادى قبل الدخول في أنواعه.`;
    if (id === "munada_kind")
        return `بعد ثبوت النداء، لا تحفظ المصطلح بعد: هل ${quoted} اسم علم معيّن، أم نكرة مستقلة، أم اتصل بما بعدها ليتم معناه؟`;
    if (id === "istithna_mufarragh_role")
        return `احذف «إلا» مؤقتًا، ثم اقرأ الجملة: ما الموقع الذي تشغله ${quoted} من الفعل أو حرف الجر؟`;
    if (id === "naib_role")
        return `بعد ثبوت البناء للمجهول لا تبحث عن فاعل ظاهر؛ الفاعل حُذف. ابحث عن الاسم الذي أُسنِد إليه الفعل بعد الحذف، فهو الذي أخذ موقع الرفع بدل الفاعل.`;
    if (id === "mafoolat_bih_check")
        return `بعد استبعاد المفعول معه وفيه والمطلق ولأجله، اسأل: على من أو على ماذا وقع الفعل مباشرة؟`;
    if (id === "fael_hukm")
        return `ثبت أن ${quoted} فاعل، والفاعل من المرفوعات: إن كان اسمًا معربًا فهو مرفوع، وإن كان اسمًا مبنيًا فهو في محل رفع. ما الحكم المناسب هنا؟`;
    if (id === "mafool_hukm")
        return `ثبت أن ${quoted} مفعول به، والمفعول به من المنصوبات: إن كان اسمًا معربًا فهو منصوب، وإن كان اسمًا مبنيًا فهو في محل نصب. ما الحكم المناسب هنا؟`;
    if (id === "fael_role_verbal")
        return `ابدأ بالفعل في الجملة، ثم ابحث عن صاحبه: الاسم الذي أُسنِد إليه الحدث هو الفاعل. إن لم يظهر اسم صريح بعد الفعل، فتش عن ضمير متصل بالفعل أو ضمير مستتر يدل عليه التصريف.`;
    if (id === "mafool_role")
        return `ثبّت الفاعل أولًا حتى لا تختلط الوظيفتان: الفاعل قام بالحدث، أمّا المفعول به فهو الاسم الذي وقع عليه أثر الفعل مباشرة. اختبر ${quoted} بهذه العلاقة في الجملة.`;
    if (id === "tawabi_entry")
        return `هل ${quoted} تؤدي معنى مستقلًا في الجملة، أم ترجع إلى اسم قبلها فتصفه أو تشاركه أو تؤكده أو توضحه؟`;
    if (id === "tawabi_relation" || id === "tawabi_case" || id === "tawabi_mark") {
        const cleanedTawabi = diagnosticHintText(rawHint, target);
        if (cleanedTawabi) return cleanedTawabi;
        return `ارجع إلى الاسم الذي قبل ${quoted}: اثبت العلاقة بينهما أولًا، ثم انقل الحالة الإعرابية، وبعدها اختر علامة ${quoted} من صورتها هي.`;
    }
    if (id === "pronoun_relation_gate" || id === "pronoun_position")
        return `ضع اسمًا ظاهرًا مكان ${quoted}: ما الموقع الذي يشغله الاسم البديل؟`;
    if (id === "pronoun_form_raf3" || id === "pronoun_form_nasb")
        return `هل ${quoted} كلمة مستقلة، أم جزء ملتصق بكلمة قبلها؟`;
    if (id === "tawabi_term")
        return `ارجع إلى العلاقة التي اكتشفتها بين ${quoted} والاسم السابق، ثم اختر اسمها النحوي.`;
    if (id === "tawabi_tawkid_kind")
        return `هل تكرر اللفظ نفسه، أم استعملت كلمة مثل «نفس» أو «كل» أو «جميع»؟`;
    if (id === "manqous_relation_gate")
        return `أي قرار يسبق النظر إلى بقاء الياء في ${quoted}: تحديد الموقع أم الحكم على الصورة؟`;
    if (id === "mubtada_word_type")
        return `انظر إلى ${quoted}: أهي اسم أو في معنى الاسم، أم فعل يدل على حدث وزمن، أم حرف لا يستقل معناه؟`;
    if (id === "inna_ism_start")
        return `ثبت أن ${quoted} اسم الحرف الناسخ. إن كانت كلمة مفردة فاسأل: أهي اسم معرب، أم اسم مبني مثل ضمير متصل أو اسم إشارة أو اسم موصول؟ أمّا إن كانت تركيبًا يؤول بمصدر صريح فنسلك مسار المصدر المؤول.`;
    if (id === "kana_khabar_entry") {
        if (/يؤول/.test(q))
            return `ابحث في ${quoted} عن حرف مصدري مع فعل، ثم جرّب تحويل التركيب إلى مصدر صريح.`;
        if (/كلمة واحدة/.test(q))
            return `انظر إلى ${quoted} كما حُددت في المثال: أهي كلمة واحدة أم تركيب من أكثر من كلمة؟`;
        return `حدّد صورة الخبر في ${quoted}: خبر مفرد، جملة اسمية، جملة فعلية، أم شبه جملة من جار ومجرور أو ظرف؟`;
    }
    if (id === "fw_particle_after")
        return `انظر إلى الكلمة التي جاءت بعد ${quoted}: هل تدل على حدث وزمن فتكون فعلًا، أم على معنى بلا زمن فتكون اسمًا؟`;
    if (id === "khabar_sentence_type")
        return `انظر إلى أول كلمة في جملة الخبر: إن بدأت باسم فهي جملة اسمية، وإن بدأت بفعل فهي جملة فعلية.`;
    const fullNounShapeHint = `افحص صورة ${quoted}: مفرد، مثنى، جمع مذكر سالم، جمع مؤنث سالم، جمع تكسير، أم من الأسماء الخمسة؟`;
    if (["mubtada_number", "khabar_single_number", "kana_ism_number", "kana_khabar_single_number", "fael_mu3rab_shape", "mafool_mu3rab_shape", "tawabi_shape"].includes(id))
        return fullNounShapeHint;
    if (["inna_ism_number", "inna_khabar_single_number"].includes(id))
        return `افحص صورة ${quoted}: مفرد أو جمع تكسير، مثنى، جمع مذكر سالم، جمع مؤنث سالم، أم من الأسماء الخمسة؟`;
    if (["fael_form", "mafool_form", "mafoolat_form", "naib_form"].includes(id))
        return `افحص المحدد كله: أهو كلمة مفردة، أم تركيب يمكن تأويله باسم صريح؟ إذا كان كلمة مفردة ننتقل بعد ذلك إلى سؤال: أهي معربة أم مبنية؟`;
    if (["mafoolat_shape", "naib_shape", "munada_shape", "la_nasb_shape", "tawabi_shape"].includes(id))
        return `افحص صورة ${quoted} من لفظها: مفرد، مثنى، جمع، أم من الأسماء الخمسة؟`;
    if (id === "hal_shape")
        return `بعد أن ثبت أن ${quoted} حال، افحص صورتها: أهي كلمة واحدة تصف الهيئة، أم جملة كاملة، أم شبه جملة؟`;
    if (id === "istithna_shape")
        return `بعد تحديد نوع الاستثناء وحكم ${quoted}، افحص صورتها لتحديد العلامة: مفرد، مثنى، جمع، أم اسم مبني؟`;
    if (id === "la_built_shape")
        return `عرفنا أن اسم «لا» هنا مبني. افحص صورته: أمفرد هو، أم مثنى، أم جمع مذكر سالم؟`;
    if (id === "tawabi_form")
        return `عرفنا وظيفة ${quoted} وحالتها من المتبوع؛ افحص الآن: أهي اسم ظاهر معرب، أم اسم مبني، أم جملة، أم شبه جملة؟`;
    if (/_number$|_shape$|_form$/.test(id)) {
        const cleanedShapeHint = diagnosticHintText(rawHint, target);
        if (cleanedShapeHint) return cleanedShapeHint;
        return `افحص صورة ${quoted} من المثال نفسه قبل اختيار العلامة.`;
    }
    if (/_mark$/.test(id)) {
        const cleanedMarkHint = diagnosticHintText(rawHint, target);
        if (cleanedMarkHint) return cleanedMarkHint;
        return `اربط القرارين السابقين: الحالة الإعرابية تحدد مجموعة العلامات الممكنة، وصورة ${quoted} تحدد العلامة داخل هذه المجموعة. لا تنقل علامة كلمة مجاورة إليها.`;
    }
    if (/_case$/.test(id)) {
        const cleanedCaseHint = diagnosticHintText(rawHint, target);
        if (cleanedCaseHint) return cleanedCaseHint;
        return `استخرج وظيفة ${quoted} أولًا، ثم استدع حكم هذه الوظيفة: المرفوعات لها مواقع معروفة، والمنصوبات والمجرورات كذلك. الحالة نتيجة الوظيفة وليست تخمينًا من الحركة الظاهرة.`;
    }
    if (/_role$|_target$|_entry$/.test(id)) {
        const cleanedRoleHint = diagnosticHintText(rawHint, target);
        if (cleanedRoleHint) return cleanedRoleHint;
        return `اربط ${quoted} بالعامل أو الاسم الذي قبله في الجملة: اسأل من قام بالفعل، أو ما الذي وقع عليه، أو ما الذي وصف/أتم معنى ما قبله. العلاقة هي التي تكشف الوظيفة النحوية.`;
    }
    if (/_built$|_built_type$|_mabni/.test(id)) {
        const clean = String(target || "");
        if (/الذي|التي|الذين|اللذ/u.test(clean)) return `لاحظ أن ${quoted} تحتاج جملة بعدها تتم معناها وتوضح المقصود؛ ما الخاصية التي تكشف نوع هذا المبني؟`;
        if (/هذا|هذه|هؤلاء|ذلك|تلك/u.test(clean)) return `لاحظ أن ${quoted} تستعمل للإشارة إلى معيّن؛ ما نوع الاسم المبني الذي وظيفته الإشارة؟`;
        if (/التاء|نون|واو|ألف|ياء|نا/u.test(clean)) return `لاحظ أن ${quoted} جزء متصل بالفعل ويدل على متكلم أو مخاطب أو غائب؛ ما نوع هذا المبني؟`;
        return `بعد أن ثبت أن ${quoted} مبنية، ابحث عن الخاصية المميزة لها: أتدل على متكلم أو مخاطب أو غائب، أم تشير إلى معيّن، أم تحتاج صلة بعدها؟`;
    }
    const cleaned = diagnosticHintText(rawHint, target);
    if (!cleaned)
        return `ارجع إلى ${quoted} داخل الجملة، واربطها بما ثبت في الخطوة السابقة: العامل قبلها، أو علاقتها بالاسم السابق، أو صورتها الصرفية. استخدم هذه القرينة لاستبعاد الخيارات التي لا تنسجم مع المثال.`;
    // نكتفي بأول جملة قصيرة في المستوى الأول.
    const firstSentence = cleaned.split(/(?<=[.؟!])\s+/)[0] || cleaned;
    const words = firstSentence.split(/\s+/).filter(Boolean);
    if (words.length <= 22)
        return firstSentence;
    return `${words.slice(0, 22).join(" ")}…`;
}

