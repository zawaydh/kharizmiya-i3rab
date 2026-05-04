"use client";

import React from "react";
import ThinkingQA from "./ThinkingQA";
import { createInitialState } from "../../lib/exercise/state";
import { chooseAnswer } from "../../lib/exercise/engine";
import { getTopicProgress } from "../../lib/db";

type Mode = "learn" | "practice" | "quiz";

type SaveProgressFn = (payload: {
  topicId: string;
  level: number;
  percent: number;
  coverage?: string[];
  practice_percent?: number;
  practice_coverage?: string[];
  learn_completed?: boolean;
  practice_completed?: boolean;
  quiz_passed?: boolean;
  quiz_score?: number | null;
  quiz_total?: number | null;
}) => Promise<any> | any;

type QuizAnswerRow = {
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

type FollowUpOption = { label: string; correct: boolean; feedback?: string };
type FollowUp = { question: string; options: FollowUpOption[] };

type QuizExampleLike = {
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
  facts?: Record<string, any>;
};

type Props = {
  title: string;
  mode: Mode;
  tree: any;
  examples: any[];
  coverageKeysOrdered: string[];
  stepLabels?: Record<string, string>;
  quizCount?: number;
  topicId?: string;
  level?: number;
  onSaveProgress?: SaveProgressFn;
  nav?: {
    learn?: string;
    practice?: string;
    quiz?: string;
    paths?: string;
    dashboard?: string;
  };
};

const QUIZ_PASS_PERCENT = 80;

function buildEmptyCovered(keys: string[] = []) {
  const out: Record<string, boolean> = {};
  keys.forEach((k) => {
    out[k] = false;
  });
  return out;
}

function calcPercent(covered: Record<string, boolean> = {}, keys: string[] = []) {
  const total = Math.max(1, keys.length);
  const done = keys.filter((k) => covered[k]).length;
  return Math.round((done / total) * 100);
}

function pickNextExampleIndex(
  examples: any[],
  orderedKeys: string[],
  covered: Record<string, boolean>,
  currentIndex: number
) {
  const nextKey = orderedKeys.find((k) => !covered[k]);
  if (!nextKey) return currentIndex;
  const idx = examples.findIndex((ex) => getExampleCoverageKeys(ex).includes(nextKey));
  return idx >= 0 ? idx : Math.min(currentIndex + 1, Math.max(0, examples.length - 1));
}

function buildRunnerState(tree: any, mode: Mode, example: any) {
  const startNodeId = tree?.startNodeId;
  const base = createInitialState({
    mode: mode === "practice" ? "practice" : "learn",
    level: 2,
    startNodeId,
  });

  return {
    ...base,
    currentExampleId: example?.id,
    currentSentence: example?.sentence,
    currentTarget: example?.target,
    facts: example?.facts || {},
    currentNodeId: startNodeId,
  };
}

function renderSentence(sentence?: string, target?: string) {
  if (!sentence) return null;
  if (!target || !sentence.includes(target)) return sentence;

  const parts = sentence.split(target);
  const out: React.ReactNode[] = [];
  for (let i = 0; i < parts.length; i += 1) {
    if (parts[i]) out.push(parts[i]);
    if (i !== parts.length - 1) {
      out.push(
        <span key={`target-${i}`} className="exercise-target-word">
          {target}
        </span>
      );
    }
  }
  return out;
}

function getStageMeta(mode: Mode) {
  if (mode === "learn") {
    return {
      badge: "مرحلة التعلّم",
      subtitle: "افهم منطق المسار أولًا، وستظهر لك التلميحات والتصحيح الموجّه.",
      nextLabel: "انتقل إلى التدرّب →",
      nextHrefPrefix: "/train/",
    };
  }
  if (mode === "practice") {
    return {
      badge: "مرحلة التدرّب",
      subtitle: "طبّق بنفسك، ويجب اختيار الإجابة الصحيحة قبل الانتقال إلى السؤال التالي.",
      nextLabel: "اختبر نفسي →",
      nextHrefPrefix: "/quiz/",
    };
  }
  return {
    badge: "مرحلة الاختبار",
    subtitle: "اختر أفضل صياغة للإعراب النهائي، وسيظهر التصحيح بعد إنهاء جميع الأسئلة.",
    nextLabel: "",
    nextHrefPrefix: "",
  };
}


function getLearningQA(topicId?: string, mode?: Mode) {
  const topic = String(topicId || "");
  const common = [
    { q: "كيف أبدأ الإعراب؟", a: "أبدأ بتحديد نوع الكلمة أو موقعها في الجملة، ثم أنتقل خطوة خطوة إلى العلامة أو المحل الإعرابي." },
    { q: "لماذا لا أكتفي بحفظ النتيجة؟", a: "لأن الإعراب يتغير بتغير موقع الكلمة. المطلوب أن أعرف الطريق: نوع الكلمة، موقعها، ثم العلامة أو المحل." },
    { q: "متى أقول: مبني في محل؟", a: "عندما تكون الكلمة اسمًا مبنيًا مثل الضمير أو اسم الإشارة أو الاسم الموصول. أبدأ باسمها ثم أقول: مبني في محل رفع أو نصب أو جر حسب موقعها." },
  ];

  if (mode === "quiz") {
    return [
      { q: "كيف أتعامل مع الاختبار؟", a: "اقرأ الجملة أولًا، حدد الكلمة الهدف، ثم اختر الإعراب الكامل الأقرب للصياغة الصحيحة. لا تعتمد على طول الاختيار أو ترتيبه." },
      { q: "متى تظهر النتيجة؟", a: "التصحيح يظهر بعد تسليم الاختبار حتى لا يتحول الاختبار إلى تدريب مباشر." },
      { q: "كيف أراجع أخطائي؟", a: "بعد النتيجة راجع: إجابتك، الإجابة الصحيحة، وسبب الصحة أو الخطأ لكل سؤال." },
    ];
  }

  if (topic.includes("verb_present")) {
    return [
      { q: "ما أول قرار في الفعل المضارع؟", a: "أسأل: هل سبق الفعل أداة نصب أو جزم؟ إن لم يسبق بشيء فهو مرفوع." },
      { q: "كيف أحدد العلامة؟", a: "بعد تحديد الرفع أو النصب أو الجزم، أسأل: هل هو من الأفعال الخمسة؟ هل هو صحيح الآخر أم معتل الآخر؟" },
      { q: "كيف أتعامل مع الأفعال الخمسة؟", a: "ليست موضوعًا منفصلًا؛ هي أفعال مضارعة تتبع أحكام المضارع، لكن علامتها تختلف: ثبوت النون رفعًا، وحذف النون نصبًا وجزمًا." },
    ];
  }

  if (topic.includes("verb_past")) {
    return [
      { q: "هل الفعل الماضي معرب؟", a: "لا، الفعل الماضي مبني دائمًا. نبحث فقط عن علامة بنائه." },
      { q: "ما الذي يغير حركة بناء الماضي؟", a: "اتصاله بضمير رفع متحرك يجعله مبنيًا على السكون، وواو الجماعة تجعله مبنيًا على الضم، أما ضمير النصب فلا يغير فتحه الأصلي." },
      { q: "كيف أعرب الضمير في كتبتُ؟", a: "التاء: ضمير متصل مبني في محل رفع فاعل. عبارة (ضمير متصل مبني في محل) ثابتة ثم نحدد المحل حسب موقع الضمير." },
    ];
  }

  if (topic.includes("verb_imperative")) {
    return [
      { q: "كيف أحدد بناء فعل الأمر؟", a: "أسأل: هل صحيح الآخر؟ هل معتل الآخر؟ هل اتصل بألف الاثنين أو واو الجماعة أو ياء المخاطبة؟" },
      { q: "متى يبنى على حذف حرف العلة؟", a: "إذا كان معتل الآخر، مثل: ادعُ أصلها يدعو." },
      { q: "متى يبنى على حذف النون؟", a: "إذا اتصل بألف الاثنين أو واو الجماعة أو ياء المخاطبة، مثل: اذهبي أصلها اذهبين." },
    ];
  }

  if (topic.includes("attached_pronouns")) {
    return [
      { q: "ما قاعدة الضمائر المتصلة؟", a: "نبدأ دائمًا بقول: ضمير متصل مبني في محل... ثم نحدد: رفع، نصب، أو جر." },
      { q: "كيف أحدد المحل؟", a: "أنظر إلى الاسم الذي حل محله الضمير أو موقعه في الجملة: إن دل على فاعل فهو في محل رفع، وإن دل على مفعول فهو في محل نصب، وإن جاء بعد حرف جر أو مضاف فهو في محل جر." },
      { q: "مثال سريع؟", a: "كتبتُ: التاء ضمير متصل مبني في محل رفع فاعل. رأيتُه: الهاء ضمير متصل مبني في محل نصب مفعول به." },
    ];
  }

  if (topic.includes("ism_manqous")) {
    return [
      { q: "ما أول سؤال في الاسم المنقوص؟", a: "أسأل عن موقعه: منصوب أم مرفوع أم مجرور؟" },
      { q: "متى تبقى الياء؟", a: "إذا اتصلت به أل التعريف أو جاء بعده مضاف إليه، تبقى ياء الاسم المنقوص ولا تحذف." },
      { q: "متى تحذف الياء؟", a: "إذا كان مرفوعًا أو مجرورًا نكرة غير مضاف وغير معرف بأل، تحذف ياؤه وتقدر الضمة أو الكسرة على الياء المحذوفة." },
    ];
  }

  if (topic.includes("khabar") || topic.includes("nominal-advanced") || topic.includes("nominal")) {
    return [
      { q: "كيف أبدأ في الجملة الاسمية؟", a: "أحدد المبتدأ أولًا، ثم أسأل: ماذا أخبرنا عنه؟ فتكون الإجابة هي الخبر أو طريق الوصول إليه." },
      { q: "كيف أحدد نوع الخبر؟", a: "إن كان كلمة واحدة فهو خبر مفرد، وإن بدأ بفعل فهو جملة فعلية، وإن كان تركيبًا اسميًا فهو جملة اسمية، وإن كان جارًا ومجرورًا أو ظرفًا فهو شبه جملة." },
      { q: "مثال الخبر جملة اسمية؟", a: "المدرسة أبوابها مفتوحة: أخبرنا عن المدرسة بأن أبوابها مفتوحة، فـ(أبوابها مفتوحة) جملة اسمية في محل رفع خبر للمبتدأ الأول." },
      { q: "ما المصدر المؤول؟", a: "تركيب مثل: أن + فعل مضارع، يؤول بمصدر صريح ويعامل معاملة الاسم، مثل: أن تنجح = نجاحك." },
    ];
  }

  return common;
}

function resultIdToCoverage(resultId?: string) {
  switch (resultId) {
    case "R_mubtada_sahih":
      return "mubtada.sahih";
    case "R_mubtada_moatal":
      return "mubtada.moatal";
    case "R_mubtada_5":
      return "mubtada.five";
    case "R_mubtada_muthanna":
      return "mubtada.muthanna";
    case "R_mubtada_jms":
      return "mubtada.jms";
    case "R_mubtada_jfs":
      return "mubtada.jfs";
    case "R_mubtada_jt":
      return "mubtada.jt";
    case "R_mubtada_damir":
      return "mubtada.damir";
    case "R_mubtada_ishara":
      return "mubtada.ishara";
    case "R_mubtada_mawsool":
      return "mubtada.mawsool";
    case "R_mubtada_istifham":
      return "mubtada.istifham";
    case "R_mubtada_shart":
      return "mubtada.shart";
    case "R_mubtada_kam_khabariyya":
      return "mubtada.kam";
    case "R_source_mubtada":
      return "mubtada.masdar";
    default:
      return null;
  }
}

function firstLine(text?: string) {
  return String(text || "").split("\n")[0].trim();
}

function stableShuffle<T>(items: T[], seed: string) {
  const arr = [...items];
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  for (let i = arr.length - 1; i > 0; i -= 1) {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    const j = Math.abs(h) % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function builtNounSmartHint(target = "الكلمة الهدف", role = "في محلها الإعرابي") {
  return `هل ${target} من الأسماء المبنية؟ جرّب أن تقارنه بالأمثلة: ضمير مثل (هو، إياه)، اسم إشارة مثل (هذا، هذه)، اسم موصول مثل (الذي، التي)، اسم استفهام مثل (من، ما)، اسم شرط مثل (من، مهما)، أو كم الخبرية. بعد تحديد النوع نبدأ الإعراب باسمه، مثل: اسم موصول مبني ${role}.`;
}

function builtNounTypeHintByValue(value?: string) {
  switch (value) {
    case "damir":
      return "الضمير اسم مبني يدل على متكلم أو مخاطب أو غائب، مثل: أنا، نحن، أنت، هو، هم، إياه.";
    case "ishara":
      return "اسم الإشارة اسم مبني يدل على مشار إليه، مثل: هذا، هذه، هؤلاء، ذلك، تلك.";
    case "mawsool":
      return "الاسم الموصول اسم مبني يحتاج صلة بعده توضحه، مثل: الذي، التي، اللذان، الذين، من، ما.";
    case "istifham":
      return "اسم الاستفهام اسم مبني يُسأل به عن شيء، مثل: من، ما، متى، أين، كيف.";
    case "shart":
      return "اسم الشرط اسم مبني يربط فعل الشرط بجوابه، مثل: من، ما، مهما، أينما.";
    case "kam":
      return "كم الخبرية تدل على الكثرة ولا تطلب جوابًا، مثل: كم طالبٍ نجحَ!";
    default:
      return "حدّد نوع الاسم المبني من أمثلته قبل الإعراب.";
  }
}

function buildBalancedQuizOptions(example: QuizExampleLike | undefined, seed: string, cursor: number) {
  const opts = Array.isArray(example?.options) ? [...(example?.options || [])] : [];
  const correct = example?.correctI3rab || "";
  if (!opts.length || !correct) return opts;

  const unique = Array.from(new Set(opts));
  const shuffled = stableShuffle(unique, seed);
  const correctIndex = shuffled.indexOf(correct);
  if (correctIndex < 0) return shuffled;

  shuffled.splice(correctIndex, 1);

  // توزيع موضع الإجابة الصحيحة؛ لا تبقى في الخيار الأول ولا في نفس المكان دائمًا.
  // يظهر الخيار الأول أحيانًا فقط حتى لا تتكون قاعدة مضادة عند الطالبة.
  const targetPositions = [1, 2, 3, 1, 2, 3, 0];
  const target = Math.min(targetPositions[cursor % targetPositions.length], shuffled.length);
  shuffled.splice(target, 0, correct);
  return shuffled;
}

function normalizeCoverageKey(key?: string | null) {
  if (!key) return null;
  return resultIdToCoverage(key) || key;
}

function uniqueCoverageKeys(keys: any[] = []) {
  return Array.from(
    new Set(
      keys
        .map((key) => normalizeCoverageKey(typeof key === "string" ? key : null))
        .filter(Boolean) as string[]
    )
  );
}

function getResultCoverageKeys(tree: any, resultNodeId?: string | null) {
  if (!resultNodeId) return [];
  const node = tree?.nodes?.[resultNodeId];
  if (!node || node.type !== "result") return [];
  return uniqueCoverageKeys([node.coverage, resultNodeId]);
}

function getExampleCoverageKeys(example: any) {
  return uniqueCoverageKeys(Array.isArray(example?.covers) ? example.covers : []);
}

function resolveCoverageKeys(params: {
  tree: any;
  example: any;
  currentNodeId?: string | null;
  requiredKeys: string[];
}) {
  const { tree, example, currentNodeId, requiredKeys } = params;
  const required = new Set(requiredKeys);
  const fromResult = getResultCoverageKeys(tree, currentNodeId).filter((key) => required.has(key));
  const fromExample = getExampleCoverageKeys(example).filter((key) => required.has(key));
  return uniqueCoverageKeys([...fromResult, ...fromExample]).filter((key) => required.has(key));
}

function findResultLabelByCoverage(tree: any, coverage?: string) {
  if (!coverage) return "";
  const nodes = Object.values(tree?.nodes || {}) as any[];
  const match = nodes.find((n) => n?.type === "result" && (n?.coverage === coverage || resultIdToCoverage(n?.id) === coverage));
  return firstLine(match?.text);
}

export default function ExercisePlayer({
  title,
  mode,
  tree,
  examples,
  coverageKeysOrdered,
  stepLabels,
  quizCount = 10,
  topicId,
  level = 2,
  onSaveProgress,
}: Props) {
  const stageMeta = getStageMeta(mode);
  const [covered, setCovered] = React.useState<Record<string, boolean>>(buildEmptyCovered(coverageKeysOrdered));
  const [exampleIndex, setExampleIndex] = React.useState(0);
  const [feedback, setFeedback] = React.useState<{ wrongId?: string; correctId?: string; hint?: string } | null>(null);
  const [selectedQuizOption, setSelectedQuizOption] = React.useState<string | null>(null);
  const [quizLocked, setQuizLocked] = React.useState(false);
  const [quizOrder, setQuizOrder] = React.useState<number[]>([]);
  const [quizCursor, setQuizCursor] = React.useState(0);
  const [quizAnswers, setQuizAnswers] = React.useState<QuizAnswerRow[]>([]);
  const [learnReady, setLearnReady] = React.useState(false);
  const [practiceReady, setPracticeReady] = React.useState(false);
  const [toast, setToast] = React.useState("");
  const [mounted, setMounted] = React.useState(false);
  const [followUpChoice, setFollowUpChoice] = React.useState<string | null>(null);

  const currentIdx = mode === "quiz" ? quizOrder[quizCursor] ?? 0 : exampleIndex;
  const example = examples[currentIdx];
  const [state, setState] = React.useState<any>(() => buildRunnerState(tree, mode, example));

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  React.useEffect(() => {
    if (!example) return;
    setState(buildRunnerState(tree, mode, example));
    setFeedback(null);
    setSelectedQuizOption(null);
    setQuizLocked(false);
    setFollowUpChoice(null);
  }, [tree, mode, example]);

  React.useEffect(() => {
    if (mode !== "quiz") return;
    const count = Math.min(quizCount, examples.length);
    setQuizOrder(examples.map((_, i) => i).slice(0, count));
    setQuizCursor(0);
    setQuizAnswers([]);
  }, [mode, examples, quizCount]);

  React.useEffect(() => {
    let active = true;

    async function loadProgress() {
      const empty = buildEmptyCovered(coverageKeysOrdered);
      if (!mounted || !topicId || !level) {
        if (!active) return;
        setCovered(empty);
        return;
      }

      try {
        const row = await getTopicProgress(topicId, level);
        if (!active) return;

        if (mode === "learn") {
          const next = { ...empty };
          (row?.coverage || []).forEach((k: string) => {
            if (k in next) next[k] = true;
          });
          setCovered(next);
          setExampleIndex(pickNextExampleIndex(examples, coverageKeysOrdered, next, 0));
        } else if (mode === "practice") {
          const next = { ...empty };
          (row?.practice_coverage || []).forEach((k: string) => {
            if (k in next) next[k] = true;
          });
          setCovered(next);
          setExampleIndex(pickNextExampleIndex(examples, coverageKeysOrdered, next, 0));
        } else {
          setCovered(empty);
        }

        setLearnReady(Boolean(row?.learn_completed));
        setPracticeReady(Boolean(row?.practice_completed));
      } catch {
        if (!active) return;
        setCovered(empty);
        setLearnReady(false);
        setPracticeReady(false);
      }
    }

    loadProgress();
    return () => {
      active = false;
    };
  }, [mounted, topicId, level, mode, examples, coverageKeysOrdered]);

  const node = tree?.nodes?.[state.currentNodeId];
  const totalCount = coverageKeysOrdered.length;
  const doneCount = coverageKeysOrdered.filter((k) => covered[k]).length;
  const coveredPercent = calcPercent(covered, coverageKeysOrdered);
  const isDone = coveredPercent >= 100;
  const stepLabel = coverageKeysOrdered.find((k) => !covered[k]) || "مكتمل";
  const quizFinished = mode === "quiz" && quizOrder.length > 0 && quizCursor >= quizOrder.length;
  const answeredQuizRows = quizAnswers.filter(Boolean);
  const quizScore = answeredQuizRows.filter((a) => a.isCorrect).length;
  const quizPercent = answeredQuizRows.length ? Math.round((quizScore / answeredQuizRows.length) * 100) : 0;
  const canDownloadCertificate = quizFinished && quizPercent >= QUIZ_PASS_PERCENT && learnReady && practiceReady;
  const quizOptions = React.useMemo(() => {
    return buildBalancedQuizOptions(
      example as QuizExampleLike,
      `${topicId || "topic"}-${(example as QuizExampleLike)?.id || currentIdx}-${quizCursor}`,
      quizCursor
    );
  }, [example, currentIdx, quizCursor, topicId]);

  React.useEffect(() => {
    if (mode !== "quiz") return;
    const existing = quizAnswers[quizCursor];
    setSelectedQuizOption(existing?.actualLabel || null);
    setQuizLocked(Boolean(existing?.actualLabel));
  }, [mode, quizCursor, quizAnswers]);

  const currentFollowUp = (example as QuizExampleLike | undefined)?.followUp;
  const chosenFollowUp = currentFollowUp?.options?.find((o) => o.label === followUpChoice);
  const followUpIsCorrect = Boolean(chosenFollowUp?.correct);
  const canMoveAfterResult = !currentFollowUp || mode === "learn" || followUpIsCorrect;

  function pickFollowUp(label: string) {
    setFollowUpChoice(label);
  }

  async function persist(nextCovered: Record<string, boolean>, extra: any = {}) {
    if (!topicId || !onSaveProgress) return;
    const percent = calcPercent(nextCovered, coverageKeysOrdered);
    const coverage = coverageKeysOrdered.filter((k) => nextCovered[k]);

    // مهم جدًا: لا نرسل percent = 0 في التدريب أو الاختبار؛ لأن ذلك يمسح نسبة التعلّم.
    // نرسل فقط الحقل الخاص بالمرحلة الحالية، وبذلك يبقى النظام القديم محفوظًا ويصبح coverage حقيقيًا.
    const payload: any = {
      topicId,
      level,
      learn_completed: mode === "learn" ? percent >= 100 : extra.learn_completed,
      practice_completed: mode === "practice" ? percent >= 100 : extra.practice_completed,
      quiz_passed: extra.quiz_passed,
      quiz_score: extra.quiz_score,
      quiz_total: extra.quiz_total,
    };

    if (mode === "learn") {
      payload.percent = percent;
      payload.coverage = coverage;
    }

    if (mode === "practice") {
      payload.practice_percent = percent;
      payload.practice_coverage = coverage;
    }

    await onSaveProgress(payload);
  }

  function markCurrentCovered() {
    const next = { ...covered };
    const keys = resolveCoverageKeys({
      tree,
      example,
      currentNodeId: state?.currentNodeId,
      requiredKeys: coverageKeysOrdered,
    });

    keys.forEach((k: string) => {
      next[k] = true;
    });

    if (!keys.length && tree?.nodes?.[state?.currentNodeId]?.type === "result") {
      setToast("وصلتِ للنتيجة، لكن هذا المسار لا يملك مفتاح تغطية بعد");
    }

    setCovered(next);
    return next;
  }

  async function goNextExample() {
    const nextCovered = markCurrentCovered();
    const percent = calcPercent(nextCovered, coverageKeysOrdered);

    try {
      await persist(nextCovered, {
        learn_completed: mode === "learn" ? percent >= 100 : undefined,
        practice_completed: mode === "practice" ? percent >= 100 : undefined,
      });
      if (mode === "learn" && percent >= 100) setLearnReady(true);
      if (mode === "practice" && percent >= 100) setPracticeReady(true);
    } catch {
      setToast("تعذر حفظ التقدم الآن");
    }

    setExampleIndex(pickNextExampleIndex(examples, coverageKeysOrdered, nextCovered, currentIdx));
    setFeedback(null);
    setState(buildRunnerState(tree, mode, examples[pickNextExampleIndex(examples, coverageKeysOrdered, nextCovered, currentIdx)]));
  }

  function resetTraining() {
    const empty = buildEmptyCovered(coverageKeysOrdered);
    setCovered(empty);
    setExampleIndex(0);
    setFeedback(null);
    setState(buildRunnerState(tree, mode, examples[0]));
    if (mode === "learn") setLearnReady(false);
    if (mode === "practice") setPracticeReady(false);
  }

  function isAnswerCorrect(answer: any) {
    if (!answer) return false;
    if (answer.eval) return state.facts?.[answer.eval.fact] === answer.eval.equals;
    return Boolean(answer.correct);
  }

  function handlePick(answerId: string) {
    if (!node || node.type !== "question" || mode === "quiz") return;

    const picked = node.answers.find((a: any) => a.id === answerId);
    const correctAnswer = node.answers.find((a: any) => isAnswerCorrect(a));
    const ok = isAnswerCorrect(picked);

    if (!ok) {
      const isBuiltTypeNode = String(node?.id || "").includes("built_type") || String(node?.id || "").includes("mabniType");
      const expectedBuiltType = state.facts?.mabniType;
      const smartHint = isBuiltTypeNode
        ? `${builtNounSmartHint(state.currentTarget, "في محل الإعراب المطلوب")}\n${builtNounTypeHintByValue(expectedBuiltType)}`
        : picked?.hint ?? node?.hint;
      if (mode === "practice") {
        setFeedback({ wrongId: answerId, hint: smartHint });
      } else {
        setFeedback({ wrongId: answerId, correctId: correctAnswer?.id, hint: smartHint });
      }
      return;
    }

    const res = chooseAnswer({ state, tree, answerId } as any);
    setState(res.nextState);
    setFeedback(null);
  }

  async function finalizeQuizExample() {
    if (!selectedQuizOption) {
      setToast("اختر إجابة أولًا");
      return;
    }
    const quizExample = example as QuizExampleLike;
    const expectedCoverage = getExampleCoverageKeys(quizExample)[0] || "";
    const expectedLabel = quizExample?.correctI3rab || findResultLabelByCoverage(tree, expectedCoverage) || expectedCoverage;
    const actualLabel = selectedQuizOption;
    const row: QuizAnswerRow = {
      exampleId: quizExample?.id || String(quizCursor),
      sentence: quizExample?.sentence,
      target: quizExample?.target,
      expectedCoverage,
      expectedLabel,
      actualCoverage: actualLabel === expectedLabel ? expectedCoverage : null,
      actualLabel,
      isCorrect: actualLabel === expectedLabel,
      whyCorrect: quizExample?.whyCorrect,
      actualOptionReason: actualLabel ? quizExample?.optionReasons?.[actualLabel] : undefined,
    };

    const nextAnswers = [...quizAnswers];
    nextAnswers[quizCursor] = row;
    setQuizAnswers(nextAnswers);

    const nextCursor = quizCursor + 1;
    if (nextCursor >= quizOrder.length) {
      setQuizCursor(nextCursor);
      const answeredRows = nextAnswers.filter(Boolean);
      const nextPercent = answeredRows.length ? Math.round((answeredRows.filter((a) => a.isCorrect).length / answeredRows.length) * 100) : 0;
      try {
        await persist(buildEmptyCovered(coverageKeysOrdered), {
          quiz_passed: nextPercent >= QUIZ_PASS_PERCENT,
          quiz_score: answeredRows.filter((a) => a.isCorrect).length,
          quiz_total: answeredRows.length,
        });
      } catch {
        setToast("تعذر حفظ نتيجة الاختبار الآن");
      }
      return;
    }

    setQuizCursor(nextCursor);
  }

  function previousQuizQuestion() {
    setQuizCursor((c) => Math.max(0, c - 1));
  }

  function restartQuiz() {
    setQuizCursor(0);
    setQuizAnswers([]);
    setSelectedQuizOption(null);
    setQuizLocked(false);
  }

  return (
    <div className="exercise-page-shell">
      <section className="exercise-hero-card card card-glow">
        <div className="exercise-hero-main">
          <span className="exercise-badge">{stageMeta.badge}</span>
          <h1 className="exercise-page-title">{title}</h1>
          <p className="exercise-page-subtitle">{stageMeta.subtitle}</p>
          {mode !== "quiz" && (
            <div className="exercise-meta-inline">
              <span className="pill pill-accent">المنجَز: {doneCount} / {totalCount}</span>
              <span className="pill">الخطوة الحالية: {stepLabels?.[stepLabel] || stepLabel}</span>
            </div>
          )}
        </div>

        <div className="exercise-hero-side">
          {topicId ? <div className="exercise-topic-chip">{topicId}</div> : null}
          <div className="exercise-progress-panel">
            <div className="exercise-progress-head">
              <span>{mode === "quiz" ? "تقدّم الاختبار" : "نسبة الإنجاز"}</span>
              <strong>
                {mode === "quiz"
                  ? `${Math.min(quizCursor + 1, quizOrder.length || quizCount)} / ${quizOrder.length || quizCount}`
                  : `${coveredPercent}%`}
              </strong>
            </div>
            <div className="exercise-progress-track">
              <div
                className="exercise-progress-fill"
                style={{
                  width:
                    mode === "quiz"
                      ? `${quizFinished ? 100 : quizOrder.length ? Math.max(8, Math.round(((quizCursor + 1) / quizOrder.length) * 100)) : 0}%`
                      : `${coveredPercent}%`,
                }}
              />
            </div>
            <div className="exercise-progress-caption">
              {mode === "quiz" ? "يظهر التصحيح التفصيلي بعد إنهاء جميع الأسئلة." : "أكمل الأمثلة المطلوبة لفتح المرحلة التالية."}
            </div>
          </div>
        </div>
      </section>

      <section className="exercise-stage-grid">
        <article className="card exercise-stage-card">
          <span className="exercise-stage-number">1</span>
          <strong>افهم المطلوب</strong>
          <p>اقرأ الجملة وحدد الكلمة المستهدفة قبل بدء القرار النحوي.</p>
        </article>
        <article className="card exercise-stage-card">
          <span className="exercise-stage-number">2</span>
          <strong>{mode === "quiz" ? "اختر الإجابة" : "اتبع المسار"}</strong>
          <p>{mode === "quiz" ? "اختر أفضل صياغة للإعراب النهائي." : "انتقل بين الأسئلة حتى تصل إلى الحكم الصحيح."}</p>
        </article>
        <article className="card exercise-stage-card">
          <span className="exercise-stage-number">3</span>
          <strong>{mode === "quiz" ? "راجع النتيجة" : "ثبّت الفهم"}</strong>
          <p>{mode === "quiz" ? "بعد النهاية ستراجع أداءك سؤالًا سؤالًا." : "استخدم التلميحات والتغذية الراجعة لتصحيح التفكير."}</p>
        </article>
      </section>

      {mode !== "quiz" && isDone && (
        <section className="exercise-complete-banner">
          <div>
            <strong>{mode === "learn" ? "اكتمل مسار التعلّم" : "اكتمل مسار التدرّب"}</strong>
            <p>{mode === "learn" ? "يمكنك الآن الانتقال إلى التدرّب أو إعادة الأمثلة للتثبيت." : "أنت جاهز للانتقال إلى الاختبار أو إعادة التدريب."}</p>
          </div>
          <button onClick={resetTraining} style={ghostBtn}>
            {mode === "learn" ? "إعادة التعلّم" : "إعادة التدرّب"}
          </button>
        </section>
      )}

      {quizFinished ? (
        <section className="exercise-panel exercise-quiz-summary" style={box}>
          <div className="exercise-summary-head">
            <div>
              <div className="exercise-summary-kicker">النتيجة النهائية</div>
              <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>انتهى الاختبار</div>
              <div style={{ opacity: 0.9 }}>نتيجتك: {quizScore} / {answeredQuizRows.length} ({quizPercent}%)</div>
            </div>
            <div className={`exercise-result-pill ${quizPercent >= QUIZ_PASS_PERCENT ? "is-pass" : "is-fail"}`}>
              {quizPercent >= QUIZ_PASS_PERCENT ? "نجاح" : "بحاجة إلى إعادة"}
            </div>
          </div>

          <div style={{ marginBottom: 12, opacity: 0.85 }}>معيار النجاح: {QUIZ_PASS_PERCENT}% أو أكثر</div>
          <div style={{ marginBottom: 14, opacity: 0.85 }}>ستجد تحت كل سؤال: إجابتك، ثم الإجابة الصحيحة، ثم سبب الخطأ أو سبب الصحة.</div>

          {canDownloadCertificate ? (
            <a href={`/certificate?topicId=${topicId}&level=${level}`} style={{ ...primaryNavBtn, display: "inline-flex", textDecoration: "none", marginBottom: 16 }}>
              تحميل الشهادة
            </a>
          ) : (
            <div className="exercise-practice-warning" style={{ marginBottom: 16 }}>الشهادة لا تُتاح إلا بعد النجاح بنسبة 80% فأكثر.</div>
          )}

          <div style={{ display: "grid", gap: 10 }}>
            {answeredQuizRows.map((a, idx) => (
              <div key={a.exampleId} className={`exercise-review-card ${a.isCorrect ? "is-correct" : "is-wrong"}`} style={{ padding: 12, border: "1px solid rgba(255,255,255,.12)", borderRadius: 16, background: a.isCorrect ? "rgba(34,197,94,.12)" : "rgba(251,146,60,.12)" }}>
                <div style={{ fontWeight: 800, marginBottom: 6 }}>السؤال {idx + 1}: {a.isCorrect ? "✅ صحيح" : "❌ خطأ"}</div>
                <div style={{ marginBottom: 6 }}>الجملة: <span style={{ fontSize: 18 }}>{renderSentence(a.sentence, a.target)}</span></div>
                <div style={{ marginBottom: 4 }}><strong>إجابتك:</strong> {a.actualLabel || "لم يختر إجابة"}</div>
                <div style={{ marginBottom: 4 }}><strong>الإجابة الصحيحة:</strong> {a.expectedLabel || a.expectedCoverage}</div>
                {!a.isCorrect && a.actualOptionReason && <div style={{ marginTop: 6, color: "#ffd5a8", lineHeight: 1.8 }}><strong>سبب خطأ اختيارك:</strong> {a.actualOptionReason}</div>}
                {!a.isCorrect && a.whyCorrect && <div style={{ marginTop: 6, color: "#b8ffd4", lineHeight: 1.8 }}><strong>سبب الصحة:</strong> {a.whyCorrect}</div>}
              </div>
            ))}
          </div>

          <button onClick={restartQuiz} style={ghostBtn}>إعادة الاختبار</button>
        </section>
      ) : mode === "quiz" ? (
        <>
          <section className="exercise-panel exercise-sentence-panel" style={box}>
            <div style={{ opacity: 0.6, marginBottom: 6 }}>السؤال {quizCursor + 1} من {quizOrder.length}</div>
            <div style={{ opacity: 0.6, marginBottom: 6 }}>الجملة:</div>
            <div className="exercise-sentence">{renderSentence((example as QuizExampleLike)?.sentence, (example as QuizExampleLike)?.target)}</div>
            <div style={{ fontSize: 18, lineHeight: 1.9, marginTop: 10 }}>{(example as QuizExampleLike)?.prompt ?? "ما الإعراب الصحيح للكلمة المحددة؟"}</div>
          </section>

          <section className="exercise-panel" style={box}>
            <div className="quiz-form-card-options">
              {quizOptions.map((option, idx) => (
                <button
                  key={`${option}-${idx}`}
                  onClick={() => {
                    setSelectedQuizOption(option);
                    setQuizLocked(true);
                  }}
                  className={`exercise-answer-btn quiz-form-option ${selectedQuizOption === option ? "is-selected" : ""}`}
                  style={{
                    ...answerBtn,
                    background: selectedQuizOption === option ? "rgba(47,158,158,.22)" : "rgba(255,255,255,.05)",
                    borderColor: selectedQuizOption === option ? "#2f9e9e" : "rgba(255,255,255,.14)",
                  }}
                >
                  <span className="quiz-option-dot">{idx + 1}</span>
                  <span>{option}</span>
                </button>
              ))}
            </div>

            <div className="quiz-form-actions">
              <button onClick={previousQuizQuestion} style={ghostBtn} disabled={quizCursor <= 0}>السابق</button>
              <button onClick={restartQuiz} style={ghostBtn}>إعادة</button>
              <button onClick={finalizeQuizExample} style={primaryNavBtn} disabled={!selectedQuizOption}>
                {quizCursor + 1 >= quizOrder.length ? "تسليم الاختبار" : "التالي"}
              </button>
            </div>
            <div className="quiz-form-helper">يمكنك تعديل اختيارك قبل الضغط على التالي. التصحيح يظهر بعد التسليم.</div>
          </section>
        </>
      ) : (
        <>
          <section className="exercise-panel exercise-sentence-panel" style={box}>
            <div style={{ opacity: 0.6, marginBottom: 6 }}>الجملة:</div>
            <div className="exercise-sentence">{renderSentence(state.currentSentence, state.currentTarget)}</div>
          </section>

          <section className="exercise-panel" style={box}>
            {node?.type === "question" ? (
              <>
                <div className="exercise-question-title">{node.text}</div>
                {mode === "learn" && node?.teaching_note && <div className="exercise-note-box">💡 {node.teaching_note}</div>}

                {node.answers.map((a: any) => {
                  const answerClass = [
                    "exercise-answer-btn",
                    mode === "learn" && feedback?.correctId === a.id ? "is-correct" : "",
                    feedback?.wrongId === a.id ? "is-wrong" : "",
                  ].filter(Boolean).join(" ");
                  return (
                    <button key={a.id} onClick={() => handlePick(a.id)} className={answerClass} style={answerBtn}>
                      {a.text}
                    </button>
                  );
                })}

                {mode === "learn" && <div className="exercise-inline-hint">💡 {(String(node?.id || "").includes("built_type") || String(node?.id || "").includes("mabniType")) ? builtNounSmartHint(state.currentTarget, "في محل الإعراب المطلوب") : node?.hint ?? ""}</div>}
                {mode === "practice" && feedback?.wrongId && <div className="exercise-inline-hint">💡 {feedback?.hint ?? node?.hint}</div>}
                {mode === "practice" && feedback?.wrongId && <div className="exercise-practice-warning">(تدرّب): يجب اختيار الإجابة الصحيحة حتى نكمل.</div>}
                <div className="exercise-question-nav">
                  <button type="button" onClick={() => setExampleIndex((i) => Math.max(0, i - 1))} style={ghostBtn}>السابق</button>
                  <button type="button" onClick={() => { setFeedback(null); setState(buildRunnerState(tree, mode, example)); }} style={ghostBtn}>إعادة</button>
                  <button type="button" onClick={() => setExampleIndex((i) => Math.min(examples.length - 1, i + 1))} style={ghostBtn}>التالي</button>
                </div>
              </>
            ) : node?.type === "result" ? (
              <>
                {mode === "learn" && node?.teaching_note && <div className="exercise-note-box">💡 {node.teaching_note}</div>}
                <div className="exercise-result-reason-box">
                  <strong>كيف وصلنا للإعراب؟</strong>
                  <span>اتبعنا أسئلة المسار الخاصة بالكلمة الهدف، ثم ثبتنا النوع والعلامة أو محل الإعراب. النتيجة الكاملة:</span>
                </div>
                <div className="exercise-result-text" style={{ whiteSpace: "pre-line" }}>{node.text}</div>

                {currentFollowUp ? (
                  <div className="exercise-followup-box" style={{ marginTop: 14, padding: 12, borderRadius: 14, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)" }}>
                    <div style={{ fontWeight: 900, marginBottom: 8 }}>تدريب تثبيت سريع: {currentFollowUp.question}</div>
                    {currentFollowUp.options.map((op) => {
                      const picked = followUpChoice === op.label;
                      const cls = picked ? (op.correct ? "is-correct" : "is-wrong") : "";
                      return (
                        <button
                          key={op.label}
                          onClick={() => pickFollowUp(op.label)}
                          className={`exercise-answer-btn ${cls}`}
                          style={{ ...answerBtn, background: picked ? (op.correct ? "rgba(34,197,94,.18)" : "rgba(239,68,68,.18)") : "rgba(255,255,255,.05)" }}
                        >
                          {op.label}
                        </button>
                      );
                    })}
                    {followUpChoice ? (
                      <div className="exercise-inline-hint" style={{ marginTop: 8 }}>
                        {chosenFollowUp?.correct ? "✅ " : "💡 "}{chosenFollowUp?.feedback || (chosenFollowUp?.correct ? "صحيح." : "راجع العلاقة النحوية في الجملة.")}
                      </div>
                    ) : (
                      <div className="exercise-inline-hint" style={{ marginTop: 8 }}>هذا السؤال لا يغيّر إعراب الكلمة الهدف؛ فقط يثبّت العلاقة النحوية في الجملة.</div>
                    )}
                    {mode === "practice" && followUpChoice && !followUpIsCorrect ? (
                      <div className="exercise-practice-warning">في التدرّب يجب اختيار الإجابة الصحيحة في التدريب السريع قبل الانتقال.</div>
                    ) : null}
                  </div>
                ) : null}

                <button
                  onClick={goNextExample}
                  style={{ ...ghostBtn, opacity: canMoveAfterResult ? 1 : 0.55, cursor: canMoveAfterResult ? "pointer" : "not-allowed" }}
                  disabled={!canMoveAfterResult}
                >
                  المثال التالي
                </button>
              </>
            ) : (
              <div>لا توجد عقدة للعرض</div>
            )}
          </section>

          <div className="exercise-bottom-nav" style={navNextWrap}>
            <button
                style={primaryNavBtn}
                onClick={() => {
                  const ready = mode === "learn" ? learnReady || coveredPercent >= 100 : practiceReady || coveredPercent >= 100;
                  if (!ready) {
                    setToast(mode === "learn" ? "أكمل التعلّم أولًا" : "أكمل التدرّب أولًا");
                    return;
                  }
                  window.location.href = `${stageMeta.nextHrefPrefix}${topicId}`;
                }}
              >
                {stageMeta.nextLabel}
              </button>
          </div>
        </>
      )}

      <ThinkingQA title="كيف أفكر في هذا الموضوع؟" items={getLearningQA(topicId, mode)} />

      {toast ? <div style={toastStyle}>{toast}</div> : null}
    </div>
  );
}

const box: React.CSSProperties = {
  padding: 16,
  border: "1px solid rgba(255,255,255,.12)",
  borderRadius: 18,
  marginBottom: 16,
  background: "linear-gradient(180deg, rgba(15,23,42,.88), rgba(15,23,42,.72))",
  color: "#eef4ff",
  boxShadow: "0 16px 40px rgba(0,0,0,.18)",
};

const answerBtn: React.CSSProperties = {
  display: "block",
  width: "100%",
  marginBottom: 8,
  padding: 12,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,.14)",
  textAlign: "right",
  cursor: "pointer",
  background: "rgba(255,255,255,.05)",
  color: "#eef4ff",
  fontWeight: 800,
};

const ghostBtn: React.CSSProperties = {
  marginTop: 12,
  padding: "10px 14px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,.18)",
  cursor: "pointer",
  background: "rgba(255,255,255,.06)",
  color: "#eef4ff",
  fontWeight: 800,
};

const navNextWrap: React.CSSProperties = {
  marginTop: 24,
  display: "flex",
  justifyContent: "center",
};

const primaryNavBtn: React.CSSProperties = {
  padding: "14px 22px",
  borderRadius: 14,
  border: "none",
  cursor: "pointer",
  fontWeight: 900,
  fontSize: 16,
  color: "#04111d",
  background: "linear-gradient(135deg,#22c55e,#67e8f9)",
  boxShadow: "0 10px 30px rgba(0,0,0,.12)",
};

const toastStyle: React.CSSProperties = {
  position: "fixed",
  bottom: 20,
  left: "50%",
  transform: "translateX(-50%)",
  background: "#0f172a",
  color: "#fff",
  padding: "10px 16px",
  borderRadius: 12,
  zIndex: 999,
  fontWeight: 800,
  boxShadow: "0 10px 30px rgba(0,0,0,.25)",
};
