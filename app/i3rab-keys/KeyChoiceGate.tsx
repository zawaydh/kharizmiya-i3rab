"use client";

import { useMemo, useState } from "react";

type StartKey = "name" | "verb" | "tool" | "shibh";

type StepQuestion = {
  example: string;
  prompt: string;
  options: string[];
  correct: string;
  explanation: string;
  routeHref: string;
  routeLabel: string;
};

type StartConfig = {
  label: string;
  note: string;
  questions: StepQuestion[];
  moreTitle: string;
  moreBody: string;
};

const STARTS: Record<StartKey, StartConfig> = {
  name: {
    label: "بدأت باسم",
    note: "اسم ظاهر أو اسم مبني",
    questions: [
      {
        example: "هذا كتابٌ.",
        prompt: "«هذا» في بداية الجملة: ماذا يكون؟",
        options: ["اسم", "فعل", "حرف"],
        correct: "اسم",
        explanation: "«هذا» اسم إشارة، وأسماء الإشارة أسماء مبنية. بدأ به كلام اسمي؛ لذلك أول موقع نفحصه هنا هو المبتدأ.",
        routeHref: "/learn/nominal-advanced",
        routeLabel: "خذني إلى باب المبتدأ",
      },
      {
        example: "أنا مجتهدٌ.",
        prompt: "«أنا» في بداية الجملة: ما نوعه؟",
        options: ["ضمير", "حرف", "فعل"],
        correct: "ضمير",
        explanation: "«أنا» ضمير منفصل، والضمائر أسماء مبنية. بعد أن ثبت أنه اسم في بداية جملة اسمية نفحص موقعه، وهنا هو مبتدأ.",
        routeHref: "/learn/nominal-advanced",
        routeLabel: "خذني إلى باب المبتدأ",
      },
      {
        example: "الذي فازَ مجتهدٌ.",
        prompt: "«الذي» في بداية الجملة: ماذا يكون؟",
        options: ["اسم موصول", "حرف جر", "فعل"],
        correct: "اسم موصول",
        explanation: "«الذي» اسم موصول، والاسم الموصول من الأسماء المبنية. نثبت أنه اسم أولًا، ثم نفحص موقعه في الجملة.",
        routeHref: "/learn/nominal-advanced",
        routeLabel: "خذني إلى باب المبتدأ",
      },
    ],
    moreTitle: "أسماء لا تنخدع بشكلها",
    moreBody: "أنا، نحن، أنت، هو، هي، هذا، هذه، الذي، التي: كلها أسماء. وكذلك أسماء الاستفهام والشرط مثل «مَن» و«ما» بحسب الاستعمال؛ كونها أسماء ثابت، أمّا موقعها الإعرابي فيتحدد من الجملة.",
  },

  verb: {
    label: "بدأت بفعل",
    note: "حدّد الزمن أولًا",
    questions: [
      {
        example: "كتبَ الطالبُ واجبَه.",
        prompt: "«كتب» أي نوع من الأفعال؟",
        options: ["ماضٍ", "مضارع", "أمر"],
        correct: "ماضٍ",
        explanation: "«كتب» يدل على حدث وقع وانتهى، فهو فعل ماضٍ. بعد تحديد الزمن ننتقل إلى باب الماضي لمعرفة بنائه.",
        routeHref: "/learn/past-verb",
        routeLabel: "خذني إلى باب الفعل الماضي",
      },
      {
        example: "يكتبُ الطالبُ واجبَه.",
        prompt: "«يكتب» أي نوع من الأفعال؟",
        options: ["ماضٍ", "مضارع", "أمر"],
        correct: "مضارع",
        explanation: "«يكتب» يدل على حدث يقع أو يتجدد، فهو فعل مضارع. بعد تحديد الزمن نبحث عن العامل ثم الحالة والعلامة.",
        routeHref: "/learn/present-verb",
        routeLabel: "خذني إلى باب الفعل المضارع",
      },
      {
        example: "اكتبْ واجبَك.",
        prompt: "«اكتب» أي نوع من الأفعال؟",
        options: ["ماضٍ", "مضارع", "أمر"],
        correct: "أمر",
        explanation: "«اكتب» طلبٌ لحصول الحدث، فهو فعل أمر. بعد ثبوت الأمر نحدد علامة بنائه بحسب آخره وما اتصل به.",
        routeHref: "/learn/imperative-verb",
        routeLabel: "خذني إلى باب فعل الأمر",
      },
    ],
    moreTitle: "مفتاح الزمن",
    moreBody: "حدث وقع وانتهى ← ماضٍ. حدث يقع أو يتجدد ← مضارع. طلب حصول الحدث ← أمر. وإذا كان الفعل ناسخًا مثل «كان» و«أصبح» فله باب خاص.",
  },

  tool: {
    label: "بدأت بأداة",
    note: "اسأل: تعمل أم لا؟",
    questions: [
      {
        example: "هل حضرَ الطالبُ؟",
        prompt: "ماذا أفعل مع «هل»؟",
        options: ["أتعرفها ثم أنظر لما بعدها", "أقف عندها لأنها تغيّر الإعراب"],
        correct: "أتعرفها ثم أنظر لما بعدها",
        explanation: "«هل» حرف استفهام غير عامل في إعراب الكلمة بعدها؛ نتعرّفها ثم ننظر إلى «حضر»: فعل ماضٍ.",
        routeHref: "/learn/past-verb",
        routeLabel: "خذني إلى باب الفعل الماضي",
      },
      {
        example: "أَنجحَ الطالبُ؟",
        prompt: "ماذا أفعل مع همزة الاستفهام؟",
        options: ["أتعرفها ثم أنظر لما بعدها", "أعدّها ناصبة للفعل"],
        correct: "أتعرفها ثم أنظر لما بعدها",
        explanation: "همزة الاستفهام لا تنصب الفعل ولا تجزمه؛ نتعرّف معنى الاستفهام ثم نحدد نوع الكلمة بعدها.",
        routeHref: "/learn/past-verb",
        routeLabel: "خذني إلى باب الفعل الماضي",
      },
      {
        example: "قد نجحَ الطالبُ.",
        prompt: "هل «قد» تغيّر إعراب الفعل بعدها؟",
        options: ["نعم، تنصبه أو تجزمه", "لا، أتعرّفها ثم أحدد نوع الفعل"],
        correct: "لا، أتعرّفها ثم أحدد نوع الفعل",
        explanation: "«قد» تفيد معنى مع الفعل، لكنها لا تنصبه ولا تجزمه. هنا بعدها «نجح» فعل ماضٍ.",
        routeHref: "/learn/past-verb",
        routeLabel: "خذني إلى باب الفعل الماضي",
      },
      {
        example: "سوف ينجحُ الطالبُ.",
        prompt: "ماذا تفعل «سوف» في إعراب المضارع؟",
        options: ["لا تغيّر رفعه من جهتها", "تنصبه", "تجزمه"],
        correct: "لا تغيّر رفعه من جهتها",
        explanation: "«سوف» تدل على الاستقبال، ولا تنصب المضارع ولا تجزمه؛ لذلك نتابع إلى باب المضارع.",
        routeHref: "/learn/present-verb",
        routeLabel: "خذني إلى باب الفعل المضارع",
      },
      {
        example: "لن يتأخرَ الطالبُ.",
        prompt: "ماذا أفعل مع «لن»؟",
        options: ["أتجاوزها", "أقف عندها لأنها تنصب المضارع"],
        correct: "أقف عندها لأنها تنصب المضارع",
        explanation: "«لن» حرف نصب يعمل في المضارع بعده؛ لذلك نثبت أثره قبل تحديد علامة النصب.",
        routeHref: "/learn/present-verb",
        routeLabel: "خذني إلى باب الفعل المضارع",
      },
      {
        example: "لم يتأخرْ الطالبُ.",
        prompt: "ما أثر «لم» في الفعل المضارع؟",
        options: ["تنصبه", "تجزمه", "لا تعمل فيه"],
        correct: "تجزمه",
        explanation: "«لم» حرف جزم، فيغيّر حالة المضارع بعدها إلى الجزم.",
        routeHref: "/learn/present-verb",
        routeLabel: "خذني إلى باب الفعل المضارع",
      },
      {
        example: "لا تهملْ واجبك.",
        prompt: "«لا» هنا ناهية؛ ماذا تفعل بالمضارع؟",
        options: ["تجزمه", "تنصبه", "لا تؤثر فيه"],
        correct: "تجزمه",
        explanation: "«لا» الناهية حرف جزم، فتجزم الفعل المضارع بعدها.",
        routeHref: "/learn/present-verb",
        routeLabel: "خذني إلى باب الفعل المضارع",
      },
      {
        example: "إنَّ الطالبَ مجتهدٌ.",
        prompt: "ما المفتاح الذي تفتحه «إنَّ»؟",
        options: ["باب إنَّ وأخواتها", "باب الفعل الماضي", "أتجاوزها"],
        correct: "باب إنَّ وأخواتها",
        explanation: "«إنَّ» حرف ناسخ يعمل في الجملة الاسمية: ينصب الاسم ويرفع الخبر؛ لذلك لا نتجاوزه.",
        routeHref: "/learn/inna-wa-akhawatuha",
        routeLabel: "خذني إلى باب إنَّ وأخواتها",
      },
      {
        example: "في الفصلِ طلابٌ.",
        prompt: "ماذا تفعل «في» بالاسم بعدها؟",
        options: ["تجرّه", "تنصبه", "تجزمه"],
        correct: "تجرّه",
        explanation: "«في» حرف جر عامل، يجر الاسم بعده، ومعه تتكوّن شبه جملة نحدد موقعها من السياق.",
        routeHref: "/learn/khabar",
        routeLabel: "خذني إلى باب الخبر وشبه الجملة",
      },
      {
        example: "يا طالبُ، انتبه.",
        prompt: "ماذا يفتح لك المفتاح «يا»؟",
        options: ["باب المنادى", "باب المبتدأ", "باب الفعل المضارع"],
        correct: "باب المنادى",
        explanation: "«يا» أداة نداء؛ ليست مما نتجاوزه، بل تقود مباشرة إلى باب المنادى.",
        routeHref: "/learn/munada",
        routeLabel: "خذني إلى باب المنادى",
      },
      {
        example: "إنْ تجتهدْ تنجحْ.",
        prompt: "«إنْ» هنا شرطية؛ ماذا تفعل؟",
        options: ["تجزم فعلين", "تنصب اسمًا وترفع خبرًا", "لا تعمل"],
        correct: "تجزم فعلين",
        explanation: "«إنْ» الشرطية حرف شرط جازم، ويجب تمييزها عن «إنَّ» الناسخة.",
        routeHref: "/learn/present-verb",
        routeLabel: "راجع الجزم في باب الفعل المضارع",
      },
      {
        example: "لا طالبَ مهملٌ.",
        prompt: "«لا» هنا نافية للجنس؛ ما المسار الصحيح؟",
        options: ["باب لا النافية للجنس", "باب لا الناهية", "أتجاوزها"],
        correct: "باب لا النافية للجنس",
        explanation: "إذا ثبت أنها «لا» النافية للجنس وتحققت شروط عملها، فهي تعمل عمل «إنَّ»: تنصب الاسم وترفع الخبر.",
        routeHref: "/learn/la-nafiya",
        routeLabel: "خذني إلى باب لا النافية للجنس",
      },
    ],
    moreTitle: "الأدوات في ثلاثة مفاتيح",
    moreBody: "تعمل وتؤثر: إنَّ وأخواتها، لن، لم، لا الناهية، حروف الجر، لا النافية للجنس، وإنْ الشرطية. أتعرفها ثم أنظر لما بعدها: هل، همزة الاستفهام، قد، السين وسوف من جهة الإعراب. وتوجد أدوات تفتح بابًا خاصًا مثل «يا» للمنادى.",
  },

  shibh: {
    label: "بدأت بشبه جملة",
    note: "لا تحكم فورًا",
    questions: [
      {
        example: "في الفصلِ طلابٌ.",
        prompt: "بعد أن عرفت «في الفصل» شبه جملة، ما الخطوة الصحيحة؟",
        options: ["أحكم فورًا بأنه خبر مقدم", "أكوّن شبه الجملة ثم أفحص ما بعدها"],
        correct: "أكوّن شبه الجملة ثم أفحص ما بعدها",
        explanation: "في هذا المثال جاء بعد شبه الجملة اسم مرفوع يتم المعنى؛ لذلك نفحص الخبر المقدم والمبتدأ المؤخر. لا نعمّم الحكم قبل رؤية ما بعدها.",
        routeHref: "/learn/khabar",
        routeLabel: "خذني إلى باب الخبر",
      },
      {
        example: "فوقَ الطاولةِ كتابٌ.",
        prompt: "«فوقَ الطاولة» ما نوع البداية هنا؟",
        options: ["شبه جملة ظرفية", "فعل وفاعل", "مبتدأ ظاهر"],
        correct: "شبه جملة ظرفية",
        explanation: "«فوق» ظرف مكان، ومع المضاف إليه بعده تتكوّن شبه جملة ظرفية. ثم ننظر لما بعدها لتحديد موقعها في الجملة.",
        routeHref: "/learn/khabar",
        routeLabel: "خذني إلى باب الخبر",
      },
      {
        example: "في البيتِ جلسَ الضيفُ.",
        prompt: "هل نحكم على «في البيت» بأنه خبر مقدم هنا؟",
        options: ["نعم دائمًا", "لا؛ أفحص ما بعدها أولًا"],
        correct: "لا؛ أفحص ما بعدها أولًا",
        explanation: "بعد شبه الجملة جاء فعل «جلس»، لذلك لا نحكم بأنها خبر مقدم. نتابع بناء الجملة الفعلية ونربط شبه الجملة بما يناسبها.",
        routeHref: "/learn/past-verb",
        routeLabel: "خذني إلى باب الفعل الماضي",
      },
    ],
    moreTitle: "جار ومجرور أم ظرف؟",
    moreBody: "«في البيت، على الطاولة» جار ومجرور. «فوقَ الطاولة، أمامَ البيت» ظرف مع ما بعده. كلاهما قد يصنع شبه جملة، ثم نحدد موقع شبه الجملة من السياق.",
  },
};

