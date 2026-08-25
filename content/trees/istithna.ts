import type { ExerciseTree } from "../../lib/exercise/model";

export const istithnaTree: ExerciseTree = {
  startNodeId: "istithna_tool",
  nodes: {
    istithna_tool: {
      id: "istithna_tool",
      type: "question",
      context: "نبدأ بأداة الاستثناء قبل الحكم على الاسم بعدها.",
      text: "هل جاءت الكلمة المحددة بعد «إلا» في أسلوب استثناء؟",
      hint: "ابحث عن «إلا» وحدد المستثنى بعدها. ثم لا تحكم بالنصب مباشرة؛ نوع الاستثناء هو الذي يحدد الحكم.",
      answers: [
        { id: "yes", text: "نعم، جاءت بعد «إلا»", next: "istithna_complete", eval: { fact: "hasIlla", equals: true }, hint: "وجود «إلا» يفتح باب الاستثناء، لكننا نحتاج الآن إلى معرفة هل ذُكر المستثنى منه." },
        { id: "no", text: "لا، ليست بعد «إلا»", next: "istithna_complete", eval: { fact: "hasIlla", equals: false }, hint: "هذا المسار خاص بالاستثناء بـ«إلا». افحص الأداة قبل الكلمة المحددة." },
      ],
    },
    istithna_complete: {
      id: "istithna_complete",
      type: "question",
      context: "عرفنا أداة الاستثناء، والآن نبحث عن المستثنى منه.",
      text: "هل ذُكر المستثنى منه في الجملة؟",
      hint: "اسأل: ما المجموعة التي أخرجت منها الكلمة بعد «إلا»؟ إذا ذُكرت المجموعة فالكلام تام، وإذا لم تذكر فهو استثناء مفرغ.",
      answers: [
        { id: "complete", text: "نعم، المستثنى منه مذكور — استثناء تام", next: "istithna_polarity", eval: { fact: "isComplete", equals: true }, hint: "ما دام المستثنى منه مذكورًا، ننتقل إلى إثبات الجملة أو نفيها." },
        { id: "mufarragh", text: "لا، المستثنى منه غير مذكور — استثناء مفرغ", next: "istithna_mufarragh_role", eval: { fact: "isComplete", equals: false }, hint: "في الاستثناء المفرغ لا نعرب ما بعد «إلا» مستثنى؛ بل نعربه حسب موقعه الذي يطلبه العامل قبل «إلا»." },
      ],
    },
    istithna_polarity: {
      id: "istithna_polarity",
      type: "question",
      context: "ثبت أن الاستثناء تام؛ بقي أن نعرف هل الجملة مثبتة أم منفية.",
      text: "هل الجملة التامة مثبتة أم منفية؟",
      hint: "ابحث عن أداة نفي مثل «ما» أو «لم» أو «لن». التام المثبت له حكم مختلف عن التام المنفي.",
      answers: [
        { id: "affirmative", text: "مثبتة", next: "istithna_shape", eval: { fact: "isAffirmative", equals: true }, hint: "في الاستثناء التام المثبت بـ«إلا» يجب نصب المستثنى." },
        { id: "negative", text: "منفية", next: "istithna_negative_choice", eval: { fact: "isAffirmative", equals: false }, hint: "في التام المنفي يجوز في المستثنى وجهان: النصب على الاستثناء، أو الإتباع للمستثنى منه بحسب حركة المثال." },
      ],
    },
    istithna_negative_choice: {
      id: "istithna_negative_choice",
      type: "question",
      context: "عرفنا أن الاستثناء تام منفي، وفيه وجهان صحيحان من حيث القاعدة؛ نقرأ ضبط المثال لنحدد الوجه المستعمل هنا.",
      text: "كيف جاءت الكلمة المحددة في هذا المثال؟",
      hint: "إذا جاءت منصوبة فهي مستثنى منصوب. وإذا وافقت المستثنى منه في إعرابه فهي تابع له، وغالبًا يعرب بدلًا في هذا المستوى.",
      answers: [
        { id: "nasb", text: "منصوبة على الاستثناء", next: "istithna_shape", eval: { fact: "exceptRole", equals: "allowed_nasb" }, hint: "في التام المنفي يجوز النصب على الاستثناء، وهذا هو الوجه المستعمل في هذا المثال." },
        { id: "follow", text: "تابعة للمستثنى منه في الإعراب", next: "R_istithna_follow", eval: { fact: "exceptRole", equals: "follow" }, hint: "في التام المنفي يجوز الإتباع، فتأخذ الكلمة إعراب المستثنى منه، ويشيع إعرابها بدلًا منه." },
      ],
    },
    istithna_mufarragh_role: {
      id: "istithna_mufarragh_role",
      type: "question",
      context: "المستثنى منه غير مذكور، لذلك ألغينا حكم الاستثناء عن الاسم بعد «إلا» ونبحث عن موقعه الحقيقي في الجملة.",
      text: "ما الموقع الذي يطلبه العامل قبل «إلا» للكلمة المحددة؟",
      hint: "احذف «إلا» ذهنيًا بعد النفي واسأل: من فعل؟ ماذا فعلت؟ إلى من؟ ما بعد «إلا» في المفرغ يعرب حسب موقعه.",
      answers: [
        { id: "fael", text: "فاعل مرفوع", next: "R_istithna_mufarragh", eval: { fact: "mufarraghRole", equals: "fael" }, hint: "إذا كان الفعل يحتاج فاعلًا وكانت الكلمة هي التي أسند إليها الفعل، فهي فاعل مرفوع وليست مستثنى." },
        { id: "mafool", text: "مفعول به منصوب", next: "R_istithna_mufarragh", eval: { fact: "mufarraghRole", equals: "mafool" }, hint: "إذا كان الفعل متعديًا ووقعت الكلمة عليه، فهي مفعول به منصوب." },
        { id: "majrur", text: "اسم مجرور", next: "R_istithna_mufarragh", eval: { fact: "mufarraghRole", equals: "majrur" }, hint: "إذا سبقت الكلمة بحرف جر يعمل فيها، فهي اسم مجرور؛ «إلا» لا تغيّر موقعها في الاستثناء المفرغ." },
      ],
    },
    istithna_shape: {
      id: "istithna_shape",
      type: "question",
      context: "ثبت أن المستثنى منصوب في هذا المثال، فنعود إلى صورة الاسم لتحديد علامة النصب.",
      text: "ما صورة المستثنى المنصوب؟",
      hint: "حدد صورة الاسم نفسه قبل اختيار العلامة.",
      answers: [
        { id: "singular", text: "مفرد", next: "istithna_mark", eval: { fact: "shape", equals: "singular" }, hint: "إذا كان المستثنى المنصوب مفردًا، فعلامة نصبه الأصلية الفتحة؛ لا تستخدم علامة المثنى أو الجمع." },
        { id: "dual", text: "مثنى", next: "istithna_mark", eval: { fact: "shape", equals: "dual" }, hint: "إذا كان المستثنى يدل على اثنين وكان مثنى، فعلامة نصبه الياء، لا الفتحة." },
        { id: "jms", text: "جمع مذكر سالم", next: "istithna_mark", eval: { fact: "shape", equals: "jms" }, hint: "إذا كان المستثنى جمع مذكر سالم، فعلامة نصبه الياء؛ افحص صورة الاسم قبل اختيار العلامة." },
      ],
    },
    istithna_mark: {
      id: "istithna_mark",
      type: "question",
      context: "عرفنا أنه مستثنى منصوب وعرفنا صورة الاسم؛ بقيت العلامة.",
      text: "ما علامة النصب؟",
      hint: "الفتحة للمفرد، والياء للمثنى وجمع المذكر السالم.",
      answers: [
        { id: "fatha", text: "الفتحة الظاهرة", next: "R_istithna_nasb", eval: { fact: "nasbMark", equals: "fatha" }, hint: "الفتحة علامة النصب الأصلية للمفرد." },
        { id: "yaa", text: "الياء", next: "R_istithna_nasb", eval: { fact: "nasbMark", equals: "yaa" }, hint: "الياء علامة نصب المثنى وجمع المذكر السالم." },
      ],
    },
    R_istithna_nasb: { id: "R_istithna_nasb", type: "result", text: "مستثنى منصوب في هذا المثال." },
    R_istithna_follow: { id: "R_istithna_follow", type: "result", text: "تابع للمستثنى منه في الاستثناء التام المنفي." },
    R_istithna_mufarragh: { id: "R_istithna_mufarragh", type: "result", text: "في الاستثناء المفرغ يعرب ما بعد «إلا» حسب موقعه." },
  },
};
