type AnswerEval = {
  fact: string;
  equals?: unknown;
  anyOf?: unknown[];
  notEquals?: unknown;
};

type StageAnswer = {
  id: string;
  text?: string;
  correct?: boolean;
  eval?: AnswerEval;
  next?: string;
  to?: string;
  nextNodeId?: string;
  nextByFact?: {
    fact: string;
    map?: Record<string, string>;
    default?: string;
  };
};

type StageNode = {
  id?: string;
  type?: string;
  text?: string;
  answers?: StageAnswer[];
};

type StageTree = {
  startNodeId?: string;
  nodes?: Record<string, StageNode>;
};

type StageState = {
  answers?: Record<string, string>;
  facts?: Record<string, unknown>;
  currentNodeId?: string;
};

type TrailCard = {
  result?: unknown;
  answer?: unknown;
};

export function answerTextFor(tree: StageTree | undefined, nodeId: string, answerId: string) {
  const node = tree?.nodes?.[nodeId];
  if (!node || node.type !== "question") return "";
  return String(node.answers?.find((answer) => answer.id === answerId)?.text || "");
}

export function normalizeBuildPiece(text: string, nodeId = "") {
  const value = String(text || "");
  const id = String(nodeId || "");
  if (!value || /تحديد|فحص|القرار|الخطوة|مباشرة|دائمًا|نوع الخبر/.test(value)) return "";

  if (id.includes("tense") || id.includes("past") || id.includes("present") || id.includes("imperative")) {
    if (value.includes("مضارع")) return "فعل مضارع";
    if (value.includes("ماض")) return "فعل ماضٍ";
    if (value.includes("أمر")) return "فعل أمر";
  }

  if (id.includes("tool") || id.includes("has_tool")) {
    if (value.includes("جزم")) return "مجزوم";
    if (value.includes("نصب")) return "منصوب";
    if (value.includes("لم يسبق")) return "مرفوع";
  }

  if (/raf3|nasb|jazm/.test(id)) {
    if (/واو الجماعة|ياء المخاطبة|ألف الاثنين|نعم/.test(value)) {
      if (id.includes("jazm")) return "علامة جزمه حذف النون";
      if (id.includes("nasb")) return "علامة نصبه حذف النون";
      if (id.includes("raf3")) return "علامة رفعه ثبوت النون";
      return "من الأفعال الخمسة";
    }
    if (value === "لا") return "ليس من الأفعال الخمسة";
  }

  if (value.includes("حذف النون")) return "وعلامة إعرابه حذف النون";
  if (value.includes("ثبوت النون")) return "وعلامة رفعه ثبوت النون";
  if (value.includes("حذف حرف العلة")) return "وعلامته حذف حرف العلة";
  if (value.includes("الضمة")) return "وعلامته الضمة";
  if (value.includes("الفتحة")) return "وعلامته الفتحة";
  if (value.includes("الكسرة")) return "وعلامته الكسرة";
  if (value.includes("السكون")) return "مبني على السكون";
  if (value.includes("مبتدأ")) return "مبتدأ";
  if (value.includes("خبر")) return "خبر";
  if (value.includes("فاعل")) return "فاعل";
  if (value.includes("مفعول")) return "مفعول به";
  if (value.includes("نعت")) return "نعت";
  if (value.includes("معطوف")) return "معطوف";
  if (value.includes("توكيد")) return "توكيد";
  if (value.includes("بدل")) return "بدل";
  if (value.includes("تابع")) return "تابع";
  if (value.includes("اسم كان")) return "اسم كان";
  if (value.includes("خبر كان")) return "خبر كان";
  if (value.includes("اسم إن")) return "اسم إن";
  if (value.includes("خبر إن")) return "خبر إن";
  if (value.includes("اسم إشارة")) return "اسم إشارة مبني";
  if (value.includes("اسم موصول")) return "اسم موصول مبني";
  if (value.includes("ضمير")) return "ضمير مبني";
  if (value.includes("اسم")) return "اسم";
  if (value.includes("فعل")) return "فعل";
  return value.length <= 28 ? value : "";
}

