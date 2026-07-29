"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PATHS_COPY } from "../../content/dialogueCopy";
import { diagnosticHintText, firstLevelHintText } from "../../lib/hintText";
import { buildConceptMapGraph } from "../../lib/paths/conceptMapGraph";

type TreeAnswer = {
  id: string;
  text: string;
  next: string;
  nextByFact?: { fact: string; map: Record<string, string>; default?: string };
  correct?: boolean;
  eval?: { fact: string; equals?: any; anyOf?: any[]; notEquals?: any };
  hint?: string;
  why?: string;
};

type TreeNode = {
  id: string;
  type: string;
  text: string;
  context?: string;
  teaching_note?: string;
  hint?: string;
  thinking?: { q: string; a: string }[];
  answers?: TreeAnswer[];
};

type ExerciseTree = {
  startNodeId: string;
  nodes: Record<string, TreeNode>;
};

type Example = {
  id: string;
  sentence: string;
  target: string;
  facts: Record<string, any>;
  covers: string[];
};

type Props = {
  tree: ExerciseTree;
  examples: Example[];
  title: string;
  subtitle?: string;
};

type PositionedNode = {
  id: string;
  kind: "start" | "question" | "result";
  x: number;
  y: number;
  w: number;
  h: number;
  textLines: string[];
  node: TreeNode | null;
};

type HintBubble = {
  text: string;
  left: number;
  top: number;
  placement: "right" | "left" | "above" | "below";
};

const BOX_W = 300;
const BOX_H = 112;
const DIA_W = 440;
const DIA_H = 310;
const LEVEL_GAP = 370;
const SIBLING_GAP = 64;
const MIN_ZOOM = 0.58;
const MAX_ZOOM = 1.55;

function splitText(text?: string, max = 28, maxLines = 8) {
  if (!text) return [];
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let current = "";
  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > max && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });
  if (current) lines.push(current);
  return lines.slice(0, maxLines);
}



function shortPathAnswerLabel(text?: string) {
  const raw = String(text || "").replace(/\s+/g, " ").trim();
  if (!raw) return "";

  const compact = raw
    .replace(/^فعل:\s*حدث مقترن بزمن$/, "فعل")
    .replace(/^اسم:\s*.*$/, "اسم")
    .replace(/^حرف:\s*.*$/, "حرف")
    .replace(/^اسم معرب ظاهر$/, "اسم معرب")
    .replace(/^اسم مبني مستقل$/, "اسم مبني")
    .replace(/^ضمير متصل بالحرف الناسخ$/, "ضمير متصل")
    .replace(/^نعم،\s*/, "نعم: ")
    .replace(/^لا،\s*/, "لا: ");

  return compact;
}

function shortEdgeLabel(text?: string) {
  const compact = shortPathAnswerLabel(text);
  return compact.length > 34 ? `${compact.slice(0, 33).trimEnd()}…` : compact;
}

function displayNodeQuestion(node: TreeNode | null | undefined, example?: Example | null) {
  const raw = String(node?.text || "").trim();
  const hint = String(node?.hint || "").trim();
  const context = String((node as any)?.context || "").trim();
  const target = String(example?.target || "").trim();
  const quoted = target ? `«${target}»` : "الكلمة";
  const nodeId = String(node?.id || "");
  const facts = example?.facts || {};

  if (!raw) return target ? `ما الحكم المناسب لـ${quoted}؟` : "تابع السؤال المناسب لهذا المثال.";

  let question = raw
    .replace(/\s*اختر الإجابة الصحيحة مما (?:يلي|يأتي)[:：]?\s*$/, "")
    .replace(/\s*اختر الإجابة المناسبة مما (?:يلي|يأتي)[:：]?\s*$/, "")
    .replace(/\s*اختر المناسب[:：]?\s*$/, "")
    .replace(/\s+/g, " ")
    .trim();

  if (nodeId === "inna_kaffa_gate") {
    const particle = String(facts.particleLabel || "الحرف الناسخ");
    question = particle === "إنما"
      ? "هل في «إنما» ما الكافة التي أبطلت عمل إن؟"
      : `هل اتصلت «ما» بـ«${particle}» فكفّته عن العمل؟`;
  } else if (nodeId === "inna_compact_role") {
    const particle = String(facts.particleLabel || "الحرف الناسخ");
    question = `ما موقع ${quoted} بعد «${particle}»؟`;
  } else if (nodeId === "kana_target") {
    question = `ما وظيفة ${quoted} بعد الفعل الناسخ؟`;
  } else if (nodeId === "kana_ism_start") {
    question = `ما نوع ${quoted}؟`;
  } else if (nodeId === "kana_khabar_entry") {
    question = `ما صورة ${quoted} في الجملة؟`;
  }

  if (question === "ماذا نتحقق الآن؟") {
    if (hint.includes("العدد") || hint.includes("النوع")) question = `ما صورة ${quoted}؟`;
    else if (hint.includes("علامة")) question = `ما العلامة المناسبة لـ${quoted}؟`;
    else if (hint.includes("اسم معرب") || hint.includes("اسم مبني")) question = `ما نوع ${quoted}؟`;
    else if (context) question = context.replace(/^عرفنا\s*/, "حدّدنا ").replace(/[.،]+$/, "") + "؛ ماذا نختار الآن؟";
    else question = `ماذا نلاحظ في ${quoted}؟`;
  }

  if (target) {
    const exact: Array<[RegExp, string]> = [
      [/ما نوع الكلمة المحددة[؟?]?/g, `ما نوع كلمة ${quoted}؟`],
      [/ما نوع الكلمة[؟?]?/g, `ما نوع كلمة ${quoted}؟`],
      [/ما نوع هذه الكلمة[؟?]?/g, `ما نوع كلمة ${quoted}؟`],
      [/ما دور الكلمة المحددة في الجملة[؟?]?/g, `ما دور ${quoted} في الجملة؟`],
      [/ما الدور المعنوي للكلمة المحددة في الجملة[؟?]?/g, `ما الدور المعنوي لـ${quoted} في الجملة؟`],
      [/ما السياق الذي وردت فيه الكلمة المحددة[؟?]?/g, `ما السياق الذي وردت فيه ${quoted}؟`],
      [/اختر الصورة المناسبة للكلمة المحددة[:：]?/g, `ما صورة ${quoted}؟`],
      [/اختر علامة الرفع المناسبة للكلمة المحددة[:：]?/g, `ما علامة رفع ${quoted}؟`],
      [/اختر علامة النصب المناسبة للكلمة المحددة[:：]?/g, `ما علامة نصب ${quoted}؟`],
      [/ما صورة الفعل[؟?]?/g, `ما صورة الفعل ${quoted}؟`],
      [/هل اتصل به ما يجعله مبني[ًًّاا]*[؟?]?/g, `هل اتصل بالفعل ${quoted} ما يجعله مبنيًّا؟`],
      [/هل سبق الفعلَ ناصبٌ أو جازم[؟?]?/g, `هل سبق ${quoted} ناصب أو جازم؟`],
      [/هل سبق الفعل ناصب أو جازم[؟?]?/g, `هل سبق ${quoted} ناصب أو جازم؟`],
      [/هل فعل الأمر صحيح الآخر أم معتل الآخر[؟?]?/g, `هل ${quoted} صحيح الآخر أم معتل الآخر؟`],
      [/ما موقع الكلمة المحددة/g, `ما موقع ${quoted}`],
      [/ما دور المحدد/g, `ما دور ${quoted}`],
    ];
    exact.forEach(([pattern, replacement]) => { question = question.replace(pattern, replacement); });
    question = question
      .replace(/الكلمة المحددة/g, quoted)
      .replace(/الكلمة المطلوبة/g, quoted)
      .replace(/الفعل المحدد/g, `الفعل ${quoted}`)
      .replace(/المحدد/g, quoted)
      .replace(/هذا الاسم المبني/g, `الاسم المبني ${quoted}`)
      .replace(/هذا الاسم/g, quoted)
      .replace(/هذا الجزء/g, quoted);

    if (!question.includes(target) && /[؟?]/.test(question)) {
      question = `بالنظر إلى ${quoted}: ${question}`;
    }
  }
  return question.replace(/[:：]\s*$/, "").trim();
}

