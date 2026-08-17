import { evaluateAnswer } from "../../../lib/exercise/engine";
import type {
  ExerciseAnswer,
  ExerciseExample,
  ExerciseTree,
  Mode,
  QuestionNode,
} from "../../../lib/exercise/model";
import { buildRunnerState, type RunnerState } from "../../../lib/exercise/runner";
import { isHintAnswerOption, resolveAnswerAttempt } from "../../../lib/exercise/answerSession";
import { buildI3rabDistractors, localQuizExpectedLabel, type QuizExampleLike } from "../../../lib/exercise/quiz";
import {
  cleanPracticeTeacherPart,
  normalizeBuildPiece,
  normalizeThinkingNode,
  teacherSuccessText,
} from "./ExercisePedagogy";

type PracticeFlowContext = {
  tree: ExerciseTree;
  mode: Mode;
  example?: ExerciseExample;
  state: RunnerState;
  practiceExpectedLabel: string;
};

type PracticeRouteStep = {
  node: QuestionNode;
  correct: ExerciseAnswer;
  state: RunnerState;
};

function firstSentence(label: string): string {
  const normalized = String(label || "").replace(/\s+/g, " ").trim();
  const match = normalized.match(/^(.+?[.!؟])(?:\s|$)/u);
  return (match?.[1] || normalized).trim();
}

export function practiceExpectedLabelForExample(
  label: string,
  example?: ExerciseExample,
): string {
  const localized = localQuizExpectedLabel(label, example as QuizExampleLike | undefined);
  return firstSentence(localized);
}

function contextualPracticeDistractors(correct: string): string[] {
  return buildI3rabDistractors(correct).slice(0, 2);
}

export function buildPracticeDirectOptions({
  example,
  state,
  practiceExpectedLabel,
}: PracticeFlowContext): string[] {
  if (!practiceExpectedLabel) return [];
  const distractors = contextualPracticeDistractors(practiceExpectedLabel);
  const options = [practiceExpectedLabel, ...distractors];
  const seed = String(example?.id || state.currentTarget || "practice");
  return options.sort((first, second) => {
    const score = (value: string) => Array.from(`${seed}-${value}`).reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % 17;
    return score(first) - score(second);
  });
}

export function walkCorrectPracticeRoute(
  context: Pick<PracticeFlowContext, "tree" | "mode" | "example">,
  onStep?: (step: PracticeRouteStep) => void,
): RunnerState {
  let nextState = buildRunnerState(context.tree, context.mode, context.example);
  let guard = 0;

  while (guard++ < 30) {
    const rawNode = context.tree.nodes[nextState.currentNodeId];
    if (!rawNode || rawNode.type === "result") break;

    const normalizedNode = normalizeThinkingNode(rawNode, nextState);
    if (!normalizedNode || normalizedNode.type !== "question" || !normalizedNode.answers) break;

    const questionNode: QuestionNode = {
      ...rawNode,
      ...normalizedNode,
      id: String(normalizedNode.id || rawNode.id),
      type: "question",
      text: String(normalizedNode.text || rawNode.text || ""),
      answers: normalizedNode.answers,
    };

    const correct = questionNode.answers.find(
      (answer) => !isHintAnswerOption(answer) && evaluateAnswer(answer, nextState.facts || {}),
    );
    if (!correct) break;

    onStep?.({ node: questionNode, correct, state: nextState });

    const activeTree: ExerciseTree = {
      ...context.tree,
      nodes: {
        ...context.tree.nodes,
        [String(nextState.currentNodeId)]: questionNode,
      },
    };
    const attempt = resolveAnswerAttempt({
      tree: activeTree,
      node: questionNode,
      state: nextState,
      answerId: correct.id,
    });
    if (attempt.kind !== "correct" || attempt.blocked) break;
    nextState = attempt.nextState;
  }

  return nextState;
}

