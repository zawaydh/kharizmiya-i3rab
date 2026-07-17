export type ExerciseTree = { startNodeId: string; nodes: Record<string, any> };

export const cleanMubtadaTree: ExerciseTree = {
  "startNodeId": "mubtada_word_type",
  "nodes": {
    "mubtada_meaning_gate": {
      "id": "mubtada_meaning_gate",
      "type": "question",
      "context": "نبدأ من الكلمة المحددة نفسها: نعرف نوعها أولًا، ثم ننظر إلى دورها في المعنى، ثم نستنتج وظيفتها النحوية دون كشف الحكم منذ البداية.",
      "text": "ما الدور المعنوي للكلمة المحددة في الجملة؟",
      "hint": "اسأل نفسك: عمّن أو عمّا بدأ الكلام؟ لا ننظر إلى الكلمة التي بعدها قبل أن نفهم دور الكلمة المحددة نفسها.",
      "answers": [
        { "id": "a", "text": "هي الاسم الذي بدأت الجملة بالحديث عنه", "next": "mubtada_word_type", "correct": true },
        { "id": "b", "text": "هي الفعل الذي وقع في الجملة", "next": "mubtada_meaning_gate", "correct": false, "hint": "هذا يفتح مسار الفعل. الفاعل يُبحث عنه بعد فعل، أما هنا فنفحص الكلمة المحددة نفسها: هل وقع منها فعل أم بدأنا الحديث عنها؟ عد للسؤال وانقر على الإجابة الصحيحة لنكمل الإعراب." },
        { "id": "c", "text": "هي شيء وقع عليه الفعل", "next": "mubtada_meaning_gate", "correct": false, "hint": "المفعول به يحتاج فعلًا يقع على شيء. أما هنا فنفحص الكلمة المحددة: هل وقع عليها فعل أم بدأنا الحديث عنها؟ عد للسؤال وانقر على الإجابة الصحيحة لنكمل الإعراب." }
      ]
    },

    "mubtada_word_type": {
      "id": "mubtada_word_type",
      "type": "question",
      "context": "المطلوب إعراب الكلمة أو التركيب المحدد. وقع المحدد في أول الجملة، وقبل تحديد وظيفته النحوية أو إعرابه نحتاج أولًا إلى معرفة نوعه.",
      "text": "أيُّ الخيارات الآتية يصف نوع هذه الكلمة أو هذا التركيب؟",
      "hint": "اختبر المحدد نفسه: هل يدل على مسمّى أو شيء نشير إليه أو تركيب يؤول باسم، أم يدل على حدث مرتبط بزمن، أم هو حرف لا يظهر معناه إلا مع غيره؟ اختر نوع المحدد أولًا ثم ننتقل إلى دوره في الجملة.",
      "answers": [
        { "id": "a", "text": "اسم أو في معنى الاسم", "next": "mubtada_function_gate", "correct": true },
        { "id": "b", "text": "فعل", "next": "mubtada_word_type", "correct": false },
        { "id": "c", "text": "حرف", "next": "mubtada_word_type", "correct": false }
      ]
    },
    
    "mubtada_function_gate": {
      "id": "mubtada_function_gate",
      "type": "question",
      "context": "بعد أن عرفنا أن الكلمة اسم أو في معنى الاسم، ننظر إلى دورها في الجملة دون أن ننتقل إلى الكلمة التي بعدها.",
      "text": "أيُّ الخيارات الآتية يصف دور الكلمة المحددة في هذه الجملة؟",
      "hint": "اسأل: هل بدأنا الحديث عن هذه الكلمة أو هذا التركيب، أم جاء بعد فعل فقام به، أم وقع عليه فعل؟ اختر الوصف الذي يطابق دور المحدد في الجملة.",
      "answers": [
        { "id": "a", "text": "هي الاسم الذي بدأنا الحديث عنه", "next": "mubtada_start", "correct": true },
        { "id": "b", "text": "هي التي قامت بالفعل", "next": "mubtada_function_gate", "correct": false, "hint": "هذا مسار الفاعل. الفاعل نبحث عنه بعد فعل ونسأل: من فعل؟ أما هنا فالاسم المحدد بدأنا الحديث عنه. عد للسؤال وانقر على الإجابة الصحيحة لنكمل الإعراب." },
        { "id": "c", "text": "وقع عليها الفعل", "next": "mubtada_function_gate", "correct": false, "hint": "هذا مسار المفعول به، والمفعول به يحتاج فعلًا وقع عليه. في هذا المثال الاسم المحدد بدأ به الكلام، فهو المرشح لوظيفة المبتدأ. عد للسؤال وانقر على الإجابة الصحيحة لنكمل الإعراب." }
      ]
    },

    "mubtada_start": {
      "id": "mubtada_start",
      "type": "question",
      "context": "ثبتت الوظيفة الآن: الكلمة مبتدأ. وبما أن المبتدأ حكمه الرفع، نحدد هل الرفع ظاهر على لفظه أم هو في محل رفع.",
      "text": "أيُّ الخيارات الآتية يصف صورة المبتدأ هنا؟",
      "hint": "اسأل عن طبيعة المحدد: إن تغيّر آخره بحسب الموقع فهو اسم معرب وتُطلب علامة رفعه، وإن لزم صورة واحدة فهو اسم مبني فنقول في محل رفع، وإن كان تركيبًا مثل أن + فعل فهو مصدر مؤول يؤول باسم.",
      "answers": [
        {
          "id": "a",
          "text": "اسم معرب",
          "next": "mubtada_number",
          "eval": {
            "fact": "nounKind",
            "equals": "mu3rab"
          }
        },
        {
          "id": "b",
          "text": "اسم مبني",
          "hint": "الاسم المبني يلزم صورة واحدة ولا نقول فيه: مرفوع بالضمة، بل نقول: في محل رفع. أمثلته: هذا، أنا، الذي، من. إن كانت الكلمة اسمًا ظاهرًا متغير الآخر فليست مبنية. عد للسؤال وانقر على الإجابة الصحيحة لنكمل الإعراب.",
          "next": "mubtada_built",
          "eval": {
            "fact": "nounKind",
            "equals": "mabni"
          }
        },
        {
          "id": "c",
          "text": "مصدر مؤول",
          "hint": "المصدر المؤول ليس اسمًا واحدًا ظاهرًا، بل تركيب كامل من حرف مصدري وفعل. ننظر إلى التركيب كله لا إلى الفعل وحده: أن تتعلم ← تعلّمك، وأن تنجح ← نجاحك. إن كانت الكلمة مثل العلم أو الطالبان أو أبوك فالمسار ليس مصدرًا مؤولًا. عد للسؤال وانقر على الإجابة الصحيحة لنكمل الإعراب.",
          "next": "R_mubtada_masdar",
          "eval": {
            "fact": "nounKind",
            "equals": "masdar"
          }
        }
      ]
    },
    "mubtada_built": {
      "id": "mubtada_built",
      "type": "question",
      "context": "عرفنا أن المبتدأ هنا اسم مبني؛ لذلك لا نبحث عن ضمة أو ألف أو واو، بل نحدد نوعه ثم نعربه في محل رفع.",
      "text": "أيُّ الخيارات الآتية يصف نوع هذا الاسم المبني؟",
      "hint": "الاسم المبني يلزم صورة واحدة. ميّز نوعه من معناه في المثال: الضمير يدل على متكلم أو مخاطب أو غائب، واسم الإشارة يدل على مشار إليه، والاسم الموصول يحتاج صلة بعده، واسم الاستفهام يسأل، واسم الشرط يربط الشرط بجوابه، وكم الخبرية تدل على الكثرة.",
      "answers": [
        {
          "id": "a",
          "text": "ضمير منفصل",
          "hint": "الضمير المنفصل كلمة مستقلة تدل على متكلم أو مخاطب أو غائب، مثل: أنا، نحن، أنت، هو، هم. الضمائر أسماء مبنية، فإذا بدأت الجملة بها وشغلَت محور الحديث أُعربت في محل رفع مبتدأ.",
          "next": "R_mubtada_damir",
          "eval": {
            "fact": "mabniType",
            "equals": "damir"
          }
        },
        {
          "id": "b",
          "text": "اسم إشارة",
          "hint": "اسم الإشارة يدل على شيء نشير إليه، مثل: هذا، هذه، هؤلاء، ذلك، تلك. هذه الكلمات أسماء في النحو وليست حروفًا، لكنها أسماء مبنية فتُعرب في محل رفع إذا شغلت وظيفة المبتدأ.",
          "next": "R_mubtada_ishara",
          "eval": {
            "fact": "mabniType",
            "equals": "ishara"
          }
        },
        {
          "id": "c",
          "text": "اسم موصول",
          "hint": "الاسم الموصول يحتاج جملة بعده توضحه تسمى صلة الموصول، مثل: الذي نجح، التي اجتهدت. هو اسم مبني لا حرف، وما بعده صلة توضحه ولا يكون هو نفسه إعراب الكلمة المطلوبة.",
          "next": "R_mubtada_mawsool",
          "eval": {
            "fact": "mabniType",
            "equals": "mawsool"
          }
        },
        {
          "id": "d",
          "text": "اسم استفهام",
          "hint": "اسم الاستفهام نسأل به عن شيء، مثل: من، ما، أين، متى، كيف.",
          "next": "R_mubtada_istifham",
          "eval": {
            "fact": "mabniType",
            "equals": "istifham"
          }
        },
        {
          "id": "e",
          "text": "اسم شرط",
          "hint": "اسم الشرط يربط بين فعل الشرط وجوابه، مثل: من يجتهد ينجح، مهما تفعل تجد أثره.",
          "next": "R_mubtada_shart",
          "eval": {
            "fact": "mabniType",
            "equals": "shart"
          }
        },
        {
          "id": "f",
          "text": "كم الخبرية",
          "hint": "كم الخبرية تدل على الكثرة ولا تطلب جوابًا، مثل: كم طالبٍ نجحَ.",
          "next": "R_mubtada_kam",
          "eval": {
            "fact": "mabniType",
            "equals": "kam"
          }
        }
      ]
    },
    "mubtada_number": {
      "id": "mubtada_number",
      "type": "question",
      "context": "عرفنا أنه اسم معرب شغل وظيفة المبتدأ، والمبتدأ مرفوع؛ لذلك نحدد صورة الاسم لنعرف علامة الرفع المناسبة.",
      "text": "أيُّ الخيارات الآتية يصف صورة هذا الاسم؟",
      "hint": "انظر إلى الكلمة المحددة نفسها: هل تدل على واحد، اثنين، جماعة، أم هي من الأسماء الخمسة؟ اختر الصورة التي تنطبق على الكلمة، ثم نحدد علامة الرفع المناسبة.",
      "answers": [
        {
          "id": "a",
          "text": "مفرد",
          "next": "mubtada_ending",
          "eval": {
            "fact": "number",
            "equals": "singular"
          }
        },
        {
          "id": "b",
          "text": "مثنى",
          "next": "R_mubtada_dual",
          "eval": {
            "fact": "number",
            "equals": "dual"
          }
        },
        {
          "id": "c",
          "text": "جمع مذكر سالم",
          "next": "R_mubtada_jms",
          "eval": {
            "fact": "number",
            "equals": "jms"
          }
        },
        {
          "id": "d",
          "text": "جمع مؤنث سالم",
          "next": "R_mubtada_jfs",
          "eval": {
            "fact": "number",
            "equals": "jfs"
          }
        },
        {
          "id": "e",
          "text": "جمع تكسير",
          "next": "mubtada_ending",
          "eval": {
            "fact": "number",
            "equals": "jt"
          }
        },
        {
          "id": "f",
          "text": "من الأسماء الخمسة",
          "next": "R_mubtada_five",
          "eval": {
            "fact": "number",
            "equals": "five"
          }
        }
      ]
    },
    "mubtada_ending": {
      "id": "mubtada_ending",
      "type": "question",
      "context": "وصلنا إلى اسم يرفع غالبًا بالضمة، لكننا نتحقق هل الضمة ظاهرة أم مقدرة.",
      "text": "أيُّ الخيارات الآتية يصف حالة آخر الكلمة؟",
      "hint": "افحص آخر الاسم: المقصور آخره ألف لازمة، والمنقوص آخره ياء لازمة مكسور ما قبلها، والصحيح الآخر تظهر عليه الضمة.",
      "answers": [
        {
          "id": "a",
          "text": "صحيح الآخر",
          "next": "R_mubtada_visible",
          "eval": {
            "fact": "ending",
            "equals": "sahih"
          }
        },
        {
          "id": "b",
          "text": "معتل الآخر",
          "next": "R_mubtada_estimated",
          "eval": {
            "fact": "ending",
            "equals": "moatal"
          }
        }
      ]
    },
    "R_mubtada_visible": {
      "id": "R_mubtada_visible",
      "type": "result",
      "coverage": "mubtada.visible",
      "text": "مبتدأ مرفوع وعلامة رفعه الضمة الظاهرة على آخره."
    },
    "R_mubtada_estimated": {
      "id": "R_mubtada_estimated",
      "type": "result",
      "coverage": "mubtada.estimated",
      "text": "مبتدأ مرفوع وعلامة رفعه الضمة المقدرة على آخره للتعذر أو الثقل بحسب آخر الكلمة."
    },
    "R_mubtada_dual": {
      "id": "R_mubtada_dual",
      "type": "result",
      "coverage": "mubtada.dual",
      "text": "مبتدأ مرفوع وعلامة رفعه الألف لأنه مثنى."
    },
    "R_mubtada_jms": {
      "id": "R_mubtada_jms",
      "type": "result",
      "coverage": "mubtada.jms",
      "text": "مبتدأ مرفوع وعلامة رفعه الواو لأنه جمع مذكر سالم."
    },
    "R_mubtada_jfs": {
      "id": "R_mubtada_jfs",
      "type": "result",
      "coverage": "mubtada.jfs",
      "text": "مبتدأ مرفوع وعلامة رفعه الضمة الظاهرة على آخره لأنه جمع مؤنث سالم."
    },
    "R_mubtada_five": {
      "id": "R_mubtada_five",
      "type": "result",
      "coverage": "mubtada.five",
      "text": "مبتدأ مرفوع وعلامة رفعه الواو لأنه من الأسماء الخمسة، وقد تحققت شروط إعرابها بالحروف: أن تكون مفردة، مضافة، غير مضافة إلى ياء المتكلم، وأن تكون (ذو) بمعنى صاحب إذا وردت."
    },
    "R_mubtada_damir": {
      "id": "R_mubtada_damir",
      "type": "result",
      "coverage": "mubtada.damir",
      "text": "ضمير منفصل مبني في محل رفع مبتدأ."
    },
    "R_mubtada_ishara": {
      "id": "R_mubtada_ishara",
      "type": "result",
      "coverage": "mubtada.ishara",
      "text": "اسم إشارة مبني في محل رفع مبتدأ."
    },
    "R_mubtada_mawsool": {
      "id": "R_mubtada_mawsool",
      "type": "result",
      "coverage": "mubtada.mawsool",
      "text": "اسم موصول مبني في محل رفع مبتدأ."
    },
    "R_mubtada_istifham": {
      "id": "R_mubtada_istifham",
      "type": "result",
      "coverage": "mubtada.istifham",
      "text": "اسم استفهام مبني في محل رفع مبتدأ."
    },
    "R_mubtada_shart": {
      "id": "R_mubtada_shart",
      "type": "result",
      "coverage": "mubtada.shart",
      "text": "اسم شرط مبني في محل رفع مبتدأ."
    },
    "R_mubtada_kam": {
      "id": "R_mubtada_kam",
      "type": "result",
      "coverage": "mubtada.kam",
      "text": "اسم خبري مبني في محل رفع مبتدأ."
    },
    "R_mubtada_masdar": {
      "id": "R_mubtada_masdar",
      "type": "result",
      "coverage": "mubtada.masdar",
      "text": "مصدر مؤول في محل رفع مبتدأ."
    }
  }
};
