/**
 * Temporary, reversible product experiments.
 *
 * Keep these flags independent from exercise state and persistence so an
 * experiment can be disabled without changing progress, results, or data.
 */
export const ENABLE_GUIDED_LEARNING_INTROS = true;

// إبقاء الاسم القديم مؤقتًا يمنع كسر أي استيراد سابق، ويمكن حذفه بعد استقرار التجربة.
export const ENABLE_PRESENT_VERB_LEARN_INTRO = ENABLE_GUIDED_LEARNING_INTROS;
