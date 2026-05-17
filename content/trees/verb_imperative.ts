export type ExerciseTree = { startNodeId: string; nodes: Record<string, any> };

export const imperativeVerbTree: ExerciseTree = {
  startNodeId: "imp_nun_tawkid",
  nodes: {
    imp_nun_tawkid: {
      id: "imp_nun_tawkid",
      type: "question",
      context: "نبدأ بحالة تغيّر البناء مباشرة: نون التوكيد.",
      text: "هل اتصل فعل الأمر بنون التوكيد؟",
      hint: "نون التوكيد تكون مشددة أو ساكنة مثل: اكتبنَّ. إذا اتصلت بفعل الأمر فهو مبني على الفتح.",
      answers: [
        { id: "a", text: "نعم، اتصل بنون التوكيد", next: "R_imperative_fath_tawkid", eval: { fact: "nunTawkid", equals: true } },
        { id: "b", text: "لا", next: "imp_five", eval: { fact: "nunTawkid", equals: false } }
      ]
    },

    imp_five: {
      id: "imp_five",
      type: "question",
      context: "لم يتصل بنون التوكيد، فنفحص اتصالًا يؤثر في علامة بناء الأمر.",
      text: "هل اتصل فعل الأمر بألف الاثنين أو ياء المخاطبة أو واو الجماعة؟",
      hint: "مثل: اكتبا، اكتبي، اكتبوا. إذا اتصل فعل الأمر بأحدها يبنى على حذف النون.",
      answers: [
        { id: "a", text: "نعم", next: "R_imperative_delete_noon", eval: { fact: "attached", anyOf: ["waw", "yaa", "alif2"] } },
        { id: "b", text: "لا", next: "imp_ending", eval: { fact: "attached", equals: "none" } }
      ]
    },

    imp_ending: {
      id: "imp_ending",
      type: "question",
      context: "ليس من الأفعال الخمسة، فنفحص آخر الفعل.",
      text: "هل فعل الأمر صحيح الآخر أم معتل الآخر؟",
      hint: "الصحيح الآخر يبنى على السكون، أما معتل الآخر فيبنى على حذف حرف العلة: اسعَ، ادعُ، ارمِ.",
      answers: [
        { id: "a", text: "صحيح الآخر", next: "R_imperative_sukoon", eval: { fact: "ending", equals: "sahih" } },
        { id: "b", text: "معتل الآخر", next: "R_imperative_delete_letter", eval: { fact: "ending", equals: "weak" } }
      ]
    },

    R_imperative_fath_tawkid: {
      id: "R_imperative_fath_tawkid",
      type: "result",
      coverage: "imperative.fath_tawkid",
      text: "فعل أمر مبني على الفتح لاتصاله بنون التوكيد."
    },
    R_imperative_delete_noon: {
      id: "R_imperative_delete_noon",
      type: "result",
      coverage: "imperative.delete_noon",
      text: "فعل أمر مبني على حذف النون."
    },
    R_imperative_delete_letter: {
      id: "R_imperative_delete_letter",
      type: "result",
      coverage: "imperative.delete_letter",
      text: "فعل أمر مبني على حذف حرف العلة من آخره."
    },
    R_imperative_sukoon: {
      id: "R_imperative_sukoon",
      type: "result",
      coverage: "imperative.sukoon",
      text: "فعل أمر مبني على السكون على آخره."
    }
  }
};
