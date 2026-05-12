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
  "العامل": { title: "العامل", body: ["كلمة أو معنى يؤثر في إعراب ما بعده.", "مثال: لم عامل جزم، وإنّ عامل نصب، وحرف الجر عامل جر."] },
  "المعرب": { title: "المعرب", body: ["تتغير علامة آخره حسب موقعه في الجملة.", "مثال: الطالبُ، الطالبَ، الطالبِ."] },
  "المبني": { title: "المبني", body: ["يلزم صورة واحدة ولا تتغير حركة آخره.", "نعربه في محل رفع أو نصب أو جر حسب موقعه."] },
  "ضمير الفصل": { title: "ضمير الفصل", body: ["ضمير يفصل بين المبتدأ والخبر ولا يكون له محل إعرابي غالبًا.", "مثال: الطالب هو المجتهد."] },
  "ضمير نصب منفصل": { title: "ضمير نصب منفصل", body: ["مثل: إياك، إياه، إيانا، إياهم.", "يقع غالبًا في محل نصب مفعول به إذا وقع عليه الفعل."] },
  "ضمائر الرفع المتصلة": { title: "ضمائر الرفع المتصلة", body: ["مثل: تاء الفاعل، نا الفاعلين، واو الجماعة، ألف الاثنين، نون النسوة.", "تتصل بالفعل وتكون في محل رفع فاعل غالبًا."] },
  "ضمائر النصب المتصلة": { title: "ضمائر النصب المتصلة", body: ["مثل: الهاء، الكاف، ياء المتكلم، نا المفعولين.", "إذا وقع عليها الفعل تكون في محل نصب مفعول به."] },

};

