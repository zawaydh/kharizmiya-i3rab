import type { ExerciseAnswer } from "../../../lib/exercise/model";
import type { PedagogyNode, PedagogyState } from "./ExercisePedagogyTypes";

export function mafoolStudentHintText(node: PedagogyNode | null | undefined, picked?: ExerciseAnswer, state?: PedagogyState): string | undefined {
  const id = String(node?.id || "");
    if (id.startsWith("mafool_")) {
        const facts = state?.facts || {};
        const pickedText = String(picked?.text || "").trim();
        const sentence = String(state?.currentSentence || "").trim();
        const targetText = String(state?.currentTarget || "الكلمة المحددة").trim();
        const firstWord = sentence.replace(/[.؟!،]/g, " ").trim().split(/\s+/)[0] || "أول كلمة";
        const roleKind = String(facts.roleKind || "");
        const shape = String(facts.shape || "");
        const nasbMark = String(facts.nasbMark || "");
        const objectQuestion = String(facts.objectQuestion || "على من أو على ماذا وقع الفعل؟");
        const actor = String(facts.actor || "الفاعل");
        const pronounMeaning = String(facts.pronounMeaning || "");
        const taweel = String(facts.taweel || "المصدر المؤول");
        const fiveConditions = "مفردة، مكبرة، مضافة، ومضافة إلى غير ياء المتكلم";
        if (id === "mafool_context") {
            if (pickedText.includes("جملة اسمية")) {
                return `انظر إلى بداية الجملة: (${firstWord}). هذه كلمة تدل على حدث وزمن، فهي فعل. والجملة التي تبدأ بالفعل غالبًا تكون جملة فعلية.`;
            }
            return `انظر إلى أول الجملة: هل بدأت بفعل يدل على حدث وزمن؟ بعد ذلك نبحث عن الفاعل، ثم عمّا وقع عليه الفعل.`;
        }
        if (id === "mafool_role") {
            if (pickedText === "فعل") {
                if (roleKind === "masdar") {
                    return `داخل (${targetText}) يوجد فعل فعلًا، لكننا لا نعرب الفعل وحده هنا؛ نعرب التركيب كله. هذا التركيب يؤول بمصدر في معنى اسم: (${taweel}). لذلك ننظر إلى دوره في الجملة ونسأل: ${objectQuestion}`;
                }
                if (roleKind === "connected") {
                    return `الفعل هو كلمة الحدث والزمن. أما (${targetText}) فهو ضمير متصل داخل الفعل. لا تحكم من شكله فقط؛ اسأل: ${objectQuestion} ستجد أن الضمير دل على من وقع عليه الفعل${pronounMeaning ? `، ومعناه: ${pronounMeaning}` : ""}.`;
                }
                return `الفعل يدل على حدث وزمن، مثل: كتبَ أو رأى. أما (${targetText}) فهو اسم أو في معنى الاسم. اسأل: ${objectQuestion}`;
            }
            if (pickedText === "فاعل") {
                if (roleKind === "connected") {
                    return `الفاعل هو من قام بالفعل، وفي هذا المثال الفاعل هو (${actor}). أما (${targetText}) فهو ضمير دل على من وقع عليه الفعل. اسأل: ${objectQuestion}`;
                }
                if (roleKind === "masdar") {
                    return `الفاعل هو من قام بالفعل. أما التركيب (${targetText}) فهو الشيء الذي وقع عليه فعل المحبة أو الرجاء أو الكراهية. اسأل: ${objectQuestion} والتقدير: (${taweel}).`;
                }
                return `الفاعل هو من قام بالفعل، وهنا الفاعل هو (${actor}). أما (${targetText}) فهو الشيء أو الشخص الذي وقع عليه الفعل. اسأل: ${objectQuestion}`;
            }
            return `لتمييز المفعول به نسأل بعد معرفة الفعل والفاعل: ${objectQuestion} الجواب هو المفعول به.`;
        }
        if (id === "mafool_hukm") {
            if (pickedText.includes("مرفوع"))
                return `الرفع يناسب الفاعل غالبًا؛ لأنه من قام بالفعل. أما (${targetText}) فقد عرفنا أنه مفعول به؛ أي وقع عليه الفعل، لذلك حكمه النصب أو في محل نصب.`;
            if (pickedText.includes("مجرور"))
                return `الجر يكون بعد حرف جر أو بالإضافة. أما المفعول به فلا نجرّه من غير حرف جر؛ حكمه النصب أو في محل نصب.`;
            return `المفعول به حكمه النصب. فإن كان اسمًا معربًا ظهرت علامة النصب، وإن كان مبنيًا أو مصدرًا مؤولًا قلنا: في محل نصب.`;
        }
        if (id === "mafool_form") {
            if (pickedText.includes("مصدر") && roleKind !== "masdar")
                return `المصدر المؤول تركيب يؤول بمصدر مثل: أن تنجحَ = نجاحَك، وما فعلتَ = فعلَك. انظر إلى (${targetText}): هل هو تركيب مؤول أم كلمة/ضمير؟`;
            if (pickedText.includes("ظاهر") && roleKind !== "visible") {
                if (roleKind === "connected")
                    return `(${targetText}) ضمير متصل، والضمائر المتصلة من الأسماء المبنية. لا تظهر عليها علامة نصب مثل (الواجبَ)، بل نقول: ضمير متصل مبني في محل نصب مفعول به. نعرف ذلك بسؤال: ${objectQuestion}${pronounMeaning ? ` والجواب يدل عليه الضمير، ومعناه: ${pronounMeaning}.` : "."}`;
                if (roleKind === "masdar")
                    return `(${targetText}) ليس اسمًا ظاهرًا تظهر عليه فتحة مثل (الواجبَ)، بل تركيب يؤول بمصدر في معنى اسم: (${taweel}). لذلك لا نبحث عن فتحة ظاهرة، بل نقول: مصدر مؤول في محل نصب مفعول به.`;
                return `الاسم الظاهر المعرب تظهر عليه علامة نصب أو علامة نيابة. أما (${targetText}) فاسم مبني، لذلك نقول: في محل نصب.`;
            }
            if (pickedText.includes("مبني") && !["mabni", "connected"].includes(roleKind))
                return `الاسم المبني يلزم صورة واحدة مثل: هذا، الذي، والضمائر المتصلة. انظر إلى (${targetText}): هل يلزم صورة ثابتة أم هو اسم ظاهر معرب؟`;
            if (pickedText.includes("تلميح")) {
                if (roleKind === "visible")
                    return `(${targetText}) اسم ظاهر معرب: كلمة مستقلة وليست ضميرًا متصلًا، وليست اسمًا مبنيًا مثل (هذا/الذي)، وليست تركيبًا مؤولًا. لذلك نكمل معها لتحديد صورتها ثم علامة نصبها.`;
                if (roleKind === "mabni")
                    return `(${targetText}) اسم مبني؛ يلزم صورة واحدة ولا تظهر عليه فتحة نصب مثل (الواجبَ). لذلك نحدد نوعه، ثم نقول: اسم مبني في محل نصب مفعول به.`;
                if (roleKind === "connected")
                    return `(${targetText}) ضمير متصل، والضمائر المتصلة من الأسماء المبنية. اسأل: ${objectQuestion}${pronounMeaning ? ` الجواب يدل عليه الضمير، ومعناه: ${pronounMeaning}.` : ""} لذلك يكون في محل نصب مفعول به.`;
                if (roleKind === "masdar")
                    return `(${targetText}) تركيب يؤول بمصدر في معنى اسم: (${taweel}). والمصدر المؤول ليس اسمًا مبنيًا؛ لذلك نقول: مصدر مؤول في محل نصب مفعول به.`;
            }
            return `انظر إلى (${targetText}) نفسها: إن كانت اسمًا ظاهرًا معربًا نكمل إلى علامة النصب، وإن كانت اسمًا مبنيًا أو ضميرًا متصلًا نقول: في محل نصب، وإن كانت تركيبًا مؤولًا نقول: مصدر مؤول في محل نصب.`;
        }
        if (id === "mafool_mu3rab_shape") {
            const correctShapeHint = (() => {
                if (shape === "singular")
                    return `(${targetText}) اسم ظاهر معرب يدل على شيء واحد، وليس مثنى ولا جمعًا ولا من الأسماء الخمسة؛ لذلك صورته مفرد، وعلامة نصب المفرد الفتحة.`;
                if (shape === "dual")
                    return `(${targetText}) يدل على اثنين، وانتهى بياء ونون لأنه منصوب؛ لذلك صورته مثنى، وعلامة نصب المثنى الياء.`;
                if (shape === "jms")
                    return `(${targetText}) يدل على جماعة ذكور عاقلة، وانتهى بياء ونون لأنه منصوب؛ لذلك صورته جمع مذكر سالم، وعلامة نصب جمع المذكر السالم الياء.`;
                if (shape === "jfs")
                    return `(${targetText}) جمع مؤنث سالم؛ لأنه جمع مؤنث مختوم بألف وتاء زائدتين، وعلامة نصب جمع المؤنث السالم الكسرة نيابة عن الفتحة.`;
                if (shape === "jt")
                    return `(${targetText}) جمع تكسير؛ لأنه يدل على جماعة مع تغيّر صورة المفرد عند الجمع مثل: قصة ← قصص، وعلامة نصب جمع التكسير الفتحة.`;
                if (shape === "five")
                    return `(${targetText}) من الأسماء الخمسة، وقد تحققت شروط إعرابها بالحروف: ${fiveConditions}. لذلك لا نعاملها كمفرد عادي، بل نختار: من الأسماء الخمسة، وعلامة نصبها الألف.`;
                return `انظر إلى (${targetText}) نفسها: هل تدل على واحد، أم اثنين، أم جماعة؟ وهل هي من الأسماء الخمسة؟ صورة الكلمة هي التي تقودنا إلى علامة النصب.`;
            })();
            if (pickedText.includes("تلميح"))
                return correctShapeHint;
            if (pickedText.includes("مفرد") && shape !== "singular") {
                if (shape === "dual")
                    return `(${targetText}) ليست مفردًا؛ لأنها تدل على اثنين، وانتهت بياء ونون لأنها منصوبة؛ لذلك صورتها مثنى.`;
                if (shape === "jms")
                    return `(${targetText}) ليست مفردًا؛ لأنها تدل على جماعة ذكور عاقلة، وانتهت بياء ونون لأنها منصوبة؛ لذلك صورتها جمع مذكر سالم.`;
                if (shape === "jfs")
                    return `(${targetText}) ليست مفردًا؛ لأنها تدل على جماعة إناث، وانتهت بألف وتاء زائدتين؛ لذلك صورتها جمع مؤنث سالم.`;
                if (shape === "jt")
                    return `(${targetText}) ليست مفردًا؛ لأنها جمع تكسير تغيّرت فيه صورة المفرد عند الجمع؛ لذلك صورتها جمع تكسير.`;
                if (shape === "five")
                    return `صحيح أن (${targetText}) يدل على واحد، لكنه ليس مفردًا عاديًا في الإعراب مثل (الواجبَ). هو من الأسماء الخمسة، وقد تحققت شروط إعرابه بالحروف: ${fiveConditions}. لذلك نختار: من الأسماء الخمسة.`;
            }
            if (pickedText.includes("الأسماء الخمسة") && shape !== "five")
                return `الأسماء الخمسة هي: أب، أخ، حم، فو، ذو، وتعرب بالحروف إذا كانت مفردة، مكبرة، مضافة، ومضافة إلى غير ياء المتكلم. أما (${targetText}) فليست من هذا الباب في هذا المثال؛ ${correctShapeHint}`;
            if (pickedText.includes("مثنى") && shape !== "dual")
                return `المثنى يدل على اثنين أو اثنتين وينصب بالياء. افحص (${targetText}) في هذا المثال: ${correctShapeHint}`;
            if (pickedText.includes("جمع مذكر") && shape !== "jms")
                return `جمع المذكر السالم يدل على جماعة ذكور عاقلة وينصب بالياء. افحص (${targetText}) في هذا المثال: ${correctShapeHint}`;
            if (pickedText.includes("جمع مؤنث") && shape !== "jfs")
                return `جمع المؤنث السالم ينتهي غالبًا بألف وتاء زائدتين وينصب بالكسرة نيابة عن الفتحة. افحص (${targetText}) في هذا المثال: ${correctShapeHint}`;
            if (pickedText.includes("جمع تكسير") && shape !== "jt")
                return `جمع التكسير تتغير فيه صورة المفرد عند الجمع مثل: قصة ← قصص. افحص (${targetText}) في هذا المثال: ${correctShapeHint}`;
            return correctShapeHint;
        }
        if (id === "mafool_nasb_mark") {
            const correctMarkHint = (() => {
                if (shape === "singular")
                    return `(${targetText}) مفرد منصوب؛ لذلك علامة نصبه الفتحة الظاهرة على آخره.`;
                if (shape === "dual")
                    return `(${targetText}) مثنى منصوب؛ لذلك علامة نصبه الياء.`;
                if (shape === "jms")
                    return `(${targetText}) جمع مذكر سالم منصوب؛ لذلك علامة نصبه الياء.`;
                if (shape === "jfs")
                    return `(${targetText}) جمع مؤنث سالم منصوب؛ لذلك علامة نصبه الكسرة نيابة عن الفتحة.`;
                if (shape === "jt")
                    return `(${targetText}) جمع تكسير منصوب؛ وعلامة نصب جمع التكسير الفتحة مثل المفرد العادي، لذلك علامة نصبه الفتحة.`;
                if (shape === "five")
                    return `(${targetText}) من الأسماء الخمسة، وقد تحققت شروط إعرابه بالحروف: ${fiveConditions}؛ لذلك علامة نصبه الألف.`;
                return `اختر علامة النصب من صورة (${targetText}) نفسها.`;
            })();
            if (pickedText.includes("تلميح"))
                return correctMarkHint;
            if (pickedText.includes("الفتحة") && nasbMark !== "fatha") {
                if (shape === "five")
                    return `الفتحة علامة نصب المفرد العادي مثل: الواجبَ. أما (${targetText}) فمن الأسماء الخمسة، وقد تحققت شروط إعرابه بالحروف: ${fiveConditions}؛ لذلك علامة نصبه الألف.`;
                if (shape === "jfs")
                    return `لا ننصب (${targetText}) بالفتحة؛ لأنه جمع مؤنث سالم، وعلامة نصب جمع المؤنث السالم الكسرة نيابة عن الفتحة.`;
                if (shape === "dual")
                    return `لا ننصب (${targetText}) بالفتحة؛ لأنه مثنى، وعلامة نصب المثنى الياء.`;
                if (shape === "jms")
                    return `لا ننصب (${targetText}) بالفتحة؛ لأنه جمع مذكر سالم، وعلامة نصب جمع المذكر السالم الياء.`;
                return correctMarkHint;
            }
            if (pickedText.includes("الياء") && nasbMark !== "yaa")
                return `الياء علامة نصب المثنى وجمع المذكر السالم. أما (${targetText}) فليست من هاتين الصورتين هنا؛ ${correctMarkHint}`;
            if (pickedText.includes("الكسرة") && nasbMark !== "kasra")
                return `الكسرة هنا علامة نصب جمع المؤنث السالم نيابة عن الفتحة. أما (${targetText}) فليست جمع مؤنث سالم في هذا المثال؛ ${correctMarkHint}`;
            if (pickedText.includes("الألف") && nasbMark !== "alif")
                return `الألف علامة نصب الأسماء الخمسة إذا استوفت شروطها. أما (${targetText}) فليست من الأسماء الخمسة في هذا المثال؛ ${correctMarkHint}`;
            return correctMarkHint;
        }
        if (id === "mafool_mabni_type") {
            if (roleKind === "connected" && !pickedText.includes("ضمير"))
                return `المحدد (${targetText}) ضمير متصل داخل الفعل. والضمائر المتصلة من الأسماء المبنية؛ لذلك نحدد نوعه: ضمير متصل. اسأل: ${objectQuestion}${pronounMeaning ? ` والجواب يدل عليه الضمير، ومعناه: ${pronounMeaning}.` : ""}`;
            if (pickedText.includes("ضمير") && roleKind !== "connected")
                return `الضمير المتصل يكون جزءًا متصلًا بالفعل مثل الهاء في كتبَهُ والياء في ساعدَني ونا في شكرَنا. افحص (${targetText}) هل هو ضمير متصل أم اسم مبني آخر؟`;
            if (pickedText.includes("إشارة") && facts.mabniType !== "ishara")
                return `اسم الإشارة مثل: هذا وهذه. افحص (${targetText}) هل يدل بالإشارة، أم أنه نوع آخر من المبنيات؟`;
            if (pickedText.includes("موصول") && facts.mabniType !== "mawsool")
                return `الاسم الموصول مثل: الذي والتي، وتأتي بعده صلة توضحه. افحص (${targetText}) هل هو اسم موصول؟`;
            return String(picked?.hint || node?.hint || "اختر نوع الاسم المبني من الكلمة نفسها.");
        }
        const pickedHint = String(picked?.hint || "").trim();
        if (pickedHint)
            return pickedHint;
        return node?.hint || "اتبع المسار: السياق ثم الدور ثم حكم المفعول به ثم صورته وعلامته.";
    }
  return undefined;
}
