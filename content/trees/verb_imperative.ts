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
      context: "لم يتصل بنون التوكيد، فنفحص اتصال الضمائر التي تقود إلى حذف النون.",
      text: "هل فعل الأمر من الأفعال الخمسة؟ (أي اتصل بواو الجماعة أو ياء المخاطبة أو ألف الاثنين)",
      hint: "مثل: اكتبوا، اكتبي، اكتبا. إذا اتصل بأحد هذه الضمائر يبنى على حذف النون.",
      answers: [
        { id: "a", text: "نعم، اتصل بواو الجماعة", next: "R_imperative_delete_noon_waw", eval: { fact: "attached", equals: "waw" } },
        { id: "b", text: "نعم، اتصل بياء المخاطبة", next: "R_imperative_delete_noon_yaa", eval: { fact: "attached", equals: "yaa" } },
        { id: "c", text: "نعم، اتصل بألف الاثنين", next: "R_imperative_delete_noon_alif2", eval: { fact: "attached", equals: "alif2" } },
        { id: "d", text: "لا، لم يتصل بهذه الضمائر", next: "imp_ending", eval: { fact: "attached", equals: "none" } }
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
    R_imperative_delete_noon_waw: {
      id: "R_imperative_delete_noon_waw",
      type: "result",
      coverage: "imperative.delete_noon.waw",
      text: "فعل أمر مبني على حذف النون لاتصاله بواو الجماعة، وواو الجماعة ضمير متصل مبني في محل رفع فاعل."
    },
    R_imperative_delete_noon_yaa: {
      id: "R_imperative_delete_noon_yaa",
      type: "result",
      coverage: "imperative.delete_noon.yaa",
      text: "فعل أمر مبني على حذف النون لاتصاله بياء المخاطبة، وياء المخاطبة ضمير متصل مبني في محل رفع فاعل."
    },
    R_imperative_delete_noon_alif2: {
      id: "R_imperative_delete_noon_alif2",
      type: "result",
      coverage: "imperative.delete_noon.alif2",
      text: "فعل أمر مبني على حذف النون لاتصاله بألف الاثنين، وألف الاثنين ضمير متصل مبني في محل رفع فاعل."
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
