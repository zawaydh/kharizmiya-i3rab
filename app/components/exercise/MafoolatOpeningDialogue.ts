import type { PedagogyNode, PedagogyState } from "./ExercisePedagogyTypes";
import { cleanQuestionText } from "./ExerciseNodePedagogy";

export function mafoolatOpeningDialogueLine(
    node: PedagogyNode | null | undefined,
    state: PedagogyState,
    target: string,
) {
    const nodeId = String(node?.id || "");
    const facts = state?.facts || {};
    const verb = String(facts.verb || "فعل الجملة");
    const verbMasdar = String(facts.verbMasdar || "مصدر الفعل");
    const mafoolLabel = String(facts.mafoolLabel || "الموقع الإعرابي");
    const roleKind = String(facts.roleKind || "");
    const shape = String(facts.shape || "");
    const shapeLabel =
        shape === "singular" ? "مفرد" :
        shape === "dual" ? "مثنى" :
        shape === "jms" ? "جمع مذكر سالم" :
        shape === "jfs" ? "جمع مؤنث سالم" :
        shape === "jt" ? "جمع تكسير" :
        shape === "five" ? "من الأسماء الخمسة" : "النوع الذي حددناه";

    if (nodeId === "mafoolat_maah_check") {
        return `نبدأ من (${target}) بأوضح قرينة: هل سُبقت الكلمة بواو بمعنى «مع»؟`;
    }
    if (nodeId === "mafoolat_fih_check") {
        return `استبعدنا المفعول معه. نسأل الآن عن (${target}): هل تجيب عن «متى؟» أو «أين؟» بالنسبة إلى الفعل (${verb})، فتحدد زمانه أو مكانه؟`;
    }
    if (nodeId === "mafoolat_mutlaq_check") {
        return `بما أن (${target}) ليست مفعولًا معه ولا مفعولًا فيه، ننتقل إلى المصدر. خذ الفعل (${verb}) وقل: قام بعملية (${verbMasdar}). هل (${target}) مصدر يدل على الحدث نفسه؟`;
    }
    if (nodeId === "mafoolat_liajlih_check") {
        return `بما أن (${target}) ليست مفعولًا معه، ولا مفعولًا فيه، ولا مفعولًا مطلقًا، نفحص سبب الفعل (${verb}): هل (${target}) مصدر قلبي يجيب عن «لماذا؟»، ويتحد مع الفعل في الفاعل والزمن؟`;
    }
    if (nodeId === "mafoolat_bih_check") {
        return `بما أن (${target}) ليست مفعولًا معه، ولا مفعولًا فيه، ولا مفعولًا مطلقًا، ولا مفعولًا لأجله، نسأل الآن عن علاقتها بالفعل (${verb}): هل وقع الفعل عليها أو تعدّى إليها؟`;
    }
    if (nodeId === "mafoolat_form") {
        if (roleKind === "masdar")
            return `عرفنا أن (${target}) ${mafoolLabel}. الآن نحدد البنية: هل هو تركيب يمكن تأويله بمصدر صريح، أم كلمة مفردة؟`;
        return `عرفنا أن (${target}) ${mafoolLabel}. قبل العلامة أو المحل نحدد صورة المحدد؛ فالصورة هي التي تحدد العلامة أو المحل: هل هو كلمة مفردة، أم تركيب في تأويل اسم؟`;
    }
    if (nodeId === "mafoolat_word_inflection") {
        return `ثبت أن (${target}) كلمة مفردة في هذا المستوى. الآن نحدد هل هي اسم معرب أم اسم مبني؛ فالضمير المتصل من الأسماء المبنية.`;
    }
    if (nodeId === "mafoolat_shape") {
        return `عرفنا أن (${target}) ${mafoolLabel} منصوب، وأنه اسم ظاهر معرب. نحدد الآن نوع الاسم قبل العلامة: ما نوع (${target})؟`;
    }
    if (nodeId === "mafoolat_mark") {
        return `بما أن (${target}) ${mafoolLabel} منصوب، وقد عرفنا أنه ${shapeLabel}، فما علامة النصب المناسبة؟`;
    }
    if (nodeId === "mafoolat_mabni_type") {
        return `عرفنا أن (${target}) ${mafoolLabel}، وأنه اسم مبني؛ لذلك لا نبحث عن حركة نصب، بل نحدد نوع الاسم المبني قبل صياغة الإعراب النهائي.`;
    }

    return `${String(node?.context || "نكمل مسار المفاعيل.").replace(/[.،]+$/, "")}؛ ${cleanQuestionText(node)}`;
}
