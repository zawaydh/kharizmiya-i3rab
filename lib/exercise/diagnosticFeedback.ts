import type { Facts } from "./model";
export type DiagnosticFeedbackInput = {
    nodeId?: string;
    pickedText?: string;
    facts?: Facts;
    target?: string;
    sentence?: string;
};
const WORD_TYPE_LABELS: Record<string, string> = {
    noun: "اسم",
    verb: "فعل",
    particle: "حرف",
};
const VERB_TYPE_LABELS: Record<string, string> = {
    past: "فعل ماضٍ",
    present: "فعل مضارع",
    imperative: "فعل أمر",
};
const POSITION_LABELS: Record<string, string> = {
    raf3: "محل رفع",
    nasb: "محل نصب",
    jar: "محل جر",
};
const ROLE_LABELS: Record<string, string> = {
    fael: "فاعل",
    mubtada: "مبتدأ",
    mafool: "مفعول به",
    mafool_muqaddam: "مفعول به مقدّم",
    mudaf_ileyh: "مضاف إليه",
};
function clean(value: unknown): string {
    return String(value || "").trim();
}
function targetLabel(target?: string): string {
    return clean(target) || "الكلمة المحددة";
}
function sentenceLabel(sentence?: string): string {
    const value = clean(sentence);
    return value ? ` في جملة «${value}»` : "";
}
function firstWordDiagnostic(input: DiagnosticFeedbackInput): string | null {
    const id = clean(input.nodeId);
    if (!id.startsWith("fw_"))
        return null;
    const picked = clean(input.pickedText);
    const facts = input.facts || {};
    const target = targetLabel(input.target);
    const inSentence = sentenceLabel(input.sentence);
    if (id === "fw_decision_1") {
        const actual = clean(facts.wordType);
        const actualLabel = WORD_TYPE_LABELS[actual] || "نوعًا آخر";
        if (picked.includes("اسم") && actual !== "noun") {
            return `اخترتَ «اسم»، لكن الاسم لا يدل على حدث وزمن. الكلمة (${target})${inSentence} ${actual === "verb" ? "تدل على حدث مرتبط بزمن" : "لا يظهر معناها كاملًا إلا مع غيرها"}؛ لذلك نوعها ${actualLabel}.`;
        }
        if (picked.includes("فعل") && actual !== "verb") {
            return `اخترتَ «فعل»، لكن الفعل يدل على حدث وزمن. الكلمة (${target})${inSentence} ${actual === "noun" ? "تدل على اسم أو معنى بلا زمن" : "تربط ما بعدها بما قبلها ولا تدل على حدث"}؛ لذلك نوعها ${actualLabel}.`;
        }
        if (picked.includes("حرف") && actual !== "particle") {
            return `اخترتَ «حرف»، لكن الحرف لا يستقل بمعناه غالبًا. الكلمة (${target})${inSentence} ${actual === "noun" ? "تدل على اسم أو مسمّى" : "تدل على حدث وزمن"}؛ لذلك نوعها ${actualLabel}.`;
        }
    }
    if (id === "fw_verb_tense") {
        const actual = clean(facts.verbType);
        const actualLabel = VERB_TYPE_LABELS[actual] || "زمنًا آخر";
        if (picked.includes("ماض") && actual !== "past") {
            return `الماضي يدل على حدث وقع وانتهى، مثل «كتبَ». أمّا (${target})${inSentence} ${actual === "present" ? "فيدل على حدث يقع أو يتجدد" : "فيطلب حصول الحدث من المخاطب"}؛ لذلك هو ${actualLabel}.`;
        }
        if (picked.includes("مضارع") && actual !== "present") {
            return `المضارع يدل على حدث يقع الآن أو يتجدد، مثل «يكتبُ». أمّا (${target})${inSentence} ${actual === "past" ? "فيحكي حدثًا وقع وانتهى" : "فيطلب فعلًا من المخاطب"}؛ لذلك هو ${actualLabel}.`;
        }
        if (picked.includes("أمر") && actual !== "imperative") {
            return `الأمر يتضمن طلبًا مباشرًا، مثل «اكتبْ». أمّا (${target})${inSentence} ${actual === "past" ? "فيخبر عن حدث وقع" : "فيخبر عن حدث يقع أو يتجدد"}؛ لذلك هو ${actualLabel}.`;
        }
    }
    if (id === "fw_particle_after") {
        const actual = clean(facts.afterParticle);
        if (picked.includes("فعل") && actual !== "verb") {
            return `اخترتَ أن بعد الحرف فعلًا، لكن الكلمة التي تلي (${target})${inSentence} اسم؛ لذلك يتجه التركيب إلى اسم أو شبه جملة، لا إلى فعل.`;
        }
        if (picked.includes("اسم") && actual !== "noun") {
            return `اخترتَ أن بعد الحرف اسمًا، لكن الكلمة التي تلي (${target})${inSentence} فعل يدل على حدث وزمن؛ لذلك يتجه التركيب إلى فعل.`;
        }
    }
    return null;
}
function pronounDiagnostic(input: DiagnosticFeedbackInput): string | null {
    const id = clean(input.nodeId);
    if (!id.startsWith("pronoun_"))
        return null;
    const picked = clean(input.pickedText);
    const facts = input.facts || {};
    const target = targetLabel(input.target);
    const inSentence = sentenceLabel(input.sentence);
    const position = clean(facts.position);
    const role = clean(facts.role);
    const expectedPosition = POSITION_LABELS[position] || "المحل المناسب";
    const expectedRole = ROLE_LABELS[role] || "وظيفته في الجملة";
    if (id === "pronoun_relation_gate") {
        if (picked.includes("حركة")) {
            return `الضمير (${target}) اسم مبني، فلا تتغير حركة آخره لتدل على الإعراب. المطلوب أن نضع اسمًا ظاهرًا مكانه، ثم نحدد المحل الذي شغله: رفعًا أو نصبًا أو جرًّا.`;
        }
        if (picked.includes("فاعل")) {
            return `ليس كل ضمير فاعلًا؛ فالضمير قد يكون مبتدأ أو مفعولًا به أو مضافًا إليه. في (${target})${inSentence} نحدد علاقته أولًا، ثم نحكم على محله.`;
        }
    }
    if (id === "pronoun_position") {
        if (picked.includes("رفع") && position !== "raf3") {
            return `محل الرفع يناسب الفاعل أو المبتدأ. أمّا (${target})${inSentence} فشغل موقع ${expectedRole}؛ لذلك هو في ${expectedPosition}، لا في محل رفع.`;
        }
        if (picked.includes("نصب") && position !== "nasb") {
            return `محل النصب يناسب المفعول به. أمّا (${target})${inSentence} فشغل موقع ${expectedRole}؛ لذلك هو في ${expectedPosition}، لا في محل نصب.`;
        }
        if (picked.includes("جر") && position !== "jar") {
            return `محل الجر يكون بعد حرف جر أو في الإضافة. أمّا (${target})${inSentence} فشغل موقع ${expectedRole}؛ لذلك هو في ${expectedPosition}، لا في محل جر.`;
        }
    }
    if (id === "pronoun_form_raf3" || id === "pronoun_form_nasb") {
        const form = clean(facts.form);
        if (picked.includes("متصل") && form !== "attached") {
            return `الضمير المتصل يلتصق بكلمة قبله، مثل التاء في «كتبتُ» أو الكاف في «أكرمك». أمّا (${target})${inSentence} فكلمة مستقلة؛ لذلك هو ضمير منفصل.`;
        }
        if (picked.includes("منفصل") && form !== "separate") {
            return `الضمير المنفصل يأتي كلمة مستقلة، مثل «أنا» و«إيّاك». أمّا (${target})${inSentence} فمتصل بكلمة قبله ولا يستقل عنها؛ لذلك هو ضمير متصل.`;
        }
    }
    return null;
}
function inferCaseReason(caseValue: string, sentence?: string): string {
    const sentenceText = clean(sentence);
    if (caseValue === "nasb") {
        return sentenceText.includes("رأيت") ? "لأنه وقع عليه فعل الرؤية، فهو مفعول به منصوب" : "لأن موقعه في الجملة منصوب";
    }
    if (caseValue === "raf3") {
        return sentenceText.includes("جاء") ? "لأنه قام بفعل المجيء، فهو فاعل مرفوع" : "لأن موقعه في الجملة مرفوع";
    }
    if (caseValue === "jar") {
        return sentenceText.includes("ب") ? "لأنه سبق بحرف الجر الباء، فهو مجرور" : "لأن موقعه في الجملة مجرور";
    }
    return "بحسب موقعه في الجملة";
}
function manqousDiagnostic(input: DiagnosticFeedbackInput): string | null {
    const id = clean(input.nodeId);
    if (!id.startsWith("manqous_")) return null;
    const picked = clean(input.pickedText);
    const facts = input.facts || {};
    const target = targetLabel(input.target);
    const inSentence = sentenceLabel(input.sentence);
    const caseValue = clean(facts.case);
    const hasAl = facts.hasAl === true;
    const isAdded = facts.isAdded === true;

    if (id === "manqous_identity" && picked.includes("ليست")) {
        return `أعد (${target}) إلى صورته الأصلية أو إلى صورة معرفة بـ«الـ»${inSentence}. إذا ظهرت ياء لازمة قبلها كسرة مثل «القاضي»، فهذا يثبت أنه اسم منقوص حتى لو حذفت الياء في صورة «قاضٍ».`;
    }
    if (id === "manqous_has_al") {
        if (picked.includes("معرّف") && !hasAl) {
            return `انظر إلى (${target}) نفسها${inSentence}: لا تبدأ بـ«الـ»، لذلك لا نثبت الياء بسبب التعريف. ننتقل للسؤال التالي: هل الاسم مضاف إلى ما بعده؟`;
        }
        if (picked.includes("ليس معرّفًا") && hasAl) {
            return `(${target})${inSentence} معرفة بـ«الـ»؛ وهذه قرينة مباشرة على بقاء ياء الاسم المنقوص. بعد تثبيت الياء نحدد حالته الإعرابية لاختيار العلامة.`;
        }
    }
    if (id === "manqous_is_added") {
        if (picked.includes("هو مضاف") && !isAdded) {
            return `(${target})${inSentence} ليست مضافة إلى اسم أو ضمير بعدها؛ فهي نكرة مجردة. عندئذ ننظر إلى الحالة: النصب يبقي الياء، والرفع أو الجر يحذفانها.`;
        }
        if (picked.includes("غير مضافة") && isAdded) {
            return `(${target})${inSentence} مضافة إلى الاسم الذي بعدها، مثل «قاضي المدينةِ». الإضافة تُبقي ياء الاسم المنقوص، ثم نحدد الرفع أو النصب أو الجر لاختيار العلامة.`;
        }
    }
    if (id === "manqous_case_kept" || id === "manqous_indef_case") {
        const expected = caseValue === "nasb" ? "منصوب" : caseValue === "raf3" ? "مرفوع" : "مجرور";
        const reason = inferCaseReason(caseValue, input.sentence);
        const choseNasb = picked.includes("منصوب");
        const choseRaf3 = picked.includes("مرفوع");
        const choseJar = picked.includes("مجرور");
        if ((choseNasb && caseValue !== "nasb") || (choseRaf3 && caseValue !== "raf3") || (choseJar && caseValue !== "jar")) {
            const pickedReason = choseNasb
                ? "اخترتَ النصب، لكن النصب يحتاج موقعًا منصوبًا كالمفعول به أو خبر كان أو اسم إن"
                : choseRaf3
                  ? "اخترتَ الرفع، لكن الرفع يناسب موقعًا مرفوعًا كالفاعل أو المبتدأ أو نائب الفاعل"
                  : "اخترتَ الجر، لكن الجر يحتاج حرف جر أو إضافة أو تبعية لمجرور";
            const manqousRule = caseValue === "nasb"
                ? "وبعد ثبوت النصب تبقى ياء المنقوص وتظهر عليها الفتحة"
                : caseValue === "raf3"
                  ? "وبعد ثبوت الرفع تقدر الضمة للثقل، وتحذف الياء إن كان الاسم نكرة غير مضافة ولا معرفة بـ«الـ»"
                  : "وبعد ثبوت الجر تقدر الكسرة للثقل، وتحذف الياء إن كان الاسم نكرة غير مضافة ولا معرفة بـ«الـ»";
            return `${pickedReason}. أمّا (${target})${inSentence} فـ${reason}؛ لذلك هو ${expected}. ${manqousRule}.`;
        }
    }
    return null;
}
export function diagnosticFeedbackForChoice(input: DiagnosticFeedbackInput): string | null {
    return firstWordDiagnostic(input) || pronounDiagnostic(input) || manqousDiagnostic(input);
}

