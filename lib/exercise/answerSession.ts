import { chooseAnswer, evaluateAnswer } from "./engine";
import type {
  ExerciseAnswer,
  ExerciseTree,
  Facts,
  QuestionNode,
} from "./model";
import type { RunnerState } from "./runner";

export type AnswerFeedbackState = {
  wrongId?: string;
  hint?: string;
};

export type AnswerAttempt =
  | { kind: "missing" }
  | { kind: "help"; picked: ExerciseAnswer }
  | {
      kind: "wrong";
      picked: ExerciseAnswer;
      correctAnswer?: ExerciseAnswer;
    }
  | {
      kind: "correct";
      picked: ExerciseAnswer;
      correctAnswer?: ExerciseAnswer;
      nextState: RunnerState;
      nextNodeId: string;
      blocked: boolean;
    };

export function isHintAnswerOption(answer: unknown): boolean {
  const candidate = answer as Partial<ExerciseAnswer> & { isHelp?: boolean } | null;
  const text = String(candidate?.text || "").trim();
  return Boolean(
    candidate?.isHelp ||
      candidate?.id === "__help" ||
      candidate?.id === "help" ||
      text === "لا أعلم" ||
      text.includes("أحتاج تلميح") ||
      text.includes("احتاج تلميح")
  );
}

export function findCorrectAnswer(
  node: QuestionNode,
  facts: Facts
): ExerciseAnswer | undefined {
  return node.answers.find((answer) => evaluateAnswer(answer, facts));
}

export function resolveAnswerAttempt(params: {
  tree: ExerciseTree;
  node: QuestionNode;
  state: RunnerState;
  answerId: string;
}): AnswerAttempt {
  const { tree, node, state, answerId } = params;
  const picked = node.answers.find((answer) => answer.id === answerId);
  if (!picked) return { kind: "missing" };
  if (isHintAnswerOption(picked)) return { kind: "help", picked };

  const correctAnswer = findCorrectAnswer(node, state.facts);
  if (!evaluateAnswer(picked, state.facts)) {
    return { kind: "wrong", picked, correctAnswer };
  }

  const transition = chooseAnswer({ state, tree, answerId });
  return {
    kind: "correct",
    picked,
    correctAnswer,
    nextState: transition.nextState as RunnerState,
    nextNodeId: transition.nextState.currentNodeId,
    blocked: Boolean(transition.blocked),
  };
}

export function buildWrongFeedback(params: {
  answerId: string;
  hint?: string;
}): AnswerFeedbackState {
  const { answerId, hint } = params;
  return { wrongId: answerId, hint };
}

export function deterministicPraise(params: {
  mode: "learn" | "practice";
  nodeId?: string;
  answerId?: string;
  target?: string;
}): string {
  const learnPhrases = [
    "أحسنت، خطوة ثابتة.",
    "ممتاز، واصل بنفس التركيز.",
    "اختيار موفق، نكمل.",
    "رائع، اقتربنا من الإعراب.",
    "تمام، بنيت خطوة صحيحة.",
    "جميل، هذا تفكير نحوي دقيق.",
    "صحيح، ننتقل للخطوة التالية.",
    "أداء جميل، استمر.",
    "إجابة دقيقة، نثبتها في المسار.",
    "ممتاز جدًا، خطوة أقرب للنتيجة.",
  ];
  const practicePhrases = [
    "نجمة جديدة ✓ اختيار موفق.",
    "أحسنت، اقتربت من الكأس.",
    "رائع، ثبّت مهارة جديدة.",
    "ممتاز، التحدي يسير بقوة.",
    "إجابة دقيقة، نربح خطوة في التحدي.",
    "جميل، فهمك صار أوضح.",
    "أداء قوي، أكمل الجولة.",
    "أحسنت، هذه نقطة إتقان.",
    "اختيار ذكي، نكمل التحدي.",
    "ممتاز جدًا، نجمة في المسار.",
  ];
  const phrases = params.mode === "practice" ? practicePhrases : learnPhrases;
  const key = `${params.nodeId || ""}:${params.answerId || ""}:${params.target || ""}`;
  let hash = 0;
  for (let index = 0; index < key.length; index += 1) {
    hash = (hash * 31 + key.charCodeAt(index)) >>> 0;
  }
  return phrases[hash % phrases.length] ?? phrases[0] ?? "أحسنت.";
}
