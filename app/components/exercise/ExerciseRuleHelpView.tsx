"use client";

import { renderSmartText } from "./ExerciseTextViews";

export function ExerciseRuleHelpView({
  text,
  onGlossary,
}: {
  text: string;
  onGlossary: (term: string) => void;
}) {
  return (
    <details className="exercise-rule-review">
      <summary>راجع الشرح</summary>
      <div className="exercise-rule-review-body">{renderSmartText(text, onGlossary)}</div>
    </details>
  );
}
