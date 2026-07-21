export type CertificateProgress = {
  percent?: number | null;
  practice_percent?: number | null;
  learn_completed?: boolean | null;
  practice_completed?: boolean | null;
  quiz_passed?: boolean | null;
  quiz_score?: number | null;
  quiz_total?: number | null;
};

export function getQuizPercent(progress?: CertificateProgress | null): number {
  const total = Number(progress?.quiz_total) || 0;
  if (total <= 0) return 0;
  return Math.round(((Number(progress?.quiz_score) || 0) / total) * 100);
}

/**
 * شروط الشهادة موحدة بين لوحة الطالب وصفحة الشهادة.
 * ندعم حقول الإكمال الصريحة، مع الرجوع للنسب القديمة حفاظًا على السجلات السابقة.
 */
export function isCertificateEligible(progress?: CertificateProgress | null): boolean {
  if (!progress) return false;

  const learnComplete =
    progress.learn_completed === true || Number(progress.percent) >= 100;
  const practiceComplete =
    progress.practice_completed === true || Number(progress.practice_percent) >= 100;
  const quizComplete =
    progress.quiz_passed === true || getQuizPercent(progress) >= 80;

  return learnComplete && practiceComplete && quizComplete;
}
