import type { ExerciseTree } from "./model";
import { getExampleCoverageKeys, resultIdToCoverage } from "./progress";
import { looksLikeProgrammingOption, toStudentArabicOption } from "../studentOptionText";

export const QUIZ_PASS_PERCENT = 80;

export type FollowUpOption = { label: string; correct: boolean; feedback?: string };
export type FollowUp = { question: string; options: FollowUpOption[] };

export type RemedialOrigin = {
  sentence?: string;
  target?: string;
  actualLabel?: string | null;
  expectedLabel?: string;
  expectedCoverage?: string;
};

export type QuizFacts = Record<string, unknown> & {
  finalI3rab?: string;
  toolWord?: string;
  tool?: string;
  hasTool?: boolean;
  shape?: string;
  ending?: string;
  weakLetter?: string;
  attached?: string;
  presentBase?: string;
  startNodeId?: string;
  remedialOrigin?: RemedialOrigin;
};

export type QuizExampleLike = {
  id: string;
  sentence?: string;
  target?: string;
  prompt?: string;
  options?: string[];
  correctI3rab?: string;
  whyCorrect?: string;
  optionReasons?: Record<string, string>;
  covers?: string[];
  followUp?: FollowUp;
  facts?: QuizFacts;
};

export type QuizAnswerRow = {
  exampleId: string;
  sentence?: string;
  target?: string;
  expectedCoverage: string;
  expectedLabel: string;
  actualCoverage: string | null;
  actualLabel: string | null;
  isCorrect: boolean;
  whyCorrect?: string;
  actualOptionReason?: string;
};

export type QuizSummary = {
  answeredRows: QuizAnswerRow[];
  score: number;
  percent: number;
  wrongRows: QuizAnswerRow[];
  passed: boolean;
};

function firstLine(text?: unknown) {
  return String(text || "").split("\n")[0]?.trim() || "";
}