function renderSmartText(text?: string, onTerm?: (term: string) => void) {
  if (!text) return null;
  const terms = Object.keys(SMART_GLOSSARY).sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");
  const parts = String(text).split(pattern);
  return parts.map((part, idx) => {
    if (SMART_GLOSSARY[part]) {
      return (
        <button key={`${part}-${idx}`} type="button" className="smart-term smart-term-soft" onClick={() => onTerm?.(part)} aria-label={`توضيح: ${part}`}>
          {part}
        </button>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

function plainText(text?: string) {
  return String(text || "");
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
  if (t.includes("قام بالفعل")) return "فاعل";
  if (t.includes("وقع عليها الفعل") || t.includes("وقع عليه الفعل")) return "مفعول به";
  if (t.includes("اسم معرب")) return "اسم معرب";
  if (t.includes("اسم مبني")) return "اسم مبني";
  if (t.includes("مصدر مؤول")) return "مصدر مؤول";
  if (t.includes("سبق بعامل نصب")) return "منصوب";
  if (t.includes("سبق بعامل جزم")) return "مجزوم";
  if (t.includes("لم يسبق بعامل")) return "مرفوع";
  if (t.includes("نعم، اتصل بأحدها")) return "اتصل بضمير";
  if (t.includes("لم يتصل بأحدها")) return "لم يتصل بضمير";
  if (t.includes("واو الجماعة")) return "اتصل بواو الجماعة";
  if (t.includes("ياء المخاطبة")) return "اتصل بياء المخاطبة";
  if (t.includes("ألف الاثنين")) return "اتصل بألف الاثنين";
  if (t.includes("حذف النون")) return t.includes("جزم") ? "وعلامة جزمه حذف النون" : (t.includes("نصب") ? "وعلامة نصبه حذف النون" : "وعلامته حذف النون");
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
  if (id.includes("tense")) return "لنحدد الزمن من معنى الكلمة قبل أي علامة.";
  if (id.includes("has_tool")) return "ننظر الآن إلى ما قبل الكلمة: هل هناك عامل؟";
  if (id.includes("check_attached")) return "ننظر إلى آخر الفعل: هل اتصل به ضمير؟";
  if (id.includes("ending") || id.includes("weak_type")) return "ننظر إلى آخر الكلمة فقط لنحدد العلامة.";
  if (id.includes("pronoun")) return "نوع الضمير يساعدنا على بناء النتيجة.";
  return "لنأخذها بهدوء: نختار قرارًا واحدًا فقط.";
}



function makeDecisionHint(answerText?: string, nodeText?: string) {
  const a = String(answerText || "");
  const q = String(nodeText || "");
  if (a.includes("اسم") && q.includes("نوع الكلمة")) return "تذكّر: الاسم يقبل الجر أو التنوين غالبًا.";
  if (a.includes("فعل") && q.includes("نوع الكلمة")) return "تذكّر: الفعل يدل على حدث وزمن.";
  if (a.includes("ماض")) return "الفعل الماضي يقبل تاء الفاعل أو تاء التأنيث غالبًا.";
  if (a.includes("مضارع")) return "الفعل المضارع يبدأ غالبًا بأحد أحرف: أ، ن، ي، ت.";
  if (a.includes("العلامة") || a.includes("مباشرة")) return "لا نقفز للعلامة قبل تحديد الحالة والسبب.";
  if (a.includes("الخبر")) return "الخبر يخص الجملة الاسمية، وليس هذه الخطوة.";
  if (a.includes("الفاعل")) return "نحدد نوع الكلمة والزمن أو الموقع أولًا.";
  if (a.includes("دائم")) return "لا توجد حالة دائمة؛ الأداة والاتصال يغيّران القرار.";
  if (q.includes("اسم مبني") || a.includes("معرب")) return "اسأل: هل تتغير حركة آخر الكلمة أم هي ثابتة؟";
  if (q.includes("آخر") || a.includes("معتل")) return "انظر إلى آخر الكلمة فقط، ولا تقفز للإعراب النهائي.";
  return "ارجع خطوة: ماذا عرفنا؟ ثم اختر القرار التالي فقط.";
}

function normalizeThinkingNode(node: any, state: any) {
  if (!node || node.type !== "question") return node;
  const id = String(node.id || "");
  let context = String(node.context || getNodeContext(node, state));
  let text = String(node.text || "ما القرار التالي؟");
  let hint = shortStudentText(node.hint, "اختر القرار التالي فقط.");

  // تحويل أي صياغة مباشرة إلى صياغة عقدة تفكير.
  if (/إعراب|الإعراب الصحيح/.test(text)) text = "ما القرار الذي يوصلنا للإعراب؟";
  if (/هل هو:|هل هي:|إذا كان/.test(text)) text = text.replace(/^إذا كان\s*/,'').replace(/^الآن:\s*/,'ما التصنيف المناسب الآن؟ ');
  if (/ما حالة آخر/.test(text)) context = "عرفنا التصنيف، والآن نفحص آخر الكلمة لاختيار العلامة.";
  if (/ما نوع الاسم المبني/.test(text)) context = "عرفنا أنها كلمة مبنية، فنحدد نوعها قبل المحل.";
  if (/ما نوع الجملة/.test(text)) context = "عرفنا أنها جملة، فنحدد صورتها قبل الحكم على محلها.";
  if (/هل سبق بأداة/.test(text)) context = "قبل تحديد الحالة ننظر إلى الكلمة السابقة للفعل.";
  if (/الأفعال الخمسة/.test(text)) text = "هل اتصل الفعل بواو الجماعة أو ألف الاثنين أو ياء المخاطبة؟";
  if (/هل اتصل/.test(text)) context = "ننظر إلى آخر الفعل: هل اتصل به ضمير؟";

  const answers = (node.answers || []).map((a: any) => ({
    ...a,
    hint: a.hint || makeDecisionHint(a.text, text),
  }));
  return { ...node, context, text, hint, answers };
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
    setActiveGlossary(null);
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
        ? builtNounTypeHintByValue(expectedBuiltType)
        : shortStudentText(picked?.hint ?? node?.hint);
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

  return (
    <div className="exercise-page-shell">
      <section className="exercise-hero-card card card-glow">
        <div className="exercise-hero-main">
          <span className="exercise-badge">{stageMeta.badge}</span>
          <h1 className="exercise-page-title">{title}</h1>
          {stageMeta.subtitle ? <p className="exercise-page-subtitle">{stageMeta.subtitle}</p> : null}
          
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
        <section className="exercise-complete-banner clean-complete-banner">
          <div>
            <strong>{mode === "learn" ? "أحسنت، اكتملت المرحلة الأولى" : "أحسنت، اكتملت المرحلة الثانية"}</strong>
            <p>{mode === "learn" ? "الخطوة التالية واضحة الآن: انتقل إلى المرحلة الثانية." : "الخطوة التالية واضحة الآن: انتقل إلى المرحلة النهائية."}</p>
          </div>
          <div className="complete-actions">
            <button className="stage-next-button ready-strong" onClick={() => router.push(`${stageMeta.nextHrefPrefix}${topicId}`)} style={primaryNavBtn}>
              {stageMeta.nextLabel || "الانتقال"}
            </button>
            <button onClick={resetTraining} style={ghostBtn}>
              {mode === "learn" ? "إعادة المرحلة الأولى" : "إعادة المرحلة الثانية"}
            </button>
          </div>
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
      ) : isDone && mode !== "quiz" ? null : mode === "quiz" ? (
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
          <section className="exercise-panel exercise-core-card" style={box}>
            <div className="core-task-line core-task-clean">
              <span className="task-kicker">لننظر إلى الجملة:</span>
              <strong className="task-sentence">{renderSentence(state.currentSentence, state.currentTarget)}</strong>
              <span className="task-helper">الكلمة التي تحتها خط هي محور التفكير. نصل إلى إعرابها خطوة خطوة.</span>
            </div>

            {buildI3rabDraft(tree, state, state.currentTarget) !== "ابدأ بتحديد نوع الكلمة" || node?.type === "result" ? (
              <div className="i3rab-builder-line clean-builder" aria-label="بناء الإعراب">
                <span className="builder-label">مسار التفكير:</span>
                <span className="builder-value">{node?.type === "result" ? renderSmartText(firstLine(node.text), setActiveGlossary) : renderSmartText(buildI3rabDraft(tree, state, state.currentTarget), setActiveGlossary)}</span>
              </div>
            ) : null}

            {node?.type === "question" ? (
              <div className="core-question-block">
                <div className="exercise-node-context slim-context">{renderSmartText(thinkingNode?.context, setActiveGlossary)}</div>
                <div className="exercise-question-title compact-question-title">{plainText(thinkingNode?.text)}</div>
                <div className="core-answer-grid">
                  {thinkingNode.answers.map((a: any) => {
                    const answerClass = [
                      "exercise-answer-btn",
                      "core-answer-btn",
                      mode === "learn" && feedback?.correctId === a.id ? "is-correct" : "",
                      feedback?.wrongId === a.id ? "is-wrong" : "",
                    ].filter(Boolean).join(" ");
                    return (
                      <button key={a.id} onClick={() => handlePick(a.id)} className={answerClass} style={answerBtn}>
                        {a.text}
                      </button>
                    );
                  })}
                </div>

                {mode === "learn" && feedback?.wrongId && <div className="exercise-inline-hint">💡 {renderSmartText(shortStudentText(feedback?.hint ?? thinkingNode?.hint, "اقتربت؛ جرّب خيارًا آخر."), setActiveGlossary)}</div>}
                {mode === "practice" && feedback?.wrongId && <div className="exercise-inline-hint">💡 {renderSmartText(shortStudentText(feedback?.hint ?? thinkingNode?.hint, "حاول مرة أخرى."), setActiveGlossary)}</div>}

                <div className="exercise-question-nav core-nav-row">
                  <button type="button" onClick={() => setExampleIndex((i) => Math.max(0, i - 1))} style={ghostBtn}>السابق</button>
                  <button type="button" onClick={() => { setFeedback(null); setState(buildRunnerState(tree, mode, example)); }} style={ghostBtn}>إعادة</button>
                  <button type="button" onClick={() => setExampleIndex((i) => Math.min(examples.length - 1, i + 1))} style={ghostBtn}>التالي</button>
                </div>
                <ProgressDots total={totalCount || examples.length} done={doneCount} current={Math.min(doneCount, Math.max(0, (totalCount || examples.length) - 1))} />
              </div>
            ) : node?.type === "result" ? (
              <div className="core-result-block">
                <div className="exercise-result-trail" aria-label="مسار التفكير">
                  {thinkingTrailForResult(node.text).map((step, i) => (
                    <span key={`${step}-${i}`}>{step}</span>
                  ))}
                </div>
                <div className="exercise-result-text" style={{ whiteSpace: "pre-line" }}>{renderSmartText(thinkingNode?.text, setActiveGlossary)}</div>

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
                <ProgressDots total={totalCount || examples.length} done={Math.min(doneCount + 1, totalCount || examples.length)} current={doneCount} />
              </div>
            ) : (
              <div>لا توجد عقدة للعرض</div>
            )}
          </section>

          <div className="exercise-bottom-nav stage-locked-next" style={{...navNextWrap, display: isDone ? "none" : "flex"}}>
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
          </div>
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
