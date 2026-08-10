import type { useQuizSession } from "./useQuizSession";

type QuizSession = ReturnType<typeof useQuizSession>;

type Args = {
  session: QuizSession;
  notify: (message: string) => void;
  bringWorkAreaIntoView: (mode: "soft" | "center", delay?: number) => void;
};

export function createExerciseQuizActions({
  session,
  notify,
  bringWorkAreaIntoView,
}: Args) {
  async function finalizeQuizExample() {
    const result = await session.finalizeCurrent();
    if (result.status === "missing-selection") {
      notify("اختر إجابة أولًا");
    } else if (result.status === "missing-example") {
      notify("تعذر تحميل سؤال الاختبار النهائي");
    } else if (result.status === "save-failed") {
      notify("تعذر حفظ نتيجة الاختبار النهائي الآن");
    }
  }

  function startRemedialTraining() {
    if (!session.startRemedial()) {
      notify("لا توجد أخطاء واضحة لتوليد تدريب علاجي منها");
      return;
    }
    bringWorkAreaIntoView("center", 80);
  }

  function goNextRemedial() {
    const result = session.nextRemedial();
    if (result === "missing-selection") {
      notify("اختر إجابة أولًا");
    } else if (result === "completed") {
      notify("انتهى التدريب العلاجي السريع");
      bringWorkAreaIntoView("center", 80);
    } else if (result === "advanced") {
      bringWorkAreaIntoView("center", 80);
    }
  }

  return {
    finalizeQuizExample,
    previousQuizQuestion: session.previousQuestion,
    restartQuiz: session.restart,
    startRemedialTraining,
    goNextRemedial,
  };
}
