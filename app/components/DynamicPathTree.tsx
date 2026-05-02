"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type TreeNode = {
  id: string;
  type: string;
  text: string;
  teaching_note?: string;
  hint?: string;
  answers?: { id: string; text: string; next: string; eval?: { fact: string; equals: string } }[];
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

const BOX_W = 250;
const BOX_H = 116;
const DIA_W = 230;
const DIA_H = 132;
const LEVEL_GAP = 190;
const SIBLING_GAP = 46;

function splitText(text?: string, max = 28) {
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
  return lines.slice(0, 6);
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

function answerIsCorrect(answer: { eval?: { fact: string; equals: string } }, example: Example | null) {
  if (!example || !answer.eval) return false;
  return example.facts?.[answer.eval.fact] === answer.eval.equals;
}

function buildTreeLayout(tree: ExerciseTree, example: Example | null) {
  const nodes = tree.nodes;
  const rootId = tree.startNodeId;
  const childrenMap = new Map<string, string[]>();
  Object.values(nodes).forEach((n) => {
    childrenMap.set(n.id, (n.answers || []).map((a) => a.next));
  });

  const widths = new Map<string, number>();
  function measure(id: string): number {
    if (widths.has(id)) return widths.get(id)!;
    const kids = childrenMap.get(id) || [];
    if (!kids.length) {
      widths.set(id, 1);
      return 1;
    }
    const sum = kids.map(measure).reduce((a, b) => a + b, 0);
    widths.set(id, sum || 1);
    return sum || 1;
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
    const w = isQuestion ? DIA_W : BOX_W;
    const h = isQuestion ? DIA_H : BOX_H;

    placed.set(id, {
      id,
      kind: isQuestion ? "question" : "result",
      x,
      y,
      w,
      h,
      textLines: splitText(node.text, isQuestion ? 18 : 24),
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
    h: BOX_H,
    textLines: example
      ? [splitText(example.sentence, 22).join(" "), `الكلمة الهدف: ${example.target}`]
      : ["هنا يبدأ مسار هذا الموضوع", "خطوة خطوة معًا"],
    node: null,
  };

  const all = [startNode, ...Array.from(placed.values())];
  const minX = Math.min(...all.map((n) => n.x));
  const maxX = Math.max(...all.map((n) => n.x + n.w));
  const maxY = Math.max(...all.map((n) => n.y + n.h));

  all.forEach((n) => {
    n.x = n.x - minX + 60;
  });

  // اجعل مربع البداية ظاهرًا ومفهومًا عند فتح الصفحة، بدل أن يبدأ الطالب وسط مساحة بيضاء.
  const visibleStart = all.find((n) => n.id === startNode.id);
  if (visibleStart) {
    const targetStartX = 380;
    const delta = targetStartX - visibleStart.x;
    all.forEach((n) => {
      n.x += delta;
    });
    const minAfter = Math.min(...all.map((n) => n.x));
    if (minAfter < 40) {
      const correction = 40 - minAfter;
      all.forEach((n) => {
        n.x += correction;
      });
    }
  }

  const edges: { from: string; to: string; label?: string }[] = [{ from: startNode.id, to: rootId }];
  Object.values(nodes).forEach((node) => {
    (node.answers || []).forEach((answer) => {
      edges.push({ from: node.id, to: answer.next, label: answer.text });
    });
  });

  const finalMaxX = Math.max(...all.map((n) => n.x + n.w));
  const width = Math.max(finalMaxX + 80, 920);
  const height = maxY + 130;
  return { nodes: all, edges, width, height };
}

export default function DynamicPathTree({ tree, examples, title, subtitle }: Props) {
  const [example, setExample] = useState<Example | null>(null);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [visitedNodes, setVisitedNodes] = useState<string[]>([]);
  const [visitedEdges, setVisitedEdges] = useState<string[]>([]);
  const [message, setMessage] = useState("هيا نطبق بصريًا: اضغط هيا نبدأ ليظهر أول مثال من هذا الموضوع داخل المربع الأول.");
  const [showHint, setShowHint] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [hintBubble, setHintBubble] = useState(null as null | { left: number; top: number; text: string });
  const [floatingHintText, setFloatingHintText] = useState<string | null>(null);
  const [currentExampleIndex, setCurrentExampleIndex] = useState(-1);
  const [finalNodeId, setFinalNodeId] = useState<string | null>(null);
  const [highlightedAnswerKey, setHighlightedAnswerKey] = useState<string | null>(null);
  const [highlightedAnswerKind, setHighlightedAnswerKind] = useState<"correct" | "wrong" | "hint" | null>(null);
  const [pathSteps, setPathSteps] = useState<string[]>([]);
  const autoNextTimerRef = useRef(null as null | ReturnType<typeof setTimeout>);
  const canvasScrollRef = useRef<HTMLDivElement | null>(null);

  const layout = useMemo(() => buildTreeLayout(tree, example), [tree, example]);
  const layoutNodeMap = useMemo(() => {
    const map = new Map<string, PositionedNode>();
    layout?.nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [layout]);

  useEffect(() => {
    setVisitedNodes([]);
    setVisitedEdges([]);
    setActiveNodeId(null);
    setShowHint(false);
    setMessage("هيا نطبق بصريًا: اضغط هيا نبدأ ليظهر أول مثال من هذا الموضوع داخل المربع الأول.");
    setHintBubble(null);
    setFloatingHintText(null);
    setCurrentExampleIndex(-1);
    setFinalNodeId(null);
    setHighlightedAnswerKey(null);
    setHighlightedAnswerKind(null);
    setZoom(1);
    setPathSteps([]);
    if (autoNextTimerRef.current) clearTimeout(autoNextTimerRef.current);
  }, [tree]);

  useEffect(() => {
    if (!layout || !canvasScrollRef.current || activeNodeId || currentExampleIndex >= 0) return;
    const el = canvasScrollRef.current;
    const node = layoutNodeMap.get("__exercise__") || layoutNodeMap.get(tree.startNodeId);
    requestAnimationFrame(() => {
      if (!node) return;
      el.dir = "ltr";
      const left = Math.max(0, node.x * zoom - (el.clientWidth - node.w * zoom) / 2);
      const top = Math.max(0, node.y * zoom - 18);
      el.scrollTo({ left, top, behavior: "auto" });
    });
  }, [layout, zoom, activeNodeId, currentExampleIndex, layoutNodeMap, tree.startNodeId]);

  useEffect(() => {
    if (!example || activeNodeId !== tree.startNodeId) return;
    const t = setTimeout(() => focusNode("__exercise__", 1.02), 260);
    return () => clearTimeout(t);
  }, [example?.id, activeNodeId, tree.startNodeId, layout]);

  useEffect(() => {
    return () => {
      if (autoNextTimerRef.current) clearTimeout(autoNextTimerRef.current);
    };
  }, []);

  function focusNode(nodeId: string, targetZoom = 1.08) {
    if (!layout || !canvasScrollRef.current) return;
    const node = layoutNodeMap.get(nodeId);
    if (!node) return;

    const nextZoom = Math.max(1, Math.min(1.22, targetZoom));
    setZoom(nextZoom);

    requestAnimationFrame(() => {
      const el = canvasScrollRef.current;
      if (!el) return;
      el.dir = "ltr";
      const scaledLeft = node.x * nextZoom;
      const scaledTop = node.y * nextZoom;
      const scaledW = node.w * nextZoom;
      const scaledH = node.h * nextZoom;
      const left = Math.max(0, scaledLeft - (el.clientWidth - scaledW) / 2);
      const top = Math.max(0, scaledTop - Math.max(34, (el.clientHeight - scaledH) * 0.42));
      el.scrollTo({ left, top, behavior: "smooth" });
    });
  }

  function answerAnchorFor(nodeId: string, answerId: string) {
    const node = layoutNodeMap.get(nodeId);
    const treeNode = tree.nodes[nodeId];
    if (!node || !treeNode?.answers) return null;

    const idx = treeNode.answers.findIndex((a: any) => a.id === answerId);
    if (idx < 0) return null;

    const count = treeNode.answers.length;
    const btnW = Math.max(48, Math.min(82, node.w / Math.max(2, count) - 8));
    const totalW = count * btnW + (count - 1) * 5;
    const startX = node.x + (node.w - totalW) / 2;
    const bx = startX + idx * (btnW + 5);
    const by = node.y + node.h - 24;
    return { x: bx + btnW / 2, y: by + 10 };
  }

  function resetProgress(nextExample: Example | null) {
    setExample(nextExample);
    setVisitedNodes(["__exercise__", tree.startNodeId]);
    setVisitedEdges([`__exercise__->${tree.startNodeId}`]);
    setActiveNodeId(tree.startNodeId);
    setShowHint(false);
    setHintBubble(null);
    setFloatingHintText(null);
    setHighlightedAnswerKey(null);
    setHighlightedAnswerKind(null);
    setFinalNodeId(null);
    setMessage("ابدأ من السؤال الأول داخل الشجرة.");
    setPathSteps([]);
  }

  function startExampleAt(index: number) {
    if (!examples.length) return;
    const safeIndex = ((index % examples.length) + examples.length) % examples.length;
    setCurrentExampleIndex(safeIndex);
    const next = examples[safeIndex] || null;
    resetProgress(next);
    setTimeout(() => focusNode("__exercise__", 1.02), 260);
  }

  function startNextExercise() {
    const nextIndex = currentExampleIndex < 0 ? 0 : (currentExampleIndex + 1) % examples.length;
    startExampleAt(nextIndex);
  }


  function targetedHintForWrongAnswer(node: TreeNode, answer: { text: string; eval?: { fact: string; equals: string } }, currentExample: Example | null) {
    const target = currentExample?.target || "الكلمة الهدف";
    const facts = currentExample?.facts || {};
    const picked = answer.text;

    if (node.id === "m0_wordType") {
      if ((picked === "حرف" || picked === "فعل") && facts.nounKind === "masdar") {
        return `انتبه: ${target} ليست حرفًا منفردًا هنا؛ هذا مصدر مؤول. يمكن أن تضع بدل (أن تحفظ) كلمة (حفظ)، فيستقيم المعنى؛ لذلك فالمصدر المؤول مجتمعًا يُعامل معاملة الاسم، ويكون في محل رفع مبتدأ.`;
      }
      if ((picked === "حرف" || picked === "فعل") && facts.nounKind === "mabni") {
        return `انتبه: ${target} ليس حرفًا هنا؛ بل هو من الأسماء المبنية. الاسم المبني قد يشبه الحرف في ثبات آخره، لكنه يبقى اسمًا، ولذلك يمكن أن يقع مبتدأ ويُعرب في محل رفع.`;
      }
      if ((picked === "حرف" || picked === "فعل") && facts.wordType === "noun") {
        return `انتبه: ${target} اسم وليس ${picked}. اختبره بعلامات الاسم: قد يقبل التعريف أو يقع في موقع اسم داخل الجملة، لذلك نتابع في مسار المبتدأ.`;
      }
    }

    if (node.id === "m1_nounKind") {
      if (facts.nounKind === "masdar") {
        return `هذا مصدر مؤول: يمكن أن تستبدل تركيب (أن + الفعل) بمصدر صريح مثل: حفظ، فيستقيم المعنى. لذلك لا نتعامل مع (أن) وحدها كحرف في هذا الموضع، بل مع المصدر المؤول كله كاسم في محل رفع مبتدأ.`;
      }
      if (facts.nounKind === "mabni") {
        return `انتبه: ${target} من الأسماء المبنية، وليس اسمًا معربًا. الاسم المبني يلزم آخره صورة واحدة، لكنه يعرب بحسب موقعه: هنا في محل رفع مبتدأ.`;
      }
      if (facts.nounKind === "mu3rab") {
        return `انتبه: ${target} اسم معرب؛ أي تتغير علامته بحسب موقعه. لذلك نتابع إلى العدد ونوع آخر الكلمة لتحديد علامة الرفع.`;
      }
    }

    if (node.id === "m2_mabniType") {
      return `راجع نوع الاسم المبني نفسه: هل هو ضمير، اسم إشارة، اسم موصول، اسم استفهام، اسم شرط، أو كم الخبرية؟ اختر النوع المطابق للكلمة: ${target}.`;
    }

    if (node.id === "m2_number") {
      return `راجع صورة ${target}: هل تدل على واحد، اثنين، أم جماعة؟ العدد يحدد علامة الرفع في مسار المبتدأ.`;
    }

    if (node.id === "m3_singularKind") {
      return `ركز في آخر ${target}: هل آخره حرف صحيح، أم حرف علة، أم أنه من الأسماء الخمسة؟ نوع الآخر هو الذي يحدد علامة الرفع.`;
    }

    if (node.id === "m3_pluralType") {
      return `راجع نوع الجمع في ${target}: جمع المذكر السالم يرفع بالواو، أما جمع المؤنث السالم وجمع التكسير فيرفعان بالضمة في هذا المسار.`;
    }

    if (String(node.id || "").includes("built_type") || String(node.id || "").includes("mabniType")) {
      const examples = "ضمير مثل (هو، إياه)، اسم إشارة مثل (هذا، هذه)، اسم موصول مثل (الذي، التي)، اسم استفهام مثل (من، ما)، اسم شرط مثل (من، مهما)، أو كم الخبرية";
      return `حدّد نوع الاسم المبني في ${target}. الأسماء المبنية لا تتغير حركة آخرها. قارن الكلمة بالأمثلة: ${examples}. بعد تحديد النوع يبدأ الإعراب باسمه: اسم موصول مبني في محل...`;
    }

    return node.hint || node.teaching_note || "راجع خصائص الكلمة ثم اختر الإجابة التي تطابق المثال.";
  }

  function showHintNearAnswer(nodeId: string) {
    const node = tree.nodes[nodeId];
    const hintText = node
      ? targetedHintForWrongAnswer(node, { text: "", eval: undefined }, example)
      : "راجع الإجابة الصحيحة ثم تابع.";
    setShowHint(true);
    setMessage(hintText);

    const correctAnswer = node?.answers?.find((a: any) => answerIsCorrect(a, example));
    if (correctAnswer) {
      const anchor = answerAnchorFor(nodeId, correctAnswer.id);
      if (anchor) {
        setHighlightedAnswerKey(`${nodeId}:${correctAnswer.id}`);
        setHighlightedAnswerKind("hint");
        setHintBubble({ left: anchor.x * zoom + 24, top: anchor.y * zoom + 42, text: hintText });
        setFloatingHintText(hintText);
      }
    }
  }

  function showBubbleBesideNode(nodeId: string, text: string, bubbleZoom = zoom) {
    const n = layoutNodeMap.get(nodeId);
    if (!n) return;
    setHintBubble({
      left: (n.x + n.w + 22) * bubbleZoom,
      top: (n.y + Math.max(22, n.h * 0.28)) * bubbleZoom,
      text,
    });
    setFloatingHintText(text);
  }

  function handleAnswer(nodeId: string, answerId: string, anchor?: { x: number; y: number }) {
    if (!example || nodeId !== activeNodeId) return;
    const node = tree.nodes[nodeId];
    if (!node || !node.answers) return;
    const answer = node.answers.find((a) => a.id === answerId);
    if (!answer) return;

    const correct = answerIsCorrect(answer, example);
    if (!correct) {
      const hintText = targetedHintForWrongAnswer(node, answer, example);
      setShowHint(true);
      setMessage(hintText);
      setHighlightedAnswerKey(`${nodeId}:${answerId}`);
      setHighlightedAnswerKind("wrong");
      if (anchor) {
        setHintBubble({
          left: anchor.x * zoom + 24,
          top: anchor.y * zoom + 42,
          text: hintText,
        });
        setFloatingHintText(hintText);
      }
      return;
    }

    const nextId = answer.next;
    const nextNode = tree.nodes[nextId];
    setPathSteps((steps) => [...steps, `${node.text} ← ${answer.text}`]);
    setVisitedNodes((v) => [...v, nextId]);
    setVisitedEdges((v) => [...v, `${nodeId}->${nextId}`]);
    setHighlightedAnswerKey(`${nodeId}:${answerId}`);
    setHighlightedAnswerKind("correct");
    setShowHint(false);
    if (anchor) {
      setHintBubble({
        left: anchor.x * zoom + 24,
        top: anchor.y * zoom + 42,
        text: `صحيح: ${answer.text} ← ننتقل للخطوة التالية.`,
      });
      setFloatingHintText(`صحيح: ${answer.text} ← ننتقل للخطوة التالية.`);
    } else {
      setHintBubble(null);
      setFloatingHintText(null);
    }

    if (nextNode?.type === "result") {
      setActiveNodeId(nextId);
      setFinalNodeId(nextId);
      const finalReason = nextNode.teaching_note || "اكتمل المسار ووصلتَ إلى الإعراب النهائي الصحيح.";
      const targetWord = example?.target ? `كلمة: ${example.target}` : "الكلمة المطلوبة";
      const finalText = `هكذا وصلنا لإعراب ${targetWord}: ${nextNode.text}. السبب: ${finalReason}`;
      setMessage(finalText);
      setTimeout(() => {
        focusNode(nextId, 1.06);
        showBubbleBesideNode(nextId, finalText, 1.06);
      }, 90);
      if (autoNextTimerRef.current) clearTimeout(autoNextTimerRef.current);
      autoNextTimerRef.current = setTimeout(() => {
        startExampleAt(currentExampleIndex < 0 ? 0 : currentExampleIndex + 1);
      }, 7000);
    } else {
      setFinalNodeId(null);
      setActiveNodeId(nextId);
      const stepText = nextNode?.teaching_note || "أحسنت. تابع إلى العقدة التالية.";
      setMessage(stepText);
      setTimeout(() => {
        focusNode(nextId, 1.04);
        showBubbleBesideNode(nextId, stepText, 1.04);
      }, 90);
    }
  }

  if (!layout) return null;

  return (
    <section className="card paths-react-card">
      <div className="paths-react-head">
        <div>
          <div className="section-kicker">شجرة تفاعلية</div>
          <h1 className="h1">{title}</h1>
          {subtitle ? <p className="p">{subtitle}</p> : null}
        </div>
      </div>

      <div className="paths-react-board-wrap">
        <div className="paths-react-workbar">
          <div className="paths-react-workbar-left">
            <button type="button" className="btn btn-soft paths-react-start-btn" onClick={() => startExampleAt(0)}>
              هيا نبدأ بصريًا
            </button>
            <button type="button" className="btn btn-primary btn-workbar-glow" onClick={startNextExercise}>
              تدريب جديد
            </button>
            <button
              type="button"
              className="btn btn-soft"
              onClick={() => {
                if (!activeNodeId) return;
                if (showHint) {
                  setShowHint(false);
                  setHintBubble(null);
                  setFloatingHintText(null);
                  setHighlightedAnswerKey(null);
                  setHighlightedAnswerKind(null);
                  return;
                }
                showHintNearAnswer(activeNodeId);
              }}
              disabled={!activeNodeId}
            >
              {showHint ? "إخفاء التلميح" : "تلميح"}
            </button>
          </div>

          <div className="paths-react-zoom-tools">
            <button type="button" className="btn btn-soft btn-zoom" onClick={() => setZoom((z) => Math.max(1, +(z - 0.08).toFixed(2)))}>
              −
            </button>
            <span className="paths-react-zoom-readout">تكبير {Math.round(zoom * 100)}٪</span>
            <button type="button" className="btn btn-soft btn-zoom" onClick={() => setZoom((z) => Math.min(2, +(z + 0.08).toFixed(2)))}>
              +
            </button>
          </div>
        </div>

        {floatingHintText ? (
          <div className="paths-react-visible-tip" role="status">
            <strong>{finalNodeId ? "كيف وصلنا؟" : showHint ? "تلميح موجّه" : "متابعة المسار"}</strong>
            <span>{floatingHintText}</span>
          </div>
        ) : null}

        <div className="paths-react-tree-title">شجرة المسار النحوي</div>
        <div ref={canvasScrollRef} className="paths-react-canvas-scroll">
          <div className="paths-react-canvas-stage" style={{ width: layout.width * zoom, height: layout.height * zoom }}>
            {hintBubble ? (
              <div className="paths-react-answer-hint" style={{ left: hintBubble.left, top: hintBubble.top }}>
                {hintBubble.text}
              </div>
            ) : null}
            <svg
              viewBox={`0 0 ${layout.width} ${layout.height}`}
              width={layout.width * zoom}
              height={layout.height * zoom}
              className="paths-react-svg"
              preserveAspectRatio="xMinYMin meet"
            >
              <defs>
                <marker id="pathsArrow" markerWidth="6" markerHeight="6" refX="5.4" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="rgba(125,179,255,.72)" />
                </marker>
                <marker id="pathsArrowActive" markerWidth="7" markerHeight="7" refX="6.2" refY="3.5" orient="auto">
                  <path d="M0,0 L7,3.5 L0,7 Z" fill="rgba(52,211,153,.96)" />
                </marker>
              </defs>

              {layout.edges.map((edge) => {
                const from = layoutNodeMap.get(edge.from)!;
                const to = layoutNodeMap.get(edge.to)!;
                const active = visitedEdges.includes(`${edge.from}->${edge.to}`);
                const start = centerBottom(from);
                const end = centerTop(to);
                const midX = (start.x + end.x) / 2;
                const midY = (start.y + end.y) / 2 - 10;
                return (
                  <g key={`${edge.from}-${edge.to}`}>
                    <path
                      d={pathD(start, end)}
                      fill="none"
                      stroke={active ? "rgba(52,211,153,.98)" : "rgba(125,179,255,.58)"}
                      strokeWidth={active ? 3.2 : 1.45}
                      markerEnd={active ? "url(#pathsArrowActive)" : "url(#pathsArrow)"}
                      style={{ filter: active ? "drop-shadow(0 0 9px rgba(52,211,153,.72)) drop-shadow(0 0 18px rgba(34,211,238,.26))" : undefined, transition: "stroke .2s ease, stroke-width .2s ease, filter .2s ease" }}
                    />
                    {edge.label ? (
                      <text x={midX} y={midY} textAnchor="middle" className="paths-react-edge-label">
                        {edge.label}
                      </text>
                    ) : null}
                  </g>
                );
              })}

              {layout.nodes.map((n) => {
                const visited = visitedNodes.includes(n.id);
                const active = activeNodeId === n.id;
                const isStart = n.kind === "start";
                const isQuestion = n.kind === "question";
                const isResult = n.kind === "result";
                const isFinalResult = finalNodeId === n.id;

                return (
                  <g
                    key={n.id}
                    className={isStart ? "paths-react-start-clickable" : undefined}
                    onClick={isStart ? () => startExampleAt(currentExampleIndex < 0 ? 0 : currentExampleIndex) : undefined}
                    style={isStart ? { cursor: "pointer" } : undefined}
                  >
                    {isQuestion ? (
                      <polygon
                        points={diamondPoints(n.x, n.y, n.w, n.h)}
                        fill="rgba(224,236,255,.98)"
                        stroke={active ? "rgba(52,211,153,.98)" : visited ? "rgba(125,179,255,.82)" : "rgba(125,179,255,.46)"}
                        strokeWidth={active ? 2.8 : 1.45}
                        style={{ filter: active ? "drop-shadow(0 0 11px rgba(52,211,153,.52))" : visited ? "drop-shadow(0 0 5px rgba(125,179,255,.18))" : undefined, transition: "stroke .2s ease, stroke-width .2s ease, filter .2s ease" }}
                      />
                    ) : (
                      <rect
                        x={n.x}
                        y={n.y}
                        width={n.w}
                        height={n.h}
                        rx={18}
                        fill={isStart ? "#fff3b0" : isResult ? "#fff3b0" : "#dcfce7"}
                        stroke={isResult ? "rgba(52,211,153,.82)" : "rgba(125,179,255,.55)"}
                        strokeWidth={1.55}
                        className={`${isStart && !example ? "paths-react-start-pulse" : ""} ${isFinalResult ? "paths-react-result-pulse" : ""}`}
                        style={{ filter: isFinalResult ? "drop-shadow(0 0 16px rgba(52,211,153,.75))" : visited ? "drop-shadow(0 0 8px rgba(52,211,153,.18))" : undefined, transition: "stroke .2s ease, filter .2s ease" }}
                      />
                    )}

                    {n.textLines.map((line, i) => (
                      <text
                        key={`${n.id}-${i}`}
                        x={n.x + n.w / 2}
                        y={n.y + n.h / 2 + (i - (n.textLines.length - 1) / 2) * 14}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className={isQuestion ? "paths-react-question-text" : "paths-react-box-text"}
                      >
                        {line}
                      </text>
                    ))}

                    {isQuestion && active && n.node?.answers ? (
                      <g>
                        {n.node.answers.map((answer, idx) => {
                          const btnW = Math.max(48, Math.min(82, n.w / Math.max(2, n.node!.answers!.length) - 8));
                          const totalW = n.node!.answers!.length * btnW + (n.node!.answers!.length - 1) * 5;
                          const startX = n.x + (n.w - totalW) / 2;
                          const bx = startX + idx * (btnW + 5);
                          const by = n.y + n.h - 24;
                          const hintCorrect = showHint && active && answerIsCorrect(answer, example);
                          const answerHighlighted = highlightedAnswerKey === `${n.id}:${answer.id}`;
                          return (
                            <g key={answer.id} className={`paths-react-answer ${hintCorrect ? "paths-react-answer-correct" : ""} ${answerHighlighted ? "paths-react-answer-selected" : ""} ${answerHighlighted && highlightedAnswerKind === "wrong" ? "paths-react-answer-selected-wrong" : ""} ${answerHighlighted && highlightedAnswerKind === "correct" ? "paths-react-answer-selected-correct" : ""} ${answerHighlighted && highlightedAnswerKind === "hint" ? "paths-react-answer-selected-hint" : ""}`} onClick={() => handleAnswer(n.id, answer.id, { x: bx + btnW / 2, y: by + 10 })}>
                              <rect x={bx} y={by} width={btnW} height={20} rx={10} fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.18)" strokeWidth={1.15} />
                              <text x={bx + btnW / 2} y={by + 10} textAnchor="middle" dominantBaseline="middle" className="paths-react-answer-text">
                                {answer.text}
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
      </div>
    </section>
  );
}
