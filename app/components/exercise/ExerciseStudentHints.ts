import type { ExerciseAnswer } from "../../../lib/exercise/model";
import type { PedagogyNode, PedagogyState } from "./ExercisePedagogyTypes";
import { isFiveNounFact } from "./ExerciseHintShared";
import { tawabiStudentHintText } from "./TawabiStudentHints";
import { mafoolStudentHintText } from "./MafoolStudentHints";
import { mafoolatStudentHintText } from "./MafoolatStudentHints";
import { faelStudentHintText } from "./FaelStudentHints";
import { verbStudentHintText } from "./VerbStudentHints";
import { nasikhStudentHintText } from "./NasikhStudentHints";
import { nominalStudentHintText } from "./NominalStudentHints";
import { extendedTopicStudentHintText } from "./ExtendedTopicStudentHints";

const firstDefined = (...hints: Array<string | undefined>): string | undefined =>
  hints.find((hint): hint is string => hint !== undefined);

function firstWordStudentHintText(
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
      return `اخترتَ «اسم»، لكن ${target} لا تدل هنا على اسم أو معنى مجرد من الزمن. ${facts.wordType === "verb" ? "هي تدل على حدث مرتبط بزمن، لذلك هي فعل." : "هي حرف لا يستقل معناه كاملًا إلا مع غيره."}`;
    if (pickedText === "فعل" && facts.wordType !== "verb")
      return `اخترتَ «فعل»، لكن الفعل يدل على حدث وزمن. أمّا «${target}» ${facts.wordType === "noun" ? "فتدل على اسم أو معنى بلا زمن، لذلك هي اسم." : "فلا تدل على حدث وزمن، ويظهر معناها مع ما بعدها؛ لذلك هي حرف."}`;
    if (pickedText === "حرف" && facts.wordType !== "particle")
      return `اخترتَ «حرف»، لكن الحرف لا يستقل معناه كاملًا. أمّا «${target}» ${facts.wordType === "verb" ? "فتدل على حدث وزمن، لذلك هي فعل." : "فتدل على اسم أو معنى بلا زمن، لذلك هي اسم."}`;
    return `انظر إلى «${target}» نفسها: هل تدل على اسم أو معنى بلا زمن، أم على حدث وزمن، أم لا يظهر معناها كاملًا إلا مع غيرها؟`;
  }

  if (id === "fw_verb_tense") {
    const actual = String(facts.verbType || "");
    if (pickedText.includes("ماض") && actual !== "past")
      return `اخترتَ «ماضٍ»، لكن الماضي يحكي حدثًا وقع وانتهى. «${target}» ${actual === "present" ? "تدل على حدث يقع أو يتجدد، فهي مضارع." : "تطلب حصول الحدث من المخاطب، فهي أمر."}`;
    if (pickedText.includes("مضارع") && actual !== "present")
      return `اخترتَ «مضارع»، لكن المضارع يدل على حدث يقع أو يتجدد. «${target}» ${actual === "past" ? "تحكي حدثًا وقع وانتهى، فهي ماضٍ." : "تطلب حصول الحدث من المخاطب، فهي أمر."}`;
    if (pickedText.includes("أمر") && actual !== "imperative")
      return `اخترتَ «أمر»، لكن الأمر يطلب حصول الحدث. «${target}» ${actual === "past" ? "تحكي حدثًا وقع وانتهى، فهي ماضٍ." : "تدل على حدث يقع أو يتجدد، فهي مضارع."}`;
    return `حدّد زمن «${target}»: أوقع الحدث وانتهى، أم يقع أو يتجدد، أم هو طلب حصول الحدث؟`;
  }

  if (id === "fw_particle_after") {
    if (pickedText.includes("فعل") && facts.afterParticle !== "verb")
      return `اخترتَ «جاء بعده فعل»، لكن الكلمة بعد «${target}» هي «${following}»، وهي تدل على اسم أو معنى بلا زمن؛ لذلك جاء بعد الحرف اسم.`;
    if (pickedText.includes("اسم") && facts.afterParticle !== "noun")
      return `اخترتَ «جاء بعده اسم»، لكن الكلمة بعد «${target}» هي «${following}»، وهي تدل على حدث وزمن؛ لذلك جاء بعد الحرف فعل.`;
    return `انظر إلى «${following}» بعد «${target}»: هل تدل على حدث وزمن، أم على اسم أو معنى بلا زمن؟`;
  }
  return undefined;
}

export function studentHintText(
  node: PedagogyNode | null | undefined,
  picked?: ExerciseAnswer,
  state?: PedagogyState,
): string {
  const topicHint = firstDefined(
    firstWordStudentHintText(node, picked, state),
    node?.id?.startsWith("tawabi_") ? tawabiStudentHintText(node, picked, state) : undefined,
    mafoolatStudentHintText(node, picked, state),
    node?.id?.startsWith("mafoolat_") ? mafoolatStudentHintText(node, picked, state) : undefined,
    mafoolStudentHintText(node, picked, state), faelStudentHintText(node, picked, state),
    verbStudentHintText(node, picked, state), nasikhStudentHintText(node, picked, state),
    nominalStudentHintText(node, picked, state), extendedTopicStudentHintText(node, picked, state),
  );
  if (topicHint !== undefined) return topicHint;

  const fallbackHint = String(
    picked?.hint || node?.hint || "فكّر في السؤال الحالي فقط، ولا تقفز إلى الإعراب النهائي.",
  ).replace(/^💡\s*/, "").trim();

  if (
    fallbackHint.includes("الأسماء الخمسة") &&
    fallbackHint.includes("(أبوك)") &&
    !isFiveNounFact(state?.facts)
  ) return "المفرد يدل على واحد لا على مثنى ولا جمع. افحص الكلمة المطلوبة نفسها: هل تدل على واحد، أم على اثنين، أم على جمع؟ عد للسؤال واختر الإجابة المناسبة.";

  return fallbackHint;
}