export function normalizeQuizAnswerLabel(text?: string | null) {
  return firstLine(text)
    .replace(/[\u064B-\u0652\u0670]/g, "")
    .replace(/[ـ]/g, "")
    .replace(/[،؛:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isSameQuizAnswer(a?: string | null, b?: string | null) {
  const normalizedA = normalizeQuizAnswerLabel(a);
  const normalizedB = normalizeQuizAnswerLabel(b);
  return Boolean(normalizedA && normalizedB && normalizedA === normalizedB);
}

export function optionReasonForLabel(
  reasons: Record<string, string> | undefined,
  label?: string | null
) {
  if (!label || !reasons) return undefined;
  if (reasons[label]) return reasons[label];
  const match = Object.keys(reasons).find((key) => isSameQuizAnswer(key, label));
  return match ? reasons[match] : undefined;
}

export function exampleFinalLabel(example?: QuizExampleLike | null) {
  return firstLine(example?.correctI3rab || example?.facts?.finalI3rab || "");
}

function quizExpectedCause(expected?: string | null, example?: QuizExampleLike | null) {
  const expectedText = String(expected || "");
  const target = String(example?.target || "الكلمة المحددة");

  if (expectedText.includes("فعل أمر")) {
    if (expectedText.includes("نون النسوة")) return `اتصل «${target}» بنون النسوة؛ لذلك بُني فعل الأمر على السكون، ونون النسوة فاعل.`;
    if (expectedText.includes("نون التوكيد")) return `اتصل «${target}» بنون التوكيد؛ لذلك بُني فعل الأمر على الفتح.`;
    if (expectedText.includes("حذف النون")) {
      if (expectedText.includes("ألف الاثنين")) return `اتصل «${target}» بألف الاثنين، وهو من صيغ الأفعال الخمسة؛ لذلك بُني الأمر على حذف النون.`;
      if (expectedText.includes("واو الجماعة")) return `اتصل «${target}» بواو الجماعة، وهو من صيغ الأفعال الخمسة؛ لذلك بُني الأمر على حذف النون.`;
      if (expectedText.includes("ياء المخاطبة")) return `اتصل «${target}» بياء المخاطبة، وهو من صيغ الأفعال الخمسة؛ لذلك بُني الأمر على حذف النون.`;
      return `اتصل «${target}» بما يجعله من صيغ الأفعال الخمسة؛ لذلك بُني على حذف النون.`;
    }
    if (expectedText.includes("حذف حرف العلة")) {
      const letter = expectedText.includes("الألف") ? "الألف" : expectedText.includes("الواو") ? "الواو" : expectedText.includes("الياء") ? "الياء" : "حرف العلة";
      return `آخر «${target}» حرف علة هو ${letter}، وفعل الأمر يُبنى على ما يُجزم به مضارعه؛ لذلك بُني على حذف حرف العلة.`;
    }
    if (expectedText.includes("السكون")) return `«${target}» فعل أمر صحيح الآخر ولم يتصل به ما يغيّر بناءه؛ لذلك بُني على السكون.`;
  }

  if (expectedText.includes("فعل ماض")) {
    if (expectedText.includes("واو الجماعة")) return `اتصل الفعل الماضي «${target}» بواو الجماعة؛ لذلك بُني على الضم، مع مراعاة التقدير إذا كان ناقصًا.`;
    if (expectedText.includes("ضمير رفع متحرك") || expectedText.includes("تاء الفاعل") || expectedText.includes("نا الفاعلين") || expectedText.includes("نون النسوة")) return `اتصل الفعل الماضي «${target}» بضمير رفع متحرك؛ لذلك بُني على السكون.`;
    if (expectedText.includes("ألف الاثنين")) return `اتصل الفعل الماضي «${target}» بألف الاثنين؛ لذلك بقي مبنيًا على الفتح.`;
    if (expectedText.includes("الفتح المقدر")) return `«${target}» فعل ماضٍ ناقص، فبُنِي على فتح مقدر على حرف العلة أو على الحرف المحذوف.`;
    if (expectedText.includes("الفتح")) return `الفعل الماضي مبني دائمًا، ولم يتصل بـ«${target}» ما ينقله إلى السكون أو الضم؛ لذلك بُني على الفتح.`;
  }

  if (expectedText.includes("فعل مضارع")) {
    if (expectedText.includes("مبني") && expectedText.includes("نون النسوة")) return `اتصل «${target}» بنون النسوة؛ لذلك خرج من الإعراب وبُني على السكون.`;
    if (expectedText.includes("مبني") && expectedText.includes("نون التوكيد")) return `اتصل «${target}» بنون التوكيد اتصالًا مباشرًا؛ لذلك بُني على الفتح.`;
    if (expectedText.includes("منصوب")) {
      const tool = example?.facts?.toolWord ? `سبقته أداة النصب «${example.facts.toolWord}»` : "سبقه عامل نصب";
      if (expectedText.includes("حذف النون")) return `${tool}، وهو من الأفعال الخمسة؛ لذلك نُصب بحذف النون.`;
      if (expectedText.includes("فتحة مقدرة")) return `${tool}، وآخره لا تظهر عليه الفتحة؛ لذلك نُصب بفتحة مقدرة.`;
      return `${tool}؛ لذلك صار منصوبًا، ثم حددنا علامته من صورة آخر الفعل.`;
    }
    if (expectedText.includes("مجزوم")) {
      const tool = example?.facts?.toolWord ? `سبقته أداة الجزم «${example.facts.toolWord}»` : "سبقه عامل جزم";
      if (expectedText.includes("حذف النون")) return `${tool}، وهو من الأفعال الخمسة؛ لذلك جُزم بحذف النون.`;
      if (expectedText.includes("حذف حرف العلة")) return `${tool}، وهو معتل الآخر؛ لذلك جُزم بحذف حرف العلة.`;
      return `${tool}، وهو صحيح الآخر؛ لذلك جُزم بالسكون.`;
    }
    if (expectedText.includes("مرفوع")) {
      if (expectedText.includes("ثبوت النون")) return `لم يسبق «${target}» ناصب ولا جازم، وهو من الأفعال الخمسة؛ لذلك رُفع بثبوت النون.`;
      if (expectedText.includes("مقدرة")) return `لم يسبق «${target}» ناصب ولا جازم، لكنه معتل الآخر؛ لذلك رُفع بضمة مقدرة.`;
      return `لم يسبق «${target}» ناصب ولا جازم؛ لذلك بقي مرفوعًا بالضمة.`;
    }
  }

  if (expectedText.includes("مفعول به")) return `وقع الفعل على «${target}»، فهي مفعول به، والمفعول به منصوب؛ ثم نحدد علامة النصب من نوع الاسم.`;
  if (expectedText.includes("فاعل")) return `«${target}» هو من قام بالفعل أو اتصف به، فهو فاعل، والفاعل مرفوع؛ ثم نحدد علامة الرفع من نوع الاسم.`;
  if (expectedText.includes("مبتدأ")) return `بدأت الجملة الاسمية بالحديث عن «${target}»، فهو مبتدأ، والمبتدأ مرفوع.`;
  if (expectedText.includes("خبر")) return `«${target}» أتم المعنى عن الاسم قبله، فهو خبر، ثم نطبق حكم الباب وعلامته.`;
  if (expectedText.includes("توكيد")) return `أكد «${target}» ما قبله، فهو توكيد يتبع المؤكَّد في الحالة الإعرابية والعلامة المناسبة لنوعه.`;
  if (expectedText.includes("نعت")) return `وصف «${target}» الاسم قبله، فهو نعت يتبعه في الإعراب والتعريف والعدد والجنس.`;
  if (expectedText.includes("بدل")) return `جاء «${target}» مقصودًا بالحكم بعد اسم قبله، فهو بدل يتبع المبدل منه في الإعراب.`;
  if (expectedText.includes("معطوف")) return `ربط حرف العطف «${target}» بما قبله، فالمعطوف يتبع المعطوف عليه في الإعراب.`;
  return "نحدد أولًا نوع الكلمة وموقعها، ثم الحكم، ثم العلامة المناسبة لصورتها.";
}

export function explainDistractor(
  actual?: string | null,
  expected?: string | null,
  example?: QuizExampleLike | null
) {
  const actualText = String(actual || "");
  const expectedText = String(expected || "");
  if (!actualText) return "لم تختر إجابة.";
  if (isSameQuizAnswer(actualText, expectedText)) return "صحيح؛ الاختيار يوافق مسار التفكير.";

  const cause = quizExpectedCause(expectedText, example);
  const target = String(example?.target || "الكلمة المحددة");

  if (expectedText.includes("فعل أمر")) {
    if (actualText.includes("معرب")) return `سبب الخطأ أنك عاملت «${target}» فعلًا معربًا، بينما فعل الأمر مبني دائمًا. ${cause}`;
    if (!actualText.includes("فعل أمر")) return `سبب الخطأ أنك لم تثبت أن «${target}» فعل أمر يدل على الطلب. فعل الأمر مبني دائمًا. ${cause}`;
    return `أصبت في تحديد فعل الأمر، لكن علامة البناء أو سببها لا يوافقان المثال. ${cause}`;
  }

  if (expectedText.includes("فعل ماض")) {
    if (actualText.includes("معرب")) return `سبب الخطأ أنك عاملت «${target}» فعلًا معربًا، بينما الفعل الماضي مبني دائمًا. ${cause}`;
    if (!actualText.includes("فعل ماض")) return `سبب الخطأ في تحديد زمن الفعل؛ «${target}» فعل ماضٍ، والفعل الماضي مبني دائمًا. ${cause}`;
    return `نوع الفعل صحيح، لكن علامة البناء أو الضمير المتصل في اختيارك لا يوافقان المثال. ${cause}`;
  }

  if (expectedText.includes("فعل مضارع")) {
    if (expectedText.includes("مبني") && !actualText.includes("مبني")) return `سبب الخطأ أنك أعربت «${target}»، مع أن اتصاله هنا أخرجه إلى البناء. ${cause}`;
    if (!expectedText.includes("مبني") && actualText.includes("مبني")) return `سبب الخطأ أنك بنيت «${target}»، بينما المضارع هنا معرب؛ لم يتصل به ما يوجب البناء. ${cause}`;
    if (actualText.includes("مرفوع") && !expectedText.includes("مرفوع")) return `سبب الخطأ أنك اخترت الرفع قبل فحص العامل السابق. ${cause}`;
    if (actualText.includes("منصوب") && !expectedText.includes("منصوب")) return `سبب الخطأ أنك اخترت النصب، لكن العامل في الجملة لا ينصب الفعل. ${cause}`;
    if (actualText.includes("مجزوم") && !expectedText.includes("مجزوم")) return `سبب الخطأ أنك اخترت الجزم، لكن العامل في الجملة لا يجزم الفعل. ${cause}`;
    return `الحالة أو العلامة في اختيارك لا تطابق عامل الفعل وصورته. ${cause}`;
  }

  const roles = ["مبتدأ", "خبر", "فاعل", "مفعول به", "اسم كان", "خبر كان", "اسم إن", "خبر إن", "نعت", "معطوف", "توكيد", "بدل"];
  const expectedRole = roles.find((role) => expectedText.includes(role));
  const actualRole = roles.find((role) => actualText.includes(role));
  if (expectedRole && actualRole && expectedRole !== actualRole) return `سبب الخطأ في الوظيفة النحوية: اخترت «${actualRole}»، بينما علاقة «${target}» في الجملة تجعلها «${expectedRole}». ${cause}`;

  if (expectedText.includes("مبني") && !actualText.includes("مبني")) return `سبب الخطأ أنك أعربت اسمًا مبنيًا؛ الاسم المبني لا تتغير حركة آخره، بل يُعرب في محل بحسب موقعه. ${cause}`;
  if (!expectedText.includes("مبني") && actualText.includes("مبني")) return `سبب الخطأ أنك بنيت كلمة معربة؛ هذه الكلمة تتغير علامتها بحسب موقعها. ${cause}`;

  const cases = ["مرفوع", "منصوب", "مجرور", "مجزوم"];
  const expectedCase = cases.find((item) => expectedText.includes(item));
  const actualCase = cases.find((item) => actualText.includes(item));
  if (expectedCase && actualCase && expectedCase !== actualCase) return `سبب الخطأ في الحالة الإعرابية: اخترت «${actualCase}»، والصواب «${expectedCase}» لأن الموقع أو العامل يفرض ذلك. ${cause}`;

  const marks = ["الضمة", "الفتحة", "الكسرة", "السكون", "الواو", "الألف", "الياء", "ثبوت النون", "حذف النون", "حذف حرف العلة"];
  const expectedMark = marks.find((item) => expectedText.includes(item));
  const actualMark = marks.find((item) => actualText.includes(item));
  if (expectedMark && actualMark && expectedMark !== actualMark) return `سبب الخطأ في العلامة: اخترت «${actualMark}»، بينما نوع الكلمة وحالتها يقتضيان «${expectedMark}». ${cause}`;

  return `أحد قرارات اختيارك لا يوافق المثال. ${cause}`;
}

export function explainCorrectQuizAnswer(
  expected?: string | null,
  example?: QuizExampleLike | null
) {
  const expectedText = String(expected || "");
  const target = String(example?.target || "الكلمة المحددة");
  const cause = quizExpectedCause(expectedText, example);
  if (!expectedText) return cause;
  return `نبدأ من «${target}»: ${cause} لذلك تكون الإجابة الصحيحة: ${firstLine(expectedText)}`;
}

export function enrichQuizPrompt(prompt?: string) {
  const value = String(prompt || "اختر الإعراب النهائي بعد إكمال مسار التفكير.");
  if (value.includes("الخطوة") || value.includes("القرار")) return value;
  return value.replace("ما الإعراب الصحيح", "بعد تتبّع القرارات، ما الإعراب الصحيح");
}

function stableShuffle<T>(items: readonly T[], seed: string) {
  const shuffled = [...items];
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    hash ^= hash << 13;
    hash ^= hash >>> 17;
    hash ^= hash << 5;
    const swapIndex = Math.abs(hash) % (index + 1);
    const current = shuffled[index];
    const other = shuffled[swapIndex];
    if (current === undefined || other === undefined) continue;
    shuffled[index] = other;
    shuffled[swapIndex] = current;
  }
  return shuffled;
}

function buildBalancedQuizOptions(
  example: QuizExampleLike | undefined,
  seed: string,
  cursor: number
) {
  const options = Array.isArray(example?.options) ? [...example.options] : [];
  const correct = example?.correctI3rab || "";
  if (!options.length || !correct) return options;

  const shuffled = stableShuffle(Array.from(new Set(options)), seed);
  const correctIndex = shuffled.indexOf(correct);
  if (correctIndex < 0) return shuffled;
  shuffled.splice(correctIndex, 1);

  const targetPositions = [1, 2, 3, 1, 2, 3, 0];
  const targetPosition = targetPositions[cursor % targetPositions.length] ?? 0;
  const target = Math.min(targetPosition, shuffled.length);
  shuffled.splice(target, 0, correct);
  return shuffled;
}

function i3rabHead(label?: string | null) {
  const line = firstLine(label);
  const separatorIndex = line.indexOf(":");
  if (separatorIndex <= 0) return "";
  return line.slice(0, separatorIndex).trim();
}

function quizTargetHead(example?: QuizExampleLike | null) {
  return i3rabHead(example?.correctI3rab || example?.facts?.finalI3rab || "") || String(example?.target || "").trim();
}

function localizeQuizOptionToExample(option: string, example?: QuizExampleLike | null) {
  const line = toStudentArabicOption(firstLine(option));
  const separatorIndex = line.indexOf(":");
  const head = quizTargetHead(example);
  if (separatorIndex <= 0 || !head) return line;
  return toStudentArabicOption(`${head}${line.slice(separatorIndex)}`);
}

export function localQuizExpectedLabel(label: string, example?: QuizExampleLike | null) {
  return localizeQuizOptionToExample(label, example);
}

function swapOne(text: string, pairs: ReadonlyArray<readonly [string, string]>) {
  for (const [from, to] of pairs) {
    if (text.includes(from)) return text.replace(from, to);
  }
  return "";
}

function fallbackCloseQuizDistractors(correct: string) {
  const output: string[] = [];
  const push = (candidate?: string) => {
    const value = firstLine(candidate);
    if (value && value !== correct && !output.includes(value)) output.push(value);
  };

  push(swapOne(correct, [["توكيد لفظي", "توكيد معنوي"], ["توكيد معنوي", "توكيد لفظي"], ["نعت", "بدل"], ["بدل", "نعت"], ["معطوف", "توكيد معنوي"], ["فاعل", "مفعول به"], ["مفعول به", "فاعل"], ["مبتدأ", "خبر"], ["خبر", "مبتدأ"]]));
  push(swapOne(correct, [["مرفوع", "منصوب"], ["منصوب", "مجرور"], ["مجرور", "مرفوع"], ["مجزوم", "مرفوع"], ["مبني", "معرب"]]));
  push(swapOne(correct, [["الضمة", "الفتحة"], ["الفتحة", "الكسرة"], ["الكسرة", "الضمة"], ["الياء", "الألف"], ["الألف", "الياء"], ["الواو", "الياء"], ["السكون", "الفتحة"]]));
  return output;
}

export function buildCloseQuizOptions(
  example: QuizExampleLike | undefined,
  seed: string,
  cursor: number
) {
  const raw = buildBalancedQuizOptions(example, seed, cursor);
  const correct = localQuizExpectedLabel(example?.correctI3rab || example?.facts?.finalI3rab || "", example);
  if (!correct) return raw.map((option) => localizeQuizOptionToExample(option, example));

  const localized = Array.from(new Set(raw.map((option) => localizeQuizOptionToExample(option, example)).filter(Boolean)));
  const distractors = localized.filter((option) => !isSameQuizAnswer(option, correct));
  fallbackCloseQuizDistractors(correct).forEach((option) => {
    if (!distractors.some((candidate) => isSameQuizAnswer(candidate, option))) distractors.push(option);
  });

  const orderedDistractors = stableShuffle(distractors, `${seed}-distractors`).slice(0, 3);
  const targetPositions = [1, 2, 3, 1, 2, 3, 0];
  const finalOptions = [...orderedDistractors];
  const targetPosition = targetPositions[cursor % targetPositions.length] ?? 0;
  const target = Math.min(targetPosition, finalOptions.length);
  finalOptions.splice(target, 0, correct);
  return finalOptions.slice(0, 4);
}

export function buildRemedialTeacherExplanation(
  example?: QuizExampleLike | null,
  expectedLabel = ""
) {
  if (!example) return "نبدأ من موقع الكلمة في الجملة، ثم نحدد وظيفتها أو نوع الفعل، وبعد ذلك نصل إلى الحكم والعلامة الصحيحة.";

  const target = String(example.target || "الكلمة المحددة").replace(/[()]/g, "");
  const facts = example.facts || {};
  const label = expectedLabel || example.correctI3rab || facts.finalI3rab || "الإجابة الصحيحة";
  const startId = String(facts.startNodeId || "");

  if (facts.presentBase || startId.includes("imperative") || label.includes("فعل أمر")) {
    const attached = facts.attached;
    if (attached === "nun_niswa") return `نبدأ بـ«${target}»: هو فعل أمر اتصلت به نون النسوة. اتصال نون النسوة يجعل فعل الأمر مبنيًا على السكون، لذلك نصل إلى: ${label}.`;
    if (["alif", "waw", "yaa"].includes(String(attached || ""))) return `نبدأ بـ«${target}»: هو فعل أمر اتصل بضمير من ضمائر الأفعال الخمسة. عند الأمر نحذف النون، لذلك نصل إلى: ${label}.`;
    if (facts.ending === "weak") {
      const presentBase = facts.presentBase ? `نرده إلى مضارعه «${facts.presentBase}»` : "نرده إلى مضارعه";
      const weak = facts.weakLetter === "alif" ? "الألف" : facts.weakLetter === "waw" ? "الواو" : facts.weakLetter === "ya" ? "الياء" : "حرف العلة";
      return `نبدأ بـ«${target}»: هو فعل أمر لم يتصل به ضمير. ${presentBase} فنجد أن آخر أصله ${weak}، وقد حُذف في صيغة الأمر؛ لذلك نصل إلى: ${label}.`;
    }
    return `نبدأ بـ«${target}»: هو فعل أمر لم يتصل به شيء، وآخره صحيح؛ لذلك يكون مبنيًا على السكون، ونصل إلى: ${label}.`;
  }

  if (startId.includes("present") || label.includes("فعل مضارع") || Object.prototype.hasOwnProperty.call(facts, "hasTool")) {
    const tool = facts.toolWord || facts.tool;
    const toolText = facts.hasTool && tool ? `سبقته أداة «${String(tool)}»` : "لم تسبقه أداة نصب أو جزم";
    const shape = facts.shape === "five" ? "وهو من الأفعال الخمسة" : facts.ending === "weak" ? "وهو معتل الآخر" : "وهو صحيح الآخر";
    return `نبدأ بـ«${target}»: هو فعل مضارع. ${toolText}، ${shape}. نجمع هذين القرارين لنحدد حالته وعلامته، فنصل إلى: ${label}.`;
  }

  if (startId.includes("past") || label.includes("فعل ماض")) {
    const attached = facts.attached;
    const attachedText = attached === "waw" ? "اتصلت به واو الجماعة" : attached === "nun_niswa" ? "اتصلت به نون النسوة" : attached === "taa_fael" || attached === "na" ? "اتصل به ضمير رفع متحرك" : attached === "alif" ? "اتصلت به ألف الاثنين" : attached === "taa_tanith" ? "اتصلت به تاء التأنيث الساكنة" : "لم يتصل بآخره ما يغيّر بناءه";
    return `نبدأ بـ«${target}»: هو فعل ماضٍ، ثم نفحص ما اتصل بآخره. ${attachedText}؛ ومن هذا الاتصال نحدد علامة البناء ونصل إلى: ${label}.`;
  }

  if (label.includes("فاعل")) return `نبحث عمّن قام بالفعل في الجملة؛ فنجد أن «${target}» هو القائم به، لذلك وظيفته فاعل، والفاعل مرفوع دائمًا. ثم ننظر إلى صورة الكلمة لتحديد علامة الرفع، فنصل إلى: ${label}.`;
  if (label.includes("مفعول به")) return `نبحث عمّا وقع عليه الفعل؛ فنجد أن «${target}» وقع عليه الحدث، لذلك وظيفته مفعول به، والمفعول به منصوب دائمًا. ثم ننظر إلى نوع الكلمة لتحديد علامة النصب، فنصل إلى: ${label}.`;
  if (label.includes("مبتدأ")) return `نبدأ بالجملة الاسمية ونحدد الاسم الذي بدأ به الحديث؛ وهو «${target}»، لذلك هو مبتدأ مرفوع. ثم ننظر إلى نوعه لتحديد علامة الرفع، فنصل إلى: ${label}.`;
  if (label.includes("خبر")) return `بعد تحديد المبتدأ أو الاسم الناسخ، نسأل: ما المعلومة التي أتمت المعنى؟ الجواب هو «${target}»، لذلك نحدد نوع الخبر وحكمه ثم علامته، فنصل إلى: ${label}.`;
  if (label.includes("نعت")) return `نربط «${target}» بالاسم الذي قبله؛ فهو يصفه، لذلك هو نعت. والنعت يتبع منعوته في الإعراب، ثم نحدد العلامة من صورة الكلمة، فنصل إلى: ${label}.`;
  if (label.includes("توكيد")) return `نلاحظ أن «${target}» أعاد اللفظ أو قوّى معنى الاسم قبله، لذلك هو توكيد. والتوكيد يتبع المؤكَّد في الإعراب، فننقل حكمه ثم نحدد العلامة، ونصل إلى: ${label}.`;
  if (label.includes("بدل")) return `نلاحظ أن «${target}» هو المقصود بالحكم بعد اسم قبله، لذلك هو بدل. والبدل يتبع المبدل منه في الإعراب، ثم نحدد العلامة من صورة الكلمة، فنصل إلى: ${label}.`;
  if (label.includes("معطوف")) return `نحدد الاسم قبل حرف العطف، ثم نجد أن «${target}» شاركه في الحكم، لذلك هو معطوف يتبع المعطوف عليه في الإعراب، فنصل إلى: ${label}.`;

  return example.whyCorrect || `نبدأ بموقع «${target}» في الجملة، ثم نحدد وظيفته أو نوعه، وبعد ذلك نثبت الحكم والعلامة حتى نصل إلى: ${label}.`;
}

export function buildRemedialQueueFromMistakes(
  rows: readonly QuizAnswerRow[],
  sourceExamples: readonly QuizExampleLike[]
) {
  const wrongRows = rows.filter((row) => !row.isCorrect);
  const queue: QuizExampleLike[] = [];
  const used = new Set<string>();

  wrongRows.forEach((row, index) => {
    const sameSkill = sourceExamples.filter((example) => getExampleCoverageKeys(example).includes(row.expectedCoverage));
    const preferred = sameSkill.find((example) => String(example.id) !== String(row.exampleId)) || sameSkill[0] || sourceExamples.find((example) => String(example.id) === String(row.exampleId));
    if (!preferred) return;
    const key = `${row.expectedCoverage}-${preferred.id}-${index}`;
    if (used.has(key)) return;
    used.add(key);
    queue.push({
      ...preferred,
      id: `remedial-${row.exampleId}-${index}-${preferred.id}`,
      prompt: "لنحل مثالًا جديدًا من موضع الخطأ نفسه.",
      facts: {
        ...(preferred.facts || {}),
        remedialOrigin: {
          sentence: row.sentence,
          target: row.target,
          actualLabel: row.actualLabel,
          expectedLabel: row.expectedLabel,
          expectedCoverage: row.expectedCoverage,
        },
      },
    });
  });

  return queue.slice(0, 8);
}

function findResultLabelByCoverage(tree: ExerciseTree | null | undefined, coverage?: string) {
  if (!coverage) return "";
  const match = Object.values(tree?.nodes || {}).find(
    (node) => node.type === "result" && (node.coverage === coverage || resultIdToCoverage(node.id) === coverage)
  );
  return firstLine(match?.text);
}

export function coverageDisplayLabel(key?: string | null) {
  const normalizedKey = String(key || "");
  const labels: Record<string, string> = {
    "tawabi.naat": "النعت",
    "tawabi.atf": "العطف",
    "tawabi.tawkid": "التوكيد",
    "tawabi.tawkid_lafzi": "التوكيد اللفظي",
    "tawabi.tawkid_manawi": "التوكيد المعنوي",
    "tawabi.badal": "البدل",
    "tawabi.raf3": "الرفع",
    "tawabi.nasb": "النصب",
    "tawabi.jarr": "الجر",
    "tawabi.singular": "المفرد",
    "tawabi.dual": "المثنى",
    "tawabi.jms": "جمع مذكر سالم",
    "tawabi.jfs": "جمع مؤنث سالم",
    "tawabi.jt": "جمع تكسير",
    "tawabi.five": "الأسماء الخمسة",
    "tawabi.sentence": "الجملة",
    "tawabi.shibh": "شبه الجملة",
    "tawabi.damma": "الضمة",
    "tawabi.fatha": "الفتحة",
    "tawabi.kasra": "الكسرة",
    "tawabi.alif": "الألف",
    "tawabi.yaa": "الياء",
    "tawabi.waw": "الواو",
  };
  return labels[normalizedKey] || toStudentArabicOption(normalizedKey, "التصنيف النحوي المناسب");
}

export function safeFinalLabel(
  tree: ExerciseTree | null | undefined,
  example: QuizExampleLike | null | undefined,
  fallbackCoverage?: string
) {
  const fromExample = exampleFinalLabel(example);
  if (fromExample && !looksLikeProgrammingOption(fromExample)) return toStudentArabicOption(fromExample);
  const fromResult = findResultLabelByCoverage(tree, fallbackCoverage);
  if (fromResult && !looksLikeProgrammingOption(fromResult)) return toStudentArabicOption(fromResult);
  return coverageDisplayLabel(fallbackCoverage);
}

export function createQuizAnswerRow(args: {
  example: QuizExampleLike;
  expectedCoverage: string;
  expectedLabel: string;
  actualLabel: string;
}): QuizAnswerRow {
  const { example, expectedCoverage, expectedLabel, actualLabel } = args;
  const isCorrect = isSameQuizAnswer(actualLabel, expectedLabel);
  return {
    exampleId: example.id,
    sentence: example.sentence,
    target: example.target,
    expectedCoverage,
    expectedLabel,
    actualCoverage: isCorrect ? expectedCoverage : null,
    actualLabel,
    isCorrect,
    whyCorrect: explainCorrectQuizAnswer(expectedLabel, example),
    actualOptionReason: explainDistractor(actualLabel, expectedLabel, example) || optionReasonForLabel(example.optionReasons, actualLabel),
  };
}

export function createRemedialAnswerRow(args: {
  example: QuizExampleLike;
  expectedCoverage: string;
  expectedLabel: string;
  actualLabel: string;
}): QuizAnswerRow {
  const { example, expectedCoverage, expectedLabel, actualLabel } = args;
  const isCorrect = isSameQuizAnswer(actualLabel, expectedLabel);
  return {
    exampleId: example.id,
    sentence: example.sentence,
    target: example.target,
    expectedCoverage,
    expectedLabel,
    actualCoverage: isCorrect ? expectedCoverage : null,
    actualLabel,
    isCorrect,
    whyCorrect: example.whyCorrect || "راجع المسار: نبدأ بالوظيفة أو العلاقة، ثم الحالة، ثم العلامة.",
    actualOptionReason: isCorrect ? "صحيح؛ عالجت موضع الضعف في هذا المثال." : explainDistractor(actualLabel, expectedLabel, example),
  };
}

export function summarizeQuizAnswers(rows: readonly QuizAnswerRow[]): QuizSummary {
  const answeredRows = rows.filter(Boolean);
  const score = answeredRows.filter((row) => row.isCorrect).length;
  const percent = answeredRows.length ? Math.round((score / answeredRows.length) * 100) : 0;
  const wrongRows = answeredRows.filter((row) => !row.isCorrect);
  return {
    answeredRows,
    score,
    percent,
    wrongRows,
    passed: percent >= QUIZ_PASS_PERCENT,
  };
}
