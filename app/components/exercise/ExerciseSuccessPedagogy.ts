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
            return "صحيح؛ حددنا أن الكلمة اسم بدأنا الحديث عنه، وبذلك نصل إلى وظيفة المبتدأ.";
        if (id === "mubtada_start")
            return "صحيح؛ حددنا صورة المبتدأ: معرب، مبني، أو مصدر مؤول.";
        if (id === "mubtada_built")
            return "صحيح؛ الاسم المبني يعرب في محل رفع مبتدأ، ونوعه يذكر في الإعراب النهائي.";
        if (id === "mubtada_number")
            return "صحيح؛ صورة الاسم هي التي تقودنا إلى علامة الرفع المناسبة.";
        if (id === "mubtada_ending")
            return "صحيح؛ آخر الكلمة يحدد ظهور الضمة أو تقديرها.";
        return piece ? `صحيح؛ أضفنا إلى مسار المبتدأ: ${piece}` : "صحيح؛ نكمل مسار المبتدأ خطوة خطوة.";
    }
    if (id.includes("khabar")) {
        if (id === "khabar_meaning_gate")
            return "صحيح؛ المحدد أخبر عن المبتدأ وأتم معنى الجملة، إذن وظيفته خبر.";
        if (id === "khabar_kind")
            return "صحيح؛ حددنا صورة الخبر، فنكمل بحسب هذه الصورة دون قفز إلى النتيجة.";
        if (id === "khabar_sentence_type")
            return "صحيح؛ الجملة كلها هي الخبر، لا كلمة واحدة منها فقط.";
        if (id.includes("shibh"))
            return "صحيح؛ شبه الجملة قد يكون خبرًا، وقد يتقدم على مبتدأ نكرة في المرحلة المتوسطة.";
        return piece ? `صحيح؛ أضفنا إلى مسار الخبر: ${piece}` : "صحيح؛ نكمل مسار الخبر خطوة خطوة.";
    }
    return piece ? `صحيح؛ هذه الخطوة أضافت إلى التفكير: ${piece}` : "صحيح؛ نكمل خطوة التفكير التالية.";
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