export function buildPracticeSequenceSteps(context: PracticeFlowContext): string[] {
  const facts = context.example?.facts || context.state.facts || {};
  const target = String(context.state.currentTarget || context.example?.target || "الكلمة");
  const expected = context.practiceExpectedLabel.trim();
  const expectedSentence = expected.replace(/[.!؟]+$/u, "");
  const steps: string[] = [];
  const push = (text?: string | null) => {
    const value = String(text || "").trim();
    if (value && !steps.includes(value)) steps.push(value);
  };

  if (facts.wordKind === "verb" && facts.commandMeaning === "command") {
    push("الكلمة فعل: حدث مقترن بزمن.");
    push("وهي فعل أمر؛ لأنها طلب حصول الحدث.");

    if (facts.attached === "none") {
      push("لم يتصل بآخره شيء يؤثر في بنائه؛ لذلك نستثني البناء على حذف النون والبناء على الفتح.");
      if (facts.ending === "weak") {
        push("الكلمة معتلّة الآخر.");
        const weakMap: Record<string, string> = { alif: "الألف", waw: "الواو", ya: "الياء" };
        const weak = weakMap[String(facts.weakLetter || "")] || "حرف العلة";
        push(`حرف العلة المحذوف: ${weak}.`);
        if (facts.presentBase) {
          push(`ملاحظة: لاكتشاف الحرف الأخير نُسند الفعل إلى الضمير «هو»: هو ${String(facts.presentBase)}.`);
        }
        push(expectedSentence ? `إذن: ${expectedSentence}.` : "إذن: فعل أمر مبني على حذف حرف العلة.");
      } else {
        push("آخره صحيح، وليس معتلّ الآخر.");
        push(expectedSentence ? `إذن: ${expectedSentence}.` : "إذن: فعل أمر مبني على السكون.");
      }
    } else {
      const attachedMap: Record<string, string> = {
        waw: "واو الجماعة",
        alif2: "ألف الاثنين",
        yaa: "ياء المخاطبة",
        niswa: "نون النسوة",
        tawkid: "نون التوكيد",
      };
      const attached = attachedMap[String(facts.attached || "")] || "ضمير أو نون";
      push(`آخره اتصل بـ${attached}.`);
      if (["waw", "alif2", "yaa"].includes(String(facts.attached))) {
        if (facts.attached === "yaa") push("نرد الأمر إلى مضارعه مع المخاطبة: «أنتِ تكتبين». تظهر النون في المضارع، ثم نلاحظ حذفها في الأمر «اكتبي».");
        push("هذا الاتصال من مواضع بناء فعل الأمر على حذف النون.");
      } else if (facts.attached === "niswa") {
        push("نون النسوة لا تجعل فعل الأمر مبنيًا على حذف النون، بل يبنى معها على السكون.");
      } else if (facts.attached === "tawkid") {
        push("اتصاله بنون التوكيد يجعله مبنيًا على الفتح.");
      }
      push(expectedSentence ? `إذن: ${expectedSentence}.` : null);
    }
    return steps;
  }

  walkCorrectPracticeRoute(context, ({ node, correct, state }) => {
    const answerText = String(correct.text || "").trim();
    const teacherLine = teacherSuccessText(
      node,
      correct,
      state,
      normalizeBuildPiece(answerText, node.id),
    );
    const cleanedTeacherLine = cleanPracticeTeacherPart(teacherLine);
    if (cleanedTeacherLine && !cleanedTeacherLine.includes("نكمل خطوة التفكير التالية")) {
      push(cleanedTeacherLine);
    } else if (steps.length === 0) {
      push(`نبدأ من «${target}» فنحدد أن الإجابة المناسبة هي: ${answerText}.`);
    } else {
      push(`ثم نثبت أن الإجابة المناسبة هنا هي: ${answerText}.`);
    }
  });

  if (expectedSentence && !steps.some((step) => step.includes(expectedSentence))) {
    push(`إذن: ${expectedSentence}.`);
  }
  return steps;
}

export function buildPracticeCorrectRoute(context: PracticeFlowContext) {
  return {
    steps: buildPracticeSequenceSteps(context),
    nextState: walkCorrectPracticeRoute(context),
  };
}
