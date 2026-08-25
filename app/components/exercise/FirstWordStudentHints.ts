import type { ExerciseAnswer } from "../../../lib/exercise/model";
import type { PedagogyNode, PedagogyState } from "./ExercisePedagogyTypes";

export function firstWordStudentHintText(
  node: PedagogyNode | null | undefined,
  picked?: ExerciseAnswer,
  state?: PedagogyState,
): string | undefined {
  const id = String(node?.id || "");
  if (!id.startsWith("fw_")) return undefined;
  const target = String(state?.currentTarget || "الكلمة المحددة");
  const pickedText = String(picked?.text || "").trim();
  const facts = state?.facts || {};
  const sentence = String(state?.currentSentence || state?.sentence || "");
  const words = sentence.replace(/[.؟!،]/g, " ").trim().split(/\s+/).filter(Boolean);
  const clean = (value: string) => value.replace(/[ًٌٍَُِّْ]/g, "");
  const targetIndex = words.findIndex((word) => clean(word) === clean(target));
  const following = targetIndex >= 0 ? words[targetIndex + 1] || "الكلمة التالية" : "الكلمة التالية";

  if (id === "fw_decision_1") {
    if (pickedText === "اسم" && facts.wordType !== "noun")
      return `اخترتَ «اسم»، لكن هذا الاختيار لا يوافق القرينة في «${target}». ${facts.wordType === "verb" ? "الكلمة تحمل حدثًا مرتبطًا بزمن؛ اربطها بزمن وقوع الحدث ثم أعد الاختيار." : "معناها لا يكتمل وحدها بل تربط ما بعدها بما قبلها؛ استخدم هذه الوظيفة للحكم."}`;
    if (pickedText === "فعل" && facts.wordType !== "verb")
      return `اخترتَ «فعل»، لكن الفعل يحتاج حدثًا وزمنًا. أمّا «${target}» ${facts.wordType === "noun" ? "فتدل على مسمّى أو معنى بلا زمن؛ ابحث عن قرينة اسمية في المثال." : "فلا تحمل حدثًا، ويظهر معناها من علاقتها بما بعدها؛ راجع الوظيفة قبل اختيار النوع."}`;
    if (pickedText === "حرف" && facts.wordType !== "particle")
      return `اخترتَ «حرف»، لكن الحرف لا يستقل معناه كاملًا. أمّا «${target}» ${facts.wordType === "verb" ? "فتحمل حدثًا مرتبطًا بزمن؛ استخدم اجتماع الحدث والزمن للحكم." : "فتدل على مسمّى أو معنى بلا زمن؛ اختبر علامات الاسم المناسبة للسياق."}`;
    return `اختبر «${target}» بثلاث قرائن: الاسم يقبل خصائص الأسماء مثل «الـ» أو الجر بحسب السياق، والفعل يدل على حدث مرتبط بزمن، والحرف لا يستقل معناه كاملًا بل يربط ما بعده بما قبله. طبّق القرينة التي تظهر في المثال، ولا تعتمد على طول الكلمة أو شكلها فقط.`;
  }

  if (id === "fw_verb_tense") {
    const actual = String(facts.verbType || "");
    if (pickedText.includes("ماض") && actual !== "past")
      return `اخترتَ «ماضٍ»، لكن الماضي يحكي حدثًا وقع وانتهى. «${target}» ${actual === "present" ? "تدل على حدث يقع أو يتجدد؛ جرّب معها «الآن» ثم أعد الاختيار." : "تطلب حصول الحدث من المخاطب؛ حدّد الزمن من معنى الطلب."}`;
    if (pickedText.includes("مضارع") && actual !== "present")
      return `اخترتَ «مضارع»، لكن المضارع يدل على حدث يقع أو يتجدد. «${target}» ${actual === "past" ? "تحكي حدثًا وقع وانتهى؛ جرّب معها «أمس» ثم أعد الاختيار." : "تطلب حصول الحدث من المخاطب؛ استخدم دلالة الطلب للحكم."}`;
    if (pickedText.includes("أمر") && actual !== "imperative")
      return `اخترتَ «أمر»، لكن الأمر يطلب حصول الحدث. «${target}» ${actual === "past" ? "تحكي حدثًا وقع وانتهى؛ اربطها بزمن الحدث ثم أعد الاختيار." : "تخبر عن حدث يقع أو يتجدد من غير طلب مباشر؛ استخدم هذا الفرق."}`;
    return `جرّب ربط «${target}» بالزمن والمعنى: ما يحكي حدثًا وقع وانتهى ماضٍ، وما يخبر عن حدث يقع أو يتجدد مضارع، وما يطلب من المخاطب حصول الحدث أمر. استخدم معنى الفعل في الجملة لا شكله وحده.`;
  }

  if (id === "fw_particle_after") {
    if (pickedText.includes("فعل") && facts.afterParticle !== "verb")
      return `اخترتَ «جاء بعده فعل»، لكن الكلمة بعد «${target}» هي «${following}»، وهي تدل على مسمّى أو معنى بلا حدث وزمن. صنّف الكلمة التالية من هذه القرينة ثم أعد الاختيار.`;
    if (pickedText.includes("اسم") && facts.afterParticle !== "noun")
      return `اخترتَ «جاء بعده اسم»، لكن الكلمة بعد «${target}» هي «${following}»، وهي تحمل حدثًا مرتبطًا بزمن. استخدم اجتماع الحدث والزمن لتحديد نوعها ثم أعد الاختيار.`;
    return `اقرأ ما بعد «${target}» مباشرة: «${following}». إذا حملت الكلمة التالية حدثًا وزمنًا فهي فعل، وإذا دلت على اسم أو معنى بلا زمن فهي اسم؛ وبهذا نعرف المسار الذي فتحه الحرف في الجملة.`;
  }
  return undefined;
}
