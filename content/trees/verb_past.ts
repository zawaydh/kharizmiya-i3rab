export type ExerciseTree = { startNodeId: string; nodes: Record<string, any> };

export const pastVerbTree: ExerciseTree = {
  startNodeId: "past_word_kind",
  nodes: {
    past_word_kind: {
      id: "past_word_kind",
      type: "question",
      context: "نبدأ من نوع الكلمة؛ لأن الإعراب يختلف إذا كانت الكلمة اسمًا أو فعلًا أو حرفًا.",
      text: "ما نوع الكلمة المحددة؟",
      hint: "الفعل يدل على حدث مقترن بزمن، مثل: كتبَ، ذهبَ، مشى. الاسم يدل على إنسان أو حيوان أو شيء أو معنى، والحرف لا يظهر معناه كاملًا إلا مع غيره.",
      answers: [
        { id: "verb", text: "فعل: حدث مقترن بزمن", next: "past_tense", eval: { fact: "wordKind", equals: "verb" }, hint: "صحيح إذا كانت الكلمة تدل على حدث وقع أو يقع أو يُطلب حدوثه." },
        { id: "noun", text: "اسم", next: "past_word_kind", correct: false, hint: "الاسم لا يدل بنفسه على زمن. أما الكلمة المحددة هنا فتدل على حدث وقع في زمن." },
        { id: "harf", text: "حرف", next: "past_word_kind", correct: false, hint: "الحرف مثل: في، من، إلى. أما الكلمة المحددة هنا فتدل على حدث وزمن." },
      ]
    },

    past_tense: {
      id: "past_tense",
      type: "question",
      context: "عرفنا أنها فعل؛ والآن نحدد زمنه قبل الانتقال إلى علامة البناء.",
      text: "ما زمن هذا الفعل؟",
      hint: "الفعل الماضي يدل على حدث وقع وانتهى، مثل: كتبَ، قرأَ، خرجَ. المضارع يدل على الحاضر أو المستقبل، والأمر يدل على طلب حدوث الفعل.",
      answers: [
        { id: "past", text: "ماضٍ", next: "past_has_attachment", eval: { fact: "verbTense", equals: "past" }, hint: "الفعل الماضي يدل على حدث وقع وانتهى." },
        { id: "present", text: "مضارع", next: "past_tense", correct: false, hint: "المضارع غالبًا يبدأ بأحد أحرف المضارعة: أ، ن، ي، ت، ويدل على حدث يقع الآن أو سيقع، مثل: يكتب." },
        { id: "imperative", text: "أمر", next: "past_tense", correct: false, hint: "فعل الأمر طلب، مثل: اكتبْ. أما الفعل المحدد هنا فليس طلبًا، بل حدث وقع وانتهى." },
      ]
    },

    past_has_attachment: {
      id: "past_has_attachment",
      type: "question",
      context: "بما أن الفعل ماضٍ، والفعل الماضي مبني، نحتاج الآن إلى تحديد علامة بنائه حسب ما يتصل به.",
      text: "هل اتصل بآخر الفعل شيء؟",
      hint: "أسند الفعل إلى «هو» في الماضي، ثم قارن آخر الصورتين: هل ظهرت زيادة في صورة الجملة؟",
      answers: [
        { id: "yes", text: "نعم", next: "past_connector_kind", eval: { fact: "hasAttached", equals: true }, hint: "أسند الفعل إلى الضمير هو في الماضي، ثم قارن بين الصورتين. إذا بقي آخر الفعل كما هو فلا يوجد متصل، وإذا ظهرت زيادة في آخره فالإجابة نعم." },
        { id: "no", text: "لا", next: "past_no_attachment_weak", eval: { fact: "hasAttached", equals: false }, hint: "أسند الفعل إلى الضمير هو في الماضي، ثم قارن. إذا وجدت تاء أو واوًا أو ألف الاثنين أو ضمير نصب في آخر الفعل فقد اتصل به شيء." },
      ]
    },

    past_no_attachment_weak: {
      id: "past_no_attachment_weak",
      type: "question",
      context: "",
      text: "بعد أن عرفنا أنه لم يتصل بآخره شيء، ما حالة آخر الفعل؟",
      hint: "انظر إلى آخر الفعل نفسه. إن كان آخره حرفًا صحيحًا مثل: كتبَ أو قرأَ ظهرت الفتحة. وانتبه: الهمزة في قرأَ ليست ألفًا وليست حرف علة. حروف العلة هي: الألف، والواو، والياء. أما رمى وسعى فآخرهما ألف لا تظهر عليها الفتحة، فيكون البناء على فتح مقدر.",
      answers: [
        { id: "yes", text: "آخره ألف لينة", next: "R_past_fatha_estimated_alif", eval: { fact: "weakEnding", equals: "alif_visible" }, hint: "الألف اللينة تكون مثل آخر: سعى ورمى. أما الهمزة في قرأَ فليست ألفًا وليست حرف علة؛ حروف العلة هي: الألف والواو والياء." },
        { id: "no", text: "آخره صحيح ظاهر", next: "R_past_fatha", eval: { fact: "weakEnding", equals: "none" }, hint: "إذا كان آخره صحيحًا مثل: كتبَ أو قرأَ، ظهرت الفتحة على آخره. والهمزة في قرأَ حرف صحيح ظاهر وليست حرف علة." },
      ]
    },

    past_connector_kind: {
      id: "past_connector_kind",
      type: "question",
      context: "",
      text: "عرفنا أن آخر الفعل اتصل به شيء، فلنحدد ما هو لنعرف علامة البناء. فهل اتصل الفعل بـ:",
      hint: "ميّز المتصل من دلالته: ضمير الرفع يدل على الفاعل ويشغل موقعه؛ أي من قام بالفعل. وضمير النصب يدل على المفعول به ويشغل موقعه؛ أي ما وقع عليه الفعل. أما تاء التأنيث الساكنة فليست ضميرًا، بل علامة على أن الفاعل مؤنث.",
      answers: [
        { id: "raf3", text: "ضمير رفع: أضمر الفاعل", next: "past_raf3_type", eval: { fact: "connectorKind", equals: "raf3" }, hint: "ضمير الرفع يدل على من قام بالفعل. مثل: التاء في كتبتُ، والواو في كتبوا. إن كان المتصل يدل على الشيء الذي وقع عليه الفعل فلا تختر ضمير رفع." },
        { id: "nasb", text: "ضمير نصب: أضمر المفعول به", next: "past_nasb_weak", eval: { fact: "connectorKind", equals: "nasb" }, hint: "ضمير النصب يدل على ما وقع عليه الفعل، لا على من قام به. مثل الهاء في: قرأهُ الطالبُ؛ الهاء هي الشيء المقروء." },
        { id: "taa", text: "تاء التأنيث الساكنة", next: "past_taa_weak", eval: { fact: "connectorKind", equals: "taa_tanith" }, hint: "تاء التأنيث الساكنة ليست ضميرًا؛ بل علامة على أن الفاعل مؤنث. قد يأتي الفاعل ظاهرًا بعدها مثل: غادرتْ الطائرةُ المطارَ. وقد يكون الفاعل ضميرًا مستترًا إذا تقدّم الاسم، مثل: الطائرةُ غادرتْ المطارَ؛ فالطائرة مبتدأ، والفاعل في غادرتْ ضمير مستتر تقديره هي، لأن الفاعل لا يتقدم على الفعل." },
      ]
    },

    past_nasb_weak: {
      id: "past_nasb_weak",
      type: "question",
      context: "",
      text: "بعد حذف ضمير النصب مؤقتًا، ما حالة أصل الفعل؟",
      hint: "احذف ضمير النصب مؤقتًا: رماهُ ← رمى. إذا انتهى أصل الفعل بألف لينة فالفتحة لا تظهر على الألف، فنقول: مبني على الفتح المقدر." ,
      answers: [
        { id: "yes", text: "أصله ينتهي بألف لينة", next: "R_past_fatha_nasb_estimated_alif", eval: { fact: "weakEnding", equals: "alif_visible" }, hint: "إذا كان أصل الفعل مثل: رمى، فالفتحة لا تظهر على الألف، فنقول: مبني على الفتح المقدر." },
        { id: "no", text: "أصله صحيح الآخر", next: "R_past_fatha_nasb", eval: { fact: "weakEnding", equals: "none" }, hint: "إذا كان أصل الفعل مثل: كتبَ أو قرأَ، فالفتح ظاهر، والهاء أو الكاف ضمير نصب لا يؤثر في البناء." },
      ]
    },

    past_taa_weak: {
      id: "past_taa_weak",
      type: "question",
      context: "",
      text: "هل هناك حرف علة محذوف من آخر الفعل؟",
      hint: "أسند الفعل إلى الضمير هو في الزمن الماضي، ثم قارن: مشتْ ← هو مشى. أصل الفعل ينتهي بألف، وهذه الألف غير ظاهرة في مشتْ؛ إذن هناك حرف علة محذوف. إذا لم يظهر في الأصل حرف علة غائب عن الفعل، فلا يوجد حذف. لا نرجع إلى المضارع؛ لأننا نحلل فعلًا ماضيًا.",
      answers: [
        { id: "yes", text: "نعم، حُذف حرف علة", next: "past_deleted_letter_taa", eval: { fact: "weakDeleted", equals: true }, hint: "صحيح إذا أظهر الإسناد إلى هو حرف علة غير موجود في الفعل أمامك، مثل: مشتْ ← هو مشى." },
        { id: "no", text: "لا، لم يُحذف حرف علة", next: "R_past_fatha_taa", eval: { fact: "weakDeleted", equals: false }, hint: "أسند الفعل إلى هو في الماضي. إذا كان الماضي مع هو مثل الفعل نفسه في الأصل، مثل: نجحتْ ← هو نجحَ، فلا يوجد حرف علة محذوف. أمّا مشتْ ← هو مشى، ففيها ألف محذوفة." },
      ]
    },

    past_weak_base_taa: {
      id: "past_weak_base_taa",
      type: "question",
      context: "لمعرفة الحرف المحذوف نرد الفعل الماضي إلى صورته مع الضمير هو.",
      text: "ما صورة الفعل الماضي مع الضمير هو؟",
      hint: "نقول في الماضي: هو مشى، لا: هو يمشي. الرجوع للمضارع قد يغيّر صورة حرف العلة.",
      answers: [
        { id: "masha", text: "هو مشى", next: "past_deleted_letter_taa", eval: { fact: "basePastHuwa", equals: "مشى" }, hint: "صحيح إذا كان الفعل مثل: مشتْ، فأصله مع هو: مشى." },
        { id: "baqiya", text: "هو بقي", next: "past_weak_base_taa", correct: false, hint: "هذا يصلح لفعل مثل: بقيتْ، لكنه ليس من مسار الحذف؛ لأن الياء باقية ظاهرة. في مثال مشتْ نقول: هو مشى." },
        { id: "yamshi", text: "هو يمشي", next: "past_weak_base_taa", correct: false, hint: "هذا مضارع، ونحن نحلل فعلًا ماضيًا؛ لذلك نرده إلى الماضي مع هو." },
      ]
    },

    past_deleted_letter_taa: {
      id: "past_deleted_letter_taa",
      type: "question",
      context: "نحدد حرف العلة المحذوف بالمقارنة مع صورة الماضي المسند إلى هو.",
      text: "ما حرف العلة المحذوف من آخر الفعل؟",
      hint: "أسند الفعل إلى هو في الماضي: مشتْ ← هو مشى. آخر الأصل ألف، وهذه الألف غير ظاهرة في مشتْ؛ إذن المحذوف هو الألف. لا ترجع إلى المضارع.",
      answers: [
        { id: "alif", text: "الألف", next: "R_past_weak_taa_alif", eval: { fact: "deletedLetter", equals: "alif" }, hint: "إذا كانت صورته مع هو تنتهي بألف مثل: مشى، فالمحذوف ألف." },
        { id: "waw", text: "الواو", next: "past_deleted_letter_taa", correct: false, hint: "ارجع إلى صورة الماضي مع هو، ثم انظر إلى آخر حرف علة فيها. مشتْ ← هو مشى، فالمحذوف ألف لا واو." },
      ]
    },

    past_raf3_type: {
      id: "past_raf3_type",
      type: "question",
      context: "",
      text: "ما ضمير الرفع المتصل بالفعل؟",
      hint: "تاء الفاعل ونا الفاعلين ونون النسوة تجعل الماضي مبنيًا على السكون. ألف الاثنين تجعله مبنيًا على الفتح. واو الجماعة تجعله مبنيًا على الضم.",
      answers: [
        { id: "sukoon", text: "تاء الفاعل / نا الفاعلين / نون النسوة", next: "past_sukoon_raf3_type", eval: { fact: "raf3BuildGroup", equals: "sukoon" }, hint: "هذه الضمائر تدل على الفاعل، ويُبنى الفعل الماضي معها على السكون." },
        { id: "alif", text: "ألف الاثنين", next: "past_alif_weak", eval: { fact: "raf3BuildGroup", equals: "alif" }, hint: "ألف الاثنين ضمير متصل يدل على فاعلين اثنين، مثل: حضرا وسعيا. أما الألف في رجعوا فهي ألف فارقة بعد واو الجماعة وليست ألف الاثنين." },
        { id: "waw", text: "واو الجماعة", next: "past_waw_weak", eval: { fact: "raf3BuildGroup", equals: "waw" }, hint: "واو الجماعة تدل على جماعة قاموا بالفعل، مثل: رجعوا. والألف بعدها ألف فارقة لا محل لها، وليست ألف الاثنين." },
      ]
    },

    past_sukoon_raf3_type: {
      id: "past_sukoon_raf3_type",
      type: "question",
      context: "عرفنا أن الفعل مبني على السكون لاتصاله بضمير رفع متحرك، ونحدد الضمير ليكون الإعراب النهائي دقيقًا.",
      text: "أي ضمير رفع من ضمائر السكون اتصل بالفعل؟",
      hint: "تاء الفاعل مثل: فهمتُ، نا الفاعلين مثل: حفظنا، نون النسوة مثل: جلسنَ. كلها تجعل الفعل الماضي مبنيًا على السكون.",
      answers: [
        { id: "taa", text: "تاء الفاعل", next: "R_past_sukoon_taa_fael", eval: { fact: "raf3Type", equals: "taa_fael" }, hint: "تاء الفاعل تدل على المتكلم أو المخاطب: فهمتُ، فهمتَ، فهمتِ." },
        { id: "na", text: "نا الفاعلين", next: "R_past_sukoon_na_faelin", eval: { fact: "raf3Type", equals: "na_faelin" }, hint: "انتبه: نا ليست دائمًا ضمير رفع. في حفظنا النشيدَ: نا أضمرت من قاموا بالحفظ، فهي نا الفاعلين. أما في حفظَنا اللهُ: نا أضمرت المفعول به، ويكون الفاعل هو اللهُ." },
        { id: "niswa", text: "نون النسوة", next: "R_past_sukoon_niswa", eval: { fact: "raf3Type", equals: "niswa" }, hint: "نون النسوة ضمير رفع يدل على جماعة الإناث، مثل: الطالباتُ جلسنَ." },
      ]
    },

    past_alif_weak: {
      id: "past_alif_weak",
      type: "question",
      context: "ألف الاثنين ضمير رفع يدل على فاعلين اثنين، ويكون الحكم معها مباشرًا.",
      text: "ما الحكم بعد اتصال الفعل بألف الاثنين؟",
      hint: "الفعل الناقص هو الفعل المعتل الآخر؛ أي الذي ينتهي بألف أو واو أو ياء. في حضرا: الأصل حضر، صحيح الآخر. وفي سعيا: الأصل سعى، فعل ناقص لأنه ينتهي بألف.",
      answers: [
        { id: "no", text: "لا، فعله صحيح الآخر", next: "R_past_fatha_alif", eval: { fact: "weakOrigin", equals: false }, hint: "مثل: حضرا أو كتبا، الفعل صحيح الآخر والبناء على الفتح." },
        { id: "yes", text: "نعم، أصله فعل ناقص", next: "R_past_fatha_alif_weak", eval: { fact: "weakOrigin", equals: true }, hint: "سعيا أصلها: سعى. والفعل الناقص هو المعتل الآخر، أي الذي ينتهي بألف أو واو أو ياء. هنا لا نسلك مسار الحذف؛ الحكم: فعل ماضٍ مبني على الفتح لاتصاله بألف الاثنين." },
      ]
    },

    past_waw_weak: {
      id: "past_waw_weak",
      type: "question",
      context: "",
      text: "هل هناك حرف علة محذوف من آخر الفعل؟",
      hint: "أسند الفعل إلى «هو» في الماضي: هل يظهر في الأصل حرف علة غير موجود في الصورة المتصلة بواو الجماعة؟",
      answers: [
        { id: "yes", text: "نعم، حُذف حرف علة", next: "past_deleted_letter_waw", eval: { fact: "weakDeleted", equals: true }, hint: "إذا ظهر في الماضي مع هو حرف علة غير موجود قبل واو الجماعة، فهذا الحرف هو المحذوف. مضَوا ← هو مضى، بقُوا ← هو بقي." },
        { id: "no", text: "لا، لم يُحذف حرف علة", next: "R_past_damma_waw", eval: { fact: "weakDeleted", equals: false }, hint: "أسند الفعل إلى هو في الماضي: رجعوا ← هو رجعَ؛ لم يظهر حرف علة في آخر الأصل، إذن لا حذف. أما مضَوا ← هو مضى، وبقُوا ← هو بقي، ففيهما حذف." },
      ]
    },

    past_weak_base_waw: {
      id: "past_weak_base_waw",
      type: "question",
      context: "لمعرفة الحرف المحذوف قبل واو الجماعة نرد الفعل إلى الماضي مع الضمير هو، لا إلى المضارع.",
      text: "ما صورة الفعل الماضي مع الضمير هو؟",
      hint: "لا نرجعه إلى المضارع؛ لأن المضارع قد يغيّر صورة حرف العلة. بقُوا ← هو بقي، لا: هو يبقى.",
      answers: [
        { id: "mada", text: "هو مضى", next: "past_deleted_letter_waw", eval: { fact: "basePastHuwa", equals: "مضى" }, hint: "صحيح إذا كان الفعل مثل: مضَوا؛ أصله مع هو: مضى." },
        { id: "baqiya", text: "هو بقي", next: "past_deleted_letter_waw", eval: { fact: "basePastHuwa", equals: "بقي" }, hint: "صحيح إذا كان الفعل مثل: بقُوا؛ أصله مع هو: بقي." },
        { id: "yabqa", text: "هو يبقى", next: "past_weak_base_waw", correct: false, hint: "هذا مضارع. نحن نحلل فعلًا ماضيًا، لذلك نرده إلى الماضي مع هو: بقي." },
      ]
    },

    past_deleted_letter_waw: {
      id: "past_deleted_letter_waw",
      type: "question",
      context: "نحدد الحرف المحذوف بالمقارنة بين الفعل أمامنا وصورته مع هو في الماضي.",
      text: "ما حرف العلة المحذوف من آخر الفعل؟",
      hint: "أسند الفعل إلى هو في الماضي: مضَوا ← هو مضى، بقُوا ← هو بقي. مضى تنتهي بألف؛ فالمحذوف ألف. بقي تنتهي بياء؛ فالمحذوف ياء. لا تحكم من المضارع: يبقى.",
      answers: [
        { id: "alif", text: "الألف", next: "R_past_weak_waw_alif", eval: { fact: "deletedLetter", equals: "alif" }, hint: "إذا كانت صورته مع هو تنتهي بألف مثل: مضى، فالمحذوف ألف." },
        { id: "yaa", text: "الياء", next: "R_past_weak_waw_yaa", eval: { fact: "deletedLetter", equals: "yaa" }, hint: "إذا كانت صورته مع هو تنتهي بياء مثل: بقي، فالمحذوف ياء، ولو كان المضارع: يبقى." },
        { id: "waw", text: "الواو", next: "past_deleted_letter_waw", correct: false, hint: "انظر إلى صورة الماضي مع هو، لا إلى الواو المتصلة في آخر الفعل. واو الجماعة ضمير، وليست الحرف المحذوف." },
      ]
    },

    R_past_fatha: {
      id: "R_past_fatha",
      type: "result",
      coverage: "past.fatha",
      text: "فعل ماضٍ مبني على الفتح الظاهر على آخره."
    },
    R_past_fatha_estimated_alif: {
      id: "R_past_fatha_estimated_alif",
      type: "result",
      coverage: "past.fatha_estimated_alif",
      text: "فعل ماضٍ مبني على الفتح المقدر على الألف."
    },
    R_past_fatha_nasb: {
      id: "R_past_fatha_nasb",
      type: "result",
      coverage: "past.fatha_nasb",
      text: "فعل ماضٍ مبني على الفتح الظاهر على آخره، والهاء ضمير متصل مبني في محل نصب مفعول به."
    },
    R_past_fatha_nasb_estimated_alif: {
      id: "R_past_fatha_nasb_estimated_alif",
      type: "result",
      coverage: "past.fatha_nasb_estimated_alif",
      text: "فعل ماضٍ مبني على الفتح المقدر على الألف، والهاء ضمير متصل مبني في محل نصب مفعول به."
    },
    R_past_fatha_taa: {
      id: "R_past_fatha_taa",
      type: "result",
      coverage: "past.fatha_taa",
      text: "نجحتْ: فعل ماضٍ مبني على الفتح الظاهر على آخره. والتاء: تاء تأنيث ساكنة لا محل لها من الإعراب."
    },
    R_past_weak_taa_alif: {
      id: "R_past_weak_taa_alif",
      type: "result",
      coverage: "past.weak_taa_alif",
      text: "مشتْ: فعل ماضٍ مبني على الفتح المقدر على الألف المحذوفة. والتاء: تاء تأنيث ساكنة لا محل لها من الإعراب."
    },
    R_past_fatha_taa_yaa_visible: {
      id: "R_past_fatha_taa_yaa_visible",
      type: "result",
      coverage: "past.fatha_taa_yaa_visible",
      text: "بقيتْ: فعل ماضٍ مبني على الفتح الظاهر على الياء. والتاء: تاء تأنيث ساكنة لا محل لها من الإعراب."
    },
    R_past_damma_waw: {
      id: "R_past_damma_waw",
      type: "result",
      coverage: "past.damma_waw",
      text: "رجعوا: فعل ماضٍ مبني على الضم لاتصاله بواو الجماعة. وواو الجماعة: ضمير متصل مبني في محل رفع فاعل. والألف: ألف فارقة لا محل لها من الإعراب."
    },
    R_past_weak_waw_alif: {
      id: "R_past_weak_waw_alif",
      type: "result",
      coverage: "past.weak_waw_alif",
      text: "مضَوا: فعل ماضٍ مبني على الضم المقدر على الألف المحذوفة لاتصاله بواو الجماعة. وواو الجماعة: ضمير متصل مبني في محل رفع فاعل. والألف: ألف فارقة لا محل لها من الإعراب."
    },
    R_past_weak_waw_yaa: {
      id: "R_past_weak_waw_yaa",
      type: "result",
      coverage: "past.weak_waw_yaa",
      text: "بقُوا: فعل ماضٍ مبني على الضم المقدر على الياء المحذوفة لاتصاله بواو الجماعة. وواو الجماعة: ضمير متصل مبني في محل رفع فاعل. والألف: ألف فارقة لا محل لها من الإعراب."
    },
    R_past_fatha_alif: {
      id: "R_past_fatha_alif",
      type: "result",
      coverage: "past.fatha_alif",
      text: "حضرا: فعل ماضٍ مبني على الفتح لاتصاله بألف الاثنين. وألف الاثنين: ضمير متصل مبني في محل رفع فاعل."
    },
    R_past_fatha_alif_weak: {
      id: "R_past_fatha_alif_weak",
      type: "result",
      coverage: "past.fatha_alif_weak",
      text: "سعيا: فعل ماضٍ مبني على الفتح لاتصاله بألف الاثنين. وألف الاثنين: ضمير متصل مبني في محل رفع فاعل. وأصل الفعل: سعى."
    },
    R_past_sukoon_niswa: {
      id: "R_past_sukoon_niswa",
      type: "result",
      coverage: "past.sukoon_niswa",
      text: "جلسنَ: فعل ماضٍ مبني على السكون لاتصاله بضمير رفع متحرك (نون النسوة). ونون النسوة: ضمير متصل مبني في محل رفع فاعل."
    },
    R_past_sukoon_taa_fael: {
      id: "R_past_sukoon_taa_fael",
      type: "result",
      coverage: "past.sukoon_taa_fael",
      text: "فهمتُ: فعل ماضٍ مبني على السكون لاتصاله بضمير رفع متحرك (تاء الفاعل). والتاء: ضمير متصل مبني في محل رفع فاعل."
    },
    R_past_sukoon_na_faelin: {
      id: "R_past_sukoon_na_faelin",
      type: "result",
      coverage: "past.sukoon_na_faelin",
      text: "حفظنا: فعل ماضٍ مبني على السكون لاتصاله بضمير رفع متحرك (نا الفاعلين). نا: ضمير متصل مبني في محل رفع فاعل."
    }
  }
};
