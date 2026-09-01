import {
  buildPracticePolicyDistractors,
  buildPracticePolicyGuidance,
  normalizePracticeDecisionWording,
  practiceGrammarPolicyAllows,
  practiceOptionScope as policyPracticeOptionScope,
  type PracticeOptionScope,
} from "../../../lib/exercise/practiceGrammarPolicy";
import { evaluateAnswer } from "../../../lib/exercise/engine";
import { buildPracticeTopicGuidance } from "./PracticeTopicCoach";
import type {
  ExerciseAnswer,
  ExerciseExample,
  ExerciseTree,
  Mode,
  PracticeSemanticRole,
  QuestionNode,
} from "../../../lib/exercise/model";
import { buildRunnerState, type RunnerState } from "../../../lib/exercise/runner";
import { isHintAnswerOption, resolveAnswerAttempt } from "../../../lib/exercise/answerSession";
import {
  buildI3rabDistractors,
  isSameQuizAnswer,
  safePracticeFinalLabel,
  type QuizExampleLike,
} from "../../../lib/exercise/quiz";
import {
  answerEffectLabel,
  cleanPracticeTeacherPart,
  normalizeThinkingNode,
} from "./ExercisePedagogy";

type PracticeFlowContext = {
  tree: ExerciseTree;
  mode: Mode;
  example?: ExerciseExample;
  state: RunnerState;
  practiceExpectedLabel: string;
  topicId?: string;
  wrongOption?: string;
};

type PracticeRouteStep = {
  node: QuestionNode;
  correct: ExerciseAnswer;
  state: RunnerState;
};

