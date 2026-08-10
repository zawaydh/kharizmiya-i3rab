import type { ExerciseAnswer } from "../../../lib/exercise/model";
import type { PedagogyNode, PedagogyState, PedagogyTree } from "./ExercisePedagogyTypes";
import { isFiveVerbDecision } from "./ExerciseDecisionHelpers";
import { normalizeThinkingNode } from "./ExerciseNodePedagogy";

export function cleanPracticeTeacherPart(text?: string | null) {
    return String(text || "")
        .replace(/^\s*(?:[0-9٠-٩]+)[\).:\-–—]\s*/, "")
        .replace(/^\s*[•●▪◦\-–—]\s*/, "")
        .replace(/^صحيح[؛،:.]?\s*/, "")
        .replace(/اختر الإجابة الصحيحة مما (?:يأتي|يلي)[:：]?/g, "")
        .replace(/انظر إلى الكلمة المحددة في المثال، ثم اختر ما يثبته المثال نفسه[.،]?/g, "")
        .replace(/\s+/g, " ")
        .trim();
}
export function practiceTeacherNarrative(parts: Array<string | null | undefined>, target?: string) {
    const clean = parts.map(cleanPracticeTeacherPart).filter(Boolean) as string[];
    if (!clean.length)
        return "لنعد إلى الكلمة المحددة، فنحدد وظيفتها أولًا، ثم حالتها، ثم علامتها حتى نصل إلى الإعراب الصحيح.";
    const connectors = ["", "ثم ", "وبعد ذلك ", "وبناءً على ما عرفناه، "];
    const connected = clean.map((raw, index) => {
        let part = raw
            .replace(/^ابدأ من/, "نبدأ من")
            .replace(/^ابدأ بـ/, "نبدأ بـ")
            .replace(/^إذن[:：]?\s*/, "وبذلك نصل إلى النتيجة: ");
        if (index === 0) {
            if (/^(نبدأ|لنبدأ|انظر|اسأل|ننظر|نحدد|نتأكد|نفحص)/.test(part))
                return part;
            const focus = String(target || "الكلمة المحددة").trim();
            return `نبدأ بالنظر إلى «${focus}». ${part}`;
        }
        if (/^(ثم|وبعد ذلك|بعد ذلك|وبما أن|وبما أنها|وبما أنه|لذلك|ولهذا|وبذلك|والآن|أما|إذا|عندما|وهذا|وهذه|وهو|وهي|وللتأكد|ومن هنا)/.test(part))
            return part;
        return `${connectors[Math.min(index, connectors.length - 1)]}${part}`;
    });
    return connected
        .join(" ")
        .replace(/\.\s*\./g, ".")
        .replace(/\s+([،؛:.])/g, "$1")
        .trim();
}
export function practiceTeacherHint(rawHint: string, target?: string) {
    const pieces = String(rawHint || "")
        .split(/\n+/)
        .map(cleanPracticeTeacherPart)
        .filter(Boolean);
    return practiceTeacherNarrative(pieces, target);
}
export function answerEffectLabel(node: PedagogyNode | null | undefined, answer: ExerciseAnswer | null | undefined, state: PedagogyState) {
    const id = String(node?.id || "");
    const text = String(answer?.text || "").trim();
    const yes = text.startsWith("نعم") || answer?.eval?.equals === true || Array.isArray(answer?.eval?.anyOf);
    const no = text === "لا" || text.startsWith("لا") || answer?.eval?.equals === false || answer?.eval?.equals === "none";
    // المضارع: نبني الحكم بالتدريج داخل مربع النتيجة.
    if (id === "present_build_check") {
        if (text.includes("نون النسوة"))
            return "مبني على السكون: نحدد المحل الإعرابي";
        if (text.includes("نون التوكيد"))
            return "مبني على الفتح: نحدد المحل الإعرابي";
        return "فعل مضارع معرب: نحدد العامل السابق";
    }
    if (id === "present_niswa_position" || id === "present_tawkid_position")
        return text;
    if (id === "present_tool_presence") {
        if (text.includes("نصب"))
            return "منصوب: سبقه حرف نصب";
        if (text.includes("جزم"))
            return "مجزوم: سبقه حرف جزم";
        return "مرفوع: لا ناصب ولا جازم";
    }
    if (id === "present_nun_niswa")
        return yes ? "مبني: اتصل بنون النسوة" : "لا نون نسوة: نكمل فحص البناء";
    if (id === "present_nun_tawkid")
        return yes ? "مبني: اتصل بنون التوكيد" : "معرب (سنحدد لاحقًا: مرفوع أم منصوب أم مجزوم)";
    if (id === "present_has_tool")
        return yes ? "يوجد عامل قبل الفعل" : "مرفوع: لم يسبقه ناصب أو جازم";
    if (id === "present_tool_type") {
        if (text.includes("ناصب"))
            return "منصوب: سبقته أداة نصب";
        if (text.includes("جازم"))
            return "مجزوم: سبقته أداة جزم";
    }
    if (isFiveVerbDecision(node)) {
        const txt = String(node?.text || "") + " " + id;
        if (yes && !no && /jazm/.test(txt))
            return "علامة جزمه حذف النون";
        if (yes && !no && /nasb/.test(txt))
            return "علامة نصبه حذف النون";
        if (yes && !no && /raf3/.test(txt))
            return "علامة رفعه ثبوت النون";
        return yes && !no ? "من الأفعال الخمسة" : "ليس من الأفعال الخمسة";
    }
    if (id.includes("ending")) {
        if (text.includes("صحيح"))
            return "صحيح الآخر";
        if (text.includes("معتل"))
            return "معتل الآخر";
    }
    if (id.includes("weak"))
        return `آخره ${text}`;
    // الماضي: الفعل مبني دائمًا، لكن علامة البناء تتغير بحسب الاتصال.
    if (id === "past_word_kind")
        return text.includes("فعل") ? "فعل" : text;
    if (id === "past_tense")
        return "فعل ماضٍ";
    if (id === "past_has_attachment")
        return yes && !no ? "اتصل بآخره شيء" : "لم يتصل بآخره شيء";
    if (id === "past_no_attachment_weak")
        return text.includes("ألف") ? "فتح مقدر على الألف" : "فتح ظاهر";
    if (id === "past_connector_kind")
        return text;
    if (id === "past_nasb_weak")
        return text.includes("ألف") ? "فتح مقدر على الألف" : "فتح ظاهر";
    if (id === "past_taa_weak")
        return yes && !no ? "حذف حرف علة" : "لا حذف";
    if (id === "past_deleted_letter_taa" || id === "past_deleted_letter_waw")
        return `المحذوف: ${text}`;
    if (id === "past_raf3_type")
        return text;
    if (id === "past_sukoon_raf3_type")
        return text;
    if (id === "past_has_pronoun")
        return yes && !no ? "اتصل بضمير" : "مبني على الفتح";
    if (id === "past_is_waw")
        return yes && !no ? "مبني على الضم" : "ليس واو الجماعة";
    if (id === "past_is_sukoon_set")
        return yes && !no ? "مبني على السكون" : "نبحث عن اتصال آخر";
    if (id === "past_sukoon_type")
        return text;
    if (id === "past_is_alif")
        return yes && !no ? "مبني على الفتح" : "مبني على الفتح";
    // الأمر: مبني دائمًا، والمؤثر يحدد علامة البناء.
    if (id === "imperative_word_kind")
        return text.includes("فعل") ? "فعل" : text;
    if (id === "imperative_meaning")
        return text.includes("طلب") ? "فعل أمر" : text;
    if (id === "imperative_connection")
        return yes && !no ? "اتصل بآخره شيء" : "لم يتصل بآخره شيء";
    if (id === "imperative_attached_kind")
        return text;
    if (id === "imperative_ending")
        return text.includes("معتل") ? "معتل الآخر" : "صحيح الآخر";
    if (id === "imperative_weak_letter")
        return `المحذوف: ${text}`;
    if (id === "imp_nun_tawkid")
        return yes && !no ? "مبني على الفتح" : "نبحث عن مؤثر آخر";
    if (id === "imp_five")
        return yes && !no ? "مبني على حذف النون" : "ليس من هذا الاتصال";
    if (id === "imp_ending")
        return text.includes("معتل") ? "مبني على حذف حرف العلة" : "مبني على السكون";
    // كان: نحول اختيار لفظ المثال إلى نتيجة نحوية مرحلية واضحة.
    if (id === "kana_target") {
        const role = String(state?.facts?.targetRole || "");
        if (role === "ism")
            return "صاحب المعنى: اسم الفعل الناسخ";
        if (role === "khabar")
            return "المعلومة المتممة: خبر الفعل الناسخ";
        if (role === "hidden_ism")
            return "صاحب المعنى: نبحث عن اسم الناسخ المستتر";
    }
    // فروع التوابع: نثبت العلاقة أولًا قبل الحالة والعلامة.
    if (id === "tawabi_naat_discovery")
        return "علاقة وصف: الكلمة نعت";
    if (id === "tawabi_atf_discovery")
        return "علاقة مشاركة بحرف عطف";
    if (id === "tawabi_tawkid_discovery")
        return "علاقة توكيد: تقوية المعنى";
    if (id === "tawabi_badal_discovery")
        return "علاقة بيان: الكلمة بدل";
    // الأسماء وبقية التعلّم الموجّه.
    if (text.includes("أداة ناصبة") || text.includes("أداة نصب"))
        return "منصوب";
    if (text.includes("أداة جازمة") || text.includes("أداة جزم"))
        return "مجزوم";
    if (text.includes("مرفوع"))
        return "مرفوع";
    if (text.includes("منصوب"))
        return "منصوب";
    if (text.includes("مجزوم"))
        return "مجزوم";
    if (text.includes("معرب"))
        return "معرب";
    if (text.includes("مبني"))
        return "مبني";
    return text || "اختيارك";
}
export function buildVisibleResultDraft(tree: PedagogyTree, state: PedagogyState, currentNode: PedagogyNode | null | undefined, dropped?: {
    text: string;
    tone: "idle" | "ok" | "bad";
} | null) {
    const pieces: string[] = [];
    const nodes = tree?.nodes || {};
    Object.entries(state?.answers || {}).forEach(([nodeId, answerId]) => {
        const rawNode = nodes[nodeId as string];
        const n = normalizeThinkingNode(rawNode, state);
        const a = n?.answers?.find((x: ExerciseAnswer) => x.id === answerId);
        const label = answerEffectLabel(n, a, state);
        const normalizedLabel = String(label || "").trim();
        const isNegativeRelation = normalizedLabel.startsWith("لا ") || normalizedLabel.includes("ليس ") || normalizedLabel.includes("ليست ");
        if (normalizedLabel && !isNegativeRelation && !pieces.includes(normalizedLabel))
            pieces.push(normalizedLabel);
    });
    if (dropped?.text && dropped.tone !== "bad" && !pieces.includes(dropped.text))
        pieces.push(dropped.text);
    return pieces;
}
