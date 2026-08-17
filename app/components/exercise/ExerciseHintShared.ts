import type { Facts } from "../../../lib/exercise/model";

export const fiveNounWrongSingularHint = (word: string) =>
  `صحيح أن (${word}) مفرد من حيث العدد، لكن في الإعراب لا نكتفي بقول: مفرد. إذا كان من الأسماء الخمسة واستوفى شروطها: مفردًا، مكبّرًا، مضافًا، ومضافًا إلى غير ياء المتكلم، فإنه يُعرب بالحروف: يُرفع بالواو، ويُنصب بالألف، ويُجر بالياء. عد إلى السؤال، ثم اختر الإجابة الصحيحة لنكمل الإعراب.`;

export const isFiveNounFact = (facts?: Facts) =>
  facts?.number === "five" ||
  facts?.ending === "five" ||
  facts?.nounClass === "five" ||
  facts?.i3rabClass === "five" ||
  facts?.shape === "five" ||
  facts?.fiveNoun === true;
