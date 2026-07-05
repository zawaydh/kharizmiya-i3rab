export type ExerciseTree = { startNodeId: string; nodes: Record<string, any> };

const chooseCorrectHint = "انظر إلى الكلمة المحددة في المثال، ثم اختر ما يثبته المثال نفسه.";

const fiveVerbHint = `الأفعال الخمسة أفعال مضارعة اتصلت بألف الاثنين أو واو الجماعة أو ياء المخاطبة، وأوزانها: يفعلان، تفعلان، يفعلون، تفعلون، تفعلين.`;

const weakHint = `الصحيح الآخر لا ينتهي بحرف علة. والمعتل الآخر ينتهي أصله بألف أو واو أو ياء. والهمزة ليست حرف علة.`;

const deletedWeakHint = `نسند الفعل إلى الضمير هو لنتأكد من الحرف الأخير في أصل الفعل: يسعَ ← هو يسعى، يدعُ ← هو يدعو، يرمِ ← هو يرمي. الحرف الذي يظهر في الأصل ولا يظهر في الفعل المجزوم هو حرف العلة المحذوف.`;

export const presentVerbTree: ExerciseTree = {
  startNodeId: "present_word_kind",
  nodes: {
    present_word_kind: {
      id: "present_word_kind",
      type: "question",
      text: "ما نوع الكلمة المحددة؟",
      hint: `${chooseCorrectHint}\nالفعل يدل على حدث مقترن بزمن، مثل: يكتب، كتب، اكتب. الاسم يدل على إنسان أو شيء أو معنى ويقبل علامات مثل أل والتنوين والجر. والحرف لا يظهر معناه كاملًا إلا مع غيره.` ,
      answers: [
        { id: "a", text: "فعل: حدث مقترن بزمن", next: "present_tense", eval: { fact: "wordKind", equals: "verb" } },
        { id: "b", text: "اسم", next: "present_word_kind", correct: false, hint: "الاسم لا يدل بذاته على زمن. انظر إلى الكلمة المحددة: هل فيها حدث وزمن؟" },
        { id: "c", text: "حرف", next: "present_word_kind", correct: false, hint: "الحرف لا يظهر معناه كاملًا إلا مع غيره. الكلمة المحددة هنا تدل على حدث وزمن." },
        { id: "d", text: "أحتاج تلميح", next: "present_word_kind", correct: false, hint: `${chooseCorrectHint}\nاسأل نفسك: هل الكلمة تدل على عمل يحدث في زمن؟ إذا نعم فهي فعل.` },
      ],
    },

    present_tense: {
      id: "present_tense",
      type: "question",
      context: "عرفنا أن الكلمة فعل، والآن نحدد زمنه قبل الإعراب.",
      text: "ما زمن الفعل؟",
      hint: `${chooseCorrectHint}\nالفعل المضارع يدل على حدث يقع الآن أو يتجدد أو سيقع، مثل: يكتب، يسعى، يدعو. الماضي يدل على حدث وقع وانتهى، والأمر طلب حدوث الفعل.` ,
      answers: [
        { id: "a", text: "ماضٍ", next: "present_tense", correct: false, hint: "الماضي يدل على حدث وقع وانتهى، مثل: كتبَ. أما الفعل المحدد هنا فزمنه متجدد أو حاضر/مستقبل." },
        { id: "b", text: "مضارع", next: "present_build_check", eval: { fact: "tense", equals: "present" } },
        { id: "c", text: "أمر", next: "present_tense", correct: false, hint: "فعل الأمر طلب، مثل: اكتبْ. أما الفعل المحدد هنا ليس طلبًا مباشرًا." },
        { id: "d", text: "أحتاج تلميح", next: "present_tense", correct: false, hint: `${chooseCorrectHint}\nإذا كان الحدث يقع الآن أو يتكرر أو سيقع، فهو مضارع.` },
      ],
    },

    present_build_check: {
      id: "present_build_check",
      type: "question",
      context: "عرفنا أنه فعل مضارع، والمضارع قد يكون مبنيًا وقد يكون معربًا.",
      text: "هل اتصل به ما يجعله مبنيًا؟",
      hint: `انظر إلى آخر الفعل فقط: نون النسوة تبني المضارع على السكون، ونون التوكيد تبنيه على الفتح. أما نون الأفعال الخمسة فهي علامة إعراب لا تبني الفعل.` ,
      answers: [
        { id: "a", text: "نون النسوة", next: "R_present_binaa_niswa", eval: { fact: "buildConnection", equals: "niswa" }, hint: "نون النسوة تكون لجماعة الإناث مثل: يساعدْنَ، وتبني المضارع على السكون." },
        { id: "b", text: "نون التوكيد", next: "R_present_binaa_tawkid", eval: { fact: "buildConnection", equals: "tawkid" }, hint: "نون التوكيد تأتي لتأكيد الفعل مثل: أذاكرنَّ، وتبني المضارع على الفتح." },
        { id: "c", text: "لم يتصل به ما يبنيه", next: "present_tool_presence", eval: { fact: "buildConnection", equals: "none" }, hint: "إذا لم تتصل بالفعل نون النسوة ولا نون التوكيد، بقي الفعل المضارع معربًا." },
        { id: "d", text: "أحتاج تلميح", next: "present_build_check", correct: false, hint: `${chooseCorrectHint}\nانظر إلى آخر الفعل: هل وجدت نون النسوة مثل يساعدْنَ؟ أو نون التوكيد مثل أذاكرنَّ؟ إن لم تجد واحدة منهما فالفعل معرب.` },
      ],
    },

    present_tool_presence: {
      id: "present_tool_presence",
      type: "question",
      context: "لم يتصل به ما يبنيه، إذن هو فعل مضارع معرب. نحدد الآن العامل قبله.",
      text: "هل سبق الفعلَ ناصبٌ أو جازم؟",
      hint: `${chooseCorrectHint}\nانظر إلى ما قبل الفعل مباشرة: أدوات النصب مثل لن، أن، كي تنصب المضارع، وأدوات الجزم مثل لم، لا الناهية، لام الأمر تجزمه. وإذا لم يسبق الفعل ناصب ولا جازم فهو مرفوع.` ,
      answers: [
        { id: "a", text: "لا يوجد ناصب ولا جازم", next: "present_raf3_shape", eval: { fact: "hasTool", equals: false } },
        { id: "b", text: "سبقه حرف نصب", next: "present_nasb_shape", eval: { fact: "tool", equals: "nasb" } },
        { id: "c", text: "سبقه حرف جزم", next: "present_jazm_shape", eval: { fact: "tool", equals: "jazm" } },
        { id: "d", text: "أحتاج تلميح", next: "present_tool_presence", correct: false, hint: `${chooseCorrectHint}\nإذا رأيت أداة نصب مثل: لن، أن، كي فالفعل منصوب. وإذا رأيت أداة جزم مثل: لم، لا الناهية، لام الأمر فالفعل مجزوم. وإذا لم يسبق الفعل ناصب ولا جازم فهو مرفوع.` },
      ],
    },

    present_raf3_shape: {
      id: "present_raf3_shape",
      type: "question",
      context: "لم يسبق الفعل ناصب ولا جازم، إذن هو مرفوع. نحدد صورته لنعرف علامة الرفع.",
      text: "ما صورة الفعل؟",
      hint: `${chooseCorrectHint}\nإذا كان الفعل من الأفعال الخمسة فعلامة رفعه ثبوت النون. وإذا لم يكن منها ننظر إلى آخره: صحيح الآخر يرفع بضمة ظاهرة، ومعتل الآخر يرفع بضمة مقدرة.\n${fiveVerbHint}`,
      answers: [
        { id: "a", text: "فعل صحيح الآخر", next: "R_present_raf3_sahih", eval: { fact: "shape", equals: "sahih" } },
        { id: "b", text: "فعل معتل الآخر", next: "present_raf3_weak_letter", eval: { fact: "shape", equals: "weak" } },
        { id: "c", text: "من الأفعال الخمسة", next: "R_present_raf3_five", eval: { fact: "shape", equals: "five" } },
        { id: "d", text: "أحتاج تلميح", next: "present_raf3_shape", correct: false, hint: `${chooseCorrectHint}\nافحص اتصال الفعل أولًا: واو الجماعة أو ألف الاثنين أو ياء المخاطبة تجعل الفعل من الأفعال الخمسة. إن لم يوجد هذا الاتصال فانظر إلى آخر أصل الفعل.` },
      ],
    },

    present_raf3_weak_letter: {
      id: "present_raf3_weak_letter",
      type: "question",
      context: "الفعل مرفوع ومعتل الآخر، فنحدد حرف العلة لمعرفة سبب تقدير الضمة.",
      text: "ما حرف العلة في آخر الفعل؟",
      hint: `${chooseCorrectHint}\nإذا كان آخره ألفًا مثل يسعى فالضمة مقدرة للتعذر. وإذا كان آخره واوًا أو ياءً مثل يدعو ويرمي فالضمة مقدرة للثقل.` ,
      answers: [
        { id: "a", text: "الألف", next: "R_present_raf3_alif", eval: { fact: "weakLetter", equals: "alif" } },
        { id: "b", text: "الواو", next: "R_present_raf3_waw", eval: { fact: "weakLetter", equals: "waw" } },
        { id: "c", text: "الياء", next: "R_present_raf3_ya", eval: { fact: "weakLetter", equals: "ya" } },
        { id: "d", text: "أحتاج تلميح", next: "present_raf3_weak_letter", correct: false, hint: `${chooseCorrectHint}\nانظر إلى الحرف الأخير الظاهر في الفعل: يسعى آخره ألف، يدعو آخره واو، يرمي آخره ياء.` },
      ],
    },

    present_nasb_shape: {
      id: "present_nasb_shape",
      type: "question",
      context: "سبق الفعل حرف نصب، إذن هو منصوب. نحدد صورته لنعرف علامة النصب.",
      text: "ما صورة الفعل؟",
      hint: `${chooseCorrectHint}\nإذا كان من الأفعال الخمسة فعلامة نصبه حذف النون. وإذا كان صحيح الآخر أو معتلًّا بالواو أو الياء ظهرت الفتحة. وإذا كان معتلًّا بالألف قدرت الفتحة للتعذر.\n${fiveVerbHint}`,
      answers: [
        { id: "a", text: "فعل صحيح الآخر", next: "R_present_nasb_sahih", eval: { fact: "shape", equals: "sahih" } },
        { id: "b", text: "فعل معتل الآخر", next: "present_nasb_weak_letter", eval: { fact: "shape", equals: "weak" } },
        { id: "c", text: "من الأفعال الخمسة", next: "R_present_nasb_five", eval: { fact: "shape", equals: "five" } },
        { id: "d", text: "أحتاج تلميح", next: "present_nasb_shape", correct: false, hint: `${chooseCorrectHint}\nابحث عن اتصال الفعل بواو الجماعة أو ألف الاثنين أو ياء المخاطبة؛ إن وجدت ذلك فهو من الأفعال الخمسة. وإلا فانظر إلى آخر أصل الفعل.` },
      ],
    },

    present_nasb_weak_letter: {
      id: "present_nasb_weak_letter",
      type: "question",
      context: "الفعل منصوب ومعتل الآخر، فنحدد حرف العلة لمعرفة علامة النصب.",
      text: "ما حرف العلة في آخر الفعل؟",
      hint: `${chooseCorrectHint}\nفي النصب: الفتحة تُقدَّر على الألف للتعذر مثل لن يسعى، وتظهر على الواو والياء مثل لن يدعوَ ولن يرميَ.` ,
      answers: [
        { id: "a", text: "الألف", next: "R_present_nasb_alif", eval: { fact: "weakLetter", equals: "alif" } },
        { id: "b", text: "الواو", next: "R_present_nasb_waw", eval: { fact: "weakLetter", equals: "waw" } },
        { id: "c", text: "الياء", next: "R_present_nasb_ya", eval: { fact: "weakLetter", equals: "ya" } },
        { id: "d", text: "أحتاج تلميح", next: "present_nasb_weak_letter", correct: false, hint: `${chooseCorrectHint}\nانظر إلى آخر الفعل المنصوب: أن يسعى آخره ألف، لن يدعوَ آخره واو، أن يرميَ آخره ياء.` },
      ],
    },

    present_jazm_shape: {
      id: "present_jazm_shape",
      type: "question",
      context: "سبق الفعل حرف جزم، إذن هو مجزوم. نحدد صورته لنعرف علامة الجزم.",
      text: "ما صورة الفعل؟",
      hint: `${chooseCorrectHint}\nالصحيح الآخر يجزم بالسكون. معتل الآخر يجزم بحذف حرف العلة. والأفعال الخمسة تجزم بحذف النون.\n${fiveVerbHint}`,
      answers: [
        { id: "a", text: "فعل صحيح الآخر", next: "R_present_jazm_sahih", eval: { fact: "shape", equals: "sahih" } },
        { id: "b", text: "فعل معتل الآخر", next: "present_jazm_weak_letter", eval: { fact: "shape", equals: "weak" } },
        { id: "c", text: "من الأفعال الخمسة", next: "R_present_jazm_five", eval: { fact: "shape", equals: "five" } },
        { id: "d", text: "أحتاج تلميح", next: "present_jazm_shape", correct: false, hint: `${chooseCorrectHint}\nانظر إلى صورة الفعل بعد أداة الجزم: إذا كان متصلًا بواو الجماعة أو ألف الاثنين أو ياء المخاطبة وحُذفت النون فهو من الأفعال الخمسة. وإذا حُذف آخره من أصل معتَلّ مثل يسعى/يدعو/يرمي فهو معتل الآخر.` },
      ],
    },

    present_jazm_weak_letter: {
      id: "present_jazm_weak_letter",
      type: "question",
      context: "الفعل مجزوم ومعتل الآخر، لذلك حُذف حرف العلة من آخره.",
      text: "ما حرف العلة المحذوف؟",
      hint: deletedWeakHint,
      answers: [
        { id: "a", text: "الألف", next: "R_present_jazm_weak_alif", eval: { fact: "weakLetter", equals: "alif" } },
        { id: "b", text: "الواو", next: "R_present_jazm_weak_waw", eval: { fact: "weakLetter", equals: "waw" } },
        { id: "c", text: "الياء", next: "R_present_jazm_weak_ya", eval: { fact: "weakLetter", equals: "ya" } },
        { id: "d", text: "أحتاج تلميح", next: "present_jazm_weak_letter", correct: false, hint: deletedWeakHint },
      ],
    },

    R_present_binaa_niswa: {
      id: "R_present_binaa_niswa",
      type: "result",
      coverage: "present.binaa.niswa",
      text: "فعل مضارع مبني على السكون لاتصاله بنون النسوة.\nنون النسوة: ضمير متصل مبني في محل رفع فاعل.\nهنا حُسم البناء، فلا نبحث عن رفع أو نصب أو جزم."
    },
    R_present_binaa_tawkid: {
      id: "R_present_binaa_tawkid",
      type: "result",
      coverage: "present.binaa.tawkid",
      text: "فعل مضارع مبني على الفتح لاتصاله بنون التوكيد.\nنون التوكيد: حرف يفيد توكيد الفعل، لا محل له من الإعراب.\nهنا حُسم البناء، فلا نبحث عن رفع أو نصب أو جزم."
    },

    R_present_raf3_sahih: {
      id: "R_present_raf3_sahih",
      type: "result",
      coverage: "present.raf3.sahih",
      text: "فعل مضارع مرفوع.\nعلامة رفعه: الضمة الظاهرة على آخره."
    },
    R_present_raf3_alif: {
      id: "R_present_raf3_alif",
      type: "result",
      coverage: "present.raf3.alif",
      text: "فعل مضارع مرفوع.\nعلامة رفعه: الضمة المقدرة على الألف منع من ظهورها التعذر."
    },
    R_present_raf3_waw: {
      id: "R_present_raf3_waw",
      type: "result",
      coverage: "present.raf3.waw",
      text: "فعل مضارع مرفوع.\nعلامة رفعه: الضمة المقدرة على الواو منع من ظهورها الثقل."
    },
    R_present_raf3_ya: {
      id: "R_present_raf3_ya",
      type: "result",
      coverage: "present.raf3.ya",
      text: "فعل مضارع مرفوع.\nعلامة رفعه: الضمة المقدرة على الياء منع من ظهورها الثقل."
    },
    R_present_raf3_five: {
      id: "R_present_raf3_five",
      type: "result",
      coverage: "present.raf3.five",
      text: "فعل مضارع مرفوع.\nعلامة رفعه: ثبوت النون؛ لأنه من الأفعال الخمسة.\nالأفعال الخمسة أفعال مضارعة اتصلت بألف الاثنين أو واو الجماعة أو ياء المخاطبة."
    },

    R_present_nasb_sahih: {
      id: "R_present_nasb_sahih",
      type: "result",
      coverage: "present.nasb.sahih",
      text: "فعل مضارع منصوب.\nعلامة نصبه: الفتحة الظاهرة على آخره."
    },
    R_present_nasb_alif: {
      id: "R_present_nasb_alif",
      type: "result",
      coverage: "present.nasb.alif",
      text: "فعل مضارع منصوب.\nعلامة نصبه: الفتحة المقدرة على الألف منع من ظهورها التعذر."
    },
    R_present_nasb_waw: {
      id: "R_present_nasb_waw",
      type: "result",
      coverage: "present.nasb.waw",
      text: "فعل مضارع منصوب.\nعلامة نصبه: الفتحة الظاهرة على آخره."
    },
    R_present_nasb_ya: {
      id: "R_present_nasb_ya",
      type: "result",
      coverage: "present.nasb.ya",
      text: "فعل مضارع منصوب.\nعلامة نصبه: الفتحة الظاهرة على آخره."
    },
    R_present_nasb_five: {
      id: "R_present_nasb_five",
      type: "result",
      coverage: "present.nasb.five",
      text: "فعل مضارع منصوب.\nعلامة نصبه: حذف النون؛ لأنه من الأفعال الخمسة.\nالأفعال الخمسة أفعال مضارعة اتصلت بألف الاثنين أو واو الجماعة أو ياء المخاطبة."
    },

    R_present_jazm_sahih: {
      id: "R_present_jazm_sahih",
      type: "result",
      coverage: "present.jazm.sahih",
      text: "فعل مضارع مجزوم.\nعلامة جزمه: السكون."
    },
    R_present_jazm_weak_alif: {
      id: "R_present_jazm_weak_alif",
      type: "result",
      coverage: "present.jazm.weak.alif",
      text: "فعل مضارع مجزوم.\nعلامة جزمه: حذف حرف العلة.\nحرف العلة المحذوف: الألف."
    },
    R_present_jazm_weak_waw: {
      id: "R_present_jazm_weak_waw",
      type: "result",
      coverage: "present.jazm.weak.waw",
      text: "فعل مضارع مجزوم.\nعلامة جزمه: حذف حرف العلة.\nحرف العلة المحذوف: الواو."
    },
    R_present_jazm_weak_ya: {
      id: "R_present_jazm_weak_ya",
      type: "result",
      coverage: "present.jazm.weak.ya",
      text: "فعل مضارع مجزوم.\nعلامة جزمه: حذف حرف العلة.\nحرف العلة المحذوف: الياء."
    },
    R_present_jazm_five: {
      id: "R_present_jazm_five",
      type: "result",
      coverage: "present.jazm.five",
      text: "فعل مضارع مجزوم.\nعلامة جزمه: حذف النون؛ لأنه من الأفعال الخمسة.\nالأفعال الخمسة أفعال مضارعة اتصلت بألف الاثنين أو واو الجماعة أو ياء المخاطبة."
    },
  }
};
