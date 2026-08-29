import type { ExerciseAnswer } from "../../../lib/exercise/model";
import type { PedagogyNode, PedagogyState } from "./ExercisePedagogyTypes";
import { toStudentArabicOption } from "../../../lib/studentOptionText";
import { diagnosticHintText, firstLevelHintText } from "../../../lib/hintText";
import { presentVerbBuiltPositionNote } from "../../../lib/presentVerbBuiltPosition";
import { customKanaPedagogyNode, customKanaResultNode } from "./KanaPedagogy";
import { customInnaResultNode, innaGenericLabel } from "./InnaPedagogy";
import { customTawabiPedagogyNode } from "./TawabiStudentHints";
import { isFiveVerbDecision } from "./ExerciseDecisionHelpers";

function getNodeContext(node: PedagogyNode | null | undefined, state: PedagogyState) {
    if (node?.context)
        return node.context;
    const id = String(node?.id || "");
    if (id.includes("tense"))
        return "عرفنا أن الكلمة فعل.";
    if (id.includes("has_tool") || id.includes("check_attached") || id.includes("ending") || id.includes("weak_type"))
        return "ننتقل خطوة خطوة قبل الوصول إلى الإعراب النهائي.";
    if (id.includes("pronoun"))
        return "عرفنا نوع الفعل، ونفحص الآن أثر الضمير في علامة البناء.";
    return "اتبع القرار التالي فقط.";
}
function currentStepIntro(node: PedagogyNode | null | undefined, tokens: string[] = []) {
    const id = String(node?.id || "");
    if (id === "fw_decision_1")
        return "نبدأ بتحديد نوع الكلمة";
    if (id === "fw_verb_tense")
        return "عرفنا أن الكلمة فعل";
    if (id === "fw_particle_after")
        return "عرفنا أن الكلمة حرف";
    if (id === "past_word_kind")
        return "نبدأ من نوع الكلمة";
    if (id === "past_tense")
        return "عرفنا أنه فعل";
    if (id === "past_has_attachment")
        return "بما أنه فعل ماضٍ، فلنحدد علامة البناء";
    if (id === "past_connector_kind")
        return "عرفنا أن آخر الفعل اتصل به شيء";
    if (id === "past_raf3_type")
        return "عرفنا أنه ضمير رفع";
    if (id === "past_sukoon_raf3_type")
        return "عرفنا أن البناء سيكون على السكون";
    if (id.startsWith("past_weak") || id.startsWith("past_deleted"))
        return "نحدد الحرف المحذوف بالإسناد إلى هو";
    if (id === "past_no_attachment_weak")
        return "لم يتصل بالفعل شيء، فننظر إلى آخره";
    if (id === "past_nasb_weak")
        return "ضمير النصب لا يغيّر البناء، فننظر إلى أصل الفعل";
    if (id === "past_taa_weak")
        return "تاء التأنيث لا تغيّر البناء، ونفحص الحذف إن وُجد";
    if (id === "present_word_kind")
        return "نبدأ من نوع الكلمة";
    if (id === "present_tense")
        return "عرفنا أنها فعل";
    if (id === "present_build_check")
        return "عرفنا أنه فعل مضارع";
    if (id === "present_niswa_position" || id === "present_tawkid_position")
        return "ثبت البناء، ونحدد الآن المحل الإعرابي";
    if (id === "present_tool_presence")
        return "عرفنا أنه معرب";
    if (id.includes("_shape"))
        return "نحدد صورته لنعرف العلامة";
    if (id.includes("weak_letter"))
        return "نحدد حرف العلة";
    if (id.includes("present") || id.includes("binaa"))
        return "نكمل مسار المضارع";
    if (id.includes("attached"))
        return "ننتبه إلى ما اتصل بآخر الكلمة";
    if ((id.includes("ending") || id.includes("weak")) && !id.includes("kana"))
        return "ننظر إلى آخر الفعل لنحدد أثره في علامة البناء أو الإعراب";
    if (id.includes("tense"))
        return "نبدأ بتحديد نوع الفعل";
    if (id.includes("wordType") || id === "start")
        return "نبدأ من نوع الكلمة";
    if (id.includes("khabar") || id.includes("mubtada") || id.includes("nounKind"))
        return "نكمل التفكير بموقع الاسم";
    return "نبني هذه الخطوة على ما ثبت في الخطوة السابقة";
}
export function cleanQuestionText(node: PedagogyNode | null | undefined) {
    const id = String(node?.id || "");
    const text = String(node?.text || "ماذا نلاحظ؟");
    if (id.startsWith("past_"))
        return text;
    if (id === "present_step_1")
        return "ماذا نتحقق أولًا؟";
    if (id === "present_tense")
        return "ما نوع الفعل؟";
    if (id === "present_tool")
        return "هل نفحص ما قبل الفعل؟";
    if (id === "present_has_tool")
        return "هل سبق الفعل عامل نصب أو جزم؟";
    if (id.includes("five"))
        return "هل الفعل من الأفعال الخمسة؟";
    if (id.includes("attached"))
        return "ما علاقة الضمير أو الحرف بآخر الكلمة؟";
    if (id.includes("ending"))
        return "ما حالة آخر الكلمة؟";
    if (id.includes("weak"))
        return "ما حرف العلة في آخره؟";
    if (id === "wordType")
        return "هل الكلمة اسم أم فعل أم حرف؟";
    if (id === "nounKind")
        return "هل المحدد كلمة مفردة أم تركيب في تأويل اسم؟";
    if (id === "khabar_single_start")
        return "هل الخبر كلمة مفردة أم تركيب في تأويل اسم؟";
    if (id === "khabar_single_number" || id === "i3rabNumber")
        return "هل الاسم مفرد أم مثنى أم جمع؟";
    if (text === "ماذا نتحقق الآن؟")
        return "ما القرار الذي تدل عليه قرائن المثال في هذه الخطوة؟";
    return text;
}
function makeDecisionHint(answerText?: string, nodeText?: string) {
    const a = String(answerText || "");
    const q = String(nodeText || "");
    if (a.includes("اسم") && q.includes("نوع الكلمة"))
        return "تذكّر: الاسم يقبل الجر أو التنوين غالبًا.";
    if (a.includes("فعل") && q.includes("نوع الكلمة"))
        return "تذكّر: الفعل يدل على حدث وزمن.";
    if (a.includes("ماض"))
        return "الفعل الماضي يقبل تاء الفاعل أو تاء التأنيث غالبًا.";
    if (a.includes("مضارع"))
        return "الفعل المضارع يبدأ غالبًا بأحد أحرف: أ، ن، ي، ت.";
    if (a.includes("واو الجماعة") && q.includes("اتصل"))
        return "انتبه: قد تكون الواو أصلية من الفعل وليست ضميرًا. واو الجماعة تظهر غالبًا مع ألف التفريق في مثل: لم يكتبوا.";
    if (a.includes("العلامة") || a.includes("مباشرة"))
        return "لا نقفز للعلامة قبل تحديد الحالة والسبب.";
    if (a.includes("الخبر"))
        return "الخبر يخص الجملة الاسمية، وليس هذه الخطوة.";
    if (a.includes("الفاعل"))
        return "نحدد نوع الكلمة والزمن أو الموقع أولًا.";
    if (a.includes("دائم"))
        return "لا توجد حالة دائمة؛ الأداة والاتصال يغيّران القرار.";
    if (q.includes("اسم مبني") || a.includes("معرب"))
        return "اسأل: هل تتغير حركة آخر الكلمة أم هي ثابتة؟";
    if (q.includes("آخر") || a.includes("معتل"))
        return "انظر إلى آخر الكلمة فقط، ولا تقفز للإعراب النهائي.";
    return a
        ? `اختيار «${a}» يحتاج قرينة نحوية واضحة من المثال. ابحث عن العامل أو العلاقة أو صورة الكلمة التي تجعل هذا الاختيار ممكنًا؛ إن لم تجد هذه القرينة فاستبعده.`
        : "اربط الخطوة بما ثبت قبلها، ثم استخرج من المثال العامل أو العلاقة أو صورة الكلمة التي تحسم القرار.";
}
export function finalThinkingTextForDisplay(node: PedagogyNode | null | undefined, state: PedagogyState) {
    const base = String(node?.text || "");
    const target = String(state?.currentTarget || "");
    const sentence = String(state?.currentSentence || state?.sentence || "");
    const haystack = `${target} ${sentence}`;
    const explicitFinalI3rab = String(state?.facts?.finalI3rab || "").trim();

    // مفتاح الكلمة الأولى باب توجيه، لذلك نظهر نتيجة المسار نفسها.
    if (node?.type === "result" && String(node?.id || "").startsWith("R_first_")) {
        return base;
    }

    if (
        node?.type === "result" &&
        explicitFinalI3rab &&
        /ننتقل|الخطوة التالية|مسار الاسم|شجرة الاسم/u.test(base)
    ) {
        return explicitFinalI3rab;
    }
    if (node?.type === "result") {
        if (haystack.includes("أطرافه") || haystack.includes("أطرافُه")) {
            return `أطرافُه: مبتدأ ثانٍ مرفوع، وهو مضاف.
الهاء: ضمير متصل مبني في محل جر مضاف إليه.
ممتدةٌ: خبر المبتدأ الثاني مرفوع.

والجملة الاسمية (أطرافه ممتدة) في محل نصب خبر أصبح.`;
        }
        if (haystack.includes("لونه") || haystack.includes("لونُه")) {
            return `لونُه: مبتدأ ثانٍ مرفوع، وهو مضاف.
الهاء: ضمير متصل مبني في محل جر مضاف إليه.
باهتٌ: خبر المبتدأ الثاني مرفوع.

والجملة الاسمية (لونه باهت) في محل نصب خبر كان.`;
        }
    }
    const resultId = String(node?.id || "");
    if (node?.type === "result" && resultId.startsWith("R_present_")) {
        const facts = state?.facts || {};
        const toolWord = String(facts.toolWord || (sentence.includes("لم ") ? "لم" : sentence.includes("لن ") ? "لن" : sentence.includes(" أن ") ? "أن" : sentence.includes(" كي ") ? "كي" : sentence.includes("لا ") ? "لا الناهية" : sentence.includes("لِ") ? "لام الأمر" : ""));
        const isFive = resultId.includes("five");
        const pronounLine = (() => {
            if (facts.attached === "waw")
                return "واو الجماعة: ضمير متصل مبني في محل رفع فاعل.";
            if (facts.attached === "alif2")
                return "ألف الاثنين: ضمير متصل مبني في محل رفع فاعل.";
            if (facts.attached === "yaa")
                return "ياء المخاطبة: ضمير متصل مبني في محل رفع فاعل.";
            return "";
        })();
        const fariqaLine = facts.attached === "waw" && /وا\b|وا$/.test(target) ? "الألف: ألف فارقة لا محل لها من الإعراب." : "";
        const withTool = (kind: string) => toolWord ? `${kind} بـ ${toolWord}` : kind;
        const lines: string[] = [];
        if (resultId.startsWith("R_present_binaa_niswa_")) {
            const position = resultId.endsWith("_nasb") ? "نصب" : resultId.endsWith("_jazm") ? "جزم" : "رفع";
            const tool = position === "نصب" ? "nasb" : position === "جزم" ? "jazm" : "none";
            lines.push(`${target}: فعل مضارع مبني على السكون لاتصاله بنون النسوة، في محل ${position}.`);
            lines.push(`ملاحظة: ${presentVerbBuiltPositionNote(tool)}`);
            lines.push("نون النسوة: ضمير متصل مبني على الفتح في محل رفع فاعل.");
            return lines.join("\n");
        }
        if (resultId.startsWith("R_present_binaa_tawkid_")) {
            const position = resultId.endsWith("_nasb") ? "نصب" : resultId.endsWith("_jazm") ? "جزم" : "رفع";
            const tool = position === "نصب" ? "nasb" : position === "جزم" ? "jazm" : "none";
            lines.push(`${target}: فعل مضارع مبني على الفتح لاتصاله المباشر بنون التوكيد، في محل ${position}.`);
            lines.push(`ملاحظة: ${presentVerbBuiltPositionNote(tool)}`);
            lines.push("نون التوكيد: حرف توكيد لا محل له من الإعراب.");
            return lines.join("\n");
        }
        if (resultId.includes("raf3")) {
            if (isFive) {
                lines.push(`${target}: فعل مضارع مرفوع، وعلامة رفعه ثبوت النون؛ لأنه من الأفعال الخمسة.`);
                if (pronounLine)
                    lines.push(pronounLine);
                return lines.join("\n");
            }
            if (resultId.includes("alif"))
                return `${target}: فعل مضارع مرفوع.\nعلامة رفعه: الضمة المقدرة على الألف منع من ظهورها التعذر.`;
            if (resultId.includes("waw"))
                return `${target}: فعل مضارع مرفوع.\nعلامة رفعه: الضمة المقدرة على الواو منع من ظهورها الثقل.`;
            if (resultId.includes("ya"))
                return `${target}: فعل مضارع مرفوع.\nعلامة رفعه: الضمة المقدرة على الياء منع من ظهورها الثقل.`;
            return `${target}: فعل مضارع مرفوع.\nعلامة رفعه: الضمة الظاهرة على آخره.`;
        }
        if (resultId.includes("nasb")) {
            if (isFive) {
                lines.push(`${target}: فعل مضارع ${withTool("منصوب")}، وعلامة نصبه حذف النون؛ لأنه من الأفعال الخمسة.`);
                if (pronounLine)
                    lines.push(pronounLine);
                if (fariqaLine)
                    lines.push(fariqaLine);
                return lines.join("\n");
            }
            if (resultId.includes("alif"))
                return `${target}: فعل مضارع ${withTool("منصوب")}.\nعلامة نصبه: الفتحة المقدرة على الألف منع من ظهورها التعذر.`;
            return `${target}: فعل مضارع ${withTool("منصوب")}.\nعلامة نصبه: الفتحة الظاهرة على آخره.`;
        }
        if (resultId.includes("jazm")) {
            if (isFive) {
                lines.push(`${target}: فعل مضارع ${withTool("مجزوم")}، وعلامة جزمه حذف النون؛ لأنه من الأفعال الخمسة.`);
                if (pronounLine)
                    lines.push(pronounLine);
                if (fariqaLine)
                    lines.push(fariqaLine);
                return lines.join("\n");
            }
            if (resultId.includes("weak_alif"))
                return `${target}: فعل مضارع ${withTool("مجزوم")}.\nعلامة جزمه: حذف حرف العلة.\nحرف العلة المحذوف: الألف.`;
            if (resultId.includes("weak_waw"))
                return `${target}: فعل مضارع ${withTool("مجزوم")}.\nعلامة جزمه: حذف حرف العلة.\nحرف العلة المحذوف: الواو.`;
            if (resultId.includes("weak_ya"))
                return `${target}: فعل مضارع ${withTool("مجزوم")}.\nعلامة جزمه: حذف حرف العلة.\nحرف العلة المحذوف: الياء.`;
            return `${target}: فعل مضارع ${withTool("مجزوم")}.\nعلامة جزمه: السكون.`;
        }
    }
    if (node?.type === "result" && resultId === "R_mafoolat_remaining_accusatives") {
        const overview = String(node.text || "").trim();
        const finalI3rab = String(state?.facts?.finalI3rab || "").trim();
        return finalI3rab ? `${overview}\n\nفي هذا المثال:\n${finalI3rab}` : overview;
    }
    if (
        node?.type === "result" &&
        /^(R_mafoolat_|R_hal_|R_tamyiz|R_munada_|R_istithna_|R_la_|R_naib_)/.test(resultId)
    ) {
        const finalI3rab = String(state?.facts?.finalI3rab || "").trim();
        if (finalI3rab)
            return finalI3rab;
    }
    if (node?.type === "result" && resultId.startsWith("R_fael_")) {
        const finalI3rab = String(state?.facts?.finalI3rab || "").trim();
        if (finalI3rab)
            return finalI3rab;
    }
    if (node?.type === "result" && resultId.startsWith("R_mafool_")) {
        const finalI3rab = String(state?.facts?.finalI3rab || "").trim();
        if (finalI3rab)
            return finalI3rab;
    }
    if (node?.type === "result" && resultId.startsWith("R_mafoolat_")) {
        const finalI3rab = String(state?.facts?.finalI3rab || "").trim();
        if (finalI3rab) {
            const prefix = target ? `${target}:` : "";
            return prefix && finalI3rab.startsWith(prefix)
                ? finalI3rab.slice(prefix.length).trimStart()
                : finalI3rab;
        }
    }
    if (node?.type === "result" && resultId.startsWith("R_tawabi_")) {
        const finalI3rab = String(state?.facts?.finalI3rab || "").trim();
        if (finalI3rab)
            return finalI3rab;
    }
    return base;
}
export function normalizeThinkingNode(node: PedagogyNode | null | undefined, state: PedagogyState): PedagogyNode | null | undefined {
    if (!node)
        return node;
    if (node.type === "result")
        return customInnaResultNode(node, state) || customKanaResultNode(node, state) || node;
    if (node.type !== "question")
        return node;
    const customKana = customKanaPedagogyNode(node, state);
    if (customKana)
        return customKana;
    const customTawabi = customTawabiPedagogyNode(node, state);
    if (customTawabi)
        return customTawabi;
    const id = String(node.id || "");
    let context = String(node.context || getNodeContext(node, state));
    let text = String(node.text || "ماذا نتحقق الآن؟");
    let hint = firstLevelHintText(id, node.hint, state?.currentTarget, text);
    // نحافظ على سؤال العقدة نفسه ما دام موجَّهًا للكلمة، ولا نحوله إلى سؤال ميتا عن طريقة الحل.
    if (/هل هو:|هل هي:|إذا كان/.test(text))
        text = text.replace(/^إذا كان\s*/, '').replace(/^الآن:\s*/, 'ما التصنيف المناسب الآن؟ ');
    if (/ما حالة آخر/.test(text))
        context = "عرفنا التصنيف، والآن نفحص آخر الكلمة لاختيار العلامة.";
    if (/ما نوع الاسم المبني/.test(text))
        context = "عرفنا أنها كلمة مبنية، فنحدد نوعها قبل المحل.";
    if (/ما نوع الجملة/.test(text))
        context = "عرفنا أنها جملة، فنحدد صورتها قبل الحكم على محلها.";
    if (/هل سبق بأداة/.test(text))
        context = "قبل تحديد الحالة نفحص ما قبل الفعل.";
    // في عقدة الأفعال الخمسة نحافظ على المصطلح المدرسي، والشرح يظهر في السطر المساعد لا في الخيارات.
    if (/هل اتصل/.test(text))
        context = "الاتصال يغير علامة البناء أو الإعراب، لذلك نفحصه الآن.";
    text = cleanQuestionText({ ...node, text });
    // في باب الخبر لا نستبدل سياق العقدة بعبارة عامة؛ لأن السياق يحمل
    // جسر التفكير: بما أننا عرفنا... وهو جزء أساسي من السؤال.
    const isKhabarNode = id.includes("khabar");
    const isKanaNode = id.includes("kana");
    const isInnaNode = id.includes("inna");
    const isFaelNode = id.startsWith("fael_") || id.startsWith("R_fael_");
    const isMafoolNode = id.startsWith("mafool_") || id.startsWith("R_mafool_");
    const isMafoolatNode = id.startsWith("mafoolat_") || id.startsWith("R_mafoolat_");
    const isTawabiNode = id.startsWith("tawabi_") || id.startsWith("R_tawabi_");
    context = id.startsWith("past_") ? "" : ((isKhabarNode || isKanaNode || isInnaNode || isFaelNode || isMafoolNode || isMafoolatNode || isTawabiNode) ? context : currentStepIntro({ ...node, text }, []));
    let answers: ExerciseAnswer[] = (node.answers || []).map((a: ExerciseAnswer) => {
        const isFive = isFiveVerbDecision(node);
        const yesLike = a.eval?.anyOf || a.eval?.equals === true || String(a.text || "").trim().startsWith("نعم");
        const noLike = a.eval?.equals === false || a.eval?.equals === "none" || String(a.text || "").trim() === "لا" || String(a.text || "").trim().startsWith("لا");
        return {
            ...a,
            text: isFive ? (yesLike && !noLike ? "نعم" : "لا") : a.text,
            hint: diagnosticHintText(a.hint || node.hint || makeDecisionHint(a.text, text), state?.currentTarget),
        };
    });
    if (id === "inna_meaning") {
        const facts = state?.facts || {};
        const meaningSubject = String(facts.meaningSubject || "الاسم وحده");
        const meaningPredicate = String(facts.meaningPredicate || "الخبر وحده");
        const meaningJudgment = String(facts.meaningJudgment || "الحكم الكامل في الجملة");
        const particleMeaning = String(facts.particleMeaning || "");
        answers = answers.map((a: ExerciseAnswer) => {
            if (particleMeaning === "kaffa") {
                if (a.id === "semantic_subject")
                    return { ...a, text: "كفّت إن عن العمل، فصار ما بعدها جملة اسمية عادية" };
                if (a.id === "semantic_predicate")
                    return { ...a, text: "بقيت إن تعمل: تنصب الاسم وترفع الخبر" };
                if (a.id === "semantic_judgment")
                    return { ...a, text: "صار الاسم بعد إنما اسم إن منصوبًا" };
            }
            if (a.id === "semantic_subject")
                return { ...a, text: meaningSubject };
            if (a.id === "semantic_predicate")
                return { ...a, text: meaningPredicate };
            if (a.id === "semantic_judgment")
                return { ...a, text: meaningJudgment };
            return a;
        });
    }
    if (id.startsWith("inna_")) {
        answers = answers.map((a: ExerciseAnswer) => {
            if (String(a.id || "") === "__help")
                return a;
            const nextText = innaGenericLabel(String(a.text || ""), state);
            const nextHint = innaGenericLabel(String(a.hint || ""), state);
            return { ...a, text: nextText, hint: nextHint };
        });
    }
    if (id === "past_connector_kind") {
        answers = answers.map((a: ExerciseAnswer) => {
            if (a.id === "nasb" && state?.facts?.weakEnding !== "alif_visible")
                return { ...a, next: "R_past_fatha_nasb" };
            return a;
        });
    }
    if (id === "past_taa_weak") {
        answers = answers.map((a: ExerciseAnswer) => {
            if (a.id === "yes")
                return { ...a, next: "past_deleted_letter_taa" };
            return a;
        });
    }
    if (id === "past_raf3_type") {
        answers = answers.map((a: ExerciseAnswer) => {
            if (a.id === "alif")
                return { ...a, next: state?.facts?.weakOrigin ? "R_past_fatha_alif_weak" : "R_past_fatha_alif" };
            if (a.id === "waw")
                return { ...a, next: state?.facts?.weakDeleted ? "past_waw_weak" : "R_past_damma_waw" };
            return a;
        });
    }
    // في باب إن وأخواتها نجعل طلب المساعدة زرًا مستقلًا بدل حشر الخيارات داخل نص السؤال.
    if (id.startsWith("inna_") && !answers.some((a: ExerciseAnswer) => String(a.text || "").trim() === "لا أعلم")) {
        answers = [
            ...answers,
            {
                id: "__help",
                text: "لا أعلم",
                next: id,
                correct: false,
                isHelp: true,
                hint: firstLevelHintText(id, hint || node.hint, state?.currentTarget, text),
            },
        ];
    }
    answers = answers.map((answer: ExerciseAnswer) => ({
        ...answer,
        text: toStudentArabicOption(answer?.text),
    }));
    return { ...node, context, text, hint, answers };
}
