import {
  buildConceptVisualMap,
  buildGenericVisualMap,
  buildKanaVisualMap,
  buildPresentVerbVisualMap,
} from "./model";
import type { Example, Props } from "./types";

export function createSeededRandom(seed: string) {
  let state = [...seed].reduce(
    (value, character) => ((value * 31 + character.charCodeAt(0)) >>> 0),
    2166136261,
  );
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

export function buildFullVisualMap({
  tree,
  example,
  isPresentVerbPath,
  isKanaPath,
}: {
  tree: Props["tree"];
  example: Example | null;
  isPresentVerbPath: boolean;
  isKanaPath: boolean;
}) {
  const fullMap = isPresentVerbPath
    ? buildPresentVerbVisualMap(example)
    : isKanaPath
      ? buildKanaVisualMap(example)
      : buildGenericVisualMap(tree, example);
  return buildConceptVisualMap(fullMap);
}
