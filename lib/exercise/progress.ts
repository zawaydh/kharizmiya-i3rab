import type { ExerciseExample, ExerciseTree } from "./model";

export type CoveredMap = Record<string, boolean>;

export function buildEmptyCovered(keys: string[] = []): CoveredMap {
  return Object.fromEntries(keys.map((key) => [key, false]));
}

export function calcPercent(
  covered: CoveredMap = {},
  keys: string[] = []
): number {
  if (keys.length === 0) return 0;
  const done = keys.filter((key) => covered[key]).length;
  return Math.round((done / keys.length) * 100);
}

export function resultIdToCoverage(resultId?: string | null): string | null {
  const coverageByResultId: Record<string, string> = {
    R_mubtada_sahih: "mubtada.sahih",
    R_mubtada_moatal: "mubtada.moatal",
    R_mubtada_5: "mubtada.five",
    R_mubtada_muthanna: "mubtada.muthanna",
    R_mubtada_jms: "mubtada.jms",
    R_mubtada_jfs: "mubtada.jfs",
    R_mubtada_jt: "mubtada.jt",
    R_mubtada_damir: "mubtada.damir",
    R_mubtada_ishara: "mubtada.ishara",
    R_mubtada_mawsool: "mubtada.mawsool",
    R_mubtada_istifham: "mubtada.istifham",
    R_mubtada_shart: "mubtada.shart",
    R_mubtada_kam_khabariyya: "mubtada.kam",
    R_source_mubtada: "mubtada.masdar",
  };
  return resultId ? coverageByResultId[resultId] ?? null : null;
}

export function normalizeCoverageKey(key?: string | null): string | null {
  if (!key) return null;
  return resultIdToCoverage(key) || key;
}

export function uniqueCoverageKeys(
  keys: ReadonlyArray<unknown> = []
): string[] {
  const normalized = keys
    .map((key) => normalizeCoverageKey(typeof key === "string" ? key : null))
    .filter((key): key is string => Boolean(key));
  return Array.from(new Set(normalized));
}

export function getResultCoverageKeys(
  tree: ExerciseTree,
  resultNodeId?: string | null
): string[] {
  if (!resultNodeId) return [];
  const node = tree.nodes[resultNodeId];
  if (!node || node.type !== "result") return [];
  return uniqueCoverageKeys([node.coverage, resultNodeId]);
}

export function getExampleCoverageKeys(
  example?: ExerciseExample | null
): string[] {
  return uniqueCoverageKeys(Array.isArray(example?.covers) ? example.covers : []);
}

export function resolveCoverageKeys(params: {
  tree: ExerciseTree;
  example?: ExerciseExample | null;
  currentNodeId?: string | null;
  requiredKeys: string[];
}): string[] {
  const { tree, example, currentNodeId, requiredKeys } = params;
  const required = new Set(requiredKeys);
  const fromResult = getResultCoverageKeys(tree, currentNodeId).filter((key) =>
    required.has(key)
  );
  const fromExample = getExampleCoverageKeys(example).filter((key) =>
    required.has(key)
  );
  return uniqueCoverageKeys([...fromResult, ...fromExample]).filter((key) =>
    required.has(key)
  );
}
