import type { PedagogyNode, PedagogyState } from "./ExercisePedagogyTypes";
import {
    kanaKhabarFromSentence,
    kanaKhabarRelationLabel,
    kanaNasikhPrompt,
    kanaNasikhSubjectChoice,
    kanaNasikhSubjectQuestion,
    kanaNasikhVerb,
    kanaSubjectFromSentence,
} from "./KanaPedagogyLanguage";

export function customKanaPedagogyNode(node: PedagogyNode | null | undefined, state: PedagogyState): PedagogyNode | null {
    if (!node || node.type !== "question")
        return null;
    const id = String(node.id || "");
    if (!id.startsWith("kana"))
        return null;
    const facts = state?.facts || {};
    const target = String(state?.currentTarget || "المحدد");
    const sentence = String(state?.currentSentence || "");
    const role = String(facts.targetRole || "");
    const nounKind = String(facts.nounKind || "");
    const mabniType = String(facts.mabniType || "");
    const khabarKind = String(facts.khabarKind || "");
    const sentenceType = String(facts.sentenceType || "");
    const shibhType = String(facts.shibhType || "");
    const shibhPosition = String(facts.shibhPosition || "");
    const ending = String(facts.ending || "");
    const number = String(facts.number || "");
    const subject = kanaSubjectFromSentence(sentence, target);
    const khabar = kanaKhabarFromSentence(sentence, target);
    const nasikh = kanaNasikhVerb(sentence);
    const who = kanaNasikhPrompt(sentence);
    let semanticSubject = subject !== "الاسم الذي تتحدث عنه الجملة" ? subject : "صاحب المعنى";
    let hiddenPronoun = "ضمير مستتر تقديره هو";
    if (sentence.includes("أسماء") || sentence.includes("أختي"))
        hiddenPronoun = "ضمير مستتر تقديره هي";
    const returnToThis = id || "kana_target";
    if (id === "kana_hidden_ism_site") {
        return {
            ...node,
            context: `عرفنا أن المعنى يعود إلى (${semanticSubject})، والآن نحدد الموقع الإعرابي بعد (${nasikh}).`,
            text: `هل ظهر بعد (${nasikh}) اسم صريح، أم نفهم اسم الناسخ من السياق؟`,
            hint: `افحص الجملة كلها بعد (${nasikh}). قد يأتي اسم الناسخ متأخرًا بعد خبر مقدم؛ فإذا لم يظهر اسم صريح يصلح أن يكون اسمه، وكان المعنى عائدًا على (${semanticSubject})، نقدّر بعد الفعل ضميرًا مستترًا يعود عليه.`,
            answers: [
                { id: "a", text: "ظهر بعد الناسخ اسم صريح يصلح أن يكون اسمه", next: "kana_hidden_ism_site", correct: false, hint: `افحص ما بعد (${nasikh}) حتى نهاية الجملة: هل يوجد اسم صريح يصلح أن يكون اسم الناسخ، ولو جاء بعد خبر مقدم؟` },
                { id: "b", text: "لم يظهر اسم صريح، وفهمناه من السياق", next: "kana_hidden_ism_estimate", correct: true },
            ],
        };
    }
    if (id === "kana_hidden_ism_estimate") {
        const feminine = hiddenPronoun.includes("هي");
        return {
            ...node,
            context: `بما أن اسم الناسخ غير ظاهر بعد (${nasikh}) نقدره بضمير يعود على (${semanticSubject}).`,
            text: `ما تقدير الضمير المستتر هنا؟`,
            hint: `نقدّر الضمير بحسب الاسم الذي يعود عليه: مذكر ← هو، مؤنث ← هي.`,
            answers: [
                { id: "a", text: "هو", next: "R_kana_ism_hidden_damir", correct: !feminine, hint: feminine ? `الضمير يعود على اسم مؤنث هنا، فالأدق تقديره: هي.` : undefined },
                { id: "b", text: "هي", next: "R_kana_ism_hidden_damir", correct: feminine, hint: feminine ? undefined : `الضمير يعود على اسم مذكر هنا، فالأدق تقديره: هو.` },
            ],
        };
    }
    if (id === "kana_ism_start") {
        return {
            ...node,
            context: `عرفنا من معنى الجملة أن (${target}) هو اسم (${nasikh}). الآن نحدد طبيعته قبل علامة الرفع.`,
            text: `ما نوع اسم (${nasikh}) «${target}»؟`,
            hint: `افحص (${target}) نفسها: الاسم المعرب تتغير علامته، والاسم المبني يلزم صورة واحدة، والمصدر المؤول تركيب من حرف مصدري وفعل يؤول باسم.`,
        };
    }
    if (id === "kana_ism_built") {
        return {
            ...node,
            context: `عرفنا أن (${target}) اسم مبني في موقع اسم (${nasikh}). بقي أن نحدد نوع المبني.`,
            text: `ما نوع الاسم المبني «${target}»؟`,
            hint: `هل يدل على متكلم أو مخاطب أو غائب فيكون ضميرًا؟ أم يدل بالإشارة؟ أم يحتاج صلة بعده فيكون اسمًا موصولًا؟`,
        };
    }
    if (id === "kana_ism_number") {
        return {
            ...node,
            context: `عرفنا أن (${target}) اسم (${nasikh}) معرب مرفوع. نحدد صورته حتى نختار علامة الرفع.`,
            text: `ما صورة اسم (${nasikh}) «${target}»؟`,
            hint: `انظر إلى (${target}): أهي مفرد أو جمع تكسير، أم جمع مذكر سالم، أم من الأسماء الخمسة؟ الصورة هي التي تحدد العلامة.`,
        };
    }
    if (id === "kana_ism_ending") {
        return {
            ...node,
            context: `عرفنا صورة (${target})، والآن نفحص آخر الاسم بعد فصل أي ضمير متصل.`,
            text: `ما حالة آخر اسم (${nasikh}) «${target}»؟`,
            hint: `لا تعدّ ياء المتكلم حرفًا أصليًا من الاسم. افصل الضمير أولًا، ثم احكم: صحيح الآخر أم معتل الآخر؟`,
        };
    }
    if (id === "kana_khabar_single_number") {
        return {
            ...node,
            context: `عرفنا أن (${target}) خبر (${nasikh}) مفرد معرب منصوب. نحدد صورته لاختيار علامة النصب.`,
            text: `ما صورة خبر (${nasikh}) «${target}»؟`,
            hint: `الصورة تحدد العلامة: المفرد وجمع التكسير ينصبان بالفتحة، والمثنى وجمع المذكر السالم بالياء، وجمع المؤنث السالم بالكسرة.`,
        };
    }
    if (id === "kana_damir_name") {
        return {
            ...node,
            context: `عرفنا أن (${target}) تدل على صاحب معنى (${nasikh}). الآن نسمي هذا النوع من الأسماء.`,
            text: `ما الاسم النحوي لما دل على متكلم أو مخاطب أو غائب؟`,
        };
    }
    if (id === "kana_damir_connected") {
        return {
            ...node,
            context: `عرفنا أن (${target}) ضمير. نحدد الآن هل اتصل بالفعل الناسخ أم جاء منفصلًا.`,
            text: `هل الضمير «${target}» متصل بـ(${nasikh}) أم منفصل؟`,
        };
    }
    if (id === "kana_damir_site") {
        return {
            ...node,
            context: `عرفنا أن (${target}) ضمير متصل دل على صاحب المعنى بعد (${nasikh}).`,
            text: `ما موقع الضمير «${target}» في باب كان وأخواتها؟`,
        };
    }
    if (id === "kana_masdar_name") {
        return {
            ...node,
            context: `استطعنا تأويل (${target}) باسم، مثل: أن أتميز = تميزي.`,
            text: `ماذا يسمى تركيب الحرف المصدري مع الفعل؟`,
        };
    }
    if (id === "kana_masdar_site") {
        return {
            ...node,
            context: `عرفنا أن (${target}) مصدر مؤول، ونحدد الآن وظيفته بالنسبة إلى اسم (${nasikh}).`,
            text: `ما موقع المصدر المؤول «${target}» في الجملة؟`,
        };
    }
    if (id === "kana_connected_pronoun_i3rab") {
        const pronounLabel = target.includes("واو") ? "الواو في (انفكوا)" : target;
        return {
            ...node,
            context: `عرفنا صاحب المعنى في الجملة، والآن نحدد العنصر الذي شغل موقع اسم الفعل الناسخ في الإعراب.`,
            text: `أيهما نعرب اسمًا للفعل الناسخ؟ اختر الإجابة الصحيحة مما يلي:`,
            hint: `إذا سبق الفعلَ الناسخ اسمٌ ظاهر وعاد عليه ضمير داخل الفعل، فالمعنى يعود إلى الاسم الظاهر، أما الموقع الإعرابي فيشغله ذلك الضمير.`,
            answers: [
                { id: "a", text: pronounLabel, next: "R_kana_ism_damir", correct: true },
                { id: "b", text: semanticSubject, next: "kana_connected_pronoun_i3rab", correct: false, hint: `صحيح أن المعنى يعود إلى (${semanticSubject})، لكنه ليس اسم الفعل الناسخ في الإعراب؛ الذي شغل الموقع هو ${pronounLabel}.` },
            ],
        };
    }
    if (id === "kana_khabar_nominal_starter") {
        return {
            ...node,
            context: `عرفنا أن (${target}) تركيب أتم معنى الجملة عن (${subject}).`,
            text: `هل يبدأ هذا التركيب باسم أم بفعل؟ اختر الإجابة الصحيحة مما يلي:`,
            hint: `انظر إلى أول كلمة في (${target}) نفسها؛ لا نبدأ بتعريف نحوي مجرد.`,
            answers: [
                { id: "a", text: "يبدأ باسم", next: "R_kana_khabar_nominal_sentence", correct: true },
                { id: "b", text: "يبدأ بفعل", next: "kana_khabar_nominal_starter", correct: false, hint: `راجع أول كلمة في (${target}): هل هي اسم أم فعل؟` },
            ],
        };
    }
    if (id === "kana_target") {
        // اسم الناسخ المستتر: الخيارات تكون بين الاسم المتقدم والضمير المستتر، ثم يشرح التلميح سبب عدم إعراب الاسم المتقدم اسمًا للناسخ.
        if (role === "hidden_ism") {
            return {
                ...node,
                context: `في الجملة: «${sentence}» نبدأ بالمعنى ثم ننتقل إلى موقع الإعراب.`,
                text: `أيُّ اسم هو صاحب معنى (${nasikh}) في الجملة؟ اختر الإجابة الصحيحة مما يلي:`,
                hint: `ابدأ بصاحب المعنى، ثم افحص الجملة كلها بعد الفعل الناسخ: إن لم يظهر اسم صريح يصلح أن يكون اسمه فالموقع الإعرابي يشغله ضمير مستتر يعود على الاسم المتقدم.`,
                answers: [
                    { id: "a", text: semanticSubject, next: "kana_hidden_ism_site", correct: true },
                    { id: "b", text: hiddenPronoun, next: "kana_target", correct: false, hint: `هذا هو الإعراب النهائي لاحقًا، لكننا لا نقفز إليه الآن. أولًا حدّد: من صاحب المعنى في الجملة؟` },
                ],
            };
        }
        // الضمير المتصل في الناسخ: نبدأ بصاحب المعنى، ثم ننتقل إلى الضمير الذي شغل الموقع.
        if (role === "ism" && nounKind === "mabni" && mabniType === "damir" && !target.includes("ت")) {
            const connectedQuestion = target.includes("واو")
                ? "من الذين ما انفكوا يتناوبون على العمل؟ اختر الإجابة الصحيحة مما يلي:"
                : `${who} ${nasikh}؟ اختر الإجابة الصحيحة مما يلي:`;
            return {
                ...node,
                context: `في الجملة: «${sentence}» نبدأ بصاحب المعنى ثم نصل إلى الضمير المتصل بالفعل الناسخ.`,
                text: connectedQuestion,
                hint: `ابدأ بالمعنى فقط، ثم انتبه إلى الضمير المتصل بالفعل الناسخ.`,
                answers: [
                    { id: "a", text: semanticSubject, next: "kana_connected_pronoun_i3rab", correct: true },
                    { id: "b", text: target, next: "kana_target", correct: false, hint: `(${target}) هو الضمير الذي سنصل إليه إعرابيًا، لكن ابدأ أولًا بصاحب المعنى في الجملة.` },
                ],
            };
        }
        // تاء الفاعل في كان: لا نسميها ضميرًا قبل اكتشاف دلالتها. ولا يعمل هذا القالب إلا إذا كانت التاء هي المحددة فعلًا.
        if (role === "ism" && nounKind === "mabni" && mabniType === "damir" && target.includes("ت")) {
            return {
                ...node,
                context: `في الجملة: «${sentence}» نكتشف دلالة التاء قبل أن نسميها.`,
                text: "على من تدل التاء؟ اختر الإجابة الصحيحة مما يلي:",
                hint: "اسأل: هل المتكلم هو الذي كان؟ أم المخاطب؟ أم الغائب؟",
                answers: [
                    { id: "a", text: "المتكلم", next: "kana_damir_name", correct: true },
                    { id: "b", text: "المخاطب", next: "kana_target", correct: false, hint: "في (كنتُ) التاء تدل على المتكلم: أنا كنتُ." },
                    { id: "c", text: "الغائب", next: "kana_target", correct: false, hint: "الغائب يكون مثل: هو/هي. أما التاء في (كنتُ) فتدل على المتكلم." },
                    { id: "d", text: "لا تدل على أحد، فهي علامة فقط", next: "kana_target", correct: false, hint: "هذه ليست تاء تأنيث ساكنة؛ إنها تاء تدل على المتكلم في (كنتُ)." },
                ],
            };
        }
        // اسم الناسخ الظاهر: الخياران من ألفاظ المثال لا من تعريفات نحوية.
        if (role === "ism") {
            return {
                ...node,
                context: `في الجملة: «${sentence}» نبدأ من المعنى لا من التعريف.`,
                text: kanaNasikhSubjectQuestion(nasikh, khabar, target),
                hint: "ابحث عن الاسم الذي تتحدث عنه الجملة، ولا تختر الكلمة التي جاءت لتكمل المعنى عنه.",
                answers: [
                    { id: "a", text: target, next: "kana_ism_start", correct: true },
                    { id: "b", text: khabar, next: "kana_target", correct: false, hint: `(${khabar}) هي التي أتمت المعنى عن (${target})، وليست هي صاحبة معنى (${nasikh}).` },
                ],
            };
        }
        // الخبر بأنواعه: يبدأ دائمًا من الكلمة المحددة، ولا ينتقل إلى اسم الناسخ.
        if (role === "khabar") {
            return {
                ...node,
                context: `في الجملة: «${sentence}» نركز على الكلمة أو التركيب المحدد فقط.`,
                text: `ما علاقة (${target}) بـ(${subject})؟ اختر الإجابة الصحيحة مما يلي:`,
                hint: `اسأل نفسك: ماذا أضافت (${target}) إلى معنى الجملة؟`,
                answers: [
                    { id: "a", text: kanaKhabarRelationLabel(target, subject), next: "kana_khabar_entry", correct: true },
                    { id: "b", text: kanaNasikhSubjectChoice(nasikh, target), next: "kana_target", correct: false, hint: `هذا الاختيار يخص الاسم الذي دار عليه معنى الناسخ، أما (${target}) فقد أتمت معنى الجملة عن (${subject}).` },
                ],
            };
        }
    }
    if (id === "kana_khabar_entry") {
        // بعد اكتشاف وظيفة الخبر لا نعرض كل صور الأخبار دفعة واحدة، بل نسأل داخل فرع الخبر نفسه.
        if (khabarKind === "shibh") {
            return {
                ...node,
                context: `عرفنا أن (${target}) أتمت معنى الجملة عن (${subject}).`,
                text: `ما صورة (${target}) في الجملة؟ اختر الإجابة الصحيحة مما يلي:`,
                hint: `انظر إلى (${target}) نفسها: هل بدأت بحرف جر، أم كانت ظرفًا يدل على زمان أو مكان؟ حينها تكون شبه جملة.`,
                answers: [
                    { id: "a", text: "اسم", next: "kana_khabar_entry", correct: false, hint: `(${target}) ليست اسمًا مفردًا؛ إنها تركيب مثل: في الحقيبة أو عند المدير.` },
                    { id: "b", text: "فعل يدل على حدث وزمن", next: "kana_khabar_entry", correct: false, hint: `لا يوجد فعل في (${target})؛ انظر هل هي جار ومجرور أو ظرف.` },
                    { id: "c", text: "شبه جملة", next: "kana_khabar_shibh_type", correct: true },
                ],
            };
        }
        if (nounKind === "masdar") {
            return {
                ...node,
                context: `عرفنا أن (${target}) أتمت معنى الجملة عن (${subject}).`,
                text: `هل يمكن أن يؤول (${target}) باسم؟ اختر الإجابة الصحيحة مما يلي:`,
                hint: "انظر هل بدأ التركيب بحرف مصدري مثل (أن)، ثم جرّب تأويله باسم.",
                answers: [
                    { id: "a", text: "نعم، يؤول باسم", next: "kana_masdar_name", correct: true },
                    { id: "b", text: "لا، هو اسم ظاهر مفرد", next: "kana_khabar_entry", correct: false, hint: `(${target}) تركيب من حرف مصدري وفعل، وليس اسمًا ظاهرًا مفردًا.` },
                ],
            };
        }
        if (sentenceType === "verbal") {
            return {
                ...node,
                context: `عرفنا أن (${target}) أتمت معنى الجملة عن (${subject}).`,
                text: `ما صورة (${target}) في الجملة؟ اختر الإجابة الصحيحة مما يلي:`,
                hint: `انظر إلى أول كلمة في (${target}): إذا بدأت بفعل ومعه فاعل ظاهر أو مستتر فهي جملة فعلية.`,
                answers: [
                    { id: "a", text: "اسم", next: "kana_khabar_entry", correct: false, hint: `(${target}) ليس اسمًا؛ بل يدل على حدث وزمن.` },
                    { id: "b", text: "فعل يدل على حدث وزمن", next: "R_kana_khabar_verbal_sentence", correct: true },
                    { id: "c", text: "شبه جملة", next: "kana_khabar_entry", correct: false, hint: `شبه الجملة تكون جارًا ومجرورًا أو ظرفًا، أما (${target}) فهو فعل.` },
                ],
            };
        }
        if (sentenceType === "nominal") {
            return {
                ...node,
                context: `عرفنا أن (${target}) أتمت معنى الجملة عن (${subject}).`,
                text: `هل (${target}) كلمة واحدة أم تركيب من أكثر من كلمة؟ اختر الإجابة الصحيحة مما يلي:`,
                hint: "انظر إلى الجزء المحدد كما هو في المثال: هل هو كلمة واحدة، أم أكثر من كلمة؟",
                answers: [
                    { id: "a", text: "كلمة واحدة", next: "kana_khabar_entry", correct: false, hint: `(${target}) ليس كلمة واحدة؛ إنه تركيب من أكثر من كلمة.` },
                    { id: "b", text: "تركيب من أكثر من كلمة", next: "kana_khabar_nominal_starter", correct: true },
                ],
            };
        }
        return {
            ...node,
            context: `عرفنا أن (${target}) أتمت معنى الجملة عن (${subject}).`,
            text: `هل الخبر هنا مفرد، أم جملة أو شبه جملة؟ اختر الإجابة الصحيحة مما يلي:`,
            hint: "المفرد النحوي لا يعني دائمًا كلمة واحدة فقط؛ فقد يأتي معه نعت أو مضاف إليه أو تابع، ما دام ليس جملة ولا شبه جملة.",
            answers: [
                { id: "a", text: "خبر مفرد", next: "kana_khabar_single_start", correct: true },
                { id: "b", text: "جملة أو شبه جملة", next: "kana_khabar_entry", correct: false, hint: `(${target}) هنا خبر مفرد؛ لأنه ليس جملة ولا شبه جملة. وقد يبقى الخبر مفردًا ولو جاء معه نعت أو مضاف إليه أو تابع.` },
            ],
        };
    }
    if (id === "kana_khabar_single_start") {
        if (nounKind === "masdar") {
            return {
                ...node,
                context: `عرفنا أن (${target}) أتمت المعنى عن (${subject}) وأنه يؤول باسم.`,
                text: `ماذا يسمى هذا التركيب؟ اختر الإجابة الصحيحة مما يلي:`,
                hint: "المصدر المؤول تركيب من حرف مصدري وفعل ويؤول باسم.",
                answers: [
                    { id: "a", text: "مصدر مؤول", next: "R_kana_khabar_single_masdar", correct: true },
                    { id: "b", text: "اسم ظاهر معرب", next: "kana_khabar_single_start", correct: false, hint: "ليس كلمة ظاهرة واحدة، بل تركيب يؤول باسم." },
                ],
            };
        }
        return {
            ...node,
            context: `عرفنا أن (${target}) خبر (${nasikh}) مفرد؛ أي ليس جملة ولا شبه جملة. نحدد طبيعته قبل علامة النصب.`,
            text: `ما نوع خبر (${nasikh}) «${target}»؟`,
            hint: `هل (${target}) اسم ظاهر تتغير علامته، أم تركيب من حرف مصدري وفعل يؤول باسم؟`,
        };
    }
    if (id === "kana_khabar_shibh_type") {
        return {
            ...node,
            context: `عرفنا أن (${target}) تركيب أتم المعنى عن (${subject}).`,
            text: `ما نوع شبه الجملة «${target}»؟ اختر الإجابة الصحيحة مما يلي:`,
            hint: "إذا بدأ بحرف جر فهو جار ومجرور، وإذا كان ظرفًا مثل (عند) فهو ظرف ومضاف إليه.",
            answers: [
                { id: "a", text: "جار ومجرور", next: shibhPosition === "advanced" ? "kana_khabar_shibh_position_jar" : "R_kana_khabar_jar", correct: shibhType === "jar", hint: shibhType === "jar" ? undefined : `(${target}) يبدأ بظرف مثل (عند)، وليس بحرف جر.` },
                { id: "b", text: "ظرف ومضاف إليه", next: shibhPosition === "advanced" ? "kana_khabar_shibh_position_zarf" : "R_kana_khabar_zarf", correct: shibhType === "zarf", hint: shibhType === "zarf" ? undefined : `(${target}) يبدأ بحرف جر، وليس بظرف.` },
            ],
        };
    }
    if (id === "kana_khabar_shibh_position_jar") {
        return {
            ...node,
            context: `عرفنا أن (${target}) جار ومجرور، والآن ننظر إلى الاسم الذي جاء بعده.`,
            text: `هل جاء بعد هذا الجار والمجرور اسم نكرة مثل: كان في البيت رجل؟`,
            hint: `إذا تقدم شبه الجملة بعد الفعل الناسخ وجاءت بعدها نكرة، فشبه الجملة خبر مقدم، والاسم النكرة اسم الفعل الناسخ مؤخر.`,
            answers: [
                { id: "a", text: "تقدم على اسم نكرة", next: "R_kana_khabar_jar_advanced", correct: shibhPosition === "advanced" },
                { id: "b", text: "جاء بعد اسم الناسخ", next: "R_kana_khabar_jar", correct: shibhPosition !== "advanced", hint: `لو جاء بعد اسم الناسخ لوجدنا اسمًا ظاهرًا قبل شبه الجملة. أما هنا فقد بدأ بعد الناسخ بشبه الجملة، ثم جاءت النكرة بعدها.` },
            ],
        };
    }
    if (id === "kana_khabar_shibh_position_zarf") {
        return {
            ...node,
            context: `عرفنا أن (${target}) ظرف، والآن ننظر إلى الاسم الذي جاء بعده.`,
            text: `هل جاء بعد هذا الظرف اسم نكرة مثل: ما زال عندنا ضيف؟`,
            hint: `إذا تقدم الظرف بعد الفعل الناسخ وجاءت بعده نكرة، فالظرف خبر مقدم، والاسم النكرة اسم الفعل الناسخ مؤخر.`,
            answers: [
                { id: "a", text: "تقدم على اسم نكرة", next: "R_kana_khabar_zarf_advanced", correct: shibhPosition === "advanced" },
                { id: "b", text: "جاء بعد اسم الناسخ", next: "R_kana_khabar_zarf", correct: shibhPosition !== "advanced", hint: `لو جاء بعد اسم الناسخ لوجدنا اسمًا ظاهرًا قبل الظرف. أما هنا فقد تقدم الظرف وجاءت النكرة بعده.` },
            ],
        };
    }
    return null;
}

