import type { RunnerState } from "../../../lib/exercise/runner";

export type DialogueBubble = {
  tone: "success" | "hint" | "celebrate";
  text: string;
  hintLevel?: 1 | 2;
};

export type DroppedChoice = {
  text: string;
  tone: "idle" | "ok";
};

export type PracticeWrongPanel = {
  steps: string[];
  nextState: RunnerState;
};
