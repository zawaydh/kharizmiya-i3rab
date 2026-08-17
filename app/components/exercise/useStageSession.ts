"use client";

import React from "react";
import { getTopicProgress } from "../../../lib/db";
import type { ExerciseExample, ExerciseTree, Mode } from "../../../lib/exercise/model";
import {
  buildStageResultSubmission,
  type ProgressSubmission,
} from "../../../lib/progressEvents";
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

type StageSaveState = {
  percent: number;
  missingCoverage: boolean;
  saveFailed: boolean;
  saveError?: string;
};

export type StageAdvanceResult =
  | ({ status: "next"; nextIndex: number } & StageSaveState)
  | ({ status: "stage-complete" } & StageSaveState)
  | ({ status: "blocked" } & StageSaveState)
  | ({ status: "save-failed"; saveFailed: true } & StageSaveState);

type UseStageSessionArgs = {
  mode: Mode;
  tree: ExerciseTree;
  examples: ExerciseExample[];
  orderedKeys: string[];
  topicId?: string;
  level: number;
  onSaveProgress?: (submission: ProgressSubmission) => Promise<unknown> | unknown;
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
  const coveredRef = React.useRef(covered);
  const usedExampleIdsRef = React.useRef<string[]>([]);
  const savedResultKeysRef = React.useRef(new Set<string>());
  const saveInFlightRef = React.useRef(new Map<string, Promise<StageSaveState>>());
  const historyRef = React.useRef<number[]>([]);
  const historySessionKey = React.useMemo(
    () => [
      mode,
      topicId ?? "",
      String(level),
      orderedKeys.join("\u001f"),
      examples.map((example) => String(example.id)).join("\u001f"),
    ].join("\u001e"),
    [examples, level, mode, orderedKeys, topicId]
  );
  const [historyState, setHistoryState] = React.useState(() => ({
    key: historySessionKey,
    depth: 0,
  }));

  const updateCovered = React.useCallback((nextCovered: Record<string, boolean>) => {
    coveredRef.current = nextCovered;
    setCovered(nextCovered);
  }, []);

  React.useEffect(() => {
    let active = true;
    usedExampleIdsRef.current = [];
    savedResultKeysRef.current.clear();
    saveInFlightRef.current.clear();
    historyRef.current = [];

    async function loadProgress() {
      const empty = hydrateStageProgress(mode, orderedKeys, null);
      if (!topicId || !level || mode === "quiz") {
        if (!active) return;
        updateCovered(empty.covered);
        setExampleIndex(0);
        setLearnReady(false);
        setPracticeReady(false);
        return;
      }

      try {
        const row = await getTopicProgress(topicId, level) as TopicStageProgressRow | null;
        if (!active) return;
        const hydrated = hydrateStageProgress(mode, orderedKeys, row);
        updateCovered(hydrated.covered);
        setLearnReady(hydrated.learnReady);
        setPracticeReady(hydrated.practiceReady);
        setExampleIndex(pickNextExampleIndex(examples, orderedKeys, hydrated.covered, 0));
      } catch {
        if (!active) return;
        updateCovered(empty.covered);
        setExampleIndex(0);
        setLearnReady(false);
        setPracticeReady(false);
      }
    }

    void loadProgress();
    return () => {
      active = false;
    };
  }, [examples, level, mode, orderedKeys, topicId, updateCovered]);

  const metrics = React.useMemo(
    () => buildStageMetrics({ mode, covered, orderedKeys, learnReady, practiceReady }),
    [covered, learnReady, mode, orderedKeys, practiceReady]
  );

  const save = React.useCallback(async (
    example?: ExerciseExample | null,
    resultNodeId?: string | null,
  ) => {
    if (!topicId || !onSaveProgress || mode === "quiz") return;
    if (example?.id === undefined || !resultNodeId) return;
    const submission = buildStageResultSubmission({
      mode,
      topicId,
      level,
      exampleId: example.id,
      resultNodeId,
    });
    await onSaveProgress(submission);
  }, [level, mode, onSaveProgress, topicId]);

  const recordResult = React.useCallback((params: {
    currentIndex: number;
    example?: ExerciseExample | null;
    currentNodeId?: string | null;
  }): Promise<StageSaveState> => {
    const update = applyCurrentCoverage({
      tree,
      example: params.example,
      currentNodeId: params.currentNodeId,
      orderedKeys,
      covered: coveredRef.current,
    });
    updateCovered(update.covered);

    if (mode === "learn" && update.percent >= 100) setLearnReady(true);
    if (mode === "practice" && update.percent >= 100) setPracticeReady(true);

    const exampleId = params.example?.id;
    const resultNodeId = params.currentNodeId;
    if (exampleId === undefined || !resultNodeId || mode === "quiz") {
      return Promise.resolve({
        percent: update.percent,
        missingCoverage: !update.hasCoverageKey,
        saveFailed: false,
      });
    }

    const resultKey = `${mode}:${String(exampleId)}:${resultNodeId}`;
    if (savedResultKeysRef.current.has(resultKey)) {
      return Promise.resolve({
        percent: update.percent,
        missingCoverage: !update.hasCoverageKey,
        saveFailed: false,
      });
    }

    const pendingSave = saveInFlightRef.current.get(resultKey);
    if (pendingSave) return pendingSave;

    const savePromise = (async (): Promise<StageSaveState> => {
      try {
        await save(params.example, resultNodeId);
        savedResultKeysRef.current.add(resultKey);
        return {
          percent: update.percent,
          missingCoverage: !update.hasCoverageKey,
          saveFailed: false,
        };
      } catch (error) {
        return {
          percent: update.percent,
          missingCoverage: !update.hasCoverageKey,
          saveFailed: true,
          saveError: error instanceof Error ? error.message : "PROGRESS_SAVE_FAILED",
        };
      } finally {
        saveInFlightRef.current.delete(resultKey);
      }
    })();

    saveInFlightRef.current.set(resultKey, savePromise);
    return savePromise;
  }, [mode, orderedKeys, save, tree, updateCovered]);

  const advance = React.useCallback(async (params: {
    currentIndex: number;
    example?: ExerciseExample | null;
    currentNodeId?: string | null;
    forceComplete?: boolean;
  }): Promise<StageAdvanceResult> => {
    const forceComplete = Boolean(params.forceComplete);
    const saved = await recordResult(params);

    if (saved.saveFailed && forceComplete) {
      return {
        status: "save-failed",
        ...saved,
        saveFailed: true,
      };
    }

    const completed = forceComplete || saved.percent >= 100;
    if (mode === "learn" && completed) setLearnReady(true);
    if (mode === "practice" && completed) setPracticeReady(true);

    const nextUsedIds = addUsedExampleId(
      usedExampleIdsRef.current,
      params.example,
      params.currentIndex
    );
    usedExampleIdsRef.current = nextUsedIds;

    if (!forceComplete && saved.percent >= 100) {
      return { status: "stage-complete", ...saved };
    }

    if (forceComplete && saved.percent >= 100) {
      return { status: "stage-complete", ...saved };
    }

    const nextIndex = findNextStageExample({
      examples,
      currentIndex: params.currentIndex,
      covered: coveredRef.current,
      orderedKeys,
      usedIds: nextUsedIds,
      allowPreviouslyUsed: !forceComplete,
    });

    if (nextIndex === null) {
      return {
        status: forceComplete ? "stage-complete" : "blocked",
        ...saved,
      };
    }

    if (nextIndex !== params.currentIndex) {
      historyRef.current.push(params.currentIndex);
      setHistoryState({ key: historySessionKey, depth: historyRef.current.length });
    }
    setExampleIndex(nextIndex);
    return {
      status: "next",
      nextIndex,
      ...saved,
    };
  }, [examples, historySessionKey, mode, orderedKeys, recordResult]);

  const previous = React.useCallback(() => {
    const previousIndex = historyRef.current.pop();
    if (previousIndex === undefined) return null;
    setHistoryState({ key: historySessionKey, depth: historyRef.current.length });
    setExampleIndex(previousIndex);
    return previousIndex;
  }, [historySessionKey]);

  const reset = React.useCallback(() => {
    updateCovered(buildEmptyCovered(orderedKeys));
    setExampleIndex(0);
    setLearnReady(false);
    setPracticeReady(false);
    usedExampleIdsRef.current = [];
    savedResultKeysRef.current.clear();
    saveInFlightRef.current.clear();
    historyRef.current = [];
    setHistoryState({ key: historySessionKey, depth: 0 });
  }, [historySessionKey, orderedKeys, updateCovered]);

  return {
    covered,
    exampleIndex,
    learnReady,
    practiceReady,
    metrics,
    recordResult,
    advance,
    previous,
    canPrevious: historyState.key === historySessionKey && historyState.depth > 0,
    reset,
  };
}
