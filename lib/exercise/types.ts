import type { ExerciseState } from "./state";

export type Action =
  | { type: "flag.set"; key: string }
  | { type: "flag.unset"; key: string };

export type EvalRule = { fact: string; equals: any };

export type AnswerOption = {
  id: string;
  text: string;
  next: string;
  correct?: boolean;
  eval?: EvalRule;
  hint?: string;
  actions?: Action[];
};

export type Node =
  | {
      id: string;
      type: "question";
      text: string;
      hint?: string;
      answers: AnswerOption[];
      requires?: string[];
    }
  | {
      id: string;
      type: "result";
      text: string;
      hint?: string;
      requires?: string[];
    };

export type ExerciseTree = {
  startNodeId: string;
  nodes: Record<string, Node>;
};

export type ChooseAnswerParams = {
  state: ExerciseState;
  tree: ExerciseTree;
  answerId: string;
};
