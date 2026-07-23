export type Example = { id: string; sentence: string; target: string; facts: Record<string, any>; covers: string[] };

export const ismManqousCoverageKeysOrdered = [
  "manqous.nasb",
  "manqous.raf3.kept",
  "manqous.raf3.deleted",
  "manqous.jar.kept",
  "manqous.jar.deleted",
];

export const ismManqousExamples: Example[] = [
  { id: "mn-01", sentence: "رأيتُ قاضيًا عادلًا.", target: "قاضيًا", facts: { case: "nasb" }, covers: ["manqous.nasb"] },
  { id: "mn-02", sentence: "جاءَ القاضي.", target: "القاضي", facts: { case: "raf3", yStatus: "kept" }, covers: ["manqous.raf3.kept"] },
  { id: "mn-03", sentence: "جاءَ قاضٍ عادلٌ.", target: "قاضٍ", facts: { case: "raf3", yStatus: "deleted" }, covers: ["manqous.raf3.deleted"] },
  { id: "mn-04", sentence: "مررتُ بالقاضي.", target: "القاضي", facts: { case: "jar", yStatus: "kept" }, covers: ["manqous.jar.kept"] },
  { id: "mn-05", sentence: "مررتُ بقاضٍ عادلٍ.", target: "قاضٍ", facts: { case: "jar", yStatus: "deleted" }, covers: ["manqous.jar.deleted"] },

  { id: "mn-06", sentence: "قابلتُ راعيًا أمينًا.", target: "راعيًا", facts: { case: "nasb" }, covers: ["manqous.nasb"] },
  { id: "mn-07", sentence: "ساعدتُ ساعيًا إلى الخيرِ.", target: "ساعيًا", facts: { case: "nasb" }, covers: ["manqous.nasb"] },
  { id: "mn-08", sentence: "حضرَ الساعي.", target: "الساعي", facts: { case: "raf3", yStatus: "kept" }, covers: ["manqous.raf3.kept"] },
  { id: "mn-09", sentence: "حضرَ قاضي المدينةِ.", target: "قاضي", facts: { case: "raf3", yStatus: "kept" }, covers: ["manqous.raf3.kept"] },
  { id: "mn-10", sentence: "وصلَ داعٍ إلى الخيرِ.", target: "داعٍ", facts: { case: "raf3", yStatus: "deleted" }, covers: ["manqous.raf3.deleted"] },
  { id: "mn-11", sentence: "تقدّمَ ساعٍ نشيطٌ.", target: "ساعٍ", facts: { case: "raf3", yStatus: "deleted" }, covers: ["manqous.raf3.deleted"] },
  { id: "mn-12", sentence: "استمعتُ إلى الداعي.", target: "الداعي", facts: { case: "jar", yStatus: "kept" }, covers: ["manqous.jar.kept"] },
  { id: "mn-13", sentence: "سلّمتُ على قاضي المدينةِ.", target: "قاضي", facts: { case: "jar", yStatus: "kept" }, covers: ["manqous.jar.kept"] },
  { id: "mn-14", sentence: "استمعتُ إلى داعٍ صادقٍ.", target: "داعٍ", facts: { case: "jar", yStatus: "deleted" }, covers: ["manqous.jar.deleted"] },
  { id: "mn-15", sentence: "مررتُ بساعٍ مجتهدٍ.", target: "ساعٍ", facts: { case: "jar", yStatus: "deleted" }, covers: ["manqous.jar.deleted"] },
];

const resultByCover: Record<string, string> = {
  "manqous.nasb": "اسم منقوص منصوب وعلامة نصبه الفتحة الظاهرة على آخره",
  "manqous.raf3.kept": "اسم منقوص مرفوع وعلامة رفعه الضمة المقدرة على الياء للثقل",
  "manqous.raf3.deleted": "اسم منقوص مرفوع وعلامة رفعه الضمة المقدرة على الياء المحذوفة",
  "manqous.jar.kept": "اسم منقوص مجرور وعلامة جره الكسرة المقدرة على الياء للثقل",
  "manqous.jar.deleted": "اسم منقوص مجرور وعلامة جره الكسرة المقدرة على الياء المحذوفة",
};
const all = Object.values(resultByCover);

function manqousOptionReason(ex: Example, option: string, correct: string): string {
  if (option === correct) return `صحيح؛ موقع «${ex.target}» وصورة الياء فيه يطابقان هذا الإعراب.`;
  const selectedCase = option.includes("منصوب") ? "nasb" : option.includes("مرفوع") ? "raf3" : option.includes("مجرور") ? "jar" : "";
  const actualCase = String(ex.facts.case || "");
  if (selectedCase && selectedCase !== actualCase) {
    const roleReason = actualCase === "nasb" ? "وقع عليه الفعل فهو منصوب" : actualCase === "raf3" ? "قام بالفعل فهو مرفوع" : "سبق بحرف جر فهو مجرور";
    const yAssumption = option.includes("المحذوفة")
      ? "، ويفترض أيضًا أن الياء محذوفة"
      : option.includes("على الياء")
        ? "، ويفترض بقاء الياء وتقدير الحركة عليها"
        : "";
    return `هذا الاختيار يفترض أن الاسم ${selectedCase === "nasb" ? "منصوب" : selectedCase === "raf3" ? "مرفوع" : "مجرور"}${yAssumption}، لكن «${ex.target}» ${roleReason}${actualCase === "nasb" ? " وتظهر الفتحة على يائه" : String(ex.facts.yStatus || "") === "deleted" ? " وياؤه محذوفة" : " وياؤه باقية"}.`;
  }
  const selectedDeleted = option.includes("المحذوفة");
  const selectedKept = option.includes("على الياء") && !selectedDeleted;
  const actualStatus = String(ex.facts.yStatus || "");
  if (selectedDeleted && actualStatus === "kept") return `هذا الاختيار يفترض حذف الياء، لكن الياء باقية في «${ex.target}» لأنه معرّف بـ«أل» أو مضاف؛ وتقدر الحركة عليها للثقل.`;
  if (selectedKept && actualStatus === "deleted") return `هذا الاختيار يفترض بقاء الياء، لكن «${ex.target}» نكرة غير مضافة ولا معرفة بـ«أل»، فحذفت ياؤه وعُوِّض عنها بتنوين الكسر.`;
  if (actualCase === "nasb" && option.includes("مقدرة")) return `في النصب تظهر الفتحة على ياء الاسم المنقوص، كما في «${ex.target}»؛ فلا تكون علامة النصب مقدرة.`;
  return `هذا الإعراب لا يطابق موقع «${ex.target}» أو حالة الياء فيه.`;
}

export const ismManqousQuizExamples = ismManqousExamples.map((ex, i) => {
  const correct = resultByCover[ex.covers[0]];
  const distractors = all.filter((item) => item !== correct);
  const rotated = [...distractors.slice(i % distractors.length), ...distractors.slice(0, i % distractors.length)];
  const options = [correct, ...rotated].slice(0, 4);
  return {
    ...ex,
    prompt: "ما إعراب الاسم المنقوص المحدد؟",
    options,
    correctI3rab: correct,
    whyCorrect: "نحدد الموقع الإعرابي أولًا، ثم نسأل عن بقاء الياء أو حذفها.",
    optionReasons: Object.fromEntries(options.map((o) => [o, manqousOptionReason(ex, o, correct)])),
  };
});
