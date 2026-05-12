export type Mode = "learn" | "practice" | "quiz";

export type ExerciseState = {
  mode: Mode;
  level: number;
  currentNodeId: string;
  answers: Record<string, string>;
  attemptCount: Record<string, number>;
  flags: Record<string, boolean>;
  correctNodeIds: Record<string, boolean>;
  facts?: Record<string, any>;
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
