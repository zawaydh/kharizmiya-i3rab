import type { ExerciseTree } from "../../lib/exercise/model";

const wordKindHint = `الفعل يدل على حدث وزمن، مثل: كتب، يكتب، اكتب. الاسم يقبل علامات مثل: أل، التنوين، الجر. والحرف لا يظهر معناه كاملًا إلا مع غيره.`;
const commandMeaningHint = `هل الفعل يخبر عن حدث وقع أو يقع، أم يطلب من المخاطب حدوثه؟`;
const weakByPresentHint = `نسند فعل الأمر إلى المضارع مع الضمير (هو) لنتأكد من الحرف الأخير في أصل الفعل: ادعُ ← هو يدعو، ارمِ ← هو يرمي، اسعَ ← هو يسعى. فإذا كان الحرف الأخير في الأصل ألفًا أو واوًا أو ياءً ثم حُذف في الأمر، فالأمر مبني على حذف حرف العلة.`;
export const imperativeVerbTree: ExerciseTree = {
    startNodeId: "imperative_word_kind",
    nodes: {
        imperative_word_kind: {
            id: "imperative_word_kind",
            type: "question",
            text: "ما نوع الكلمة المحددة؟",
            hint: wordKindHint,
            answers: [
                { id: "a", text: "فعل: حدث مقترن بزمن", next: "imperative_meaning", eval: { fact: "wordKind", equals: "verb" } },
                { id: "b", text: "اسم", next: "imperative_word_kind", correct: false, hint: "الاسم لا يدل على طلب أو زمن بنفسه. انظر إلى الكلمة المحددة: هل تطلب فعلًا من مخاطب؟" },
                { id: "c", text: "حرف", next: "imperative_word_kind", correct: false, hint: "الحرف لا يظهر معناه كاملًا إلا مع غيره، أما الكلمة المحددة فتدل على عمل مطلوب." },
            ]
        },
        imperative_meaning: {
            id: "imperative_meaning",
            type: "question",
            context: "عرفنا أنها فعل، والآن نحدد دلالته قبل علامة البناء.",
            text: "ما دلالة هذا الفعل؟",
            hint: commandMeaningHint,
            answers: [
                { id: "a", text: "حدث وقع وانتهى", next: "imperative_meaning", correct: false, hint: "هذا معنى الفعل الماضي مثل: كتبَ. أما الكلمة المحددة فهي طلب موجّه للمخاطب." },
                { id: "b", text: "حدث يقع الآن أو يستقبل", next: "imperative_meaning", correct: false, hint: "هذا معنى المضارع مثل: يكتبُ. أما الكلمة المحددة فهي طلب حصول الفعل." },
                { id: "c", text: "طلب حصول الحدث", next: "imperative_connection", eval: { fact: "commandMeaning", equals: "command" } },
            ]
        },
        imperative_connection: {
            id: "imperative_connection",
            type: "question",
            context: "عرفنا أنه فعل أمر. وفعل الأمر مبني دائمًا، فنحدد علامة بنائه مما اتصل به أو من آخره.",
            text: "هل اتصل بآخر فعل الأمر شيء؟",
            hint: "للمساعدة: نسند الفعل إلى المضارع مع الضمير (هو) لنعرف أصل آخره، ثم ننظر هل بقي آخر الفعل وحده أم اتصل به ضمير أو نون. مثال: اكتبنَ ← هو يكتب؛ نرى أن الأصل ينتهي بالباء، وبعده نون النسوة.",
            answers: [
                { id: "a", text: "نعم، اتصل بآخره شيء", next: "imperative_attached_kind", eval: { fact: "attached", notEquals: "none" } },
                { id: "b", text: "لا، لم يتصل به شيء", next: "imperative_ending", eval: { fact: "attached", equals: "none" } },
            ]
        },
        imperative_attached_kind: {
            id: "imperative_attached_kind",
            type: "question",
            context: "عرفنا أن فعل الأمر اتصل بآخره شيء، فلنحدد ما اتصل به لنعرف علامة البناء.",
            text: "ما نوع المتصل بفعل الأمر؟",
            hint: "حدّد المتصل نفسه: نون النسوة، نون التوكيد، ألف الاثنين، واو الجماعة، أو ياء المخاطبة. لكل واحد منها أثر محدد في بناء فعل الأمر وإعراب الضمير.",
            answers: [
                { id: "a", text: "نون النسوة", next: "R_imperative_sukoon_niswa", eval: { fact: "attached", equals: "niswa" }, hint: "نون النسوة تدل على جماعة الإناث، مثل: اكتبْنَ، وهي ضمير متصل مبني على الفتح في محل رفع فاعل." },
                { id: "b", text: "نون التوكيد", next: "R_imperative_fath_tawkid", eval: { fact: "attached", equals: "tawkid" }, hint: "نون التوكيد تؤكد الفعل وتقوّي معناه، مثل: اكتبَنَّ، ولا تدل على مؤنث." },
                { id: "c", text: "ألف الاثنين", next: "R_imperative_delete_noon_alif2", eval: { fact: "attached", equals: "alif2" }, hint: "ألف الاثنين تدل على مخاطبَين اثنين، وفعل الأمر معها مبني على حذف النون." },
                { id: "d", text: "واو الجماعة", next: "R_imperative_delete_noon_waw", eval: { fact: "attached", equals: "waw" }, hint: "واو الجماعة تدل على جماعة المخاطبين، وفعل الأمر معها مبني على حذف النون." },
                { id: "e", text: "ياء المخاطبة", next: "R_imperative_delete_noon_yaa", eval: { fact: "attached", equals: "yaa" }, hint: "ياء المخاطبة تدل على المخاطبة المؤنثة. أعد الفعل إلى مضارعه مع المخاطبة: «أنتِ تكتبين»؛ تظهر النون في المضارع، ثم تُحذف في الأمر «اكتبي»، لذلك يبنى الأمر على حذف النون." },
            ]
        },
        imperative_ending: {
            id: "imperative_ending",
            type: "question",
            context: "عرفنا أنه لم يتصل بآخر فعل الأمر شيء، فننظر إلى آخره لنحدد علامة البناء.",
            text: "هل فعل الأمر صحيح الآخر أم معتل الآخر؟",
            hint: "الصحيح الآخر مثل: اكتبْ، يبنى على السكون. والمعتل الآخر مثل: ادعُ، ارمِ، اسعَ، يبنى على حذف حرف العلة.",
            answers: [
                { id: "a", text: "صحيح الآخر", next: "R_imperative_sukoon_sahih", eval: { fact: "ending", equals: "sahih" } },
                { id: "b", text: "معتل الآخر", next: "imperative_weak_letter", eval: { fact: "ending", equals: "weak" } },
            ]
        },
        imperative_weak_letter: {
            id: "imperative_weak_letter",
            type: "question",
            context: "عرفنا أنه فعل أمر معتل الآخر، فنردّه إلى مضارعه لنعرف حرف العلة المحذوف.",
            text: "ما حرف العلة المحذوف من آخره؟",
            hint: weakByPresentHint,
            answers: [
                { id: "a", text: "الألف", next: "R_imperative_delete_letter_alif", eval: { fact: "weakLetter", equals: "alif" } },
                { id: "b", text: "الواو", next: "R_imperative_delete_letter_waw", eval: { fact: "weakLetter", equals: "waw" } },
                { id: "c", text: "الياء", next: "R_imperative_delete_letter_ya", eval: { fact: "weakLetter", equals: "ya" } },
            ]
        },
        R_imperative_sukoon_sahih: {
            id: "R_imperative_sukoon_sahih",
            type: "result",
            coverage: "imperative.sukoon.sahih",
            text: "فعل أمر مبني على السكون.\nالفاعل: ضمير مستتر وجوبًا تقديره أنت."
        },
        R_imperative_sukoon_niswa: {
            id: "R_imperative_sukoon_niswa",
            type: "result",
            coverage: "imperative.sukoon.niswa",
            text: "فعل أمر مبني على السكون لاتصاله بنون النسوة.\nنون النسوة: ضمير متصل مبني على الفتح في محل رفع فاعل."
        },
        R_imperative_delete_letter_alif: {
            id: "R_imperative_delete_letter_alif",
            type: "result",
            coverage: "imperative.delete_letter.alif",
            text: "فعل أمر مبني على حذف حرف العلة.\nحرف العلة المحذوف: الألف.\nالفاعل: ضمير مستتر وجوبًا تقديره أنت."
        },
        R_imperative_delete_letter_waw: {
            id: "R_imperative_delete_letter_waw",
            type: "result",
            coverage: "imperative.delete_letter.waw",
            text: "فعل أمر مبني على حذف حرف العلة.\nحرف العلة المحذوف: الواو.\nالفاعل: ضمير مستتر وجوبًا تقديره أنت."
        },
        R_imperative_delete_letter_ya: {
            id: "R_imperative_delete_letter_ya",
            type: "result",
            coverage: "imperative.delete_letter.ya",
            text: "فعل أمر مبني على حذف حرف العلة.\nحرف العلة المحذوف: الياء.\nالفاعل: ضمير مستتر وجوبًا تقديره أنت."
        },
        R_imperative_delete_noon_alif2: {
            id: "R_imperative_delete_noon_alif2",
            type: "result",
            coverage: "imperative.delete_noon.alif2",
            text: "فعل أمر مبني على حذف النون؛ لاتصاله بألف الاثنين.\nألف الاثنين: ضمير متصل مبني في محل رفع فاعل."
        },
        R_imperative_delete_noon_waw: {
            id: "R_imperative_delete_noon_waw",
            type: "result",
            coverage: "imperative.delete_noon.waw",
            text: "فعل أمر مبني على حذف النون؛ لاتصاله بواو الجماعة.\nواو الجماعة: ضمير متصل مبني في محل رفع فاعل.\nالألف: ألف فارقة لا محل لها من الإعراب."
        },
        R_imperative_delete_noon_yaa: {
            id: "R_imperative_delete_noon_yaa",
            type: "result",
            coverage: "imperative.delete_noon.yaa",
            text: "فعل أمر مبني على حذف النون؛ لاتصاله بياء المخاطبة.\nياء المخاطبة: ضمير متصل مبني في محل رفع فاعل."
        },
        R_imperative_fath_tawkid: {
            id: "R_imperative_fath_tawkid",
            type: "result",
            coverage: "imperative.fath_tawkid",
            text: "فعل أمر مبني على الفتح لاتصاله بنون التوكيد.\nنون التوكيد: حرف توكيد لا محل له من الإعراب."
        }
    }
};

