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
    const relation = tawabiRelationSentence(relationKind, targetText, matbu3);

    if (id === "tawabi_naat_discovery") {
        return {
            ...node,
            context: `نبدأ من المعنى بين (${targetText}) والاسم السابق (${matbu3})، ثم ننقل الإعراب.`,
            text: `ما العلاقة بين (${targetText}) و(${matbu3}) في الجملة؟`,
            hint: `اسأل: هل (${targetText}) تصف (${matbu3})، أم تتم معنى الجملة كخبر، أم تبين هيئة وقت حدوث الفعل؟`,
        };
    }
    if (id === "tawabi_atf_discovery") {
        return {
            ...node,
            context: `نبدأ من الرابط الظاهر قبل (${targetText})، ثم نحدد أثره في الحكم.`,
            text: `ما أثر (${connector}) في علاقة (${targetText}) بـ(${matbu3})؟`,
            hint: `حدّد (${connector}) في الجملة، ثم اسأل: هل أشركت (${targetText}) مع (${matbu3}) في الحكم؟`,
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
        return {
            ...node,
            context: `نبدأ من صلة (${targetText}) بـ(${matbu3}) قبل تسمية النوع ونقل الإعراب.`,
            text: `ما العلاقة بين (${targetText}) و(${matbu3}) في الجملة؟`,
            hint: `اختبر العلاقة: هل (${targetText}) هو المقصود نفسه، أم جزء منه، أم معنى يشتمل عليه؟`,
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
        return {
            ...node,
            context: `عرفنا أن ${relation}. والآن نطبق قاعدة: التابع يأخذ الحالة الإعرابية من متبوعه.`,
            text: `(${matbu3}) ${matbu3Role}؛ فما الحالة الإعرابية التي تنتقل منه إلى (${targetText})؟`,
            hint: `لا تنظر إلى حركة (${targetText}) أولًا. ابدأ بإعراب (${matbu3})، ثم انقل حالته: رفعًا أو نصبًا أو جرًّا.`,
        };
    }
    if (id === "tawabi_form") {
        return {
            ...node,
            context: `عرفنا أن (${targetText}) ${tawabiCaseAdjectiveHint(i3rabCase)} تبعًا لـ(${matbu3}). الآن نحدد صورته قبل العلامة.`,
            text: `ما صورة (${targetText}) في الجملة؟`,
            hint: `هل (${targetText}) اسم ظاهر معرب، أم جملة كاملة، أم شبه جملة؟`,
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
