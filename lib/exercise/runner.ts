import { createInitialState, type ExerciseState } from "./state";
import type { ExerciseExample, ExerciseTree, Mode } from "./model";
import { getExampleCoverageKeys, type CoveredMap } from "./progress";

export type RunnerState = ExerciseState & {
  currentExampleId?: string | number;
  currentSentence?: string;
  currentTarget?: string;
};

export function pickNextExampleIndex(
  examples: ExerciseExample[],
  orderedKeys: string[],
  covered: CoveredMap,
  currentIndex: number,
  random: () => number = Math.random
): number {
  const uncoveredKeys = orderedKeys.filter((key) => !covered[key]);
  if (!examples.length) return currentIndex;
  if (!uncoveredKeys.length) {
    return examples.length > 1 ? (currentIndex + 1) % examples.length : currentIndex;
  }

  const candidates = examples
    .map((example, index) => ({
      index,
      keys: getExampleCoverageKeys(example),
    }))
    .filter(
      (item) =>
        item.index !== currentIndex &&
        item.keys.some((key) => uncoveredKeys.includes(key))
    );

  if (!candidates.length) {
    return examples.length > 1 ? (currentIndex + 1) % examples.length : currentIndex;
  }

  const selected = candidates[Math.floor(random() * candidates.length)];
  return selected?.index ?? currentIndex;
}

export function buildRunnerState(
  tree: ExerciseTree,
  mode: Mode,
  example?: ExerciseExample
): RunnerState {
  const configuredStart = mode === "practice"
    ? tree.practiceStartNodeId || tree.startNodeId
    : tree.learnStartNodeId || tree.startNodeId;
  const startNodeId = configuredStart;
  const base = createInitialState({
    mode: mode === "practice" ? "practice" : "learn",
    level: 2,
    startNodeId,
  });

  return {
    ...base,
    currentExampleId: example?.id,
    currentSentence: example?.sentence,
    currentTarget: example?.target,
    facts: example?.facts || {},
    currentNodeId: startNodeId,
  };
}
