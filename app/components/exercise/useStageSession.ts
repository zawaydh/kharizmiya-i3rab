"use client";

import React from "react";
import { getTopicProgress } from "../../../lib/db";
import type { ExerciseExample, ExerciseTree, Mode } from "../../../lib/exercise/model";
import {
  buildStageProgressPayload,
  type ProgressSavePayload,
} from "../../../lib/exercise/persistence";
import { buildEmptyCovered } from "../../../lib/exercise/progress";
import { pickNextExampleIndex } from "../../../lib/exercise/runner";
import {
  addUsedExampleId,
  applyCurrentCoverage,
  buildStageMetrics,
  findNextStageExample,
  hydrateStageProgress,
  type TopicStageProgressRow,
} from "../../../lib/exercise/stageSession";

export type StageAdvanceResult =
  | { status: "next"; nextIndex: number; percent: number; missingCoverage: boolean; saveFailed: boolean }
  | { status: "stage-complete"; percent: number; missingCoverage: boolean; saveFailed: boolean }
  | { status: "blocked"; percent: number; missingCoverage: boolean; saveFailed: boolean }
  | { status: "save-failed"; percent: number; missingCoverage: boolean; saveFailed: true };

type UseStageSessionArgs = {
  mode: Mode;
  tree: ExerciseTree;
  examples: ExerciseExample[];
  orderedKeys: string[];
  topicId?: string;
  level: number;
  onSaveProgress?: (payload: ProgressSavePayload) => Promise<unknown> | unknown;
};

export function useStageSession({
  mode,
  tree,
  examples,
  orderedKeys,
  topicId,
  level,
  onSaveProgress,
}: UseStageSessionArgs) {
  const [covered, setCovered] = React.useState(() => buildEmptyCovered(orderedKeys));
  const [exampleIndex, setExampleIndex] = React.useState(0);
  const [learnReady, setLearnReady] = React.useState(false);
  const [practiceReady, setPracticeReady] = React.useState(false);
  const usedExampleIdsRef = React.useRef<string[]>([]);

  React.useEffect(() => {
    let active = true;
    usedExampleIdsRef.current = [];

    async function loadProgress() {
      const empty = hydrateStageProgress(mode, orderedKeys, null);
      if (!topicId || !level || mode === "quiz") {
        if (!active) return;
        setCovered(empty.covered);
        setExampleIndex(0);
        setLearnReady(false);
        setPracticeReady(false);
        return;
      }

      try {
        const row = await getTopicProgress(topicId, level) as TopicStageProgressRow | null;
        if (!active) return;
        const hydrated = hydrateStageProgress(mode, orderedKeys, row);
        setCovered(hydrated.covered);
        setLearnReady(hydrated.learnReady);
        setPracticeReady(hydrated.practiceReady);
        setExampleIndex(pickNextExampleIndex(examples, orderedKeys, hydrated.covered, 0));
      } catch {
        if (!active) return;
        setCovered(empty.covered);
        setExampleIndex(0);
        setLearnReady(false);
        setPracticeReady(false);
      }
    }

    void loadProgress();
    return () => {
      active = false;
    };
  }, [examples, level, mode, orderedKeys, topicId]);

  const metrics = React.useMemo(
    () => buildStageMetrics({ mode, covered, orderedKeys, learnReady, practiceReady }),
    [covered, learnReady, mode, orderedKeys, practiceReady]
  );

  const save = React.useCallback(async (
    nextCovered: Record<string, boolean>,
    forceComplete: boolean
  ) => {
    if (!topicId || !onSaveProgress || mode === "quiz") return;
    const payload = buildStageProgressPayload({
      mode,
      topicId,
      level,
      covered: nextCovered,
      coverageKeys: orderedKeys,
      extra: {
        learn_completed: mode === "learn" ? (forceComplete ? true : undefined) : undefined,
        practice_completed: mode === "practice" ? (forceComplete ? true : undefined) : undefined,
      },
    });
    await onSaveProgress(payload);
  }, [level, mode, onSaveProgress, orderedKeys, topicId]);

  const advance = React.useCallback(async (params: {
    currentIndex: number;
    example?: ExerciseExample | null;
    currentNodeId?: string | null;
    forceComplete?: boolean;
  }): Promise<StageAdvanceResult> => {
    const forceComplete = Boolean(params.forceComplete);
    const update = applyCurrentCoverage({
      tree,
      example: params.example,
      currentNodeId: params.currentNodeId,
      orderedKeys,
      covered,
    });
    setCovered(update.covered);

    let saveFailed = false;
    try {
      await save(update.covered, forceComplete);
    } catch {
      saveFailed = true;
      if (forceComplete) {
        return {
          status: "save-failed",
          percent: update.percent,
          missingCoverage: !update.hasCoverageKey,
          saveFailed: true,
        };
      }
    }

    const completed = forceComplete || update.percent >= 100;
    if (mode === "learn" && completed) setLearnReady(true);
    if (mode === "practice" && completed) setPracticeReady(true);

    const nextUsedIds = addUsedExampleId(
      usedExampleIdsRef.current,
      params.example,
      params.currentIndex
    );
    usedExampleIdsRef.current = nextUsedIds;

    if (!forceComplete && update.percent >= 100) {
      return {
        status: "stage-complete",
        percent: update.percent,
        missingCoverage: !update.hasCoverageKey,
        saveFailed,
      };
    }

    if (forceComplete && update.percent >= 100) {
      return {
        status: "stage-complete",
        percent: update.percent,
        missingCoverage: !update.hasCoverageKey,
        saveFailed,
      };
    }

    const nextIndex = findNextStageExample({
      examples,
      currentIndex: params.currentIndex,
      covered: update.covered,
      orderedKeys,
      usedIds: nextUsedIds,
      allowPreviouslyUsed: !forceComplete,
    });

    if (nextIndex === null) {
      return {
        status: forceComplete ? "stage-complete" : "blocked",
        percent: update.percent,
        missingCoverage: !update.hasCoverageKey,
        saveFailed,
      };
    }

    setExampleIndex(nextIndex);
    return {
      status: "next",
      nextIndex,
      percent: update.percent,
      missingCoverage: !update.hasCoverageKey,
      saveFailed,
    };
  }, [covered, examples, mode, orderedKeys, save, tree]);

  const reset = React.useCallback(() => {
    setCovered(buildEmptyCovered(orderedKeys));
    setExampleIndex(0);
    setLearnReady(false);
    setPracticeReady(false);
    usedExampleIdsRef.current = [];
  }, [orderedKeys]);

  return {
    covered,
    exampleIndex,
    learnReady,
    practiceReady,
    metrics,
    advance,
    reset,
  };
}
