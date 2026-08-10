import type { ExerciseAnswer, ExerciseTree } from "../../../lib/exercise/model";
import type { RunnerState } from "../../../lib/exercise/runner";

export type PedagogyState = Partial<RunnerState> & {
  sentence?: string;
  [key: string]: unknown;
};

export type PedagogyNode = {
  id?: string;
  type?: "question" | "result" | string;
  text?: string;
  context?: string;
  hint?: string;
  answers?: ExerciseAnswer[];
  coverage?: string;
  requires?: string[];
  [key: string]: unknown;
};

export type PedagogyTree = Omit<Partial<ExerciseTree>, "nodes"> & {
  nodes?: Record<string, PedagogyNode>;
};
