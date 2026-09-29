import type { ExerciseTree } from "../../lib/exercise/model";

export const attachedPronounsTree: ExerciseTree = {
    "startNodeId": "pronoun_relation_gate",
    "practiceStartNodeId": "pronoun_position",
    "nodes": {
        "pronoun_relation_gate": {
            "id": "pronoun_relation_gate",
            "type": "question",
            "context": "الضمير اسم مبني، لذلك لا نبحث عن حركة آخره أولًا، بل نسأل: ما الموقع الذي شغله في الجملة؟",
            "text": "كيف نبدأ إعراب الضمير المتصل أو المنفصل؟",
            "hint": "ضع اسمًا ظاهرًا مكان الضمير، ثم حدد الموقع الذي شغله الاسم البديل في الجملة.",
            "answers": [
                { "id": "a", "text": "أحدد علاقته وموقعه: رفع أم نصب أم جر", "next": "pronoun_position", "correct": true },
                { "id": "b", "text": "أبحث عن حركة آخره فقط", "next": "pronoun_relation_gate", "correct": false, "hint": "الضمائر مبنية؛ لذلك الأهم هو المحل الإعرابي لا الحركة الظاهرة." },
                { "id": "c", "text": "أعدّه دائمًا فاعلًا", "next": "pronoun_relation_gate", "correct": false, "hint": "الضمير قد يكون في محل رفع أو نصب أو جر بحسب علاقته في الجملة." }
            ]
        },
        "pronoun_position": {
            "id": "pronoun_position",
            "type": "question",
            "context": "الضمير مبني، لكن له محل إعرابي تحدده وظيفته في الجملة.",
            "text": "ما المحل الإعرابي للضمير في هذه الجملة؟",
            "hint": "ضع اسمًا ظاهرًا مكان الضمير، ثم ميّز: هل جاء بعد حرف جر، أم صار مضافًا إليه، أم شغل موقعًا مرفوعًا أو منصوبًا؟ المحل وحده لا يحدد الوظيفة؛ السياق هو الذي يحددها.",
            "answers": [
                {
                    "id": "a",
                    "text": "محل رفع",
                    "next": "pronoun_form_raf3",
                    "eval": {
                        "fact": "position",
                        "equals": "raf3"
                    }
                },
                {
                    "id": "b",
                    "text": "محل نصب",
                    "next": "pronoun_form_nasb",
                    "eval": {
                        "fact": "position",
                        "equals": "nasb"
                    }
                },
                {
                    "id": "c",
                    "text": "محل جر",
                    "next": "R_pronoun_jar",
                    "eval": {
                        "fact": "position",
                        "equals": "jar"
                    }
                }
            ]
        },
        "pronoun_form_raf3": {
            "id": "pronoun_form_raf3",
            "type": "question",
            "context": "ثبت من وظيفته أن الضمير في محل رفع، والآن نحدد صورته.",
            "text": "هل الضمير متصل بكلمة قبله أم منفصل عنها؟",
            "hint": "الضمير المتصل لا يستقل بنفسه مثل التاء في كتبتُ، والضمير المنفصل كلمة مستقلة مثل أنا وهو.",
            "answers": [
                {
                    "id": "a",
                    "text": "متصل بكلمة قبله",
                    "next": "R_pronoun_raf3_attached",
                    "eval": {
                        "fact": "form",
                        "equals": "attached"
                    }
                },
                {
                    "id": "b",
                    "text": "منفصل؛ جاء كلمة مستقلة",
                    "next": "R_pronoun_raf3_separate",
                    "eval": {
                        "fact": "form",
                        "equals": "separate"
                    }
                }
            ]
        },
        "pronoun_form_nasb": {
            "id": "pronoun_form_nasb",
            "type": "question",
            "context": "ثبت من وظيفته أن الضمير في محل نصب، والآن نحدد صورته.",
            "text": "هل الضمير متصل بكلمة قبله أم منفصل عنها؟",
            "hint": "المتصل جزء من كلمة ولا يستقل عنها، مثل الكاف في «أكرمَكَ». والمنفصل يُكتب كلمة مستقلة، مثل «أنا» و«إيّاكَ».",
            "answers": [
                {
                    "id": "a",
                    "text": "متصل بكلمة قبله",
                    "next": "R_pronoun_nasb_attached",
                    "eval": {
                        "fact": "form",
                        "equals": "attached"
                    }
                },
                {
                    "id": "b",
                    "text": "منفصل؛ جاء كلمة مستقلة",
                    "next": "R_pronoun_nasb_separate",
                    "eval": {
                        "fact": "form",
                        "equals": "separate"
                    }
                }
            ]
        },
        "R_pronoun_raf3_attached": {
            "id": "R_pronoun_raf3_attached",
            "type": "result",
            "coverage": "pronoun.raf3.attached",
            "text": "ضمير رفع متصل مبني في محل رفع. في أمثلة هذا المسار هو فاعل، لكن لا نعمم ذلك على كل ضمير متصل؛ فقد يكون نائب فاعل أو اسمًا لناسخ بحسب السياق."
        },
        "R_pronoun_raf3_separate": {
            "id": "R_pronoun_raf3_separate",
            "type": "result",
            "coverage": "pronoun.raf3.separate",
            "text": "ضمير رفع منفصل مبني في محل رفع. في أمثلة هذا المسار هو مبتدأ، وتحدد الوظيفة دائمًا من موقعه في الجملة."
        },
        "R_pronoun_nasb_attached": {
            "id": "R_pronoun_nasb_attached",
            "type": "result",
            "coverage": "pronoun.nasb.attached",
            "text": "ضمير نصب متصل مبني في محل نصب. في أمثلة هذا المسار هو مفعول به، لكن وظيفته الدقيقة تحدد من العامل والسياق."
        },
        "R_pronoun_nasb_separate": {
            "id": "R_pronoun_nasb_separate",
            "type": "result",
            "coverage": "pronoun.nasb.separate",
            "text": "ضمير نصب منفصل مبني في محل نصب. في أمثلة «إيّا» هنا هو مفعول به مقدَّم، وتثبت الوظيفة من السياق."
        },
        "R_pronoun_jar": {
            "id": "R_pronoun_jar",
            "type": "result",
            "coverage": "pronoun.jar",
            "text": "ضمير متصل مبني في محل جر. في «كتابُه» هو مضاف إليه؛ أمّا في «به» فهو في محل جر بحرف الجر. إذن سبب الجر يحدد من الكلمة التي اتصل بها."
        }
    }
};
