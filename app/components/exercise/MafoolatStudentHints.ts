import type { ExerciseAnswer } from "../../../lib/exercise/model";
import type { PedagogyNode, PedagogyState } from "./ExercisePedagogyTypes";

function factText(facts: Record<string, unknown>, key: string, fallback: string) {
  const value = String(facts[key] || "").trim();
  return value || fallback;
}

function shapeLabel(shape: string) {
  if (shape === "singular") return "مفرد";
  if (shape === "dual") return "مثنى";
  if (shape === "jms") return "جمع مذكر سالم";
  if (shape === "jfs") return "جمع مؤنث سالم";
  if (shape === "jt") return "جمع تكسير";
  if (shape === "five") return "من الأسماء الخمسة";
  return "نوع الاسم";
}

export function mafoolatStudentHintText(
  node: PedagogyNode | null | undefined,
  picked?: ExerciseAnswer,
  state?: PedagogyState,
): string | undefined {
  const id = String(node?.id || "");
  if (!id.startsWith("mafoolat_")) return undefined;

  const facts = (state?.facts || {}) as Record<string, unknown>;
  const target = String(state?.currentTarget || "الكلمة المحددة").trim();
  const sentence = String(state?.currentSentence || state?.sentence || "").trim();
  const verb = factText(facts, "verb", "فعل الجملة");
  const verbMasdar = factText(facts, "verbMasdar", "مصدر الفعل");
  const mafoolType = factText(facts, "mafoolType", "");
  const pickedText = String(picked?.text || "").trim();
  const mafoolLabel = factText(facts, "mafoolLabel", "الموقع الإعرابي");
  const shape = factText(facts, "shape", "");
  const nasbMark = factText(facts, "nasbMark", "");
  const roleKind = factText(facts, "roleKind", "");
  if (id === "mafoolat_maah_check") {
    if (mafoolType === "maah") {
      const paraphrase = factText(facts, "maahParaphrase", `ضع «مع» مكان الواو قبل (${target})`);
      return `انظر إلى الجملة${sentence ? `: «${sentence}»` : ""}. استبدل الواو بـ«مع»: «${paraphrase}». ثم افحص: هل يصح أن يشارك ما بعد الواو ما قبلها في الحكم؟ هنا لا يستقيم العطف، فالمقصود المصاحبة. إذن (${target}) مفعول معه. عد واختر «نعم».`;
    }
    return `انظر قبل (${target}) مباشرة. في هذا المثال لا توجد واو للمعية بمعنى «مع» قبل الكلمة المحددة، لذلك نستبعد المفعول معه. عد واختر «لا»، ثم ننتقل إلى الفحص التالي.`;
  }

  if (id === "mafoolat_fih_check") {
    const probe = factText(facts, "whenWhereQuestion", `متى أو أين حدث الفعل (${verb})؟`);
    if (mafoolType === "fih") {
      return `اسأل عن الفعل: ${probe} الجواب هو (${target})؛ فهي تحدد ${String(facts.fihKind || "").includes("place") ? "مكان" : "زمان"} وقوع الفعل. إذن (${target}) مفعول فيه. عد واختر الإجابة التي تقول إنها تجيب عن «متى؟» أو «أين؟».`;
    }
    return `جرّب السؤال عن الفعل (${verb}): «متى حدث؟» أو «أين حدث؟». هل تصلح (${target}) جوابًا يحدد زمان الفعل أو مكانه؟ لا. إذن ليست مفعولًا فيه، وننتقل إلى فحص المصدر.`;
  }

  if (id === "mafoolat_mutlaq_check") {
    if (mafoolType === "mutlaq") {
      if (facts.mutlaqKind === "number")
        return `ابدأ بالفعل (${verb}): أي قمتَ بعملية (${verbMasdar}). ثم انظر إلى (${target}): هي لا تضيف شيئًا وقع عليه الفعل، بل تبين عدد مرات وقوع الحدث؛ أي إن (${verbMasdar}) وقع مرتين. لذلك (${target}) مفعول مطلق مبين للعدد. عد إلى السؤال، ثم اختر الإجابة الصحيحة لنكمل الإعراب.`;
      return `خذ فعل الجملة (${verb}) وحوّله إلى اسم يدل على الحدث: (${verbMasdar}). قارن هذا الحدث بالكلمة (${target}): ما دامت تدل على حدث الفعل نفسه، فهي مفعول مطلق. عد إلى السؤال، ثم اختر الإجابة الصحيحة لنكمل الإعراب.`;
    }
    return `خذ فعل الجملة (${verb}) وحوّله إلى اسم يدل على الحدث: (${verbMasdar}). إذا واجهت صعوبة في صياغة المصدر فقل: «قام بعملية ...»، مثل: جاهرَ ← قام بعملية المجاهرة. الآن قارن: هل تمثل (${target}) هذا المصدر أو تدل على الحدث نفسه؟ لا. إذن (${target}) ليست مفعولًا مطلقًا، وننتقل إلى فحص السبب.`;
  }

  if (id === "mafoolat_liajlih_check") {
    const whyQuestion = factText(facts, "whyQuestion", `لماذا حدث الفعل (${verb})؟`);
    if (mafoolType === "liajlih") {
      return `اسأل: ${whyQuestion} الجواب هو (${target}). ثم تحقق: (${target}) مصدر قلبي يبين الدافع، وفاعل السبب هو فاعل الفعل نفسه، وزمن السبب مقارن لزمن الفعل. إذن شروط المفعول لأجله متحققة. عد واختر الإجابة الصحيحة.`;
    }
    return `اسأل: ${whyQuestion} هل (${target}) مصدر قلبي يبين سبب حدوث الفعل، مع اتحاد الفاعل والزمن؟ لا. إذن ليست مفعولًا لأجله. لقد استبعدنا الآن المفعول معه، والمفعول فيه، والمفعول المطلق، والمفعول لأجله؛ فننتقل إلى علاقة الكلمة بالفعل.`;
  }

  if (id === "mafoolat_bih_check") {
    const objectQuestion = factText(facts, "objectQuestion", `على من أو على ماذا وقع الفعل (${verb})؟`);
    if (mafoolType === "bih") {
      return `لقد استبعدنا المفعول معه، والمفعول فيه، والمفعول المطلق، والمفعول لأجله. اسأل الآن: ${objectQuestion} الجواب هو (${target})؛ أي إن الفعل (${verb}) وقع عليها أو تعدّى إليها. إذن (${target}) مفعول به. عد واختر الإجابة الصحيحة.`;
    }
    if (mafoolType === "hal") {
      return `اسأل: هل وقع الفعل (${verb}) على (${target})؟ لا؛ (${target}) لا تمثل الشيء الذي وقع عليه الفعل، بل تصف هيئة صاحبها وقت وقوعه. جرّب سؤال «كيف؟» في الخطوة التالية.`;
    }
    if (mafoolType === "tamyiz") {
      return `لا تجعل (${target}) مفعولًا به لمجرد أنها منصوبة. في الجملة${sentence ? ` «${sentence}»` : ""} المفعول به هو المقدار «لترًا»، أما (${target}) ففسّرت ما المقصود بهذا المقدار. لذلك انتقل إلى فحص التمييز.`;
    }
    return `اسأل: ${objectQuestion} إذا لم تكن (${target}) هي ما وقع عليه الفعل أو ما تعدّى إليه، فلا نجعلها مفعولًا به.`;
  }

  if (id === "mafoolat_form") {
    if (roleKind === "masdar") {
      if (pickedText.includes("كلمة")) return `(${target}) تركيب يمكن تأويله بمصدر صريح، وليس كلمة مفردة؛ لذلك نختار «تركيب في تأويل اسم».`;
      return `جرّب تأويل (${target}) بمصدر صريح يؤدي معناها. إذا استقام المعنى فهي تركيب في تأويل اسم، أي مصدر مؤول.`;
    }
    if (pickedText.includes("تركيب")) return `(${target}) كلمة واحدة في هذا المستوى من التحليل، وليست تركيبًا يؤول بمصدر. بعد ذلك نحدد: معربة أم مبنية.`;
    return `ثبت أن (${target}) ${mafoolLabel}. الآن نميز فقط: هل هي كلمة واحدة أم تركيب يمكن تأويله بمصدر صريح؟`;
  }

  if (id === "mafoolat_masdar_term") {
    return `ثبت أن (${target}) تركيب في تأويل اسم؛ لأنه يمكن تأويله بمصدر صريح. يسمى هذا التركيب «مصدرًا مؤولًا»، ثم يأخذ محل الوظيفة النحوية التي ثبتت له.`;
  }

  if (id === "mafoolat_word_inflection") {
    if (roleKind === "visible") {
      if (pickedText.includes("مبني")) return `(${target}) اسم معرب تتغير علامته بحسب موقعه؛ لذلك نكمل إلى صورة الاسم وعلامة النصب.`;
      return `(${target}) اسم معرب، فنحدد صورته أولًا ثم علامة نصبه.`;
    }
    if (roleKind === "connected") {
      if (pickedText.includes("معرب")) return `(${target}) ضمير متصل، والضمائر من الأسماء المبنية؛ لذلك نحدد نوع المبني ثم نعربه في المحل المناسب.`;
      return `(${target}) ضمير متصل، والضمائر من الأسماء المبنية. بعد ثبوت البناء نحدد نوعه: ضمير متصل.`;
    }
    if (roleKind === "mabni") return `(${target}) اسم مبني يلزم صورة واحدة؛ لذلك نحدد نوع المبني ثم نذكر محله الإعرابي.`;
  }

  if (id === "mafoolat_shape") {
    const label = shapeLabel(shape);
    if (pickedText && !pickedText.includes(label)) {
      return `اخترتَ (${pickedText})، لكن صورة (${target}) هي (${label}). افحص عدد الاسم وبنيته أولًا؛ لأن نوع الاسم هو الذي سيقودنا إلى علامة النصب الصحيحة.`;
    }
    if (shape === "singular") return `انظر إلى (${target}): ليست مثنى ولا جمعًا ولا من الأسماء الخمسة؛ لذلك صورتها مفرد. بعد ذلك نختار علامة نصب المفرد.`;
    if (shape === "dual") return `انظر إلى (${target}): تدل على اثنين، فهي مثنى. والمثنى إذا كان منصوبًا تكون علامته الياء.`;
    if (shape === "jms") return `انظر إلى (${target}): تدل على جماعة من المذكرين بصيغة جمع المذكر السالم. لذلك ننتقل إلى علامة نصبه، وهي الياء.`;
    if (shape === "jfs") return `انظر إلى (${target}): جمع مؤنث سالم، ويظهر ذلك في صيغة الجمع بـ«ات». لذلك علامة نصبه الكسرة نيابةً عن الفتحة.`;
    if (shape === "jt") return `انظر إلى (${target}): هي جمع تغيّر فيه بناء المفرد، فهو جمع تكسير. وعلامة نصبه في الأصل الفتحة.`;
    if (shape === "five") return `انظر إلى (${target}): هي من الأسماء الخمسة وقد استوفت شروط الإعراب بالحروف: مفردة، مكبرة، مضافة، ومضافة إلى غير ياء المتكلم. ومع «ذو» نشترط أن تكون بمعنى «صاحب»، ومع «فو» أن تكون خالية من الميم. لذلك نبحث عن علامة النصب الخاصة بها: الألف.`;
    return `عرفنا أن (${target}) اسم ظاهر معرب منصوب. حدّد نوعه أولًا (${label}) قبل اختيار العلامة.`;
  }

  if (id === "mafoolat_mark") {
    const correctMarkText = nasbMark === "fatha" ? "الفتحة الظاهرة" : nasbMark === "yaa" ? "الياء" : nasbMark === "kasra" ? "الكسرة نيابةً عن الفتحة" : nasbMark === "alif" ? "الألف" : "علامة النصب المناسبة";
    const correctMarkHead = correctMarkText.split(" ")[0] ?? "";
    if (pickedText && correctMarkHead && !pickedText.includes(correctMarkHead)) {
      return `اخترتَ (${pickedText})، لكن (${target}) ${shapeLabel(shape)} منصوب؛ وعلامة نصب هذا النوع هنا هي (${correctMarkText}). اربط العلامة بصورة الاسم، لا باسم الوظيفة فقط.`;
    }
    if (nasbMark === "fatha") return `بما أن (${target}) ${shapeLabel(shape)} في موقع منصوب، فعلامة النصب هنا الفتحة الظاهرة. عد واختر «الفتحة الظاهرة».`;
    if (nasbMark === "yaa") return `بما أن (${target}) ${shapeLabel(shape)} في موقع منصوب، فعلامة نصبه الياء. عد واختر «الياء».`;
    if (nasbMark === "kasra") return `بما أن (${target}) جمع مؤنث سالم منصوب، فالكسرة تنوب عن الفتحة في نصبه. عد واختر «الكسرة نيابةً عن الفتحة».`;
    if (nasbMark === "alif") return `بما أن (${target}) من الأسماء الخمسة وقد استوفت شروط الإعراب بالحروف: مفردة، مكبرة، مضافة، ومضافة إلى غير ياء المتكلم؛ فعلامة نصبها الألف. ومع «ذو» تكون بمعنى «صاحب»، ومع «فو» تكون خالية من الميم. عد واختر «الألف».`;
    return `لا تختَر العلامة من اسم الوظيفة وحده. الموقع أعطانا النصب، ونوع (${target}) هو الذي يحدد العلامة.`;
  }

  if (id === "mafoolat_mabni_type") {
    const mabniType = factText(facts, "mabniType", "");
    if (roleKind === "connected") return `(${target}) ضمير متصل، والضمائر من الأسماء المبنية؛ وبما أنه شغل موقع المفعول به فهو ضمير متصل مبني في محل نصب مفعول به.`;
    if (mabniType === "ishara") return `(${target}) يدل بالإشارة إلى شيء معين، فهو اسم إشارة مبني. وبما أنه شغل موقع ${mafoolLabel} نقول: اسم إشارة مبني في محل نصب ${mafoolLabel}.`;
    if (mabniType === "mawsool") return `(${target}) يحتاج إلى صلة تتم معناه، فهو اسم موصول مبني. وبما أنه شغل موقع ${mafoolLabel} نقول: اسم موصول مبني في محل نصب ${mafoolLabel}.`;
    return `(${target}) اسم مبني؛ حدّد نوعه أولًا، ثم اذكر أنه في محل نصب بحسب الموقع الذي اكتشفناه.`;
  }

  const pickedHint = String(picked?.hint || "").trim();
  if (pickedHint) return pickedHint;
  return node?.hint;
}
