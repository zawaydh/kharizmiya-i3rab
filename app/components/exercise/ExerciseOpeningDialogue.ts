import type { PedagogyNode, PedagogyState, PedagogyTree } from "./ExercisePedagogyTypes";
import { innaIsConnectedPronounTarget, innaParticleMeaningLabel, innaParticleName } from "./InnaPedagogy";
import { isFiveVerbDecision } from "./ExerciseDecisionHelpers";
import { cleanQuestionText } from "./ExerciseNodePedagogy";
import { mafoolatOpeningDialogueLine } from "./MafoolatOpeningDialogue";
import { extendedTopicOpeningDialogueLine } from "./ExtendedTopicOpeningDialogue";
import {
    sentenceForDialogue,
    targetForDialogue,
    topicKindForDialogue,
} from "./ExerciseDialogueUtils";

export function openingDialogueLine(tree: PedagogyTree, node: PedagogyNode | null | undefined, state: PedagogyState, title?: string) {
    const sentence = sentenceForDialogue(state);
    const target = targetForDialogue(state);
    const start = String(tree?.startNodeId || "");
    const nodeId = String(node?.id || "");
    const kind = topicKindForDialogue(tree, title);
    const extendedLine = extendedTopicOpeningDialogueLine(node, state, target);
    if (extendedLine) return extendedLine;
    if (nodeId === "fw_decision_1") {
        return `ما نوع كلمة «${target}»؟`;
    }
    if (nodeId === "fw_verb_tense") {
        return `عرفنا أن «${target}» فعل. ما زمنه؟`;
    }
    if (nodeId === "fw_particle_after") {
        const sentenceWords = sentence.replace(/[.؟!،]/g, " ").trim().split(/\s+/).filter(Boolean);
        const targetIndex = sentenceWords.findIndex((word) => word === target || word.replace(/[ًٌٍَُِّْ]/g, "") === target.replace(/[ًٌٍَُِّْ]/g, ""));
        const following = targetIndex >= 0 ? sentenceWords[targetIndex + 1] : "";
        return following
            ? `عرفنا أن «${target}» حرف. ما نوع الكلمة التي جاءت بعده «${following}»؟`
            : `عرفنا أن «${target}» حرف. ما نوع الكلمة التي جاءت بعده؟`;
    }
    if (start.includes("present")) {
        if (nodeId === "present_word_kind")
            return `ما نوع كلمة «${target}»؟`;
        if (nodeId === "present_tense")
            return `عرفنا أن (${target}) فعل. ما زمنه؟`;
        if (nodeId === "present_build_check")
            return `هل اتصل بالفعل «${target}» ما يجعله مبنيًّا؟`;
        if (nodeId === "present_niswa_position" || nodeId === "present_tawkid_position")
            return `ثبت بناء الفعل (${target}). ما محله الإعرابي بحسب العامل السابق؟`;
        if (nodeId === "present_tool_presence")
            return `بما أن (${target}) لم يتصل به ما يبنيه، فهو معرب. ننظر إلى ما قبله: هل سبقه ناصب أو جازم؟`;
        if (nodeId === "present_raf3_shape")
            return `لم يسبق (${target}) ناصب ولا جازم، إذن هو مرفوع. نحدد صورته لنعرف علامة رفعه.`;
        if (nodeId === "present_nasb_shape")
            return `سبق (${target}) حرف نصب، إذن هو منصوب. نحدد صورته لنعرف علامة نصبه.`;
        if (nodeId === "present_jazm_shape")
            return `سبق (${target}) حرف جزم، إذن هو مجزوم. نحدد صورته لنعرف علامة جزمه.`;
        if (nodeId === "present_raf3_weak_letter" || nodeId === "present_nasb_weak_letter")
            return `عرفنا أن (${target}) فعل معتل الآخر. ما حرف العلة في آخر أصله؟`;
        if (nodeId === "present_jazm_weak_letter")
            return `عرفنا أن (${target}) فعل معتل الآخر مجزوم. ما حرف العلة المحذوف من آخره؟`;
        if (nodeId === "present_nun_niswa") {
            return `نبدأ بالفعل (${target}): هل اتصل بنون النسوة؟`;
        }
        if (nodeId === "present_nun_tawkid") {
            return `نكمل بسؤال قصير: هل اتصل الفعل (${target}) بنون التوكيد؟`;
        }
        if (nodeId === "present_has_tool") {
            return `بما أن الفعل (${target}) بقي معربًا، نسأل الآن: هل سبقه ناصب أو جازم؟`;
        }
        if (nodeId === "present_tool_type") {
            return `وجدنا أداة قبل الفعل (${target}). هل هي أداة نصب أم أداة جزم؟`;
        }
        if (isFiveVerbDecision(node)) {
            return `هل الفعل (${target}) من الأفعال الخمسة: اتصل بواو الجماعة أو ياء المخاطبة أو ألف الاثنين؟`;
        }
        if (nodeId.includes("ending")) {
            return `بعد استبعاد الأفعال الخمسة ننظر إلى آخر الفعل (${target}): هل هو صحيح الآخر أم معتل الآخر؟`;
        }
        if (nodeId.includes("weak")) {
            return `ننظر إلى آخر أصل الفعل (${target}): ما حرف العلة؟`;
        }
    }
    if (start.includes("past")) {
        if (nodeId === "past_word_kind")
            return `انظر إلى الكلمة المحددة (${target}): ما نوعها؟`;
        if (nodeId === "past_tense")
            return `عرفنا أن (${target}) فعل. ما زمنه؟`;
        if (nodeId === "past_has_attachment")
            return `بما أن (${target}) فعل ماضٍ، والفعل الماضي مبني، نحتاج الآن إلى تحديد علامة بنائه حسب ما يتصل به. هل اتصل بآخره شيء؟`;
        if (nodeId === "past_connector_kind")
            return `عرفنا أن آخر الفعل (${target}) اتصل به شيء، فلنحدد ما هو لنعرف علامة البناء. فهل اتصل الفعل بـ:`;
        if (nodeId === "past_no_attachment_weak")
            return `لم يتصل بآخر الفعل (${target}) شيء. ننظر الآن إلى آخره لنحدد علامة البناء.`;
        if (nodeId === "past_nasb_weak")
            return `عرفنا أن المتصل ضمير نصب، وهو لا يغيّر بناء الفعل. ننظر الآن إلى أصل الفعل قبل الضمير.`;
        if (nodeId === "past_taa_weak")
            return `عرفنا أن المتصل تاء التأنيث الساكنة، وهي لا تغيّر بناء الفعل. هل هناك حرف علة محذوف من آخر الفعل؟`;
        if (nodeId === "past_deleted_letter_taa")
            return `ما حرف العلة المحذوف من آخر (${target})؟`;
        if (nodeId === "past_raf3_type")
            return `عرفنا أن المتصل ضمير رفع أضمر الفاعل. أي ضمير رفع اتصل بالفعل (${target})؟`;
        if (nodeId === "past_sukoon_raf3_type")
            return `عرفنا أن الفعل (${target}) اتصل بضمير رفع متحرك يبنيه على السكون. أي ضمير هو؟`;
        if (nodeId === "past_deleted_letter_waw")
            return `ما حرف العلة المحذوف قبل واو الجماعة في (${target})؟`;
    }
    if (start.includes("imp")) {
        if (nodeId === "imperative_word_kind")
            return `ما نوع كلمة «${target}»؟`;
        if (nodeId === "imperative_meaning")
            return `عرفنا أن (${target}) فعل. ما دلالته هنا؟`;
        if (nodeId === "imperative_connection")
            return `عرفنا أن (${target}) يدل على طلب حصول الحدث، إذن هو فعل أمر. وفعل الأمر مبني دائمًا؛ هل اتصل بآخره شيء؟`;
        if (nodeId === "imperative_attached_kind")
            return `عرفنا أن (${target}) اتصل بآخره شيء. ما نوع هذا المتصل؟`;
        if (nodeId === "imperative_ending")
            return `عرفنا أن (${target}) لم يتصل بآخره شيء. ننظر إلى آخره: هل هو صحيح الآخر أم معتل الآخر؟`;
        if (nodeId === "imperative_weak_letter")
            return `عرفنا أن (${target}) فعل أمر معتل الآخر. نرده إلى مضارعه لنعرف حرف العلة المحذوف؛ ما هو؟`;
    }
    if (start.includes("kana") || String(title || "").includes("كان")) {
        const facts = state?.facts || {};
        const targetText = String(target || "الكلمة المحددة");
        const sentenceText = String(sentence || "الجملة");
        if (nodeId === "kana_factor_gate") {
            return `ننظر إلى الفعل الناسخ في جملة ${sentenceText}. نريد أن نعرف نوعه قبل بيان أثره في الجملة. أيُّ الخيارات الآتية يصف نوع الفعل الناسخ؟`;
        }
        if (nodeId === "kana_naskh_explain") {
            return `عرفنا أن كان أو إحدى أخواتها فعل. الآن نثبت معنى النسخ: ما الحكم الجديد الذي فرضته على المبتدأ والخبر بعد دخولها؟`;
        }
        if (nodeId === "kana_target") {
            if (facts.targetRole === "hidden_ism") {
                return `في جملة ${sentenceText} ركّز على الفعل الناسخ (${targetText}). هل ظهر بعده اسم صريح؟ أم نفهم اسم الفعل الناسخ من السياق؟`;
            }
            if (facts.targetRole === "ism") {
                if (targetText.includes("ت"))
                    return `المطلوب إعراب التاء في جملة ${sentenceText}. على مَن تدل هذه التاء؟ هل هي ضمير يدل على صاحب المعنى بعد الفعل الناسخ، أم مجرد علامة؟`;
                if (String(facts.ending || "") === "attached_ya")
                    return `المطلوب إعراب (${targetText}) في جملة ${sentenceText}. انظر إلى الكلمة: هل الياء من أصل الكلمة، أم ضمير متصل أضيف إلى الاسم؟ وما علاقة الاسم بالفعل الناسخ؟`;
                if (sentenceText.includes("ليس"))
                    return `المطلوب إعراب (${targetText}) في جملة ${sentenceText}. ما الشيء الذي وقع عليه معنى النفي في (ليس)؟ اختر العلاقة الأقرب قبل ذكر المصطلح.`;
                return `المطلوب إعراب (${targetText}) في جملة ${sentenceText}. ما علاقة هذا الاسم بالفعل الناسخ؟ هل هو الذي كان/أصبح/صار في معنى الجملة، أم هو الذي أتم معنى الجملة؟`;
            }
            if (facts.sentenceType === "verbal") {
                return `المطلوب إعراب (${targetText}) في جملة ${sentenceText}. هل المحدد يدل على حدث مقترن بزمن؟ ثم اسأل: عمّن أخبر هذا الحدث في الجملة؟`;
            }
            if (facts.khabarKind === "shibh") {
                return `المطلوب إعراب (${targetText}) في جملة ${sentenceText}. ما علاقة هذا التركيب بالاسم قبله؟ هل أتمّ المعنى عنه ببيان مكان أو ظرف، أم قام بفعل، أم وقع عليه فعل؟`;
            }
            if (facts.nounKind === "masdar") {
                return `المطلوب إعراب (${targetText}) في جملة ${sentenceText}. هل هذا التركيب يمكن أن يحل محل اسم؟ افحص: هل سبق الفعل حرف مصدري مثل (أن)؟`;
            }
            return `المطلوب إعراب (${targetText}) في جملة ${sentenceText}. ما علاقة الكلمة بما قبلها؟ هل أتمت المعنى عنه، أم قامت بفعل، أم وقع عليها فعل؟`;
        }
        if (nodeId === "kana_ism_start") {
            if (targetText.includes("ت"))
                return `عرفنا أن التاء دلت على صاحب المعنى بعد الفعل الناسخ. الآن نحدد طبيعتها: هل هي اسم معرب، أم اسم مبني، أم مصدر مؤول؟`;
            if (String(facts.ending || "") === "attached_ya")
                return `بعد أن عرفنا أن (${targetText}) اسم الفعل الناسخ، نفكك الكلمة قبل الحكم على آخرها: هل هي اسم معرب، أم اسم مبني، أم مصدر مؤول؟`;
            return `بما أننا عرفنا علاقة (${targetText}) بالفعل الناسخ، نحدد طبيعته الآن: هل هو اسم معرب، أم اسم مبني، أم مصدر مؤول؟`;
        }
        if (nodeId === "kana_ism_built") {
            if (targetText.includes("ت"))
                return `التاء دلت على المتكلم، وما دل على متكلم أو مخاطب أو غائب يسمى ضميرًا. ولأنها اتصلت بما قبلها فهي ضمير متصل. أيُّ الخيارات الآتية يصف نوع هذا الاسم المبني؟`;
            return `بما أن (${targetText}) اسم مبني، نحدد نوعه من الكلمة نفسها. أيُّ الخيارات الآتية يصف نوع هذا الاسم المبني؟`;
        }
        if (nodeId === "kana_ism_number") {
            return `بما أن (${targetText}) اسم معرب، نفحص صورته قبل اختيار العلامة. أيُّ الخيارات الآتية يصف صورة هذا الاسم؟`;
        }
        if (nodeId === "kana_ism_ending") {
            return `بعد تحديد صورة (${targetText}) ننظر إلى الحرف الأصلي الأخير، لا إلى التنوين أو العلامات الزائدة.`;
        }
        if (nodeId === "kana_khabar_entry" || nodeId === "kana_khabar_kind") {
            if (facts.sentenceType === "verbal")
                return `عرفنا أن (${targetText}) يدل على حدث وزمن. هل هو فعل مع فاعل ظاهر أو مستتر فيكون جملة فعلية، أم اسم مفرد؟`;
            if (facts.khabarKind === "shibh")
                return `بعد أن عرفنا أن (${targetText}) أتم المعنى عن الاسم قبله، نحدد صورته: هل هو جار ومجرور أو ظرف؟`;
            if (facts.nounKind === "masdar")
                return `انظر إلى (${targetText}): هل هو تركيب من حرف مصدري وفعل يؤول باسم، مثل: أن أتميز = تميزي؟`;
            return `بعد أن عرفنا أن (${targetText}) أتم المعنى بعد اسم الفعل الناسخ، ما طبيعته في هذا المثال؟`;
        }
        if (nodeId === "kana_khabar_single_start") {
            if (facts.nounKind === "masdar")
                return `بما أن (${targetText}) يؤول باسم، نحدد طبيعته: هل هو مصدر مؤول، أم اسم ظاهر معرب، أم اسم مبني؟`;
            return `بما أن (${targetText}) أتم المعنى باسم أو تركيب يؤول باسم، نحدد الآن: هل هو اسم معرب، أم اسم مبني، أم مصدر مؤول؟`;
        }
        if (nodeId === "kana_khabar_single_number") {
            return `بما أن (${targetText}) اسم معرب، نفحص صورة الاسم قبل علامة النصب. أيُّ الخيارات الآتية يصف صورة هذا الاسم؟`;
        }
        if (nodeId === "kana_khabar_sentence_type") {
            return `عرفنا أن (${targetText}) جملة كاملة لا كلمة واحدة. هل بدأت هذه الجملة باسم أم بفعل؟`;
        }
        if (nodeId === "kana_khabar_shibh_type") {
            return `عرفنا أن (${targetText}) شبه جملة. أيُّ الخيارات الآتية يصف نوعها: جار ومجرور أم ظرف؟`;
        }
    }
    if (start.includes("inna") || String(title || "").includes("إن")) {
        const facts = state?.facts || {};
        const targetText = String(target || "الكلمة المحددة");
        const sentenceText = String(sentence || "الجملة");
        const semanticQuestion = String(facts.semanticQuestion || "ما المعنى الذي أفاده الحرف الناسخ؟");
        const judgmentText = String(facts.meaningJudgment || "الجملة الأصلية").replace(/\.$/, "");
        const subjectText = String(facts.meaningSubject || "الاسم الأول").replace(/\.$/, "");
        const particleLabel = String(facts.particleLabel || "إن");
        if (nodeId === "inna_meaning") {
            return semanticQuestion;
        }
        if (nodeId === "inna_compact_role") {
            const particleName = innaParticleName(state);
            const meaningLabel = innaParticleMeaningLabel(state);
            return `${particleLabel} تفيد ${meaningLabel}، وهي حرف ناسخ دخل على الجملة الاسمية: ${judgmentText}؛ فيجعل المبتدأ اسم ${particleName} منصوبًا، والخبر خبر ${particleName} مرفوعًا.
الكلمة المطلوبة إعرابها: ${targetText}
هل هي بعد دخول ${particleLabel}:`;
        }
        if (nodeId === "inna_factor_gate") {
            return `ننظر إلى الحرف الناسخ في جملة ${sentenceText}. نريد أن نعرف أثره قبل العلامة النهائية: ما الحكم الذي فرضته إن وأخواتها على الاسم والخبر؟`;
        }
        if (nodeId === "inna_ism_start") {
            if (innaIsConnectedPronounTarget(targetText))
                return `عرفنا أن الضمير المتصل صار اسم ${particleLabel}. والضمير من الأسماء المبنية، لا من الحروف. الآن نحدد طبيعته قبل الإعراب النهائي.`;
            return `عرفنا أن (${targetText}) صار اسم ${particleLabel}. الآن نحدد صورته قبل الإعراب النهائي.`;
        }
        if (nodeId === "inna_ism_built") {
            if (innaIsConnectedPronounTarget(targetText))
                return `هذا الضمير دل على متكلم أو مخاطب أو غائب، والضمائر من الأسماء المبنية. ولأنه اتصل بما قبله فهو ضمير متصل. ما نوع هذا الاسم المبني؟`;
            return `بما أن (${targetText}) اسم مبني في محل نصب اسم إن، نحدد نوعه من الكلمة نفسها.`;
        }
        if (nodeId === "inna_ism_number") {
            return `بما أن (${targetText}) اسم إن معرب منصوب، نفحص صورته قبل اختيار علامة النصب.`;
        }
        if (nodeId === "inna_ism_ending") {
            return `بعد تحديد صورة (${targetText}) ننظر إلى الحرف الأصلي الأخير، لا إلى التنوين أو العلامات الزائدة.`;
        }
        if (nodeId === "inna_khabar_kind") {
            return `عرفنا أن (${targetText}) خبر ${particleLabel}. ما صورة هذا الخبر في المثال: مفرد، أم جملة، أم شبه جملة؟`;
        }
        if (nodeId === "inna_khabar_single_start") {
            return `عرفنا أن (${targetText}) خبر إن مفرد؛ أي ليس جملة ولا شبه جملة. الآن نحدد طبيعته قبل الإعراب النهائي.`;
        }
        if (nodeId === "inna_khabar_single_built") {
            return `بما أن (${targetText}) اسم مبني في محل رفع خبر إن، نحدد نوع المبني من الكلمة نفسها.`;
        }
        if (nodeId === "inna_khabar_single_number") {
            return `بما أن (${targetText}) خبر إن معرب مرفوع، نفحص صورة الاسم قبل علامة الرفع.`;
        }
        if (nodeId === "inna_khabar_single_ending") {
            return `بعد تحديد صورة (${targetText}) ننظر إلى الحرف الأصلي الأخير. لا نحكم من التنوين أو العلامات الزائدة.`;
        }
        if (nodeId === "inna_khabar_sentence_type") {
            return `عرفنا أن (${targetText}) جملة كاملة في محل رفع خبر إن. كيف بدأت جملة الخبر؟`;
        }
        if (nodeId === "inna_khabar_shibh_type") {
            return `عرفنا أن (${targetText}) شبه جملة في محل رفع خبر إن. ما نوع شبه الجملة هنا؟`;
        }
    }
    if (start.includes("khabar")) {
        if (nodeId === "khabar_meaning_gate") {
            return `لكي نعرب (${target}) نبدأ بالسؤال: ما وظيفة الكلمة أو التركيب المحدد بالنسبة إلى المبتدأ؟`;
        }
        if (nodeId === "khabar_kind") {
            return `بما أننا عرفنا أن (${target}) أخبرت عن المبتدأ وأتمت المعنى، فهي خبر. نسأل الآن: هل الخبر كلمة واحدة، أم جملة، أم شبه جملة؟`;
        }
        if (nodeId === "khabar_single_start") {
            return `بما أننا عرفنا أن الخبر هنا كلمة واحدة، والخبر مرفوع أو في محل رفع، نسأل: هل هو اسم معرب، أم اسم مبني، أم مصدر مؤول؟`;
        }
        if (nodeId === "khabar_single_built") {
            return `بما أننا عرفنا أن الخبر اسم مبني، نحدد نوع الاسم المبني قبل الإعراب النهائي: أهو ضمير، أم اسم إشارة، أم اسم موصول؟`;
        }
        if (nodeId === "khabar_masdar_discovery") {
            return `بما أننا وصلنا إلى احتمال المصدر المؤول، نختبره بالتحويل: لو حولنا (${target}) إلى مصدر صريح، فماذا يصبح؟`;
        }
        if (nodeId === "khabar_single_number") {
            return `بما أننا عرفنا أن الخبر اسم معرب مرفوع، نحدد صورة الاسم: مفرد أم مثنى أم جمع أم من الأسماء الخمسة؟`;
        }
        if (nodeId === "khabar_single_ending") {
            return `بما أننا عرفنا صورة الاسم، بقي أن ننظر إلى آخره: هل تظهر الضمة أم تقدر؟`;
        }
        if (nodeId === "khabar_sentence_type") {
            return `بما أننا عرفنا أن الخبر جملة كاملة، فالجملة كلها في محل رفع خبر. نسأل: هل بدأت جملة الخبر باسم أم بفعل؟`;
        }
        if (nodeId === "khabar_shibh_type") {
            return `بما أننا عرفنا أن الخبر شبه جملة، نحدد نوعه: هل هو جار ومجرور أم ظرف؟`;
        }
        if (nodeId === "khabar_shibh_position_jar") {
            return `بما أننا عرفنا أنه جار ومجرور، نسأل: هل جاء بعد المبتدأ أم تقدم على مبتدأ نكرة مثل: في البيت رجل؟`;
        }
        if (nodeId === "khabar_shibh_position_zarf") {
            return `بما أننا عرفنا أنه ظرف، نسأل: هل جاء بعد المبتدأ أم تقدم على مبتدأ نكرة مثل: عندنا ضيف؟`;
        }
        return `${String(node?.context || "نكمل مسار الخبر.").replace(/[.،]+$/, "")}؛ ${cleanQuestionText(node)}`;
    }
    if (start.includes("present")) {
        if (nodeId === "present_word_kind") {
            return `ما نوع كلمة «${target}»؟`;
        }
        if (nodeId === "present_tense") {
            return `عرفنا أن (${target}) فعل. ما زمنه؟`;
        }
        if (nodeId === "present_build_check") {
            return `هل اتصل بالفعل «${target}» ما يجعله مبنيًّا؟`;
        }
        if (nodeId === "present_niswa_position" || nodeId === "present_tawkid_position") {
            return `ثبت بناء الفعل (${target}). ما محله الإعرابي بحسب العامل السابق؟`;
        }
        if (nodeId === "present_tool_presence") {
            return `عرفنا أن (${target}) فعل مضارع معرب. لننظر إلى ما قبله: هل سبق الفعل ناصب أو جازم؟`;
        }
        if (nodeId.includes("_shape")) {
            return `ما صورة الفعل «${target}»؟`;
        }
        if (nodeId === "present_jazm_weak_letter") {
            return `عرفنا أن (${target}) فعل مضارع مجزوم معتل الآخر، وقد حُذف حرف العلة. ما حرف العلة المحذوف؟`;
        }
        if (nodeId.includes("weak_letter")) {
            return `عرفنا أن (${target}) فعل مضارع معتل الآخر. ما حرف العلة في آخره؟`;
        }
        return `${String(node?.context || "نكمل مسار المضارع.").replace(/[.،]+$/, "")}؛ ${cleanQuestionText(node)}`;
    }
    if (start.includes("fael") || String(title || "").includes("الفاعل")) {
        const facts = state?.facts || {};
        const roleKind = String(facts.roleKind || "");
        const contextType = String(facts.contextType || "");
        const nominalSubject = String(facts.nominalSubject || "");
        const verbalKhabar = String(facts.verbalKhabar || "");
        const actionQuestion = String(facts.actionQuestion || "");
        if (nodeId === "fael_context") {
            return `ما السياق الذي ورد فيه المحدد (${target})؟`;
        }
        if (nodeId === "fael_role_verbal") {
            if (contextType === "nominal_connected") {
                return `بما أن الجملة بدأت باسم فهي جملة اسمية، وخبرها جملة فعلية: (${verbalKhabar || "الفعل وما بعده"}). لنحدد دور (${target}) داخل جملة الخبر. اختر الدور المناسب:`;
            }
            if (roleKind === "masdar") {
                return `بما أن التركيب (${target}) ورد في جملة فعلية، فلنحدد دوره في المعنى. اختر الدور المناسب:`;
            }
            return `بما أن الكلمة وردت في جملة فعلية، فلنحدد دورها في هذه الجملة. ما دور (${target}) في الجملة؟`;
        }
        if (nodeId === "fael_role_hidden") {
            return `عرفنا أن الفعل (${target}) يحتاج إلى فاعل. فإذا لم يظهر بعده اسم قام بالفعل، نبحث عن ضمير مستتر داخل الفعل. ${actionQuestion || "من الذي فعل؟"}`;
        }
        if (nodeId === "fael_hidden_estimate") {
            return `بما أن الفاعل ضمير مستتر، نحدد تقديره من معنى الجملة وصيغة الفعل. اختر التقدير المناسب:`;
        }
        if (nodeId === "fael_hukm") {
            return `بما أن (${target}) فاعل، فالفاعل يكون:`;
        }
        if (nodeId === "fael_form") {
            return `بما أن المحدد (${target}) هو الفاعل، فلنحدد صورته لنستطيع تحديد طريقة إعرابه. اختر الصورة المناسبة للمحدد (${target}):`;
        }
        if (nodeId === "fael_mu3rab_shape") {
            return `بما أن (${target}) هو الفاعل المعرب، فلنحدد صورته لنستطيع تحديد علامة رفعه. اختر الصورة المناسبة لكلمة (${target}):`;
        }
        if (nodeId === "fael_raf3_mark") {
            return `بما أن (${target}) فاعل مرفوع، وقد عرفنا صورته، اختر علامة الرفع المناسبة:`;
        }
        if (nodeId === "fael_mabni_type") {
            return `بما أن المحدد (${target}) مبني، فلنحدد نوعه. اختر النوع المناسب:`;
        }
    }
    if (start.includes("mafoolat")) {
        return mafoolatOpeningDialogueLine(node, state, target);
    }
    if (start.includes("mafool") || String(title || "").includes("المفعول")) {
        const facts = state?.facts || {};
        const roleKind = String(facts.roleKind || "");
        const objectQuestion = String(facts.objectQuestion || "على من أو على ماذا وقع الفعل؟");
        if (nodeId === "mafool_context") {
            return `ما السياق الذي ورد فيه المحدد (${target})؟`;
        }
        if (nodeId === "mafool_role") {
            if (roleKind === "masdar") {
                return `بما أن التركيب (${target}) ورد في جملة فعلية، فلنحدد دوره في المعنى. اختر الدور المناسب:`;
            }
            return `بما أن الكلمة وردت في جملة فعلية، فلنحدد دورها في هذه الجملة. ما دور (${target}) في الجملة؟`;
        }
        if (nodeId === "mafool_hukm") {
            return `بما أن (${target}) مفعول به، فالمفعول به يكون:`;
        }
        if (nodeId === "mafool_form") {
            return `بما أن المحدد (${target}) هو المفعول به، فلنحدد صورته لنستطيع تحديد طريقة إعرابه. اختر الصورة المناسبة للمحدد (${target}):`;
        }
        if (nodeId === "mafool_mu3rab_shape") {
            return `بما أن (${target}) هو المفعول به المعرب، فلنحدد صورته لنستطيع تحديد علامة نصبه. اختر الصورة المناسبة لكلمة (${target}):`;
        }
        if (nodeId === "mafool_nasb_mark") {
            return `بما أن (${target}) مفعول به منصوب، وقد عرفنا صورته، اختر علامة النصب المناسبة:`;
        }
        if (nodeId === "mafool_mabni_type") {
            return `بما أن المحدد (${target}) مبني، فلنحدد نوعه. اختر النوع المناسب:`;
        }
    }
    if (start.includes("tawabi")) {
        if (nodeId === "tawabi_entry") {
            return `ننظر إلى (${target}). قبل أن نسميها نعتًا أو عطفًا أو توكيدًا أو بدلًا: هل هي مرتبطة باسم قبلها أم تؤدي وظيفة أخرى؟`;
        }
        if (nodeId === "tawabi_relation") {
            return `بما أن (${target}) مرتبطة باسم قبلها، نحدد نوع العلاقة: هل وصفت الاسم، أم شاركته بحرف عطف، أم أكدته، أم أوضحت المقصود منه؟`;
        }
        if (nodeId === "tawabi_term") {
            return `عرفنا العلاقة بالمعنى. الآن نسمّيها نحويًا: ما المصطلح المناسب لعلاقة (${target}) بما قبلها؟`;
        }
        if (nodeId === "tawabi_tawkid_kind") {
            return `عرفنا أن (${target}) أكدت ما قبلها. كيف أكدت الكلمة ما قبلها؟ اختر الإجابة الصحيحة:`;
        }
        if (nodeId === "tawabi_case") {
            return `ننظر إلى المتبوع قبل (${target}). ما الحالة الإعرابية التي أخذها التابع من متبوعه؟`;
        }
        if (nodeId === "tawabi_form") {
            return `عرفنا حالة (${target}) من المتبوع. الآن نحدد صورته: هل هو اسم ظاهر معرب، أم اسم مبني، أم جملة، أم شبه جملة؟`;
        }
        if (nodeId === "tawabi_shape") {
            return `بما أن (${target}) تابع معرب، نحدد صورته قبل العلامة: مفرد، مثنى، جمع، أم من الأسماء الخمسة؟`;
        }
        if (nodeId === "tawabi_mark") {
            return `عرفنا الحالة والصورة. ما علامة الإعراب المناسبة لـ(${target})؟`;
        }
    }
    if (start.includes("mubtada")) {
        if (nodeId === "mubtada_word_type") {
            return `ما نوع (${target}) في الجملة: اسم أو ما في معنى الاسم، أم فعل، أم حرف؟`;
        }
        if (nodeId === "mubtada_function_gate") {
            return `عرفنا أن (${target}) اسم أو في معنى الاسم. ما دوره في هذه الجملة؟`;
        }
        if (nodeId === "mubtada_start") {
            return `ثبت أن (${target}) مبتدأ. ما صورته هنا: اسم معرب، اسم مبني، أم مصدر مؤول؟`;
        }
        if (nodeId === "mubtada_built") {
            return `عرفنا أن (${target}) اسم مبني في موقع المبتدأ. ما نوع هذا الاسم المبني؟`;
        }
        if (nodeId === "mubtada_number") {
            return `عرفنا أن (${target}) مبتدأ معرب مرفوع. ما صورة الاسم التي تحدد علامة رفعه؟`;
        }
        if (nodeId === "mubtada_ending") {
            return `عرفنا أن (${target}) يرفع بالضمة في هذه الصورة. ما حالة آخره: صحيح الآخر، مقصور، أم منقوص؟`;
        }
    }
    const fallbackContext = String(node?.context || `نكمل من النتيجة التي وصلنا إليها في ${kind}`).replace(/[.،؛]+$/g, "").trim();
    return `${fallbackContext}؛ ${cleanQuestionText(node)}`;
}
