export type ExerciseTree = { startNodeId: string; nodes: Record<string, any> };

export const presentVerbTree: ExerciseTree = {
  startNodeId: "present_step_1",
  nodes: {
    present_step_1: {
      id: "present_step_1",
      type: "question",
      context: "لنأخذها بهدوء: عرفنا أن الكلمة فعل.",
      text: "ما أول قرار نحتاجه الآن؟",
      hint: "بعد معرفة أنها فعل، نحدد الزمن.",
      answers: [
        { id: "a", text: "نحدد زمن الفعل", next: "present_tense", correct: true },
        { id: "b", text: "نحدد العلامة مباشرة", next: "present_step_1", correct: false, hint: "لا نقفز للعلامة قبل الزمن والعامل." },
        { id: "c", text: "نبحث عن الخبر", next: "present_step_1", correct: false, hint: "الخبر يخص الجملة الاسمية، ونحن الآن مع فعل." }
      ]
    },
    present_tense: {
      id: "present_tense",
      type: "question",
      context: "نبحث عن زمن الفعل.",
      text: "هل يدل على حاضر أو مستقبل؟",
      hint: "الفعل المضارع يدل غالبًا على الحاضر أو المستقبل، ويبدأ بأحد أحرف: أ، ن، ي، ت.",
      answers: [
        { id: "a", text: "نعم، فعل مضارع", next: "present_has_tool", correct: true },
        { id: "b", text: "لا، فعل ماضٍ", next: "present_tense", correct: false, hint: "الماضي يدل على حدث وقع وانتهى." },
        { id: "c", text: "لا، فعل أمر", next: "present_tense", correct: false, hint: "الأمر يدل على طلب حدوث الفعل." }
      ]
    },
    present_has_tool: {
      id: "present_has_tool",
      type: "question",
      context: "عرفنا أنه فعل مضارع؛ الآن نفحص العامل قبله. (العامل: كلمة تؤثر في إعراب ما بعدها)",
      text: "هل سبق الفعل عامل نصب أو جزم؟",
      hint: "انظر إلى الكلمة السابقة للفعل: مثل لن/أن للنصب، ولم/لا الناهية للجزم.",
      answers: [
        { id: "a", text: "سبق بعامل نصب", next: "nasb_attached_check", eval: { fact: "tool", equals: "nasb" }, hint: "أدوات النصب مثل: أن، لن، كي، حتى." },
        { id: "b", text: "سبق بعامل جزم", next: "jazm_attached_check", eval: { fact: "tool", equals: "jazm" }, hint: "أدوات الجزم مثل: لم، لا الناهية، لام الأمر." },
        { id: "c", text: "لم يسبق بعامل نصب أو جزم", next: "raf3_attached_check", eval: { fact: "tool", equals: "none" }, hint: "إذا لم يسبق بناصب أو جازم يبقى المضارع مرفوعًا." }
      ]
    },
    raf3_attached_check: {
      id: "raf3_attached_check",
      type: "question",
      context: "عرفنا أن المضارع مرفوع؛ الآن نفحص الاتصال.",
      text: "هل اتصل بواو الجماعة أو ألف الاثنين أو ياء المخاطبة؟",
      hint: "إذا اتصل بأحد هذه الضمائر فهو من الأفعال الخمسة.",
      answers: [
        { id: "a", text: "نعم، اتصل بأحدها", next: "raf3_attached_type", eval: { fact: "attachedGroup", equals: "yes" } },
        { id: "b", text: "لا، لم يتصل بأحدها", next: "raf3_ending", eval: { fact: "attachedGroup", equals: "no" } }
      ]
    },
    raf3_attached_type: {
      id: "raf3_attached_type",
      type: "question",
      context: "إذن الفعل من الأفعال الخمسة، وعند الرفع علامته ثبوت النون.",
      text: "ما الضمير المتصل بالفعل؟",
      hint: "نحدد الضمير حتى نبني الإعراب كاملًا.",
      answers: [
        { id: "a", text: "واو الجماعة", next: "R_present_raf3_waw", eval: { fact: "attached", equals: "waw" } },
        { id: "b", text: "ياء المخاطبة", next: "R_present_raf3_yaa", eval: { fact: "attached", equals: "yaa" } },
        { id: "c", text: "ألف الاثنين", next: "R_present_raf3_alif2", eval: { fact: "attached", equals: "alif2" } }
      ]
    },
    nasb_attached_check: {
      id: "nasb_attached_check",
      type: "question",
      context: "العامل السابق جعل المضارع منصوبًا؛ الآن نفحص الاتصال.",
      text: "هل اتصل بواو الجماعة أو ألف الاثنين أو ياء المخاطبة؟",
      hint: "إذا اتصل بأحدها فهو من الأفعال الخمسة، وعند النصب علامته حذف النون.",
      answers: [
        { id: "a", text: "نعم، اتصل بأحدها", next: "nasb_attached_type", eval: { fact: "attachedGroup", equals: "yes" } },
        { id: "b", text: "لا، لم يتصل بأحدها", next: "nasb_ending", eval: { fact: "attachedGroup", equals: "no" } }
      ]
    },
    nasb_attached_type: {
      id: "nasb_attached_type",
      type: "question",
      context: "إذن الفعل من الأفعال الخمسة، وعند النصب علامته حذف النون.",
      text: "ما الضمير المتصل بالفعل؟",
      hint: "الضمير المتصل هنا يكون في محل رفع فاعل.",
      answers: [
        { id: "a", text: "واو الجماعة", next: "R_present_nasb_waw", eval: { fact: "attached", equals: "waw" } },
        { id: "b", text: "ياء المخاطبة", next: "R_present_nasb_yaa", eval: { fact: "attached", equals: "yaa" } },
        { id: "c", text: "ألف الاثنين", next: "R_present_nasb_alif2", eval: { fact: "attached", equals: "alif2" } }
      ]
    },
    jazm_attached_check: {
      id: "jazm_attached_check",
      type: "question",
      context: "العامل السابق جعل المضارع مجزومًا؛ الآن نفحص الاتصال.",
      text: "هل اتصل بواو الجماعة أو ألف الاثنين أو ياء المخاطبة؟",
      hint: "إذا اتصل بأحدها فهو من الأفعال الخمسة، وعند الجزم علامته حذف النون.",
      answers: [
        { id: "a", text: "نعم، اتصل بأحدها", next: "jazm_attached_type", eval: { fact: "attachedGroup", equals: "yes" } },
        { id: "b", text: "لا، لم يتصل بأحدها", next: "jazm_ending", eval: { fact: "attachedGroup", equals: "no" } }
      ]
    },
    jazm_attached_type: {
      id: "jazm_attached_type",
      type: "question",
      context: "إذن الفعل من الأفعال الخمسة، وعند الجزم علامته حذف النون.",
      text: "ما الضمير المتصل بالفعل؟",
      hint: "لا نقول: مجزوم بحذف النون. الجزم سببه العامل، وحذف النون علامة الجزم.",
      answers: [
        { id: "a", text: "واو الجماعة", next: "R_present_jazm_waw", eval: { fact: "attached", equals: "waw" } },
        { id: "b", text: "ياء المخاطبة", next: "R_present_jazm_yaa", eval: { fact: "attached", equals: "yaa" } },
        { id: "c", text: "ألف الاثنين", next: "R_present_jazm_alif2", eval: { fact: "attached", equals: "alif2" } }
      ]
    },
    raf3_ending: { id: "raf3_ending", type: "question", context: "لم يتصل بأحد ضمائر الأفعال الخمسة؛ نفحص آخر الفعل.", text: "ما حالة آخر الفعل؟", hint: "حروف العلة: الألف والواو والياء.", answers: [ { id: "a", text: "صحيح الآخر", next: "R_present_raf3_sahih", eval: { fact: "ending", equals: "sahih" } }, { id: "b", text: "معتل الآخر", next: "raf3_weak", eval: { fact: "ending", equals: "weak" } } ] },
    raf3_weak: { id: "raf3_weak", type: "question", context: "عرفنا أنه معتل الآخر.", text: "ما حرف العلة في آخره؟", hint: "الألف تمنع ظهور الضمة للتعذر، والواو/الياء للثقل.", answers: [ { id: "a", text: "ألف", next: "R_present_raf3_alif", eval: { fact: "weakLetter", equals: "alif" } }, { id: "b", text: "واو أو ياء", next: "R_present_raf3_waw_ya", eval: { fact: "weakLetter", equals: "waw_ya" } } ] },
    nasb_ending: { id: "nasb_ending", type: "question", context: "عرفنا أنه منصوب وليس من الأفعال الخمسة.", text: "ما حالة آخر الفعل؟", hint: "الفتحة تظهر على الصحيح والواو والياء، وتقدر على الألف.", answers: [ { id: "a", text: "صحيح الآخر", next: "R_present_nasb_sahih", eval: { fact: "ending", equals: "sahih" } }, { id: "b", text: "آخره ألف", next: "R_present_nasb_alif", eval: { fact: "weakLetter", equals: "alif" } }, { id: "c", text: "آخره واو أو ياء", next: "R_present_nasb_waw_ya", eval: { fact: "weakLetter", equals: "waw_ya" } } ] },
    jazm_ending: { id: "jazm_ending", type: "question", context: "عرفنا أنه مجزوم وليس من الأفعال الخمسة.", text: "ما حالة آخر الفعل؟", hint: "الصحيح يجزم بالسكون، والمعتل يجزم بحذف حرف العلة.", answers: [ { id: "a", text: "صحيح الآخر", next: "R_present_jazm_sahih", eval: { fact: "ending", equals: "sahih" } }, { id: "b", text: "معتل الآخر", next: "R_present_jazm_weak", eval: { fact: "ending", equals: "weak" } } ] },

    R_present_raf3_sahih: { id: "R_present_raf3_sahih", type: "result", coverage: "present.raf3.sahih", text: "فعل مضارع مرفوع وعلامة رفعه الضمة الظاهرة على آخره." },
    R_present_raf3_alif: { id: "R_present_raf3_alif", type: "result", coverage: "present.raf3.alif", text: "فعل مضارع مرفوع وعلامة رفعه الضمة المقدرة على آخره منع من ظهورها التعذر." },
    R_present_raf3_waw_ya: { id: "R_present_raf3_waw_ya", type: "result", coverage: "present.raf3.waw_ya", text: "فعل مضارع مرفوع وعلامة رفعه الضمة المقدرة على آخره منع من ظهورها الثقل." },
    R_present_raf3_waw: { id: "R_present_raf3_waw", type: "result", coverage: "present.raf3.waw", text: "فعل مضارع مرفوع وعلامة رفعه ثبوت النون لأنه من الأفعال الخمسة، وواو الجماعة ضمير متصل مبني في محل رفع فاعل." },
    R_present_raf3_yaa: { id: "R_present_raf3_yaa", type: "result", coverage: "present.raf3.yaa", text: "فعل مضارع مرفوع وعلامة رفعه ثبوت النون لأنه من الأفعال الخمسة، وياء المخاطبة ضمير متصل مبني في محل رفع فاعل." },
    R_present_raf3_alif2: { id: "R_present_raf3_alif2", type: "result", coverage: "present.raf3.alif2", text: "فعل مضارع مرفوع وعلامة رفعه ثبوت النون لأنه من الأفعال الخمسة، وألف الاثنين ضمير متصل مبني في محل رفع فاعل." },
    R_present_nasb_sahih: { id: "R_present_nasb_sahih", type: "result", coverage: "present.nasb.sahih", text: "فعل مضارع منصوب وعلامة نصبه الفتحة الظاهرة على آخره." },
    R_present_nasb_alif: { id: "R_present_nasb_alif", type: "result", coverage: "present.nasb.alif", text: "فعل مضارع منصوب وعلامة نصبه الفتحة المقدرة على آخره منع من ظهورها التعذر." },
    R_present_nasb_waw_ya: { id: "R_present_nasb_waw_ya", type: "result", coverage: "present.nasb.waw_ya", text: "فعل مضارع منصوب وعلامة نصبه الفتحة الظاهرة على آخره." },
    R_present_nasb_waw: { id: "R_present_nasb_waw", type: "result", coverage: "present.nasb.waw", text: "فعل مضارع منصوب وعلامة نصبه حذف النون لأنه من الأفعال الخمسة، وواو الجماعة ضمير متصل مبني في محل رفع فاعل." },
    R_present_nasb_yaa: { id: "R_present_nasb_yaa", type: "result", coverage: "present.nasb.yaa", text: "فعل مضارع منصوب وعلامة نصبه حذف النون لأنه من الأفعال الخمسة، وياء المخاطبة ضمير متصل مبني في محل رفع فاعل." },
    R_present_nasb_alif2: { id: "R_present_nasb_alif2", type: "result", coverage: "present.nasb.alif2", text: "فعل مضارع منصوب وعلامة نصبه حذف النون لأنه من الأفعال الخمسة، وألف الاثنين ضمير متصل مبني في محل رفع فاعل." },
    R_present_jazm_sahih: { id: "R_present_jazm_sahih", type: "result", coverage: "present.jazm.sahih", text: "فعل مضارع مجزوم وعلامة جزمه السكون على آخره." },
    R_present_jazm_weak: { id: "R_present_jazm_weak", type: "result", coverage: "present.jazm.weak", text: "فعل مضارع مجزوم وعلامة جزمه حذف حرف العلة." },
    R_present_jazm_waw: { id: "R_present_jazm_waw", type: "result", coverage: "present.jazm.waw", text: "فعل مضارع مجزوم وعلامة جزمه حذف النون لأنه من الأفعال الخمسة، وواو الجماعة ضمير متصل مبني في محل رفع فاعل." },
    R_present_jazm_yaa: { id: "R_present_jazm_yaa", type: "result", coverage: "present.jazm.yaa", text: "فعل مضارع مجزوم وعلامة جزمه حذف النون لأنه من الأفعال الخمسة، وياء المخاطبة ضمير متصل مبني في محل رفع فاعل." },
    R_present_jazm_alif2: { id: "R_present_jazm_alif2", type: "result", coverage: "present.jazm.alif2", text: "فعل مضارع مجزوم وعلامة جزمه حذف النون لأنه من الأفعال الخمسة، وألف الاثنين ضمير متصل مبني في محل رفع فاعل." }
  }
};
