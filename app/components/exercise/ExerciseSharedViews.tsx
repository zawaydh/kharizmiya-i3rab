"use client";

import React from "react";
import { ghostActionStyle, primaryActionStyle } from "./exerciseViewStyles";
import type { Mode } from "../../../lib/exercise/model";
import {
  buildGlobalProgress,
  buildHeroProgress,
  stageCompletionCopy,
} from "../../../lib/exercise/presentation";

export type GlossaryEntry = { title: string; body: string[] };

export const SMART_GLOSSARY: Record<string, GlossaryEntry> = {
  "حروف الجر": { title: "حروف الجر وعلامات الجر", body: ["من أشهر حروف الجر: من، إلى، عن، على، في، الباء، الكاف، اللام، ربّ، حتى، مذ، منذ، واو القسم، وتاء القسم.", "الاسم بعد حرف الجر يكون مجرورًا، لكن علامة الجر تتغير بحسب صورة الاسم: الكسرة في المفرد وجمع التكسير وجمع المؤنث السالم، والياء في المثنى وجمع المذكر السالم والأسماء الخمسة المستوفية للشروط.", "الممنوع من الصرف يجر بالفتحة إذا لم يضف ولم يعرف بـ«الـ»، والاسم المبني نقول فيه: مبني في محل جر." ] },
  "المضاف إليه": { title: "المضاف إليه", body: ["المضاف إليه اسم أو ضمير يتمم معنى اسم قبله، وهو مجرور دائمًا أو في محل جر إذا كان مبنيًا.", "اسأل عن علاقة الإضافة: كتابُ مَن؟ كتابُ الطالبِ. بابُ ماذا؟ بابُ المدرسةِ. والضمير إذا اتصل باسم مثل «كتابك» يكون في محل جر مضاف إليه.", "من الكلمات التي يكثر أن تضاف لما بعدها: كل، بعض، فوق، تحت، أمام، خلف، قبل، بعد. وجود «الـ» في الكلمة الثانية وحده لا يكفي للحكم بأنها مضاف إليه." ] },
  "حروف العلة": { title: "حروف العلة", body: ["الألف، الواو، الياء.", "ننظر إليها عند آخر الكلمة لتحديد: تعذر، ثقل، أو حذف حرف العلة."] },
  "الأسماء الخمسة": { title: "الأسماء الخمسة", body: ["أب، أخ، حم، فو، ذو. ويشترط في «ذو» أن تكون بمعنى صاحب، وفي «فو» أن تكون بلا ميم.", "تعرب بالحروف إذا كانت مفردة، مكبرة، مضافة، ومضافة إلى غير ياء المتكلم.", "ترفع بالواو، وتنصب بالألف، وتجر بالياء."] },
  "الأفعال الخمسة": { title: "الأفعال الخمسة", body: ["أفعال مضارعة اتصلت بألف الاثنين أو واو الجماعة أو ياء المخاطبة.", "أوزانها: يفعلان، تفعلان، يفعلون، تفعلون، تفعلين.", "ترفع بثبوت النون، وتنصب وتجزم بحذف النون."] },
  "اسم منقوص": { title: "الاسم المنقوص", body: ["اسم معرب آخره ياء لازمة مكسور ما قبلها، مثل: القاضي، الساعي.", "تظهر الفتحة في النصب، وتقدر الضمة والكسرة في الرفع والجر."] },
  "اسم مقصور": { title: "الاسم المقصور", body: ["اسم معرب آخره ألف لازمة، مثل: الفتى، العصا.", "تقدر عليه الحركات الثلاث للتعذر."] },
  "واو الجماعة": { title: "واو الجماعة", body: ["ضمير متصل يدل على جماعة الذكور.", "يكون في محل رفع فاعل إذا اتصل بالفعل."] },
  "ألف الاثنين": { title: "ألف الاثنين", body: ["ضمير متصل يدل على مثنى.", "يكون في محل رفع فاعل إذا اتصل بالفعل."] },
  "ياء المخاطبة": { title: "ياء المخاطبة", body: ["ضمير متصل يدل على المخاطبة المؤنثة.", "مع المضارع والأمر تكون في محل رفع فاعل."] },
  "نون النسوة": { title: "نون النسوة", body: ["ضمير متصل يدل على مجموعة مؤنثة.", "مثل: يكتبْنَ، يدرسْنَ، ينجحْنَ.", "إذا اتصلت بالمضارع بنته على السكون، ثم نحدد محله الإعرابي من العامل السابق."] },
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
  "الأسماء المبنية": { title: "الأسماء المبنية", body: ["من أشهرها: الضمائر، وأكثر أسماء الإشارة، وأكثر الأسماء الموصولة، وكثير من أسماء الاستفهام والشرط.", "الاسم المبني لا تتغير صورة آخره بتغير موقعه، لذلك نحدد موقعه أولًا ثم نقول: مبني في محل رفع أو نصب أو جر.", "مثال: «رأيتُ هذا»؛ هذا اسم إشارة مبني في محل نصب مفعول به."] },
  "علامة أصلية": { title: "العلامة الأصلية", body: ["الضمة للرفع، الفتحة للنصب، الكسرة للجر، السكون للجزم."] },
  "علامة فرعية": { title: "العلامة الفرعية", body: ["مثل الواو والألف والياء وثبوت النون وحذف النون وحذف حرف العلة.", "تظهر في أبواب مخصوصة مثل المثنى والجمع والأسماء الخمسة والأفعال الخمسة."] },
  "أدوات النصب": { title: "أدوات النصب", body: ["منها: لن، أن، كي.", "إذا دخلت على الفعل المضارع جعلته منصوبًا."] },
  "أدوات الجزم": { title: "أدوات الجزم", body: ["منها: لم، لا الناهية، لام الأمر.", "إذا دخلت على الفعل المضارع جعلته مجزومًا."] },
};

