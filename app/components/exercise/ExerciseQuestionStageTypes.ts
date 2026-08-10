import type { RunnerState } from "../../../lib/exercise/runner";

export type DialogueBubble = {
  tone: "success" | "hint" | "celebrate";
  text: string;
};

export type DroppedChoice = {
  text: string;
  tone: "idle" | "ok";
};

export type PracticeWrongPanel = {
  wrongLabel: string;
  steps: string[];
  nextState: RunnerState;
};