function normalizePracticeComparable(text: string): string {
  return String(text || "")
    .replace(/[ًٌٍَُِّْـ«»()[\]{}،؛:,.!?؟"'`]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function oneLine(text?: string | null): string {
  return String(text || "")
    .replace(/\s*\n+\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function practiceSemanticText(text?: string | null): string {
  return oneLine(text)
    .normalize("NFKC")
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function practiceFinalAnswerText(text?: string | null): string {
  return oneLine(text)
    .replace(/\s+ملاحظة:\s*[^.]+[.]?/gu, " ")
    .replace(/\s*[.،؛]\s*وأصل الفعل:\s*[^.،؛]+[.]?$/u, "")
    .replace(
      /\s*[،؛.]\s*وقد تحققت شروط إعرابها بالحروف:[\s\S]*$/u,
      "",
    )
    .replace(/\s+(?:مثال|مثل):\s*[\s\S]*$/u, "")
    .replace(/\s+الأفعال الخمسة أفعال مضارعة[\s\S]*$/u, "")
    .replace(/\s+الجملة كلها هي الخبر[\s\S]*$/u, "")
    .replace(/\.\s*نُعرب داخلها[\s\S]*$/u, ".")
    .replace(/،\s*والاسم النكرة بعدها اسم إن مؤخر منصوب[\s\S]*$/u, ".")
    .replace(/\s+داخلها مبتدأ ثانٍ[\s\S]*$/u, "")
    .replace(/\s+والاسم النكرة بعدها مبتدأ مؤخر[\s\S]*$/u, "")
    .replace(/؛\s*حذفت الياء لأنه[^.]+[.]?/u, "")
    .replace(/،?\s*والياء ثابتة لأنه[^.]+/u, "، والياء ثابتة")
    .replace(/منع من ظهورها الثقل/gu, "للثقل")
    .replace(/(ضمير مستتر(?: وجوبًا)? تقديره [^ .،؛]+)\s+يعود على [^.،؛]+/u, "$1")
    .replace(/\s+(?:سبب الاختيار|تنبيه|والتقدير):\s*[\s\S]*$/u, "")
    .replace(/\s+ليست من المفاعيل الخمسة[\s\S]*$/u, "")
    .replace(/\s+راجع موضوع [^.]+\.?[\s\S]*$/u, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanPracticeLine(text?: string | null): string {
  return cleanPracticeTeacherPart(text)
    .replace(/\s+(?:وننتقل|ننتقل|وسننتقل|سننتقل|والآن ننتقل|ثم ننتقل)[\s\S]*$/u, "")
    .replace(
      /(?:^|[.،؛]\s*|\s+)(?:ثم\s+)?(?:عد إلى السؤال|عد للسؤال|عد واختر|ارجع إلى السؤال|راجع السؤال)[\s\S]*$/u,
      "",
    )
    .replace(/[،؛]?\s*ثم\s*$/u, "")
    .replace(/\*\*|__/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function practiceTargetOnlyResult(text: string, target?: string): string {
  const value = practiceFinalAnswerText(text);
  const targetKey = normalizePracticeComparable(String(target || ""));
  if (!targetKey || !normalizePracticeComparable(value).startsWith(targetKey)) return value;

  // بعض النتائج الكاملة تتكون من أكثر من جملة تخص الكلمة نفسها:
  // «علامة رفعه: ...»، «والتاء: ...»، «وواو الجماعة: ...» إلخ.
  // نحافظ على هذه الأجزاء التابعة، ونقطع فقط عند بدء إعراب كلمة مستقلة أخرى.
  const dependentLabels = /^(?:علامة (?:رفعه|نصبه|جره|جزمه|بنائه)|(?:تاء|التاء|هاء|الهاء|نا|نون النسوة|نون التوكيد|ألف الاثنين|واو الجماعة|ياء المخاطبة)|الفاعل)$/u;
  const marker = /\.\s*((?:و)?[^.؛،:]{1,48}):\s*/gu;
  let match: RegExpExecArray | null;

  while ((match = marker.exec(value))) {
    const label = String(match[1] || "").trim();
    const dependentLabel = label.replace(/^و/u, "").trim();
    if (dependentLabels.test(dependentLabel)) continue;
    return value.slice(0, match.index + 1).trim();
  }

  return value;
}
function isIncompletePracticeResultLabel(
  label: string,
  target?: string,
): boolean {
  const value = practiceSemanticText(label)
    .replace(/[.:：؛،]+$/gu, "")
    .trim();

  if (!value) return true;

  const targetValue = practiceSemanticText(target || "")
    .replace(/[.:：؛،]+$/gu, "")
    .trim();

  return Boolean(targetValue) && value === targetValue;
}

export function practiceExpectedLabelForExample(
  label: string,
  example?: ExerciseExample,
): string {
  const quizExample = example as QuizExampleLike | undefined;

  const rawTreeLabel = practiceFinalAnswerText(label);
  const isRoutingResult = policyPracticeOptionScope(rawTreeLabel) === "routing";

  const isIncompleteResult = isIncompletePracticeResultLabel(
    rawTreeLabel,
    example?.target,
  );

  const explicitSource = String(
    example?.facts?.practiceFinalI3rab ||
    example?.facts?.finalI3rab ||
    "",
  );

  // facts.finalI3rab قد يضم أكثر من جملة تخص المطلوب نفسه
  // (مثل واو الجماعة أو تاء التأنيث)، وقد يضم بعد ذلك إعراب كلمة أخرى.
  // نحتفظ بكل الأجزاء التابعة للمطلوب، ثم نتوقف عند أول نتيجة مستقلة أخرى.
  const explicitPrimary = practiceTargetOnlyResult(
    explicitSource,
    example?.target,
  );

  const quizFallback = practiceFinalAnswerText(
    String(quizExample?.correctI3rab || ""),
  );

  const targetKey = normalizePracticeComparable(
    String(example?.target || ""),
  );
  const rawKey = normalizePracticeComparable(rawTreeLabel);
  const explicitKey = normalizePracticeComparable(explicitPrimary);

  const withoutTarget = (value: string) => {
    if (targetKey && value.startsWith(targetKey)) {
      return value.slice(targetKey.length).trim();
    }
    return value;
  };

  const rawComparable = withoutTarget(rawKey);
  const explicitComparable = withoutTarget(explicitKey);

  // مثال: raw = «فعل مضارع مرفوع»، بينما finalI3rab يضيف العلامة وسببها
  // في السطر نفسه. هنا نحتفظ بالتفصيل الكامل لأنه يخص المطلوب نفسه.
  const explicitExpandsSameResult =
    Boolean(rawComparable) &&
    Boolean(explicitComparable) &&
    explicitComparable.startsWith(rawComparable) &&
    explicitComparable.length > rawComparable.length + 8;

  const rawScope = policyPracticeOptionScope(rawTreeLabel);
  const explicitScope = policyPracticeOptionScope(explicitPrimary);
  const explicitIsMoreSpecific =
    Boolean(explicitPrimary) &&
    (
      rawScope === "generic" ||
      (
        rawScope === "case" &&
        ["role", "verb", "structure"].includes(explicitScope)
      )
    );

  const chosen =
    isRoutingResult
      ? rawTreeLabel
      : isIncompleteResult
        ? explicitPrimary || quizFallback || rawTreeLabel
        : explicitExpandsSameResult || explicitIsMoreSpecific
          ? explicitPrimary
          : rawTreeLabel || explicitPrimary || quizFallback;

  return alignPracticeResultTarget(
    practiceTargetOnlyResult(chosen, example?.target),
    example?.target,
  );
}

function alignPracticeResultTarget(
  result: string,
  target?: string,
): string {
  const value = oneLine(result);
  const rawTarget = String(target || "").trim();
  if (!value || !rawTarget) return value;

  // Routing results are guidance sentences, not lexical i'rab labels.
  // Never rewrite their introductory phrase with the target word.
  if (
    policyPracticeOptionScope(value) === "routing" ||
    /عرفت مفتاح الجملة|الكلمة الأولى/u.test(value)
  ) {
    return value;
  }

  // Only repair simple lexical targets. Compound targets such as
  // "التاء في (فهمتُ)" legitimately begin with a shorter grammatical label.
  if (/\s|[()]/u.test(rawTarget)) return value;

  const firstLabel = value.match(/^([^:：]{1,40})[:：]\s*/u)?.[1]?.trim() || "";
  if (!firstLabel) return value;

  if (
    normalizePracticeComparable(firstLabel) ===
    normalizePracticeComparable(rawTarget)
  ) {
    return value;
  }

  return value.replace(/^([^:：]{1,40})([:：]\s*)/u, `${rawTarget}$2`);
}

export function practiceOptionScope(label: string): PracticeOptionScope {
  return policyPracticeOptionScope(label);
}

function topicPracticeDistractors(
  correct: string,
  facts: Record<string, unknown>,
  topicId?: string,
): string[] {
  if (topicId === "fael" && String(facts.roleKind || "") === "hidden") {
    const current = String(facts.hiddenPronoun || "").trim();
    const match = correct.match(/(الفاعل:\s*ضمير مستتر(?: وجوبًا)? تقديره )([^ .،؛]+)/u);
    if (match) {
      const pronouns = ["هو", "هي", "أنا", "نحن", "أنت", "أنتِ"]
        .filter((item) => item !== (current || match[2]))
        .slice(0, 2);
      return pronouns.map((pronoun) =>
        correct.replace(
          /(الفاعل:\s*ضمير مستتر(?: وجوبًا)? تقديره )([^ .،؛]+)/u,
          `$1${pronoun}`,
        ),
      );
    }
  }

  return [];
}

function contextualPracticeDistractors(
  correct: string,
  facts: Record<string, unknown>,
  topicId?: string,
): string[] {
  const scope = practiceOptionScope(correct);
  const topicCandidates = topicPracticeDistractors(correct, facts, topicId);
  const candidates = [
    ...topicCandidates,
    ...buildPracticePolicyDistractors(correct, facts),
    ...buildI3rabDistractors(correct).map(oneLine),
  ];

  return candidates
    .filter((candidate) => practiceOptionScope(candidate) === scope)
    .filter((candidate) => practiceGrammarPolicyAllows(correct, candidate))
    .filter((candidate) => !isSameQuizAnswer(candidate, correct))
    .filter(
      (candidate, index, items) =>
        items.findIndex((item) => isSameQuizAnswer(item, candidate)) === index,
    )
    .slice(0, 2);
}

function stablePracticeRank(seed: string, value: string): number {
  let hash = 2166136261;
  const source = `${seed}:${value}`;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function buildPracticeDirectOptions({
  example,
  state,
  practiceExpectedLabel,
  topicId,
}: PracticeFlowContext): string[] {
  const correct = oneLine(practiceExpectedLabel);
  if (!correct) return [];

  const facts = (example?.facts || state.facts || {}) as Record<string, unknown>;
  const options = [
    correct,
    ...contextualPracticeDistractors(correct, facts, topicId),
  ]
    .filter(
      (option, index, items) =>
        items.findIndex((item) => isSameQuizAnswer(item, option)) === index,
    );

  const seed = String(example?.id || state.currentTarget || "practice");
  return options.sort(
    (first, second) =>
      stablePracticeRank(seed, first) - stablePracticeRank(seed, second),
  );
}

export function walkCorrectPracticeRoute(
  context: Pick<PracticeFlowContext, "tree" | "mode" | "example">,
  onStep?: (step: PracticeRouteStep) => void,
): RunnerState {
  let nextState = buildRunnerState(context.tree, context.mode, context.example);
  let guard = 0;

  while (guard++ < 30) {
    const rawNode = context.tree.nodes[nextState.currentNodeId];
    if (!rawNode || rawNode.type === "result") break;

    const normalizedNode = normalizeThinkingNode(rawNode, nextState);
    if (!normalizedNode || normalizedNode.type !== "question" || !normalizedNode.answers) {
      break;
    }

    const questionNode: QuestionNode = {
      ...rawNode,
      ...normalizedNode,
      id: String(normalizedNode.id || rawNode.id),
      type: "question",
      text: String(normalizedNode.text || rawNode.text || ""),
      answers: normalizedNode.answers,
    };

    const correct = questionNode.answers.find(
      (answer) =>
        !isHintAnswerOption(answer) &&
        evaluateAnswer(answer, nextState.facts || {}),
    );

    if (!correct) break;

    onStep?.({ node: questionNode, correct, state: nextState });

    const activeTree: ExerciseTree = {
      ...context.tree,
      nodes: {
        ...context.tree.nodes,
        [String(nextState.currentNodeId)]: questionNode,
      },
    };

    const attempt = resolveAnswerAttempt({
      tree: activeTree,
      node: questionNode,
      state: nextState,
      answerId: correct.id,
    });

    if (attempt.kind !== "correct" || attempt.blocked) break;
    nextState = attempt.nextState;
  }

  return nextState;
}


export function practiceExpectedLabelFromRoute(args: {
  tree: ExerciseTree;
  mode?: Mode;
  example?: ExerciseExample;
}): string {
  const finalState = walkCorrectPracticeRoute({
    tree: args.tree,
    mode: args.mode || "practice",
    example: args.example,
  });
  const node = args.tree.nodes[finalState.currentNodeId];
  const routeResult = node?.type === "result" ? String(node.text || "") : "";
  const routeLabel = practiceExpectedLabelForExample(routeResult, args.example);

  // Some trees intentionally keep the terminal node concise. If that concise
  // label is too generic for a direct-practice question, recover the canonical
  // coverage result. Never replace a meaningful routing/role/verb result.
  if (policyPracticeOptionScope(routeLabel) !== "generic") {
    return routeLabel;
  }

  const quizExample = args.example as QuizExampleLike | undefined;
  const primaryCoverage = String(quizExample?.covers?.[0] || "");
  if (!quizExample || !primaryCoverage) return routeLabel;

  const coverageLabel = practiceExpectedLabelForExample(
    safePracticeFinalLabel(args.tree, quizExample, primaryCoverage),
    args.example,
  );

  return policyPracticeOptionScope(coverageLabel) !== "generic"
    ? coverageLabel
    : routeLabel;
}

function compactPracticeQuestion(text: string, target: string): string {
  const quoted = `«${target}»`;

  return String(text || "")
    .replace(/الكلمة المحددة|الكلمة المطلوبة|الكلمة المستهدفة/g, quoted)
    .replace(/الفعل المحدد/g, `الفعل ${quoted}`)
    .replace(/الاسم المحدد/g, `الاسم ${quoted}`)
    .replace(/اختر الإجابة الصحيحة مما (?:يأتي|يلي)[:：]?/gu, "")
    .replace(/اختر الإجابة المناسبة مما (?:يأتي|يلي)[:：]?/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function practiceExampleForReasoning(
  context: Pick<PracticeFlowContext, "example" | "state">,
): ExerciseExample {
  return context.example || {
    id: context.state.currentExampleId,
    sentence: context.state.currentSentence,
    target: context.state.currentTarget,
    facts: context.state.facts,
  };
}

function buildCanonicalThinkingRoute(
  context: Pick<PracticeFlowContext, "tree" | "mode" | "example" | "state">,
): { steps: PracticeRouteStep[]; finalState: RunnerState } {
  const example = practiceExampleForReasoning(context);
  const steps: PracticeRouteStep[] = [];

  let finalState = walkCorrectPracticeRoute(
    {
      tree: context.tree,
      mode: "learn",
      example,
    },
    (step) => steps.push(step),
  );

  if (!steps.length) {
    finalState = walkCorrectPracticeRoute(
      {
        tree: context.tree,
        mode: context.mode,
        example,
      },
      (step) => steps.push(step),
    );
  }

  return { steps, finalState };
}

function practiceSemanticBucket(node: QuestionNode): PracticeSemanticRole {
  if (node.practice?.role) return node.practice.role;

  const id = String(node.id || "").toLowerCase();
  const text = cleanPracticeLine(node.text);
  const source = `${id} ${text}`;

  if (/نوع الكلمة|word_(?:kind|type)/u.test(source)) return "word-kind";
  if (/زمن|دلالة.*فعل|(?:^|_)tense(?:_|$)/u.test(source)) return "verb-time";
  if (/حرف العلة|معتل الآخر|weak/u.test(source)) return "weak-ending";
  if (/اتصل|متصل|connector|attachment|نون النسوة|نون التوكيد/u.test(source)) {
    return "attachment";
  }

  // عقد العدد/الصورة داخل الخبر المفرد تسأل عن صورة الاسم، لا عن نوع الخبر.
  if (
    /(?:^|_)(?:ism|noun|single)[_-]?(?:number|shape|form)(?:_|$)|khabar_single_number|ism_number/u.test(
      id,
    )
  ) {
    return "nominal-form";
  }

  if (
    /khabar_entry|khabar.*(?:kind|type)|predicate/u.test(id) ||
    /صورة الخبر|نوع الخبر|مفرد.*جملة|جملة.*شبه جملة|شبه جملة/u.test(text)
  ) {
    return "predicate-form";
  }

  if (/معرب أم مبني|مبني أم معرب|declin|built/u.test(source)) {
    return "declinability";
  }

  if (
    /مفرد أم مثنى أم جمع|نوع الاسم|صورة الاسم|جمع مذكر سالم|جمع مؤنث سالم|مثنى|الأسماء الخمسة/u.test(
      source,
    )
  ) {
    return "nominal-form";
  }

  if (/علامة|حذف حرف العلة|ثبوت النون|حذف النون/u.test(source)) {
    return "case-marker";
  }

  if (/رفع|نصب|جر|جزم/u.test(source)) {
    return "case";
  }

  if (
    /فاعل|نائب فاعل|مبتدأ|خبر|منادى|بدل|نعت|توكيد|عطف|مفعول|تمييز|حال|مضاف إليه|مستثنى|اسم إن|خبر إن|اسم كان|خبر كان/u.test(
      source,
    )
  ) {
    return "syntactic-role";
  }

  return "other";
}

function semanticPracticeDecision(
  node: QuestionNode,
  correct: ExerciseAnswer,
  state: RunnerState,
): string {
  const explicit = cleanPracticeLine(node.practice?.decision);
  if (explicit) return explicit;

  const raw = cleanPracticeLine(correct.text);
  const withoutBinary = raw
    .replace(/^(?:نعم|لا)(?:[،؛:.]\s*|\s+-\s+)?/u, "")
    .trim();

  const isBareBinary = /^(?:نعم|لا)$/u.test(raw);
  if (!isBareBinary && withoutBinary) return withoutBinary;

  return cleanPracticeLine(answerEffectLabel(node, correct, state)) ||
    withoutBinary ||
    raw;
}

function practiceDecisionStatement(
  node: QuestionNode,
  decision: string,
  target: string,
): string {
  const value = String(normalizePracticeDecisionWording(decision) || "")
    .replace(/[.!؟]+$/u, "")
    .trim();

  if (!value) return "";

  const quotedTarget = `«${target}»`;
  const bucket = practiceSemanticBucket(node);

  if (bucket === "word-kind" || bucket === "verb-time") {
    return `${quotedTarget}: ${value}.`;
  }

  if (bucket === "attachment") {
    return `في ${quotedTarget}: ${value}.`;
  }

  if (
    bucket === "predicate-form" ||
    bucket === "declinability" ||
    bucket === "nominal-form" ||
    bucket === "case" ||
    bucket === "case-marker" ||
    bucket === "weak-ending"
  ) {
    return `${quotedTarget}: ${value}.`;
  }

  return /[.!؟]$/u.test(value) ? value : `${value}.`;
}

function isPracticeQuestionText(text: string): boolean {
  const value = String(text || "").trim();
  return (
    /[؟?]/u.test(value) ||
    /^(?:هل|ما|ماذا|من|أين|متى|كيف|أي)\b/u.test(value) ||
    /^(?:اختر|انظر|اسأل|حدّد|حدد|افحص|قارن|جرّب|جرب|ابحث|تذكّر|تذكر)\b/u.test(value)
  );
}

function usefulPracticeClue(text: string): boolean {
  const value = cleanPracticeLine(text);
  if (!value || isPracticeQuestionText(value)) return false;
  return !/^(?:اتبع القرار التالي فقط|نبني هذه الخطوة|نكمل خطوة التفكير|ننتقل خطوة خطوة)/u.test(
    value,
  );
}

function practiceWeakLetterLabel(value: unknown): string {
  const key = String(value || "").toLowerCase();
  if (key === "alif") return "الألف";
  if (key === "waw") return "الواو";
  if (key === "ya" || key === "yaa") return "الياء";
  return "";
}

function practicePresentHuwaForm(target: string, weakLetter: unknown): string {
  const key = String(weakLetter || "").toLowerCase();
  let stem = String(target || "")
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/gu, "")
    .replace(/[اوىي]$/u, "")
    .trim();

  if (!stem) return "";
  stem = stem.replace(/^[أتني]/u, "ي");

  if (key === "alif") return `${stem}ى`;
  if (key === "waw") return `${stem}و`;
  if (key === "ya" || key === "yaa") return `${stem}ي`;
  return "";
}

function canonicalPracticeCorrection(
  step: PracticeRouteStep,
  target: string,
): string {
  const explicit = cleanPracticeLine(step.node.practice?.correction);
  if (explicit) return explicit;

  const id = String(step.node.id || "");
  const question = String(step.node.text || "");

  if (
    id === "present_jazm_weak_letter" ||
    /ما حرف العلة المحذوف/u.test(question)
  ) {
    const weakLetter = (step.state.facts || {}).weakLetter;
    const letterLabel = practiceWeakLetterLabel(weakLetter);
    const huwaForm = practicePresentHuwaForm(target, weakLetter);

    if (letterLabel && huwaForm) {
      return `لنعرف حرف العلة المحذوف نعيد الفعل إلى صورته مع «هو»: هو ${huwaForm}؛ آخره ${letterLabel}، إذن حرف العلة المحذوف هو ${letterLabel}.`;
    }
  }

  return "";
}

function buildPracticeCorrectionLine(
  step: PracticeRouteStep,
  target: string,
): string {
  const canonical = canonicalPracticeCorrection(step, target);
  if (canonical) return canonical;

  const decision = semanticPracticeDecision(
    step.node,
    step.correct,
    step.state,
  );
  const statement = practiceDecisionStatement(step.node, decision, target);
  const clue = cleanPracticeLine(
    step.node.practice?.clue ||
      (typeof step.node.context === "string" ? step.node.context : ""),
  );

  if (
    usefulPracticeClue(clue) &&
    !normalizePracticeComparable(statement).includes(
      normalizePracticeComparable(clue),
    )
  ) {
    return `${clue} ${statement}`.replace(/\s+/g, " ").trim();
  }

  return statement;
}

function practiceWrongChoiceDiagnosis(
  wrongOption: string | undefined,
  target: string,
  expected?: string,
): string {
  const wrong = oneLine(wrongOption);
  const primary = wrong.split(/\.\s+/u)[0] || wrong;
  const value = practiceSemanticText(primary);
  const fullValue = practiceSemanticText(wrong);
  const expectedValue = practiceSemanticText(expected);
  if (!value) return "";

  const hiddenPronoun = fullValue.match(
    /الفاعل:\s*ضمير مستتر(?: وجوب(?:ا|ًا))? تقديره ([^ .،؛]+)/u,
  )?.[1];
  const expectedHiddenPronoun = expectedValue.match(
    /الفاعل:\s*ضمير مستتر(?: وجوب(?:ا|ًا))? تقديره ([^ .،؛]+)/u,
  )?.[1];
  if (hiddenPronoun && hiddenPronoun !== expectedHiddenPronoun) {
    return `اختيارك قدّر الفاعل المستتر بـ«${hiddenPronoun}»؛ ارجع إلى صيغة «${target}» والسياق لتحدد صاحب الفعل.`;
  }

  const routeKind = value.match(
    /(فعل ماض|فعل مضارع|فعل أمر|اسم|حرف)(?=$|[؛،\s])/u,
  )?.[1];
  if (
    /(?:الكلمة الأولى|الخطوة التالية|المسار|خوارزمية)/u.test(value) &&
    routeKind
  ) {
    return `اختيارك اتجه إلى مسار «${routeKind}»؛ ارجع إلى نوع «${target}» وزمنه قبل الانتقال.`;
  }

  if (/بعده فعل/u.test(value)) {
    return `اختيارك افترض أن ما بعد «${target}» فعل؛ افحص الكلمة التالية نفسها قبل اختيار المسار.`;
  }
  if (/بعده اسم/u.test(value)) {
    return `اختيارك افترض أن ما بعد «${target}» اسم؛ افحص الكلمة التالية نفسها قبل اختيار المسار.`;
  }

  // إذا كان الخطأ في نوع التركيب، نشخّص نوع الجملة/شبه الجملة قبل
  // البحث عن أدوار نحوية قد تظهر داخل الشرح نفسه.
  const structure = /شبه جملة ظرفية/u.test(value)
    ? "شبه جملة ظرفية"
    : /شبه جملة من الجار والمجرور/u.test(value)
      ? "شبه جملة من الجار والمجرور"
      : /جملة اسمية/u.test(value)
        ? "جملة اسمية"
        : /جملة فعلية/u.test(value)
          ? "جملة فعلية"
          : "";

  if (structure) {
    if (/لا محل لها من الإعراب/u.test(value)) {
      return `اختيارك عدَّ «${target}» ${structure} لا محل لها؛ راجع علاقة التركيب بما قبله لتعرف هل له محل أم لا.`;
    }

    const structureMahal = value.match(
      /في محل (رفع|نصب|جر|جزم) (اسم الفعل الناسخ|خبر الفعل الناسخ|اسم كان|خبر كان|اسم إن|خبر إن|حال|نعت|خبر|مضاف إليه)/u,
    );
    if (structureMahal) {
      return `اختيارك صنَّف «${target}» ${structure} في محل ${structureMahal[1]} ${structureMahal[2]}؛ راجع أولًا نوع التركيب ثم علاقته بما قبله.`;
    }

    return `اختيارك صنَّف «${target}» ${structure}؛ ارجع إلى مكوّنات التركيب نفسه قبل تحديد محله.`;
  }

  // بعض نتائج المصدر المؤول تتفق في وظيفة «خبر» وتختلف فقط في المرجع
  // الذي أخبر عنه؛ نعالج هذا الفرق قبل الاكتفاء باسم الوظيفة العامة.
  if (/أخبر عن النائب فاعل/u.test(value)) {
    return `اختيارك ربط الخبر بنائب فاعل؛ ارجع إلى الاسم الذي يتمم المصدر المؤول معناه عنه في الجملة.`;
  }
  if (/أخبر عن الفاعل/u.test(value)) {
    return `اختيارك ربط الخبر بفاعل؛ ارجع إلى الاسم الذي يتمم المصدر المؤول معناه عنه في الجملة.`;
  }

  const mahalRole = value.match(
    /في محل (رفع|نصب|جر|جزم) (نائب فاعل|فاعل|اسم الفعل الناسخ|خبر الفعل الناسخ|اسم كان|خبر كان|اسم إن|خبر إن|مبتدأ|خبر|مفعول معه|مفعول فيه|مفعول مطلق|مفعول لأجله|مفعول به|حال|تمييز|مستثنى|مضاف إليه|نعت|معطوف|توكيد|بدل)(?=$|[\s،.;؛])/u,
  );
  if (mahalRole) {
    return `اختيارك وضع «${target}» في محل ${mahalRole[1]} ${mahalRole[2]}؛ ثبّت الوظيفة أولًا ثم حدّد المحل الذي تقتضيه.`;
  }

  const role = value.match(
    /(?:^|[\s،؛])(اسم الفعل الناسخ|خبر الفعل الناسخ|اسم كان|خبر كان|اسم إن|خبر إن|نائب فاعل|فاعل|مبتدأ|خبر|مفعول معه|مفعول فيه|مفعول مطلق|مفعول لأجله|مفعول به|حال|تمييز|مستثنى|منادى[^،.]*|مضاف إليه|نعت|معطوف|توكيد|بدل)(?=$|[\s،.;؛])/u,
  )?.[1];
  const grammaticalCase = value.match(
    /(?:^|\s)(مرفوع|منصوب|مجرور|مجزوم)(?=$|[\s،.;؛])/u,
  )?.[1];

  // إذا اتفق المشتتان في الحكم والعلامة، واختلفا فقط في حرف العلة
  // المحذوف، يجب أن يعالج التصحيح الحرف الذي اختاره الطالب نفسه.
  // لا نكشف الحرف الصحيح؛ نعيده إلى طريقة الاستدلال من أصل الفعل.
  const chosenDeletedWeakLetter = fullValue.match(
    /حرف العلة المحذوف:\s*(الألف|الواو|الياء)/u,
  )?.[1];
  const expectedDeletedWeakLetter = expectedValue.match(
    /حرف العلة المحذوف:\s*(الألف|الواو|الياء)/u,
  )?.[1];
  if (
    chosenDeletedWeakLetter &&
    chosenDeletedWeakLetter !== expectedDeletedWeakLetter
  ) {
    return `اختيارك اعتبر حرف العلة المحذوف ${chosenDeletedWeakLetter}؛ أعد «${target}» إلى صورته مع «هو» لتظهر لك لام الفعل الأصلية، ثم اختر الحرف الذي حُذف.`;
  }

  const chosenBuild = fullValue.match(
    /مبني على (الفتح|السكون|الضم|حذف النون|حذف حرف العلة)/u,
  )?.[1];
  const expectedBuild = expectedValue.match(
    /مبني على (الفتح|السكون|الضم|حذف النون|حذف حرف العلة)/u,
  )?.[1];
  if (chosenBuild && chosenBuild !== expectedBuild) {
    return `اختيارك افترض أن «${target}» مبني على ${chosenBuild}؛ راجع نوع الاتصال وآخر الفعل قبل تثبيت البناء.`;
  }

  if (role && grammaticalCase) {
    return `اختيارك جعل «${target}» ${role} ${grammaticalCase}؛ راجع الوظيفة أولًا ثم حكمها.`;
  }
  if (role) {
    return `اختيارك أعطى «${target}» وظيفة «${role}»؛ راجع القرينة التي تثبت الوظيفة قبل الحكم والعلامة.`;
  }

  const mahal = value.match(/في محل (رفع|نصب|جر|جزم)/u)?.[1];
  if (mahal) {
    return `اختيارك وضع «${target}» في محل ${mahal}؛ ثبّت الوظيفة والعامل أولًا ثم حدّد المحل.`;
  }

  if (grammaticalCase) {
    return `اختيارك جعل «${target}» ${grammaticalCase}؛ ارجع إلى العامل أو الموقع الذي يحدد الحالة قبل العلامة.`;
  }

  const build = value.match(
    /مبني على (الفتح|السكون|الضم|حذف النون|حذف حرف العلة)/u,
  )?.[1];
  if (build) {
    return `اختيارك افترض أن «${target}» مبني على ${build}؛ راجع نوع الاتصال وآخر الفعل قبل تثبيت البناء.`;
  }

  if (/فعل ماض|فعل مضارع|فعل أمر|اسم|حرف/u.test(value)) {
    return `اختيارك اتجه إلى نوع مختلف؛ ارجع إلى دلالة «${target}» نفسها قبل اختيار المسار.`;
  }

  return "";
}

function buildPracticeCorrectionSteps(
  route: PracticeRouteStep[],
  target: string,
  expected: string,
  facts: Record<string, unknown>,
  topicId?: string,
  wrongOption?: string,
  sentence?: string,
): string[] {
  const topicCoach = buildPracticeTopicGuidance({
    topicId: topicId,
    resultText: expected,
    target,
    sentence,
    facts,
    wrongOption: wrongOption,
  });

  const wrongWeakLetter = practiceSemanticText(wrongOption).match(
    /حرف العلة المحذوف:\s*(الألف|الواو|الياء)/u,
  )?.[1];
  const expectedWeakLetter = practiceSemanticText(expected).match(
    /حرف العلة المحذوف:\s*(الألف|الواو|الياء)/u,
  )?.[1];
  if (wrongWeakLetter && wrongWeakLetter !== expectedWeakLetter) {
    const diagnosis = practiceWrongChoiceDiagnosis(wrongOption, target, expected);
    const huwaForm = String(facts.presentBase || "").trim() ||
      practicePresentHuwaForm(target, facts.weakLetter);
    const toolWord = String(facts.toolWord || "").trim();
    const lines = [
      diagnosis,
      toolWord
        ? `يسبق «${target}» «${toolWord}»، وهي أداة جزم؛ ثبّت حالة الجزم أولًا ولا تغيّرها عند تحديد حرف العلة.`
        : `ثبّت حالة الفعل أولًا، ثم انتقل إلى تحديد حرف العلة المحذوف.`,
      huwaForm
        ? `أعد «${target}» إلى صورته مع «هو»: هو ${huwaForm}. تأمل آخر هذه الصورة وحدد حرف العلة الأصلي، ثم عد إلى السؤال.`
        : `أعد الفعل إلى صورته الأصلية مع «هو»، ثم تأمل آخره وحدد حرف العلة الذي حُذف.`,
    ]
      .map(cleanPracticeLine)
      .filter(Boolean);
    return lines.slice(0, 4);
  }

  if (topicCoach.correction.length) {
    const diagnosis = practiceWrongChoiceDiagnosis(wrongOption, target, expected);
    const coached = topicCoach.correction
      .map(cleanPracticeLine)
      .filter(Boolean);
    const lines = diagnosis &&
      !coached.some((item) =>
        normalizePracticeComparable(item) === normalizePracticeComparable(diagnosis)
      )
      ? [diagnosis, ...coached]
      : coached;
    return lines.slice(0, 4);
  }

  const policy = buildPracticePolicyGuidance({
    resultText: expected,
    target,
    facts,
  });

  if (policy.correction.length) {
    const diagnosis = practiceWrongChoiceDiagnosis(wrongOption, target, expected);
    const guided = policy.correction
      .map(cleanPracticeLine)
      .filter(Boolean);
    return (diagnosis ? [diagnosis, ...guided] : guided).slice(0, 4);
  }

  const output: Array<{ bucket: PracticeSemanticRole; text: string }> = [];
  const expectedKey = normalizePracticeComparable(expected);

  for (const step of route) {
    const text = buildPracticeCorrectionLine(step, target)
      .replace(/\s+/g, " ")
      .trim();
    if (!text) continue;

    const key = normalizePracticeComparable(text);
    if (!key) continue;
    if (expectedKey.length > 24 && key.includes(expectedKey)) continue;

    const bucket = practiceSemanticBucket(step.node);
    const previous = output[output.length - 1];
    if (
      previous &&
      previous.bucket === bucket &&
      ["word-kind", "verb-time", "predicate-form", "declinability", "nominal-form"].includes(bucket)
    ) {
      previous.text = text;
      continue;
    }

    if (output.some((item) => normalizePracticeComparable(item.text) === key)) continue;
    output.push({ bucket, text });
  }

  return output.slice(0, 4).map((item) => item.text);
}

function practiceRoutingReasonStep(
  expected: string,
  target: string,
): string {
  const value = practiceSemanticText(expected);
  const quoted = `«${target}»`;

  if (/الكلمة الأولى فعل ماض/u.test(value)) {
    return `ثبت أن ${quoted} فعل ماضٍ؛ لذلك نكمل من باب الفعل الماضي.`;
  }
  if (/الكلمة الأولى فعل مضارع/u.test(value)) {
    return `ثبت أن ${quoted} فعل مضارع؛ لذلك نكمل من باب الفعل المضارع.`;
  }
  if (/الكلمة الأولى فعل أمر/u.test(value)) {
    return `ثبت أن ${quoted} فعل أمر؛ لذلك نكمل من باب فعل الأمر.`;
  }
  if (/الكلمة الأولى اسم/u.test(value)) {
    return `ثبت أن ${quoted} اسم؛ لذلك نبدأ بفحص موقعه في الجملة ثم نكمل من الباب المناسب.`;
  }
  return "";
}

function practiceRoleCaseReasonStep(
  expected: string,
  target: string,
): string {
  const value = practiceSemanticText(expected);
  const role = value.match(
    /(اسم الفعل الناسخ|خبر الفعل الناسخ|اسم كان|خبر كان|اسم إن|خبر إن|نائب فاعل|فاعل|مبتدأ|خبر|مفعول معه|مفعول فيه|مفعول مطلق|مفعول لأجله|مفعول به|حال|تمييز|مستثنى|مضاف إليه|نعت|معطوف|توكيد|بدل)(?=\s+(?:مرفوع|منصوب|مجرور|مجزوم)|$)/u,
  )?.[1] || "";
  const grammaticalCase = value.match(
    /(?:^|\s)(مرفوع|منصوب|مجرور|مجزوم)(?=$|[\s،.;؛])/u,
  )?.[1] || "";

  if (!role || !grammaticalCase) return "";

  const roleRule =
    role === "فاعل" || role === "نائب فاعل" || role === "مبتدأ" || role === "خبر" ||
    role === "اسم الفعل الناسخ" || role === "اسم كان"
      ? "مرفوع"
      : role === "خبر الفعل الناسخ" || role === "خبر كان" ||
        role === "اسم إن" || role.startsWith("مفعول") || role === "حال" ||
        role === "تمييز" || role === "مستثنى"
        ? "منصوب"
        : role === "مضاف إليه"
          ? "مجرور"
          : grammaticalCase;

  return `ثبت أن «${target}» ${role}، وحكم ${role} هنا ${roleRule}.`;
}

function practiceBuiltPresentReasonStep(
  expected: string,
  target: string,
): string {
  const value = practiceSemanticText(expected);
  const quoted = `«${target}»`;

  if (/فعل مضارع مبني على السكون.*نون النسوة/u.test(value)) {
    const mahal =
      value.match(/في محل (رفع|نصب|جزم)/u)?.[1] || "";
    const mahalPart = mahal
      ? ` وحالته في الجملة: في محل ${mahal}.`
      : "";
    return `اتصل ${quoted} بنون النسوة؛ لذلك هو فعل مضارع مبني على السكون.${mahalPart}`;
  }

  if (/فعل مضارع مبني على الفتح.*نون التوكيد/u.test(value)) {
    const mahal =
      value.match(/في محل (رفع|نصب|جزم)/u)?.[1] || "";
    const mahalPart = mahal
      ? ` وحالته في الجملة: في محل ${mahal}.`
      : "";
    return `اتصل ${quoted} بنون التوكيد اتصالًا مباشرًا؛ لذلك هو فعل مضارع مبني على الفتح.${mahalPart}`;
  }

  return "";
}

function practicePastBuildReasonStep(
  expected: string,
  target: string,
  facts: Record<string, unknown>,
): string {
  const value = practiceSemanticText(expected);
  if (!/فعل ماض/u.test(value)) return "";

  const build =
    value.match(/فعل ماض مبني على ([^،.;]+)/u)?.[1]?.trim() || "";
  if (!build) return "";

  const connector = String(facts.connectorKind || "none");
  const raf3Group = String(facts.raf3BuildGroup || "none");
  const quoted = `«${target}»`;

  if (connector === "none") {
    return `ثبت أن ${quoted} فعل ماضٍ، ولم يتصل به شيء؛ لذلك هو مبني على ${build}.`;
  }

  if (connector === "taa_tanith") {
    return `اتصل ${quoted} بتاء التأنيث الساكنة، وهي لا تغيّر بناء الفعل الماضي على الفتح؛ لذلك هو مبني على ${build}.`;
  }

  if (connector === "nasb") {
    return `اتصل ${quoted} بضمير نصب، وضمير النصب لا يغيّر بناء الفعل الماضي؛ لذلك هو مبني على ${build}.`;
  }

  if (connector === "raf3" && raf3Group === "sukoon") {
    return `اتصل ${quoted} بضمير رفع يوجب بناء الماضي على السكون؛ لذلك هو مبني على ${build}.`;
  }

  if (connector === "raf3" && raf3Group === "alif") {
    return `اتصل ${quoted} بألف الاثنين؛ لذلك يبقى الفعل الماضي مبنيًا على الفتح، وهنا هو مبني على ${build}.`;
  }

  if (connector === "raf3" && raf3Group === "waw") {
    return `اتصل ${quoted} بواو الجماعة؛ لذلك يكون الفعل الماضي مبنيًا على الضم، وهنا هو مبني على ${build}.`;
  }

  return `${quoted} فعل ماضٍ؛ وبحسب ما اتصل به وآخره يكون مبنيًا على ${build}.`;
}

function practicePossessiveYaaReasonStep(
  expected: string,
  target: string,
): string {
  const value = practiceSemanticText(expected);
  if (!/ياء المتكلم/u.test(value)) return "";

  const marker = value.match(
    /(الضمة|الفتحة|الكسرة) المقدرة على ما قبل ياء المتكلم/u,
  )?.[1] || "";
  if (!marker) return "";

  return `«${target}» اسم معرب مضاف إلى ياء المتكلم؛ وتُقدَّر عليه ${marker} على ما قبل الياء لانشغال المحل بالحركة المناسبة للياء.`;
}

function practiceMarkerReasonStep(
  expected: string,
  target: string,
  facts: Record<string, unknown>,
): string {
  const raw = oneLine(expected);
  const semantic = practiceSemanticText(raw);
  const grammaticalCase =
    semantic.match(/(?:^|\s)(مرفوع|منصوب|مجرور|مجزوم)(?=$|[\s،.;؛])/u)?.[1] || "";
  if (!grammaticalCase) return "";

  const shape = String(
    facts.shape ||
    facts.nounShape ||
    facts.form ||
    "",
  ).toLowerCase();

  const action =
    grammaticalCase === "مرفوع"
      ? "الرفع"
      : grammaticalCase === "منصوب"
        ? "النصب"
        : grammaticalCase === "مجرور"
          ? "الجر"
          : "الجزم";

  const markerText =
    raw.match(/علامة (?:رفعه|نصبه|جره|جزمه)\s+([^،؛.]+)/u)?.[1]?.trim() || "";

  if (!markerText) return "";

  const quoted = `«${target}»`;

  if (shape === "singular" && /الضمة الظاهرة/u.test(markerText) && grammaticalCase === "مرفوع") {
    return `بعد أن ثبت أن ${quoted} مرفوع ننظر إلى صورة الاسم: هو مفرد صحيح الآخر، وعلامة رفع المفرد الصحيح الآخر الضمة؛ لذلك علامة رفعه الضمة الظاهرة على آخره.`;
  }
  if (shape === "singular" && /الفتحة الظاهرة/u.test(markerText) && grammaticalCase === "منصوب") {
    return `بعد أن ثبت أن ${quoted} منصوب ننظر إلى صورة الاسم: هو مفرد صحيح الآخر، وعلامة نصب المفرد الصحيح الآخر الفتحة؛ لذلك علامة نصبه الفتحة الظاهرة على آخره.`;
  }
  if (shape === "singular" && /الكسرة الظاهرة/u.test(markerText) && grammaticalCase === "مجرور") {
    return `بعد أن ثبت أن ${quoted} مجرور ننظر إلى صورة الاسم: هو مفرد صحيح الآخر، وعلامة جر المفرد الصحيح الآخر الكسرة؛ لذلك علامة جره الكسرة الظاهرة على آخره.`;
  }

  const shapeLabel =
    shape === "dual"
      ? "مثنى"
      : shape === "jms"
        ? "جمع مذكر سالم"
        : shape === "jfs"
          ? "جمع مؤنث سالم"
          : shape === "jt"
            ? "جمع تكسير"
            : shape === "five"
              ? "من الأسماء الخمسة"
              : "";

  if (shapeLabel) {
    return `بعد أن ثبت ${action} ننظر إلى صورة ${quoted}: هو ${shapeLabel}؛ لذلك نختار علامة ${action} المناسبة لهذه الصورة، وهي ${markerText}.`;
  }

  return `بعد أن ثبت ${action} نختار علامته بحسب صورة ${quoted}؛ فالعلامة تدل على الحكم ولا تُنشئه. هنا علامة ${action} هي ${markerText}.`;
}

function practiceReviewRoleAndCaseSteps(
  expected: string,
  target: string,
): string[] {
  const value = practiceSemanticText(expected);
  const role = value.match(
    /(اسم الفعل الناسخ|خبر الفعل الناسخ|اسم كان|خبر كان|اسم إن|خبر إن|نائب فاعل|فاعل|مبتدأ|خبر|مفعول معه|مفعول فيه|مفعول مطلق|مفعول لأجله|مفعول به|حال|تمييز|مستثنى|مضاف إليه|نعت|معطوف|توكيد|بدل)(?=\s+(?:مرفوع|منصوب|مجرور|مجزوم)|$)/u,
  )?.[1] || "";
  const grammaticalCase = value.match(
    /(?:^|\s)(مرفوع|منصوب|مجرور|مجزوم)(?=$|[\s،.;؛])/u,
  )?.[1] || "";

  if (!role || !grammaticalCase) return [];

  const caseName =
    grammaticalCase === "مرفوع"
      ? "الرفع"
      : grammaticalCase === "منصوب"
        ? "النصب"
        : grammaticalCase === "مجرور"
          ? "الجر"
          : "الجزم";

  return [
    `ثبت أن «${target}» ${role}.`,
    `حكم ${role} ${caseName}؛ لذلك «${target}» ${grammaticalCase}.`,
  ];
}

function practiceReviewNominalForm(
  facts: Record<string, unknown>,
  target: string,
): string {
  const shape = String(
    facts.number ||
    facts.shape ||
    facts.nounShape ||
    facts.form ||
    "",
  ).toLowerCase();
  const ending = String(facts.ending || "").toLowerCase();

  const label =
    shape === "dual"
      ? "مثنى"
      : shape === "jms"
        ? "جمع مذكر سالم"
        : shape === "jfs"
          ? "جمع مؤنث سالم"
          : shape === "jt"
            ? "جمع تكسير"
            : shape === "five"
              ? "من الأسماء الخمسة"
              : shape === "singular"
                ? ending === "sahih"
                  ? "مفرد صحيح الآخر"
                  : ending === "moatal" || ending === "weak"
                    ? "مفرد معتل الآخر"
                    : "مفرد"
                : "";

  return label ? `«${target}» ${label}.` : "";
}

function practiceReviewMarkerStep(
  expected: string,
  target: string,
  facts: Record<string, unknown>,
): string {
  const raw = oneLine(expected);
  const semantic = practiceSemanticText(raw);
  const grammaticalCase =
    semantic.match(/(?:^|\s)(مرفوع|منصوب|مجرور|مجزوم)(?=$|[\s،.;؛])/u)?.[1] || "";
  const marker =
    raw.match(/علامة (?:رفعه|نصبه|جره|جزمه)\s+([^،؛.]+)/u)?.[1]?.trim() || "";

  if (!grammaticalCase || !marker) return "";

  const caseName =
    grammaticalCase === "مرفوع"
      ? "الرفع"
      : grammaticalCase === "منصوب"
        ? "النصب"
        : grammaticalCase === "مجرور"
          ? "الجر"
          : "الجزم";

  const shape = String(
    facts.number ||
    facts.shape ||
    facts.nounShape ||
    facts.form ||
    "",
  ).toLowerCase();
  const ending = String(facts.ending || "").toLowerCase();

  // Preserve the established pedagogical wording for a sound singular noun.
  // Existing regression tests intentionally protect this rule phrase.
  if (shape === "singular") {
    if (grammaticalCase === "مرفوع" && /الضمة الظاهرة/u.test(marker)) {
      return `علامة رفع المفرد الصحيح الآخر الضمة؛ لذلك علامة رفع «${target}» ${marker}.`;
    }
    if (grammaticalCase === "منصوب" && /الفتحة الظاهرة/u.test(marker)) {
      return `علامة نصب المفرد الصحيح الآخر الفتحة؛ لذلك علامة نصب «${target}» ${marker}.`;
    }
    if (grammaticalCase === "مجرور" && /الكسرة الظاهرة/u.test(marker)) {
      return `علامة جر المفرد الصحيح الآخر الكسرة؛ لذلك علامة جر «${target}» ${marker}.`;
    }
  }

  return `وبحسب صورة الاسم السابقة، علامة ${caseName} هنا ${marker}.`;
}

function practiceReviewImperativeSteps(
  expected: string,
  target: string,
  facts: Record<string, unknown>,
): string[] {
  const value = practiceSemanticText(expected);
  if (!/فعل أمر/u.test(value)) return [];

  const attached = String(facts.attached || "none").toLowerCase();
  const ending = String(facts.ending || "").toLowerCase();
  const presentBase = String(facts.presentBase || "").trim();

  const output = [
    `«${target}» فعل أمر؛ لأنه يدل على طلب حصول الحدث.`,
  ];

  const connector =
    attached === "alif2"
      ? "ألف الاثنين"
      : attached === "waw"
        ? "واو الجماعة"
        : attached === "yaa"
          ? "ياء المخاطبة"
          : attached === "niswa"
            ? "نون النسوة"
            : attached === "tawkid"
              ? "نون التوكيد"
              : "";

  if (connector) {
    output.push(`اتصل بآخر «${target}» ${connector}.`);
  } else {
    output.push(`لم يتصل بآخر «${target}» ضمير أو نون تغيّر مسار بنائه؛ فننظر إلى آخر الفعل.`);
  }

  if (["alif2", "waw", "yaa"].includes(attached)) {
    output.push(
      `مضارع «${target}» مع هذا الضمير من الأفعال الخمسة، والأفعال الخمسة تُجزم بحذف النون؛ وفعل الأمر يُبنى على ما يُجزم به مضارعه، لذلك هو مبني على حذف النون.`,
    );
  } else if (attached === "niswa") {
    output.push(`اتصاله بنون النسوة يقتضي بناء فعل الأمر على السكون.`);
  } else if (attached === "tawkid") {
    output.push(`اتصاله بنون التوكيد يقتضي بناء فعل الأمر على الفتح.`);
  } else if (ending === "weak" && /حذف حرف العلة/u.test(value)) {
    output.push(
      presentBase
        ? `هو معتل الآخر؛ نردّه إلى مضارعه مع «هو»: هو ${presentBase}، فيظهر حرف العلة الأصلي؛ لذلك يُبنى على حذف حرف العلة.`
        : `هو معتل الآخر؛ لذلك يُبنى فعل الأمر على حذف حرف العلة.`,
    );
  } else if (/السكون/u.test(value)) {
    output.push(`هو صحيح الآخر ولم يتصل به ما يغيّر بناءه؛ لذلك يُبنى على السكون.`);
  }

  return output.filter(Boolean).slice(0, 4);
}

function practiceReviewStructuredMahalSteps(
  expected: string,
  target: string,
  facts: Record<string, unknown>,
): string[] {
  const value = practiceSemanticText(expected);
  const khabarKind = String(facts.khabarKind || "").toLowerCase();
  const shibhType = String(facts.shibhType || "").toLowerCase();
  const sentenceType = String(facts.sentenceType || "").toLowerCase();

  const mahal = value.match(
    /في محل (رفع|نصب|جر|جزم) (اسم الفعل الناسخ|خبر الفعل الناسخ|اسم كان|خبر كان|اسم إن|خبر إن|نائب فاعل|فاعل|مبتدأ|خبر|حال|نعت|مضاف إليه|مفعول به|مفعول فيه|مفعول مطلق|مفعول لأجله|مفعول معه|تمييز|مستثنى|بدل|معطوف|توكيد)(?=$|[\s،.;؛])/u,
  );

  if (!mahal) return [];

  const mahalCase = mahal[1];
  const role = mahal[2];
  const caseName =
    mahalCase === "رفع"
      ? "الرفع"
      : mahalCase === "نصب"
        ? "النصب"
        : mahalCase === "جر"
          ? "الجر"
          : "الجزم";

  let structureLabel = "";
  let structureStep = "";

  if (
    (khabarKind === "shibh" && shibhType === "jar") ||
    /شبه جملة (?:من )?الجار والمجرور/u.test(value)
  ) {
    structureLabel = "شبه الجملة من الجار والمجرور";
    structureStep = `يتكوّن «${target}» من حرف جر واسم مجرور؛ لذلك فهو شبه جملة من الجار والمجرور.`;
  } else if (
    (khabarKind === "shibh" && shibhType === "zarf") ||
    /شبه جملة ظرفية/u.test(value)
  ) {
    structureLabel = "شبه الجملة الظرفية";
    structureStep = `«${target}» تركيب ظرفي؛ لذلك فهو شبه جملة ظرفية.`;
  } else if (
    (khabarKind === "sentence" && sentenceType === "verbal") ||
    /جملة فعلية/u.test(value)
  ) {
    structureLabel = "الجملة الفعلية";
    structureStep = `«${target}» جملة فعلية تؤدي وظيفة ${role}.`;
  } else if (
    (khabarKind === "sentence" && sentenceType === "nominal") ||
    /جملة اسمية/u.test(value)
  ) {
    structureLabel = "الجملة الاسمية";
    structureStep = `«${target}» جملة اسمية تؤدي وظيفة ${role}.`;
  }

  if (!structureLabel || !structureStep) return [];

  return [
    `ثبت أن «${target}» ${role}.`,
    structureStep,
    `حكم ${role} ${caseName}، لكن ${structureLabel} لا تظهر عليها علامة ${caseName}.`,
    `لذلك «${target}» في محل ${mahalCase} ${role}.`,
  ];
}
/* FINAL_PRACTICE_REVIEW_FAMILIES_V1
 * Family-level solved paths for every gap found by the 358-example audit.
 * Existing validated noun, imperative, and structured-review wording is preserved.
 */

function practiceReviewFinalReasonFromFacts(
  facts: Record<string, unknown>,
): string {
  const source = String(
    facts.practiceFinalI3rab ||
    facts.finalI3rab ||
    "",
  );

  const reason =
    source.match(/سبب الاختيار:\s*([^\n\r]+)/u)?.[1]?.trim() || "";

  if (!reason) return "";

  const firstSentence =
    reason.split(/(?<=[.!؟])\s+/u)[0]?.replace(/\s+/g, " ").trim() || "";

  return firstSentence
    ? `القرينة في المثال: ${firstSentence}`
    : "";
}

function practiceReviewFinalCaseLabel(value: string): string {
  return value === "مرفوع" || value === "رفع"
    ? "الرفع"
    : value === "منصوب" || value === "نصب"
      ? "النصب"
      : value === "مجرور" || value === "جر"
        ? "الجر"
        : value === "مجزوم" || value === "جزم"
          ? "الجزم"
          : "";
}

function practiceReviewFinalMarker(
  expected: string,
): string {
  return (
    oneLine(expected).match(
      /علامة (?:رفعه|نصبه|جره|جزمه)\s*[:：]?\s*([^،؛.]+)/u,
    )?.[1]?.trim() || ""
  );
}

function practiceReviewFinalShapeLabel(
  facts: Record<string, unknown>,
): string {
  const shape = String(
    facts.number ||
    facts.shape ||
    facts.nounShape ||
    facts.form ||
    "",
  ).toLowerCase();

  return shape === "dual"
    ? "مثنى"
    : shape === "jms"
      ? "جمع مذكر سالم"
      : shape === "jfs"
        ? "جمع مؤنث سالم"
        : shape === "jt"
          ? "جمع تكسير"
          : shape === "five"
            ? "من الأسماء الخمسة"
            : shape === "singular"
              ? "مفرد"
              : "";
}

function practiceReviewFinalStructureSteps(
  expected: string,
  target: string,
  facts: Record<string, unknown>,
): string[] {
  const semantic = practiceSemanticText(expected);

  const unit =
    semantic.match(
      /(مصدر مؤول|شبه جملة(?: من الجار والمجرور| جار ومجرور| ظرفية)?|جملة فعلية|جملة اسمية)/u,
    )?.[1] || "";

  const mahal = semantic.match(
    /في محل (رفع|نصب|جر|جزم) ([^.،؛]+)/u,
  );

  if (!unit || !mahal) return [];

  const mahalCase = String(mahal[1] || "").trim();
  const role = String(mahal[2] || "").trim();
  if (!mahalCase || !role) return [];

  const caseLabel = practiceReviewFinalCaseLabel(mahalCase);

  return [
    `ثبت أن «${target}» ${role}.`,
    `نوع التركيب في «${target}» هو ${unit}.`,
    `حكم ${role} في هذا المثال ${caseLabel}؛ ولأن المطلوب تركيب كامل فنعبر عن الحكم بالمحل الإعرابي.`,
    `لذلك «${target}» في محل ${mahalCase} بوصفه ${role}.`,
  ].filter(Boolean).slice(0, 4);
}

function practiceReviewFinalHiddenNasikhSteps(
  target: string,
  facts: Record<string, unknown>,
  topicId?: string,
): string[] {
  if (
    topicId !== "kana-wa-akhawatuha" ||
    String(facts.targetRole || "") !== "hidden_ism"
  ) {
    return [];
  }

  const pronoun = String(facts.hiddenPronoun || "هو").trim() || "هو";

  return [
    `«${target}» هو الفعل الناسخ نفسه، وليس اسم الفعل الناسخ.`,
    `اسم الفعل الناسخ غير ظاهر لفظًا، والمعنى يعود على الاسم السابق؛ لذلك اسم الناسخ ضمير مستتر تقديره «${pronoun}».`,
    `الضمير المستتر مبني في محل رفع اسم الفعل الناسخ.`,
  ];
}

function practiceReviewFinalHiddenFaelSteps(
  target: string,
  facts: Record<string, unknown>,
  topicId?: string,
): string[] {
  if (
    topicId !== "fael" ||
    String(facts.roleKind || "") !== "hidden"
  ) {
    return [];
  }

  const pronoun = String(facts.hiddenPronoun || "هو").trim() || "هو";
  const contextType = String(facts.contextType || "");
  const nominalSubject = String(facts.nominalSubject || "").trim();

  const contextLine =
    contextType === "nominal_with_verb" && nominalSubject
      ? `«${nominalSubject}» مبتدأ، أمّا الفاعل داخل الجملة الفعلية فغير ظاهر لفظًا.`
      : `لا يظهر مع «${target}» فاعل صريح؛ فالفاعل داخل الفعل ضمير مستتر.`;

  return [
    contextLine,
    `صيغة الفعل والسياق يدلان على أن تقدير الفاعل المستتر «${pronoun}».`,
    `الضمير المستتر مبني في محل رفع فاعل.`,
  ];
}

function practiceReviewFinalFirstWordSteps(
  target: string,
  facts: Record<string, unknown>,
  topicId?: string,
): string[] {
  if (topicId !== "first-word-key") return [];

  const wordType = String(facts.wordType || "");
  const verbType = String(facts.verbType || "");
  const afterParticle = String(facts.afterParticle || "");

  if (wordType === "noun") {
    return [
      `«${target}» اسم؛ فمفتاح الجملة هنا يبدأ باسم.`,
      `المسار التالي هو باب المبتدأ والخبر لتحديد موقع الاسم وما يتمم معناه.`,
    ];
  }

  if (wordType === "verb") {
    const tense =
      verbType === "past"
        ? "ماض"
        : verbType === "present"
          ? "مضارع"
          : verbType === "imperative"
            ? "أمر"
            : "فعل";

    return [
      `«${target}» فعل.`,
      `زمن الفعل في هذا المثال ${tense}.`,
      `إذن مفتاح الجملة هو باب الفعل ${tense}.`,
    ];
  }

  if (wordType === "particle") {
    const after =
      afterParticle === "verb"
        ? "فعل"
        : afterParticle === "noun"
          ? "اسم"
          : "كلمة";

    return [
      `«${target}» حرف، والحرف يوجّه ما يأتي بعده.`,
      `جاء بعده ${after}؛ لذلك يتحدد المسار التالي من أثر الحرف فيما بعده.`,
    ];
  }

  return [];
}

function practiceReviewFinalPastSteps(
  expected: string,
  target: string,
  facts: Record<string, unknown>,
  topicId?: string,
): string[] {
  if (topicId !== "past-verb") return [];

  const semantic = practiceSemanticText(expected);
  const build =
    semantic.match(/فعل ماض(?:ٍ)? مبني على ([^،.;]+)/u)?.[1]?.trim() || "";

  if (!build) return [];

  const connector = String(facts.connectorKind || "none");
  const raf3Group = String(facts.raf3BuildGroup || "none");

  let connectorLine = "";

  if (connector === "none") {
    connectorLine = `لم يتصل بـ«${target}» ما يغيّر أصل بناء الفعل الماضي.`;
  } else if (connector === "taa_tanith") {
    connectorLine = `اتصلت بـ«${target}» تاء التأنيث الساكنة، وهي لا تغيّر أصل بناء الماضي على الفتح.`;
  } else if (connector === "nasb") {
    connectorLine = `اتصل بـ«${target}» ضمير نصب، وضمير النصب لا يغيّر أصل بناء الفعل الماضي.`;
  } else if (connector === "raf3" && raf3Group === "sukoon") {
    connectorLine = `اتصل بـ«${target}» ضمير رفع متحرك؛ لذلك يكون بناء الماضي على السكون.`;
  } else if (connector === "raf3" && raf3Group === "alif") {
    connectorLine = `اتصل بـ«${target}» ألف الاثنين، وهي ضمير رفع؛ ويبقى بناء الماضي معها على الفتح.`;
  } else if (connector === "raf3" && raf3Group === "waw") {
    connectorLine = `اتصل بـ«${target}» واو الجماعة، وهي ضمير رفع؛ ويكون بناء الماضي معها على الضم.`;
  }

  return [
    `«${target}» فعل ماض.`,
    connectorLine,
    `لذلك «${target}» مبني على ${build}.`,
  ].filter(Boolean).slice(0, 4);
}

function practiceReviewFinalPresentSteps(
  expected: string,
  target: string,
  facts: Record<string, unknown>,
  topicId?: string,
): string[] {
  if (topicId !== "present-verb") return [];

  const connection = String(facts.buildConnection || "none").toLowerCase();
  const tool = String(facts.tool || "none").toLowerCase();
  const toolWord = String(facts.toolWord || "").trim();
  const shape = String(facts.shape || "").toLowerCase();
  const weakLetter = String(facts.weakLetter || "").toLowerCase();
  const attached = String(facts.attached || "").toLowerCase();

  const toolLabel = toolWord ? ` «${toolWord}»` : "";

  if (connection === "niswa" || connection === "tawkid") {
    const attachment = connection === "niswa" ? "نون النسوة" : "نون التوكيد";
    const build = connection === "niswa" ? "السكون" : "الفتح";
    const mahal =
      tool === "nasb" ? "نصب" : tool === "jazm" ? "جزم" : "رفع";

    const factorLine =
      tool === "nasb"
        ? `سبق الفعل ناصب${toolLabel}؛ لذلك محل الفعل المبني هنا النصب.`
        : tool === "jazm"
          ? `سبق الفعل جازم${toolLabel}؛ لذلك محل الفعل المبني هنا الجزم.`
          : `لم يسبق الفعل ناصب ولا جازم؛ لذلك محل الفعل المبني هنا الرفع.`;

    return [
      `«${target}» فعل مضارع.`,
      `اتصلت به ${attachment}؛ لذلك انتقل من الإعراب إلى البناء، وبُنِي على ${build}.`,
      factorLine,
      `إذن «${target}» فعل مضارع مبني على ${build} في محل ${mahal}.`,
    ];
  }

  const state =
    tool === "nasb" ? "منصوب" : tool === "jazm" ? "مجزوم" : "مرفوع";
  const action = practiceReviewFinalCaseLabel(state);

  const factorLine =
    tool === "nasb"
      ? `سبق «${target}» ناصب${toolLabel}؛ لذلك هو منصوب.`
      : tool === "jazm"
        ? `سبق «${target}» جازم${toolLabel}؛ لذلك هو مجزوم.`
        : `لم يسبق «${target}» ناصب ولا جازم؛ لذلك هو مرفوع.`;

  const shapeLine =
    shape === "five"
      ? `«${target}» من الأفعال الخمسة${attached === "waw" ? " لاتصاله بواو الجماعة" : attached === "alif2" ? " لاتصاله بألف الاثنين" : attached === "yaa" ? " لاتصاله بياء المخاطبة" : ""}.`
      : shape === "weak"
        ? `«${target}» معتل الآخر${weakLetter === "alif" ? " بالألف" : weakLetter === "waw" ? " بالواو" : weakLetter === "ya" || weakLetter === "yaa" ? " بالياء" : ""}.`
        : `«${target}» صحيح الآخر.`;

  const marker = practiceReviewFinalMarker(expected);

  return [
    `«${target}» فعل مضارع معرب؛ فلم تتصل به نون النسوة ولا نون التوكيد.`,
    factorLine,
    shapeLine,
    marker
      ? `وبحسب صورة الفعل، علامة ${action} هنا ${marker}.`
      : "",
  ].filter(Boolean).slice(0, 4);
}

function practiceReviewFinalAttachedPronounSteps(
  target: string,
  facts: Record<string, unknown>,
  topicId?: string,
): string[] {
  if (topicId !== "attached-pronouns") return [];

  const position = String(facts.position || "");
  const form = String(facts.form || "");
  const role = String(facts.role || "");

  const positionLabel =
    position === "raf3" ? "رفع" : position === "nasb" ? "نصب" : "جر";

  const roleLabel =
    role === "fael"
      ? "فاعل"
      : role === "mubtada"
        ? "مبتدأ"
        : role === "mafool"
          ? "مفعول به"
          : role === "mafool_muqaddam"
            ? "مفعول به مقدم"
            : "مضاف إليه";

  const formLabel = form === "separate" ? "منفصل" : "متصل";

  const reason =
    role === "fael"
      ? `دل الضمير على من قام بالفعل؛ لذلك وظيفته فاعل.`
      : role === "mubtada"
        ? `جاء الضمير مستقلًا وأسند إليه ما بعده؛ لذلك وظيفته مبتدأ.`
        : role === "mudaf_ileyh"
          ? `اتصل الضمير بالاسم ودل على المضاف إليه؛ لذلك وظيفته مضاف إليه.`
          : `دل الضمير على من وقع عليه الفعل؛ لذلك وظيفته ${roleLabel}.`;

  return [
    `«${target}» ضمير ${formLabel}، والضمائر مبنية.`,
    reason,
    `حكم وظيفة ${roleLabel} هنا ${practiceReviewFinalCaseLabel(positionLabel)}.`,
    `لذلك يكون موقع «${target}» الإعرابي في محل ${positionLabel}، بوصفه ${roleLabel}.`,
  ];
}

function practiceReviewFinalManqousSteps(
  target: string,
  facts: Record<string, unknown>,
  topicId?: string,
): string[] {
  if (topicId !== "ism-manqous") return [];

  const caseKey = String(facts.case || "");
  const yStatus = String(facts.yStatus || "");
  const hasAl = Boolean(facts.hasAl);
  const isAdded = Boolean(facts.isAdded);

  const state =
    caseKey === "nasb" ? "منصوب" : caseKey === "raf3" ? "مرفوع" : "مجرور";

  let yLine = "";
  let markerLine = "";

  if (caseKey === "nasb") {
    yLine = `في النصب تثبت ياء الاسم المنقوص وتظهر عليها الفتحة.`;
    markerLine = `لذلك علامة نصب «${target}» الفتحة الظاهرة على آخره.`;
  } else if (yStatus === "kept" || hasAl || isAdded) {
    yLine = hasAl || isAdded
      ? `الياء ثابتة لأن الاسم معرّف بـ«الـ» أو مضاف، وتقدّر الحركة عليها للثقل.`
      : `الياء ثابتة، وتقدّر الحركة عليها للثقل.`;
    markerLine =
      caseKey === "raf3"
        ? `لذلك علامة رفع «${target}» الضمة المقدرة على الياء للثقل.`
        : `لذلك علامة جر «${target}» الكسرة المقدرة على الياء للثقل.`;
  } else {
    yLine = `الاسم نكرة غير مضاف ولا معرّف بـ«الـ»؛ لذلك حذفت ياؤه وعُوِّض عنها بتنوين الكسر.`;
    markerLine =
      caseKey === "raf3"
        ? `لذلك علامة رفع «${target}» الضمة المقدرة على الياء المحذوفة.`
        : `لذلك علامة جر «${target}» الكسرة المقدرة على الياء المحذوفة.`;
  }

  return [
    `«${target}» اسم منقوص.`,
    `موقعه في الجملة جعله ${state}.`,
    yLine,
    markerLine,
  ].filter(Boolean).slice(0, 4);
}

function practiceReviewFinalMunadaSteps(
  target: string,
  facts: Record<string, unknown>,
  topicId?: string,
): string[] {
  if (topicId !== "munada") return [];

  const kind = String(facts.munadaKind || "");
  const buildMark = String(facts.buildMark || "");
  const nasbMark = String(facts.nasbMark || "");

  const kindLabel =
    kind === "alam"
      ? "مفرد علم"
      : kind === "nakira_maqsuda"
        ? "نكرة مقصودة"
        : kind === "mudaf"
          ? "مضاف"
          : kind === "shibh_mudaf"
            ? "شبيه بالمضاف"
            : "نكرة غير مقصودة";

  const reason =
    kind === "alam"
      ? `هو علم مفرد مقصود بالنداء.`
      : kind === "nakira_maqsuda"
        ? `النداء موجّه إلى شخص معيّن من أفراد النكرة؛ لذلك هو نكرة مقصودة.`
        : kind === "mudaf"
          ? `اتصل معناه بما بعده على صورة الإضافة؛ لذلك هو منادى مضاف.`
          : kind === "shibh_mudaf"
            ? `تمّ معناه بما بعده من غير إضافة صريحة؛ لذلك هو شبيه بالمضاف.`
            : `النداء غير موجّه إلى شخص معيّن؛ لذلك هو نكرة غير مقصودة.`;

  if (buildMark) {
    const build = buildMark === "damma" ? "الضم" : buildMark;
    return [
      `«${target}» منادى ${kindLabel}.`,
      reason,
      `هذا النوع من المنادى مبني على ${build}.`,
      `والمنادى المبني يكون في محل نصب؛ لذلك «${target}» في محل نصب.`,
    ];
  }

  const marker =
    nasbMark === "yaa"
      ? "الياء"
      : nasbMark === "alif"
        ? "الألف"
        : "الفتحة الظاهرة";

  return [
    `«${target}» منادى ${kindLabel}.`,
    reason,
    `هذا النوع معرب، والمنادى هنا منصوب.`,
    `وعلامة نصب «${target}» ${marker}${nasbMark === "yaa" ? " لأنه مثنى أو جمع مذكر سالم بحسب صورته" : nasbMark === "alif" ? " لأنه من الأسماء الخمسة" : ""}.`,
  ];
}

function practiceReviewFinalLaSteps(
  target: string,
  facts: Record<string, unknown>,
  topicId?: string,
): string[] {
  if (topicId !== "la-nafiya") return [];

  const kind = String(facts.laNameKind || "");
  const buildMark = String(facts.buildMark || "");
  const nasbMark = String(facts.nasbMark || "");

  const kindLabel =
    kind === "mufrad"
      ? "مفرد في اصطلاح الباب"
      : kind === "mudaf"
        ? "مضاف"
        : "شبيه بالمضاف";

  const reason =
    kind === "mufrad"
      ? `اسم «لا» هنا غير مضاف ولا شبيه بالمضاف؛ لذلك هو مفرد في اصطلاح الباب.`
      : kind === "mudaf"
        ? `اسم «لا» مضاف إلى ما بعده؛ لذلك هو من النوع المضاف.`
        : `تمّ معنى اسم «لا» بما بعده من غير إضافة صريحة؛ لذلك هو شبيه بالمضاف.`;

  if (kind === "mufrad") {
    const build =
      buildMark === "yaa"
        ? "الياء"
        : buildMark === "damma"
          ? "الضم"
          : "الفتح";

    return [
      `«${target}» اسم «لا» النافية للجنس، ونوعه ${kindLabel}.`,
      reason,
      `اسم «لا» المفرد مبني على ما ينصب به؛ وهنا بُنِي على ${build}.`,
      `لذلك «${target}» مبني على ${build} في محل نصب.`,
    ];
  }

  const marker =
    nasbMark === "yaa"
      ? "الياء"
      : nasbMark === "alif"
        ? "الألف"
        : "الفتحة الظاهرة";

  return [
    `«${target}» اسم «لا» النافية للجنس، ونوعه ${kindLabel}.`,
    reason,
    `المضاف والشبيه بالمضاف في هذا الباب معربان، واسم «لا» هنا منصوب.`,
    `وعلامة نصب «${target}» ${marker}${nasbMark === "yaa" ? " بحسب صورة الاسم" : nasbMark === "alif" ? " لأنه من الأسماء الخمسة" : ""}.`,
  ];
}

function practiceReviewFinalMafoolatNumberSteps(
  target: string,
  facts: Record<string, unknown>,
  topicId?: string,
): string[] {
  if (
    topicId !== "mafoolat" ||
    String(facts.mafoolType || "") !== "mutlaq" ||
    String(facts.mutlaqKind || "") !== "number"
  ) {
    return [];
  }

  const shape = practiceReviewFinalShapeLabel(facts);

  return [
    `«${target}» بيّن عدد مرات وقوع الحدث نفسه الذي دل عليه الفعل؛ لذلك هو مفعول مطلق مبين للعدد.`,
    `المفعول المطلق منصوب.`,
    shape ? `«${target}» ${shape}.` : "",
    `وعلامة نصبه الياء لأنه مثنى.`,
  ].filter(Boolean).slice(0, 4);
}

function practiceReviewFinalIstithnaMajrurSteps(
  expected: string,
  target: string,
  facts: Record<string, unknown>,
  topicId?: string,
): string[] {
  if (
    topicId !== "istithna" ||
    Boolean(facts.isComplete) !== false ||
    String(facts.mufarraghRole || "") !== "majrur"
  ) {
    return [];
  }

  const marker = practiceReviewFinalMarker(expected);

  return [
    `لم يُذكر المستثنى منه؛ فالاستثناء في هذا المثال مفرغ.`,
    `في الاستثناء المفرغ يكون إعراب ما بعد «إلا» بحسب موقعه، وقد سبقت الباء «${target}».`,
    `دخول حرف الجر جعل «${target}» في حالة الجر.`,
    marker ? `وتظهر علامة الجر على آخره: ${marker}.` : "",
  ].filter(Boolean).slice(0, 4);
}

function practiceReviewFinalFamilySteps(
  expected: string,
  target: string,
  facts: Record<string, unknown>,
  topicId?: string,
): string[] {
  const hiddenNasikh = practiceReviewFinalHiddenNasikhSteps(
    target,
    facts,
    topicId,
  );
  if (hiddenNasikh.length) return hiddenNasikh;

  const hiddenFael = practiceReviewFinalHiddenFaelSteps(
    target,
    facts,
    topicId,
  );
  if (hiddenFael.length) return hiddenFael;

  const structure = practiceReviewFinalStructureSteps(
    expected,
    target,
    facts,
  );
  if (structure.length) return structure;

  const firstWord = practiceReviewFinalFirstWordSteps(
    target,
    facts,
    topicId,
  );
  if (firstWord.length) return firstWord;

  const present = practiceReviewFinalPresentSteps(
    expected,
    target,
    facts,
    topicId,
  );
  if (present.length) return present;

  const past = practiceReviewFinalPastSteps(
    expected,
    target,
    facts,
    topicId,
  );
  if (past.length) return past;

  const pronoun = practiceReviewFinalAttachedPronounSteps(
    target,
    facts,
    topicId,
  );
  if (pronoun.length) return pronoun;

  const manqous = practiceReviewFinalManqousSteps(
    target,
    facts,
    topicId,
  );
  if (manqous.length) return manqous;

  const munada = practiceReviewFinalMunadaSteps(
    target,
    facts,
    topicId,
  );
  if (munada.length) return munada;

  const la = practiceReviewFinalLaSteps(
    target,
    facts,
    topicId,
  );
  if (la.length) return la;

  const mafoolatNumber = practiceReviewFinalMafoolatNumberSteps(
    target,
    facts,
    topicId,
  );
  if (mafoolatNumber.length) return mafoolatNumber;

  const istithnaMajrur = practiceReviewFinalIstithnaMajrurSteps(
    expected,
    target,
    facts,
    topicId,
  );
  if (istithnaMajrur.length) return istithnaMajrur;

  return [];
}
function buildOrderedPracticeReview(
  expected: string,
  target: string,
  facts: Record<string, unknown>,
  topicId?: string,
): string[] {
  const familyReview = practiceReviewFinalFamilySteps(
    expected,
    target,
    facts,
    topicId,
  );
  if (familyReview.length) return familyReview;

  const structuredMahal = practiceReviewStructuredMahalSteps(
    expected,
    target,
    facts,
  );
  if (structuredMahal.length) return structuredMahal;

  const imperative = practiceReviewImperativeSteps(
    expected,
    target,
    facts,
  );
  if (imperative.length) return imperative;

  const roleAndCase = practiceReviewRoleAndCaseSteps(
    expected,
    target,
  );
  if (roleAndCase.length) {
    const nominalForm = practiceReviewNominalForm(facts, target);
    const marker = practiceReviewMarkerStep(expected, target, facts);

    return [
      ...roleAndCase,
      nominalForm,
      marker,
    ]
      .filter(Boolean)
      .slice(0, 4);
  }

  return [];
}
export function buildPracticeSequenceSteps(
  context: PracticeFlowContext,
): string[] {
  const target = String(
    context.state.currentTarget ||
    context.example?.target ||
    "الكلمة المحددة",
  ).trim();

  const canonical = buildCanonicalThinkingRoute(context);
  const steps = buildPracticeCorrectionSteps(
    canonical.steps,
    target,
    context.practiceExpectedLabel,
    (context.example?.facts || context.state.facts || {}) as Record<string, unknown>,
    context.topicId,
    context.wrongOption,
    context.example?.sentence || context.state.currentSentence,
  );

  const facts =
    (context.example?.facts || context.state.facts || {}) as Record<string, unknown>;

  const orderedReview = buildOrderedPracticeReview(
    context.practiceExpectedLabel,
    target,
    facts,
    context.topicId,
  );
  if (orderedReview.length) return orderedReview;

  const roleCaseReason = practiceRoleCaseReasonStep(
    context.practiceExpectedLabel,
    target,
  );
  const routingReason = practiceRoutingReasonStep(
    context.practiceExpectedLabel,
    target,
  );
  const builtPresentReason = practiceBuiltPresentReasonStep(
    context.practiceExpectedLabel,
    target,
  );
  const pastBuildReason = practicePastBuildReasonStep(
    context.practiceExpectedLabel,
    target,
    facts,
  );
  const possessiveYaaReason = practicePossessiveYaaReasonStep(
    context.practiceExpectedLabel,
    target,
  );
  const markerReason = practiceMarkerReasonStep(
    context.practiceExpectedLabel,
    target,
    facts,
  );

  const focusedSteps = steps
    .map(cleanPracticeLine)
    .filter(Boolean)
    .filter((step) => !step.startsWith("اختيارك"))
    .filter(
      (step) =>
        !/(?:لا تعد|طبّق|طبق|عد إلى السؤال|عد للسؤال|عد واختر|ارجع إلى السؤال|راجع السؤال)/u.test(step),
    )
    .filter(
      (step) =>
        !(
          possessiveYaaReason &&
          /(?:لأنه|ولأنه|فهو)\s+مبني/u.test(step)
        ),
    );

  const essential = [
    routingReason,
    roleCaseReason,
    builtPresentReason,
    pastBuildReason,
    possessiveYaaReason,
    markerReason,
  ]
    .filter(Boolean)
    .filter(
      (step, index, items) =>
        items.findIndex(
          (item) =>
            normalizePracticeComparable(item) ===
            normalizePracticeComparable(step),
        ) === index,
    );

  const support = focusedSteps.filter(
    (step) =>
      !essential.some(
        (item) =>
          normalizePracticeComparable(item) ===
          normalizePracticeComparable(step),
      ),
  );

  // Keep the correction short, but never lose the synthesized rule that
  // explains role/case/marker. Route details fill only the remaining slots.
  const supportSlots = Math.max(0, 4 - essential.length);
  const core = [
    ...essential,
    ...support.slice(0, supportSlots),
  ].slice(0, 4);

  if (core.length) return core;

  return [
    `حدّد وظيفة «${target}» أولًا، ثم حكمها الإعرابي، ثم اختر العلامة التي تدل على هذا الحكم.`,
  ];
}

export type PracticeHintLevel = 1 | 2;

type PracticeHintQuestion = {
  index: number;
  bucket: PracticeSemanticRole;
  text: string;
};

function compactPracticeHintPrompt(text: string): string {
  let value = String(text || "")
    .replace(/\([^)]{18,}\)/gu, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!value) return "";

  const questionEnd = value.search(/[؟?]/u);
  if (questionEnd >= 0) {
    value = value.slice(0, questionEnd + 1).trim();
  }

  if (value.length > 135) {
    const parts = value.split(/[،؛:]/u);
    const first = String(parts[0] || "").trim();
    if (first.length >= 24) {
      value = first.replace(/[؟?]+$/u, "").trim() + "؟";
    }
  }

  if (!/[؟?]$/u.test(value)) {
    value = value.replace(/[.!]+$/u, "").trim() + "؟";
  }

  return value;
}

function practiceHintQuestionCandidates(
  route: PracticeRouteStep[],
  target: string,
): PracticeHintQuestion[] {
  const output: PracticeHintQuestion[] = [];

  route.forEach((step, index) => {
    const bucket = practiceSemanticBucket(step.node);
    let text = compactPracticeHintPrompt(
      compactPracticeQuestion(step.node.text, target),
    );

    if (bucket === "predicate-form") {
      text = `هل «${target}» كلمة واحدة، أم جملة، أم شبه جملة؟`;
    } else if (bucket === "nominal-form") {
      text = `من حيث صورة الاسم، هل «${target}» مفرد، أم مثنى، أم جمع؟`;
    }

    if (!text) return;

    const key = normalizePracticeComparable(text);
    if (!key) return;

    // في التلميح لا نحتاج سؤالين عن القرار الدلالي نفسه.
    if (
      output.some(
        (item) =>
          item.bucket === bucket ||
          normalizePracticeComparable(item.text) === key,
      )
    ) {
      return;
    }

    output.push({
      index,
      bucket,
      text,
    });
  });

  return output;
}

function selectPracticeLevelOneQuestions(
  route: PracticeRouteStep[],
  target: string,
): string[] {
  const candidates = practiceHintQuestionCandidates(route, target);
  if (candidates.length <= 2) return candidates.map((item) => item.text);

  const orientation = candidates.find((item) =>
    [
      "syntactic-role",
      "verb-time",
      "attachment",
      "predicate-form",
      "declinability",
      "routing",
      "word-kind",
    ].includes(item.bucket),
  ) || candidates[0]!;

  const finishing = [...candidates].reverse().find((item) =>
    item.index !== orientation.index &&
    item.bucket !== orientation.bucket &&
    [
      "case-marker",
      "weak-ending",
      "case",
      "nominal-form",
      "declinability",
      "predicate-form",
      "attachment",
    ].includes(item.bucket),
  ) || candidates[candidates.length - 1]!;

  return [orientation, finishing]
    .filter(
      (item, index, items) =>
        items.findIndex((candidate) => candidate.index === item.index) === index,
    )
    .sort((a, b) => a.index - b.index)
    .slice(0, 2)
    .map((item) => item.text);
}

function practiceGuidedDecision(
  step: PracticeRouteStep,
  target: string,
): string {
  const explicit = cleanPracticeLine(step.node.practice?.decision || "");
  const decision =
    explicit ||
    semanticPracticeDecision(step.node, step.correct, step.state);

  if (!decision) return "";

  return practiceDecisionStatement(step.node, decision, target)
    .replace(/\s+/g, " ")
    .trim();
}

function practiceFullResultText(
  tree: ExerciseTree,
  finalState: PracticeFlowContext["state"],
  target: string,
): string {
  const node = tree.nodes[finalState.currentNodeId];
  if (!node || node.type !== "result") return "";

  const lines = String(node.text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const targetKey = normalizePracticeComparable(target);
  if (
    targetKey &&
    normalizePracticeComparable(lines[0] || "") === targetKey
  ) {
    lines.shift();
  }

  return oneLine(lines.join(" "));
}

function selectPracticeLevelTwoGuidance(
  route: PracticeRouteStep[],
  target: string,
): string[] {
  const questions = practiceHintQuestionCandidates(route, target);
  if (!questions.length) return [];

  const unresolved = questions[questions.length - 1]!;
  const eligible = route
    .map((step, index) => ({
      step,
      index,
      bucket: practiceSemanticBucket(step.node),
      text: practiceGuidedDecision(step, target),
    }))
    .filter(
      (item) =>
        item.index < unresolved.index &&
        item.bucket !== unresolved.bucket &&
        Boolean(item.text),
    );

  const core = eligible.find((item) =>
    [
      "syntactic-role",
      "verb-time",
      "attachment",
      "predicate-form",
      "routing",
    ].includes(item.bucket),
  );

  const status = [...eligible].reverse().find((item) =>
    item.index !== core?.index &&
    item.bucket !== unresolved.bucket &&
    [
      "case",
      "attachment",
      "declinability",
      "nominal-form",
      "predicate-form",
      "word-kind",
    ].includes(item.bucket),
  );

  const decisions = [core, status]
    .filter(
      (item): item is NonNullable<typeof item> => Boolean(item),
    )
    .filter(
      (item, index, items) =>
        items.findIndex((candidate) => candidate.index === item.index) === index,
    )
    .sort((a, b) => a.index - b.index)
    .map((item) => item.text)
    .slice(0, 2);

  if (!decisions.length) {
    const prior = route
      .slice(0, unresolved.index)
      .map((step) => practiceGuidedDecision(step, target))
      .find(Boolean);

    if (prior) {
      return [prior, `الآن اسأل نفسك: ${unresolved.text}`];
    }

    return [`ركّز الآن على هذا القرار: ${unresolved.text}`];
  }

  return [
    ...decisions,
    `الآن اسأل نفسك: ${unresolved.text}`,
  ];
}

export function buildPracticeDirectHint(
  context: Pick<PracticeFlowContext, "tree" | "mode" | "state" | "topicId">,
  level: PracticeHintLevel = 1,
): string {
  const target = String(
    context.state.currentTarget || "الكلمة المحددة",
  ).trim();

  const example = practiceExampleForReasoning({ state: context.state });
  const canonical = buildCanonicalThinkingRoute({ ...context, example });
  const resultText = practiceFullResultText(
    context.tree,
    canonical.finalState,
    target,
  );

  const facts = (context.state.facts || {}) as Record<string, unknown>;
  const topicCoach = buildPracticeTopicGuidance({
    topicId: context.topicId,
    resultText,
    target,
    sentence: context.state.currentSentence,
    facts,
  });
  const policy = buildPracticePolicyGuidance({
    resultText,
    target,
    facts,
  });

  if (level === 2) {
    if (topicCoach.level2.length) return topicCoach.level2.slice(0, 3).join("\n");
    if (policy.level2.length) return policy.level2.slice(0, 3).join("\n");

    const guidance = selectPracticeLevelTwoGuidance(
      canonical.steps,
      target,
    );
    if (guidance.length) return guidance.slice(0, 3).join("\n");

    return `ابدأ بما ثبت في المثال، ثم حدّد حكم «${target}». بقي أن تختار العلامة المناسبة بنفسك.`;
  }

  if (topicCoach.level1.length) {
    return topicCoach.level1
      .slice(0, 2)
      .map((question, index) => `${index + 1}. ${question}`)
      .join("\n");
  }

  if (policy.level1.length) {
    return policy.level1
      .slice(0, 2)
      .map((question, index) => `${index + 1}. ${question}`)
      .join("\n");
  }

  const questions = selectPracticeLevelOneQuestions(
    canonical.steps,
    target,
  );

  if (!questions.length) {
    return `انظر إلى علاقة «${target}» بما حولها أولًا. ما القرار الذي يسبق البحث عن العلامة؟`;
  }

  return questions
    .slice(0, 2)
    .map((question, index) => `${index + 1}. ${question}`)
    .join("\n");
}

export function buildPracticeCorrectRoute(context: PracticeFlowContext) {
  const canonical = buildCanonicalThinkingRoute(context);

  return {
    steps: buildPracticeSequenceSteps({
      ...context,
      wrongOption: undefined,
    }),
    finalAnswer: oneLine(context.practiceExpectedLabel),
    nextState: canonical.finalState,
  };
}
