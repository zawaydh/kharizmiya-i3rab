import type { Dispatch, MouseEvent, SetStateAction } from "react";
import { evaluateAnswer } from "../../../lib/exercise/engine";
import type {
  ExerciseAnswer,
  ExerciseNode,
  ExerciseTree,
  Mode,
  QuestionNode,
} from "../../../lib/exercise/model";
import type { RunnerState } from "../../../lib/exercise/runner";
import {
  buildWrongFeedback,
  deterministicPraise,
  isHintAnswerOption,
  resolveAnswerAttempt,
} from "../../../lib/exercise/answerSession";
import { diagnosticFeedbackForChoice } from "../../../lib/exercise/diagnosticFeedback";
import { diagnosticHintText, firstLevelHintText } from "../../../lib/hintText";
import {
  answerEffectLabel,
  builtNounTypeHintByValue,
  normalizeBuildPiece,
  nonRevealingWrongChoiceHint,
  studentHintText,
} from "./ExercisePedagogy";
import { buildPracticeDirectHint } from "./ExercisePracticeFlow";
import type { PedagogyNode } from "./ExercisePedagogyTypes";
import type { QuestionCardPhase } from "./useQuestionMotion";
import type { ExerciseUiState } from "./useExerciseUiState";


const LEARN_RETURN_TO_QUESTION_CUE =
  "عد إلى السؤال ثم اختر الإجابة الصحيحة لنكمل الإعراب.";

const PRACTICE_RETURN_TO_QUESTION_CUE =
  "عد إلى السؤال ثم اختر الإجابة الصحيحة.";

function withReturnToQuestionCue(
  text: string,
  isPracticeMode = false,
) {
  const cleaned = String(text || "")
    .replace(
      /\s+(?:عد إلى السؤال|عد للسؤال|عد واختر)[\s\S]*$/u,
      "",
    )
    .trim();

  const cue = isPracticeMode
    ? PRACTICE_RETURN_TO_QUESTION_CUE
    : LEARN_RETURN_TO_QUESTION_CUE;

  return `${cleaned}\n\n${cue}`;
}

type Args = {
  ui: ExerciseUiState;
  topicId?: string;
  node?: ExerciseNode;
  thinkingNode?: PedagogyNode | null;
  mode: Mode;
  tree: ExerciseTree;
  state: RunnerState;
  setState: Dispatch<SetStateAction<RunnerState>>;
  cardPhase: QuestionCardPhase;
  setCardPhase: Dispatch<SetStateAction<QuestionCardPhase>>;
  beginQuestionTransition: (commit: () => void, onDone?: () => void) => void;
  lockQuestionMotionHeight: () => void;
  questionExitDurationMs: number;
};

