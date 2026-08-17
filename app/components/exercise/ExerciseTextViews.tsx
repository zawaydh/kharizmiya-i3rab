import React from "react";
import { SMART_GLOSSARY } from "./ExerciseSharedViews";

const SENTENCE_PREPOSITIONS = new Set(["من", "إلى", "عن", "على", "في", "ب", "ك", "ل", "رب", "حتى", "مذ", "منذ"]);
const BUILT_PRONOUNS = new Set(["أنا", "نحن", "أنت", "أنتما", "أنتم", "أنتن", "هو", "هي", "هما", "هم", "هن"]);
const BUILT_DEMONSTRATIVES = new Set(["هذا", "هذه", "هؤلاء", "ذلك", "تلك", "أولئك"]);
const BUILT_RELATIVES = new Set(["الذي", "التي", "الذين", "اللاتي", "اللائي"]);
const ADDITION_HEADS = new Set(["كل", "بعض", "فوق", "تحت", "أمام", "خلف", "قبل", "بعد", "بين", "عند", "لدى"]);

function bareArabicToken(token: string): string {
  return token
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
    .replace(/[^\p{L}]/gu, "");
}

function sentenceHelpTerm(token: string, previousToken?: string): string | null {
  const bare = bareArabicToken(token);
  const previous = previousToken ? bareArabicToken(previousToken) : "";
  if (!bare) return null;
  if (BUILT_PRONOUNS.has(bare)) return "ضمير منفصل";
  if (BUILT_DEMONSTRATIVES.has(bare)) return "اسم إشارة";
  if (BUILT_RELATIVES.has(bare)) return "اسم موصول";
  if (SENTENCE_PREPOSITIONS.has(bare) || /^(بال|كال|لل)/u.test(bare)) return "حروف الجر";
  if (previous && ADDITION_HEADS.has(previous)) return "المضاف إليه";
  return null;
}


function SentenceSmartTerm({
  helpTerm,
  onTerm,
  children,
}: {
  helpTerm: string;
  onTerm?: (term: string) => void;
  children: React.ReactNode;
}) {
  const [showQuestion, setShowQuestion] = React.useState(false);
  return (
    <button
      type="button"
      className="smart-term sentence-smart-term"
      onClick={() => onTerm?.(helpTerm)}
      onMouseEnter={() => setShowQuestion(true)}
      onMouseLeave={() => setShowQuestion(false)}
      onFocus={() => setShowQuestion(true)}
      onBlur={() => setShowQuestion(false)}
      aria-label={`شرح ${helpTerm}`}
      title={`مرّر أو انقر لشرح ${helpTerm}`}
      style={{ position: "relative" }}
    >
      {children}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          insetInlineStart: "calc(100% + 2px)",
          top: "-0.55em",
          width: 17,
          height: 17,
          display: showQuestion ? "grid" : "none",
          placeItems: "center",
          border: "1px solid currentColor",
          borderRadius: "50%",
          background: "#fff",
          color: "var(--clean-primary-text)",
          fontSize: 10,
          fontWeight: 800,
          lineHeight: 1,
          pointerEvents: "none",
          zIndex: 5,
        }}
      >
        ؟
      </span>
    </button>
  );
}

const TARGET_SKIP_RE = /[\u064B-\u065F\u0670\u06D6-\u06EDـ]/u;

function targetCandidate(target?: string): string {
  if (!target) return "";
  const nested = String(target).match(/\(([^)]+)\)/)?.[1];
  return String(nested || target).trim();
}

function normalizedWithMap(value: string) {
  let normalized = "";
  const map: number[] = [];
  Array.from(value).forEach((character, index) => {
    if (TARGET_SKIP_RE.test(character)) return;
    normalized += character;
    map.push(index);
  });
  return { normalized, map };
}

function targetRange(sentence: string, target?: string): { start: number; end: number } | null {
  const wanted = targetCandidate(target);
  if (!wanted) return null;
  const sentenceView = normalizedWithMap(sentence);
  const targetView = normalizedWithMap(wanted);
  const index = sentenceView.normalized.indexOf(targetView.normalized);
  if (index < 0 || !targetView.normalized) return null;
  const start = sentenceView.map[index];
  const last = sentenceView.map[index + targetView.normalized.length - 1];
  if (start == null || last == null) return null;
  return { start, end: last + 1 };
}

function renderTokenRange(token: string, tokenStart: number, range: { start: number; end: number } | null) {
  if (!range) return token;
  const tokenEnd = tokenStart + token.length;
  const overlapStart = Math.max(tokenStart, range.start);
  const overlapEnd = Math.min(tokenEnd, range.end);
  if (overlapStart >= overlapEnd) return token;
  const localStart = overlapStart - tokenStart;
  const localEnd = overlapEnd - tokenStart;
  return (
    <>
      {token.slice(0, localStart)}
      <span className="exercise-target-word">{token.slice(localStart, localEnd)}</span>
      {token.slice(localEnd)}
    </>
  );
}

export function renderSentence(sentence?: string, target?: string, onTerm?: (term: string) => void) {
  if (!sentence) return null;
  const parts = sentence.split(/(\s+)/);
  const range = targetRange(sentence, target);
  let previousWord: string | undefined;
  let offset = 0;

  return parts.map((part, index) => {
    const partStart = offset;
    offset += part.length;
    if (/^\s+$/u.test(part)) return <React.Fragment key={`space-${index}`}>{part}</React.Fragment>;
    const helpTerm = onTerm ? sentenceHelpTerm(part, previousWord) : null;
    const rendered = renderTokenRange(part, partStart, range);
    const currentWord = bareArabicToken(part) ? part : undefined;
    if (currentWord) previousWord = currentWord;
    if (helpTerm) {
      return (
        <SentenceSmartTerm key={`word-${index}`} helpTerm={helpTerm} onTerm={onTerm}>
          {rendered}
        </SentenceSmartTerm>
      );
    }
    return <React.Fragment key={`word-${index}`}>{rendered}</React.Fragment>;
  });
}

export function renderSmartText(
  text?: string,
  onTerm?: (term: string) => void,
  options: { interactiveTerms?: boolean } = {},
) {
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
      if (options.interactiveTerms === false) {
        return <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>;
      }
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
