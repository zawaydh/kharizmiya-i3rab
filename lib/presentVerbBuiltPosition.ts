export type PresentVerbTool = "nasb" | "jazm" | "none" | string | null | undefined;

export function presentVerbBuiltPosition(tool: PresentVerbTool): "رفع" | "نصب" | "جزم" {
  if (tool === "nasb") return "نصب";
  if (tool === "jazm") return "جزم";
  return "رفع";
}

export function presentVerbBuiltPositionNote(tool: PresentVerbTool): string {
  if (tool === "nasb") return "الفعل هو في محل نصب؛ لأنه سُبق بناصب.";
  if (tool === "jazm") return "الفعل هو في محل جزم؛ لأنه سُبق بجازم.";
  return "الفعل هو في محل رفع؛ لأنه لم يُسبق بناصب أو جازم.";
}

export function presentVerbBuiltResult(params: {
  build: "niswa" | "tawkid";
  tool: PresentVerbTool;
  target?: string;
}): string {
  const position = presentVerbBuiltPosition(params.tool);
  const targetPrefix = params.target ? `${params.target}: ` : "";
  const buildLine = params.build === "niswa"
    ? `${targetPrefix}فعل مضارع مبني على السكون لاتصاله بنون النسوة، في محل ${position}.`
    : `${targetPrefix}فعل مضارع مبني على الفتح لاتصاله المباشر بنون التوكيد، في محل ${position}.`;
  const attachedLine = params.build === "niswa"
    ? "نون النسوة: ضمير متصل مبني على الفتح في محل رفع فاعل."
    : "نون التوكيد: حرف توكيد لا محل له من الإعراب.";
  return `${buildLine}\nملاحظة: ${presentVerbBuiltPositionNote(params.tool)}\n${attachedLine}`;
}
