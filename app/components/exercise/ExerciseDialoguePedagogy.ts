import type { Mode } from "../../../lib/exercise/model";
import type { PedagogyNode, PedagogyState, PedagogyTree } from "./ExercisePedagogyTypes";
import { isFiveVerbDecision } from "./ExerciseDecisionHelpers";
import { cleanQuestionText } from "./ExerciseNodePedagogy";
import { openingDialogueLine } from "./ExerciseOpeningDialogue";
import { withoutRepeatedChoiceInstruction } from "./ExerciseDialogueUtils";

export function dialogueQuestionText(node: PedagogyNode | null | undefined, target?: string, mode: Mode = "learn", state?: PedagogyState, tree?: PedagogyTree, title?: string) {
    if (state && tree) {
        const start = String(tree?.startNodeId || "");
        // في كان والتوابع تُبنى الخيارات من العقدة المطبَّعة نفسها؛ لذلك يجب أن
        // يُعرض سؤال العقدة نفسه حتى لا ينفصل نص السؤال عن خياراته.
        if (start.includes("kana") || start.includes("tawabi")) {
            const explicit = withoutRepeatedChoiceInstruction(String(node?.text || "").trim());
            if (explicit)
                return explicit;
        }
        return withoutRepeatedChoiceInstruction(openingDialogueLine(tree, node, state, title));
    }
    const id = String(node?.id || "");
    const clean = cleanQuestionText(node);
    const t = target || "الكلمة المحددة";
    if (isFiveVerbDecision(node)) {
        return withoutRepeatedChoiceInstruction(`هل الفعل (${t}) من الأفعال الخمسة؟ وهي: كل فعل مضارع اتصل بواو الجماعة أو ياء المخاطبة أو ألف الاثنين.`);
    }
    const lead = "لنفكر بهدوء:";
    return withoutRepeatedChoiceInstruction(`${lead} ${clean}`);
}

export { bridgeKickerText } from "./ExerciseDialogueBridge";
export {
    dialogueQuestionNote,
    finalI3rabSubject,
    withoutRepeatedChoiceInstruction,
} from "./ExerciseDialogueUtils";