function answerGridMetrics(labels: string[]) {
  const count = Math.max(1, labels.length);
  const columns = count === 1 ? 1 : 2;
  const rows = Math.ceil(count / columns);
  const gapX = 8;
  const gapY = 7;
  const btnH = 44;
  const btnW = columns === 1 ? 286 : 164;
  return { count, columns, rows, gapX, gapY, btnH, btnW };
}

function answerButtonLayout(node: PositionedNode, labels: string[], idx: number) {
  const { count, columns, rows, gapX, gapY, btnH, btnW } = answerGridMetrics(labels);
  const row = Math.floor(idx / columns);
  const col = idx % columns;
  const itemsInRow = Math.min(columns, count - row * columns);
  const rowWidth = itemsInRow * btnW + Math.max(0, itemsInRow - 1) * gapX;
  const startX = node.x + (node.w - rowWidth) / 2;
  const firstY = node.y + node.h - (rows * btnH + Math.max(0, rows - 1) * gapY) - 14;
  return {
    bx: startX + col * (btnW + gapX),
    by: firstY + row * (btnH + gapY),
    btnW,
    btnH,
    rows,
    firstY,
  };
}

function questionNodeHeight(node: TreeNode, textLineCount = 3) {
  const labels = (node.answers || []).map((answer) => shortPathAnswerLabel(answer.text));
  const { rows, btnH, gapY } = answerGridMetrics(labels);
  const answerArea = rows * btnH + Math.max(0, rows - 1) * gapY;
  const questionArea = Math.max(108, textLineCount * 26 + 38);
  return Math.max(DIA_H, questionArea + answerArea + 92);
}

function answerInstructionY(node: PositionedNode, labels: string[]) {
  if (!labels.length) return node.y + node.h - 26;
  const { firstY } = answerButtonLayout(node, labels, 0);
  return Math.max(node.y + 48, firstY - 13);
}

function diamondPoints(x: number, y: number, w: number, h: number) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  return `${cx},${y} ${x + w},${cy} ${cx},${y + h} ${x},${cy}`;
}

function centerBottom(n: PositionedNode) {
  return { x: n.x + n.w / 2, y: n.y + n.h };
}
function centerTop(n: PositionedNode) {
  return { x: n.x + n.w / 2, y: n.y };
}
function pathD(a: { x: number; y: number }, b: { x: number; y: number }) {
  const midY = (a.y + b.y) / 2;
  return `M ${a.x} ${a.y} L ${a.x} ${midY} L ${b.x} ${midY} L ${b.x} ${b.y}`;
}

function answerIsCorrect(answer: { correct?: boolean; eval?: { fact: string; equals?: any; anyOf?: any[]; notEquals?: any } }, example: Example | null) {
  if (answer.correct === true) return true;
  if (answer.correct === false) return false;
  if (!example || !answer.eval) return false;
  const factValue = example.facts?.[answer.eval.fact];
  if (Array.isArray(answer.eval.anyOf)) return answer.eval.anyOf.includes(factValue);
  if (Object.prototype.hasOwnProperty.call(answer.eval, "notEquals")) return factValue !== answer.eval.notEquals;
  return factValue === answer.eval.equals;
}

function resolveNextNodeId(answer: TreeAnswer | undefined, example: Example | null) {
  if (!answer) return "";
  if (!answer.nextByFact || !example) return answer.next;
  const factValue = String(example.facts?.[answer.nextByFact.fact]);
  return answer.nextByFact.map?.[factValue] || answer.nextByFact.default || answer.next;
}

function sourceMasdarHint(target = "المصدر المؤول") {
  return `توضيح مهم: المصدر المؤول ليس كلمة واحدة فقط؛ هو تركيب مثل (أن + فعل مضارع)، ونستطيع تأويله بمصدر صريح. مثال: (أن تنجح) = نجاحك. لذلك يعامل معاملة الاسم ويأخذ موقعًا إعرابيًا مثل: في محل رفع مبتدأ.`;
}

function buildTreeLayout(tree: ExerciseTree, example: Example | null) {
  const nodes = tree.nodes;
  const rootId = tree.startNodeId;

  // الخريطة المفاهيمية تعرض جميع الفروع الممكنة، لا المسار الصحيح للمثال فقط.
  // يبقى مسار الطالب مميزًا بالألوان أثناء الحل، بينما تظل بقية المفاهيم ظاهرة.
  const conceptMap = buildConceptMapGraph(tree);
  const childrenMap = conceptMap.childrenMap;

  const widths = new Map<string, number>();
  function measure(id: string, trail = new Set<string>()): number {
    if (widths.has(id)) return widths.get(id)!;
    if (trail.has(id)) return 1;
    trail.add(id);
    const children = (childrenMap.get(id) || []).filter((childId) => childId !== id && nodes[childId]);
    if (!children.length) {
      widths.set(id, 1);
      return 1;
    }
    const total = children
      .map((childId) => measure(childId, new Set(trail)))
      .reduce((sum, value) => sum + value, 0);
    widths.set(id, total || 1);
    return total || 1;
  }
  measure(rootId);

  const placed = new Map<string, PositionedNode>();
  function place(id: string, depth: number, leftUnit: number) {
    const node = nodes[id];
    if (!node || placed.has(id)) return;

    const widthUnits = widths.get(id) || 1;
    const centerUnit = leftUnit + widthUnits / 2;
    const x = centerUnit * (BOX_W + SIBLING_GAP);
    const y = depth * LEVEL_GAP;
    const isQuestion = node.type === "question";
    const isResult = node.type === "result";
    const w = isQuestion ? DIA_W : (isResult ? 360 : BOX_W);
    const displayText = isResult && example?.facts?.finalI3rab
      ? String(example.facts.finalI3rab)
      : displayNodeQuestion(node, example);
    const textLines = splitText(displayText, isQuestion ? 30 : (isResult ? 38 : 28), isResult ? 14 : 8);
    const h = isQuestion
      ? questionNodeHeight(node, textLines.length)
      : Math.max(BOX_H, 48 + textLines.length * (isResult ? 25 : 23));

    placed.set(id, {
      id,
      kind: isQuestion ? "question" : "result",
      x,
      y,
      w,
      h,
      textLines,
      node,
    });

    let cursor = leftUnit;
    (childrenMap.get(id) || []).forEach((childId) => {
      const childWidth = widths.get(childId) || 1;
      place(childId, depth + 1, cursor);
      cursor += childWidth;
    });
  }

  place(rootId, 1, 0);
  const rootQuestion = placed.get(rootId);
  if (!rootQuestion) return null;

  const startNode: PositionedNode = {
    id: "__exercise__",
    kind: "start",
    x: rootQuestion.x + (rootQuestion.w - BOX_W) / 2,
    y: 0,
    w: BOX_W,
    h: 76,
    textLines: ["ابدأ المسار"],
    node: null,
  };

  const all = [startNode, ...Array.from(placed.values())];
  const minX = Math.min(...all.map((node) => node.x));
  const maxY = Math.max(...all.map((node) => node.y + node.h));

  all.forEach((node) => {
    node.x = node.x - minX + 60;
  });

  const visibleStart = all.find((node) => node.id === startNode.id);
  if (visibleStart) {
    const targetStartX = 380;
    const delta = targetStartX - visibleStart.x;
    all.forEach((node) => {
      node.x += delta;
    });
    const minAfter = Math.min(...all.map((node) => node.x));
    if (minAfter < 40) {
      const correction = 40 - minAfter;
      all.forEach((node) => {
        node.x += correction;
      });
    }
  }

  const edges: { from: string; to: string; label?: string }[] = [
    { from: startNode.id, to: rootId },
    ...conceptMap.edges,
  ];

  const finalMaxX = Math.max(...all.map((node) => node.x + node.w));
  const width = Math.max(finalMaxX + 80, 920);
  const height = maxY + 130;
  return { nodes: all, edges, width, height };
}

