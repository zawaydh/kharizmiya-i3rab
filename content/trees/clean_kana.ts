export type ExerciseTree = { startNodeId: string; nodes: Record<string, any> };

export const cleanKanaTree: ExerciseTree = {
  "startNodeId": "kana_target",
  "nodes": {
    "kana_target": {
      "id": "kana_target",
      "type": "question",
      "context": "في كان وأخواتها لا نبدأ باسم كان أو خبر كان مباشرة. نبدأ بالسؤال الذي يكشف العلاقة أو أوضح مدخل في المثال، ثم نصل إلى الوظيفة، ثم أثر الفعل الناسخ.",
      "text": "ما المدخل الصحيح لإعراب المحدد؟ اختر الإجابة الصحيحة مما يلي:",
      "hint": "لا تبحث عن تعريف محفوظ؛ ابدأ من المثال نفسه: صاحب معنى الناسخ، أو ما أتم المعنى، أو ضمير مستتر يفهم من السياق." ,
      "answers": [
        {
          "id": "a",
          "text": "هو الذي كان/أصبح/صار في معنى الجملة",
          "next": "kana_ism_start",
          "eval": { "fact": "targetRole", "equals": "ism" }
        },
        {
          "id": "b",
          "text": "هو الجزء الذي أتم المعنى بعد ذلك الاسم",
          "next": "kana_khabar_entry",
          "eval": { "fact": "targetRole", "equals": "khabar" }
        },
        {
          "id": "c",
          "text": "اسم الفعل الناسخ غير ظاهر، ونفهمه من السياق",
          "next": "kana_hidden_ism_semantic",
          "eval": { "fact": "targetRole", "equals": "hidden_ism" },
          "hint": "ابدأ بصاحب المعنى أولاً: من الذي ما زال يعمل؟ ستجد أنه المزارع. لكن في الإعراب اسم ما زال لا يظهر بعد الفعل، بل نقدّره ضميرًا مستترًا يعود على المزارع."
        },
        {
          "id": "d",
          "text": "هو فاعل لما قبله",
          "next": "kana_target",
          "correct": false,
          "hint": "الفاعل يرتبط بفعل يدل على حدث قام به صاحبه. أما كان وأخواتها فهي أفعال ناسخة؛ فانظر في هذا المثال: هل المحدد اسم الناسخ، أم الجزء الذي أتم المعنى بعده، أم أن اسم الناسخ ضمير مستتر؟"
        },
        {
          "id": "e",
          "text": "هو صفة تابعة لما قبلها",
          "next": "kana_target",
          "correct": false,
          "hint": "الصفة تتبع الموصوف في التعريف والتنكير والتذكير والتأنيث والعدد والإعراب. في باب كان وأخواتها نبحث عن أثر فعل ناسخ: اسم هو الذي كان أو أصبح، وخبر أتم المعنى بعده."
        }
      ]
    },


    "kana_hidden_ism_semantic": {
      "id": "kana_hidden_ism_semantic",
      "type": "question",
      "context": "نبدأ من المعنى قبل المصطلح: نبحث أولًا عمّن عاد إليه معنى الفعل الناسخ في الجملة.",
      "text": "من صاحب المعنى في الجملة؟ اختر الإجابة الصحيحة مما يلي:",
      "hint": "اسأل من الذي ما زال أو أصبح أو ظل؟ ستجد الاسم المتقدم في الجملة، ثم ننتقل بعد ذلك إلى ما الذي يشغل موقع اسم الناسخ في الإعراب.",
      "answers": [
        { "id": "a", "text": "الاسم الظاهر المتقدم في الجملة", "next": "kana_hidden_ism_site", "correct": true },
        { "id": "b", "text": "الكلمة التي أتمت المعنى", "next": "kana_hidden_ism_semantic", "correct": false, "hint": "الكلمة التي أتمت المعنى تكون خبرًا، أما الآن فنبحث عمّن عاد إليه معنى الفعل الناسخ." }
      ]
    },
    "kana_hidden_ism_site": {
      "id": "kana_hidden_ism_site",
      "type": "question",
      "context": "عرفنا صاحب المعنى، لكننا نريد الآن الموقع الإعرابي بعد الفعل الناسخ نفسه.",
      "text": "هل ظهر بعد الفعل الناسخ اسم صريح، أم نفهم الاسم من السياق؟",
      "hint": "انظر بعد الفعل الناسخ مباشرة: إن لم يظهر اسم صريح بعده فاسم الناسخ يكون ضميرًا مستترًا يعود على الاسم المتقدم.",
      "answers": [
        { "id": "a", "text": "ظهر اسم صريح بعده", "next": "kana_hidden_ism_site", "correct": false, "hint": "راجع ما بعد الفعل الناسخ في المثال: هل ترى اسمًا ظاهرًا بعده؟" },
        { "id": "b", "text": "نفهمه من السياق", "next": "kana_hidden_ism_estimate", "correct": true }
      ]
    },
    "kana_hidden_ism_estimate": {
      "id": "kana_hidden_ism_estimate",
      "type": "question",
      "context": "بما أن اسم الناسخ غير ظاهر بعد الفعل، نقدره بضمير يعود على صاحب المعنى.",
      "text": "ما تقدير الضمير المستتر هنا؟ اختر الإجابة الصحيحة مما يلي:",
      "hint": "إذا كان الاسم المتقدم مذكرًا فالغالب أن تقديره (هو)، وإذا كان مؤنثًا فتقديره (هي).",
      "answers": [
        { "id": "a", "text": "هو", "next": "R_kana_ism_hidden_damir", "eval": { "fact": "hiddenPronoun", "equals": "هو" }, "hint": "اختر (هو) إذا كان الضمير يعود على اسم مذكر مثل المزارع أو مهند." },
        { "id": "b", "text": "هي", "next": "R_kana_ism_hidden_damir", "eval": { "fact": "hiddenPronoun", "equals": "هي" }, "hint": "اختر (هي) إذا كان الضمير يعود على اسم مؤنث مثل أسماء أو أختي." }
      ]
    },

    "kana_ism_start": {
      "id": "kana_ism_start",
      "type": "question",
      "context": "بما أننا عرفنا أن المحدد هو الاسم الذي كان/أصبح/صار في معنى الجملة، نحدد طبيعته قبل الإعراب النهائي.",
      "text": "ما طبيعة الاسم الذي وصلنا إليه؟ اختر الإجابة الصحيحة مما يلي:",
      "hint": "الاسم المعرب يتغير آخره بحسب الموقع، والاسم المبني يلزم صورة واحدة مثل الضمائر وأسماء الإشارة والموصولات. وانتبه: المصدر المؤول تركيب من حرف مصدري وفعل مثل: أن تنجح = نجاحك، وأن تتجاهل الناس = تجاهل الناس.",
      "answers": [
        { "id": "a", "text": "اسم معرب", "next": "kana_ism_number", "eval": { "fact": "nounKind", "equals": "mu3rab" } },
        { "id": "b", "text": "اسم مبني", "next": "kana_ism_built", "eval": { "fact": "nounKind", "equals": "mabni" } },
        { "id": "c", "text": "مصدر مؤول", "next": "R_kana_ism_masdar", "eval": { "fact": "nounKind", "equals": "masdar" }, "hint": "المصدر المؤول تركيب من حرف مصدري وفعل، ويحل محل اسم: أن تتجاهل = تجاهلك." }
      ]
    },
    "kana_ism_built": {
      "id": "kana_ism_built",
      "type": "question",
      "context": "عرفنا أن الاسم مبني، فنحدد نوعه من الكلمة نفسها قبل أن نذكر محله الإعرابي.",
      "text": "ما نوع هذا الاسم المبني؟",
      "hint": "انظر إلى الكلمة في المثال: هل هي ضمير يدل على متكلم أو مخاطب أو غائب؟ هل هي اسم إشارة؟ هل هي اسم موصول يحتاج صلة بعده؟",
      "answers": [
        { "id": "a", "text": "ضمير", "next": "R_kana_ism_damir", "eval": { "fact": "mabniType", "equals": "damir" }, "hint": "الضمير يدل على متكلم أو مخاطب أو غائب. إذا سبق الفعل الناسخ اسم ظاهر وعاد عليه ضمير متصل أو مستتر، نبدأ بصاحب المعنى ثم نحدد الضمير الذي شغل موقع اسم الناسخ في الإعراب." },
        { "id": "b", "text": "اسم إشارة", "next": "R_kana_ism_ishara", "eval": { "fact": "mabniType", "equals": "ishara" }, "hint": "اسم الإشارة يدل على شيء نشير إليه، مثل: هذا، هذه، هؤلاء، ذلك، تلك." },
        { "id": "c", "text": "اسم موصول", "next": "R_kana_ism_mawsool", "eval": { "fact": "mabniType", "equals": "mawsool" }, "hint": "الاسم الموصول مثل: الذي، التي، الذين، ويحتاج جملة بعده تسمى صلة الموصول." },
        { "id": "d", "text": "اسم استفهام", "next": "R_kana_ism_istifham", "eval": { "fact": "mabniType", "equals": "istifham" }, "hint": "اسم الاستفهام نسأل به مثل: من، ما، أين، متى. لا تختاره إلا إذا كانت الكلمة أداة سؤال." },
        { "id": "e", "text": "اسم شرط", "next": "R_kana_ism_shart", "eval": { "fact": "mabniType", "equals": "shart" }, "hint": "اسم الشرط يربط بين فعل الشرط وجوابه، مثل: من يجتهد ينجح." },
        { "id": "f", "text": "كم الخبرية", "next": "R_kana_ism_kam", "eval": { "fact": "mabniType", "equals": "kam" }, "hint": "كم الخبرية تدل على الكثرة ولا تطلب جوابًا، مثل: كم طالبٍ نجح." }
      ]
    },
    "kana_ism_number": {
      "id": "kana_ism_number",
      "type": "question",
      "context": "عرفنا أن الاسم معرب، فنفحص صورته قبل العلامة.",
      "text": "ما صورة هذا الاسم؟ اختر الإجابة الصحيحة مما يلي:",
      "hint": "افحص صورة الاسم: هل هو مفرد عادي، أم مثنى، أم جمع، أم من الأسماء الخمسة؟ انتبه: بعض الكلمات مثل (أبوك/أخوك/حموك/ذو) تدل على واحد، لكنها تُصنَّف هنا ضمن الأسماء الخمسة إذا كانت مضافة إلى غير ياء المتكلم؛ لأن علامتها بالحروف لا بالضمة.",
      "answers": [
        { "id": "a", "text": "مفرد", "next": "kana_ism_ending", "eval": { "fact": "number", "equals": "singular" }, "hint": "المفرد يدل على واحد لا على مثنى ولا جمع. افحص الكلمة المطلوبة نفسها: هل تدل على واحد، أم على اثنين، أم على جمع؟" },
        { "id": "b", "text": "مثنى", "next": "R_kana_ism_dual", "eval": { "fact": "number", "equals": "dual" }, "hint": "المثنى يدل على اثنين أو اثنتين، مثل: الطالبان، المعلمين، الوالدين." },
        { "id": "c", "text": "جمع مذكر سالم", "next": "R_kana_ism_jms", "eval": { "fact": "number", "equals": "jms" }, "hint": "جمع المذكر السالم يدل على أكثر من اثنين من الذكور وينتهي غالبًا بـ(ون) أو (ين)، مثل: المعلمون، المخلصين." },
        { "id": "d", "text": "جمع مؤنث سالم", "next": "R_kana_ism_jfs", "eval": { "fact": "number", "equals": "jfs" }, "hint": "جمع المؤنث السالم ينتهي غالبًا بألف وتاء، مثل: الطالبات، المجتهدات." },
        { "id": "e", "text": "جمع تكسير", "next": "kana_ism_ending", "eval": { "fact": "number", "equals": "jt" }, "hint": "جمع التكسير تتغير فيه صورة المفرد، مثل: رجل ← رجال، كتاب ← كتب." },
        { "id": "f", "text": "من الأسماء الخمسة", "next": "R_kana_ism_five", "eval": { "fact": "number", "equals": "five" }, "hint": "الأسماء الخمسة مثل: أبو، أخو، حمو، فو، ذو، وتعرب بالحروف بشروطها." }
      ]
    },
    "kana_ism_ending": {
      "id": "kana_ism_ending",
      "type": "question",
      "context": "بعد تحديد صورة الاسم ننظر إلى الحرف الأصلي الأخير، لا إلى التنوين أو الضمائر المتصلة.",
      "text": "ما حالة آخر الاسم بعد فصل الضمائر والعلامات الزائدة؟ اختر الإجابة الصحيحة مما يلي:",
      "hint": "قبل الحكم على آخر الكلمة اسأل: هل الحرف الأخير من أصل الاسم أم ضمير متصل؟ مثل: طموحي = طموح + ياء المتكلم؛ فالاسم صحيح الآخر والياء ضمير.",
      "answers": [
        { "id": "a", "text": "صحيح الآخر", "next": "R_kana_ism_visible", "eval": { "fact": "ending", "equals": "sahih" } },
        { "id": "b", "text": "صحيح الآخر متصل بياء المتكلم", "next": "R_kana_ism_attached_ya", "eval": { "fact": "ending", "equals": "attached_ya" }, "hint": "مثل: طموحي = طموح + ياء المتكلم. كلمة (طموح) صحيحة الآخر، والياء ضمير متصل في محل جر مضاف إليه، وليست حرف علة من أصل الكلمة." },
        { "id": "c", "text": "معتل الآخر", "next": "R_kana_ism_estimated", "eval": { "fact": "ending", "equals": "moatal" } }
      ]
    },

    "kana_khabar_entry": {
      "id": "kana_khabar_entry",
      "type": "question",
      "context": "عرفنا من العلاقة أن المحدد أتم المعنى بعد اسم الفعل الناسخ. الآن نحدد صورته من المثال نفسه قبل أن نذكر أثر الناسخ.",
      "text": "ما صورة هذا الجزء في الجملة؟ اختر الإجابة الصحيحة مما يلي:",
      "hint": "بعد أن عرفنا أنه أتم معنى الجملة نحدد صورته: اسم أو فعل مرتبط بزمن أو جملة أو شبه جملة. والمفرد النحوي قد يأتي معه نعت أو مضاف إليه أو تابع ما دام ليس جملة ولا شبه جملة.",
      "answers": [
        { "id": "a", "text": "اسم أو تركيب يؤول باسم", "next": "kana_khabar_single_start", "eval": { "fact": "khabarKind", "equals": "single" }, "hint": "مثل: نشيطًا، بخارًا، أو مصدر مؤول مثل: أن أتميز = تميزي." },
        { "id": "b", "text": "فعل يدل على حدث مقترن بزمن", "next": "kana_khabar_verbal_gate", "eval": { "fact": "sentenceType", "equals": "verbal" }, "hint": "مثل: يقرأ، يعمل؛ فهي أفعال مضارعة تدل على حدث وزمن." },
        { "id": "c", "text": "جملة تبدأ باسم", "next": "R_kana_khabar_nominal_sentence", "eval": { "fact": "sentenceType", "equals": "nominal" }, "hint": "الجملة الاسمية داخل الخبر تبدأ باسم، مثل: أخلاقه حسنة." },
        { "id": "d", "text": "شبه جملة: جار ومجرور أو ظرف", "next": "kana_khabar_shibh_type", "eval": { "fact": "khabarKind", "equals": "shibh" }, "hint": "شبه الجملة تكون جارًا ومجرورًا مثل: في الحقيبة، أو ظرفًا مثل: عند المدير." }
      ]
    },
    "kana_khabar_nominal_starter": {
      "id": "kana_khabar_nominal_starter",
      "type": "question",
      "context": "بعد أن عرفنا أن الخبر تركيب من أكثر من كلمة، نلاحظ بدايته دون إعادة سؤال العلاقة.",
      "text": "هل يبدأ هذا التركيب باسم أم بفعل؟ اختر الإجابة الصحيحة مما يلي:",
      "hint": "انظر إلى أول كلمة في التركيب المحدد نفسه؛ إذا بدأ باسم فهو جملة اسمية، وإذا بدأ بفعل فهو جملة فعلية.",
      "answers": [
        { "id": "a", "text": "يبدأ باسم", "next": "R_kana_khabar_nominal_sentence", "correct": true },
        { "id": "b", "text": "يبدأ بفعل", "next": "kana_khabar_nominal_starter", "correct": false, "hint": "راجع أول كلمة في التركيب المحدد: هل هي اسم أم فعل؟" }
      ]
    },

    "kana_khabar_verbal_gate": {
      "id": "kana_khabar_verbal_gate",
      "type": "question",
      "context": "عرفنا أن المحدد فعل، ونفحص الآن هل أتم المعنى بعد اسم الناسخ.",
      "text": "هل أتم هذا الفعل مع فاعله معنى الجملة؟ اختر الإجابة الصحيحة مما يلي:",
      "hint": "الفعل مع فاعله يكون جملة فعلية. فإذا أتمت هذه الجملة المعنى بعد اسم الناسخ كانت في محل نصب خبرًا له." ,
      "answers": [
        { "id": "a", "text": "نعم", "next": "R_kana_khabar_verbal_sentence", "correct": true },
        { "id": "b", "text": "لا", "next": "kana_khabar_verbal_gate", "correct": false, "hint": "قد تراه كلمة واحدة في الكتابة، لكنه فعل يدل على حدث وزمن، ومعه فاعل ظاهر أو مستتر؛ لذلك يعد جملة فعلية في محل نصب خبر الفعل الناسخ، لا خبرًا مفردًا." }
      ]
    },
    "kana_khabar_shibh_type": {
      "id": "kana_khabar_shibh_type",
      "type": "question",
      "context": "عرفنا أن المحدد أتم المعنى بتركيب ليس اسمًا مفردًا ولا فعلًا؛ إنه شبه جملة.",
      "text": "ما نوع شبه الجملة؟ اختر الإجابة الصحيحة مما يلي:",
      "hint": "إذا بدأ التركيب بحرف جر مثل: في، من، على؛ فهو جار ومجرور. وإذا كان ظرف مكان أو زمان مثل: عند، فوق، أمام؛ فهو شبه جملة ظرفية.",
      "answers": [
        { "id": "a", "text": "جار ومجرور", "next": "R_kana_khabar_jar", "eval": { "fact": "shibhType", "equals": "jar" } },
        { "id": "b", "text": "ظرف", "next": "R_kana_khabar_zarf", "eval": { "fact": "shibhType", "equals": "zarf" } }
      ]
    },
    "kana_khabar_single_start": {
      "id": "kana_khabar_single_start",
      "type": "question",
      "context": "بما أن المحدد أتم المعنى بعد اسم الفعل الناسخ، وكان اسمًا أو تركيبًا يؤول باسم، نحدد طبيعته قبل العلامة أو المحل.",
      "text": "هل هو اسم معرب، أم اسم مبني، أم مصدر مؤول؟",
      "hint": "الاسم المعرب يتغير آخره، والاسم المبني يلزم صورة واحدة، والمصدر المؤول تركيب من حرف مصدري وفعل ويحل محل اسم، مثل: أن أتميز = تميزي.",
      "answers": [
        { "id": "a", "text": "اسم معرب", "next": "kana_khabar_single_number", "eval": { "fact": "nounKind", "equals": "mu3rab" } },
        { "id": "b", "text": "اسم مبني", "next": "kana_khabar_single_built", "eval": { "fact": "nounKind", "equals": "mabni" } },
        { "id": "c", "text": "مصدر مؤول", "next": "R_kana_khabar_single_masdar", "eval": { "fact": "nounKind", "equals": "masdar" }, "hint": "صحيح أن فيه فعلًا مضارعًا، لكن هذا الفعل سبق بحرف مصدري هو (أن)، فيؤولان بمصدر: أن أتميز = تميزي. لذلك لا نعربه جملة فعلية مستقلة هنا، بل مصدرًا مؤولًا في محل نصب خبر الفعل الناسخ." }
      ]
    },
    "kana_khabar_single_built": {
      "id": "kana_khabar_single_built",
      "type": "question",
      "context": "عرفنا أن المحدد اسم مبني، فنحدد نوعه من الكلمة نفسها قبل المحل الإعرابي.",
      "text": "ما نوع هذا الاسم المبني؟",
      "hint": "هل هو ضمير؟ اسم إشارة؟ اسم موصول؟ الاسم المبني يلزم صورة واحدة، ثم يكون في محل نصب إذا كان خبرًا للفعل الناسخ.",
      "answers": [
        { "id": "a", "text": "ضمير", "next": "R_kana_khabar_single_damir", "eval": { "fact": "mabniType", "equals": "damir" } },
        { "id": "b", "text": "اسم إشارة", "next": "R_kana_khabar_single_ishara", "eval": { "fact": "mabniType", "equals": "ishara" } },
        { "id": "c", "text": "اسم موصول", "next": "R_kana_khabar_single_mawsool", "eval": { "fact": "mabniType", "equals": "mawsool" } },
        { "id": "d", "text": "اسم استفهام", "next": "R_kana_khabar_single_istifham", "eval": { "fact": "mabniType", "equals": "istifham" } },
        { "id": "e", "text": "اسم شرط", "next": "R_kana_khabar_single_shart", "eval": { "fact": "mabniType", "equals": "shart" } },
        { "id": "f", "text": "كم الخبرية", "next": "R_kana_khabar_single_kam", "eval": { "fact": "mabniType", "equals": "kam" } }
      ]
    },
    "kana_khabar_single_number": {
      "id": "kana_khabar_single_number",
      "type": "question",
      "context": "عرفنا أنه اسم معرب أتم المعنى بعد اسم الفعل الناسخ، فنحدد صورته قبل اختيار علامة النصب.",
      "text": "ما صورة هذا الاسم؟ اختر الإجابة الصحيحة مما يلي:",
      "hint": "المفرد يدل على واحد، والمثنى على اثنين، وجمع المذكر السالم غالبًا ينتهي بـ(ين) أو (ون)، وجمع المؤنث السالم ينتهي بـ(ات)، وجمع التكسير تتغير صورة مفرده.",
      "answers": [
        { "id": "a", "text": "مفرد", "next": "kana_khabar_single_ending", "eval": { "fact": "number", "equals": "singular" }, "hint": "المفرد هنا كلمة واحدة من حيث الصورة، مثل: نشيطًا، بخارًا، معتدلًا." },
        { "id": "b", "text": "مثنى", "next": "R_kana_khabar_single_dual", "eval": { "fact": "number", "equals": "dual" }, "hint": "المثنى يدل على اثنين أو اثنتين، مثل: حاضرين في (كان الطالبان حاضرين)." },
        { "id": "c", "text": "جمع مذكر سالم", "next": "R_kana_khabar_single_jms", "eval": { "fact": "number", "equals": "jms" }, "hint": "جمع المذكر السالم يدل على أكثر من اثنين من الذكور وينتهي غالبًا بـ(ون) أو (ين)، مثل: مخلصين." },
        { "id": "d", "text": "جمع مؤنث سالم", "next": "R_kana_khabar_single_jfs", "eval": { "fact": "number", "equals": "jfs" }, "hint": "جمع المؤنث السالم ينتهي بألف وتاء، مثل: مجتهدات." },
        { "id": "e", "text": "جمع تكسير", "next": "kana_khabar_single_ending", "eval": { "fact": "number", "equals": "jt" }, "hint": "جمع التكسير تتغير فيه صورة المفرد، مثل: رجل ← رجال." },
        { "id": "f", "text": "من الأسماء الخمسة", "next": "R_kana_khabar_single_five", "eval": { "fact": "number", "equals": "five" }, "hint": "الأسماء الخمسة تعرب بالحروف بشروطها، مثل: أبا، أخا، ذا." }
      ]
    },
    "kana_khabar_single_ending": {
      "id": "kana_khabar_single_ending",
      "type": "question",
      "context": "بعد تحديد صورة الاسم ننظر إلى الحرف الأصلي الأخير.",
      "text": "ما حالة آخر الاسم بعد حذف التنوين والضمائر المتصلة؟",
      "hint": "انظر إلى أصل الاسم لا إلى التنوين أو الضمير المتصل. حروف العلة: ا، و، ي.",
      "answers": [
        { "id": "a", "text": "صحيح الآخر", "next": "R_kana_khabar_single_visible", "eval": { "fact": "ending", "equals": "sahih" } },
        { "id": "b", "text": "معتل الآخر", "next": "R_kana_khabar_single_estimated", "eval": { "fact": "ending", "equals": "moatal" } }
      ]
    },




    "kana_connected_pronoun_i3rab": {
      "id": "kana_connected_pronoun_i3rab",
      "type": "question",
      "context": "عرفنا صاحب المعنى. الآن نحدد الكلمة التي شغلت موقع اسم الفعل الناسخ في الإعراب.",
      "text": "ما الذي شغل موقع اسم الفعل الناسخ في الإعراب؟ اختر الإجابة الصحيحة مما يلي:",
      "hint": "اسأل: من صاحب معنى الفعل الناسخ؟ ثم حدد أين دل عليه داخل الفعل: أفي اسم ظاهر بعده أم في ضمير متصل؟",
      "answers": [
        { "id": "a", "text": "الضمير المتصل بالفعل الناسخ", "next": "R_kana_ism_damir", "correct": true },
        { "id": "b", "text": "الاسم الظاهر قبله", "next": "kana_connected_pronoun_i3rab", "correct": false, "hint": "صحيح أن المعنى يعود إلى الاسم الظاهر، لكنه تقدم على الفعل الناسخ؛ لذلك يكون اسم الناسخ هو الضمير المتصل بالفعل." }
      ]
    },
    "kana_damir_name": {
      "id": "kana_damir_name",
      "type": "question",
      "context": "عرفنا أن التاء تدل على المتكلم. الآن نسمي ما يدل على متكلم أو مخاطب أو غائب.",
      "text": "ما الاسم الذي يدل على متكلم أو مخاطب أو غائب؟ اختر الإجابة الصحيحة مما يلي:",
      "hint": "انظر إلى التاء في المثال: هل تدل على متكلم أم مخاطب أم غائب؟ ما اسم هذا النوع من الأسماء؟",
      "answers": [
        { "id": "a", "text": "ضمير", "next": "kana_damir_connected", "correct": true },
        { "id": "b", "text": "اسم إشارة", "next": "kana_damir_name", "correct": false, "hint": "اسم الإشارة يدل على مشار إليه مثل: هذا. أما التاء في (كنتُ) فتدل على المتكلم." },
        { "id": "c", "text": "علامة لا محل لها", "next": "kana_damir_name", "correct": false, "hint": "لو كانت تاء تأنيث ساكنة لكانت علامة، لكن التاء في (كنتُ) تدل على المتكلم." }
      ]
    },
    "kana_damir_connected": {
      "id": "kana_damir_connected",
      "type": "question",
      "context": "عرفنا أنها ضمير. الآن ننظر: هل اتصلت بما قبلها أم انفصلت عنه؟",
      "text": "هل التاء اتصلت بالفعل الناسخ أم جاءت منفصلة؟ اختر الإجابة الصحيحة مما يلي:",
      "hint": "في (كنتُ) التاء ملتصقة بالفعل، لذلك هي ضمير متصل.",
      "answers": [
        { "id": "a", "text": "اتصلت بالفعل الناسخ", "next": "kana_damir_site", "correct": true },
        { "id": "b", "text": "جاءت منفصلة", "next": "kana_damir_connected", "correct": false, "hint": "الضمير المنفصل يكون مثل: أنا، أنت، هو. أما التاء في (كنتُ) فهي متصلة بالفعل." }
      ]
    },
    "kana_damir_site": {
      "id": "kana_damir_site",
      "type": "question",
      "context": "عرفنا أنها ضمير متصل. الآن نحدد موقعها في باب كان.",
      "text": "ما موقع هذا الضمير بعد الفعل الناسخ؟ اختر الإجابة الصحيحة مما يلي:",
      "hint": "اسأل: من الذي كان مطمئنًا؟ التاء تدل على المتكلم، فهي التي كان هو صاحب المعنى في الجملة.",
      "answers": [
        { "id": "a", "text": "اسم الفعل الناسخ", "next": "R_kana_ism_damir", "correct": true },
        { "id": "b", "text": "خبر الفعل الناسخ", "next": "kana_damir_site", "correct": false, "hint": "الخبر هو (مطمئنًا)، أما التاء فهي صاحب معنى كان." }
      ]
    },
    "kana_attached_ya_origin": {
      "id": "kana_attached_ya_origin",
      "type": "question",
      "context": "عرفنا أن (طموحي) صاحب معنى أصبح. الآن نفحص الياء في آخر الكلمة.",
      "text": "هل الياء من أصل كلمة (طموح) أم تدل على صاحب الطموح؟ اختر الإجابة الصحيحة مما يلي:",
      "hint": "طموحي = طموح + ياء المتكلم. الياء ليست من أصل الكلمة.",
      "answers": [
        { "id": "a", "text": "تدل على صاحب الطموح", "next": "kana_attached_ya_pronoun", "correct": true },
        { "id": "b", "text": "من أصل الكلمة", "next": "kana_attached_ya_origin", "correct": false, "hint": "الأصل: طموح. والياء أضيفت إلى الاسم لتدل على المتكلم." }
      ]
    },
    "kana_attached_ya_pronoun": {
      "id": "kana_attached_ya_pronoun",
      "type": "question",
      "context": "عرفنا أن الياء تدل على صاحب الطموح، وهي هنا تدل على المتكلم.",
      "text": "ما نوع الياء هنا؟ اختر الإجابة الصحيحة مما يلي:",
      "hint": "ما دل على متكلم أو مخاطب أو غائب يسمى ضميرًا، ولأنه اتصل بالاسم فهو ضمير متصل.",
      "answers": [
        { "id": "a", "text": "ضمير متصل", "next": "R_kana_ism_attached_ya", "correct": true },
        { "id": "b", "text": "حرف علة من أصل الكلمة", "next": "kana_attached_ya_pronoun", "correct": false, "hint": "الياء ليست من أصل (طموح)، بل ضمير متصل يدل على المتكلم." }
      ]
    },
    "kana_masdar_source_gate": {
      "id": "kana_masdar_source_gate",
      "type": "question",
      "context": "عرفنا أن التركيب أتم المعنى عن اسم الناسخ. الآن نكتشف طبيعته.",
      "text": "هل سبق الفعل حرف مصدري مثل (أن)؟ اختر الإجابة الصحيحة مما يلي:",
      "hint": "في (أن أتميز) جاءت (أن) قبل الفعل، وهذا يجعل التركيب يؤول باسم.",
      "answers": [
        { "id": "a", "text": "نعم", "next": "kana_masdar_name", "correct": true },
        { "id": "b", "text": "لا", "next": "kana_masdar_source_gate", "correct": false, "hint": "انظر إلى أول التركيب: (أن أتميز). بدأ بحرف مصدري هو (أن)." }
      ]
    },
    "kana_masdar_name": {
      "id": "kana_masdar_name",
      "type": "question",
      "context": "عرفنا أن التركيب بدأ بحرف مصدري وفعل، ويمكن تأويله باسم: أن أتميز = تميزي.",
      "text": "ماذا يسمى هذا التركيب؟ اختر الإجابة الصحيحة مما يلي:",
      "hint": "المصدر المؤول تركيب من حرف مصدري وفعل ويؤول باسم.",
      "answers": [
        { "id": "a", "text": "مصدر مؤول", "next": "kana_masdar_site", "correct": true },
        { "id": "b", "text": "اسم ظاهر معرب", "next": "kana_masdar_name", "correct": false, "hint": "ليس كلمة واحدة ظاهرة، بل تركيب: أن + فعل." },
        { "id": "c", "text": "اسم مبني", "next": "kana_masdar_name", "correct": false, "hint": "ليس اسمًا مبنيًا مثل هذا أو الذي؛ إنه تركيب يؤول باسم." }
      ]
    },
    "kana_masdar_site": {
      "id": "kana_masdar_site",
      "type": "question",
      "context": "عرفنا أنه مصدر مؤول. الآن نحدد موقعه بعد أن أتم المعنى عن اسم الناسخ.",
      "text": "ما موقع المصدر المؤول في الجملة؟ اختر الإجابة الصحيحة مما يلي:",
      "hint": "في (أصبح طموحي أن أتميز)، المصدر المؤول أتم المعنى عن طموحي.",
      "answers": [
        { "id": "a", "text": "خبر الفعل الناسخ", "next": "R_kana_khabar_single_masdar", "correct": true },
        { "id": "b", "text": "اسم الفعل الناسخ", "next": "kana_masdar_site", "correct": false, "hint": "اسم أصبح هو (طموحي)، أما (أن أتميز) فقد أتمت المعنى عنه." }
      ]
    },
    "kana_verbal_name": {
      "id": "kana_verbal_name",
      "type": "question",
      "context": "عرفنا أن المحدد يدل على حدث وزمن.",
      "text": "ماذا نسمي ما دل على حدث مقترن بزمن؟ اختر الإجابة الصحيحة مما يلي:",
      "hint": "الاسم لا يدل على حدث وزمن، والحرف لا يظهر معناه كاملًا إلا مع غيره.",
      "answers": [
        { "id": "a", "text": "فعل", "next": "kana_verbal_complete", "correct": true },
        { "id": "b", "text": "اسم", "next": "kana_verbal_name", "correct": false, "hint": "الاسم لا يدل بذاته على حدث وزمن مثل (يقرأ)." },
        { "id": "c", "text": "حرف", "next": "kana_verbal_name", "correct": false, "hint": "الحرف مثل: في، من، إلى. أما (يقرأ) فيدل على حدث وزمن." }
      ]
    },
    "kana_verbal_complete": {
      "id": "kana_verbal_complete",
      "type": "question",
      "context": "عرفنا أنه فعل. الآن نرى هل أتم المعنى عن اسم الناسخ.",
      "text": "هل أتم الفعل مع فاعله المعنى بعد اسم الفعل الناسخ؟ اختر الإجابة الصحيحة مما يلي:",
      "hint": "في مثل: كان الطالب يقرأ؛ (يقرأ) مع فاعله المستتر أخبرنا عما كان عليه الطالب.",
      "answers": [
        { "id": "a", "text": "نعم", "next": "kana_verbal_sentence_kind", "correct": true },
        { "id": "b", "text": "لا", "next": "kana_verbal_complete", "correct": false, "hint": "الفعل هنا لم يأتِ منفصلًا؛ بل أتم معنى الجملة بعد اسم الناسخ." }
      ]
    },
    "kana_verbal_sentence_kind": {
      "id": "kana_verbal_sentence_kind",
      "type": "question",
      "context": "عرفنا أن الفعل مع فاعله أتم المعنى.",
      "text": "ما صورة هذا الجزء؟ اختر الإجابة الصحيحة مما يلي:",
      "hint": "الفعل مع فاعله يسمى جملة فعلية.",
      "answers": [
        { "id": "a", "text": "جملة فعلية", "next": "R_kana_khabar_verbal_sentence", "correct": true },
        { "id": "b", "text": "خبر مفرد", "next": "kana_verbal_sentence_kind", "correct": false, "hint": "قد يبدو كلمة واحدة في الكتابة، لكنه فعل ومعه فاعل مستتر، لذلك هو جملة فعلية." },
        { "id": "c", "text": "شبه جملة", "next": "kana_verbal_sentence_kind", "correct": false, "hint": "شبه الجملة جار ومجرور أو ظرف، وليس فعلًا." }
      ]
    },
    "kana_shibh_meaning": {
      "id": "kana_shibh_meaning",
      "type": "question",
      "context": "عرفنا أن المحدد شبه جملة. الآن نرى وظيفته في المعنى.",
      "text": "هل أتمت شبه الجملة المعنى عن اسم الفعل الناسخ؟ اختر الإجابة الصحيحة مما يلي:",
      "hint": "اسأل: أين كان الكتاب؟ أو أين ما زال العامل؟ الجواب بشبه الجملة يتم المعنى.",
      "answers": [
        { "id": "a", "text": "نعم", "next": "kana_shibh_result_gate", "correct": true },
        { "id": "b", "text": "لا", "next": "kana_shibh_meaning", "correct": false, "hint": "شبه الجملة هنا أتمت معنى الجملة عن الاسم، وهي خبر شبه جملة لا اسم للناسخ." }
      ]
    },
    "kana_shibh_result_gate": {
      "id": "kana_shibh_result_gate",
      "type": "question",
      "context": "عرفنا أنها أتمت المعنى عن اسم الناسخ.",
      "text": "ما موقع شبه الجملة هنا؟ اختر الإجابة الصحيحة مما يلي:",
      "hint": "ما أتم المعنى بعد اسم الفعل الناسخ يكون خبرًا له.",
      "answers": [
        { "id": "a", "text": "خبر الفعل الناسخ", "next": "kana_khabar_shibh_type", "correct": true },
        { "id": "b", "text": "اسم الفعل الناسخ", "next": "kana_shibh_result_gate", "correct": false, "hint": "اسم الناسخ هو صاحب المعنى، أما شبه الجملة فقد أتمت المعنى عنه." }
      ]
    },

    "R_kana_ism_attached_ya": { "id": "R_kana_ism_attached_ya", "type": "result", "coverage": "kana_ism.attached_ya", "text": "طموحي:\nاسم الفعل الناسخ مرفوع بضمة مقدرة على ما قبل ياء المتكلم، منع من ظهورها اشتغال المحل بالحركة المناسبة.\n\nوالياء:\nضمير متصل في محل جر مضاف إليه." },
    "R_kana_ism_hidden_damir": { "id": "R_kana_ism_hidden_damir", "type": "result", "coverage": "kana_ism.hidden_damir", "text": "اسم الفعل الناسخ ضمير مستتر يعود على الاسم السابق في الجملة. مثال: المزارعُ ما زالَ يعملُ؛ اسم (ما زال) ضمير مستتر تقديره هو يعود على (المزارع)." },
    "R_kana_ism_visible": { "id": "R_kana_ism_visible", "type": "result", "coverage": "kana_ism.visible", "text": "اسم الفعل الناسخ مرفوع وعلامة رفعه الضمة الظاهرة على آخره." },
    "R_kana_ism_estimated": { "id": "R_kana_ism_estimated", "type": "result", "coverage": "kana_ism.estimated", "text": "اسم الفعل الناسخ مرفوع وعلامة رفعه الضمة المقدرة على الألف في آخره، منع من ظهورها التعذر." },
    "R_kana_ism_dual": { "id": "R_kana_ism_dual", "type": "result", "coverage": "kana_ism.dual", "text": "اسم الفعل الناسخ مرفوع وعلامة رفعه الألف لأنه مثنى." },
    "R_kana_ism_jms": { "id": "R_kana_ism_jms", "type": "result", "coverage": "kana_ism.jms", "text": "اسم الفعل الناسخ مرفوع وعلامة رفعه الواو لأنه جمع مذكر سالم." },
    "R_kana_ism_jfs": { "id": "R_kana_ism_jfs", "type": "result", "coverage": "kana_ism.jfs", "text": "اسم الفعل الناسخ مرفوع وعلامة رفعه الضمة الظاهرة على آخره لأنه جمع مؤنث سالم." },
    "R_kana_ism_five": { "id": "R_kana_ism_five", "type": "result", "coverage": "kana_ism.five", "text": "اسم الفعل الناسخ مرفوع وعلامة رفعه الواو لأنه من الأسماء الخمسة. وقد تحققت شروط الإعراب بالحروف: مفرد، مضاف، غير مضاف إلى ياء المتكلم." },
    "R_kana_ism_damir": { "id": "R_kana_ism_damir", "type": "result", "coverage": "kana_ism.damir", "text": "ضمير متصل مبني في محل رفع اسم الفعل الناسخ. وإذا سبق الفعل الناسخ اسم ظاهر يعود عليه الضمير، فالمعنى يعود إلى الاسم الظاهر، أما الموقع الإعرابي فيشغله الضمير المتصل." },
    "R_kana_ism_ishara": { "id": "R_kana_ism_ishara", "type": "result", "coverage": "kana_ism.ishara", "text": "اسم إشارة مبني في محل رفع اسم الفعل الناسخ." },
    "R_kana_ism_mawsool": { "id": "R_kana_ism_mawsool", "type": "result", "coverage": "kana_ism.mawsool", "text": "اسم موصول مبني في محل رفع اسم الفعل الناسخ." },
    "R_kana_ism_istifham": { "id": "R_kana_ism_istifham", "type": "result", "coverage": "kana_ism.istifham", "text": "اسم استفهام مبني في محل رفع اسم الفعل الناسخ." },
    "R_kana_ism_shart": { "id": "R_kana_ism_shart", "type": "result", "coverage": "kana_ism.shart", "text": "اسم شرط مبني في محل رفع اسم الفعل الناسخ." },
    "R_kana_ism_kam": { "id": "R_kana_ism_kam", "type": "result", "coverage": "kana_ism.kam", "text": "كم الخبرية مبنية في محل رفع اسم الفعل الناسخ." },
    "R_kana_ism_masdar": { "id": "R_kana_ism_masdar", "type": "result", "coverage": "kana_ism.masdar", "text": "مصدر مؤول في محل رفع اسم الفعل الناسخ؛ لأنه تركيب من حرف مصدري وفعل مضارع ويؤول باسم، مثل: أن تتجاهل الناس = تجاهلُ الناس." },

    "R_kana_khabar_single_visible": { "id": "R_kana_khabar_single_visible", "type": "result", "coverage": "kana_khabar_single.visible", "text": "خبر الفعل الناسخ منصوب وعلامة نصبه الفتحة الظاهرة على آخره." },
    "R_kana_khabar_single_estimated": { "id": "R_kana_khabar_single_estimated", "type": "result", "coverage": "kana_khabar_single.estimated", "text": "خبر الفعل الناسخ منصوب وعلامة نصبه الفتحة المقدرة على آخره." },
    "R_kana_khabar_single_dual": { "id": "R_kana_khabar_single_dual", "type": "result", "coverage": "kana_khabar_single.dual", "text": "خبر الفعل الناسخ منصوب وعلامة نصبه الياء لأنه مثنى." },
    "R_kana_khabar_single_jms": { "id": "R_kana_khabar_single_jms", "type": "result", "coverage": "kana_khabar_single.jms", "text": "خبر الفعل الناسخ منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم." },
    "R_kana_khabar_single_jfs": { "id": "R_kana_khabar_single_jfs", "type": "result", "coverage": "kana_khabar_single.jfs", "text": "خبر الفعل الناسخ منصوب وعلامة نصبه الكسرة نيابة عن الفتحة لأنه جمع مؤنث سالم." },
    "R_kana_khabar_single_five": { "id": "R_kana_khabar_single_five", "type": "result", "coverage": "kana_khabar_single.five", "text": "خبر الفعل الناسخ منصوب وعلامة نصبه الألف لأنه من الأسماء الخمسة." },
    "R_kana_khabar_single_damir": { "id": "R_kana_khabar_single_damir", "type": "result", "coverage": "kana_khabar_single.damir", "text": "ضمير مبني في محل نصب خبر الفعل الناسخ بحسب صورته في الجملة." },
    "R_kana_khabar_single_ishara": { "id": "R_kana_khabar_single_ishara", "type": "result", "coverage": "kana_khabar_single.ishara", "text": "اسم إشارة مبني في محل نصب خبر الفعل الناسخ." },
    "R_kana_khabar_single_mawsool": { "id": "R_kana_khabar_single_mawsool", "type": "result", "coverage": "kana_khabar_single.mawsool", "text": "اسم موصول مبني في محل نصب خبر الفعل الناسخ." },
    "R_kana_khabar_single_istifham": { "id": "R_kana_khabar_single_istifham", "type": "result", "coverage": "kana_khabar_single.istifham", "text": "اسم استفهام مبني في محل نصب خبر الفعل الناسخ." },
    "R_kana_khabar_single_shart": { "id": "R_kana_khabar_single_shart", "type": "result", "coverage": "kana_khabar_single.shart", "text": "اسم شرط مبني في محل نصب خبر الفعل الناسخ." },
    "R_kana_khabar_single_kam": { "id": "R_kana_khabar_single_kam", "type": "result", "coverage": "kana_khabar_single.kam", "text": "كم الخبرية مبنية في محل نصب خبر الفعل الناسخ." },
    "R_kana_khabar_single_masdar": { "id": "R_kana_khabar_single_masdar", "type": "result", "coverage": "kana_khabar_single.masdar", "text": "مصدر مؤول في محل نصب خبر الفعل الناسخ؛ لأنه تركيب من حرف مصدري وفعل، ويؤول باسم، مثل: أن أتميز = تميزي." },
    "R_kana_khabar_verbal_sentence": { "id": "R_kana_khabar_verbal_sentence", "type": "result", "coverage": "kana_khabar.verbal_sentence", "text": "فعل مضارع، وفاعله ضمير مستتر يفهم من السياق، والجملة الفعلية في محل نصب خبر الفعل الناسخ." },
    "R_kana_khabar_nominal_sentence": { "id": "R_kana_khabar_nominal_sentence", "type": "result", "coverage": "kana_khabar.nominal_sentence", "text": "تفصيل الجملة الاسمية: المبتدأ الثاني وخبره يُعربان أولًا، ثم تُعرب الجملة الاسمية كلها في محل نصب خبر الفعل الناسخ." },
    "R_kana_khabar_jar": { "id": "R_kana_khabar_jar", "type": "result", "coverage": "kana_khabar.jar", "text": "شبه جملة من الجار والمجرور في محل نصب خبر الفعل الناسخ." },
    "R_kana_khabar_zarf": { "id": "R_kana_khabar_zarf", "type": "result", "coverage": "kana_khabar.zarf", "text": "شبه جملة ظرفية في محل نصب خبر الفعل الناسخ." },
    "kana_khabar_shibh_position_jar": {
      "id": "kana_khabar_shibh_position_jar",
      "type": "question",
      "context": "بعد أن عرفنا أن الخبر شبه جملة من جار ومجرور، ننظر هل تقدم على اسم نكرة.",
      "text": "هل جاء بعد هذا الجار والمجرور اسم نكرة مثل: كان في البيت رجل؟",
      "hint": "إذا تقدم شبه الجملة بعد الفعل الناسخ وجاءت بعدها نكرة، فشبه الجملة خبر مقدم، والاسم النكرة يكون اسم كان مؤخرًا.",
      "answers": [
        { "id": "a", "text": "نعم، تقدم على اسم نكرة", "next": "R_kana_khabar_jar_advanced", "eval": { "fact": "shibhPosition", "equals": "advanced" } },
        { "id": "b", "text": "لا، جاء بعد اسم الناسخ", "next": "R_kana_khabar_jar", "eval": { "fact": "shibhPosition", "equals": "normal" }, "hint": "لو جاء بعد اسم الناسخ لوجدنا اسمًا ظاهرًا قبل شبه الجملة. أما هنا فقد بدأ بعد الناسخ بشبه الجملة، ثم جاءت النكرة بعدها." }
      ]
    },
    "kana_khabar_shibh_position_zarf": {
      "id": "kana_khabar_shibh_position_zarf",
      "type": "question",
      "context": "بعد أن عرفنا أن الخبر شبه جملة ظرفية، ننظر هل تقدم على اسم نكرة.",
      "text": "هل جاء بعد هذا الظرف اسم نكرة مثل: ما زال عندنا ضيف؟",
      "hint": "إذا تقدم الظرف بعد الفعل الناسخ وجاءت بعده نكرة، فالظرف خبر مقدم، والاسم النكرة يكون اسم الفعل الناسخ مؤخرًا.",
      "answers": [
        { "id": "a", "text": "نعم، تقدم على اسم نكرة", "next": "R_kana_khabar_zarf_advanced", "eval": { "fact": "shibhPosition", "equals": "advanced" } },
        { "id": "b", "text": "لا، جاء بعد اسم الناسخ", "next": "R_kana_khabar_zarf", "eval": { "fact": "shibhPosition", "equals": "normal" }, "hint": "لو جاء بعد اسم الناسخ لوجدنا اسمًا ظاهرًا قبل الظرف. أما هنا فقد تقدم الظرف وجاءت النكرة بعده." }
      ]
    },
    "R_kana_khabar_jar_advanced": { "id": "R_kana_khabar_jar_advanced", "type": "result", "coverage": "kana_khabar.jar_advanced", "text": "في البيت: شبه جملة من الجار والمجرور في محل نصب خبر كان مقدم. رجلٌ: اسم كان مؤخر مرفوع." },
    "R_kana_khabar_zarf_advanced": { "id": "R_kana_khabar_zarf_advanced", "type": "result", "coverage": "kana_khabar.zarf_advanced", "text": "عندنا: شبه جملة ظرفية في محل نصب خبر ما زال مقدم. ضيفٌ: اسم ما زال مؤخر مرفوع." }
  }
};

// PEDAGOGY NOTE: relation -> function -> factor -> final parsing.
