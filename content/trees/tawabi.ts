import type { ExerciseNode, ExerciseTree } from "../../lib/exercise/model";

const tawabiSourceTree: ExerciseTree = {
    startNodeId: "tawabi_entry",
    nodes: {
        tawabi_naat_discovery: {
            id: "tawabi_naat_discovery",
            type: "question",
            context: "قبل الإعراب نثبت سبب دخول الكلمة في باب النعت؛ فالمصطلح يأتي بعد فهم العلاقة.",
            text: "ما الدليل الذي يثبت أن الكلمة المحددة نعت للاسم السابق؟",
            hint: "النعت يصف اسمًا قبله أو يخصصه بصفة فيه. لا تخلطه بالخبر الذي يتمم معنى الجملة، ولا بالحال التي تبين الهيئة وقت الفعل.",
            answers: [
                {
                    id: "description",
                    text: "تصف الاسم السابق وتبين صفة فيه",
                    next: "tawabi_case",
                    eval: { fact: "relationKind", equals: "description" },
                    hint: "ابحث عن الصفة التي أضافتها الكلمة إلى الاسم السابق؛ هذه هي علاقة النعت بالمنعوت."
                },
                {
                    id: "predicate",
                    text: "تتم معنى الجملة عن مبتدأ كخبر",
                    next: "tawabi_naat_discovery",
                    correct: false,
                    hint: "الخبر ركن يتمم الجملة، أما الكلمة هنا فترجع إلى اسم قبلها وتصفه."
                },
                {
                    id: "state",
                    text: "تبين هيئة صاحبها وقت حدوث الفعل كحال",
                    next: "tawabi_naat_discovery",
                    correct: false,
                    hint: "الحال يبين الهيئة وقت الفعل، أما النعت فيبين صفة في الاسم السابق نفسه."
                }
            ]
        },
        tawabi_atf_discovery: {
            id: "tawabi_atf_discovery",
            type: "question",
            context: "قبل نقل الإعراب نثبت سبب العطف من تركيب الجملة نفسها.",
            text: "ما الدليل الذي جعل الكلمة المحددة معطوفة على الاسم السابق؟",
            hint: "ابحث قبل الكلمة عن حرف عطف مثل: الواو، الفاء، ثم، أو. الحرف يشرك ما بعده مع ما قبله في الحكم.",
            answers: [
                {
                    id: "coordination",
                    text: "حرف العطف أشرك الكلمة مع ما قبلها في الحكم",
                    next: "tawabi_case",
                    eval: { fact: "relationKind", equals: "coordination" },
                    hint: "حدّد حرف العطف في المثال، ثم لاحظ أن الكلمة بعده شاركت الاسم السابق في الحكم."
                },
                {
                    id: "description",
                    text: "وصفت الاسم السابق بصفة جديدة",
                    next: "tawabi_atf_discovery",
                    correct: false,
                    hint: "وجود حرف العطف هو المؤثر هنا؛ الكلمة شاركت ما قبلها في الحكم ولم تأت لوصفه."
                },
                {
                    id: "emphasis",
                    text: "أكدت الاسم السابق من غير حرف عطف",
                    next: "tawabi_atf_discovery",
                    correct: false,
                    hint: "التوكيد لا يحتاج حرف عطف، أما هنا فحرف العطف هو الذي ربط الكلمتين."
                }
            ]
        },
        tawabi_tawkid_discovery: {
            id: "tawabi_tawkid_discovery",
            type: "question",
            context: "نثبت أولًا وظيفة الكلمة في المعنى، ثم نحدد نوع التوكيد.",
            text: "ماذا فعلت الكلمة المحددة بالاسم السابق؟",
            hint: "التوكيد يقوي المعنى أو يرفع الشك، ولا يضيف صفة جديدة ولا يفسر اسمًا غامضًا.",
            answers: [
                {
                    id: "emphasis",
                    text: "أكدته وقوّت معناه من غير أن تضيف صفة جديدة",
                    next: "tawabi_tawkid_kind",
                    eval: { fact: "relationKind", equals: "emphasis" },
                    hint: "اسأل: هل الكلمة كررت اللفظ أو جاءت بلفظ من ألفاظ التوكيد مثل نفس وكل وجميع؟"
                },
                {
                    id: "description",
                    text: "وصفته بصفة جديدة",
                    next: "tawabi_tawkid_discovery",
                    correct: false,
                    hint: "الوصف يضيف صفة، أما الكلمة هنا فثبتت المعنى الموجود ولم تضف وصفًا جديدًا."
                },
                {
                    id: "substitution",
                    text: "فسرت المقصود منه بوصفها بدلًا",
                    next: "tawabi_tawkid_discovery",
                    correct: false,
                    hint: "البدل يوضح المقصود أو جزءًا منه، أما هذه الكلمة فغرضها تقوية المعنى."
                }
            ]
        },
        tawabi_badal_discovery: {
            id: "tawabi_badal_discovery",
            type: "question",
            context: "قبل الإعراب نثبت علاقة البدل بالمبدل منه، ثم ننقل الحالة الإعرابية.",
            text: "ما العلاقة التي تثبت أن الكلمة المحددة بدل من الاسم السابق؟",
            hint: "البدل يوضح المقصود من الاسم السابق، أو يذكر جزءًا حقيقيًا منه، أو معنى يشتمل عليه. وفي بدل البعض والاشتمال يوجد غالبًا ضمير يعود على المبدل منه.",
            answers: [
                {
                    id: "substitution",
                    text: "توضح المقصود منه أو تذكر جزءًا أو معنى مرتبطًا به",
                    next: "tawabi_badal_kind",
                    eval: { fact: "relationKind", equals: "substitution" },
                    hint: "اختبر العلاقة: أهي الاسم المقصود نفسه، أم جزء منه، أم معنى يشتمل عليه؟ هذه صور البدل الأساسية."
                },
                {
                    id: "description",
                    text: "تصف الاسم السابق بصفة فيه",
                    next: "tawabi_badal_discovery",
                    correct: false,
                    hint: "النعت يصف، أما البدل فيوضح المقصود أو يذكر جزءًا أو معنى من المبدل منه."
                },
                {
                    id: "emphasis",
                    text: "تؤكد الاسم السابق ولا تضيف معنى جديدًا",
                    next: "tawabi_badal_discovery",
                    correct: false,
                    hint: "التوكيد يقوي المعنى، أما الكلمة هنا فتفسر المقصود أو تبين جزءًا أو معنى منه."
                }
            ]
        },
        tawabi_badal_kind: {
            id: "tawabi_badal_kind",
            type: "question",
            context: "ثبت أن الكلمة بدل. نحدد الآن نوع العلاقة قبل نقل الحالة الإعرابية من المبدل منه.",
            text: "ما نوع البدل في هذا المثال؟",
            hint: "إذا كانت الكلمة الثانية هي المقصودة نفسها ويمكن أن تحل محل الأولى فهي بدل مطابق. وإذا كانت جزءًا حقيقيًا منها فهي بعض من كل. وإذا كانت معنى أو صفة تشتمل عليها وليست جزءًا ماديًا فهي بدل اشتمال.",
            answers: [
                { id: "matched", text: "بدل مطابق", next: "tawabi_case", eval: { fact: "badalKind", equals: "مطابق" }, hint: "جرّب حذف المبدل منه ووضع البدل مكانه؛ إذا بقي المعنى مستقيمًا وكانت الكلمة الثانية هي المقصودة نفسها، فهو بدل مطابق." },
                { id: "part", text: "بدل بعض من كل", next: "tawabi_case", eval: { fact: "badalKind", equals: "بعض من كل" }, hint: "ابحث عن جزء حقيقي من المبدل منه، وغالبًا يتصل بالبدل ضمير يعود عليه." },
                { id: "inclusion", text: "بدل اشتمال", next: "tawabi_case", eval: { fact: "badalKind", equals: "اشتمال" }, hint: "ابحث عن معنى أو صفة تتعلق بالمبدل منه وليست جزءًا ماديًا منه، وغالبًا يتصل بها ضمير يعود عليه." },
            ]
        },
                tawabi_entry: {
            id: "tawabi_entry",
            type: "question",
            context: "في الجملة قد تكون الكلمة ركنًا مستقلًا، وقد تكون راجعة إلى اسم قبلها تكمله أو تؤكده أو تشاركه أو تفسره. نبدأ من هذا الفرق قبل المصطلح.",
            text: "هل الكلمة المحددة تؤدي وظيفة مستقلة، أم ترجع إلى اسم قبلها؟",
            hint: "اسأل: هل الكلمة تخبر عن شيء أو تبين هيئة وقت الفعل أو تأتي مجرورة بالإضافة؟ أم أنها لا تبدأ حكمًا جديدًا بل تعود إلى اسم قبلها؟ إذا رجعت إلى اسم قبلها فهي مدخل باب التوابع.",
            answers: [
                {
                    id: "dependent_on_previous_noun",
                    text: "ترجع إلى اسم قبلها وتكمله",
                    next: "tawabi_relation",
                    correct: true,
                    hint: "هذا هو مدخل التوابع: الكلمة مرتبطة باسم سابق، ثم نحدد نوع هذه العلاقة: وصف، عطف، توكيد، أو بدل."
                },
                {
                    id: "predicate_or_pillar",
                    text: "تؤدي معنى مستقلًا يتمم الجملة",
                    next: "tawabi_entry",
                    correct: false,
                    hint: "هذا يناسب الخبر أو ركنًا أصليًا من الجملة. أما التابع فلا يبدأ معنى مستقلًا؛ بل يرجع إلى اسم قبله ويتبعه في الإعراب."
                },
                {
                    id: "state_of_action",
                    text: "تبيّن هيئة صاحبها وقت حدوث الفعل",
                    next: "tawabi_entry",
                    correct: false,
                    hint: "هذه علامة الحال، مثل: جاء الطالبُ مسرورًا. الحال يبين الهيئة وقت الفعل، أما التابع فيرتبط باسم قبله ويتبعه في الرفع أو النصب أو الجر."
                },
                {
                    id: "idafa_completion",
                    text: "تكمل اسمًا قبلها بملكية أو تخصيص وتجرّ بالإضافة",
                    next: "tawabi_entry",
                    correct: false,
                    hint: "هذا أقرب إلى المضاف إليه، مثل: كتابُ الطالبِ. المضاف إليه مجرور بالإضافة، أما التابع فحكمه يتغير بحسب المتبوع: رفعًا أو نصبًا أو جرًّا."
                }
            ]
        },
        tawabi_relation: {
            id: "tawabi_relation",
            type: "question",
            context: "عرفنا أن الكلمة رجعت إلى اسم قبلها. الآن نحدد العلاقة بالمعنى قبل أن نسميها.",
            text: "ما نوع العلاقة بين الكلمة المحددة والاسم السابق؟",
            hint: "لا تبدأ بالحركة. اسأل: هل وصفت الاسم السابق؟ هل سبقها حرف عطف فأشركها؟ هل أكدته؟ أم كانت بدلًا يوضح المقصود؟ في البدل المطابق يمكن إحلال البدل محل المبدل منه، أما بدل البعض والاشتمال فيرتبطان غالبًا بضمير يعود عليه.",
            answers: [
                {
                    id: "description",
                    text: "وصفته أو خصصته بصفة فيه",
                    next: "tawabi_term",
                    eval: { fact: "relationKind", equals: "description" },
                    hint: "الوصف يبين صفة في الاسم السابق. وفي النعت الجملة أو شبه الجملة يكون المنعوت غالبًا نكرة، وتوجد رابطة أو تقدير يربط النعت بالمنعوت."
                },
                {
                    id: "coordination",
                    text: "شاركته في الحكم بواسطة حرف عطف",
                    next: "tawabi_term",
                    eval: { fact: "relationKind", equals: "coordination" },
                    hint: "العطف يحتاج حرفًا يربط بين المعطوف والمعطوف عليه، مثل: الواو، الفاء، ثم، أو. ما بعد الحرف يشارك ما قبله في الحكم الإعرابي."
                },
                {
                    id: "emphasis",
                    text: "أكدته ولم تضف صفة جديدة",
                    next: "tawabi_term",
                    eval: { fact: "relationKind", equals: "emphasis" },
                    hint: "التوكيد يثبت المعنى أو يرفع الشك. قد يكون لفظيًا بتكرار اللفظ نفسه، أو معنويًا بألفاظ مثل: نفس، عين، كل، جميع، كلا، كلتا، بشرط أن يعود الضمير على المؤكَّد في التوكيد المعنوي."
                },
                {
                    id: "substitution",
                    text: "جاءت بدلًا يوضح المقصود منه",
                    next: "tawabi_term",
                    eval: { fact: "relationKind", equals: "substitution" },
                    hint: "في البدل المطابق يمكن إحلال التابع محل الاسم السابق. أما بدل البعض والاشتمال فقد يحتاج ضميرًا يعود على المبدل منه."
                }
            ]
        },
        tawabi_term: {
            id: "tawabi_term",
            type: "question",
            context: "بعد فهم العلاقة ننتقل إلى المصطلح. المصطلح نتيجة للمعنى وليس نقطة البداية.",
            text: "ما الاسم النحوي لهذه العلاقة؟",
            hint: "النعت يصف، والمعطوف يأتي بعد حرف عطف، والتوكيد يثبت المعنى أو ينفي الشك، والبدل يفسر المقصود من الاسم السابق.",
            answers: [
                { id: "naat", text: "نعت", next: "tawabi_case", eval: { fact: "tawabiTerm", equals: "naat" }, hint: "النعت تابع يصف منعوته. وقد يكون مفردًا، أو جملة فيها رابط، أو شبه جملة متعلقًا بتقدير مثل: كائن أو موجود." },
                { id: "atf", text: "معطوف", next: "tawabi_case", eval: { fact: "tawabiTerm", equals: "atf" }, hint: "المعطوف تابع يقع بعد حرف عطف ويشارك المعطوف عليه في الحكم والإعراب." },
                { id: "tawkid", text: "توكيد", next: "tawabi_tawkid_kind", eval: { fact: "tawabiTerm", equals: "tawkid" }, hint: "التوكيد لا يضيف صفة جديدة، بل يرسّخ المعنى أو يرفع احتمال المجاز أو النقص. بعد اكتشافه نحدد: هل كان التوكيد بتكرار اللفظ أم بأحد ألفاظ التوكيد المعنوي؟" },
                { id: "badal", text: "بدل", next: "tawabi_badal_kind", eval: { fact: "tawabiTerm", equals: "badal" }, hint: "البدل يزيل الغموض عن المبدل منه. قد يكون مطابقًا، أو بعضًا من كل، أو اشتمالًا." }
            ]
        },
        tawabi_tawkid_kind: {
            id: "tawabi_tawkid_kind",
            type: "question",
            context: "عرفنا أن الكلمة أكدت ما قبلها. الآن نحدد كيف حصل التوكيد دون إطالة المسار.",
            text: "كيف أكدت الكلمة ما قبلها؟",
            hint: "إن أعادت الكلمة اللفظ نفسه فهو توكيد لفظي. وإن جاءت بألفاظ مثل: نفس، عين، كل، جميع، كلا، كلتا؛ فهو توكيد معنوي.",
            answers: [
                {
                    id: "lafzi",
                    text: "أعادت تكرار اللفظ نفسه، وهذا توكيد لفظي",
                    next: "tawabi_case",
                    eval: { fact: "tawkidKind", equals: "lafzi" },
                    hint: "التوكيد اللفظي يكون بتكرار اللفظ نفسه أو ما في معناه، مثل: الصدقُ الصدقُ منجاةٌ."
                },
                {
                    id: "manawi",
                    text: "جاءت بأحد ألفاظ التوكيد المعنوي مثل: نفس، عين، كل، جميع، كلا، كلتا",
                    next: "tawabi_case",
                    eval: { fact: "tawkidKind", equals: "manawi" },
                    hint: "التوكيد المعنوي يكون بألفاظ مخصوصة، ويحتاج غالبًا ضميرًا يعود على المؤكَّد، مثل: نفسُه، كلُّهم، جميعُهم."
                }
            ]
        },
        tawabi_case: {
            id: "tawabi_case",
            type: "question",
            context: "أعرب المتبوع أولًا، ثم انقل حالته إلى التابع.",
            text: "ما الحالة الإعرابية التي أخذتها الكلمة المحددة من متبوعها؟",
            hint: "ابحث عن المتبوع قبل الكلمة المحددة: أهو مرفوع أم منصوب أم مجرور؟ هذه الحالة نفسها تنتقل إلى التابع.",
            answers: [
                { id: "raf3", text: "الرفع", next: "tawabi_form", eval: { fact: "case", equals: "raf3" }, hint: "إذا كان المتبوع مرفوعًا، فالفرع التابع له مرفوع أيضًا، ولو اختلفت علامة الرفع." },
                { id: "nasb", text: "النصب", next: "tawabi_form", eval: { fact: "case", equals: "nasb" }, hint: "إذا كان المتبوع منصوبًا، فالفرع التابع له منصوب أيضًا، ثم نبحث عن العلامة المناسبة لصورة التابع." },
                { id: "jarr", text: "الجر", next: "tawabi_form", eval: { fact: "case", equals: "jarr" }, hint: "إذا كان المتبوع مجرورًا، فالفرع التابع له مجرور أيضًا، سواء كان نعتًا أو معطوفًا أو توكيدًا أو بدلًا." }
            ]
        },
        tawabi_form: {
            id: "tawabi_form",
            type: "question",
            context: "بعد معرفة الحالة، نحدد صورة التابع. هذه الخطوة تمنع الخلط بين الحالة والعلامة.",
            text: "ما صورة الكلمة أو التركيب المحدد؟",
            hint: "قد يكون التابع اسمًا ظاهرًا معربًا، أو اسمًا مبنيًا في محل إعراب، وقد يأتي النعت خاصة جملة أو شبه جملة في محل رفع أو نصب أو جر.",
            answers: [
                { id: "mu3rab", text: "اسم ظاهر معرب", next: "tawabi_shape", eval: { fact: "roleKind", equals: "mu3rab" }, hint: "الاسم الظاهر المعرب تتغير علامته بحسب موقعه، مثل: المجتهدُ، المجتهدَ، المجتهدِ." },
                { id: "sentence", text: "جملة", next: "tawabi_sentence_type", eval: { fact: "roleKind", equals: "sentence" }, hint: "النعت الجملة يأتي بعد نكرة، ويحتاج رابطًا يعود على المنعوت؛ مثل: خطيبٍ يرفعُ صوتَهُ." },
                { id: "shibh", text: "شبه جملة", next: "R_tawabi_shibh", eval: { fact: "roleKind", equals: "shibh" }, hint: "النعت شبه الجملة يكون جارًا ومجرورًا أو ظرفًا، ويتعلق بتقدير مثل: كائن أو موجود." },
                { id: "verb", text: "فعل وحده", next: "tawabi_form", correct: false, hint: "إذا كان المحدد جملة فعلية فلا نعرب الفعل وحده تابعًا؛ بل نعرب الجملة كلها في محل إعراب تابع، إذا تحققت شروط النعت الجملة." }
            ]
        },
        tawabi_sentence_type: {
            id: "tawabi_sentence_type",
            type: "question",
            context: "بما أن المحدد جملة تابعة، نحدد نوع الجملة من أولها قبل صياغة المحل الإعرابي.",
            text: "ما نوع الجملة المحددة؟",
            hint: "إذا بدأت الجملة بفعل فهي جملة فعلية، وإذا بدأت باسم وفيها مبتدأ وخبر فهي جملة اسمية.",
            answers: [
                { id: "verbal", text: "جملة فعلية", next: "R_tawabi_sentence", eval: { fact: "phraseKind", equals: "جملة فعلية" }, hint: "مثل «يرفع صوته»: بدأت بالفعل «يرفع»، وفيها فاعل ومتممات؛ فهي جملة فعلية." },
                { id: "nominal", text: "جملة اسمية", next: "R_tawabi_sentence", eval: { fact: "phraseKind", equals: "جملة اسمية" }, hint: "مثل «أخلاقه حسنة»: بدأت باسم وفيها مبتدأ وخبر؛ فهي جملة اسمية." },
            ]
        },
                tawabi_shape: {
            id: "tawabi_shape",
            type: "question",
            context: "بما أن التابع اسم ظاهر معرب، نحدد صورته لنصل إلى العلامة الصحيحة.",
            text: "ما صورة التابع المعرب؟",
            hint: "انتبه: هنا كلمة مفرد تعني من جهة العدد والصيغة، لا تعني نعتًا مفردًا مقابل النعت الجملة وشبه الجملة. انظر إلى الكلمة نفسها: واحد، اثنان، جمع، أم من الأسماء الخمسة؟",
            answers: [
                { id: "singular", text: "مفرد في العدد", next: "tawabi_mark", eval: { fact: "shape", equals: "singular" }, hint: "المفرد هنا يدل على واحد أو واحدة، ويعرب غالبًا بالحركات الظاهرة." },
                { id: "dual", text: "مثنى", next: "tawabi_mark", eval: { fact: "shape", equals: "dual" }, hint: "المثنى يدل على اثنين أو اثنتين، وعلامته الألف في الرفع والياء في النصب والجر." },
                { id: "jms", text: "جمع مذكر سالم", next: "tawabi_mark", eval: { fact: "shape", equals: "jms" }, hint: "جمع المذكر السالم يدل على جماعة ذكور عاقلة، وعلامته الواو في الرفع والياء في النصب والجر." },
                { id: "jfs", text: "جمع مؤنث سالم", next: "tawabi_mark", eval: { fact: "shape", equals: "jfs" }, hint: "جمع المؤنث السالم ينتهي غالبًا بألف وتاء زائدتين، وينصب بالكسرة نيابة عن الفتحة." },
                { id: "jt", text: "جمع تكسير", next: "tawabi_mark", eval: { fact: "shape", equals: "jt" }, hint: "جمع التكسير تتغير فيه صورة المفرد، مثل: طفل ← أطفال، ويعرب غالبًا بالحركات." },
                { id: "five", text: "من الأسماء الخمسة", next: "tawabi_mark", eval: { fact: "shape", equals: "five" }, hint: "الأسماء الخمسة تعرب بالحروف إذا كانت مفردة، مكبرة، مضافة، ومضافة إلى غير ياء المتكلم." }
            ]
        },
        tawabi_mark: {
            id: "tawabi_mark",
            type: "question",
            context: "الحالة جاءت من المتبوع، أما العلامة فتأتي من صورة التابع نفسه.",
            text: "ما علامة الإعراب المناسبة للكلمة المحددة؟",
            hint: "لا تقل: التابع يأخذ علامة المتبوع دائمًا. الأدق: يأخذ حالته، ثم نختار العلامة حسب صورته؛ فقد يكون المتبوع مرفوعًا بالضمة والتابع مرفوعًا بالواو.",
            answers: [
                { id: "damma", text: "الضمة", next: "R_tawabi_mu3rab", eval: { fact: "mark", equals: "damma" }, hint: "الضمة تناسب الرفع في المفرد وجمع التكسير وجمع المؤنث السالم." },
                { id: "fatha", text: "الفتحة", next: "R_tawabi_mu3rab", eval: { fact: "mark", equals: "fatha" }, hint: "الفتحة تناسب النصب في المفرد وجمع التكسير." },
                { id: "kasra", text: "الكسرة", next: "R_tawabi_mu3rab", eval: { fact: "mark", equals: "kasra" }, hint: "الكسرة تناسب الجر في المفرد وجمع التكسير، وتنوب عن الفتحة في نصب جمع المؤنث السالم." },
                { id: "alif", text: "الألف", next: "R_tawabi_mu3rab", eval: { fact: "mark", equals: "alif" }, hint: "الألف علامة رفع المثنى، وعلامة نصب الأسماء الخمسة إذا تحققت شروطها." },
                { id: "yaa", text: "الياء", next: "R_tawabi_mu3rab", eval: { fact: "mark", equals: "yaa" }, hint: "الياء علامة نصب وجر المثنى وجمع المذكر السالم، وعلامة جر الأسماء الخمسة." },
                { id: "waw", text: "الواو", next: "R_tawabi_mu3rab", eval: { fact: "mark", equals: "waw" }, hint: "الواو علامة رفع جمع المذكر السالم، وعلامة رفع الأسماء الخمسة إذا تحققت شروطها." }
            ]
        },
        R_tawabi_mu3rab: { id: "R_tawabi_mu3rab", type: "result", coverage: "tawabi.mu3rab", text: "تابع معرب يتبع متبوعه في الحالة الإعرابية، وتحدد علامته من صورته." },
        R_tawabi_sentence: { id: "R_tawabi_sentence", type: "result", coverage: "tawabi.sentence", text: "جملة فعلية أو اسمية في محل إعراب تابع لما قبلها بحسب المثال." },
        R_tawabi_shibh: { id: "R_tawabi_shibh", type: "result", coverage: "tawabi.shibh", text: "شبه جملة في محل إعراب تابع لما قبلها." }
    }
};
// في الموضوعات المنفصلة يعرف الطالب الباب من عنوان الصفحة؛ لذلك لا نعيد
// أسئلة اكتشاف الباب والمصطلح في كل مثال. وننشئ لكل فرع شجرة مصغرة فعلية
// بدل حمل عقد لا يمكن الوصول إليها في ذلك الفرع.
function createTawabiBranchTree(startNodeId: string, practiceStartNodeId: string, allowedForms: string[]): ExerciseTree {
    const reachable = new Set<string>();
    const queue = [startNodeId];
    const branchNodes: Record<string, ExerciseNode> = {};
    const skipFormQuestion = allowedForms.length === 1 && allowedForms[0] === "mu3rab";
    const nodeForBranch = (id: string) => {
        const source = tawabiSourceTree.nodes[id];
        if (!source)
            throw new Error(`عقدة التوابع غير موجودة: ${id}`);
        if (id === "tawabi_case" && skipFormQuestion) {
            if (source.type !== "question")
                throw new Error("عقدة tawabi_case يجب أن تكون سؤالًا.");
            return {
                ...source,
                answers: source.answers.map((answer) => ({ ...answer, next: "tawabi_shape" })),
            };
        }
        if (id !== "tawabi_form") return source;
        if (source.type !== "question") {
            throw new Error("عقدة tawabi_form يجب أن تكون سؤالًا.");
        }
        return {
            ...source,
            answers: source.answers.filter((answer) => allowedForms.includes(answer.id)),
        };
    };
    while (queue.length) {
        const id = queue.shift();
        if (!id || reachable.has(id))
            continue;
        const node = nodeForBranch(id);
        reachable.add(id);
        branchNodes[id] = node;
        if (node.type !== "question")
            continue;
        for (const answer of node.answers || []) {
            if (answer.next)
                queue.push(answer.next);
            for (const target of Object.values(answer.nextByFact?.map || {}))
                queue.push(String(target));
            if (answer.nextByFact?.default)
                queue.push(answer.nextByFact.default);
        }
    }
    return { startNodeId, practiceStartNodeId, nodes: branchNodes };
}