export default function DynamicPathTree({ tree, examples, title, subtitle }: Props) {
  const [example, setExample] = useState<Example | null>(null);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [visitedNodes, setVisitedNodes] = useState<string[]>([]);
  const [visitedEdges, setVisitedEdges] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [hintBubble, setHintBubble] = useState<HintBubble | null>(null);
  const [currentExampleIndex, setCurrentExampleIndex] = useState(-1);
  const [finalNodeId, setFinalNodeId] = useState<string | null>(null);
  const [highlightedAnswerKey, setHighlightedAnswerKey] = useState<string | null>(null);
  const [highlightedAnswerKind, setHighlightedAnswerKind] = useState<"correct" | "wrong" | null>(null);
  const [pathSteps, setPathSteps] = useState<string[]>([]);
  const [showFullMap, setShowFullMap] = useState(false);

  function cleanLearningText(text?: string, limit = 170) {
    const cleaned = (text || "")
      .replace(/يا بطل[،,]?/g, "")
      .replace(/عزيزي الطالب[،:]?/g, "")
      .replace(/أنا معك خطوة خطوة[.،]?/g, "")
      .replace(/المعلّم اللطيف[:：]?/g, "")
      .replace(/المعلم اللطيف[:：]?/g, "")
      .replace(/دعنا/g, "نبدأ")
      .replace(/\s+/g, " ")
      .trim();
    if (cleaned.length <= limit) return cleaned;
    const parts = cleaned.split(/(?<=[.؟!])\s+/).filter(Boolean);
    let out = "";
    for (const part of parts) {
      if ((out + " " + part).trim().length > limit) break;
      out = (out + " " + part).trim();
    }
    return out || cleaned.slice(0, limit - 1).trim() + "…";
  }

  function teacherSequenceText(node: TreeNode | null | undefined, baseText?: string) {
    const text = baseText || node?.hint || node?.teaching_note || "اختر الدليل النحوي الذي يثبته المثال.";
    return cleanLearningText(diagnosticHintText(text, example?.target), 165);
  }

  const canvasScrollRef = useRef<HTMLDivElement | null>(null);

  const layout = useMemo(() => buildTreeLayout(tree, example), [tree, example]);
  const layoutNodeMap = useMemo(() => {
    const map = new Map<string, PositionedNode>();
    layout?.nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [layout]);

  const focusNode = useCallback((nodeId: string, targetZoom = 1.06) => {
    if (!layout || !canvasScrollRef.current) return;
    const node = layoutNodeMap.get(nodeId);
    if (!node) return;

    const el = canvasScrollRef.current;
    const mobileFitZoom = Math.max(MIN_ZOOM, (el.clientWidth - 20) / Math.max(node.w, 1));
    const mobileReadableFloor = node.kind === "question" ? 0.74 : 0.8;
    const requestedZoom = el.clientWidth <= 760
      ? Math.max(mobileReadableFloor, Math.min(targetZoom, mobileFitZoom))
      : targetZoom;
    const nextZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, requestedZoom));
    setZoom(nextZoom);

    requestAnimationFrame(() => requestAnimationFrame(() => {
      const scrollElement = canvasScrollRef.current;
      if (!scrollElement) return;
      scrollElement.dir = "ltr";
      const scaledLeft = node.x * nextZoom;
      const scaledTop = node.y * nextZoom;
      const scaledW = node.w * nextZoom;
      const scaledH = node.h * nextZoom;
      const left = Math.max(0, scaledLeft - (scrollElement.clientWidth - scaledW) / 2);
      const top = Math.max(0, scaledTop - Math.max(24, (scrollElement.clientHeight - scaledH) / 2));
      scrollElement.scrollTo({ left, top, behavior: "smooth" });
    }));
  }, [layout, layoutNodeMap]);

  const resetProgress = useCallback((nextExample: Example | null) => {
    setExample(nextExample);
    setShowHint(false);
    setHintBubble(null);
    setHighlightedAnswerKey(null);
    setHighlightedAnswerKind(null);
    setFinalNodeId(null);
    setPathSteps([]);
    setShowFullMap(false);

    if (!nextExample) {
      setVisitedNodes([]);
      setVisitedEdges([]);
      setActiveNodeId(null);
      return;
    }

    setVisitedNodes(["__exercise__", tree.startNodeId]);
    setVisitedEdges([`__exercise__->${tree.startNodeId}`]);
    setActiveNodeId(tree.startNodeId);
  }, [tree.startNodeId]);

  useEffect(() => {
    const first = examples[0] || null;
    setCurrentExampleIndex(first ? 0 : -1);
    setZoom(1);
    resetProgress(first);
  }, [examples, resetProgress, tree]);

  useEffect(() => {
    if (!activeNodeId || !layout) return;
    const targetId = activeNodeId;
    const targetZoom = finalNodeId ? 0.96 : 1.02;
    const timer = setTimeout(() => focusNode(targetId, targetZoom), 100);
    return () => clearTimeout(timer);
  }, [activeNodeId, finalNodeId, focusNode, layout, tree.startNodeId]);

  function startExampleAt(index: number) {
    if (!examples.length) return;
    const safeIndex = ((index % examples.length) + examples.length) % examples.length;
    setCurrentExampleIndex(safeIndex);
    const next = examples[safeIndex] || null;
    resetProgress(next);
  }

  function startNextExercise() {
    if (!examples.length) return;
    const nextIndex = currentExampleIndex < 0 ? 0 : (currentExampleIndex + 1) % examples.length;
    startExampleAt(nextIndex);
  }

  function restartCurrentExercise() {
    if (!example) return;
    resetProgress(example);
  }


  function targetedHintForWrongAnswer(node: TreeNode, answer: { text: string; eval?: { fact: string; equals?: any; anyOf?: any[]; notEquals?: any }; hint?: string; why?: string }, currentExample: Example | null) {
    const target = currentExample?.target || "الكلمة الهدف";
    const teacherPrefix = "";
    const facts = currentExample?.facts || {};
    const picked = answer.text;
    function faelSpecificHint(): string | null {
      const nodeId = String(node.id || "");
      if (!nodeId.startsWith("fael_")) return null;
      const roleKind = facts.roleKind;
      const shape = facts.shape;
      const mabniType = facts.mabniType;
      const actionQuestion = facts.actionQuestion || "من الذي فعل؟";
      const pronounMeaning = facts.pronounMeaning;
      const connectedType = facts.connectedType;
      const nominalSubject = facts.nominalSubject;
      const verbalKhabar = facts.verbalKhabar;

      if (nodeId === "fael_context") {
        if (facts.contextType === "nominal_connected") {
          return `بدأت الجملة باسم (${nominalSubject})، فهي جملة اسمية. لكن خبرها جاء جملة فعلية: (${verbalKhabar}). ندرس داخلها الفاعل المرتبط بالفعل.`;
        }
        if (facts.contextType === "nominal_with_verb") {
          return `بدأت الجملة باسم (${nominalSubject})، فهي جملة اسمية. لكن داخل خبرها فعل يحتاج إلى فاعل، وسنبحث عن فاعل هذا الفعل في الخطوة التالية.`;
        }
        if (facts.contextType === "verbal_hidden") {
          return `الجملة بدأت بفعل هو (${target})؛ فهي جملة فعلية. والفعل يحتاج إلى فاعل، فإذا لم يظهر بعده اسم قام به نبحث عن ضمير مستتر.`;
        }
        return `انظر إلى بداية الجملة والفعل فيها. إذا بدأت بفعل فهي جملة فعلية، وإذا بدأت باسم فهي جملة اسمية. اختر السياق الظاهر فقط.`;
      }

      if (nodeId === "fael_role_verbal") {
        if (roleKind === "connected") {
          return `${target} ضمير متصل بالفعل. نسأل: ${actionQuestion} الجواب يدل عليه هذا الضمير، ومعناه: ${pronounMeaning || "من قام بالفعل"}. لذلك ليس فعلًا ولا مفعولًا به.`;
        }
        if (roleKind === "masdar") {
          const taqdir = String(target).includes("ما") ? "فعلك" : "نجاحك";
          return `داخل (${target}) يوجد فعل، لكننا نعرب التركيب كله لا الفعل وحده. فهو يؤول بمصدر في معنى اسم: (${taqdir}). اسأل: ما الذي أعجبني أو سرّني؟`;
        }
        if (roleKind === "visible") {
          return `اسأل عن الفعل في الجملة: ${actionQuestion} الكلمة (${target}) هي التي قامت بالفعل، أما المفعول به فهو ما وقع عليه الفعل.`;
        }
        if (roleKind === "mabni") {
          return `الكلمة (${target}) اسم مبني دلّ على من قام بالفعل. اسأل: ${actionQuestion} فتصل إلى أنه فاعل في محل رفع.`;
        }
      }

      if (nodeId === "fael_hukm") {
        if (facts.fiveNoun) {
          return `عرفنا أن (${target}) فاعل، والفاعل يكون مرفوعًا أو في محل رفع. لا نحكم بالنصب لمجرد وجود فتحة على الكاف؛ الكاف ضمير مضاف إليه، وعلامة رفع (${target}) هي الواو.`;
        }
        return `بعد أن عرفنا أن (${target}) فاعل، فحكم الفاعل الرفع دائمًا: يرفع بعلامة إذا كان معربًا، أو يكون في محل رفع إذا كان مبنيًا أو مصدرًا مؤولًا.`;
      }

      if (nodeId === "fael_form") {
        if (roleKind === "visible") {
          return `(${target}) كلمة مستقلة ظاهرة في الجملة وليست ضميرًا متصلًا ولا اسمًا مبنيًا ولا مصدرًا مؤولًا. لذلك نختار اسمًا ظاهرًا معربًا ثم نحدد صورته وعلامة رفعه.`;
        }
        if (roleKind === "connected") {
          return `(${target}) ضمير متصل بالفعل، والضمائر المتصلة من الأسماء المبنية. لا تظهر عليها علامة رفع؛ لذلك ستكون في محل رفع فاعل.`;
        }
        if (roleKind === "mabni") {
          const label = mabniType === "ishara" ? "اسم إشارة" : mabniType === "mawsool" ? "اسم موصول" : "اسم مبني";
          return `(${target}) ${label} من الأسماء المبنية، فلا نبحث عن ضمة على آخره. نحدد نوعه أولًا، ثم نقول: في محل رفع فاعل.`;
        }
        if (roleKind === "masdar") {
          return `(${target}) ليس اسمًا مبنيًا؛ بل تركيب يؤول بمصدر في معنى اسم. لذلك نقول: مصدر مؤول في محل رفع فاعل.`;
        }
        return `الاسم الظاهر المعرب نكمل معه إلى علامة الرفع. أما الاسم المبني والضمير المتصل فنقول: في محل رفع فاعل. وأما المصدر المؤول فنقول: مصدر مؤول في محل رفع فاعل.`;
      }

      if (nodeId === "fael_mu3rab_shape") {
        const pickedSingular = picked.includes("مفرد");
        if (shape === "singular") return `(${target}) اسم ظاهر يدل على واحد وليس مثنى ولا جمعًا، وليس من الأسماء الخمسة. لذلك صورته مفرد، وعلامة رفعه الضمة.`;
        if (shape === "dual") return pickedSingular
          ? `(${target}) ليست مفردًا؛ لأنها تدل على اثنين، وانتهت بألف ونون في هذا المثال، لذلك صورتها مثنى، وعلامة رفع المثنى الألف.`
          : `(${target}) يدل على اثنين، وانتهى بألف ونون في هذا المثال، لذلك صورته مثنى، وعلامة رفعه الألف.`;
        if (shape === "jms") return pickedSingular
          ? `(${target}) ليست مفردًا؛ لأنها تدل على جماعة ذكور عاقلة، وانتهت بواو ونون في هذا المثال، لذلك صورتها جمع مذكر سالم، وعلامة رفع جمع المذكر السالم الواو.`
          : `(${target}) جمع مذكر سالم؛ يدل على جماعة ذكور عاقلة، وانتهى بواو ونون في هذا المثال، لذلك علامة رفعه الواو.`;
        if (shape === "jfs") return pickedSingular
          ? `(${target}) ليست مفردًا؛ لأنها تدل على جماعة إناث، وانتهت بألف وتاء زائدتين، لذلك صورتها جمع مؤنث سالم، وعلامة رفعه الضمة.`
          : `(${target}) جمع مؤنث سالم؛ يدل على جماعة إناث وينتهي بألف وتاء زائدتين، وعلامة رفعه الضمة.`;
        if (shape === "jt") return pickedSingular
          ? `(${target}) ليست مفردًا؛ لأنها تدل على جماعة، وتغيّرت صورة المفرد عند الجمع مثل: طفل ← أطفال، لذلك صورتها جمع تكسير، وعلامة رفع جمع التكسير الضمة.`
          : `(${target}) جمع تكسير؛ تغيّرت صورة مفرده عند الجمع مثل طفل ← أطفال، وعلامة رفعه الضمة.`;
        if (shape === "five") return pickedSingular
          ? `صحيح أن (${target}) يدل على واحد، لكنه ليس مفردًا عاديًا في الإعراب؛ لأنه من الأسماء الخمسة، وقد جاء مفردًا مضافًا إلى غير ياء المتكلم، لذلك يرفع بالواو.`
          : `(${target}) من الأسماء الخمسة: أصله (أب)، وهو مفرد ومضاف إلى غير ياء المتكلم؛ لذلك يعرب بالحروف وعلامة رفعه الواو.`;
      }

      if (nodeId === "fael_raf3_mark") {
        if (shape === "five") return `الضمة للمفرد العادي مثل الطالبُ. أما (${target}) فمن الأسماء الخمسة، وقد تحققت شروط إعرابه بالحروف: مفرد، مضاف، ومضاف إلى غير ياء المتكلم؛ لذلك علامة رفعه الواو.`;
        if (shape === "dual") return `(${target}) مثنى، وعلامة رفع المثنى الألف لا بالضمة ولا بالواو.`;
        if (shape === "jms") return `(${target}) جمع مذكر سالم، وعلامة رفع جمع المذكر السالم الواو.`;
        if (shape === "jfs") return `(${target}) جمع مؤنث سالم، وعلامة رفع جمع المؤنث السالم الضمة الظاهرة.`;
        if (shape === "jt") return `(${target}) جمع تكسير، وعلامة رفع جمع التكسير الضمة مثل المفرد العادي.`;
        if (shape === "singular") return `(${target}) مفرد عادي مرفوع، وعلامة رفع المفرد هنا الضمة الظاهرة.`;
      }

      if (nodeId === "fael_mabni_type") {
        if (roleKind === "connected" && connectedType === "na") return `(${target}) ضمير متصل بالفعل، يدل على من قام بالفعل. نسأل: ${actionQuestion} الجواب: نحن. في (حفظْنا) سكن آخر الفعل الماضي لاتصاله بضمير رفع، وهذا يساعدنا على تمييز نا الفاعلين من نا المفعولين.`;
        if (roleKind === "connected") return `(${target}) ضمير متصل بالفعل، يدل على من قام بالفعل. نسأل: ${actionQuestion} الجواب معناه: ${pronounMeaning || "الفاعل"}. لذلك نختار ضميرًا متصلًا.`;
        if (mabniType === "ishara") return `(${target}) اسم إشارة؛ تشير به إلى من قام بالفعل، وأسماء الإشارة مبنية فتكون في محل رفع فاعل.`;
        if (mabniType === "mawsool") return `(${target}) اسم موصول، وبعده صلة توضحه. إذا دل على من قام بالفعل فهو اسم موصول مبني في محل رفع فاعل.`;
      }

      return null;
    }


    function mafoolSpecificHint(): string | null {
      const nodeId = String(node.id || "");
      if (!nodeId.startsWith("mafool_")) return null;
      const roleKind = facts.roleKind;
      const shape = facts.shape;
      const mabniType = facts.mabniType;
      const connectedType = facts.connectedType;
      const objectQuestion = facts.objectQuestion || "على من أو على ماذا وقع الفعل؟";
      const actor = facts.actor || "الفاعل";
      const taweel = facts.taweel;
      const pickedSingular = picked.includes("مفرد");

      if (nodeId === "mafool_context") {
        return `انظر إلى الفعل في الجملة. إذا بدأت الجملة بفعل مثل كتبَ أو رأيتُ أو شكرَتْ فهي جملة فعلية، وفيها نبحث عن الفاعل ثم عمّا وقع عليه الفعل.`;
      }

      if (nodeId === "mafool_role") {
        if (roleKind === "connected") {
          const naNote = connectedType === "na" ? " ولاحظ في شكرَنا أن حركة الفعل قبل نا بقيت فتحة؛ لأن نا هنا مفعول به لا فاعل." : "";
          return `(${target}) ضمير متصل وقع عليه الفعل. نسأل: ${objectQuestion} الجواب هو الضمير المحدد، أما من قام بالفعل فهو ${actor}.${naNote}`;
        }
        if (roleKind === "masdar") {
          const estimate = taweel || (String(target).includes("ما") ? "فعلَك" : "نجاحَك");
          return `داخل (${target}) قد يوجد فعل، لكننا نعرب التركيب كله لا الفعل وحده. التركيب يؤول بمصدر في معنى اسم: (${estimate}). اسأل: ${objectQuestion}`;
        }
        if (roleKind === "visible") return `اسأل: ${objectQuestion} الجواب هو (${target})؛ لأنه الشيء أو الشخص الذي وقع عليه فعل الفاعل (${actor}).`;
        if (roleKind === "mabni") return `(${target}) اسم مبني وقع عليه الفعل. نسأل: ${objectQuestion} لذلك يكون في محل نصب مفعول به.`;
      }

      if (nodeId === "mafool_hukm") {
        return `بعد أن عرفنا أن (${target}) مفعول به، فحكم المفعول به النصب أو في محل نصب. لا نرفعه لأنه ليس من قام بالفعل، ولا نجره لأنه ليس مسبوقًا بحرف جر هنا.`;
      }

      if (nodeId === "mafool_form") {
        if (roleKind === "visible") return `(${target}) كلمة مستقلة ظاهرة في الجملة، وليست اسمًا مبنيًا ولا ضميرًا متصلًا ولا مصدرًا مؤولًا؛ لذلك نختار اسمًا ظاهرًا معربًا ثم نحدد صورته وعلامة نصبه.`;
        if (roleKind === "connected") {
          if (connectedType === "na") return `(${target}) ضمير متصل، والضمائر المتصلة من الأسماء المبنية. هنا وقع على الضمير فعل الشكر، وفي شكرَنا بقي الفعل مبنيًا على الفتح قبل نا لأنها نا المفعولين؛ لذلك نقول: في محل نصب مفعول به.`;
          return `(${target}) ضمير متصل، والضمائر المتصلة من الأسماء المبنية. لا تظهر عليها علامة نصب، بل تكون في محل نصب مفعول به.`;
        }
        if (roleKind === "mabni") {
          const label = mabniType === "ishara" ? "اسم إشارة" : mabniType === "mawsool" ? "اسم موصول" : "اسم مبني";
          return `(${target}) ${label} من الأسماء المبنية؛ لا نبحث عن فتحة على آخره، بل نحدد نوعه ثم نقول: في محل نصب مفعول به.`;
        }
        if (roleKind === "masdar") return `(${target}) ليس اسمًا مبنيًا؛ بل تركيب يؤول بمصدر في معنى اسم. لذلك نقول: مصدر مؤول في محل نصب مفعول به.`;
        return `الاسم الظاهر المعرب نكمل معه إلى علامة النصب. أما الاسم المبني والضمير المتصل فنقول: في محل نصب مفعول به. وأما المصدر المؤول فنقول: مصدر مؤول في محل نصب مفعول به.`;
      }

      if (nodeId === "mafool_mu3rab_shape") {
        if (shape === "singular") return `(${target}) اسم ظاهر يدل على شيء واحد، وليس مثنى ولا جمعًا ولا من الأسماء الخمسة؛ لذلك صورته مفرد، وعلامة نصب المفرد الفتحة.`;
        if (shape === "dual") return pickedSingular
          ? `(${target}) ليست مفردًا؛ لأنها تدل على اثنين، وانتهت بياء ونون لأنها منصوبة، لذلك صورتها مثنى، وعلامة نصب المثنى الياء.`
          : `(${target}) يدل على اثنين، وانتهى بياء ونون لأنه منصوب، لذلك صورته مثنى، وعلامة نصب المثنى الياء.`;
        if (shape === "jms") return pickedSingular
          ? `(${target}) ليست مفردًا؛ لأنها تدل على جماعة ذكور عاقلة، وانتهت بياء ونون لأنها منصوبة، لذلك صورتها جمع مذكر سالم، وعلامة نصب جمع المذكر السالم الياء.`
          : `(${target}) جمع مذكر سالم؛ يدل على جماعة ذكور عاقلة، وانتهى بياء ونون لأنه منصوب، لذلك علامة نصبه الياء.`;
        if (shape === "jfs") return pickedSingular
          ? `(${target}) ليست مفردًا؛ لأنها جمع مؤنث سالم؛ تدل على جماعة إناث، وانتهت بألف وتاء زائدتين، وعلامة نصب جمع المؤنث السالم الكسرة نيابة عن الفتحة.`
          : `(${target}) جمع مؤنث سالم؛ جمع مؤنث مختوم بألف وتاء زائدتين، وينصب بالكسرة نيابة عن الفتحة.`;
        if (shape === "jt") return pickedSingular
          ? `(${target}) ليست مفردًا؛ لأنها جمع تكسير، تغيّرت فيه صورة المفرد عند الجمع، وعلامة نصب جمع التكسير الفتحة.`
          : `(${target}) جمع تكسير؛ تغيّرت صورة مفرده عند الجمع، وينصب بالفتحة غالبًا.`;
        if (shape === "five") return pickedSingular
          ? `صحيح أن (${target}) يدل على واحد، لكنه ليس مفردًا عاديًا في الإعراب؛ لأنه من الأسماء الخمسة، وقد جاء مفردًا مضافًا إلى غير ياء المتكلم، لذلك ينصب بالألف.`
          : `(${target}) من الأسماء الخمسة، وقد تحققت شروط إعرابها بالحروف: مفردة، مضافة، ومضافة إلى غير ياء المتكلم؛ لذلك علامة نصبها الألف.`;
      }

      if (nodeId === "mafool_nasb_mark") {
        if (shape === "singular") return `(${target}) مفرد منصوب، وعلامة نصب المفرد هنا الفتحة الظاهرة.`;
        if (shape === "dual") return `(${target}) مثنى، وعلامة نصب المثنى الياء لا بالفتحة.`;
        if (shape === "jms") return `(${target}) جمع مذكر سالم، وعلامة نصب جمع المذكر السالم الياء.`;
        if (shape === "jfs") return `(${target}) جمع مؤنث سالم، وعلامة نصب جمع المؤنث السالم الكسرة نيابة عن الفتحة.`;
        if (shape === "jt") return `(${target}) جمع تكسير، وعلامة نصب جمع التكسير الفتحة مثل المفرد العادي.`;
        if (shape === "five") return `(${target}) من الأسماء الخمسة المستوفية للشروط: مفردة، مضافة، ومضافة إلى غير ياء المتكلم؛ لذلك علامة نصبه الألف.`;
      }

      if (nodeId === "mafool_mabni_type") {
        if (roleKind === "connected" && connectedType === "na") return `(${target}) ضمير متصل وقع عليه الفعل. في شكرَنا بقي الفعل مبنيًا على الفتح قبل نا؛ لأن نا هنا ضمير نصب مفعول به لا ضمير رفع فاعل. لذلك نختار ضميرًا متصلًا.`;
        if (roleKind === "connected") return `(${target}) ضمير متصل وقع عليه الفعل؛ لذلك هو من الأسماء المبنية في محل نصب مفعول به.`;
        if (mabniType === "ishara") return `(${target}) اسم إشارة من الأسماء المبنية. إذا وقع عليه الفعل قلنا: اسم إشارة مبني في محل نصب مفعول به.`;
        if (mabniType === "mawsool") return `(${target}) اسم موصول من الأسماء المبنية، وبعده صلة توضحه. إذا وقع عليه الفعل قلنا: اسم موصول مبني في محل نصب مفعول به.`;
      }

      return null;
    }

    const faelHint = faelSpecificHint();
    if (faelHint) return teacherSequenceText(node, faelHint);

    const mafoolHint = mafoolSpecificHint();
    if (mafoolHint) return teacherSequenceText(node, mafoolHint);

    if (answer.hint) return teacherSequenceText(node, answer.hint);

    if (node.id === "m0_wordType" || node.id === "first_word_type" || node.id === "mubtada_word_type") {
      if ((picked === "حرف" || picked === "فعل") && facts.nounKind === "masdar") {
        return teacherSequenceText(node, teacherPrefix + `انتبه: ${target} ليست حرفًا منفردًا هنا؛ هذا مصدر مؤول. يمكن أن تضع بدل (أن تحفظ) كلمة (حفظ)، فيستقيم المعنى؛ لذلك فالمصدر المؤول مجتمعًا يُعامل معاملة الاسم، ويكون في محل رفع مبتدأ.`);
      }
      if ((picked === "حرف" || picked === "فعل") && facts.nounKind === "mabni") {
        return teacherSequenceText(node, teacherPrefix + `انتبه: ${target} ليس حرفًا هنا؛ بل هو من الأسماء المبنية. الاسم المبني قد يشبه الحرف في ثبات آخره، لكنه يبقى اسمًا، ولذلك يمكن أن يقع مبتدأ ويُعرب في محل رفع.`);
      }
      if ((picked === "حرف" || picked === "فعل") && facts.wordType === "noun") {
        return teacherSequenceText(node, teacherPrefix + `انتبه: ${target} اسم وليس ${picked}. اختبره بعلامات الاسم: قد يقبل التعريف أو يقع في موقع اسم داخل الجملة، لذلك نتابع في مسار المبتدأ.`);
      }
    }

    if (node.id === "mubtada_type" && facts.nounKind === "masdar") {
      return teacherSequenceText(node, teacherPrefix + sourceMasdarHint(target) + " اختر (مصدر مؤول) لأننا لا نعرب (أن) وحدها هنا، بل التركيب المؤول كله.");
    }

    if (node.id === "m1_nounKind" || node.id === "mubtada_start") {
      if (facts.nounKind === "masdar") {
        return teacherSequenceText(node, teacherPrefix + `هذا مصدر مؤول: يمكن أن تستبدل تركيب (أن + الفعل) بمصدر صريح مثل: حفظ، فيستقيم المعنى. لذلك لا نتعامل مع (أن) وحدها كحرف في هذا الموضع، بل مع المصدر المؤول كله كاسم في محل رفع مبتدأ.`);
      }
      if (facts.nounKind === "mabni") {
        return teacherSequenceText(node, teacherPrefix + `انتبه: ${target} من الأسماء المبنية، وليس اسمًا معربًا. الاسم المبني يلزم آخره صورة واحدة، لكنه يعرب بحسب موقعه: هنا في محل رفع مبتدأ.`);
      }
      if (facts.nounKind === "mu3rab") {
        return teacherSequenceText(node, teacherPrefix + `انتبه: ${target} اسم معرب؛ أي تتغير علامته بحسب موقعه. لذلك نتابع إلى العدد ونوع آخر الكلمة لتحديد علامة الرفع.`);
      }
    }

    if (node.id === "m2_mabniType" || node.id === "mubtada_built_type" || node.id === "mubtada_built") {
      return teacherSequenceText(node, teacherPrefix + `راجع نوع الاسم المبني نفسه: هل هو ضمير، اسم إشارة، اسم موصول، اسم استفهام، اسم شرط، أو كم الخبرية؟ اختر النوع المطابق للكلمة: ${target}.`);
    }

    if (node.id === "m2_number" || node.id === "mubtada_number") {
      if (picked.includes("مثنى")) return teacherSequenceText(node, teacherPrefix + `المثنى يدل على اثنين، وغالبًا ينتهي بـ(ان) رفعًا أو (ين) نصبًا وجرًا. انظر إلى ${target}: هل يدل على اثنين؟`);
      if (picked.includes("جمع مذكر")) return teacherSequenceText(node, teacherPrefix + `جمع المذكر السالم يدل على جماعة ذكور عاقلة وينتهي غالبًا بـ(ون/ين). هل ${target} كذلك؟`);
      if (picked.includes("جمع مؤنث")) return teacherSequenceText(node, teacherPrefix + `جمع المؤنث السالم ينتهي غالبًا بـ(ات). هل ${target} ينتهي بـ(ات) ويدل على جماعة مؤنثة؟`);
      if (picked.includes("جمع تكسير")) return teacherSequenceText(node, teacherPrefix + `جمع التكسير يدل على أكثر من اثنين مع تغيّر صورة المفرد مثل كتاب/كتب. هل ${target} جمع بهذا المعنى؟`);
      if (picked.includes("الأسماء الخمسة")) return teacherSequenceText(node, teacherPrefix + `الأسماء الخمسة هي: أب، أخ، حم، فو، ذو بمعنى صاحب. ولا تعرب بالحروف إلا إذا كانت مفردة، مضافة، غير مضافة إلى ياء المتكلم. هل ${target} واحد منها؟`);
      return teacherSequenceText(node, teacherPrefix + `راجع صورة ${target}: هل تدل على واحد، اثنين، أم جماعة؟ العدد يحدد علامة الرفع في مسار المبتدأ.`);
    }

    if (node.id === "m3_singularKind") {
      return teacherSequenceText(node, teacherPrefix + `ركز في آخر ${target}: هل آخره حرف صحيح، أم حرف علة، أم أنه من الأسماء الخمسة؟ نوع الآخر هو الذي يحدد علامة الرفع.`);
    }

    if (node.id === "m3_pluralType") {
      return teacherSequenceText(node, teacherPrefix + `راجع نوع الجمع في ${target}: علامة رفع جمع المذكر السالم الواو، أما جمع المؤنث السالم وجمع التكسير فيرفعان بالضمة في هذا المسار.`);
    }

    if (String(node.id || "").includes("built_type") || String(node.id || "").includes("mabniType")) {
      const examples = "ضمير مثل (هو، إياه)، اسم إشارة مثل (هذا، هذه)، اسم موصول مثل (الذي، التي)، اسم استفهام مثل (من، ما)، اسم شرط مثل (من، مهما)، أو كم الخبرية";
      return teacherSequenceText(node, teacherPrefix + `حدّد نوع الاسم المبني في ${target}. الأسماء المبنية لا تتغير حركة آخرها. قارن الكلمة بالأمثلة: ${examples}. بعد تحديد النوع يبدأ الإعراب باسمه: اسم موصول مبني في محل...`);
    }

    return teacherSequenceText(node, teacherPrefix + (node.hint || node.teaching_note || "راجع خصائص الكلمة ثم اختر الإجابة التي تطابق المثال."));
  }

  function closeHint() {
    setShowHint(false);
    setHintBubble(null);
    setHighlightedAnswerKey(null);
    setHighlightedAnswerKind(null);
  }

  function openHintBubble(nodeId: string, text: string, anchor?: { x: number; y: number }) {
    const scrollBox = canvasScrollRef.current;
    const node = layoutNodeMap.get(nodeId);
    if (!scrollBox || !node) {
      setHintBubble({ text, left: 18, top: 18, placement: "below" });
      return;
    }

    const viewportW = scrollBox.clientWidth;
    const viewportH = scrollBox.clientHeight;
    const nodeLeft = (anchor?.x ?? node.x) * zoom - scrollBox.scrollLeft;
    const nodeTop = (anchor?.y ?? node.y) * zoom - scrollBox.scrollTop;
    const nodeW = anchor ? 1 : node.w * zoom;
    const nodeH = anchor ? 1 : node.h * zoom;
    const bubbleW = Math.min(300, Math.max(210, viewportW - 36));
    const bubbleH = 150;
    const gap = 16;

    let placement: HintBubble["placement"] = "right";
    let left = nodeLeft + nodeW + gap;
    let top = nodeTop + nodeH / 2 - bubbleH / 2;

    if (viewportW - (nodeLeft + nodeW) >= bubbleW + gap) {
      placement = "right";
    } else if (nodeLeft >= bubbleW + gap) {
      placement = "left";
      left = nodeLeft - bubbleW - gap;
    } else if (nodeTop >= bubbleH + gap) {
      placement = "above";
      left = nodeLeft + nodeW / 2 - bubbleW / 2;
      top = nodeTop - bubbleH - gap;
    } else {
      placement = "below";
      left = nodeLeft + nodeW / 2 - bubbleW / 2;
      top = nodeTop + nodeH + gap;
    }

    left = Math.max(12, Math.min(left, viewportW - bubbleW - 12));
    top = Math.max(12, Math.min(top, viewportH - bubbleH - 12));
    setHintBubble({ text, left, top, placement });
  }

  function showHintNearAnswer(nodeId: string) {
    const node = tree.nodes[nodeId];
    const hintText = node
      ? firstLevelHintText(node.id, node.hint || node.teaching_note, example?.target, node.text)
      : "راجع الكلمة في المثال، ثم اختر الدليل المناسب.";
    setShowHint(true);
    setHighlightedAnswerKey(null);
    setHighlightedAnswerKind(null);
    openHintBubble(nodeId, hintText);
  }


  function handleAnswer(nodeId: string, answerId: string, anchor?: { x: number; y: number }) {
    if (!example || nodeId !== activeNodeId) return;
    const node = tree.nodes[nodeId];
    if (!node || !node.answers) return;
    const answer = node.answers.find((a) => a.id === answerId);
    if (!answer) return;

    const correct = answerIsCorrect(answer, example);
    if (!correct) {
      const hintText = diagnosticHintText(targetedHintForWrongAnswer(node, answer, example), example?.target);
      setShowHint(true);
      setHighlightedAnswerKey(`${nodeId}:${answerId}`);
      setHighlightedAnswerKind("wrong");
      openHintBubble(nodeId, hintText, anchor);
      return;
    }

    const nextId = resolveNextNodeId(answer, example);
    const nextNode = tree.nodes[nextId];
    setPathSteps((steps) => [...steps, `${node.text} ← ${answer.text}`]);
    setVisitedNodes((v) => [...v, nextId]);
    setVisitedEdges((v) => [...v, `${nodeId}->${nextId}`]);
    setHighlightedAnswerKey(`${nodeId}:${answerId}`);
    setHighlightedAnswerKind("correct");
    setShowHint(false);
    setHintBubble(null);

    if (nextNode?.type === "result") {
      setActiveNodeId(nextId);
      setFinalNodeId(nextId);
    } else {
      setFinalNodeId(null);
      setActiveNodeId(nextId);
    }
  }

  function fitPathToViewport() {
    const scrollBox = canvasScrollRef.current;
    if (!scrollBox || !layout) return;
    closeHint();
    setShowFullMap(true);
    const fittedZoom = Math.max(
      MIN_ZOOM,
      Math.min(1, (scrollBox.clientWidth - 28) / Math.max(layout.width, 1))
    );
    setZoom(Number(fittedZoom.toFixed(2)));
    requestAnimationFrame(() => requestAnimationFrame(() => {
      scrollBox.scrollTo({ left: 0, top: 0, behavior: "smooth" });
    }));
  }

  function returnToCurrentPath() {
    closeHint();
    setShowFullMap(false);
    const focusId = finalNodeId || activeNodeId || tree.startNodeId;
    requestAnimationFrame(() => focusNode(focusId, finalNodeId ? 0.96 : 1.02));
  }

  if (!layout) return null;

  const visibleNodeIds = new Set<string>(["__exercise__", ...visitedNodes]);
  if (activeNodeId) {
    visibleNodeIds.add(activeNodeId);
    layout.edges.forEach((edge) => {
      if (edge.from === activeNodeId) visibleNodeIds.add(edge.to);
    });
  }
  if (finalNodeId) visibleNodeIds.add(finalNodeId);

  const visibleEdgeKeys = new Set<string>(visitedEdges);
  if (activeNodeId) {
    layout.edges.forEach((edge) => {
      if (edge.from === activeNodeId) visibleEdgeKeys.add(`${edge.from}->${edge.to}`);
    });
  }

  const stepNumber = finalNodeId ? pathSteps.length : pathSteps.length + 1;
  const currentResult = finalNodeId
    ? String(example?.facts?.finalI3rab || tree.nodes[finalNodeId]?.text || "اكتمل المسار")
    : "";

  return (
    <section className="card paths-react-card">
      <header className="paths-react-head">
        <div>
          <span className="section-kicker">مسار بصري تفاعلي</span>
          <h1 className="h1">{title}</h1>
          {subtitle ? <p className="p">{subtitle}</p> : null}
        </div>
        <p className="paths-react-map-intro">اختر من داخل العقدة الحالية؛ يظهر مسار المثال تدريجيًا.</p>
      </header>

      {example ? (
        <section className="paths-example-strip" aria-label="المثال الحالي">
          <div className="paths-example-copy">
            <span>المثال {currentExampleIndex + 1} من {examples.length}</span>
            <strong>{example.sentence}</strong>
          </div>
          <div className="paths-example-meta">
            <span>الكلمة الهدف</span>
            <b>{example.target}</b>
            <small>{finalNodeId ? "اكتمل المسار" : `الخطوة ${stepNumber}`}</small>
          </div>
        </section>
      ) : null}

      <div className={`paths-react-board-wrap ${finalNodeId ? "has-final-result" : ""}`}>
        <div className="paths-react-workbar">
          <div className="paths-react-workbar-left">
            <button type="button" className="btn btn-primary" onClick={startNextExercise} disabled={!examples.length}>
              مثال آخر
            </button>
            <button type="button" className="btn btn-soft" onClick={restartCurrentExercise} disabled={!example}>
              إعادة المثال
            </button>
            <button
              type="button"
              className="btn btn-soft"
              onClick={() => {
                if (!activeNodeId) return;
                if (showHint) {
                  closeHint();
                  return;
                }
                showHintNearAnswer(activeNodeId);
              }}
              disabled={!activeNodeId || Boolean(finalNodeId)}
            >
              {showHint ? PATHS_COPY.hideHintButton : PATHS_COPY.hintButton}
            </button>
          </div>

          <div className="paths-react-zoom-tools" aria-label="أدوات عرض المسار">
            <button
              type="button"
              className="btn btn-soft btn-zoom"
              aria-label="تصغير المسار"
              onClick={() => {
                closeHint();
                setZoom((z) => Math.max(MIN_ZOOM, +(z - 0.1).toFixed(2)));
              }}
            >
              {PATHS_COPY.zoomOut}
            </button>
            <button
              type="button"
              className="btn btn-soft btn-fit"
              onClick={showFullMap ? returnToCurrentPath : fitPathToViewport}
            >
              {showFullMap ? "العودة إلى المسار" : "عرض الخريطة كاملة"}
            </button>
            <button
              type="button"
              className="btn btn-soft btn-zoom"
              aria-label="تكبير المسار"
              onClick={() => {
                closeHint();
                setZoom((z) => Math.min(MAX_ZOOM, +(z + 0.1).toFixed(2)));
              }}
            >
              {PATHS_COPY.zoomIn}
            </button>
          </div>
        </div>

        {finalNodeId ? (
          <section className="paths-final-result-card" role="status" aria-live="polite">
            <div className="paths-final-result-copy">
              <span>الإعراب النهائي</span>
              <strong>{currentResult}</strong>
            </div>
            <div className="paths-final-result-actions">
              <button type="button" className="btn btn-primary" onClick={startNextExercise}>
                انتقل إلى المثال التالي
              </button>
              <button type="button" className="btn btn-soft" onClick={restartCurrentExercise}>
                أعد هذا المثال
              </button>
            </div>
          </section>
        ) : null}

        <div className="paths-react-canvas-shell">
          <div ref={canvasScrollRef} className="paths-react-canvas-scroll">
            <div className="paths-react-canvas-stage" style={{ width: layout.width * zoom, height: layout.height * zoom }}>
              <svg
                viewBox={`0 0 ${layout.width} ${layout.height}`}
                width={layout.width * zoom}
                height={layout.height * zoom}
                className="paths-react-svg"
                preserveAspectRatio="xMinYMin meet"
                aria-label={`المسار البصري لموضوع ${title}`}
              >
                <defs>
                  <marker id="pathsArrow" markerWidth="6" markerHeight="6" refX="5.4" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6 Z" fill="#94a3b8" />
                  </marker>
                  <marker id="pathsArrowActive" markerWidth="7" markerHeight="7" refX="6.2" refY="3.5" orient="auto">
                    <path d="M0,0 L7,3.5 L0,7 Z" fill="#137f7a" />
                  </marker>
                </defs>

                {layout.edges.map((edge, edgeIndex) => {
                  const edgeKey = `${edge.from}->${edge.to}`;
                  if (!showFullMap && !visibleEdgeKeys.has(edgeKey)) return null;
                  const from = layoutNodeMap.get(edge.from);
                  const to = layoutNodeMap.get(edge.to);
                  if (!from || !to) return null;
                  const active = visitedEdges.includes(edgeKey);
                  const preview = !active;
                  const startPoint = centerBottom(from);
                  const endPoint = centerTop(to);
                  const midX = (startPoint.x + endPoint.x) / 2;
                  const midY = (startPoint.y + endPoint.y) / 2 - 10;
                  return (
                    <g key={`${edge.from}-${edge.to}-${edgeIndex}`}>
                      <path
                        d={pathD(startPoint, endPoint)}
                        className={`paths-react-edge ${active ? "is-active" : ""} ${preview ? "is-preview" : ""}`}
                        fill="none"
                        markerEnd={active ? "url(#pathsArrowActive)" : "url(#pathsArrow)"}
                      />
                      {edge.label ? (
                        <text
                          x={midX}
                          y={midY}
                          textAnchor="middle"
                          className={`paths-react-edge-label ${active ? "is-active" : ""}`}
                        >
                          {shortEdgeLabel(edge.label)}
                        </text>
                      ) : null}
                    </g>
                  );
                })}

                {layout.nodes.map((n) => {
                  if (!showFullMap && !visibleNodeIds.has(n.id)) return null;
                  const visited = visitedNodes.includes(n.id);
                  const active = activeNodeId === n.id;
                  const isStart = n.kind === "start";
                  const isQuestion = n.kind === "question";
                  const isResult = n.kind === "result";
                  const isFinalResult = finalNodeId === n.id;
                  const preview = !active && !visited;
                  const renderedNodeLines = n.textLines;

                  return (
                    <g
                      key={n.id}
                      className={`paths-react-node ${isStart ? "is-start paths-react-start-clickable" : ""} ${isQuestion ? "is-question" : ""} ${isResult ? "is-result" : ""} ${active ? "is-active" : ""} ${visited ? "is-visited" : ""} ${preview ? "is-preview" : ""}`}
                      role={isStart ? "button" : undefined}
                      tabIndex={isStart ? 0 : undefined}
                      aria-label={isStart ? "إعادة بدء المثال الحالي" : undefined}
                      onClick={isStart ? restartCurrentExercise : undefined}
                      onKeyDown={isStart ? (event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          restartCurrentExercise();
                        }
                      } : undefined}
                    >
                      {isQuestion ? (
                        <polygon points={diamondPoints(n.x, n.y, n.w, n.h)} />
                      ) : (
                        <rect
                          x={n.x}
                          y={n.y}
                          width={n.w}
                          height={n.h}
                          rx={18}
                          className={isFinalResult ? "paths-react-result-pulse" : ""}
                        />
                      )}

                      {renderedNodeLines.map((line, i, renderedLines) => {
                        const answerLabels = (n.node?.answers || []).map((answer) => shortPathAnswerLabel(answer.text));
                        const instructionY = isQuestion ? answerInstructionY(n, answerLabels) : 0;
                        const lineGap = isQuestion ? 23 : (isResult ? 25 : 22);
                        const textBlockHeight = Math.max(lineGap, renderedLines.length * lineGap);
                        const questionTextTop = isQuestion
                          ? n.y + Math.max(46, (instructionY - n.y - textBlockHeight) / 2)
                          : 0;
                        const y = isQuestion
                          ? questionTextTop + i * lineGap
                          : n.y + n.h / 2 + (i - (renderedLines.length - 1) / 2) * lineGap;
                        return (
                          <text
                            key={`${n.id}-${i}`}
                            x={n.x + n.w / 2}
                            y={y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className={isQuestion ? "paths-react-question-text" : "paths-react-box-text"}
                          >
                            {line}
                          </text>
                        );
                      })}

                      {isQuestion && active ? (
                        <text
                          x={n.x + n.w / 2}
                          y={answerInstructionY(n, (n.node?.answers || []).map((answer) => shortPathAnswerLabel(answer.text)))}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="paths-react-question-instruction"
                        >
                          اختر الإجابة:
                        </text>
                      ) : null}

                      {isQuestion && active && n.node?.answers ? (
                        <g>
                          {n.node.answers.map((answer, idx) => {
                            const labels = n.node!.answers!.map((item) => shortPathAnswerLabel(item.text));
                            const { bx, by, btnW, btnH } = answerButtonLayout(n, labels, idx);
                            const answerHighlighted = highlightedAnswerKey === `${n.id}:${answer.id}`;
                            const answerLines = splitText(shortPathAnswerLabel(answer.text), btnW > 200 ? 28 : 17).slice(0, 2);
                            return (
                              <g
                                key={answer.id}
                                className={`paths-react-answer ${answerHighlighted ? "paths-react-answer-selected" : ""} ${answerHighlighted && highlightedAnswerKind === "wrong" ? "paths-react-answer-selected-wrong" : ""} ${answerHighlighted && highlightedAnswerKind === "correct" ? "paths-react-answer-selected-correct" : ""}`}
                                role="button"
                                tabIndex={0}
                                aria-label={answer.text}
                                onClick={() => handleAnswer(n.id, answer.id, { x: bx + btnW / 2, y: by + btnH / 2 })}
                                onKeyDown={(event) => {
                                  if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    handleAnswer(n.id, answer.id, { x: bx + btnW / 2, y: by + btnH / 2 });
                                  }
                                }}
                              >
                                <rect x={bx} y={by} width={btnW} height={btnH} rx={11} />
                                <text x={bx + btnW / 2} y={by + btnH / 2} textAnchor="middle" dominantBaseline="middle" className="paths-react-answer-text">
                                  {answerLines.map((line, lineIndex) => (
                                    <tspan
                                      key={`${answer.id}-${lineIndex}`}
                                      x={bx + btnW / 2}
                                      dy={lineIndex === 0 ? (answerLines.length === 1 ? 0 : -7) : 14}
                                    >
                                      {line}
                                    </tspan>
                                  ))}
                                </text>
                              </g>
                            );
                          })}
                        </g>
                      ) : null}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {showHint && hintBubble ? (
            <div
              className={`paths-hint-bubble paths-hint-bubble-${hintBubble.placement}`}
              style={{ left: hintBubble.left, top: hintBubble.top }}
              role="status"
              aria-live="polite"
              dir="rtl"
            >
              <div className="paths-hint-text">{hintBubble.text}</div>
              <button type="button" onClick={closeHint}>حسنًا</button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
