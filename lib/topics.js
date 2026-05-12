import { firstWordTree } from "../content/trees/first_word";
import { pastVerbTree } from "../content/trees/verb_past";
import { presentVerbTree } from "../content/trees/verb_present";
import { imperativeVerbTree } from "../content/trees/verb_imperative";
import { faelTree } from "../content/trees/fael";
import { mafoolTree } from "../content/trees/mafool";
import { attachedPronounsTree } from "../content/trees/attached_pronouns";
import { ismManqousTree } from "../content/trees/ism_manqous";
import { firstWordExamples, firstWordCoverageKeysOrdered, firstWordQuizExamples } from "../content/examples/first_word.examples";
import { pastVerbExamples, pastVerbCoverageKeysOrdered, pastVerbQuizExamples } from "../content/examples/verb_past.examples";
import { presentVerbExamples, presentVerbCoverageKeysOrdered, presentVerbQuizExamples } from "../content/examples/verb_present.examples";
import { imperativeVerbExamples, imperativeVerbCoverageKeysOrdered, imperativeVerbQuizExamples } from "../content/examples/verb_imperative.examples";
import { faelExamples, faelCoverageKeysOrdered, faelQuizExamples } from "../content/examples/fael.examples";
import { mafoolExamples, mafoolCoverageKeysOrdered, mafoolQuizExamples } from "../content/examples/mafool.examples";
import { attachedPronounsExamples, attachedPronounsCoverageKeysOrdered, attachedPronounsQuizExamples } from "../content/examples/attached_pronouns.examples";
import { ismManqousExamples, ismManqousCoverageKeysOrdered, ismManqousQuizExamples } from "../content/examples/ism_manqous.examples";
import { cleanMubtadaTree } from "../content/trees/clean_mubtada";
import { cleanKhabarTree } from "../content/trees/clean_khabar";
import { cleanKanaTree } from "../content/trees/clean_kana";
import { cleanInnaTree } from "../content/trees/clean_inna";

import {
  cleanMubtadaExamples,
  cleanMubtadaCoverageKeysOrdered,
  cleanMubtadaQuizExamples,
} from "../content/examples/clean_mubtada.examples";
import {
  cleanKhabarExamples,
  cleanKhabarCoverageKeysOrdered,
  cleanKhabarQuizExamples,
} from "../content/examples/clean_khabar.examples";
import {
  cleanKanaExamples,
  cleanKanaCoverageKeysOrdered,
  cleanKanaQuizExamples,
} from "../content/examples/clean_kana.examples";
import {
  cleanInnaExamples,
  cleanInnaCoverageKeysOrdered,
  cleanInnaQuizExamples,
} from "../content/examples/clean_inna.examples";

