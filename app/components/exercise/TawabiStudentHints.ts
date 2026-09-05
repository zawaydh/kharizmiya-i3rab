import type { PedagogyNode, PedagogyState } from "./ExercisePedagogyTypes";
import {
    tawabiCaseAdjectiveHint,
    tawabiCaseNounHint,
    tawabiRelationSentence,
    tawabiShapeNameHint,
} from "./TawabiHintShared";

/**
 * يربط سؤال التوابع بالمثال نفسه في كل خطوة، حتى يرى الطالب كيف تنتقل
 * الفكرة من العلاقة إلى الحالة ثم الصورة والعلامة، من غير تغيير مسارات
 * الأبواب الأخرى أو إجاباتها.
 */
export function customTawabiPedagogyNode(node: PedagogyNode | null | undefined, state: PedagogyState): PedagogyNode | null {
    if (!node || node.type !== "question")
        return null;
    const id = String(node.id || "");
    if (!id.startsWith("tawabi_"))
        return null;
    const facts = state?.facts || {};
    const targetText = String(state?.currentTarget || "الكلمة المحددة").trim();
    const matbu3 = String(facts?.matbu3 || "الاسم السابق").trim();
    const matbu3Role = String(facts?.matbu3Role || "متبوع").trim();
    const relationKind = String(facts?.relationKind || "");
    const i3rabCase = String(facts?.case || "");
    const shape = String(facts?.shape || "");
    const connector = String(facts?.connector || "حرف العطف").trim();
    const badalKind = String(facts?.badalKind || "").trim();
    const roleKind = String(facts?.roleKind || "").trim();
    const phraseKind = String(facts?.phraseKind || "").trim();
    const tawabiTerm = String(facts?.tawabiTerm || "").trim();
    const tawkidKind = String(facts?.tawkidKind || "").trim();
    const relation = tawabiRelationSentence(relationKind, targetText, matbu3);

    // TAWABI_RELATION_FIRST_V22
    if (id === "tawabi_naat_discovery") {
        const linkText = String(facts?.linkText || "").trim();
        const hint = roleKind === "sentence"
            ? `ابدأ بنوع العلاقة فقط: (${matbu3}) نكرة، وبعدها الجملة (${targetText}) جاءت لتصفها. تذكّر: الجمل وشبه الجمل بعد النكرات صفات غالبًا، وبعد المعارف أحوالًا غالبًا${linkText ? `. وفي الجملة رابط يعود على المنعوت: ${linkText}` : ". وابحث داخل الجملة عن رابط يعود على المنعوت"}.`
            : roleKind === "shibh"
              ? `ابدأ بنوع العلاقة فقط: شبه الجملة بعد النكرة تكون صفة غالبًا؛ وهنا (${targetText}) تصف (${matbu3}). وبعد المعارف تكون أحوالًا غالبًا.`
              : `ابدأ بنوع العلاقة فقط: (${targetText}) تصف (${matbu3}) وتبيّن صفة فيه؛ فلا تبحث عن الحركة أو صورة النعت قبل إثبات علاقة الوصف.`;
        return {
            ...node,
            context: `نميّز أولًا علاقة (${targetText}) بـ(${matbu3})، ثم نحدد صورة النعت في خطوة مستقلة.`,
            text: `أي قرينة تميّز علاقة (${targetText}) بـ(${matbu3}) في الجملة؟`,
            hint,
        };
    }
    if (id === "tawabi_naat_kind") {
        const linkText = String(facts?.linkText || "").trim();
        const hint = roleKind === "sentence"
            ? `في (${targetText}) إسناد كامل، فهي نعت جملة. (${matbu3}) نكرة، والجملة بعدها صفة غالبًا${linkText ? `، وفيها رابط يعود على المنعوت: ${linkText}` : ""}.`
            : roleKind === "shibh"
              ? `(${targetText}) جار ومجرور أو ظرف بلا إسناد كامل؛ لذلك صورته نعت شبه جملة. تذكّر: شبه الجملة بعد النكرة تكون صفة غالبًا إذا جاءت لتصفها.`
              : `(${targetText}) كلمة واحدة تصف (${matbu3}) مباشرة؛ لذلك صورته نعت مفرد.`;
        return {
            ...node,
            context: `ثبت أن (${targetText}) نعت لـ(${matbu3}). نحدد الآن صورة النعت فقط.`,
            text: `ما صورة النعت (${targetText}) في هذا المثال؟`,
            hint,
        };
    }
    if (id === "tawabi_atf_discovery") {
        return {
            ...node,
            context: `نميّز أولًا علاقة (${targetText}) بـ(${matbu3}) من الرابط الظاهر.`,
            text: `أي قرينة تميّز علاقة (${targetText}) بـ(${matbu3}) في الجملة؟`,
            hint: `قبل (${targetText}) يوجد حرف عطف، وهو (${connector})؛ ومن حروف العطف: الواو، الفاء، ثم، أو، أم، بل، لا، لكن، حتى؛ وهذه قرينتك. بعد إثبات العطف، المعطوف يتبع المعطوف عليه في الحالة الإعرابية.`,
        };
    }
    if (id === "tawabi_tawkid_discovery") {
        const semanticWord = ["نفس", "عين", "كل", "جميع", "عامة", "كلا", "كلتا"].find((word) => targetText.includes(word)) || "لفظ توكيد معنوي";
        const semanticPronoun = targetText.endsWith("هما") ? "هما"
            : targetText.endsWith("هم") ? "هم"
              : targetText.endsWith("هن") ? "هن"
                : targetText.endsWith("ها") ? "ها"
                  : targetText.endsWith("ه") ? "الهاء"
                    : "ضمير متصل";
        const hint = tawkidKind === "lafzi"
            ? `انظر إلى (${matbu3}) الأول و(${targetText}) الثاني: تكرر اللفظ نفسه من غير حرف عطف ومن غير وصف جديد. هذه قرينة التوكيد.`
            : `افحص (${targetText}): من ألفاظ التوكيد المعنوي: نفس، عين، كل، جميع، عامة، كلا، كلتا؛ واتصل باللفظ الضمير (${semanticPronoun}) العائد على (${matbu3}). هذه قرينة التوكيد، ثم نحدد نوعه في الخطوة التالية.`;
        return {
            ...node,
            context: `نميّز أولًا علاقة (${targetText}) بـ(${matbu3})، ثم نحدد نوع التوكيد في خطوة مستقلة.`,
            text: `أي قرينة تميّز علاقة (${targetText}) بـ(${matbu3}) في الجملة؟`,
            hint,
        };
    }
    if (id === "tawabi_badal_discovery") {
        const hint = badalKind === "مطابق"
            ? `اسأل: من المقصود بالحكم؟ (${targetText}) هو عين (${matbu3}) نفسه، والمتبوع تمهيد له ويمكن غالبًا حذفه؛ فهذه قرينة البدل.`
            : badalKind === "بعض من كل"
              ? `اسأل: من المقصود بالحكم؟ الحكم متجه إلى (${targetText}) نفسه، وهو مرتبط بـ(${matbu3}) وليس مجرد وصف له؛ والمتبوع تمهيد للتابع ويمكن غالبًا حذفه.`
              : `اسأل: من المقصود بالحكم؟ الحكم متجه إلى (${targetText}) نفسه، وهو معنى متعلق بـ(${matbu3}) لا مجرد صفة تصفه؛ فالمتبوع تمهيد للتابع.`;
        return {
            ...node,
            context: `نميّز أولًا علاقة (${targetText}) بـ(${matbu3}) بالسؤال: من المقصود بالحكم؟`,
            text: `أي قرينة تميّز علاقة (${targetText}) بـ(${matbu3}) في الجملة؟`,
            hint,
        };
    }
    if (id === "tawabi_badal_kind") {
        return {
            ...node,
            context: `ثبت أن (${targetText}) بدل من (${matbu3}). نحدد الآن نوع البدل من طبيعة العلاقة بينهما.`,
            text: `ما نوع البدل في (${targetText})؟`,
            hint: badalKind === "مطابق"
                ? `(${targetText}) هو المقصود نفسه ويمكن أن يحل محل (${matbu3}) دون اختلال المعنى؛ فهذا بدل مطابق.`
                : badalKind === "بعض من كل"
                  ? `(${targetText}) جزء حقيقي من (${matbu3})، لذلك هو بدل بعض من كل.`
                  : `(${targetText}) معنى أو صفة تتعلق بـ(${matbu3}) وليست جزءًا ماديًا منه؛ لذلك هو بدل اشتمال.`,
        };
    }
    if (id === "tawabi_tawkid_kind") {
        return {
            ...node,
            context: `ثبت أن (${targetText}) توكيد لـ(${matbu3}). نحدد الآن نوع التوكيد.`,
            text: `كيف حصل التوكيد في (${targetText})؟`,
            hint: tawkidKind === "lafzi"
                ? `تكرر اللفظ نفسه؛ لذلك هذا توكيد لفظي.`
                : `استُعمل لفظ من ألفاظ التوكيد المعنوي مثل: نفس، عين، كل، جميع، عامة، كلا، كلتا، واتصل به ضمير يعود على المؤكَّد.`,
        };
    }
    if (id === "tawabi_case" && tawabiTerm === "naat" && (roleKind === "sentence" || roleKind === "shibh")) {
        const phraseLabel = roleKind === "sentence" ? "الجملة" : "شبه الجملة";
        const phraseType = phraseKind || phraseLabel;
        return {
            ...node,
            context: `بما أن (${targetText}) ${phraseType} وقعت نعتًا لـ(${matbu3})، فالنعت يتبع المنعوت في المحل الإعرابي.`,
            text: `بما أن (${targetText}) ${phraseType} وقعت نعتًا لـ(${matbu3})، و(${matbu3}) ${matbu3Role}؛ فما محل ${phraseLabel} (${targetText}) من الإعراب؟`,
            hint: `لا نعرب ${phraseLabel} كلها بضمة أو فتحة أو كسرة؛ بل نحدد محلها من إعراب المنعوت. (${matbu3}) ${matbu3Role}، لذلك تكون (${targetText}) في محل الرفع أو النصب أو الجر نفسه نعتًا.`,
            answers: (node.answers || []).map((answer) => ({
                ...answer,
                text: String(answer.id) === "raf3"
                    ? "في محل رفع نعت"
                    : String(answer.id) === "nasb"
                      ? "في محل نصب نعت"
                      : String(answer.id) === "jarr"
                        ? "في محل جر نعت"
                        : answer.text,
            })),
        };
    }    if (id === "tawabi_case") {
        // TAWABI_BADAL_CASE_BRIDGE_V13
        const roleBridge = tawabiTerm === "badal"
            ? `بما أن التابع (${targetText}) هو المقصود بالحكم، والمتبوع (${matbu3}) تمهيد له ويمكن غالبًا حذفه، فهو بدل. والبدل يتبع المبدل منه في الحالة الإعرابية.`
            : tawabiTerm === "atf"
              ? `بما أن التابع (${targetText}) جاء بعد حرف العطف (${connector})، فهو معطوف على (${matbu3}). والمعطوف يتبع المعطوف عليه في الحالة الإعرابية.`
              : tawabiTerm === "naat"
                ? `بما أن (${targetText}) نعت لـ(${matbu3})، فالنعت يتبع المنعوت في الإعراب.`
                : tawabiTerm === "tawkid"
                  ? tawkidKind === "lafzi"
                    ? `بما أن التابع (${targetText}) الثاني توكيد لفظي للمؤكَّد (${matbu3}) الأول، فالتوكيد يتبع المؤكَّد في الحالة الإعرابية.`
                    : `بما أن التابع (${targetText}) توكيد معنوي للمؤكَّد (${matbu3})، فالتوكيد يتبع المؤكَّد في الحالة الإعرابية.`
                  : `عرفنا أن ${relation}. التابع يأخذ الحالة الإعرابية من متبوعه.`;
        const inPosition = roleKind === "sentence" || roleKind === "shibh";
        const positionAnswers = inPosition
            ? (node.answers || []).map((answer) => {
                const value = String(answer.eval?.equals || "");
                const label = value === "raf3" ? "في محل رفع" : value === "nasb" ? "في محل نصب" : "في محل جر";
                return { ...answer, text: label };
            })
            : node.answers;
        return {
            ...node,
            context: roleBridge,
            text: inPosition
                ? `(${matbu3}) ${matbu3Role}؛ ففي أي محل إعرابي يقع (${targetText}) بوصفه تابعًا له؟`
                : tawabiTerm === "badal"
                  ? `${roleBridge} (${matbu3}) ${matbu3Role}؛ فما الحالة الإعرابية للتابع (${targetText})؟`
                  : tawabiTerm === "atf"
                    ? `${roleBridge} (${matbu3}) ${matbu3Role}؛ فما الحالة الإعرابية للتابع (${targetText})؟`
                  : tawabiTerm === "tawkid"
                    ? tawkidKind === "lafzi"
                      ? `${roleBridge} (${matbu3}) الأول ${matbu3Role}؛ فما الحالة الإعرابية للتابع (${targetText}) الثاني؟`
                      : `${roleBridge} (${matbu3}) ${matbu3Role}؛ فما الحالة الإعرابية للتابع (${targetText})؟`
                    : `${roleBridge} و(${matbu3}) ${matbu3Role}؛ فما حالة (${targetText})؟`,
            hint: inPosition
                ? `الجملة وشبه الجملة لا تظهر عليهما ضمة أو فتحة أو كسرة بوصفهما تركيبًا كاملًا؛ نقول: في محل رفع أو نصب أو جر بحسب المتبوع. (${matbu3}) ${matbu3Role}.`
                : `ابدأ بالحالة لا بالعلامة: (${matbu3}) ${matbu3Role}، إذن ينتقل إلى (${targetText}) الرفع أو النصب أو الجر نفسه، ثم نختار العلامة من صورة التابع.`,
            answers: positionAnswers,
        };
    }    if (id === "tawabi_form") {
        return {
            ...node,
            context: `عرفنا أن (${targetText}) ${tawabiCaseAdjectiveHint(i3rabCase)} تبعًا لـ(${matbu3}). الآن نحدد صورته قبل العلامة.`,
            text: `ما صورة (${targetText}) في الجملة؟`,
            hint: roleKind === "sentence" ? `المطلوب هو التركيب (${targetText}) كله. فيه إسناد كامل، لذلك هو جملة؛ وبعد ذلك نحدد أهي فعلية أم اسمية.` : `هل (${targetText}) اسم ظاهر معرب، أم جملة كاملة، أم شبه جملة؟`,
        };
    }
    if (id === "tawabi_sentence_type") {
        return {
            ...node,
            context: `ثبت أن (${targetText}) جملة تابعة لـ(${matbu3}). نحدد نوع الجملة من أولها.`,
            text: `ما نوع الجملة (${targetText})؟`,
            hint: phraseKind === "جملة فعلية"
                ? `ابدأ بأول كلمة في (${targetText}): هي فعل، ومعها فاعل أو ما يتمم الجملة؛ إذن المحدد جملة فعلية.`
                : `ابدأ بأول كلمة في (${targetText}): هي اسم، وداخل التركيب مبتدأ وخبر؛ إذن المحدد جملة اسمية.`,
        };
    }
    if (id === "tawabi_shape") {
        return {
            ...node,
            context: `عرفنا أن (${targetText}) اسم ظاهر معرب ${tawabiCaseAdjectiveHint(i3rabCase)}. بقي تحديد صورته لاختيار العلامة.`,
            text: `ما صورة الاسم المعرب (${targetText})؟`,
            hint: `انظر إلى (${targetText}) نفسها: أمفردة في العدد، أم مثنى، أم جمع، أم من الأسماء الخمسة؟`,
        };
    }
    if (id === "tawabi_mark") {
        return {
            ...node,
            context: `الحالة جاءت من (${matbu3})، أما العلامة فتتحدد من صورة (${targetText}).`,
            text: `عرفنا أن (${targetText}) ${tawabiCaseAdjectiveHint(i3rabCase)} وصورته ${tawabiShapeNameHint(shape, targetText)}؛ فما علامة إعرابه؟`,
            hint: `اجمع القرارين السابقين: الحالة ${tawabiCaseNounHint(i3rabCase)}، والصورة ${tawabiShapeNameHint(shape, targetText)}، ثم اختر العلامة المناسبة.`,
        };
    }
    return null;
}

export { tawabiStudentHintText } from "./TawabiChoiceFeedback";
