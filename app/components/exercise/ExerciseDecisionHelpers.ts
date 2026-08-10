import type { PedagogyNode } from "./ExercisePedagogyTypes";

export function isFiveVerbDecision(node: PedagogyNode | null | undefined) {
    const id = String(node?.id || "");
    const text = String(node?.text || "");
    return ["raf3_five", "nasb_five", "jazm_five"].includes(id) || text.includes("الأفعال الخمسة");
}
