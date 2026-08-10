import type { ExerciseAnswer } from "../../../lib/exercise/model";
import type { PedagogyNode, PedagogyState } from "./ExercisePedagogyTypes";
import { fiveNounWrongSingularHint, isFiveNounFact } from "./ExerciseHintShared";

export function faelStudentHintText(node: PedagogyNode | null | undefined, picked?: ExerciseAnswer, state?: PedagogyState): string | undefined {
  const id = String(node?.id || "");
  const target = state?.currentTarget || "الفعل";
  const pickedTextGlobal = String(picked?.text || "");
  const currentTargetGlobal = String(state?.currentTarget || target || "الكلمة المحددة");
    if (id.startsWith("fael_")) {
        const facts = state?.facts || {};
        const pickedText = String(picked?.text || "").trim();
        const sentence = String(state?.currentSentence || "").trim();
        const targetText = String(state?.currentTarget || "الكلمة المحددة").trim();
        const firstWord = sentence.replace(/[.؟!،]/g, " ").trim().split(/\s+/)[0] || "أول كلمة";
        const roleKind = String(facts.roleKind || "");
        const contextType = String(facts.contextType || "");
        const nominalSubject = String(facts.nominalSubject || firstWord || "الاسم الأول");
        const verbalKhabar = String(facts.verbalKhabar || "الجملة الفعلية داخل الخبر");
        const pronounMeaning = String(facts.pronounMeaning || "");
        const connectedType = String(facts.connectedType || "");
        const actionQuestion = String(facts.actionQuestion || "من الذي فعل؟");
        const fiveConditions = "مفردة، مضافة، ومضافة إلى غير ياء المتكلم";
        if (id === "fael_context") {
            if (facts.specialContext === "istifham" && pickedText.includes("جملة اسمية")) {
                return `(${targetText}) هنا اسم استفهام له الصدارة، وليس فعلًا. لكن بعده فعل ظاهر هو (حضرَ)، و(${targetText}) يسأل عن الشخص الذي قام بالحضور. لذلك نتعامل مع الفعل وفاعله في السؤال.`;
            }
            if (pickedText.includes("جملة اسمية") && (contextType === "verbal" || contextType === "verbal_hidden")) {
                return `انظر إلى بداية الجملة: (${firstWord}). هذه كلمة تدل على حدث وزمن، فهي فعل. والجملة التي تبدأ بالفعل غالبًا تكون جملة فعلية.`;
            }
            if (pickedText.includes("جملة فعلية") && contextType === "nominal_with_verb") {
                return `بدأت الجملة باسم: (${firstWord})، فهي جملة اسمية. لكن داخل خبرها فعل هو (${targetText}) يحتاج إلى فاعل، وسنبحث عنه في الخطوة التالية.`;
            }
            if (pickedText.includes("جملة فعلية") && contextType === "nominal_connected") {
                return `بدأت الجملة باسم: (${firstWord})، فهي جملة اسمية. لكن خبرها جاء جملة فعلية: (${verbalKhabar}). داخل هذه الجملة الفعلية نبحث عن فاعل الفعل.`;
            }
            return `انظر إلى أول الجملة فقط: هل بدأت بفعل يدل على حدث وزمن، أم بدأت باسم؟ اختر السياق العام، واترك التفاصيل للتلميح.`;
        }
        if (id === "fael_role_verbal") {
            if (pickedText === "فعل") {
                if (roleKind === "masdar") {
                    const q = targetText.includes("ما فعلت") ? "ما الذي أعجبني؟" : "ما الذي سرّني؟";
                    const taweel = targetText.includes("ما فعلت") ? "فعلك" : "نجاحك";
                    return `داخل (${targetText}) يوجد فعل فعلًا، لكننا لا نعرب الفعل وحده هنا؛ نعرب التركيب كله. هذا التركيب يؤول بمصدر في معنى اسم: (${taweel}). لذلك ننظر إلى دوره في الجملة ونسأل: ${q}`;
                }
                if (roleKind === "connected") {
                    return `الفعل هو كلمة الحدث والزمن. أما (${targetText}) فهو ضمير متصل داخل الفعل يدل على من قام بالفعل. اسأل: ${actionQuestion} الجواب يدل عليه الضمير${pronounMeaning ? `، ومعناه: ${pronounMeaning}` : ""}.`;
                }
                return `الفعل يدل على حدث وزمن، مثل: كتبَ. أما (${targetText}) فليس الفعل نفسه. اسأل: من الذي فعل؟ أو ما الذي فعل؟`;
            }
            if (pickedText === "مفعول به") {
                if (roleKind === "masdar") {
                    const q = targetText.includes("ما فعلت") ? "ما الذي أعجبني؟" : "ما الذي سرّني؟";
                    return `المفعول به هو ما وقع عليه الفعل. أما هنا فالتركيب (${targetText}) هو الشيء الذي سبب الإعجاب أو السرور. اسأل: ${q}`;
                }
                if (roleKind === "connected") {
                    return `المفعول به هو الشيء الذي وقع عليه الفعل. أما (${targetText}) فيدل على من قام بالفعل. اسأل: ${actionQuestion} ستجد أن الجواب هو الضمير المتصل.`;
                }
                return `المفعول به هو الذي وقع عليه الفعل، أما الفاعل فهو من قام بالفعل. اسأل: من الذي فعل؟ أو ما الذي فعل؟`;
            }
            return `اسأل عن الدور فقط: من الذي فعل؟ أو ما الذي فعل؟ هذا هو الفاعل. وما وقع عليه الفعل يكون مفعولًا به.`;
        }
        if (id === "fael_role_hidden") {
            if (pickedText.includes("اسم ظاهر") || pickedText.includes("الاسم المتقدم")) {
                if (contextType === "nominal_with_verb") {
                    if (facts.hiddenPronoun === "هي") {
                        return `الفعل (${targetText}) فعل مضارع، والتاء في أوله تاء مضارعة تناسب الغائبة المؤنثة هنا، وليست تاء تأنيث ساكنة؛ لأن تاء التأنيث الساكنة تكون مع الماضي مثل: كتبتْ. وبما أن (${nominalSubject}) جاءت قبل الفعل، فهي مبتدأ، أما فاعل (${targetText}) فهو ضمير مستتر تقديره هي.`;
                    }
                    return `لا نجعل الاسم المتقدم على الفعل فاعلًا؛ لأن الفاعل لا يتقدم على فعله. (${nominalSubject}) مبتدأ، أما فاعل (${targetText}) فهو ضمير مستتر داخل الفعل يعود عليه.`;
                }
                return `لا يظهر بعد الفعل (${targetText}) اسم قام بالفعل. نسأل: ${actionQuestion} فيدل المعنى وصيغة الفعل على ضمير مستتر داخل الفعل.`;
            }
            if (pickedText.includes("المفعول")) {
                return `المفعول به وقع عليه الفعل، وليس هو الذي قام به. انظر إلى الفعل (${targetText}) واسأل: ${actionQuestion} إذا لم يظهر فاعل بعد الفعل، نقدّر ضميرًا مستترًا.`;
            }
            if (contextType === "verbal_hidden" && facts.hiddenPronoun === "أنت") {
                return `الجملة بدأت بفعل أمر: (${targetText}). فعل الأمر موجّه إلى مخاطب. نسأل: ${actionQuestion} الجواب: أنت، لكنها غير ظاهرة في الجملة؛ لذلك الفاعل ضمير مستتر وجوبًا تقديره أنت.`;
            }
            if (contextType === "verbal_hidden") {
                return `الجملة بدأت بفعل يحتاج إلى فاعل. اسأل: ${actionQuestion} إذا لم يظهر فاعل بعد الفعل، نقدّر ضميرًا مستترًا مناسبًا للمعنى.`;
            }
            return `الجملة بدأت باسم، وخبرها جملة فعلية: (${verbalKhabar}). داخل هذه الجملة نبحث عن فاعل الفعل (${targetText}). اسأل: ${actionQuestion}`;
        }
        if (id === "fael_hidden_estimate") {
            if (facts.hiddenPronoun === "هي" && pickedText !== "هي") {
                return `الفعل (${targetText}) مضارع، والتاء في أوله تاء مضارعة تناسب الغائبة المؤنثة في هذا المثال، وليست تاء تأنيث ساكنة. اسأل: ${actionQuestion} الجواب يعود على (${nominalSubject || "الاسم السابق"})، لذلك نقدّر الفاعل المستتر: هي.`;
            }
            if (facts.hiddenPronoun === "هو" && pickedText !== "هو") {
                return `الضمير يعود على (${nominalSubject})، وهو مفرد مذكر في هذا المثال؛ لذلك نقدّر الفاعل المستتر: هو.`;
            }
            if (facts.hiddenPronoun === "أنا" && pickedText !== "أنا")
                return `الفعل (${targetText}) بدأ بهمزة المتكلم، لذلك تقدير الفاعل المستتر: أنا.`;
            if (facts.hiddenPronoun === "نحن" && pickedText !== "نحن")
                return `الفعل (${targetText}) بدأ بنون المتكلمين، لذلك تقدير الفاعل المستتر: نحن.`;
            if (facts.hiddenPronoun === "أنت" && pickedText !== "أنت")
                return `فعل الأمر موجه إلى المخاطب، فإذا لم يظهر فاعله نقدّره: أنت.`;
            return node?.hint || "نقدر الضمير بحسب صيغة الفعل والمعنى.";
        }
        if (id === "fael_hukm") {
            if (pickedText.includes("منصوب")) {
                if (facts.fiveNoun || facts.shape === "five") {
                    return `النصب لا نختاره لمجرد وجود فتحة في آخر الشكل. في (${targetText}) علامة الرفع هي الواو؛ لأنه من الأسماء الخمسة، وقد تحققت شروط إعرابها بالحروف: ${fiveConditions}. أما الكاف فضمير متصل في محل جر مضاف إليه.`;
                }
                return `النصب يكون للمفعول به غالبًا. أما الفاعل فقد عرفنا أنه من قام بالفعل أو ما دل عليه، وحكمه الرفع دائمًا، أو يكون في محل رفع إذا كان مبنيًا.`;
            }
            if (pickedText.includes("مجرور"))
                return `الجر يكون بعد حرف جر أو بالإضافة. أما الفاعل فلا يكون مجرورًا؛ حكمه الرفع أو في محل رفع.`;
            return `الفاعل حكمه الرفع دائمًا، فإن كان مبنيًا أو مصدرًا مؤولًا قلنا: في محل رفع.`;
        }
        if (id === "fael_form") {
            if (pickedText.includes("مصدر") && roleKind !== "masdar")
                return `المصدر المؤول تركيب يؤول باسم مثل: أن تنجح = نجاحك، أو ما فعلت = فعلك. انظر إلى (${targetText}): هل هو تركيب مؤول أم كلمة/ضمير؟`;
            if (pickedText.includes("معرب") && roleKind !== "visible") {
                if (roleKind === "connected") {
                    return `(${targetText}) ضمير متصل، والضمائر المتصلة من الأسماء المبنية. لا تظهر عليها علامة رفع مثل (الطالبُ)، بل نقول: ضمير متصل مبني في محل رفع فاعل. نعرف أنه فاعل بسؤال: ${actionQuestion}${pronounMeaning ? ` والجواب يدل عليه الضمير، ومعناه: ${pronounMeaning}.` : "."}`;
                }
                if (roleKind === "masdar") {
                    const taweel = targetText.includes("ما فعلت") ? "فعلك" : "نجاحك";
                    return `(${targetText}) ليس اسمًا ظاهرًا تظهر عليه علامة رفع مثل (الطالبُ)، بل تركيب يؤول بمصدر في معنى اسم: (${taweel}). لذلك لا نبحث عن ضمة ظاهرة، بل نقول: مصدر مؤول في محل رفع فاعل.`;
                }
                return `الاسم المعرب تظهر عليه علامة رفع أو نصب أو جر. أما (${targetText}) فاسم مبني، لذلك نقول: في محل رفع.`;
            }
            if (pickedText.includes("مبني") && !["mabni", "connected"].includes(roleKind))
                return `الاسم المبني يلزم صورة واحدة مثل: هذا، الذي، من، والضمائر المتصلة. انظر إلى (${targetText}): هل يلزم صورة ثابتة أم هو اسم ظاهر معرب؟`;
            if (pickedText.includes("تلميح")) {
                if (roleKind === "visible")
                    return `(${targetText}) اسم ظاهر معرب: كلمة مستقلة وليست ضميرًا متصلًا، وليست اسمًا مبنيًا مثل (هذا/الذي)، وليست تركيبًا مؤولًا. لذلك نكمل معها لتحديد صورتها ثم علامة رفعها.`;
                if (roleKind === "mabni")
                    return `(${targetText}) اسم مبني؛ يلزم صورة واحدة ولا تظهر عليه ضمة رفع مثل (الطالبُ). لذلك نحدد نوعه، ثم نقول: اسم مبني في محل رفع فاعل.`;
                if (roleKind === "connected") {
                    if (connectedType === "na")
                        return `(${targetText}) ضمير متصل، والضمائر المتصلة من الأسماء المبنية. نسأل: ${actionQuestion} الجواب: نحن. في (حفظْنا) سكن آخر الفعل الماضي لاتصاله بضمير رفع؛ لذلك تكون نا هنا في محل رفع فاعل، بخلاف (شكرَنا) التي تكون فيها نا مفعولًا به ولا تغيّر بناء الفعل.`;
                    return `(${targetText}) ضمير متصل، والضمائر المتصلة من الأسماء المبنية. نسأل: ${actionQuestion}${pronounMeaning ? ` الجواب يدل عليه الضمير، ومعناه: ${pronounMeaning}.` : ""} لذلك يكون في محل رفع فاعل.`;
                }
                if (roleKind === "masdar") {
                    const taweel = targetText.includes("ما فعلت") ? "فعلك" : "نجاحك";
                    return `(${targetText}) تركيب يؤول بمصدر في معنى اسم: (${taweel}). والمصدر المؤول ليس اسمًا مبنيًا؛ لذلك نقول: مصدر مؤول في محل رفع فاعل.`;
                }
            }
            return `انظر إلى (${targetText}) نفسها: إن كانت اسمًا ظاهرًا معربًا نكمل إلى علامة الرفع، وإن كانت اسمًا مبنيًا أو ضميرًا متصلًا نقول: في محل رفع، وإن كانت تركيبًا مؤولًا نقول: مصدر مؤول في محل رفع.`;
        }
        if (id === "fael_mu3rab_shape") {
            const correctShapeHint = (() => {
                if (facts.shape === "singular")
                    return `(${targetText}) اسم ظاهر معرب يدل على واحد، وليس مثنى ولا جمعًا ولا من الأسماء الخمسة؛ لذلك صورته مفرد، وعلامة رفع المفرد الضمة.`;
                if (facts.shape === "dual")
                    return `(${targetText}) يدل على اثنين، وانتهى بألف ونون في هذا المثال؛ لذلك صورته مثنى، وعلامة رفع المثنى الألف.`;
                if (facts.shape === "jms")
                    return `(${targetText}) يدل على جماعة ذكور عاقلة، وانتهى بواو ونون في هذا المثال؛ لذلك صورته جمع مذكر سالم، وعلامة رفع جمع المذكر السالم الواو.`;
                if (facts.shape === "jfs")
                    return `(${targetText}) جمع مؤنث سالم؛ لأنه يدل على جماعة إناث وينتهي بألف وتاء زائدتين، وعلامة رفع جمع المؤنث السالم الضمة.`;
                if (facts.shape === "jt")
                    return `(${targetText}) جمع تكسير؛ لأنه يدل على جماعة مع تغيّر صورة المفرد عند الجمع مثل: طفل ← أطفال، وعلامة رفع جمع التكسير الضمة.`;
                if (facts.fiveNoun || facts.shape === "five")
                    return `(${targetText}) من الأسماء الخمسة؛ أصله (أب)، وقد تحققت شروط إعرابه بالحروف: ${fiveConditions}. لذلك لا نعامله كمفرد عادي، بل نختار: من الأسماء الخمسة، وعلامة رفعه الواو.`;
                return `انظر إلى (${targetText}) نفسها: هل تدل على واحد، أم اثنين، أم جماعة؟ وهل هي من الأسماء الخمسة؟ صورة الكلمة هي التي تقودنا إلى علامة الرفع.`;
            })();
            if (pickedText.includes("تلميح"))
                return correctShapeHint;
            if (pickedText.includes("مفرد") && facts.shape !== "singular") {
                if (facts.shape === "dual")
                    return `(${targetText}) ليست مفردًا؛ لأنها تدل على اثنين، وانتهت بألف ونون؛ لذلك صورتها مثنى.`;
                if (facts.shape === "jms")
                    return `(${targetText}) ليست مفردًا؛ لأنها تدل على جماعة ذكور عاقلة، وانتهت بواو ونون؛ لذلك صورتها جمع مذكر سالم.`;
                if (facts.shape === "jfs")
                    return `(${targetText}) ليست مفردًا؛ لأنها تدل على جماعة إناث، وانتهت بألف وتاء زائدتين؛ لذلك صورتها جمع مؤنث سالم.`;
                if (facts.shape === "jt")
                    return `(${targetText}) ليست مفردًا؛ لأنها جمع تكسير تغيّرت فيه صورة المفرد عند الجمع؛ لذلك صورتها جمع تكسير.`;
                if (facts.fiveNoun || facts.shape === "five")
                    return `صحيح أن (${targetText}) يدل على واحد، لكنه ليس مفردًا عاديًا في الإعراب مثل (الطالبُ). أصله (أب) وهو من الأسماء الخمسة، وقد تحققت شروط إعرابه بالحروف: ${fiveConditions}. لذلك نختار: من الأسماء الخمسة.`;
            }
            if (pickedText.includes("الأسماء الخمسة") && facts.shape !== "five")
                return `الأسماء الخمسة هي: أب، أخ، حم، فو، ذو، وتعرب بالحروف إذا كانت مفردة، مضافة، ومضافة إلى غير ياء المتكلم. أما (${targetText}) فليست من هذا الباب في هذا المثال؛ ${correctShapeHint}`;
            if (pickedText.includes("مثنى") && facts.shape !== "dual")
                return `المثنى يدل على اثنين أو اثنتين ويرفع بالألف. افحص (${targetText}) في هذا المثال: ${correctShapeHint}`;
            if (pickedText.includes("جمع مذكر") && facts.shape !== "jms")
                return `جمع المذكر السالم يدل على جماعة ذكور عاقلة ويرفع بالواو. افحص (${targetText}) في هذا المثال: ${correctShapeHint}`;
            if (pickedText.includes("جمع مؤنث") && facts.shape !== "jfs")
                return `جمع المؤنث السالم ينتهي غالبًا بألف وتاء زائدتين ويرفع بالضمة. افحص (${targetText}) في هذا المثال: ${correctShapeHint}`;
            if (pickedText.includes("جمع تكسير") && facts.shape !== "jt")
                return `جمع التكسير تتغير فيه صورة المفرد عند الجمع مثل: طفل ← أطفال. افحص (${targetText}) في هذا المثال: ${correctShapeHint}`;
            return correctShapeHint;
        }
        if (id === "fael_raf3_mark") {
            const correctMarkHint = (() => {
                if (facts.shape === "singular")
                    return `(${targetText}) مفرد مرفوع؛ لذلك علامة رفعه الضمة الظاهرة على آخره.`;
                if (facts.shape === "dual")
                    return `(${targetText}) مثنى مرفوع؛ لذلك علامة رفعه الألف.`;
                if (facts.shape === "jms")
                    return `(${targetText}) جمع مذكر سالم مرفوع؛ لذلك علامة رفعه الواو.`;
                if (facts.shape === "jfs")
                    return `(${targetText}) جمع مؤنث سالم مرفوع؛ وعلامة رفع جمع المؤنث السالم الضمة، لذلك علامة رفعه الضمة.`;
                if (facts.shape === "jt")
                    return `(${targetText}) جمع تكسير مرفوع؛ وعلامة رفع جمع التكسير الضمة مثل المفرد العادي، لذلك علامة رفعه الضمة.`;
                if (facts.fiveNoun || facts.shape === "five")
                    return `(${targetText}) من الأسماء الخمسة، وقد تحققت شروط إعرابه بالحروف: ${fiveConditions}؛ لذلك علامة رفعه الواو.`;
                return `اختر علامة الرفع من صورة (${targetText}) نفسها.`;
            })();
            if (pickedText.includes("تلميح"))
                return correctMarkHint;
            if (pickedText.includes("الضمة") && facts.raf3Mark !== "damma") {
                if (facts.fiveNoun || facts.shape === "five")
                    return `الضمة علامة رفع المفرد العادي مثل: الطالبُ. أما (${targetText}) فمن الأسماء الخمسة، وقد تحققت شروط إعرابه بالحروف: ${fiveConditions}؛ لذلك علامة رفعه الواو.`;
                if (facts.shape === "dual")
                    return `لا نرفع (${targetText}) بالضمة؛ لأنه مثنى، وعلامة رفع المثنى الألف.`;
                if (facts.shape === "jms")
                    return `لا نرفع (${targetText}) بالضمة؛ لأنه جمع مذكر سالم، وعلامة رفع جمع المذكر السالم الواو.`;
                return correctMarkHint;
            }
            if (pickedText.includes("الألف") && facts.raf3Mark !== "alif")
                return `الألف علامة رفع المثنى فقط. أما (${targetText}) فليست مثنى في هذا المثال؛ ${correctMarkHint}`;
            if (pickedText.includes("الواو") && facts.raf3Mark !== "waw")
                return `الواو علامة رفع جمع المذكر السالم والأسماء الخمسة. أما (${targetText}) فليست من هذين البابين هنا؛ ${correctMarkHint}`;
            if (pickedText.includes("ثبوت النون"))
                return `ثبوت النون ليس علامة رفع للأسماء، بل يخص الفعل المضارع المتصل بألف الاثنين أو واو الجماعة أو ياء المخاطبة. نحن هنا نحدد علامة رفع الفاعل (${targetText}).`;
            return correctMarkHint;
        }
        if (id === "fael_mabni_type") {
            if (roleKind === "connected" && !pickedText.includes("ضمير")) {
                return `المحدد (${targetText}) ضمير متصل داخل الفعل. والضمائر المتصلة من الأسماء المبنية؛ لذلك نحدد نوعه: ضمير متصل. نسأل: ${actionQuestion}${pronounMeaning ? ` والجواب يدل عليه الضمير، ومعناه: ${pronounMeaning}.` : ""}`;
            }
            if (pickedText.includes("ضمير") && roleKind !== "connected")
                return `الضمير المتصل يكون جزءًا متصلًا بالفعل مثل التاء في فهمتُ أو واو الجماعة في شرحوا. افحص (${targetText}) هل هو ضمير متصل أم اسم مبني آخر؟`;
            if (pickedText.includes("إشارة") && facts.mabniType !== "ishara")
                return `اسم الإشارة مثل: هذا وهذه. افحص (${targetText}) هل يدل بالإشارة، أم أنه نوع آخر من المبنيات؟`;
            if (pickedText.includes("موصول") && facts.mabniType !== "mawsool")
                return `الاسم الموصول مثل: الذي والتي، وتأتي بعده صلة توضحه. افحص (${targetText}) هل هو اسم موصول؟`;
            return String(picked?.hint || node?.hint || "اختر نوع الاسم المبني من الكلمة نفسها.");
        }
        const pickedHint = String(picked?.hint || "").trim();
        if (pickedHint)
            return pickedHint;
        return node?.hint || "اتبع المسار: السياق ثم الدور ثم حكم الفاعل ثم صورته وعلامته.";
    }
    if (pickedTextGlobal.includes("مفرد") && isFiveNounFact(state?.facts)) {
        return fiveNounWrongSingularHint(currentTargetGlobal);
    }
  return undefined;
}
