"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PATHS_COPY } from "../../content/dialogueCopy";
import { toStudentArabicOption } from "../../lib/studentOptionText";

type TreeNode = {
  id: string;
  type: string;
  text: string;
  teaching_note?: string;
  hint?: string;
  thinking?: { q: string; a: string }[];
  answers?: { id: string; text: string; next: string; correct?: boolean; eval?: { fact: string; equals?: any; anyOf?: any[]; notEquals?: any }; hint?: string; why?: string }[];
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
  shapeH: number;
  controlsH: number;
  textLines: string[];
  node: TreeNode | null;
};

const BOX_W = 280;
const BOX_H = 118;
const DIA_W = 410;
const DIA_H = 190;
const QUESTION_CONTROLS_H = 330;
const LEVEL_GAP = 580;
const SIBLING_GAP = 72;
const UNIT_W = DIA_W + SIBLING_GAP;

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
  const raw = toStudentArabicOption(text);
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

function answerIsCorrect(answer: { correct?: boolean; eval?: { fact: string; equals?: any; anyOf?: any[]; notEquals?: any } }, example: Example | null) {
  if (answer.correct === true) return true;
  if (answer.correct === false) return false;
  if (!example || !answer.eval) return false;
  const factValue = example.facts?.[answer.eval.fact];
  if (Array.isArray(answer.eval.anyOf)) return answer.eval.anyOf.includes(factValue);
  if (Object.prototype.hasOwnProperty.call(answer.eval, "notEquals")) return factValue !== answer.eval.notEquals;
  return factValue === answer.eval.equals;
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
    const x = centerUnit * UNIT_W;
    const y = depth * LEVEL_GAP;

    const isQuestion = node.type === "question";
    const w = isQuestion ? DIA_W : BOX_W;
    const shapeH = isQuestion ? DIA_H : BOX_H;
    const controlsH = isQuestion ? QUESTION_CONTROLS_H : 0;
    const h = shapeH + controlsH;

    placed.set(id, {
      id,
      kind: isQuestion ? "question" : "result",
      x,
      y,
      w,
      h,
      shapeH,
      controlsH,
      textLines: splitText(displayNodeQuestion(node), isQuestion ? 29 : 27),
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
    shapeH: BOX_H,
    controlsH: 0,
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
    const targetStartX = 520;
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

  function connectedQuestionForNode(node: TreeNode | null | undefined) {
    const base = displayNodeQuestion(node);
    if (!node || !example || node.id === tree.startNodeId || !pathSteps.length) return base;
    const lastStep = pathSteps[pathSteps.length - 1] || "";
    const previousAnswer = cleanLearningText(lastStep.split("←").pop() || "", 72).replace(/[.،؛:؟!]+$/g, "");
    if (!previousAnswer) return base;
    return `عرفنا أن «${example.target}» ${previousAnswer}. والآن: ${base}`;
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
      { q: "ما الذي نثبته في هذه الخطوة؟", a: cleanLearningText(node?.text || "اختر ما يثبته المثال.", 180) },
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
      const left = Math.max(0, scaledLeft - (el.clientWidth - scaledW) / 2);
      const top = Math.max(0, scaledTop - 18);
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
          ? `(${target}) ليست مفردًا؛ لأنها تدل على اثنين، وانتهت بألف ونون في هذا المثال، لذلك صورتها مثنى، والمثنى يرفع بالألف.`
          : `(${target}) يدل على اثنين، وانتهى بألف ونون في هذا المثال، لذلك صورته مثنى، وعلامة رفعه الألف.`;
        if (shape === "jms") return pickedSingular
          ? `(${target}) ليست مفردًا؛ لأنها تدل على جماعة ذكور عاقلة، وانتهت بواو ونون في هذا المثال، لذلك صورتها جمع مذكر سالم، وجمع المذكر السالم يرفع بالواو.`
          : `(${target}) جمع مذكر سالم؛ يدل على جماعة ذكور عاقلة، وانتهى بواو ونون في هذا المثال، لذلك علامة رفعه الواو.`;
        if (shape === "jfs") return pickedSingular
          ? `(${target}) ليست مفردًا؛ لأنها تدل على جماعة إناث، وانتهت بألف وتاء زائدتين، لذلك صورتها جمع مؤنث سالم، وعلامة رفعه الضمة.`
          : `(${target}) جمع مؤنث سالم؛ يدل على جماعة إناث وينتهي بألف وتاء زائدتين، وعلامة رفعه الضمة.`;
        if (shape === "jt") return pickedSingular
          ? `(${target}) ليست مفردًا؛ لأنها تدل على جماعة، وتغيّرت صورة المفرد عند الجمع مثل: طفل ← أطفال، لذلك صورتها جمع تكسير، وجمع التكسير يرفع بالضمة.`
          : `(${target}) جمع تكسير؛ تغيّرت صورة مفرده عند الجمع مثل طفل ← أطفال، وعلامة رفعه الضمة.`;
        if (shape === "five") return pickedSingular
          ? `صحيح أن (${target}) يدل على واحد، لكنه ليس مفردًا عاديًا في الإعراب؛ لأنه من الأسماء الخمسة، وقد جاء مفردًا مضافًا إلى غير ياء المتكلم، لذلك يرفع بالواو.`
          : `(${target}) من الأسماء الخمسة: أصله (أب)، وهو مفرد ومضاف إلى غير ياء المتكلم؛ لذلك يعرب بالحروف وعلامة رفعه الواو.`;
      }

      if (nodeId === "fael_raf3_mark") {
        if (shape === "five") return `الضمة للمفرد العادي مثل الطالبُ. أما (${target}) فمن الأسماء الخمسة، وقد تحققت شروط إعرابه بالحروف: مفرد، مضاف، ومضاف إلى غير ياء المتكلم؛ لذلك علامة رفعه الواو.`;
        if (shape === "dual") return `(${target}) مثنى، والمثنى يرفع بالألف لا بالضمة ولا بالواو.`;
        if (shape === "jms") return `(${target}) جمع مذكر سالم، وجمع المذكر السالم يرفع بالواو.`;
        if (shape === "jfs") return `(${target}) جمع مؤنث سالم، وجمع المؤنث السالم يرفع بالضمة الظاهرة.`;
        if (shape === "jt") return `(${target}) جمع تكسير، وجمع التكسير يرفع بالضمة مثل المفرد العادي.`;
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
        if (shape === "singular") return `(${target}) اسم ظاهر يدل على شيء واحد، وليس مثنى ولا جمعًا ولا من الأسماء الخمسة؛ لذلك صورته مفرد، والمفرد ينصب بالفتحة.`;
        if (shape === "dual") return pickedSingular
          ? `(${target}) ليست مفردًا؛ لأنها تدل على اثنين، وانتهت بياء ونون لأنها منصوبة، لذلك صورتها مثنى، والمثنى ينصب بالياء.`
          : `(${target}) يدل على اثنين، وانتهى بياء ونون لأنه منصوب، لذلك صورته مثنى، والمثنى ينصب بالياء.`;
        if (shape === "jms") return pickedSingular
          ? `(${target}) ليست مفردًا؛ لأنها تدل على جماعة ذكور عاقلة، وانتهت بياء ونون لأنها منصوبة، لذلك صورتها جمع مذكر سالم، وجمع المذكر السالم ينصب بالياء.`
          : `(${target}) جمع مذكر سالم؛ يدل على جماعة ذكور عاقلة، وانتهى بياء ونون لأنه منصوب، لذلك علامة نصبه الياء.`;
        if (shape === "jfs") return pickedSingular
          ? `(${target}) ليست مفردًا؛ لأنها جمع مؤنث سالم؛ تدل على جماعة إناث، وانتهت بألف وتاء زائدتين، وجمع المؤنث السالم ينصب بالكسرة نيابة عن الفتحة.`
          : `(${target}) جمع مؤنث سالم؛ جمع مؤنث مختوم بألف وتاء زائدتين، وينصب بالكسرة نيابة عن الفتحة.`;
        if (shape === "jt") return pickedSingular
          ? `(${target}) ليست مفردًا؛ لأنها جمع تكسير، تغيّرت فيه صورة المفرد عند الجمع، وجمع التكسير ينصب بالفتحة.`
          : `(${target}) جمع تكسير؛ تغيّرت صورة مفرده عند الجمع، وينصب بالفتحة غالبًا.`;
        if (shape === "five") return pickedSingular
          ? `صحيح أن (${target}) يدل على واحد، لكنه ليس مفردًا عاديًا في الإعراب؛ لأنه من الأسماء الخمسة، وقد جاء مفردًا مضافًا إلى غير ياء المتكلم، لذلك ينصب بالألف.`
          : `(${target}) من الأسماء الخمسة، وقد تحققت شروط إعرابها بالحروف: مفردة، مضافة، ومضافة إلى غير ياء المتكلم؛ لذلك علامة نصبها الألف.`;
      }

      if (nodeId === "mafool_nasb_mark") {
        if (shape === "singular") return `(${target}) مفرد منصوب، وعلامة نصب المفرد هنا الفتحة الظاهرة.`;
        if (shape === "dual") return `(${target}) مثنى، والمثنى ينصب بالياء لا بالفتحة.`;
        if (shape === "jms") return `(${target}) جمع مذكر سالم، وجمع المذكر السالم ينصب بالياء.`;
        if (shape === "jfs") return `(${target}) جمع مؤنث سالم، وجمع المؤنث السالم ينصب بالكسرة نيابة عن الفتحة.`;
        if (shape === "jt") return `(${target}) جمع تكسير، وجمع التكسير ينصب بالفتحة مثل المفرد العادي.`;
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
    setTimeout(() => focusNode(nodeId, 1.03), 60);

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
      setTimeout(() => focusNode(nodeId, 1.03), 60);
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
      setActiveGuidance("اكتمل الإعراب النهائي. راجع النتيجة النهائية أسفل الصفحة.");
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
                        {shortPathAnswerLabel(edge.label)}
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
                const questionText = active ? connectedQuestionForNode(n.node) : displayNodeQuestion(n.node);
                const targetText = example?.target || "الكلمة الهدف";
                const answers = n.node?.answers || [];
                const answerColumns = answers.length >= 5 ? 3 : answers.length === 1 ? 1 : 2;

                return (
                  <g
                    key={n.id}
                    className={isStart ? "paths-react-start-clickable" : undefined}
                    onClick={isStart ? () => startExampleAt(currentExampleIndex < 0 ? 0 : currentExampleIndex) : undefined}
                    style={isStart ? { cursor: "pointer" } : undefined}
                  >
                    {isQuestion ? (
                      <polygon
                        points={diamondPoints(n.x, n.y, n.w, n.shapeH)}
                        fill="rgba(224,236,255,.98)"
                        stroke={active ? "rgba(52,211,153,.98)" : visited ? "rgba(125,179,255,.82)" : "rgba(125,179,255,.46)"}
                        strokeWidth={active ? 2.15 : 1.15}
                        style={{ filter: active ? "drop-shadow(0 0 13px rgba(52,211,153,.48))" : visited ? "drop-shadow(0 0 6px rgba(125,179,255,.18))" : undefined, transition: "stroke .2s ease, stroke-width .2s ease, filter .2s ease" }}
                      />
                    ) : (
                      <rect
                        x={n.x}
                        y={n.y}
                        width={n.w}
                        height={n.shapeH}
                        rx={18}
                        fill={isStart ? "#fff3b0" : isResult ? "#fff3b0" : "#dcfce7"}
                        stroke={isResult ? "rgba(52,211,153,.82)" : "rgba(125,179,255,.55)"}
                        strokeWidth={1.05}
                        className={`${isStart && !example ? "paths-react-start-pulse" : ""} ${isFinalResult ? "paths-react-result-pulse" : ""}`}
                        style={{ filter: isFinalResult ? "drop-shadow(0 0 16px rgba(52,211,153,.75))" : visited ? "drop-shadow(0 0 8px rgba(52,211,153,.18))" : undefined, transition: "stroke .2s ease, filter .2s ease" }}
                      />
                    )}

                    {isQuestion ? (
                      <foreignObject x={n.x + 68} y={n.y + 18} width={n.w - 136} height={n.shapeH - 36}>
                        <div className="paths-diamond-content" dir="rtl">
                          <span className="paths-diamond-target">{targetText}</span>
                          <p className="paths-diamond-question">{questionText}</p>
                        </div>
                      </foreignObject>
                    ) : (
                      n.textLines.map((line, i) => (
                        <text
                          key={`${n.id}-${i}`}
                          x={n.x + n.w / 2}
                          y={n.y + n.shapeH / 2 + (i - (n.textLines.length - 1) / 2) * 16}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="paths-react-box-text"
                        >
                          {line}
                        </text>
                      ))
                    )}

                    {isQuestion && active && answers.length ? (
                      <foreignObject x={n.x} y={n.y + n.shapeH + 12} width={n.w} height={n.controlsH - 12}>
                        <div className="paths-node-controls" dir="rtl">
                          <div className={`paths-node-answer-grid paths-node-answer-grid-${answerColumns}`}>
                            {answers.map((answer) => {
                              const hintCorrect = showHint && answerIsCorrect(answer, example);
                              const answerHighlighted = highlightedAnswerKey === `${n.id}:${answer.id}`;
                              const classNames = [
                                "paths-node-answer-button",
                                hintCorrect ? "is-correct-hint" : "",
                                answerHighlighted && highlightedAnswerKind === "wrong" ? "is-wrong" : "",
                                answerHighlighted && highlightedAnswerKind === "correct" ? "is-correct" : "",
                                answerHighlighted && highlightedAnswerKind === "hint" ? "is-correct-hint" : "",
                              ].filter(Boolean).join(" ");
                              return (
                                <button
                                  key={answer.id}
                                  type="button"
                                  className={classNames}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleAnswer(n.id, answer.id);
                                  }}
                                >
                                  {toStudentArabicOption(answer.text)}
                                </button>
                              );
                            })}
                          </div>

                          <button
                            type="button"
                            className="paths-node-hint-button"
                            onClick={(event) => {
                              event.stopPropagation();
                              if (showHint) {
                                setShowHint(false);
                                setActiveGuidance(null);
                                setHighlightedAnswerKey(null);
                                setHighlightedAnswerKind(null);
                              } else {
                                showHintNearAnswer(n.id);
                              }
                            }}
                          >
                            {showHint ? PATHS_COPY.hideHintButton : PATHS_COPY.hintButton}
                          </button>

                          {showHint && activeGuidance ? (
                            <div className="paths-node-inline-hint" aria-live="polite">
                              {activeGuidance}
                            </div>
                          ) : null}
                        </div>
                      </foreignObject>
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
              <summary>خطوات بناء الإعراب</summary>
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
