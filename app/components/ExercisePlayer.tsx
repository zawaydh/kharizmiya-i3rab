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
      badge: "المرحلة الأولى",
      subtitle: "",
      nextLabel: "انتقل إلى المرحلة الثانية →",
      nextHrefPrefix: "/train/",
    };
  }
  if (mode === "practice") {
    return {
      badge: "المرحلة الثانية",
      subtitle: "",
      nextLabel: "انتقل إلى المرحلة النهائية →",
      nextHrefPrefix: "/quiz/",
    };
  }
  return {
    badge: "المرحلة النهائية",
    subtitle: "",
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
  if (stageBadge === "المرحلة النهائية") return `${stageBadge} في اختبار إعراب ${topic}`;
  if (stageBadge === "المرحلة الثانية") return `${stageBadge} في تدريب إعراب ${topic}`;
  return `${stageBadge} في تعلم إعراب ${topic}`;
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

function shortStudentText(text?: string, fallback = "جرّب مرة أخرى.") {
  const clean = firstLine(text).replace(/^💡\s*/, "").trim();
  if (!clean) return fallback;
  return clean.length > 72 ? `${clean.slice(0, 69)}...` : clean;
}


const SMART_GLOSSARY: Record<string, { title: string; body: string[] }> = {
  "حروف العلة": { title: "حروف العلة", body: ["الألف، الواو، الياء.", "ننظر إليها عند آخر الكلمة لتحديد: تعذر، ثقل، أو حذف حرف العلة."] },
  "الأسماء الخمسة": { title: "الأسماء الخمسة", body: ["أبو، أخو، حمو، فو، ذو.", "ترفع بالواو، وتنصب بالألف، وتجر بالياء إذا تحققت شروطها."] },
  "الأفعال الخمسة": { title: "الأفعال الخمسة", body: ["كل مضارع اتصلت به: واو الجماعة، ياء المخاطبة، أو ألف الاثنين.", "ترفع بثبوت النون، وتنصب وتجزم بحذف النون."] },
  "اسم منقوص": { title: "الاسم المنقوص", body: ["اسم معرب آخره ياء لازمة مكسور ما قبلها، مثل: القاضي، الساعي.", "تظهر الفتحة في النصب، وتقدر الضمة والكسرة في الرفع والجر."] },
  "اسم مقصور": { title: "الاسم المقصور", body: ["اسم معرب آخره ألف لازمة، مثل: الفتى، العصا.", "تقدر عليه الحركات الثلاث للتعذر."] },
  "واو الجماعة": { title: "واو الجماعة", body: ["ضمير متصل يدل على جماعة الذكور.", "يكون في محل رفع فاعل إذا اتصل بالفعل."] },
  "ألف الاثنين": { title: "ألف الاثنين", body: ["ضمير متصل يدل على مثنى.", "يكون في محل رفع فاعل إذا اتصل بالفعل."] },
  "ياء المخاطبة": { title: "ياء المخاطبة", body: ["ضمير متصل يدل على المخاطبة المؤنثة.", "مع المضارع والأمر تكون في محل رفع فاعل."] },
  "نون النسوة": { title: "نون النسوة", body: ["ضمير متصل يدل على جماعة الإناث.", "إذا اتصلت بالفعل الماضي بُني على السكون."] },
  "ضمير رفع متحرك": { title: "ضمير رفع متحرك", body: ["مثل: تُ، تَ، تِ، نا، تم، تما.", "إذا اتصل بالفعل الماضي بُني الفعل على السكون."] },
  "ضمير متصل": { title: "الضمير المتصل", body: ["ضمير لا يستقل بنفسه ويتصل بكلمة قبله.", "قد يكون في محل رفع أو نصب أو جر بحسب موقعه."] },
  "ضمير منفصل": { title: "الضمير المنفصل", body: ["ضمير يستقل في النطق والكتابة، مثل: أنا، أنت، هو.", "غالبًا يُعرب مبنيًا في محل رفع مبتدأ إذا بدأ به الكلام."] },
  "شبه جملة": { title: "شبه الجملة", body: ["جار ومجرور أو ظرف.", "قد تأتي خبرًا إذا أتمت معنى المبتدأ."] },
  "الجملة الاسمية": { title: "الجملة الاسمية", body: ["تبدأ غالبًا باسم وتتكون أساسًا من مبتدأ وخبر."] },
  "الجملة الفعلية": { title: "الجملة الفعلية", body: ["تبدأ غالبًا بفعل، وتحتاج إلى فاعل، وقد تحتاج إلى مفعول به."] },
  "أداة نصب": { title: "أدوات النصب", body: ["مثل: لن، أن، كي، حتى، لام التعليل.", "إذا سبقت المضارع جعلته منصوبًا."] },
  "أداة جزم": { title: "أدوات الجزم", body: ["مثل: لم، لا الناهية، لام الأمر.", "إذا سبقت المضارع جعلته مجزومًا."] },
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
  "أدوات النصب": { title: "أدوات النصب", body: ["مثل: أن، لن، كي، حتى، لام التعليل.", "إذا دخلت على الفعل المضارع جعلته منصوبًا."] },
  "أدوات الجزم": { title: "أدوات الجزم", body: ["مثل: لم، لا الناهية، لام الأمر.", "إذا دخلت على الفعل المضارع جعلته مجزومًا."] },

};

function renderSmartText(text?: string, onTerm?: (term: string) => void) {
  if (!text) return null;
  const terms = Object.keys(SMART_GLOSSARY).sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");
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
    if (/واو الجماعة|ياء المخاطبة|ألف الاثنين/.test(t)) return "من الأفعال الخمسة";
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

function ProgressDots({ total, done, current }: { total: number; done: number; current?: number }) {
  const safeTotal = Math.max(1, Math.min(total || 1, 18));
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
  if (id.includes("present_nun") || id.includes("binaa")) return "لكي نعرب الفعل المضارع تكون أول خطوة...";
  if (id.includes("has_tool") || id.includes("tool")) return "نكمل التفكير بسؤال عن العامل";
  if (id.includes("five")) return "نكمل التفكير بسؤال عن الأفعال الخمسة";
  if (id.includes("ending") || id.includes("weak")) return "نكمل التفكير بسؤال عن آخر الفعل";
  if (id.includes("tense")) return "نبدأ بتحديد زمن الفعل";
  if (id.includes("wordType") || id === "start") return "نبدأ من نوع الكلمة";
  if (id.includes("khabar") || id.includes("mubtada") || id.includes("nounKind")) return "نكمل التفكير بموقع الاسم";
  return "نكمل التفكير بسؤال واحد";
}

function cleanQuestionText(node: any) {
  const id = String(node?.id || "");
  const text = String(node?.text || "ماذا نلاحظ؟");
  if (id === "present_step_1") return "ماذا نتحقق أولًا؟";
  if (id === "present_tense") return "ما زمن الفعل؟";
  if (id === "present_tool") return "هل نفحص ما قبل الفعل؟";
  if (id === "present_has_tool") return "هل سبق الفعل عامل نصب أو جزم؟";
  if (id.includes("attached")) return "هل اتصل الفعل بواو الجماعة أو ألف الاثنين أو ياء المخاطبة؟";
  if (id.includes("ending")) return "ما حالة آخر الفعل؟";
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
  return "ارجع خطوة: ماذا عرفنا؟ ثم اختر ما يثبته المثال فقط.";
}

function normalizeThinkingNode(node: any, state: any) {
  if (!node || node.type !== "question") return node;
  const id = String(node.id || "");
  let context = String(node.context || getNodeContext(node, state));
  let text = String(node.text || "ماذا نتحقق الآن؟");
  let hint = shortStudentText(node.hint, "اختر القرار التالي فقط.");

  // تحويل أي صياغة مباشرة إلى صياغة عقدة تفكير.
  if (/إعراب|الإعراب الصحيح/.test(text)) text = "ما السؤال الذي يساعدنا على الوصول للإعراب؟";
  if (/هل هو:|هل هي:|إذا كان/.test(text)) text = text.replace(/^إذا كان\s*/,'').replace(/^الآن:\s*/,'ما التصنيف المناسب الآن؟ ');
  if (/ما حالة آخر/.test(text)) context = "عرفنا التصنيف، والآن نفحص آخر الكلمة لاختيار العلامة.";
  if (/ما نوع الاسم المبني/.test(text)) context = "عرفنا أنها كلمة مبنية، فنحدد نوعها قبل المحل.";
  if (/ما نوع الجملة/.test(text)) context = "عرفنا أنها جملة، فنحدد صورتها قبل الحكم على محلها.";
  if (/هل سبق بأداة/.test(text)) context = "قبل تحديد الحالة نفحص ما قبل الفعل.";
  // في عقدة الأفعال الخمسة نحافظ على المصطلح المدرسي، والشرح يظهر في السطر المساعد لا في الخيارات.
  if (/هل اتصل/.test(text)) context = "الاتصال يغير علامة البناء أو الإعراب، لذلك نفحصه الآن.";

  text = cleanQuestionText({ ...node, text });
  context = currentStepIntro({ ...node, text }, []);

  const answers = (node.answers || []).map((a: any) => {
    const isFive = isFiveVerbDecision(node);
    const yesLike = a.eval?.anyOf || a.eval?.equals === true || String(a.text || "").trim().startsWith("نعم");
    const noLike = a.eval?.equals === false || a.eval?.equals === "none" || String(a.text || "").trim() === "لا" || String(a.text || "").trim().startsWith("لا");
    return {
      ...a,
      text: isFive ? (yesLike && !noLike ? "نعم" : "لا") : a.text,
      hint: a.hint || makeDecisionHint(a.text, text),
    };
  });
  return { ...node, context, text, hint, answers };
}


function isFiveVerbDecision(node: any) {
  const id = String(node?.id || "");
  const text = String(node?.text || "");
  return ["raf3_five", "nasb_five", "jazm_five"].includes(id) || text.includes("الأفعال الخمسة");
}

function dialogueQuestionText(node: any, target?: string, mode: Mode = "learn", state?: any, tree?: any, title?: string) {
  if (state && tree) return openingDialogueLine(tree, node, state, title);
  const id = String(node?.id || "");
  const clean = cleanQuestionText(node);
  const t = target || "الكلمة المحددة";
  if (isFiveVerbDecision(node)) {
    return `يا بني، هل الفعل (${t}) من الأفعال الخمسة (وهي أفعال مضارعة اتصلت بألف الاثنين أو ياء المخاطبة أو واو الجماعة)؟`;
  }
  const lead = mode === "learn" ? "يا بني، لنفكر بهدوء:" : "لنفكر بهدوء:";
  return `${lead} ${clean}`;
}

function dialogueQuestionNote(node: any) {
  return "";
}

function stageOneDragInstruction(node: any, state: any) {
  const target = String(state?.currentTarget || "الكلمة");
  if (isFiveVerbDecision(node)) return `اسحب «نعم» إذا كان (${target}) من الأفعال الخمسة، أو «لا» إذا لم يكن كذلك.`;
  const id = String(node?.id || "");
  if (id.includes("nun") || id.includes("built") || id.includes("binaa")) return `اسحب الإجابة التي تثبت هل خرج (${target}) إلى البناء أم بقي في طريق الإعراب.`;
  if (id.includes("tool")) return `اسحب الإجابة التي تصف أثر ما قبل (${target}).`;
  if (id.includes("ending") || id.includes("weak")) return `اسحب الوصف المناسب لآخر (${target}).`;
  return "اسحب الاختيار المناسب إلى المربع، أو اضغط عليه مباشرة إذا كنت تستخدم الهاتف.";
}

function answerDragLabel(mode: Mode) {
  return mode === "learn" ? "اسحبني" : "اختر";
}

function answerEffectLabel(node: any, answer: any, state: any) {
  const id = String(node?.id || "");
  const text = String(answer?.text || "").trim();
  const yes = text.startsWith("نعم") || answer?.eval?.equals === true || Array.isArray(answer?.eval?.anyOf);
  const no = text === "لا" || text.startsWith("لا") || answer?.eval?.equals === false || answer?.eval?.equals === "none";

  // المضارع: نبني الحكم بالتدريج داخل مربع النتيجة.
  if (id === "present_nun_niswa") return yes ? "مبني: اتصل بنون النسوة" : "بقي في مسار الإعراب";
  if (id === "present_nun_tawkid") return yes ? "مبني: اتصل بنون التوكيد" : "معرب: لا نون نسوة ولا نون توكيد";
  if (id === "present_has_tool") return yes ? "يوجد عامل قبل الفعل" : "مرفوع: لم يسبقه ناصب أو جازم";
  if (id === "present_tool_type") {
    if (text.includes("ناصب")) return "منصوب: سبقته أداة نصب";
    if (text.includes("جازم")) return "مجزوم: سبقته أداة جزم";
  }
  if (isFiveVerbDecision(node)) return yes && !no ? "من الأفعال الخمسة" : "ليس من الأفعال الخمسة";
  if (id.includes("ending")) {
    if (text.includes("صحيح")) return "صحيح الآخر";
    if (text.includes("معتل")) return "معتل الآخر";
  }
  if (id.includes("weak")) return `آخره ${text}`;

  // الماضي: الفعل مبني دائمًا، لكن علامة البناء تتغير بحسب الاتصال.
  if (id === "past_has_pronoun") return yes && !no ? "اتصل بضمير" : "مبني على الفتح";
  if (id === "past_is_waw") return yes && !no ? "مبني على الضم" : "ليس واو الجماعة";
  if (id === "past_is_sukoon_set") return yes && !no ? "مبني على السكون" : "نبحث عن اتصال آخر";
  if (id === "past_sukoon_type") return text;
  if (id === "past_is_alif") return yes && !no ? "مبني على الفتح" : "مبني على الفتح";

  // الأمر: مبني دائمًا، والمؤثر يحدد علامة البناء.
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
    const n = nodes[nodeId as string];
    const a = n?.answers?.find((x: any) => x.id === answerId);
    const label = answerEffectLabel(n, a, state);
    if (label && !pieces.includes(label)) pieces.push(label);
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

function topicKindForDialogue(tree: any, title?: string) {
  const start = String(tree?.startNodeId || "");
  const t = String(title || "");
  if (start.includes("present")) return "فعلًا مضارعًا";
  if (start.includes("past")) return "فعلًا ماضيًا";
  if (start.includes("imp")) return "فعل أمر";
  if (t.includes("المبتدأ") || t.includes("الخبر") || start.includes("mubtada") || start.includes("khabar") || start.includes("nominal")) return "كلمة في الجملة الاسمية";
  if (t.includes("كان")) return "عنصرًا في باب كان وأخواتها";
  if (t.includes("إن")) return "عنصرًا في باب إن وأخواتها";
  if (t.includes("الفاعل")) return "فاعلًا أو ما يدل عليه";
  if (t.includes("المفعول")) return "مفعولًا به";
  return "الكلمة المحددة";
}

function openingDialogueLine(tree: any, node: any, state: any, title?: string) {
  const sentence = sentenceForDialogue(state);
  const target = targetForDialogue(state);
  const start = String(tree?.startNodeId || "");
  const nodeId = String(node?.id || "");
  const kind = topicKindForDialogue(tree, title);

  if (start.includes("present")) {
    if (nodeId === "present_nun_niswa") {
      return `يا بني، لكي نعرب الفعل المضارع تكون أول خطوة أن نتحقق: هل هو مبني أم معرب؟ نبدأ بالفعل (${target}): هل اتصل بنون النسوة؟`;
    }
    if (nodeId === "present_nun_tawkid") {
      return `نكمل التفكير بسؤال قصير يا بني: هل اتصل الفعل (${target}) بنون التوكيد؟`;
    }
    if (nodeId === "present_has_tool") {
      return `بما أن الفعل (${target}) بقي في طريق الإعراب، نسأل الآن: هل سبقته أداة نصب أو جزم؟`;
    }
    if (nodeId === "present_tool_type") {
      return `وجدنا عاملًا قبل الفعل (${target}). هل هذا العامل ناصب أم جازم؟`;
    }
    if (isFiveVerbDecision(node)) {
      return `يا بني، هل الفعل (${target}) من الأفعال الخمسة (وهي أفعال مضارعة اتصلت بألف الاثنين أو ياء المخاطبة أو واو الجماعة)؟`;
    }
    if (nodeId.includes("ending")) {
      return `اقتربنا يا بني، بعد أن استبعدنا الأفعال الخمسة ننظر إلى آخر الفعل (${target}): هل هو صحيح الآخر أم معتل الآخر؟`;
    }
    if (nodeId.includes("weak")) {
      return `ننظر إلى آخر الفعل (${target}) في جملة ${sentence}: ما حرف العلة الذي انتهى به؟`;
    }
  }

  if (start.includes("past")) {
    if (nodeId === "past_has_pronoun") return `أولًا يا بني، لكي نعرب فعلًا ماضيًا في جملة ${sentence} ننظر إلى الفعل (${target}): هل اتصل به ضمير؟`;
    if (nodeId === "past_is_waw") return `عرفنا أن الفعل (${target}) اتصل بضمير. هل هذا الضمير هو واو الجماعة؟`;
    if (nodeId === "past_is_sukoon_set") return `لم تكن واو الجماعة، فنفحص الفعل (${target}): هل اتصل بتاء الفاعل أو نا الفاعلين أو نون النسوة؟`;
    if (nodeId === "past_sukoon_type") return `وصلنا إلى السكون، والآن نحدد الضمير المتصل بالفعل (${target}) ليصبح الإعراب أدق.`;
    if (nodeId === "past_is_alif") return `بقي احتمال أخير في الفعل (${target}): هل اتصل بألف الاثنين؟`;
  }

  if (start.includes("imp")) {
    if (nodeId === "imp_nun_tawkid") return `أولًا يا بني، لكي نعرب فعل أمر في جملة ${sentence} ننظر إلى الفعل (${target}): هل اتصل بنون التوكيد؟`;
    if (nodeId === "imp_five") return `لم يتصل الفعل (${target}) بنون التوكيد، فنسأل: هل اتصل بألف الاثنين أو ياء المخاطبة أو واو الجماعة؟`;
    if (nodeId === "imp_ending") return `بعد استبعاد نون التوكيد والاتصال المؤثر، ننظر إلى آخر فعل الأمر (${target}): هل هو صحيح الآخر أم معتل الآخر؟`;
  }

  return `أولًا يا بني، لكي نعرب ${kind} في جملة ${sentence} نركز على (${target}) ونسأل بهدوء: ${cleanQuestionText(node)}`;
}

function studentHintText(node: any, picked?: any, state?: any) {
  const id = String(node?.id || "");
  const target = state?.currentTarget || "الفعل";

  if (id === "past_has_pronoun") {
    return `جرّب الإسناد إلى (هو): إذا تغيّر شكل الفعل عند قولك: هو ${String(target || "كتب").replace(/[ًٌٍَُِّْ]/g, "")}، فغالبًا كان في الكلمة ضمير متصل. مثال: كتبتُ ← هو كتب؛ إذن التاء ضمير.`;
  }
  if (id === "past_is_sukoon_set" || id === "past_sukoon_type") {
    return "فكّر هكذا: تاء الفاعل ونا الفاعلين ونون النسوة تجعل الماضي مبنيًا على السكون. جرّب فصل الضمير: كتبتُ ← كتبَ.";
  }  if (isFiveVerbDecision(node)) {
    return `فكّر هكذا: الأفعال الخمسة لا نعرفها من المعنى، بل من الاتصال. هل ${target} اتصل بألف الاثنين أو ياء المخاطبة أو واو الجماعة؟`;
  }
  if (id === "present_nun_niswa") return `فكّر هكذا: نون النسوة تجعل المضارع مبنيًا. انظر إلى آخر ${target}: هل فيه نون النسوة فعلًا؟`;
  if (id === "present_nun_tawkid") return `فكّر هكذا: بعد نون النسوة نفحص نون التوكيد. هل آخر ${target} نون مشددة أو نون توكيد خفيفة؟`;
  if (id === "present_has_tool") return `فكّر هكذا: إذا لم نجد علامة بناء، نبحث قبل الفعل عن أداة نصب أو جزم مثل: لن، أن، كي، لم.`;
  if (id === "present_tool_type") return "فكّر هكذا: لن/أن/كي أدوات نصب، ولم/لا الناهية/لام الأمر أدوات جزم.";
  if (id.includes("ending")) return `فكّر هكذا: بعد استبعاد الأفعال الخمسة ننظر إلى آخر ${target}: هل ينتهي بحرف علة أم بحرف صحيح؟`;
  if (id.includes("weak")) return "فكّر هكذا: الألف غالبًا تعذر، والواو أو الياء تحتاجان تدقيقًا بحسب الحالة.";
  return String(picked?.hint || node?.hint || "فكّر في السؤال الحالي فقط، ولا تقفز إلى الإعراب النهائي.").replace(/^💡\s*/, "").trim();
}

function teacherSuccessText(node: any, picked: any, state: any, piece?: string) {
  const id = String(node?.id || "");
  if (id === "present_nun_niswa") {
    return state?.facts?.nunNiswa ? "صحيح؛ اتصلت نون النسوة، إذن خرج الفعل من الإعراب إلى البناء." : "صحيح؛ لم تتصل نون النسوة، فلا نحكم بالبناء هنا ونفحص نون التوكيد.";
  }
  if (id === "present_nun_tawkid") {
    return state?.facts?.nunTawkid ? "صحيح؛ اتصلت نون التوكيد، إذن يكون المضارع مبنيًا على الفتح." : "صحيح؛ لا نون نسوة ولا نون توكيد، إذن ننتقل للإعراب.";
  }
  if (id === "present_has_tool") {
    return state?.facts?.hasTool ? "صحيح؛ وجدنا عاملًا قبل المضارع، والآن نحدد: ناصب أم جازم؟" : "صحيح؛ لا ناصب ولا جازم، إذن الفعل مرفوع وننتقل لاختيار العلامة.";
  }
  if (id === "present_tool_type") {
    return state?.facts?.tool === "nasb" ? "صحيح؛ الأداة ناصبة، إذن نبحث عن علامة النصب." : "صحيح؛ الأداة جازمة، إذن نبحث عن علامة الجزم.";
  }
  if (isFiveVerbDecision(node)) {
    return state?.facts?.attached === "none" ? "صحيح؛ ليس من الأفعال الخمسة، لذلك لا نستعمل حذف النون أو ثبوتها هنا." : "صحيح؛ هو من الأفعال الخمسة، لذلك تكون علامته ثبوت النون أو حذفها بحسب الحالة.";
  }
  if (id.includes("ending")) return state?.facts?.ending === "weak" ? "صحيح؛ الفعل معتل الآخر، لذلك ننتبه للعلامة المقدّرة أو حذف حرف العلة." : "صحيح؛ الفعل صحيح الآخر، فغالبًا تظهر العلامة بوضوح.";
  if (id.includes("weak")) return "صحيح؛ نوع حرف العلة هو الذي يحدد التعذر أو الثقل أو ظهور الفتحة.";
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
    if (id.includes("five")) return "attached";
    if (id.includes("ending") || id.includes("weak")) return "weak";
    if (text.includes("حذف النون")) return "noon";
    return "built";
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
  const router = useRouter();
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
  const [activeGlossary, setActiveGlossary] = React.useState<string | null>(null);
  const [dialogBubble, setDialogBubble] = React.useState<{ tone: "success" | "hint" | "celebrate"; text: string } | null>(null);
  const [microCelebrate, setMicroCelebrate] = React.useState(0);
  const [microCelebrateAnswerId, setMicroCelebrateAnswerId] = React.useState<string | null>(null);
  const [cardPhase, setCardPhase] = React.useState<"idle" | "success" | "leaving" | "entering">("idle");
  const [dropOver, setDropOver] = React.useState(false);
  const [droppedChoice, setDroppedChoice] = React.useState<{ text: string; tone: "idle" | "ok" | "bad" } | null>(null);
  const workAreaRef = React.useRef<HTMLElement | null>(null);

  function bringWorkAreaIntoView(mode: "soft" | "center" = "soft") {
    window.setTimeout(() => {
      workAreaRef.current?.scrollIntoView({
        behavior: "smooth",
        block: mode === "center" ? "center" : "start",
        inline: "nearest",
      });
    }, 40);
  }

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
    setMicroCelebrateAnswerId(null);
    setDropOver(false);
    setDroppedChoice(null);
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
  const doneCount = coverageKeysOrdered.filter((k) => covered[k]).length;
  const coveredPercent = calcPercent(covered, coverageKeysOrdered);
  const isDone = coveredPercent >= 100;
  const nextStageReady = mode === "learn" ? learnReady || coveredPercent >= 100 : mode === "practice" ? practiceReady || coveredPercent >= 100 : false;
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

  const visibleResultPieces = buildVisibleResultDraft(tree, state, thinkingNode, droppedChoice);
  const completedStepCards = buildVisibleResultDraft(tree, state, thinkingNode, null);
  const latestStepResult = droppedChoice?.tone === "bad"
    ? "حاول مرة أخرى"
    : (droppedChoice?.text || visibleResultPieces[visibleResultPieces.length - 1] || "");
  const answeredStepCount = Object.keys(state?.answers || {}).length;
  const stepKickerText = answeredStepCount > 0
    ? `نكمل إعراب (${state.currentTarget || "الكلمة"}) في المثال نفسه`
    : `نبدأ الرحلة مع (${state.currentTarget || "الكلمة"}) خطوة خطوة`;
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

    // مهم جدًا: لا نرسل percent = 0 في التدريب أو المرحلة النهائية؛ لأن ذلك يمسح نسبة الالمرحلة الأولى.
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
    setDropOver(false);
    setDroppedChoice(null);
    setCardPhase("idle");
    setState(buildRunnerState(tree, mode, examples[pickNextExampleIndex(examples, coverageKeysOrdered, nextCovered, currentIdx)]));
  }

  function resetTraining() {
    const empty = buildEmptyCovered(coverageKeysOrdered);
    setCovered(empty);
    setExampleIndex(0);
    setFeedback(null);
    setDropOver(false);
    setDroppedChoice(null);
    setCardPhase("idle");
    setState(buildRunnerState(tree, mode, examples[0]));
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
    const picked = node?.answers?.find((a: any) => a.id === answerId);
    const effect = answerEffectLabel(thinkingNode, picked, state) || label || "الإجابة المختارة";
    setDroppedChoice({ text: effect, tone: "idle" });
    window.setTimeout(() => handlePick(answerId), 10);
  }

  function handlePick(answerId: string) {
    if (!node || node.type !== "question" || mode === "quiz" || cardPhase !== "idle") return;

    const picked = node.answers.find((a: any) => a.id === answerId);
    const correctAnswer = node.answers.find((a: any) => isAnswerCorrect(a));
    const ok = isAnswerCorrect(picked);

    if (!ok) {
      const isBuiltTypeNode = String(node?.id || "").includes("built_type") || String(node?.id || "").includes("mabniType");
      const expectedBuiltType = state.facts?.mabniType;
      const smartHint = isBuiltTypeNode
        ? builtNounTypeHintByValue(expectedBuiltType)
        : studentHintText(thinkingNode, picked, state);
      setDialogBubble({ tone: "hint", text: smartHint || "فكّر في السؤال الحالي فقط، ثم اختر مرة أخرى." });
      setDroppedChoice((prev) => prev ? { ...prev, tone: "bad" } : null);
      bringWorkAreaIntoView("center");
      if (mode === "practice") {
        setFeedback({ wrongId: answerId, hint: smartHint });
      } else {
        setFeedback({ wrongId: answerId, correctId: correctAnswer?.id, hint: smartHint });
      }
      return;
    }

    const res = chooseAnswer({ state, tree, answerId } as any);
    const piece = normalizeBuildPiece(picked?.text || "", node?.id || "");
    const msg = teacherSuccessText(thinkingNode, picked, state, piece);
    setDialogBubble({ tone: "success", text: msg });
    const effectLabel = answerEffectLabel(thinkingNode, picked, state);
    setDroppedChoice((prev) => prev ? { text: prev.text || effectLabel, tone: "ok" } : { text: effectLabel || String(picked?.text || "صحيح"), tone: "ok" });
    setMicroCelebrateAnswerId(answerId);
    setMicroCelebrate((n) => n + 1);
    setCardPhase("success");
    bringWorkAreaIntoView("center");
    window.setTimeout(() => {
      setCardPhase("leaving");
    }, 460);
    window.setTimeout(() => {
      setState(res.nextState);
      setDroppedChoice(null);
      setCardPhase("entering");
    }, 1120);
    window.setTimeout(() => {
      setCardPhase("idle");
      setMicroCelebrate((n) => Math.max(0, n - 1));
      setMicroCelebrateAnswerId(null);
    }, 1720);
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
      actualOptionReason: actualLabel ? (quizExample?.optionReasons?.[actualLabel] || explainDistractor(actualLabel, expectedLabel)) : undefined,
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

  const topicName = extractTopicName(title);
  const stageTitle = stageLearningTitle(stageMeta.badge, title);
  const i3rabDraft = buildI3rabDraft(tree, state, state.currentTarget);
  const i3rabTokens = i3rabTokensFromDraft(i3rabDraft);

  return (
    <div className="exercise-page-shell">
      <section className="exercise-hero-card card card-glow">
        <div className="exercise-hero-main">
          <span className="exercise-badge stage-learning-badge">{stageTitle}</span>
          {stageMeta.subtitle ? <p className="exercise-page-subtitle">{stageMeta.subtitle}</p> : null}
          {mode !== "quiz" && (
            <div className="exercise-meta-inline">
              <span className="pill pill-accent">المنجَز: {doneCount} / {totalCount}</span>
              <span className="pill">نتابع: {stepLabels?.[stepLabel] || stepLabel}</span>
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

      {mode !== "quiz" && isDone && (
        <section className="exercise-complete-banner">
          <div>
            <strong>{mode === "learn" ? "اكتملت المرحلة الأولى" : "اكتملت المرحلة الثانية"}</strong>
            <p>{mode === "learn" ? "انتقل الآن إلى المرحلة الثانية." : "انتقل الآن إلى المرحلة النهائية."}</p>
          </div>
          <button onClick={resetTraining} style={ghostBtn}>
            {mode === "learn" ? "إعادة المرحلة الأولى" : "إعادة المرحلة الثانية"}
          </button>
        </section>
      )}

      {quizFinished ? (
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

          <button onClick={restartQuiz} style={ghostBtn}>إعادة المرحلة النهائية</button>
        </section>
      ) : mode === "quiz" ? (
        <>
          <section className="exercise-panel exercise-sentence-panel" style={box}>
            <div style={{ opacity: 0.6, marginBottom: 6 }}>السؤال {quizCursor + 1} من {quizOrder.length}</div>
            <div style={{ opacity: 0.6, marginBottom: 6 }}>الجملة:</div>
            <div className="exercise-sentence">{renderSentence((example as QuizExampleLike)?.sentence, (example as QuizExampleLike)?.target)}</div>
            <div style={{ fontSize: 18, lineHeight: 1.9, marginTop: 10 }}>{enrichQuizPrompt((example as QuizExampleLike)?.prompt)}</div>
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
            {node?.type === "question" && completedStepCards.length > 0 ? (
              <div className="sequential-step-trail" aria-label="نتائج الخطوات السابقة">
                {completedStepCards.map((piece, idx) => (
                  <React.Fragment key={`${piece}-${idx}`}>
                    <div className="sequential-mini-card">{piece}</div>
                    {idx < completedStepCards.length - 1 ? <div className="sequential-arrow">↓</div> : null}
                  </React.Fragment>
                ))}
              </div>
            ) : null}

            {node?.type === "question" ? (
              <div
                className={`clean-question-block sequential-active-card ${dropOver ? "is-drop-over" : ""} phase-${cardPhase}`}
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
                {microCelebrate > 0 ? <span className="micro-success-pop" aria-hidden="true">✓</span> : null}
                <div className="clean-question-kicker">{stepKickerText}</div>
                <div className="sequential-sentence-line" aria-label="الجملة">
                  <span className="dialogue-label">في الجملة:</span>
                  <span className="dialogue-sentence-text">{renderSentence(state.currentSentence, state.currentTarget)}</span>
                </div>
                <div className="exercise-question-title clean-question-title">{renderSmartText(dialogueQuestionText(thinkingNode, state.currentTarget, mode, state, tree, title), setActiveGlossary)}</div>
                {dialogueQuestionNote(thinkingNode) ? <div className="dialogue-question-note">{dialogueQuestionNote(thinkingNode)}</div> : null}


                <div className="clean-answer-grid stage-one-draggable-grid">
                  {thinkingNode.answers.map((a: any) => {
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
                        onClick={() => {
                          if (mode === "learn") setDroppedChoice({ text: answerEffectLabel(thinkingNode, a, state), tone: "idle" });
                          handlePick(a.id);
                        }}
                        className={answerClass}
                        style={answerBtn}
                      >
                        {microCelebrateAnswerId === a.id && microCelebrate > 0 ? (
                          <>
                            <span className="micro-success-inline" aria-hidden="true">✓</span>
                            <span className="micro-success-burst" aria-hidden="true">أحسنت!</span>
                          </>
                        ) : null}
                        {mode === "learn" ? <span className="answer-drag-mini">{answerDragLabel(mode)}</span> : null}
                        <span className="answer-main-text">{renderSmartText(a.text, setActiveGlossary)}</span>
                      </button>
                    );
                  })}
                </div>

                {latestStepResult ? (
                  <div className={`sequential-live-result ${droppedChoice?.tone === "bad" ? "is-bad" : droppedChoice?.tone === "ok" ? "is-ok" : ""}`} aria-live="polite">
                    <span>{latestStepResult}</span>
                  </div>
                ) : null}

                <div className="clean-question-nav" style={{ marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={() => {
                      const smartHint = studentHintText(thinkingNode, null, state);
                      setDialogBubble({ tone: "hint", text: smartHint || "فكّر في السؤال الحالي فقط، ثم اختر مرة أخرى." });
                      bringWorkAreaIntoView("center");
                    }}
                    style={ghostBtn}
                  >
                    أحتاج تلميح
                  </button>
                </div>

                {dialogBubble ? (
                  <button type="button" className={`thinking-bubble ${dialogBubble.tone}`} onClick={() => setDialogBubble(null)} aria-label="إغلاق فقاعة التوجيه">
                    <span className="thinking-bubble-title">{dialogBubble.tone === "hint" ? "فكّر معي" : dialogBubble.tone === "celebrate" ? "اكتمل المسار" : "خطوة صحيحة"}</span>
                    <span className="thinking-bubble-text">{dialogBubble.text}</span>
                    <span className="thinking-bubble-close">فهمت</span>
                  </button>
                ) : null}

                <div className="clean-question-nav">
                  <button type="button" onClick={() => { setFeedback(null); setDialogBubble(null); setState(buildRunnerState(tree, mode, example)); }} style={ghostBtn}>إعادة المثال</button>
                </div>
                <ProgressDots total={totalCount || examples.length} done={doneCount} current={Math.min(doneCount, Math.max(0, (totalCount || examples.length) - 1))} />
              </div>
            ) : node?.type === "result" ? (
              <div className="clean-result-block">
                <button type="button" className="thinking-bubble celebrate" onClick={() => setDialogBubble(null)} aria-label="إغلاق فقاعة التعزيز">
                  <span className="thinking-bubble-title">اكتمل المسار</span>
                  <span className="thinking-bubble-text">لاحظ كيف صعدت الخطوات واحدة واحدة حتى وصلنا للإعراب. الآن جرّب مثالًا جديدًا بثقة.</span>
                  <span className="thinking-bubble-close">تمام</span>
                </button>
                <div className="clean-final-label">الإعراب النهائي</div>
                <div className="exercise-result-text clean-result-text" style={{ whiteSpace: "pre-line" }}>{renderSmartText(thinkingNode?.text, setActiveGlossary)}</div>

                <div className="i3rab-builder-strip final-builder-strip" aria-label="لوحة النتيجة المجمعة">
                  <span className="builder-label">النتيجة المجمعة</span>
                  <span className="builder-target">{state.currentTarget || "الكلمة"}</span>
                  <span className="builder-colon">:</span>
                  {i3rabTokens.length ? (
                    <span className="builder-tokens">
                      {i3rabTokens.map((token, idx) => (
                        <span key={`${token}-${idx}`} className="builder-token">{token}</span>
                      ))}
                    </span>
                  ) : (
                    <span className="builder-placeholder">اكتملت خطوات التفكير</span>
                  )}
                </div>

                {currentFollowUp ? (
                  <div className="exercise-followup-box clean-followup-box">
                    <div className="clean-followup-title">تثبيت سريع: {currentFollowUp.question}</div>
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

                <button
                  onClick={goNextExample}
                  className="next-example-glow"
                  style={{ ...primaryNavBtn, opacity: canMoveAfterResult ? 1 : 0.55, cursor: canMoveAfterResult ? "pointer" : "not-allowed" }}
                  disabled={!canMoveAfterResult}
                >
                  مثال جديد يكشف خطوة أخرى ←
                </button>
                <ProgressDots total={totalCount || examples.length} done={Math.min(doneCount + 1, totalCount || examples.length)} current={doneCount} />
              </div>
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
                    setToast(mode === "learn" ? "أكمل المرحلة الأولى أولًا" : "أكمل المرحلة الثانية أولًا");
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
