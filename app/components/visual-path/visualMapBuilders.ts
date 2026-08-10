import type { Example, FactTest, VisualEdge, VisualNode } from "./types";

export function addEdge(edges: VisualEdge[], from: string, to: string | undefined, choiceId: string, order = 0) {
  if (!to) return;
  edges.push({ id: `${from}->${to}:${choiceId}`, from, to, choiceId, order });
}

export function addStart(nodes: VisualNode[], edges: VisualEdge[], rootId: string, sentence: string) {
  nodes.unshift({ id: "__exercise__", kind: "start", text: sentence || "ابدأ المسار" });
  addEdge(edges, "__exercise__", rootId, "plain");
}

export function addFactOptions(
  nodes: VisualNode[],
  edges: VisualEdge[],
  options: {
    id: string;
    text: string;
    hint: string;
    choices: Array<{ id: string; label: string; target: string; test: FactTest; hint?: string; conceptText?: string }>;
  },
) {
  const choices = options.choices.map((choice, index) => {
    const id = `${options.id}:${choice.id}`;
    addEdge(edges, options.id, choice.target, id, index);
    return { id, label: choice.label, action: { targetId: choice.target, test: choice.test, hint: choice.hint || `راجع اختيار «${choice.label}» في ضوء المثال. ${options.hint}`, conceptText: choice.conceptText } };
  });
  nodes.push({
    id: options.id,
    kind: "decision",
    text: options.text,
    originalNode: { id: options.id, type: "question", text: options.text, hint: options.hint },
    choices,
  });
}

export function addResult(nodes: VisualNode[], id: string, text: string, fullText = text) {
  nodes.push({ id, kind: "result", text, fullText });
}

