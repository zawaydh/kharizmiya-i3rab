import type { PedagogyNode } from "./ExercisePedagogyTypes";

export function tawabiOpeningDialogueLine(
    node: PedagogyNode | null | undefined,
    target: string,
): string | undefined {
    const nodeId = String(node?.id || "");
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
    return undefined;
}
