import type { PedagogyNode, PedagogyState, PedagogyTree } from "./ExercisePedagogyTypes";
import { targetForDialogue } from "./ExerciseDialogueUtils";

export function bridgeKickerText(tree: PedagogyTree, node: PedagogyNode | null | undefined, state: PedagogyState, title?: string, completedPieces: string[] = []) {
    const target = targetForDialogue(state);
    const start = String(tree?.startNodeId || "");
    const nodeId = String(node?.id || "");
    const last = completedPieces[completedPieces.length - 1];
    if (!last) {
        if (start.includes("present")) {
            return `نبدأ بالفعل المضارع المحدد (${target}): نفحص أولًا نون النسوة ونون التوكيد، ثم العامل السابق.`;
        }
        if (start.includes("past")) {
            return `نبدأ من الكلمة المحددة (${target}) دون افتراض زمنها: أولًا نحدد هل هي فعل أم اسم أم حرف.`;
        }
        if (start.includes("imp")) {
            return `نبدأ من الكلمة المحددة (${target}) دون افتراض نوعها: أولًا نحدد نوع الكلمة ثم دلالة الفعل.`;
        }
        if (start.includes("inna") || String(title || "").includes("إن")) {
            return `مسار إن وأخواتها: نبدأ من موقع (${target}) بعد دخول الحرف الناسخ، ثم نحدد الصورة والعلامة.`;
        }
        if (start.includes("khabar")) {
            return `مسار الخبر: نبدأ من وظيفة (${target}) بالنسبة إلى المبتدأ، لا من المصطلح مباشرة.`;
        }
        if (start.includes("kana") || String(title || "").includes("كان")) {
            return `مسار كان وأخواتها: نبدأ بصاحب المعنى أو بالمعلومة التي أتمته، ثم نحدد الصورة والعلامة.`;
        }
        if (start === "tawabi_naat_discovery")
            return `في (${target}) لا نعتمد على اسم الباب؛ نبدأ بتمييز القرينة: وصف، أم عطف، أم توكيد، أم بدل، ثم نكمل الإعراب.`;
        if (start === "tawabi_atf_discovery")
            return `في (${target}) لا نعتمد على اسم الباب؛ نبحث أولًا عن القرينة التي تميّز العطف من النعت والتوكيد والبدل.`;
        if (start === "tawabi_tawkid_discovery")
            return `في (${target}) نميّز أولًا: أهي قرينة توكيد أم وصف أم عطف أم بدل، ثم نحدد صورة التوكيد وننقل الإعراب.`;
        if (start === "tawabi_badal_discovery")
            return `في (${target}) نبدأ بسؤال: من المقصود بالحكم؟ ثم نميّز البدل من النعت والتوكيد والعطف ونحدد نوع العلاقة.`;
        if (start.includes("tawabi")) {
            return `نبدأ من (${target}) ككلمة قد تكون تابعة: هل ارتبطت باسم قبلها، أم أدت وظيفة مستقلة في الجملة؟`;
        }
        if (String(title || "").includes("الجملة الاسمية") || start.includes("nominal") || start.includes("mubtada")) {
            return `لكي نعرب (${target}) نبدأ بما نلاحظه في الجملة نفسها.`;
        }
        return `نبدأ إعراب (${target}) بخطوة صغيرة واحدة.`;
    }
    if (node?.type === "result")
        return `اكتمل المسار؛ لنرتب الإعراب الذي بنيناه خطوة خطوة.`;
    let next = "نكمل خطوة إعراب جديدة";
    if (start.includes("present")) {
        if (nodeId === "present_tense")
            next = "عرفنا أنها فعل؛ نحدد نوع الفعل الآن";
        else if (nodeId === "present_build_check")
            next = "بما أنه فعل مضارع، نحدد أولًا: هل هو مبني أم معرب";
        else if (nodeId === "present_tool_presence")
            next = "عرفنا أنه معرب؛ ننظر الآن إلى العامل قبله";
        else if (nodeId.includes("_shape"))
            next = "حددنا حالته الإعرابية؛ نحدد صورته لنعرف العلامة";
        else if (nodeId.includes("weak_letter"))
            next = "عرفنا أنه معتل الآخر؛ نحدد حرف العلة";
        else
            next = "نكمل مسار الفعل المضارع خطوة خطوة";
    }
    else if (start.includes("past")) {
        if (nodeId === "past_tense")
            next = "عرفنا أنه فعل؛ نحدد نوع الفعل الآن";
        else if (nodeId === "past_has_attachment")
            next = "بما أن الفعل ماضٍ، والفعل الماضي مبني، نحدد علامة البناء حسب ما يتصل به";
        else if (nodeId === "past_connector_kind")
            next = "عرفنا أن آخر الفعل اتصل به شيء، فلنحدد ما هو لنعرف علامة البناء";
        else if (nodeId === "past_raf3_type")
            next = "نحدد صورة ضمير الرفع لأنها تحدد علامة البناء";
        else if (nodeId.includes("waw") || nodeId.includes("weak") || nodeId.includes("deleted"))
            next = "نستعمل الإسناد إلى هو عند وجود حذف حقيقي";
        else if (nodeId.includes("sukoon"))
            next = "نكمل تحديد ضمير الرفع المتحرك";
        else
            next = "نكمل تحديد علامة البناء";
    }
    else if (start.includes("imp")) {
        if (nodeId === "imperative_meaning")
            next = "عرفنا أنها فعل؛ نحدد هل هي طلب أم لا";
        else if (nodeId === "imperative_connection")
            next = "عرفنا أنه فعل أمر؛ نحدد علامة البناء من الاتصال أو آخر الفعل";
        else if (nodeId === "imperative_attached_kind")
            next = "نحدد المتصل لأنه يحدد علامة البناء";
        else if (nodeId === "imperative_ending")
            next = "لم يتصل بآخره شيء؛ ننظر إلى آخر الفعل";
        else if (nodeId === "imperative_weak_letter")
            next = "نرده إلى مضارعه لمعرفة حرف العلة المحذوف";
        else if (nodeId.includes("five"))
            next = "نكمل فنفحص الاتصال";
        else if (nodeId.includes("ending") && !nodeId.includes("kana") && !nodeId.includes("inna"))
            next = "نكمل فننظر إلى آخر الفعل";
        else
            next = "نكمل تحديد علامة البناء";
    }
    else if (start.includes("kana") || String(title || "").includes("كان")) {
        if (nodeId === "kana_target")
            next = "ثبتنا الوظيفة من معنى الجملة؛ نحدد الآن صورة الاسم أو الخبر";
        else if (nodeId.includes("ism_start") || nodeId.includes("single_start"))
            next = "حددنا الوظيفة؛ نميز المعرب من المبني أو المصدر المؤول";
        else if (nodeId.includes("number"))
            next = "حددنا صورة الاسم؛ نصل إلى العلامة المناسبة";
        else if (nodeId.includes("khabar_entry"))
            next = "ثبتنا أنه خبر؛ نحدد هل هو مفرد أم جملة أم شبه جملة";
        else
            next = "نكمل مسار كان وأخواتها خطوة خطوة";
    }
    else if (start.includes("inna") || String(title || "").includes("إن")) {
        if (nodeId.includes("target"))
            next = "نكمل فنحدد صورة العنصر بعد إن";
        else if (nodeId.includes("khabar_kind"))
            next = "نكمل فنحدد صورة خبر إن";
        else if (nodeId.includes("number"))
            next = "نكمل فنختار العلامة المناسبة";
        else
            next = "نكمل مسار إن وأخواتها";
    }
    else if (start.includes("tawabi")) {
        if (nodeId.endsWith("_discovery"))
            next = "ثبتنا علاقة التابع بالمتبوع؛ نعرب المتبوع أولًا ثم ننقل حالته إلى التابع";
        else if (nodeId === "tawabi_relation")
            next = "نكمل فنحدد نوع العلاقة مع الاسم السابق";
        else if (nodeId === "tawabi_term")
            next = "نكمل فنسمّي العلاقة باسمها النحوي";
        else if (nodeId === "tawabi_case")
            next = "عرفنا الحالة من المتبوع؛ نحدد صورة التابع قبل العلامة";
        else if (nodeId === "tawabi_shape")
            next = "عرفنا صورة التابع؛ نختار العلامة التي تناسب حالته وصورته";
    }
    return `عرفنا: ${last}. أُضيفت هذه النتيجة إلى مسار التفكير؛ ${next} في (${target}).`;
}

