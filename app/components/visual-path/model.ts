import { questionWithoutRepeatedOptions } from "./questionText";
import { addEdge, addStart } from "./visualMapBuilders";
import type { ExerciseTree, Example, FactTest, TreeAnswer, VisualAction, VisualEdge, VisualMap, VisualNode } from "./types";

function normalize(text?: string) {
  return String(text || "").replace(/\\n/g, "\n").replace(/[ \t]+/g, " ").trim();
}

function cleanOption(text?: string) {
  return normalize(text)
    .replace(/^نعم[،:：]?\s*/u, "")
    .replace(/^لا[،:：]?\s*/u, "")
    .replace(/؛.*$/u, "")
    .replace(/،\s*(?:لأن|أي|وهو|وهي).*$/u, "")
    .replace(/^اختر\s+/u, "")
    .trim();
}

function namedChoice(text: string | undefined, fallback: string, nodeId = "", answerId = "") {
  if (nodeId === "inna_kaffa_effect") {
    if (answerId === "a") return "عطّلت عمل الحرف";
    if (answerId === "b") return "أبقت الحرف عاملًا";
  }
  if (nodeId === "past_raf3_type" && answerId === "sukoon") {
    return "تاء الفاعل ونا ونون النسوة";
  }
  if (nodeId === "khabar_kind") {
    if (answerId === "a") return "خبر مفرد";
    if (answerId === "b") return "خبر جملة";
    if (answerId === "c") return "خبر شبه جملة";
  }
  const value = cleanOption(text);
  if (!value || value === "نعم" || value === "لا") return fallback;
  return value.length > 42 ? `${value.slice(0, 41).trimEnd()}…` : value;
}

export function compactResultText(text?: string) {
  const parts = normalize(text)
    .replace(/\n+/g, "\n")
    .split("\n")
    .map((part) => part.trim())
    .filter(Boolean);
  const value = parts.slice(0, 3).join("\n");
  return value.length > 150 ? `${value.slice(0, 147).trimEnd()}…` : value || "النتيجة";
}

function isYesLabel(text?: string) {
  return /^نعم(?:\b|[،:：])/u.test(normalize(text));
}

function isNoLabel(text?: string) {
  return /^لا(?:\b|[،:：])/u.test(normalize(text));
}

function answerIsCorrect(answer: TreeAnswer | undefined, example: Example | null) {
  if (!answer) return false;
  if (!answer.eval) return answer.correct === true;
  const actual = example?.facts?.[answer.eval.fact];
  if (Array.isArray(answer.eval.anyOf)) return answer.eval.anyOf.includes(actual);
  if (Object.prototype.hasOwnProperty.call(answer.eval, "notEquals")) return actual !== answer.eval.notEquals;
  return actual === answer.eval.equals;
}

function factMatches(test: FactTest | undefined, example: Example | null) {
  if (!test) return false;
  const actual = example?.facts?.[test.fact];
  if (Array.isArray(test.anyOf)) return test.anyOf.includes(actual);
  if (Object.prototype.hasOwnProperty.call(test, "notEquals")) return actual !== test.notEquals;
  return actual === test.equals;
}

export function actionIsCorrect(action: VisualAction | undefined, example: Example | null) {
  if (!action) return false;
  if (action.answer) return answerIsCorrect(action.answer, example);
  return factMatches(action.test, example);
}

function resolveNextNodeId(answer: TreeAnswer | undefined, example: Example | null) {
  if (!answer) return "";
  if (!answer.nextByFact || !example) return answer.next;
  const value = String(example.facts?.[answer.nextByFact.fact]);
  return answer.nextByFact.map?.[value] || answer.nextByFact.default || answer.next;
}

