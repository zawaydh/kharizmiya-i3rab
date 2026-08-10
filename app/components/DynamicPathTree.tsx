"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import {
  actionIsCorrect,
  compactResultText,
  presentVerbResultText,
} from "./visual-path/model";
import {
  buildTreeLayout,
  CHOICE_GAP,
  CHOICE_H,
  choiceGrid,
  DECISION_DIAMOND_H,
  edgePath,
} from "./visual-path/graphLayout";
import { visualPathWrongHint } from "./visual-path/hints";
import { shuffledExampleOrder } from "./visual-path/exampleOrder";
import { buildFullVisualMap, createSeededRandom } from "./visual-path/mapSession";
import type { Feedback, PositionedNode, Props, VisualChoice } from "./visual-path/types";

const MIN_ZOOM = 0.55;
const MAX_ZOOM = 1.45;

export default function DynamicPathTree({ tree, examples, title, topicCode }: Props) {
  const safeExamples = examples || [];
  const exampleCount = safeExamples.length;
  const [exampleOrder, setExampleOrder] = useState<number[]>(() =>
    shuffledExampleOrder(exampleCount, createSeededRandom(topicCode || "visual-path")),
  );
  const [exampleCursor, setExampleCursor] = useState(0);
  const exampleIndex = exampleOrder[exampleCursor] ?? 0;
  const example = safeExamples[exampleIndex] || null;
  const isPresentVerbPath = topicCode === "present-verb";
  const isKanaPath = topicCode === "kana-wa-akhawatuha";
  const finalI3rab = example?.facts?.finalI3rab
    ? String(example.facts.finalI3rab)
    : isPresentVerbPath
      ? presentVerbResultText(example)
      : "";

  const fullVisualMap = useMemo(() => {
    return buildFullVisualMap({ tree, example, isPresentVerbPath, isKanaPath });
  }, [example, isKanaPath, isPresentVerbPath, tree]);

  const fullNodeMap = useMemo(() => new Map(fullVisualMap.nodes.map((node) => [node.id, node])), [fullVisualMap.nodes]);
  const rootId = fullVisualMap.rootId;
  const [activeNodeId, setActiveNodeId] = useState(rootId);
  const [visitedNodeIds, setVisitedNodeIds] = useState<Set<string>>(new Set(["__exercise__", rootId]));
  const [selectedEdgeIds, setSelectedEdgeIds] = useState<Set<string>>(new Set([`__exercise__->${rootId}:plain`]));
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [selectedChoiceKeys, setSelectedChoiceKeys] = useState<Set<string>>(new Set());
  const [hint, setHint] = useState("");
  const [finalNodeId, setFinalNodeId] = useState("");
  const [zoom, setZoom] = useState(0.9);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const hintRef = useRef<HTMLDivElement | null>(null);
  const firstActiveChoiceRef = useRef<HTMLButtonElement | null>(null);
  const transitionTimerRef = useRef<number | null>(null);
  const hintId = useId();

  const visibleVisualMap = useMemo(() => {
    const visibleNodeIds = new Set(visitedNodeIds);
    visibleNodeIds.add("__exercise__");
    visibleNodeIds.add(activeNodeId);
    const nodes = fullVisualMap.nodes
      .filter((node) => visibleNodeIds.has(node.id))
      .map((node) => node.id === finalNodeId && finalI3rab ? { ...node, fullText: finalI3rab } : node);
    const nodeIds = new Set(nodes.map((node) => node.id));
    const edges = fullVisualMap.edges.filter(
      (edge) => selectedEdgeIds.has(edge.id) && nodeIds.has(edge.from) && nodeIds.has(edge.to),
    );
    return { ...fullVisualMap, nodes, edges };
  }, [activeNodeId, finalI3rab, finalNodeId, fullVisualMap, selectedEdgeIds, visitedNodeIds]);

  const layout = useMemo(() => buildTreeLayout(visibleVisualMap), [visibleVisualMap]);
  const nodeMap = useMemo(() => new Map(layout.nodes.map((node) => [node.id, node])), [layout.nodes]);

  const focusNode = useCallback((nodeId: string, scale: number, placement: "start" | "context" | "center" = "context") => {
    const container = scrollRef.current;
    const node = nodeMap.get(nodeId);
    if (!container || !node) return;
    const centerX = (node.x + node.w / 2) * scale;
    const centerY = (node.y + node.h / 2) * scale;
    const maxLeft = Math.max(0, layout.width * scale - container.clientWidth);
    const maxTop = Math.max(0, layout.height * scale - container.clientHeight);
    const left = Math.max(0, Math.min(maxLeft, centerX - container.clientWidth / 2));
    const requestedTop = placement === "start"
      ? 0
      : placement === "context"
        ? centerY - container.clientHeight * 0.56
        : centerY - container.clientHeight / 2;
    const top = Math.max(0, Math.min(maxTop, requestedTop));
    window.requestAnimationFrame(() => container.scrollTo({ left, top, behavior: "auto" }));
  }, [layout.height, layout.width, nodeMap]);

  const centerWorkArea = useCallback((nodeId = layout.rootId) => {
    const container = scrollRef.current;
    if (!container) return;
    const node = nodeMap.get(nodeId) || nodeMap.get(layout.rootId);
    const nodeFitZoom = node ? (container.clientWidth - 24) / node.w : 0.94;
    const overviewFitZoom = (container.clientWidth - 28) / layout.width;
    const readableZoom = container.clientWidth <= 760
      ? Math.min(1.02, Math.max(0.84, nodeFitZoom))
      : Math.min(1.02, Math.max(0.72, overviewFitZoom));
    const nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, readableZoom));
    setZoom(nextZoom);
    focusNode(nodeId, nextZoom, nodeId === layout.rootId ? "start" : "context");
  }, [focusNode, layout.rootId, layout.width, nodeMap]);

  const resetRun = useCallback((nextRootId = rootId) => {
    if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = null;
    setActiveNodeId(nextRootId);
    setVisitedNodeIds(new Set(["__exercise__", nextRootId]));
    setSelectedEdgeIds(new Set([`__exercise__->${nextRootId}:plain`]));
    setFeedback(null);
    setSelectedChoiceKeys(new Set());
    setHint("");
    setFinalNodeId("");
  }, [rootId]);

  useEffect(() => {
    const timer = window.setTimeout(() => focusNode(activeNodeId || rootId, zoom, activeNodeId === rootId ? "start" : "context"), 70);
    return () => window.clearTimeout(timer);
  }, [activeNodeId, focusNode, layout.height, rootId, zoom]);


  useEffect(() => {
    if (!hint) return;
    window.requestAnimationFrame(() => hintRef.current?.focus());
  }, [hint]);

  useEffect(() => () => {
    if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current);
  }, []);

  useEffect(() => {
    let timer = 0;
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => centerWorkArea(activeNodeId || layout.rootId), 100);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, [activeNodeId, centerWorkArea, layout.rootId]);

  const changeZoom = (delta: number) => {
    const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom + delta));
    setZoom(next);
    focusNode(activeNodeId || layout.rootId, next, activeNodeId === layout.rootId ? "start" : "context");
  };

  const handleChoice = useCallback((node: PositionedNode, choice: VisualChoice) => {
    if (node.id !== activeNodeId) return;
    const correct = actionIsCorrect(choice.action, example);
    setFeedback({ nodeId: node.id, choiceId: choice.id, status: correct ? "correct" : "wrong" });

    if (!correct) {
      setHint(visualPathWrongHint(node, choice, example));
      window.setTimeout(() => setFeedback(null), 620);
      return;
    }

    const targetId = choice.action.targetId;
    if (!targetId) return;
    const targetNode = fullNodeMap.get(targetId);
    const selected = fullVisualMap.edges.find((edge) => edge.from === node.id && edge.to === targetId && edge.choiceId === choice.id);
    const continuationId = targetNode?.kind === "outcome" ? targetNode.autoNextId : undefined;
    const continuationEdge = continuationId
      ? fullVisualMap.edges.find((edge) => edge.from === targetId && edge.to === continuationId)
      : undefined;

    setSelectedEdgeIds((previous) => {
      const next = new Set(previous);
      if (selected) next.add(selected.id);
      return next;
    });
    setHint("");
    setSelectedChoiceKeys((previous) => new Set(previous).add(`${node.id}:${choice.id}`));
    setVisitedNodeIds((previous) => new Set(previous).add(targetId));
    setActiveNodeId(targetId);
    setFeedback(null);
    focusNode(targetId, zoom, "context");

    if (!continuationId) {
      if (targetNode?.kind === "result") setFinalNodeId(targetId);
      return;
    }

    if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = window.setTimeout(() => {
      setSelectedEdgeIds((previous) => {
        const next = new Set(previous);
        if (continuationEdge) next.add(continuationEdge.id);
        return next;
      });
      setVisitedNodeIds((previous) => new Set(previous).add(continuationId));
      setActiveNodeId(continuationId);
      if (fullNodeMap.get(continuationId)?.kind === "result") setFinalNodeId(continuationId);
      focusNode(continuationId, zoom, "context");
      transitionTimerRef.current = null;
    }, 320);
  }, [activeNodeId, example, focusNode, fullNodeMap, fullVisualMap.edges, zoom]);

  const nextExample = () => {
    if (!safeExamples.length) return;
    const hasNext = exampleCursor + 1 < exampleOrder.length;
    const nextOrder = hasNext
      ? exampleOrder
      : shuffledExampleOrder(exampleCount, Math.random, exampleIndex);
    const nextCursor = hasNext ? exampleCursor + 1 : 0;
    const nextIndex = nextOrder[nextCursor] ?? 0;
    const nextExampleValue = safeExamples[nextIndex] || null;
    const nextMap = buildFullVisualMap({
      tree,
      example: nextExampleValue,
      isPresentVerbPath,
      isKanaPath,
    });
    if (!hasNext) setExampleOrder(nextOrder);
    setExampleCursor(nextCursor);
    resetRun(nextMap.rootId);
  };

  return (
    <section className={`card visual-path-card${isPresentVerbPath ? " is-present-path" : ""}${isKanaPath ? " is-kana-path" : ""}`}>
      <header className="visual-path-head">
        <h1>{title}</h1>
        <div className="visual-path-tools" aria-label="أدوات المسار البصري">
          <button type="button" className="path-tool path-zoom" onClick={() => changeZoom(-0.1)} aria-label="تصغير المسار">−</button>
          <button type="button" className="path-tool path-primary" onClick={nextExample}>مثال جديد</button>
          <button type="button" className="path-tool" onClick={() => { resetRun(); window.setTimeout(() => centerWorkArea(layout.rootId), 20); }}>إعادة المثال</button>
          <button type="button" className="path-tool" onClick={() => centerWorkArea(activeNodeId || layout.rootId)}>توسيط</button>
          <button type="button" className="path-tool path-zoom" onClick={() => changeZoom(0.1)} aria-label="تكبير المسار">+</button>
        </div>
      </header>

      <div className={`visual-path-shell${hint ? " has-hint" : ""}`}>
        {hint ? (
          <div
            id={hintId}
            ref={hintRef}
            className="visual-path-hint"
            role="alert"
            aria-live="assertive"
            tabIndex={-1}
          >
            <strong>تلميح</strong>
            <span>{hint}</span>
            <button
              type="button"
              onClick={() => {
                setHint("");
                window.requestAnimationFrame(() => firstActiveChoiceRef.current?.focus());
              }}
            >أعد المحاولة</button>
          </div>
        ) : null}

        <div className="visual-path-scroll" ref={scrollRef} tabIndex={0}>
          <div
            className="visual-path-stage"
            style={{ width: `max(100%, ${layout.width * zoom}px)`, height: layout.height * zoom }}
          >
            <svg
              className="visual-path-svg"
              width={layout.width * zoom}
              height={layout.height * zoom}
              viewBox={`0 0 ${layout.width} ${layout.height}`}
              shapeRendering="geometricPrecision"
              aria-label={`المسار البصري لموضوع ${title}`}
            >
              <g className="visual-path-edges">
                {layout.edges.map((edge) => {
                  const from = nodeMap.get(edge.from);
                  const to = nodeMap.get(edge.to);
                  if (!from || !to) return null;
                  const selected = selectedEdgeIds.has(edge.id);
                  const available = edge.from === activeNodeId;
                  const contextEdge = Boolean(to.context);
                  return (
                    <path
                      key={edge.id}
                      d={edgePath(from, to, edge)}
                      className={`visual-path-edge${contextEdge ? " is-context" : ""}${selected ? " is-selected" : ""}${available ? " is-available" : ""}`}
                    />
                  );
                })}
              </g>

              <g className="visual-path-nodes">
                {layout.nodes.map((node) => {
                  const active = node.id === activeNodeId;
                  const visited = visitedNodeIds.has(node.id);
                  const final = node.id === finalNodeId;

                  if (node.kind === "start") {
                    const sentence = example?.sentence || node.text;
                    const target = example?.target || "";
                    const targetIndex = target ? sentence.indexOf(target) : -1;
                    const before = targetIndex >= 0 ? sentence.slice(0, targetIndex) : sentence;
                    const after = targetIndex >= 0 ? sentence.slice(targetIndex + target.length) : "";
                    return (
                      <g key={node.id} className="visual-path-node is-start is-visited">
                        <rect x={node.x} y={node.y} width={node.w} height={node.h} rx="16" />
                        <foreignObject x={node.x + 14} y={node.y + 10} width={node.w - 28} height={node.h - 20}>
                          <div className="visual-path-start-text" dir="rtl">
                            <span>{before}{targetIndex >= 0 ? <mark>{target}</mark> : null}{after}</span>
                          </div>
                        </foreignObject>
                      </g>
                    );
                  }

                  if (node.kind === "outcome") {
                    return (
                      <g key={node.id} className={`visual-path-node is-outcome${visited ? " is-visited" : ""}`}>
                        <rect x={node.x} y={node.y} width={node.w} height={node.h} rx="999" />
                        <foreignObject x={node.x + 12} y={node.y + 8} width={node.w - 24} height={node.h - 16}>
                          <div className="visual-path-outcome-text" dir="rtl" title={node.fullText || node.text}>{node.text}</div>
                        </foreignObject>
                      </g>
                    );
                  }

                  if (node.kind === "decision") {
                    const diamondH = node.diamondH || DECISION_DIAMOND_H;
                    const points = `${node.x + node.w / 2},${node.y} ${node.x + node.w},${node.y + diamondH / 2} ${node.x + node.w / 2},${node.y + diamondH} ${node.x},${node.y + diamondH / 2}`;
                    const choices = node.choices || [];
                    const { columns } = choiceGrid(choices.length);
                    const gap = 8;
                    const buttonW = (node.w - 12 - (columns - 1) * gap) / columns;
                    return (
                      <g key={node.id} className={`visual-path-node is-decision${active ? " is-active" : ""}${visited ? " is-visited" : ""}`}>
                        <polygon points={points} />
                        <foreignObject x={node.x + 38} y={node.y + 18} width={node.w - 76} height={diamondH - 36}>
                          <div className="visual-path-question" dir="rtl">
                            <span className="visual-path-question-text">{node.text}</span>
                            {active ? <span className="visual-path-question-instruction">اختر الإجابة المناسبة</span> : null}
                          </div>
                        </foreignObject>
                        {choices.map((choice, index) => {
                          const row = Math.floor(index / columns);
                          const column = index % columns;
                          const itemsInRow = Math.min(columns, choices.length - row * columns);
                          const rowWidth = itemsInRow * buttonW + (itemsInRow - 1) * gap;
                          const x = node.x + (node.w - rowWidth) / 2 + column * (buttonW + gap);
                          const y = node.y + diamondH + 10 + row * (CHOICE_H + CHOICE_GAP);
                          const status = feedback?.nodeId === node.id && feedback.choiceId === choice.id ? feedback.status : "";
                          const selectedChoice = selectedChoiceKeys.has(`${node.id}:${choice.id}`);
                          const mutedChoice = visited && !active && !selectedChoice;
                          return (
                            <foreignObject key={choice.id} x={x} y={y} width={buttonW} height={CHOICE_H}>
                              <button
                                type="button"
                                ref={active && index === 0 ? firstActiveChoiceRef : undefined}
                                className={`visual-path-choice is-option-${(index % 3) + 1}${selectedChoice ? " is-path-selected" : ""}${mutedChoice ? " is-path-muted" : ""}${status ? ` is-${status}` : ""}`}
                                onClick={() => handleChoice(node, choice)}
                                disabled={!active}
                                aria-pressed={selectedChoice}
                                aria-invalid={status === "wrong" || undefined}
                                aria-describedby={active && hint ? hintId : undefined}
                                title={choice.label}
                              >{choice.label}</button>
                            </foreignObject>
                          );
                        })}
                      </g>
                    );
                  }

                  const fullText = final ? (finalI3rab || node.fullText || node.text) : (node.text || compactResultText(node.fullText));
                  return (
                    <g key={node.id} className={`visual-path-node is-result${node.context ? " is-context" : ""}${visited ? " is-visited" : ""}${final ? " is-final" : ""}`}>
                      <rect x={node.x} y={node.y} width={node.w} height={node.h} rx="14" />
                      <foreignObject x={node.x + 12} y={node.y + 10} width={node.w - 24} height={node.h - 20}>
                        <div className="visual-path-result-text" dir="rtl" title={node.fullText || node.text}>{fullText}</div>
                      </foreignObject>
                    </g>
                  );
                })}
              </g>

              {finalNodeId ? (
                <g className="visual-path-terminal is-reached">
                  <line x1="38" y1={layout.terminalY} x2={layout.width - 38} y2={layout.terminalY} />
                  <rect x={layout.width / 2 - 88} y={layout.terminalY - 22} width="176" height="44" rx="12" />
                  <text x={layout.width / 2} y={layout.terminalY + 6} textAnchor="middle">نهاية الخوارزمية</text>
                </g>
              ) : null}
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
