import type { Mode } from "./model";

export type HeroProgressInput = {
  mode: Mode;
  coveredPercent: number;
  quizCursor: number;
  quizTotal: number;
  quizCount: number;
  quizFinished: boolean;
};

export type HeroProgressViewModel = {
  label: string;
  value: string;
  fillPercent: number;
};

export function buildHeroProgress(input: HeroProgressInput): HeroProgressViewModel {
  if (input.mode !== "quiz") {
    return {
      label: "نسبة الإنجاز",
      value: `${input.coveredPercent}%`,
      fillPercent: input.coveredPercent,
    };
  }

  const total = input.quizTotal || input.quizCount;
  const current = Math.min(input.quizCursor + 1, total);
  const fillPercent = input.quizFinished
    ? 100
    : total
      ? Math.max(8, Math.round(((input.quizCursor + 1) / total) * 100))
      : 0;

  return {
    label: "تقدّم الاختبار النهائي",
    value: `${current} / ${total}`,
    fillPercent,
  };
}

export type GlobalProgressInput = {
  mode: Mode;
  coveredDone: number;
  coverageTotal: number;
  quizCursor: number;
  quizTotal: number;
  quizCount: number;
  quizFinished: boolean;
};

export type GlobalProgressViewModel = {
  label: string;
  displayDone: number;
  total: number;
  fillPercent: number;
};

export function buildGlobalProgress(input: GlobalProgressInput): GlobalProgressViewModel {
  const total = input.mode === "quiz"
    ? (input.quizTotal || input.quizCount || 1)
    : Math.max(1, input.coverageTotal || 1);

  const done = input.mode === "quiz"
    ? Math.min(input.quizCursor, total)
    : Math.min(input.coveredDone, total);

  const rawPercent = input.mode === "quiz"
    ? Math.min(100, Math.max(0, Math.round(((input.quizFinished ? total : input.quizCursor) / Math.max(1, total)) * 100)))
    : Math.min(100, Math.max(0, Math.round((done / Math.max(1, total)) * 100)));

  return {
    label: input.mode === "quiz" ? "تقدّم الاختبار" : "تقدّم المرحلة",
    displayDone: input.mode === "quiz" ? Math.min(input.quizCursor + 1, total) : done,
    total,
    fillPercent: Math.max(input.mode === "quiz" && !input.quizFinished ? 4 : 0, rawPercent),
  };
}

export function stageCompletionCopy(mode: Exclude<Mode, "quiz">) {
  return mode === "learn"
    ? {
        title: "اكتمل التعلّم الموجّه",
        description: "انتقل الآن إلى التدريب لتثبيت فهمك بطريقة ممتعة.",
        resetLabel: "إعادة التعلّم الموجّه",
      }
    : {
        title: "اكتمل التدريب",
        description: "أصبحت جاهزًا للاختبار النهائي والحصول على شهادة الإنجاز.",
        resetLabel: "إعادة التدريب",
      };
}