// عقد الاكتشاف الأربع مخصّصة للأبواب المنفصلة. أمّا التدريب المختلط
// فيبدأ من مدخل التوابع العام ثم يكتشف نوع العلاقة؛ لذلك نحذف هذه
// العقد من شجرته بدل إبقائها عقدًا غير قابلة للوصول.
const branchDiscoveryNodeIds = new Set([
    "tawabi_naat_discovery",
    "tawabi_atf_discovery",
    "tawabi_tawkid_discovery",
    "tawabi_badal_discovery",
]);

export const tawabiTree: ExerciseTree = {
    startNodeId: tawabiSourceTree.startNodeId,
    practiceStartNodeId: tawabiSourceTree.practiceStartNodeId,
    nodes: Object.fromEntries(
        Object.entries(tawabiSourceTree.nodes).filter(([id]) => !branchDiscoveryNodeIds.has(id))
    ),
};

// في التعلّم نبدأ بسبب التبعية حتى يبني الطالب الحكم بالتسلسل.
// في التدريب السريع نبدأ من الحالة أو نوع التوكيد للمحافظة على الاختصار.
export const tawabiNaatTree = createTawabiBranchTree("tawabi_naat_discovery", "tawabi_case", ["mu3rab", "sentence", "shibh"]);
export const tawabiAtfTree = createTawabiBranchTree("tawabi_atf_discovery", "tawabi_case", ["mu3rab"]);
export const tawabiTawkidTree = createTawabiBranchTree("tawabi_tawkid_discovery", "tawabi_tawkid_kind", ["mu3rab"]);
export const tawabiBadalTree = createTawabiBranchTree("tawabi_badal_discovery", "tawabi_case", ["mu3rab"]);
