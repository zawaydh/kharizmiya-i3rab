import { evaluateAnswer } from "../../../lib/exercise/engine";
import type { ExerciseAnswer } from "../../../lib/exercise/model";
import type { PedagogyNode, PedagogyState } from "./ExercisePedagogyTypes";
import { fiveNounWrongSingularHint, isFiveNounFact } from "./ExerciseHintShared";
import { tawabiStudentHintText } from "./TawabiStudentHints";
import { mafoolStudentHintText } from "./MafoolStudentHints";
import { mafoolatStudentHintText } from "./MafoolatStudentHints";
import { faelStudentHintText } from "./FaelStudentHints";
import { verbStudentHintText } from "./VerbStudentHints";
import { nasikhStudentHintText } from "./NasikhStudentHints";
import { nominalStudentHintText } from "./NominalStudentHints";
import { extendedTopicStudentHintText } from "./ExtendedTopicStudentHints";
import { firstLevelStudentHintText } from "./ExerciseFirstLevelHints";
import { firstWordStudentHintText } from "./FirstWordStudentHints";

const firstDefined = (...hints: Array<string | undefined>): string | undefined =>
  hints.find((hint): hint is string => hint !== undefined);

export function studentHintText(
  node: PedagogyNode | null | undefined,
  picked?: ExerciseAnswer,
  state?: PedagogyState,
): string {
  const id = String(node?.id || "");
  const target = String(state?.currentTarget || "الكلمة المحددة");
  const pickedText = String(picked?.text || "").trim();
  if (pickedText.includes("مفرد") && isFiveNounFact(state?.facts) && /(number|shape|ending|mark|form)/u.test(id)) {
    return fiveNounWrongSingularHint(target);
  }

  if (!picked) {
    const firstHint = firstLevelStudentHintText(node, state);
    if (firstHint !== undefined) return firstHint;
  }

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
    picked?.hint || node?.hint || `اربط «${target}» بما ثبت في الخطوة السابقة، وابحث في المثال عن القرينة التي تميّز الخيارات قبل الانتقال إلى الحكم النهائي.`,
  ).replace(/^💡\s*/, "").trim();

  if (
    fallbackHint.includes("الأسماء الخمسة") &&
    fallbackHint.includes("(أبوك)") &&
    !isFiveNounFact(state?.facts)
  ) return "المفرد يدل على واحد لا على مثنى ولا جمع. افحص الكلمة المطلوبة نفسها: هل تدل على واحد، أم على اثنين، أم على جمع؟ عد للسؤال واختر الإجابة المناسبة.";

  return fallbackHint;
}
function revealComparable(value: unknown): string {
  return String(value ?? "")
    .replace(/[ًٌٍَُِّْـ«»()،,:؛؟.!\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hintStatesCorrectChoice(hint: string, correctText: string, target: string): boolean {
  const normalizedHint = revealComparable(hint);
  const normalizedCorrect = revealComparable(correctText);
  const normalizedTarget = revealComparable(target);
  if (!normalizedCorrect || normalizedCorrect === normalizedTarget) return false;
  if (normalizedCorrect.length >= 4 && normalizedHint.includes(normalizedCorrect)) return true;
  if (!normalizedHint.includes(normalizedCorrect)) return false;
  return new RegExp(`(?:لذلك|إذن|فهو|فهي|نوعها|نوعه|يكون|تكون|الجواب)[^.!؟]{0,35}${normalizedCorrect}`, "u").test(normalizedHint);
}

/**
 * إذا صرّح التشخيص القديم بالإجابة الصحيحة، نستبدله بقرينة المستوى الأول
 * مع إبقاء الاختيار الخاطئ مذكورًا، حتى يظل الطالب هو من يعيد اتخاذ القرار.
 */
export function nonRevealingWrongChoiceHint(
  node: PedagogyNode | null | undefined,
  picked: ExerciseAnswer,
  state: PedagogyState | undefined,
  rawHint: string,
): string {
  if (!node || node.type !== "question") return rawHint;
  const correct = node.answers?.find((answer) => evaluateAnswer(answer, state?.facts || {}));
  if (!correct || !hintStatesCorrectChoice(rawHint, String(correct.text || ""), String(state?.currentTarget || ""))) {
    return rawHint;
  }
  const clue = firstLevelStudentHintText(node, state);
  if (!clue) return rawHint;
  return `اختيار «${String(picked.text || "").trim()}» لا ينسجم مع قرينة المثال. ${clue}`;
}

