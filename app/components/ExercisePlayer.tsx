"use client";

import React from "react";
import { useRouter } from "next/navigation";
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

type StepReviewState = {
  answerText: string;
  resultText: string;
  reason: string;
  summary: string;
  nextState: any;
  isFinal: boolean;
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
  const uncoveredKeys = orderedKeys.filter((k) => !covered[k]);
  if (!examples.length) return currentIndex;
  if (!uncoveredKeys.length) return examples.length > 1 ? (currentIndex + 1) % examples.length : currentIndex;

  // لا نرتب الأمثلة حسب أول عقدة فقط؛ نختار عشوائيًا من أي مثال يغطي عقدة غير منجزة،
  // حتى يشعر الطالب أن الأمثلة تتنوع مع بقاء التغطية الحقيقية للعقد محفوظة.
  const candidates = examples
    .map((ex, idx) => ({ idx, keys: getExampleCoverageKeys(ex) }))
    .filter((item) => item.idx !== currentIndex && item.keys.some((key) => uncoveredKeys.includes(key)));

  const pool = candidates.length
    ? candidates
    : examples
        .map((ex, idx) => ({ idx, keys: getExampleCoverageKeys(ex) }))
        .filter((item) => item.idx !== currentIndex && item.keys.some((key) => uncoveredKeys.includes(key)));

  if (!pool.length) {
    if (examples.length <= 1) return currentIndex;
    return (currentIndex + 1) % examples.length;
  }
  const picked = pool[Math.floor(Math.random() * pool.length)].idx;
  if (picked === currentIndex && examples.length > 1) return (currentIndex + 1) % examples.length;
  return picked;
}

function buildRunnerState(tree: any, mode: Mode, example: any) {
  const treeStart = tree?.startNodeId;
  const startNodeId = example?.facts?.hasKaffa ? "inna_kaffa_effect" : treeStart;
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
  if (!target) return sentence;
  let shownTarget = target;
  let idx = sentence.indexOf(shownTarget);
  if (idx < 0) {
    const m = String(target).match(/\(([^)]+)\)/);
    if (m?.[1] && sentence.includes(m[1])) {
      shownTarget = m[1];
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

function getStageMeta(mode: Mode) {
  if (mode === "learn") {
    return {
      badge: "تعلّم خطوة بخطوة",
      subtitle: "رحلة مقسّمة إلى مهارات قصيرة؛ اقرأ نتيجة كل خطوة وسببها قبل الانتقال.",
      nextLabel: "انتقل إلى تحدي المهارة →",
      nextHrefPrefix: "/train/",
    };
  }
  if (mode === "practice") {
    return {
      badge: "تحدي المهارة",
      subtitle: "تدرّب بطريقة أخف وأكثر متعة، واجمع التعزيز قبل الاختبار.",
      nextLabel: "اختبر نفسي وأحصل على شهادة →",
      nextHrefPrefix: "/quiz/",
    };
  }
  return {
    badge: "اختبر نفسي",
    subtitle: "اختبار نهائي بلا تلميحات؛ النجاح يفتح شهادة الإنجاز.",
    nextLabel: "",
    nextHrefPrefix: "",
  };
}


function extractTopicName(title?: string) {
  const raw = String(title || "").split("—")[0].trim();
  return raw || "الموضوع";
}

function stageLearningTitle(stageBadge: string, title?: string) {
  const topic = extractTopicName(title);
  if (stageBadge === "اختبر نفسي") return `اختبر نفسي في ${topic}`;
  if (stageBadge === "تحدي المهارة") return `تحدي المهارة في ${topic}`;
  return `تعلّم ${topic} خطوة بخطوة`;
}

function i3rabTokensFromDraft(draft: string) {
  const clean = String(draft || "").trim();
  if (!clean || clean.includes("ابدأ")) return [];
  return clean.split(/\s+/).filter(Boolean);
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

function normalizeQuizAnswerLabel(text?: string | null) {
  return firstLine(String(text || ""))
    .replace(/[\u064B-\u0652\u0670]/g, "")
    .replace(/[ـ]/g, "")
    .replace(/[،؛:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isSameQuizAnswer(a?: string | null, b?: string | null) {
  const aa = normalizeQuizAnswerLabel(a);
  const bb = normalizeQuizAnswerLabel(b);
  return Boolean(aa && bb && aa === bb);
}

function optionReasonForLabel(reasons: Record<string, string> | undefined, label?: string | null) {
  if (!label || !reasons) return undefined;
  if (reasons[label]) return reasons[label];
  const match = Object.keys(reasons).find((key) => isSameQuizAnswer(key, label));
  return match ? reasons[match] : undefined;
}

function exampleFinalLabel(example: any) {
  // في الاختبار النهائي يجب اعتماد صياغة الإعراب النهائية نفسها، لا مفتاح التغطية العام.
  // هذا يمنع أن تظهر الإجابة الصحيحة مثل: "التوكيد" بدل الإعراب الكامل.
  return firstLine(example?.correctI3rab || example?.facts?.finalI3rab || "");
}

function shortStudentText(text?: string, fallback = "جرّب مرة أخرى.") {
  const clean = firstLine(text).replace(/^💡\s*/, "").trim();
  if (!clean) return fallback;
  return clean.length > 72 ? `${clean.slice(0, 69)}...` : clean;
}


const SMART_GLOSSARY: Record<string, { title: string; body: string[] }> = {
  "حروف العلة": { title: "حروف العلة", body: ["الألف، الواو، الياء.", "ننظر إليها عند آخر الكلمة لتحديد: تعذر، ثقل، أو حذف حرف العلة."] },
  "الأسماء الخمسة": { title: "الأسماء الخمسة", body: ["أب، أخ، حم، فو، ذو بمعنى صاحب.", "تعرب بالحروف إذا كانت مفردة، مضافة، غير مضافة إلى ياء المتكلم.", "ترفع بالواو، وتنصب بالألف، وتجر بالياء."] },
  "الأفعال الخمسة": { title: "الأفعال الخمسة", body: ["أفعال مضارعة اتصلت بألف الاثنين أو واو الجماعة أو ياء المخاطبة.", "أوزانها: يفعلان، تفعلان، يفعلون، تفعلون، تفعلين.", "ترفع بثبوت النون، وتنصب وتجزم بحذف النون."] },
  "اسم منقوص": { title: "الاسم المنقوص", body: ["اسم معرب آخره ياء لازمة مكسور ما قبلها، مثل: القاضي، الساعي.", "تظهر الفتحة في النصب، وتقدر الضمة والكسرة في الرفع والجر."] },
  "اسم مقصور": { title: "الاسم المقصور", body: ["اسم معرب آخره ألف لازمة، مثل: الفتى، العصا.", "تقدر عليه الحركات الثلاث للتعذر."] },
  "واو الجماعة": { title: "واو الجماعة", body: ["ضمير متصل يدل على جماعة الذكور.", "يكون في محل رفع فاعل إذا اتصل بالفعل."] },
  "ألف الاثنين": { title: "ألف الاثنين", body: ["ضمير متصل يدل على مثنى.", "يكون في محل رفع فاعل إذا اتصل بالفعل."] },
  "ياء المخاطبة": { title: "ياء المخاطبة", body: ["ضمير متصل يدل على المخاطبة المؤنثة.", "مع المضارع والأمر تكون في محل رفع فاعل."] },
  "نون النسوة": { title: "نون النسوة", body: ["ضمير متصل يدل على مجموعة مؤنثة.", "مثل: يكتبْنَ، يدرسْنَ، ينجحْنَ.", "إذا اتصلت بالفعل المضارع حسمت البناء مباشرة، فلا نفحص الرفع أو النصب أو الجزم."] },
  "ضمير رفع متحرك": { title: "ضمير رفع متحرك", body: ["مثل: تُ، تَ، تِ، نا، تم، تما.", "إذا اتصل بالفعل الماضي بُني الفعل على السكون."] },
  "ضمير متصل": { title: "الضمير المتصل", body: ["ضمير لا يستقل بنفسه ويتصل بكلمة قبله.", "قد يكون في محل رفع أو نصب أو جر بحسب موقعه."] },
  "ضمير منفصل": { title: "الضمير المنفصل", body: ["ضمير يستقل في النطق والكتابة، مثل: أنا، أنت، هو.", "غالبًا يُعرب مبنيًا في محل رفع مبتدأ إذا بدأ به الكلام."] },
  "شبه جملة": { title: "شبه الجملة", body: ["جار ومجرور أو ظرف.", "قد تأتي خبرًا إذا أتمت معنى المبتدأ."] },
  "الجملة الاسمية": { title: "الجملة الاسمية", body: ["تبدأ غالبًا باسم وتتكون أساسًا من مبتدأ وخبر."] },
  "الجملة الفعلية": { title: "الجملة الفعلية", body: ["تبدأ غالبًا بفعل، وتحتاج إلى فاعل، وقد تحتاج إلى مفعول به."] },
  "أداة نصب": { title: "أداة النصب", body: ["من أدوات النصب: لن، أن، كي.", "إذا سبقت المضارع جعلته منصوبًا."] },
  "أداة جزم": { title: "أداة الجزم", body: ["من أدوات الجزم: لم، لا الناهية، لام الأمر.", "إذا سبقت المضارع جعلته مجزومًا."] },
  "مصدر مؤول": { title: "المصدر المؤول", body: ["تركيب مثل: أن + فعل مضارع.", "يؤوّل بمصدر صريح ويعامل معاملة الاسم."] },
  "اسم إشارة": { title: "اسم الإشارة", body: ["مثل: هذا، هذه، هؤلاء.", "غالبًا مبني ويعرب في محل بحسب موقعه."] },
  "اسم موصول": { title: "الاسم الموصول", body: ["مثل: الذي، التي، الذين.", "يحتاج صلة بعده ويعرب مبنيًا في محل بحسب موقعه."] },
  "الفعل الماضي": { title: "الفعل الماضي", body: ["يدل على حدث وقع وانتهى قبل زمن الكلام.", "يميزه قبول تاء الفاعل أو تاء التأنيث غالبًا، وهو مبني دائمًا."] },
  "الفعل المضارع": { title: "الفعل المضارع", body: ["يدل على الحاضر أو المستقبل.", "يبدأ غالبًا بأحد أحرف: أ، ن، ي، ت، ويتأثر بأدوات النصب والجزم."] },
  "فعل الأمر": { title: "فعل الأمر", body: ["يدل على طلب حدوث الفعل.", "يبنى على ما يجزم به مضارعه: السكون، حذف حرف العلة، أو حذف النون."] },
  "المبتدأ": { title: "المبتدأ", body: ["اسم مرفوع نبدأ به غالبًا لنتحدث عنه.", "قد يكون معربًا أو مبنيًا في محل رفع."] },
  "الخبر": { title: "الخبر", body: ["يتمّم معنى المبتدأ ويخبر عنه.", "قد يكون مفردًا أو جملة أو شبه جملة."] },
  "الفاعل": { title: "الفاعل", body: ["اسم يدل على من قام بالفعل أو اتصف به.", "حكمه الرفع، وقد يكون ظاهرًا أو ضميرًا مستترًا أو متصلًا."] },
  "المفعول به": { title: "المفعول به", body: ["اسم وقع عليه فعل الفاعل.", "حكمه النصب، وقد يكون اسمًا ظاهرًا أو ضميرًا."] },
  "كان وأخواتها": { title: "كان وأخواتها", body: ["تدخل على الجملة الاسمية.", "ترفع الاسم ويسمى اسمها، وتنصب الخبر ويسمى خبرها."] },
  "إن وأخواتها": { title: "إن وأخواتها", body: ["تدخل على الجملة الاسمية.", "تنصب الاسم ويسمى اسمها، وترفع الخبر ويسمى خبرها."] },
  "الاسم المعرب": { title: "الاسم المعرب", body: ["يتغير ضبط آخره أو علامته بتغير موقعه في الجملة.", "مثل: طالبٌ، طالبًا، طالبٍ."] },
  "الاسم المبني": { title: "الاسم المبني", body: ["لا يتغير آخره بتغير موقعه.", "يعرب في محل رفع أو نصب أو جر حسب موقعه."] },
  "الأسماء المبنية": { title: "الأسماء المبنية", body: ["مثل الضمائر، أسماء الإشارة، الأسماء الموصولة، أسماء الاستفهام والشرط.", "لا نقول مرفوع بالضمة، بل نقول: مبني في محل رفع/نصب/جر."] },
  "علامة أصلية": { title: "العلامة الأصلية", body: ["الضمة للرفع، الفتحة للنصب، الكسرة للجر، السكون للجزم."] },
  "علامة فرعية": { title: "العلامة الفرعية", body: ["مثل الواو والألف والياء وثبوت النون وحذف النون وحذف حرف العلة.", "تظهر في أبواب مخصوصة مثل المثنى والجمع والأسماء الخمسة والأفعال الخمسة."] },
  "أدوات النصب": { title: "أدوات النصب", body: ["منها: لن، أن، كي.", "إذا دخلت على الفعل المضارع جعلته منصوبًا."] },
  "أدوات الجزم": { title: "أدوات الجزم", body: ["منها: لم، لا الناهية، لام الأمر.", "إذا دخلت على الفعل المضارع جعلته مجزومًا."] },

};

function renderSmartText(text?: string, onTerm?: (term: string) => void) {
  if (!text) return null;
  const terms = Object.keys(SMART_GLOSSARY).sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`(?<![\\p{L}\\p{M}])(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})(?![\\p{L}\\p{M}])`, "gu");
  const parts = String(text).split(pattern);
  return parts.map((part, idx) => {
    if (SMART_GLOSSARY[part]) {
      return (
        <button key={`${part}-${idx}`} type="button" className="smart-term" onClick={() => onTerm?.(part)}>
          {part}
        </button>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}


function answerTextFor(tree: any, nodeId: string, answerId: string) {
  const n = tree?.nodes?.[nodeId];
  if (!n || n.type !== "question") return "";
  return String(n.answers?.find((a: any) => a.id === answerId)?.text || "");
}

function normalizeBuildPiece(text: string, nodeId = "") {
  const t = String(text || "");
  const id = String(nodeId || "");
  if (!t || /تحديد|فحص|القرار|الخطوة|مباشرة|دائمًا|نوع الخبر/.test(t)) return "";

  if (id.includes("tense") || id.includes("past") || id.includes("present") || id.includes("imperative")) {
    if (t.includes("مضارع")) return "فعل مضارع";
    if (t.includes("ماض")) return "فعل ماضٍ";
    if (t.includes("أمر")) return "فعل أمر";
  }
  if (id.includes("tool") || id.includes("has_tool")) {
    if (t.includes("جزم")) return "مجزوم";
    if (t.includes("نصب")) return "منصوب";
    if (t.includes("لم يسبق")) return "مرفوع";
  }
  if (/raf3|nasb|jazm/.test(id)) {
    if (/واو الجماعة|ياء المخاطبة|ألف الاثنين|نعم/.test(t)) {
      if (id.includes("jazm")) return "علامة جزمه حذف النون";
      if (id.includes("nasb")) return "علامة نصبه حذف النون";
      if (id.includes("raf3")) return "علامة رفعه ثبوت النون";
      return "من الأفعال الخمسة";
    }
    if (t === "لا") return "ليس من الأفعال الخمسة";
  }
  if (t.includes("حذف النون")) return "وعلامة إعرابه حذف النون";
  if (t.includes("ثبوت النون")) return "وعلامة رفعه ثبوت النون";
  if (t.includes("حذف حرف العلة")) return "وعلامته حذف حرف العلة";
  if (t.includes("الضمة")) return "وعلامته الضمة";
  if (t.includes("الفتحة")) return "وعلامته الفتحة";
  if (t.includes("الكسرة")) return "وعلامته الكسرة";
  if (t.includes("السكون")) return "مبني على السكون";
  if (t.includes("مبتدأ")) return "مبتدأ";
  if (t.includes("خبر")) return "خبر";
  if (t.includes("فاعل")) return "فاعل";
  if (t.includes("مفعول")) return "مفعول به";
  if (t.includes("نعت")) return "نعت";
  if (t.includes("معطوف")) return "معطوف";
  if (t.includes("توكيد")) return "توكيد";
  if (t.includes("بدل")) return "بدل";
  if (t.includes("تابع")) return "تابع";
  if (t.includes("اسم كان")) return "اسم كان";
  if (t.includes("خبر كان")) return "خبر كان";
  if (t.includes("اسم إن")) return "اسم إن";
  if (t.includes("خبر إن")) return "خبر إن";
  if (t.includes("اسم إشارة")) return "اسم إشارة مبني";
  if (t.includes("اسم موصول")) return "اسم موصول مبني";
  if (t.includes("ضمير")) return "ضمير مبني";
  if (t.includes("اسم")) return "اسم";
  if (t.includes("فعل")) return "فعل";
  return t.length <= 28 ? t : "";
}

function buildI3rabDraft(tree: any, state: any, target?: string) {
  const pieces: string[] = [];
  const add = (piece: string) => {
    if (!piece) return;
    const generic = ["فعل", "اسم"];
    if (generic.includes(piece) && pieces.some((p) => p.startsWith(piece + " "))) return;
    if (piece.startsWith("فعل ")) {
      const i = pieces.findIndex((p) => p === "فعل" || p.startsWith("فعل "));
      if (i >= 0) pieces[i] = piece; else pieces.push(piece);
      return;
    }
    if (["مرفوع", "منصوب", "مجزوم"].includes(piece)) {
      const i = pieces.findIndex((p) => ["مرفوع", "منصوب", "مجزوم"].includes(p));
      if (i >= 0) pieces[i] = piece; else pieces.push(piece);
      return;
    }
    if (!pieces.includes(piece)) pieces.push(piece);
  };
  Object.entries(state?.answers || {}).forEach(([nodeId, answerId]) => {
    add(normalizeBuildPiece(answerTextFor(tree, nodeId, String(answerId)), nodeId));
  });
  const phrase = pieces.join(" ").replace(/\s+/g, " ").trim();
  return phrase || "ابدأ بتحديد نوع الكلمة";
}


function getCompletedAlgorithmCards(tree: any, state: any) {
  const nodes = tree?.nodes || {};
  return Object.entries(state?.answers || {}).map(([nodeId, answerId], idx) => {
    const originalNode = nodes[nodeId as string];
    const normalizedNode = normalizeThinkingNode(originalNode, state);
    const picked = originalNode?.answers?.find((a: any) => a.id === answerId) || normalizedNode?.answers?.find((a: any) => a.id === answerId);
    return {
      index: idx + 1,
      nodeId,
      question: dialogueQuestionText(normalizedNode, state?.currentTarget, "learn", state, tree),
      answer: String(picked?.text || answerTextFor(tree, String(nodeId), String(answerId)) || "الإجابة المختارة"),
      result: answerEffectLabel(normalizedNode, picked, state) || normalizeBuildPiece(String(picked?.text || ""), String(nodeId)) || String(picked?.text || ""),
    };
  });
}


function correctAnswerForNode(node: any, facts: Record<string, any> = {}) {
  if (!node || node.type !== "question") return null;
  return (node.answers || []).find((answer: any) => {
    if (answer.eval) {
      const factValue = facts?.[answer.eval.fact];
      if (Array.isArray(answer.eval.anyOf)) return answer.eval.anyOf.includes(factValue);
      if (Object.prototype.hasOwnProperty.call(answer.eval, "notEquals")) return factValue !== answer.eval.notEquals;
      return factValue === answer.eval.equals;
    }
    return Boolean(answer.correct);
  }) || null;
}

function countRemainingQuestionsOnCorrectPath(tree: any, state: any) {
  const nodes = tree?.nodes || {};
  const facts = state?.facts || {};
  let nodeId = state?.currentNodeId;
  let count = 0;
  const visited = new Set<string>();

  while (nodeId && !visited.has(String(nodeId))) {
    visited.add(String(nodeId));
    const node = nodes[nodeId];
    if (!node || node.type === "result") break;
    if (node.type !== "question") break;
    count += 1;
    const answer = correctAnswerForNode(node, facts) as any;
    nodeId = answer?.nextByFact
      ? answer.nextByFact.map?.[String(facts?.[answer.nextByFact.fact])] || answer.nextByFact.default || answer.next
      : answer?.next || answer?.to || answer?.nextNodeId;
  }

  return Math.max(0, count);
}

function buildStageProgressMeta(tree: any, state: any) {
  const answered = Object.keys(state?.answers || {}).length;
  const remaining = countRemainingQuestionsOnCorrectPath(tree, state);
  const total = Math.max(1, answered + remaining);
  const atResult = tree?.nodes?.[state?.currentNodeId]?.type === "result";
  const current = atResult ? total : Math.min(total, answered + 1);
  const completedPercent = Math.round((answered / total) * 100);
  return {
    answered,
    remaining,
    total,
    current,
    completedPercent,
    atResult,
  };
}

function buildStageTrailItems(cards: ReturnType<typeof getCompletedAlgorithmCards>) {
  return cards
    .map((card) => String(card.result || card.answer || "").trim())
    .filter(Boolean)
    .slice(-6);
}

function isPresentBuiltResult(tree: any, node: any) {
  const start = String(tree?.startNodeId || "");
  const id = String(node?.id || "");
  const text = String(node?.text || "");
  return start.includes("present") && (id.includes("binaa") || text.includes("مبني"));
}

function presentBuiltClosureNote(node: any) {
  const text = String(node?.text || "");
  if (!text.includes("مبني")) return "";
  if (text.includes("نون النسوة")) {
    return "لأن الفعل المضارع اتصل بنون النسوة فقد خرج من مسار الإعراب إلى البناء؛ لذلك لا نبحث بعد ذلك عن ناصب أو جازم أو رفع.";
  }
  if (text.includes("نون التوكيد")) {
    return "لأن الفعل المضارع اتصل بنون التوكيد فقد حُسم الحكم بالبناء؛ لذلك لا ننتقل إلى فحص أدوات النصب أو الجزم.";
  }
  return "عندما تظهر علامة بناء في الفعل المضارع نغلق مسار الإعراب ونصل مباشرة إلى الحكم النهائي.";
}

function ProgressDots({ total, done, current }: { total: number; done: number; current?: number }) {
  const safeTotal = Math.max(1, Math.min(total || 1, 32));
  return (
    <div className="progress-dots" aria-label="تقدم الأمثلة">
      {Array.from({ length: safeTotal }).map((_, i) => {
        const cls = i < done ? "is-done" : i === current ? "is-current" : "";
        return <span key={i} className={cls} title={`خطوة ${i + 1}`} />;
      })}
    </div>
  );
}

function getNodeContext(node: any, state: any) {
  if (node?.context) return node.context;
  const id = String(node?.id || "");
  if (id.includes("tense")) return "عرفنا أن الكلمة فعل.";
  if (id.includes("has_tool") || id.includes("check_attached") || id.includes("ending") || id.includes("weak_type")) return "ننتقل خطوة خطوة قبل الوصول إلى الإعراب النهائي.";
  if (id.includes("pronoun")) return "عرفنا نوع الفعل، ونفحص الآن أثر الضمير في علامة البناء.";
  return "اتبع القرار التالي فقط.";
}


function currentStepIntro(node: any, tokens: string[] = []) {
  const id = String(node?.id || "");
  if (id === "past_word_kind") return "نبدأ من نوع الكلمة";
  if (id === "past_tense") return "عرفنا أنه فعل";
  if (id === "past_has_attachment") return "بما أنه فعل ماضٍ، فلنحدد علامة البناء";
  if (id === "past_connector_kind") return "عرفنا أن آخر الفعل اتصل به شيء";
  if (id === "past_raf3_type") return "عرفنا أنه ضمير رفع";
  if (id === "past_sukoon_raf3_type") return "عرفنا أن البناء سيكون على السكون";
  if (id.startsWith("past_weak") || id.startsWith("past_deleted")) return "نحدد الحرف المحذوف بالإسناد إلى هو";
  if (id === "past_no_attachment_weak") return "لم يتصل بالفعل شيء، فننظر إلى آخره";
  if (id === "past_nasb_weak") return "ضمير النصب لا يغيّر البناء، فننظر إلى أصل الفعل";
  if (id === "past_taa_weak") return "تاء التأنيث لا تغيّر البناء، ونفحص الحذف إن وُجد";
  if (id === "present_word_kind") return "نبدأ من نوع الكلمة";
  if (id === "present_tense") return "عرفنا أنها فعل";
  if (id === "present_build_check") return "عرفنا أنه فعل مضارع";
  if (id === "present_tool_presence") return "عرفنا أنه معرب";
  if (id.includes("_shape")) return "نحدد صورته لنعرف العلامة";
  if (id.includes("weak_letter")) return "نحدد حرف العلة";
  if (id.includes("present") || id.includes("binaa")) return "نكمل مسار المضارع";
  if (id.includes("attached")) return "ننتبه إلى ما اتصل بآخر الكلمة";
  if ((id.includes("ending") || id.includes("weak")) && !id.includes("kana")) return "نكمل التفكير بسؤال عن آخر الفعل";
  if (id.includes("tense")) return "نبدأ بتحديد زمن الفعل";
  if (id.includes("wordType") || id === "start") return "نبدأ من نوع الكلمة";
  if (id.includes("khabar") || id.includes("mubtada") || id.includes("nounKind")) return "نكمل التفكير بموقع الاسم";
  return "نكمل التفكير بسؤال واحد";
}

function cleanQuestionText(node: any) {
  const id = String(node?.id || "");
  const text = String(node?.text || "ماذا نلاحظ؟");
  if (id.startsWith("past_")) return text;
  if (id === "present_step_1") return "ماذا نتحقق أولًا؟";
  if (id === "present_tense") return "ما زمن الفعل؟";
  if (id === "present_tool") return "هل نفحص ما قبل الفعل؟";
  if (id === "present_has_tool") return "هل سبق الفعل عامل نصب أو جزم؟";
  if (id.includes("five")) return "هل الفعل من الأفعال الخمسة؟";
  if (id.includes("attached")) return "ما علاقة الضمير أو الحرف بآخر الكلمة؟";
  if (id.includes("ending")) return "ما حالة آخر الكلمة؟";
  if (id.includes("weak")) return "ما حرف العلة في آخره؟";
  if (id === "wordType") return "هل الكلمة اسم أم فعل أم حرف؟";
  if (id === "nounKind" || id === "khabar_single_start") return "هل الاسم معرب أم مبني أم مصدر مؤول؟";
  if (id === "khabar_single_number" || id === "i3rabNumber") return "هل الاسم مفرد أم مثنى أم جمع؟";
  if (text === "ماذا نتحقق الآن؟" || text === "ماذا نتحقق الآن؟") return "ماذا نلاحظ في هذا المثال؟";
  return text;
}


function makeDecisionHint(answerText?: string, nodeText?: string) {
  const a = String(answerText || "");
  const q = String(nodeText || "");
  if (a.includes("اسم") && q.includes("نوع الكلمة")) return "تذكّر: الاسم يقبل الجر أو التنوين غالبًا.";
  if (a.includes("فعل") && q.includes("نوع الكلمة")) return "تذكّر: الفعل يدل على حدث وزمن.";
  if (a.includes("ماض")) return "الفعل الماضي يقبل تاء الفاعل أو تاء التأنيث غالبًا.";
  if (a.includes("مضارع")) return "الفعل المضارع يبدأ غالبًا بأحد أحرف: أ، ن، ي، ت.";
  if (a.includes("واو الجماعة") && q.includes("اتصل")) return "انتبه: قد تكون الواو أصلية من الفعل وليست ضميرًا. واو الجماعة تظهر غالبًا مع ألف التفريق في مثل: لم يكتبوا.";
  if (a.includes("العلامة") || a.includes("مباشرة")) return "لا نقفز للعلامة قبل تحديد الحالة والسبب.";
  if (a.includes("الخبر")) return "الخبر يخص الجملة الاسمية، وليس هذه الخطوة.";
  if (a.includes("الفاعل")) return "نحدد نوع الكلمة والزمن أو الموقع أولًا.";
  if (a.includes("دائم")) return "لا توجد حالة دائمة؛ الأداة والاتصال يغيّران القرار.";
  if (q.includes("اسم مبني") || a.includes("معرب")) return "اسأل: هل تتغير حركة آخر الكلمة أم هي ثابتة؟";
  if (q.includes("آخر") || a.includes("معتل")) return "انظر إلى آخر الكلمة فقط، ولا تقفز للإعراب النهائي.";
  return "انظر إلى العنصر المؤثر في المثال نفسه، ثم اختر ما يناسب هذه الخطوة.";
}



function stripArabicMarksForKana(s: string) {
  return String(s || "").replace(/[\u064B-\u065F\u0670]/g, "").replace(/[،.؟]/g, "").trim();
}

function kanaNasikhPrompt(sentence: string) {
  const t = stripArabicMarksForKana(sentence);
  if (t.includes("ما انفكوا")) return "من الذين";
  if (t.includes("ما برحا")) return "من اللذان";
  if (t.includes("ما زالت") || t.includes("ليست")) return "من التي";
  if (t.includes("أصبحن")) return "من اللواتي";
  return "من الذي";
}

function kanaNasikhVerb(sentence: string) {
  const t = stripArabicMarksForKana(sentence);
  if (t.includes("ما زالت")) return "ما زالت";
  if (t.includes("ما زال")) return "ما زال";
  if (t.includes("ما انفكوا")) return "ما انفكوا";
  if (t.includes("ما برحا")) return "ما برحا";
  if (t.includes("أصبحن")) return "أصبحن";
  if (t.includes("أصبحت")) return "أصبحت";
  if (t.includes("أصبح")) return "أصبح";
  if (t.includes("ليست")) return "ليست";
  if (t.includes("ليس")) return "ليس";
  if (t.includes("صار")) return "صار";
  if (t.includes("أمسى")) return "أمسى";
  if (t.includes("بات")) return "بات";
  if (t.includes("ظل")) return "ظل";
  if (t.includes("كانت")) return "كانت";
  if (t.includes("كنت")) return "كنت";
  if (t.includes("كنا")) return "كنا";
  if (t.includes("كان")) return "كان";
  return "الفعل الناسخ";
}


function kanaCleanWord(value: string) {
  return stripArabicMarksForKana(value || "").replace(/[«».,،؛؟!]/g, "").trim();
}

function kanaIncludes(sentence: string, phrase: string) {
  return kanaCleanWord(sentence).includes(kanaCleanWord(phrase));
}

function kanaSubjectFromSentence(sentence: string, target: string) {
  const targetClean = kanaCleanWord(target);
  const known = [
    "أبوك", "أخوك", "المحاسبون", "الطالبات", "اللاعبات", "المعلمون", "المعلمان", "الطالبان", "الوزيران", "المزارع", "الطريق", "العامل", "الكتاب", "الشارع", "الملعب", "طموحي", "الطالب", "الفتى", "الماء", "الجو", "الطفل", "مهند", "أسماء", "أختي", "الناس"
  ].sort((a, b) => kanaCleanWord(b).length - kanaCleanWord(a).length);
  for (const k of known) {
    if (kanaIncludes(sentence, k) && targetClean !== kanaCleanWord(k)) return k;
  }
  // fallback: اختر الاسم الظاهر بعد الناسخ أو قبله في الجملة، لا عبارة تعريفية عامة.
  const clean = kanaCleanWord(sentence);
  const words = clean.split(/\s+/).filter(Boolean);
  const nasikhWords = ["كان", "كانت", "كنت", "أصبح", "أصبحت", "صار", "أمسى", "بات", "ظل", "ليس", "ليست", "زال"];
  const idx = words.findIndex(w => nasikhWords.includes(w));
  if (idx >= 0 && words[idx + 1] && kanaCleanWord(words[idx + 1]) !== targetClean) return words[idx + 1];
  if (words[0] && kanaCleanWord(words[0]) !== targetClean) return words[0];
  return "الاسم الذي تتحدث عنه الجملة";
}

function kanaKhabarFromSentence(sentence: string, target: string) {
  const targetClean = kanaCleanWord(target);
  const known = [
    "كريمًا", "كريما", "أمرًا جيدًا", "أمرا جيدا", "حاضرين", "حاضرًا", "حاضرا", "نشيطًا", "نشيطا", "بخارًا", "بخارا", "معتدلًا", "معتدلا", "مزدحمًا", "مزدحما", "مطمئنًا", "مطمئنا", "مبرمجًا", "مبرمجا", "متسرعة", "ماهرات", "مخلصين", "مجتهدات", "حارًّا", "حارا", "واضحًا", "واضحا", "في الحقيبة", "عند المدير", "في السوق", "يقرأ", "يعمل", "أن أتميز", "أن تتجاهل الناس", "أطرافه ممتدة", "لونه باهتا"
  ];
  for (const k of known) {
    if (kanaIncludes(sentence, k) && targetClean !== kanaCleanWord(k)) return k;
  }
  const words = kanaCleanWord(sentence).split(/\s+/).filter(Boolean);
  const targetIndex = words.findIndex(w => kanaCleanWord(w) === targetClean);
  if (targetIndex >= 0 && words[targetIndex + 1]) return words.slice(targetIndex + 1).join(" ");
  return "الكلمة التي أتمت المعنى";
}

function kanaKhabarRelationLabel(target: string, subject: string) {
  return `أتمَّت (${target}) معنى الجملة عن (${subject})`;
}

function kanaNasikhSubjectChoice(nasikh: string) {
  if (nasikh.includes("ليس")) return "هو الشيء الذي ليس";
  if (nasikh.includes("أصبح")) return "هو الذي أصبح";
  if (nasikh.includes("صار")) return "هو الذي صار";
  if (nasikh.includes("أمسى")) return "هو الذي أمسى";
  if (nasikh.includes("ما زال") || nasikh.includes("زال")) return "هو الذي ما زال";
  if (nasikh.includes("كان")) return "هو الذي كان";
  return `هو صاحب معنى (${nasikh})`;
}

function kanaNasikhSubjectQuestion(nasikh: string, khabar: string) {
  if (nasikh.includes("ليس")) {
    return khabar && khabar !== "الكلمة التي أتمت المعنى"
      ? `ما الشيء الذي ليس ${khabar}؟ اختر الإجابة الصحيحة مما يلي:`
      : "ما الشيء الذي ليس؟ اختر الإجابة الصحيحة مما يلي:";
  }
  if (nasikh.includes("أصبح")) return "من الذي أصبح؟ اختر الإجابة الصحيحة مما يلي:";
  if (nasikh.includes("صار")) return "ما الذي صار؟ اختر الإجابة الصحيحة مما يلي:";
  if (nasikh.includes("أمسى")) return "ما الذي أمسى؟ اختر الإجابة الصحيحة مما يلي:";
  if (nasikh.includes("ما انفكوا")) return "من الذين ما انفكوا يتناوبون على العمل؟ اختر الإجابة الصحيحة مما يلي:";
  if (nasikh.includes("ما برحا")) return "من اللذان ما برحا؟ اختر الإجابة الصحيحة مما يلي:";
  if (nasikh.includes("ما زال") || nasikh.includes("زال")) return "من الذي ما زال؟ اختر الإجابة الصحيحة مما يلي:";
  if (nasikh.includes("كان")) return "من الذي كان؟ اختر الإجابة الصحيحة مما يلي:";
  return `${kanaNasikhPrompt(nasikh)} ${nasikh}؟ اختر الإجابة الصحيحة مما يلي:`;
}

function kanaNasikhFinalIntro(state: any) {
  const sentence = String(state?.currentSentence || "");
  const nasikh = kanaNasikhVerb(sentence);
  if (!sentence || nasikh === "الفعل الناسخ") return "";
  if (nasikh.includes("ما زال")) {
    return "ما: حرف نفي.\nزال: فعل ماضٍ ناسخ ناقص مبني على الفتح. وإذا حُذفت (ما) في بعض السياقات عاد (زال) فعلًا تامًا يكتفي بفاعل، ولا يحتاج إلى اسم وخبر. مثال: زالَ البأسُ؛ فـ(البأسُ) فاعل.";
  }
  if (nasikh.includes("ما انفكوا")) {
    return "ما: حرف نفي.\nانفكوا: فعل ماضٍ ناسخ ناقص مبني على الضم لاتصاله بواو الجماعة.";
  }
  if (nasikh.includes("ما برحا")) {
    return "ما: حرف نفي.\nبرحا: فعل ماضٍ ناسخ ناقص مبني على الفتح لاتصاله بألف الاثنين.";
  }
  if (nasikh.includes("أصبحن")) {
    return "أصبحن: فعل ماضٍ ناسخ ناقص مبني على السكون لاتصاله بنون النسوة.";
  }
  if (nasikh.includes("كنت") || nasikh.includes("كنا") || nasikh.includes("كنتم")) {
    return `${nasikh}: فعل ماضٍ ناسخ ناقص مبني على السكون لاتصاله بضمير رفع متحرك.`;
  }
  if (nasikh.includes("كانت")) {
    return "كانت: فعل ماضٍ ناسخ ناقص مبني على الفتح، والتاء للتأنيث الساكنة لا محل لها.";
  }
  if (nasikh.includes("أصبحت")) {
    return "أصبحت: فعل ماضٍ ناسخ ناقص مبني على الفتح، والتاء للتأنيث الساكنة لا محل لها.";
  }
  if (nasikh.includes("ليست")) {
    return "ليست: فعل ماضٍ ناسخ ناقص مبني على الفتح، والتاء للتأنيث الساكنة لا محل لها.";
  }
  return `${nasikh}: فعل ماضٍ ناسخ ناقص مبني على الفتح.`;
}

function customKanaPedagogyNode(node: any, state: any) {
  if (!node || node.type !== "question") return null;
  const id = String(node.id || "");
  if (!id.startsWith("kana")) return null;
  const facts = state?.facts || {};
  const target = String(state?.currentTarget || "المحدد");
  const sentence = String(state?.currentSentence || "");
  const role = String(facts.targetRole || "");
  const nounKind = String(facts.nounKind || "");
  const mabniType = String(facts.mabniType || "");
  const khabarKind = String(facts.khabarKind || "");
  const sentenceType = String(facts.sentenceType || "");
  const shibhType = String(facts.shibhType || "");
  const shibhPosition = String(facts.shibhPosition || "");
  const ending = String(facts.ending || "");
  const number = String(facts.number || "");
  const subject = kanaSubjectFromSentence(sentence, target);
  const khabar = kanaKhabarFromSentence(sentence, target);
  const nasikh = kanaNasikhVerb(sentence);
  const who = kanaNasikhPrompt(sentence);
  let semanticSubject = subject !== "الاسم الذي تتحدث عنه الجملة" ? subject : "صاحب المعنى";
  let hiddenPronoun = "ضمير مستتر تقديره هو";
  if (sentence.includes("أسماء") || sentence.includes("أختي")) hiddenPronoun = "ضمير مستتر تقديره هي";

  const returnToThis = id || "kana_target";


  if (id === "kana_hidden_ism_semantic") {
    return {
      ...node,
      context: `نبدأ من المعنى قبل المصطلح في الجملة: «${sentence}».`,
      text: `${who} ${nasikh}؟ اختر الإجابة الصحيحة مما يلي:`,
      hint: `ابدأ بصاحب المعنى: من الذي ${nasikh} في الجملة؟ بعد ذلك سننتقل إلى موقع الإعراب.`,
      answers: [
        { id: "a", text: semanticSubject, next: "kana_hidden_ism_site", correct: true },
        { id: "b", text: khabar || target, next: "kana_hidden_ism_semantic", correct: false, hint: `(${khabar || target}) أتمت المعنى فهي أقرب للخبر، أما الآن فنبحث عن صاحب معنى (${nasikh}).` },
      ],
    };
  }

  if (id === "kana_hidden_ism_site") {
    return {
      ...node,
      context: `عرفنا أن المعنى يعود إلى (${semanticSubject})، والآن نحدد الموقع الإعرابي بعد (${nasikh}).`,
      text: `هل ظهر بعد (${nasikh}) اسم صريح، أم نفهم اسم الناسخ من السياق؟`,
      hint: `إذا تقدّم الاسم الظاهر على الفعل الناسخ، فلا نعربه اسمًا للناسخ بعده؛ نقدر بعد الفعل ضميرًا مستترًا يعود عليه.`,
      answers: [
        { id: "a", text: "ظهر اسم صريح بعده", next: "kana_hidden_ism_site", correct: false, hint: `راجع ما بعد (${nasikh}) مباشرة: هل جاء اسم ظاهر بعده؟` },
        { id: "b", text: "نفهمه من السياق", next: "kana_hidden_ism_estimate", correct: true },
      ],
    };
  }

  if (id === "kana_hidden_ism_estimate") {
    const feminine = hiddenPronoun.includes("هي");
    return {
      ...node,
      context: `بما أن اسم الناسخ غير ظاهر بعد (${nasikh}) نقدره بضمير يعود على (${semanticSubject}).`,
      text: `ما تقدير الضمير المستتر هنا؟`,
      hint: `نقدّر الضمير بحسب الاسم الذي يعود عليه: مذكر ← هو، مؤنث ← هي.`,
      answers: [
        { id: "a", text: "هو", next: "R_kana_ism_hidden_damir", correct: !feminine, hint: feminine ? `الضمير يعود على اسم مؤنث هنا، فالأدق تقديره: هي.` : undefined },
        { id: "b", text: "هي", next: "R_kana_ism_hidden_damir", correct: feminine, hint: feminine ? undefined : `الضمير يعود على اسم مذكر هنا، فالأدق تقديره: هو.` },
      ],
    };
  }

  if (id === "kana_connected_pronoun_i3rab") {
    const pronounLabel = target.includes("واو") ? "الواو في (انفكوا)" : target;
    return {
      ...node,
      context: `عرفنا صاحب المعنى في الجملة، والآن نحدد العنصر الذي شغل موقع اسم الفعل الناسخ في الإعراب.`,
      text: `أيهما نعرب اسمًا للفعل الناسخ؟ اختر الإجابة الصحيحة مما يلي:`,
      hint: `إذا سبق الفعلَ الناسخ اسمٌ ظاهر وعاد عليه ضمير داخل الفعل، فالمعنى يعود إلى الاسم الظاهر، أما الموقع الإعرابي فيشغله ذلك الضمير.`,
      answers: [
        { id: "a", text: pronounLabel, next: "R_kana_ism_damir", correct: true },
        { id: "b", text: semanticSubject, next: "kana_connected_pronoun_i3rab", correct: false, hint: `صحيح أن المعنى يعود إلى (${semanticSubject})، لكنه ليس اسم الفعل الناسخ في الإعراب؛ الذي شغل الموقع هو ${pronounLabel}.` },
      ],
    };
  }

  if (id === "kana_khabar_nominal_starter") {
    return {
      ...node,
      context: `عرفنا أن (${target}) تركيب أتم معنى الجملة عن (${subject}).`,
      text: `هل يبدأ هذا التركيب باسم أم بفعل؟ اختر الإجابة الصحيحة مما يلي:`,
      hint: `انظر إلى أول كلمة في (${target}) نفسها؛ لا نبدأ بتعريف نحوي مجرد.`,
      answers: [
        { id: "a", text: "يبدأ باسم", next: "R_kana_khabar_nominal_sentence", correct: true },
        { id: "b", text: "يبدأ بفعل", next: "kana_khabar_nominal_starter", correct: false, hint: `راجع أول كلمة في (${target}): هل هي اسم أم فعل؟` },
      ],
    };
  }

  if (id === "kana_target") {
    // اسم الناسخ المستتر: الخيارات تكون بين الاسم المتقدم والضمير المستتر، ثم يشرح التلميح سبب عدم إعراب الاسم المتقدم اسمًا للناسخ.
    if (role === "hidden_ism") {
      return {
        ...node,
        context: `في الجملة: «${sentence}» نبدأ بالمعنى ثم ننتقل إلى موقع الإعراب.`,
        text: `${who} ${nasikh}؟ اختر الإجابة الصحيحة مما يلي:`,
        hint: `ابدأ بصاحب المعنى أولًا، ثم سنبيّن أن الموقع الإعرابي يشغله ضمير مستتر بعد الفعل الناسخ.`,
        answers: [
          { id: "a", text: semanticSubject, next: "kana_hidden_ism_site", correct: true },
          { id: "b", text: hiddenPronoun, next: "kana_target", correct: false, hint: `هذا هو الإعراب النهائي لاحقًا، لكننا لا نقفز إليه الآن. أولًا حدّد: من صاحب المعنى في الجملة؟` },
        ],
      };
    }

    // الضمير المتصل في الناسخ: نبدأ بصاحب المعنى، ثم ننتقل إلى الضمير الذي شغل الموقع.
    if (role === "ism" && nounKind === "mabni" && mabniType === "damir" && !target.includes("ت")) {
      const connectedQuestion = target.includes("واو")
        ? "من الذين ما انفكوا يتناوبون على العمل؟ اختر الإجابة الصحيحة مما يلي:"
        : `${who} ${nasikh}؟ اختر الإجابة الصحيحة مما يلي:`;
      return {
        ...node,
        context: `في الجملة: «${sentence}» نبدأ بصاحب المعنى ثم نصل إلى الضمير المتصل بالفعل الناسخ.`,
        text: connectedQuestion,
        hint: `ابدأ بالمعنى فقط، ثم انتبه إلى الضمير المتصل بالفعل الناسخ.`,
        answers: [
          { id: "a", text: semanticSubject, next: "kana_connected_pronoun_i3rab", correct: true },
          { id: "b", text: target, next: "kana_target", correct: false, hint: `(${target}) هو الضمير الذي سنصل إليه إعرابيًا، لكن ابدأ أولًا بصاحب المعنى في الجملة.` },
        ],
      };
    }

    // تاء الفاعل في كان: لا نسميها ضميرًا قبل اكتشاف دلالتها. ولا يعمل هذا القالب إلا إذا كانت التاء هي المحددة فعلًا.
    if (role === "ism" && nounKind === "mabni" && mabniType === "damir" && target.includes("ت")) {
      return {
        ...node,
        context: `في الجملة: «${sentence}» نكتشف دلالة التاء قبل أن نسميها.`,
        text: "على من تدل التاء؟ اختر الإجابة الصحيحة مما يلي:",
        hint: "اسأل: هل المتكلم هو الذي كان؟ أم المخاطب؟ أم الغائب؟",
        answers: [
          { id: "a", text: "المتكلم", next: "kana_damir_name", correct: true },
          { id: "b", text: "المخاطب", next: "kana_target", correct: false, hint: "في (كنتُ) التاء تدل على المتكلم: أنا كنتُ." },
          { id: "c", text: "الغائب", next: "kana_target", correct: false, hint: "الغائب يكون مثل: هو/هي. أما التاء في (كنتُ) فتدل على المتكلم." },
          { id: "d", text: "لا تدل على أحد، فهي علامة فقط", next: "kana_target", correct: false, hint: "هذه ليست تاء تأنيث ساكنة؛ إنها تاء تدل على المتكلم في (كنتُ)." },
        ],
      };
    }

    // اسم الناسخ الظاهر: الخياران من ألفاظ المثال لا من تعريفات نحوية.
    if (role === "ism") {
      return {
        ...node,
        context: `في الجملة: «${sentence}» نبدأ من المعنى لا من التعريف.`,
        text: kanaNasikhSubjectQuestion(nasikh, khabar),
        hint: "ابحث عن الاسم الذي تتحدث عنه الجملة، ولا تختر الكلمة التي جاءت لتكمل المعنى عنه.",
        answers: [
          { id: "a", text: target, next: "kana_ism_start", correct: true },
          { id: "b", text: khabar, next: "kana_target", correct: false, hint: `(${khabar}) هي التي أتمت المعنى عن (${target})، وليست هي صاحبة معنى (${nasikh}).` },
        ],
      };
    }

    // الخبر بأنواعه: يبدأ دائمًا من الكلمة المحددة، ولا ينتقل إلى اسم الناسخ.
    if (role === "khabar") {
      return {
        ...node,
        context: `في الجملة: «${sentence}» نركز على الكلمة أو التركيب المحدد فقط.`,
        text: `ما علاقة (${target}) بـ(${subject})؟ اختر الإجابة الصحيحة مما يلي:`,
        hint: `اسأل نفسك: ماذا أضافت (${target}) إلى معنى الجملة؟`,
        answers: [
          { id: "a", text: kanaKhabarRelationLabel(target, subject), next: "kana_khabar_entry", correct: true },
          { id: "b", text: kanaNasikhSubjectChoice(nasikh), next: "kana_target", correct: false, hint: `هذا الاختيار يخص الاسم الذي دار عليه معنى الناسخ، أما (${target}) فقد أتمت معنى الجملة عن (${subject}).` },
        ],
      };
    }
  }

  if (id === "kana_khabar_entry") {
    // بعد اكتشاف وظيفة الخبر لا نعرض كل صور الأخبار دفعة واحدة، بل نسأل داخل فرع الخبر نفسه.
    if (khabarKind === "shibh") {
      return {
        ...node,
        context: `عرفنا أن (${target}) أتمت معنى الجملة عن (${subject}).`,
        text: `ما صورة (${target}) في الجملة؟ اختر الإجابة الصحيحة مما يلي:`,
        hint: `صور الخبر هنا محدودة: اسم، فعل مرتبط بزمن، أو شبه جملة. انظر إلى (${target}) نفسها.`,
        answers: [
          { id: "a", text: "اسم", next: "kana_khabar_entry", correct: false, hint: `(${target}) ليست اسمًا مفردًا؛ إنها تركيب مثل: في الحقيبة أو عند المدير.` },
          { id: "b", text: "فعل يدل على حدث وزمن", next: "kana_khabar_entry", correct: false, hint: `لا يوجد فعل في (${target})؛ انظر هل هي جار ومجرور أو ظرف.` },
          { id: "c", text: "شبه جملة", next: "kana_khabar_shibh_type", correct: true },
        ],
      };
    }
    if (nounKind === "masdar") {
      return {
        ...node,
        context: `عرفنا أن (${target}) أتمت معنى الجملة عن (${subject}).`,
        text: `هل يمكن أن يؤول (${target}) باسم؟ اختر الإجابة الصحيحة مما يلي:`,
        hint: "انظر هل بدأ التركيب بحرف مصدري مثل (أن)، ثم جرّب تأويله باسم.",
        answers: [
          { id: "a", text: "نعم، يؤول باسم", next: "kana_masdar_name", correct: true },
          { id: "b", text: "لا، هو اسم ظاهر مفرد", next: "kana_khabar_entry", correct: false, hint: `(${target}) تركيب من حرف مصدري وفعل، وليس اسمًا ظاهرًا مفردًا.` },
        ],
      };
    }
    if (sentenceType === "verbal") {
      return {
        ...node,
        context: `عرفنا أن (${target}) أتمت معنى الجملة عن (${subject}).`,
        text: `ما صورة (${target}) في الجملة؟ اختر الإجابة الصحيحة مما يلي:`,
        hint: `صور الخبر هنا محدودة: اسم، فعل مرتبط بزمن، أو شبه جملة.`,
        answers: [
          { id: "a", text: "اسم", next: "kana_khabar_entry", correct: false, hint: `(${target}) ليس اسمًا؛ بل يدل على حدث وزمن.` },
          { id: "b", text: "فعل يدل على حدث وزمن", next: "R_kana_khabar_verbal_sentence", correct: true },
          { id: "c", text: "شبه جملة", next: "kana_khabar_entry", correct: false, hint: `شبه الجملة تكون جارًا ومجرورًا أو ظرفًا، أما (${target}) فهو فعل.` },
        ],
      };
    }
    if (sentenceType === "nominal") {
      return {
        ...node,
        context: `عرفنا أن (${target}) أتمت معنى الجملة عن (${subject}).`,
        text: `هل (${target}) كلمة واحدة أم تركيب من أكثر من كلمة؟ اختر الإجابة الصحيحة مما يلي:`,
        hint: "انظر إلى الجزء المحدد كما هو في المثال: هل هو كلمة واحدة، أم أكثر من كلمة؟",
        answers: [
          { id: "a", text: "كلمة واحدة", next: "kana_khabar_entry", correct: false, hint: `(${target}) ليس كلمة واحدة؛ إنه تركيب من أكثر من كلمة.` },
          { id: "b", text: "تركيب من أكثر من كلمة", next: "kana_khabar_nominal_starter", correct: true },
        ],
      };
    }
    return {
      ...node,
      context: `عرفنا أن (${target}) أتمت معنى الجملة عن (${subject}).`,
      text: `هل الخبر هنا مفرد، أم جملة أو شبه جملة؟ اختر الإجابة الصحيحة مما يلي:`,
      hint: "المفرد النحوي لا يعني دائمًا كلمة واحدة فقط؛ فقد يأتي معه نعت أو مضاف إليه أو تابع، ما دام ليس جملة ولا شبه جملة.",
      answers: [
        { id: "a", text: "خبر مفرد", next: "kana_khabar_single_start", correct: true },
        { id: "b", text: "جملة أو شبه جملة", next: "kana_khabar_entry", correct: false, hint: `(${target}) هنا خبر مفرد؛ لأنه ليس جملة ولا شبه جملة. وقد يبقى الخبر مفردًا ولو جاء معه نعت أو مضاف إليه أو تابع.` },
      ],
    };
  }

  if (id === "kana_khabar_single_start") {
    if (nounKind === "masdar") {
      return {
        ...node,
        context: `عرفنا أن (${target}) أتمت المعنى عن (${subject}) وأنه يؤول باسم.`,
        text: `ماذا يسمى هذا التركيب؟ اختر الإجابة الصحيحة مما يلي:`,
        hint: "المصدر المؤول تركيب من حرف مصدري وفعل ويؤول باسم.",
        answers: [
          { id: "a", text: "مصدر مؤول", next: "R_kana_khabar_single_masdar", correct: true },
          { id: "b", text: "اسم ظاهر معرب", next: "kana_khabar_single_start", correct: false, hint: "ليس كلمة ظاهرة واحدة، بل تركيب يؤول باسم." },
        ],
      };
    }
    return null;
  }

  if (id === "kana_khabar_shibh_type") {
    return {
      ...node,
      context: `عرفنا أن (${target}) تركيب أتم المعنى عن (${subject}).`,
      text: `ما صورة هذا التركيب؟ اختر الإجابة الصحيحة مما يلي:`,
      hint: "إذا بدأ بحرف جر فهو جار ومجرور، وإذا كان ظرفًا مثل (عند) فهو ظرف ومضاف إليه.",
      answers: [
        { id: "a", text: "جار ومجرور", next: shibhPosition === "advanced" ? "kana_khabar_shibh_position_jar" : "R_kana_khabar_jar", correct: shibhType === "jar", hint: shibhType === "jar" ? undefined : `(${target}) يبدأ بظرف مثل (عند)، وليس بحرف جر.` },
        { id: "b", text: "ظرف ومضاف إليه", next: shibhPosition === "advanced" ? "kana_khabar_shibh_position_zarf" : "R_kana_khabar_zarf", correct: shibhType === "zarf", hint: shibhType === "zarf" ? undefined : `(${target}) يبدأ بحرف جر، وليس بظرف.` },
      ],
    };
  }

  if (id === "kana_khabar_shibh_position_jar") {
    return {
      ...node,
      context: `عرفنا أن (${target}) جار ومجرور، والآن ننظر إلى الاسم الذي جاء بعده.`,
      text: `هل جاء بعد هذا الجار والمجرور اسم نكرة مثل: كان في البيت رجل؟`,
      hint: `إذا تقدم شبه الجملة بعد الفعل الناسخ وجاءت بعدها نكرة، فشبه الجملة خبر مقدم، والاسم النكرة اسم الفعل الناسخ مؤخر.`,
      answers: [
        { id: "a", text: "نعم، تقدم على اسم نكرة", next: "R_kana_khabar_jar_advanced", correct: shibhPosition === "advanced" },
        { id: "b", text: "لا، جاء بعد اسم الناسخ", next: "R_kana_khabar_jar", correct: shibhPosition !== "advanced", hint: `لو جاء بعد اسم الناسخ لوجدنا اسمًا ظاهرًا قبل شبه الجملة. أما هنا فقد بدأ بعد الناسخ بشبه الجملة، ثم جاءت النكرة بعدها.` },
      ],
    };
  }

  if (id === "kana_khabar_shibh_position_zarf") {
    return {
      ...node,
      context: `عرفنا أن (${target}) ظرف، والآن ننظر إلى الاسم الذي جاء بعده.`,
      text: `هل جاء بعد هذا الظرف اسم نكرة مثل: ما زال عندنا ضيف؟`,
      hint: `إذا تقدم الظرف بعد الفعل الناسخ وجاءت بعده نكرة، فالظرف خبر مقدم، والاسم النكرة اسم الفعل الناسخ مؤخر.`,
      answers: [
        { id: "a", text: "نعم، تقدم على اسم نكرة", next: "R_kana_khabar_zarf_advanced", correct: shibhPosition === "advanced" },
        { id: "b", text: "لا، جاء بعد اسم الناسخ", next: "R_kana_khabar_zarf", correct: shibhPosition !== "advanced", hint: `لو جاء بعد اسم الناسخ لوجدنا اسمًا ظاهرًا قبل الظرف. أما هنا فقد تقدم الظرف وجاءت النكرة بعده.` },
      ],
    };
  }

  return null;
}

function customKanaResultNode(node: any, state: any) {
  if (!node || node.type !== "result") return null;
  if (String(node.id || "") !== "R_kana_khabar_nominal_sentence") return null;
  const target = String(state?.currentTarget || "");
  const sentence = String(state?.currentSentence || state?.sentence || "");
  const haystack = `${target} ${sentence}`;
  if (haystack.includes("أطرافه") || haystack.includes("أطرافُه")) {
    return {
      ...node,
      text: `أطرافه: مبتدأ ثانٍ مرفوع، وهو مضاف.
الهاء: ضمير متصل مبني في محل جر مضاف إليه.
ممتدة: خبر المبتدأ الثاني مرفوع.
والجملة الاسمية (أطرافه ممتدة) في محل نصب خبر الفعل الناسخ.`
    };
  }
  if (haystack.includes("لونه") || haystack.includes("لونُه")) {
    return {
      ...node,
      text: `لونه: مبتدأ ثانٍ مرفوع، وهو مضاف.
الهاء: ضمير متصل مبني في محل جر مضاف إليه.
باهت: خبر المبتدأ الثاني مرفوع.
والجملة الاسمية (لونه باهت) في محل نصب خبر الفعل الناسخ.`
    };
  }
  return null;
}


function stripArabicTashkeel(value: string) {
  return String(value || "").replace(/[\u064B-\u065F\u0670]/g, "").trim();
}

function innaParticleName(state: any) {
  const raw = stripArabicTashkeel(String(state?.facts?.particleLabel || "إن"));
  if (raw.includes("إنما")) return "إنما";
  if (raw.includes("لكن")) return "لكن";
  if (raw.includes("كأن")) return "كأن";
  if (raw.includes("ليت")) return "ليت";
  if (raw.includes("لعل")) return "لعل";
  if (raw.includes("أن")) return "أن";
  return "إن";
}

function innaGenericLabel(text: string, state: any) {
  const particle = innaParticleName(state);
  if (!particle || particle === "إنما") return text;
  return String(text || "").replace(/اسم إن/g, `اسم ${particle}`).replace(/خبر إن/g, `خبر ${particle}`);
}

function innaParticleMeaningLabel(state: any) {
  const facts = state?.facts || {};
  const particle = innaParticleName(state);
  const meaning = String(facts.particleMeaning || "");
  if (particle === "كأن" || meaning === "tashbih") return "التشبيه";
  if (particle === "لكن" || meaning === "istidrak") return "الاستدراك";
  if (particle === "ليت" || meaning === "tamanni") return "التمني";
  if (particle === "لعل" || meaning === "tarajji") return "الترجي";
  if (particle === "إنما" || meaning === "kaffa") return "الكف عن العمل";
  return "التوكيد";
}

function innaParticleMeaningIntro(state: any) {
  const facts = state?.facts || {};
  const rawParticle = String(facts.particleLabel || innaParticleName(state) || "إن").replace(/َّ/g, "َّ");
  const particle = innaParticleName(state);
  const judgment = String(facts.meaningJudgment || "الجملة الاسمية").replace(/\.$/, "");
  const meaning = String(facts.particleMeaning || "");
  if (particle === "إنما" || meaning === "kaffa") return `${rawParticle}: دخلت عليها ما الكافة، فتغيّر العمل؛ ننظر إلى الجملة بعدها: ${judgment}.`;
  return `${rawParticle} تفيد ${innaParticleMeaningLabel(state)}، وقد دخلت هنا على الجملة الاسمية: ${judgment}.`;
}

function innaParticleI3rabLine(state: any) {
  const particle = innaParticleName(state);
  if (particle === "إنما") {
    return "بني نود أن ننبهك إلى أن إعراب إنما: إن حرف توكيد ونصب مكفوف بما الكافة، وما كافة لا محل لها؛ لذلك لا تعمل إن في الاسم والخبر بعدها.";
  }
  const map: Record<string, string> = {
    "إن": "إن: حرف نصب وتوكيد (مُشبَّه بالفعل)، ينصب الاسم ويرفع الخبر.",
    "أن": "أن: حرف نصب وتوكيد (مُشبَّه بالفعل)، ينصب الاسم ويرفع الخبر.",
    "كأن": "كأن: حرف نصب وتشبيه (مُشبَّه بالفعل)، ينصب الاسم ويرفع الخبر.",
    "لكن": "لكن: حرف نصب واستدراك (مُشبَّه بالفعل)، ينصب الاسم ويرفع الخبر.",
    "ليت": "ليت: حرف نصب وتمنٍّ (مُشبَّه بالفعل)، ينصب الاسم ويرفع الخبر.",
    "لعل": "لعل: حرف نصب وترجٍّ (مُشبَّه بالفعل)، ينصب الاسم ويرفع الخبر.",
  };
  return `بني نود أن ننبهك إلى أن إعراب ${map[particle] || map["إن"]}`;
}

function innaIsConnectedPronounTarget(value: string) {
  const clean = stripArabicTashkeel(String(value || "")).replace(/[()«».,،؛؟!\s]/g, "");
  return ["ك", "ه", "ها", "هم", "هما", "هن", "ي", "ني", "نا"].includes(clean);
}

function innaBaseFirstWord(state: any) {
  const facts = state?.facts || {};
  if (facts.baseFirstWord) return String(facts.baseFirstWord);
  if (String(facts.baseStart || "") === "shibh") return String(facts.meaningPredicate || "شبه الجملة").replace(/\.$/, "");
  const judgment = String(facts.meaningJudgment || "").replace(/[.،؛؟!]/g, "").trim();
  return judgment.split(/\s+/).filter(Boolean)[0] || String(facts.meaningSubject || "أول كلمة").replace(/\.$/, "");
}

function customInnaResultNode(node: any, state: any) {
  if (!node || node.type !== "result") return null;
  const start = String(state?.currentSentence || "");
  const target = String(state?.currentTarget || "");
  const id = String(node.id || "");
  const particle = innaParticleName(state);
  const labelText = innaGenericLabel(String(node.text || ""), state);

  if (id === "R_inna_kaffa_mubtada") {
    if (target.includes("المؤمنون")) {
      return {
        ...node,
        text: `المؤمنون: مبتدأ مرفوع وعلامة رفعه الواو لأنه جمع مذكر سالم.
إخوة: خبر مرفوع وعلامة رفعه الضمة الظاهرة.
تنبيه: إنما لا تعمل عمل إن؛ لأن ما الكافة كفّت إن عن العمل.`
      };
    }
    return { ...node, text: labelText };
  }

  if (id === "R_inna_khabar_verbal_sentence") {
    if (target.includes("يقرأ")) {
      return {
        ...node,
        text: `يقرأُ: فعل مضارع مرفوع وعلامة رفعه الضمة الظاهرة.
والفاعل ضمير مستتر تقديره هو يعود على اسم ${particle}.
والجملة الفعلية (يقرأ) في محل رفع خبر ${particle}.`
      };
    }
    return { ...node, text: innaGenericLabel("جملة فعلية في محل رفع خبر إن. نُعرب داخلها الفعل والفاعل، ثم نحكم على الجملة كلها بأنها خبر.", state) };
  }

  if (id === "R_inna_khabar_nominal_sentence") {
    const haystack = `${start} ${target}`;
    if (haystack.includes("أخلاق")) {
      return {
        ...node,
        text: `أخلاقُه: مبتدأ ثانٍ مرفوع، وهو مضاف.
الهاء: ضمير متصل مبني في محل جر مضاف إليه.
حسنةٌ: خبر المبتدأ الثاني مرفوع وعلامة رفعه الضمة الظاهرة.
والجملة الاسمية (أخلاقه حسنة) في محل رفع خبر ${particle}.`
      };
    }
    return { ...node, text: innaGenericLabel("جملة اسمية في محل رفع خبر إن. نُعرب داخلها المبتدأ والخبر الداخليين، ثم نحكم على الجملة كلها بأنها خبر.", state) };
  }

  return { ...node, text: labelText };
}

function innaNasikhFinalIntro(state: any) {
  const start = String(state?.currentSentence || "");
  const hasInna = /إن|أن|كأن|لكن|ليت|لعل/.test(start) || state?.facts?.particleLabel;
  if (!hasInna) return "";
  return innaParticleI3rabLine(state);
}


function finalThinkingTextForDisplay(node: any, state: any) {
  const base = String(node?.text || "");
  const target = String(state?.currentTarget || "");
  const sentence = String(state?.currentSentence || state?.sentence || "");
  const haystack = `${target} ${sentence}`;
  if (node?.type === "result") {
    if (haystack.includes("أطرافه") || haystack.includes("أطرافُه")) {
      return `أطرافُه: مبتدأ ثانٍ مرفوع، وهو مضاف.
الهاء: ضمير متصل مبني في محل جر مضاف إليه.
ممتدةٌ: خبر المبتدأ الثاني مرفوع.

والجملة الاسمية (أطرافه ممتدة) في محل نصب خبر أصبح.`;
    }
    if (haystack.includes("لونه") || haystack.includes("لونُه")) {
      return `لونُه: مبتدأ ثانٍ مرفوع، وهو مضاف.
الهاء: ضمير متصل مبني في محل جر مضاف إليه.
باهتٌ: خبر المبتدأ الثاني مرفوع.

والجملة الاسمية (لونه باهت) في محل نصب خبر كان.`;
    }
  }
  const resultId = String(node?.id || "");
  if (node?.type === "result" && resultId.startsWith("R_present_")) {
    const facts = state?.facts || {};
    const toolWord = String(facts.toolWord || (sentence.includes("لم ") ? "لم" : sentence.includes("لن ") ? "لن" : sentence.includes(" أن ") ? "أن" : sentence.includes(" كي ") ? "كي" : sentence.includes("لا ") ? "لا الناهية" : sentence.includes("لِ") ? "لام الأمر" : ""));
    const isFive = resultId.includes("five");
    const pronounLine = (() => {
      if (facts.attached === "waw") return "واو الجماعة: ضمير متصل مبني في محل رفع فاعل.";
      if (facts.attached === "alif2") return "ألف الاثنين: ضمير متصل مبني في محل رفع فاعل.";
      if (facts.attached === "yaa") return "ياء المخاطبة: ضمير متصل مبني في محل رفع فاعل.";
      return "";
    })();
    const fariqaLine = facts.attached === "waw" && /وا\b|وا$/.test(target) ? "الألف: ألف فارقة لا محل لها من الإعراب." : "";
    const withTool = (kind: string) => toolWord ? `${kind} بـ ${toolWord}` : kind;
    const lines: string[] = [];

    if (resultId === "R_present_binaa_niswa") {
      lines.push(`${target}: فعل مضارع مبني على السكون لاتصاله بنون النسوة.`);
      lines.push("نون النسوة: ضمير متصل مبني في محل رفع فاعل.");
      lines.push("هنا حُسم البناء؛ فلا نبحث عن رفع أو نصب أو جزم.");
      return lines.join("\n");
    }
    if (resultId === "R_present_binaa_tawkid") {
      lines.push(`${target}: فعل مضارع مبني على الفتح لاتصاله بنون التوكيد.`);
      lines.push("نون التوكيد: حرف توكيد لا محل له من الإعراب.");
      lines.push("هنا حُسم البناء؛ فلا نبحث عن رفع أو نصب أو جزم.");
      return lines.join("\n");
    }

    if (resultId.includes("raf3")) {
      if (isFive) {
        lines.push(`${target}: فعل مضارع مرفوع، وعلامة رفعه ثبوت النون؛ لأنه من الأفعال الخمسة.`);
        if (pronounLine) lines.push(pronounLine);
        return lines.join("\n");
      }
      if (resultId.includes("alif")) return `${target}: فعل مضارع مرفوع.\nعلامة رفعه: الضمة المقدرة على الألف منع من ظهورها التعذر.`;
      if (resultId.includes("waw")) return `${target}: فعل مضارع مرفوع.\nعلامة رفعه: الضمة المقدرة على الواو منع من ظهورها الثقل.`;
      if (resultId.includes("ya")) return `${target}: فعل مضارع مرفوع.\nعلامة رفعه: الضمة المقدرة على الياء منع من ظهورها الثقل.`;
      return `${target}: فعل مضارع مرفوع.\nعلامة رفعه: الضمة الظاهرة على آخره.`;
    }

    if (resultId.includes("nasb")) {
      if (isFive) {
        lines.push(`${target}: فعل مضارع ${withTool("منصوب")}، وعلامة نصبه حذف النون؛ لأنه من الأفعال الخمسة.`);
        if (pronounLine) lines.push(pronounLine);
        if (fariqaLine) lines.push(fariqaLine);
        return lines.join("\n");
      }
      if (resultId.includes("alif")) return `${target}: فعل مضارع ${withTool("منصوب")}.\nعلامة نصبه: الفتحة المقدرة على الألف منع من ظهورها التعذر.`;
      return `${target}: فعل مضارع ${withTool("منصوب")}.\nعلامة نصبه: الفتحة الظاهرة على آخره.`;
    }

    if (resultId.includes("jazm")) {
      if (isFive) {
        lines.push(`${target}: فعل مضارع ${withTool("مجزوم")}، وعلامة جزمه حذف النون؛ لأنه من الأفعال الخمسة.`);
        if (pronounLine) lines.push(pronounLine);
        if (fariqaLine) lines.push(fariqaLine);
        return lines.join("\n");
      }
      if (resultId.includes("weak_alif")) return `${target}: فعل مضارع ${withTool("مجزوم")}.\nعلامة جزمه: حذف حرف العلة.\nحرف العلة المحذوف: الألف.`;
      if (resultId.includes("weak_waw")) return `${target}: فعل مضارع ${withTool("مجزوم")}.\nعلامة جزمه: حذف حرف العلة.\nحرف العلة المحذوف: الواو.`;
      if (resultId.includes("weak_ya")) return `${target}: فعل مضارع ${withTool("مجزوم")}.\nعلامة جزمه: حذف حرف العلة.\nحرف العلة المحذوف: الياء.`;
      return `${target}: فعل مضارع ${withTool("مجزوم")}.\nعلامة جزمه: السكون.`;
    }
  }

  if (node?.type === "result" && resultId.startsWith("R_imperative_")) {
    const facts = state?.facts || {};
    const lines: string[] = [];
    if (resultId === "R_imperative_delete_noon_attached") {
      if (facts.attached === "alif2") {
        lines.push(`${target}: فعل أمر مبني على حذف النون لاتصاله بألف الاثنين.`);
        lines.push("ألف الاثنين: ضمير متصل مبني في محل رفع فاعل.");
        return lines.join("\n");
      }
      if (facts.attached === "waw") {
        lines.push(`${target}: فعل أمر مبني على حذف النون لاتصاله بواو الجماعة.`);
        lines.push("واو الجماعة: ضمير متصل مبني في محل رفع فاعل.");
        lines.push("الألف: ألف فارقة لا محل لها من الإعراب.");
        return lines.join("\n");
      }
      if (facts.attached === "yaa") {
        lines.push(`${target}: فعل أمر مبني على حذف النون لاتصاله بياء المخاطبة.`);
        lines.push("ياء المخاطبة: ضمير متصل مبني في محل رفع فاعل.");
        return lines.join("\n");
      }
    }
  }

  if (node?.type === "result" && resultId.startsWith("R_fael_")) {
    const finalI3rab = String(state?.facts?.finalI3rab || "").trim();
    if (finalI3rab) return finalI3rab;
  }

  if (node?.type === "result" && resultId.startsWith("R_mafool_")) {
    const finalI3rab = String(state?.facts?.finalI3rab || "").trim();
    if (finalI3rab) return finalI3rab;
  }

  if (node?.type === "result" && resultId.startsWith("R_tawabi_")) {
    const finalI3rab = String(state?.facts?.finalI3rab || "").trim();
    if (finalI3rab) return finalI3rab;
  }

  return base;
}

function normalizeThinkingNode(node: any, state: any) {
  if (!node) return node;
  if (node.type === "result") return customInnaResultNode(node, state) || customKanaResultNode(node, state) || node;
  if (node.type !== "question") return node;
  const customKana = customKanaPedagogyNode(node, state);
  if (customKana) return customKana;
  const id = String(node.id || "");
  let context = String(node.context || getNodeContext(node, state));
  let text = String(node.text || "ماذا نتحقق الآن؟");
  let hint = shortStudentText(node.hint, "اختر القرار التالي فقط.");

  // نحافظ على سؤال العقدة نفسه ما دام موجَّهًا للكلمة، ولا نحوله إلى سؤال ميتا عن طريقة الحل.
  if (/هل هو:|هل هي:|إذا كان/.test(text)) text = text.replace(/^إذا كان\s*/,'').replace(/^الآن:\s*/,'ما التصنيف المناسب الآن؟ ');
  if (/ما حالة آخر/.test(text)) context = "عرفنا التصنيف، والآن نفحص آخر الكلمة لاختيار العلامة.";
  if (/ما نوع الاسم المبني/.test(text)) context = "عرفنا أنها كلمة مبنية، فنحدد نوعها قبل المحل.";
  if (/ما نوع الجملة/.test(text)) context = "عرفنا أنها جملة، فنحدد صورتها قبل الحكم على محلها.";
  if (/هل سبق بأداة/.test(text)) context = "قبل تحديد الحالة نفحص ما قبل الفعل.";
  // في عقدة الأفعال الخمسة نحافظ على المصطلح المدرسي، والشرح يظهر في السطر المساعد لا في الخيارات.
  if (/هل اتصل/.test(text)) context = "الاتصال يغير علامة البناء أو الإعراب، لذلك نفحصه الآن.";

  text = cleanQuestionText({ ...node, text });
  // في باب الخبر لا نستبدل سياق العقدة بعبارة عامة؛ لأن السياق يحمل
  // جسر التفكير: بما أننا عرفنا... وهو جزء أساسي من السؤال.
  const isKhabarNode = id.includes("khabar");
  const isKanaNode = id.includes("kana");
  const isInnaNode = id.includes("inna");
  const isFaelNode = id.startsWith("fael_") || id.startsWith("R_fael_");
  const isMafoolNode = id.startsWith("mafool_") || id.startsWith("R_mafool_");
  const isTawabiNode = id.startsWith("tawabi_") || id.startsWith("R_tawabi_");
  context = id.startsWith("past_") ? "" : ((isKhabarNode || isKanaNode || isInnaNode || isFaelNode || isMafoolNode || isTawabiNode) ? context : currentStepIntro({ ...node, text }, []));

  let answers = (node.answers || []).map((a: any) => {
    const isFive = isFiveVerbDecision(node);
    const yesLike = a.eval?.anyOf || a.eval?.equals === true || String(a.text || "").trim().startsWith("نعم");
    const noLike = a.eval?.equals === false || a.eval?.equals === "none" || String(a.text || "").trim() === "لا" || String(a.text || "").trim().startsWith("لا");
    return {
      ...a,
      text: isFive ? (yesLike && !noLike ? "نعم" : "لا") : a.text,
      hint: a.hint || makeDecisionHint(a.text, text),
    };
  });

  if (id === "inna_meaning") {
    const facts = state?.facts || {};
    const meaningSubject = String(facts.meaningSubject || "الاسم وحده");
    const meaningPredicate = String(facts.meaningPredicate || "الخبر وحده");
    const meaningJudgment = String(facts.meaningJudgment || "الحكم الكامل في الجملة");
    const particleMeaning = String(facts.particleMeaning || "");
    answers = answers.map((a: any) => {
      if (particleMeaning === "kaffa") {
        if (a.id === "semantic_subject") return { ...a, text: "كفّت إن عن العمل، فصار ما بعدها جملة اسمية عادية" };
        if (a.id === "semantic_predicate") return { ...a, text: "بقيت إن تعمل: تنصب الاسم وترفع الخبر" };
        if (a.id === "semantic_judgment") return { ...a, text: "صار الاسم بعد إنما اسم إن منصوبًا" };
      }
      if (a.id === "semantic_subject") return { ...a, text: meaningSubject };
      if (a.id === "semantic_predicate") return { ...a, text: meaningPredicate };
      if (a.id === "semantic_judgment") return { ...a, text: meaningJudgment };
      return a;
    });
  }

  if (id.startsWith("inna_")) {
    answers = answers.map((a: any) => {
      if (String(a.id || "") === "__help") return a;
      const nextText = innaGenericLabel(String(a.text || ""), state);
      const nextHint = innaGenericLabel(String(a.hint || ""), state);
      return { ...a, text: nextText, hint: nextHint };
    });
  }


  if (id === "past_connector_kind") {
    answers = answers.map((a: any) => {
      if (a.id === "nasb" && state?.facts?.weakEnding !== "alif_visible") return { ...a, next: "R_past_fatha_nasb" };
      return a;
    });
  }

  if (id === "past_taa_weak") {
    answers = answers.map((a: any) => {
      if (a.id === "yes") return { ...a, next: "past_deleted_letter_taa" };
      return a;
    });
  }

  if (id === "past_raf3_type") {
    answers = answers.map((a: any) => {
      if (a.id === "alif") return { ...a, next: state?.facts?.weakOrigin ? "R_past_fatha_alif_weak" : "R_past_fatha_alif" };
      if (a.id === "waw") return { ...a, next: state?.facts?.weakDeleted ? "past_waw_weak" : "R_past_damma_waw" };
      return a;
    });
  }

  // في باب إن وأخواتها نجعل طلب المساعدة زرًا مستقلًا بدل حشر الخيارات داخل نص السؤال.
  if (id.startsWith("inna_") && !answers.some((a: any) => String(a.text || "").trim() === "لا أعلم")) {
    answers = [
      ...answers,
      {
        id: "__help",
        text: "لا أعلم",
        next: id,
        correct: false,
        isHelp: true,
        hint: hint || node.hint || "اقرأ المثال مرة أخرى، ثم اسأل: ما موقع الكلمة المحددة؟",
      },
    ];
  }

  return { ...node, context, text, hint, answers };
}


function isFiveVerbDecision(node: any) {
  const id = String(node?.id || "");
  const text = String(node?.text || "");
  return ["raf3_five", "nasb_five", "jazm_five"].includes(id) || text.includes("الأفعال الخمسة");
}

function isHintAnswerOption(answer: any) {
  const text = String(answer?.text || "").trim();
  return Boolean(
    answer?.isHelp ||
    answer?.id === "__help" ||
    answer?.id === "help" ||
    text === "لا أعلم" ||
    text.includes("أحتاج تلميح") ||
    text.includes("احتاج تلميح")
  );
}

function withoutRepeatedChoiceInstruction(text: string) {
  return String(text || "")
    .replace(/\s*اختر الإجابة الصحيحة(?:\s+مما\s+(?:يلي|يأتي))?\s*[:：]?\s*$/, "")
    .trim();
}

function dialogueQuestionText(node: any, target?: string, mode: Mode = "learn", state?: any, tree?: any, title?: string) {
  if (state && tree) return withoutRepeatedChoiceInstruction(openingDialogueLine(tree, node, state, title));
  const id = String(node?.id || "");
  const clean = cleanQuestionText(node);
  const t = target || "الكلمة المحددة";
  if (isFiveVerbDecision(node)) {
    return withoutRepeatedChoiceInstruction(`هل الفعل (${t}) من الأفعال الخمسة؟ وهي: كل فعل مضارع اتصل بواو الجماعة أو ياء المخاطبة أو ألف الاثنين.`);
  }
  const lead = "لنفكر بهدوء:";
  return withoutRepeatedChoiceInstruction(`${lead} ${clean}`);
}

function dialogueQuestionNote(node: any) {
  return "";
}

function stageOneDragInstruction(node: any, state: any) {
  const target = String(state?.currentTarget || "الكلمة");
  if (isFiveVerbDecision(node)) return `اختر «نعم» إذا كان (${target}) من الأفعال الخمسة: مضارع اتصل بواو الجماعة أو ياء المخاطبة أو ألف الاثنين. واختر «لا» إذا لم يكن كذلك.`;
  const id = String(node?.id || "");
  if (id.includes("nun") || id.includes("built") || id.includes("binaa")) return `انقر على الإجابة التي تثبت هل خرج (${target}) إلى البناء أم بقي في طريق الإعراب.`;
  if (id.includes("tool")) return `انقر على الإجابة التي تصف أثر ما قبل (${target}).`;
  if (id.includes("ending") || id.includes("weak")) return `انقر على الوصف المناسب لآخر (${target}).`;
  return "انقر على الاختيار المناسب للانتقال إلى الخطوة التالية.";
}

function answerDragLabel(mode: Mode) {
  return mode === "learn" ? "انقر" : "اختر";
}


function practiceQuestionShape(node: any, state: any): "match" | "drag" | "sort" | "cards" {
  const key = `${node?.id || ""}:${state?.currentTarget || ""}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 33 + key.charCodeAt(i)) >>> 0;
  const shapes: Array<"match" | "drag" | "sort" | "cards"> = ["match", "drag", "sort", "cards"];
  return shapes[hash % shapes.length];
}

function practiceShapeTitle(shape: "match" | "drag" | "sort" | "cards") {
  if (shape === "match") return "زاوج البطاقة بالإجابة المناسبة";
  if (shape === "drag") return "انقر على الإجابة المناسبة";
  if (shape === "sort") return "رتّب قرارك";
  return "اختر القرار المناسب";
}

function practiceShapeIcon(shape: "match" | "drag" | "sort" | "cards") {
  if (shape === "match") return "🔗";
  if (shape === "drag") return "↧";
  if (shape === "sort") return "🧩";
  return "🎴";
}


function practiceQuickDecisionText(node: any, state: any) {
  const target = String(state?.currentTarget || "الكلمة");
  const id = String(node?.id || "");
  const text = cleanQuestionText(node);
  if (id.includes("word") || id === "start") return `ما نوع (${target})؟`;
  if (id.includes("tense")) return `ما زمن (${target})؟`;
  if (id.includes("tool")) return `ما أثر ما قبل (${target})؟`;
  if (isFiveVerbDecision(node)) return `هل (${target}) من الأفعال الخمسة؟`;
  if (id.includes("ending")) return `ما حالة آخر (${target})؟`;
  if (id.includes("weak")) return `ما حرف العلة في آخر (${target})؟`;
  if (id.includes("khabar")) return `ما علاقة (${target}) بما قبلها؟`;
  if (id.includes("mubtada")) return `ما موقع (${target}) في الجملة؟`;
  if (id.includes("fael")) return `ما علاقة (${target}) بالفعل؟`;
  if (id.includes("mafool")) return `هل وقع الفعل على (${target})؟`;
  if (id.includes("kana")) return `ما موقع (${target}) بعد الناسخ؟`;
  if (id.includes("inna")) return `ما موقع (${target}) بعد الحرف الناسخ؟`;
  return text.replace(/اختر الإجابة الصحيحة مما يلي[:：]?/g, "").trim() || `اختر القرار المناسب لـ (${target})`;
}

function practiceStepLead(node: any, state: any, trail: string[] = []) {
  if (!trail.length) return "ابدأ من الكلمة المضيئة، ثم اختر القرار الأقرب للمعنى.";
  const last = trail[trail.length - 1];
  return `بنيتَ: ${last} ← أكمل القرار التالي.`;
}

function practiceWrongMicroHint(answer: any, node: any, state: any) {
  const specific = String(answer?.hint || answer?.feedback || "").trim();
  if (specific) return shortStudentText(specific, "راجع العلاقة في الجملة ثم اختر من جديد.");
  const target = String(state?.currentTarget || "الكلمة");
  const question = String(node?.text || "");
  if (question.includes("فاعل") || String(node?.id || "").includes("fael")) return `اسأل: من الذي قام بالفعل؟ هل هي (${target})؟`;
  if (question.includes("مفعول") || String(node?.id || "").includes("mafool")) return `اسأل: على من وقع الفعل؟ هل وقع على (${target})؟`;
  if (question.includes("خبر")) return `اسأل: هل (${target}) أتمت المعنى عن الاسم قبلها؟`;
  if (question.includes("آخر") || String(node?.id || "").includes("ending")) return `انظر إلى آخر (${target}) فقط.`;
  return "فكّر في علاقة الكلمة داخل الجملة، لا في الحفظ فقط.";
}

function answerEffectLabel(node: any, answer: any, state: any) {
  const id = String(node?.id || "");
  const text = String(answer?.text || "").trim();
  const yes = text.startsWith("نعم") || answer?.eval?.equals === true || Array.isArray(answer?.eval?.anyOf);
  const no = text === "لا" || text.startsWith("لا") || answer?.eval?.equals === false || answer?.eval?.equals === "none";

  // المضارع: نبني الحكم بالتدريج داخل مربع النتيجة.
  if (id === "present_nun_niswa") return yes ? "مبني: اتصل بنون النسوة" : "لا نون نسوة: نكمل فحص البناء";
  if (id === "present_nun_tawkid") return yes ? "مبني: اتصل بنون التوكيد" : "معرب (سنحدد لاحقًا: مرفوع أم منصوب أم مجزوم)";
  if (id === "present_has_tool") return yes ? "يوجد عامل قبل الفعل" : "مرفوع: لم يسبقه ناصب أو جازم";
  if (id === "present_tool_type") {
    if (text.includes("ناصب")) return "منصوب: سبقته أداة نصب";
    if (text.includes("جازم")) return "مجزوم: سبقته أداة جزم";
  }
  if (isFiveVerbDecision(node)) {
    const txt = String(node?.text || "") + " " + id;
    if (yes && !no && /jazm/.test(txt)) return "علامة جزمه حذف النون";
    if (yes && !no && /nasb/.test(txt)) return "علامة نصبه حذف النون";
    if (yes && !no && /raf3/.test(txt)) return "علامة رفعه ثبوت النون";
    return yes && !no ? "من الأفعال الخمسة" : "ليس من الأفعال الخمسة";
  }
  if (id.includes("ending")) {
    if (text.includes("صحيح")) return "صحيح الآخر";
    if (text.includes("معتل")) return "معتل الآخر";
  }
  if (id.includes("weak")) return `آخره ${text}`;

  // الماضي: الفعل مبني دائمًا، لكن علامة البناء تتغير بحسب الاتصال.
  if (id === "past_word_kind") return text.includes("فعل") ? "فعل" : text;
  if (id === "past_tense") return "فعل ماضٍ";
  if (id === "past_has_attachment") return yes && !no ? "اتصل بآخره شيء" : "لم يتصل بآخره شيء";
  if (id === "past_no_attachment_weak") return text.includes("ألف") ? "فتح مقدر على الألف" : "فتح ظاهر";
  if (id === "past_connector_kind") return text;
  if (id === "past_nasb_weak") return text.includes("ألف") ? "فتح مقدر على الألف" : "فتح ظاهر";
  if (id === "past_taa_weak") return yes && !no ? "حذف حرف علة" : "لا حذف";
  if (id === "past_weak_base_taa" || id === "past_weak_base_waw") return text;
  if (id === "past_deleted_letter_taa" || id === "past_deleted_letter_waw") return `المحذوف: ${text}`;
  if (id === "past_raf3_type") return text;
  if (id === "past_sukoon_raf3_type") return text;
  if (id === "past_has_pronoun") return yes && !no ? "اتصل بضمير" : "مبني على الفتح";
  if (id === "past_is_waw") return yes && !no ? "مبني على الضم" : "ليس واو الجماعة";
  if (id === "past_is_sukoon_set") return yes && !no ? "مبني على السكون" : "نبحث عن اتصال آخر";
  if (id === "past_sukoon_type") return text;
  if (id === "past_is_alif") return yes && !no ? "مبني على الفتح" : "مبني على الفتح";

  // الأمر: مبني دائمًا، والمؤثر يحدد علامة البناء.
  if (id === "imperative_word_kind") return text.includes("فعل") ? "فعل" : text;
  if (id === "imperative_meaning") return text.includes("طلب") ? "فعل أمر" : text;
  if (id === "imperative_connection") return yes && !no ? "اتصل بآخره شيء" : "لم يتصل بآخره شيء";
  if (id === "imperative_attached_kind") return text;
  if (id === "imperative_ending") return text.includes("معتل") ? "معتل الآخر" : "صحيح الآخر";
  if (id === "imperative_weak_letter") return `المحذوف: ${text}`;
  if (id === "imp_nun_tawkid") return yes && !no ? "مبني على الفتح" : "نبحث عن مؤثر آخر";
  if (id === "imp_five") return yes && !no ? "مبني على حذف النون" : "ليس من هذا الاتصال";
  if (id === "imp_ending") return text.includes("معتل") ? "مبني على حذف حرف العلة" : "مبني على السكون";

  // الأسماء وبقية المرحلة الأولى.
  if (text.includes("أداة ناصبة") || text.includes("أداة نصب")) return "منصوب";
  if (text.includes("أداة جازمة") || text.includes("أداة جزم")) return "مجزوم";
  if (text.includes("مرفوع")) return "مرفوع";
  if (text.includes("منصوب")) return "منصوب";
  if (text.includes("مجزوم")) return "مجزوم";
  if (text.includes("معرب")) return "معرب";
  if (text.includes("مبني")) return "مبني";
  return text || "اختيارك";
}

function buildVisibleResultDraft(tree: any, state: any, currentNode: any, dropped?: { text: string; tone: "idle" | "ok" | "bad" } | null) {
  const pieces: string[] = [];
  const nodes = tree?.nodes || {};
  Object.entries(state?.answers || {}).forEach(([nodeId, answerId]) => {
    const rawNode = nodes[nodeId as string];
    const n = normalizeThinkingNode(rawNode, state);
    const a = n?.answers?.find((x: any) => x.id === answerId);
    const label = answerEffectLabel(n, a, state);
    const normalizedLabel = String(label || "").trim();
    const isNegativeRelation = normalizedLabel.startsWith("لا ") || normalizedLabel.includes("ليس ") || normalizedLabel.includes("ليست ");
    if (normalizedLabel && !isNegativeRelation && !pieces.includes(normalizedLabel)) pieces.push(normalizedLabel);
  });
  if (dropped?.text && dropped.tone !== "bad" && !pieces.includes(dropped.text)) pieces.push(dropped.text);
  return pieces;
}

function sentenceForDialogue(state: any) {
  const sentence = String(state?.currentSentence || "").trim();
  return sentence ? `«${sentence}»` : "هذه الجملة";
}

function targetForDialogue(state: any) {
  return String(state?.currentTarget || "الكلمة المحددة").trim();
}

function finalI3rabSubject(tree: any, title?: string) {
  const start = String(tree?.startNodeId || "");
  const t = String(title || "");
  if (start.includes("present") || start.includes("past") || start.includes("imp") || t.includes("الفعل")) return "الفعل";
  if (t.includes("الاسم") || t.includes("المبتدأ") || t.includes("الخبر") || t.includes("كان") || t.includes("إن")) return "الكلمة";
  return "الكلمة";
}


function bridgeKickerText(tree: any, node: any, state: any, title?: string, completedPieces: string[] = []) {
  const target = targetForDialogue(state);
  const start = String(tree?.startNodeId || "");
  const nodeId = String(node?.id || "");
  const last = completedPieces[completedPieces.length - 1];

  if (!last) {
    if (start.includes("present")) {
      return `نبدأ من الكلمة المحددة (${target}) دون افتراض إعرابها: أولًا نحدد نوعها ثم زمنها.`;
    }
    if (start.includes("past")) {
      return `نبدأ من الكلمة المحددة (${target}) دون افتراض زمنها: أولًا نحدد هل هي فعل أم اسم أم حرف.`;
    }
    if (start.includes("imp")) {
      return `نبدأ من الكلمة المحددة (${target}) دون افتراض نوعها: أولًا نحدد نوع الكلمة ثم دلالة الفعل.`;
    }
    if (start.includes("inna") || String(title || "").includes("إن")) {
      return `مسار إن وأخواتها: نبدأ من موقع (${target}) بعد دخول الحرف الناسخ، ثم نحدد الصورة والعلامة.`;
    }
    if (start.includes("khabar")) {
      return `مسار الخبر: نبدأ من وظيفة (${target}) بالنسبة إلى المبتدأ، لا من المصطلح مباشرة.`;
    }
    if (start.includes("tawabi")) {
      return `نبدأ من (${target}) ككلمة قد تكون تابعة: هل ارتبطت باسم قبلها، أم أدت وظيفة مستقلة في الجملة؟`;
    }
    if (String(title || "").includes("الجملة الاسمية") || start.includes("nominal") || start.includes("mubtada")) {
      return `لكي نعرب (${target}) نبدأ بما نلاحظه في الجملة نفسها.`;
    }
    return `نبدأ إعراب (${target}) بخطوة صغيرة واحدة.`;
  }

  if (node?.type === "result") return `اكتمل المسار؛ لنرتب الإعراب الذي بنيناه خطوة خطوة.`;

  let next = "نكمل خطوة إعراب جديدة";
  if (start.includes("present")) {
    if (nodeId === "present_tense") next = "عرفنا أنها فعل؛ نحدد زمنها الآن";
    else if (nodeId === "present_build_check") next = "بما أنه فعل مضارع، نحدد أولًا: هل هو مبني أم معرب";
    else if (nodeId === "present_tool_presence") next = "عرفنا أنه معرب؛ ننظر الآن إلى العامل قبله";
    else if (nodeId.includes("_shape")) next = "حددنا حالته الإعرابية؛ نحدد صورته لنعرف العلامة";
    else if (nodeId.includes("weak_letter")) next = "عرفنا أنه معتل الآخر؛ نحدد حرف العلة";
    else next = "نكمل مسار الفعل المضارع خطوة خطوة";
  } else if (start.includes("past")) {
    if (nodeId === "past_tense") next = "عرفنا أنه فعل؛ نحدد زمنه الآن";
    else if (nodeId === "past_has_attachment") next = "بما أن الفعل ماضٍ، والفعل الماضي مبني، نحدد علامة البناء حسب ما يتصل به";
    else if (nodeId === "past_connector_kind") next = "عرفنا أن آخر الفعل اتصل به شيء، فلنحدد ما هو لنعرف علامة البناء";
    else if (nodeId === "past_raf3_type") next = "نحدد صورة ضمير الرفع لأنها تحدد علامة البناء";
    else if (nodeId.includes("waw") || nodeId.includes("weak") || nodeId.includes("deleted")) next = "نستعمل الإسناد إلى هو عند وجود حذف حقيقي";
    else if (nodeId.includes("sukoon")) next = "نكمل تحديد ضمير الرفع المتحرك";
    else next = "نكمل تحديد علامة البناء";
  } else if (start.includes("imp")) {
    if (nodeId === "imperative_meaning") next = "عرفنا أنها فعل؛ نحدد هل هي طلب أم لا";
    else if (nodeId === "imperative_connection") next = "عرفنا أنه فعل أمر؛ نحدد علامة البناء من الاتصال أو آخر الفعل";
    else if (nodeId === "imperative_attached_kind") next = "نحدد المتصل لأنه يحدد علامة البناء";
    else if (nodeId === "imperative_ending") next = "لم يتصل بآخره شيء؛ ننظر إلى آخر الفعل";
    else if (nodeId === "imperative_weak_letter") next = "نرده إلى مضارعه لمعرفة حرف العلة المحذوف";
    else if (nodeId.includes("five")) next = "نكمل فنفحص الاتصال";
    else if (nodeId.includes("ending") && !nodeId.includes("kana") && !nodeId.includes("inna")) next = "نكمل فننظر إلى آخر الفعل";
    else next = "نكمل تحديد علامة البناء";
  } else if (start.includes("inna") || String(title || "").includes("إن")) {
    if (nodeId.includes("target")) next = "نكمل فنحدد صورة العنصر بعد إن";
    else if (nodeId.includes("khabar_kind")) next = "نكمل فنحدد صورة خبر إن";
    else if (nodeId.includes("number")) next = "نكمل فنختار العلامة المناسبة";
    else next = "نكمل مسار إن وأخواتها";
  } else if (start.includes("tawabi")) {
    if (nodeId === "tawabi_relation") next = "نكمل فنحدد نوع العلاقة مع الاسم السابق";
    else if (nodeId === "tawabi_term") next = "نكمل فنسمّي العلاقة باسمها النحوي";
    else if (nodeId === "tawabi_follow_source") next = "نكمل فنحدد المتبوع الذي يأخذ منه التابع حكمه";
    else if (nodeId === "tawabi_case") next = "نكمل فنحدد حالة المتبوع: رفعًا أو نصبًا أو جرًّا";
    else if (nodeId === "tawabi_form") next = "نكمل فنحدد صورة التابع: اسم، جملة، أو شبه جملة";
    else if (nodeId === "tawabi_shape") next = "نكمل فنحدد صورة التابع المعرب";
    else if (nodeId === "tawabi_mark") next = "نكمل فنختار العلامة المناسبة";
    else next = "نكمل مسار التوابع من العلاقة إلى الإعراب";
  }

  return `عرفنا: ${last}. أُضيفت هذه النتيجة إلى مسار التفكير؛ ${next} في (${target}).`;
}

function topicKindForDialogue(tree: any, title?: string) {
  const start = String(tree?.startNodeId || "");
  const t = String(title || "");
  if (start.includes("present")) return "فعلًا مضارعًا";
  if (start.includes("past")) return "فعلًا ماضيًا";
  if (start.includes("imp")) return "فعل أمر";
  if (t.includes("الخبر") || start.includes("khabar") || start.includes("nominal")) return "كلمة في الجملة الاسمية";
  if (t.includes("المبتدأ") || start.includes("mubtada")) return "الكلمة المحددة";
  if (t.includes("كان")) return "عنصرًا في باب كان وأخواتها";
  if (t.includes("إن")) return "عنصرًا في باب إن وأخواتها";
  if (t.includes("الفاعل")) return "الكلمة المحددة";
  if (t.includes("المفعول")) return "مفعولًا به";
  if (start.includes("tawabi") || t.includes("النعت") || t.includes("العطف") || t.includes("التوكيد") || t.includes("البدل") || t.includes("التوابع")) return "تابعًا محتملًا";
  return "الكلمة المحددة";
}

function openingDialogueLine(tree: any, node: any, state: any, title?: string) {
  const sentence = sentenceForDialogue(state);
  const target = targetForDialogue(state);
  const start = String(tree?.startNodeId || "");
  const nodeId = String(node?.id || "");
  const kind = topicKindForDialogue(tree, title);

  if (start.includes("present")) {
    if (nodeId === "present_word_kind") return `نركز على (${target}) في الجملة. ما نوع الكلمة المحددة؟`;
    if (nodeId === "present_tense") return `عرفنا أن (${target}) فعل. ما زمنه؟`;
    if (nodeId === "present_build_check") return `عرفنا أن (${target}) فعل مضارع. والمضارع قد يكون مبنيًا أو معربًا. هل اتصل به ما يجعله مبنيًا؟`;
    if (nodeId === "present_tool_presence") return `بما أن (${target}) لم يتصل به ما يبنيه، فهو معرب. ننظر إلى ما قبله: هل سبقه ناصب أو جازم؟`;
    if (nodeId === "present_raf3_shape") return `لم يسبق (${target}) ناصب ولا جازم، إذن هو مرفوع. نحدد صورته لنعرف علامة رفعه.`;
    if (nodeId === "present_nasb_shape") return `سبق (${target}) حرف نصب، إذن هو منصوب. نحدد صورته لنعرف علامة نصبه.`;
    if (nodeId === "present_jazm_shape") return `سبق (${target}) حرف جزم، إذن هو مجزوم. نحدد صورته لنعرف علامة جزمه.`;
    if (nodeId === "present_raf3_weak_letter" || nodeId === "present_nasb_weak_letter") return `عرفنا أن (${target}) فعل معتل الآخر. ما حرف العلة في آخر أصله؟`;
    if (nodeId === "present_jazm_weak_letter") return `عرفنا أن (${target}) فعل معتل الآخر مجزوم. ما حرف العلة المحذوف من آخره؟`;
    if (nodeId === "present_nun_niswa") {
      return `نبدأ بالفعل (${target}): هل اتصل بنون النسوة؟`;
    }
    if (nodeId === "present_nun_tawkid") {
      return `نكمل بسؤال قصير: هل اتصل الفعل (${target}) بنون التوكيد؟`;
    }
    if (nodeId === "present_has_tool") {
      return `بما أن الفعل (${target}) بقي معربًا، نسأل الآن: هل سبقه ناصب أو جازم؟`;
    }
    if (nodeId === "present_tool_type") {
      return `وجدنا أداة قبل الفعل (${target}). هل هي أداة نصب أم أداة جزم؟`;
    }
    if (isFiveVerbDecision(node)) {
      return `هل الفعل (${target}) من الأفعال الخمسة: اتصل بواو الجماعة أو ياء المخاطبة أو ألف الاثنين؟`;
    }
    if (nodeId.includes("ending")) {
      return `بعد استبعاد الأفعال الخمسة ننظر إلى آخر الفعل (${target}): هل هو صحيح الآخر أم معتل الآخر؟`;
    }
    if (nodeId.includes("weak")) {
      return `ننظر إلى آخر أصل الفعل (${target}) في جملة ${sentence}: ما حرف العلة؟`;
    }
  }

  if (start.includes("past")) {
    if (nodeId === "past_word_kind") return `انظر إلى الكلمة المحددة (${target}) في جملة ${sentence}: ما نوعها؟`;
    if (nodeId === "past_tense") return `عرفنا أن (${target}) فعل. ما زمنه؟`;
    if (nodeId === "past_has_attachment") return `بما أن (${target}) فعل ماضٍ، والفعل الماضي مبني، نحتاج الآن إلى تحديد علامة بنائه حسب ما يتصل به. هل اتصل بآخره شيء؟`;
    if (nodeId === "past_connector_kind") return `عرفنا أن آخر الفعل (${target}) اتصل به شيء، فلنحدد ما هو لنعرف علامة البناء. فهل اتصل الفعل بـ:`;
    if (nodeId === "past_no_attachment_weak") return `لم يتصل بآخر الفعل (${target}) شيء. ننظر الآن إلى آخره لنحدد علامة البناء.`;
    if (nodeId === "past_nasb_weak") return `عرفنا أن المتصل ضمير نصب، وهو لا يغيّر بناء الفعل. ننظر الآن إلى أصل الفعل قبل الضمير.`;
    if (nodeId === "past_taa_weak") return `عرفنا أن المتصل تاء التأنيث الساكنة، وهي لا تغيّر بناء الفعل. هل هناك حرف علة محذوف من آخر الفعل؟`;
    if (nodeId === "past_weak_base_taa") return `لنعرف الحرف المحذوف في (${target})، نسنده إلى الضمير هو في الزمن الماضي. ما صورته مع هو؟`;
    if (nodeId === "past_deleted_letter_taa") return `ما حرف العلة المحذوف من آخر (${target})؟`;
    if (nodeId === "past_raf3_type") return `عرفنا أن المتصل ضمير رفع أضمر الفاعل. أي ضمير رفع اتصل بالفعل (${target})؟`;
    if (nodeId === "past_sukoon_raf3_type") return `عرفنا أن الفعل (${target}) اتصل بضمير رفع متحرك يبنيه على السكون. أي ضمير هو؟`;
    if (nodeId === "past_weak_base_waw") return `لنعرف الحرف المحذوف قبل واو الجماعة في (${target})، نسنده إلى الضمير هو في الماضي. ما صورته مع هو؟`;
    if (nodeId === "past_deleted_letter_waw") return `ما حرف العلة المحذوف قبل واو الجماعة في (${target})؟`;
  }

  if (start.includes("imp")) {
    if (nodeId === "imperative_word_kind") return `نركز على (${target}) في جملة ${sentence}. ما نوع الكلمة المحددة؟`;
    if (nodeId === "imperative_meaning") return `عرفنا أن (${target}) فعل. ما دلالته هنا؟`;
    if (nodeId === "imperative_connection") return `عرفنا أن (${target}) يدل على طلب حصول الحدث، إذن هو فعل أمر. وفعل الأمر مبني دائمًا؛ هل اتصل بآخره شيء؟`;
    if (nodeId === "imperative_attached_kind") return `عرفنا أن (${target}) اتصل بآخره شيء. ما نوع هذا المتصل؟`;
    if (nodeId === "imperative_ending") return `عرفنا أن (${target}) لم يتصل بآخره شيء. ننظر إلى آخره: هل هو صحيح الآخر أم معتل الآخر؟`;
    if (nodeId === "imperative_weak_letter") return `عرفنا أن (${target}) فعل أمر معتل الآخر. نرده إلى مضارعه لنعرف حرف العلة المحذوف؛ ما هو؟`;
  }

  if (start.includes("kana") || String(title || "").includes("كان")) {
    const facts = state?.facts || {};
    const targetText = String(target || "الكلمة المحددة");
    const sentenceText = String(sentence || "الجملة");
    if (nodeId === "kana_factor_gate") {
      return `ننظر إلى الفعل الناسخ في جملة ${sentenceText}. نريد أن نعرف نوعه قبل بيان أثره في الجملة. أيُّ الخيارات الآتية يصف نوع الفعل الناسخ؟`;
    }
    if (nodeId === "kana_naskh_explain") {
      return `عرفنا أن كان أو إحدى أخواتها فعل. الآن نثبت معنى النسخ: ما الحكم الجديد الذي فرضته على المبتدأ والخبر بعد دخولها؟`;
    }
    if (nodeId === "kana_target") {
      if (facts.targetRole === "hidden_ism") {
        return `في جملة ${sentenceText} ركّز على الفعل الناسخ (${targetText}). هل ظهر بعده اسم صريح؟ أم نفهم اسم الفعل الناسخ من السياق؟`;
      }
      if (facts.targetRole === "ism") {
        if (targetText.includes("ت")) return `المطلوب إعراب التاء في جملة ${sentenceText}. على مَن تدل هذه التاء؟ هل هي ضمير يدل على صاحب المعنى بعد الفعل الناسخ، أم مجرد علامة؟`;
        if (String(facts.ending || "") === "attached_ya") return `المطلوب إعراب (${targetText}) في جملة ${sentenceText}. انظر إلى الكلمة: هل الياء من أصل الكلمة، أم ضمير متصل أضيف إلى الاسم؟ وما علاقة الاسم بالفعل الناسخ؟`;
        if (sentenceText.includes("ليس")) return `المطلوب إعراب (${targetText}) في جملة ${sentenceText}. ما الشيء الذي وقع عليه معنى النفي في (ليس)؟ اختر العلاقة الأقرب قبل ذكر المصطلح.`;
        return `المطلوب إعراب (${targetText}) في جملة ${sentenceText}. ما علاقة هذا الاسم بالفعل الناسخ؟ هل هو الذي كان/أصبح/صار في معنى الجملة، أم هو الذي أتم معنى الجملة؟`;
      }
      if (facts.sentenceType === "verbal") {
        return `المطلوب إعراب (${targetText}) في جملة ${sentenceText}. هل المحدد يدل على حدث مقترن بزمن؟ ثم اسأل: عمّن أخبر هذا الحدث في الجملة؟`;
      }
      if (facts.khabarKind === "shibh") {
        return `المطلوب إعراب (${targetText}) في جملة ${sentenceText}. ما علاقة هذا التركيب بالاسم قبله؟ هل أتمّ المعنى عنه ببيان مكان أو ظرف، أم قام بفعل، أم وقع عليه فعل؟`;
      }
      if (facts.nounKind === "masdar") {
        return `المطلوب إعراب (${targetText}) في جملة ${sentenceText}. هل هذا التركيب يمكن أن يحل محل اسم؟ افحص: هل سبق الفعل حرف مصدري مثل (أن)؟`;
      }
      return `المطلوب إعراب (${targetText}) في جملة ${sentenceText}. ما علاقة الكلمة بما قبلها؟ هل أتمت المعنى عنه، أم قامت بفعل، أم وقع عليها فعل؟`;
    }
    if (nodeId === "kana_ism_start") {
      if (targetText.includes("ت")) return `عرفنا أن التاء دلت على صاحب المعنى بعد الفعل الناسخ. الآن نحدد طبيعتها: هل هي اسم معرب، أم اسم مبني، أم مصدر مؤول؟`;
      if (String(facts.ending || "") === "attached_ya") return `بعد أن عرفنا أن (${targetText}) اسم الفعل الناسخ، نفكك الكلمة قبل الحكم على آخرها: هل هي اسم معرب، أم اسم مبني، أم مصدر مؤول؟`;
      return `بما أننا عرفنا علاقة (${targetText}) بالفعل الناسخ، نحدد طبيعته الآن: هل هو اسم معرب، أم اسم مبني، أم مصدر مؤول؟`;
    }
    if (nodeId === "kana_ism_built") {
      if (targetText.includes("ت")) return `التاء دلت على المتكلم، وما دل على متكلم أو مخاطب أو غائب يسمى ضميرًا. ولأنها اتصلت بما قبلها فهي ضمير متصل. أيُّ الخيارات الآتية يصف نوع هذا الاسم المبني؟`;
      return `بما أن (${targetText}) اسم مبني، نحدد نوعه من الكلمة نفسها. أيُّ الخيارات الآتية يصف نوع هذا الاسم المبني؟`;
    }
    if (nodeId === "kana_ism_number") {
      return `بما أن (${targetText}) اسم معرب، نفحص صورته قبل اختيار العلامة. أيُّ الخيارات الآتية يصف صورة هذا الاسم؟`;
    }
    if (nodeId === "kana_ism_ending") {
      return `بعد تحديد صورة (${targetText}) ننظر إلى الحرف الأصلي الأخير، لا إلى التنوين أو العلامات الزائدة.`;
    }
    if (nodeId === "kana_khabar_entry" || nodeId === "kana_khabar_kind") {
      if (facts.sentenceType === "verbal") return `عرفنا أن (${targetText}) يدل على حدث وزمن. هل هو فعل مع فاعل ظاهر أو مستتر فيكون جملة فعلية، أم اسم مفرد؟`;
      if (facts.khabarKind === "shibh") return `بعد أن عرفنا أن (${targetText}) أتم المعنى عن الاسم قبله، نحدد صورته: هل هو جار ومجرور أو ظرف؟`;
      if (facts.nounKind === "masdar") return `انظر إلى (${targetText}): هل هو تركيب من حرف مصدري وفعل يؤول باسم، مثل: أن أتميز = تميزي؟`;
      return `بعد أن عرفنا أن (${targetText}) أتم المعنى بعد اسم الفعل الناسخ، ما طبيعته في هذا المثال؟`;
    }
    if (nodeId === "kana_khabar_single_start") {
      if (facts.nounKind === "masdar") return `بما أن (${targetText}) يؤول باسم، نحدد طبيعته: هل هو مصدر مؤول، أم اسم ظاهر معرب، أم اسم مبني؟`;
      return `بما أن (${targetText}) أتم المعنى باسم أو تركيب يؤول باسم، نحدد الآن: هل هو اسم معرب، أم اسم مبني، أم مصدر مؤول؟`;
    }
    if (nodeId === "kana_khabar_single_built") {
      return `بما أن (${targetText}) اسم مبني، نحدد نوع المبني من الكلمة نفسها. أيُّ الخيارات الآتية يصف نوع هذا الاسم المبني؟`;
    }
    if (nodeId === "kana_khabar_single_number") {
      return `بما أن (${targetText}) اسم معرب، نفحص صورة الاسم قبل علامة النصب. أيُّ الخيارات الآتية يصف صورة هذا الاسم؟`;
    }
    if (nodeId === "kana_khabar_single_ending") {
      return `بعد تحديد صورة (${targetText}) ننظر إلى الحرف الأصلي الأخير. إن ظهرت ألف تنوين النصب فلا نحسبها من أصل الكلمة. أيُّ الخيارات الآتية يصف حالة آخر الكلمة؟`;
    }
    if (nodeId === "kana_khabar_sentence_type") {
      return `عرفنا أن (${targetText}) جملة كاملة لا كلمة واحدة. هل بدأت هذه الجملة باسم أم بفعل؟`;
    }
    if (nodeId === "kana_khabar_shibh_type") {
      return `عرفنا أن (${targetText}) شبه جملة. أيُّ الخيارات الآتية يصف نوعها: جار ومجرور أم ظرف؟`;
    }
  }
  if (start.includes("inna") || String(title || "").includes("إن")) {
    const facts = state?.facts || {};
    const targetText = String(target || "الكلمة المحددة");
    const sentenceText = String(sentence || "الجملة");
    const semanticQuestion = String(facts.semanticQuestion || "ما المعنى الذي أفاده الحرف الناسخ؟");
    const judgmentText = String(facts.meaningJudgment || "الجملة الأصلية").replace(/\.$/, "");
    const subjectText = String(facts.meaningSubject || "الاسم الأول").replace(/\.$/, "");
    const particleLabel = String(facts.particleLabel || "إن");
    if (nodeId === "inna_meaning") {
      return semanticQuestion;
    }
    if (nodeId === "inna_compact_role") {
      const particleName = innaParticleName(state);
      const meaningLabel = innaParticleMeaningLabel(state);
      return `${particleLabel} تفيد ${meaningLabel}، وهي حرف ناسخ دخل على الجملة الاسمية: ${judgmentText}؛ فيجعل المبتدأ اسم ${particleName} منصوبًا، والخبر خبر ${particleName} مرفوعًا.
الكلمة المطلوبة إعرابها: ${targetText}
هل هي بعد دخول ${particleLabel}:`;
    }
    if (nodeId === "inna_sentence_start") {
      return `بعد أن فهمنا المعنى: (${judgmentText})، نرجع إلى أصل الجملة كلها قبل دخول ${particleLabel}. أصل التركيب بدأ بكلمة أو تركيب (${innaBaseFirstWord(state)})، وهو ماذا؟`;
    }
    if (nodeId === "inna_base_mubtada") {
      if (innaIsConnectedPronounTarget(targetText)) return `في الأصل (${judgmentText}) كان المعنى: (${subjectText}). ما موقع الضمير المتصل الذي دل على الاسم؟`;
      return `في الجملة الأصلية (${judgmentText})، ما موقع الكلمة المحددة (${targetText}) قبل دخول ${particleLabel}؟`;
    }
    if (nodeId === "inna_after_nasikh_effect") {
      return `عندما دخلت ${particleLabel} على الجملة الاسمية، ماذا أصبح المبتدأ الذي حددناه؟`;
    }
    if (nodeId === "inna_after_khabar_effect") {
      return `عندما دخلت ${particleLabel} على الجملة الاسمية، ماذا أصبح الخبر الذي حددناه؟`;
    }
    if (nodeId === "inna_preposed_shibh_effect") {
      return `في الأصل (${judgmentText}) بدأ التركيب بشبه جملة. بعد دخول ${particleLabel}، كيف نعامل هذا التقديم؟`;
    }
    if (nodeId === "inna_factor_gate") {
      return `ننظر إلى الحرف الناسخ في جملة ${sentenceText}. نريد أن نعرف أثره قبل العلامة النهائية: ما الحكم الذي فرضته إن وأخواتها على الاسم والخبر؟`;
    }
    if (nodeId === "inna_target") {
      if (facts.targetRole === "ism") {
        if (innaIsConnectedPronounTarget(targetText)) return `المطلوب إعراب الضمير المتصل في جملة ${sentenceText}. على مَن يدل الضمير؟ وما موقعه بعد دخول الحرف الناسخ؟`;
        if (String(targetText).includes("أن")) return `المطلوب إعراب (${targetText}) في جملة ${sentenceText}. ما الشيء المؤكد أو المحكوم عليه بعد إن؟ ما موقع هذا التركيب بعد دخول الحرف الناسخ؟`;
        return `المطلوب إعراب (${targetText}) في جملة ${sentenceText}. هل هي اسم الحرف الناسخ أم خبره؟`;
      }
      return `المطلوب إعراب (${targetText}) في جملة ${sentenceText}. هل هي الخبر الذي أتم المعنى بعد اسم الحرف الناسخ؟`;
    }
    if (nodeId === "inna_ism_start") {
      if (innaIsConnectedPronounTarget(targetText)) return `عرفنا أن الضمير المتصل صار اسم ${particleLabel}. والضمير من الأسماء المبنية، لا من الحروف. الآن نحدد طبيعته قبل الإعراب النهائي.`;
      return `عرفنا أن (${targetText}) صار اسم ${particleLabel}. الآن نحدد صورته قبل الإعراب النهائي.`;
    }
    if (nodeId === "inna_ism_built") {
      if (innaIsConnectedPronounTarget(targetText)) return `هذا الضمير دل على متكلم أو مخاطب أو غائب، والضمائر من الأسماء المبنية. ولأنه اتصل بما قبله فهو ضمير متصل. ما نوع هذا الاسم المبني؟`;
      return `بما أن (${targetText}) اسم مبني في محل نصب اسم إن، نحدد نوعه من الكلمة نفسها.`;
    }
    if (nodeId === "inna_ism_number") {
      return `بما أن (${targetText}) اسم إن معرب منصوب، نفحص صورته قبل اختيار علامة النصب.`;
    }
    if (nodeId === "inna_ism_ending") {
      return `بعد تحديد صورة (${targetText}) ننظر إلى الحرف الأصلي الأخير، لا إلى التنوين أو العلامات الزائدة.`;
    }
    if (nodeId === "inna_khabar_kind") {
      return `عرفنا أن (${targetText}) خبر ${particleLabel}. ما صورة هذا الخبر في المثال: مفرد، أم جملة، أم شبه جملة؟`;
    }
    if (nodeId === "inna_khabar_single_start") {
      return `عرفنا أن (${targetText}) خبر إن مفرد؛ أي ليس جملة ولا شبه جملة. الآن نحدد طبيعته قبل الإعراب النهائي.`;
    }
    if (nodeId === "inna_khabar_single_built") {
      return `بما أن (${targetText}) اسم مبني في محل رفع خبر إن، نحدد نوع المبني من الكلمة نفسها.`;
    }
    if (nodeId === "inna_khabar_single_number") {
      return `بما أن (${targetText}) خبر إن معرب مرفوع، نفحص صورة الاسم قبل علامة الرفع.`;
    }
    if (nodeId === "inna_khabar_single_ending") {
      return `بعد تحديد صورة (${targetText}) ننظر إلى الحرف الأصلي الأخير. لا نحكم من التنوين أو العلامات الزائدة.`;
    }
    if (nodeId === "inna_khabar_sentence_type") {
      return `عرفنا أن (${targetText}) جملة كاملة في محل رفع خبر إن. كيف بدأت جملة الخبر؟`;
    }
    if (nodeId === "inna_khabar_shibh_type") {
      return `عرفنا أن (${targetText}) شبه جملة في محل رفع خبر إن. ما نوع شبه الجملة هنا؟`;
    }
  }

  if (start.includes("khabar")) {
    if (nodeId === "khabar_meaning_gate") {
      return `لكي نعرب (${target}) في جملة ${sentence} نبدأ بالسؤال: ما وظيفة الكلمة أو التركيب المحدد بالنسبة إلى المبتدأ؟`;
    }
    if (nodeId === "khabar_kind") {
      return `بما أننا عرفنا أن (${target}) أخبرت عن المبتدأ وأتمت المعنى، فهي خبر. نسأل الآن: هل الخبر كلمة واحدة، أم جملة، أم شبه جملة؟`;
    }
    if (nodeId === "khabar_single_start") {
      return `بما أننا عرفنا أن الخبر هنا كلمة واحدة، والخبر مرفوع أو في محل رفع، نسأل: هل هو اسم معرب، أم اسم مبني، أم مصدر مؤول؟`;
    }
    if (nodeId === "khabar_single_built") {
      return `بما أننا عرفنا أن الخبر اسم مبني، نحدد نوع الاسم المبني قبل الإعراب النهائي: أهو ضمير، أم اسم إشارة، أم اسم موصول؟`;
    }
    if (nodeId === "khabar_masdar_discovery") {
      return `بما أننا وصلنا إلى احتمال المصدر المؤول، نختبره بالتحويل: لو حولنا (${target}) إلى مصدر صريح، فماذا يصبح؟`;
    }
    if (nodeId === "khabar_single_number") {
      return `بما أننا عرفنا أن الخبر اسم معرب مرفوع، نحدد صورة الاسم: مفرد أم مثنى أم جمع أم من الأسماء الخمسة؟`;
    }
    if (nodeId === "khabar_single_ending") {
      return `بما أننا عرفنا صورة الاسم، بقي أن ننظر إلى آخره: هل تظهر الضمة أم تقدر؟`;
    }
    if (nodeId === "khabar_sentence_type") {
      return `بما أننا عرفنا أن الخبر جملة كاملة، فالجملة كلها في محل رفع خبر. نسأل: هل بدأت جملة الخبر باسم أم بفعل؟`;
    }
    if (nodeId === "khabar_shibh_type") {
      return `بما أننا عرفنا أن الخبر شبه جملة، نحدد نوعه: هل هو جار ومجرور أم ظرف؟`;
    }
    if (nodeId === "khabar_shibh_position_jar") {
      return `بما أننا عرفنا أنه جار ومجرور، نسأل: هل جاء بعد المبتدأ أم تقدم على مبتدأ نكرة مثل: في البيت رجل؟`;
    }
    if (nodeId === "khabar_shibh_position_zarf") {
      return `بما أننا عرفنا أنه ظرف، نسأل: هل جاء بعد المبتدأ أم تقدم على مبتدأ نكرة مثل: عندنا ضيف؟`;
    }
    return `${String(node?.context || "نكمل مسار الخبر.").replace(/[.،]+$/, "")}؛ ${cleanQuestionText(node)}`;
  }

  if (start.includes("present")) {
    if (nodeId === "present_word_kind") {
      return `نركز على (${target}) في جملة ${sentence}. ما نوع الكلمة المحددة؟`;
    }
    if (nodeId === "present_tense") {
      return `عرفنا أن (${target}) فعل. ما زمنه؟`;
    }
    if (nodeId === "present_build_check") {
      return `عرفنا أن (${target}) فعل مضارع. والفعل المضارع قد يكون مبنيًا أو معربًا. هل اتصل به ما يجعله مبنيًا؟`;
    }
    if (nodeId === "present_tool_presence") {
      return `عرفنا أن (${target}) فعل مضارع معرب. لننظر إلى ما قبله: هل سبق الفعل ناصب أو جازم؟`;
    }
    if (nodeId.includes("_shape")) {
      return `عرفنا حالته الإعرابية، والآن نحدد علامته من صورة الفعل (${target}). ما صورة الفعل؟`;
    }
    if (nodeId === "present_jazm_weak_letter") {
      return `عرفنا أن (${target}) فعل مضارع مجزوم معتل الآخر، وقد حُذف حرف العلة. ما حرف العلة المحذوف؟`;
    }
    if (nodeId.includes("weak_letter")) {
      return `عرفنا أن (${target}) فعل مضارع معتل الآخر. ما حرف العلة في آخره؟`;
    }
    return `${String(node?.context || "نكمل مسار المضارع.").replace(/[.،]+$/, "")}؛ ${cleanQuestionText(node)}`;
  }

  if (start.includes("fael") || String(title || "").includes("الفاعل")) {
    const facts = state?.facts || {};
    const roleKind = String(facts.roleKind || "");
    const contextType = String(facts.contextType || "");
    const nominalSubject = String(facts.nominalSubject || "");
    const verbalKhabar = String(facts.verbalKhabar || "");
    const actionQuestion = String(facts.actionQuestion || "");

    if (nodeId === "fael_context") {
      return `ما السياق الذي ورد فيه المحدد (${target})؟`;
    }
    if (nodeId === "fael_role_verbal") {
      if (contextType === "nominal_connected") {
        return `بما أن الجملة بدأت باسم فهي جملة اسمية، وخبرها جملة فعلية: (${verbalKhabar || "الفعل وما بعده"}). لنحدد دور (${target}) داخل جملة الخبر. اختر الدور المناسب:`;
      }
      if (roleKind === "masdar") {
        return `بما أن التركيب (${target}) ورد في جملة فعلية، فلنحدد دوره في المعنى. اختر الدور المناسب:`;
      }
      return `بما أن الكلمة وردت في جملة فعلية، فلنحدد دورها في هذه الجملة. ما دور (${target}) في الجملة؟`;
    }
    if (nodeId === "fael_role_hidden") {
      return `عرفنا أن الفعل (${target}) يحتاج إلى فاعل. فإذا لم يظهر بعده اسم قام بالفعل، نبحث عن ضمير مستتر داخل الفعل. ${actionQuestion || "من الذي فعل؟"}`;
    }
    if (nodeId === "fael_hidden_estimate") {
      return `بما أن الفاعل ضمير مستتر، نحدد تقديره من معنى الجملة وصيغة الفعل. اختر التقدير المناسب:`;
    }
    if (nodeId === "fael_hukm") {
      return `بما أن (${target}) فاعل، فالفاعل يكون:`;
    }
    if (nodeId === "fael_form") {
      return `بما أن المحدد (${target}) هو الفاعل، فلنحدد صورته لنستطيع تحديد طريقة إعرابه. اختر الصورة المناسبة للمحدد (${target}):`;
    }
    if (nodeId === "fael_mu3rab_shape") {
      return `بما أن (${target}) هو الفاعل المعرب، فلنحدد صورته لنستطيع تحديد علامة رفعه. اختر الصورة المناسبة لكلمة (${target}):`;
    }
    if (nodeId === "fael_raf3_mark") {
      return `بما أن (${target}) فاعل مرفوع، وقد عرفنا صورته، اختر علامة الرفع المناسبة:`;
    }
    if (nodeId === "fael_mabni_type") {
      return `بما أن المحدد (${target}) مبني، فلنحدد نوعه. اختر النوع المناسب:`;
    }
  }

  if (start.includes("mafool") || String(title || "").includes("المفعول")) {
    const facts = state?.facts || {};
    const roleKind = String(facts.roleKind || "");
    const objectQuestion = String(facts.objectQuestion || "على من أو على ماذا وقع الفعل؟");

    if (nodeId === "mafool_context") {
      return `ما السياق الذي ورد فيه المحدد (${target})؟`;
    }
    if (nodeId === "mafool_role") {
      if (roleKind === "masdar") {
        return `بما أن التركيب (${target}) ورد في جملة فعلية، فلنحدد دوره في المعنى. اختر الدور المناسب:`;
      }
      return `بما أن الكلمة وردت في جملة فعلية، فلنحدد دورها في هذه الجملة. ما دور (${target}) في الجملة؟`;
    }
    if (nodeId === "mafool_hukm") {
      return `بما أن (${target}) مفعول به، فالمفعول به يكون:`;
    }
    if (nodeId === "mafool_form") {
      return `بما أن المحدد (${target}) هو المفعول به، فلنحدد صورته لنستطيع تحديد طريقة إعرابه. اختر الصورة المناسبة للمحدد (${target}):`;
    }
    if (nodeId === "mafool_mu3rab_shape") {
      return `بما أن (${target}) هو المفعول به المعرب، فلنحدد صورته لنستطيع تحديد علامة نصبه. اختر الصورة المناسبة لكلمة (${target}):`;
    }
    if (nodeId === "mafool_nasb_mark") {
      return `بما أن (${target}) مفعول به منصوب، وقد عرفنا صورته، اختر علامة النصب المناسبة:`;
    }
    if (nodeId === "mafool_mabni_type") {
      return `بما أن المحدد (${target}) مبني، فلنحدد نوعه. اختر النوع المناسب:`;
    }
  }

  if (start.includes("tawabi")) {
    if (nodeId === "tawabi_entry") {
      return `ننظر إلى (${target}) في جملة ${sentence}. قبل أن نسميها نعتًا أو عطفًا أو توكيدًا أو بدلًا: هل هي مرتبطة باسم قبلها أم تؤدي وظيفة أخرى؟`;
    }
    if (nodeId === "tawabi_relation") {
      return `بما أن (${target}) مرتبطة باسم قبلها، نحدد نوع العلاقة: هل وصفت الاسم، أم شاركته بحرف عطف، أم أكدته، أم أوضحت المقصود منه؟`;
    }
    if (nodeId === "tawabi_term") {
      return `عرفنا العلاقة بالمعنى. الآن نسمّيها نحويًا: ما المصطلح المناسب لعلاقة (${target}) بما قبلها؟`;
    }
    if (nodeId === "tawabi_tawkid_kind") {
      return `عرفنا أن (${target}) أكدت ما قبلها. كيف أكدت الكلمة ما قبلها؟ اختر الإجابة الصحيحة:`;
    }
    if (nodeId === "tawabi_follow_source") {
      return `بما أن (${target}) تابع، فإعرابه لا يبدأ من حركته وحدها. من أين يأخذ حالته الإعرابية؟`;
    }
    if (nodeId === "tawabi_case") {
      return `ننظر إلى المتبوع قبل (${target}). ما الحالة الإعرابية التي أخذها التابع من متبوعه؟`;
    }
    if (nodeId === "tawabi_form") {
      return `عرفنا حالة (${target}) من المتبوع. الآن نحدد صورته: هل هو اسم ظاهر معرب، أم اسم مبني، أم جملة، أم شبه جملة؟`;
    }
    if (nodeId === "tawabi_shape") {
      return `بما أن (${target}) تابع معرب، نحدد صورته قبل العلامة: مفرد، مثنى، جمع، أم من الأسماء الخمسة؟`;
    }
    if (nodeId === "tawabi_mark") {
      return `عرفنا الحالة والصورة. ما علامة الإعراب المناسبة لـ(${target})؟`;
    }
  }

  if (start.includes("mubtada")) {
    if (nodeId === "mubtada_word_type") {
      const isPhrase = String(target || "").includes(" ");
      const subjectLabel = isPhrase ? "التركيب المحدد" : "الكلمة المطلوبة";
      const occurrenceText = isPhrase ? "وقع التركيب المحدد" : "وقعت الكلمة المطلوبة";
      const pronounText = isPhrase ? "وظيفته النحوية أو إعرابه" : "وظيفتها النحوية أو إعرابها";
      return `المطلوب إعراب (${target}) في جملة ${sentence}. ${occurrenceText} في أول الجملة. قبل تحديد ${pronounText} نحتاج أولًا إلى معرفة النوع. أيُّ الخيارات الآتية يصف نوع ${subjectLabel}؟`;
    }
    if (nodeId === "mubtada_function_gate") {
      const subjectLabel = String(target || "").includes(" ") ? "التركيب" : "كلمة";
      return `عرفنا أن (${target}) اسم أو في معنى الاسم. الآن ننظر إلى دوره في الجملة. أيُّ الخيارات الآتية يصف دور ${subjectLabel} (${target}) في هذه الجملة؟`;
    }
    if (nodeId === "mubtada_start") {
      return `بما أن (${target}) اسم أو في معنى الاسم وبدأنا الحديث عنه، فهو يؤدي وظيفة المبتدأ. أيُّ الخيارات الآتية يصف صورة المبتدأ هنا؟`;
    }
    if (nodeId === "mubtada_built") {
      return `بما أن (${target}) اسم مبني في موقع المبتدأ، لا نبحث عن ضمة على آخره، بل نحدد نوعه. أيُّ الخيارات الآتية يصف نوع هذا الاسم المبني؟`;
    }
    if (nodeId === "mubtada_number") {
      return `بما أن (${target}) اسم معرب مرفوع لأنه مبتدأ، نفحص صورته قبل اختيار علامة الرفع. أيُّ الخيارات الآتية يصف صورة هذا الاسم؟`;
    }
    if (nodeId === "mubtada_ending") {
      return `بعد تحديد صورة (${target})، ننظر إلى آخره لنقرر هل تظهر الضمة أو تقدر. أيُّ الخيارات الآتية يصف حالة آخر الكلمة؟`;
    }
  }

  return `لكي نعرب ${kind} في جملة ${sentence} نركز على (${target}) ونسأل: ${cleanQuestionText(node)}`;
}

const fiveNounWrongSingularHint = (word: string) =>
  `أحسنت، (${word}) يدل على واحد فعلًا، لكن في الإعراب لا نكتفي بقول: مفرد. إذا كان من الأسماء الخمسة واستوفى شروطها فإنه يعرب بالحروف: يرفع بالواو، وينصب بالألف، ويجر بالياء. عد للسؤال واختر: من الأسماء الخمسة.`;


function tawabiTermHintName(term?: string) {
  if (term === "naat") return "نعت";
  if (term === "atf") return "معطوف";
  if (term === "tawkid") return "توكيد";
  if (term === "badal") return "بدل";
  return "تابع";
}

function tawabiRelationHintName(kind?: string) {
  if (kind === "description") return "وصف";
  if (kind === "coordination") return "عطف ومشاركة في الحكم";
  if (kind === "emphasis") return "توكيد للمعنى";
  if (kind === "substitution") return "بدل يفسر المقصود";
  return "تبعية";
}

function tawabiCaseNounHint(i3rabCase?: string) {
  if (i3rabCase === "raf3") return "الرفع";
  if (i3rabCase === "nasb") return "النصب";
  if (i3rabCase === "jarr") return "الجر";
  return "الحالة الإعرابية";
}

function tawabiCaseStatusHint(i3rabCase?: string) {
  if (i3rabCase === "raf3") return "مرفوع";
  if (i3rabCase === "nasb") return "منصوب";
  if (i3rabCase === "jarr") return "مجرور";
  return "تابع";
}

function tawabiShapeNameHint(shape?: string) {
  if (shape === "singular") return "مفرد في العدد";
  if (shape === "dual") return "مثنى أو ملحق بالمثنى";
  if (shape === "jms") return "جمع مذكر سالم";
  if (shape === "jfs") return "جمع مؤنث سالم";
  if (shape === "jt") return "جمع تكسير";
  if (shape === "five") return "من الأسماء الخمسة";
  return "صورة التابع";
}

function tawabiMarkNameHint(mark?: string) {
  if (mark === "damma") return "الضمة";
  if (mark === "fatha") return "الفتحة";
  if (mark === "kasra") return "الكسرة";
  if (mark === "alif") return "الألف";
  if (mark === "yaa") return "الياء";
  if (mark === "waw") return "الواو";
  return "العلامة المناسبة";
}

function tawabiCorrectRelationHint(facts: any, targetText: string) {
  const matbu3 = String(facts?.matbu3 || "الاسم السابق");
  const reason = String(facts?.relationReason || "").trim();
  const connector = String(facts?.connector || "حرف العطف");
  const linkText = String(facts?.linkText || "رابط يعود على المنعوت");
  if (reason) return reason;
  if (facts?.relationKind === "description" && facts?.roleKind === "sentence") return `(${targetText}) جملة وصفت (${matbu3})، وشرط النعت الجملة أن يكون المنعوت نكرة وأن يوجد رابط؛ هنا الرابط: ${linkText}.`;
  if (facts?.relationKind === "description" && facts?.roleKind === "shibh") return `(${targetText}) شبه جملة وصف (${matbu3})، والتقدير غالبًا: كائن أو موجود.`;
  if (facts?.relationKind === "description") return `(${targetText}) يصف (${matbu3}) ويبين صفة فيه، لذلك العلاقة وصف.`;
  if (facts?.relationKind === "coordination") return `(${targetText}) جاء بعد ${connector} فشارك (${matbu3}) في الحكم، لذلك العلاقة عطف.`;
  if (facts?.relationKind === "emphasis") return `(${targetText}) لم يضف صفة جديدة، بل أكد (${matbu3}) أو شمول الحكم له.`;
  if (facts?.relationKind === "substitution") return `(${targetText}) يفسر المقصود من (${matbu3})، ويمكن غالبًا أن يحل محله في الجملة.`;
  return `(${targetText}) تابع لـ(${matbu3})، فابدأ بنوع العلاقة بينهما.`;
}

function tawabiCorrectShapeHint(facts: any, targetText: string) {
  const shape = String(facts?.shape || "");
  const caseName = tawabiCaseNounHint(facts?.case);
  if (shape === "singular") return `(${targetText}) يدل على واحد أو واحدة، وليس مثنى ولا جمعًا ولا من الأسماء الخمسة؛ لذلك صورته مفرد في العدد. انتبه: هذا غير مصطلح النعت المفرد الذي يعني ليس جملة ولا شبه جملة.`;
  if (shape === "dual") return `(${targetText}) يدل على اثنين أو هو ملحق بالمثنى، ولذلك يعرب بعلامات المثنى: الألف في الرفع والياء في النصب والجر.`;
  if (shape === "jms") return `(${targetText}) جمع مذكر سالم؛ يدل على جماعة ذكور عاقلة، وعلامته الواو في الرفع والياء في النصب والجر.`;
  if (shape === "jfs") return `(${targetText}) جمع مؤنث سالم؛ ينتهي بألف وتاء زائدتين، ويرفع بالضمة وينصب ويجر بالكسرة.`;
  if (shape === "jt") return `(${targetText}) جمع تكسير؛ يدل على جماعة مع تغير صورة المفرد، ويعرب غالبًا بالحركات.`;
  if (shape === "five") return `(${targetText}) من الأسماء الخمسة، وشروطها هنا متحققة: مفردة، مضافة، ومضافة إلى غير ياء المتكلم؛ لذلك نعربها بالحروف.`;
  return `بعد أن أخذ التابع ${caseName} من المتبوع، نحدد صورة (${targetText}) لاختيار العلامة.`;
}

function tawabiCorrectMarkHint(facts: any, targetText: string) {
  const shape = String(facts?.shape || "");
  const mark = String(facts?.mark || "");
  const i3rabCase = String(facts?.case || "");
  if (i3rabCase === "raf3" && mark === "damma") return `(${targetText}) ${tawabiShapeNameHint(shape)} مرفوع؛ لذلك علامة رفعه الضمة. الحالة جاءت من المتبوع، أما الضمة فجاءت من صورة التابع.`;
  if (i3rabCase === "nasb" && mark === "fatha") return `(${targetText}) ${tawabiShapeNameHint(shape)} منصوب؛ لذلك علامة نصبه الفتحة. لا نأخذ العلامة من المتبوع مباشرة، بل من صورة التابع.`;
  if (i3rabCase === "jarr" && mark === "kasra") return `(${targetText}) ${tawabiShapeNameHint(shape)} مجرور؛ لذلك علامة جره الكسرة.`;
  if (shape === "jfs" && i3rabCase === "nasb" && mark === "kasra") return `(${targetText}) جمع مؤنث سالم منصوب؛ وجمع المؤنث السالم ينصب بالكسرة نيابة عن الفتحة.`;
  if (shape === "dual" && mark === "alif") return `(${targetText}) مثنى أو ملحق بالمثنى مرفوع؛ لذلك علامة رفعه الألف.`;
  if (shape === "dual" && mark === "yaa") return `(${targetText}) مثنى أو ملحق بالمثنى في حالة ${tawabiCaseNounHint(i3rabCase)}؛ لذلك علامته الياء.`;
  if (shape === "jms" && mark === "waw") return `(${targetText}) جمع مذكر سالم مرفوع؛ لذلك علامة رفعه الواو.`;
  if (shape === "jms" && mark === "yaa") return `(${targetText}) جمع مذكر سالم في حالة ${tawabiCaseNounHint(i3rabCase)}؛ لذلك علامته الياء.`;
  if (shape === "five" && mark === "waw") return `(${targetText}) من الأسماء الخمسة مرفوع؛ لذلك علامة رفعه الواو.`;
  if (shape === "five" && mark === "alif") return `(${targetText}) من الأسماء الخمسة منصوب؛ لذلك علامة نصبه الألف.`;
  if (shape === "five" && mark === "yaa") return `(${targetText}) من الأسماء الخمسة مجرور؛ لذلك علامة جره الياء.`;
  return `الحالة الصحيحة لـ(${targetText}) هي ${tawabiCaseNounHint(i3rabCase)}، وصورته ${tawabiShapeNameHint(shape)}؛ لذلك علامته ${tawabiMarkNameHint(mark)}.`;
}

function tawabiStudentHintText(node: any, picked?: any, state?: any) {
  const id = String(node?.id || "");
  const facts = state?.facts || {};
  const targetText = String(state?.currentTarget || "الكلمة المحددة").trim();
  const matbu3 = String(facts?.matbu3 || "الاسم السابق").trim();
  const matbu3Role = String(facts?.matbu3Role || "متبوع").trim();
  const pickedText = String(picked?.text || "").trim();
  const isHelp = !picked || pickedText.includes("تلميح");
  const correctRelation = tawabiCorrectRelationHint(facts, targetText);
  const correctTerm = tawabiTermHintName(facts?.tawabiTerm);
  const correctCase = tawabiCaseNounHint(facts?.case);
  const correctShape = tawabiCorrectShapeHint(facts, targetText);
  const correctMark = tawabiCorrectMarkHint(facts, targetText);
  const roleKind = String(facts?.roleKind || "mu3rab");

  if (id === "tawabi_entry") {
    if (isHelp) return `ابدأ من العلاقة لا من المصطلح: هل (${targetText}) يرجع إلى (${matbu3}) فيصفه أو يؤكده أو يشاركه أو يفسره؟ إذا نعم فهو داخل باب التوابع.`;
    if (pickedText.includes("مستقلًا")) return `(${targetText}) لا يؤدي هنا معنى مستقلًا كخبر أو ركن جديد؛ بل يرجع إلى (${matbu3}). ${correctRelation}`;
    if (pickedText.includes("هيئة")) return `الحال يجيب غالبًا عن سؤال: كيف وقع الفعل؟ أما (${targetText}) فليس بيان هيئة وقت الفعل، بل علاقته بـ(${matbu3}) هي: ${tawabiRelationHintName(facts?.relationKind)}.`;
    if (pickedText.includes("ملكية") || pickedText.includes("تخصيص")) return `المضاف إليه يكون مجرورًا بسبب الإضافة مثل: كتابُ الطالبِ. أما (${targetText}) فليس مضافًا إليه هنا؛ بل تابع لـ(${matbu3}) ويأخذ منه ${correctCase}.`;
    return correctRelation;
  }

  if (id === "tawabi_relation") {
    if (isHelp) return correctRelation;
    if (facts?.relationKind === "description" && !pickedText.includes("وصف")) return `ليست العلاقة هنا عطفًا أو توكيدًا أو بدلًا. (${targetText}) يصف (${matbu3}) أو يخصصه؛ لذلك العلاقة وصف، ومنها نصل إلى النعت.`;
    if (facts?.relationKind === "coordination" && !pickedText.includes("شارك")) return `ابحث قبل (${targetText}) عن حرف العطف. وجود ${facts?.connector || "حرف عطف"} جعلها تشارك (${matbu3}) في الحكم، لا تصفه ولا تؤكده.`;
    if (facts?.relationKind === "emphasis" && !pickedText.includes("أكد")) return `(${targetText}) لا يصف (${matbu3}) بصفة جديدة ولا يفسره، بل يقوي معناه أو يثبت شموله؛ لذلك العلاقة توكيد.`;
    if (facts?.relationKind === "substitution" && !pickedText.includes("فسر")) return `اختبر البدل: احذف (${matbu3}) وضع (${targetText}) مكانه. في هذا المثال تبقى الجملة مفهومة؛ لذلك العلاقة بدل، لا مجرد وصف أو توكيد.`;
    return correctRelation;
  }

  if (id === "tawabi_term") {
    const naatNote = facts?.tawabiTerm === "naat" ? " النعت المفرد يطابق منعوته في الإعراب والعدد والنوع والتعريف/التنكير، أما النعت الجملة أو شبه الجملة فيحتاج منعوتًا نكرة ورابطًا أو تقديرًا." : "";
    if (isHelp) return `العلاقة هي ${tawabiRelationHintName(facts?.relationKind)}؛ لذلك المصطلح المناسب هو: ${correctTerm}.${naatNote}`;
    if (!pickedText.includes(correctTerm)) return `المصطلح لا يُختار من الحركة. بما أن العلاقة بين (${targetText}) و(${matbu3}) هي ${tawabiRelationHintName(facts?.relationKind)}، فالمصطلح الصحيح: ${correctTerm}.${naatNote}`;
    return `صحيح؛ (${targetText}) ${correctTerm} لأن علاقته بـ(${matbu3}) هي ${tawabiRelationHintName(facts?.relationKind)}.${naatNote}`;
  }

  if (id === "tawabi_tawkid_kind") {
    const kind = String(facts?.tawkidKind || "");
    if (isHelp) return kind === "lafzi"
      ? `لاحظ أن (${targetText}) أعادت اللفظ نفسه؛ إذن هذا توكيد لفظي.`
      : `لاحظ أن (${targetText}) من ألفاظ التوكيد المعنوي، وفيها غالبًا ضمير يعود على المؤكَّد.`;
    if (kind === "lafzi" && !pickedText.includes("تكرار")) return `هنا حصل التوكيد بتكرار اللفظ نفسه، لا بلفظ من ألفاظ التوكيد المعنوي؛ إذن هو توكيد لفظي.`;
    if (kind === "manawi" && !pickedText.includes("ألفاظ")) return `هنا لم يتكرر اللفظ نفسه، بل جاءت كلمة من ألفاظ التوكيد المعنوي مثل: نفس، عين، كل، جميع، كلا، كلتا.`;
    return kind === "lafzi" ? "صحيح؛ هذا توكيد لفظي لأنه أعاد اللفظ." : "صحيح؛ هذا توكيد معنوي لأنه جاء بلفظ من ألفاظه.";
  }

  if (id === "tawabi_follow_source") {
    if (isHelp) return `لا تبدأ بعلامة آخر (${targetText}). أعرب المتبوع أولًا: (${matbu3}) ${matbu3Role}. إذن يأخذ التابع منه ${correctCase}.`;
    if (pickedText.includes("معناها")) return `المعنى أوصلنا إلى نوع التابع فقط، أما الرفع والنصب والجر فيؤخذ من المتبوع: (${matbu3}) ${matbu3Role}.`;
    if (pickedText.includes("حركة")) return `الحركة نتيجة نهائية. قد يتحد التابع مع المتبوع في الحالة لا في العلامة؛ مثل: الطلابُ المجتهدونَ. هنا نأخذ الحالة من (${matbu3}) أولًا.`;
    return `صحيح؛ التابع يأخذ حالته من المتبوع: (${matbu3}) ${matbu3Role}.`;
  }

  if (id === "tawabi_case") {
    if (isHelp) return `المتبوع هو (${matbu3})، وإعرابه: ${matbu3Role}. لذلك حالة (${targetText}) هي ${correctCase}.`;
    if (!pickedText.includes(correctCase.replace("ال", ""))) return `راجع المتبوع لا التابع وحده: (${matbu3}) ${matbu3Role}. إذن التابع يأخذ ${correctCase}، وليس ${pickedText}.`;
    return `صحيح؛ لأن (${matbu3}) ${matbu3Role}، أخذ (${targetText}) منه ${correctCase}.`;
  }

  if (id === "tawabi_form") {
    if (isHelp) {
      if (roleKind === "sentence") return `(${targetText}) جملة كاملة، لا نعرب الفعل أو الاسم الأول وحده. وهي نعت جملة لأن المنعوت (${matbu3}) نكرة، وفيها رابط: ${facts?.linkText || "ضمير يعود على المنعوت"}.`;
      if (roleKind === "shibh") return `(${targetText}) شبه جملة، والتقدير في النعت غالبًا: (${matbu3}) كائن أو موجود في هذا المكان/الظرف.`;
      if (roleKind === "mabni") return `(${targetText}) اسم مبني يلزم صورة واحدة؛ لذلك نقول: في محل ${correctCase} تابعًا لـ(${matbu3}).`;
      return `(${targetText}) اسم ظاهر معرب؛ لذلك نكمل إلى صورته ثم علامته. لا نقفز من الحالة إلى العلامة قبل معرفة الصورة.`;
    }
    if (roleKind === "sentence" && !pickedText.includes("جملة")) return `داخل (${targetText}) قد ترى فعلًا أو اسمًا، لكن المطلوب هو التركيب كله. هذا نعت جملة في محل ${correctCase}؛ لأنه جاء بعد نكرة وفيه رابط يعود على (${matbu3}).`;
    if (roleKind === "shibh" && !pickedText.includes("شبه")) return `(${targetText}) ليس اسمًا واحدًا ولا جملة تامة؛ إنه شبه جملة: ظرف أو جار ومجرور، في محل ${correctCase} نعت.`;
    if (roleKind === "mu3rab" && !pickedText.includes("معرب")) return `(${targetText}) كلمة ظاهرة تتغير علامتها، وليست اسمًا مبنيًا ولا جملة ولا شبه جملة؛ لذلك نختار: اسم ظاهر معرب.`;
    if (roleKind === "mabni" && !pickedText.includes("مبني")) return `(${targetText}) اسم مبني؛ لا تظهر عليه علامة الإعراب، بل يكون في محل ${correctCase} تابعًا للمتبوع.`;
    return String(picked?.hint || node?.hint || "حدد صورة التابع من الكلمة أو التركيب المحدد.");
  }

  if (id === "tawabi_shape") {
    if (isHelp) return correctShape;
    if (pickedText.includes("مفرد") && facts?.shape !== "singular") {
      if (facts?.shape === "five") return `صحيح أن (${targetText}) يدل على واحد، لكنه من الأسماء الخمسة في الإعراب، لا مفرد عادي؛ لذلك يعرب بالحروف.`;
      return `(${targetText}) ليس مفردًا في هذه الخطوة؛ صورته الصحيحة: ${tawabiShapeNameHint(facts?.shape)}. ${correctShape}`;
    }
    if (pickedText.includes("مثنى") && facts?.shape !== "dual") return `المثنى يدل على اثنين أو ما يلحق بهما. أما (${targetText}) فصورته الصحيحة: ${tawabiShapeNameHint(facts?.shape)}.`;
    if (pickedText.includes("جمع مذكر") && facts?.shape !== "jms") return `جمع المذكر السالم يدل على جماعة ذكور عاقلة وينتهي بواو ونون أو ياء ونون. أما (${targetText}) فصورته: ${tawabiShapeNameHint(facts?.shape)}.`;
    if (pickedText.includes("جمع مؤنث") && facts?.shape !== "jfs") return `جمع المؤنث السالم ينتهي غالبًا بألف وتاء زائدتين. أما (${targetText}) فصورته: ${tawabiShapeNameHint(facts?.shape)}.`;
    if (pickedText.includes("جمع تكسير") && facts?.shape !== "jt") return `جمع التكسير تتغير فيه صورة المفرد. أما (${targetText}) فصورته: ${tawabiShapeNameHint(facts?.shape)}.`;
    if (pickedText.includes("الأسماء الخمسة") && facts?.shape !== "five") return `الأسماء الخمسة هي: أب، أخ، حم، فو، ذو، بشروطها. أما (${targetText}) فصورته: ${tawabiShapeNameHint(facts?.shape)}.`;
    return correctShape;
  }

  if (id === "tawabi_mark") {
    if (isHelp) return correctMark;
    const pickedMark = pickedText.includes("الضمة") ? "damma" : pickedText.includes("الفتحة") ? "fatha" : pickedText.includes("الكسرة") ? "kasra" : pickedText.includes("الألف") ? "alif" : pickedText.includes("الياء") ? "yaa" : pickedText.includes("الواو") ? "waw" : "";
    if (pickedMark && pickedMark !== facts?.mark) {
      return `ليست ${pickedText} هنا. القاعدة: الحالة من المتبوع، والعلامة من صورة التابع. (${targetText}) حالته ${correctCase} وصورته ${tawabiShapeNameHint(facts?.shape)}؛ لذلك علامته ${tawabiMarkNameHint(facts?.mark)}.`;
    }
    return correctMark;
  }

  return String(picked?.hint || node?.hint || correctRelation);
}

const isFiveNounFact = (facts?: any) =>
  facts?.number === "five" || facts?.ending === "five" || facts?.nounClass === "five" || facts?.i3rabClass === "five";

function studentHintText(node: any, picked?: any, state?: any) {
  const id = String(node?.id || "");
  const target = state?.currentTarget || "الفعل";
  const pickedTextGlobal = String(picked?.text || "");
  const currentTargetGlobal = String(state?.currentTarget || target || "الكلمة المحددة");

  if (id.startsWith("tawabi_")) {
    return tawabiStudentHintText(node, picked, state);
  }

  if (id.startsWith("mafool_")) {
    const facts = state?.facts || {};
    const pickedText = String(picked?.text || "").trim();
    const sentence = String((state as any)?.currentSentence || "").trim();
    const targetText = String(state?.currentTarget || "الكلمة المحددة").trim();
    const firstWord = sentence.replace(/[.؟!،]/g, " ").trim().split(/\s+/)[0] || "أول كلمة";
    const roleKind = String(facts.roleKind || "");
    const shape = String(facts.shape || "");
    const nasbMark = String(facts.nasbMark || "");
    const objectQuestion = String(facts.objectQuestion || "على من أو على ماذا وقع الفعل؟");
    const actor = String(facts.actor || "الفاعل");
    const pronounMeaning = String(facts.pronounMeaning || "");
    const taweel = String(facts.taweel || "المصدر المؤول");
    const fiveConditions = "مفردة، مضافة، ومضافة إلى غير ياء المتكلم";

    if (id === "mafool_context") {
      if (pickedText.includes("جملة اسمية")) {
        return `انظر إلى بداية الجملة: (${firstWord}). هذه كلمة تدل على حدث وزمن، فهي فعل. والجملة التي تبدأ بالفعل غالبًا تكون جملة فعلية.`;
      }
      return `انظر إلى أول الجملة: هل بدأت بفعل يدل على حدث وزمن؟ بعد ذلك نبحث عن الفاعل، ثم عمّا وقع عليه الفعل.`;
    }

    if (id === "mafool_role") {
      if (pickedText === "فعل") {
        if (roleKind === "masdar") {
          return `داخل (${targetText}) يوجد فعل فعلًا، لكننا لا نعرب الفعل وحده هنا؛ نعرب التركيب كله. هذا التركيب يؤول بمصدر في معنى اسم: (${taweel}). لذلك ننظر إلى دوره في الجملة ونسأل: ${objectQuestion}`;
        }
        if (roleKind === "connected") {
          return `الفعل هو كلمة الحدث والزمن. أما (${targetText}) فهو ضمير متصل داخل الفعل. لا تحكم من شكله فقط؛ اسأل: ${objectQuestion} ستجد أن الضمير دل على من وقع عليه الفعل${pronounMeaning ? `، ومعناه: ${pronounMeaning}` : ""}.`;
        }
        return `الفعل يدل على حدث وزمن، مثل: كتبَ أو رأى. أما (${targetText}) فهو اسم أو في معنى الاسم. اسأل: ${objectQuestion}`;
      }
      if (pickedText === "فاعل") {
        if (roleKind === "connected") {
          return `الفاعل هو من قام بالفعل، وفي هذا المثال الفاعل هو (${actor}). أما (${targetText}) فهو ضمير دل على من وقع عليه الفعل. اسأل: ${objectQuestion}`;
        }
        if (roleKind === "masdar") {
          return `الفاعل هو من قام بالفعل. أما التركيب (${targetText}) فهو الشيء الذي وقع عليه فعل المحبة أو الرجاء أو الكراهية. اسأل: ${objectQuestion} والتقدير: (${taweel}).`;
        }
        return `الفاعل هو من قام بالفعل، وهنا الفاعل هو (${actor}). أما (${targetText}) فهو الشيء أو الشخص الذي وقع عليه الفعل. اسأل: ${objectQuestion}`;
      }
      return `لتمييز المفعول به نسأل بعد معرفة الفعل والفاعل: ${objectQuestion} الجواب هو المفعول به.`;
    }

    if (id === "mafool_hukm") {
      if (pickedText.includes("مرفوع")) return `الرفع يناسب الفاعل غالبًا؛ لأنه من قام بالفعل. أما (${targetText}) فقد عرفنا أنه مفعول به؛ أي وقع عليه الفعل، لذلك حكمه النصب أو في محل نصب.`;
      if (pickedText.includes("مجرور")) return `الجر يكون بعد حرف جر أو بالإضافة. أما المفعول به فلا نجرّه من غير حرف جر؛ حكمه النصب أو في محل نصب.`;
      return `المفعول به حكمه النصب. فإن كان اسمًا معربًا ظهرت علامة النصب، وإن كان مبنيًا أو مصدرًا مؤولًا قلنا: في محل نصب.`;
    }

    if (id === "mafool_form") {
      if (pickedText.includes("مصدر") && roleKind !== "masdar") return `المصدر المؤول تركيب يؤول بمصدر مثل: أن تنجحَ = نجاحَك، وما فعلتَ = فعلَك. انظر إلى (${targetText}): هل هو تركيب مؤول أم كلمة/ضمير؟`;
      if (pickedText.includes("ظاهر") && roleKind !== "visible") {
        if (roleKind === "connected") return `(${targetText}) ضمير متصل، والضمائر المتصلة من الأسماء المبنية. لا تظهر عليها علامة نصب مثل (الواجبَ)، بل نقول: ضمير متصل مبني في محل نصب مفعول به. نعرف ذلك بسؤال: ${objectQuestion}${pronounMeaning ? ` والجواب يدل عليه الضمير، ومعناه: ${pronounMeaning}.` : "."}`;
        if (roleKind === "masdar") return `(${targetText}) ليس اسمًا ظاهرًا تظهر عليه فتحة مثل (الواجبَ)، بل تركيب يؤول بمصدر في معنى اسم: (${taweel}). لذلك لا نبحث عن فتحة ظاهرة، بل نقول: مصدر مؤول في محل نصب مفعول به.`;
        return `الاسم الظاهر المعرب تظهر عليه علامة نصب أو علامة نيابة. أما (${targetText}) فاسم مبني، لذلك نقول: في محل نصب.`;
      }
      if (pickedText.includes("مبني") && !["mabni", "connected"].includes(roleKind)) return `الاسم المبني يلزم صورة واحدة مثل: هذا، الذي، والضمائر المتصلة. انظر إلى (${targetText}): هل يلزم صورة ثابتة أم هو اسم ظاهر معرب؟`;
      if (pickedText.includes("تلميح")) {
        if (roleKind === "visible") return `(${targetText}) اسم ظاهر معرب: كلمة مستقلة وليست ضميرًا متصلًا، وليست اسمًا مبنيًا مثل (هذا/الذي)، وليست تركيبًا مؤولًا. لذلك نكمل معها لتحديد صورتها ثم علامة نصبها.`;
        if (roleKind === "mabni") return `(${targetText}) اسم مبني؛ يلزم صورة واحدة ولا تظهر عليه فتحة نصب مثل (الواجبَ). لذلك نحدد نوعه، ثم نقول: اسم مبني في محل نصب مفعول به.`;
        if (roleKind === "connected") return `(${targetText}) ضمير متصل، والضمائر المتصلة من الأسماء المبنية. اسأل: ${objectQuestion}${pronounMeaning ? ` الجواب يدل عليه الضمير، ومعناه: ${pronounMeaning}.` : ""} لذلك يكون في محل نصب مفعول به.`;
        if (roleKind === "masdar") return `(${targetText}) تركيب يؤول بمصدر في معنى اسم: (${taweel}). والمصدر المؤول ليس اسمًا مبنيًا؛ لذلك نقول: مصدر مؤول في محل نصب مفعول به.`;
      }
      return `انظر إلى (${targetText}) نفسها: إن كانت اسمًا ظاهرًا معربًا نكمل إلى علامة النصب، وإن كانت اسمًا مبنيًا أو ضميرًا متصلًا نقول: في محل نصب، وإن كانت تركيبًا مؤولًا نقول: مصدر مؤول في محل نصب.`;
    }

    if (id === "mafool_mu3rab_shape") {
      const correctShapeHint = (() => {
        if (shape === "singular") return `(${targetText}) اسم ظاهر معرب يدل على شيء واحد، وليس مثنى ولا جمعًا ولا من الأسماء الخمسة؛ لذلك صورته مفرد، والمفرد ينصب بالفتحة.`;
        if (shape === "dual") return `(${targetText}) يدل على اثنين، وانتهى بياء ونون لأنه منصوب؛ لذلك صورته مثنى، والمثنى ينصب بالياء.`;
        if (shape === "jms") return `(${targetText}) يدل على جماعة ذكور عاقلة، وانتهى بياء ونون لأنه منصوب؛ لذلك صورته جمع مذكر سالم، وجمع المذكر السالم ينصب بالياء.`;
        if (shape === "jfs") return `(${targetText}) جمع مؤنث سالم؛ لأنه جمع مؤنث مختوم بألف وتاء زائدتين، وجمع المؤنث السالم ينصب بالكسرة نيابة عن الفتحة.`;
        if (shape === "jt") return `(${targetText}) جمع تكسير؛ لأنه يدل على جماعة مع تغيّر صورة المفرد عند الجمع مثل: قصة ← قصص، وجمع التكسير ينصب بالفتحة.`;
        if (shape === "five") return `(${targetText}) من الأسماء الخمسة، وقد تحققت شروط إعرابها بالحروف: ${fiveConditions}. لذلك لا نعاملها كمفرد عادي، بل نختار: من الأسماء الخمسة، وعلامة نصبها الألف.`;
        return `انظر إلى (${targetText}) نفسها: هل تدل على واحد، أم اثنين، أم جماعة؟ وهل هي من الأسماء الخمسة؟ صورة الكلمة هي التي تقودنا إلى علامة النصب.`;
      })();
      if (pickedText.includes("تلميح")) return correctShapeHint;
      if (pickedText.includes("مفرد") && shape !== "singular") {
        if (shape === "dual") return `(${targetText}) ليست مفردًا؛ لأنها تدل على اثنين، وانتهت بياء ونون لأنها منصوبة؛ لذلك صورتها مثنى.`;
        if (shape === "jms") return `(${targetText}) ليست مفردًا؛ لأنها تدل على جماعة ذكور عاقلة، وانتهت بياء ونون لأنها منصوبة؛ لذلك صورتها جمع مذكر سالم.`;
        if (shape === "jfs") return `(${targetText}) ليست مفردًا؛ لأنها تدل على جماعة إناث، وانتهت بألف وتاء زائدتين؛ لذلك صورتها جمع مؤنث سالم.`;
        if (shape === "jt") return `(${targetText}) ليست مفردًا؛ لأنها جمع تكسير تغيّرت فيه صورة المفرد عند الجمع؛ لذلك صورتها جمع تكسير.`;
        if (shape === "five") return `صحيح أن (${targetText}) يدل على واحد، لكنه ليس مفردًا عاديًا في الإعراب مثل (الواجبَ). هو من الأسماء الخمسة، وقد تحققت شروط إعرابه بالحروف: ${fiveConditions}. لذلك نختار: من الأسماء الخمسة.`;
      }
      if (pickedText.includes("الأسماء الخمسة") && shape !== "five") return `الأسماء الخمسة هي: أب، أخ، حم، فو، ذو، وتعرب بالحروف إذا كانت مفردة، مضافة، ومضافة إلى غير ياء المتكلم. أما (${targetText}) فليست من هذا الباب في هذا المثال؛ ${correctShapeHint}`;
      if (pickedText.includes("مثنى") && shape !== "dual") return `المثنى يدل على اثنين أو اثنتين وينصب بالياء. افحص (${targetText}) في هذا المثال: ${correctShapeHint}`;
      if (pickedText.includes("جمع مذكر") && shape !== "jms") return `جمع المذكر السالم يدل على جماعة ذكور عاقلة وينصب بالياء. افحص (${targetText}) في هذا المثال: ${correctShapeHint}`;
      if (pickedText.includes("جمع مؤنث") && shape !== "jfs") return `جمع المؤنث السالم ينتهي غالبًا بألف وتاء زائدتين وينصب بالكسرة نيابة عن الفتحة. افحص (${targetText}) في هذا المثال: ${correctShapeHint}`;
      if (pickedText.includes("جمع تكسير") && shape !== "jt") return `جمع التكسير تتغير فيه صورة المفرد عند الجمع مثل: قصة ← قصص. افحص (${targetText}) في هذا المثال: ${correctShapeHint}`;
      return correctShapeHint;
    }

    if (id === "mafool_nasb_mark") {
      const correctMarkHint = (() => {
        if (shape === "singular") return `(${targetText}) مفرد منصوب؛ لذلك علامة نصبه الفتحة الظاهرة على آخره.`;
        if (shape === "dual") return `(${targetText}) مثنى منصوب؛ والمثنى ينصب بالياء، لذلك علامة نصبه الياء.`;
        if (shape === "jms") return `(${targetText}) جمع مذكر سالم منصوب؛ وجمع المذكر السالم ينصب بالياء، لذلك علامة نصبه الياء.`;
        if (shape === "jfs") return `(${targetText}) جمع مؤنث سالم منصوب؛ وجمع المؤنث السالم ينصب بالكسرة نيابة عن الفتحة، لذلك علامة نصبه الكسرة.`;
        if (shape === "jt") return `(${targetText}) جمع تكسير منصوب؛ وجمع التكسير ينصب بالفتحة مثل المفرد العادي، لذلك علامة نصبه الفتحة.`;
        if (shape === "five") return `(${targetText}) من الأسماء الخمسة، وقد تحققت شروط إعرابه بالحروف: ${fiveConditions}؛ لذلك علامة نصبه الألف.`;
        return `اختر علامة النصب من صورة (${targetText}) نفسها.`;
      })();
      if (pickedText.includes("تلميح")) return correctMarkHint;
      if (pickedText.includes("الفتحة") && nasbMark !== "fatha") {
        if (shape === "five") return `الفتحة علامة نصب المفرد العادي مثل: الواجبَ. أما (${targetText}) فمن الأسماء الخمسة، وقد تحققت شروط إعرابه بالحروف: ${fiveConditions}؛ لذلك علامة نصبه الألف.`;
        if (shape === "jfs") return `لا ننصب (${targetText}) بالفتحة؛ لأنه جمع مؤنث سالم، وجمع المؤنث السالم ينصب بالكسرة نيابة عن الفتحة.`;
        if (shape === "dual") return `لا ننصب (${targetText}) بالفتحة؛ لأنه مثنى، والمثنى ينصب بالياء.`;
        if (shape === "jms") return `لا ننصب (${targetText}) بالفتحة؛ لأنه جمع مذكر سالم، وجمع المذكر السالم ينصب بالياء.`;
        return correctMarkHint;
      }
      if (pickedText.includes("الياء") && nasbMark !== "yaa") return `الياء علامة نصب المثنى وجمع المذكر السالم. أما (${targetText}) فليست من هاتين الصورتين هنا؛ ${correctMarkHint}`;
      if (pickedText.includes("الكسرة") && nasbMark !== "kasra") return `الكسرة هنا علامة نصب جمع المؤنث السالم نيابة عن الفتحة. أما (${targetText}) فليست جمع مؤنث سالم في هذا المثال؛ ${correctMarkHint}`;
      if (pickedText.includes("الألف") && nasbMark !== "alif") return `الألف علامة نصب الأسماء الخمسة إذا استوفت شروطها. أما (${targetText}) فليست من الأسماء الخمسة في هذا المثال؛ ${correctMarkHint}`;
      return correctMarkHint;
    }

    if (id === "mafool_mabni_type") {
      if (roleKind === "connected" && !pickedText.includes("ضمير")) return `المحدد (${targetText}) ضمير متصل داخل الفعل. والضمائر المتصلة من الأسماء المبنية؛ لذلك نحدد نوعه: ضمير متصل. اسأل: ${objectQuestion}${pronounMeaning ? ` والجواب يدل عليه الضمير، ومعناه: ${pronounMeaning}.` : ""}`;
      if (pickedText.includes("ضمير") && roleKind !== "connected") return `الضمير المتصل يكون جزءًا متصلًا بالفعل مثل الهاء في كتبَهُ والياء في ساعدَني ونا في شكرَنا. افحص (${targetText}) هل هو ضمير متصل أم اسم مبني آخر؟`;
      if (pickedText.includes("إشارة") && facts.mabniType !== "ishara") return `اسم الإشارة مثل: هذا وهذه. افحص (${targetText}) هل يدل بالإشارة، أم أنه نوع آخر من المبنيات؟`;
      if (pickedText.includes("موصول") && facts.mabniType !== "mawsool") return `الاسم الموصول مثل: الذي والتي، وتأتي بعده صلة توضحه. افحص (${targetText}) هل هو اسم موصول؟`;
      return String(picked?.hint || node?.hint || "اختر نوع الاسم المبني من الكلمة نفسها.");
    }

    const pickedHint = String(picked?.hint || "").trim();
    if (pickedHint) return pickedHint;
    return node?.hint || "اتبع المسار: السياق ثم الدور ثم حكم المفعول به ثم صورته وعلامته.";
  }
  if (id.startsWith("fael_")) {
    const facts = state?.facts || {};
    const pickedText = String(picked?.text || "").trim();
    const sentence = String((state as any)?.currentSentence || "").trim();
    const targetText = String(state?.currentTarget || "الكلمة المحددة").trim();
    const firstWord = sentence.replace(/[.؟!،]/g, " ").trim().split(/\s+/)[0] || "أول كلمة";
    const roleKind = String(facts.roleKind || "");
    const contextType = String(facts.contextType || "");
    const nominalSubject = String(facts.nominalSubject || firstWord || "الاسم الأول");
    const verbalKhabar = String(facts.verbalKhabar || "الجملة الفعلية داخل الخبر");
    const pronounMeaning = String(facts.pronounMeaning || "");
    const connectedType = String(facts.connectedType || "");
    const actionQuestion = String(facts.actionQuestion || "من الذي فعل؟");
    const fiveConditions = "مفردة، مضافة، ومضافة إلى غير ياء المتكلم";

    if (id === "fael_context") {
      if (facts.specialContext === "istifham" && pickedText.includes("جملة اسمية")) {
        return `(${targetText}) هنا اسم استفهام له الصدارة، وليس فعلًا. لكن بعده فعل ظاهر هو (حضرَ)، و(${targetText}) يسأل عن الشخص الذي قام بالحضور. لذلك نتعامل مع الفعل وفاعله في السؤال.`;
      }
      if (pickedText.includes("جملة اسمية") && (contextType === "verbal" || contextType === "verbal_hidden")) {
        return `انظر إلى بداية الجملة: (${firstWord}). هذه كلمة تدل على حدث وزمن، فهي فعل. والجملة التي تبدأ بالفعل غالبًا تكون جملة فعلية.`;
      }
      if (pickedText.includes("جملة فعلية") && contextType === "nominal_with_verb") {
        return `بدأت الجملة باسم: (${firstWord})، فهي جملة اسمية. لكن داخل خبرها فعل هو (${targetText}) يحتاج إلى فاعل، وسنبحث عنه في الخطوة التالية.`;
      }
      if (pickedText.includes("جملة فعلية") && contextType === "nominal_connected") {
        return `بدأت الجملة باسم: (${firstWord})، فهي جملة اسمية. لكن خبرها جاء جملة فعلية: (${verbalKhabar}). داخل هذه الجملة الفعلية نبحث عن فاعل الفعل.`;
      }
      return `انظر إلى أول الجملة فقط: هل بدأت بفعل يدل على حدث وزمن، أم بدأت باسم؟ اختر السياق العام، واترك التفاصيل للتلميح.`;
    }

    if (id === "fael_role_verbal") {
      if (pickedText === "فعل") {
        if (roleKind === "masdar") {
          const q = targetText.includes("ما فعلت") ? "ما الذي أعجبني؟" : "ما الذي سرّني؟";
          const taweel = targetText.includes("ما فعلت") ? "فعلك" : "نجاحك";
          return `داخل (${targetText}) يوجد فعل فعلًا، لكننا لا نعرب الفعل وحده هنا؛ نعرب التركيب كله. هذا التركيب يؤول بمصدر في معنى اسم: (${taweel}). لذلك ننظر إلى دوره في الجملة ونسأل: ${q}`;
        }
        if (roleKind === "connected") {
          return `الفعل هو كلمة الحدث والزمن. أما (${targetText}) فهو ضمير متصل داخل الفعل يدل على من قام بالفعل. اسأل: ${actionQuestion} الجواب يدل عليه الضمير${pronounMeaning ? `، ومعناه: ${pronounMeaning}` : ""}.`;
        }
        return `الفعل يدل على حدث وزمن، مثل: كتبَ. أما (${targetText}) فليس الفعل نفسه. اسأل: من الذي فعل؟ أو ما الذي فعل؟`;
      }
      if (pickedText === "مفعول به") {
        if (roleKind === "masdar") {
          const q = targetText.includes("ما فعلت") ? "ما الذي أعجبني؟" : "ما الذي سرّني؟";
          return `المفعول به هو ما وقع عليه الفعل. أما هنا فالتركيب (${targetText}) هو الشيء الذي سبب الإعجاب أو السرور. اسأل: ${q}`;
        }
        if (roleKind === "connected") {
          return `المفعول به هو الشيء الذي وقع عليه الفعل. أما (${targetText}) فيدل على من قام بالفعل. اسأل: ${actionQuestion} ستجد أن الجواب هو الضمير المتصل.`;
        }
        return `المفعول به هو الذي وقع عليه الفعل، أما الفاعل فهو من قام بالفعل. اسأل: من الذي فعل؟ أو ما الذي فعل؟`;
      }
      return `اسأل عن الدور فقط: من الذي فعل؟ أو ما الذي فعل؟ هذا هو الفاعل. وما وقع عليه الفعل يكون مفعولًا به.`;
    }

    if (id === "fael_role_hidden") {
      if (pickedText.includes("اسم ظاهر") || pickedText.includes("الاسم المتقدم")) {
        if (contextType === "nominal_with_verb") {
          if (facts.hiddenPronoun === "هي") {
            return `الفعل (${targetText}) فعل مضارع، والتاء في أوله تاء مضارعة تناسب الغائبة المؤنثة هنا، وليست تاء تأنيث ساكنة؛ لأن تاء التأنيث الساكنة تكون مع الماضي مثل: كتبتْ. وبما أن (${nominalSubject}) جاءت قبل الفعل، فهي مبتدأ، أما فاعل (${targetText}) فهو ضمير مستتر تقديره هي.`;
          }
          return `لا نجعل الاسم المتقدم على الفعل فاعلًا؛ لأن الفاعل لا يتقدم على فعله. (${nominalSubject}) مبتدأ، أما فاعل (${targetText}) فهو ضمير مستتر داخل الفعل يعود عليه.`;
        }
        return `لا يظهر بعد الفعل (${targetText}) اسم قام بالفعل. نسأل: ${actionQuestion} فيدل المعنى وصيغة الفعل على ضمير مستتر داخل الفعل.`;
      }
      if (pickedText.includes("المفعول")) {
        return `المفعول به وقع عليه الفعل، وليس هو الذي قام به. انظر إلى الفعل (${targetText}) واسأل: ${actionQuestion} إذا لم يظهر فاعل بعد الفعل، نقدّر ضميرًا مستترًا.`;
      }
      if (contextType === "verbal_hidden" && facts.hiddenPronoun === "أنت") {
        return `الجملة بدأت بفعل أمر: (${targetText}). فعل الأمر موجّه إلى مخاطب. نسأل: ${actionQuestion} الجواب: أنت، لكنها غير ظاهرة في الجملة؛ لذلك الفاعل ضمير مستتر وجوبًا تقديره أنت.`;
      }
      if (contextType === "verbal_hidden") {
        return `الجملة بدأت بفعل يحتاج إلى فاعل. اسأل: ${actionQuestion} إذا لم يظهر فاعل بعد الفعل، نقدّر ضميرًا مستترًا مناسبًا للمعنى.`;
      }
      return `الجملة بدأت باسم، وخبرها جملة فعلية: (${verbalKhabar}). داخل هذه الجملة نبحث عن فاعل الفعل (${targetText}). اسأل: ${actionQuestion}`;
    }

    if (id === "fael_hidden_estimate") {
      if (facts.hiddenPronoun === "هي" && pickedText !== "هي") {
        return `الفعل (${targetText}) مضارع، والتاء في أوله تاء مضارعة تناسب الغائبة المؤنثة في هذا المثال، وليست تاء تأنيث ساكنة. اسأل: ${actionQuestion} الجواب يعود على (${nominalSubject || "الاسم السابق"})، لذلك نقدّر الفاعل المستتر: هي.`;
      }
      if (facts.hiddenPronoun === "هو" && pickedText !== "هو") {
        return `الضمير يعود على (${nominalSubject})، وهو مفرد مذكر في هذا المثال؛ لذلك نقدّر الفاعل المستتر: هو.`;
      }
      if (facts.hiddenPronoun === "أنا" && pickedText !== "أنا") return `الفعل (${targetText}) بدأ بهمزة المتكلم، لذلك تقدير الفاعل المستتر: أنا.`;
      if (facts.hiddenPronoun === "نحن" && pickedText !== "نحن") return `الفعل (${targetText}) بدأ بنون المتكلمين، لذلك تقدير الفاعل المستتر: نحن.`;
      if (facts.hiddenPronoun === "أنت" && pickedText !== "أنت") return `فعل الأمر موجه إلى المخاطب، فإذا لم يظهر فاعله نقدّره: أنت.`;
      return node?.hint || "نقدر الضمير بحسب صيغة الفعل والمعنى.";
    }

    if (id === "fael_hukm") {
      if (pickedText.includes("منصوب")) {
        if (facts.fiveNoun || facts.shape === "five") {
          return `النصب لا نختاره لمجرد وجود فتحة في آخر الشكل. في (${targetText}) علامة الرفع هي الواو؛ لأنه من الأسماء الخمسة، وقد تحققت شروط إعرابها بالحروف: ${fiveConditions}. أما الكاف فضمير متصل في محل جر مضاف إليه.`;
        }
        return `النصب يكون للمفعول به غالبًا. أما الفاعل فقد عرفنا أنه من قام بالفعل أو ما دل عليه، وحكمه الرفع دائمًا، أو يكون في محل رفع إذا كان مبنيًا.`;
      }
      if (pickedText.includes("مجرور")) return `الجر يكون بعد حرف جر أو بالإضافة. أما الفاعل فلا يكون مجرورًا؛ حكمه الرفع أو في محل رفع.`;
      return `الفاعل حكمه الرفع دائمًا، فإن كان مبنيًا أو مصدرًا مؤولًا قلنا: في محل رفع.`;
    }

    if (id === "fael_form") {
      if (pickedText.includes("مصدر") && roleKind !== "masdar") return `المصدر المؤول تركيب يؤول باسم مثل: أن تنجح = نجاحك، أو ما فعلت = فعلك. انظر إلى (${targetText}): هل هو تركيب مؤول أم كلمة/ضمير؟`;
      if (pickedText.includes("معرب") && roleKind !== "visible") {
        if (roleKind === "connected") {
          return `(${targetText}) ضمير متصل، والضمائر المتصلة من الأسماء المبنية. لا تظهر عليها علامة رفع مثل (الطالبُ)، بل نقول: ضمير متصل مبني في محل رفع فاعل. نعرف أنه فاعل بسؤال: ${actionQuestion}${pronounMeaning ? ` والجواب يدل عليه الضمير، ومعناه: ${pronounMeaning}.` : "."}`;
        }
        if (roleKind === "masdar") {
          const taweel = targetText.includes("ما فعلت") ? "فعلك" : "نجاحك";
          return `(${targetText}) ليس اسمًا ظاهرًا تظهر عليه علامة رفع مثل (الطالبُ)، بل تركيب يؤول بمصدر في معنى اسم: (${taweel}). لذلك لا نبحث عن ضمة ظاهرة، بل نقول: مصدر مؤول في محل رفع فاعل.`;
        }
        return `الاسم المعرب تظهر عليه علامة رفع أو نصب أو جر. أما (${targetText}) فاسم مبني، لذلك نقول: في محل رفع.`;
      }
      if (pickedText.includes("مبني") && !["mabni", "connected"].includes(roleKind)) return `الاسم المبني يلزم صورة واحدة مثل: هذا، الذي، من، والضمائر المتصلة. انظر إلى (${targetText}): هل يلزم صورة ثابتة أم هو اسم ظاهر معرب؟`;
      if (pickedText.includes("تلميح")) {
        if (roleKind === "visible") return `(${targetText}) اسم ظاهر معرب: كلمة مستقلة وليست ضميرًا متصلًا، وليست اسمًا مبنيًا مثل (هذا/الذي)، وليست تركيبًا مؤولًا. لذلك نكمل معها لتحديد صورتها ثم علامة رفعها.`;
        if (roleKind === "mabni") return `(${targetText}) اسم مبني؛ يلزم صورة واحدة ولا تظهر عليه ضمة رفع مثل (الطالبُ). لذلك نحدد نوعه، ثم نقول: اسم مبني في محل رفع فاعل.`;
        if (roleKind === "connected") {
          if (connectedType === "na") return `(${targetText}) ضمير متصل، والضمائر المتصلة من الأسماء المبنية. نسأل: ${actionQuestion} الجواب: نحن. في (حفظْنا) سكن آخر الفعل الماضي لاتصاله بضمير رفع؛ لذلك تكون نا هنا في محل رفع فاعل، بخلاف (شكرَنا) التي تكون فيها نا مفعولًا به ولا تغيّر بناء الفعل.`;
          return `(${targetText}) ضمير متصل، والضمائر المتصلة من الأسماء المبنية. نسأل: ${actionQuestion}${pronounMeaning ? ` الجواب يدل عليه الضمير، ومعناه: ${pronounMeaning}.` : ""} لذلك يكون في محل رفع فاعل.`;
        }
        if (roleKind === "masdar") {
          const taweel = targetText.includes("ما فعلت") ? "فعلك" : "نجاحك";
          return `(${targetText}) تركيب يؤول بمصدر في معنى اسم: (${taweel}). والمصدر المؤول ليس اسمًا مبنيًا؛ لذلك نقول: مصدر مؤول في محل رفع فاعل.`;
        }
      }
      return `انظر إلى (${targetText}) نفسها: إن كانت اسمًا ظاهرًا معربًا نكمل إلى علامة الرفع، وإن كانت اسمًا مبنيًا أو ضميرًا متصلًا نقول: في محل رفع، وإن كانت تركيبًا مؤولًا نقول: مصدر مؤول في محل رفع.`;
    }

    if (id === "fael_mu3rab_shape") {
      const correctShapeHint = (() => {
        if (facts.shape === "singular") return `(${targetText}) اسم ظاهر معرب يدل على واحد، وليس مثنى ولا جمعًا ولا من الأسماء الخمسة؛ لذلك صورته مفرد، والمفرد يرفع بالضمة.`;
        if (facts.shape === "dual") return `(${targetText}) يدل على اثنين، وانتهى بألف ونون في هذا المثال؛ لذلك صورته مثنى، والمثنى يرفع بالألف.`;
        if (facts.shape === "jms") return `(${targetText}) يدل على جماعة ذكور عاقلة، وانتهى بواو ونون في هذا المثال؛ لذلك صورته جمع مذكر سالم، وجمع المذكر السالم يرفع بالواو.`;
        if (facts.shape === "jfs") return `(${targetText}) جمع مؤنث سالم؛ لأنه يدل على جماعة إناث وينتهي بألف وتاء زائدتين، وجمع المؤنث السالم يرفع بالضمة.`;
        if (facts.shape === "jt") return `(${targetText}) جمع تكسير؛ لأنه يدل على جماعة مع تغيّر صورة المفرد عند الجمع مثل: طفل ← أطفال، وجمع التكسير يرفع بالضمة.`;
        if (facts.fiveNoun || facts.shape === "five") return `(${targetText}) من الأسماء الخمسة؛ أصله (أب)، وقد تحققت شروط إعرابه بالحروف: ${fiveConditions}. لذلك لا نعامله كمفرد عادي، بل نختار: من الأسماء الخمسة، وعلامة رفعه الواو.`;
        return `انظر إلى (${targetText}) نفسها: هل تدل على واحد، أم اثنين، أم جماعة؟ وهل هي من الأسماء الخمسة؟ صورة الكلمة هي التي تقودنا إلى علامة الرفع.`;
      })();
      if (pickedText.includes("تلميح")) return correctShapeHint;
      if (pickedText.includes("مفرد") && facts.shape !== "singular") {
        if (facts.shape === "dual") return `(${targetText}) ليست مفردًا؛ لأنها تدل على اثنين، وانتهت بألف ونون؛ لذلك صورتها مثنى.`;
        if (facts.shape === "jms") return `(${targetText}) ليست مفردًا؛ لأنها تدل على جماعة ذكور عاقلة، وانتهت بواو ونون؛ لذلك صورتها جمع مذكر سالم.`;
        if (facts.shape === "jfs") return `(${targetText}) ليست مفردًا؛ لأنها تدل على جماعة إناث، وانتهت بألف وتاء زائدتين؛ لذلك صورتها جمع مؤنث سالم.`;
        if (facts.shape === "jt") return `(${targetText}) ليست مفردًا؛ لأنها جمع تكسير تغيّرت فيه صورة المفرد عند الجمع؛ لذلك صورتها جمع تكسير.`;
        if (facts.fiveNoun || facts.shape === "five") return `صحيح أن (${targetText}) يدل على واحد، لكنه ليس مفردًا عاديًا في الإعراب مثل (الطالبُ). أصله (أب) وهو من الأسماء الخمسة، وقد تحققت شروط إعرابه بالحروف: ${fiveConditions}. لذلك نختار: من الأسماء الخمسة.`;
      }
      if (pickedText.includes("الأسماء الخمسة") && facts.shape !== "five") return `الأسماء الخمسة هي: أب، أخ، حم، فو، ذو، وتعرب بالحروف إذا كانت مفردة، مضافة، ومضافة إلى غير ياء المتكلم. أما (${targetText}) فليست من هذا الباب في هذا المثال؛ ${correctShapeHint}`;
      if (pickedText.includes("مثنى") && facts.shape !== "dual") return `المثنى يدل على اثنين أو اثنتين ويرفع بالألف. افحص (${targetText}) في هذا المثال: ${correctShapeHint}`;
      if (pickedText.includes("جمع مذكر") && facts.shape !== "jms") return `جمع المذكر السالم يدل على جماعة ذكور عاقلة ويرفع بالواو. افحص (${targetText}) في هذا المثال: ${correctShapeHint}`;
      if (pickedText.includes("جمع مؤنث") && facts.shape !== "jfs") return `جمع المؤنث السالم ينتهي غالبًا بألف وتاء زائدتين ويرفع بالضمة. افحص (${targetText}) في هذا المثال: ${correctShapeHint}`;
      if (pickedText.includes("جمع تكسير") && facts.shape !== "jt") return `جمع التكسير تتغير فيه صورة المفرد عند الجمع مثل: طفل ← أطفال. افحص (${targetText}) في هذا المثال: ${correctShapeHint}`;
      return correctShapeHint;
    }

    if (id === "fael_raf3_mark") {
      const correctMarkHint = (() => {
        if (facts.shape === "singular") return `(${targetText}) مفرد مرفوع؛ لذلك علامة رفعه الضمة الظاهرة على آخره.`;
        if (facts.shape === "dual") return `(${targetText}) مثنى مرفوع؛ والمثنى يرفع بالألف، لذلك علامة رفعه الألف.`;
        if (facts.shape === "jms") return `(${targetText}) جمع مذكر سالم مرفوع؛ وجمع المذكر السالم يرفع بالواو، لذلك علامة رفعه الواو.`;
        if (facts.shape === "jfs") return `(${targetText}) جمع مؤنث سالم مرفوع؛ وجمع المؤنث السالم يرفع بالضمة، لذلك علامة رفعه الضمة.`;
        if (facts.shape === "jt") return `(${targetText}) جمع تكسير مرفوع؛ وجمع التكسير يرفع بالضمة مثل المفرد العادي، لذلك علامة رفعه الضمة.`;
        if (facts.fiveNoun || facts.shape === "five") return `(${targetText}) من الأسماء الخمسة، وقد تحققت شروط إعرابه بالحروف: ${fiveConditions}؛ لذلك علامة رفعه الواو.`;
        return `اختر علامة الرفع من صورة (${targetText}) نفسها.`;
      })();
      if (pickedText.includes("تلميح")) return correctMarkHint;
      if (pickedText.includes("الضمة") && facts.raf3Mark !== "damma") {
        if (facts.fiveNoun || facts.shape === "five") return `الضمة علامة رفع المفرد العادي مثل: الطالبُ. أما (${targetText}) فمن الأسماء الخمسة، وقد تحققت شروط إعرابه بالحروف: ${fiveConditions}؛ لذلك علامة رفعه الواو.`;
        if (facts.shape === "dual") return `لا نرفع (${targetText}) بالضمة؛ لأنه مثنى، والمثنى يرفع بالألف.`;
        if (facts.shape === "jms") return `لا نرفع (${targetText}) بالضمة؛ لأنه جمع مذكر سالم، وجمع المذكر السالم يرفع بالواو.`;
        return correctMarkHint;
      }
      if (pickedText.includes("الألف") && facts.raf3Mark !== "alif") return `الألف علامة رفع المثنى فقط. أما (${targetText}) فليست مثنى في هذا المثال؛ ${correctMarkHint}`;
      if (pickedText.includes("الواو") && facts.raf3Mark !== "waw") return `الواو علامة رفع جمع المذكر السالم والأسماء الخمسة. أما (${targetText}) فليست من هذين البابين هنا؛ ${correctMarkHint}`;
      if (pickedText.includes("ثبوت النون")) return `ثبوت النون ليس علامة رفع للأسماء، بل يخص الفعل المضارع المتصل بألف الاثنين أو واو الجماعة أو ياء المخاطبة. نحن هنا نحدد علامة رفع الفاعل (${targetText}).`;
      return correctMarkHint;
    }

    if (id === "fael_mabni_type") {
      if (roleKind === "connected" && !pickedText.includes("ضمير")) {
        return `المحدد (${targetText}) ضمير متصل داخل الفعل. والضمائر المتصلة من الأسماء المبنية؛ لذلك نحدد نوعه: ضمير متصل. نسأل: ${actionQuestion}${pronounMeaning ? ` والجواب يدل عليه الضمير، ومعناه: ${pronounMeaning}.` : ""}`;
      }
      if (pickedText.includes("ضمير") && roleKind !== "connected") return `الضمير المتصل يكون جزءًا متصلًا بالفعل مثل التاء في فهمتُ أو واو الجماعة في شرحوا. افحص (${targetText}) هل هو ضمير متصل أم اسم مبني آخر؟`;
      if (pickedText.includes("إشارة") && facts.mabniType !== "ishara") return `اسم الإشارة مثل: هذا وهذه. افحص (${targetText}) هل يدل بالإشارة، أم أنه نوع آخر من المبنيات؟`;
      if (pickedText.includes("موصول") && facts.mabniType !== "mawsool") return `الاسم الموصول مثل: الذي والتي، وتأتي بعده صلة توضحه. افحص (${targetText}) هل هو اسم موصول؟`;
      return String(picked?.hint || node?.hint || "اختر نوع الاسم المبني من الكلمة نفسها.");
    }

    const pickedHint = String(picked?.hint || "").trim();
    if (pickedHint) return pickedHint;
    return node?.hint || "اتبع المسار: السياق ثم الدور ثم حكم الفاعل ثم صورته وعلامته.";
  }

  if (pickedTextGlobal.includes("مفرد") && isFiveNounFact(state?.facts)) {
    return fiveNounWrongSingularHint(currentTargetGlobal);
  }

  if (id.startsWith("past_")) {
    const pickedText = String(picked?.text || "");
    const facts = state?.facts || {};
    const targetPast = String(state?.currentTarget || "الفعل");
    const baseHuwa = String(facts.basePastHuwa || "");
    const reminder = "";

    if (id === "past_has_attachment") {
      const baseText = baseHuwa || targetPast.replace(/[ًٌٍَُِّْ]/g, "");
      if (pickedText.includes("نعم") && facts.hasAttached === false) {
        return `جرّب إسناد الفعل إلى الضمير هو في الماضي: ${targetPast} ← هو ${baseText}. بقي آخر الفعل بلا زيادة متصلة؛ إذن لم يتصل بآخره شيء.${reminder}`;
      }
      if ((pickedText.includes("لا") || pickedText.includes("لم")) && facts.hasAttached === true) {
        return `جرّب إسناد الفعل إلى الضمير هو في الماضي: ${targetPast} ← هو ${baseText}. إذا وجدت في آخر الفعل تاء أو واوًا أو ألف الاثنين أو ضمير نصب ظاهرًا أمامك، فقد اتصل بآخره شيء.${reminder}`;
      }
      return `أسند الفعل إلى الضمير هو في الماضي، ثم قارن صورة الفعل أمامك بصورته مع هو. الزيادة في آخر الفعل تعني أن شيئًا اتصل به.${reminder}`;
    }

    if (id === "past_no_attachment_weak") {
      if (pickedText.includes("ألف") && facts.weakEnding === "none") {
        return `انتبه: آخر (${targetPast}) ليس ألفًا. في مثل قرأَ آخر الفعل همزة، والهمزة ليست حرف علة. حروف العلة هي: الألف والواو والياء فقط.${reminder}`;
      }
      return `انظر إلى آخر الفعل نفسه: هل هو ألف لينة مثل سعى ورمى، أم حرف صحيح ظاهر مثل كتبَ وقرأَ؟ الهمزة حرف صحيح وليست حرف علة.${reminder}`;
    }

    if (id === "past_connector_kind") {
      if (pickedText.includes("تاء التأنيث") && facts.connectorKind !== "taa_tanith") {
        return `تاء التأنيث علامة ساكنة لا تدل على الفاعل. مثل: غادرتْ الطائرةُ المطارَ، أو: الطائرةُ غادرتْ المطارَ؛ فالفاعل في الثانية ضمير مستتر تقديره هي لأن الفاعل لا يتقدم على الفعل. انظر هل المتصل هنا تاء تأنيث فعلًا أم ضمير.${reminder}`;
      }
      if (pickedText.includes("ضمير رفع") && facts.connectorKind !== "raf3") {
        return `ضمير الرفع يضمر الفاعل؛ أي من قام بالفعل. أمّا إذا كان المتصل يدل على الشيء الذي وقع عليه الفعل فهو ضمير نصب، لا ضمير رفع.${reminder}`;
      }
      if (pickedText.includes("ضمير نصب") && facts.connectorKind !== "nasb") {
        return `ضمير النصب يضمر المفعول به؛ أي الشيء أو الشخص الذي وقع عليه الفعل، ولا يدل على من قام بالفعل. اسأل: هل المتصل دل على الفاعل أم على المفعول به؟${reminder}`;
      }
      return `اسأل عن دلالة المتصل: هل أضمر الفاعل؟ فهو ضمير رفع. هل أضمر المفعول به؟ فهو ضمير نصب. أم أنه تاء تأنيث ساكنة لا تدل على فاعل؟${reminder}`;
    }

    if (id === "past_taa_weak") {
      const shown = baseHuwa ? `${targetPast} ← هو ${baseHuwa}` : `مشتْ ← هو مشى`;
      return `أسند الفعل إلى الضمير هو في الزمن الماضي، ثم قارن: ${shown}. إذا كان أصل الفعل ينتهي بألف أو واو أو ياء، وهذا الحرف غير ظاهر في الفعل أمامك، فهو حرف علة محذوف، وتكون حركة البناء مقدرة عليه. لا نرجع إلى المضارع.${reminder}`;
    }

    if (id === "past_weak_base_taa") {
      return `نحن نحلل فعلًا ماضيًا، لذلك نسنده إلى هو في الماضي لا في المضارع. في مثال مشتْ نقول: هو مشى، لا: هو يمشي.${reminder}`;
    }

    if (id === "past_deleted_letter_taa") {
      return `قارن: مشتْ ← هو مشى. آخر الأصل ألف، وهذه الألف غير ظاهرة في مشتْ؛ إذن المحذوف هو الألف. أمّا بقيتْ فالياء فيها ظاهرة، وليست من مسار الحذف.${reminder}`;
    }

    if (id === "past_raf3_type") {
      if (pickedText.includes("ألف الاثنين") && facts.raf3BuildGroup === "waw") {
        return `الألف في (${targetPast}) ليست ألف الاثنين. ألف الاثنين تكون ضميرًا يدل على اثنين مثل: رجعا / حضرا / سعيا. أما الألف بعد واو الجماعة في مثل رجعوا ومضوا وبقوا فهي ألف فارقة لا محل لها من الإعراب، والضمير هو واو الجماعة.${reminder}`;
      }
      if (pickedText.includes("واو الجماعة") && facts.raf3BuildGroup === "alif") {
        return `في مثل حضرا أو سعيا الضمير هو ألف الاثنين؛ لأنه يدل على فاعلين اثنين. واو الجماعة تكون في مثل رجعوا وبقوا.${reminder}`;
      }
      return `انظر إلى الضمير المتصل: تاء/نا/نون النسوة تبني على السكون، ألف الاثنين تدل على اثنين، وواو الجماعة تدل على جماعة والألف بعدها فارقة.${reminder}`;
    }

    if (id === "past_sukoon_raf3_type") {
      if (pickedText.includes("نا")) {
        return `انتبه: نا قد تكون للفاعلين أو للمفعولين. في حفظنا النشيدَ: نا أضمرت من قاموا بالحفظ، فهي نا الفاعلين في محل رفع فاعل. أما في حفظَنا اللهُ: نا أضمرت من وقع عليهم الحفظ، فهي نا المفعولين في محل نصب مفعول به، والفاعل هو اللهُ.${reminder}`;
      }
      return `تاء الفاعل مثل فهمتُ، ونا الفاعلين مثل حفظنا، ونون النسوة مثل جلسنَ. كلها ضمائر رفع متحركة تبني الفعل الماضي على السكون.${reminder}`;
    }

    if (id === "past_waw_weak") {
      const shown = baseHuwa ? `${targetPast} ← هو ${baseHuwa}` : `مضَوا ← هو مضى، بقُوا ← هو بقي`;
      return `أسند الفعل إلى الضمير هو في الماضي ثم قارن: ${shown}. إذا كان أصل الفعل ينتهي بألف أو واو أو ياء، وهذا الحرف غير ظاهر أمامك، فهو حرف علة محذوف وتكون حركة البناء مقدرة عليه. لا ترجع إلى المضارع.${reminder}`;
    }

    if (id === "past_weak_base_waw") {
      if (pickedText.includes("يبقى")) return `هذا مضارع. نحن نحلل فعلًا ماضيًا، فنقول في بقُوا: هو بقي، لا هو يبقى.${reminder}`;
      if (facts.basePastHuwa === "بقي" && pickedText.includes("مضى")) return `هذا يصلح لمثال مضَوا، أما بقُوا فنردها إلى الماضي مع هو: هو بقي.${reminder}`;
      if (facts.basePastHuwa === "مضى" && pickedText.includes("بقي")) return `هذا يصلح لمثال بقُوا، أما مضَوا فنردها إلى الماضي مع هو: هو مضى.${reminder}`;
      return `ضع هو قبل الفعل في الماضي: مضَوا ← هو مضى، بقُوا ← هو بقي. لا تستعمل المضارع.${reminder}`;
    }

    if (id === "past_deleted_letter_waw") {
      if (facts.deletedLetter === "yaa" && pickedText.includes("الألف")) return `بقُوا ← هو بقي. آخر الأصل ياء، إذن المحذوف ياء. لا تنخدع بالمضارع يبقى؛ نحن نرجع إلى الماضي مع هو.${reminder}`;
      if (facts.deletedLetter === "alif" && pickedText.includes("الياء")) return `مضَوا ← هو مضى. آخر الأصل ألف، إذن المحذوف ألف.${reminder}`;
      if (pickedText.includes("الواو")) return `الواو هنا واو الجماعة، ضمير متصل، وليست حرف العلة المحذوف. الحرف المحذوف نعرفه من صورة الماضي مع هو.${reminder}`;
      const shown = baseHuwa ? `${targetPast} ← هو ${baseHuwa}` : `مضَوا ← هو مضى، بقُوا ← هو بقي`;
      return `قارن بالإسناد إلى هو في الماضي: ${shown}. الحرف الأخير في الأصل إذا اختفى قبل واو الجماعة فهو الحرف المحذوف.${reminder}`;
    }
  }

  if (id.startsWith("present_")) {
    const pickedText = String(picked?.text || "");
    const facts = state?.facts || {};
    const sentence = String(state?.currentSentence || "");
    const targetNow = String(state?.currentTarget || target || "الفعل");
    const toolWord = String(facts.toolWord || (sentence.includes("لم ") ? "لم" : sentence.includes("لن ") ? "لن" : sentence.includes(" أن ") ? "أن" : sentence.includes(" كي ") ? "كي" : sentence.includes("لا ") ? "لا الناهية" : sentence.includes("لِ") ? "لام الأمر" : "الأداة السابقة"));
    const baseWithHuwa = (() => {
      if (/سع/.test(targetNow)) return "هو يسعى";
      if (/دع/.test(targetNow)) return "هو يدعو";
      if (/رم/.test(targetNow)) return "هو يرمي";
      const cleaned = targetNow.replace(/[ًٌٍَُِّْ]/g, "").replace(/وا$/, "ون");
      return `هو ${cleaned}`;
    })();
    const attachmentExplanation = (() => {
      if (facts.attached === "waw") {
        return `في (${targetNow}) الواو واو الجماعة: ضمير متصل، والألف بعدها ألف فارقة لا محل لها من الإعراب. ليست الواو ولا الألف حرف علة من أصل الفعل.`;
      }
      if (facts.attached === "alif2") {
        return `في (${targetNow}) الألف ألف الاثنين: ضمير متصل يدل على مثنى، وليست حرف علة من أصل الفعل.`;
      }
      if (facts.attached === "yaa") {
        return `في (${targetNow}) الياء ياء المخاطبة: ضمير متصل، وليست حرف علة من أصل الفعل.`;
      }
      return `الفعل المعتل الآخر هو ما كان آخر أصله حرف علة مثل: يدعو، يرمي، يسعى.`;
    })();

    if (id === "present_word_kind") {
      if (pickedText.includes("اسم")) return `الاسم لا يدل على زمن بنفسه. انظر إلى (${targetNow}): هل يدل على حدث يقع الآن أو يتكرر؟ إذا نعم فهو فعل.`;
      if (pickedText.includes("حرف")) return `الحرف لا يظهر معناه كاملًا إلا مع غيره. أما (${targetNow}) فيدل على حدث وزمن، لذلك ليس حرفًا.`;
      return `اسأل: هل (${targetNow}) يدل على عمل مرتبط بزمن؟ إذا نعم فهو فعل.`;
    }

    if (id === "present_tense") {
      if (pickedText.includes("ماض")) return `الماضي يدل على حدث وقع وانتهى مثل: كتبَ. أما (${targetNow}) فيدل على حدث يقع الآن أو يتجدد أو سيقع، فهو مضارع.`;
      if (pickedText.includes("أمر")) return `فعل الأمر طلب مباشر مثل: اكتبْ. أما (${targetNow}) فليس طلبًا، بل يدل على حدث حاضر أو متجدد.`;
      return `الفعل المضارع يدل على حدث يقع الآن أو يتجدد أو سيقع، مثل: يكتب، يسعى، يدعو.`;
    }

    if (id === "present_build_check") {
      if (pickedText.includes("نون النسوة") && facts.buildConnection !== "niswa") {
        if (facts.shape === "five") return `نون النسوة تكون لجماعة الإناث مثل: الطالبات يكتبْنَ. أما (${targetNow}) فمن الأفعال الخمسة، والنون فيه علامة إعراب لا نون نسوة.`;
        return `نون النسوة تكون لجماعة الإناث مثل: الطالبات يكتبْنَ، وتبني المضارع على السكون. في (${targetNow}) لا توجد نون نسوة.`;
      }
      if (pickedText.includes("نون التوكيد") && facts.buildConnection !== "tawkid") {
        if (facts.shape === "five") return `نون التوكيد تأتي لتأكيد الفعل مثل: أكتبنَّ. أما (${targetNow}) فالنون فيه علامة إعراب للأفعال الخمسة، لا نون توكيد.`;
        return `نون التوكيد تأتي لتأكيد الفعل مثل: أكتبنَّ، وتبني المضارع على الفتح. في (${targetNow}) لا توجد نون توكيد.`;
      }
      if (pickedText.includes("لم يتصل") && facts.buildConnection !== "none") {
        return `انظر إلى آخر (${targetNow}): اتصل به ما يبني المضارع. نون النسوة تبنيه على السكون، ونون التوكيد تبنيه على الفتح.`;
      }
      return `انظر إلى آخر الفعل (${targetNow}): هل اتصلت به نون النسوة أو نون التوكيد؟ إن لم تتصل به واحدة منهما فهو معرب.`;
    }

    if (id === "present_tool_presence") {
      if (facts.tool === "jazm" && !pickedText.includes("جزم")) {
        return `انظر إلى ما قبل الفعل (${targetNow}): سبقه الحرف (${toolWord}). و(${toolWord}) حرف جزم يدخل على الفعل المضارع؛ لذلك لا يصح اختيار أنه بلا ناصب ولا جازم أو أنه منصوب.`;
      }
      if (facts.tool === "nasb" && !pickedText.includes("نصب")) {
        return `انظر إلى ما قبل الفعل (${targetNow}): سبقه الحرف (${toolWord}). و(${toolWord}) حرف نصب يدخل على الفعل المضارع؛ لذلك لا يصح اختيار أنه مرفوع أو مجزوم.`;
      }
      if ((facts.tool === "none" || facts.hasTool === false) && (pickedText.includes("نصب") || pickedText.includes("جزم"))) {
        return `انظر قبل الفعل (${targetNow}) في الجملة: لا توجد أداة نصب ولا أداة جزم مؤثرة، لذلك يبقى الفعل مرفوعًا.`;
      }
      return `نحدد حالة المضارع من الكلمة التي قبله: أدوات النصب مثل لن وأن وكي تنصب، وأدوات الجزم مثل لم ولا الناهية ولام الأمر تجزم، وإذا لم توجد أداة مؤثرة فهو مرفوع.`;
    }

    if (id === "present_raf3_shape" || id === "present_nasb_shape" || id === "present_jazm_shape") {
      if (facts.shape === "five") {
        if (pickedText.includes("صحيح")) return `صحيح أن أصل الفعل قد يكون صحيح الآخر، لكن الصورة أمامنا (${targetNow}) اتصلت بضمير من ضمائر الأفعال الخمسة؛ لذلك نعاملها كفعل من الأفعال الخمسة.`;
        if (pickedText.includes("معتل")) return `${attachmentExplanation}\nإذن (${targetNow}) من الأفعال الخمسة، وعلامته هنا ${facts.tool === "jazm" ? "حذف النون للجزم" : facts.tool === "nasb" ? "حذف النون للنصب" : "ثبوت النون للرفع"}.`;
        return `الأفعال الخمسة أفعال مضارعة اتصلت بألف الاثنين أو واو الجماعة أو ياء المخاطبة. (${targetNow}) من هذا الباب لأنه اتصل بواحد منها.`;
      }
      if (facts.shape === "weak") {
        if (pickedText.includes("صحيح")) return `نسند الفعل إلى الضمير هو لنتأكد من الحرف الأخير في أصل الفعل: ${targetNow} ← ${baseWithHuwa}. نلاحظ أن الأصل ينتهي بحرف علة؛ لذلك هو فعل معتل الآخر، وليس صحيح الآخر.`;
        if (pickedText.includes("الأفعال الخمسة")) return `الأفعال الخمسة تحتاج اتصالًا بواو الجماعة أو ألف الاثنين أو ياء المخاطبة. في (${targetNow}) لا يوجد هذا الاتصال، بل نرجعه إلى أصله: ${baseWithHuwa}، فنجد آخره حرف علة.`;
        return `نسند الفعل إلى الضمير هو لنتأكد من الحرف الأخير في أصل الفعل: ${targetNow} ← ${baseWithHuwa}. إذا انتهى الأصل بألف أو واو أو ياء فهو معتل الآخر.`;
      }
      if (facts.shape === "sahih") {
        if (pickedText.includes("معتل")) return `انظر إلى أصل الفعل (${targetNow}). آخره حرف صحيح وليس ألفًا ولا واوًا ولا ياءً. وإذا رأيت همزة مثل (قرأ) فالهمزة ليست حرف علة.`;
        if (pickedText.includes("الأفعال الخمسة")) return `الأفعال الخمسة لا تكون إلا إذا اتصل المضارع بألف الاثنين أو واو الجماعة أو ياء المخاطبة. (${targetNow}) هنا لم يتصل بواحد منها.`;
        return `صحيح الآخر هو ما كان آخره الأصلي ليس حرف علة. حروف العلة هي: الألف، الواو، الياء فقط.`;
      }
    }

    if (id === "present_raf3_weak_letter" || id === "present_nasb_weak_letter" || id === "present_jazm_weak_letter") {
      const expected = facts.weakLetter === "alif" ? "الألف" : facts.weakLetter === "waw" ? "الواو" : facts.weakLetter === "ya" ? "الياء" : "حرف العلة";
      if (id === "present_jazm_weak_letter") {
        return `نسند الفعل إلى الضمير هو لنتأكد من الحرف الأخير في أصل الفعل: ${targetNow} ← ${baseWithHuwa}. الحرف الذي يظهر في الأصل ولا يظهر في الفعل المجزوم هو حرف العلة المحذوف. في هذا المثال المحذوف هو ${expected}.`;
      }
      return `أسند الفعل إلى هو: ${targetNow} ← ${baseWithHuwa}. انظر إلى آخر الأصل: حرف العلة هنا هو ${expected}.`;
    }
  }

  if (id.startsWith("imperative_")) {
    const pickedText = String(picked?.text || "");
    const facts = state?.facts || {};
    const targetNow = String(state?.currentTarget || target || "الفعل");
    const presentBase = String(facts.presentBase || (targetNow.includes("ادع") ? "يدعو" : targetNow.includes("ارم") ? "يرمي" : targetNow.includes("اسع") ? "يسعى" : "مضارعه"));
    if (id === "imperative_word_kind") {
      if (pickedText.includes("اسم")) return `الاسم لا يدل على طلب أو زمن بنفسه. انظر إلى (${targetNow}): هل يطلب عملًا من المخاطب؟`;
      if (pickedText.includes("حرف")) return `الحرف لا يظهر معناه كاملًا إلا مع غيره. أما (${targetNow}) فيدل على عمل مطلوب.`;
      return `الفعل يدل على حدث وزمن، وفعل الأمر يدل على طلب حصول الحدث.`;
    }
    if (id === "imperative_meaning") {
      if (pickedText.includes("وقع")) return `هذا معنى الماضي مثل: كتبَ. أما (${targetNow}) فهو طلب حصول الفعل، لا خبر عن شيء وقع.`;
      if (pickedText.includes("الآن") || pickedText.includes("يستقبل")) return `هذا معنى المضارع مثل: يكتبُ. أما (${targetNow}) فهو طلب مباشر للمخاطب.`;
      return `إذا كانت الكلمة تطلب من المخاطب أن يفعل شيئًا، فهي فعل أمر.`;
    }
    if (id === "imperative_connection") {
      const baseHuwa = String(facts.presentBase || (targetNow.includes("ادع") ? "يدعو" : targetNow.includes("ارم") ? "يرمي" : targetNow.includes("اسع") ? "يسعى" : "يكتب"));
      if (facts.attached === "none" && pickedText.includes("نعم")) return `أسند (${targetNow}) إلى المضارع مع الضمير هو: هو ${baseHuwa}. لا يظهر بعد أصل الفعل ضمير أو نون، لذلك لم يتصل بآخره شيء.`;
      if (facts.attached !== "none" && pickedText.includes("لا")) return `أسند (${targetNow}) إلى المضارع مع الضمير هو: هو ${baseHuwa}. ثم انظر إلى الزائد بعد أصل الفعل؛ ستجد أن آخر الأمر اتصل به شيء.`;
      return `نسند الفعل إلى المضارع مع الضمير هو لنعرف أصل آخره، ثم ننظر هل زاد بعد الأصل شيء.`;
    }
    if (id === "imperative_attached_kind") {
      const baseHuwa = String(facts.presentBase || "يكتب");
      if (pickedText.includes("نون النسوة") && facts.attached !== "niswa") return `نون النسوة ضمير يدل على جماعة الإناث مثل: اكتبْنَ، وتجعل الفعل مبنيًا على السكون. في (${targetNow}) ليست هذه النون هي المتصل الصحيح.`;
      if (pickedText.includes("نون التوكيد") && facts.attached !== "tawkid") return `نون التوكيد تؤكد الفعل وتقوّي معناه، ولا تدل على مؤنث، مثل: اكتبنَّ. إذا لم تكن النون للتوكيد في (${targetNow}) فلا نختارها.`;
      if ((pickedText.includes("ألف الاثنين") || pickedText.includes("واو الجماعة") || pickedText.includes("ياء المخاطبة")) && !["alif2", "waw", "yaa"].includes(String(facts.attached || ""))) return `ألف الاثنين وواو الجماعة وياء المخاطبة ضمائر مخاطبة، وعلامة البناء معها حذف النون. أسند (${targetNow}) إلى: هو ${baseHuwa} ثم حدد الزائد بعد أصل الفعل.`;
      return `أسند (${targetNow}) إلى المضارع مع الضمير هو: هو ${baseHuwa}. ما الزائد بعد أصل الفعل: نون نسوة، نون توكيد، أم ضمير مخاطبة؟`;
    }
    if (id === "imperative_ending") {
      if (facts.ending === "weak" && pickedText.includes("صحيح")) return `أسند (${targetNow}) إلى المضارع مع الضمير هو: هو ${presentBase}. نلاحظ أن آخر الأصل حرف علة، لذلك هو معتل الآخر.`;
      if (facts.ending === "sahih" && pickedText.includes("معتل")) return `أسند (${targetNow}) إلى المضارع مع الضمير هو: هو ${presentBase || "يكتب"}. آخر الأصل ليس ألفًا ولا واوًا ولا ياءً، لذلك هو صحيح الآخر.`;
      return `نسند الأمر إلى المضارع مع الضمير هو: ادعُ ← هو يدعو، ارمِ ← هو يرمي، اسعَ ← هو يسعى.`;
    }
    if (id === "imperative_weak_letter") {
      const expected = facts.weakLetter === "alif" ? "الألف" : facts.weakLetter === "waw" ? "الواو" : facts.weakLetter === "ya" ? "الياء" : "حرف العلة";
      return `أسند (${targetNow}) إلى المضارع مع الضمير هو: هو ${presentBase}. الحرف الأخير في الأصل هو ${expected}، وهو المحذوف من فعل الأمر.`;
    }
  }

  if (id === "past_has_pronoun") {
    return `جرّب الإسناد إلى (هو): إذا تغيّر شكل الفعل عند قولك: هو ${String(target || "كتب").replace(/[ًٌٍَُِّْ]/g, "")}، فغالبًا كان في الكلمة ضمير متصل. مثال: كتبتُ ← هو كتب؛ إذن التاء ضمير.`;
  }
  if (id === "past_is_sukoon_set" || id === "past_sukoon_type") {
    return "فكّر هكذا: تاء الفاعل ونا الفاعلين ونون النسوة تجعل الماضي مبنيًا على السكون. جرّب فصل الضمير: كتبتُ ← كتبَ.";
  }  if (isFiveVerbDecision(node)) {
    return `فكّر هكذا: الأفعال الخمسة لا نعرفها من المعنى، بل من الاتصال. هل ${target} اتصل بواو الجماعة أو ياء المخاطبة أو ألف الاثنين؟`;
  }
  if (id === "present_nun_niswa") return `نون النسوة ضمير يدل على مجموعة مؤنثة، مثل: يساعدْنَ، يدرسْنَ. إذا اتصلت بالفعل المضارع حسمت البناء مباشرة، فلا نحتاج لفحص الرفع أو النصب أو الجزم. انظر إلى آخر ${target}: هل اتصلت به؟`;
  if (id === "present_nun_tawkid") return `بعد استبعاد نون النسوة نفحص نون التوكيد. إذا اتصلت بالفعل حسمت البناء، وإذا لم تتصل بقي الفعل معربًا، وسنحدد لاحقًا: مرفوع أم منصوب أم مجزوم.`;
  if (id === "present_has_tool") return `لأن الفعل بقي معربًا، نفحص الآن ما قبله: هل سبقه أداة نصب أو جزم؟ أدوات النصب تنصب، وأدوات الجزم تجزم، وإن لم يسبق بأداة مؤثرة فهو مرفوع.`;
  if (id === "present_tool_type") return "فكّر هكذا: لن/أن/كي أدوات نصب، ولم/لا الناهية/لام الأمر أدوات جزم.";
  if (id.includes("ending") && !id.includes("kana") && !id.includes("inna")) return `حروف العلة هي: ا، و، ي. انظر إلى آخر الفعل (${target}): هل انتهى بألف أو واو أو ياء؟ إذا نعم فهو معتل الآخر، وإذا لا فهو صحيح الآخر.`;
  if (id.includes("weak") && !id.includes("kana") && !id.includes("inna")) return "حروف العلة هي: ا، و، ي. حدّد حرف العلة الأخير: هل هو ألف، أم واو/ياء؟ هذا يحدد نوع العلامة المقدرة أو الظاهرة.";


  if (id.includes("kana")) {
    const pickedText = String(picked?.text || "");
    const sentence = String(state?.currentSentence || "");
    const currentTarget = String(state?.currentTarget || target || "الكلمة المحددة");

    if (id === "kana_factor_gate") {
      if (pickedText.includes("اسم")) return "الاسم لا يدل على زمن بنفسه. أما كان وأخواتها فتدل على زمن أو معنى فعلي؛ فـ(كان) للماضي، و(ليس) للنفي، و(صار) للتحول. لذلك لا نعدها أسماء.";
      if (pickedText.includes("حرف")) return "الحرف لا يدل على زمن بنفسه ولا يعمل عمل الفعل. أما كان وأخواتها فهي أفعال ناسخة؛ تدخل على الجملة الاسمية وتغير حكم الخبر. لذلك لا نعدها حروفًا.";
    }
    if (id === "kana_naskh_explain") {
      if (pickedText.includes("تنصب الاسم")) return "هذا أثر إن وأخواتها. أما كان وأخواتها فالمبتدأ بعد دخولها يصير اسم كان ويبقى مرفوعًا، والخبر يصير خبر كان منصوبًا.";
      if (pickedText.includes("لا تغير")) return "لو لم تغير الحكم لبقي الخبر مرفوعًا. لكننا نقول: المعلمُ حاضرٌ، ثم: كان المعلمُ حاضرًا؛ فتغير الخبر من الرفع إلى النصب.";
    }
    if (id === "kana_target") {
      if (pickedText.includes("فاعل")) return `ارجع إلى الكلمة المحددة في المثال: هل السؤال يطلب من قام بالفعل، أم يطلب إعراب كلمة داخل جملة فيها فعل ناسخ؟`;
      if (pickedText.includes("نعت") || pickedText.includes("صفة")) return `لا تبدأ من اسم القاعدة. ارجع إلى المثال: هل الكلمة المحددة هي ما نتحدث عنه، أم هي ما عرفناه عنه؟`;
      if (pickedText.includes("اسم") && String(state?.facts?.targetRole) === "khabar") return `ركز على الكلمة المحددة نفسها: ماذا أضافت إلى معنى الجملة؟ ثم أعد الاختيار.`;
      if (pickedText.includes("خبر") && String(state?.facts?.targetRole) === "ism") return `ابحث عن الاسم الذي تتحدث عنه الجملة أولًا، ثم أعد الاختيار.`;
      if (pickedText.includes("غير ظاهر") && String(state?.facts?.targetRole) !== "hidden_ism") return `لا نقدّر اسمًا مستترًا إلا إذا دلّ المثال على ذلك. ارجع إلى الكلمة المحددة في الجملة.`;
    }
    if (id === "kana_ism_start" || id === "kana_khabar_single_start") {
      if (pickedText.includes("مبني")) return `اخترت أن (${currentTarget}) اسم مبني. افحص الكلمة نفسها: هل هي ضمير مثل التاء أو هو؟ هل هي اسم إشارة مثل هذا؟ هل هي اسم موصول مثل الذي؟ أم أنها كلمة يتغير آخرها بحسب موقعها؟`;
      if (pickedText.includes("مصدر")) return `المصدر المؤول ليس كلمة واحدة عادية، بل تركيب مثل: أن تنجح أو أن تتعلم، ويؤول إلى مصدر: نجاحك أو تعلمك. هل (${currentTarget}) تركيب من هذا النوع أم كلمة واحدة؟`;
      if (pickedText.includes("معرب")) return `الاسم المعرب يتغير آخره بحسب موقعه. اختبر (${currentTarget}): هل تظهر عليه العلامة أو يمكن أن تتغير، أم يلزم صورة واحدة مثل الضمائر وأسماء الإشارة والموصولات؟`;
    }
    if (id === "kana_ism_built" || id === "kana_khabar_single_built") {
      if (pickedText.includes("إشارة")) return `اسم الإشارة يدل على مشار إليه مثل: هذا، هذه، ذلك. هل (${currentTarget}) يشير إلى شيء، أم يدل على متكلم أو مخاطب أو غائب، أم يحتاج صلة بعده؟`;
      if (pickedText.includes("ضمير")) return `الضمير يدل على متكلم أو مخاطب أو غائب، مثل: أنا، أنت، هو، والتاء في (كنتُ). هل (${currentTarget}) ضمير فعلًا، أم اسم إشارة أو موصول؟`;
      if (pickedText.includes("موصول")) return `الاسم الموصول مثل: الذي، التي، من، ما، ويحتاج صلة بعده توضحه. هل (${currentTarget}) من هذه الأسماء ويحتاج صلة، أم هو نوع آخر من المبنيات؟`;
      if (pickedText.includes("استفهام")) return `اسم الاستفهام يطلب جوابًا مثل: من؟ ما؟ أين؟ هل الجملة هنا سؤال حقيقي، أم أن (${currentTarget}) يؤدي وظيفة أخرى؟`;
      if (pickedText.includes("شرط")) return `اسم الشرط يربط فعل الشرط بجوابه مثل: من يجتهد ينجح. هل في الجملة شرط وجواب، أم أن (${currentTarget}) ليس اسم شرط؟`;
      if (pickedText.includes("كم")) return `كم الخبرية تدل على الكثرة ولا تطلب جوابًا. هل الكلمة المحددة هي (كم) بهذا المعنى، أم اسم مبني آخر؟`;
    }
    if (id === "kana_khabar_kind") {
      if (pickedText.includes("مفرد")) return `انظر إلى (${currentTarget}) في المثال نفسه. هل هو كلمة واحدة فقط؟ تذكّر أن كلمة واحدة قد تكون مثنى أو جمعًا، ومع ذلك تسمى خبرًا مفردًا من حيث الصورة.`;
      if (pickedText.includes("جملة")) return `انظر إلى (${currentTarget}). هل ترى جملة كاملة فيها فعل وفاعل، أو مبتدأ وخبر داخليان؟ أم أنه كلمة واحدة أو تركيب جار ومجرور أو ظرف؟`;
      if (pickedText.includes("شبه")) return `انظر إلى (${currentTarget}). شبه الجملة يكون مثل: في الحقيبة، عند المعلم، فوق الطاولة. هل الموجود أمامك تركيب من هذا النوع، أم كلمة واحدة أو جملة كاملة؟`;
    }
    if (id === "kana_ism_number" || id === "kana_khabar_single_number") {
      if (pickedText.includes("مثنى")) return `المثنى يدل على اثنين وينتهي غالبًا بـ(ان) أو (ين). انظر إلى (${currentTarget}): هل يدل على اثنين؟ وهل يحمل علامة التثنية؟`;
      if (pickedText.includes("جمع مذكر")) return `جمع المذكر السالم يدل على جماعة ذكور عاقلة، وينتهي غالبًا بـ(ون) رفعًا أو (ين) نصبًا وجرًا. هل (${currentTarget}) ينتهي بهذه العلامة ويدل على جماعة ذكور؟`;
      if (pickedText.includes("جمع مؤنث")) return `جمع المؤنث السالم ينتهي غالبًا بـ(ات). انظر إلى (${currentTarget}): هل انتهت الكلمة بـ(ات)، مثل: مجتهدات، طالبات؟`;
      if (pickedText.includes("جمع تكسير")) return `جمع التكسير تتغير فيه صورة المفرد مثل: كتاب ← كتب، رجل ← رجال. هل تغيرت بنية (${currentTarget}) بهذه الطريقة، أم أن علامة الجمع ظاهرة في آخره؟`;
      const isFiveNounTarget = String(currentTarget || "").includes("أبو") || String(currentTarget || "").includes("أخو") || String(currentTarget || "").includes("حمو") || String(currentTarget || "").includes("فوك") || String(currentTarget || "").includes("ذو");
      if (pickedText.includes("مفرد") && isFiveNounTarget) {
        const fiveMark = id === "kana_khabar_single_number" ? "ينصب بالألف لا بالفتحة" : "يرفع بالواو لا بالضمة";
        return `أحسنت، (${currentTarget}) يدل على واحد فعلًا، لكن له باب خاص لأنه من الأسماء الخمسة. إذا تحققت شروطها: مفرد، ومضاف، وغير مضاف إلى ياء المتكلم؛ فإنه يعرب بالحروف. وهنا ${fiveMark}. عد للسؤال واختر: من الأسماء الخمسة.`;
      }
      if (pickedText.includes("الأسماء الخمسة")) return `الأسماء الخمسة هي: أب، أخ، حم، فو، ذو بمعنى صاحب. وتشترط لإعرابها بالحروف أن تكون مفردة، مضافة، غير مضافة إلى ياء المتكلم. هل (${currentTarget}) واحد منها؟`;
      if (pickedText.includes("مفرد")) return `المفرد هنا يعني أنه يدل على واحد لا مثنى ولا جمع. افحص (${currentTarget}): هل يدل على واحد، أم على اثنين، أم جماعة؟`;
    }
    if (id === "kana_ism_ending" || id === "kana_khabar_single_ending") {
      if (pickedText.includes("معتل")) return `انظر إلى (${currentTarget}). إن رأيت ألفًا في آخر كلمة مثل (نشيطًا)، فقد تكون هذه ألف تنوين النصب وليست من أصل الكلمة. احذف التنوين وانظر إلى الأصل: نشيط. الحرف الأخير الأصلي هو الطاء، فهل الطاء حرف علة؟`;
      if (pickedText.includes("صحيح")) return `صحيح الآخر يعني أن الحرف الأصلي الأخير ليس ألفًا ولا واوًا ولا ياء. لا تحكم من التنوين أو العلامة الزائدة؛ ارجع إلى أصل (${currentTarget}) ثم انظر إلى حرفه الأخير.`;
    }
    if (id === "kana_khabar_sentence_type") {
      if (pickedText.includes("فعلية")) return `الجملة الفعلية تبدأ بفعل. انظر إلى بداية الخبر (${currentTarget}): هل بدأ بفعل مثل يقرأ، أم باسم؟`;
      if (pickedText.includes("اسمية")) return `الجملة الاسمية تبدأ باسم وفيها مبتدأ وخبر داخليان. انظر إلى الخبر (${currentTarget}): هل بدأ باسم أم بفعل؟`;
    }
    if (id === "kana_khabar_shibh_type") {
      if (pickedText.includes("جار")) return `الجار والمجرور يبدأ بحرف جر مثل: في، على، من، إلى. انظر إلى (${currentTarget}): هل بدأ بحرف جر؟`;
      if (pickedText.includes("ظرف")) return `الظرف يدل على زمان أو مكان مثل: عند، فوق، تحت، أمام. هل (${currentTarget}) ظرف، أم جار ومجرور بدأ بحرف جر؟`;
    }
  }

  if (id.includes("inna")) {
    const pickedText = String(picked?.text || "");
    const sentence = String(state?.currentSentence || "");
    const currentTarget = String(state?.currentTarget || target || "الكلمة المحددة");

    // تلميحات زر «لا أعلم» في باب إن: تكون موجّهة من المثال نفسه،
    // لا من تعريفات عامة، ولا تكرر الخيارات داخل السؤال.
    if (!picked) {
      const role = String(state?.facts?.targetRole || "");
      const nounKind = String(state?.facts?.nounKind || "");
      const khabarKind = String(state?.facts?.khabarKind || "");
      const number = String(state?.facts?.number || "");
      const ending = String(state?.facts?.ending || "");
      const mabniType = String(state?.facts?.mabniType || "");
      const shibhType = String(state?.facts?.shibhType || "");

      if (id === "inna_meaning") {
        const particleMeaning = String(state?.facts?.particleMeaning || "tawkid");
        const subject = String(state?.facts?.meaningSubject || "الاسم").replace(/\.$/, "");
        const predicate = String(state?.facts?.meaningPredicate || "الخبر").replace(/\.$/, "");
        const judgment = String(state?.facts?.meaningJudgment || "الحكم الكامل").replace(/\.$/, "");
        if (particleMeaning === "tamanni") return `ليت تفيد التمني: طلب شيء صعب أو مستحيل. لا نتمنى (${subject}) وحده ولا (${predicate}) وحدها، بل تحقق المعنى كاملًا: (${judgment}).`;
        if (particleMeaning === "tarajji") return `لعل تفيد الترجي: انتظار أمر ممكن ومرغوب. الرجاء هنا متعلق بالمعنى الكامل: (${judgment}).`;
        if (particleMeaning === "tashbih") return `كأن تفيد التشبيه: تشبيه الاسم بالخبر. لا تقف عند كلمة واحدة، بل انظر إلى علاقة التشبيه كاملة: (${judgment}).`;
        if (particleMeaning === "istidrak") return `لكن تفيد الاستدراك: منع فهم خاطئ مما قبلها، أو إثبات معنى بعد نفي سابق. لذلك لا نأخذ كلمة وحدها، بل ننظر إلى المعنى الكامل الذي جاء بعد لكن: (${judgment}).`;
        return `إن أو أن تفيدان التوكيد: لا تؤكد كلمة منفردة هنا، بل تؤكد الحكم الكامل. هل المقصود تأكيد (${subject}) وحده، أم تأكيد أن (${judgment})؟`;
      }

      if (id === "inna_compact_role") {
        const judgment = String(state?.facts?.meaningJudgment || "الجملة الأصلية").replace(/\.$/, "");
        const baseStart = String(state?.facts?.baseStart || "");
        const subject = String(state?.facts?.meaningSubject || "الاسم الأول").replace(/\.$/, "");
        const predicate = String(state?.facts?.meaningPredicate || "الخبر").replace(/\.$/, "");
        const particle = String(state?.facts?.particleLabel || "إن");
        if (baseStart === "shibh") return `بعد حذف ${particle} يظهر الأصل: (${judgment}). تقدمت شبه الجملة (${predicate})، لذلك بعد دخول ${particle} تكون خبرًا مقدمًا، والاسم النكرة بعدها اسم ${particle} مؤخرًا.`;
        if (role === "ism") return `في الأصل: (${judgment}). اسأل: من الذي نتحدث عنه؟ الجواب: (${subject}). هذه هي الكلمة التي تصبح اسم ${particle} بعد دخول الناسخ.`;
        if (role === "khabar") return `في الأصل: (${judgment}). اسأل: ما المعلومة عن (${subject})؟ الجواب: (${predicate}). هذه المعلومة تصبح خبر ${particle} بعد دخول الناسخ.`;
        return `احذف الناسخ مؤقتًا، ثم اسأل: من الاسم الذي نتحدث عنه؟ وما المعلومة عنه؟ الأول اسم الناسخ، والثاني خبره.`;
      }

      if (id === "inna_sentence_start") {
        const judgment = String(state?.facts?.meaningJudgment || "الجملة الأصلية").replace(/\.$/, "");
        const baseStart = String(state?.facts?.baseStart || "");
        const subject = String(state?.facts?.meaningSubject || "الاسم الأول").replace(/\.$/, "");
        const predicate = String(state?.facts?.meaningPredicate || "الخبر").replace(/\.$/, "");
        if (baseStart === "shibh") return `احذف الحرف الناسخ مؤقتًا، وانظر إلى أصل المعنى: (${judgment}). هنا البداية ليست الاسم المؤخر (${subject})، بل شبه الجملة التي تقدمت وهي (${predicate}).`;
        return `احذف الحرف الناسخ مؤقتًا، وانظر إلى أصل المعنى كله: (${judgment}). لا تنظر إلى الكلمة المحددة وحدها؛ البداية هنا هي (${subject}).`;
      }

      if (id === "inna_base_mubtada") {
        const subject = String(state?.facts?.meaningSubject || "الاسم الأول").replace(/\.$/, "");
        const predicate = String(state?.facts?.meaningPredicate || "الخبر").replace(/\.$/, "");
        if (role === "ism") return `في الأصل قبل الناسخ: (${subject}) هو الذي أخبرنا عنه بـ(${predicate})؛ إذن الكلمة المحددة تؤدي وظيفة المبتدأ.`;
        if (role === "khabar") return `في الأصل قبل الناسخ: (${predicate}) هي المعلومة التي أخبرت عن (${subject})؛ إذن الكلمة المحددة تؤدي وظيفة الخبر.`;
        return `المبتدأ هو الذي نخبر عنه، والخبر هو ما نخبر به. في الأصل: (${subject}) هو الذي أخبرنا عنه بـ(${predicate}).`;
      }

      if (id === "inna_after_nasikh_effect") {
        return `إن وأخواتها تنصب المبتدأ فيصير اسم إن. بما أن الكلمة المحددة كانت مبتدأ في الأصل، فنحن نتابعها الآن باعتبارها اسم إن.`;
      }

      if (id === "inna_after_khabar_effect") {
        return `إن وأخواتها ترفع الخبر ويسمى خبر إن. بما أن الكلمة المحددة كانت خبرًا في الأصل، فنحن نتابعها الآن باعتبارها خبر إن.`;
      }

      if (id === "inna_preposed_shibh_effect") {
        return `في مثل: إن في البيت رجلًا؛ شبه الجملة جاء أولًا فصار خبر إن مقدمًا، والاسم النكرة بعده صار اسم إن مؤخرًا منصوبًا.`;
      }

      if (id === "inna_target") {
        if (role === "ism") {
          return `ابدأ بعد الحرف الناسخ في الجملة. اسأل: من أو ما الاسم الذي دخلت عليه إن وصار الحديث عنه؟ إذا كانت الكلمة المحددة (${currentTarget}) هي هذا الاسم أو الضمير، فاختر الخيار الأول.`;
        }
        if (role === "khabar") {
          return `ابدأ باسم إن أولًا، ثم اسأل: ماذا قيل عنه؟ في جملة ${sentence || "المثال"} الكلمة المحددة (${currentTarget}) جاءت لتكمل المعنى عن اسم إن، فاختر الخيار الذي يقول إنها الجزء الذي أتم المعنى.`;
        }
        return `ابدأ بعد إن: حدّد الاسم الذي نتحدث عنه، ثم حدّد المعلومة التي أتمت المعنى عنه. بعدها اختر هل (${currentTarget}) هو الأول أم الثاني.`;
      }

      if (id === "inna_ism_start" || id === "inna_khabar_single_start") {
        if (nounKind === "connected_damir") return `انظر إلى (${currentTarget}) نفسها: هل هي ضمير اتصل بالحرف الناسخ مثل: الكاف في إنك، أو الهاء في إنه، أو الهاء في ليتها، أو هم في لعلهم؟ الضمير المتصل من الأسماء المبنية، لا يكون كلمة مستقلة.`;
        if (nounKind === "mabni") return `افحص (${currentTarget}): هل تلزم صورة واحدة مثل هذا/هذه/الذي/أنت؟ إذا نعم فهي اسم مبني، ثم نحدد محلها بحسب موقعها بعد إن.`;
        if (nounKind === "masdar") return `انظر هل المحدد تركيب من حرف مصدري وفعل، مثل: أن تنجح. هذا التركيب يؤول بمصدر صريح مثل: نجاحك.`;
        return `افحص (${currentTarget}) نفسها: هل هي اسم ظاهر يمكن أن تتغير علامته؟ إذا نعم فهي اسم معرب، ثم ننتقل إلى العدد وآخر الكلمة.`;
      }

      if (id === "inna_ism_built" || id === "inna_khabar_single_built") {
        if (mabniType === "ishara") return `هل (${currentTarget}) تستعمل للإشارة إلى شيء؟ مثل: هذا، هذه، هؤلاء. إذا نعم فهي اسم إشارة.`;
        if (mabniType === "mawsool") return `هل (${currentTarget}) تحتاج جملة بعدها توضّح معناها؟ مثل: الذي نجح، التي اجتهدت. إذا نعم فهي اسم موصول.`;
        if (mabniType === "damir") return `هل (${currentTarget}) تدل على متكلم أو مخاطب أو غائب، مثل: أنا، أنت، هو؟ إذا نعم فهي ضمير.`;
        return `قارن (${currentTarget}) بأنواع الأسماء المبنية: ضمير، اسم إشارة، اسم موصول. اختر النوع المطابق للكلمة نفسها.`;
      }

      if (id === "inna_khabar_kind") {
        if (khabarKind === "single") return `لا تحكم بعدد الكلمات حول الخبر. اسأل: هل (${currentTarget}) جملة فيها فعل وفاعل أو مبتدأ وخبر؟ وهل هي جار ومجرور أو ظرف؟ إذا لا، فهي خبر مفرد ولو جاء بعدها مضاف إليه مثل: ذو فضل.`;
        if (khabarKind === "sentence") return `انظر إلى الخبر كاملًا: هل فيه إسناد داخلي، أي فعل مع فاعله أو مبتدأ وخبر؟ إذا نعم فالخبر جملة كاملة لا كلمة واحدة.`;
        if (khabarKind === "shibh") return `شبه الجملة يكون جارًا ومجرورًا مثل: في البيت، أو ظرفًا مثل: عندنا. إذا كان المحدد من هذا النوع فهو خبر شبه جملة.`;
        return `حدّد صورة الخبر من المثال نفسه: كلمة ليست جملة، أم جملة كاملة، أم جار ومجرور أو ظرف.`;
      }

      if (id === "inna_ism_number" || id === "inna_khabar_single_number") {
        if (number === "five") return `افحص هل (${currentTarget}) من الأسماء الخمسة: أب، أخ، حم، فو، ذو. إذا كان مفردًا ومضافًا وغير مضاف إلى ياء المتكلم، فله علامة بالحروف.`;
        if (number === "dual") return `ابحث عن دلالة الاثنين وعلامة التثنية في (${currentTarget}): غالبًا ألف ونون أو ياء ونون.`;
        if (number === "jms") return `ابحث عن جماعة ذكور عاقلة وعلامة جمع المذكر السالم في (${currentTarget}): واو ونون أو ياء ونون.`;
        if (number === "jfs") return `ابحث عن ألف وتاء في آخر (${currentTarget}) مثل: الطالبات، المجتهدات؛ هذا يدل غالبًا على جمع مؤنث سالم.`;
        return `اسأل عن صورة (${currentTarget}): واحد أو جمع تكسير، اثنان، جمع مذكر سالم، جمع مؤنث سالم، أو اسم من الأسماء الخمسة.`;
      }

      if (id === "inna_ism_ending" || id === "inna_khabar_single_ending") {
        if (ending === "maqsur") return `الاسم المقصور آخره ألف لازمة مثل: الفتى، الهدى. على هذه الألف تُقدَّر العلامة غالبًا للتعذر.`;
        if (ending === "manqous") return `الاسم المنقوص آخره ياء لازمة مكسور ما قبلها مثل: القاضي. وقد تحذف الياء إذا كان نكرة مرفوعًا أو مجرورًا مثل: راضٍ.`;
        return `احذف التنوين والعلامات الزائدة، ثم انظر إلى الحرف الأصلي الأخير في (${currentTarget}): هل هو حرف صحيح، ألف مقصورة، أم ياء منقوصة؟`;
      }

      if (id === "inna_khabar_sentence_type") {
        return `انظر إلى أول كلمة في جملة الخبر: إن بدأت بفعل فهي جملة فعلية، وإن بدأت باسم وفيها خبر داخلي فهي جملة اسمية.`;
      }

      if (id === "inna_khabar_shibh_type") {
        if (shibhType === "jar") return `إذا بدأ المحدد بحرف جر مثل: في، على، من، إلى؛ فهو جار ومجرور.`;
        if (shibhType === "zarf") return `إذا كان المحدد يدل على مكان أو زمان مثل: عند، أمام، فوق؛ فهو ظرف.`;
        return `فرّق بين الجار والمجرور والظرف: حرف جر + اسم مجرور، أو ظرف مكان/زمان.`;
      }

      if (id === "inna_khabar_shibh_position_jar" || id === "inna_khabar_shibh_position_zarf") {
        return `انظر إلى الترتيب بعد إن: إذا جاء شبه الجملة مباشرة ثم بعده اسم نكرة منصوب، فشبه الجملة خبر مقدم، والاسم النكرة اسم إن مؤخر.`;
      }
    }

    if (id === "inna_meaning") {
      const particleMeaning = String(state?.facts?.particleMeaning || "tawkid");
      const subject = String(state?.facts?.meaningSubject || "الاسم").replace(/\.$/, "");
      const predicate = String(state?.facts?.meaningPredicate || "الخبر").replace(/\.$/, "");
      const judgment = String(state?.facts?.meaningJudgment || "الجملة").replace(/\.$/, "");
      const particle = String(state?.facts?.particleLabel || "إن");
      if (picked?.id === "semantic_subject") {
        if (particleMeaning === "tamanni") return `كلمة (${subject}) وحدها ليست الشيء المتمنى كاملًا؛ المتمنى هو تحقق المعنى كله: (${judgment}).`;
        if (particleMeaning === "tarajji") return `كلمة (${subject}) وحدها ليست الشيء المرجو كاملًا؛ المرجو هو تحقق المعنى كله: (${judgment}).`;
        if (particleMeaning === "tashbih") return `لا نقف عند (${subject}) وحده؛ كأن ربطت الاسم بالخبر لتفيد معنى التشبيه في: (${judgment}).`;
        if (particleMeaning === "istidrak") return `لكن لا تستدرك على كلمة منفردة هنا، بل على فكرة كاملة: (${judgment}).`;
        return `${particle} لا تؤكد كلمة (${subject}) وحدها هنا، بل تؤكد الحكم الكامل: (${judgment}).`;
      }
      if (picked?.id === "semantic_predicate") {
        if (particleMeaning === "tamanni") return `كلمة (${predicate}) جزء من المعنى، لكن التمني وقع على الجملة كلها: (${judgment}).`;
        if (particleMeaning === "tarajji") return `كلمة (${predicate}) جزء من المعنى، لكن الرجاء وقع على الجملة كلها: (${judgment}).`;
        if (particleMeaning === "tashbih") return `الخبر (${predicate}) جزء من التشبيه، لكن معنى كأن لا يتم إلا بالعلاقة كاملة: (${judgment}).`;
        if (particleMeaning === "istidrak") return `الخبر (${predicate}) جزء من الفكرة، لكن الاستدراك يكون على المعنى الكامل: (${judgment}).`;
        return `كلمة (${predicate}) جزء من المعنى، لكن التوكيد لم يقع عليها وحدها، بل على الجملة كلها: (${judgment}).`;
      }
    }

    if (id === "inna_compact_role") {
      const judgment = String(state?.facts?.meaningJudgment || "الجملة الأصلية").replace(/\.$/, "");
      const subject = String(state?.facts?.meaningSubject || "الاسم").replace(/\.$/, "");
      const predicate = String(state?.facts?.meaningPredicate || "الخبر").replace(/\.$/, "");
      const particle = String(state?.facts?.particleLabel || "إن");
      if (pickedText.includes("اسم") && state?.facts?.targetRole === "khabar") return innaGenericLabel(`في الجملة الاسمية (${judgment}) الاسم الذي نتحدث عنه هو (${subject})، أما (${currentTarget}) فهي المعلومة التي أتمت المعنى؛ لذلك هي خبر إن لا اسمها.`, state);
      if (pickedText.includes("خبر") && state?.facts?.targetRole === "ism") return innaGenericLabel(`في الجملة الاسمية (${judgment}) الكلمة المحددة (${currentTarget}) هي الاسم الذي نتحدث عنه، وبعد دخول ${particle} صارت اسم إن. الخبر هو المعلومة: (${predicate}).`, state);
    }

    if (id === "inna_sentence_start") {
      const judgment = String(state?.facts?.meaningJudgment || "الجملة الأصلية").replace(/\.$/, "");
      const subject = String(state?.facts?.meaningSubject || "الاسم").replace(/\.$/, "");
      const predicate = String(state?.facts?.meaningPredicate || "الخبر").replace(/\.$/, "");
      const particle = String(state?.facts?.particleLabel || "إن");
      const baseStart = String(state?.facts?.baseStart || "");
      if (pickedText.includes("حرف")) return `لا نحسب (${particle}) ضمن أصل الجملة؛ لأنه حرف ناسخ دخل عليها. احذفه مؤقتًا، ثم اقرأ أصل المعنى: (${judgment}). بعد الحذف نبحث عن بداية الأصل لا عن الحرف.`;
      if (pickedText.includes("فعل")) return `الفعل يدل على حدث وزمن مثل: كتب، يكتب، اقرأ. في أصل المعنى هنا (${judgment}) لا نبدأ بفعل؛ ${baseStart === "shibh" ? `البداية شبه جملة: (${predicate})` : `البداية اسم: (${subject})`}.`;
      if (pickedText.includes("شبه") && baseStart !== "shibh") return `قد تكون الكلمة المحددة (${currentTarget}) شبه جملة، لكن هذه الخطوة لا تسأل عن نوع الكلمة المحددة، بل عن بداية أصل الجملة كله. أصل المعنى: (${judgment}) بدأ باسم هو (${subject})، ثم جاء الخبر بعده.`;
      if (pickedText.includes("اسم") && baseStart === "shibh") return `في هذا المثال لا يبدأ الأصل باسم مباشر؛ بعد حذف (${particle}) يظهر الأصل: (${judgment})، وبدايته شبه جملة (${predicate})، ثم يأتي الاسم النكرة مؤخرًا: (${subject}).`;
    }

    if (id === "inna_base_mubtada") {
      const subject = String(state?.facts?.meaningSubject || "الاسم").replace(/\.$/, "");
      const predicate = String(state?.facts?.meaningPredicate || "الخبر").replace(/\.$/, "");
      if (pickedText.includes("خبر") && state?.facts?.targetRole === "ism") return `الخبر هو المعلومة التي قيلت عن المبتدأ. في الأصل: (${subject}) هو الذي نتحدث عنه، و(${predicate}) هي المعلومة عنه.`;
      if (pickedText.includes("مبتدأ") && state?.facts?.targetRole === "khabar") return `المبتدأ هو الذي نخبر عنه، أما (${currentTarget}) فهي المعلومة التي أتمت المعنى عن (${subject})؛ لذلك موقعها في الأصل خبر.`;
    }

    if (id === "inna_after_nasikh_effect") {
      if (pickedText.includes("خبر")) return innaGenericLabel(`المبتدأ الأصلي لا يصير خبر إن؛ بل يصير اسم إن منصوبًا. أما الخبر الأصلي فيبقى خبر إن مرفوعًا.`, state);
    }

    if (id === "inna_after_khabar_effect") {
      if (pickedText.includes("اسم")) return innaGenericLabel(`اسم إن هو المبتدأ الأصلي بعد دخول الناسخ. أما الخبر الأصلي فيبقى خبر إن مرفوعًا أو في محل رفع.`, state);
    }

    if (id === "inna_preposed_shibh_effect") {
      if (pickedText.includes("اسم")) return innaGenericLabel(`شبه الجملة لا يكون اسم إن في هذا التركيب؛ الاسم النكرة بعده هو اسم إن مؤخر، وشبه الجملة خبر مقدم.`, state);
    }

    if (id === "inna_factor_gate") {
      if (pickedText.includes("ترفع الاسم")) return "هذا أثر كان وأخواتها. أما إن وأخواتها فتنصب الاسم ويسمى اسم إن، وترفع الخبر ويسمى خبر إن.";
      if (pickedText.includes("لا تؤثر")) return "إن وأخواتها حروف ناسخة؛ دخولها يغير الحكم الإعرابي: نقول الطالبُ نشيطٌ، ثم إن الطالبَ نشيطٌ.";
    }
    if (id === "inna_target") {
      if (pickedText.includes("كان")) return `هذا باب إن وأخواتها لا باب كان. في جملة ${sentence} الحرف الناسخ ${innaParticleName(state)} ينصب اسمه ويرفع خبره. عد إلى السؤال واختر الموقع بعد دخول الحرف الناسخ.`;
      if (pickedText.includes("نعت")) return innaGenericLabel(`النعت تابع يصف ما قبله، أما اسم إن وخبرها فهما ركنا الجملة بعد دخول إن. افحص (${currentTarget}): هل هي تابعة لما قبلها، أم هي الاسم أو الخبر؟`, state);
      if (pickedText.includes("اسم")) return `اسأل: ما الاسم الذي دخلت عليه ${innaParticleName(state)} ونصبته؟ إذا لم تكن (${currentTarget}) هي هذا الاسم، فراجع اختيارك.`;
      if (pickedText.includes("خبر")) return `اسأل: بماذا أُخبرنا عن اسم ${innaParticleName(state)}؟ إذا لم تكن (${currentTarget}) هي المعلومة التي أتمت المعنى، فراجع اختيارك.`;
    }
    if (id === "inna_ism_start" || id === "inna_khabar_single_start") {
      if (pickedText.includes("مبني")) return `اخترت أن (${currentTarget}) اسم مبني. تذكر: الاسم المبني ليس حرفًا؛ هو من الأسماء لكنه ثابت الآخر. افحص الكلمة نفسها: هل هي ضمير مثل الكاف في إنك؟ هل هي اسم إشارة مثل هذا؟ هل هي اسم موصول مثل الذي؟ أم أنها كلمة يتغير آخرها بحسب موقعها؟`;
      if (pickedText.includes("مصدر")) return `المصدر المؤول تركيب مثل: أن تنجح أو أن تتعلم، ويؤول إلى مصدر: نجاحك أو تعلمك. هل (${currentTarget}) تركيب من هذا النوع أم كلمة واحدة؟`;
      if (pickedText.includes("معرب")) return `الاسم المعرب يتغير آخره بحسب موقعه. اختبر (${currentTarget}): هل تظهر عليه العلامة أو يمكن أن تتغير، أم يلزم صورة واحدة مثل الضمائر وأسماء الإشارة والموصولات؟`;
    }
    if (id === "inna_ism_built" || id === "inna_khabar_single_built") {
      if (pickedText.includes("إشارة")) return `اسم الإشارة يدل على مشار إليه مثل: هذا، هذه، ذلك. هل (${currentTarget}) يشير إلى شيء، أم يدل على متكلم أو مخاطب أو غائب، أم يحتاج صلة بعده؟`;
      if (pickedText.includes("ضمير")) return `الضمير يدل على متكلم أو مخاطب أو غائب. الكاف في (إنك) ضمير متصل؛ أما (هذا) فاسم إشارة، و(الذي) اسم موصول.`;
      if (pickedText.includes("موصول")) return `الاسم الموصول مثل: الذي، التي، من، ما، ويحتاج صلة بعده توضحه. هل (${currentTarget}) من هذه الأسماء ويحتاج صلة؟`;
      if (pickedText.includes("استفهام")) return `اسم الاستفهام يطلب جوابًا مثل: من؟ ما؟ أين؟ هل الجملة هنا سؤال حقيقي، أم أن (${currentTarget}) يؤدي وظيفة أخرى؟`;
      if (pickedText.includes("شرط")) return `اسم الشرط يربط فعل الشرط بجوابه مثل: من يجتهد ينجح. هل في الجملة شرط وجواب؟`;
      if (pickedText.includes("كم")) return `كم الخبرية تدل على الكثرة ولا تطلب جوابًا. هل الكلمة المحددة هي (كم) بهذا المعنى، أم اسم مبني آخر؟`;
    }
    if (id === "inna_khabar_kind") {
      if (pickedText.includes("مفرد") && state?.facts?.shibhType === "zarf") return `صحيح أن (${currentTarget}) كلمة واحدة، لكنها هنا ظرف زمان/مكان. والظرف في باب الخبر يعامل كشبه جملة؛ لأنه متعلق بمحذوف تقديره: موجود أو كائن. لذلك في: ليت اللقاء غدًا، تكون (غدًا) شبه جملة ظرفية في محل رفع خبر ${innaParticleName(state)}.`;
      if (pickedText.includes("مفرد") && state?.facts?.shibhType === "jar") return `الجار والمجرور مثل (${currentTarget}) ليس خبرًا مفردًا، بل شبه جملة؛ لأنه تركيب يبدأ بحرف جر ويتعلق بمحذوف خبر.`;
      if (pickedText.includes("مفرد")) return `انظر إلى (${currentTarget}) في المثال نفسه. الخبر المفرد في النحو يعني: ليس جملة ولا شبه جملة، ولو كان مثنى أو جمعًا أو مضافًا.`;
      if (pickedText.includes("جملة") && state?.facts?.nounKind === "masdar") return `صحيح أن داخل (${currentTarget}) فعلًا وفاعلًا، لكن التركيب سبق بـ(أن)، فصار مصدرًا مؤولًا يؤول باسم مثل: نجاحك. لذلك لا نعربه خبر جملة، بل مصدرًا مؤولًا في محل رفع خبر ${innaParticleName(state)}.`;
      if (pickedText.includes("جملة")) return `انظر إلى (${currentTarget}). هل ترى جملة كاملة فيها فعل وفاعل، أو مبتدأ وخبر داخليان؟ أم أنه كلمة واحدة أو تركيب جار ومجرور أو ظرف؟`;
      if (pickedText.includes("شبه")) return `انظر إلى (${currentTarget}). شبه الجملة يكون مثل: في الحقيبة، عند المعلم، فوق الطاولة، أو ظرفًا مثل: غدًا. هل الموجود أمامك تركيب من هذا النوع؟`;
    }
    if (id === "inna_ism_number" || id === "inna_khabar_single_number") {
      if (pickedText.includes("مثنى")) return `المثنى يدل على اثنين وينتهي غالبًا بـ(ان) أو (ين). انظر إلى (${currentTarget}): هل يدل على اثنين؟`;
      if (pickedText.includes("جمع مذكر")) return `جمع المذكر السالم يدل على جماعة ذكور عاقلة، وينتهي غالبًا بـ(ون) رفعًا أو (ين) نصبًا وجرًا. هل (${currentTarget}) يوافق ذلك؟`;
      if (pickedText.includes("جمع مؤنث")) return `جمع المؤنث السالم ينتهي غالبًا بـ(ات). انظر إلى (${currentTarget}): هل انتهت الكلمة بـ(ات)، مثل: مجتهدات، طالبات؟`;
      if (pickedText.includes("جمع تكسير")) return `جمع التكسير تتغير فيه صورة المفرد مثل: كتاب ← كتب، رجل ← رجال. هل تغيرت بنية (${currentTarget}) بهذه الطريقة؟`;
      const isFiveNounTarget = String(currentTarget || "").includes("أبو") || String(currentTarget || "").includes("أبا") || String(currentTarget || "").includes("أبي") || String(currentTarget || "").includes("أخو") || String(currentTarget || "").includes("أخا") || String(currentTarget || "").includes("أخي") || String(currentTarget || "").includes("حمو") || String(currentTarget || "").includes("فوك") || String(currentTarget || "").includes("فو") || String(currentTarget || "").includes("ذو") || String(currentTarget || "").includes("ذا") || String(currentTarget || "").includes("ذي");
      if (pickedText.includes("مفرد") && isFiveNounTarget) {
        const fiveMark = id === "inna_ism_number" ? "ينصب بالألف لا بالفتحة" : "يرفع بالواو لا بالضمة";
        return `أحسنت، (${currentTarget}) يدل على واحد فعلًا، لكن له باب خاص لأنه من الأسماء الخمسة. إذا تحققت شروطها: مفرد، ومضاف، وغير مضاف إلى ياء المتكلم؛ فإنه يعرب بالحروف. وهنا ${fiveMark}. عد للسؤال واختر: من الأسماء الخمسة.`;
      }
      if (pickedText.includes("الأسماء الخمسة")) return `الأسماء الخمسة هي: أب، أخ، حم، فو، ذو بمعنى صاحب. هل (${currentTarget}) واحد منها وتحققت شروطها؟`;
      if (pickedText.includes("مفرد")) return `افحص (${currentTarget}): هل يدل على واحد، أم على اثنين، أم على جمع؟`;
    }
    if (id === "inna_ism_ending" || id === "inna_khabar_single_ending") {
      if (pickedText.includes("معتل")) return `انظر إلى (${currentTarget}). إذا كان الاسم منقوصًا مثل راضٍ فأصله راضي، وتقدر الضمة على الياء للثقل، وقد تحذف الياء إذا كان الاسم نكرة مرفوعًا أو مجرورًا غير مضاف ولا معرف بـ(أل).`;
      if (pickedText.includes("صحيح")) return `صحيح الآخر يعني أن الحرف الأصلي الأخير ليس ألفًا ولا واوًا ولا ياء. لا تحكم من التنوين أو العلامة الزائدة؛ ارجع إلى أصل (${currentTarget}).`;
    }
    if (id === "inna_khabar_sentence_type") {
      if (pickedText.includes("فعلية")) return `الجملة الفعلية تبدأ بفعل. انظر إلى بداية الخبر (${currentTarget}): هل بدأ بفعل مثل يقرأ، أم باسم؟`;
      if (pickedText.includes("اسمية")) return `الجملة الاسمية تبدأ باسم وفيها مبتدأ وخبر داخليان. انظر إلى الخبر (${currentTarget}): هل بدأ باسم أم بفعل؟`;
    }
    if (id === "inna_khabar_shibh_type") {
      if (pickedText.includes("جار")) return `الجار والمجرور يبدأ بحرف جر مثل: في، على، من، إلى. انظر إلى (${currentTarget}): هل بدأ بحرف جر؟`;
      if (pickedText.includes("ظرف")) return `الظرف يدل على زمان أو مكان مثل: عند، فوق، تحت، أمام. هل (${currentTarget}) ظرف، أم جار ومجرور بدأ بحرف جر؟`;
    }
  }

  if (id.includes("mubtada")) {
    const pickedText = String(picked?.text || "");
    const currentTarget = String(state?.currentTarget || target || "الكلمة المحددة");
    const sentence = String(state?.currentSentence || "");

    if (id === "mubtada_word_type") {
      if (pickedText.includes("فعل")) {
        if (currentTarget.includes("أن")) {
          return `صحيح أن داخل التركيب (${currentTarget}) فعلًا مضارعًا، لكن المطلوب ليس الفعل وحده. نحن ننظر إلى التركيب كاملًا: (${currentTarget}). سبقت (أن) الفعل المضارع، و(أن) حرف مصدري، لذلك يؤول التركيب بمصدر، مثل: أن تتعلم ← تعلّمك، وأن تنجح ← نجاحك. إذن نعامله هنا معاملة الاسم.`;
        }
        return `الفعل يدل على حدث مرتبط بزمن، مثل: كتب، يكتب، اكتب. اختبر (${currentTarget}) في جملة ${sentence}: هل يدل على حدث وقع أو يقع أو سيقع؟ إذا كان مثل (العلم) فهو لا يدل على حدث، وإذا كان مثل (هذا) فهو يدل على مشار إليه. إذن لا نعده فعلًا.`;
      }
      if (pickedText.includes("حرف")) {
        if (["هذا", "هذه", "ذلك", "تلك", "هؤلاء"].some((w) => currentTarget.includes(w))) {
          return `قد تظن أن (${currentTarget}) حرف لأنه قصير، لكن عدد الحروف لا يحدد نوع الكلمة. (${currentTarget}) من أسماء الإشارة، وأسماء الإشارة أسماء في النحو، وتعامل معاملة الأسماء في الإعراب، لكنها أسماء مبنية.`;
        }
        if (["أنا", "نحن", "هو", "هي", "أنت", "هم"].some((w) => currentTarget.includes(w))) {
          return `(${currentTarget}) ضمير، والضمائر أسماء مبنية. ليست حروفًا؛ لأنها تدل على متكلم أو مخاطب أو غائب، ويمكن أن تقع في موقع المبتدأ.`;
        }
        if (["الذي", "التي", "اللذان", "الذين"].some((w) => currentTarget.includes(w))) {
          return `(${currentTarget}) اسم موصول، والاسم الموصول اسم مبني يحتاج صلة بعده توضحه. هو ليس حرفًا، بل يعامل معاملة الأسماء في الإعراب.`;
        }
        if (currentTarget.includes("أن")) {
          return `لا نعرب (أن) وحدها هنا؛ ننظر إلى التركيب كاملًا: (${currentTarget}). هذا مصدر مؤول، أي يمكن تأويله بمصدر صريح، فيعامل معاملة الاسم.`;
        }
        return `الحرف مثل: من، إلى، في، ولا يظهر معناه كاملًا إلا مع غيره. أما (${currentTarget}) فاستعماله هنا استعمال اسم أو ما يؤول باسم، لذلك نتابع فحص دوره في الجملة.`;
      }
    }

    if (id === "mubtada_function_gate") {
      if (pickedText.includes("قامت") || pickedText.includes("فاعل")) {
        return `الفاعل نبحث عنه بعد فعل ونسأل: من فعل؟ في جملة ${sentence} نحن نفحص (${currentTarget}) نفسه: هل جاء بعد فعل فقام به، أم بدأنا الحديث عنه؟ لا تجعل الكلمة التي بعده هي محور الجملة قبل إعراب الكلمة المحددة.`;
      }
      if (pickedText.includes("وقع")) {
        return `المفعول به يحتاج فعلًا يقع عليه. في جملة ${sentence} اسأل: هل وقع فعل على (${currentTarget})، أم بدأنا الحديث عنه ثم جاء بعده ما يخبر عنه؟`;
      }
      return `انظر إلى موقع (${currentTarget}) ومعناه في الجملة: هل بدأنا الحديث عنه؟ إذا نعم فهو يؤدي وظيفة المبتدأ.`;
    }

    if (id === "mubtada_start") {
      if (pickedText.includes("معرب")) {
        return `الاسم المعرب تتغير علامة آخره بحسب موقعه، مثل: طالبٌ، طالبًا، طالبٍ. اختبر (${currentTarget}): هل يتغير آخره بهذه الطريقة، أم يبقى على صورة واحدة مثل أسماء الإشارة والضمائر والموصولات؟`;
      }
      if (pickedText.includes("مبني")) {
        return `الاسم المبني يلزم صورة واحدة مثل: هذا، أنا، الذي. إذا كانت الكلمة (${currentTarget}) مثل العلم أو الطالبان أو أبوك فهي ليست مبنية؛ أما إن كانت اسم إشارة أو ضميرًا أو موصولًا فهي مبنية في محل رفع.`;
      }
      if (pickedText.includes("مصدر")) {
        return `المصدر المؤول تركيب من حرف مصدري وفعل، مثل: أن تتعلم. لا ننظر إلى الفعل وحده، بل إلى التركيب كاملًا، ثم نؤوله بمصدر: أن تتعلم ← تعلّمك، وأن تنجح ← نجاحك. هل (${currentTarget}) تركيب من هذا النوع، أم كلمة مفردة؟`;
      }
    }

    if (id === "mubtada_built") {
      if (pickedText.includes("إشارة")) return `اسم الإشارة يدل على مشار إليه مثل: هذا، هذه، ذلك. هل (${currentTarget}) يشير إلى شيء، أم يدل على متكلم/غائب، أم يحتاج صلة بعده؟`;
      if (pickedText.includes("ضمير")) return `الضمير يدل على متكلم أو مخاطب أو غائب مثل: أنا، أنت، هو. هل (${currentTarget}) ضمير، أم اسم إشارة، أم اسم موصول؟`;
      if (pickedText.includes("موصول")) return `الاسم الموصول مثل: الذي، التي، من، ما، ويحتاج صلة بعده توضحه. هل (${currentTarget}) من هذه الأسماء ويحتاج صلة، أم هو نوع مبني آخر؟`;
      if (pickedText.includes("استفهام")) return `اسم الاستفهام يطلب جوابًا مثل: من؟ ما؟ أين؟ إذا لم تكن الجملة سؤالًا حقيقيًا فراجع نوع (${currentTarget}).`;
      if (pickedText.includes("شرط")) return `اسم الشرط يربط فعل الشرط بجوابه مثل: من يجتهد ينجح. هل في الجملة شرط وجواب، أم أن (${currentTarget}) يؤدي معنى آخر؟`;
      if (pickedText.includes("كم")) return `كم الخبرية تدل على الكثرة ولا تطلب جوابًا. هل الكلمة المحددة هي (كم) بهذا المعنى، أم اسم مبني آخر؟`;
    }

    if (id === "mubtada_number") {
      if (pickedText.includes("مثنى")) return `المثنى يدل على اثنين، وغالبًا ينتهي بـ(ان) رفعًا أو (ين) نصبًا وجرًا، مثل: الطالبان، المعلمين. انظر إلى (${currentTarget}): هل يدل على اثنين؟ وهل يحمل علامة التثنية؟`;
      if (pickedText.includes("جمع مذكر")) return `جمع المذكر السالم يدل على جماعة ذكور عاقلة، وينتهي غالبًا بـ(ون) في الرفع أو (ين) في النصب والجر. هل (${currentTarget}) ينتهي بـ(ون/ين) ويدل على جماعة ذكور؟`;
      if (pickedText.includes("جمع مؤنث")) return `جمع المؤنث السالم ينتهي غالبًا بـ(ات)، مثل: الطالبات، المؤمنات. هل (${currentTarget}) ينتهي بـ(ات) ويدل على جماعة مؤنثة؟`;
      if (pickedText.includes("جمع تكسير")) return `جمع التكسير يدل على أكثر من اثنين وتتغير فيه صورة المفرد، مثل: كتاب ← كتب، رجل ← رجال. هل (${currentTarget}) جمع بهذا المعنى، أم يدل على واحد؟`;
      if (pickedText.includes("الأسماء الخمسة")) return `الأسماء الخمسة هي: أب، أخ، حم، فو، ذو بمعنى صاحب. ولا تعرب بالحروف إلا بشروط: أن تكون مفردة، مضافة، غير مضافة إلى ياء المتكلم، وأن تكون (ذو) بمعنى صاحب. هل (${currentTarget}) واحد منها وتحققت شروطه؟`;
      if (pickedText.includes("مفرد")) return `المفرد يدل على واحد أو واحدة. انظر إلى (${currentTarget}): هل يدل على واحد، أم على اثنين، أم جماعة، أم هو من الأسماء الخمسة؟`;
    }
  }

  if (id.includes("khabar")) {
    const pickedText = String(picked?.text || "");
    const sentence = String(state?.currentSentence || "");
    const currentTarget = String(state?.currentTarget || target || "الكلمة المحددة");
    if (id === "khabar_meaning_gate") {
      if (pickedText.includes("نعت")) {
        if (sentence.includes("محمد") && sentence.includes("هو") && sentence.includes("المجتهد")) {
          return "لو حذفنا (هو) أصبحت الجملة: محمد المجتهد. هنا تتطابق (المجتهد) مع محمد في التعريف، فتبدو تابعة له نعتًا. أما في الجملة الأصلية فـ(هو) هو الذي شغل موقع الخبر.";
        }
        return "النعت تابع يصف الاسم قبله ويطابقه في التعريف والتنكير، والتذكير والتأنيث، والعدد، والحالة الإعرابية. أما الخبر فيعطي معلومة يتم بها معنى المبتدأ؛ مثل: الجندي شجاع، فـ(شجاع) أخبرت عن الجندي وليست نعتًا له.";
      }
      if (pickedText.includes("فاعل")) return `الفاعل يكون مع فعل. أما (${currentTarget}) هنا فليست فعلًا يطلب فاعلًا؛ نحن نسأل: هل أخبرت عن المبتدأ وأتمت المعنى؟`;
      return "اسأل: ما المعلومة التي أضافها المحدد عن المبتدأ؟ إذا أتم المعنى فهو خبر.";
    }
    if (id === "khabar_kind") {
      if (pickedText.includes("مفرد")) {
        if (sentence.includes("الذي")) return "(الذي) اسم موصول مفرد؛ أما (خلقنا) فهي صلة الموصول. لذلك لا نجعل الخبر جملة هنا، بل ننظر إلى الاسم الموصول نفسه.";
        return "الخبر المفرد كلمة واحدة. فإن كان المحدد تركيبًا كاملًا مثل (أخلاقه حسنة) أو (في البيت)، فلا نعده خبرًا مفردًا.";
      }
      if (pickedText.includes("جملة")) return "الخبر الجملة يكون تركيبًا فيه إسناد كامل، مثل: أخلاقه حسنة، أو يستقبل الضيوف. أما الاسم الموصول وحده مثل (الذي) فليس جملة؛ وما بعده صلة موصول.";
      if (pickedText.includes("شبه")) return "شبه الجملة يكون جارًا ومجرورًا مثل (في البيت)، أو ظرفًا مثل (فوق الشجرة). إذا كان عندك كلمة واحدة أو جملة كاملة فليست شبه جملة.";
    }
    if (id === "khabar_single_start") {
      if (pickedText.includes("مبني")) return "الاسم المبني يلزم صورة واحدة، مثل: هو، هذا، الذي. إن كانت الكلمة ليست من هذه الأمثلة غالبًا فهي اسم معرب.";
      if (pickedText.includes("مصدر")) return "المصدر المؤول تركيب مثل: أن تنجح، ويؤول إلى مصدر صريح: نجاحك. أما الكلمة الواحدة مثل شجاع أو فتى فليست مصدرًا مؤولًا.";
      return "الاسم المعرب تتغير علامة آخره بحسب موقعه، مثل شجاعٌ، شجاعًا، شجاعٍ.";
    }
    if (id === "khabar_single_number") {
      const isFiveNounTarget = String(currentTarget || "").includes("أبو") || String(currentTarget || "").includes("أبا") || String(currentTarget || "").includes("أبي") || String(currentTarget || "").includes("أخو") || String(currentTarget || "").includes("أخا") || String(currentTarget || "").includes("أخي") || String(currentTarget || "").includes("حمو") || String(currentTarget || "").includes("فوك") || String(currentTarget || "").includes("فو") || String(currentTarget || "").includes("ذو") || String(currentTarget || "").includes("ذا") || String(currentTarget || "").includes("ذي");
      if (pickedText.includes("مفرد") && isFiveNounTarget) {
        return `أحسنت، (${currentTarget}) يدل على واحد فعلًا، لكنه من الأسماء الخمسة، فإذا تحققت شروطها أعرب بالحروف؛ وهنا يكون مرفوعًا بالواو لا بالضمة. عد للسؤال واختر: من الأسماء الخمسة.`;
      }
    }
    if (id === "khabar_sentence_type") {
      if (pickedText.includes("فعلية")) return "الجملة الفعلية تبدأ بفعل، مثل: يستقبل الضيوف. أما (أبوه حاضر) أو (أخلاقه حسنة) فقد بدأت باسم، فهي جملة اسمية.";
      if (pickedText.includes("اسمية")) return "الجملة الاسمية تبدأ باسم. داخلها مبتدأ ثان وخبره؛ مثال: أخلاقه حسنة: أخلاقه مبتدأ ثان، وحسنة خبر المبتدأ الثاني.";
    }
    if (id === "khabar_shibh_type") {
      if (pickedText.includes("جار")) return "الجار والمجرور يبدأ بحرف جر مثل: في، على، من، إلى. مثال: في البيت، على الطاولة.";
      if (pickedText.includes("ظرف")) return "الظرف يدل غالبًا على مكان أو زمان مثل: فوق، تحت، أمام، عند. مثال: فوق الشجرة، عندنا.";
    }
    if (id.includes("position")) return "إذا تقدم شبه الجملة وجاء بعده اسم نكرة مثل: في البيت رجل، نعرب شبه الجملة خبرًا مقدمًا، والاسم النكرة مبتدأ مؤخرًا.";
  }

  const fallbackHint = String(picked?.hint || node?.hint || "فكّر في السؤال الحالي فقط، ولا تقفز إلى الإعراب النهائي.").replace(/^💡\s*/, "").trim();
  if (fallbackHint.includes("الأسماء الخمسة") && fallbackHint.includes("(أبوك)") && !isFiveNounFact(state?.facts)) {
    return "المفرد يدل على واحد لا على مثنى ولا جمع. افحص الكلمة المطلوبة نفسها: هل تدل على واحد، أم على اثنين، أم على جمع؟ عد للسؤال واختر الإجابة المناسبة.";
  }
  return fallbackHint;
}

function teacherSuccessText(node: any, picked: any, state: any, piece?: string) {
  const id = String(node?.id || "");
  if (id === "present_nun_niswa") {
    return state?.facts?.nunNiswa ? "صحيح؛ اتصلت نون النسوة، إذن حُسم الحكم بالبناء، ولا نحتاج لفحص الرفع أو النصب أو الجزم." : "صحيح؛ لم تتصل نون النسوة، فلا نحكم بالبناء هنا ونفحص نون التوكيد.";
  }
  if (id === "present_nun_tawkid") {
    return state?.facts?.nunTawkid ? "صحيح؛ اتصلت نون التوكيد، إذن حُسم الحكم بالبناء ولا نفحص الرفع أو النصب أو الجزم." : "صحيح؛ لا نون نسوة ولا نون توكيد، إذن بقي الفعل معربًا، وسنحدد لاحقًا: مرفوع أم منصوب أم مجزوم.";
  }
  if (id === "present_has_tool") {
    return state?.facts?.hasTool ? "صحيح؛ وجدنا عاملًا قبل المضارع، والآن نحدد: ناصب أم جازم؟" : "صحيح؛ لا ناصب ولا جازم، إذن الفعل مرفوع وننتقل لاختيار العلامة.";
  }
  if (id === "present_tool_type") {
    return state?.facts?.tool === "nasb" ? "صحيح؛ الأداة ناصبة، إذن نبحث عن علامة النصب." : "صحيح؛ الأداة جازمة، إذن نبحث عن علامة الجزم.";
  }
  if (isFiveVerbDecision(node)) {
    return state?.facts?.attached === "none" ? "صحيح؛ ليس من الأفعال الخمسة، لذلك لا نستعمل حذف النون أو ثبوتها هنا." : "صحيح؛ هو من الأفعال الخمسة، إذن علامته هنا حذف النون عند النصب أو الجزم، وثبوت النون عند الرفع.";
  }
  if (id.includes("ending")) return state?.facts?.ending === "weak" ? "صحيح؛ انتهى الفعل بحرف علة من: ا، و، ي؛ لذلك هو معتل الآخر." : "صحيح؛ لم ينته الفعل بألف أو واو أو ياء؛ لذلك هو صحيح الآخر.";
  if (id.includes("weak")) return "صحيح؛ نوع حرف العلة هو الذي يحدد التعذر أو الثقل أو ظهور الفتحة.";
  if (id.includes("mubtada")) {
    if (id === "mubtada_word_type") return "صحيح؛ ثبتنا نوع الكلمة المطلوبة أولًا قبل تحديد وظيفتها النحوية.";
    if (id === "mubtada_function_gate") return "صحيح؛ حددنا أن الكلمة اسم بدأنا الحديث عنه، وبذلك نصل إلى وظيفة المبتدأ.";
    if (id === "mubtada_start") return "صحيح؛ حددنا صورة المبتدأ: معرب، مبني، أو مصدر مؤول.";
    if (id === "mubtada_built") return "صحيح؛ الاسم المبني يعرب في محل رفع مبتدأ، ونوعه يذكر في الإعراب النهائي.";
    if (id === "mubtada_number") return "صحيح؛ صورة الاسم هي التي تقودنا إلى علامة الرفع المناسبة.";
    if (id === "mubtada_ending") return "صحيح؛ آخر الكلمة يحدد ظهور الضمة أو تقديرها.";
    return piece ? `صحيح؛ أضفنا إلى مسار المبتدأ: ${piece}` : "صحيح؛ نكمل مسار المبتدأ خطوة خطوة.";
  }

  if (id.includes("khabar")) {
    if (id === "khabar_meaning_gate") return "صحيح؛ المحدد أخبر عن المبتدأ وأتم معنى الجملة، إذن وظيفته خبر.";
    if (id === "khabar_kind") return "صحيح؛ حددنا صورة الخبر، فنكمل بحسب هذه الصورة دون قفز إلى النتيجة.";
    if (id === "khabar_sentence_type") return "صحيح؛ الجملة كلها هي الخبر، لا كلمة واحدة منها فقط.";
    if (id.includes("shibh")) return "صحيح؛ شبه الجملة قد يكون خبرًا، وقد يتقدم على مبتدأ نكرة في المرحلة المتوسطة.";
    return piece ? `صحيح؛ أضفنا إلى مسار الخبر: ${piece}` : "صحيح؛ نكمل مسار الخبر خطوة خطوة.";
  }
  return piece ? `صحيح؛ هذه الخطوة أضافت إلى التفكير: ${piece}` : "صحيح؛ نكمل خطوة التفكير التالية.";
}

function thinkingStepsFor(tree: any) {
  if (tree?.startNodeId === "present_nun_niswa") {
    return ["أستبعد البناء", "أستخرج العامل", "أحدد الحالة", "أحدد العلامة", "أصل إلى النتيجة"];
  }
  return ["أفهم الكلمة", "أحدد الموقع", "أستخرج الحكم", "أحدد العلامة", "أصل إلى النتيجة"];
}

function activeThinkingStep(node: any, tree: any) {
  const id = String(node?.id || "");
  if (node?.type === "result") return 4;
  if (tree?.startNodeId === "present_nun_niswa") {
    if (id.includes("nun_niswa") || id.includes("nun_tawkid")) return 0;
    if (id.includes("has_tool") || id.includes("tool_type")) return 1;
    if (id.includes("raf3") || id.includes("nasb") || id.includes("jazm")) {
      if (id.includes("ending") || id.includes("weak") || id.includes("five")) return 3;
      return 2;
    }
    return 0;
  }
  return 0;
}

function ThinkingProcessStrip({ tree, node }: { tree: any; node: any }) {
  const steps = thinkingStepsFor(tree);
  const active = activeThinkingStep(node, tree);
  return (
    <div className="thinking-process-strip" aria-label="سلسلة التفكير">
      <span className="thinking-process-title">سلسلة التفكير</span>
      <div className="thinking-process-items">
        {steps.map((label, idx) => (
          <span key={label} className={`thinking-process-step ${idx < active ? "is-done" : ""} ${idx === active ? "is-active" : ""}`}>
            <span className="thinking-process-num">{idx + 1}</span>
            <span>{label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function thinkingTrailForResult(text?: string) {
  const t = String(text || "");
  if (!t) return [];
  if (t.includes("فعل مضارع")) return ["عرفنا أنها فعل", "حددنا الزمن: مضارع", "فحصنا الأداة والاتصال", "وصلنا للحالة والعلامة"];
  if (t.includes("فعل ماض")) return ["عرفنا أنها فعل", "حددنا الزمن: ماضٍ", "فحصنا الضمير المتصل", "حددنا علامة البناء"];
  if (t.includes("فعل أمر")) return ["عرفنا أنه طلب", "حددنا أنه فعل أمر", "فحصنا الاتصال وآخر الفعل", "حددنا علامة البناء"];
  if (t.includes("اسم إشارة") || t.includes("اسم موصول") || t.includes("ضمير") || t.includes("مبني")) return ["عرفنا موقع الكلمة", "ميزنا أنها اسم مبني", "حددنا نوع الاسم المبني", "أعربناه في محلّه"];
  if (t.includes("مبتدأ") || t.includes("خبر") || t.includes("اسم كان") || t.includes("خبر كان") || t.includes("اسم إن") || t.includes("خبر إن")) return ["حددنا الموقع النحوي", "ميزنا نوع الاسم", "فحصنا العدد وآخر الكلمة", "اخترنا العلامة المناسبة"];
  if (t.includes("فاعل")) return ["وجدنا الفعل", "سألنا: من قام بالفعل؟", "حددنا الفاعل", "اخترنا علامة الرفع"];
  if (t.includes("مفعول")) return ["وجدنا الفعل والفاعل", "سألنا: على من وقع الفعل؟", "حددنا المفعول به", "اخترنا علامة النصب"];
  return ["اتبعنا القرارات بالترتيب", "لم نقفز إلى النتيجة مباشرة"];
}

function explainDistractor(actual?: string | null, expected?: string | null) {
  const a = String(actual || "");
  const e = String(expected || "");
  if (!a) return "لم يتم اختيار إجابة.";
  if (a === e) return "صحيح؛ الاختيار يوافق مسار التفكير.";
  if (/مرفوع|منصوب|مجزوم|مبني/.test(a) && /مرفوع|منصوب|مجزوم|مبني/.test(e)) {
    if ((a.includes("مرفوع") && !e.includes("مرفوع")) || (a.includes("منصوب") && !e.includes("منصوب")) || (a.includes("مجزوم") && !e.includes("مجزوم"))) return "الخطأ في الحالة الإعرابية؛ ارجع للأداة أو الموقع قبل العلامة.";
    if ((a.includes("مبني") && !e.includes("مبني")) || (!a.includes("مبني") && e.includes("مبني"))) return "الخطأ في التفريق بين المبني والمعرب.";
  }
  if (/مبتدأ|خبر|فاعل|مفعول/.test(a+e)) return "الخطأ في الموقع النحوي؛ اسأل: ما وظيفة الكلمة في الجملة؟";
  if (/الأفعال الخمسة|ثبوت النون|حذف النون/.test(a+e)) return "الخطأ في فحص الاتصال: واو الجماعة/ياء المخاطبة/ألف الاثنين.";
  if (/حرف العلة|مقدرة|ظاهرة|السكون|الفتحة|الضمة|الكسرة/.test(a+e)) return "الخطأ في العلامة؛ بعد تحديد الحالة افحص آخر الكلمة.";
  return "الإجابة قريبة، لكن أحد قرارات المسار غير مطابق لهذا المثال.";
}

function enrichQuizPrompt(prompt?: string) {
  const p = String(prompt || "اختر الإعراب النهائي بعد إكمال مسار التفكير.");
  if (p.includes("الخطوة") || p.includes("القرار")) return p;
  return p.replace("ما الإعراب الصحيح", "بعد تتبّع القرارات، ما الإعراب الصحيح");
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


type ThinkingTool = { key: string; label: string; icon: string };

function toolsForTopic(tree: any, title?: string): ThinkingTool[] {
  const start = String(tree?.startNodeId || "");
  const t = String(title || "");
  if (start.includes("present")) {
    return [
      { key: "built", label: "المبني", icon: "ث" },
      { key: "mu3rab", label: "المعرب", icon: "ع" },
      { key: "agent", label: "العامل", icon: "أ" },
      { key: "nasb", label: "النصب", icon: "ن" },
      { key: "jazm", label: "الجزم", icon: "ج" },
      { key: "five", label: "الأفعال الخمسة", icon: "٥" },
    ];
  }
  if (start.includes("past")) {
    return [
      { key: "built", label: "مبني دائمًا", icon: "ث" },
      { key: "pronoun", label: "الضمير", icon: "ض" },
      { key: "waw", label: "واو الجماعة", icon: "و" },
      { key: "sukoon", label: "السكون", icon: "س" },
      { key: "fatha", label: "الفتح", icon: "ف" },
    ];
  }
  if (start.includes("imp")) {
    return [
      { key: "built", label: "مبني دائمًا", icon: "ث" },
      { key: "tawkid", label: "نون التوكيد", icon: "ن" },
      { key: "attached", label: "الاتصال", icon: "ص" },
      { key: "weak", label: "حذف العلة", icon: "ع" },
      { key: "noon", label: "حذف النون", icon: "ح" },
      { key: "sukoon", label: "السكون", icon: "س" },
    ];
  }
  if (start.includes("tawabi") || t.includes("النعت") || t.includes("العطف") || t.includes("التوكيد") || t.includes("البدل") || t.includes("التوابع")) {
    return [
      { key: "entry", label: "هل هي تابعة؟", icon: "؟" },
      { key: "relation", label: "العلاقة", icon: "ر" },
      { key: "term", label: "النوع", icon: "ن" },
      { key: "matbu3", label: "المتبوع", icon: "ت" },
      { key: "case", label: "الحالة", icon: "ح" },
      { key: "sign", label: "العلامة", icon: "ع" },
    ];
  }
  if (t.includes("المبتدأ") || t.includes("الخبر") || start.includes("mubtada") || start.includes("khabar") || start.includes("nominal")) {
    return [
      { key: "mu3rab", label: "المعرب", icon: "ع" },
      { key: "builtNoun", label: "الأسماء المبنية", icon: "م" },
      { key: "damir", label: "الضمير", icon: "ض" },
      { key: "ishara", label: "الإشارة", icon: "ش" },
      { key: "mawsool", label: "الموصول", icon: "ص" },
      { key: "masdar", label: "المصدر المؤول", icon: "مـ" },
    ];
  }
  if (t.includes("كان")) {
    return [
      { key: "agent", label: "الناسخ", icon: "ن" },
      { key: "ism", label: "اسم كان", icon: "ا" },
      { key: "khabar", label: "خبر كان", icon: "خ" },
      { key: "raf3", label: "الرفع", icon: "ر" },
      { key: "nasb", label: "النصب", icon: "ن" },
    ];
  }
  if (t.includes("إن")) {
    return [
      { key: "agent", label: "الناسخ", icon: "ن" },
      { key: "ism", label: "اسم إن", icon: "ا" },
      { key: "khabar", label: "خبر إن", icon: "خ" },
      { key: "nasb", label: "النصب", icon: "ن" },
      { key: "raf3", label: "الرفع", icon: "ر" },
    ];
  }
  return [
    { key: "word", label: "الكلمة", icon: "ك" },
    { key: "site", label: "الموقع", icon: "م" },
    { key: "rule", label: "الحكم", icon: "ح" },
    { key: "sign", label: "العلامة", icon: "ع" },
  ];
}

function activeToolForNode(node: any, tree: any, title?: string) {
  const id = String(node?.id || "");
  const text = String(node?.text || "");
  const start = String(tree?.startNodeId || "");
  if (start.includes("present")) {
    if (id.includes("nun")) return "built";
    if (id.includes("has_tool") || id.includes("tool_type")) return "agent";
    if (id.includes("nasb")) return "nasb";
    if (id.includes("jazm")) return "jazm";
    if (id.includes("five")) return "five";
    return "mu3rab";
  }
  if (start.includes("past")) {
    if (id.includes("pronoun") || id.includes("sukoon_type")) return "pronoun";
    if (id.includes("waw")) return "waw";
    if (id.includes("sukoon")) return "sukoon";
    if (id.includes("alif") || id.includes("fatha")) return "fatha";
    return "built";
  }
  if (start.includes("imp")) {
    if (id.includes("tawkid")) return "tawkid";
    if (id.includes("attached") || id.includes("connection")) return "attached";
    if (id.includes("ending") || id.includes("weak")) return "weak";
    if (text.includes("حذف النون")) return "noon";
    return "built";
  }
  if (start.includes("tawabi")) {
    if (id === "tawabi_entry") return "entry";
    if (id === "tawabi_relation") return "relation";
    if (id === "tawabi_term") return "term";
    if (id === "tawabi_tawkid_kind") return "term";
    if (id === "tawabi_follow_source") return "matbu3";
    if (id === "tawabi_case" || id === "tawabi_form" || id === "tawabi_shape") return "case";
    if (id === "tawabi_mark" || id.startsWith("R_tawabi_")) return "sign";
    return "relation";
  }
  if (text.includes("مصدر مؤول")) return "masdar";
  if (text.includes("اسم إشارة")) return "ishara";
  if (text.includes("اسم موصول")) return "mawsool";
  if (text.includes("ضمير")) return "damir";
  if (text.includes("مبني")) return "builtNoun";
  if (text.includes("معرب")) return "mu3rab";
  if (text.includes("اسم كان") || text.includes("اسم إن")) return "ism";
  if (text.includes("خبر")) return "khabar";
  if (text.includes("نصب")) return "nasb";
  if (text.includes("رفع")) return "raf3";
  return toolsForTopic(tree, title)[0]?.key;
}

function ThinkingToolsRail({ tree, node, title }: { tree: any; node: any; title?: string }) {
  const tools = toolsForTopic(tree, title);
  const active = activeToolForNode(node, tree, title);
  return (
    <nav className="thinking-tools-rail" aria-label="أدوات التفكير في هذا الموضوع">
      {tools.map((tool) => (
        <span key={tool.key} className={`thinking-tool-chip ${tool.key === active ? "is-active" : ""}`} title={tool.label}>
          <span className="thinking-tool-icon">{tool.icon}</span>
          <span className="thinking-tool-label">{tool.label}</span>
        </span>
      ))}
    </nav>
  );
}

function builtNounSmartHint(target = "الكلمة الهدف", role = "في محلها الإعرابي") {
  return `هل ${target} ضمير أو اسم إشارة أو اسم موصول؟ الاسم المبني يُعرب في محلّه.`;
}

function builtNounTypeHintByValue(value?: string) {
  switch (value) {
    case "damir":
      return "الضمير اسم مبني: أنا، أنت، هو، إياه.";
    case "ishara":
      return "اسم الإشارة مبني: هذا، هذه، هؤلاء.";
    case "mawsool":
      return "الاسم الموصول مبني ويحتاج صلة بعده.";
    case "istifham":
      return "اسم الاستفهام مبني: من، ما، أين.";
    case "shart":
      return "اسم الشرط مبني ويربط الشرط بجوابه.";
    case "kam":
      return "كم الخبرية تدل على الكثرة ولا تطلب جوابًا.";
    default:
      return "حدّد نوع الاسم المبني أولًا.";
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

function i3rabHead(label?: string | null) {
  const line = firstLine(label || "");
  const idx = line.indexOf(":");
  if (idx <= 0) return "";
  return line.slice(0, idx).trim();
}

function quizTargetHead(example?: QuizExampleLike | null) {
  return i3rabHead(example?.correctI3rab || example?.facts?.finalI3rab || "") || String(example?.target || "").trim();
}

function localizeQuizOptionToExample(option: string, example?: QuizExampleLike | null) {
  const line = firstLine(option);
  const idx = line.indexOf(":");
  const head = quizTargetHead(example);
  if (idx <= 0 || !head) return line;
  return `${head}${line.slice(idx)}`;
}

function localQuizExpectedLabel(label: string, example?: QuizExampleLike | null) {
  return localizeQuizOptionToExample(label, example);
}

function swapOne(text: string, pairs: Array<[string, string]>) {
  for (const [from, to] of pairs) {
    if (text.includes(from)) return text.replace(from, to);
  }
  return "";
}

function fallbackCloseQuizDistractors(correct: string) {
  const out: string[] = [];
  const push = (x?: string) => {
    const value = firstLine(x || "");
    if (value && value !== correct && !out.includes(value)) out.push(value);
  };

  push(swapOne(correct, [["توكيد لفظي", "توكيد معنوي"], ["توكيد معنوي", "توكيد لفظي"], ["نعت", "بدل"], ["بدل", "نعت"], ["معطوف", "توكيد معنوي"], ["فاعل", "مفعول به"], ["مفعول به", "فاعل"], ["مبتدأ", "خبر"], ["خبر", "مبتدأ"]]));
  push(swapOne(correct, [["مرفوع", "منصوب"], ["منصوب", "مجرور"], ["مجرور", "مرفوع"], ["مجزوم", "مرفوع"], ["مبني", "معرب"]]));
  push(swapOne(correct, [["الضمة", "الفتحة"], ["الفتحة", "الكسرة"], ["الكسرة", "الضمة"], ["الياء", "الألف"], ["الألف", "الياء"], ["الواو", "الياء"], ["السكون", "الفتحة"]]));

  return out;
}

function buildCloseQuizOptions(example: QuizExampleLike | undefined, seed: string, cursor: number) {
  const raw = buildBalancedQuizOptions(example, seed, cursor);
  const correct = localQuizExpectedLabel(example?.correctI3rab || example?.facts?.finalI3rab || "", example);
  if (!correct) return raw.map((option) => localizeQuizOptionToExample(option, example));

  const localized = Array.from(new Set(raw.map((option) => localizeQuizOptionToExample(option, example)).filter(Boolean)));
  const distractors = localized.filter((option) => !isSameQuizAnswer(option, correct));
  fallbackCloseQuizDistractors(correct).forEach((option) => {
    if (!distractors.some((x) => isSameQuizAnswer(x, option))) distractors.push(option);
  });

  const orderedDistractors = stableShuffle(distractors, `${seed}-distractors`).slice(0, 3);
  const targetPositions = [1, 2, 3, 1, 2, 3, 0];
  const finalOptions = [...orderedDistractors];
  const target = Math.min(targetPositions[cursor % targetPositions.length], finalOptions.length);
  finalOptions.splice(target, 0, correct);
  return finalOptions.slice(0, 4);
}

function buildRemedialQueueFromMistakes(rows: QuizAnswerRow[], sourceExamples: QuizExampleLike[]) {
  const wrongRows = rows.filter((row) => !row.isCorrect);
  const queue: QuizExampleLike[] = [];
  const used = new Set<string>();

  wrongRows.forEach((row, idx) => {
    const sameSkill = sourceExamples.filter((ex) => getExampleCoverageKeys(ex).includes(row.expectedCoverage));
    const preferred = sameSkill.find((ex) => String(ex.id) !== String(row.exampleId)) || sameSkill[0] || sourceExamples.find((ex) => String(ex.id) === String(row.exampleId));
    if (!preferred) return;
    const key = `${row.expectedCoverage}-${preferred.id}-${idx}`;
    if (used.has(key)) return;
    used.add(key);
    queue.push({
      ...preferred,
      id: `remedial-${row.exampleId}-${idx}-${preferred.id}`,
      prompt: "تدريب علاجي سريع: اختر الإعراب الصحيح بعد مراجعة سبب الخطأ.",
    });
  });

  return queue.slice(0, 8);
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

function coverageDisplayLabel(key?: string | null) {
  const k = String(key || "");
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
  if (labels[k]) return labels[k];
  return k.includes(".") ? k.split(".").pop()?.replace(/_/g, " ") || k : k;
}

function safeFinalLabel(tree: any, example: any, fallbackCoverage?: string) {
  const fromExample = exampleFinalLabel(example);
  if (fromExample && !fromExample.includes(".")) return fromExample;
  const fromResult = findResultLabelByCoverage(tree, fallbackCoverage);
  if (fromResult && !fromResult.includes(".")) return fromResult;
  return coverageDisplayLabel(fallbackCoverage);
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
  const router = useRouter();
  const [covered, setCovered] = React.useState<Record<string, boolean>>(buildEmptyCovered(coverageKeysOrdered));
  const [exampleIndex, setExampleIndex] = React.useState(0);
  const [feedback, setFeedback] = React.useState<{ wrongId?: string; correctId?: string; hint?: string } | null>(null);
  const [selectedQuizOption, setSelectedQuizOption] = React.useState<string | null>(null);
  const [quizLocked, setQuizLocked] = React.useState(false);
  const [quizOrder, setQuizOrder] = React.useState<number[]>([]);
  const [quizCursor, setQuizCursor] = React.useState(0);
  const [quizAnswers, setQuizAnswers] = React.useState<QuizAnswerRow[]>([]);
  const [remedialActive, setRemedialActive] = React.useState(false);
  const [remedialQueue, setRemedialQueue] = React.useState<QuizExampleLike[]>([]);
  const [remedialCursor, setRemedialCursor] = React.useState(0);
  const [remedialSelected, setRemedialSelected] = React.useState<string | null>(null);
  const [remedialChecked, setRemedialChecked] = React.useState(false);
  const [remedialResults, setRemedialResults] = React.useState<QuizAnswerRow[]>([]);
  const [learnReady, setLearnReady] = React.useState(false);
  const [practiceReady, setPracticeReady] = React.useState(false);
  const [toast, setToast] = React.useState("");
  const [mounted, setMounted] = React.useState(false);
  const [followUpChoice, setFollowUpChoice] = React.useState<string | null>(null);
  const [activeGlossary, setActiveGlossary] = React.useState<string | null>(null);
  const [dialogBubble, setDialogBubble] = React.useState<{ tone: "success" | "hint" | "celebrate"; text: string } | null>(null);
  const [microCelebrate, setMicroCelebrate] = React.useState(0);
  const [microCelebrateAnswerId, setMicroCelebrateAnswerId] = React.useState<string | null>(null);
  const [clickCheck, setClickCheck] = React.useState<{ x: number; y: number; id: number } | null>(null);
  const [successNudge, setSuccessNudge] = React.useState<string | null>(null);
  const [cardPhase, setCardPhase] = React.useState<"idle" | "success" | "leaving" | "entering">("idle");
  const [finalCtaReady, setFinalCtaReady] = React.useState(false);
  const [pendingStageComplete, setPendingStageComplete] = React.useState(false);
  const [dropOver, setDropOver] = React.useState(false);
  const [droppedChoice, setDroppedChoice] = React.useState<{ text: string; tone: "idle" | "ok" | "bad" } | null>(null);
  const [stepReview, setStepReview] = React.useState<StepReviewState | null>(null);
  const [practiceCorrectionMode, setPracticeCorrectionMode] = React.useState(false);
  const [practiceRetryReady, setPracticeRetryReady] = React.useState(false);
  const [practiceWrongPanel, setPracticeWrongPanel] = React.useState<{ wrongLabel: string; steps: string[]; nextState: any } | null>(null);
  const workAreaRef = React.useRef<HTMLElement | null>(null);
  const activeCardRef = React.useRef<HTMLDivElement | null>(null);
  const feedbackAreaRef = React.useRef<HTMLDivElement | null>(null);
  const correctAdvanceTimerRef = React.useRef<number | null>(null);
  const answerAdvanceLockRef = React.useRef(false);
  const exampleNavLockRef = React.useRef(false);
  const quizFinalizeLockRef = React.useRef(false);
  const stepReviewLockRef = React.useRef(false);
  const practiceNextLockRef = React.useRef(false);
  const recentExampleIdsRef = React.useRef<string[]>([]);
  const usedExampleIdsRef = React.useRef<string[]>([]);


  React.useEffect(() => {
    return () => {
      if (correctAdvanceTimerRef.current) window.clearTimeout(correctAdvanceTimerRef.current);
    };
  }, []);

  function bringWorkAreaIntoView(mode: "soft" | "center" = "soft", delay = 80) {
    window.setTimeout(() => {
      const target = activeCardRef.current || workAreaRef.current;
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const headerOffset = window.innerWidth <= 700 ? 78 : 92;
      const extra = mode === "center" ? Math.max(0, (window.innerHeight - rect.height) / 2 - headerOffset) : 10;
      const top = window.scrollY + rect.top - headerOffset - extra;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    }, delay);
  }

  const currentIdx = mode === "quiz" ? quizOrder[quizCursor] ?? 0 : exampleIndex;
  const example = examples[currentIdx];
  const [state, setState] = React.useState<any>(() => buildRunnerState(tree, mode, example));

  React.useEffect(() => {
    answerAdvanceLockRef.current = false;
    exampleNavLockRef.current = false;
    quizFinalizeLockRef.current = false;
    stepReviewLockRef.current = false;
    practiceNextLockRef.current = false;
  }, [mode, exampleIndex, quizCursor, state?.currentNodeId]);

  React.useEffect(() => {
    setPracticeWrongPanel(null);
  }, [exampleIndex, state?.currentTarget]);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    recentExampleIdsRef.current = [];
    usedExampleIdsRef.current = [];
  }, [topicId, level, mode]);

  React.useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  // التلميح والتعزيز يبقيان ظاهرين حتى ينقر الطالب لإغلاقهما.

  React.useEffect(() => {
    if (!example) return;
    setState(buildRunnerState(tree, mode, example));
    setFeedback(null);
    setSelectedQuizOption(null);
    setQuizLocked(false);
    setFollowUpChoice(null);
    setActiveGlossary(null);
    setDialogBubble(null);
    setCardPhase("idle");
    setSuccessNudge(null);
    setFinalCtaReady(false);
    setMicroCelebrateAnswerId(null);
    setSuccessNudge(null);
    setDropOver(false);
    setDroppedChoice(null);
    setStepReview(null);
    bringWorkAreaIntoView("soft");
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
  const thinkingNode = normalizeThinkingNode(node, state);
  const totalCount = coverageKeysOrdered.length;
  const rawDoneCount = coverageKeysOrdered.filter((k) => covered[k]).length;
  const doneCount = Math.min(rawDoneCount, totalCount);
  const coveredPercent = calcPercent(covered, coverageKeysOrdered);
  const isDone = coveredPercent >= 100;
  const nextStageReady = mode === "learn" ? learnReady || coveredPercent >= 100 : mode === "practice" ? practiceReady || coveredPercent >= 100 : false;
  const stepLabel = coverageKeysOrdered.find((k) => !covered[k]) || "مكتمل";
  const quizFinished = mode === "quiz" && quizOrder.length > 0 && quizCursor >= quizOrder.length;
  const answeredQuizRows = quizAnswers.filter(Boolean);
  const quizScore = answeredQuizRows.filter((a) => a.isCorrect).length;
  const quizPercent = answeredQuizRows.length ? Math.round((quizScore / answeredQuizRows.length) * 100) : 0;
  const wrongQuizRows = answeredQuizRows.filter((a) => !a.isCorrect);
  const canDownloadCertificate = quizFinished && quizPercent >= QUIZ_PASS_PERCENT;
  const canStartRemedial = quizFinished && wrongQuizRows.length > 0;
  const quizOptions = React.useMemo(() => {
    return buildCloseQuizOptions(
      example as QuizExampleLike,
      `${topicId || "topic"}-${(example as QuizExampleLike)?.id || currentIdx}-${quizCursor}`,
      quizCursor
    );
  }, [example, currentIdx, quizCursor, topicId]);

  const remedialExample = remedialQueue[remedialCursor];
  const remedialOptions = React.useMemo(() => {
    if (!remedialExample) return [];
    return buildCloseQuizOptions(
      remedialExample,
      `${topicId || "topic"}-remedial-${remedialExample.id}-${remedialCursor}`,
      remedialCursor
    );
  }, [remedialExample, remedialCursor, topicId]);
  const remedialExpectedLabel = remedialExample
    ? localQuizExpectedLabel(safeFinalLabel(tree, remedialExample, getExampleCoverageKeys(remedialExample)[0] || ""), remedialExample)
    : "";
  const remedialIsCheckedCorrect = remedialChecked && isSameQuizAnswer(remedialSelected, remedialExpectedLabel);

  React.useEffect(() => {
    if (mode !== "quiz") return;
    const existing = quizAnswers[quizCursor];
    setSelectedQuizOption(existing?.actualLabel || null);
    setQuizLocked(Boolean(existing?.actualLabel));
  }, [mode, quizCursor, quizAnswers]);

  const visibleResultPieces = buildVisibleResultDraft(tree, state, thinkingNode, droppedChoice);
  const completedStepCards = buildVisibleResultDraft(tree, state, thinkingNode, null);
  const completedAlgorithmCards = getCompletedAlgorithmCards(tree, state);
  const stageTrailItems = buildStageTrailItems(completedAlgorithmCards);
  const latestStepResult = droppedChoice?.tone === "bad"
    ? ""
    : (droppedChoice?.text || visibleResultPieces[visibleResultPieces.length - 1] || "");
  const stageMetaProgress = buildStageProgressMeta(tree, state);
  const answeredStepCount = stageMetaProgress.answered;
  const estimatedStepTotal = stageMetaProgress.total;
  const currentStageStep = stageMetaProgress.current;
  const stageProgressPercent = stageMetaProgress.completedPercent;
  const questionVisualPhase = cardPhase === "success" ? "idle" : cardPhase;
  const stepKickerText = bridgeKickerText(tree, thinkingNode, state, title, completedStepCards);
  const currentHintAnswer = node?.type === "question"
    ? thinkingNode?.answers?.find((answer: any) => isHintAnswerOption(answer))
    : null;
  const currentChoiceAnswers = node?.type === "question"
    ? (thinkingNode?.answers || []).filter((answer: any) => !isHintAnswerOption(answer))
    : [];
  const resultCoverageKeys = node?.type === "result" ? resolveCoverageKeys({ tree, example, currentNodeId: state?.currentNodeId, requiredKeys: coverageKeysOrdered }) : [];
  const currentExampleKeyForStage = String(examples[currentIdx]?.id || currentIdx);
  const usedWithCurrent = new Set([...(usedExampleIdsRef.current || []), currentExampleKeyForStage]);
  const allExamplesSeenInStage = mode !== "quiz" && examples.length > 0 && usedWithCurrent.size >= examples.length;
  const resultWouldCompleteStage = mode !== "quiz" && node?.type === "result" && (coverageKeysOrdered.length > 0 && coverageKeysOrdered.every((key) => covered[key] || resultCoverageKeys.includes(key)));
  // لا نعرض بطاقة انتهاء المرحلة قبل أن يرى الطالب نتيجة المثال الأخير.
  // تظهر نتيجة الإعراب أولًا، ثم ينقله الزر بعدها إلى المرحلة التالية.
  const wouldCompleteStage = false;
  const currentFollowUp = (example as QuizExampleLike | undefined)?.followUp;
  const chosenFollowUp = currentFollowUp?.options?.find((o) => o.label === followUpChoice);
  const followUpIsCorrect = Boolean(chosenFollowUp?.correct);
  const canMoveAfterResult = (!currentFollowUp || mode === "learn" || followUpIsCorrect) && finalCtaReady;

  React.useEffect(() => {
    if (node?.type !== "result") {
      setFinalCtaReady(false);
      return undefined;
    }
    setFinalCtaReady(false);
    const timer = window.setTimeout(() => setFinalCtaReady(true), 2400);
    return () => window.clearTimeout(timer);
  }, [node?.type, state?.currentNodeId]);

  function pickFollowUp(label: string) {
    setFollowUpChoice(label);
  }

  async function persist(nextCovered: Record<string, boolean>, extra: any = {}) {
    if (!topicId || !onSaveProgress) return;
    const percent = calcPercent(nextCovered, coverageKeysOrdered);
    const coverage = coverageKeysOrdered.filter((k) => nextCovered[k]);

    // مهم جدًا: لا نرسل percent = 0 في التدريب أو المرحلة النهائية؛ لأن ذلك يمسح نسبة المرحلة الأولى.
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
    if (exampleNavLockRef.current) return;
    exampleNavLockRef.current = true;
    const releaseNavLock = () => { window.setTimeout(() => { exampleNavLockRef.current = false; }, 350); };
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

    const currentExampleId = String(examples[currentIdx]?.id || currentIdx);
    const recent = recentExampleIdsRef.current.filter(Boolean);
    const used = new Set([...(usedExampleIdsRef.current || []), currentExampleId]);
    usedExampleIdsRef.current = Array.from(used);

    if (percent >= 100) {
      if (mode === "learn") setLearnReady(true);
      if (mode === "practice") setPracticeReady(true);
      if (stageMeta.nextHrefPrefix && topicId) {
        router.push(`${stageMeta.nextHrefPrefix}${topicId}`);
        return;
      }
    }

    const uncoveredKeys = coverageKeysOrdered.filter((k) => !nextCovered[k]);
    const unseenCandidates = examples
      .map((ex, idx) => ({ idx, id: String(ex?.id || idx), keys: getExampleCoverageKeys(ex) }))
      .filter((item) => item.idx !== currentIdx && !used.has(item.id));

    let nextIndex: number | null = null;
    if (!unseenCandidates.length) {
      // لا نغلق المرحلة لمجرد انتهاء الأمثلة؛ معيار الإغلاق هو اكتمال مفاتيح التغطية.
      // إن بقي مفتاح غير منجز نسمح بتكرار موجّه لمثال يغطيه بدل الوقوف عند عدّاد خاطئ.
      const fallback = examples
        .map((ex, idx) => ({ idx, id: String(ex?.id || idx), keys: getExampleCoverageKeys(ex) }))
        .find((item) => item.idx !== currentIdx && item.keys.some((key) => uncoveredKeys.includes(key)));
      if (!fallback) {
        setToast("لم يبق مثال جديد يغطي مهارة غير منجزة");
        releaseNavLock();
        return;
      }
      nextIndex = fallback.idx;
    } else {
      const coverageCandidate = unseenCandidates.find((item) =>
        !uncoveredKeys.length || item.keys.some((key) => uncoveredKeys.includes(key))
      );
      nextIndex = (coverageCandidate || unseenCandidates[0]).idx;
    }

    recentExampleIdsRef.current = [...recent.slice(-5), currentExampleId];
    setExampleIndex(nextIndex);
    setFeedback(null);
    setDropOver(false);
    setDroppedChoice(null);
    setStepReview(null);
    setPracticeCorrectionMode(false);
    setPracticeRetryReady(false);
    setCardPhase("idle");
    setSuccessNudge(null);
    setFinalCtaReady(false);
    setPendingStageComplete(false);
    setState(buildRunnerState(tree, mode, examples[nextIndex]));
    bringWorkAreaIntoView("center", 120);
    releaseNavLock();
  }


  async function completeCurrentAndGoNextStage() {
    if (exampleNavLockRef.current) return;
    exampleNavLockRef.current = true;
    const releaseNavLock = () => { window.setTimeout(() => { exampleNavLockRef.current = false; }, 350); };
    const nextCovered = markCurrentCovered();
    const percent = calcPercent(nextCovered, coverageKeysOrdered);

    try {
      await persist(nextCovered, {
        learn_completed: mode === "learn" ? true : undefined,
        practice_completed: mode === "practice" ? true : undefined,
      });
      if (mode === "learn") setLearnReady(true);
      if (mode === "practice") setPracticeReady(true);
    } catch {
      setToast("تمت المرحلة، لكن تعذر حفظ التقدم الآن");
      releaseNavLock();
      return;
    }

    const currentExampleId = String(examples[currentIdx]?.id || currentIdx);
    const used = new Set([...(usedExampleIdsRef.current || []), currentExampleId]);
    usedExampleIdsRef.current = Array.from(used);

    if (percent < 100) {
      const unseen = examples
        .map((ex, idx) => ({ idx, id: String(ex?.id || idx), keys: getExampleCoverageKeys(ex) }))
        .filter((item) => item.idx !== currentIdx && !used.has(item.id));
      const uncoveredKeys = coverageKeysOrdered.filter((k) => !nextCovered[k]);
      const chosen = unseen.find((item) => !uncoveredKeys.length || item.keys.some((key) => uncoveredKeys.includes(key))) || unseen[0];
      if (chosen) {
        setExampleIndex(chosen.idx);
        setStepReview(null);
        setState(buildRunnerState(tree, mode, examples[chosen.idx]));
        releaseNavLock();
        return;
      }
    }

    if (stageMeta.nextHrefPrefix && topicId) {
      router.push(`${stageMeta.nextHrefPrefix}${topicId}`);
      return;
    }
    releaseNavLock();
  }

  function resetTraining() {
    const empty = buildEmptyCovered(coverageKeysOrdered);
    setCovered(empty);
    setExampleIndex(0);
    setFeedback(null);
    setDropOver(false);
    setDroppedChoice(null);
    setStepReview(null);
    setCardPhase("idle");
    setSuccessNudge(null);
    setFinalCtaReady(false);
    setPendingStageComplete(false);
    setState(buildRunnerState(tree, mode, examples[0]));
    bringWorkAreaIntoView("center", 120);
    if (mode === "learn") setLearnReady(false);
    if (mode === "practice") setPracticeReady(false);
  }

  function isAnswerCorrect(answer: any) {
    if (!answer) return false;
    if (answer.eval) {
      const factValue = state.facts?.[answer.eval.fact];
      if (Array.isArray(answer.eval.anyOf)) return answer.eval.anyOf.includes(factValue);
      if (Object.prototype.hasOwnProperty.call(answer.eval, "notEquals")) return factValue !== answer.eval.notEquals;
      return factValue === answer.eval.equals;
    }
    return Boolean(answer.correct);
  }

  function handleLearnDrop(answerId: string, label: string) {
    if (mode !== "learn") return;
    const picked = thinkingNode?.answers?.find((a: any) => a.id === answerId);
    const effect = answerEffectLabel(thinkingNode, picked, state) || label || "الإجابة المختارة";
    setDroppedChoice({ text: effect, tone: "idle" });
    window.setTimeout(() => handlePick(answerId), 10);
  }

  function playSoftStepSound(kind: "step" | "final" = "step") {
    return;
    try {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = kind === "final" ? 660 : 520;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(kind === "final" ? 0.045 : 0.025, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (kind === "final" ? 0.22 : 0.12));
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + (kind === "final" ? 0.24 : 0.14));
      window.setTimeout(() => ctx.close?.(), 320);
    } catch {}
  }

  function microPraiseText(node: any, answer: any, state: any) {
    const phrases = mode === "practice" ? [
      "نجمة جديدة ✓ اختيار موفق.",
      "أحسنت، اقتربت من الكأس.",
      "رائع، ثبّت مهارة جديدة.",
      "ممتاز، التحدي يسير بقوة.",
      "إجابة دقيقة، نربح خطوة في التحدي.",
      "جميل، فهمك صار أوضح.",
      "أداء قوي، أكمل الجولة.",
      "أحسنت، هذه نقطة إتقان.",
      "اختيار ذكي، نكمل التحدي.",
      "ممتاز جدًا، نجمة في المسار."
    ] : [
      "أحسنت، خطوة ثابتة.",
      "ممتاز، واصل بنفس التركيز.",
      "اختيار موفق، نكمل.",
      "رائع، اقتربنا من الإعراب.",
      "تمام، بنيت خطوة صحيحة.",
      "جميل، هذا تفكير نحوي دقيق.",
      "صحيح، ننتقل للخطوة التالية.",
      "أداء جميل، استمر.",
      "إجابة دقيقة، نثبتها في المسار.",
      "ممتاز جدًا، خطوة أقرب للنتيجة."
    ];
    const key = `${node?.id || ""}:${answer?.id || ""}:${state?.currentTarget || ""}`;
    let hash = 0;
    for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
    return phrases[hash % phrases.length];
  }

  function challengeGuidanceText() {
    if (mode !== "practice") return "";
    if (dialogBubble?.tone === "hint") return "اقرأ التوجيه، ثم عد للسؤال واختر الإجابة الصحيحة.";
    if (cardPhase !== "idle" && droppedChoice?.tone === "ok") return "أحسنت؛ تقدّمك محفوظ، وننتقل للجولة التالية.";
    if (node?.type === "result") return "اقرأ الإعراب النهائي؛ فهو سبب الفوز بهذه الجولة.";
    return `ركّز في (${state?.currentTarget || "الكلمة"})، واختر الإجابة التي تُكمل بناء الإعراب.`;
  }

  function challengeStars(done: number, total: number) {
    const safeTotal = Math.max(1, total || 1);
    const earned = Math.min(5, Math.max(0, Math.ceil((done / safeTotal) * 5)));
    return Array.from({ length: 5 }, (_, i) => i < earned);
  }

  function learningSummaryForStep(node: any, state: any, resultText: string, answerText: string) {
    const id = String(node?.id || "");
    const target = String(state?.currentTarget || "الكلمة المحددة");
    const result = String(resultText || "");
    const answer = String(answerText || "");

    if (isFiveVerbDecision(node)) {
      return answer.startsWith("نعم") || state?.facts?.attached !== "none"
        ? `إذا كان (${target}) من الأفعال الخمسة فعلامته تختلف: في الرفع ثبوت النون، وفي النصب والجزم حذف النون.`
        : `إذا لم يكن (${target}) من الأفعال الخمسة نرجع إلى علامة الفعل العادي بحسب حالته وآخره.`;
    }
    if (id.includes("_shape")) return `صورة الفعل تقودنا إلى العلامة: الفعل العادي له علامات، والأفعال الخمسة لها علامات خاصة.`;
    if (id.includes("has_tool") || id.includes("tool")) return `الأداة قبل الفعل هي التي تحدد الحالة: رفع، نصب، أو جزم.`;
    if (id.includes("weak")) return `حرف العلة في آخر الفعل قد يجعل العلامة مقدّرة أو محذوفة.`;
    if (id.includes("ending")) return `لا نختار العلامة من الشكل وحده؛ ننظر إلى آخر الكلمة وصورتها.`;
    if (result.includes("ثبوت النون")) return `الأفعال الخمسة تُرفع بثبوت النون، لا بالضمة.`;
    if (result.includes("حذف النون")) return `الأفعال الخمسة تُنصب وتُجزم بحذف النون.`;
    if (result.includes("الضمة")) return `الفعل المضارع الصحيح الآخر إذا كان مرفوعًا فعلامته الضمة الظاهرة.`;
    if (result.includes("الفتحة")) return `الفعل المضارع الصحيح الآخر إذا دخلت عليه أداة نصب فعلامته الفتحة الظاهرة.`;
    if (result.includes("السكون")) return `الفعل المضارع الصحيح الآخر إذا جُزم فعلامته السكون.`;
    if (result.includes("مبتدأ") || result.includes("خبر") || result.includes("فاعل") || result.includes("مفعول") || result.includes("تابع")) return `ابدأ بالوظيفة النحوية، ثم انتقل إلى العلامة المناسبة.`;
    return `ثبّت هذه النتيجة قبل الانتقال؛ فهي خطوة في بناء الإعراب النهائي.`;
  }

  function continueLabelForStepReview(isFinal: boolean) {
    if (isFinal) return "فهمت السبب، اعرض النتيجة النهائية";
    if (mode === "practice") return "رائع، أكمل التحدي";
    return "فهمت السبب، أكمل";
  }

  function continueAfterStepReview() {
    if (!stepReview || stepReviewLockRef.current) return;
    stepReviewLockRef.current = true;
    const nextNode = tree?.nodes?.[stepReview.nextState?.currentNodeId];
    if (nextNode?.type === "result") playSoftStepSound("final");
    setState(stepReview.nextState);
    setStepReview(null);
    setDroppedChoice(null);
    setDialogBubble(null);
    setMicroCelebrateAnswerId(null);
    setMicroCelebrate(0);
    setCardPhase("entering");
    bringWorkAreaIntoView(nextNode?.type === "result" ? "center" : "soft", 80);
    window.setTimeout(() => {
      setCardPhase("idle");
      setMicroCelebrate(0);
      setMicroCelebrateAnswerId(null);
      stepReviewLockRef.current = false;
    }, 360);
  }

  function openCurrentHint() {
    if (!node || node.type !== "question" || cardPhase !== "idle" || stepReview) return;
    const smartHint = String(
      currentHintAnswer?.hint ||
      studentHintText(thinkingNode, null, state) ||
      thinkingNode?.hint ||
      "فكّر في السؤال الحالي فقط."
    ).trim();
    setDialogBubble({ tone: "hint", text: `${smartHint}

عد إلى السؤال، ثم اختر الإجابة الصحيحة مما يأتي لنكمل الإعراب.` });
    setDroppedChoice(null);
    bringWorkAreaIntoView("soft", 40);
  }

  function handlePick(answerId: string) {
    if (!node || node.type !== "question" || mode === "quiz" || cardPhase !== "idle" || stepReview || answerAdvanceLockRef.current) return;

    const activeNode = thinkingNode || node;
    const activeTree = { ...tree, nodes: { ...(tree?.nodes || {}), [String(state.currentNodeId)]: activeNode } };
    const picked = activeNode.answers.find((a: any) => a.id === answerId);
    const pickedText = String(picked?.text || "").trim();
    const correctAnswer = activeNode.answers.find((a: any) => isAnswerCorrect(a));

    if (picked?.isHelp || picked?.id === "__help" || pickedText === "لا أعلم") {
      const smartHint = studentHintText(activeNode, null, state) || activeNode?.hint || "فكّر في السؤال الحالي فقط.";
      setDialogBubble({ tone: "hint", text: `${smartHint}

اضغط «فهمت» ثم اختر الإجابة المناسبة لنكمل الإعراب.` });
      setDroppedChoice(null);
      return;
    }

    const ok = isAnswerCorrect(picked);

    if (!ok) {
      const isBuiltTypeNode = String(node?.id || "").includes("built_type") || String(node?.id || "").includes("mabniType");
      const expectedBuiltType = state.facts?.mabniType;
      const smartHint = isBuiltTypeNode
        ? builtNounTypeHintByValue(expectedBuiltType)
        : studentHintText(thinkingNode, picked, state);
      setDialogBubble({ tone: "hint", text: `${isPracticeMode ? "محاولة جيدة؛ هذه فرصة لتقوية المهارة.\n" : ""}${smartHint || "فكّر في السؤال الحالي فقط."}

عد للسؤال وانقر على الإجابة الصحيحة لنكمل الإعراب.` });
      setDroppedChoice(null);
      if (mode === "practice") {
        setFeedback({ wrongId: answerId, hint: smartHint });
      } else {
        setFeedback({ wrongId: answerId, correctId: correctAnswer?.id, hint: smartHint });
      }
      return;
    }

    answerAdvanceLockRef.current = true;
    const res = chooseAnswer({ state, tree: activeTree, answerId } as any);
    const piece = normalizeBuildPiece(picked?.text || "", node?.id || "");
    const msg = teacherSuccessText(thinkingNode, picked, state, piece);
    const effectLabel = answerEffectLabel(thinkingNode, picked, state);
    const resultText = effectLabel || piece || String(picked?.text || "صحيح");
    const nextNode = tree?.nodes?.[res.nextState?.currentNodeId];

    setSuccessNudge(microPraiseText(thinkingNode, picked, state));
    setDialogBubble(null);
    setDroppedChoice((prev) => prev ? { text: prev.text || resultText, tone: "ok" } : { text: resultText, tone: "ok" });
    playSoftStepSound(nextNode?.type === "result" ? "final" : "step");
    setMicroCelebrateAnswerId(null);
    setMicroCelebrate(0);
    setCardPhase("success");
    setStepReview(null);
    setFeedback(null);

    if (correctAdvanceTimerRef.current) window.clearTimeout(correctAdvanceTimerRef.current);
    correctAdvanceTimerRef.current = window.setTimeout(() => {
      if (mode === "practice" && practiceCorrectionMode && nextNode?.type === "result") {
        setState(buildRunnerState(tree, mode, example));
        setPracticeCorrectionMode(false);
        setPracticeRetryReady(true);
        setDialogBubble(null);
        setDroppedChoice(null);
        setFeedback(null);
        setCardPhase("idle");
        setSuccessNudge("الآن طبّق التصحيح بنفسك وأعطِ النتيجة النهائية.");
        bringWorkAreaIntoView("center", 60);
        answerAdvanceLockRef.current = false;
        return;
      }
      setState(res.nextState);
      setDroppedChoice(null);
      setDialogBubble(null);
      setMicroCelebrateAnswerId(null);
      setMicroCelebrate(0);
      setCardPhase("entering");
      bringWorkAreaIntoView(nextNode?.type === "result" ? "center" : "soft", 60);
      window.setTimeout(() => {
        setCardPhase("idle");
        setMicroCelebrate(0);
        setMicroCelebrateAnswerId(null);
        answerAdvanceLockRef.current = false;
      }, 260);
    }, nextNode?.type === "result" ? 520 : 420);
  }

  async function finalizeQuizExample() {
    if (quizFinalizeLockRef.current) return;
    if (!selectedQuizOption) {
      setToast("اختر إجابة أولًا");
      return;
    }
    quizFinalizeLockRef.current = true;
    const quizExample = example as QuizExampleLike;
    const expectedCoverage = getExampleCoverageKeys(quizExample)[0] || "";
    const expectedLabel = localQuizExpectedLabel(safeFinalLabel(tree, quizExample, expectedCoverage), quizExample);
    const actualLabel = selectedQuizOption;
    const answerIsCorrect = isSameQuizAnswer(actualLabel, expectedLabel);
    const row: QuizAnswerRow = {
      exampleId: quizExample?.id || String(quizCursor),
      sentence: quizExample?.sentence,
      target: quizExample?.target,
      expectedCoverage,
      expectedLabel,
      actualCoverage: answerIsCorrect ? expectedCoverage : null,
      actualLabel,
      isCorrect: answerIsCorrect,
      whyCorrect: quizExample?.whyCorrect,
      actualOptionReason: actualLabel ? (optionReasonForLabel(quizExample?.optionReasons, actualLabel) || explainDistractor(actualLabel, expectedLabel)) : undefined,
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
        setToast("تعذر حفظ نتيجة المرحلة النهائية الآن");
      }
      window.setTimeout(() => { quizFinalizeLockRef.current = false; }, 250);
      return;
    }

    setQuizCursor(nextCursor);
    window.setTimeout(() => { quizFinalizeLockRef.current = false; }, 250);
  }

  function previousQuizQuestion() {
    setQuizCursor((c) => Math.max(0, c - 1));
  }

  function restartQuiz() {
    setQuizCursor(0);
    setQuizAnswers([]);
    setSelectedQuizOption(null);
    setQuizLocked(false);
    setRemedialActive(false);
    setRemedialQueue([]);
    setRemedialCursor(0);
    setRemedialSelected(null);
    setRemedialChecked(false);
    setRemedialResults([]);
    quizFinalizeLockRef.current = false;
  }

  function startRemedialTraining() {
    const queue = buildRemedialQueueFromMistakes(answeredQuizRows, examples as QuizExampleLike[]);
    if (!queue.length) {
      setToast("لا توجد أخطاء واضحة لتوليد تدريب علاجي منها");
      return;
    }
    setRemedialQueue(queue);
    setRemedialCursor(0);
    setRemedialSelected(null);
    setRemedialChecked(false);
    setRemedialResults([]);
    setRemedialActive(true);
    bringWorkAreaIntoView("center", 80);
  }

  function checkRemedialAnswer() {
    if (!remedialExample) return;
    if (!remedialSelected) {
      setToast("اختر إجابة أولًا");
      return;
    }
    const expectedCoverage = getExampleCoverageKeys(remedialExample)[0] || "";
    const expectedLabel = localQuizExpectedLabel(safeFinalLabel(tree, remedialExample, expectedCoverage), remedialExample);
    const isCorrect = isSameQuizAnswer(remedialSelected, expectedLabel);
    const row: QuizAnswerRow = {
      exampleId: remedialExample.id,
      sentence: remedialExample.sentence,
      target: remedialExample.target,
      expectedCoverage,
      expectedLabel,
      actualCoverage: isCorrect ? expectedCoverage : null,
      actualLabel: remedialSelected,
      isCorrect,
      whyCorrect: remedialExample.whyCorrect || "راجع المسار: نبدأ بالوظيفة أو العلاقة، ثم الحالة، ثم العلامة.",
      actualOptionReason: isCorrect ? "صحيح؛ عالجت موضع الضعف في هذا المثال." : explainDistractor(remedialSelected, expectedLabel),
    };
    setRemedialResults((prev) => {
      const next = [...prev];
      next[remedialCursor] = row;
      return next;
    });
    setRemedialChecked(true);
  }

  function goNextRemedial() {
    if (!remedialChecked) {
      checkRemedialAnswer();
      return;
    }
    if (remedialCursor + 1 >= remedialQueue.length) {
      setRemedialActive(false);
      setToast("انتهى التدريب العلاجي السريع");
      bringWorkAreaIntoView("center", 80);
      return;
    }
    setRemedialCursor((c) => c + 1);
    setRemedialSelected(null);
    setRemedialChecked(false);
    bringWorkAreaIntoView("center", 80);
  }

  const topicName = extractTopicName(title);
  const stageTitle = stageLearningTitle(stageMeta.badge, title);
  const exampleProgressTotal = mode === "quiz" ? (quizOrder.length || quizCount || 1) : Math.max(1, coverageKeysOrdered.length || 1);
  const exampleProgressDone = mode === "quiz" ? Math.min(quizCursor, exampleProgressTotal) : Math.min(doneCount, exampleProgressTotal);
  const exampleProgressCurrent = mode === "quiz" ? Math.min(quizCursor, Math.max(0, exampleProgressTotal - 1)) : Math.min(exampleProgressDone, Math.max(0, exampleProgressTotal - 1));
  const i3rabDraft = buildI3rabDraft(tree, state, state.currentTarget);
  const i3rabTokens = i3rabTokensFromDraft(i3rabDraft);
  const isPracticeMode = mode === "practice";
  const practiceExpectedCoverage = isPracticeMode ? (getExampleCoverageKeys(example)[0] || "") : "";
  const practiceExpectedLabel = isPracticeMode
    ? safeFinalLabel(tree, example, practiceExpectedCoverage)
    : "";
  const practiceDirectOptions = React.useMemo(() => {
    if (!isPracticeMode || !practiceExpectedLabel) return [];

    const exampleLabels = (examples || [])
      .filter((ex: any) => ex?.id !== example?.id)
      .map((ex: any) => exampleFinalLabel(ex))
      .filter((x: string) => x && x !== practiceExpectedLabel && !String(x).includes("."));

    const resultLabels = (Object.values(tree?.nodes || {}) as any[])
      .filter((n: any) => n?.type === "result")
      .map((n: any) => firstLine(n?.text))
      .filter((x: string) => x && x !== practiceExpectedLabel && !String(x).startsWith("tawabi."));

    const unique = Array.from(new Set([...exampleLabels, ...resultLabels])) as string[];
    let hash = String(example?.id || state?.currentTarget || "").split("").reduce((a, c) => ((a * 31 + c.charCodeAt(0)) >>> 0), 7);
    const distractors: string[] = [];
    while (unique.length && distractors.length < 2) {
      const idx = hash % unique.length;
      distractors.push(unique.splice(idx, 1)[0]);
      hash = (hash * 1664525 + 1013904223) >>> 0;
    }
    const options = [practiceExpectedLabel, ...distractors];
    return options.sort((a, b) => {
      const ha = (a + String(example?.id || "")).split("").reduce((n, c) => n + c.charCodeAt(0), 0) % 17;
      const hb = (b + String(example?.id || "")).split("").reduce((n, c) => n + c.charCodeAt(0), 0) % 17;
      return ha - hb;
    });
  }, [isPracticeMode, practiceExpectedLabel, examples, tree, example?.id, state?.currentTarget]);

  function buildPracticeSequenceSteps() {
    const facts = example?.facts || state?.facts || {};
    const target = String(state?.currentTarget || example?.target || "الكلمة");
    const expected = String(practiceExpectedLabel || "").trim();
    const steps: string[] = [];
    const push = (text?: string | null) => {
      const value = String(text || "").trim();
      if (value && !steps.includes(value)) steps.push(value);
    };

    if (facts.wordKind === "verb" && facts.commandMeaning === "command") {
      push("الكلمة فعل: حدث مقترن بزمن.");
      push("وهي فعل أمر؛ لأنها طلب حصول الحدث.");

      if (facts.attached === "none") {
        push("لم يتصل بآخره شيء يؤثر في بنائه؛ لذلك نستثني البناء على حذف النون والبناء على الفتح.");
        if (facts.ending === "weak") {
          push("الكلمة معتلّة الآخر.");
          const weakMap: Record<string, string> = { alif: "الألف", waw: "الواو", ya: "الياء" };
          const weak = weakMap[String(facts.weakLetter || "")] || "حرف العلة";
          push(`حرف العلة المحذوف: ${weak}.`);
          if (facts.presentBase) push(`ملاحظة: لاكتشاف الحرف الأخير نُسند الفعل إلى الضمير «هو»: هو ${facts.presentBase}.`);
          push(expected ? `إذن: ${expected}.` : "إذن: فعل أمر مبني على حذف حرف العلة.");
        } else {
          push("آخره صحيح، وليس معتلّ الآخر.");
          push(expected ? `إذن: ${expected}.` : "إذن: فعل أمر مبني على السكون.");
        }
      } else {
        const attachedMap: Record<string, string> = {
          waw: "واو الجماعة",
          alif2: "ألف الاثنين",
          yaa: "ياء المخاطبة",
          niswa: "نون النسوة",
          tawkid: "نون التوكيد",
        };
        const attached = attachedMap[String(facts.attached || "")] || "ضمير أو نون";
        push(`آخره اتصل بـ${attached}.`);
        if (["waw", "alif2", "yaa"].includes(String(facts.attached))) {
          push("هذا الاتصال من مواضع بناء فعل الأمر على حذف النون.");
        } else if (facts.attached === "niswa") {
          push("نون النسوة لا تجعل فعل الأمر مبنيًا على حذف النون، بل يبنى معها على السكون.");
        } else if (facts.attached === "tawkid") {
          push("اتصاله بنون التوكيد يجعله مبنيًا على الفتح.");
        }
        push(expected ? `إذن: ${expected}.` : null);
      }
      return steps;
    }

    let nextState: any = buildRunnerState(tree, mode, example);
    let guard = 0;
    while (guard++ < 30) {
      const n = tree?.nodes?.[nextState.currentNodeId];
      if (!n || n.type === "result") break;
      const correct = n.answers?.find((a: any) => {
        if (a.eval) {
          const v = nextState.facts?.[a.eval.fact];
          if (Array.isArray(a.eval.anyOf)) return a.eval.anyOf.includes(v);
          if (Object.prototype.hasOwnProperty.call(a.eval, "notEquals")) return v !== a.eval.notEquals;
          return v === a.eval.equals;
        }
        return Boolean(a.correct);
      });
      if (!correct) break;
      const answerText = String(correct.text || "").trim();
      if (steps.length === 0) push(`ابدأ من «${target}»: ${answerText}.`);
      else push(`${answerText}.`);
      nextState = chooseAnswer({ state: nextState, tree, answerId: correct.id } as any).nextState;
    }
    if (expected && !steps.some((x) => x.includes(expected))) push(`إذن: ${expected}.`);
    return steps;
  }

  function practiceCorrectRoute() {
    let nextState: any = buildRunnerState(tree, mode, example);
    let guard = 0;
    while (guard++ < 30) {
      const n = tree?.nodes?.[nextState.currentNodeId];
      if (!n || n.type === "result") break;
      const correct = n.answers?.find((a: any) => {
        if (a.eval) {
          const v = nextState.facts?.[a.eval.fact];
          if (Array.isArray(a.eval.anyOf)) return a.eval.anyOf.includes(v);
          if (Object.prototype.hasOwnProperty.call(a.eval, "notEquals")) return v !== a.eval.notEquals;
          return v === a.eval.equals;
        }
        return Boolean(a.correct);
      });
      if (!correct) break;
      nextState = chooseAnswer({ state: nextState, tree, answerId: correct.id } as any).nextState;
    }
    return { steps: buildPracticeSequenceSteps(), nextState };
  }

  function goToPracticeNext(nextState: any) {
    if (practiceNextLockRef.current) return;
    practiceNextLockRef.current = true;
    setPracticeWrongPanel(null);
    setPracticeCorrectionMode(false);
    setPracticeRetryReady(false);
    setDialogBubble(null);
    setFeedback(null);
    setSuccessNudge("واصل. في التدريب نثبت السرعة والدقة معًا.");
    setCardPhase("success");
    window.setTimeout(() => { setState(nextState); setCardPhase("idle"); practiceNextLockRef.current = false; }, 520);
  }

  return (
    <div className={`exercise-page-shell ${isPracticeMode ? "practice-game-shell" : ""}`}>
      {clickCheck ? <span key={clickCheck.id} className="click-success-pop" style={{ left: clickCheck.x, top: clickCheck.y }} aria-hidden="true">✓</span> : null}
      <section className="exercise-hero-card card card-glow">
        <div className="exercise-hero-main">
          <span className="exercise-badge stage-learning-badge">{stageTitle}</span>
          {stageMeta.subtitle ? <p className="exercise-page-subtitle">{stageMeta.subtitle}</p> : null}
          {mode !== "quiz" && (
            <div className="exercise-meta-inline">
              <span className="pill pill-accent">المنجَز: {doneCount} / {totalCount}</span>
              <span className="pill">نتابع: {stepLabels?.[stepLabel] || coverageDisplayLabel(stepLabel)}</span>
            </div>
          )}
        </div>

        <div className="exercise-hero-side">
          <div className="exercise-progress-panel">
            <div className="exercise-progress-head">
              <span>{mode === "quiz" ? "تقدّم المرحلة النهائية" : "نسبة الإنجاز"}</span>
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

          </div>
        </div>
      </section>



      <div className="kana-example-progress-wrap global-example-progress-wrap" aria-label="تقدم الأمثلة العام">
        <span className="kana-example-progress-label">{mode === "quiz" ? `${Math.min(quizCursor + 1, exampleProgressTotal)} / ${exampleProgressTotal}` : `${exampleProgressDone} / ${exampleProgressTotal} مهارة`}</span>
        <ProgressDots total={exampleProgressTotal} done={exampleProgressDone} current={exampleProgressCurrent} />
      </div>

      {mode !== "quiz" && isDone && node?.type === "result" && (
        <section className="exercise-complete-banner final-only-complete-banner">
          <div>
            <strong>{mode === "learn" ? "اكتملت رحلة التعلّم" : "اكتمل تحدي المهارة"}</strong>
            <p>{mode === "learn" ? "انتقل الآن إلى تحدي المهارة لتثبيت فهمك بطريقة ممتعة." : "أصبحت جاهزًا لاختبار نفسك والحصول على شهادة الإنجاز."}</p>
          </div>
          <button onClick={resetTraining} style={ghostBtn}>
            {mode === "learn" ? "إعادة التعلّم" : "إعادة التحدي"}
          </button>
        </section>
      )}

      {mode === "quiz" && remedialActive ? (
        <section className="exercise-panel exercise-quiz-summary" style={box}>
          <div className="exercise-summary-head">
            <div>
              <div className="exercise-summary-kicker">عالج ضعفي</div>
              <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>تدريب علاجي سريع</div>
              <div style={{ opacity: 0.9 }}>مثال {Math.min(remedialCursor + 1, remedialQueue.length)} / {remedialQueue.length}</div>
            </div>
            <button type="button" onClick={() => setRemedialActive(false)} style={ghostBtn}>العودة للنتيجة</button>
          </div>

          {remedialExample ? (
            <>
              <section className="exercise-panel exercise-sentence-panel" style={{ ...box, marginTop: 12 }}>
                <div style={{ opacity: 0.6, marginBottom: 6 }}>الجملة:</div>
                <div className="exercise-sentence">{renderSentence(remedialExample.sentence, remedialExample.target)}</div>
                <div style={{ fontSize: 18, lineHeight: 1.9, marginTop: 10 }}>تدرّب على موضع الضعف في هذا المثال.</div>
                <div className="choice-selection-instruction">اختر الإجابة الصحيحة مما يأتي:</div>
              </section>

              <div className="quiz-form-card-options" style={{ marginTop: 12 }}>
                {remedialOptions.map((option, idx) => {
                  const selected = remedialSelected === option;
                  const isCorrect = remedialChecked && isSameQuizAnswer(option, remedialExpectedLabel);
                  const isWrong = remedialChecked && selected && !isCorrect;
                  return (
                    <button
                      key={`${option}-${idx}`}
                      onClick={() => {
                        if (remedialChecked) return;
                        setRemedialSelected(option);
                      }}
                      className={`exercise-answer-btn quiz-form-option ${selected ? "is-selected" : ""} ${isCorrect ? "is-correct" : ""} ${isWrong ? "is-wrong" : ""}`}
                      style={{
                        ...answerBtn,
                        background: isCorrect ? "rgba(34,197,94,.18)" : isWrong ? "rgba(251,146,60,.18)" : selected ? "rgba(47,158,158,.22)" : "rgba(255,255,255,.05)",
                        borderColor: isCorrect ? "rgba(34,197,94,.65)" : isWrong ? "rgba(251,146,60,.65)" : selected ? "#2f9e9e" : "rgba(255,255,255,.14)",
                      }}
                    >
                      <span className="quiz-option-dot">{idx + 1}</span>
                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>

              {remedialChecked ? (
                <div className={`exercise-review-card ${remedialIsCheckedCorrect ? "is-correct" : "is-wrong"}`} style={{ padding: 12, border: "1px solid rgba(255,255,255,.12)", borderRadius: 16, background: remedialIsCheckedCorrect ? "rgba(34,197,94,.12)" : "rgba(251,146,60,.12)", marginTop: 12, lineHeight: 1.9 }}>
                  <strong>{remedialIsCheckedCorrect ? "✅ صحيح" : "❌ راجع السبب"}</strong>
                  <div><strong>الإجابة الصحيحة:</strong> {remedialExpectedLabel}</div>
                  {!remedialIsCheckedCorrect ? <div style={{ color: "#ffd5a8" }}><strong>سبب الخطأ:</strong> {explainDistractor(remedialSelected, remedialExpectedLabel)}</div> : null}
                  <div style={{ color: "#b8ffd4" }}><strong>تذكير سريع:</strong> {remedialExample.whyCorrect || "ابدأ بالوظيفة أو العلاقة، ثم الحالة، ثم العلامة."}</div>
                </div>
              ) : null}

              <div className="quiz-form-actions" style={{ marginTop: 12 }}>
                <button type="button" onClick={() => { setRemedialSelected(null); setRemedialChecked(false); }} style={ghostBtn}>إعادة المثال</button>
                <button type="button" onClick={goNextRemedial} style={primaryNavBtn} disabled={!remedialSelected}>
                  {remedialChecked ? (remedialCursor + 1 >= remedialQueue.length ? "إنهاء العلاج" : "مثال علاجي جديد") : "تحقق"}
                </button>
              </div>
            </>
          ) : (
            <div className="exercise-practice-warning">لا توجد أمثلة علاجية جاهزة الآن.</div>
          )}
        </section>
      ) : quizFinished ? (
        <section className="exercise-panel exercise-quiz-summary" style={box}>
          <div className="exercise-summary-head">
            <div>
              <div className="exercise-summary-kicker">النتيجة النهائية</div>
              <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>انتهى المرحلة النهائية</div>
              <div style={{ opacity: 0.9 }}>نتيجتك: {quizScore} / {answeredQuizRows.length} ({quizPercent}%)</div>
            </div>
            <div className={`exercise-result-pill ${quizPercent >= QUIZ_PASS_PERCENT ? "is-pass" : "is-fail"}`}>
              {quizPercent >= QUIZ_PASS_PERCENT ? "نجاح" : "بحاجة إلى إعادة"}
            </div>
          </div>

          <div style={{ marginBottom: 12, opacity: 0.85 }}>معيار النجاح: {QUIZ_PASS_PERCENT}% أو أكثر</div>
          <div className="quiz-form-actions" style={{ marginBottom: 16, justifyContent: "flex-start", flexWrap: "wrap" }}>
            {canDownloadCertificate ? (
              <a href={`/certificate?topicId=${topicId}&level=${level}`} style={{ ...primaryNavBtn, display: "inline-flex", textDecoration: "none" }}>
                تحميل الشهادة
              </a>
            ) : (
              <button type="button" style={{ ...primaryNavBtn, opacity: 0.45, cursor: "not-allowed" }} disabled>
                تحميل الشهادة
              </button>
            )}
            <button
              type="button"
              onClick={startRemedialTraining}
              style={{ ...primaryNavBtn, background: canStartRemedial ? undefined : "rgba(255,255,255,.12)", opacity: canStartRemedial ? 1 : 0.48, cursor: canStartRemedial ? "pointer" : "not-allowed" }}
              disabled={!canStartRemedial}
            >
              عالج ضعفي
            </button>
          </div>
          {!canDownloadCertificate ? (
            <div className="exercise-practice-warning" style={{ marginBottom: 16 }}>الشهادة لا تُتاح إلا بعد النجاح بنسبة 80% فأكثر.</div>
          ) : null}
          {!canStartRemedial && quizFinished ? (
            <div className="exercise-practice-warning" style={{ marginBottom: 16 }}>لا توجد أخطاء ظاهرة لبناء تدريب علاجي منها.</div>
          ) : null}

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

          <button onClick={restartQuiz} style={ghostBtn}>إعادة المرحلة النهائية</button>
        </section>
      ) : mode === "quiz" ? (
        <>
          <section className="exercise-panel exercise-sentence-panel" style={box}>
            <div style={{ opacity: 0.6, marginBottom: 6 }}>السؤال {quizCursor + 1} من {quizOrder.length}</div>
            <div style={{ opacity: 0.6, marginBottom: 6 }}>الجملة:</div>
            <div className="exercise-sentence">{renderSentence((example as QuizExampleLike)?.sentence, (example as QuizExampleLike)?.target)}</div>
            <div style={{ fontSize: 18, lineHeight: 1.9, marginTop: 10 }}>{withoutRepeatedChoiceInstruction(enrichQuizPrompt((example as QuizExampleLike)?.prompt))}</div>
            <div className="choice-selection-instruction">اختر الإجابة الصحيحة مما يأتي:</div>
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
                {quizCursor + 1 >= quizOrder.length ? "تسليم المرحلة النهائية" : "التالي"}
              </button>
            </div>

          </section>
        </>
      ) : (
        <>
          <div className="thinking-layout start-style-layout">
          <section ref={workAreaRef as any} className="exercise-panel exercise-core-card clean-thinking-card sequential-stage-shell" style={box}>
            {false && node?.type === "question" && completedStepCards.length > 0 ? (
              <div className="algorithm-card-stack" aria-label="البطاقات التي تم حلها في المسار الحالي">
                {completedAlgorithmCards.map((card) => (
                  <article key={`${card.nodeId}-${card.index}`} className="algorithm-step-card is-solved">
                    <span className="algorithm-card-number">{card.index}</span>
                    <div className="algorithm-card-label">تم حل هذه الخطوة</div>
                    <h3>{renderSmartText(card.question, setActiveGlossary)}</h3>
                    <div className="algorithm-card-answer">
                      <span>اختيارك</span>
                      <strong>{renderSmartText(card.answer, setActiveGlossary)}</strong>
                    </div>
                    <div className="algorithm-card-result"><span>✓</span>{card.result}</div>
                  </article>
                ))}
              </div>
            ) : null}

            {node?.type === "question" ? (
              <div
                ref={activeCardRef}
                className={`clean-question-block algorithm-step-card algorithm-active-card sequential-active-card ${isPracticeMode ? "practice-challenge-card" : ""} ${dropOver ? "is-drop-over" : ""} phase-${cardPhase}`}
                onDragOver={(e) => { if (mode === "learn") { e.preventDefault(); setDropOver(true); } }}
                onDragLeave={() => setDropOver(false)}
                onDrop={(e) => {
                  if (mode !== "learn") return;
                  e.preventDefault();
                  setDropOver(false);
                  const answerId = e.dataTransfer.getData("text/answer-id");
                  const label = e.dataTransfer.getData("text/plain");
                  if (answerId) handleLearnDrop(answerId, label);
                }}
              >
                <div className="algorithm-card-number algorithm-card-progress-number" aria-label="تقدم المثال">
                  <span className="algorithm-card-progress-label">{`خطوة ${currentStageStep}/${estimatedStepTotal}`}</span>
                  <i style={{ width: `${Math.max(5, stageProgressPercent)}%` }} />
                </div>

                <div key={`${state.currentNodeId}`} className={`question-content-motion question-text-${questionVisualPhase}`} aria-live="polite">
                  <div className="sequential-sentence-line" aria-label="الجملة">
                    <span className="dialogue-label">في الجملة:</span>
                    <span className="dialogue-sentence-text">{renderSentence(state.currentSentence, state.currentTarget)}</span>
                  </div>
                  {dialogBubble?.tone === "hint" ? (
                    <div className="inline-correction-hint" role="note" aria-live="polite">
                      <span className="inline-correction-hint-title">فكّر معي</span>
                      <div className="inline-correction-hint-text">{renderSmartText(dialogBubble.text, setActiveGlossary)}</div>
                      <button
                        type="button"
                        className="inline-correction-hint-btn"
                        onClick={() => {
                          setDialogBubble(null);
                          bringWorkAreaIntoView("soft", 40);
                        }}
                      >
                        فهمت
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="exercise-question-title clean-question-title">{renderSmartText(dialogueQuestionText(thinkingNode, state.currentTarget, mode, state, tree, title), setActiveGlossary)}</div>
                      <div className="choice-selection-instruction">اختر الإجابة الصحيحة مما يأتي:</div>
                      {dialogueQuestionNote(thinkingNode) ? <div className="dialogue-question-note">{dialogueQuestionNote(thinkingNode)}</div> : null}

                      {isPracticeMode && !practiceCorrectionMode ? (
                        <div className="practice-direct-board" aria-label="تحدي الإعراب السريع">
                          {practiceWrongPanel ? (
                            <div className="practice-wrong-sequence is-primary-panel" role="alert" aria-live="assertive">
                              <div className="practice-wrong-title">ليست الإجابة دقيقة.</div>
                              <div className="practice-wrong-subtitle">اتبع التسلسل الصحيح:</div>
                              <ol>
                                {practiceWrongPanel.steps.map((step, i) => <li key={`${step}-${i}`}>{renderSmartText(step, setActiveGlossary)}</li>)}
                              </ol>
                              <div className="practice-wrong-actions">
                                <button type="button" onClick={() => { setPracticeWrongPanel(null); setFeedback(null); setPracticeRetryReady(true); bringWorkAreaIntoView("center", 40); }}>أعد المحاولة</button>
                                <button type="button" className="secondary" onClick={() => goToPracticeNext(practiceWrongPanel.nextState)}>أكمل بعد التصحيح</button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="practice-direct-kicker">طبّق ما تعلّمته</div>
                              <div className="practice-direct-prompt">ما الإعراب الصحيح لـ <strong>«{state.currentTarget}»</strong>؟</div>
                              <div className="practice-direct-note">فكّر سريعًا، ثم اختر النتيجة النهائية.</div>
                              {practiceRetryReady ? <div className="practice-retry-message">عدت إلى السؤال نفسه. طبّق الآن التسلسل الذي صححناه.</div> : null}
                              <div className="practice-direct-options">
                                {practiceDirectOptions.map((option, idx) => (
                                  <button key={`${option}-${idx}`} type="button" className="practice-direct-option" onClick={() => {
                                    if (option === practiceExpectedLabel) {
                                      const route = practiceCorrectRoute();
                                      setSuccessNudge(practiceRetryReady ? "أحسنت. صححت المسار ووصلت إلى النتيجة بنفسك." : "إجابة دقيقة. طبّقت الخوارزمية بسرعة ووضوح.");
                                      setPracticeWrongPanel(null);
                                      setCardPhase("success");
                                      window.setTimeout(() => { setState(route.nextState); setPracticeRetryReady(false); setCardPhase("idle"); }, 650);
                                    } else {
                                      const route = practiceCorrectRoute();
                                      setFeedback({ wrongId: String(idx) });
                                      setPracticeWrongPanel({ wrongLabel: option, steps: route.steps, nextState: route.nextState });
                                      setPracticeCorrectionMode(false);
                                      setPracticeRetryReady(false);
                                      setDialogBubble(null);
                                      bringWorkAreaIntoView("center", 40);
                                    }
                                  }}>
                                    <span>{idx + 1}</span><strong>{renderSmartText(option, setActiveGlossary)}</strong>
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                          {cardPhase === "success" ? <div className="practice-success-pulse">✓ {successNudge}</div> : null}
                        </div>
                      ) : isPracticeMode ? (
                        <div className="practice-correction-board">
                          <div className="practice-correction-head"><strong>نضبط المسار</strong><span>سؤال قصير في كل نقطة انحراف</span></div>
                          <div className="practice-correction-question">{renderSmartText(dialogueQuestionText(thinkingNode, state.currentTarget, mode, state, tree, title), setActiveGlossary)}</div>
                          <div className="practice-fast-options">
                            {currentChoiceAnswers.map((a: any, idx: number) => (
                              <button key={a.id} type="button" disabled={cardPhase !== "idle"} onClick={() => handlePick(a.id)} className={`practice-fast-option ${feedback?.wrongId === a.id ? "is-wrong" : ""}`}>
                                <span className="practice-fast-number">{idx + 1}</span><strong>{renderSmartText(a.text, setActiveGlossary)}</strong>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className={`clean-answer-grid stage-one-draggable-grid`}>
                          {currentChoiceAnswers.map((a: any, idx: number) => {
                            const answerClass = [
                              "exercise-answer-btn",
                              "clean-answer-btn",
                              mode === "learn" && feedback?.correctId === a.id ? "is-correct" : "",
                              feedback?.wrongId === a.id ? "is-wrong" : "",
                            ].filter(Boolean).join(" ");
                            return (
                              <button
                                key={a.id}
                                disabled={cardPhase !== "idle"}
                                draggable={mode === "learn" && cardPhase === "idle"}
                                onDragStart={(e) => {
                                  if (mode !== "learn") return;
                                  e.dataTransfer.setData("text/answer-id", a.id);
                                  e.dataTransfer.setData("text/plain", String(a.text || ""));
                                }}
                                onClick={(e) => {
                                  if (isAnswerCorrect(a)) {
                                    const id = Date.now();
                                    setClickCheck({ x: e.clientX, y: e.clientY, id });
                                    window.setTimeout(() => setClickCheck((current) => current?.id === id ? null : current), 760);
                                  }
                                  if (mode === "learn") setDroppedChoice({ text: answerEffectLabel(thinkingNode, a, state), tone: "idle" });
                                  handlePick(a.id);
                                }}
                                className={answerClass}
                                style={answerBtn}
                              >
                                {mode === "learn" ? <span className="answer-drag-mini">{answerDragLabel(mode)}</span> : null}
                                <span className="answer-main-text">{String(tree?.startNodeId || "").includes("past") ? String(a.text || "") : renderSmartText(a.text, setActiveGlossary)}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {!practiceWrongPanel ? (
                        <div className="hint-after-options">
                          <button
                            type="button"
                            className="hint-after-options-btn"
                            onClick={openCurrentHint}
                            disabled={cardPhase !== "idle"}
                          >
                            أحتاج تلميحًا
                          </button>
                        </div>
                      ) : null}
                    </>
                  )}

                  {stageTrailItems.length > 0 ? (
                    <div className="stage-progress-under-options" aria-label="مسار البناء">
                      <div className="i3rab-build-path embedded-trail" aria-label="ما بُني من الإعراب حتى الآن">
                        <span className="i3rab-build-path-title">مسار البناء</span>
                        <div className="i3rab-build-path-items">
                          {stageTrailItems.map((item, idx) => <span key={`${item}-${idx}`}>✓ {item}</span>)}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {latestStepResult && dialogBubble?.tone !== "hint" ? (
                    <div className={`sequential-live-result ${droppedChoice?.tone === "bad" ? "is-bad" : droppedChoice?.tone === "ok" ? "is-ok" : ""}`} aria-live="polite">
                      <span>{latestStepResult}</span>
                    </div>
                  ) : null}

                  {cardPhase !== "idle" && droppedChoice?.tone !== "bad" ? (
                    <div className="step-transform-chip" aria-live="polite">
                      <span className="step-transform-check">✓</span>
                      <span>{successNudge || "أضفنا إلى المسار:"}</span>
                      <strong>{latestStepResult}</strong>
                    </div>
                  ) : null}

                  {stepReview ? (
                    <div
                      ref={feedbackAreaRef}
                      className={`step-review-card ${mode === "practice" ? "is-challenge" : "is-learn"}`}
                      role="status"
                      aria-live="polite"
                    >
                      <div className="step-review-head">
                        <span className="step-review-badge">{mode === "practice" ? "تعزيز التحدي" : "نتيجة الخطوة"}</span>
                        <strong>✓ إجابتك صحيحة</strong>
                      </div>
                      <div className="step-review-section">
                        <span>النتيجة</span>
                        <p>{renderSmartText(stepReview.resultText, setActiveGlossary)}</p>
                      </div>
                      <div className="step-review-section">
                        <span>السبب</span>
                        <p>{renderSmartText(stepReview.reason, setActiveGlossary)}</p>
                      </div>
                      <div className="step-review-rule">
                        <span>الخلاصة</span>
                        <p>{renderSmartText(stepReview.summary, setActiveGlossary)}</p>
                      </div>
                      <button
                        type="button"
                        className="step-review-continue"
                        onClick={continueAfterStepReview}
                      >
                        {continueLabelForStepReview(stepReview.isFinal)}
                      </button>
                    </div>
                  ) : null}

                  {cardPhase !== "idle" && droppedChoice?.tone !== "bad" && !stepReview ? (
                    isPracticeMode ? (
                      <div className="practice-reward-burst" aria-live="polite">
                        <span className="practice-reward-star">★</span>
                        <div>
                          <strong>{successNudge || "نجمة جديدة ✓"}</strong>
                          <p>{latestStepResult ? `أضفنا للمسار: ${latestStepResult}` : "نكمل التحدي."}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="next-step-focus-cue quick-success-cue" aria-live="polite">
                        <span>أحسنت ✓ ننتقل للخطوة التالية.</span>
                      </div>
                    )
                  ) : null}
                </div>

                <div className="clean-question-nav">
                  <button type="button" onClick={() => { setFeedback(null); setDialogBubble(null); setStepReview(null); setCardPhase("idle"); setState(buildRunnerState(tree, mode, example)); }} style={ghostBtn}>إعادة المثال</button>
                </div>
                {/* تم حذف النقاط السفلية لأن شريط التقدم العلوي يكفي ويقلل التشتت. */}
              </div>
            ) : node?.type === "result" ? (
              <>
              {pendingStageComplete ? (
                <div className="stage-focus-next-panel stage-complete-only" aria-live="polite">
                  <strong>{mode === "learn" ? "انتهت رحلة التعلّم" : "انتهى تحدي المهارة"}</strong>
                  <span>{mode === "learn" ? "أنهيت مهارات هذا المستوى، والزر التالي ينقلك إلى تحدي المهارة." : "أنهيت التحدي، والزر التالي ينقلك إلى اختبار النفس والشهادة."}</span>
                  <button
                    onClick={completeCurrentAndGoNextStage}
                    className="next-example-glow stage-focus-next-btn"
                    style={{ ...primaryNavBtn, opacity: canMoveAfterResult ? 1 : 0.55, cursor: canMoveAfterResult ? "pointer" : "not-allowed" }}
                    disabled={!canMoveAfterResult}
                  >
                    {finalCtaReady ? (stageMeta.nextLabel || "انتقل للمرحلة التالية") : "اقرأ رسالة الإتمام أولًا"}
                  </button>
                </div>
              ) : (
              <div ref={activeCardRef} className="clean-result-block algorithm-step-card algorithm-final-card pro-final-focus">
                <div className="final-achievement-mark" aria-hidden="true">{isPracticeMode ? "🏆" : "✓"}</div>
                <div className="clean-final-label">{isPracticeMode ? "فزت بجولة من تحدي المهارة" : "أحسنت! هذه ثمرة المسار"}</div>
                {isPresentBuiltResult(tree, thinkingNode) ? (
                  <div className="built-closure-note" role="note">{presentBuiltClosureNote(thinkingNode)}</div>
                ) : null}
                <div className="exercise-result-text clean-result-text final-glow-result final-single-i3rab final-structured-i3rab" style={{ whiteSpace: "pre-line" }}>
                  <strong className="final-result-heading">إذن إعراب {finalI3rabSubject(tree, title)} {renderSmartText(state.currentTarget, setActiveGlossary)}:</strong>
                  <span className="final-i3rab-line">{renderSmartText(finalThinkingTextForDisplay(thinkingNode, state), setActiveGlossary)}</span>
                  {String(tree?.startNodeId || "").includes("kana") && kanaNasikhFinalIntro(state) ? (
                    <span className="final-i3rab-line final-nasikh-note">{renderSmartText(`انتبه:
${kanaNasikhFinalIntro(state)}`, setActiveGlossary)}</span>
                  ) : null}
                  {String(tree?.startNodeId || "").includes("inna") && innaNasikhFinalIntro(state) ? (
                    <span className="final-i3rab-line final-nasikh-note">{renderSmartText(innaNasikhFinalIntro(state), setActiveGlossary)}</span>
                  ) : null}
                </div>
                {!finalCtaReady ? <div className="final-read-cue" aria-live="polite">توقّف لحظة واقرأ الإعراب النهائي؛ هذه نتيجة المسار الذي بنيته.</div> : null}
                <div className="final-motivation-line">كل خطوة سابقة كانت جزءًا من بناء هذا الإعراب.</div>
              </div>
              )}

                {!pendingStageComplete && currentFollowUp ? (
                  <div className="exercise-followup-box clean-followup-box">
                    <div className="clean-followup-title">تثبيت سريع بعد الإعراب: {currentFollowUp.question}</div>
                    {currentFollowUp.options.map((op) => {
                      const picked = followUpChoice === op.label;
                      const cls = picked ? (op.correct ? "is-correct" : "is-wrong") : "";
                      return (
                        <button
                          key={op.label}
                          onClick={() => pickFollowUp(op.label)}
                          className={`exercise-answer-btn clean-answer-btn ${cls}`}
                          style={answerBtn}
                        >
                          {op.label}
                        </button>
                      );
                    })}
                    {followUpChoice ? (
                      <div className={`thinking-bubble ${chosenFollowUp?.correct ? "success" : "hint"}`}>
                        {chosenFollowUp?.correct ? "أحسنت ✨" : "فكر من جديد: "}{chosenFollowUp?.feedback || (chosenFollowUp?.correct ? "صحيح." : "راجع العلاقة النحوية في الجملة.")}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {!pendingStageComplete ? (
                  <button
                    onClick={resultWouldCompleteStage ? () => setPendingStageComplete(true) : goNextExample}
                    className="next-example-glow"
                    style={{ ...primaryNavBtn, opacity: canMoveAfterResult ? 1 : 0.55, cursor: canMoveAfterResult ? "pointer" : "not-allowed" }}
                    disabled={!canMoveAfterResult}
                  >
{finalCtaReady ? (resultWouldCompleteStage ? "فهمت، انتقل للمرحلة التالية" : (mode === "practice" ? "أكمل التحدي" : "فهمت الإعراب، انتقل للتالي")) : "اقرأ الإعراب النهائي أولًا"}
                  </button>
                ) : null}
                {/* لا نعرض نقاطًا سفلية في شاشة النتيجة؛ التركيز على الإعراب النهائي وزر فهمت. */}
              </>
            ) : (
              <div>لا توجد عقدة للعرض</div>
            )}
          </section>

          </div>

          {isDone ? <div className="exercise-bottom-nav stage-locked-next" style={navNextWrap}>
            <button
                style={{ ...primaryNavBtn, opacity: nextStageReady ? 1 : 0.48, cursor: nextStageReady ? "pointer" : "not-allowed" }}
                className="stage-next-button"
                disabled={!nextStageReady}
                onClick={() => {
                  if (!nextStageReady) {
                    setToast(mode === "learn" ? "أكمل رحلة التعلّم أولًا" : "أكمل تحدي المهارة أولًا");
                    return;
                  }
                  router.push(`${stageMeta.nextHrefPrefix}${topicId}`);
                }}
              >
                {stageMeta.nextLabel}
              </button>
          </div> : null}
        </>
      )}

      {activeGlossary && SMART_GLOSSARY[activeGlossary] ? (
        <div className="smart-popover" role="dialog" aria-label={SMART_GLOSSARY[activeGlossary].title}>
          <button type="button" className="smart-popover-close" onClick={() => setActiveGlossary(null)}>×</button>
          <strong>{SMART_GLOSSARY[activeGlossary].title}</strong>
          <ul>
            {SMART_GLOSSARY[activeGlossary].body.map((line) => <li key={line}>{line}</li>)}
          </ul>
        </div>
      ) : null}
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
