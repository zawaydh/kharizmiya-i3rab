import type { PedagogyNode, PedagogyState } from "./ExercisePedagogyTypes";

export function customKanaResultNode(node: PedagogyNode | null | undefined, state: PedagogyState): PedagogyNode | null {
    if (!node || node.type !== "result")
        return null;
    if (String(node.id || "") !== "R_kana_khabar_nominal_sentence")
        return null;
    const target = String(state?.currentTarget || "");
    const sentence = String(state?.currentSentence || state?.sentence || "");
    const haystack = `${target} ${sentence}`;
    if (haystack.includes("أطرافه") || haystack.includes("أطرافُه")) {
        return {
            ...node,
            text: `أطرافه: مبتدأ ثانٍ مرفوع، وهو مضاف.
الهاء: ضمير متصل مبني في محل جر مضاف إليه.
ممتدة: خبر المبتدأ الثاني مرفوع.
والجملة الاسمية (أطرافه ممتدة) في محل نصب خبر الفعل الناسخ.`
        };
    }
    if (haystack.includes("لونه") || haystack.includes("لونُه")) {
        return {
            ...node,
            text: `لونه: مبتدأ ثانٍ مرفوع، وهو مضاف.
الهاء: ضمير متصل مبني في محل جر مضاف إليه.
باهت: خبر المبتدأ الثاني مرفوع.
والجملة الاسمية (لونه باهت) في محل نصب خبر الفعل الناسخ.`
        };
    }
    return null;
}

