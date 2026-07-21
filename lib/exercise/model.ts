export type Mode = "learn" | "practice" | "quiz";

export type FactValue = unknown;
export type Facts = Record<string, FactValue>;
export type Flags = Record<string, boolean>;

export type ExerciseAction =
  | { type: "flag.set"; key: string }
  | { type: "flag.unset"; key: string };

export type AnswerEvaluation = {
  fact: string;
  equals?: FactValue;
  anyOf?: FactValue[];
  notEquals?: FactValue;
};

export type AnswerNextByFact = {
  fact: string;
  map: Record<string, string>;
  default?: string;
};

export type ExerciseAnswer = {
  id: string;
  text: string;
  next: string;
  nextByFact?: AnswerNextByFact;
  correct?: boolean;
  eval?: AnswerEvaluation;
  hint?: string;
  feedback?: string;
  actions?: ExerciseAction[];
  [key: string]: unknown;
};

export type QuestionNode = {
  id: string;
  type: "question";
  text: string;
  hint?: string;
  answers: ExerciseAnswer[];
  requires?: string[];
  [key: string]: unknown;
};

export type ResultNode = {
  id: string;
  type: "result";
  text: string;
  coverage?: string;
  requires?: string[];
  [key: string]: unknown;
};

export type ExerciseNode = QuestionNode | ResultNode;

export type ExerciseTree = {
  startNodeId: string;
  nodes: Record<string, ExerciseNode>;
  [key: string]: unknown;
};

export type ExerciseExample = {
  id?: string | number;
  sentence?: string;
  target?: string;
  covers?: string[];
  facts?: Facts & {
    hasKaffa?: boolean;
    finalI3rab?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};
