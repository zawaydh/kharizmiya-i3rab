export type ExerciseTree = { startNodeId: string; nodes: Record<string, any> };

export const imperativeVerbTree: ExerciseTree = {
  startNodeId: "imperative_pronoun_check",
  nodes: {
    imperative_pronoun_check: {
      id: "imperative_pronoun_check",
      type: "question",
      text: "هل اتصل فعل الأمر بواو الجماعة أو ياء المخاطبة أو ألف الاثنين؟",
      teaching_note: "عزيزي الطالب، في فعل الأمر لا نقول إنه من الأفعال الخمسة؛ بل نقول: هل اتصل بواو الجماعة أو ياء المخاطبة أو ألف الاثنين؟ إذا نعم فهو مبني على حذف النون من آخره.",
      hint: "تذكّر الأصل: اذهبي أصلها اذهبين، واذهبا أصلها اذهبان؛ النون محذوفة، لذلك تكون علامة البناء حذف النون.",
      answers: [
        { id: "a", text: "نعم، واو الجماعة", next: "R_imperative_waw", eval: { fact: "attached", equals: "waw" } },
        { id: "b", text: "نعم، ياء المخاطبة", next: "R_imperative_yaa", eval: { fact: "attached", equals: "yaa" } },
        { id: "c", text: "نعم، ألف الاثنين", next: "R_imperative_alif2", eval: { fact: "attached", equals: "alif2" } },
        { id: "d", text: "لا", next: "imperative_weak_check", eval: { fact: "attached", equals: "none" } }
      ]
    },
    imperative_weak_check: {
      id: "imperative_weak_check",
      type: "question",
      text: "هل فعل الأمر معتل الآخر؟",
      teaching_note: "لا تنظر إلى آخر حرف ظاهر فقط؛ فقد يكون حرف العلة محذوفًا. أعد الفعل إلى أصله: ارمِ أصلها رمى، وادعُ أصلها دعا، واسعَ أصلها سعى.",
      hint: "أعد الفعل إلى أصله: ارمِ ← رمى، ادعُ ← دعا، اسعَ ← سعى. إذا كان أصل آخره حرف علة فهو معتل الآخر.",
      answers: [
        { id: "a", text: "نعم، معتل الآخر", next: "R_imperative_delete_letter", eval: { fact: "ending", equals: "weak" } },
        { id: "b", text: "لا، صحيح الآخر", next: "R_imperative_sukoon", eval: { fact: "ending", equals: "sahih" } }
      ]
    },
    R_imperative_waw: { id: "R_imperative_waw", type: "result", coverage: "imperative.delete_noon.waw", text: "فعل أمر مبني على حذف النون من آخره لاتصاله بواو الجماعة، وواو الجماعة ضمير متصل مبني في محل رفع فاعل" },
    R_imperative_yaa: { id: "R_imperative_yaa", type: "result", coverage: "imperative.delete_noon.yaa", text: "فعل أمر مبني على حذف النون من آخره لاتصاله بياء المخاطبة، وياء المخاطبة ضمير متصل مبني في محل رفع فاعل" },
    R_imperative_alif2: { id: "R_imperative_alif2", type: "result", coverage: "imperative.delete_noon.alif2", text: "فعل أمر مبني على حذف النون من آخره لاتصاله بألف الاثنين، وألف الاثنين ضمير متصل مبني في محل رفع فاعل" },
    R_imperative_delete_letter: { id: "R_imperative_delete_letter", type: "result", coverage: "imperative.delete_letter", text: "فعل أمر مبني على حذف حرف العلة من آخره" },
    R_imperative_sukoon: { id: "R_imperative_sukoon", type: "result", coverage: "imperative.sukoon", text: "فعل أمر مبني على السكون" }
  }
};
