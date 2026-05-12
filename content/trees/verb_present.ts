export type ExerciseTree = { startNodeId: string; nodes: Record<string, any> };

export const presentVerbTree: ExerciseTree = {
  "startNodeId": "present_step_1",
  "nodes": {
    "present_step_1": {
      "id": "present_step_1",
      "type": "question",
      "context": "عرفنا أن الكلمة فعل.",
      "text": "ما الخطوة التالية؟",
      "hint": "بعد الفعل نحدد الزمن.",
      "answers": [
        {
          "id": "a",
          "text": "تحديد زمن الفعل",
          "next": "present_tense",
          "correct": true
        },
        {
          "id": "b",
          "text": "تحديد العلامة مباشرة",
          "next": "present_step_1",
          "correct": false,
          "hint": "لا نحدد العلامة قبل الزمن والأداة."
        },
        {
          "id": "c",
          "text": "تحديد الخبر",
          "next": "present_step_1",
          "correct": false,
          "hint": "الخبر ليس خطوة فعلية."
        }
      ]
    },
    "present_tense": {
      "id": "present_tense",
      "type": "question",
      "context": "انتقلنا إلى الزمن.",
      "text": "ما زمن الفعل؟",
      "hint": "المضارع يدل على الحاضر أو المستقبل.",
      "answers": [
        {
          "id": "a",
          "text": "مضارع",
          "next": "present_tool",
          "correct": true
        },
        {
          "id": "b",
          "text": "ماضٍ",
          "next": "present_tense",
          "correct": false,
          "hint": "الماضي حدث وانتهى."
        },
        {
          "id": "c",
          "text": "أمر",
          "next": "present_tense",
          "correct": false,
          "hint": "الأمر طلب."
        }
      ]
    },
    "present_tool": {
      "id": "present_tool",
      "type": "question",
      "context": "عرفنا أنه فعل مضارع.",
      "text": "ما القرار التالي؟",
      "hint": "قبل الحالة نفحص أداة نصب أو أداة جزم.",
      "answers": [
        {
          "id": "a",
          "text": "فحص الأداة السابقة",
          "next": "present_has_tool",
          "correct": true
        },
        {
          "id": "b",
          "text": "فحص نوع الخبر",
          "next": "present_tool",
          "correct": false,
          "hint": "الخبر لا يحدد حالة المضارع."
        },
        {
          "id": "c",
          "text": "الرفع دائمًا",
          "next": "present_tool",
          "correct": false,
          "hint": "قد ينصب أو يجزم إذا سبق بأداة."
        }
      ]
    },
    "present_has_tool": {
      "id": "present_has_tool",
      "type": "question",
      "context": "نفحص ما قبل الفعل المضارع.",
      "text": "هل سبق بأداة؟",
      "hint": "ابحث عن أداة نصب أو أداة جزم.",
      "answers": [
        {
          "id": "a",
          "text": "سبق بأداة نصب",
          "next": "nasb_attached",
          "eval": {
            "fact": "tool",
            "equals": "nasb"
          }
        },
        {
          "id": "b",
          "text": "سبق بأداة جزم",
          "next": "jazm_attached",
          "eval": {
            "fact": "tool",
            "equals": "jazm"
          }
        },
        {
          "id": "c",
          "text": "لم يسبق بأداة نصب أو جزم",
          "next": "raf3_attached",
          "eval": {
            "fact": "tool",
            "equals": "none"
          }
        }
      ]
    },
    "raf3_attached": {
      "id": "raf3_attached",
      "type": "question",
      "context": "عرفنا أن المضارع مرفوع.",
      "text": "هل اتصل بواو الجماعة أو ألف الاثنين أو ياء المخاطبة؟",
      "hint": "نفحص الضمير المتصل أولًا، ثم نستنتج هل هو من الأفعال الخمسة.",
      "answers": [
        {
          "id": "a",
          "text": "واو الجماعة",
          "next": "R_present_raf3_waw",
          "eval": {
            "fact": "attached",
            "equals": "waw"
          }
        },
        {
          "id": "b",
          "text": "ياء المخاطبة",
          "next": "R_present_raf3_yaa",
          "eval": {
            "fact": "attached",
            "equals": "yaa"
          }
        },
        {
          "id": "c",
          "text": "ألف الاثنين",
          "next": "R_present_raf3_alif2",
          "eval": {
            "fact": "attached",
            "equals": "alif2"
          }
        },
        {
          "id": "d",
          "text": "لا",
          "next": "raf3_ending",
          "eval": {
            "fact": "attached",
            "equals": "none"
          }
        }
      ]
    },
    "raf3_ending": {
      "id": "raf3_ending",
      "type": "question",
      "context": "لم يتصل بواو الجماعة أو ألف الاثنين أو ياء المخاطبة.",
      "text": "ما حالة آخر الفعل؟",
      "hint": "حروف العلة: الألف والواو والياء.",
      "answers": [
        {
          "id": "a",
          "text": "صحيح الآخر",
          "next": "R_present_raf3_sahih",
          "eval": {
            "fact": "ending",
            "equals": "sahih"
          }
        },
        {
          "id": "b",
          "text": "معتل الآخر",
          "next": "raf3_weak",
          "eval": {
            "fact": "ending",
            "equals": "weak"
          }
        }
      ]
    },
    "raf3_weak": {
      "id": "raf3_weak",
      "type": "question",
      "context": "آخر الفعل حرف علة.",
      "text": "ما نوع حرف العلة؟",
      "hint": "الألف تعذر، والواو أو الياء ثقل.",
      "answers": [
        {
          "id": "a",
          "text": "ألف",
          "next": "R_present_raf3_alif",
          "eval": {
            "fact": "weakLetter",
            "equals": "alif"
          }
        },
        {
          "id": "b",
          "text": "واو أو ياء",
          "next": "R_present_raf3_waw_ya",
          "eval": {
            "fact": "weakLetter",
            "equals": "waw_ya"
          }
        }
      ]
    },
    "nasb_attached": {
      "id": "nasb_attached",
      "type": "question",
      "context": "عرفنا أن المضارع منصوب.",
      "text": "هل اتصل بواو الجماعة أو ألف الاثنين أو ياء المخاطبة؟",
      "hint": "إذا اتصل المضارع بهذه الضمائر فهو من الأفعال الخمسة، وعلامة نصبه حذف النون.",
      "answers": [
        {
          "id": "a",
          "text": "واو الجماعة",
          "next": "R_present_nasb_waw",
          "eval": {
            "fact": "attached",
            "equals": "waw"
          }
        },
        {
          "id": "b",
          "text": "ياء المخاطبة",
          "next": "R_present_nasb_yaa",
          "eval": {
            "fact": "attached",
            "equals": "yaa"
          }
        },
        {
          "id": "c",
          "text": "ألف الاثنين",
          "next": "R_present_nasb_alif2",
          "eval": {
            "fact": "attached",
            "equals": "alif2"
          }
        },
        {
          "id": "d",
          "text": "لا",
          "next": "nasb_ending",
          "eval": {
            "fact": "attached",
            "equals": "none"
          }
        }
      ]
    },
    "nasb_ending": {
      "id": "nasb_ending",
      "type": "question",
      "context": "لم يتصل بواو الجماعة أو ألف الاثنين أو ياء المخاطبة.",
      "text": "ما حالة آخر الفعل المنصوب؟",
      "hint": "الصحيح تظهر عليه الفتحة.",
      "answers": [
        {
          "id": "a",
          "text": "صحيح الآخر",
          "next": "R_present_nasb_sahih",
          "eval": {
            "fact": "ending",
            "equals": "sahih"
          }
        },
        {
          "id": "b",
          "text": "معتل الآخر",
          "next": "nasb_weak",
          "eval": {
            "fact": "ending",
            "equals": "weak"
          }
        }
      ]
    },
    "nasb_weak": {
      "id": "nasb_weak",
      "type": "question",
      "context": "آخره حرف علة في النصب.",
      "text": "ما نوع حرف العلة؟",
      "hint": "الألف فتحة مقدرة، الواو/الياء فتحة ظاهرة.",
      "answers": [
        {
          "id": "a",
          "text": "ألف",
          "next": "R_present_nasb_alif",
          "eval": {
            "fact": "weakLetter",
            "equals": "alif"
          }
        },
        {
          "id": "b",
          "text": "واو أو ياء",
          "next": "R_present_nasb_waw_ya",
          "eval": {
            "fact": "weakLetter",
            "equals": "waw_ya"
          }
        }
      ]
    },
    "jazm_attached": {
      "id": "jazm_attached",
      "type": "question",
      "context": "عرفنا أن المضارع مجزوم.",
      "text": "هل اتصل بواو الجماعة أو ألف الاثنين أو ياء المخاطبة؟",
      "hint": "إذا اتصل المضارع بهذه الضمائر فهو من الأفعال الخمسة، وعلامة جزمه حذف النون.",
      "answers": [
        {
          "id": "a",
          "text": "واو الجماعة",
          "next": "R_present_jazm_waw",
          "eval": {
            "fact": "attached",
            "equals": "waw"
          }
        },
        {
          "id": "b",
          "text": "ياء المخاطبة",
          "next": "R_present_jazm_yaa",
          "eval": {
            "fact": "attached",
            "equals": "yaa"
          }
        },
        {
          "id": "c",
          "text": "ألف الاثنين",
          "next": "R_present_jazm_alif2",
          "eval": {
            "fact": "attached",
            "equals": "alif2"
          }
        },
        {
          "id": "d",
          "text": "لا",
          "next": "jazm_ending",
          "eval": {
            "fact": "attached",
            "equals": "none"
          }
        }
      ]
    },
    "jazm_ending": {
      "id": "jazm_ending",
      "type": "question",
      "context": "لم يتصل بواو الجماعة أو ألف الاثنين أو ياء المخاطبة.",
      "text": "ما حالة آخر الفعل المجزوم؟",
      "hint": "الصحيح يجزم بالسكون، والمعتل بحذف حرف العلة.",
      "answers": [
        {
          "id": "a",
          "text": "صحيح الآخر",
          "next": "R_present_jazm_sahih",
          "eval": {
            "fact": "ending",
            "equals": "sahih"
          }
        },
        {
          "id": "b",
          "text": "معتل الآخر",
          "next": "R_present_jazm_weak",
          "eval": {
            "fact": "ending",
            "equals": "weak"
          }
        }
      ]
    },
    "R_present_raf3_waw": {
      "id": "R_present_raf3_waw",
      "type": "result",
      "coverage": "present.raf3.waw",
      "text": "فعل مضارع مرفوع وعلامة رفعه ثبوت النون لأنه من الأفعال الخمسة، وواو الجماعة ضمير متصل مبني في محل رفع فاعل."
    },
    "R_present_raf3_yaa": {
      "id": "R_present_raf3_yaa",
      "type": "result",
      "coverage": "present.raf3.yaa",
      "text": "فعل مضارع مرفوع وعلامة رفعه ثبوت النون لأنه من الأفعال الخمسة، وياء المخاطبة ضمير متصل مبني في محل رفع فاعل."
    },
    "R_present_raf3_alif2": {
      "id": "R_present_raf3_alif2",
      "type": "result",
      "coverage": "present.raf3.alif2",
      "text": "فعل مضارع مرفوع وعلامة رفعه ثبوت النون لأنه من الأفعال الخمسة، وألف الاثنين ضمير متصل مبني في محل رفع فاعل."
    },
    "R_present_raf3_sahih": {
      "id": "R_present_raf3_sahih",
      "type": "result",
      "coverage": "present.raf3.sahih",
      "text": "فعل مضارع مرفوع وعلامة رفعه الضمة الظاهرة على آخره."
    },
    "R_present_raf3_alif": {
      "id": "R_present_raf3_alif",
      "type": "result",
      "coverage": "present.raf3.alif",
      "text": "فعل مضارع مرفوع وعلامة رفعه الضمة المقدرة على آخره منع من ظهورها التعذر."
    },
    "R_present_raf3_waw_ya": {
      "id": "R_present_raf3_waw_ya",
      "type": "result",
      "coverage": "present.raf3.waw_ya",
      "text": "فعل مضارع مرفوع وعلامة رفعه الضمة المقدرة على آخره منع من ظهورها الثقل."
    },
    "R_present_nasb_waw": {
      "id": "R_present_nasb_waw",
      "type": "result",
      "coverage": "present.nasb.waw",
      "text": "فعل مضارع منصوب وعلامة نصبه حذف النون من آخره لأنه من الأفعال الخمسة، وواو الجماعة ضمير متصل مبني في محل رفع فاعل."
    },
    "R_present_nasb_yaa": {
      "id": "R_present_nasb_yaa",
      "type": "result",
      "coverage": "present.nasb.yaa",
      "text": "فعل مضارع منصوب وعلامة نصبه حذف النون من آخره لأنه من الأفعال الخمسة، وياء المخاطبة ضمير متصل مبني في محل رفع فاعل."
    },
    "R_present_nasb_alif2": {
      "id": "R_present_nasb_alif2",
      "type": "result",
      "coverage": "present.nasb.alif2",
      "text": "فعل مضارع منصوب وعلامة نصبه حذف النون من آخره لأنه من الأفعال الخمسة، وألف الاثنين ضمير متصل مبني في محل رفع فاعل."
    },
    "R_present_nasb_sahih": {
      "id": "R_present_nasb_sahih",
      "type": "result",
      "coverage": "present.nasb.sahih",
      "text": "فعل مضارع منصوب وعلامة نصبه الفتحة الظاهرة على آخره."
    },
    "R_present_nasb_alif": {
      "id": "R_present_nasb_alif",
      "type": "result",
      "coverage": "present.nasb.alif",
      "text": "فعل مضارع منصوب وعلامة نصبه الفتحة المقدرة على آخره منع من ظهورها التعذر."
    },
    "R_present_nasb_waw_ya": {
      "id": "R_present_nasb_waw_ya",
      "type": "result",
      "coverage": "present.nasb.waw_ya",
      "text": "فعل مضارع منصوب وعلامة نصبه الفتحة الظاهرة على آخره."
    },
    "R_present_jazm_waw": {
      "id": "R_present_jazm_waw",
      "type": "result",
      "coverage": "present.jazm.waw",
      "text": "فعل مضارع مجزوم وعلامة جزمه حذف النون من آخره لأنه من الأفعال الخمسة، وواو الجماعة ضمير متصل مبني في محل رفع فاعل."
    },
    "R_present_jazm_yaa": {
      "id": "R_present_jazm_yaa",
      "type": "result",
      "coverage": "present.jazm.yaa",
      "text": "فعل مضارع مجزوم وعلامة جزمه حذف النون من آخره لأنه من الأفعال الخمسة، وياء المخاطبة ضمير متصل مبني في محل رفع فاعل."
    },
    "R_present_jazm_alif2": {
      "id": "R_present_jazm_alif2",
      "type": "result",
      "coverage": "present.jazm.alif2",
      "text": "فعل مضارع مجزوم وعلامة جزمه حذف النون من آخره لأنه من الأفعال الخمسة، وألف الاثنين ضمير متصل مبني في محل رفع فاعل."
    },
    "R_present_jazm_sahih": {
      "id": "R_present_jazm_sahih",
      "type": "result",
      "coverage": "present.jazm.sahih",
      "text": "فعل مضارع مجزوم وعلامة جزمه السكون على آخره."
    },
    "R_present_jazm_weak": {
      "id": "R_present_jazm_weak",
      "type": "result",
      "coverage": "present.jazm.weak",
      "text": "فعل مضارع مجزوم وعلامة جزمه حذف حرف العلة."
    }
  }
};
