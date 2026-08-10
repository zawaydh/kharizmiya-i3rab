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

export function studentHintText(
  node: PedagogyNode | null | undefined,
  picked?: ExerciseAnswer,
  state?: PedagogyState,
): string {
  const topicHint = firstDefined(
    node?.id?.startsWith("tawabi_") ? tawabiStudentHintText(node, picked, state) : undefined,
    mafoolatStudentHintText(node, picked, state),
    node?.id?.startsWith("mafoolat_") ? mafoolatStudentHintText(node, picked, state) : undefined,
    mafoolStudentHintText(node, picked, state),
    faelStudentHintText(node, picked, state),
    verbStudentHintText(node, picked, state),
    nasikhStudentHintText(node, picked, state),
    nominalStudentHintText(node, picked, state),
    extendedTopicStudentHintText(node, picked, state),
  );

  if (topicHint !== undefined) return topicHint;

  const fallbackHint = String(
    picked?.hint || node?.hint || "فكّر في السؤال الحالي فقط، ولا تقفز إلى الإعراب النهائي.",
  )
    .replace(/^💡\s*/, "")
    .trim();

  if (
    fallbackHint.includes("الأسماء الخمسة") &&
    fallbackHint.includes("(أبوك)") &&
    !isFiveNounFact(state?.facts)
  ) {
    return "المفرد يدل على واحد لا على مثنى ولا جمع. افحص الكلمة المطلوبة نفسها: هل تدل على واحد، أم على اثنين، أم على جمع؟ عد للسؤال واختر الإجابة المناسبة.";
  }

  return fallbackHint;
}
