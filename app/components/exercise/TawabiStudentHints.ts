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
    const relation = tawabiRelationSentence(relationKind, targetText, matbu3);

    if (id === "tawabi_naat_discovery") {
        const hint = roleKind === "sentence" || roleKind === "shibh"
            ? `انظر إلى (${matbu3}) قبل التركيب: هو نكرة في هذا المثال، و(${targetText}) جاءت بعده لتصفه. تذكّر القاعدة المبسطة: الجمل بعد النكرات صفات، وبعد المعارف أحوال، مع وجود الرابط عند الحاجة.`
            : `اسأل: هل (${targetText}) تصف (${matbu3})، أم تتم معنى الجملة كخبر، أم تبين هيئة وقت حدوث الفعل؟`;
        return {
            ...node,
            context: `نبدأ من المعنى بين (${targetText}) والاسم السابق (${matbu3})، ثم ننقل الإعراب.`,
            text: `ما العلاقة بين (${targetText}) و(${matbu3}) في الجملة؟`,
            hint,
        };
    }
    if (id === "tawabi_atf_discovery") {
        return {
            ...node,
            context: `نبدأ من الرابط الظاهر قبل (${targetText})، ثم نحدد أثره في الحكم.`,
            text: `ما أثر (${connector}) في علاقة (${targetText}) بـ(${matbu3})؟`,
            hint: `${connector} حرف عطف أشرك (${targetText}) مع (${matbu3}) في الحكم. بعد ثبوت العطف ننقل الحالة الإعرابية من المعطوف عليه إلى المعطوف.`,
        };
    }
    if (id === "tawabi_tawkid_discovery") {
        return {
            ...node,
            context: `نبدأ بما أضافته (${targetText}) إلى معنى (${matbu3})، ثم نحدد نوع التوكيد.`,
            text: `ماذا أضافت (${targetText}) إلى معنى (${matbu3})؟`,
            hint: `هل أضافت صفة جديدة، أم فسرت المقصود، أم قوّت معنى (${matbu3}) ورفعت الشك؟`,
        };
    }
    if (id === "tawabi_badal_discovery") {
        const hint = badalKind === "مطابق"
            ? `بما أن (${targetText}) هي المقصودة بـ(${matbu3})، ويمكن الاستغناء عن (${matbu3}) ووضع (${targetText}) مكانها دون اختلال المعنى، فالعلاقة بينهما علاقة بدل.`
            : badalKind === "بعض من كل"
              ? `انظر إلى (${targetText}): هي جزء حقيقي من (${matbu3})، ويربطها به في هذا النوع غالبًا ضمير يعود على المبدل منه؛ لذلك العلاقة بدل بعض من كل.`
              : badalKind === "اشتمال"
                ? `(${targetText}) ليست جزءًا ماديًا من (${matbu3})، لكنها معنى أو صفة يشتمل عليها ويرتبط بها، وغالبًا فيها ضمير يعود على المبدل منه؛ لذلك العلاقة بدل اشتمال.`
                : `اختبر العلاقة: هل (${targetText}) هو المقصود نفسه، أم جزء منه، أم معنى يشتمل عليه؟`;
        return {
            ...node,
            context: `نبدأ من صلة (${targetText}) بـ(${matbu3}) قبل تسمية النوع ونقل الإعراب.`,
            text: `ما العلاقة بين (${targetText}) و(${matbu3}) في الجملة؟`,
            hint,
        };
    }
    if (id === "tawabi_badal_kind") {
        return {
            ...node,
            context: `ثبت أن (${targetText}) بدل من (${matbu3}). نحدد نوع البدل من طبيعة العلاقة بينهما قبل نقل الحالة الإعرابية.`,
            text: `ما نوع البدل في (${targetText})؟`,
            hint: badalKind === "مطابق"
                ? `(${targetText}) هي المقصودة نفسها ويمكن أن تحل محل (${matbu3}) دون اختلال المعنى؛ فهذا بدل مطابق.`
                : badalKind === "بعض من كل"
                  ? `(${targetText}) جزء حقيقي من (${matbu3})، لذلك هو بدل بعض من كل.`
                  : `(${targetText}) معنى أو صفة تتعلق بـ(${matbu3}) وليست جزءًا ماديًا منه؛ لذلك هو بدل اشتمال.`,
        };
    }
    if (id === "tawabi_tawkid_kind") {
        return {
            ...node,
            context: `عرفنا أن (${targetText}) أكدت معنى (${matbu3}).`,
            text: `كيف حصل التوكيد في (${targetText})؟`,
            hint: `هل تكرر اللفظ نفسه، أم استُعمل لفظ من ألفاظ التوكيد المعنوي مثل: نفس، عين، كل، جميع، كلا، كلتا؟`,
        };
    }
    if (id === "tawabi_case") {
        const roleBridge = tawabiTerm === "badal"
            ? `بما أن (${targetText}) بدل من (${matbu3})، فالبدل يتبع المبدل منه في الحالة الإعرابية.`
            : tawabiTerm === "atf"
              ? `بما أن (${targetText}) معطوف على (${matbu3})، فالمعطوف يتبع المعطوف عليه في الحالة الإعرابية.`
              : tawabiTerm === "naat"
                ? `بما أن (${targetText}) نعت لـ(${matbu3})، فالنعت يتبع المنعوت في الحالة الإعرابية.`
                : tawabiTerm === "tawkid"
                  ? `بما أن (${targetText}) توكيد لـ(${matbu3})، فالتوكيد يتبع المؤكَّد في الحالة الإعرابية.`
                  : `عرفنا أن ${relation}. التابع يأخذ الحالة الإعرابية من متبوعه.`;
        return {
            ...node,
            context: roleBridge,
            text: `${roleBridge} و(${matbu3}) ${matbu3Role}؛ فما حالة (${targetText})؟`,
            hint: `ابدأ بالحالة لا بالعلامة: (${matbu3}) ${matbu3Role}، إذن ينتقل إلى (${targetText}) الرفع أو النصب أو الجر نفسه، ثم نختار العلامة من صورة التابع.`,
        };
    }
    if (id === "tawabi_form") {
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