export function buildGenericVisualMap(tree: ExerciseTree, example: Example | null): VisualMap {
  const nodes: VisualNode[] = [];
  const edges: VisualEdge[] = [];
  let serial = 0;
  const nextVisualId = (prefix: string, originalId: string) => `${prefix}:${originalId}:${serial++}`;
  const visualByOriginal = new Map<string, string>();

  const expand = (originalId: string, ancestors: Set<string>): string => {
    if (ancestors.has(originalId)) {
      const id = nextVisualId("result", "loop");
      nodes.push({ id, kind: "result", text: "راجع الاختيار السابق." });
      return id;
    }
    const existing = visualByOriginal.get(originalId);
    if (existing) return existing;
    const original = tree.nodes[originalId];
    if (!original) {
      const id = nextVisualId("result", "missing");
      nodes.push({ id, kind: "result", text: "تعذر إكمال هذا الفرع." });
      return id;
    }
    if (original.type === "result") {
      const id = nextVisualId("result", originalId);
      visualByOriginal.set(originalId, id);
      nodes.push({ id, kind: "result", text: compactResultText(original.text), fullText: normalize(original.text), originalNode: original });
      return id;
    }

    const answers = (original.answers || []).filter((answer) => {
      const nextId = resolveNextNodeId(answer, example);
      return Boolean(nextId && tree.nodes[nextId]);
    });
    if (!answers.length) {
      const id = nextVisualId("result", originalId);
      nodes.push({ id, kind: "result", text: "لا يوجد انتقال صالح في هذا الفرع." });
      return id;
    }

    const decisionId = nextVisualId("decision", originalId);
    visualByOriginal.set(originalId, decisionId);
    const nextAncestors = new Set(ancestors).add(originalId);
    const choices = answers.map((answer, index) => {
      const fallback = isYesLabel(answer.text)
        ? "ينطبق على المثال"
        : isNoLabel(answer.text)
          ? "لا ينطبق على المثال"
          : cleanOption(answer.hint).slice(0, 34).trim() || `إجابة ${index + 1}`;
      const label = namedChoice(answer.text, fallback, original.id, answer.id);
      const id = `${decisionId}:choice:${index}`;
      const nextOriginalId = resolveNextNodeId(answer, example);
      const selfLoop = nextOriginalId === originalId;
      const targetId = selfLoop ? decisionId : expand(nextOriginalId, nextAncestors);
      if (!selfLoop) addEdge(edges, decisionId, targetId, id, index);
      return {
        id,
        label,
        action: {
          targetId,
          answer,
          hint: answer.hint || `راجع اختيار «${label}» في ضوء المثال. ${original.hint || "ابحث عن الدليل الذي يوافق السؤال الحالي."}`,
          conceptText: label,
          previewText: (() => {
            const next = tree.nodes[resolveNextNodeId(answer, example)];
            if (!next) return label;
            if (next.type === "result") return `${label}
${compactResultText(next.text)}`;
            return `${label}
ثم: ${questionWithoutRepeatedOptions(next.text, example?.target, (next.answers || []).map((item) => item.text), next.id, example)}`;
          })(),
        },
      };
    });

    nodes.push({
      id: decisionId,
      kind: "decision",
      text: questionWithoutRepeatedOptions(original.text, example?.target, choices.map((choice) => choice.label), original.id, example),
      originalNode: original,
      choices,
    });
    return decisionId;
  };

  const rootId = expand(tree.startNodeId, new Set());
  addStart(nodes, edges, rootId, example?.sentence || "ابدأ المسار");
  return { nodes, edges, rootId };
}

export function buildConceptVisualMap(map: VisualMap): VisualMap {
  const nodes: VisualNode[] = map.nodes.map((node) => ({
    ...node,
    choices: node.choices?.map((choice) => ({ ...choice, action: { ...choice.action } })),
  }));
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const edges: VisualEdge[] = [];

  map.edges.forEach((edge) => {
    const from = nodeById.get(edge.from);
    const to = nodeById.get(edge.to);
    if (!from || !to || from.kind !== "decision" || to.kind !== "decision") {
      edges.push(edge);
      return;
    }

    const choice = from.choices?.find((item) => item.id === edge.choiceId);
    if (!choice) {
      edges.push(edge);
      return;
    }

    const outcomeId = `outcome:${edge.id}`;
    const outcomeText = choice.action.conceptText || choice.label;
    const outcomeNode: VisualNode = {
      id: outcomeId,
      kind: "outcome",
      text: outcomeText,
      fullText: choice.action.previewText || outcomeText,
      autoNextId: to.id,
    };
    nodes.push(outcomeNode);
    nodeById.set(outcomeId, outcomeNode);
    choice.action.targetId = outcomeId;
    edges.push({ ...edge, id: `${edge.from}->${outcomeId}:${edge.choiceId}`, to: outcomeId });
    edges.push({ id: `${outcomeId}->${to.id}:plain`, from: outcomeId, to: to.id, choiceId: "plain", order: 0 });
  });

  return { ...map, nodes, edges };
}


export { buildPresentVerbVisualMap, presentVerbResultText } from "./presentVerbMap";
export { buildKanaVisualMap } from "./kanaVisualMap";
