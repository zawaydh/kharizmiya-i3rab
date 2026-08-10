import type { ExerciseAnswer } from "../../../lib/exercise/model";
import type { PedagogyNode, PedagogyState } from "./ExercisePedagogyTypes";
import {
    tawabiCaseNounHint,
    tawabiCorrectMarkHint,
    tawabiCorrectRelationHint,
    tawabiCorrectShapeHint,
    tawabiMarkNameHint,
    tawabiRelationHintName,
    tawabiShapeNameHint,
    tawabiTermHintName,
} from "./TawabiHintShared";

export function tawabiStudentHintText(node: PedagogyNode | null | undefined, picked?: ExerciseAnswer, state?: PedagogyState) {
    const id = String(node?.id || "");
    const facts = state?.facts || {};
    const targetText = String(state?.currentTarget || "الكلمة المحددة").trim();
    const matbu3 = String(facts?.matbu3 || "الاسم السابق").trim();
    const matbu3Role = String(facts?.matbu3Role || "متبوع").trim();
    const pickedText = String(picked?.text || "").trim();
    const isHelp = !picked || pickedText.includes("تلميح");
    const correctRelation = tawabiCorrectRelationHint(facts, targetText);
    const correctTerm = tawabiTermHintName(String(facts?.tawabiTerm || ""));
    const correctCase = tawabiCaseNounHint(String(facts?.case || ""));
    const correctShape = tawabiCorrectShapeHint(facts, targetText);
    const correctMark = tawabiCorrectMarkHint(facts, targetText);
    const roleKind = String(facts?.roleKind || "mu3rab");
    if (id === "tawabi_naat_discovery") {
        if (isHelp)
            return `انظر إلى العلاقة بين (${targetText}) و(${matbu3}): هل الكلمة وصفت الاسم السابق وبيّنت صفة فيه؟ ${correctRelation}`;
        if (!pickedText.includes("تصف"))
            return `ليست وظيفة (${targetText}) هنا خبرًا ولا حالًا؛ بل هي تصف (${matbu3}) وتبين صفة فيه، ولذلك تبدأ بها مسار النعت.`;
        return `صحيح؛ (${targetText}) تصف (${matbu3})، فالعلاقة نعت قبل أن ننقل الإعراب.`;
    }
    if (id === "tawabi_atf_discovery") {
        const connector = String(facts?.connector || "حرف العطف");
        if (isHelp)
            return `ابحث قبل (${targetText}) عن حرف العطف. هنا الرابط هو (${connector})، وقد أشرك (${targetText}) مع (${matbu3}) في الحكم.`;
        if (!pickedText.includes("حرف عطف"))
            return `المؤثر هنا هو (${connector})؛ فقد ربط (${targetText}) بـ(${matbu3}) وجعلهما يشتركان في الحكم، ولذلك تبدأ مسار العطف.`;
        return `صحيح؛ (${connector}) حرف عطف أشرك (${targetText}) مع (${matbu3}) في الحكم.`;
    }
    if (id === "tawabi_tawkid_discovery") {
        if (isHelp)
            return `اسأل: هل أضافت (${targetText}) صفة جديدة، أم ثبتت معنى (${matbu3}) ورفعت الشك؟ ${correctRelation}`;
        if (!pickedText.includes("أكدته"))
            return `(${targetText}) لم تصف (${matbu3}) ولم تفسره بدلًا؛ بل أكدت معناه، ولذلك ننتقل بعد ذلك إلى نوع التوكيد.`;
        return `صحيح؛ (${targetText}) أكدت (${matbu3})، والخطوة التالية تحديد: لفظي أم معنوي.`;
    }
    if (id === "tawabi_badal_discovery") {
        const badalKind = String(facts?.badalKind || "");
        if (isHelp)
            return `اختبر العلاقة بين (${targetText}) و(${matbu3}): هل هو المقصود نفسه، أم جزء منه، أم معنى يشتمل عليه؟ هنا النوع: ${badalKind || "بدل"}. ${correctRelation}`;
        if (!pickedText.includes("توضح"))
            return `(${targetText}) لا تصف (${matbu3}) ولا تؤكده؛ بل تبين المقصود منه أو جزءًا أو معنى مرتبطًا به، ولذلك هي بدل.`;
        return `صحيح؛ علاقة (${targetText}) بـ(${matbu3}) هي بدل ${badalKind ? `(${badalKind})` : ""}.`;
    }
    if (id === "tawabi_entry") {
        if (isHelp)
            return `ابدأ من العلاقة لا من المصطلح: هل (${targetText}) يرجع إلى (${matbu3}) فيصفه أو يؤكده أو يشاركه أو يفسره؟ إذا نعم فهو داخل باب التوابع.`;
        if (pickedText.includes("مستقلًا"))
            return `(${targetText}) لا يؤدي هنا معنى مستقلًا كخبر أو ركن جديد؛ بل يرجع إلى (${matbu3}). ${correctRelation}`;
        if (pickedText.includes("هيئة"))
            return `الحال يجيب غالبًا عن سؤال: كيف وقع الفعل؟ أما (${targetText}) فليس بيان هيئة وقت الفعل، بل علاقته بـ(${matbu3}) هي: ${tawabiRelationHintName(String(facts?.relationKind || ""))}.`;
        if (pickedText.includes("ملكية") || pickedText.includes("تخصيص"))
            return `المضاف إليه يكون مجرورًا بسبب الإضافة مثل: كتابُ الطالبِ. أما (${targetText}) فليس مضافًا إليه هنا؛ بل تابع لـ(${matbu3}) ويأخذ منه ${correctCase}.`;
        return correctRelation;
    }
    if (id === "tawabi_relation") {
        if (isHelp)
            return correctRelation;
        if (facts?.relationKind === "description" && !pickedText.includes("وصف"))
            return `ليست العلاقة هنا عطفًا أو توكيدًا أو بدلًا. (${targetText}) يصف (${matbu3}) أو يخصصه؛ لذلك العلاقة وصف، ومنها نصل إلى النعت.`;
        if (facts?.relationKind === "coordination" && !pickedText.includes("شارك"))
            return `ابحث قبل (${targetText}) عن حرف العطف. وجود ${facts?.connector || "حرف عطف"} جعلها تشارك (${matbu3}) في الحكم، لا تصفه ولا تؤكده.`;
        if (facts?.relationKind === "emphasis" && !pickedText.includes("أكد"))
            return `(${targetText}) لا يصف (${matbu3}) بصفة جديدة ولا يفسره، بل يقوي معناه أو يثبت شموله؛ لذلك العلاقة توكيد.`;
        if (facts?.relationKind === "substitution" && !pickedText.includes("فسر"))
            return `اختبر البدل: احذف (${matbu3}) وضع (${targetText}) مكانه. في هذا المثال تبقى الجملة مفهومة؛ لذلك العلاقة بدل، لا مجرد وصف أو توكيد.`;
        return correctRelation;
    }
    if (id === "tawabi_term") {
        const naatNote = facts?.tawabiTerm === "naat" ? " النعت المفرد يطابق منعوته في الإعراب والعدد والنوع والتعريف/التنكير، أما النعت الجملة أو شبه الجملة فيحتاج منعوتًا نكرة ورابطًا أو تقديرًا." : "";
        if (isHelp)
            return `العلاقة هي ${tawabiRelationHintName(String(facts?.relationKind || ""))}؛ لذلك المصطلح المناسب هو: ${correctTerm}.${naatNote}`;
        if (!pickedText.includes(correctTerm))
            return `المصطلح لا يُختار من الحركة. بما أن العلاقة بين (${targetText}) و(${matbu3}) هي ${tawabiRelationHintName(String(facts?.relationKind || ""))}، فالمصطلح الصحيح: ${correctTerm}.${naatNote}`;
        return `صحيح؛ (${targetText}) ${correctTerm} لأن علاقته بـ(${matbu3}) هي ${tawabiRelationHintName(String(facts?.relationKind || ""))}.${naatNote}`;
    }
    if (id === "tawabi_tawkid_kind") {
        const kind = String(facts?.tawkidKind || "");
        if (isHelp)
            return kind === "lafzi"
                ? `لاحظ أن (${targetText}) أعادت اللفظ نفسه؛ إذن هذا توكيد لفظي.`
                : `لاحظ أن (${targetText}) من ألفاظ التوكيد المعنوي، وفيها غالبًا ضمير يعود على المؤكَّد.`;
        if (kind === "lafzi" && !pickedText.includes("تكرار"))
            return `هنا حصل التوكيد بتكرار اللفظ نفسه، لا بلفظ من ألفاظ التوكيد المعنوي؛ إذن هو توكيد لفظي.`;
        if (kind === "manawi" && !pickedText.includes("ألفاظ"))
            return `هنا لم يتكرر اللفظ نفسه، بل جاءت كلمة من ألفاظ التوكيد المعنوي مثل: نفس، عين، كل، جميع، كلا، كلتا.`;
        return kind === "lafzi" ? "صحيح؛ هذا توكيد لفظي لأنه أعاد اللفظ." : "صحيح؛ هذا توكيد معنوي لأنه جاء بلفظ من ألفاظه.";
    }
    if (id === "tawabi_case") {
        if (isHelp)
            return `المتبوع هو (${matbu3})، وإعرابه: ${matbu3Role}. لذلك حالة (${targetText}) هي ${correctCase}.`;
        if (!pickedText.includes(correctCase.replace("ال", "")))
            return `راجع المتبوع لا التابع وحده: (${matbu3}) ${matbu3Role}. إذن التابع يأخذ ${correctCase}، وليس ${pickedText}.`;
        return `صحيح؛ لأن (${matbu3}) ${matbu3Role}، أخذ (${targetText}) منه ${correctCase}.`;
    }
    if (id === "tawabi_form") {
        if (isHelp) {
            if (roleKind === "sentence")
                return `(${targetText}) جملة كاملة، لا نعرب الفعل أو الاسم الأول وحده. وهي نعت جملة لأن المنعوت (${matbu3}) نكرة، وفيها رابط: ${facts?.linkText || "ضمير يعود على المنعوت"}.`;
            if (roleKind === "shibh")
                return `(${targetText}) شبه جملة، والتقدير في النعت غالبًا: (${matbu3}) كائن أو موجود في هذا المكان/الظرف.`;
            if (roleKind === "mabni")
                return `(${targetText}) اسم مبني يلزم صورة واحدة؛ لذلك نقول: في محل ${correctCase} تابعًا لـ(${matbu3}).`;
            return `(${targetText}) اسم ظاهر معرب؛ لذلك نكمل إلى صورته ثم علامته. لا نقفز من الحالة إلى العلامة قبل معرفة الصورة.`;
        }
        if (roleKind === "sentence" && !pickedText.includes("جملة"))
            return `داخل (${targetText}) قد ترى فعلًا أو اسمًا، لكن المطلوب هو التركيب كله. هذا نعت جملة في محل ${correctCase}؛ لأنه جاء بعد نكرة وفيه رابط يعود على (${matbu3}).`;
        if (roleKind === "shibh" && !pickedText.includes("شبه"))
            return `(${targetText}) ليس اسمًا واحدًا ولا جملة تامة؛ إنه شبه جملة: ظرف أو جار ومجرور، في محل ${correctCase} نعت.`;
        if (roleKind === "mu3rab" && !pickedText.includes("معرب"))
            return `(${targetText}) كلمة ظاهرة تتغير علامتها، وليست اسمًا مبنيًا ولا جملة ولا شبه جملة؛ لذلك نختار: اسم ظاهر معرب.`;
        if (roleKind === "mabni" && !pickedText.includes("مبني"))
            return `(${targetText}) اسم مبني؛ لا تظهر عليه علامة الإعراب، بل يكون في محل ${correctCase} تابعًا للمتبوع.`;
        return String(picked?.hint || node?.hint || "حدد صورة التابع من الكلمة أو التركيب المحدد.");
    }
    if (id === "tawabi_shape") {
        if (isHelp)
            return correctShape;
        if (pickedText.includes("مفرد") && facts?.shape !== "singular") {
            if (facts?.shape === "five")
                return `صحيح أن (${targetText}) يدل على واحد، لكنه من الأسماء الخمسة في الإعراب، لا مفرد عادي؛ لذلك يعرب بالحروف.`;
            return `(${targetText}) ليس مفردًا في هذه الخطوة؛ صورته الصحيحة: ${tawabiShapeNameHint(String(facts?.shape || ""), targetText)}. ${correctShape}`;
        }
        if (pickedText.includes("مثنى") && facts?.shape !== "dual")
            return `المثنى يدل على اثنين أو ما يلحق بهما. أما (${targetText}) فصورته الصحيحة: ${tawabiShapeNameHint(String(facts?.shape || ""), targetText)}.`;
        if (pickedText.includes("جمع مذكر") && facts?.shape !== "jms")
            return `جمع المذكر السالم يدل على جماعة ذكور عاقلة وينتهي بواو ونون أو ياء ونون. أما (${targetText}) فصورته: ${tawabiShapeNameHint(String(facts?.shape || ""), targetText)}.`;
        if (pickedText.includes("جمع مؤنث") && facts?.shape !== "jfs")
            return `جمع المؤنث السالم ينتهي غالبًا بألف وتاء زائدتين. أما (${targetText}) فصورته: ${tawabiShapeNameHint(String(facts?.shape || ""), targetText)}.`;
        if (pickedText.includes("جمع تكسير") && facts?.shape !== "jt")
            return `جمع التكسير تتغير فيه صورة المفرد. أما (${targetText}) فصورته: ${tawabiShapeNameHint(String(facts?.shape || ""), targetText)}.`;
        if (pickedText.includes("الأسماء الخمسة") && facts?.shape !== "five")
            return `الأسماء الخمسة هي: أب، أخ، حم، فو، ذو، بشروطها. أما (${targetText}) فصورته: ${tawabiShapeNameHint(String(facts?.shape || ""), targetText)}.`;
        return correctShape;
    }
    if (id === "tawabi_mark") {
        if (isHelp)
            return correctMark;
        const pickedMark = pickedText.includes("الضمة") ? "damma" : pickedText.includes("الفتحة") ? "fatha" : pickedText.includes("الكسرة") ? "kasra" : pickedText.includes("الألف") ? "alif" : pickedText.includes("الياء") ? "yaa" : pickedText.includes("الواو") ? "waw" : "";
        if (pickedMark && pickedMark !== facts?.mark) {
            return `ليست ${pickedText} هنا. القاعدة: الحالة من المتبوع، والعلامة من صورة التابع. (${targetText}) حالته ${correctCase} وصورته ${tawabiShapeNameHint(String(facts?.shape || ""), targetText)}؛ لذلك علامته ${tawabiMarkNameHint(String(facts?.mark || ""))}.`;
        }
        return correctMark;
    }
    return String(picked?.hint || node?.hint || correctRelation);
}
