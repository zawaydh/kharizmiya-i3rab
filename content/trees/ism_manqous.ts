export type ExerciseTree = { startNodeId: string; nodes: Record<string, any> };

export const ismManqousTree: ExerciseTree = {
  startNodeId: "manqous_case",
  nodes: {
    manqous_case: {
      id: "manqous_case",
      type: "question",
      text: "ما موقع الاسم المنقوص: منصوب أم مرفوع أم مجرور؟",
      teaching_note: "الاسم المنقوص اسم معرب آخره ياء لازمة مكسور ما قبلها مثل: القاضي، الهادي، الساعي. نبدأ بالموقع الإعرابي ثم نحدد بقاء الياء أو حذفها.",
      hint: "اسأل عن موقع الكلمة في الجملة: هل هي من المنصوبات؟ أم من المرفوعات؟ أم من المجرورات؟",
      answers: [
        { id: "a", text: "منصوب", next: "R_manqous_nasb", eval: { fact: "case", equals: "nasb" } },
        { id: "b", text: "مرفوع", next: "manqous_y_status_raf3", eval: { fact: "case", equals: "raf3" } },
        { id: "c", text: "مجرور", next: "manqous_y_status_jar", eval: { fact: "case", equals: "jar" } }
      ]
    },
    manqous_y_status_raf3: {
      id: "manqous_y_status_raf3",
      type: "question",
      text: "هل اتصلت به أل التعريف أو جاء بعده مضاف إليه؟",
      teaching_note: "إذا عُرّف الاسم المنقوص بأل أو أضيف بقيت الياء. وإذا كان نكرة غير مضاف حذفت ياؤه في الرفع والجر.",
      hint: "القاضيُ والهاديُ: الياء باقية. قاضٍ وهادٍ: الياء محذوفة في الرفع والجر.",
      answers: [
        { id: "a", text: "نعم، الياء باقية", next: "R_manqous_raf3_y_kept", eval: { fact: "yStatus", equals: "kept" } },
        { id: "b", text: "لا، الياء محذوفة", next: "R_manqous_raf3_y_deleted", eval: { fact: "yStatus", equals: "deleted" } }
      ]
    },
    manqous_y_status_jar: {
      id: "manqous_y_status_jar",
      type: "question",
      text: "هل اتصلت به أل التعريف أو جاء بعده مضاف إليه؟",
      teaching_note: "إذا عُرّف الاسم المنقوص بأل أو أضيف بقيت الياء. وإذا كان نكرة غير مضاف حذفت ياؤه في الرفع والجر.",
      hint: "مررتُ بالقاضيِ: الياء باقية. مررتُ بقاضٍ: الياء محذوفة، والكسرة مقدرة على الياء المحذوفة.",
      answers: [
        { id: "a", text: "نعم، الياء باقية", next: "R_manqous_jar_y_kept", eval: { fact: "yStatus", equals: "kept" } },
        { id: "b", text: "لا، الياء محذوفة", next: "R_manqous_jar_y_deleted", eval: { fact: "yStatus", equals: "deleted" } }
      ]
    },
    R_manqous_nasb: { id: "R_manqous_nasb", type: "result", coverage: "manqous.nasb", text: "اسم منقوص منصوب وعلامة نصبه الفتحة أو تنوين الفتح الظاهر على آخره" },
    R_manqous_raf3_y_kept: { id: "R_manqous_raf3_y_kept", type: "result", coverage: "manqous.raf3.kept", text: "اسم منقوص مرفوع وعلامة رفعه الضمة المقدرة على الياء للثقل" },
    R_manqous_raf3_y_deleted: { id: "R_manqous_raf3_y_deleted", type: "result", coverage: "manqous.raf3.deleted", text: "اسم منقوص مرفوع وعلامة رفعه الضمة المقدرة على الياء المحذوفة" },
    R_manqous_jar_y_kept: { id: "R_manqous_jar_y_kept", type: "result", coverage: "manqous.jar.kept", text: "اسم منقوص مجرور وعلامة جره الكسرة المقدرة على الياء للثقل" },
    R_manqous_jar_y_deleted: { id: "R_manqous_jar_y_deleted", type: "result", coverage: "manqous.jar.deleted", text: "اسم منقوص مجرور وعلامة جره الكسرة المقدرة على الياء المحذوفة" }
  }
};