export function createExerciseQuestionActions({
  ui,
  topicId,
  node,
  thinkingNode,
  mode,
  tree,
  state,
  setState,
  cardPhase,
  setCardPhase,
  beginQuestionTransition,
  lockQuestionMotionHeight,
  questionExitDurationMs,
}: Args) {
  const isPracticeMode = mode === "practice";
  const currentHintAnswer = node?.type === "question"
    ? thinkingNode?.answers?.find((answer) => isHintAnswerOption(answer))
    : null;

  function handlePick(answerId: string) {
    if (
      !node ||
      node.type !== "question" ||
      mode === "quiz" ||
      cardPhase !== "idle" ||
      ui.answerAdvanceLockRef.current
    ) return;

    const activeNode = (thinkingNode || node) as QuestionNode;
    const activeTree = {
      ...tree,
      nodes: { ...tree.nodes, [String(state.currentNodeId)]: activeNode },
    } as ExerciseTree;
    const attempt = resolveAnswerAttempt({
      tree: activeTree,
      node: activeNode,
      state,
      answerId,
    });
    if (attempt.kind === "missing") return;

    if (attempt.kind === "help") {
      if (isPracticeMode) {
        const hint = buildPracticeDirectHint(
          {
            tree,
            mode,
            state,
            topicId,
          },
          1,
        );

        ui.setDialogBubble({
          tone: "hint",
          text: hint,
          hintLevel: 1,
        });
        ui.setDroppedChoice(null);
        return;
      }

      const rawHint =
        studentHintText(activeNode, undefined, state) ||
        activeNode.hint ||
        "فكر في السؤال الحالي فقط.";

      const smartHint = firstLevelHintText(
        activeNode.id,
        String(rawHint),
        state.currentTarget,
        activeNode.text,
      );

      ui.setDialogBubble({
        tone: "hint",
        text: withReturnToQuestionCue(String(smartHint)),
      });
      ui.setDroppedChoice(null);
      return;
    }

    const picked = attempt.picked;
    if (attempt.kind === "wrong") {
      const isBuiltTypeNode = String(node.id).includes("built_type") || String(node.id).includes("mabniType");
      const expectedBuiltType = state.facts?.mabniType;
      const targetedDiagnostic = diagnosticFeedbackForChoice({
        nodeId: thinkingNode?.id,
        pickedText: picked.text,
        facts: state.facts,
        target: state.currentTarget,
        sentence: state.currentSentence,
      });
      const smartHint = isBuiltTypeNode
        ? builtNounTypeHintByValue(typeof expectedBuiltType === "string" ? expectedBuiltType : undefined)
        : targetedDiagnostic || studentHintText(thinkingNode, picked, state);
      const safeHint = nonRevealingWrongChoiceHint(
        activeNode,
        picked,
        state,
        String(smartHint || "اربط اختيارك بالقرينة الظاهرة في المثال وبما ثبت في الخطوة السابقة."),
      );
      const cleanedHint = diagnosticHintText(safeHint, state.currentTarget);
      const visibleHint = cleanedHint;
      ui.setDialogBubble({ tone: "hint", text: withReturnToQuestionCue(String(visibleHint)) });
      ui.setDroppedChoice(null);
      ui.setFeedback(buildWrongFeedback({
        answerId,
        hint: safeHint,
      }));
      return;
    }

    if (attempt.blocked) {
      ui.setToast("تعذر الانتقال إلى الخطوة التالية في هذا المسار");
      return;
    }

    ui.answerAdvanceLockRef.current = true;
    const piece = normalizeBuildPiece(picked.text || "", node.id);
    const effectLabel = answerEffectLabel(thinkingNode, picked, state);
    const resultText = effectLabel || piece || String(picked.text || "صحيح");
    const nextNode = tree.nodes[attempt.nextNodeId];

    ui.setSuccessNudge(deterministicPraise({
      mode: isPracticeMode ? "practice" : "learn",
      nodeId: thinkingNode?.id,
      answerId: picked.id,
      target: state.currentTarget,
    }));
    ui.setDialogBubble(null);
    ui.setDroppedChoice((previous) => previous
      ? { text: previous.text || resultText, tone: "ok" }
      : { text: resultText, tone: "ok" });
    setCardPhase("success");
    ui.setFeedback(null);

    const successHold = nextNode?.type === "result" ? 260 : 220;
    ui.scheduleCorrectAdvance(() => {
      if (nextNode?.type === "question") {
        beginQuestionTransition(() => {
          setState(attempt.nextState);
          ui.setDroppedChoice(null);
          ui.setDialogBubble(null);
        }, () => {
          ui.answerAdvanceLockRef.current = false;
        });
        return;
      }

      lockQuestionMotionHeight();
      setCardPhase("leaving");
      window.setTimeout(() => {
        setState(attempt.nextState);
        ui.setDroppedChoice(null);
        ui.setDialogBubble(null);
        setCardPhase("idle");
        ui.bringWorkAreaIntoView("center", 60);
        ui.answerAdvanceLockRef.current = false;
      }, questionExitDurationMs);
    }, successHold);
  }

  function handleLearnDrop(answerId: string, label: string) {
    if (mode !== "learn") return;
    const picked = thinkingNode?.answers?.find((answer) => answer.id === answerId);
    const effect = answerEffectLabel(thinkingNode, picked, state) || label || "الإجابة المختارة";
    ui.setDroppedChoice({ text: effect, tone: "idle" });
    handlePick(answerId);
  }

  function openCurrentHint() {
    if (!node || node.type !== "question" || cardPhase !== "idle") return;

    if (isPracticeMode) {
      const nextLevel: 1 | 2 =
        ui.dialogBubble?.tone === "hint" &&
        ui.dialogBubble.hintLevel === 1
          ? 2
          : 1;

      const hint = buildPracticeDirectHint(
        {
          tree,
          mode,
          state,
          topicId,
        },
        nextLevel,
      );

      ui.setDialogBubble({
        tone: "hint",
        text:
          nextLevel === 2
            ? withReturnToQuestionCue(hint, true)
            : hint,
        hintLevel: nextLevel,
      });
      ui.setDroppedChoice(null);
      ui.bringWorkAreaIntoView("soft", 40);
      return;
    }

    const rawHint = String(
      currentHintAnswer?.hint ||
      studentHintText(thinkingNode, undefined, state) ||
      thinkingNode?.hint ||
      "فكر في السؤال الحالي فقط."
    ).trim();

    const smartHint = firstLevelHintText(
      thinkingNode?.id,
      rawHint,
      state.currentTarget,
      thinkingNode?.text,
    );

    ui.setDialogBubble({
      tone: "hint",
      text: withReturnToQuestionCue(String(smartHint)),
    });
    ui.setDroppedChoice(null);
    ui.bringWorkAreaIntoView("soft", 40);
  }

  function pickAnswer(answer: ExerciseAnswer, event: MouseEvent<HTMLButtonElement>) {
    if (evaluateAnswer(answer, state.facts || {})) {
      const id = Date.now();
      ui.setClickCheck({ x: event.clientX, y: event.clientY, id });
      window.setTimeout(() => {
        ui.setClickCheck((current) => current?.id === id ? null : current);
      }, 760);
    }
    if (mode === "learn") {
      ui.setDroppedChoice({
        text: answerEffectLabel(thinkingNode, answer, state),
        tone: "idle",
      });
    }
    handlePick(answer.id);
  }

  return {
    handleLearnDrop,
    openCurrentHint,
    pickAnswer,
  };
}
