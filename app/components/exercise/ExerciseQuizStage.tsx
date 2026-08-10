"use client";

import type { QuizExampleLike } from "../../../lib/exercise/quiz";
import { enrichQuizPrompt } from "../../../lib/exercise/quiz";
import { renderSentence } from "./ExerciseTextViews";
import { withoutRepeatedChoiceInstruction } from "./ExercisePedagogy";
import {
  QuizQuestionView,
  QuizSummaryView,
  RemedialTrainingView,
} from "./QuizExperienceViews";
import type { useQuizSession } from "./useQuizSession";

type QuizSession = ReturnType<typeof useQuizSession>;

type Props = {
  session: QuizSession;
  topicId?: string;
  level: number;
  onFinalize: () => Promise<void>;
  onPrevious: () => void;
  onRestart: () => void;
  onStartRemedial: () => void;
  onNextRemedial: () => void;
};

export function ExerciseQuizStage({
  session,
  topicId,
  level,
  onFinalize,
  onPrevious,
  onRestart,
  onStartRemedial,
  onNextRemedial,
}: Props) {
  if (session.remedialActive) {
    return (
      <RemedialTrainingView
        example={session.remedialExample}
        options={session.remedialOptions}
        cursor={session.remedialCursor}
        total={session.remedialQueue.length}
        selected={session.remedialSelected}
        checked={session.remedialChecked}
        expectedLabel={session.remedialExpectedLabel}
        isCheckedCorrect={session.remedialIsCheckedCorrect}
        renderSentence={renderSentence}
        onBack={session.closeRemedial}
        onSelect={session.setRemedialSelected}
        onRetry={session.retryRemedial}
        onNext={onNextRemedial}
      />
    );
  }

  if (session.finished) {
    return (
      <QuizSummaryView
        score={session.summary.score}
        percent={session.summary.percent}
        answers={session.summary.answeredRows}
        canDownloadCertificate={session.canDownloadCertificate}
        canStartRemedial={session.canStartRemedial}
        certificateHref={`/certificate?topicId=${topicId}&level=${level}`}
        textsHref={`/texts/${topicId}`}
        renderSentence={renderSentence}
        onStartRemedial={onStartRemedial}
        onRestart={onRestart}
      />
    );
  }

  const example = session.example as QuizExampleLike | undefined;
  return (
    <QuizQuestionView
      cursor={session.cursor}
      total={session.order.length}
      example={example}
      prompt={withoutRepeatedChoiceInstruction(enrichQuizPrompt(example?.prompt))}
      options={session.options}
      selected={session.selected}
      renderSentence={renderSentence}
      onSelect={session.setSelected}
      onPrevious={onPrevious}
      onRestart={onRestart}
      onNext={onFinalize}
    />
  );
}
