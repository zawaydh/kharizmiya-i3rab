import type { MapLayout, PositionedNode, VisualEdge, VisualMap, VisualNode } from "./types";
const START_W = 336;
const START_H = 88;
const DECISION_W = 330;
export const DECISION_DIAMOND_H = 126;
export const CHOICE_H = 48;
export const CHOICE_GAP = 8;
const OUTCOME_W = 246;
const OUTCOME_H = 72;
const RESULT_W = 336;
const RESULT_H = 132;
const H_GAP = 28;
const V_GAP = 48;
const SIDE_PAD = 54;
const TOP_PAD = 30;
export function choiceGrid(count: number) {
  const columns = count <= 3 ? Math.max(1, count) : 3;
  return { columns, rows: Math.ceil(Math.max(1, count) / columns) };
}
function estimatedLines(text: string | undefined, charsPerLine: number) {
  const lines = String(text || "").replace(/\\n/g, "\n").split("\n");
  return Math.max(1, lines.reduce((sum, line) => sum + Math.max(1, Math.ceil(line.trim().length / charsPerLine)), 0));
}
function nodeSize(node: VisualNode) {
  if (node.kind === "start") {
    const lines = estimatedLines(node.text, 38);
    return { w: START_W, h: Math.max(START_H, 48 + lines * 24), diamondH: 0 };
  }
  if (node.kind === "outcome") {
    const lines = estimatedLines(node.fullText || node.text, 28);
    return { w: OUTCOME_W, h: Math.max(OUTCOME_H, 34 + lines * 21), diamondH: 0 };
  }
  if (node.kind === "result") {
    const lines = estimatedLines(node.fullText || node.text, 31);
    return { w: RESULT_W, h: Math.min(270, Math.max(RESULT_H, 42 + lines * 25)), diamondH: 0 };
  }
  const { rows } = choiceGrid(node.choices?.length || 2);
  const questionLines = estimatedLines(node.text, 31);
  const diamondH = Math.min(190, Math.max(DECISION_DIAMOND_H, 68 + questionLines * 23));
  return {
    w: DECISION_W,
    h: diamondH + 12 + rows * CHOICE_H + (rows - 1) * CHOICE_GAP,
    diamondH,
  };
}
function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : Number.POSITIVE_INFINITY;
}
export function buildTreeLayout(map: VisualMap): MapLayout {
  const nodeById = new Map(map.nodes.map((node) => [node.id, node]));
  const outgoing = new Map<string, VisualEdge[]>();
  const incoming = new Map<string, VisualEdge[]>();
  map.edges.forEach((edge) => {
    outgoing.set(edge.from, [...(outgoing.get(edge.from) || []), edge]);
    incoming.set(edge.to, [...(incoming.get(edge.to) || []), edge]);
  });
  outgoing.forEach((edges) => edges.sort((a, b) => a.order - b.order));
  const traversalOrder = new Map<string, number>();
  const reachable = new Set<string>();
  let serial = 0;
  const visit = (id: string) => {
    if (reachable.has(id) || !nodeById.has(id)) return;
    reachable.add(id);
    traversalOrder.set(id, serial++);
    (outgoing.get(id) || []).forEach((edge) => visit(edge.to));
  };
  visit("__exercise__");
  const depth = new Map<string, number>([["__exercise__", 0]]);
  const queue = ["__exercise__"];
  let iterations = 0;
  const maxIterations = Math.max(1, map.nodes.length * Math.max(1, map.edges.length));
  while (queue.length && iterations < maxIterations) {
    iterations += 1;
    const id = queue.shift()!;
    const nextDepth = (depth.get(id) || 0) + 1;
    (outgoing.get(id) || []).forEach((edge) => {
      if (!reachable.has(edge.to)) return;
      if ((depth.get(edge.to) ?? -1) < nextDepth) {
        depth.set(edge.to, nextDepth);
        queue.push(edge.to);
      }
    });
  }
  const layers = new Map<number, VisualNode[]>();
  reachable.forEach((id) => {
    const node = nodeById.get(id);
    if (!node) return;
    const layer = depth.get(id) || 0;
    layers.set(layer, [...(layers.get(layer) || []), node]);
  });
  const maxDepth = Math.max(0, ...layers.keys());
  layers.forEach((nodes) => nodes.sort((a, b) => (traversalOrder.get(a.id) || 0) - (traversalOrder.get(b.id) || 0)));
  for (let pass = 0; pass < 2; pass += 1) {
    for (let layer = 1; layer <= maxDepth; layer += 1) {
      const previous = layers.get(layer - 1) || [];
      const previousIndex = new Map(previous.map((node, index) => [node.id, index]));
      layers.get(layer)?.sort((a, b) => {
        const aScore = average((incoming.get(a.id) || []).map((edge) => previousIndex.get(edge.from)).filter((value): value is number => value !== undefined));
        const bScore = average((incoming.get(b.id) || []).map((edge) => previousIndex.get(edge.from)).filter((value): value is number => value !== undefined));
        return aScore - bScore || (traversalOrder.get(a.id) || 0) - (traversalOrder.get(b.id) || 0);
      });
    }
    for (let layer = maxDepth - 1; layer >= 0; layer -= 1) {
      const following = layers.get(layer + 1) || [];
      const followingIndex = new Map(following.map((node, index) => [node.id, index]));
      layers.get(layer)?.sort((a, b) => {
        const aScore = average((outgoing.get(a.id) || []).map((edge) => followingIndex.get(edge.to)).filter((value): value is number => value !== undefined));
        const bScore = average((outgoing.get(b.id) || []).map((edge) => followingIndex.get(edge.to)).filter((value): value is number => value !== undefined));
        return aScore - bScore || (traversalOrder.get(a.id) || 0) - (traversalOrder.get(b.id) || 0);
      });
    }
  }
  const layerWidths = new Map<number, number>();
  const layerHeights = new Map<number, number>();
  layers.forEach((nodes, layer) => {
    layerWidths.set(layer, nodes.reduce((sum, node, index) => sum + nodeSize(node).w + (index ? H_GAP : 0), 0));
    layerHeights.set(layer, Math.max(...nodes.map((node) => nodeSize(node).h)));
  });
  const width = Math.max(900, ...layerWidths.values()) + SIDE_PAD * 2;
  const yByLayer = new Map<number, number>();
  let cursorY = TOP_PAD;
  for (let layer = 0; layer <= maxDepth; layer += 1) {
    yByLayer.set(layer, cursorY);
    cursorY += (layerHeights.get(layer) || START_H) + V_GAP;
  }
  const positioned: PositionedNode[] = [];
  layers.forEach((nodes, layer) => {
    const layerWidth = layerWidths.get(layer) || 0;
    let cursorX = (width - layerWidth) / 2;
    const maxHeight = layerHeights.get(layer) || 0;
    nodes.forEach((node) => {
      const size = nodeSize(node);
      positioned.push({
        ...node,
        x: cursorX,
        y: (yByLayer.get(layer) || TOP_PAD) + (maxHeight - size.h) / 2,
        ...size,
      });
      cursorX += size.w + H_GAP;
    });
  });
  const lowestNode = positioned.reduce((max, node) => Math.max(max, node.y + node.h), 0);
  const terminalY = lowestNode + 72;
  return { nodes: positioned, edges: map.edges, width, height: terminalY + 62, rootId: map.rootId, terminalY };
}
function decisionChoiceAnchor(node: PositionedNode, choiceId: string) {
  const choices = node.choices || [];
  const index = choices.findIndex((choice) => choice.id === choiceId);
  if (index < 0) return null;
  const { columns } = choiceGrid(choices.length);
  const gap = 8;
  const buttonW = (node.w - 12 - (columns - 1) * gap) / columns;
  const row = Math.floor(index / columns);
  const column = index % columns;
  const itemsInRow = Math.min(columns, choices.length - row * columns);
  const rowWidth = itemsInRow * buttonW + (itemsInRow - 1) * gap;
  return {
    x: node.x + (node.w - rowWidth) / 2 + column * (buttonW + gap) + buttonW / 2,
    y: node.y + (node.diamondH || DECISION_DIAMOND_H) + 10 + row * (CHOICE_H + CHOICE_GAP) + CHOICE_H,
  };
}
export function edgePath(from: PositionedNode, to: PositionedNode, edge?: VisualEdge) {
  const choiceAnchor = from.kind === "decision" && edge ? decisionChoiceAnchor(from, edge.choiceId) : null;
  const startX = choiceAnchor?.x ?? from.x + from.w / 2;
  const startY = choiceAnchor?.y ?? from.y + from.h;
  const endX = to.x + to.w / 2;
  const endY = to.y;
  const lane = (edge?.order || 0) * 5;
  const middleY = startY + Math.max(24, (endY - startY) / 2) + lane;
  return `M ${startX} ${startY} V ${middleY} H ${endX} V ${endY}`;
}
