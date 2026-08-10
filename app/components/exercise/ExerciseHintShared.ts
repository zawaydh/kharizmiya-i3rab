import type { Facts } from "../../../lib/exercise/model";

export const fiveNounWrongSingularHint = (word: string) =>
  `أحسنت، (${word}) يدل على واحد فعلًا، لكن في الإعراب لا نكتفي بقول: مفرد. إذا كان من الأسماء الخمسة واستوفى شروطها فإنه يعرب بالحروف: يرفع بالواو، وينصب بالألف، ويجر بالياء. عد للسؤال واختر: من الأسماء الخمسة.`;

export const isFiveNounFact = (facts?: Facts) =>
  facts?.number === "five" ||
  facts?.ending === "five" ||
  facts?.nounClass === "five" ||
  facts?.i3rabClass === "five";