export function buildI3rabDraft(tree: StageTree, state: StageState, _target?: string) {
  const pieces: string[] = [];
  const add = (piece: string) => {
    if (!piece) return;
    const generic = ["فعل", "اسم"];
    if (generic.includes(piece) && pieces.some((existing) => existing.startsWith(`${piece} `))) return;

    if (piece.startsWith("فعل ")) {
      const index = pieces.findIndex((existing) => existing === "فعل" || existing.startsWith("فعل "));
      if (index >= 0) pieces[index] = piece;
      else pieces.push(piece);
      return;
    }

    if (["مرفوع", "منصوب", "مجزوم"].includes(piece)) {
      const index = pieces.findIndex((existing) => ["مرفوع", "منصوب", "مجزوم"].includes(existing));
      if (index >= 0) pieces[index] = piece;
      else pieces.push(piece);
      return;
    }

    if (!pieces.includes(piece)) pieces.push(piece);
  };

  Object.entries(state?.answers || {}).forEach(([nodeId, answerId]) => {
    add(normalizeBuildPiece(answerTextFor(tree, nodeId, String(answerId)), nodeId));
  });

  const phrase = pieces.join(" ").replace(/\s+/g, " ").trim();
  return phrase || "ابدأ بتحديد نوع الكلمة";
}

function correctAnswerForNode(node: StageNode | undefined, facts: Record<string, unknown> = {}) {
  if (!node || node.type !== "question") return undefined;
  return (node.answers || []).find((answer) => {
    if (!answer.eval) return Boolean(answer.correct);
    const factValue = facts[answer.eval.fact];
    if (Array.isArray(answer.eval.anyOf)) return answer.eval.anyOf.includes(factValue);
    if (Object.prototype.hasOwnProperty.call(answer.eval, "notEquals")) return factValue !== answer.eval.notEquals;
    return factValue === answer.eval.equals;
  });
}

function countRemainingQuestionsOnCorrectPath(tree: StageTree, state: StageState) {
  const nodes = tree?.nodes || {};
  const facts = state?.facts || {};
  let nodeId = state?.currentNodeId;
  let count = 0;
  const visited = new Set<string>();

  while (nodeId && !visited.has(nodeId)) {
    visited.add(nodeId);
    const node = nodes[nodeId];
    if (!node || node.type === "result" || node.type !== "question") break;
    count += 1;
    const answer = correctAnswerForNode(node, facts);
    nodeId = answer?.nextByFact
      ? answer.nextByFact.map?.[String(facts[answer.nextByFact.fact])] || answer.nextByFact.default || answer.next
      : answer?.next || answer?.to || answer?.nextNodeId;
  }

  return Math.max(0, count);
}

export function buildStageProgressMeta(tree: StageTree, state: StageState) {
  const answered = Object.keys(state?.answers || {}).length;
  const remaining = countRemainingQuestionsOnCorrectPath(tree, state);
  const total = Math.max(1, answered + remaining);
  const atResult = tree?.nodes?.[state?.currentNodeId || ""]?.type === "result";
  const current = atResult ? total : Math.min(total, answered + 1);
  const completedPercent = Math.round((answered / total) * 100);
  return { answered, remaining, total, current, completedPercent, atResult };
}

export function buildStageTrailItems(cards: TrailCard[]) {
  return cards
    .map((card) => String(card.result || card.answer || "").trim())
    .filter(Boolean)
    .slice(-6);
}

export function isPresentBuiltResult(tree: StageTree, node: StageNode | undefined) {
  const start = String(tree?.startNodeId || "");
  const id = String(node?.id || "");
  const text = String(node?.text || "");
  return start.includes("present") && (id.includes("binaa") || text.includes("مبني"));
}

export function presentBuiltClosureNote(node: StageNode | undefined) {
  const text = String(node?.text || "");
  if (!text.includes("مبني")) return "";
  if (text.includes("نون النسوة")) {
    return "اتصال نون النسوة يحدد البناء على السكون، ثم يحدد العامل السابق محل الفعل: رفعًا أو نصبًا أو جزمًا.";
  }
  if (text.includes("نون التوكيد")) {
    return "اتصال نون التوكيد المباشر يحدد البناء على الفتح، ثم يحدد العامل السابق محل الفعل: رفعًا أو نصبًا أو جزمًا.";
  }
  return "في المضارع المبني نذكر علامة البناء أولًا، ثم نذكر محله الإعرابي بحسب العامل السابق.";
}
