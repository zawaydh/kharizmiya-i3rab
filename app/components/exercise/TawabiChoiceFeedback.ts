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
    // TAWABI_RELATION_FIRST_V22
    if (id === "tawabi_naat_discovery") {
        if (isHelp) {
            if (roleKind === "sentence") {
                const linkText = String(facts?.linkText || "").trim();
                return `ابدأ بالتمييز: (${matbu3}) نكرة، وبعدها الجملة (${targetText}) جاءت لتصفها. تذكّر: الجمل وشبه الجمل بعد النكرات صفات غالبًا، وبعد المعارف أحوالًا غالبًا${linkText ? `. وفي الجملة رابط يعود على المنعوت: ${linkText}` : ""}.`;
            }
            if (roleKind === "shibh")
                return `ابدأ بالتمييز: شبه الجملة بعد النكرة تكون صفة غالبًا؛ وهنا (${targetText}) تصف (${matbu3}). وبعد المعارف تكون أحوالًا غالبًا.`;
            return `ابدأ بنوع العلاقة: (${targetText}) تصف (${matbu3}) وتبيّن صفة فيه؛ هذه قرينة النعت.`;
        }
        if (pickedText.includes("توكيد") || pickedText.includes("يكرر"))
            return `هذه قرينة التوكيد، لا النعت. هنا (${targetText}) تضيف وصفًا لـ(${matbu3}).`;
        if (pickedText.includes("حرف عطف"))
            return `هذه قرينة عطف النسق. هنا لا يحكم العلاقة حرف عطف؛ بل (${targetText}) تصف (${matbu3}).`;
        if (pickedText.includes("المقصود بالحكم"))
            return `هذه قرينة البدل. هنا (${matbu3}) هو الموصوف، و(${targetText}) تبين صفة فيه؛ لذلك العلاقة نعت.`;
        return `صحيح؛ أثبتنا علاقة الوصف أولًا، ثم نحدد صورة النعت في الخطوة التالية.`;
    }
    if (id === "tawabi_naat_kind") {
        const linkText = String(facts?.linkText || "").trim();
        if (isHelp) {
            if (roleKind === "sentence")
                return `في (${targetText}) إسناد كامل، فهي نعت جملة. (${matbu3}) نكرة، والجملة بعدها صفة غالبًا${linkText ? `، وفيها رابط يعود على المنعوت: ${linkText}` : ""}.`;
            if (roleKind === "shibh")
                return `(${targetText}) جار ومجرور أو ظرف بلا إسناد كامل؛ لذلك صورته نعت شبه جملة.`;
            return `(${targetText}) كلمة واحدة تصف (${matbu3}) مباشرة؛ لذلك صورته نعت مفرد.`;
        }
        if (roleKind === "sentence" && !pickedText.includes("نعت جملة"))
            return `في (${targetText}) إسناد كامل؛ لذلك صورته نعت جملة، لا «${pickedText}».`;
        if (roleKind === "shibh" && !pickedText.includes("نعت شبه جملة"))
            return `(${targetText}) جار ومجرور أو ظرف بلا إسناد كامل؛ لذلك صورته نعت شبه جملة.`;
        if (roleKind === "mu3rab" && !pickedText.includes("نعت مفرد"))
            return `(${targetText}) كلمة واحدة تصف المنعوت مباشرة؛ لذلك صورته نعت مفرد.`;
        return `صحيح؛ حددت صورة النعت قبل الانتقال إلى إعرابه.`;
    }
    if (id === "tawabi_atf_discovery") {
        const connector = String(facts?.connector || "حرف العطف");
        if (isHelp)
            return `قبل (${targetText}) يوجد حرف عطف، وهو (${connector})؛ ومن حروف العطف: الواو، الفاء، ثم، أو، أم، بل، لا، لكن، حتى؛ وهذه قرينتك. بعد إثبات العطف، المعطوف يتبع المعطوف عليه في الحالة الإعرابية.`;
        if (pickedText.includes("تصف"))
            return `هذه قرينة النعت. هنا (${connector}) حرف عطف ربط (${targetText}) بما قبله وأشركه معه في الحكم.`;
        if (pickedText.includes("توكيد") || pickedText.includes("يكرر"))
            return `هذه قرينة التوكيد. هنا القرينة المباشرة هي (${connector})، وهو حرف عطف.`;
        if (pickedText.includes("المقصود بالحكم"))
            return `هذه قرينة البدل. هنا (${connector}) حرف عطف أشرك (${targetText}) مع ما قبله؛ لذلك العلاقة عطف.`;
        return `صحيح؛ ثبت العطف من حرف العطف، وننتقل الآن إلى حالة المعطوف عليه.`;
    }
    if (id === "tawabi_tawkid_discovery") {
        const kind = String(facts?.tawkidKind || "");
        const semanticWord = ["نفس", "عين", "كل", "جميع", "عامة", "كلا", "كلتا"].find((word) => targetText.includes(word)) || "لفظ توكيد معنوي";
        const semanticPronoun = targetText.endsWith("هما") ? "هما"
            : targetText.endsWith("هم") ? "هم"
              : targetText.endsWith("هن") ? "هن"
                : targetText.endsWith("ها") ? "ها"
                  : targetText.endsWith("ه") ? "الهاء"
                    : "ضمير متصل";
        if (isHelp)
            return kind === "lafzi"
                ? `تكرر (${targetText}) بعد (${matbu3}) من غير حرف عطف ومن غير وصف جديد؛ هذه قرينة التوكيد.`
                : `(${targetText}) يشتمل على (${semanticWord})، واتصل باللفظ الضمير (${semanticPronoun}) العائد على (${matbu3})؛ وهذه قرينة التوكيد المعنوي.`;
        if (pickedText.includes("تصف"))
            return `هذه قرينة النعت. هنا لا يضيف (${targetText}) وصفًا جديدًا؛ بل يقوّي معنى (${matbu3}).`;
        if (pickedText.includes("حرف عطف"))
            return `هذه قرينة العطف. هنا لا يقوم حرف عطف بالعلاقة؛ القرينة هي ${kind === "lafzi" ? "تكرار اللفظ" : `لفظ (${semanticWord}) مع الضمير العائد`}.`;
        if (pickedText.includes("المقصود بالحكم"))
            return `هذه قرينة البدل. التوكيد لا يجعل التابع مقصودًا بدل المؤكَّد؛ بل يثبت معناه.`;
        return `صحيح؛ ثبتت علاقة التوكيد، ونحدد نوعه في الخطوة التالية.`;
    }
    if (id === "tawabi_badal_discovery") {
        const badalKind = String(facts?.badalKind || "");
        if (isHelp) {
            const key = `تذكّر مفتاح البدل: التابع هو المقصود بالحكم، والمتبوع (${matbu3}) تمهيد له ويمكن غالبًا حذفه.`;
            if (badalKind === "مطابق")
                return `${key} هنا (${targetText}) هو عين (${matbu3}) نفسه.`;
            if (badalKind === "بعض من كل")
                return `${key} هنا (${targetText}) جزء مادي حقيقي من (${matbu3})؛ وهذه قرينة تربطه بالمبدل منه من غير أن تجعله مجرد وصف.`;
            if (badalKind === "اشتمال")
                return `${key} هنا (${targetText}) معنى أو صفة يشتمل عليها (${matbu3}) وليست جزءًا ماديًا منه.`;
            return key;
        }
        if (pickedText.includes("تصف"))
            return `هذه قرينة النعت. في البدل يكون التابع نفسه هو المقصود بالحكم، لا مجرد وصف للمتبوع.`;
        if (pickedText.includes("توكيد") || pickedText.includes("يكرر"))
            return `هذه قرينة التوكيد. في البدل التابع نفسه هو المقصود بالحكم، لا مجرد تقوية معنى المتبوع.`;
        if (pickedText.includes("حرف عطف"))
            return `هذه قرينة عطف النسق. في هذا المثال لا يقوم حرف عطف بهذه الوظيفة؛ اختبر من المقصود بالحكم.`;
        return `صحيح؛ ثبت أن التابع هو المقصود بالحكم، ونحدد نوع البدل في الخطوة التالية.`;
    }
    if (id === "tawabi_badal_kind") {
        const badalKind = String(facts?.badalKind || "");
        if (isHelp) {
            if (badalKind === "مطابق")
                return `(${targetText}) هو عين (${matbu3}) نفسه ويمكن أن يحل محله؛ فهذا بدل مطابق.`;
            if (badalKind === "بعض من كل")
                return `(${targetText}) جزء مادي حقيقي من (${matbu3})؛ فهذا بدل بعض من كل.`;
            return `(${targetText}) معنى أو صفة يشتمل عليها (${matbu3}) وليست جزءًا ماديًا منه؛ فهذا بدل اشتمال.`;
        }
        if (pickedText.includes("مطابق") && badalKind !== "مطابق")
            return badalKind === "بعض من كل"
                ? `البدل المطابق يكون التابع فيه هو المبدل منه نفسه، أما (${targetText}) هنا فهو جزء حقيقي من (${matbu3})؛ لذلك ليس بدلًا مطابقًا.`
                : `البدل المطابق يكون التابع فيه هو المبدل منه نفسه، أما (${targetText}) هنا فمعنى يشتمل عليه (${matbu3}) وليس هو عينه.`;
        if (pickedText.includes("بعض") && badalKind !== "بعض من كل")
            return `بدل بعض من كل يكون جزءًا ماديًا حقيقيًا من المبدل منه. هذه ليست العلاقة هنا.`;
        if (pickedText.includes("اشتمال") && badalKind !== "اشتمال")
            return `بدل الاشتمال معنى أو صفة يشتمل عليها المبدل منه وليست جزءًا ماديًا منه. هذه ليست العلاقة هنا.`;
        return badalKind === "مطابق"
            ? `صحيح؛ (${targetText}) بدل مطابق لأنه هو (${matbu3}) نفسه.`
            : badalKind === "بعض من كل"
              ? `صحيح؛ (${targetText}) بدل بعض من كل لأنه جزء حقيقي من (${matbu3}).`
              : `صحيح؛ (${targetText}) بدل اشتمال لأنه معنى يتعلق بـ(${matbu3}) وليس جزءًا ماديًا منه.`;
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
            return `اخترتَ «${pickedText}»، لكن (${targetText}) يصف (${matbu3}) أو يخصصه؛ لذلك العلاقة وصف، ومنها نصل إلى النعت.`;
        if (facts?.relationKind === "coordination" && !pickedText.includes("شارك"))
            return `اخترتَ «${pickedText}»، لكن قبل (${targetText}) يوجد ${facts?.connector || "حرف عطف"}؛ وهذا جعلها تشارك (${matbu3}) في الحكم، لذلك العلاقة عطف.`;
        if (facts?.relationKind === "emphasis" && !pickedText.includes("أكد"))
            return `اخترتَ «${pickedText}»، لكن (${targetText}) لا يصف (${matbu3}) بصفة جديدة ولا يفسره؛ بل يقوي معناه أو يثبت شموله، لذلك العلاقة توكيد.`;
        if (facts?.relationKind === "substitution" && !pickedText.includes("فسر"))
            return `اخترتَ «${pickedText}»، لكن اختبر البدل: احذف (${matbu3}) وضع (${targetText}) مكانه. في هذا المثال تبقى الجملة مفهومة؛ لذلك العلاقة بدل.`;
        return correctRelation;
    }
    if (id === "tawabi_term") {
        const naatNote = facts?.tawabiTerm === "naat" ? " النعت المفرد يطابق منعوته في الإعراب والعدد والنوع والتعريف/التنكير، أما النعت الجملة أو شبه الجملة فيحتاج منعوتًا نكرة ورابطًا أو تقديرًا." : "";
        if (isHelp)
            return `العلاقة هي ${tawabiRelationHintName(String(facts?.relationKind || ""))}؛ لذلك المصطلح المناسب هو: ${correctTerm}.${naatNote}`;
        if (!pickedText.includes(correctTerm))
            return `اخترتَ «${pickedText}»، لكن المصطلح يُبنى على العلاقة التي أثبتناها: علاقة (${targetText}) بـ(${matbu3}) هي ${tawabiRelationHintName(String(facts?.relationKind || ""))}؛ لذلك المصطلح الصحيح هو ${correctTerm}.${naatNote}`;
        return `صحيح؛ (${targetText}) ${correctTerm} لأن علاقته بـ(${matbu3}) هي ${tawabiRelationHintName(String(facts?.relationKind || ""))}.${naatNote}`;
    }
    if (id === "tawabi_tawkid_kind") {
        const kind = String(facts?.tawkidKind || "");
        if (isHelp)
            return kind === "lafzi"
                ? `لاحظ أن (${targetText}) أعادت اللفظ نفسه؛ إذن هذا توكيد لفظي.`
                : `لاحظ أن (${targetText}) من ألفاظ التوكيد المعنوي: نفس، عين، كل، جميع، عامة، كلا، كلتا، واتصل باللفظ ضمير يعود على المؤكَّد.`;
        if (kind === "lafzi" && !pickedText.includes("تكرار"))
            return `اخترتَ «${pickedText}»، لكن التوكيد هنا حصل بتكرار اللفظ نفسه؛ لذلك هو توكيد لفظي، لا معنوي.`;
        if (kind === "manawi" && !pickedText.includes("ألفاظ"))
            return `اخترتَ «${pickedText}»، لكن اللفظ نفسه لم يتكرر؛ بل جاءت كلمة من ألفاظ التوكيد المعنوي: نفس، عين، كل، جميع، عامة، كلا، كلتا، واتصل باللفظ ضمير يعود على المؤكَّد.`;
        return kind === "lafzi" ? "صحيح؛ هذا توكيد لفظي لأنه أعاد اللفظ." : "صحيح؛ هذا توكيد معنوي لأنه جاء بلفظ من ألفاظه.";
    }
    if (id === "tawabi_case" && String(facts?.tawabiTerm || "") === "naat" && (roleKind === "sentence" || roleKind === "shibh")) {
        const phraseLabel = roleKind === "sentence" ? "الجملة" : "شبه الجملة";
        const locus = String(facts?.case || "") === "raf3"
            ? "في محل رفع نعت"
            : String(facts?.case || "") === "nasb"
              ? "في محل نصب نعت"
              : "في محل جر نعت";
        if (isHelp)
            return `(${matbu3}) ${matbu3Role}. و(${targetText}) ${phraseLabel} نعت له؛ لذلك لا نبحث عن حركة على التركيب كله، بل عن محله: ${locus}.`;
        if (!pickedText.includes(locus))
            return `راجع محل المنعوت: (${matbu3}) ${matbu3Role}. إذن ${phraseLabel} (${targetText}) تكون ${locus}.`;
        return `صحيح؛ ${phraseLabel} (${targetText}) ${locus}.`;
    }    if (id === "tawabi_case") {
        const inPosition = roleKind === "sentence" || roleKind === "shibh";
        if (isHelp) {
            if (inPosition)
                return `(${targetText}) ${roleKind === "sentence" ? "جملة" : "شبه جملة"} تابعة لـ(${matbu3}). لا نضع حركة على التركيب كله؛ نقول «في محل» بحسب المتبوع. (${matbu3}) ${matbu3Role}، فحدد المحل الموافق.`;
            return `المتبوع هو (${matbu3})، وإعرابه: ${matbu3Role}. لذلك حالة (${targetText}) هي ${correctCase}.`;
        }
        if (inPosition) {
            const wanted = correctCase.includes("رفع") ? "في محل رفع" : correctCase.includes("نصب") ? "في محل نصب" : "في محل جر";
            if (!pickedText.includes(wanted.replace("في محل ", "")))
                return `اختيار «${pickedText}» لا يوافق إعراب (${matbu3}) وهو ${matbu3Role}. ولأن (${targetText}) تركيب تابع، عبّر عن موقعه بصيغة «في محل ...».`;
            return `صحيح؛ (${targetText}) ${wanted} لأنه تابع لـ(${matbu3}) وهو ${matbu3Role}.`;
        }
        if (!pickedText.includes(correctCase.replace("ال", "")))
            return `راجع المتبوع لا التابع وحده: (${matbu3}) ${matbu3Role}. إذن التابع يأخذ ${correctCase}، وليس ${pickedText}.`;
        return `صحيح؛ لأن (${matbu3}) ${matbu3Role}، أخذ (${targetText}) منه ${correctCase}.`;
    }    if (id === "tawabi_form") {
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
            return `اخترتَ «${pickedText}»، لكن المطلوب هو التركيب (${targetText}) كله لا أول كلمة فيه. هذا نعت جملة في محل ${correctCase}؛ لأنه جاء بعد نكرة وفيه رابط يعود على (${matbu3}).`;
        if (roleKind === "shibh" && !pickedText.includes("شبه"))
            return `اخترتَ «${pickedText}»، لكن (${targetText}) ليس اسمًا واحدًا ولا جملة تامة؛ إنه شبه جملة: ظرف أو جار ومجرور، في محل ${correctCase} نعت.`;
        if (roleKind === "mu3rab" && !pickedText.includes("معرب"))
            return `اخترتَ «${pickedText}»، لكن (${targetText}) كلمة ظاهرة تتغير علامتها، وليست اسمًا مبنيًا ولا جملة ولا شبه جملة؛ لذلك نختار: اسم ظاهر معرب.`;
        if (roleKind === "mabni" && !pickedText.includes("مبني"))
            return `اخترتَ «${pickedText}»، لكن (${targetText}) اسم مبني؛ لا تظهر عليه علامة الإعراب، بل يكون في محل ${correctCase} تابعًا للمتبوع.`;
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
            return `الأسماء الخمسة هي: أب، أخ، حم، فو، ذو بمعنى صاحب، وتعرب بالحروف إذا كانت مفردة، مكبرة، مضافة، ومضافة إلى غير ياء المتكلم. أما (${targetText}) فصورته: ${tawabiShapeNameHint(String(facts?.shape || ""), targetText)}.`;
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
