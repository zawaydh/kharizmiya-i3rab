import type { ExerciseAnswer } from "../../../lib/exercise/model";
import type { PedagogyNode, PedagogyState } from "./ExercisePedagogyTypes";
import { isFiveVerbDecision } from "./ExerciseDecisionHelpers";

export function teacherSuccessText(node: PedagogyNode | null | undefined, picked: ExerciseAnswer | null | undefined, state: PedagogyState, piece?: string) {
    const id = String(node?.id || "");
    if (id === "present_build_check") {
        if (state?.facts?.buildConnection === "niswa")
            return "صحيح؛ اتصلت نون النسوة، فبُني المضارع على السكون. ننتقل الآن إلى العامل السابق لتحديد محله الإعرابي.";
        if (state?.facts?.buildConnection === "tawkid")
            return "صحيح؛ اتصلت نون التوكيد اتصالًا مباشرًا، فبُني المضارع على الفتح. ننتقل الآن إلى العامل السابق لتحديد محله الإعرابي.";
        return "صحيح؛ لم تتصل بالمضارع نون النسوة ولا نون التوكيد، لذلك بقي معربًا ونفحص العامل السابق.";
    }
    if (id === "present_niswa_position" || id === "present_tawkid_position") {
        const position = state?.facts?.tool === "nasb" ? "نصب" : state?.facts?.tool === "jazm" ? "جزم" : "رفع";
        return `صحيح؛ علامة البناء ثبتت بالنون، والعامل السابق جعل الفعل في محل ${position}.`;
    }
    if (id === "present_tool_presence") {
        if (state?.facts?.tool === "nasb")
            return "صحيح؛ سبق المضارع حرف نصب، فننتقل إلى صورته لتحديد علامة النصب.";
        if (state?.facts?.tool === "jazm")
            return "صحيح؛ سبق المضارع حرف جزم، فننتقل إلى صورته لتحديد علامة الجزم.";
        return "صحيح؛ لم يسبق المضارع ناصب ولا جازم، فهو مرفوع وننتقل إلى صورته لتحديد علامة الرفع.";
    }
    if (id === "present_nun_niswa") {
        return state?.facts?.nunNiswa ? "صحيح؛ اتصلت نون النسوة فثبت البناء على السكون، وننتقل الآن إلى العامل السابق لتحديد المحل الإعرابي." : "صحيح؛ لم تتصل نون النسوة، فلا نحكم بالبناء هنا ونفحص نون التوكيد.";
    }
    if (id === "present_nun_tawkid") {
        return state?.facts?.nunTawkid ? "صحيح؛ اتصلت نون التوكيد فثبت البناء على الفتح، وننتقل الآن إلى العامل السابق لتحديد المحل الإعرابي." : "صحيح؛ لا نون نسوة ولا نون توكيد، إذن بقي الفعل معربًا، وسنحدد لاحقًا: مرفوع أم منصوب أم مجزوم.";
    }
    if (id === "present_has_tool") {
        return state?.facts?.hasTool ? "صحيح؛ وجدنا عاملًا قبل المضارع، والآن نحدد: ناصب أم جازم؟" : "صحيح؛ لا ناصب ولا جازم، إذن الفعل مرفوع وننتقل لاختيار العلامة.";
    }
    if (id === "present_tool_type") {
        return state?.facts?.tool === "nasb" ? "صحيح؛ الأداة ناصبة، إذن نبحث عن علامة النصب." : "صحيح؛ الأداة جازمة، إذن نبحث عن علامة الجزم.";
    }
    if (isFiveVerbDecision(node)) {
        return state?.facts?.attached === "none" ? "صحيح؛ ليس من الأفعال الخمسة، لذلك لا نستعمل حذف النون أو ثبوتها هنا." : "صحيح؛ هو من الأفعال الخمسة، إذن علامته هنا حذف النون عند النصب أو الجزم، وثبوت النون عند الرفع.";
    }
    if (id.includes("ending"))
        return state?.facts?.ending === "weak" ? "صحيح؛ انتهى الفعل بحرف علة من: ا، و، ي؛ لذلك هو معتل الآخر." : "صحيح؛ لم ينته الفعل بألف أو واو أو ياء؛ لذلك هو صحيح الآخر.";
    if (id.includes("weak"))
        return "صحيح؛ نوع حرف العلة هو الذي يحدد التعذر أو الثقل أو ظهور الفتحة.";
    if (id.includes("mubtada")) {
        if (id === "mubtada_word_type")
            return "صحيح؛ ثبتنا نوع الكلمة المطلوبة أولًا قبل تحديد وظيفتها النحوية.";
        if (id === "mubtada_function_gate")
            return `بما أن «${String(state?.currentTarget || "الكلمة")}» اسم بدأنا به الكلام وبدأنا الحديث عنه، فهو مبتدأ.`;
        if (id === "mubtada_start")
            return "ثبتت صورة المحدد، وننتقل الآن إلى الحكم الإعرابي الذي يناسبها.";
        if (id === "mubtada_built")
            return "صحيح؛ الاسم المبني يعرب في محل رفع مبتدأ، ونوعه يذكر في الإعراب النهائي.";
        if (id === "mubtada_number")
            return "صحيح؛ صورة الاسم هي التي تقودنا إلى علامة الرفع المناسبة.";
        if (id === "mubtada_ending")
            return "صحيح؛ آخر الكلمة يحدد ظهور الضمة أو تقديرها.";
        return piece ? String(piece) : "ثبتت خطوة المبتدأ؛ ننتقل إلى ما يترتب عليها مباشرة.";
    }
    if (id.includes("khabar")) {
        const target = String(state?.currentTarget || "المحدد");
        const facts = state?.facts || {};
        if (id === "khabar_meaning_gate")
            return `«${target}» أخبرت عن المبتدأ وأتمت معنى الجملة؛ لذلك فهي خبر.`;
        if (id === "khabar_kind") {
            const kind = String(facts.khabarKind || "");
            if (kind === "single") return `«${target}» ليست جملة ولا شبه جملة؛ لذلك هي خبر مفرد.`;
            if (kind === "sentence") return `«${target}» جملة كاملة أتمت المعنى عن المبتدأ؛ لذلك الخبر هنا جملة.`;
            if (kind === "shibh") return `«${target}» جار ومجرور أو ظرف أتم المعنى عن المبتدأ؛ لذلك الخبر هنا شبه جملة.`;
        }
        if (id === "khabar_single_start") {
            return String(facts.nounKind || "") === "masdar"
                ? `«${target}» تركيب يمكن تأويله بمصدر صريح؛ لذلك هو تركيب في تأويل اسم.`
                : `«${target}» خبر مفرد من جهة نوع الخبر، وهو هنا كلمة اسمية مفردة في البنية.`;
        }
        if (id === "khabar_sentence_type") {
            const type = String(facts.sentenceType || "") === "verbal" ? "جملة فعلية" : "جملة اسمية";
            return `المحدد «${target}» كله هو الخبر، وقد ثبت أنه ${type}.`;
        }
        if (id.includes("shibh")) {
            const shibh = String(facts.shibhType || "") === "zarf" ? "شبه جملة ظرفية" : "شبه جملة من الجار والمجرور";
            return `ثبت أن «${target}» ${shibh} يؤدي وظيفة الخبر في هذا المثال.`;
        }
        return piece ? String(piece) : `ثبتت وظيفة «${target}» وصورته، وننتقل إلى الحكم والعلامة المناسبة.`;
    }
    return piece ? String(piece) : "ثبتت هذه النتيجة؛ ننتقل إلى الخطوة التي تبني عليها مباشرة.";
}
export function builtNounTypeHintByValue(value?: string) {
    switch (value) {
        case "damir":
            return "الضمير اسم مبني: أنا، أنت، هو، إياه.";
        case "ishara":
            return "اسم الإشارة مبني: هذا، هذه، هؤلاء.";
        case "mawsool":
            return "الاسم الموصول مبني ويحتاج صلة بعده.";
        case "istifham":
            return "اسم الاستفهام مبني: من، ما، أين.";
        case "shart":
            return "اسم الشرط مبني ويربط الشرط بجوابه.";
        case "kam":
            return "كم الخبرية تدل على الكثرة ولا تطلب جوابًا.";
        default:
            return "حدّد نوع الاسم المبني أولًا.";
    }
}

