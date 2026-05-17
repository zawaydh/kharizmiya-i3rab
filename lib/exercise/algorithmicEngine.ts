export type AlgorithmicNodeType = "decision" | "knowledge" | "result";

export type AlgorithmicChoice = {
  id: string;
  text: string;
  next?: string;
  correct?: boolean;
  eval?: { fact: string; equals: string | boolean | number | null };
  hint?: string;
  misconception?: string;
};

export type AlgorithmicNode = {
  id: string;
  type: "question" | "result";
  nodeType?: AlgorithmicNodeType;
  known?: string;
  context?: string;
  text: string;
  hint?: string;
  coverage?: string;
  answers?: AlgorithmicChoice[];
};

export function isChoiceCorrect(choice: AlgorithmicChoice | undefined, facts: Record<string, any> = {}) {
  if (!choice) return false;
  if (choice.eval) return facts?.[choice.eval.fact] === choice.eval.equals;
  return Boolean(choice.correct);
}

export function normalizeDecisionNode(node: AlgorithmicNode, facts: Record<string, any> = {}): AlgorithmicNode {
  if (!node || node.type !== "question") return node;
  const context = node.known || node.context || "ماذا عرفنا؟ ثم ماذا نتحقق الآن؟";
  const answers = (node.answers || []).map((choice) => ({
    ...choice,
    hint: choice.hint || choice.misconception || "ارجع إلى القرار السابق قبل اختيار العلامة.",
  }));
  return {
    ...node,
    nodeType: node.nodeType || "decision",
    context,
    answers,
  };
}

export function resultThinkingTrail(resultText = "") {
  if (resultText.includes("فعل مضارع")) return ["نوع الكلمة", "الزمن", "الأداة/الاتصال", "الحالة والعلامة"];
  if (resultText.includes("فعل ماض")) return ["نوع الكلمة", "الزمن", "الضمير", "علامة البناء"];
  if (resultText.includes("مبني")) return ["الموقع", "نوع الاسم", "البناء", "المحل"];
  return ["الموقع", "النوع", "العلامة", "الإعراب النهائي"];
}
