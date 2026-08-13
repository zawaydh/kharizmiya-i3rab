import type { ExerciseAnswer } from "../../../lib/exercise/model";
import type { PedagogyNode, PedagogyState } from "./ExercisePedagogyTypes";
import { innaGenericLabel, innaParticleName } from "./InnaPedagogy";

export function nasikhStudentHintText(node: PedagogyNode | null | undefined, picked?: ExerciseAnswer, state?: PedagogyState): string | undefined {
  const id = String(node?.id || "");
  const target = state?.currentTarget || "الفعل";
    if (id.includes("kana")) {
        const pickedText = String(picked?.text || "");
        const sentence = String(state?.currentSentence || "");
        const currentTarget = String(state?.currentTarget || target || "الكلمة المحددة");
        if (id === "kana_factor_gate") {
            if (pickedText.includes("اسم"))
                return "الاسم لا يدل على زمن بنفسه. أما كان وأخواتها فتدل على زمن أو معنى فعلي؛ فـ(كان) للماضي، و(ليس) للنفي، و(صار) للتحول. لذلك لا نعدها أسماء.";
            if (pickedText.includes("حرف"))
                return "الحرف لا يدل على زمن بنفسه ولا يعمل عمل الفعل. أما كان وأخواتها فهي أفعال ناسخة؛ تدخل على الجملة الاسمية وتغير حكم الخبر. لذلك لا نعدها حروفًا.";
        }
        if (id === "kana_naskh_explain") {
            if (pickedText.includes("تنصب الاسم"))
                return "هذا أثر إن وأخواتها. أما كان وأخواتها فالمبتدأ بعد دخولها يصير اسم كان ويبقى مرفوعًا، والخبر يصير خبر كان منصوبًا.";
            if (pickedText.includes("لا تغير"))
                return "لو لم تغير الحكم لبقي الخبر مرفوعًا. لكننا نقول: المعلمُ حاضرٌ، ثم: كان المعلمُ حاضرًا؛ فتغير الخبر من الرفع إلى النصب.";
        }
        if (id === "kana_target") {
            if (pickedText.includes("فاعل"))
                return `ارجع إلى الكلمة المحددة في المثال: هل السؤال يطلب من قام بالفعل، أم يطلب إعراب كلمة داخل جملة فيها فعل ناسخ؟`;
            if (pickedText.includes("نعت") || pickedText.includes("صفة"))
                return `لا تبدأ من اسم القاعدة. ارجع إلى المثال: هل الكلمة المحددة هي ما نتحدث عنه، أم هي ما عرفناه عنه؟`;
            if (pickedText.includes("اسم") && String(state?.facts?.targetRole) === "khabar")
                return `ركز على الكلمة المحددة نفسها: ماذا أضافت إلى معنى الجملة؟ ثم أعد الاختيار.`;
            if (pickedText.includes("خبر") && String(state?.facts?.targetRole) === "ism")
                return `ابحث عن الاسم الذي تتحدث عنه الجملة أولًا، ثم أعد الاختيار.`;
            if (pickedText.includes("غير ظاهر") && String(state?.facts?.targetRole) !== "hidden_ism")
                return `لا نقدّر اسمًا مستترًا إلا إذا دلّ المثال على ذلك. ارجع إلى الكلمة المحددة في الجملة.`;
        }
        if (id === "kana_ism_start" || id === "kana_khabar_single_start") {
            if (pickedText.includes("مبني"))
                return `اخترت أن (${currentTarget}) اسم مبني. افحص الكلمة نفسها: هل هي ضمير مثل التاء أو هو؟ هل هي اسم إشارة مثل هذا؟ هل هي اسم موصول مثل الذي؟ أم أنها كلمة يتغير آخرها بحسب موقعها؟`;
            if (pickedText.includes("مصدر"))
                return `المصدر المؤول ليس كلمة واحدة عادية، بل تركيب مثل: أن تنجح أو أن تتعلم، ويؤول إلى مصدر: نجاحك أو تعلمك. هل (${currentTarget}) تركيب من هذا النوع أم كلمة واحدة؟`;
            if (pickedText.includes("معرب"))
                return `الاسم المعرب يتغير آخره بحسب موقعه. اختبر (${currentTarget}): هل تظهر عليه العلامة أو يمكن أن تتغير، أم يلزم صورة واحدة مثل الضمائر وأسماء الإشارة والموصولات؟`;
        }
        if (id === "kana_khabar_kind") {
            if (pickedText.includes("مفرد"))
                return `اخترتَ «خبر مفرد». اختبر (${currentTarget}): الخبر المفرد هنا ليس جملة ولا شبه جملة، ولو كان مثنى أو جمعًا. هل المحدد كلمة/اسمًا واحدًا لا إسناد فيه ولا جارًا ومجرورًا ولا ظرفًا؟`;
            if (pickedText.includes("جملة"))
                return `اخترتَ «خبر جملة». اختبر (${currentTarget}): هل فيه إسناد كامل من فعل وفاعل أو مبتدأ وخبر؟ إن لم يوجد فليس خبر جملة.`;
            if (pickedText.includes("شبه"))
                return `اخترتَ «خبر شبه جملة». شبه الجملة يكون جارًا ومجرورًا مثل «في الحقيبة»، أو ظرفًا مثل «عند المعلم». افحص (${currentTarget}): هل هو واحد من هذين التركيبين؟`;
        }
        if (id === "kana_ism_number" || id === "kana_khabar_single_number") {
            if (pickedText.includes("مثنى"))
                return `المثنى يدل على اثنين وينتهي غالبًا بـ(ان) أو (ين). انظر إلى (${currentTarget}): هل يدل على اثنين؟ وهل يحمل علامة التثنية؟`;
            if (pickedText.includes("جمع مذكر"))
                return `جمع المذكر السالم يدل على جماعة ذكور عاقلة، وينتهي غالبًا بـ(ون) رفعًا أو (ين) نصبًا وجرًا. هل (${currentTarget}) ينتهي بهذه العلامة ويدل على جماعة ذكور؟`;
            if (pickedText.includes("جمع مؤنث"))
                return `جمع المؤنث السالم ينتهي غالبًا بـ(ات). انظر إلى (${currentTarget}): هل انتهت الكلمة بـ(ات)، مثل: مجتهدات، طالبات؟`;
            if (pickedText.includes("جمع تكسير"))
                return `جمع التكسير تتغير فيه صورة المفرد مثل: كتاب ← كتب، رجل ← رجال. هل تغيرت بنية (${currentTarget}) بهذه الطريقة، أم أن علامة الجمع ظاهرة في آخره؟`;
            const isFiveNounTarget = String(currentTarget || "").includes("أبو") || String(currentTarget || "").includes("أخو") || String(currentTarget || "").includes("حمو") || String(currentTarget || "").includes("فوك") || String(currentTarget || "").includes("ذو");
            if (pickedText.includes("مفرد") && isFiveNounTarget) {
                const fiveMark = id === "kana_khabar_single_number" ? "ينصب بالألف لا بالفتحة" : "يرفع بالواو لا بالضمة";
                return `أحسنت، (${currentTarget}) يدل على واحد فعلًا، لكن له باب خاص لأنه من الأسماء الخمسة. إذا تحققت شروطها: مفرد، ومكبر، ومضاف، وغير مضاف إلى ياء المتكلم؛ فإنه يعرب بالحروف. وهنا ${fiveMark}. عد للسؤال واختر: من الأسماء الخمسة.`;
            }
            if (pickedText.includes("الأسماء الخمسة"))
                return `الأسماء الخمسة هي: أب، أخ، حم، فو، ذو بمعنى صاحب. وتشترط لإعرابها بالحروف أن تكون مفردة، مكبرة، مضافة، وغير مضافة إلى ياء المتكلم. هل (${currentTarget}) واحد منها؟`;
            if (pickedText.includes("مفرد"))
                return `المفرد هنا يعني أنه يدل على واحد لا مثنى ولا جمع. افحص (${currentTarget}): هل يدل على واحد، أم على اثنين، أم جماعة؟`;
        }
        if (id === "kana_ism_ending") {
            const actualEnding = String(state?.facts?.ending || "");
            if (pickedText.includes("صحيح الآخر") && actualEnding !== "sahih") {
                if (actualEnding === "attached_ya")
                    return `اخترتَ «صحيح الآخر»، لكن (${currentTarget}) متصل بياء المتكلم: افصل الياء أولًا؛ فهي ضمير مضاف إليه، ثم انظر إلى أصل الاسم.`;
                return `اخترتَ «صحيح الآخر»، لكن آخر (${currentTarget}) الأصلي حرف علة؛ لذلك لا تظهر عليه علامة الرفع كما تظهر على الاسم الصحيح الآخر.`;
            }
            if (pickedText.includes("متصل بياء المتكلم") && actualEnding !== "attached_ya")
                return `اخترتَ «متصل بياء المتكلم»، لكن الياء في هذا المثال ليست ضمير المتكلم المضاف إليه. افحص آخر (${currentTarget}) الأصلي قبل الحكم.`;
            if (pickedText.includes("معتل الآخر") && actualEnding !== "moatal") {
                if (actualEnding === "attached_ya")
                    return `اخترتَ «معتل الآخر»، لكن الياء في (${currentTarget}) ياء المتكلم وليست من أصل الاسم. افصلها أولًا، ثم افحص آخر الأصل.`;
                return `اخترتَ «معتل الآخر»، لكن آخر (${currentTarget}) الأصلي حرف صحيح، وليس ألفًا ولا واوًا ولا ياءً أصلية.`;
            }
        }
        if (id === "kana_khabar_sentence_type") {
            if (pickedText.includes("فعلية"))
                return `الجملة الفعلية تبدأ بفعل. انظر إلى بداية الخبر (${currentTarget}): هل بدأ بفعل مثل يقرأ، أم باسم؟`;
            if (pickedText.includes("اسمية"))
                return `الجملة الاسمية تبدأ باسم وفيها مبتدأ وخبر داخليان. انظر إلى الخبر (${currentTarget}): هل بدأ باسم أم بفعل؟`;
        }
        if (id === "kana_khabar_shibh_type") {
            if (pickedText.includes("جار"))
                return `الجار والمجرور يبدأ بحرف جر مثل: في، على، من، إلى. انظر إلى (${currentTarget}): هل بدأ بحرف جر؟`;
            if (pickedText.includes("ظرف"))
                return `الظرف يدل على زمان أو مكان مثل: عند، فوق، تحت، أمام. هل (${currentTarget}) ظرف، أم جار ومجرور بدأ بحرف جر؟`;
        }
    }
    if (id.includes("inna")) {
        const pickedText = String(picked?.text || "");
        const sentence = String(state?.currentSentence || "");
        const currentTarget = String(state?.currentTarget || target || "الكلمة المحددة");
        // تلميحات زر «لا أعلم» في باب إن: تكون موجّهة من المثال نفسه،
        // لا من تعريفات عامة، ولا تكرر الخيارات داخل السؤال.
        if (!picked) {
            const role = String(state?.facts?.targetRole || "");
            const nounKind = String(state?.facts?.nounKind || "");
            const khabarKind = String(state?.facts?.khabarKind || "");
            const number = String(state?.facts?.number || "");
            const ending = String(state?.facts?.ending || "");
            const mabniType = String(state?.facts?.mabniType || "");
            const shibhType = String(state?.facts?.shibhType || "");
            if (id === "inna_meaning") {
                const particleMeaning = String(state?.facts?.particleMeaning || "tawkid");
                const subject = String(state?.facts?.meaningSubject || "الاسم").replace(/\.$/, "");
                const predicate = String(state?.facts?.meaningPredicate || "الخبر").replace(/\.$/, "");
                const judgment = String(state?.facts?.meaningJudgment || "الحكم الكامل").replace(/\.$/, "");
                if (particleMeaning === "tamanni")
                    return `ليت تفيد التمني: طلب شيء صعب أو مستحيل. لا نتمنى (${subject}) وحده ولا (${predicate}) وحدها، بل تحقق المعنى كاملًا: (${judgment}).`;
                if (particleMeaning === "tarajji")
                    return `لعل تفيد الترجي: انتظار أمر ممكن ومرغوب. الرجاء هنا متعلق بالمعنى الكامل: (${judgment}).`;
                if (particleMeaning === "tashbih")
                    return `كأن تفيد التشبيه: تشبيه الاسم بالخبر. لا تقف عند كلمة واحدة، بل انظر إلى علاقة التشبيه كاملة: (${judgment}).`;
                if (particleMeaning === "istidrak")
                    return `لكن تفيد الاستدراك: منع فهم خاطئ مما قبلها، أو إثبات معنى بعد نفي سابق. لذلك لا نأخذ كلمة وحدها، بل ننظر إلى المعنى الكامل الذي جاء بعد لكن: (${judgment}).`;
                return `إن أو أن تفيدان التوكيد: لا تؤكد كلمة منفردة هنا، بل تؤكد الحكم الكامل. هل المقصود تأكيد (${subject}) وحده، أم تأكيد أن (${judgment})؟`;
            }
            if (id === "inna_compact_role") {
                const judgment = String(state?.facts?.meaningJudgment || "الجملة الأصلية").replace(/\.$/, "");
                const baseStart = String(state?.facts?.baseStart || "");
                const subject = String(state?.facts?.meaningSubject || "الاسم الأول").replace(/\.$/, "");
                const predicate = String(state?.facts?.meaningPredicate || "الخبر").replace(/\.$/, "");
                const particle = String(state?.facts?.particleLabel || "إن");
                if (baseStart === "shibh")
                    return `بعد حذف ${particle} يظهر الأصل: (${judgment}). تقدمت شبه الجملة (${predicate})، لذلك بعد دخول ${particle} تكون خبرًا مقدمًا، والاسم النكرة بعدها اسم ${particle} مؤخرًا.`;
                if (role === "ism")
                    return `في الأصل: (${judgment}). اسأل: من الذي نتحدث عنه؟ الجواب: (${subject}). هذه هي الكلمة التي تصبح اسم ${particle} بعد دخول الناسخ.`;
                if (role === "khabar")
                    return `في الأصل: (${judgment}). اسأل: ما المعلومة عن (${subject})؟ الجواب: (${predicate}). هذه المعلومة تصبح خبر ${particle} بعد دخول الناسخ.`;
                return `احذف الناسخ مؤقتًا، ثم اسأل: من الاسم الذي نتحدث عنه؟ وما المعلومة عنه؟ الأول اسم الناسخ، والثاني خبره.`;
            }
            if (id === "inna_ism_start" || id === "inna_khabar_single_start") {
                if (nounKind === "connected_damir")
                    return `انظر إلى (${currentTarget}) نفسها: هل هي ضمير اتصل بالحرف الناسخ مثل: الكاف في إنك، أو الهاء في إنه، أو الهاء في ليتها، أو هم في لعلهم؟ الضمير المتصل من الأسماء المبنية، لا يكون كلمة مستقلة.`;
                if (nounKind === "mabni")
                    return `افحص (${currentTarget}): هل تلزم صورة واحدة مثل هذا/هذه/الذي/أنت؟ إذا نعم فهي اسم مبني، ثم نحدد محلها بحسب موقعها بعد إن.`;
                if (nounKind === "masdar")
                    return `انظر هل المحدد تركيب من حرف مصدري وفعل، مثل: أن تنجح. هذا التركيب يؤول بمصدر صريح مثل: نجاحك.`;
                return `افحص (${currentTarget}) نفسها: هل هي اسم ظاهر يمكن أن تتغير علامته؟ إذا نعم فهي اسم معرب، ثم ننتقل إلى العدد وآخر الكلمة.`;
            }
            if (id === "inna_ism_built" || id === "inna_khabar_single_built") {
                if (mabniType === "ishara")
                    return `هل (${currentTarget}) تستعمل للإشارة إلى شيء؟ مثل: هذا، هذه، هؤلاء. إذا نعم فهي اسم إشارة.`;
                if (mabniType === "mawsool")
                    return `هل (${currentTarget}) تحتاج جملة بعدها توضّح معناها؟ مثل: الذي نجح، التي اجتهدت. إذا نعم فهي اسم موصول.`;
                if (mabniType === "damir")
                    return `هل (${currentTarget}) تدل على متكلم أو مخاطب أو غائب، مثل: أنا، أنت، هو؟ إذا نعم فهي ضمير.`;
                return `قارن (${currentTarget}) بأنواع الأسماء المبنية: ضمير، اسم إشارة، اسم موصول. اختر النوع المطابق للكلمة نفسها.`;
            }
            if (id === "inna_khabar_kind") {
                if (khabarKind === "single")
                    return `لا تحكم بعدد الكلمات حول الخبر. اسأل: هل (${currentTarget}) جملة فيها فعل وفاعل أو مبتدأ وخبر؟ وهل هي جار ومجرور أو ظرف؟ إذا لا، فهي خبر مفرد ولو جاء بعدها مضاف إليه مثل: ذو فضل.`;
                if (khabarKind === "sentence")
                    return `انظر إلى الخبر كاملًا: هل فيه إسناد داخلي، أي فعل مع فاعله أو مبتدأ وخبر؟ إذا نعم فالخبر جملة كاملة لا كلمة واحدة.`;
                if (khabarKind === "shibh")
                    return `شبه الجملة يكون جارًا ومجرورًا مثل: في البيت، أو ظرفًا مثل: عندنا. إذا كان المحدد من هذا النوع فهو خبر شبه جملة.`;
                return `حدّد صورة الخبر من المثال نفسه: كلمة ليست جملة، أم جملة كاملة، أم جار ومجرور أو ظرف.`;
            }
            if (id === "inna_ism_number" || id === "inna_khabar_single_number") {
                if (number === "five")
                    return `افحص هل (${currentTarget}) من الأسماء الخمسة: أب، أخ، حم، فو، ذو بمعنى صاحب. إذا كان مفردًا، مكبرًا، مضافًا، ومضافًا إلى غير ياء المتكلم، أعرب بالحروف.`;
                if (number === "dual")
                    return `ابحث عن دلالة الاثنين وعلامة التثنية في (${currentTarget}): غالبًا ألف ونون أو ياء ونون.`;
                if (number === "jms")
                    return `ابحث عن جماعة ذكور عاقلة وعلامة جمع المذكر السالم في (${currentTarget}): واو ونون أو ياء ونون.`;
                if (number === "jfs")
                    return `ابحث عن ألف وتاء في آخر (${currentTarget}) مثل: الطالبات، المجتهدات؛ هذا يدل غالبًا على جمع مؤنث سالم.`;
                return `اسأل عن صورة (${currentTarget}): واحد أو جمع تكسير، اثنان، جمع مذكر سالم، جمع مؤنث سالم، أو اسم من الأسماء الخمسة.`;
            }
            if (id === "inna_ism_ending" || id === "inna_khabar_single_ending") {
                if (ending === "maqsur")
                    return `الاسم المقصور آخره ألف لازمة مثل: الفتى، الهدى. على هذه الألف تُقدَّر العلامة غالبًا للتعذر.`;
                if (ending === "manqous")
                    return `الاسم المنقوص آخره ياء لازمة مكسور ما قبلها مثل: القاضي. وقد تحذف الياء إذا كان نكرة مرفوعًا أو مجرورًا مثل: راضٍ.`;
                return `احذف التنوين والعلامات الزائدة، ثم انظر إلى الحرف الأصلي الأخير في (${currentTarget}): هل هو حرف صحيح، ألف مقصورة، أم ياء منقوصة؟`;
            }
            if (id === "inna_khabar_sentence_type") {
                return `انظر إلى أول كلمة في جملة الخبر: إن بدأت بفعل فهي جملة فعلية، وإن بدأت باسم وفيها خبر داخلي فهي جملة اسمية.`;
            }
            if (id === "inna_khabar_shibh_type") {
                if (shibhType === "jar")
                    return `إذا بدأ المحدد بحرف جر مثل: في، على، من، إلى؛ فهو جار ومجرور.`;
                if (shibhType === "zarf")
                    return `إذا كان المحدد يدل على مكان أو زمان مثل: عند، أمام، فوق؛ فهو ظرف.`;
                return `فرّق بين الجار والمجرور والظرف: حرف جر + اسم مجرور، أو ظرف مكان/زمان.`;
            }
            if (id === "inna_khabar_shibh_position_jar" || id === "inna_khabar_shibh_position_zarf") {
                return `انظر إلى الترتيب بعد إن: إذا جاء شبه الجملة مباشرة ثم بعده اسم نكرة منصوب، فشبه الجملة خبر مقدم، والاسم النكرة اسم إن مؤخر.`;
            }
        }
        if (id === "inna_meaning") {
            const particleMeaning = String(state?.facts?.particleMeaning || "tawkid");
            const subject = String(state?.facts?.meaningSubject || "الاسم").replace(/\.$/, "");
            const predicate = String(state?.facts?.meaningPredicate || "الخبر").replace(/\.$/, "");
            const judgment = String(state?.facts?.meaningJudgment || "الجملة").replace(/\.$/, "");
            const particle = String(state?.facts?.particleLabel || "إن");
            if (picked?.id === "semantic_subject") {
                if (particleMeaning === "tamanni")
                    return `كلمة (${subject}) وحدها ليست الشيء المتمنى كاملًا؛ المتمنى هو تحقق المعنى كله: (${judgment}).`;
                if (particleMeaning === "tarajji")
                    return `كلمة (${subject}) وحدها ليست الشيء المرجو كاملًا؛ المرجو هو تحقق المعنى كله: (${judgment}).`;
                if (particleMeaning === "tashbih")
                    return `لا نقف عند (${subject}) وحده؛ كأن ربطت الاسم بالخبر لتفيد معنى التشبيه في: (${judgment}).`;
                if (particleMeaning === "istidrak")
                    return `لكن لا تستدرك على كلمة منفردة هنا، بل على فكرة كاملة: (${judgment}).`;
                return `${particle} لا تؤكد كلمة (${subject}) وحدها هنا، بل تؤكد الحكم الكامل: (${judgment}).`;
            }
            if (picked?.id === "semantic_predicate") {
                if (particleMeaning === "tamanni")
                    return `كلمة (${predicate}) جزء من المعنى، لكن التمني وقع على الجملة كلها: (${judgment}).`;
                if (particleMeaning === "tarajji")
                    return `كلمة (${predicate}) جزء من المعنى، لكن الرجاء وقع على الجملة كلها: (${judgment}).`;
                if (particleMeaning === "tashbih")
                    return `الخبر (${predicate}) جزء من التشبيه، لكن معنى كأن لا يتم إلا بالعلاقة كاملة: (${judgment}).`;
                if (particleMeaning === "istidrak")
                    return `الخبر (${predicate}) جزء من الفكرة، لكن الاستدراك يكون على المعنى الكامل: (${judgment}).`;
                return `كلمة (${predicate}) جزء من المعنى، لكن التوكيد لم يقع عليها وحدها، بل على الجملة كلها: (${judgment}).`;
            }
        }
        if (id === "inna_compact_role") {
            const judgment = String(state?.facts?.meaningJudgment || "الجملة الأصلية").replace(/\.$/, "");
            const subject = String(state?.facts?.meaningSubject || "الاسم").replace(/\.$/, "");
            const predicate = String(state?.facts?.meaningPredicate || "الخبر").replace(/\.$/, "");
            const particle = String(state?.facts?.particleLabel || "إن");
            if (pickedText.includes("اسم") && state?.facts?.targetRole === "khabar")
                return innaGenericLabel(`في الجملة الاسمية (${judgment}) الاسم الذي نتحدث عنه هو (${subject})، أما (${currentTarget}) فهي المعلومة التي أتمت المعنى؛ لذلك هي خبر إن لا اسمها.`, state);
            if (pickedText.includes("خبر") && state?.facts?.targetRole === "ism")
                return innaGenericLabel(`في الجملة الاسمية (${judgment}) الكلمة المحددة (${currentTarget}) هي الاسم الذي نتحدث عنه، وبعد دخول ${particle} صارت اسم إن. الخبر هو المعلومة: (${predicate}).`, state);
        }
        if (id === "inna_factor_gate") {
            if (pickedText.includes("ترفع الاسم"))
                return "هذا أثر كان وأخواتها. أما إن وأخواتها فتنصب الاسم ويسمى اسم إن، وترفع الخبر ويسمى خبر إن.";
            if (pickedText.includes("لا تؤثر"))
                return "إن وأخواتها حروف ناسخة؛ دخولها يغير الحكم الإعرابي: نقول الطالبُ نشيطٌ، ثم إنَّ الطالبَ نشيطٌ.";
        }
        if (id === "inna_ism_start" || id === "inna_khabar_single_start") {
            if (pickedText.includes("مبني"))
                return `اخترت أن (${currentTarget}) اسم مبني. تذكر: الاسم المبني ليس حرفًا؛ هو من الأسماء لكنه ثابت الآخر. افحص الكلمة نفسها: هل هي ضمير مثل الكاف في إنك؟ هل هي اسم إشارة مثل هذا؟ هل هي اسم موصول مثل الذي؟ أم أنها كلمة يتغير آخرها بحسب موقعها؟`;
            if (pickedText.includes("مصدر"))
                return `المصدر المؤول تركيب مثل: أن تنجح أو أن تتعلم، ويؤول إلى مصدر: نجاحك أو تعلمك. هل (${currentTarget}) تركيب من هذا النوع أم كلمة واحدة؟`;
            if (pickedText.includes("معرب"))
                return `الاسم المعرب يتغير آخره بحسب موقعه. اختبر (${currentTarget}): هل تظهر عليه العلامة أو يمكن أن تتغير، أم يلزم صورة واحدة مثل الضمائر وأسماء الإشارة والموصولات؟`;
        }
        if (id === "inna_ism_built" || id === "inna_khabar_single_built") {
            if (pickedText.includes("إشارة"))
                return `اسم الإشارة يدل على مشار إليه مثل: هذا، هذه، ذلك. هل (${currentTarget}) يشير إلى شيء، أم يدل على متكلم أو مخاطب أو غائب، أم يحتاج صلة بعده؟`;
            if (pickedText.includes("ضمير"))
                return `الضمير يدل على متكلم أو مخاطب أو غائب. الكاف في (إنك) ضمير متصل؛ أما (هذا) فاسم إشارة، و(الذي) اسم موصول.`;
            if (pickedText.includes("موصول"))
                return `الاسم الموصول مثل: الذي، التي، من، ما، ويحتاج صلة بعده توضحه. هل (${currentTarget}) من هذه الأسماء ويحتاج صلة؟`;
            if (pickedText.includes("استفهام"))
                return `اسم الاستفهام يطلب جوابًا مثل: من؟ ما؟ أين؟ هل الجملة هنا سؤال حقيقي، أم أن (${currentTarget}) يؤدي وظيفة أخرى؟`;
            if (pickedText.includes("شرط"))
                return `اسم الشرط يربط فعل الشرط بجوابه مثل: من يجتهد ينجح. هل في الجملة شرط وجواب؟`;
            if (pickedText.includes("كم"))
                return `كم الخبرية تدل على الكثرة ولا تطلب جوابًا. هل الكلمة المحددة هي (كم) بهذا المعنى، أم اسم مبني آخر؟`;
        }
        if (id === "inna_khabar_kind") {
            if (pickedText.includes("مفرد") && state?.facts?.shibhType === "zarf")
                return `صحيح أن (${currentTarget}) كلمة واحدة، لكنها هنا ظرف زمان/مكان. والظرف في باب الخبر يعامل كشبه جملة؛ لأنه متعلق بمحذوف تقديره: موجود أو كائن. لذلك في: ليت اللقاء غدًا، تكون (غدًا) شبه جملة ظرفية في محل رفع خبر ${innaParticleName(state)}.`;
            if (pickedText.includes("مفرد") && state?.facts?.shibhType === "jar")
                return `الجار والمجرور مثل (${currentTarget}) ليس خبرًا مفردًا، بل شبه جملة؛ لأنه تركيب يبدأ بحرف جر ويتعلق بمحذوف خبر.`;
            if (pickedText.includes("مفرد"))
                return `اخترتَ «خبر مفرد». الخبر المفرد في النحو يعني: ليس جملة ولا شبه جملة، ولو كان مثنى أو جمعًا أو مضافًا. افحص (${currentTarget}) على هذا الأساس.`;
            if (pickedText.includes("جملة") && state?.facts?.nounKind === "masdar")
                return `اخترتَ «خبر جملة». صحيح أن داخل (${currentTarget}) فعلًا، لكن التركيب سبق بـ«أن»، فصار مصدرًا مؤولًا يؤول باسم مثل «نجاحك»؛ لذلك لا نعربه خبر جملة، بل مصدرًا مؤولًا في محل رفع خبر ${innaParticleName(state)}.`;
            if (pickedText.includes("جملة"))
                return `اخترتَ «خبر جملة». الجملة لا بد أن يكون فيها إسناد كامل: فعل وفاعل، أو مبتدأ وخبر. افحص (${currentTarget}): هل يوجد فيه هذا الإسناد، أم أنه كلمة واحدة أو جار ومجرور أو ظرف؟`;
            if (pickedText.includes("شبه"))
                return `اخترتَ «خبر شبه جملة»، لكن شبه الجملة لا بد أن يكون جارًا ومجرورًا أو ظرفًا مثل: في الحقيبة، عند المعلم، غدًا. افحص (${currentTarget}) نفسه.`;
        }
        if (id === "inna_ism_number" || id === "inna_khabar_single_number") {
            if (pickedText.includes("مثنى"))
                return `المثنى يدل على اثنين وينتهي غالبًا بـ(ان) أو (ين). انظر إلى (${currentTarget}): هل يدل على اثنين؟`;
            if (pickedText.includes("جمع مذكر"))
                return `جمع المذكر السالم يدل على جماعة ذكور عاقلة، وينتهي غالبًا بـ(ون) رفعًا أو (ين) نصبًا وجرًا. هل (${currentTarget}) يوافق ذلك؟`;
            if (pickedText.includes("جمع مؤنث"))
                return `جمع المؤنث السالم ينتهي غالبًا بـ(ات). انظر إلى (${currentTarget}): هل انتهت الكلمة بـ(ات)، مثل: مجتهدات، طالبات؟`;
            if (pickedText.includes("جمع تكسير"))
                return `جمع التكسير تتغير فيه صورة المفرد مثل: كتاب ← كتب، رجل ← رجال. هل تغيرت بنية (${currentTarget}) بهذه الطريقة؟`;
            const isFiveNounTarget = String(currentTarget || "").includes("أبو") || String(currentTarget || "").includes("أبا") || String(currentTarget || "").includes("أبي") || String(currentTarget || "").includes("أخو") || String(currentTarget || "").includes("أخا") || String(currentTarget || "").includes("أخي") || String(currentTarget || "").includes("حمو") || String(currentTarget || "").includes("فوك") || String(currentTarget || "").includes("فو") || String(currentTarget || "").includes("ذو") || String(currentTarget || "").includes("ذا") || String(currentTarget || "").includes("ذي");
            if (pickedText.includes("مفرد") && isFiveNounTarget) {
                const fiveMark = id === "inna_ism_number" ? "ينصب بالألف لا بالفتحة" : "يرفع بالواو لا بالضمة";
                return `أحسنت، (${currentTarget}) يدل على واحد فعلًا، لكن له باب خاص لأنه من الأسماء الخمسة. إذا تحققت شروطها: مفرد، ومكبر، ومضاف، وغير مضاف إلى ياء المتكلم؛ فإنه يعرب بالحروف. وهنا ${fiveMark}. عد للسؤال واختر: من الأسماء الخمسة.`;
            }
            if (pickedText.includes("الأسماء الخمسة"))
                return `الأسماء الخمسة هي: أب، أخ، حم، فو، ذو بمعنى صاحب. وتعرب بالحروف إذا كانت مفردة، مكبرة، مضافة، ومضافة إلى غير ياء المتكلم. هل (${currentTarget}) واحد منها واستوفى هذه الشروط؟`;
            if (pickedText.includes("مفرد"))
                return `افحص (${currentTarget}): هل يدل على واحد، أم على اثنين، أم على جمع؟`;
        }
        if (id === "inna_ism_ending" || id === "inna_khabar_single_ending") {
            if (pickedText.includes("معتل"))
                return `انظر إلى (${currentTarget}). إذا كان الاسم منقوصًا مثل راضٍ فأصله راضي، وتقدر الضمة على الياء للثقل، وقد تحذف الياء إذا كان الاسم نكرة مرفوعًا أو مجرورًا غير مضاف ولا معرف بـ(أل).`;
            if (pickedText.includes("صحيح"))
                return `صحيح الآخر يعني أن الحرف الأصلي الأخير ليس ألفًا ولا واوًا ولا ياء. لا تحكم من التنوين أو العلامة الزائدة؛ ارجع إلى أصل (${currentTarget}).`;
        }
        if (id === "inna_khabar_sentence_type") {
            if (pickedText.includes("فعلية"))
                return `الجملة الفعلية تبدأ بفعل. انظر إلى بداية الخبر (${currentTarget}): هل بدأ بفعل مثل يقرأ، أم باسم؟`;
            if (pickedText.includes("اسمية"))
                return `الجملة الاسمية تبدأ باسم وفيها مبتدأ وخبر داخليان. انظر إلى الخبر (${currentTarget}): هل بدأ باسم أم بفعل؟`;
        }
        if (id === "inna_khabar_shibh_type") {
            if (pickedText.includes("جار"))
                return `الجار والمجرور يبدأ بحرف جر مثل: في، على، من، إلى. انظر إلى (${currentTarget}): هل بدأ بحرف جر؟`;
            if (pickedText.includes("ظرف"))
                return `الظرف يدل على زمان أو مكان مثل: عند، فوق، تحت، أمام. هل (${currentTarget}) ظرف، أم جار ومجرور بدأ بحرف جر؟`;
        }
    }
  return undefined;
}
