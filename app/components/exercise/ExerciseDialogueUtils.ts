import type { PedagogyNode, PedagogyState, PedagogyTree } from "./ExercisePedagogyTypes";

export function withoutRepeatedChoiceInstruction(text: string) {
    return String(text || "")
        .replace(/\s*اختر الإجابة الصحيحة(?:\s+مما\s+(?:يلي|يأتي))?\s*[:：]?\s*$/, "")
        .trim();
}
export function dialogueQuestionNote(_node: PedagogyNode | null | undefined) {
    return "";
}
export function sentenceForDialogue(state: PedagogyState) {
    const sentence = String(state?.currentSentence || "").trim();
    return sentence ? `«${sentence}»` : "هذه الجملة";
}
export function targetForDialogue(state: PedagogyState) {
    return String(state?.currentTarget || "الكلمة المحددة").trim();
}
export function finalI3rabSubject(tree: PedagogyTree, title?: string) {
    const start = String(tree?.startNodeId || "");
    const t = String(title || "");
    if (start.includes("present") || start.includes("past") || start.includes("imp") || t.includes("الفعل"))
        return "الفعل";
    if (t.includes("الاسم") || t.includes("المبتدأ") || t.includes("الخبر") || t.includes("كان") || t.includes("إن"))
        return "الكلمة";
    return "الكلمة";
}
export function topicKindForDialogue(tree: PedagogyTree, title?: string) {
    const start = String(tree?.startNodeId || "");
    const t = String(title || "");
    if (start.includes("present"))
        return "فعلًا مضارعًا";
    if (start.includes("past"))
        return "فعلًا ماضيًا";
    if (start.includes("imp"))
        return "فعل أمر";
    if (t.includes("الخبر") || start.includes("khabar") || start.includes("nominal"))
        return "كلمة في الجملة الاسمية";
    if (t.includes("المبتدأ") || start.includes("mubtada"))
        return "الكلمة المحددة";
    if (t.includes("كان"))
        return "عنصرًا في باب كان وأخواتها";
    if (t.includes("إن"))
        return "عنصرًا في باب إن وأخواتها";
    if (t.includes("الفاعل"))
        return "الكلمة المحددة";
    if (t.includes("المفعول"))
        return "مفعولًا به";
    if (start.includes("tawabi") || t.includes("النعت") || t.includes("العطف") || t.includes("التوكيد") || t.includes("البدل") || t.includes("التوابع"))
        return "تابعًا محتملًا";
    return "الكلمة المحددة";
}

