import type { PedagogyNode, PedagogyState } from "./ExercisePedagogyTypes";

function stripArabicTashkeel(value: string) {
    return String(value || "").replace(/[\u064B-\u065F\u0670]/g, "").trim();
}
export function innaParticleName(state: PedagogyState) {
    const raw = stripArabicTashkeel(String(state?.facts?.particleLabel || "إن"));
    if (raw.includes("إنما"))
        return "إنما";
    if (raw.includes("لكن"))
        return "لكن";
    if (raw.includes("كأن"))
        return "كأن";
    if (raw.includes("ليت"))
        return "ليت";
    if (raw.includes("لعل"))
        return "لعل";
    if (raw.includes("أن"))
        return "أن";
    return "إن";
}
export function innaGenericLabel(text: string, state: PedagogyState) {
    const particle = innaParticleName(state);
    if (!particle || particle === "إنما")
        return text;
    return String(text || "").replace(/اسم إن/g, `اسم ${particle}`).replace(/خبر إن/g, `خبر ${particle}`);
}
export function innaParticleMeaningLabel(state: PedagogyState) {
    const facts = state?.facts || {};
    const particle = innaParticleName(state);
    const meaning = String(facts.particleMeaning || "");
    if (particle === "كأن" || meaning === "tashbih")
        return "التشبيه";
    if (particle === "لكن" || meaning === "istidrak")
        return "الاستدراك";
    if (particle === "ليت" || meaning === "tamanni")
        return "التمني";
    if (particle === "لعل" || meaning === "tarajji")
        return "الترجي";
    if (particle === "إنما" || meaning === "kaffa")
        return "الكف عن العمل";
    return "التوكيد";
}
function innaParticleI3rabLine(state: PedagogyState) {
    const particle = innaParticleName(state);
    if (particle === "إنما") {
        return "تنبيه نحوي: (إنما) مركبة من (إنَّ) و(ما) الكافة. إنَّ حرف توكيد ونصب مكفوف عن العمل بـ(ما)، و(ما) كافة لا محل لها من الإعراب؛ لذلك لا تنصب إنَّ اسمًا ولا ترفع خبرًا بعدها.";
    }
    const map: Record<string, string> = {
        "إن": "إنَّ: حرف نصب وتوكيد مشبَّه بالفعل، ينصب الاسم ويرفع الخبر.",
        "أن": "أنَّ: حرف نصب وتوكيد مشبَّه بالفعل، ينصب الاسم ويرفع الخبر.",
        "كأن": "كأنَّ: حرف نصب وتشبيه مشبَّه بالفعل، ينصب الاسم ويرفع الخبر.",
        "لكن": "لكنَّ: حرف نصب واستدراك مشبَّه بالفعل، ينصب الاسم ويرفع الخبر.",
        "ليت": "ليتَ: حرف نصب وتمنٍّ مشبَّه بالفعل، ينصب الاسم ويرفع الخبر.",
        "لعل": "لعلَّ: حرف نصب وترجٍّ مشبَّه بالفعل، ينصب الاسم ويرفع الخبر.",
    };
    return `تنبيه نحوي: ${map[particle] || map["إن"]}`;
}
export function innaIsConnectedPronounTarget(value: string) {
    const clean = stripArabicTashkeel(String(value || "")).replace(/[()«».,،؛؟!\s]/g, "");
    return ["ك", "ه", "ها", "هم", "هما", "هن", "ي", "ني", "نا"].includes(clean);
}
export function customInnaResultNode(node: PedagogyNode | null | undefined, state: PedagogyState): PedagogyNode | null {
    if (!node || node.type !== "result")
        return null;
    const start = String(state?.currentSentence || "");
    const target = String(state?.currentTarget || "");
    const id = String(node.id || "");
    const particle = innaParticleName(state);
    const labelText = innaGenericLabel(String(node.text || ""), state);
    if (id === "R_inna_kaffa_mubtada") {
        if (target.includes("المؤمنون")) {
            return {
                ...node,
                text: `المؤمنون: مبتدأ مرفوع وعلامة رفعه الواو لأنه جمع مذكر سالم.
إخوة: خبر مرفوع وعلامة رفعه الضمة الظاهرة.
تنبيه: إنما لا تعمل عمل إن؛ لأن ما الكافة كفّت إن عن العمل.`
            };
        }
        return { ...node, text: labelText };
    }
    if (id === "R_inna_khabar_verbal_sentence") {
        if (target.includes("يقرأ")) {
            return {
                ...node,
                text: `يقرأُ: فعل مضارع مرفوع وعلامة رفعه الضمة الظاهرة.
والفاعل ضمير مستتر تقديره هو يعود على اسم ${particle}.
والجملة الفعلية (يقرأ) في محل رفع خبر ${particle}.`
            };
        }
        return { ...node, text: innaGenericLabel("جملة فعلية في محل رفع خبر إن. نُعرب داخلها الفعل والفاعل، ثم نحكم على الجملة كلها بأنها خبر.", state) };
    }
    if (id === "R_inna_khabar_nominal_sentence") {
        const haystack = `${start} ${target}`;
        if (haystack.includes("أخلاق")) {
            return {
                ...node,
                text: `أخلاقُه: مبتدأ ثانٍ مرفوع، وهو مضاف.
الهاء: ضمير متصل مبني في محل جر مضاف إليه.
حسنةٌ: خبر المبتدأ الثاني مرفوع وعلامة رفعه الضمة الظاهرة.
والجملة الاسمية (أخلاقه حسنة) في محل رفع خبر ${particle}.`
            };
        }
        return { ...node, text: innaGenericLabel("جملة اسمية في محل رفع خبر إن. نُعرب داخلها المبتدأ والخبر الداخليين، ثم نحكم على الجملة كلها بأنها خبر.", state) };
    }
    return { ...node, text: labelText };
}
export function innaNasikhFinalIntro(state: PedagogyState) {
    const start = String(state?.currentSentence || "");
    const hasInna = /إن|أن|كأن|لكن|ليت|لعل/.test(start) || state?.facts?.particleLabel;
    if (!hasInna)
        return "";
    return innaParticleI3rabLine(state);
}
