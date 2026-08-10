import type { ExerciseTree } from "../../lib/exercise/model";

export const ismManqousTree: ExerciseTree = {
  startNodeId: "manqous_identity",
  practiceStartNodeId: "manqous_has_al",
  nodes: {
    manqous_identity: {
      id: "manqous_identity",
      type: "question",
      context: "نثبت أولًا أن الكلمة اسم منقوص، ثم نبحث عن سبب بقاء الياء أو حذفها قبل تحديد العلامة.",
      text: "هل الكلمة اسم معرب آخره ياء لازمة مكسور ما قبلها، مثل: القاضي والساعي؟",
      hint: "إذا كانت الياء محذوفة في صورة مثل «قاضٍ»، أعد الكلمة إلى صورتها مع «الـ»: القاضي. ظهور ياء لازمة قبلها كسرة يدل على أنها اسم منقوص.",
      answers: [
        { id: "yes", text: "نعم، هي اسم منقوص", next: "manqous_has_al", correct: true },
        { id: "no", text: "لا، ليست اسمًا منقوصًا", next: "manqous_identity", correct: false, hint: "جرّب إعادة الكلمة إلى صورتها مع «الـ». إذا ظهرت ياء لازمة قبلها كسرة، فهي اسم منقوص." },
      ],
    },
    manqous_has_al: {
      id: "manqous_has_al",
      type: "question",
      context: "عرفنا أنه اسم منقوص. الآن نحدد أول سبب يجعل الياء ثابتة.",
      text: "هل الاسم المنقوص معرّف بـ«الـ»؟",
      hint: "انظر إلى الكلمة نفسها: «القاضي، الساعي» معرفان بـ«الـ»، ولذلك تبقى الياء فيهما.",
      answers: [
        { id: "yes", text: "نعم، معرّف بـ«الـ»", next: "manqous_case_kept", eval: { fact: "hasAl", equals: true } },
        { id: "no", text: "لا، ليس معرّفًا بـ«الـ»", next: "manqous_is_added", eval: { fact: "hasAl", equals: false } },
      ],
    },
    manqous_is_added: {
      id: "manqous_is_added",
      type: "question",
      context: "استبعدنا التعريف بـ«الـ». نفحص الآن السبب الثاني لبقاء الياء.",
      text: "هل الاسم المنقوص مضاف إلى اسم أو ضمير بعده؟",
      hint: "مثل «قاضي المحكمةِ» و«قاضيها»: الاسم المنقوص مضاف، ولذلك تبقى ياؤه. أمّا «قاضٍ» فليس معرفًا بـ«الـ» ولا مضافًا.",
      answers: [
        { id: "yes", text: "نعم، هو مضاف", next: "manqous_case_kept", eval: { fact: "isAdded", equals: true } },
        { id: "no", text: "لا، نكرة مجردة غير مضافة", next: "manqous_indef_case", eval: { fact: "isAdded", equals: false } },
      ],
    },
    manqous_case_kept: {
      id: "manqous_case_kept",
      type: "question",
      context: "ثبتت الياء لأنه معرف بـ«الـ» أو مضاف. بقي أن نحدد الحالة الإعرابية حتى نعرف العلامة.",
      text: "ما الحالة الإعرابية للاسم المنقوص في الجملة؟",
      hint: "إذا كان منصوبًا تظهر الفتحة على الياء. وإذا كان مرفوعًا أو مجرورًا تبقى الياء وتقدر الضمة أو الكسرة عليها للثقل.",
      answers: [
        { id: "nasb", text: "منصوب", next: "R_manqous_nasb", eval: { fact: "case", equals: "nasb" } },
        { id: "raf3", text: "مرفوع", next: "R_manqous_raf3_kept", eval: { fact: "case", equals: "raf3" } },
        { id: "jar", text: "مجرور", next: "R_manqous_jar_kept", eval: { fact: "case", equals: "jar" } },
      ],
    },
    manqous_indef_case: {
      id: "manqous_indef_case",
      type: "question",
      context: "الاسم نكرة مجردة: ليس معرفًا بـ«الـ» ولا مضافًا. هنا تحدد الحالة الإعرابية هل تثبت الياء أم تحذف.",
      text: "ما الحالة الإعرابية للاسم المنقوص النكرة؟",
      hint: "في النصب تثبت الياء وتظهر الفتحة: «رأيتُ قاضيًا». أمّا في الرفع والجر فتحذف الياء ويظهر تنوين الكسر: «جاء قاضٍ / مررتُ بقاضٍ».",
      answers: [
        { id: "nasb", text: "منصوب: تثبت الياء وتظهر الفتحة", next: "R_manqous_nasb", eval: { fact: "case", equals: "nasb" } },
        { id: "raf3", text: "مرفوع: تحذف الياء", next: "R_manqous_raf3_deleted", eval: { fact: "case", equals: "raf3" } },
        { id: "jar", text: "مجرور: تحذف الياء", next: "R_manqous_jar_deleted", eval: { fact: "case", equals: "jar" } },
      ],
    },
    R_manqous_nasb: {
      id: "R_manqous_nasb",
      type: "result",
      coverage: "manqous.nasb",
      text: "اسم منقوص منصوب وعلامة نصبه الفتحة الظاهرة على الياء؛ فالفتحة خفيفة فتظهر، وتثبت الياء في النصب.",
    },
    R_manqous_raf3_kept: {
      id: "R_manqous_raf3_kept",
      type: "result",
      coverage: "manqous.raf3.kept",
      text: "اسم منقوص مرفوع وعلامة رفعه الضمة المقدرة على الياء منع من ظهورها الثقل، والياء ثابتة لأنه معرف بـ«الـ» أو مضاف.",
    },
    R_manqous_raf3_deleted: {
      id: "R_manqous_raf3_deleted",
      type: "result",
      coverage: "manqous.raf3.deleted",
      text: "اسم منقوص مرفوع وعلامة رفعه الضمة المقدرة على الياء المحذوفة للثقل؛ حذفت الياء لأنه نكرة غير مضافة ولا معرفة بـ«الـ».",
    },
    R_manqous_jar_kept: {
      id: "R_manqous_jar_kept",
      type: "result",
      coverage: "manqous.jar.kept",
      text: "اسم منقوص مجرور وعلامة جره الكسرة المقدرة على الياء منع من ظهورها الثقل، والياء ثابتة لأنه معرف بـ«الـ» أو مضاف.",
    },
    R_manqous_jar_deleted: {
      id: "R_manqous_jar_deleted",
      type: "result",
      coverage: "manqous.jar.deleted",
      text: "اسم منقوص مجرور وعلامة جره الكسرة المقدرة على الياء المحذوفة للثقل؛ حذفت الياء لأنه نكرة غير مضافة ولا معرفة بـ«الـ».",
    },
  },
};
