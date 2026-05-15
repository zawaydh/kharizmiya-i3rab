export type ExerciseTree = { startNodeId: string; nodes: Record<string, any> };

export const presentVerbTree: ExerciseTree = {
  startNodeId: "present_nun_niswa",
  nodes: {
    present_nun_niswa: {
      id: "present_nun_niswa",
      type: "question",
      context: "نبدأ بحالات بناء الفعل المضارع قبل الإعراب.",
      text: "هل اتصل الفعل المضارع بنون النسوة؟",
      hint: "نون النسوة تدل على جماعة المؤنث، مثل: الطالبات يكتبْنَ.",
      answers: [
        { id: "a", text: "نعم، اتصل بنون النسوة", next: "R_present_binaa_niswa", eval: { fact: "nunNiswa", equals: true } },
        { id: "b", text: "لا", next: "present_nun_tawkid", eval: { fact: "nunNiswa", equals: false } }
      ]
    },

    present_nun_tawkid: {
      id: "present_nun_tawkid",
      type: "question",
      context: "لم يتصل بنون النسوة، فنفحص نون التوكيد.",
      text: "هل اتصل الفعل المضارع بنون التوكيد الثقيلة أو الخفيفة؟",
      hint: "نون التوكيد تكون: نَّ الثقيلة أو نْ الخفيفة، مثل: ليجتهدنَّ.",
      answers: [
        { id: "a", text: "نعم، اتصل بنون التوكيد", next: "R_present_binaa_tawkid", eval: { fact: "nunTawkid", equals: true } },
        { id: "b", text: "لا", next: "present_has_tool", eval: { fact: "nunTawkid", equals: false } }
      ]
    },

    present_has_tool: {
      id: "present_has_tool",
      type: "question",
      context: "لم نجد علامة بناء، فننتقل إلى الإعراب.",
      text: "هل سبق الفعل المضارع ناصب أو جازم؟",
      hint: "إن لم يسبقه ناصب أو جازم فهو مرفوع. من النواصب: لن، أن، كي. ومن الجوازم: لم، لا الناهية، لام الأمر.",
      answers: [
        { id: "a", text: "نعم، سبقه ناصب أو جازم", next: "present_tool_type", eval: { fact: "hasTool", equals: true } },
        { id: "b", text: "لا، لم يسبقه ناصب أو جازم", next: "raf3_five", eval: { fact: "hasTool", equals: false } }
      ]
    },

    present_tool_type: {
      id: "present_tool_type",
      type: "question",
      context: "وجدنا أداة قبل المضارع، فنحدد أثرها.",
      text: "هل الأداة ناصبة أم جازمة؟",
      hint: "لن، أن، كي: أدوات نصب. لم، لا الناهية، لام الأمر: أدوات جزم.",
      answers: [
        { id: "a", text: "أداة ناصبة", next: "nasb_five", eval: { fact: "tool", equals: "nasb" } },
        { id: "b", text: "أداة جازمة", next: "jazm_five", eval: { fact: "tool", equals: "jazm" } }
      ]
    },

    raf3_five: {
      id: "raf3_five",
      type: "question",
      context: "لا توجد أداة نصب أو جزم، إذن الفعل مرفوع.",
      text: "هل هو من الأفعال الخمسة؟ (وهي الأفعال المضارعة التي اتصلت بياء المخاطبة أو ألف الاثنين أو واو الجماعة)",
      hint: "إذا كان من الأفعال الخمسة فيرفع بثبوت النون.",
      answers: [
        { id: "a", text: "نعم", next: "R_present_raf3_five", eval: { fact: "attached", anyOf: ["waw", "yaa", "alif2"] } },
        { id: "b", text: "لا", next: "raf3_ending", eval: { fact: "attached", equals: "none" } }
      ]
    },

    raf3_ending: {
      id: "raf3_ending",
      type: "question",
      context: "ليس من الأفعال الخمسة، فنفحص آخر الفعل.",
      text: "هل الفعل صحيح الآخر أم معتل الآخر؟",
      hint: "صحيح الآخر: لا ينتهي بحرف علة. معتل الآخر: ينتهي بألف أو واو أو ياء.",
      answers: [
        { id: "a", text: "صحيح الآخر", next: "R_present_raf3_sahih", eval: { fact: "ending", equals: "sahih" } },
        { id: "b", text: "معتل الآخر", next: "raf3_weak", eval: { fact: "ending", equals: "weak" } }
      ]
    },

    raf3_weak: {
      id: "raf3_weak",
      type: "question",
      context: "الفعل مرفوع ومعتل الآخر.",
      text: "ما نوع حرف العلة؟",
      hint: "مع الألف تكون الضمة مقدرة للتعذر، ومع الواو أو الياء تكون مقدرة للثقل.",
      answers: [
        { id: "a", text: "ألف", next: "R_present_raf3_alif", eval: { fact: "weakLetter", equals: "alif" } },
        { id: "b", text: "واو أو ياء", next: "R_present_raf3_waw_ya", eval: { fact: "weakLetter", equals: "waw_ya" } }
      ]
    },

    nasb_five: {
      id: "nasb_five",
      type: "question",
      context: "الأداة ناصبة، إذن الفعل منصوب.",
      text: "هل هو من الأفعال الخمسة؟ (وهي الأفعال المضارعة التي اتصلت بياء المخاطبة أو ألف الاثنين أو واو الجماعة)",
      hint: "إذا كان من الأفعال الخمسة فينصب بحذف النون.",
      answers: [
        { id: "a", text: "نعم", next: "R_present_nasb_five", eval: { fact: "attached", anyOf: ["waw", "yaa", "alif2"] } },
        { id: "b", text: "لا", next: "nasb_ending", eval: { fact: "attached", equals: "none" } }
      ]
    },

    nasb_ending: {
      id: "nasb_ending",
      type: "question",
      context: "ليس من الأفعال الخمسة، فنفحص آخر الفعل.",
      text: "هل الفعل صحيح الآخر أم معتل الآخر؟",
      hint: "صحيح الآخر ينصب بالفتحة الظاهرة، أما معتل الآخر فتحتاج العلامة إلى تدقيق.",
      answers: [
        { id: "a", text: "صحيح الآخر", next: "R_present_nasb_sahih", eval: { fact: "ending", equals: "sahih" } },
        { id: "b", text: "معتل الآخر", next: "nasb_weak", eval: { fact: "ending", equals: "weak" } }
      ]
    },

    nasb_weak: {
      id: "nasb_weak",
      type: "question",
      context: "الفعل منصوب ومعتل الآخر.",
      text: "ما نوع حرف العلة؟",
      hint: "الألف: فتحة مقدرة للتعذر. الواو أو الياء: فتحة ظاهرة.",
      answers: [
        { id: "a", text: "ألف", next: "R_present_nasb_alif", eval: { fact: "weakLetter", equals: "alif" } },
        { id: "b", text: "واو أو ياء", next: "R_present_nasb_waw_ya", eval: { fact: "weakLetter", equals: "waw_ya" } }
      ]
    },

    jazm_five: {
      id: "jazm_five",
      type: "question",
      context: "الأداة جازمة، إذن الفعل مجزوم.",
      text: "هل هو من الأفعال الخمسة؟ (وهي الأفعال المضارعة التي اتصلت بياء المخاطبة أو ألف الاثنين أو واو الجماعة)",
      hint: "إذا كان من الأفعال الخمسة فيجزم بحذف النون.",
      answers: [
        { id: "a", text: "نعم", next: "R_present_jazm_five", eval: { fact: "attached", anyOf: ["waw", "yaa", "alif2"] } },
        { id: "b", text: "لا", next: "jazm_ending", eval: { fact: "attached", equals: "none" } }
      ]
    },

    jazm_ending: {
      id: "jazm_ending",
      type: "question",
      context: "ليس من الأفعال الخمسة، فنفحص آخر الفعل.",
      text: "هل الفعل صحيح الآخر أم معتل الآخر؟",
      hint: "الصحيح يجزم بالسكون، أما معتل الآخر فعلامة جزمه حذف حرف العلة.",
      answers: [
        { id: "a", text: "صحيح الآخر", next: "R_present_jazm_sahih", eval: { fact: "ending", equals: "sahih" } },
        { id: "b", text: "معتل الآخر", next: "R_present_jazm_weak", eval: { fact: "ending", equals: "weak" } }
      ]
    },

    R_present_binaa_niswa: {
      id: "R_present_binaa_niswa",
      type: "result",
      coverage: "present.binaa.niswa",
      text: "فعل مضارع مبني على السكون لاتصاله بنون النسوة."
    },
    R_present_binaa_tawkid: {
      id: "R_present_binaa_tawkid",
      type: "result",
      coverage: "present.binaa.tawkid",
      text: "فعل مضارع مبني على الفتح لاتصاله بنون التوكيد."
    },

    R_present_raf3_five: {
      id: "R_present_raf3_five",
      type: "result",
      coverage: "present.raf3.five",
      text: "فعل مضارع مرفوع وعلامة رفعه ثبوت النون لأنه من الأفعال الخمسة."
    },
    R_present_raf3_sahih: {
      id: "R_present_raf3_sahih",
      type: "result",
      coverage: "present.raf3.sahih",
      text: "فعل مضارع مرفوع وعلامة رفعه الضمة الظاهرة على آخره."
    },
    R_present_raf3_alif: {
      id: "R_present_raf3_alif",
      type: "result",
      coverage: "present.raf3.alif",
      text: "فعل مضارع مرفوع وعلامة رفعه الضمة المقدرة على آخره منع من ظهورها التعذر."
    },
    R_present_raf3_waw_ya: {
      id: "R_present_raf3_waw_ya",
      type: "result",
      coverage: "present.raf3.waw_ya",
      text: "فعل مضارع مرفوع وعلامة رفعه الضمة المقدرة على آخره منع من ظهورها الثقل."
    },

    R_present_nasb_five: {
      id: "R_present_nasb_five",
      type: "result",
      coverage: "present.nasb.five",
      text: "فعل مضارع منصوب وعلامة نصبه حذف النون لأنه من الأفعال الخمسة."
    },
    R_present_nasb_sahih: {
      id: "R_present_nasb_sahih",
      type: "result",
      coverage: "present.nasb.sahih",
      text: "فعل مضارع منصوب وعلامة نصبه الفتحة الظاهرة على آخره."
    },
    R_present_nasb_alif: {
      id: "R_present_nasb_alif",
      type: "result",
      coverage: "present.nasb.alif",
      text: "فعل مضارع منصوب وعلامة نصبه الفتحة المقدرة على آخره منع من ظهورها التعذر."
    },
    R_present_nasb_waw_ya: {
      id: "R_present_nasb_waw_ya",
      type: "result",
      coverage: "present.nasb.waw_ya",
      text: "فعل مضارع منصوب وعلامة نصبه الفتحة الظاهرة على آخره."
    },

    R_present_jazm_five: {
      id: "R_present_jazm_five",
      type: "result",
      coverage: "present.jazm.five",
      text: "فعل مضارع مجزوم وعلامة جزمه حذف النون لأنه من الأفعال الخمسة."
    },
    R_present_jazm_sahih: {
      id: "R_present_jazm_sahih",
      type: "result",
      coverage: "present.jazm.sahih",
      text: "فعل مضارع مجزوم وعلامة جزمه السكون على آخره."
    },
    R_present_jazm_weak: {
      id: "R_present_jazm_weak",
      type: "result",
      coverage: "present.jazm.weak",
      text: "فعل مضارع مجزوم وعلامة جزمه حذف حرف العلة."
    }
  }
};
