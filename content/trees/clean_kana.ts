import type { ExerciseTree } from "../../lib/exercise/model";

export const cleanKanaTree: ExerciseTree = {
    "startNodeId": "kana_target",
    "nodes": {
        "kana_target": {
            "id": "kana_target",
            "type": "question",
            "context": "نبدأ من وظيفة الكلمة في الجملة بعد دخول الفعل الناسخ، ثم نحدد صورتها وحكمها الإعرابي.",
            "text": "ما وظيفة الكلمة المحددة بعد الفعل الناسخ؟",
            "hint": "اسأل: عمّن أو عمّا تتحدث الجملة بعد دخول الفعل الناسخ؟ فهذا اسم الناسخ. وما المعلومة التي أتمت المعنى عنه؟ فهذا خبره. وقد يكون اسم الناسخ ضميرًا مستترًا يفهم من السياق.",
            "answers": [
                {
                    "id": "a",
                    "text": "اسم الفعل الناسخ",
                    "next": "kana_ism_start",
                    "eval": { "fact": "targetRole", "equals": "ism" }
                },
                {
                    "id": "b",
                    "text": "خبر الفعل الناسخ",
                    "next": "kana_khabar_entry",
                    "eval": { "fact": "targetRole", "equals": "khabar" }
                },
                {
                    "id": "c",
                    "text": "اسم مستتر للفعل الناسخ",
                    "next": "kana_hidden_ism_site",
                    "eval": { "fact": "targetRole", "equals": "hidden_ism" },
                    "hint": "اختر هذا إذا لم يظهر في بقية الجملة بعد الفعل الناسخ اسم صريح يصلح أن يكون اسمه، وكان المعنى يعود على اسم متقدم."
                }
            ]
        },
        "kana_hidden_ism_site": {
            "id": "kana_hidden_ism_site",
            "type": "question",
            "context": "عرفنا صاحب المعنى، لكننا نريد الآن الموقع الإعرابي بعد الفعل الناسخ نفسه.",
            "text": "هل ظهر بعد الفعل الناسخ اسم صريح، أم نفهم الاسم من السياق؟",
            "hint": "افحص الجملة كلها بعد الفعل الناسخ. قد يتأخر اسم الناسخ بعد خبر مقدم، مثل: كان في البيت رجلٌ. فإذا لم يظهر اسم صريح يصلح أن يكون اسم الناسخ، وكان المعنى عائدًا على اسم متقدم، قُدّر اسم الناسخ ضميرًا مستترًا.",
            "answers": [
                { "id": "a", "text": "ظهر بعد الناسخ اسم صريح يصلح أن يكون اسمه", "next": "kana_hidden_ism_site", "correct": false, "hint": "افحص ما بعد الفعل الناسخ حتى نهاية الجملة: هل يوجد اسم صريح يصلح أن يكون اسم الناسخ، ولو جاء بعد خبر مقدم؟" },
                { "id": "b", "text": "نفهمه من السياق", "next": "kana_hidden_ism_estimate", "correct": true }
            ]
        },
        "kana_hidden_ism_estimate": {
            "id": "kana_hidden_ism_estimate",
            "type": "question",
            "context": "بما أن اسم الناسخ غير ظاهر بعد الفعل، نقدره بضمير يعود على صاحب المعنى.",
            "text": "ما تقدير اسم الفعل الناسخ المستتر؟",
            "hint": "طابق الضمير المستتر مع الاسم الذي يعود عليه في التذكير والتأنيث والعدد. في أمثلة هذا المسار نختار بين: هو، وهي.",
            "answers": [
                { "id": "a", "text": "هو", "next": "R_kana_ism_hidden_damir", "eval": { "fact": "hiddenPronoun", "equals": "هو" }, "hint": "اختر (هو) إذا كان الضمير يعود على اسم مذكر مثل المزارع أو مهند." },
                { "id": "b", "text": "هي", "next": "R_kana_ism_hidden_damir", "eval": { "fact": "hiddenPronoun", "equals": "هي" }, "hint": "اختر (هي) إذا كان الضمير يعود على اسم مؤنث مثل أسماء أو أختي." }
            ]
        },
        "kana_ism_start": {
            "id": "kana_ism_start",
            "type": "question",
            "context": "بما أننا عرفنا أن المحدد هو الاسم الذي كان/أصبح/صار في معنى الجملة، نحدد طبيعته قبل الإعراب النهائي.",
            "text": "ما نوع الكلمة المحددة؟",
            "hint": "الاسم المعرب يتغير آخره بحسب الموقع، والاسم المبني يلزم صورة واحدة مثل الضمائر وأسماء الإشارة والموصولات. وانتبه: المصدر المؤول تركيب من حرف مصدري وفعل مثل: أن تنجح = نجاحك، وأن تتجاهل الناس = تجاهل الناس.",
            "answers": [
                { "id": "a", "text": "اسم معرب", "next": "kana_ism_number", "eval": { "fact": "nounKind", "equals": "mu3rab" } },
                { "id": "b", "text": "اسم مبني", "next": "kana_ism_built", "eval": { "fact": "nounKind", "equals": "mabni" } },
                { "id": "c", "text": "مصدر مؤول", "next": "R_kana_ism_masdar", "eval": { "fact": "nounKind", "equals": "masdar" }, "hint": "المصدر المؤول تركيب من حرف مصدري وفعل، ويحل محل اسم: أن تتجاهل = تجاهلك." }
            ]
        },
        "kana_ism_built": {
            "id": "kana_ism_built",
            "type": "question",
            "context": "عرفنا أن الاسم مبني، فنحدد نوعه من الكلمة نفسها قبل أن نذكر محله الإعرابي.",
            "text": "ما نوع هذا الاسم المبني؟",
            "hint": "انظر إلى الكلمة في المثال: هل هي ضمير يدل على متكلم أو مخاطب أو غائب؟ هل هي اسم إشارة؟ هل هي اسم موصول يحتاج صلة بعده؟",
            "answers": [
                { "id": "a", "text": "ضمير", "next": "R_kana_ism_damir", "eval": { "fact": "mabniType", "equals": "damir" }, "hint": "الضمير يدل على متكلم أو مخاطب أو غائب. إذا سبق الفعل الناسخ اسم ظاهر وعاد عليه ضمير متصل أو مستتر، نبدأ بصاحب المعنى ثم نحدد الضمير الذي شغل موقع اسم الناسخ في الإعراب." },
                { "id": "b", "text": "اسم إشارة", "next": "R_kana_ism_ishara", "eval": { "fact": "mabniType", "equals": "ishara" }, "hint": "اسم الإشارة يدل على شيء نشير إليه، مثل: هذا، هذه، هؤلاء، ذلك، تلك." },
                { "id": "c", "text": "اسم موصول", "next": "R_kana_ism_mawsool", "eval": { "fact": "mabniType", "equals": "mawsool" }, "hint": "الاسم الموصول مثل: الذي، التي، الذين، ويحتاج جملة بعده تسمى صلة الموصول." }
            ]
        },
        "kana_ism_number": {
            "id": "kana_ism_number",
            "type": "question",
            "context": "عرفنا أن الاسم معرب، فنفحص صورته قبل العلامة.",
            "text": "ما صورة الاسم المحدد؟",
            "hint": "\u0627\u0641\u062D\u0635 \u0635\u0648\u0631\u0629 \u0627\u0644\u0627\u0633\u0645 \u0641\u064A \u0623\u0645\u062B\u0644\u0629 \u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u0627\u0631: \u0647\u0644 \u0647\u0648 \u0645\u0641\u0631\u062F \u0623\u0648 \u062C\u0645\u0639 \u062A\u0643\u0633\u064A\u0631\u060C \u0623\u0645 \u062C\u0645\u0639 \u0645\u0630\u0643\u0631 \u0633\u0627\u0644\u0645\u060C \u0623\u0645 \u0645\u0646 \u0627\u0644\u0623\u0633\u0645\u0627\u0621 \u0627\u0644\u062E\u0645\u0633\u0629\u061F",
            "answers": [
                { "id": "a", "text": "مفرد", "next": "kana_ism_ending", "eval": { "fact": "number", "equals": "singular" }, "hint": "المفرد يدل على واحد لا على مثنى ولا جمع. افحص الكلمة المطلوبة نفسها: هل تدل على واحد، أم على اثنين، أم على جمع؟" },
                { "id": "c", "text": "جمع مذكر سالم", "next": "R_kana_ism_jms", "eval": { "fact": "number", "equals": "jms" }, "hint": "جمع المذكر السالم يدل على أكثر من اثنين من الذكور وينتهي غالبًا بـ(ون) أو (ين)، مثل: المعلمون، المخلصين." },
                { "id": "e", "text": "جمع تكسير", "next": "kana_ism_ending", "eval": { "fact": "number", "equals": "jt" }, "hint": "جمع التكسير تتغير فيه صورة المفرد، مثل: رجل ← رجال، كتاب ← كتب." },
                { "id": "f", "text": "من الأسماء الخمسة", "next": "R_kana_ism_five", "eval": { "fact": "number", "equals": "five" }, "hint": "الأسماء الخمسة مثل: أبو، أخو، حمو، فو، ذو، وتعرب بالحروف بشروطها." }
            ]
        },
        "kana_ism_ending": {
            "id": "kana_ism_ending",
            "type": "question",
            "context": "بعد تحديد صورة الاسم ننظر إلى الحرف الأصلي الأخير، لا إلى التنوين أو الضمائر المتصلة.",
            "text": "ما حالة آخر الاسم المحدد بعد فصل الضمائر؟",
            "hint": "قبل الحكم على آخر الكلمة اسأل: هل الحرف الأخير من أصل الاسم أم ضمير متصل؟ مثل: طموحي = طموح + ياء المتكلم؛ فالاسم صحيح الآخر والياء ضمير.",
            "answers": [
                { "id": "a", "text": "صحيح الآخر", "next": "R_kana_ism_visible", "eval": { "fact": "ending", "equals": "sahih" } },
                { "id": "b", "text": "متصل بياء المتكلم", "next": "R_kana_ism_attached_ya", "eval": { "fact": "ending", "equals": "attached_ya" }, "hint": "مثل: طموحي = طموح + ياء المتكلم. كلمة (طموح) صحيحة الآخر، والياء ضمير متصل في محل جر مضاف إليه، وليست حرف علة من أصل الكلمة." },
                { "id": "c", "text": "معتل الآخر", "next": "R_kana_ism_estimated", "eval": { "fact": "ending", "equals": "moatal" } }
            ]
        },
        "kana_khabar_entry": {
            "id": "kana_khabar_entry",
            "type": "question",
            "context": "عرفنا من العلاقة أن المحدد أتم المعنى بعد اسم الفعل الناسخ. الآن نحدد صورته من المثال نفسه قبل أن نذكر أثر الناسخ.",
            "text": "ما صورة خبر الفعل الناسخ؟",
            "hint": "بعد أن عرفنا أنه أتم معنى الجملة نحدد صورته: خبر مفرد، جملة اسمية، جملة فعلية، أو شبه جملة من جار ومجرور أو ظرف. والخبر المفرد قد يأتي معه نعت أو مضاف إليه أو تابع ما دام ليس جملة ولا شبه جملة.",
            "answers": [
                { "id": "a", "text": "خبر مفرد", "next": "kana_khabar_single_start", "eval": { "fact": "khabarKind", "equals": "single" }, "hint": "الخبر المفرد هو ما ليس جملة ولا شبه جملة، وقد يكون كلمة أو تركيبًا يؤول باسم." },
                { "id": "b", "text": "جملة فعلية", "next": "R_kana_khabar_verbal_sentence", "eval": { "fact": "sentenceType", "equals": "verbal" }, "hint": "تبدأ الجملة الفعلية بفعل، ويكون معها فاعل ظاهر أو مستتر." },
                { "id": "c", "text": "جملة اسمية", "next": "R_kana_khabar_nominal_sentence", "eval": { "fact": "sentenceType", "equals": "nominal" }, "hint": "تبدأ الجملة الاسمية باسم، مثل: أخلاقه حسنة." },
                { "id": "d", "text": "شبه جملة", "next": "kana_khabar_shibh_type", "eval": { "fact": "khabarKind", "equals": "shibh" }, "hint": "شبه الجملة يكون جارًا ومجرورًا أو ظرفًا." }
            ]
        },
        "kana_khabar_nominal_starter": {
            "id": "kana_khabar_nominal_starter",
            "type": "question",
            "context": "بعد أن عرفنا أن الخبر تركيب من أكثر من كلمة، نلاحظ بدايته دون إعادة سؤال العلاقة.",
            "text": "هل يبدأ تركيب الخبر باسم أم بفعل؟",
            "hint": "انظر إلى أول كلمة في التركيب المحدد نفسه؛ إذا بدأ باسم فهو جملة اسمية، وإذا بدأ بفعل فهو جملة فعلية.",
            "answers": [
                { "id": "a", "text": "يبدأ باسم", "next": "R_kana_khabar_nominal_sentence", "correct": true },
                { "id": "b", "text": "يبدأ بفعل", "next": "kana_khabar_nominal_starter", "correct": false, "hint": "راجع أول كلمة في التركيب المحدد: هل هي اسم أم فعل؟" }
            ]
        },
        "kana_khabar_shibh_type": {
            "id": "kana_khabar_shibh_type",
            "type": "question",
            "context": "عرفنا أن المحدد أتم المعنى بتركيب ليس اسمًا مفردًا ولا فعلًا؛ إنه شبه جملة.",
            "text": "ما نوع شبه الجملة المحددة؟",
            "hint": "إذا بدأ التركيب بحرف جر مثل: في، من، على؛ فهو جار ومجرور. وإذا كان ظرف مكان أو زمان مثل: عند، فوق، أمام؛ فهو شبه جملة ظرفية.",
            "answers": [
                { "id": "a", "text": "جار ومجرور", "next": "kana_khabar_shibh_position_jar", "eval": { "fact": "shibhType", "equals": "jar" } },
                { "id": "b", "text": "ظرف", "next": "kana_khabar_shibh_position_zarf", "eval": { "fact": "shibhType", "equals": "zarf" } }
            ]
        },
        "kana_khabar_single_start": {
            "id": "kana_khabar_single_start",
            "type": "question",
            "context": "بما أن المحدد أتم المعنى بعد اسم الفعل الناسخ، وكان اسمًا أو تركيبًا يؤول باسم، نحدد طبيعته قبل العلامة أو المحل.",
            "text": "\u0647\u0644 \u0647\u0648 \u0627\u0633\u0645 \u0645\u0639\u0631\u0628 \u0623\u0645 \u0645\u0635\u062F\u0631 \u0645\u0624\u0648\u0644\u061F",
            "hint": "\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0645\u0639\u0631\u0628 \u062A\u062A\u063A\u064A\u0631 \u0639\u0644\u0627\u0645\u062A\u0647 \u0628\u062D\u0633\u0628 \u0635\u0648\u0631\u062A\u0647\u060C \u0648\u0627\u0644\u0645\u0635\u062F\u0631 \u0627\u0644\u0645\u0624\u0648\u0644 \u062A\u0631\u0643\u064A\u0628 \u0645\u0646 \u062D\u0631\u0641 \u0645\u0635\u062F\u0631\u064A \u0648\u0641\u0639\u0644 \u0648\u064A\u062D\u0644 \u0645\u062D\u0644 \u0627\u0633\u0645\u060C \u0645\u062B\u0644: \u0623\u0646 \u0623\u062A\u0645\u064A\u0632 = \u062A\u0645\u064A\u0632\u064A.",
            "answers": [
                { "id": "a", "text": "اسم معرب", "next": "kana_khabar_single_number", "eval": { "fact": "nounKind", "equals": "mu3rab" } },
                { "id": "c", "text": "مصدر مؤول", "next": "R_kana_khabar_single_masdar", "eval": { "fact": "nounKind", "equals": "masdar" }, "hint": "صحيح أن فيه فعلًا مضارعًا، لكن هذا الفعل سبق بحرف مصدري هو (أن)، فيؤولان بمصدر: أن أتميز = تميزي. لذلك لا نعربه جملة فعلية مستقلة هنا، بل مصدرًا مؤولًا في محل نصب خبر الفعل الناسخ." }
            ]
        },
        "kana_khabar_single_number": {
            "id": "kana_khabar_single_number",
            "type": "question",
            "context": "عرفنا أنه اسم معرب أتم المعنى بعد اسم الفعل الناسخ، فنحدد صورته قبل اختيار علامة النصب.",
            "text": "ما صورة الاسم المحدد؟",
            "hint": "\u062D\u062F\u0651\u062F \u0627\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u0645\u062F\u0639\u0648\u0645\u0629 \u0641\u064A \u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u0627\u0631: \u0645\u0641\u0631\u062F\u060C \u0645\u062B\u0646\u0649\u060C \u062C\u0645\u0639 \u0645\u0630\u0643\u0631 \u0633\u0627\u0644\u0645\u060C \u062C\u0645\u0639 \u0645\u0624\u0646\u062B \u0633\u0627\u0644\u0645\u060C \u0623\u0648 \u062C\u0645\u0639 \u062A\u0643\u0633\u064A\u0631.",
            "answers": [
                { "id": "a", "text": "مفرد", "next": "R_kana_khabar_single_visible", "eval": { "fact": "number", "equals": "singular" }, "hint": "المفرد هنا كلمة واحدة من حيث الصورة، مثل: نشيطًا، بخارًا، معتدلًا." },
                { "id": "b", "text": "مثنى", "next": "R_kana_khabar_single_dual", "eval": { "fact": "number", "equals": "dual" }, "hint": "المثنى يدل على اثنين أو اثنتين، مثل: حاضرين في (كان الطالبان حاضرين)." },
                { "id": "c", "text": "جمع مذكر سالم", "next": "R_kana_khabar_single_jms", "eval": { "fact": "number", "equals": "jms" }, "hint": "جمع المذكر السالم يدل على أكثر من اثنين من الذكور وينتهي غالبًا بـ(ون) أو (ين)، مثل: مخلصين." },
                { "id": "d", "text": "جمع مؤنث سالم", "next": "R_kana_khabar_single_jfs", "eval": { "fact": "number", "equals": "jfs" }, "hint": "جمع المؤنث السالم ينتهي بألف وتاء، مثل: مجتهدات." },
                { "id": "e", "text": "جمع تكسير", "next": "R_kana_khabar_single_visible", "eval": { "fact": "number", "equals": "jt" }, "hint": "جمع التكسير تتغير فيه صورة المفرد، مثل: رجل ← رجال." }
            ]
        },
        "kana_connected_pronoun_i3rab": {
            "id": "kana_connected_pronoun_i3rab",
            "type": "question",
            "context": "عرفنا صاحب المعنى. الآن نحدد الكلمة التي شغلت موقع اسم الفعل الناسخ في الإعراب.",
            "text": "ما الذي شغل موقع اسم الفعل الناسخ؟",
            "hint": "اسأل: من صاحب معنى الفعل الناسخ؟ ثم حدد أين دل عليه داخل الفعل: أفي اسم ظاهر بعده أم في ضمير متصل؟",
            "answers": [
                { "id": "a", "text": "الضمير المتصل بالفعل الناسخ", "next": "R_kana_ism_damir", "correct": true },
                { "id": "b", "text": "الاسم الظاهر قبله", "next": "kana_connected_pronoun_i3rab", "correct": false, "hint": "صحيح أن المعنى يعود إلى الاسم الظاهر، لكنه تقدم على الفعل الناسخ؛ لذلك يكون اسم الناسخ هو الضمير المتصل بالفعل." }
            ]
        },
        "kana_damir_name": {
            "id": "kana_damir_name",
            "type": "question",
            "context": "عرفنا أن التاء تدل على المتكلم. الآن نسمي ما يدل على متكلم أو مخاطب أو غائب.",
            "text": "ما نوع الاسم الدال على متكلم أو مخاطب أو غائب؟",
            "hint": "عرفنا أن التاء تدل على متكلم. الآن صنّف الاسم الذي يدل على متكلم أو مخاطب أو غائب: ما اسمه النحوي؟",
            "answers": [
                { "id": "a", "text": "ضمير", "next": "kana_damir_connected", "correct": true },
                { "id": "b", "text": "اسم إشارة", "next": "kana_damir_name", "correct": false, "hint": "اسم الإشارة يدل على مشار إليه مثل: هذا. أما التاء في (كنتُ) فتدل على المتكلم." },
                { "id": "c", "text": "علامة لا محل لها", "next": "kana_damir_name", "correct": false, "hint": "لو كانت تاء تأنيث ساكنة لكانت علامة، لكن التاء في (كنتُ) تدل على المتكلم." }
            ]
        },
        "kana_damir_connected": {
            "id": "kana_damir_connected",
            "type": "question",
            "context": "عرفنا أنها ضمير. الآن ننظر: هل اتصلت بما قبلها أم انفصلت عنه؟",
            "text": "هل التاء متصلة بالفعل الناسخ أم منفصلة؟",
            "hint": "في (كنتُ) التاء ملتصقة بالفعل، لذلك هي ضمير متصل.",
            "answers": [
                { "id": "a", "text": "اتصلت بالفعل الناسخ", "next": "kana_damir_site", "correct": true },
                { "id": "b", "text": "جاءت منفصلة", "next": "kana_damir_connected", "correct": false, "hint": "الضمير المنفصل يكون مثل: أنا، أنت، هو. أما التاء في (كنتُ) فهي متصلة بالفعل." }
            ]
        },
        "kana_damir_site": {
            "id": "kana_damir_site",
            "type": "question",
            "context": "عرفنا أنها ضمير متصل. الآن نحدد موقعها في باب كان.",
            "text": "ما موقع الضمير بعد الفعل الناسخ؟",
            "hint": "اسأل: من الذي كان مطمئنًا؟ التاء تدل على المتكلم، فهي التي كان هو صاحب المعنى في الجملة.",
            "answers": [
                { "id": "a", "text": "اسم الفعل الناسخ", "next": "R_kana_ism_damir", "correct": true },
                { "id": "b", "text": "خبر الفعل الناسخ", "next": "kana_damir_site", "correct": false, "hint": "الخبر هو (مطمئنًا)، أما التاء فهي صاحب معنى كان." }
            ]
        },
        "kana_masdar_name": {
            "id": "kana_masdar_name",
            "type": "question",
            "context": "عرفنا أن التركيب بدأ بحرف مصدري وفعل، ويمكن تأويله باسم: أن أتميز = تميزي.",
            "text": "ماذا يسمى تركيب الحرف المصدري مع الفعل؟",
            "hint": "المصدر المؤول تركيب من حرف مصدري وفعل ويؤول باسم.",
            "answers": [
                { "id": "a", "text": "مصدر مؤول", "next": "kana_masdar_site", "correct": true },
                { "id": "b", "text": "اسم ظاهر معرب", "next": "kana_masdar_name", "correct": false, "hint": "ليس كلمة واحدة ظاهرة، بل تركيب: أن + فعل." },
                { "id": "c", "text": "اسم مبني", "next": "kana_masdar_name", "correct": false, "hint": "ليس اسمًا مبنيًا مثل هذا أو الذي؛ إنه تركيب يؤول باسم." }
            ]
        },
        "kana_masdar_site": {
            "id": "kana_masdar_site",
            "type": "question",
            "context": "عرفنا أنه مصدر مؤول. الآن نحدد موقعه بعد أن أتم المعنى عن اسم الناسخ.",
            "text": "ما موقع المصدر المؤول في الجملة؟",
            "hint": "في (أصبح طموحي أن أتميز)، المصدر المؤول أتم المعنى عن طموحي.",
            "answers": [
                { "id": "a", "text": "خبر الفعل الناسخ", "next": "R_kana_khabar_single_masdar", "correct": true },
                { "id": "b", "text": "اسم الفعل الناسخ", "next": "kana_masdar_site", "correct": false, "hint": "اسم أصبح هو (طموحي)، أما (أن أتميز) فقد أتمت المعنى عنه." }
            ]
        },
        "R_kana_ism_attached_ya": { "id": "R_kana_ism_attached_ya", "type": "result", "coverage": "kana_ism.attached_ya", "text": "طموحي:\nاسم الفعل الناسخ مرفوع بضمة مقدرة على ما قبل ياء المتكلم، منع من ظهورها اشتغال المحل بالحركة المناسبة.\n\nوالياء:\nضمير متصل في محل جر مضاف إليه." },
        "R_kana_ism_hidden_damir": { "id": "R_kana_ism_hidden_damir", "type": "result", "coverage": "kana_ism.hidden_damir", "text": "اسم الفعل الناسخ ضمير مستتر يعود على الاسم السابق في الجملة. مثال: المزارعُ ما زالَ يعملُ؛ اسم (ما زال) ضمير مستتر تقديره هو يعود على (المزارع)." },
        "R_kana_ism_visible": { "id": "R_kana_ism_visible", "type": "result", "coverage": "kana_ism.visible", "text": "اسم الفعل الناسخ مرفوع وعلامة رفعه الضمة الظاهرة على آخره." },
        "R_kana_ism_estimated": { "id": "R_kana_ism_estimated", "type": "result", "coverage": "kana_ism.estimated", "text": "اسم الفعل الناسخ مرفوع وعلامة رفعه الضمة المقدرة على الألف في آخره، منع من ظهورها التعذر." },
        "R_kana_ism_jms": { "id": "R_kana_ism_jms", "type": "result", "coverage": "kana_ism.jms", "text": "اسم الفعل الناسخ مرفوع، وهو جمع مذكر سالم، وعلامة رفعه الواو." },
        "R_kana_ism_five": { "id": "R_kana_ism_five", "type": "result", "coverage": "kana_ism.five", "text": "اسم الفعل الناسخ مرفوع وعلامة رفعه الواو لأنه من الأسماء الخمسة. وقد تحققت شروط الإعراب بالحروف: مفرد، مضاف، غير مضاف إلى ياء المتكلم." },
        "R_kana_ism_damir": { "id": "R_kana_ism_damir", "type": "result", "coverage": "kana_ism.damir", "text": "ضمير متصل مبني في محل رفع اسم الفعل الناسخ. وإذا سبق الفعل الناسخ اسم ظاهر يعود عليه الضمير، فالمعنى يعود إلى الاسم الظاهر، أما الموقع الإعرابي فيشغله الضمير المتصل." },
        "R_kana_ism_ishara": { "id": "R_kana_ism_ishara", "type": "result", "coverage": "kana_ism.ishara", "text": "اسم إشارة مبني في محل رفع اسم الفعل الناسخ." },
        "R_kana_ism_mawsool": { "id": "R_kana_ism_mawsool", "type": "result", "coverage": "kana_ism.mawsool", "text": "اسم موصول مبني في محل رفع اسم الفعل الناسخ." },
        "R_kana_ism_masdar": { "id": "R_kana_ism_masdar", "type": "result", "coverage": "kana_ism.masdar", "text": "مصدر مؤول في محل رفع اسم الفعل الناسخ؛ لأنه تركيب من حرف مصدري وفعل مضارع ويؤول باسم، مثل: أن تتجاهل الناس = تجاهلُ الناس." },
        "R_kana_khabar_single_visible": { "id": "R_kana_khabar_single_visible", "type": "result", "coverage": "kana_khabar_single.visible", "text": "خبر الفعل الناسخ منصوب وعلامة نصبه الفتحة الظاهرة على آخره." },
        "R_kana_khabar_single_dual": { "id": "R_kana_khabar_single_dual", "type": "result", "coverage": "kana_khabar_single.dual", "text": "خبر الفعل الناسخ منصوب، وهو مثنى، وعلامة نصبه الياء." },
        "R_kana_khabar_single_jms": { "id": "R_kana_khabar_single_jms", "type": "result", "coverage": "kana_khabar_single.jms", "text": "خبر الفعل الناسخ منصوب، وهو جمع مذكر سالم، وعلامة نصبه الياء." },
        "R_kana_khabar_single_jfs": { "id": "R_kana_khabar_single_jfs", "type": "result", "coverage": "kana_khabar_single.jfs", "text": "خبر الفعل الناسخ منصوب وعلامة نصبه الكسرة نيابة عن الفتحة لأنه جمع مؤنث سالم." },
        "R_kana_khabar_single_masdar": { "id": "R_kana_khabar_single_masdar", "type": "result", "coverage": "kana_khabar_single.masdar", "text": "مصدر مؤول في محل نصب خبر الفعل الناسخ؛ لأنه تركيب من حرف مصدري وفعل، ويؤول باسم، مثل: أن أتميز = تميزي." },
        "R_kana_khabar_verbal_sentence": { "id": "R_kana_khabar_verbal_sentence", "type": "result", "coverage": "kana_khabar.verbal_sentence", "text": "فعل مضارع، وفاعله ضمير مستتر يفهم من السياق، والجملة الفعلية في محل نصب خبر الفعل الناسخ." },
        "R_kana_khabar_nominal_sentence": { "id": "R_kana_khabar_nominal_sentence", "type": "result", "coverage": "kana_khabar.nominal_sentence", "text": "تفصيل الجملة الاسمية: المبتدأ الثاني وخبره يُعربان أولًا، ثم تُعرب الجملة الاسمية كلها في محل نصب خبر الفعل الناسخ." },
        "R_kana_khabar_jar": { "id": "R_kana_khabar_jar", "type": "result", "coverage": "kana_khabar.jar", "text": "شبه جملة من الجار والمجرور في محل نصب خبر الفعل الناسخ." },
        "R_kana_khabar_zarf": { "id": "R_kana_khabar_zarf", "type": "result", "coverage": "kana_khabar.zarf", "text": "شبه جملة ظرفية في محل نصب خبر الفعل الناسخ." },
        "kana_khabar_shibh_position_jar": {
            "id": "kana_khabar_shibh_position_jar",
            "type": "question",
            "context": "بعد أن عرفنا أن الخبر شبه جملة من جار ومجرور، ننظر هل تقدم على اسم نكرة.",
            "text": "هل جاء بعد هذا الجار والمجرور اسم نكرة مثل: كان في البيت رجل؟",
            "hint": "إذا تقدم شبه الجملة بعد الفعل الناسخ وجاءت بعدها نكرة، فشبه الجملة خبر مقدم، والاسم النكرة يكون اسم كان مؤخرًا.",
            "answers": [
                { "id": "a", "text": "نعم، تقدم على اسم نكرة", "next": "R_kana_khabar_jar_advanced", "eval": { "fact": "shibhPosition", "equals": "advanced" } },
                { "id": "b", "text": "لا، جاء بعد اسم الناسخ", "next": "R_kana_khabar_jar", "eval": { "fact": "shibhPosition", "notEquals": "advanced" }, "hint": "لو جاء بعد اسم الناسخ لوجدنا اسمًا ظاهرًا قبل شبه الجملة. أما هنا فقد بدأ بعد الناسخ بشبه الجملة، ثم جاءت النكرة بعدها." }
            ]
        },
        "kana_khabar_shibh_position_zarf": {
            "id": "kana_khabar_shibh_position_zarf",
            "type": "question",
            "context": "بعد أن عرفنا أن الخبر شبه جملة ظرفية، ننظر هل تقدم على اسم نكرة.",
            "text": "هل جاء بعد هذا الظرف اسم نكرة مثل: ما زال عندنا ضيف؟",
            "hint": "إذا تقدم الظرف بعد الفعل الناسخ وجاءت بعده نكرة، فالظرف خبر مقدم، والاسم النكرة يكون اسم الفعل الناسخ مؤخرًا.",
            "answers": [
                { "id": "a", "text": "نعم، تقدم على اسم نكرة", "next": "R_kana_khabar_zarf_advanced", "eval": { "fact": "shibhPosition", "equals": "advanced" } },
                { "id": "b", "text": "لا، جاء بعد اسم الناسخ", "next": "R_kana_khabar_zarf", "eval": { "fact": "shibhPosition", "notEquals": "advanced" }, "hint": "لو جاء بعد اسم الناسخ لوجدنا اسمًا ظاهرًا قبل الظرف. أما هنا فقد تقدم الظرف وجاءت النكرة بعده." }
            ]
        },
        "R_kana_khabar_jar_advanced": { "id": "R_kana_khabar_jar_advanced", "type": "result", "coverage": "kana_khabar.jar_advanced", "text": "في البيت: شبه جملة من الجار والمجرور في محل نصب خبر كان مقدم. رجلٌ: اسم كان مؤخر مرفوع." },
        "R_kana_khabar_zarf_advanced": { "id": "R_kana_khabar_zarf_advanced", "type": "result", "coverage": "kana_khabar.zarf_advanced", "text": "عندنا: شبه جملة ظرفية في محل نصب خبر ما زال مقدم. ضيفٌ: اسم ما زال مؤخر مرفوع." }
    }
};
// PEDAGOGY NOTE: relation -> function -> factor -> final parsing.

