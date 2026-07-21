import type { Facts, Flags, Mode } from "./model";

export type ExerciseState = {
  mode: Mode;
  level: number;
  currentNodeId: string;
  answers: Record<string, string>;
  attemptCount: Record<string, number>;
  flags: Flags;
  correctNodeIds: Record<string, boolean>;
  facts: Facts;
  currentExampleId?: string | number;
  currentSentence?: string;
  currentTarget?: string;
};

export function createInitialState(params: {
  mode: Mode;
  level: number;
  startNodeId: string;
}): ExerciseState {
  return {
    mode: params.mode,
    level: params.level,
    currentNodeId: params.startNodeId,
    answers: {},
    attemptCount: {},
    flags: {},
    correctNodeIds: {},
    facts: {},
  };
}