export function ClickSuccessPop({ point }: { point: { x: number; y: number; id: number } | null }) {
  if (!point) return null;
  return <span key={point.id} className="click-success-pop" style={{ left: point.x, top: point.y }} aria-hidden="true">✓</span>;
}

type ExerciseHeroViewProps = {
  stageTitle: string;
  mode: Mode;
  doneCount: number;
  totalCount: number;
  nextStepLabel: string;
  coveredPercent: number;
  quizCursor: number;
  quizTotal: number;
  quizCount: number;
  quizFinished: boolean;
};

export function ExerciseHeroView(props: ExerciseHeroViewProps) {
  const progress = buildHeroProgress({
    mode: props.mode,
    coveredPercent: props.coveredPercent,
    quizCursor: props.quizCursor,
    quizTotal: props.quizTotal,
    quizCount: props.quizCount,
    quizFinished: props.quizFinished,
  });

  return (
    <section className="exercise-hero-card card card-glow">
      <div className="exercise-hero-main">
        <span className="exercise-badge stage-learning-badge">{props.stageTitle}</span>
        {props.mode !== "quiz" ? (
          <div className="exercise-meta-inline">
            <span className="pill pill-accent">المنجَز: {props.doneCount} / {props.totalCount}</span>
            <span className="pill">نتابع: {props.nextStepLabel}</span>
          </div>
        ) : null}
      </div>
      <div className="exercise-hero-side">
        <div className="exercise-progress-panel">
          <div className="exercise-progress-head">
            <span>{progress.label}</span>
            <strong>{progress.value}</strong>
          </div>
          <div className="exercise-progress-track">
            <div className="exercise-progress-fill" style={{ width: `${progress.fillPercent}%` }} />
          </div>
        </div>
      </div>
    </section>
  );
}

export function StageCompletionBanner({ mode, onReset }: { mode: Exclude<Mode, "quiz">; onReset: () => void }) {
  const copy = stageCompletionCopy(mode);
  return (
    <section className="exercise-complete-banner final-only-complete-banner">
      <div>
        <strong>{copy.title}</strong>
        <p>{copy.description}</p>
      </div>
      <button type="button" onClick={onReset} style={ghostActionStyle}>{copy.resetLabel}</button>
    </section>
  );
}

type GlobalExerciseProgressProps = {
  mode: Mode;
  coveredDone: number;
  coverageTotal: number;
  quizCursor: number;
  quizTotal: number;
  quizCount: number;
  quizFinished: boolean;
};

export function GlobalExerciseProgress(props: GlobalExerciseProgressProps) {
  const progress = buildGlobalProgress(props);
  return (
    <div className="global-example-progress-wrap global-example-progress-bottom" aria-label="تقدم المرحلة">
      <div className="global-example-progress-topline">
        <span>{progress.label}</span>
        <strong>{progress.displayDone} من {progress.total}</strong>
      </div>
      <div className="global-example-progress-track" aria-hidden="true">
        <i style={{ width: `${progress.fillPercent}%` }} />
      </div>
    </div>
  );
}

export function SmartGlossaryPopover({ term, onClose }: { term: string | null; onClose: () => void }) {
  if (!term) return null;
  const entry = SMART_GLOSSARY[term];
  if (!entry) return null;
  return (
    <div
      className="smart-popover"
      role="dialog"
      aria-label={entry.title}
      style={{
        width: "min(300px, calc(100vw - 24px))",
        maxHeight: "min(230px, 34svh)",
        padding: "11px 13px 10px",
        fontSize: 12,
        lineHeight: 1.65,
      }}
    >
      <button type="button" className="smart-popover-close" onClick={onClose}>×</button>
      <strong>{entry.title}</strong>
      <ul>{entry.body.map((line) => <li key={line}>{line}</li>)}</ul>
    </div>
  );
}

export function StageBottomNavigation({
  visible,
  ready,
  label,
  onClick,
}: {
  visible: boolean;
  ready: boolean;
  label?: string;
  onClick: () => void;
}) {
  if (!visible) return null;
  return (
    <div className="exercise-bottom-nav stage-locked-next" style={navNextWrapStyle}>
      <button type="button"
        style={{ ...primaryActionStyle, opacity: 1, cursor: ready ? "pointer" : "not-allowed" }}
        className="stage-next-button"
        disabled={!ready}
        onClick={onClick}
      >
        {label}
      </button>
    </div>
  );
}

const navNextWrapStyle: React.CSSProperties = {
  marginTop: 24,
  display: "flex",
  justifyContent: "center",
};


