import type { ExerciseTree } from "../../lib/exercise/model";

export const attachedPronounsTree: ExerciseTree = {
  startNodeId: "pronoun_relation",
  practiceStartNodeId: "pronoun_role",
  nodes: {
    pronoun_relation: {
      id: "pronoun_relation", type: "question",
      context: "نبدأ من علاقة الضمير بما حوله؛ فالكلمة التي يتصل بها تساعدنا على معرفة وظيفته.",
      text: "ما علاقة الضمير المحدد بما حوله في الجملة؟",
      hint: "انظر إلى الكلمة الملاصقة للضمير: قد يكون متصلًا بفعل أو اسم أو حرف جر، وقد يأتي كلمة مستقلة.",
      answers: [
        { id: "a", text: "متصل بفعل", next: "pronoun_role", eval: { fact: "attachment", equals: "verb" } },
        { id: "b", text: "متصل باسم", next: "pronoun_role", eval: { fact: "attachment", equals: "noun" } },
        { id: "c", text: "متصل بحرف جر", next: "pronoun_role", eval: { fact: "attachment", equals: "preposition" } },
        { id: "d", text: "منفصل؛ جاء كلمة مستقلة", next: "pronoun_role", eval: { fact: "attachment", equals: "independent" } },
      ],
    },
    pronoun_role: {
      id: "pronoun_role", type: "question",
      context: "بعد تحديد علاقة الضمير بما حوله، نحدد الوظيفة التي شغلها في الجملة.",
      text: "ما وظيفة الضمير المحدد في هذه الجملة؟",
      hint: "إذا اتصل الضمير باسم فهو في محل جر مضاف إليه. وإذا اتصل بفعل فقد يدل على من قام بالفعل فيكون فاعلًا، أو على من وقع عليه الفعل فيكون مفعولًا به. وإذا اتصل بحرف جر فهو في محل جر به. أمّا ضمائر «إيّا» المنفصلة إذا سبقت الفعل فتكون مفعولًا به مقدَّمًا، وضمائر الرفع المنفصلة مثل «أنا» و«هو» قد تكون مبتدأ.",
      answers: [
        { id: "a", text: "فاعل", next: "pronoun_position", eval: { fact: "role", equals: "fael" } },
        { id: "b", text: "مبتدأ", next: "pronoun_position", eval: { fact: "role", equals: "mubtada" } },
        { id: "c", text: "مفعول به", next: "pronoun_position", eval: { fact: "role", equals: "mafool" } },
        { id: "d", text: "مفعول به مقدَّم", next: "pronoun_position", eval: { fact: "role", equals: "mafool_muqaddam" } },
        { id: "e", text: "مضاف إليه", next: "pronoun_position", eval: { fact: "role", equals: "mudaf_ileyh" } },
        { id: "f", text: "في محل جر بحرف الجر", next: "pronoun_position", eval: { fact: "role", equals: "majrur_bi_harf" } },
      ],
    },
    pronoun_position: {
      id: "pronoun_position", type: "question",
      context: "حددنا وظيفة الضمير، ومنها نستنتج محلَّه الإعرابي.",
      text: "ما المحل الإعرابي الذي تفرضه هذه الوظيفة؟",
      hint: "الفاعل والمبتدأ في محل رفع، والمفعول به في محل نصب، والمضاف إليه وما اتصل بحرف الجر في محل جر.",
      answers: [
        { id: "a", text: "محل رفع", next: "pronoun_form_raf3", eval: { fact: "position", equals: "raf3" } },
        { id: "b", text: "محل نصب", next: "pronoun_form_nasb", eval: { fact: "position", equals: "nasb" } },
        { id: "c", text: "محل جر", next: "pronoun_form_jar", eval: { fact: "position", equals: "jar" } },
      ],
    },
    pronoun_form_raf3: {
      id: "pronoun_form_raf3", type: "question", context: "ثبت أن الضمير في محل رفع، وبقي أن نحدد صورته.",
      text: "هل الضمير متصل بكلمة قبله أم منفصل عنها؟",
      hint: "الضمير المتصل لا يستقل بنفسه، مثل التاء في «كتبتُ». والضمير المنفصل كلمة مستقلة، مثل «أنا» و«هو».",
      answers: [
        { id: "a", text: "متصل بكلمة قبله", next: "R_pronoun_raf3_attached", eval: { fact: "form", equals: "attached" } },
        { id: "b", text: "منفصل؛ جاء كلمة مستقلة", next: "R_pronoun_raf3_separate", eval: { fact: "form", equals: "separate" } },
      ],
    },
    pronoun_form_nasb: {
      id: "pronoun_form_nasb", type: "question", context: "ثبت أن الضمير في محل نصب، وبقي أن نحدد صورته.",
      text: "هل الضمير متصل بكلمة قبله أم منفصل عنها؟",
      hint: "المتصل جزء من كلمة، مثل الكاف في «أكرمَكَ». والمنفصل يُكتب كلمة مستقلة، مثل «إيّاكَ».",
      answers: [
        { id: "a", text: "متصل بكلمة قبله", next: "R_pronoun_nasb_attached", eval: { fact: "form", equals: "attached" } },
        { id: "b", text: "منفصل؛ جاء كلمة مستقلة", next: "R_pronoun_nasb_separate", eval: { fact: "form", equals: "separate" } },
      ],
    },
    pronoun_form_jar: {
      id: "pronoun_form_jar", type: "question", context: "ثبت أن الضمير في محل جر، وبقي أن نحدد صورته.",
      text: "هل الضمير متصل بكلمة قبله أم منفصل عنها؟",
      hint: "في أمثلة الجر هنا يتصل الضمير باسم، مثل الهاء في «كتابُه»، أو بحرف جر، مثل الهاء في «عليهِ».",
      answers: [
        { id: "a", text: "متصل بكلمة قبله", next: "R_pronoun_jar", eval: { fact: "form", equals: "attached" } },
        { id: "b", text: "منفصل؛ جاء كلمة مستقلة", next: "pronoun_form_jar", correct: false, hint: "الضمير المحدد جزء من الكلمة التي قبله ولا يستقل عنها." },
      ],
    },
    R_pronoun_raf3_attached: { id: "R_pronoun_raf3_attached", type: "result", coverage: "pronoun.raf3.attached", text: "ضمير متصل مبني في محل رفع." },
    R_pronoun_raf3_separate: { id: "R_pronoun_raf3_separate", type: "result", coverage: "pronoun.raf3.separate", text: "ضمير منفصل مبني في محل رفع." },
    R_pronoun_nasb_attached: { id: "R_pronoun_nasb_attached", type: "result", coverage: "pronoun.nasb.attached", text: "ضمير متصل مبني في محل نصب." },
    R_pronoun_nasb_separate: { id: "R_pronoun_nasb_separate", type: "result", coverage: "pronoun.nasb.separate", text: "ضمير منفصل مبني في محل نصب." },
    R_pronoun_jar: { id: "R_pronoun_jar", type: "result", coverage: "pronoun.jar", text: "ضمير متصل مبني في محل جر." },
  },
};
