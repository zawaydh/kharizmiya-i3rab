"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PATHS_COPY } from "../../content/dialogueCopy";

type TreeNode = {
  id: string;
  type: string;
  text: string;
  teaching_note?: string;
  hint?: string;
  thinking?: { q: string; a: string }[];
  answers?: { id: string; text: string; next: string; correct?: boolean; eval?: { fact: string; equals: any }; hint?: string; why?: string }[];
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
const BOX_H = 112;
const DIA_W = 230;
const DIA_H = 126;
const LEVEL_GAP = 184;
const SIBLING_GAP = 48;

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



function shortPathAnswerLabel(text?: string) {
  const raw = String(text || "").trim();
  if (!raw) return "";
  if (raw.startsWith("نعم")) return "نعم";
  if (raw.startsWith("لا")) return "لا";
  if (raw.includes("أداة نصب") || raw.includes("ناصبة")) return "ناصب";
  if (raw.includes("أداة جزم") || raw.includes("جازمة")) return "جازم";
  if (raw.includes("صحيح الآخر")) return "صحيح";
  if (raw.includes("معتل الآخر")) return "معتل";
  if (raw.includes("واو الجماعة")) return "واو";
  if (raw.includes("ألف الاثنين")) return "ألف";
  if (raw.includes("ياء المخاطبة")) return "ياء";
  if (raw.includes("نون النسوة")) return "نون النسوة";
  if (raw.includes("نون التوكيد")) return "نون التوكيد";
  if (raw.includes("مفرد")) return "مفرد";
  if (raw.includes("مثنى")) return "مثنى";
  if (raw.includes("جمع")) return raw.replace(/^.*?(جمع)/, "$1").slice(0, 18);
  return raw.length > 12 ? raw.slice(0, 11) + "…" : raw;
}

function displayNodeQuestion(node: TreeNode | null | undefined) {
  const raw = String(node?.text || "").trim();
  const hint = String(node?.hint || "").trim();
  const context = String((node as any)?.context || "").trim();
  if (!raw) return "تابع السؤال المناسب لهذا المثال.";
  if (raw === "ماذا نتحقق الآن؟" || raw === "ماذا نتحقق الآن؟") {
    if (hint.includes("العدد") || hint.includes("النوع")) return "ما صورة الكلمة من حيث العدد أو النوع؟";
    if (hint.includes("علامة")) return "ما العلامة المناسبة هنا؟";
    if (hint.includes("اسم معرب") || hint.includes("اسم مبني")) return "ما نوع الكلمة الآن؟";
    if (context) return context.replace(/^عرفنا\s*/, "حدّدنا ").replace(/[.،]+$/, "") + "؛ ماذا نختار الآن؟";
    return "ماذا نلاحظ الآن؟";
  }
  return raw;
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

function answerIsCorrect(answer: { correct?: boolean; eval?: { fact: string; equals: any } }, example: Example | null) {
  if (answer.correct === true) return true;
  if (answer.correct === false) return false;
  if (!example || !answer.eval) return false;
  return example.facts?.[answer.eval.fact] === answer.eval.equals;
}

function sourceMasdarHint(target = "المصدر المؤول") {
  return `توضيح مهم: المصدر المؤول ليس كلمة واحدة فقط؛ هو تركيب مثل (أن + فعل مضارع)، ونستطيع تأويله بمصدر صريح. مثال: (أن تنجح) = نجاحك. لذلك يعامل معاملة الاسم ويأخذ موقعًا إعرابيًا مثل: في محل رفع مبتدأ.`;
}

function buildTreeLayout(tree: ExerciseTree, example: Example | null) {
  const nodes = tree.nodes;
  const rootId = tree.startNodeId;
  const childrenMap = new Map<string, string[]>();
  Object.values(nodes).forEach((n) => {
    const safeChildren = Array.from(
      new Set(
        (n.answers || [])
          .filter((a) => a?.next && a.next !== n.id && nodes[a.next])
          .map((a) => a.next)
      )
    );
    childrenMap.set(n.id, safeChildren);
  });

  const widths = new Map<string, number>();
  function measure(id: string, trail = new Set<string>()): number {
    if (widths.has(id)) return widths.get(id)!;
    if (trail.has(id)) return 1;
    trail.add(id);
    const kids = (childrenMap.get(id) || []).filter((childId) => childId !== id && nodes[childId]);
    if (!kids.length) {
      widths.set(id, 1);
      return 1;
    }
    const sum = kids.map((childId) => measure(childId, new Set(trail))).reduce((a, b) => a + b, 0);
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
      textLines: splitText(displayNodeQuestion(node), isQuestion ? 20 : 24),
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
      ? [PATHS_COPY.startNodeLine1, `الكلمة الهدف: ${example.target}`]
      : [PATHS_COPY.startNodeLine1, PATHS_COPY.startNodeLine2],
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
      if (!answer?.next || answer.next === node.id || !nodes[answer.next]) return;
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
  const [message, setMessage] = useState(PATHS_COPY.emptyGuidance);
  const [showHint, setShowHint] = useState(false);
  const [zoom, setZoom] = useState(1);
  // التوجيه المختصر يظهر في لوحة ثابتة فوق الشجرة، والشرح التفصيلي في أسفل الصفحة.
  // لا نستخدم فقاعات عائمة حتى لا تغطي المثال أو الخيارات.
  const [activeGuidance, setActiveGuidance] = useState<string | null>(null);
  const [currentExampleIndex, setCurrentExampleIndex] = useState(-1);
  const [finalNodeId, setFinalNodeId] = useState<string | null>(null);
  const [highlightedAnswerKey, setHighlightedAnswerKey] = useState<string | null>(null);
  const [highlightedAnswerKind, setHighlightedAnswerKind] = useState<"correct" | "wrong" | "hint" | null>(null);
  const [pathSteps, setPathSteps] = useState<string[]>([]);
  const autoNextTimerRef = useRef(null as null | ReturnType<typeof setTimeout>);

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
    return cleanLearningText(text, 165);
  }

  function stepHintForNode(node: TreeNode | null | undefined) {
    const id = String(node?.id || "");
    const text = String(node?.text || "");
    const facts = example?.facts || {};

    if (id.includes("present") || text.includes("مضارع")) {
      return "بعد أن عرفنا أنه فعل مضارع نحدّد أولًا: هل سبقته أداة نصب أو جزم؟ ثم نحدّد علامة الإعراب.";
    }
    if (id.includes("past") || text.includes("ماض")) {
      return "الفعل الماضي مبني دائمًا؛ نبحث هل اتصل به ضمير، ثم نحدد أثر الضمير في حركة البناء.";
    }
    if (id.includes("imperative") || text.includes("أمر")) {
      return "في فعل الأمر نحدد: صحيح الآخر، معتل الآخر، أو متصل بألف الاثنين/واو الجماعة/ياء المخاطبة.";
    }
    if (id.includes("built") || id.includes("mabni") || text.includes("مبني") || facts.nounKind === "mabni") {
      return "في الاسم المبني نحدّد نوعه أولًا، ثم نقول: مبني في محل رفع أو نصب أو جر حسب موقعه.";
    }
    if (id.includes("masdar") || text.includes("مصدر مؤول") || facts.nounKind === "masdar") {
      return "المصدر المؤول تركيب مثل (أن + فعل مضارع)، يؤول بمصدر صريح ويعامل معاملة الاسم.";
    }
    if (text.includes("اسم أم فعل أم حرف") || id.includes("wordType")) {
      return "أول قرار في الإعراب هو تصنيف الكلمة: اسم أو فعل أو حرف؛ لأن التصنيف يحدد المسار التالي.";
    }
    if (id.includes("number") || text.includes("مفرد") || text.includes("مثنى") || text.includes("جمع")) {
      return "بعد تحديد أن الكلمة اسم معرب نحدد العدد أو نوع الجمع؛ لأن العلامة تختلف باختلافه.";
    }
    if (id.includes("khabar") || text.includes("خبر")) {
      return "في الخبر نسأل: ماذا أخبرنا عن المبتدأ؟ ثم نحدد هل الخبر مفرد أم جملة أم شبه جملة.";
    }
    if (node?.hint || node?.teaching_note) return cleanLearningText(node.hint || node.teaching_note, 150);
    return "اقرأ المثال والكلمة الهدف، ثم اختر الإجابة التي يثبتها الدليل النحوي.";
  }

  function thinkingItemsForNode(node: TreeNode | null | undefined) {
    const id = String(node?.id || "");
    const text = String(node?.text || "");
    const facts = example?.facts || {};
    const target = example?.target || "الكلمة الهدف";

    const custom = Array.isArray(node?.thinking) ? node!.thinking! : [];
    if (custom.length) return custom;

    if (id.includes("present") || text.includes("مضارع")) {
      return [
        { q: "ما أول سؤال بعد معرفة أن الفعل مضارع؟", a: "أسأل: هل سبق الفعل أداة نصب أو أداة جزم؟" },
        { q: "إذا لم يسبق بناصب أو جازم؟", a: "يكون الفعل المضارع مرفوعًا." },
        { q: "متى تظهر الأفعال الخمسة؟", a: "هي أفعال مضارعة اتصلت بألف الاثنين أو واو الجماعة أو ياء المخاطبة، وتتبع أحكام المضارع لكن تختلف علامتها." },
        { q: "كيف أكتب النتيجة؟", a: "أقول: فعل مضارع مرفوع/منصوب/مجزوم، ثم أذكر العلامة، وأعرب الضمير المتصل إن وجد." },
      ];
    }
    if (id.includes("past") || text.includes("ماض")) {
      return [
        { q: "هل الفعل الماضي معرب؟", a: "لا، الفعل الماضي مبني دائمًا." },
        { q: "ما الذي أبحث عنه؟", a: "أبحث هل اتصل بالفعل ضمير، وما نوع هذا الضمير." },
        { q: "متى يبنى على السكون؟", a: "إذا اتصل به ضمير رفع متحرك مثل: تُ، تَ، تِ، نا، تم، تما، تنّ." },
        { q: "كيف أعرب الضمير في كتبتُ؟", a: "التاء: ضمير متصل مبني في محل رفع فاعل." },
      ];
    }
    if (id.includes("imperative") || text.includes("أمر")) {
      return [
        { q: "ما أصل فعل الأمر؟", a: "فعل الأمر مبني، ونبحث عن علامة بنائه حسب آخره وما اتصل به." },
        { q: "إذا كان معتل الآخر؟", a: "يبنى على حذف حرف العلة، مثل: ادعُ أصلها يدعو." },
        { q: "إذا اتصل بألف الاثنين أو واو الجماعة أو ياء المخاطبة؟", a: "يبنى على حذف حرف النون من آخره، مثل: اذهبي أصلها اذهبين." },
      ];
    }
    if (id.includes("built") || id.includes("mabni") || text.includes("مبني") || facts.nounKind === "mabni") {
      return [
        { q: "ما القاعدة العامة في الاسم المبني؟", a: "الأسماء الأصل فيها الإعراب، والمبني استثناء يلزم آخره صورة واحدة." },
        { q: "لماذا نحدد نوع الاسم المبني أولًا؟", a: "لأن بداية الإعراب تكون باسمه: ضمير، اسم إشارة، اسم موصول، اسم استفهام، اسم شرط…" },
        { q: "كيف أحدد المحل الإعرابي؟", a: "أنظر إلى موقعه في الجملة أو الاسم الذي حل محله: رفع أو نصب أو جر." },
        { q: "ما الصياغة الثابتة للضمير المتصل؟", a: "ضمير متصل مبني في محل… ثم نكمل: رفع فاعل، أو نصب مفعول به، أو جر اسم مجرور." },
      ];
    }
    if (id.includes("masdar") || text.includes("مصدر مؤول") || facts.nounKind === "masdar") {
      return [
        { q: "ما المصدر المؤول؟", a: "هو تركيب يؤول بمصدر صريح، مثل: أن تنجح = نجاحك." },
        { q: "هل نعرب (أن) وحدها هنا؟", a: "لا، ننظر إلى التركيب كاملًا: أن + الفعل المضارع." },
        { q: "كيف يعامل في الإعراب؟", a: "يعامل معاملة الاسم، لذلك قد يكون في محل رفع مبتدأ أو غير ذلك حسب موقعه." },
      ];
    }
    if (text.includes("اسم أم فعل أم حرف") || id.includes("wordType")) {
      return [
        { q: "لماذا أبدأ بتحديد نوع الكلمة؟", a: "لأن الاسم والفعل والحرف لكل واحد منها مسار إعرابي مختلف." },
        { q: "كيف أميز الاسم؟", a: "الاسم يقبل غالبًا أل التعريف أو التنوين، ويقع في مواقع الأسماء مثل مبتدأ أو فاعل." },
        { q: "كيف أميز الفعل؟", a: "الفعل مرتبط بزمن: ماضٍ أو مضارع أو أمر." },
        { q: "كيف أميز الحرف؟", a: "الحرف لا يظهر معناه مستقلًا، بل يعمل مع غيره." },
      ];
    }
    if (id.includes("number") || text.includes("مفرد") || text.includes("مثنى") || text.includes("جمع")) {
      return [
        { q: "لماذا أحدد العدد أو نوع الجمع؟", a: "لأن علامة الإعراب تختلف: المفرد غالبًا بالضمة/الفتحة/الكسرة، والمثنى بالألف/الياء، وجمع المذكر السالم بالواو/الياء." },
        { q: "ماذا نلاحظ بعد معرفة النوع؟", a: "بعد معرفة النوع نحدد العلامة المناسبة للموقع الإعرابي." },
      ];
    }
    return [
      { q: "ما السؤال الذي نفكر فيه هنا؟", a: cleanLearningText(node?.text || "اختر ما يثبته المثال.", 180) },
      { q: "كيف أختار؟", a: `أربط السؤال بالكلمة الهدف (${target})، ثم أبحث عن الدليل في الجملة.` },
      { q: "ماذا بعد الاختيار الصحيح؟", a: "ننتقل إلى العقدة التالية حتى نصل إلى الإعراب الكامل." },
    ];
  }

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
    setMessage(PATHS_COPY.emptyGuidance);
    setActiveGuidance(null);
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
    const t = setTimeout(() => focusNode("__exercise__", 1.02), 180);
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

    const nextZoom = Math.max(1, Math.min(1.18, targetZoom));
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
      const top = Math.max(0, scaledTop - Math.max(28, (el.clientHeight - scaledH) * 0.32));
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
    setActiveGuidance(null);
    setHighlightedAnswerKey(null);
    setHighlightedAnswerKind(null);
    setFinalNodeId(null);
    setMessage("ابدأ بالسؤال الظاهر داخل المسار.");
    setActiveGuidance("اقرأ المثال والكلمة الهدف، ثم أجب عن السؤال الظاهر فقط.");
    setPathSteps([]);
  }

  function startExampleAt(index: number) {
    if (!examples.length) return;
    const safeIndex = ((index % examples.length) + examples.length) % examples.length;
    setCurrentExampleIndex(safeIndex);
    const next = examples[safeIndex] || null;
    resetProgress(next);
    setTimeout(() => focusNode("__exercise__", 1.02), 180);
  }

  function startNextExercise() {
    const nextIndex = currentExampleIndex < 0 ? 0 : (currentExampleIndex + 1) % examples.length;
    startExampleAt(nextIndex);
  }


  function targetedHintForWrongAnswer(node: TreeNode, answer: { text: string; eval?: { fact: string; equals: string }; hint?: string; why?: string }, currentExample: Example | null) {
    const target = currentExample?.target || "الكلمة الهدف";
    const teacherPrefix = "";
    const facts = currentExample?.facts || {};
    const picked = answer.text;
    if (answer.hint) return teacherSequenceText(node, answer.hint);

    if (node.id === "m0_wordType" || node.id === "first_word_type") {
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

    if (node.id === "m1_nounKind") {
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

    if (node.id === "m2_mabniType" || node.id === "mubtada_built_type") {
      return teacherSequenceText(node, teacherPrefix + `راجع نوع الاسم المبني نفسه: هل هو ضمير، اسم إشارة، اسم موصول، اسم استفهام، اسم شرط، أو كم الخبرية؟ اختر النوع المطابق للكلمة: ${target}.`);
    }

    if (node.id === "m2_number") {
      return teacherSequenceText(node, teacherPrefix + `راجع صورة ${target}: هل تدل على واحد، اثنين، أم جماعة؟ العدد يحدد علامة الرفع في مسار المبتدأ.`);
    }

    if (node.id === "m3_singularKind") {
      return teacherSequenceText(node, teacherPrefix + `ركز في آخر ${target}: هل آخره حرف صحيح، أم حرف علة، أم أنه من الأسماء الخمسة؟ نوع الآخر هو الذي يحدد علامة الرفع.`);
    }

    if (node.id === "m3_pluralType") {
      return teacherSequenceText(node, teacherPrefix + `راجع نوع الجمع في ${target}: جمع المذكر السالم يرفع بالواو، أما جمع المؤنث السالم وجمع التكسير فيرفعان بالضمة في هذا المسار.`);
    }

    if (String(node.id || "").includes("built_type") || String(node.id || "").includes("mabniType")) {
      const examples = "ضمير مثل (هو، إياه)، اسم إشارة مثل (هذا، هذه)، اسم موصول مثل (الذي، التي)، اسم استفهام مثل (من، ما)، اسم شرط مثل (من، مهما)، أو كم الخبرية";
      return teacherSequenceText(node, teacherPrefix + `حدّد نوع الاسم المبني في ${target}. الأسماء المبنية لا تتغير حركة آخرها. قارن الكلمة بالأمثلة: ${examples}. بعد تحديد النوع يبدأ الإعراب باسمه: اسم موصول مبني في محل...`);
    }

    return teacherSequenceText(node, teacherPrefix + (node.hint || node.teaching_note || "راجع خصائص الكلمة ثم اختر الإجابة التي تطابق المثال."));
  }

  function showHintNearAnswer(nodeId: string) {
    const node = tree.nodes[nodeId];
    const hintText = node
      ? targetedHintForWrongAnswer(node, { text: "", eval: undefined }, example)
      : "راجع الإجابة الصحيحة ثم تابع.";
    setShowHint(true);
    setMessage(hintText);
    setActiveGuidance(hintText);

    const correctAnswer = node?.answers?.find((a: any) => answerIsCorrect(a, example));
    if (correctAnswer) {
      const anchor = answerAnchorFor(nodeId, correctAnswer.id);
      if (anchor) {
        setHighlightedAnswerKey(`${nodeId}:${correctAnswer.id}`);
        setHighlightedAnswerKind("hint");
        setActiveGuidance(hintText);
      }
    }
  }

  function showBubbleBesideNode(nodeId: string, text: string, bubbleZoom = zoom) {
    setActiveGuidance(cleanLearningText(text, 170));
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
      setActiveGuidance(hintText);
      setHighlightedAnswerKey(`${nodeId}:${answerId}`);
      setHighlightedAnswerKind("wrong");
      if (anchor) {
        setActiveGuidance(hintText);
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
      setActiveGuidance(`اختيار صحيح: ${answer.text}. ننتقل للخطوة التالية.`);
    } else {
      setActiveGuidance(null);
    }

    if (nextNode?.type === "result") {
      setActiveNodeId(nextId);
      setFinalNodeId(nextId);
      const finalReason = nextNode.teaching_note || "اكتمل المسار ووصلتَ إلى الإعراب النهائي الصحيح.";
      const targetWord = example?.target ? `كلمة: ${example.target}` : "الكلمة المطلوبة";
      const finalText = `هكذا وصلنا لإعراب ${targetWord}: ${nextNode.text}. السبب: ${finalReason}`;
      setMessage(finalText);
      setActiveGuidance("اكتمل المسار. راجع كيف وصلنا إلى الإعراب النهائي في الأسئلة أسفل الصفحة.");
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
      const stepText = teacherSequenceText(nextNode, nextNode?.teaching_note || "أحسنت. تابع إلى العقدة التالية.");
      setMessage(stepText);
      setActiveGuidance(stepText);
      setTimeout(() => {
        focusNode(nextId, 1.03);
        showBubbleBesideNode(nextId, stepText, 1.03);
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
              {PATHS_COPY.visualButton}
            </button>
            <button type="button" className="btn btn-primary btn-workbar-glow" onClick={startNextExercise}>
              {PATHS_COPY.startButton}
            </button>
            <button
              type="button"
              className="btn btn-soft"
              onClick={() => {
                if (!activeNodeId) return;
                if (showHint) {
                  setShowHint(false);
                  setActiveGuidance(null);
                  setHighlightedAnswerKey(null);
                  setHighlightedAnswerKind(null);
                  return;
                }
                showHintNearAnswer(activeNodeId);
              }}
              disabled={!activeNodeId}
            >
              {showHint ? PATHS_COPY.hideHintButton : PATHS_COPY.hintButton}
            </button>
          </div>

          <div className="paths-react-zoom-tools">
            <button type="button" className="btn btn-soft btn-zoom" onClick={() => setZoom((z) => Math.max(1, +(z - 0.08).toFixed(2)))}>
              {PATHS_COPY.zoomOut}
            </button>
            
            <button type="button" className="btn btn-soft btn-zoom" onClick={() => setZoom((z) => Math.min(2, +(z + 0.08).toFixed(2)))}>
              {PATHS_COPY.zoomIn}
            </button>
          </div>
        </div>

        
        <div className="paths-step-hint-panel" aria-live="polite">
          <span>{activeGuidance || (activeNodeId ? stepHintForNode(tree.nodes[activeNodeId]) : PATHS_COPY.emptyGuidance)}</span>
        </div>
        <div ref={canvasScrollRef} className="paths-react-canvas-scroll">
          <div className="paths-react-canvas-stage" style={{ width: layout.width * zoom, height: layout.height * zoom }}>
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
                const from = layoutNodeMap.get(edge.from);
                const to = layoutNodeMap.get(edge.to);
                if (!from || !to) return null;
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
                      strokeWidth={active ? 2.05 : 1.1}
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
                        strokeWidth={active ? 1.9 : 1.05}
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
                        strokeWidth={1.05}
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
                          const btnW = Math.max(38, Math.min(66, n.w / Math.max(2, n.node!.answers!.length) - 8));
                          const totalW = n.node!.answers!.length * btnW + (n.node!.answers!.length - 1) * 5;
                          const startX = n.x + (n.w - totalW) / 2;
                          const bx = startX + idx * (btnW + 5);
                          const by = n.y + n.h - 24;
                          const hintCorrect = showHint && active && answerIsCorrect(answer, example);
                          const answerHighlighted = highlightedAnswerKey === `${n.id}:${answer.id}`;
                          return (
                            <g key={answer.id} className={`paths-react-answer ${hintCorrect ? "paths-react-answer-correct" : ""} ${answerHighlighted ? "paths-react-answer-selected" : ""} ${answerHighlighted && highlightedAnswerKind === "wrong" ? "paths-react-answer-selected-wrong" : ""} ${answerHighlighted && highlightedAnswerKind === "correct" ? "paths-react-answer-selected-correct" : ""} ${answerHighlighted && highlightedAnswerKind === "hint" ? "paths-react-answer-selected-hint" : ""}`} onClick={() => handleAnswer(n.id, answer.id, { x: bx + btnW / 2, y: by + 10 })}>
                              <rect x={bx} y={by} width={btnW} height={20} rx={10} fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.18)" strokeWidth={0.9} />
                              <text x={bx + btnW / 2} y={by + 10} textAnchor="middle" dominantBaseline="middle" className="paths-react-answer-text">
                                {shortPathAnswerLabel(answer.text)}
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
        <div className="paths-thinking-dock paths-thinking-dock-hidden">
          <details open>
            <summary>كيف أفكر في هذه الخطوة؟</summary>
            <div className="paths-thinking-list">
              {thinkingItemsForNode(activeNodeId ? tree.nodes[activeNodeId] : null).map((item, idx) => (
                <div className="paths-thinking-item" key={`${item.q}-${idx}`}>
                  <h3>{item.q}</h3>
                  <p>{item.a}</p>
                </div>
              ))}
            </div>
          </details>
          {finalNodeId ? (
            <details>
              <summary>كيف وصلنا إلى الإعراب النهائي؟</summary>
              <div className="paths-thinking-list">
                {pathSteps.map((step, idx) => (
                  <div className="paths-thinking-item" key={`${step}-${idx}`}>
                    <h3>الخطوة {idx + 1}</h3>
                    <p>{step}</p>
                  </div>
                ))}
              </div>
            </details>
          ) : null}
        </div>
      </div>
    </section>
  );
}