const ORDER: StartKey[] = ["name", "verb", "tool", "shibh"];

export default function KeyChoiceGate() {
  const [active, setActive] = useState<StartKey | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);

  const config = active ? STARTS[active] : null;
  const question = config ? config.questions[questionIndex] : null;
  const answered = picked !== null;
  const isCorrect = Boolean(question && picked === question.correct);

  const stepText = useMemo(() => {
    if (!active) return "الخطوة 1 من 3 — اختر البداية";
    if (!answered) return "الخطوة 2 من 3 — أجب عن السؤال";
    return "الخطوة 3 من 3 — افهم السبب";
  }, [active, answered]);

  function chooseStart(key: StartKey) {
    setActive(key);
    setQuestionIndex(0);
    setPicked(null);
  }

  function resetStart() {
    setActive(null);
    setQuestionIndex(0);
    setPicked(null);
  }

  function nextQuestion() {
    if (!config) return;
    setPicked(null);
    setQuestionIndex((current) => (current + 1) % config.questions.length);
  }

  return (
    <section className="keys-workspace card" aria-labelledby="keys-workspace-title">
      <div className="keys-workspace-top">
        <div>
          <h2 id="keys-workspace-title">{active ? config?.label : "كيف بدأت جملتك؟"}</h2>
          <span className="keys-question-signal">
            <i aria-hidden="true" />
            {active ? "تعرّف المفتاح عبر السؤال التفاعلي" : "اختر بداية الجملة"}
          </span>
        </div>
        <span className="keys-step-pill">{stepText}</span>
      </div>

      {!active ? (
        <>
          <p className="keys-workspace-instruction">اختر واحدًا فقط، وسيظهر السؤال هنا في مساحة العمل نفسها.</p>
          <div className="keys-start-grid">
            {ORDER.map((key) => (
              <button type="button" key={key} className="keys-start-choice" onClick={() => chooseStart(key)}>
                <strong>{STARTS[key].label}</strong>
                <span>{STARTS[key].note}</span>
              </button>
            ))}
          </div>
        </>
      ) : question ? (
        <>
          <div className="keys-example-focus">
            <span>المثال</span>
            <strong>{question.example}</strong>
          </div>

          <div className="keys-question-focus">
            <h3><span>اختر الإجابة الصحيحة:</span> {question.prompt}</h3>
          </div>

          <div className="keys-answer-grid">
            {question.options.map((option) => {
              const stateClass = !answered
                ? ""
                : option === question.correct
                  ? "is-correct"
                  : picked === option
                    ? "is-wrong"
                    : "";

              return (
                <button
                  type="button"
                  key={option}
                  className={stateClass}
                  onClick={() => setPicked(option)}
                  disabled={answered}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {answered ? (
            <div className={`keys-answer-feedback ${isCorrect ? "success" : "hint"}`} aria-live="polite">
              <strong>{isCorrect ? "أحسنت، وصلت إلى المفتاح." : `الإجابة الأدق: ${question.correct}`}</strong>
              <p>{question.explanation}</p>

              <div className="keys-feedback-actions">
                <a href={question.routeHref}>{question.routeLabel}</a>
                {active === "tool" && config.questions.length > 1 ? (
                  <button type="button" onClick={nextQuestion}>تعرّف الأداة التالية</button>
                ) : config.questions.length > 1 ? (
                  <button type="button" onClick={nextQuestion}>جرّب المثال التالي</button>
                ) : null}
                <button type="button" onClick={resetStart}>غيّر البداية</button>
              </div>

              <details className="keys-more-details">
                <summary>أريد أن أعرف أكثر</summary>
                <strong>{config.moreTitle}</strong>
                <p>{config.moreBody}</p>
              </details>

              <details className="keys-more-details">
                <summary>مفاتيح يكثر الخلط بينها</summary>
                <p><b>مِنْ / مَن:</b> الأولى حرف جر، والثانية اسم استفهام أو شرط بحسب السياق.</p>
                <p><b>إنَّ / إنْ:</b> الأولى ناسخة، والثانية قد تكون شرطية جازمة.</p>
                <p><b>لا:</b> قد تكون نافية للجنس أو ناهية أو نافية غير عاملة؛ المعنى وما بعدها يحددان المسار.</p>
              </details>
            </div>
          ) : null}

          {!answered ? (
            <button type="button" className="keys-change-start" onClick={resetStart}>غيّر نوع البداية</button>
          ) : null}
        </>
      ) : null}
    </section>
  );
}