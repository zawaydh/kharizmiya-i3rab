import type { ExerciseTree } from "../../lib/exercise/model";

export const cleanInnaTree: ExerciseTree = {
    "startNodeId": "inna_kaffa_gate",
    "nodes": {
        "inna_kaffa_gate": {
            "id": "inna_kaffa_gate",
            "type": "question",
            "context": "هذه هي الخطوة الأولى في أمثلة إن وأخواتها: نتحقق من اتصال الحرف الناسخ بـ«ما» الكافة قبل متابعة أثره الإعرابي.",
            "text": "هل اتصل الحرف الناسخ بـ«ما» الكافة؟",
            "hint": "إذا رأيت تركيبًا مثل: إنما، فانتبه: (ما) هنا كافة، أي تمنع إن من نصب الاسم ورفع الخبر. لذلك نُعرب ما بعدها كجملة اسمية عادية.",
            "answers": [
                {
                    "id": "kaffa_yes",
                    "text": "نعم، اتصلت به ما الكافة",
                    "next": "inna_kaffa_effect",
                    "eval": { "fact": "hasKaffa", "equals": true },
                    "hint": "صحيح إذا كان الحرف مثل: إنما. هنا لا نبحث عن اسم إن وخبر إن، بل نعود إلى الجملة الاسمية بعد إنما."
                },
                {
                    "id": "kaffa_no",
                    "text": "لا، لم تتصل به ما الكافة",
                    "next": "inna_meaning",
                    "eval": { "fact": "hasKaffa", "notEquals": true },
                    "hint": "صحيح إذا كان الحرف مثل: إن، أن، كأن، لكن، ليت، لعل دون ما الكافة. عندها يبقى الحرف عاملًا: ينصب الاسم ويرفع الخبر."
                }
            ]
        },
        "inna_kaffa_effect": {
            "id": "inna_kaffa_effect",
            "type": "question",
            "context": "بما أننا أثبتنا اتصال «ما» الكافة بالحرف الناسخ، نحدد الآن أثر هذا الاتصال قبل الإعراب.",
            "text": "ماذا فعلت ما الكافة بالحرف الناسخ؟",
            "hint": "الكفّ يعني إبطال عمل الحرف الناسخ: لا ينصب الاسم ولا يرفع الخبر بعد اتصال ما الكافة به.",
            "answers": [
                {
                    "id": "a",
                    "text": "كفّت الحرف عن العمل، فصار ما بعده جملة اسمية عادية",
                    "next": "inna_kaffa_base_role",
                    "eval": { "fact": "hasKaffa", "equals": true },
                    "hint": "صحيح؛ لذلك لا نقول في إنما المؤمنون إخوة: المؤمنون اسم إن، بل نعربه مبتدأ."
                },
                {
                    "id": "b",
                    "text": "بقي الحرف ناسخًا ينصب الاسم ويرفع الخبر",
                    "next": "inna_kaffa_base_role",
                    "eval": { "fact": "hasKaffa", "equals": false },
                    "hint": "هذا يصح مع إنّ وأخواتها دون ما الكافة. أما إنما ففيها ما كفت إن عن العمل."
                }
            ]
        },
        "inna_kaffa_base_role": {
            "id": "inna_kaffa_base_role",
            "type": "question",
            "context": "بعد كفّ الحرف عن العمل، نُعرب الجملة بعده كجملة اسمية عادية.",
            "text": "ما موقع الكلمة المحددة بعد «إنما»؟",
            "hint": "اسأل كما في الجملة الاسمية: من الذي نتحدث عنه؟ فهو المبتدأ. وما المعلومة عنه؟ فهي الخبر. لا تقل اسم إن هنا لأن ما الكافة أبطلت عمل إن.",
            "answers": [
                {
                    "id": "a",
                    "text": "مبتدأ",
                    "next": "R_inna_kaffa_mubtada",
                    "eval": { "fact": "kaffaTargetRole", "equals": "mubtada" },
                    "hint": "صحيح؛ بعد إنما يعود الاسم إلى حكم المبتدأ."
                },
                {
                    "id": "b",
                    "text": "خبر",
                    "next": "R_inna_kaffa_khabar",
                    "eval": { "fact": "kaffaTargetRole", "equals": "khabar" },
                    "hint": "صحيح إذا كانت الكلمة المحددة هي المعلومة التي أتمت معنى المبتدأ بعد إنما."
                },
                {
                    "id": "c",
                    "text": "اسم الحرف الناسخ",
                    "next": "R_inna_kaffa_mubtada",
                    "eval": { "fact": "kaffaTargetRole", "equals": "ism_inna" },
                    "hint": "لا نقول اسم إن هنا؛ لأن ما الكافة كفّت إن عن العمل، فصار ما بعدها يعرب كجملة اسمية عادية."
                }
            ]
        },
        "R_inna_kaffa_mubtada": {
            "id": "R_inna_kaffa_mubtada",
            "type": "result",
            "coverage": "inna_kaffa.cancelled",
            "text": "مبتدأ مرفوع. تنبيه: إنما لا تعمل عمل إن؛ لأن ما الكافة كفّت إن عن العمل."
        },
        "R_inna_kaffa_khabar": {
            "id": "R_inna_kaffa_khabar",
            "type": "result",
            "coverage": "inna_kaffa.cancelled",
            "text": "خبر مرفوع. تنبيه: إنما لا تعمل عمل إن؛ لأن ما الكافة كفّت إن عن العمل."
        },
        "inna_meaning": {
            "id": "inna_meaning",
            "type": "question",
            "context": "الحروف الناسخة تدخل على الجملة الاسمية؛ تنصب المبتدأ فيسمى اسمها، وترفع الخبر فيسمى خبرها. لكننا نبدأ أولًا من معنى الحرف في الجملة كلها قبل المصطلح.",
            "text": "ما المعنى الذي أفاده الحرف الناسخ هنا؟",
            "hint": "انظر إلى معنى الجملة كاملًا لا إلى كلمة منفردة: إن وأن للتوكيد، كأن للتشبيه، لكن للاستدراك، ليت للتمني، ولعل للترجي.",
            "answers": [
                {
                    "id": "semantic_subject",
                    "text": "الاسم وحده",
                    "next": "inna_compact_role",
                    "eval": { "fact": "semanticAnswer", "equals": "subject" },
                    "hint": "الحرف الناسخ لا يعمل على كلمة منفردة في المعنى هنا؛ انظر إلى الحكم الكامل الذي ربط الاسم بالخبر."
                },
                {
                    "id": "semantic_predicate",
                    "text": "الخبر وحده",
                    "next": "inna_compact_role",
                    "eval": { "fact": "semanticAnswer", "equals": "predicate" },
                    "hint": "الخبر جزء مهم، لكنه لا يكفي وحده. المعنى المقصود يكون في الجملة كاملة: الاسم مع الخبر."
                },
                {
                    "id": "semantic_judgment",
                    "text": "الحكم الكامل في الجملة",
                    "next": "inna_compact_role",
                    "eval": { "fact": "semanticAnswer", "equals": "judgment" },
                    "hint": "صحيح؛ نأخذ المعنى كاملًا، ثم نرجع إلى أصل الجملة الاسمية قبل دخول الحرف الناسخ."
                }
            ]
        },
        "inna_compact_role": {
            "id": "inna_compact_role",
            "type": "question",
            "context": "نحدد موقع الكلمة المطلوبة بعد دخول الحرف الناسخ.",
            "text": "ما موقع الكلمة المحددة بعد الحرف الناسخ؟",
            "hint": "لا نحتاج إعادة بناء الجملة كلها. انظر إلى أصل الجملة الاسمية المختصر: من الاسم الذي نتحدث عنه؟ هذا يصير اسم الحرف الناسخ. وما المعلومة عنه؟ هذه تصير خبره. إن تقدمت شبه الجملة مثل: في البيت، فهي خبر مقدم.",
            "answers": [
                {
                    "id": "a",
                    "text": "اسم الحرف الناسخ",
                    "next": "inna_ism_start",
                    "eval": { "fact": "targetRole", "equals": "ism" },
                    "hint": "اختر هذا إذا كانت الكلمة المحددة هي المبتدأ الأصلي أو الضمير الذي صار اسم الحرف الناسخ بعد دخوله."
                },
                {
                    "id": "b",
                    "text": "خبر الحرف الناسخ",
                    "next": "inna_khabar_kind",
                    "eval": { "fact": "targetRole", "equals": "khabar" },
                    "hint": "اختر هذا إذا كانت الكلمة المحددة هي المعلومة التي أتمت المعنى عن اسم الحرف الناسخ. وقد يكون الخبر مفردًا أو جملة أو شبه جملة."
                }
            ]
        },
        "inna_ism_start": {
            "id": "inna_ism_start",
            "type": "question",
            "context": "وصلنا إلى اسم الحرف الناسخ. نحدد أولًا هل الاسم معرب أم مبني، ثم إذا ثبت البناء نحدد نوع المبني.",
            "text": "هل اسم الحرف الناسخ معرب أم مبني؟",
            "hint": "الاسم المعرب تتغير علامته بحسب موقعه، أما الاسم المبني ـ ومنه الضمائر ـ فيلزم صورة واحدة ويكون هنا في محل نصب اسم الحرف الناسخ.",
            "answers": [
                {
                    "id": "a",
                    "text": "اسم معرب",
                    "next": "inna_ism_number",
                    "eval": { "fact": "nounKind", "equals": "mu3rab" },
                    "hint": "الاسم المعرب تتغير علامته بحسب موقعه، مثل: الطالبَ والطالبينِ والمعلمينَ."
                },
                {
                    "id": "b",
                    "text": "اسم مبني",
                    "next": "inna_ism_built",
                    "eval": { "fact": "nounKind", "anyOf": ["mabni", "connected_damir"] },
                    "hint": "الضمائر وأسماء الإشارة والأسماء الموصولة من الأسماء المبنية؛ نحدد نوع المبني في الخطوة التالية."
                }
            ]
        },
        "inna_ism_number": {
            "id": "inna_ism_number",
            "type": "question",
            "context": "عرفنا أن اسم إن معرب منصوب، فنفحص صورة الاسم قبل اختيار علامة النصب.",
            "text": "ما صورة اسم إن المعرب؟",
            "hint": "لا تنظر إلى المعنى وحده. افحص الصيغة: واحد، اثنان، جمع مذكر سالم، جمع مؤنث سالم، جمع تكسير، أو من الأسماء الخمسة.",
            "answers": [
                {
                    "id": "a",
                    "text": "مفرد أو جمع تكسير",
                    "next": "inna_ism_ending",
                    "eval": {
                        "fact": "number",
                        "equals": "singular_or_jt"
                    },
                    "hint": "المفرد وجمع التكسير غالبًا يشتركان هنا في علامة النصب الأصلية، ثم نفحص آخر الكلمة."
                },
                {
                    "id": "b",
                    "text": "مثنى",
                    "next": "R_inna_ism_dual",
                    "eval": {
                        "fact": "number",
                        "equals": "dual"
                    },
                    "hint": "المثنى في النصب تكون علامته الياء، مثل: الطالبينِ."
                },
                {
                    "id": "c",
                    "text": "جمع مذكر سالم",
                    "next": "R_inna_ism_jms",
                    "eval": {
                        "fact": "number",
                        "equals": "jms"
                    },
                    "hint": "جمع المذكر السالم في النصب تكون علامته الياء، مثل: المعلمينَ."
                },
                {
                    "id": "d",
                    "text": "جمع مؤنث سالم",
                    "next": "R_inna_ism_jfs",
                    "eval": {
                        "fact": "number",
                        "equals": "jfs"
                    },
                    "hint": "جمع المؤنث السالم في النصب علامته الكسرة نيابة عن الفتحة، مثل: الطالباتِ."
                },
                {
                    "id": "e",
                    "text": "من الأسماء الخمسة",
                    "next": "R_inna_ism_five",
                    "eval": {
                        "fact": "number",
                        "equals": "five"
                    },
                    "hint": "الأسماء الخمسة تنصب بالألف إذا كانت مفردة، مكبرة، مضافة، ومضافة إلى غير ياء المتكلم، مثل: أباك."
                }
            ]
        },
        "inna_ism_ending": {
            "id": "inna_ism_ending",
            "type": "question",
            "context": "بعد تحديد أن الاسم مفرد أو جمع تكسير، ننظر إلى آخر الكلمة لنميز العلامة الظاهرة من المقدرة.",
            "text": "كيف نصف آخر اسم إن هنا؟",
            "hint": "الاسم الصحيح الآخر تظهر عليه الفتحة غالبًا. المقصور آخره ألف لازمة مثل الفتى فتقدر عليه الفتحة. والمنقوص آخره ياء لازمة مكسور ما قبلها مثل القاضي وتظهر عليه الفتحة في النصب.",
            "answers": [
                {
                    "id": "a",
                    "text": "صحيح الآخر",
                    "next": "R_inna_ism_visible",
                    "eval": {
                        "fact": "ending",
                        "equals": "sahih"
                    },
                    "hint": "إذا لم ينتهِ الاسم بألف مقصورة أو ياء منقوصة، فالأصل ظهور الفتحة."
                },
                {
                    "id": "b",
                    "text": "مقصور آخره ألف لازمة",
                    "next": "R_inna_ism_maqsur",
                    "eval": {
                        "fact": "ending",
                        "equals": "maqsur"
                    },
                    "hint": "مثل الفتى؛ لا تظهر الفتحة على الألف للتعذر."
                },
                {
                    "id": "c",
                    "text": "منقوص آخره ياء لازمة",
                    "next": "R_inna_ism_manqous",
                    "eval": {
                        "fact": "ending",
                        "equals": "manqous"
                    },
                    "hint": "مثل القاضي؛ في النصب تظهر الفتحة على الياء: القاضيَ."
                }
            ]
        },
        "inna_ism_built": {
            "id": "inna_ism_built",
            "type": "question",
            "context": "عرفنا أن اسم إن اسم مبني مستقل، فنحدد نوعه من الكلمة الموجودة في المثال قبل صياغة المحل الإعرابي.",
            "text": "ما نوع هذا الاسم المبني؟",
            "hint": "بعد أن ثبت أن اسم الحرف الناسخ مبني، نحدد نوعه من المثال نفسه: ضمير متصل، اسم إشارة، أم اسم موصول.",
            "answers": [
                {
                    "id": "a",
                    "text": "ضمير متصل",
                    "next": "R_inna_ism_connected_damir",
                    "eval": { "fact": "nounKind", "equals": "connected_damir" },
                    "hint": "مثل الكاف في «إنك» والهاء في «إنه» و«هم» في «لعلهم»؛ الضمير المتصل من الأسماء المبنية."
                },
                {
                    "id": "b",
                    "text": "اسم إشارة",
                    "next": "R_inna_ism_ishara",
                    "eval": {
                        "fact": "mabniType",
                        "equals": "ishara"
                    },
                    "hint": "اسم الإشارة مثل هذا، هذه، هؤلاء، ذلك، تلك."
                },
                {
                    "id": "c",
                    "text": "اسم موصول",
                    "next": "R_inna_ism_mawsool",
                    "eval": {
                        "fact": "mabniType",
                        "equals": "mawsool"
                    },
                    "hint": "الاسم الموصول مثل الذي والتي، ويحتاج بعده جملة توضحه تسمى صلة الموصول."
                }
            ]
        },
        "R_inna_ism_visible": {
            "id": "R_inna_ism_visible",
            "type": "result",
            "coverage": "inna_ism.visible",
            "text": "اسم إن منصوب وعلامة نصبه الفتحة الظاهرة على آخره."
        },
        "R_inna_ism_maqsur": {
            "id": "R_inna_ism_maqsur",
            "type": "result",
            "coverage": "inna_ism.maqsur",
            "text": "اسم إن منصوب وعلامة نصبه الفتحة المقدرة على الألف منع من ظهورها التعذر."
        },
        "R_inna_ism_manqous": {
            "id": "R_inna_ism_manqous",
            "type": "result",
            "coverage": "inna_ism.manqous",
            "text": "اسم إن منصوب وعلامة نصبه الفتحة الظاهرة على الياء لأنه اسم منقوص منصوب."
        },
        "R_inna_ism_dual": {
            "id": "R_inna_ism_dual",
            "type": "result",
            "coverage": "inna_ism.dual",
            "text": "اسم إن منصوب وعلامة نصبه الياء لأنه مثنى."
        },
        "R_inna_ism_jms": {
            "id": "R_inna_ism_jms",
            "type": "result",
            "coverage": "inna_ism.jms",
            "text": "اسم إن منصوب وعلامة نصبه الياء لأنه جمع مذكر سالم."
        },
        "R_inna_ism_jfs": {
            "id": "R_inna_ism_jfs",
            "type": "result",
            "coverage": "inna_ism.jfs",
            "text": "اسم إن منصوب وعلامة نصبه الكسرة نيابة عن الفتحة لأنه جمع مؤنث سالم."
        },
        "R_inna_ism_five": {
            "id": "R_inna_ism_five",
            "type": "result",
            "coverage": "inna_ism.five",
            "text": "اسم إن منصوب وعلامة نصبه الألف لأنه من الأسماء الخمسة، وقد استوفى شروط إعرابها بالحروف: مفرد، مكبر، مضاف، ومضاف إلى غير ياء المتكلم."
        },
        "R_inna_ism_connected_damir": {
            "id": "R_inna_ism_connected_damir",
            "type": "result",
            "coverage": "inna_ism.connected_damir",
            "text": "ضمير متصل مبني في محل نصب اسم إن."
        },
        "R_inna_ism_ishara": {
            "id": "R_inna_ism_ishara",
            "type": "result",
            "coverage": "inna_ism.ishara",
            "text": "اسم إشارة مبني في محل نصب اسم إن."
        },
        "R_inna_ism_mawsool": {
            "id": "R_inna_ism_mawsool",
            "type": "result",
            "coverage": "inna_ism.mawsool",
            "text": "اسم موصول مبني في محل نصب اسم إن، وجملة الصلة بعده لا محل لها من الإعراب."
        },
        "inna_khabar_kind": {
            "id": "inna_khabar_kind",
            "type": "question",
            "context": "وصلنا إلى خبر الحرف الناسخ، وهو الجزء الذي أتم المعنى عن اسمه. الآن نحدد صورته من المثال نفسه.",
            "text": "ما صورة خبر إن هنا؟",
            "hint": "الخبر المفرد هنا يعني أنه ليس جملة ولا شبه جملة. وقد يأتي بعده مضاف إليه أو تابع، مثل: ذو فضلٍ، ويبقى الخبر مفردًا. أما الظرف مثل: غدًا، أو الجار والمجرور مثل: في الحقيبة، فيعاملان هنا كشبه جملة خبرية.",
            "answers": [
                {
                    "id": "a",
                    "text": "خبر مفرد؛ لأنه ليس جملة ولا شبه جملة",
                    "next": "inna_khabar_single_start",
                    "eval": {
                        "fact": "khabarKind",
                        "equals": "single"
                    },
                    "hint": "المفرد في باب الخبر يعني أنه ليس جملة ولا شبه جملة، ولو دل على مثنى أو جمع."
                },
                {
                    "id": "b",
                    "text": "خبر جملة",
                    "next": "inna_khabar_sentence_type",
                    "eval": {
                        "fact": "khabarKind",
                        "equals": "sentence"
                    },
                    "hint": "الجملة الخبرية قد تبدأ بفعل أو باسم، والجملة كلها تكون في محل رفع خبر إن."
                },
                {
                    "id": "c",
                    "text": "خبر شبه جملة",
                    "next": "inna_khabar_shibh_type",
                    "eval": {
                        "fact": "khabarKind",
                        "equals": "shibh"
                    },
                    "hint": "شبه الجملة إما جار ومجرور أو ظرف، ويكون في محل رفع خبر إن إذا أتم المعنى."
                }
            ]
        },
        "inna_khabar_single_start": {
            "id": "inna_khabar_single_start",
            "type": "question",
            "context": "ثبت أن المحدد خبر الحرف الناسخ وليس جملة ولا شبه جملة. نميز الآن هل هو كلمة مفردة أم تركيب في تأويل اسم.",
            "text": "هل الخبر كلمة مفردة أم تركيب في تأويل اسم؟",
            "hint": "إذا أمكن تأويل التركيب بمصدر صريح، مثل «أن تنجح» = «نجاحك»، فهو مصدر مؤول ويعامل معاملة الاسم من حيث الوظيفة.",
            "answers": [
                {
                    "id": "word",
                    "text": "كلمة مفردة",
                    "next": "inna_khabar_single_inflection",
                    "eval": { "fact": "nounKind", "anyOf": ["mu3rab", "mabni", "connected_damir"] },
                    "hint": "إذا كان الخبر كلمة واحدة نحدد بعد ذلك هل هي معربة أم مبنية."
                },
                {
                    "id": "masdar",
                    "text": "تركيب في تأويل اسم",
                    "next": "inna_khabar_masdar_term",
                    "eval": { "fact": "nounKind", "equals": "masdar" },
                    "hint": "«أن تنجح» يمكن تأويلها بـ«نجاحك»؛ فقد ثبت أنها تركيب في تأويل اسم، ونحدد اسم هذا التركيب في الخطوة التالية."
                }
            ]
        },
        "inna_khabar_single_inflection": {
            "id": "inna_khabar_single_inflection",
            "type": "question",
            "context": "بما أن الخبر كلمة مفردة، نحدد هل الاسم معرب أم مبني قبل العلامة أو المحل.",
            "text": "هل الخبر اسم معرب أم اسم مبني؟",
            "hint": "المعرب تتغير علامته بحسب موقعه، أما المبني فيلزم صورة واحدة ويكون في محل رفع خبر الحرف الناسخ.",
            "answers": [
                {
                    "id": "mu3rab",
                    "text": "اسم معرب",
                    "next": "inna_khabar_single_number",
                    "eval": { "fact": "nounKind", "equals": "mu3rab" },
                    "hint": "إذا كان الخبر معربًا نبحث عن علامة الرفع: ضمة، ألف، واو، أو علامة مقدرة."
                },
                {
                    "id": "mabni",
                    "text": "اسم مبني",
                    "next": "inna_khabar_single_built",
                    "eval": { "fact": "nounKind", "anyOf": ["mabni", "connected_damir"] },
                    "hint": "الاسم المبني لا نقول مرفوع بالضمة؛ بل نقول: مبني في محل رفع خبر الحرف الناسخ."
                }
            ]
        },
        "inna_khabar_single_number": {
            "id": "inna_khabar_single_number",
            "type": "question",
            "context": "عرفنا أن الخبر المفرد معرب مرفوع، فنفحص صورته قبل اختيار علامة الرفع.",
            "text": "ما صورة خبر إن المفرد المعرب؟",
            "hint": "المقصود بالمفرد هنا أنه ليس جملة ولا شبه جملة. بعد ذلك نفحص هل هو مفرد/جمع تكسير، مثنى، جمع مذكر سالم، جمع مؤنث سالم، أو من الأسماء الخمسة.",
            "answers": [
                {
                    "id": "a",
                    "text": "مفرد أو جمع تكسير",
                    "next": "inna_khabar_single_ending",
                    "eval": {
                        "fact": "number",
                        "equals": "singular_or_jt"
                    },
                    "hint": "هنا نحتاج فحص آخر الكلمة لمعرفة الضمة الظاهرة أو المقدرة."
                },
                {
                    "id": "b",
                    "text": "مثنى",
                    "next": "R_inna_khabar_single_dual",
                    "eval": {
                        "fact": "number",
                        "equals": "dual"
                    },
                    "hint": "المثنى في الرفع تكون علامته الألف."
                },
                {
                    "id": "c",
                    "text": "جمع مذكر سالم",
                    "next": "R_inna_khabar_single_jms",
                    "eval": {
                        "fact": "number",
                        "equals": "jms"
                    },
                    "hint": "جمع المذكر السالم في الرفع تكون علامته الواو."
                },
                {
                    "id": "d",
                    "text": "جمع مؤنث سالم",
                    "next": "R_inna_khabar_single_jfs",
                    "eval": {
                        "fact": "number",
                        "equals": "jfs"
                    },
                    "hint": "علامة رفع جمع المؤنث السالم الضمة الظاهرة."
                },
                {
                    "id": "e",
                    "text": "من الأسماء الخمسة",
                    "next": "R_inna_khabar_single_five",
                    "eval": {
                        "fact": "number",
                        "equals": "five"
                    },
                    "hint": "الأسماء الخمسة ترفع بالواو إذا كانت مفردة، مكبرة، مضافة، ومضافة إلى غير ياء المتكلم، و«ذو» بمعنى صاحب، مثل: ذو فضل."
                }
            ]
        },
        "inna_khabar_single_ending": {
            "id": "inna_khabar_single_ending",
            "type": "question",
            "context": "بعد تحديد أن خبر إن مفرد أو جمع تكسير، ننظر إلى آخر الكلمة لنعرف هل الرفع ظاهر أم مقدر.",
            "text": "كيف نصف آخر خبر إن هنا؟",
            "hint": "الصحيح الآخر تظهر عليه الضمة. المقصور تقدر عليه الضمة للتعذر. والمنقوص تقدر عليه الضمة للثقل، وقد تحذف ياؤه إذا كان نكرة مثل: راضٍ.",
            "answers": [
                {
                    "id": "a",
                    "text": "صحيح الآخر",
                    "next": "R_inna_khabar_single_visible",
                    "eval": {
                        "fact": "ending",
                        "equals": "sahih"
                    },
                    "hint": "مثل: نشيطٌ، رجالٌ؛ تظهر الضمة على الآخر."
                },
                {
                    "id": "b",
                    "text": "مقصور آخره ألف لازمة",
                    "next": "R_inna_khabar_single_maqsur",
                    "eval": {
                        "fact": "ending",
                        "equals": "maqsur"
                    },
                    "hint": "مثل: أسمى؛ تقدر الضمة على الألف للتعذر."
                },
                {
                    "id": "c",
                    "text": "منقوص آخره ياء لازمة",
                    "next": "R_inna_khabar_single_manqous",
                    "eval": {
                        "fact": "ending",
                        "equals": "manqous"
                    },
                    "hint": "مثل: راضٍ أو القاضي؛ تقدر الضمة على الياء للثقل."
                }
            ]
        },
        "inna_khabar_single_built": {
            "id": "inna_khabar_single_built",
            "type": "question",
            "context": "عرفنا أن خبر إن اسم مبني، فنحدد نوعه من الكلمة الموجودة في المثال قبل المحل الإعرابي.",
            "text": "ما نوع هذا الاسم المبني الواقع خبرًا؟",
            "hint": "انظر إلى المحدد نفسه: هل هو ضمير مستقل مثل أنت؟ اسم إشارة مثل هذا؟ اسم موصول مثل من/الذي؟",
            "answers": [
                {
                    "id": "a",
                    "text": "ضمير منفصل",
                    "next": "R_inna_khabar_single_damir",
                    "eval": {
                        "fact": "mabniType",
                        "equals": "damir"
                    },
                    "hint": "مثل: إن المسؤولَ أنتَ؛ أنت ضمير منفصل وقع خبرًا."
                },
                {
                    "id": "b",
                    "text": "اسم إشارة",
                    "next": "R_inna_khabar_single_ishara",
                    "eval": {
                        "fact": "mabniType",
                        "equals": "ishara"
                    },
                    "hint": "مثل: إن الحلَّ هذا؛ هذا اسم إشارة وقع خبرًا."
                },
                {
                    "id": "c",
                    "text": "اسم موصول",
                    "next": "R_inna_khabar_single_mawsool",
                    "eval": {
                        "fact": "mabniType",
                        "equals": "mawsool"
                    },
                    "hint": "مثل: إن الفائزَ من صبر؛ من اسم موصول بمعنى الذي."
                }
            ]
        },
        "R_inna_khabar_single_visible": {
            "id": "R_inna_khabar_single_visible",
            "type": "result",
            "coverage": "inna_khabar_single.visible",
            "text": "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره."
        },
        "R_inna_khabar_single_maqsur": {
            "id": "R_inna_khabar_single_maqsur",
            "type": "result",
            "coverage": "inna_khabar_single.maqsur",
            "text": "خبر إن مرفوع وعلامة رفعه الضمة المقدرة على الألف منع من ظهورها التعذر."
        },
        "R_inna_khabar_single_manqous": {
            "id": "R_inna_khabar_single_manqous",
            "type": "result",
            "coverage": "inna_khabar_single.manqous",
            "text": "خبر إن مرفوع وعلامة رفعه الضمة المقدرة على الياء المحذوفة للثقل. ملاحظة: حذفت ياء الاسم المنقوص هنا لأنه نكرة مرفوعة، غير مضافة، وغير معرفة بـ«أل»."
        },
        "R_inna_khabar_single_dual": {
            "id": "R_inna_khabar_single_dual",
            "type": "result",
            "coverage": "inna_khabar_single.dual",
            "text": "خبر إن مرفوع وعلامة رفعه الألف لأنه مثنى."
        },
        "R_inna_khabar_single_jms": {
            "id": "R_inna_khabar_single_jms",
            "type": "result",
            "coverage": "inna_khabar_single.jms",
            "text": "خبر إن مرفوع وعلامة رفعه الواو لأنه جمع مذكر سالم."
        },
        "R_inna_khabar_single_jfs": {
            "id": "R_inna_khabar_single_jfs",
            "type": "result",
            "coverage": "inna_khabar_single.jfs",
            "text": "خبر إن مرفوع وعلامة رفعه الضمة الظاهرة على آخره لأنه جمع مؤنث سالم."
        },
        "R_inna_khabar_single_five": {
            "id": "R_inna_khabar_single_five",
            "type": "result",
            "coverage": "inna_khabar_single.five",
            "text": "خبر إن مرفوع وعلامة رفعه الواو لأنه من الأسماء الخمسة، وقد استوفى شروط إعرابها بالحروف: مفرد، مكبر، مضاف، ومضاف إلى غير ياء المتكلم."
        },
        "R_inna_khabar_single_damir": {
            "id": "R_inna_khabar_single_damir",
            "type": "result",
            "coverage": "inna_khabar_single.damir",
            "text": "ضمير منفصل مبني في محل رفع خبر إن."
        },
        "R_inna_khabar_single_ishara": {
            "id": "R_inna_khabar_single_ishara",
            "type": "result",
            "coverage": "inna_khabar_single.ishara",
            "text": "اسم إشارة مبني في محل رفع خبر إن."
        },
        "R_inna_khabar_single_mawsool": {
            "id": "R_inna_khabar_single_mawsool",
            "type": "result",
            "coverage": "inna_khabar_single.mawsool",
            "text": "اسم موصول مبني في محل رفع خبر إن، وجملة الصلة بعده لا محل لها من الإعراب."
        },
        "inna_khabar_masdar_term": {
            "id": "inna_khabar_masdar_term",
            "type": "question",
            "context": "ثبت أن الخبر تركيب يمكن تأويله بمصدر صريح؛ نحدد الآن المصطلح النحوي.",
            "text": "ماذا يسمى هذا التركيب؟",
            "hint": "التركيب الذي يؤول بمصدر صريح يسمى مصدرًا مؤولًا، ويكون هنا في محل رفع خبر الحرف الناسخ.",
            "answers": [
                { "id": "source", "text": "مصدر مؤول", "next": "R_inna_khabar_single_masdar", "correct": true },
                { "id": "sentence", "text": "جملة فعلية مستقلة", "next": "inna_khabar_masdar_term", "correct": false, "hint": "وجود الفعل داخل التركيب لا يجعله خبر جملة مستقلًا إذا سبقه حرف مصدري وأمكن تأويل التركيب بمصدر صريح." }
            ]
        },
        "R_inna_khabar_single_masdar": {
            "id": "R_inna_khabar_single_masdar",
            "type": "result",
            "coverage": "inna_khabar_single.masdar",
            "text": "مصدر مؤول في محل رفع خبر إن."
        },
        "inna_khabar_sentence_type": {
            "id": "inna_khabar_sentence_type",
            "type": "question",
            "context": "الخبر هنا جملة كاملة، لا كلمة واحدة. الجملة كلها هي الخبر في محل رفع.",
            "text": "هل بدأت جملة خبر إن باسم أم بفعل؟",
            "hint": "إذا بدأ الخبر بفعل فهو جملة فعلية. وإذا بدأ باسم وله خبر داخلي فهو جملة اسمية. لا تعرب كلمة واحدة فقط وتترك بقية الجملة.",
            "answers": [
                {
                    "id": "a",
                    "text": "جملة فعلية",
                    "next": "R_inna_khabar_verbal_sentence",
                    "eval": {
                        "fact": "sentenceType",
                        "equals": "verbal"
                    },
                    "hint": "مثل: إن الطالبَ يقرأُ؛ جملة يقرأ خبر إن."
                },
                {
                    "id": "b",
                    "text": "جملة اسمية",
                    "next": "R_inna_khabar_nominal_sentence",
                    "eval": {
                        "fact": "sentenceType",
                        "equals": "nominal"
                    },
                    "hint": "مثل: إن الطالبَ أخلاقُه حسنةٌ؛ الجملة الاسمية كلها خبر إن."
                }
            ]
        },
        "R_inna_khabar_verbal_sentence": {
            "id": "R_inna_khabar_verbal_sentence",
            "type": "result",
            "coverage": "inna_khabar.verbal_sentence",
            "text": "جملة فعلية في محل رفع خبر إن. نُعرب داخلها الفعل والفاعل، ثم نحكم على الجملة كلها بأنها خبر."
        },
        "R_inna_khabar_nominal_sentence": {
            "id": "R_inna_khabar_nominal_sentence",
            "type": "result",
            "coverage": "inna_khabar.nominal_sentence",
            "text": "جملة اسمية في محل رفع خبر إن. نُعرب داخلها المبتدأ والخبر الداخليين، ثم نحكم على الجملة كلها بأنها خبر."
        },
        "inna_khabar_shibh_type": {
            "id": "inna_khabar_shibh_type",
            "type": "question",
            "context": "الخبر هنا شبه جملة، أي تركيب من جار ومجرور أو ظرف. نحدد نوعه قبل الحكم النهائي.",
            "text": "ما نوع شبه الجملة الواقعة خبرًا؟",
            "hint": "الجار والمجرور يبدأ بحرف جر مثل: في، على، من. والظرف يدل غالبًا على زمان أو مكان مثل: عند، أمام، غدًا. لذلك فـ(غدًا) في: ليت اللقاء غدًا ظرف زمان، ويعامل كشبه جملة خبرية لا خبرًا مفردًا.",
            "answers": [
                {
                    "id": "a",
                    "text": "جار ومجرور",
                    "next": "inna_khabar_shibh_position_jar",
                    "eval": {
                        "fact": "shibhType",
                        "equals": "jar"
                    },
                    "hint": "مثل: في الحقيبة، على الطاولة."
                },
                {
                    "id": "b",
                    "text": "ظرف",
                    "next": "inna_khabar_shibh_position_zarf",
                    "eval": {
                        "fact": "shibhType",
                        "equals": "zarf"
                    },
                    "hint": "مثل: عندنا، أمامك، غدًا."
                }
            ]
        },
        "inna_khabar_shibh_position_jar": {
            "id": "inna_khabar_shibh_position_jar",
            "type": "question",
            "context": "عرفنا أن الخبر جار ومجرور. الآن ننظر إلى ترتيبه: هل جاء بعد اسم إن، أم تقدم وجاء بعده اسم نكرة منصوب؟",
            "text": "هل تقدم الجار والمجرور على اسم نكرة مثل: إن في البيت رجلًا؟",
            "hint": "إذا جاء بعد إن مباشرة جار ومجرور ثم اسم نكرة منصوب، فشبه الجملة خبر إن مقدم، والاسم النكرة اسم إن مؤخر. سبب التقديم هنا أن الخبر شبه جملة جاء قبل الاسم النكرة للدلالة على مكان وجود الاسم وتجنب البدء بالنكرة دون مسوّغ.",
            "answers": [
                {
                    "id": "a",
                    "text": "نعم، تقدم على اسم نكرة",
                    "next": "R_inna_khabar_jar_advanced",
                    "eval": {
                        "fact": "shibhPosition",
                        "equals": "advanced"
                    },
                    "hint": "في هذا التركيب ننتبه للتقديم: في البيت خبر إن مقدم، ورجلًا اسم إن مؤخر."
                },
                {
                    "id": "b",
                    "text": "لا، جاء بعد اسم إن",
                    "next": "R_inna_khabar_jar",
                    "eval": {
                        "fact": "shibhPosition",
                        "equals": "normal"
                    },
                    "hint": "إذا سبق شبه الجملة اسم إن منصوب مثل الكتابَ، فشبه الجملة خبر إن عادي."
                }
            ]
        },
        "inna_khabar_shibh_position_zarf": {
            "id": "inna_khabar_shibh_position_zarf",
            "type": "question",
            "context": "عرفنا أن الخبر ظرف. الآن ننظر إلى ترتيبه: هل جاء بعد اسم إن، أم تقدم وجاء بعده اسم نكرة منصوب؟",
            "text": "هل تقدم الظرف على اسم نكرة مثل: إن عندنا ضيفًا؟",
            "hint": "إذا جاء بعد إن مباشرة ظرف ثم اسم نكرة منصوب، فالظرف خبر إن مقدم، والاسم النكرة اسم إن مؤخر. سبب التقديم هنا أن الخبر الظرفي جاء قبل الاسم النكرة للدلالة على زمان أو مكان وجود الاسم وتجنب البدء بالنكرة دون مسوّغ.",
            "answers": [
                {
                    "id": "a",
                    "text": "نعم، تقدم على اسم نكرة",
                    "next": "R_inna_khabar_zarf_advanced",
                    "eval": {
                        "fact": "shibhPosition",
                        "equals": "advanced"
                    },
                    "hint": "في هذا التركيب: عندنا خبر إن مقدم، وضيفًا اسم إن مؤخر."
                },
                {
                    "id": "b",
                    "text": "لا، جاء بعد اسم إن",
                    "next": "R_inna_khabar_zarf",
                    "eval": {
                        "fact": "shibhPosition",
                        "equals": "normal"
                    },
                    "hint": "إذا سبق الظرف اسم إن منصوب مثل اللقاءَ، فالظرف خبر إن عادي."
                }
            ]
        },
        "R_inna_khabar_jar": {
            "id": "R_inna_khabar_jar",
            "type": "result",
            "coverage": "inna_khabar.jar",
            "text": "شبه جملة من الجار والمجرور في محل رفع خبر إن."
        },
        "R_inna_khabar_zarf": {
            "id": "R_inna_khabar_zarf",
            "type": "result",
            "coverage": "inna_khabar.zarf",
            "text": "شبه جملة ظرفية في محل رفع خبر إن."
        },
        "R_inna_khabar_jar_advanced": {
            "id": "R_inna_khabar_jar_advanced",
            "type": "result",
            "coverage": "inna_khabar.jar_advanced",
            "text": "شبه جملة من الجار والمجرور في محل رفع خبر إن مقدم، والاسم النكرة بعدها اسم إن مؤخر منصوب. قُدّم الخبر لأن شبه الجملة سبق اسمًا نكرة، فصار التقديم مسوّغًا ومفيدًا للدلالة على مكان وجود الاسم."
        },
        "R_inna_khabar_zarf_advanced": {
            "id": "R_inna_khabar_zarf_advanced",
            "type": "result",
            "coverage": "inna_khabar.zarf_advanced",
            "text": "شبه جملة ظرفية في محل رفع خبر إن مقدم، والاسم النكرة بعدها اسم إن مؤخر منصوب. قُدّم الخبر لأن الظرف سبق اسمًا نكرة، فصار التقديم مسوّغًا ومفيدًا للدلالة على مكان وجود الاسم."
        }
    }
};

