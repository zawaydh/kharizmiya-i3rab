import type { PedagogyNode, PedagogyState } from "./ExercisePedagogyTypes";

export function pronounResultText(
  node: PedagogyNode | null | undefined,
  state: PedagogyState,
  target: string,
) {
  if (node?.type !== "result" || !String(node.id || "").startsWith("R_pronoun_")) return "";

  const facts = state?.facts || {};
  const form = facts.form === "separate" ? "منفصل" : "متصل";
  const position = facts.position === "raf3" ? "رفع" : facts.position === "nasb" ? "نصب" : "جر";
  const role = facts.role === "fael"
    ? "فاعل"
    : facts.role === "mubtada"
      ? "مبتدأ"
      : facts.role === "mafool"
        ? "مفعول به"
        : facts.role === "mafool_muqaddam"
          ? "مفعول به مقدَّم"
          : facts.role === "majrur_bi_harf"
            ? "بحرف الجر"
            : "مضاف إليه";

  return `«${target}»: ضمير ${form} مبني في محل ${position} ${role}.`;
}
