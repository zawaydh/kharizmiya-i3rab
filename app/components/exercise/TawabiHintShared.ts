import type { Facts } from "../../../lib/exercise/model";

export function tawabiTermHintName(term?: string) {
    if (term === "naat")
        return "نعت";
    if (term === "atf")
        return "معطوف";
    if (term === "tawkid")
        return "توكيد";
    if (term === "badal")
        return "بدل";
    return "تابع";
}
export function tawabiRelationHintName(kind?: string) {
    if (kind === "description")
        return "وصف";
    if (kind === "coordination")
        return "عطف ومشاركة في الحكم";
    if (kind === "emphasis")
        return "توكيد للمعنى";
    if (kind === "substitution")
        return "بدل يفسر المقصود";
    return "تبعية";
}
export function tawabiCaseNounHint(i3rabCase?: string) {
    if (i3rabCase === "raf3")
        return "الرفع";
    if (i3rabCase === "nasb")
        return "النصب";
    if (i3rabCase === "jarr")
        return "الجر";
    return "الحالة الإعرابية";
}
export function tawabiIsMulhaqBilMuthanna(targetText?: string) {
    const plain = String(targetText || "").replace(/[ًٌٍَُِّْـ]/g, "");
    return /^(كلا|كلتا|كلي|كلتي)/.test(plain);
}
export function tawabiShapeNameHint(shape?: string, targetText?: string) {
    if (shape === "singular")
        return "مفرد في العدد";
    if (shape === "dual")
        return tawabiIsMulhaqBilMuthanna(targetText) ? "ملحق بالمثنى" : "مثنى";
    if (shape === "jms")
        return "جمع مذكر سالم";
    if (shape === "jfs")
        return "جمع مؤنث سالم";
    if (shape === "jt")
        return "جمع تكسير";
    if (shape === "five")
        return "من الأسماء الخمسة";
    return "صورة التابع";
}
export function tawabiMarkNameHint(mark?: string) {
    if (mark === "damma")
        return "الضمة";
    if (mark === "fatha")
        return "الفتحة";
    if (mark === "kasra")
        return "الكسرة";
    if (mark === "alif")
        return "الألف";
    if (mark === "yaa")
        return "الياء";
    if (mark === "waw")
        return "الواو";
    return "العلامة المناسبة";
}
export function tawabiCorrectRelationHint(facts: Facts | undefined, targetText: string) {
    const matbu3 = String(facts?.matbu3 || "الاسم السابق");
    const reason = String(facts?.relationReason || "").trim();
    const connector = String(facts?.connector || "حرف العطف");
    const linkText = String(facts?.linkText || "رابط يعود على المنعوت");
    if (reason)
        return reason;
    if (facts?.relationKind === "description" && facts?.roleKind === "sentence")
        return `(${targetText}) جملة وصفت (${matbu3})، وشرط النعت الجملة أن يكون المنعوت نكرة وأن يوجد رابط؛ هنا الرابط: ${linkText}.`;
    if (facts?.relationKind === "description" && facts?.roleKind === "shibh")
        return `(${targetText}) شبه جملة وصف (${matbu3})، والتقدير غالبًا: كائن أو موجود.`;
    if (facts?.relationKind === "description")
        return `(${targetText}) يصف (${matbu3}) ويبين صفة فيه، لذلك العلاقة وصف.`;
    if (facts?.relationKind === "coordination")
        return `(${targetText}) جاء بعد ${connector} فشارك (${matbu3}) في الحكم، لذلك العلاقة عطف.`;
    if (facts?.relationKind === "emphasis")
        return `(${targetText}) لم يضف صفة جديدة، بل أكد (${matbu3}) أو شمول الحكم له.`;
    if (facts?.relationKind === "substitution")
        return `(${targetText}) يفسر المقصود من (${matbu3})، ويمكن غالبًا أن يحل محله في الجملة.`;
    return `(${targetText}) تابع لـ(${matbu3})، فابدأ بنوع العلاقة بينهما.`;
}
export function tawabiCorrectShapeHint(facts: Facts | undefined, targetText: string) {
    const shape = String(facts?.shape || "");
    const caseName = tawabiCaseNounHint(String(facts?.case || ""));
    if (shape === "singular")
        return `(${targetText}) يدل على واحد أو واحدة، وليس مثنى ولا جمعًا ولا من الأسماء الخمسة؛ لذلك صورته مفرد في العدد. انتبه: هذا غير مصطلح النعت المفرد الذي يعني ليس جملة ولا شبه جملة.`;
    if (shape === "dual")
        return `(${targetText}) يدل على اثنين أو هو ملحق بالمثنى، ولذلك يعرب بعلامات المثنى: الألف في الرفع والياء في النصب والجر.`;
    if (shape === "jms")
        return `(${targetText}) جمع مذكر سالم؛ يدل على جماعة ذكور عاقلة، وعلامته الواو في الرفع والياء في النصب والجر.`;
    if (shape === "jfs")
        return `(${targetText}) جمع مؤنث سالم؛ ينتهي بألف وتاء زائدتين، ويرفع بالضمة وينصب ويجر بالكسرة.`;
    if (shape === "jt")
        return `(${targetText}) جمع تكسير؛ يدل على جماعة مع تغير صورة المفرد، ويعرب غالبًا بالحركات.`;
    if (shape === "five")
        return `(${targetText}) من الأسماء الخمسة، وشروطها هنا متحققة: مفردة، مكبرة، مضافة، ومضافة إلى غير ياء المتكلم؛ لذلك نعربها بالحروف.`;
    return `بعد أن أخذ التابع ${caseName} من المتبوع، نحدد صورة (${targetText}) لاختيار العلامة.`;
}
export function tawabiCorrectMarkHint(facts: Facts | undefined, targetText: string) {
    const shape = String(facts?.shape || "");
    const mark = String(facts?.mark || "");
    const i3rabCase = String(facts?.case || "");
    if (i3rabCase === "raf3" && mark === "damma")
        return `(${targetText}) ${tawabiShapeNameHint(shape, targetText)} مرفوع؛ لذلك علامة رفعه الضمة. الحالة جاءت من المتبوع، أما الضمة فجاءت من صورة التابع.`;
    if (i3rabCase === "nasb" && mark === "fatha")
        return `(${targetText}) ${tawabiShapeNameHint(shape, targetText)} منصوب؛ لذلك علامة نصبه الفتحة. لا نأخذ العلامة من المتبوع مباشرة، بل من صورة التابع.`;
    if (i3rabCase === "jarr" && mark === "kasra")
        return `(${targetText}) ${tawabiShapeNameHint(shape, targetText)} مجرور؛ لذلك علامة جره الكسرة.`;
    if (shape === "jfs" && i3rabCase === "nasb" && mark === "kasra")
        return `(${targetText}) جمع مؤنث سالم منصوب؛ وعلامة نصب جمع المؤنث السالم الكسرة نيابة عن الفتحة.`;
    if (shape === "dual" && mark === "alif")
        return `(${targetText}) ${tawabiShapeNameHint(shape, targetText)} مرفوع؛ لذلك علامة رفعه الألف.`;
    if (shape === "dual" && mark === "yaa")
        return `(${targetText}) ${tawabiShapeNameHint(shape, targetText)} في حالة ${tawabiCaseNounHint(i3rabCase)}؛ لذلك علامته الياء.`;
    if (shape === "jms" && mark === "waw")
        return `(${targetText}) جمع مذكر سالم مرفوع؛ لذلك علامة رفعه الواو.`;
    if (shape === "jms" && mark === "yaa")
        return `(${targetText}) جمع مذكر سالم في حالة ${tawabiCaseNounHint(i3rabCase)}؛ لذلك علامته الياء.`;
    if (shape === "five" && mark === "waw")
        return `(${targetText}) من الأسماء الخمسة مرفوع؛ لذلك علامة رفعه الواو.`;
    if (shape === "five" && mark === "alif")
        return `(${targetText}) من الأسماء الخمسة منصوب؛ لذلك علامة نصبه الألف.`;
    if (shape === "five" && mark === "yaa")
        return `(${targetText}) من الأسماء الخمسة مجرور؛ لذلك علامة جره الياء.`;
    return `الحالة الصحيحة لـ(${targetText}) هي ${tawabiCaseNounHint(i3rabCase)}، وصورته ${tawabiShapeNameHint(shape, targetText)}؛ لذلك علامته ${tawabiMarkNameHint(mark)}.`;
}

export function tawabiCaseAdjectiveHint(i3rabCase?: string) {
    if (i3rabCase === "raf3")
        return "مرفوع";
    if (i3rabCase === "nasb")
        return "منصوب";
    if (i3rabCase === "jarr")
        return "مجرور";
    return "تابع";
}
export function tawabiRelationSentence(kind?: string, targetText = "الكلمة المحددة", matbu3 = "الاسم السابق") {
    if (kind === "description")
        return `(${targetText}) تصف (${matbu3}) وتبين صفة فيه`;
    if (kind === "coordination")
        return `(${targetText}) شاركت (${matbu3}) في الحكم بواسطة حرف عطف`;
    if (kind === "emphasis")
        return `(${targetText}) أكدت معنى (${matbu3})`;
    if (kind === "substitution")
        return `(${targetText}) أوضحت المقصود من (${matbu3}) أو جزءًا أو معنى متعلقًا به`;
    return `(${targetText}) تابعة لـ(${matbu3})`;
}
