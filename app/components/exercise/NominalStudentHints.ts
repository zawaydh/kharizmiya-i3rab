import type { ExerciseAnswer } from "../../../lib/exercise/model";
import type { PedagogyNode, PedagogyState } from "./ExercisePedagogyTypes";

export function nominalStudentHintText(node: PedagogyNode | null | undefined, picked?: ExerciseAnswer, state?: PedagogyState): string | undefined {
  const id = String(node?.id || "");
  const target = state?.currentTarget || "الفعل";
    if (id.includes("mubtada")) {
        const pickedText = String(picked?.text || "");
        const currentTarget = String(state?.currentTarget || target || "الكلمة المحددة");
        const sentence = String(state?.currentSentence || "");
        if (id === "mubtada_word_type") {
            if (pickedText.includes("فعل")) {
                if (currentTarget.includes("أن")) {
                    return `صحيح أن داخل التركيب (${currentTarget}) فعلًا مضارعًا، لكن المطلوب ليس الفعل وحده. نحن ننظر إلى التركيب كاملًا: (${currentTarget}). سبقت (أن) الفعل المضارع، و(أن) حرف مصدري، لذلك يؤول التركيب بمصدر، مثل: أن تتعلم ← تعلّمك، وأن تنجح ← نجاحك. إذن نعامله هنا معاملة الاسم.`;
                }
                return `الفعل يدل على حدث مرتبط بزمن، مثل: كتب، يكتب، اكتب. اختبر (${currentTarget}) في جملة ${sentence}: هل يدل على حدث وقع أو يقع أو سيقع؟ إذا كان مثل (العلم) فهو لا يدل على حدث، وإذا كان مثل (هذا) فهو يدل على مشار إليه. إذن لا نعده فعلًا.`;
            }
            if (pickedText.includes("حرف")) {
                if (["هذا", "هذه", "ذلك", "تلك", "هؤلاء"].some((w) => currentTarget.includes(w))) {
                    return `قد تظن أن (${currentTarget}) حرف لأنه قصير، لكن عدد الحروف لا يحدد نوع الكلمة. (${currentTarget}) من أسماء الإشارة، وأسماء الإشارة أسماء في النحو، وتعامل معاملة الأسماء في الإعراب، لكنها أسماء مبنية.`;
                }
                if (["أنا", "نحن", "هو", "هي", "أنت", "هم"].some((w) => currentTarget.includes(w))) {
                    return `(${currentTarget}) ضمير، والضمائر أسماء مبنية. ليست حروفًا؛ لأنها تدل على متكلم أو مخاطب أو غائب، ويمكن أن تقع في موقع المبتدأ.`;
                }
                if (["الذي", "التي", "اللذان", "الذين"].some((w) => currentTarget.includes(w))) {
                    return `(${currentTarget}) اسم موصول، والاسم الموصول اسم مبني يحتاج صلة بعده توضحه. هو ليس حرفًا، بل يعامل معاملة الأسماء في الإعراب.`;
                }
                if (currentTarget.includes("أن")) {
                    return `لا نعرب (أن) وحدها هنا؛ ننظر إلى التركيب كاملًا: (${currentTarget}). هذا مصدر مؤول، أي يمكن تأويله بمصدر صريح، فيعامل معاملة الاسم.`;
                }
                return `الحرف مثل: من، إلى، في، ولا يظهر معناه كاملًا إلا مع غيره. أما (${currentTarget}) فاستعماله هنا استعمال اسم أو ما يؤول باسم، لذلك نتابع فحص دوره في الجملة.`;
            }
        }
        if (id === "mubtada_function_gate") {
            if (pickedText.includes("قامت") || pickedText.includes("فاعل")) {
                return `الفاعل نبحث عنه بعد فعل ونسأل: من فعل؟ في جملة ${sentence} نحن نفحص (${currentTarget}) نفسه: هل جاء بعد فعل فقام به، أم بدأنا الحديث عنه؟ لا تجعل الكلمة التي بعده هي محور الجملة قبل إعراب الكلمة المحددة.`;
            }
            if (pickedText.includes("وقع")) {
                return `المفعول به يحتاج فعلًا يقع عليه. في جملة ${sentence} اسأل: هل وقع فعل على (${currentTarget})، أم بدأنا الحديث عنه ثم جاء بعده ما يخبر عنه؟`;
            }
            return `انظر إلى موقع (${currentTarget}) ومعناه في الجملة: هل بدأنا الحديث عنه؟ إذا نعم فهو يؤدي وظيفة المبتدأ.`;
        }
        if (id === "mubtada_masdar_term") {
            return `لقد ثبت أن (${currentTarget}) تركيب يمكن تأويله بمصدر صريح، مثل «أن تتعلم» = «تعلّمك». هذا النوع يسمى مصدرًا مؤولًا، ويأخذ هنا موقع المبتدأ.`;
        }
        if (id === "mubtada_start") {
            if (pickedText.includes("معرب")) {
                return `الاسم المعرب تتغير علامة آخره بحسب موقعه، مثل: طالبٌ، طالبًا، طالبٍ. اختبر (${currentTarget}): هل يتغير آخره بهذه الطريقة، أم يبقى على صورة واحدة مثل أسماء الإشارة والضمائر والموصولات؟`;
            }
            if (pickedText.includes("مبني")) {
                return `الاسم المبني يلزم صورة واحدة مثل: هذا، أنا، الذي. إذا كانت الكلمة (${currentTarget}) مثل العلم أو الطالبان أو أبوك فهي ليست مبنية؛ أما إن كانت اسم إشارة أو ضميرًا أو موصولًا فهي مبنية في محل رفع.`;
            }
            if (pickedText.includes("مصدر")) {
                return `المصدر المؤول تركيب من حرف مصدري وفعل، مثل: أن تتعلم. لا ننظر إلى الفعل وحده، بل إلى التركيب كاملًا، ثم نؤوله بمصدر: أن تتعلم ← تعلّمك، وأن تنجح ← نجاحك. هل (${currentTarget}) تركيب من هذا النوع، أم كلمة مفردة؟`;
            }
        }
        if (id === "mubtada_built") {
            if (pickedText.includes("إشارة"))
                return `اسم الإشارة يدل على مشار إليه مثل: هذا، هذه، ذلك. هل (${currentTarget}) يشير إلى شيء، أم يدل على متكلم/غائب، أم يحتاج صلة بعده؟`;
            if (pickedText.includes("ضمير"))
                return `الضمير يدل على متكلم أو مخاطب أو غائب مثل: أنا، أنت، هو. هل (${currentTarget}) ضمير، أم اسم إشارة، أم اسم موصول؟`;
            if (pickedText.includes("موصول"))
                return `الاسم الموصول مثل: الذي، التي، من، ما، ويحتاج صلة بعده توضحه. هل (${currentTarget}) من هذه الأسماء ويحتاج صلة، أم هو نوع مبني آخر؟`;
            if (pickedText.includes("استفهام"))
                return `اسم الاستفهام يطلب جوابًا مثل: من؟ ما؟ أين؟ إذا لم تكن الجملة سؤالًا حقيقيًا فراجع نوع (${currentTarget}).`;
            if (pickedText.includes("شرط"))
                return `اسم الشرط يربط فعل الشرط بجوابه مثل: من يجتهد ينجح. هل في الجملة شرط وجواب، أم أن (${currentTarget}) يؤدي معنى آخر؟`;
            if (pickedText.includes("كم"))
                return `كم الخبرية تدل على الكثرة ولا تطلب جوابًا. هل الكلمة المحددة هي (كم) بهذا المعنى، أم اسم مبني آخر؟`;
        }
        if (id === "mubtada_number") {
            if (pickedText.includes("مثنى"))
                return `المثنى يدل على اثنين، وغالبًا ينتهي بـ(ان) رفعًا أو (ين) نصبًا وجرًا، مثل: الطالبان، المعلمين. انظر إلى (${currentTarget}): هل يدل على اثنين؟ وهل يحمل علامة التثنية؟`;
            if (pickedText.includes("جمع مذكر"))
                return `جمع المذكر السالم يدل على جماعة ذكور عاقلة، وينتهي غالبًا بـ(ون) في الرفع أو (ين) في النصب والجر. هل (${currentTarget}) ينتهي بـ(ون/ين) ويدل على جماعة ذكور؟`;
            if (pickedText.includes("جمع مؤنث"))
                return `جمع المؤنث السالم ينتهي غالبًا بـ(ات)، مثل: الطالبات، المؤمنات. هل (${currentTarget}) ينتهي بـ(ات) ويدل على جماعة مؤنثة؟`;
            if (pickedText.includes("جمع تكسير"))
                return `جمع التكسير يدل على أكثر من اثنين وتتغير فيه صورة المفرد، مثل: كتاب ← كتب، رجل ← رجال. هل (${currentTarget}) جمع بهذا المعنى، أم يدل على واحد؟`;
            if (pickedText.includes("الأسماء الخمسة"))
                return `الأسماء الخمسة هي: أب، أخ، حم، فو، ذو بمعنى صاحب. ولا تعرب بالحروف إلا بشروط: أن تكون مفردة، مكبرة، مضافة، وغير مضافة إلى ياء المتكلم، وأن تكون (ذو) بمعنى صاحب. هل (${currentTarget}) واحد منها وتحققت شروطه؟`;
            if (pickedText.includes("مفرد"))
                return `المفرد يدل على واحد أو واحدة. انظر إلى (${currentTarget}): هل يدل على واحد، أم على اثنين، أم جماعة، أم هو من الأسماء الخمسة؟`;
        }
    }
    if (id.includes("khabar")) {
        const pickedText = String(picked?.text || "");
        const sentence = String(state?.currentSentence || "");
        const currentTarget = String(state?.currentTarget || target || "الكلمة المحددة");
        if (id === "khabar_meaning_gate") {
            if (pickedText.includes("نعت")) {
                if (sentence.includes("محمد") && sentence.includes("هو") && sentence.includes("المجتهد")) {
                    return "لو حذفنا (هو) أصبحت الجملة: محمد المجتهد. هنا تتطابق (المجتهد) مع محمد في التعريف، فتبدو تابعة له نعتًا. أما في الجملة الأصلية فـ(هو) هو الذي شغل موقع الخبر.";
                }
                return "النعت تابع يصف الاسم قبله ويطابقه في التعريف والتنكير، والتذكير والتأنيث، والعدد، والحالة الإعرابية. أما الخبر فيعطي معلومة يتم بها معنى المبتدأ؛ مثل: الجندي شجاع، فـ(شجاع) أخبرت عن الجندي وليست نعتًا له.";
            }
            if (pickedText.includes("فاعل"))
                return `الفاعل يكون مع فعل. أما (${currentTarget}) هنا فليست فعلًا يطلب فاعلًا؛ نحن نسأل: هل أخبرت عن المبتدأ وأتمت المعنى؟`;
            return "اسأل: ما المعلومة التي أضافها المحدد عن المبتدأ؟ إذا أتم المعنى فهو خبر.";
        }
        if (id === "khabar_kind") {
            if (pickedText.includes("مفرد")) {
                if (sentence.includes("الذي"))
                    return "اخترتَ «خبر مفرد». (الذي) اسم موصول مفرد؛ أما (خلقنا) فهي صلة الموصول. لذلك لا نجعل الصلة جزءًا من صورة الخبر، بل ننظر إلى الاسم الموصول نفسه.";
                return `اخترتَ «خبر مفرد». الخبر المفرد هنا ليس جملة ولا شبه جملة. افحص (${currentTarget}): إن كان تركيبًا فيه إسناد كامل أو جارًا ومجرورًا أو ظرفًا فلا يكون خبرًا مفردًا.`;
            }
            if (pickedText.includes("شبه"))
                return `اخترتَ «خبر شبه جملة». شبه الجملة هنا يكون جارًا ومجرورًا مثل «في البيت»، أو ظرفًا مثل «فوق الشجرة». افحص (${currentTarget}): هل هو واحد من هذين التركيبين؟`;
            if (pickedText.includes("جملة"))
                return `اخترتَ «خبر جملة». الجملة لا بد أن يكون فيها إسناد كامل: فعل مع فاعله، أو مبتدأ مع خبره. افحص (${currentTarget}): هل يتكون منه إسناد كامل فعلًا؟`;
        }
        if (id === "khabar_single_start") {
            if (pickedText.includes("كلمة") && state?.facts?.nounKind === "masdar")
                return `(${currentTarget}) تركيب يمكن تأويله بمصدر صريح مثل: «أن تنجح» = «نجاحك»؛ لذلك لا نعامله كلمة مفردة.`;
            if (pickedText.includes("تركيب") && state?.facts?.nounKind !== "masdar")
                return `(${currentTarget}) كلمة واحدة في هذا المستوى، وليست تركيبًا يؤول بمصدر؛ وبعد ذلك نحدد هل هي معربة أم مبنية.`;
            return `انظر إلى (${currentTarget}) كاملة: هل هي كلمة واحدة، أم تركيب يمكن تأويله باسم صريح؟`;
        }
        if (id === "khabar_single_inflection") {
            if (pickedText.includes("مبني") && state?.facts?.nounKind === "mu3rab")
                return `(${currentTarget}) اسم معرب تتغير علامته بحسب موقعه؛ لذلك نكمل إلى صورة الاسم وعلامة رفعه.`;
            if (pickedText.includes("معرب") && state?.facts?.nounKind === "mabni")
                return `(${currentTarget}) اسم مبني يلزم صورة واحدة، مثل الضمير واسم الإشارة والاسم الموصول؛ لذلك يكون في محل رفع خبر.`;
            return `الاسم المعرب تتغير علامته بحسب موقعه، أما الاسم المبني فيلزم صورة واحدة.`;
        }
        if (id === "khabar_single_number") {
            const isFiveNounTarget = String(currentTarget || "").includes("أبو") || String(currentTarget || "").includes("أبا") || String(currentTarget || "").includes("أبي") || String(currentTarget || "").includes("أخو") || String(currentTarget || "").includes("أخا") || String(currentTarget || "").includes("أخي") || String(currentTarget || "").includes("حمو") || String(currentTarget || "").includes("فوك") || String(currentTarget || "").includes("فو") || String(currentTarget || "").includes("ذو") || String(currentTarget || "").includes("ذا") || String(currentTarget || "").includes("ذي");
            if (pickedText.includes("مفرد") && isFiveNounTarget) {
                return `أحسنت، (${currentTarget}) يدل على واحد فعلًا، لكنه من الأسماء الخمسة، فإذا تحققت شروطها أعرب بالحروف؛ وهنا يكون مرفوعًا بالواو لا بالضمة. عد للسؤال واختر: من الأسماء الخمسة.`;
            }
        }
        if (id === "khabar_sentence_type") {
            if (pickedText.includes("فعلية"))
                return "الجملة الفعلية تبدأ بفعل، مثل: يستقبل الضيوف. أما (أبوه حاضر) أو (أخلاقه حسنة) فقد بدأت باسم، فهي جملة اسمية.";
            if (pickedText.includes("اسمية"))
                return "الجملة الاسمية تبدأ باسم. داخلها مبتدأ ثان وخبره؛ مثال: أخلاقه حسنة: أخلاقه مبتدأ ثان، وحسنة خبر المبتدأ الثاني.";
        }
        if (id === "khabar_shibh_type") {
            if (pickedText.includes("جار"))
                return "الجار والمجرور يبدأ بحرف جر مثل: في، على، من، إلى. مثال: في البيت، على الطاولة.";
            if (pickedText.includes("ظرف"))
                return "الظرف يدل غالبًا على مكان أو زمان مثل: فوق، تحت، أمام، عند. مثال: فوق الشجرة، عندنا.";
        }
        if (id.includes("position"))
            return "إذا تقدم شبه الجملة وجاء بعده اسم نكرة مثل: في البيت رجل، نعرب شبه الجملة خبرًا مقدمًا، والاسم النكرة مبتدأ مؤخرًا.";
    }
  return undefined;
}
