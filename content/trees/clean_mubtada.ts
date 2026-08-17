import type { ExerciseTree } from "../../lib/exercise/model";

export const cleanMubtadaTree: ExerciseTree = {
    "startNodeId": "mubtada_word_type",
    "nodes": {
        "mubtada_word_type": {
            "id": "mubtada_word_type",
            "type": "question",
            "context": "نبدأ من المحدد نفسه قبل الحكم على وظيفته في الجملة.",
            "text": "ما نوع المحدد؟",
            "hint": "إن كان المحدد كلمة تدل على مسمّى أو معنى بلا زمن فهو اسم. وإن كان تركيبًا مثل «أن + فعل» ويمكن تأويله بمصدر صريح، فهو تركيب في تأويل اسم. أما الفعل فيدل على حدث وزمن، والحرف لا يستقل معناه كاملًا.",
            "answers": [
                { "id": "a", "text": "اسم", "next": "mubtada_function_gate", "eval": { "fact": "nounKind", "anyOf": ["mu3rab", "mabni"] } },
                { "id": "d", "text": "تركيب في تأويل اسم", "next": "mubtada_function_gate", "eval": { "fact": "nounKind", "equals": "masdar" }, "hint": "جرّب أن تستبدل التركيب بمصدر صريح يؤدي معناه؛ مثل: «أن تتعلم» ← «تعلّمك»." },
                { "id": "b", "text": "فعل", "next": "mubtada_word_type", "correct": false },
                { "id": "c", "text": "حرف", "next": "mubtada_word_type", "correct": false }
            ]
        },
        "mubtada_function_gate": {
            "id": "mubtada_function_gate",
            "type": "question",
            "context": "ثبت أن المحدد اسم أو تركيب في تأويل اسم؛ والآن نربط ذلك بموقعه في بداية الكلام.",
            "text": "ما دور المحدد في هذه الجملة؟",
            "hint": "إذا بدأنا بالمحدد الكلام وبدأنا الحديث عنه، فهو يؤدي وظيفة المبتدأ. لا تنتقل إلى العلامة قبل تثبيت هذه الوظيفة.",
            "answers": [
                { "id": "a", "text": "بدأنا به الكلام وبدأنا الحديث عنه", "next": "mubtada_start", "nextByFact": { "fact": "nounKind", "map": { "masdar": "mubtada_masdar_term" }, "default": "mubtada_start" }, "correct": true },
                { "id": "b", "text": "هي التي قامت بالفعل", "next": "mubtada_function_gate", "correct": false, "hint": "هذا مسار الفاعل. الفاعل نبحث عنه بعد فعل ونسأل: من فعل؟ أما هنا فالاسم المحدد بدأنا الحديث عنه. عد للسؤال وانقر على الإجابة الصحيحة لنكمل الإعراب." },
                { "id": "c", "text": "وقع عليها الفعل", "next": "mubtada_function_gate", "correct": false, "hint": "هذا مسار المفعول به، والمفعول به يحتاج فعلًا وقع عليه. في هذا المثال الاسم المحدد بدأ به الكلام، فهو المرشح لوظيفة المبتدأ. عد للسؤال وانقر على الإجابة الصحيحة لنكمل الإعراب." }
            ]
        },
        "mubtada_masdar_term": {
            "id": "mubtada_masdar_term",
            "type": "question",
            "context": "ثبت أن المحدد تركيب في تأويل اسم وبدأنا به الكلام وبدأنا الحديث عنه؛ نحدد الآن اسم هذا التركيب.",
            "text": "ماذا يسمى التركيب الذي يمكن تأويله بمصدر صريح؟",
            "hint": "مثل «أن تتعلم» = «تعلّمك». هذا التركيب يسمى مصدرًا مؤولًا، ويأخذ موقع الاسم في الجملة.",
            "answers": [
                { "id": "source", "text": "مصدر مؤول", "next": "R_mubtada_masdar", "correct": true },
                { "id": "word", "text": "اسم مفرد معرب", "next": "mubtada_masdar_term", "correct": false, "hint": "المحدد تركيب كامل لا كلمة مفردة، وقد ثبت أنه يؤول بمصدر صريح." }
            ]
        },
        "mubtada_start": {
            "id": "mubtada_start",
            "type": "question",
            "context": "بما أن المحدد اسم بدأنا به الكلام وبدأنا الحديث عنه، فهو مبتدأ. نحدد الآن هل الاسم معرب أم مبني.",
            "text": "هل المبتدأ اسم معرب أم اسم مبني؟",
            "hint": "الاسم المعرب تتغير علامة آخره بتغير موقعه، أما الاسم المبني فيلزم صورة واحدة ويعرب في محل. المصدر المؤول لا يدخل في هذا السؤال لأنه تركيب في تأويل اسم وقد سلك مساره الخاص.",
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
            ]
        },
        "mubtada_built": {
            "id": "mubtada_built",
            "type": "question",
            "context": "عرفنا أن المبتدأ هنا اسم مبني؛ لذلك لا نبحث عن ضمة أو ألف أو واو، بل نحدد نوعه ثم نعربه في محل رفع.",
            "text": "ما نوع هذا الاسم المبني؟",
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
            "text": "ما صورة الاسم التي تحدد علامة رفعه؟",
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
            "text": "ما حالة آخر الاسم؟",
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
            "text": "مبتدأ مرفوع وعلامة رفعه الضمة المقدرة على الألف منع من ظهورها التعذر."
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
            "text": "مبتدأ مرفوع وعلامة رفعه الواو لأنه من الأسماء الخمسة، وقد تحققت شروط إعرابها بالحروف: أن تكون مفردة، مكبرة، مضافة، وغير مضافة إلى ياء المتكلم، وأن تكون (ذو) بمعنى صاحب إذا وردت."
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
            "text": "كم خبرية مبنية على السكون في محل رفع مبتدأ."
        },
        "R_mubtada_masdar": {
            "id": "R_mubtada_masdar",
            "type": "result",
            "coverage": "mubtada.masdar",
            "text": "مصدر مؤول في محل رفع مبتدأ."
        }
    }
};

