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
            "context": "نبحث عن موقع الضمير.",
            "text": "هل حلّ محل اسم مرفوع أم منصوب أم مجرور؟",
            "hint": "ضع اسمًا ظاهرًا مكان الضمير، ثم ميز: هل جاء بعد حرف جر، أم صار مضافًا إليه، أم شغل موقعًا مرفوعًا أو منصوبًا؟",
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
            "context": "عرفنا أن محل الضمير رفع.",
            "text": "ما شكل الضمير؟",
            "hint": "الضمير المتصل لا يستقل بنفسه مثل التاء في كتبتُ، والضمير المنفصل كلمة مستقلة مثل أنا وهو.",
            "answers": [
                {
                    "id": "a",
                    "text": "ضمير رفع متصل",
                    "next": "R_pronoun_raf3_attached",
                    "eval": {
                        "fact": "form",
                        "equals": "attached"
                    }
                },
                {
                    "id": "b",
                    "text": "ضمير رفع منفصل",
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
            "context": "عرفنا أن محل الضمير نصب.",
            "text": "ما شكل الضمير؟",
            "hint": "إياك ضمير منفصل في محل نصب، والكاف أو الهاء إذا اتصلتا بالفعل فهما ضميران متصلان في محل نصب.",
            "answers": [
                {
                    "id": "a",
                    "text": "ضمير نصب متصل",
                    "next": "R_pronoun_nasb_attached",
                    "eval": {
                        "fact": "form",
                        "equals": "attached"
                    }
                },
                {
                    "id": "b",
                    "text": "ضمير نصب منفصل",
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
            "text": "ضمير متصل مبني في محل رفع فاعل."
        },
        "R_pronoun_raf3_separate": {
            "id": "R_pronoun_raf3_separate",
            "type": "result",
            "coverage": "pronoun.raf3.separate",
            "text": "ضمير منفصل مبني في محل رفع مبتدأ."
        },
        "R_pronoun_nasb_attached": {
            "id": "R_pronoun_nasb_attached",
            "type": "result",
            "coverage": "pronoun.nasb.attached",
            "text": "ضمير متصل مبني في محل نصب مفعول به."
        },
        "R_pronoun_nasb_separate": {
            "id": "R_pronoun_nasb_separate",
            "type": "result",
            "coverage": "pronoun.nasb.separate",
            "text": "ضمير منفصل مبني في محل نصب مفعول به مقدم."
        },
        "R_pronoun_jar": {
            "id": "R_pronoun_jar",
            "type": "result",
            "coverage": "pronoun.jar",
            "text": "ضمير متصل مبني في محل جر مضاف إليه."
        }
    }
};

