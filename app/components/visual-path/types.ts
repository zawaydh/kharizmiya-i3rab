export type TreeAnswer = {
  id: string;
  text: string;
  next: string;
  nextByFact?: { fact: string; map: Record<string, string>; default?: string };
  correct?: boolean;
  eval?: { fact: string; equals?: unknown; anyOf?: unknown[]; notEquals?: unknown };
  hint?: string;
};

export type TreeNode = {
  id: string;
  type: string;
  text: string;
  hint?: string;
  answers?: TreeAnswer[];
};

export type ExerciseTree = {
  startNodeId: string;
  nodes: Record<string, TreeNode>;
};

export type Example = {
  id?: string | number;
  sentence?: string;
  target?: string;
  facts?: Record<string, unknown>;
  covers?: string[];
};

export type Props = {
  tree: ExerciseTree;
  examples: Example[];
  title: string;
  subtitle?: string;
  topicCode?: string;
};

export type FactTest = {
  fact: string;
  equals?: unknown;
  anyOf?: unknown[];
  notEquals?: unknown;
};

export type VisualAction = {
  targetId?: string;
  answer?: TreeAnswer;
  test?: FactTest;
  hint?: string;
  previewText?: string;
  conceptText?: string;
};

export type VisualChoice = {
  id: string;
  label: string;
  action: VisualAction;
};

export type VisualNode = {
  id: string;
  kind: "start" | "decision" | "outcome" | "result";
  text: string;
  fullText?: string;
  originalNode?: TreeNode;
  choices?: VisualChoice[];
  pathOrder?: number;
  context?: boolean;
  contextOf?: string;
  contextOrder?: number;
  autoNextId?: string;
};

export type VisualEdge = {
  id: string;
  from: string;
  to: string;
  choiceId: string;
  order: number;
};

export type VisualMap = {
  nodes: VisualNode[];
  edges: VisualEdge[];
  rootId: string;
};

export type PositionedNode = VisualNode & {
  x: number;
  y: number;
  w: number;
  h: number;
  diamondH?: number;
};

export type MapLayout = {
  nodes: PositionedNode[];
  edges: VisualEdge[];
  width: number;
  height: number;
  rootId: string;
  terminalY: number;
};

export type Feedback = {
  nodeId: string;
  choiceId: string;
  status: "correct" | "wrong";

};
