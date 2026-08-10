import type { ExerciseTree } from "../../lib/exercise/model";

export const tamyizTree: ExerciseTree = {
  startNodeId: "tamyiz_function",
  nodes: {
    tamyiz_function: {
      id: "tamyiz_function",
      type: "question",
      context: "نبدأ من وظيفة الكلمة: هل جاءت لتزيل إبهامًا لا لتصف هيئة؟",
      text: "هل الكلمة المحددة نكرة جامدة تفسر شيئًا مبهمًا قبلها أو توضح معنى الجملة؟",
      hint: "اسأل: ما الشيء المبهم الذي وضحته الكلمة؟ إذا كانت تفسر مقدارًا أو عددًا أو مساحة، أو تزيل إبهامًا في نسبة الجملة، فهي مرشحة للتمييز. لا تعتمد على تقدير «من» وحده؛ فهو يصلح في بعض الأمثلة لا كلها.",
      answers: [
        { id: "yes", text: "نعم، تزيل إبهامًا وتوضح المقصود", next: "tamyiz_kind", eval: { fact: "isTamyiz", equals: true }, hint: "إذا أزالت الكلمة إبهامًا ولم تكن وصفًا لهيئة صاحبها، ننتقل إلى نوع التمييز." },
        { id: "no", text: "لا، لا تزيل إبهامًا", next: "tamyiz_kind", eval: { fact: "isTamyiz", equals: false }, hint: "التمييز لا يصف هيئة مثل الحال؛ وظيفته أن يفسر مبهمًا في اسم أو في معنى الجملة." },
      ],
    },
    tamyiz_kind: {
      id: "tamyiz_kind",
      type: "question",
      context: "ثبتت وظيفة التمييز، فنحدد مصدر الإبهام.",
      text: "أين كان الإبهام الذي أزالته الكلمة؟",
      hint: "إن كان الإبهام في مقدار أو وزن أو كيل أو مساحة أو عدد فهو تمييز ملفوظ. وإن كان في معنى جملة أو نسبة كاملة فهو تمييز ملحوظ.",
      answers: [
        { id: "malfuz", text: "في اسم مقدار أو عدد قبله — تمييز ملفوظ", next: "tamyiz_mark", eval: { fact: "tamyizKind", equals: "malfuz" }, hint: "المقدار أو العدد يحتاج إلى كلمة تفسر المراد به، وهذا هو التمييز الملفوظ." },
        { id: "malhuz", text: "في معنى الجملة أو النسبة — تمييز ملحوظ", next: "tamyiz_mark", eval: { fact: "tamyizKind", equals: "malhuz" }, hint: "إذا كانت الجملة تحتمل إبهامًا في الشيء الذي ازداد أو امتلأ أو حسن ونحو ذلك، فالتمييز يفسر النسبة كلها." },
      ],
    },
    tamyiz_mark: {
      id: "tamyiz_mark",
      type: "question",
      context: "عرفنا أن الكلمة تمييز منصوب في هذه الأمثلة، وبقيت علامة النصب.",
      text: "ما علامة نصب التمييز المحدد؟",
      hint: "في أمثلة هذا المسار التمييز اسم مفرد نكرة منصوب، فعلامته الفتحة الظاهرة. المهم أن تصل إلى الوظيفة قبل العلامة.",
      answers: [
        { id: "fatha", text: "الفتحة الظاهرة", next: "R_tamyiz", eval: { fact: "nasbMark", equals: "fatha" }, hint: "التمييز المفرد في هذه الأمثلة منصوب بالفتحة الظاهرة." },
        { id: "kasra", text: "الكسرة", next: "R_tamyiz", eval: { fact: "nasbMark", equals: "kasra" }, hint: "لا تختَر الكسرة من شكل الكلمة وحده؛ هذا المثال تمييز مفرد منصوب وعلامته الفتحة." },
        { id: "damma", text: "الضمة", next: "R_tamyiz", eval: { fact: "nasbMark", equals: "damma" }, hint: "التمييز هنا منصوب لا مرفوع، لذلك لا تكون الضمة علامة إعرابه." },
      ],
    },
    R_tamyiz: { id: "R_tamyiz", type: "result", text: "تمييز منصوب وعلامة نصبه الفتحة الظاهرة في هذا المثال." },
  },
};
