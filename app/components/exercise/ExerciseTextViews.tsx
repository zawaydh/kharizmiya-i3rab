import React from "react";
import { SMART_GLOSSARY } from "./ExerciseSharedViews";

export function renderSentence(sentence?: string, target?: string) {
  if (!sentence) return null;
  if (!target) return sentence;
  let shownTarget = target;
  let idx = sentence.indexOf(shownTarget);
  if (idx < 0) {
    const match = String(target).match(/\(([^)]+)\)/);
    const nestedTarget = match?.[1];
    if (nestedTarget && sentence.includes(nestedTarget)) {
      shownTarget = nestedTarget;
      idx = sentence.indexOf(shownTarget);
    }
  }
  if (idx < 0) return sentence;

  return (
    <>
      {sentence.slice(0, idx)}
      <span className="exercise-target-word">{shownTarget}</span>
      {sentence.slice(idx + shownTarget.length)}
    </>
  );
}

export function renderSmartText(text?: string, onTerm?: (term: string) => void) {
  if (!text) return null;
  const terms = Object.keys(SMART_GLOSSARY).sort((a, b) => b.length - a.length);
  const pattern = new RegExp(
    `(?<![\\p{L}\\p{M}])(${terms
      .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("|")})(?![\\p{L}\\p{M}])`,
    "gu"
  );
  const parts = String(text).split(pattern);
  return parts.map((part, index) => {
    if (SMART_GLOSSARY[part]) {
      return (
        <button
          key={`${part}-${index}`}
          type="button"
          className="smart-term"
          onClick={() => onTerm?.(part)}
          aria-label={`شرح ${part}`}
        >
          {part}
        </button>
      );
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}
