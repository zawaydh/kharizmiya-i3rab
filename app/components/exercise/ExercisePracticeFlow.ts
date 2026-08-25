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
    .replace(/\s+(?:عد إلى السؤال|عد للسؤال|عد واختر)[\s\S]*$/u, "")
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

  return practiceTargetOnlyResult(chosen, example?.target);
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
  return practiceExpectedLabelForExample(routeResult, args.example);
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
      return `لنعرف حرف العلة المحذوف نعيد الفعل إلى صورته مع «هو»: هو ${huwaForm}؛ تأمل آخر هذه الصورة وحدد حرف العلة الأصلي بنفسك.`;
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

  if (steps.length) return steps;

  return [
    `أعد تتبّع علاقة «${target}» بما حولها، ثم حدّد الحكم والعلامة قبل اختيار النتيجة النهائية.`,
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
    steps: buildPracticeSequenceSteps(context),
    nextState: canonical.finalState,
  };
}