export const TOPICS = [
  {
    code: "first-word-key",
    name_ar: "مفتاح الكلمة الأولى",
    subtitle: "اسم / فعل / حرف مع الحفاظ على التسلسل الأول",
    shortLabel: "الكلمة الأولى",
    desc: "مسار يدرّب الطالب على بدء التفكير النحوي من نوع الكلمة الأولى قبل الإعراب.",
    tree: firstWordTree,
    examples: firstWordExamples,
    coverageKeysOrdered: firstWordCoverageKeysOrdered,
    quizExamples: firstWordQuizExamples,
    quizCoverageKeysOrdered: firstWordCoverageKeysOrdered,
    quizCount: Math.min(6, firstWordQuizExamples.length),
    level: 2,
    isReady: true,
  },
  {
    code: "past-verb",
    name_ar: "الفعل الماضي",
    subtitle: "الفتح / الضم / السكون مع إعراب الضمير المتصل",
    shortLabel: "الماضي",
    desc: "تدريب على بناء الفعل الماضي حسب اتصال الضمائر: واو الجماعة، ألف الاثنين، نون النسوة، وضمائر الرفع المتحركة.",
    tree: pastVerbTree,
    examples: pastVerbExamples,
    coverageKeysOrdered: pastVerbCoverageKeysOrdered,
    quizExamples: pastVerbQuizExamples,
    quizCoverageKeysOrdered: pastVerbCoverageKeysOrdered,
    quizCount: Math.min(8, pastVerbQuizExamples.length),
    level: 2,
    isReady: true,
  },
  {
    code: "present-verb",
    name_ar: "الفعل المضارع",
    subtitle: "نبدأ بالأداة ثم نحدد العلامة",
    shortLabel: "المضارع",
    desc: "خوارزمية المضارع كما في التسلسل: هل سبق بأداة نصب أو جزم؟ ثم الاتصال بواو الجماعة/ياء المخاطبة/ألف الاثنين، ثم صحيح/معتل.",
    tree: presentVerbTree,
    examples: presentVerbExamples,
    coverageKeysOrdered: presentVerbCoverageKeysOrdered,
    quizExamples: presentVerbQuizExamples,
    quizCoverageKeysOrdered: presentVerbCoverageKeysOrdered,
    quizCount: Math.min(12, presentVerbQuizExamples.length),
    level: 2,
    isReady: true,
  },
  {
    code: "imperative-verb",
    name_ar: "فعل الأمر",
    subtitle: "حذف النون / حذف حرف العلة / السكون",
    shortLabel: "الأمر",
    desc: "مسار فعل الأمر دون خلطه بالمضارع: نلاحظ اتصال واو الجماعة أو ياء المخاطبة أو ألف الاثنين، ثم نرجع للأصل عند المعتل.",
    tree: imperativeVerbTree,
    examples: imperativeVerbExamples,
    coverageKeysOrdered: imperativeVerbCoverageKeysOrdered,
    quizExamples: imperativeVerbQuizExamples,
    quizCoverageKeysOrdered: imperativeVerbCoverageKeysOrdered,
    quizCount: Math.min(8, imperativeVerbQuizExamples.length),
    level: 2,
    isReady: true,
  },
  {
    code: "fael",
    name_ar: "الفاعل",
    subtitle: "فاعل مرفوع أو مبني في محل رفع",
    shortLabel: "الفاعل",
    desc: "تحديد نوع الفاعل أولًا ثم الوصول إلى علامة الرفع أو محل الرفع.",
    tree: faelTree,
    examples: faelExamples,
    coverageKeysOrdered: faelCoverageKeysOrdered,
    quizExamples: faelQuizExamples,
    quizCoverageKeysOrdered: faelCoverageKeysOrdered,
    quizCount: Math.min(10, faelQuizExamples.length),
    level: 2,
    isReady: true,
  },
  {
    code: "mafool-bih",
    name_ar: "المفعول به",
    subtitle: "مفعول به منصوب أو مبني في محل نصب",
    shortLabel: "المفعول به",
    desc: "تحديد نوع المفعول به أولًا ثم الوصول إلى علامة النصب أو محل النصب.",
    tree: mafoolTree,
    examples: mafoolExamples,
    coverageKeysOrdered: mafoolCoverageKeysOrdered,
    quizExamples: mafoolQuizExamples,
    quizCoverageKeysOrdered: mafoolCoverageKeysOrdered,
    quizCount: Math.min(10, mafoolQuizExamples.length),
    level: 2,
    isReady: true,
  },
  {
    code: "attached-pronouns",
    name_ar: "الضمائر المتصلة والمنفصلة",
    subtitle: "ضمائر الرفع والنصب والجر بحسب محل الاسم الذي تنوب عنه",
    shortLabel: "الضمائر",
    desc: "يتعلم الطالب أن الضمير يأخذ محل الاسم الذي ناب عنه: رفعًا أو نصبًا أو جرًا، مع التمييز بين المتصل والمنفصل.",
    tree: attachedPronounsTree,
    examples: attachedPronounsExamples,
    coverageKeysOrdered: attachedPronounsCoverageKeysOrdered,
    quizExamples: attachedPronounsQuizExamples,
    quizCoverageKeysOrdered: attachedPronounsCoverageKeysOrdered,
    quizCount: Math.min(8, attachedPronounsQuizExamples.length),
    level: 2,
    isReady: true,
  },
  {
    code: "ism-manqous",
    name_ar: "الاسم المنقوص",
    subtitle: "بقاء الياء أو حذفها حسب النصب والرفع والجر",
    shortLabel: "الاسم المنقوص",
    desc: "شجرة مبسطة لحل مشكلة الاسم المنقوص: نبدأ بالموقع الإعرابي ثم نحدد بقاء الياء أو حذفها.",
    tree: ismManqousTree,
    examples: ismManqousExamples,
    coverageKeysOrdered: ismManqousCoverageKeysOrdered,
    quizExamples: ismManqousQuizExamples,
    quizCoverageKeysOrdered: ismManqousCoverageKeysOrdered,
    quizCount: Math.min(8, ismManqousQuizExamples.length),
    level: 2,
    isReady: true,
  },
  {
    code: "nominal-advanced",
    name_ar: "الجملة الاسمية",
    subtitle: "مسار المبتدأ — شجرة نظيفة قابلة للتوسعة",
    shortLabel: "المبتدأ",
    slogan: "مدرّب تفكير نحوي موجّه",
    desc: "تعلّم مسار المبتدأ: الاسم المعرب، الاسم المبني، والمصدر المؤول مع صياغة إعراب ثابتة.",
    tree: cleanMubtadaTree,
    examples: cleanMubtadaExamples,
    coverageKeysOrdered: cleanMubtadaCoverageKeysOrdered,
    quizExamples: cleanMubtadaQuizExamples,
    quizCoverageKeysOrdered: cleanMubtadaCoverageKeysOrdered,
    quizCount: Math.min(12, cleanMubtadaQuizExamples.length),
    level: 2,
    isReady: true,
  },
  {
    code: "khabar",
    name_ar: "الخبر",
    subtitle: "خبر مفرد، جملة، وشبه جملة",
    shortLabel: "الخبر",
    desc: "مسارات الخبر المفرد والجملة وشبه الجملة، مع تحديد نوع الاسم المبني قبل الإعراب.",
    tree: cleanKhabarTree,
    examples: cleanKhabarExamples,
    coverageKeysOrdered: cleanKhabarCoverageKeysOrdered,
    quizExamples: cleanKhabarQuizExamples,
    quizCoverageKeysOrdered: cleanKhabarCoverageKeysOrdered,
    quizCount: Math.min(12, cleanKhabarQuizExamples.length),
    level: 2,
    isReady: true,
  },
  {
    code: "kana-wa-akhawatuha",
    name_ar: "كان وأخواتها",
    subtitle: "اسم كان مرفوع وخبر كان منصوب",
    shortLabel: "كان وأخواتها",
    desc: "نفس منطق الجملة الاسمية بعد دخول كان: اسم كان مرفوع وخبر كان منصوب.",
    tree: cleanKanaTree,
    examples: cleanKanaExamples,
    coverageKeysOrdered: cleanKanaCoverageKeysOrdered,
    quizExamples: cleanKanaQuizExamples,
    quizCoverageKeysOrdered: cleanKanaCoverageKeysOrdered,
    quizCount: Math.min(10, cleanKanaQuizExamples.length),
    level: 2,
    isReady: true,
  },
  {
    code: "inna-wa-akhawatuha",
    name_ar: "إن وأخواتها",
    subtitle: "اسم إن منصوب وخبر إن مرفوع",
    shortLabel: "إن وأخواتها",
    desc: "نفس منطق الجملة الاسمية بعد دخول إن: اسم إن منصوب وخبر إن مرفوع.",
    tree: cleanInnaTree,
    examples: cleanInnaExamples,
    coverageKeysOrdered: cleanInnaCoverageKeysOrdered,
    quizExamples: cleanInnaQuizExamples,
    quizCoverageKeysOrdered: cleanInnaCoverageKeysOrdered,
    quizCount: Math.min(10, cleanInnaQuizExamples.length),
    level: 2,
    isReady: true,
  },
];

export function getTopicByCode(code) {
  return TOPICS.find((topic) => topic.code === code) ?? null;
}

export function getReadyTopics() {
  return TOPICS.filter((topic) => topic.isReady);
}

export function getTopicRoutes(code) {
  return {
    topics: `/paths?topic=${code}`,
    paths: `/paths?topic=${code}`,
    learn: `/learn/${code}`,
    practice: `/train/${code}`,
    quiz: `/quiz/${code}`,
    dashboard: "/dashboard",
  };
}
