export type ExerciseTree = { startNodeId: string; nodes: Record<string, any> };

export const presentVerbTree: ExerciseTree = {
  startNodeId: "present_has_tool",
  nodes: {
    present_has_tool: {
      id: "present_has_tool",
      type: "question",
      text: "هل سبق الفعل المضارع بأداة؟",
      teaching_note: "لا نبدأ بسؤال: ما الحالة الإعرابية؟ بل نبحث أولًا عن الأداة؛ لأنها هي التي تقودنا إلى الرفع أو النصب أو الجزم.",
      hint: "ابحث قبل الفعل عن أدوات النصب مثل: لن، أن، كي، حتى، لام التعليل. أو أدوات الجزم مثل: لم، لا الناهية، لام الأمر. إن لم تجد أداة فالأصل الرفع.",
      answers: [
        { id: "a", text: "سبق بأداة نصب", next: "nasb_check_attached", eval: { fact: "tool", equals: "nasb" } },
        { id: "b", text: "سبق بأداة جزم", next: "jazm_check_attached", eval: { fact: "tool", equals: "jazm" } },
        { id: "c", text: "لم يسبق بأداة نصب أو جزم", next: "raf3_check_attached", eval: { fact: "tool", equals: "none" } }
      ]
    },
    raf3_check_attached: {
      id: "raf3_check_attached", type: "question", text: "هل اتصل الفعل بواو الجماعة أو ياء المخاطبة أو ألف الاثنين؟",
      teaching_note: "هذه أفعال مضارعة تتبع حكم المضارع نفسه، لكن علامتها تختلف: في الرفع ثبوت النون، وفي النصب والجزم حذف النون.",
      hint: "لاحظ النهايات: يفعلون/تفعلين/يفعلان. لا نعزلها عن المضارع؛ نغيّر العلامة فقط.",
      answers: [
        { id: "a", text: "نعم، واو الجماعة", next: "R_present_raf3_waw", eval: { fact: "attached", equals: "waw" } },
        { id: "b", text: "نعم، ياء المخاطبة", next: "R_present_raf3_yaa", eval: { fact: "attached", equals: "yaa" } },
        { id: "c", text: "نعم، ألف الاثنين", next: "R_present_raf3_alif2", eval: { fact: "attached", equals: "alif2" } },
        { id: "d", text: "لا", next: "raf3_ending", eval: { fact: "attached", equals: "none" } }
      ]
    },
    raf3_ending: {
      id: "raf3_ending", type: "question", text: "هل الفعل صحيح الآخر أم معتل الآخر؟",
      teaching_note: "بعد ثبوت الرفع نحدد آخر الفعل؛ الصحيح تظهر عليه الضمة، والمعتل تُقدّر عليه الضمة.",
      hint: "انظر لآخر الفعل المضارع نفسه: هل آخره حرف علة؟",
      answers: [
        { id: "a", text: "صحيح الآخر", next: "R_present_raf3_sahih", eval: { fact: "ending", equals: "sahih" } },
        { id: "b", text: "معتل الآخر", next: "raf3_weak_type", eval: { fact: "ending", equals: "weak" } }
      ]
    },
    raf3_weak_type: {
      id: "raf3_weak_type", type: "question", text: "ما نوع حرف العلة؟",
      teaching_note: "الألف لا تقبل الحركة فيكون التعذر، والواو والياء تثقل عليهما الضمة فيكون الثقل.",
      hint: "ألف: تعذر. واو أو ياء: ثقل.",
      answers: [
        { id: "a", text: "ألف", next: "R_present_raf3_alif", eval: { fact: "weakLetter", equals: "alif" } },
        { id: "b", text: "واو أو ياء", next: "R_present_raf3_waw_ya", eval: { fact: "weakLetter", equals: "waw_ya" } }
      ]
    },
    nasb_check_attached: {
      id: "nasb_check_attached", type: "question", text: "هل اتصل الفعل بواو الجماعة أو ياء المخاطبة أو ألف الاثنين؟",
      teaching_note: "بعد أداة النصب يكون المضارع منصوبًا؛ فإن اتصل بواو الجماعة أو ياء المخاطبة أو ألف الاثنين كانت العلامة حذف النون.",
      hint: "لن تكتبوا، لن تكتبي، لن تكتبا: النون محذوفة في النصب.",
      answers: [
        { id: "a", text: "نعم، واو الجماعة", next: "R_present_nasb_waw", eval: { fact: "attached", equals: "waw" } },
        { id: "b", text: "نعم، ياء المخاطبة", next: "R_present_nasb_yaa", eval: { fact: "attached", equals: "yaa" } },
        { id: "c", text: "نعم، ألف الاثنين", next: "R_present_nasb_alif2", eval: { fact: "attached", equals: "alif2" } },
        { id: "d", text: "لا", next: "nasb_ending", eval: { fact: "attached", equals: "none" } }
      ]
    },
    nasb_ending: {
      id: "nasb_ending", type: "question", text: "هل الفعل صحيح الآخر أم معتل الآخر؟",
      teaching_note: "بعد أداة النصب نبحث عن العلامة: الصحيح تظهر عليه الفتحة، والمعتل بالألف تُقدر عليه الفتحة، أما الواو والياء فتظهر الفتحة.",
      hint: "لن يسعى: فتحة مقدرة للتعذر. لن يدعوَ/لن يرميَ: فتحة ظاهرة.",
      answers: [
        { id: "a", text: "صحيح الآخر", next: "R_present_nasb_sahih", eval: { fact: "ending", equals: "sahih" } },
        { id: "b", text: "معتل الآخر", next: "nasb_weak_type", eval: { fact: "ending", equals: "weak" } }
      ]
    },
    nasb_weak_type: {
      id: "nasb_weak_type", type: "question", text: "ما نوع حرف العلة؟",
      teaching_note: "في النصب: الألف تمنع ظهور الفتحة للتعذر، أما الواو والياء فتظهر عليهما الفتحة.",
      hint: "ألف: فتحة مقدرة للتعذر. واو أو ياء: فتحة ظاهرة.",
      answers: [
        { id: "a", text: "ألف", next: "R_present_nasb_alif", eval: { fact: "weakLetter", equals: "alif" } },
        { id: "b", text: "واو أو ياء", next: "R_present_nasb_waw_ya", eval: { fact: "weakLetter", equals: "waw_ya" } }
      ]
    },
    jazm_check_attached: {
      id: "jazm_check_attached", type: "question", text: "هل اتصل الفعل بواو الجماعة أو ياء المخاطبة أو ألف الاثنين؟",
      teaching_note: "بعد أداة الجزم يكون المضارع مجزومًا؛ فإن اتصل بواو الجماعة أو ياء المخاطبة أو ألف الاثنين كانت العلامة حذف النون.",
      hint: "لم تكتبوا، لا تكتبي، لتكتبا: النون محذوفة في الجزم.",
      answers: [
        { id: "a", text: "نعم، واو الجماعة", next: "R_present_jazm_waw", eval: { fact: "attached", equals: "waw" } },
        { id: "b", text: "نعم، ياء المخاطبة", next: "R_present_jazm_yaa", eval: { fact: "attached", equals: "yaa" } },
        { id: "c", text: "نعم، ألف الاثنين", next: "R_present_jazm_alif2", eval: { fact: "attached", equals: "alif2" } },
        { id: "d", text: "لا", next: "jazm_ending", eval: { fact: "attached", equals: "none" } }
      ]
    },
    jazm_ending: {
      id: "jazm_ending", type: "question", text: "هل الفعل صحيح الآخر أم معتل الآخر؟",
      teaching_note: "في الجزم: الصحيح يجزم بالسكون، والمعتل الآخر يجزم بحذف حرف العلة.",
      hint: "لم يكتبْ: سكون. لم يرمِ/لم يدعُ/لم يسعَ: حذف حرف العلة.",
      answers: [
        { id: "a", text: "صحيح الآخر", next: "R_present_jazm_sahih", eval: { fact: "ending", equals: "sahih" } },
        { id: "b", text: "معتل الآخر", next: "R_present_jazm_weak", eval: { fact: "ending", equals: "weak" } }
      ]
    },
    R_present_raf3_waw: { id: "R_present_raf3_waw", type: "result", coverage: "present.raf3.waw", text: "فعل مضارع مرفوع وعلامة رفعه ثبوت النون لأنه من الأفعال الخمسة، وواو الجماعة ضمير متصل مبني في محل رفع فاعل" },
    R_present_raf3_yaa: { id: "R_present_raf3_yaa", type: "result", coverage: "present.raf3.yaa", text: "فعل مضارع مرفوع وعلامة رفعه ثبوت النون لأنه من الأفعال الخمسة، وياء المخاطبة ضمير متصل مبني في محل رفع فاعل" },
    R_present_raf3_alif2: { id: "R_present_raf3_alif2", type: "result", coverage: "present.raf3.alif2", text: "فعل مضارع مرفوع وعلامة رفعه ثبوت النون لأنه من الأفعال الخمسة، وألف الاثنين ضمير متصل مبني في محل رفع فاعل" },
    R_present_raf3_sahih: { id: "R_present_raf3_sahih", type: "result", coverage: "present.raf3.sahih", text: "فعل مضارع مرفوع وعلامة رفعه الضمة الظاهرة على آخره" },
    R_present_raf3_alif: { id: "R_present_raf3_alif", type: "result", coverage: "present.raf3.alif", text: "فعل مضارع مرفوع وعلامة رفعه الضمة المقدرة على آخره منع من ظهورها التعذر" },
    R_present_raf3_waw_ya: { id: "R_present_raf3_waw_ya", type: "result", coverage: "present.raf3.waw_ya", text: "فعل مضارع مرفوع وعلامة رفعه الضمة المقدرة على آخره منع من ظهورها الثقل" },
    R_present_nasb_waw: { id: "R_present_nasb_waw", type: "result", coverage: "present.nasb.waw", text: "فعل مضارع منصوب وعلامة نصبه حذف النون من آخره لأنه من الأفعال الخمسة، وواو الجماعة ضمير متصل مبني في محل رفع فاعل" },
    R_present_nasb_yaa: { id: "R_present_nasb_yaa", type: "result", coverage: "present.nasb.yaa", text: "فعل مضارع منصوب وعلامة نصبه حذف النون من آخره لأنه من الأفعال الخمسة، وياء المخاطبة ضمير متصل مبني في محل رفع فاعل" },
    R_present_nasb_alif2: { id: "R_present_nasb_alif2", type: "result", coverage: "present.nasb.alif2", text: "فعل مضارع منصوب وعلامة نصبه حذف النون من آخره لأنه من الأفعال الخمسة، وألف الاثنين ضمير متصل مبني في محل رفع فاعل" },
    R_present_nasb_sahih: { id: "R_present_nasb_sahih", type: "result", coverage: "present.nasb.sahih", text: "فعل مضارع منصوب وعلامة نصبه الفتحة الظاهرة على آخره" },
    R_present_nasb_alif: { id: "R_present_nasb_alif", type: "result", coverage: "present.nasb.alif", text: "فعل مضارع منصوب وعلامة نصبه الفتحة المقدرة على آخره منع من ظهورها التعذر" },
    R_present_nasb_waw_ya: { id: "R_present_nasb_waw_ya", type: "result", coverage: "present.nasb.waw_ya", text: "فعل مضارع منصوب وعلامة نصبه الفتحة الظاهرة على آخره" },
    R_present_jazm_waw: { id: "R_present_jazm_waw", type: "result", coverage: "present.jazm.waw", text: "فعل مضارع مجزوم وعلامة جزمه حذف النون من آخره لأنه من الأفعال الخمسة، وواو الجماعة ضمير متصل مبني في محل رفع فاعل" },
    R_present_jazm_yaa: { id: "R_present_jazm_yaa", type: "result", coverage: "present.jazm.yaa", text: "فعل مضارع مجزوم وعلامة جزمه حذف النون من آخره لأنه من الأفعال الخمسة، وياء المخاطبة ضمير متصل مبني في محل رفع فاعل" },
    R_present_jazm_alif2: { id: "R_present_jazm_alif2", type: "result", coverage: "present.jazm.alif2", text: "فعل مضارع مجزوم وعلامة جزمه حذف النون من آخره لأنه من الأفعال الخمسة، وألف الاثنين ضمير متصل مبني في محل رفع فاعل" },
    R_present_jazm_sahih: { id: "R_present_jazm_sahih", type: "result", coverage: "present.jazm.sahih", text: "فعل مضارع مجزوم وعلامة جزمه السكون" },
    R_present_jazm_weak: { id: "R_present_jazm_weak", type: "result", coverage: "present.jazm.weak", text: "فعل مضارع مجزوم وعلامة جزمه حذف حرف العلة" }
  }
};
