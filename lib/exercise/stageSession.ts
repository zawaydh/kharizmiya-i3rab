import type { ExerciseExample, ExerciseTree, Mode } from "./model";
import {
  buildEmptyCovered,
  calcPercent,
  getExampleCoverageKeys,
  resolveCoverageKeys,
  type CoveredMap,
} from "./progress";

export type TopicStageProgressRow = {
  coverage?: unknown;
  practice_coverage?: unknown;
  learn_completed?: unknown;
  practice_completed?: unknown;
};

export type HydratedStageProgress = {
  covered: CoveredMap;
  learnReady: boolean;
  practiceReady: boolean;
};

export type StageMetrics = {
  totalCount: number;
  doneCount: number;
  percent: number;
  isDone: boolean;
  nextStageReady: boolean;
  nextCoverageKey: string;
};

export type CoverageUpdate = {
  covered: CoveredMap;
  newlyCoveredKeys: string[];
  hasCoverageKey: boolean;
  percent: number;
};

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export function hydrateStageProgress(
  mode: Mode,
  orderedKeys: string[],
  row?: TopicStageProgressRow | null
): HydratedStageProgress {
  const covered = buildEmptyCovered(orderedKeys);
  const savedKeys = mode === "learn"
    ? stringArray(row?.coverage)
    : mode === "practice"
      ? stringArray(row?.practice_coverage)
      : [];

  for (const key of savedKeys) {
    if (Object.prototype.hasOwnProperty.call(covered, key)) covered[key] = true;
  }

  return {
    covered,
    learnReady: Boolean(row?.learn_completed),
    practiceReady: Boolean(row?.practice_completed),
  };
}

export function buildStageMetrics(params: {
  mode: Mode;
  covered: CoveredMap;
  orderedKeys: string[];
  learnReady: boolean;
  practiceReady: boolean;
}): StageMetrics {
  const { mode, covered, orderedKeys, learnReady, practiceReady } = params;
  const totalCount = orderedKeys.length;
  const doneCount = Math.min(
    orderedKeys.filter((key) => Boolean(covered[key])).length,
    totalCount
  );
  const percent = calcPercent(covered, orderedKeys);
  const isDone = percent >= 100;
  const nextStageReady = mode === "learn"
    ? learnReady || isDone
    : mode === "practice"
      ? practiceReady || isDone
      : false;

  return {
    totalCount,
    doneCount,
    percent,
    isDone,
    nextStageReady,
    nextCoverageKey: orderedKeys.find((key) => !covered[key]) || "مكتمل",
  };
}

export function applyCurrentCoverage(params: {
  tree: ExerciseTree;
  example?: ExerciseExample | null;
  currentNodeId?: string | null;
  orderedKeys: string[];
  covered: CoveredMap;
}): CoverageUpdate {
  const { tree, example, currentNodeId, orderedKeys, covered } = params;
  const nextCovered = { ...covered };
  const newlyCoveredKeys = resolveCoverageKeys({
    tree,
    example,
    currentNodeId,
    requiredKeys: orderedKeys,
  });

  for (const key of newlyCoveredKeys) nextCovered[key] = true;

  return {
    covered: nextCovered,
    newlyCoveredKeys,
    hasCoverageKey: newlyCoveredKeys.length > 0,
    percent: calcPercent(nextCovered, orderedKeys),
  };
}

export function addUsedExampleId(
  usedIds: ReadonlyArray<string>,
  example?: ExerciseExample | null,
  currentIndex = 0
): string[] {
  const id = String(example?.id ?? currentIndex);
  return Array.from(new Set([...usedIds, id]));
}

export function findNextStageExample(params: {
  examples: ExerciseExample[];
  currentIndex: number;
  covered: CoveredMap;
  orderedKeys: string[];
  usedIds: ReadonlyArray<string>;
  allowPreviouslyUsed: boolean;
}): number | null {
  const {
    examples,
    currentIndex,
    covered,
    orderedKeys,
    usedIds,
    allowPreviouslyUsed,
  } = params;
  const uncoveredKeys = orderedKeys.filter((key) => !covered[key]);
  const used = new Set(usedIds);
  const indexed = examples.map((example, index) => ({
    index,
    id: String(example?.id ?? index),
    keys: getExampleCoverageKeys(example),
  }));

  const unseen = indexed.filter(
    (item) => item.index !== currentIndex && !used.has(item.id)
  );
  if (unseen.length > 0) {
    const coverageCandidate = unseen.find(
      (item) => uncoveredKeys.length === 0 || item.keys.some((key) => uncoveredKeys.includes(key))
    );
    return (coverageCandidate || unseen[0])?.index ?? null;
  }

  if (!allowPreviouslyUsed) return null;
  const fallback = indexed.find(
    (item) =>
      item.index !== currentIndex &&
      item.keys.some((key) => uncoveredKeys.includes(key))
  );
  return fallback?.index ?? null;
}
