export type PracticeOuterCase = "raf3" | "nasb" | "jarr" | "jazm" | null;
export type PracticeOptionScope = "routing" | "structure" | "verb" | "role" | "case" | "generic";
export type PracticeGuidance = { level1: string[]; level2: string[]; correction: string[] };
export type PracticeTargetUnit =
  | "word"
  | "verbal-sentence"
  | "nominal-sentence"
  | "shibh-jar"
  | "shibh-zarf";

type Facts = Record<string, unknown>;
type ArabicCase = "مرفوع" | "منصوب" | "مجرور" | "مجزوم";
type NominalForm = "singular" | "dual" | "jms" | "jfs" | "five" | "maqsur" | "manqus" | "attached-ya";

const ROLE_RE = /(?:^|[\s،؛:.])(?:مبتدأ|خبر|فاعل|نائب فاعل|مفعول(?: به| فيه| معه| مطلق| لأجله)?|حال|تمييز|منادى|مضاف إليه|مستثنى|نعت|معطوف|توكيد|بدل|اسم كان|خبر كان|اسم إن|خبر إن|اسم لا|خبر لا|اسم الفعل الناسخ|خبر الفعل الناسخ)(?=$|[\s،؛:.])/u;

function clean(value: unknown): string {
  return String(value ?? "")
    .normalize("NFKC")
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/gu, "")
    .replace(/[«»]/gu, "")
    .replace(/\s+/gu, " ")
    .trim();
}

function oneLine(value: unknown): string {
  return String(value ?? "").replace(/\s*\n+\s*/gu, " ").replace(/\s+/gu, " ").trim();
}

function comparable(value: string): string {
  return clean(value).replace(/[.!؟،؛:\s]+$/gu, "").trim();
}

export function practiceTargetUnit(
  facts: Facts = {},
  resultText = "",
): PracticeTargetUnit {
  const khabarKind = String(facts.khabarKind || "").toLowerCase();
  const sentenceType = String(facts.sentenceType || "").toLowerCase();
  const shibhType = String(facts.shibhType || "").toLowerCase();
  const halKind = String(facts.halKind || "").toLowerCase();
  const roleKind = String(facts.roleKind || "").toLowerCase();
  const phraseKind = clean(facts.phraseKind);

  if (khabarKind === "sentence") {
    return sentenceType === "nominal" ? "nominal-sentence" : "verbal-sentence";
  }
  if (khabarKind === "shibh") {
    return shibhType === "zarf" ? "shibh-zarf" : "shibh-jar";
  }

  if (halKind === "verbal_sentence") return "verbal-sentence";
  if (halKind === "nominal_sentence") return "nominal-sentence";
  if (halKind === "shibh") {
    return /ظرف/u.test(phraseKind) ? "shibh-zarf" : "shibh-jar";
  }

  if (roleKind === "sentence") {
    return /اسمية/u.test(phraseKind) ? "nominal-sentence" : "verbal-sentence";
  }
  if (roleKind === "shibh") {
    return /ظرف/u.test(phraseKind) ? "shibh-zarf" : "shibh-jar";
  }

  const value = clean(resultText);
  if (/جملة فعلية/u.test(value)) return "verbal-sentence";
  if (/جملة اسمية/u.test(value)) return "nominal-sentence";
  if (/شبه جملة ظرفية/u.test(value)) return "shibh-zarf";
  if (/شبه جملة من الجار والمجرور|جار ومجرور.*في محل/u.test(value)) return "shibh-jar";
  return "word";
}

function same(first: string, second: string): boolean {
  return comparable(first) === comparable(second);
}

function prefixOf(text: string): string {
  return String(text || "").match(
    /^([^:：\n.!؟،؛]{1,40}[:：]\s*)/u,
  )?.[1] || "";
}

function bodyOf(text: string): string {
  const prefix = prefixOf(text);
  return prefix ? String(text).slice(prefix.length).trim() : String(text).trim();
}

function primaryResultClause(text: string): string {
  return clean(bodyOf(text)).split(/\.\s+/u)[0]?.trim() || clean(bodyOf(text));
}

type RoutingClassification = "noun" | "verb" | "particle" | "past" | "present" | "imperative" | null;

function routingClassification(text: string): RoutingClassification {
  const value = clean(bodyOf(text))
    .replace(/[.!؟،؛:]+$/gu, "")
    .trim();

  const hasRoutingCue =
    /(?:ننتقل|سننتقل|انتقل|الخطوة التالية|المسار التالي|إلى مسار|إلى شجرة|إلى خوارزمية|خوارزمية إعراب)/u.test(
      value,
    );

  const direct = value.match(
    /^(?:الكلمة الأولى\s+)?(فعل مضارع|فعل ماض|فعل أمر|مضارع|ماض|أمر|اسم|فعل|حرف)(?=$|[؛،.])/u,
  )?.[1];

  const toKind = (match?: string): RoutingClassification => {
    if (match === "فعل مضارع" || match === "مضارع") return "present";
    if (match === "فعل ماض" || match === "ماض") return "past";
    if (match === "فعل أمر" || match === "أمر") return "imperative";
    if (match === "اسم") return "noun";
    if (match === "فعل") return "verb";
    if (match === "حرف") return "particle";
    return null;
  };

  if (direct && (hasRoutingCue || comparable(value) === comparable(direct))) {
    return toKind(direct);
  }

  if (/^حرف مبني لا محل له من الإعراب، وبعده (?:فعل|اسم)/u.test(value)) {
    return "particle";
  }

  if (hasRoutingCue) {
    if (/(?:الفعل المضارع|فعل مضارع|مضارع)/u.test(value)) return "present";
    if (/(?:الفعل الماضي|فعل ماض|ماض)/u.test(value)) return "past";
    if (/(?:فعل الأمر|فعل أمر|الأمر)/u.test(value)) return "imperative";
    if (/(?:مسار الاسم|شجرة الاسم|إعراب الاسم)/u.test(value)) return "noun";
    if (/(?:مسار الحرف|شجرة الحرف|إعراب الحرف)/u.test(value)) return "particle";
    if (/(?:مسار الفعل|شجرة الفعل|إعراب الفعل)/u.test(value)) return "verb";
  }

  return null;
}

function routingClassificationFromFacts(facts: Facts): RoutingClassification {
  const wordType = clean(facts.wordType).toLowerCase();
  const verbType = clean(facts.verbType).toLowerCase();

  if (["past", "ماض", "ماضي"].includes(verbType)) return "past";
  if (["present", "مضارع"].includes(verbType)) return "present";
  if (["imperative", "command", "أمر"].includes(verbType)) return "imperative";
  if (["noun", "اسم"].includes(wordType)) return "noun";
  if (["particle", "حرف"].includes(wordType)) return "particle";
  if (["verb", "فعل"].includes(wordType)) return "verb";
  return null;
}

export function practiceOuterCase(text: string): PracticeOuterCase {
  const value = clean(text);
  const mahal = value.match(/في محل (رفع|نصب|جر|جزم)/u)?.[1];
  if (mahal === "رفع") return "raf3";
  if (mahal === "نصب") return "nasb";
  if (mahal === "جر") return "jarr";
  if (mahal === "جزم") return "jazm";
  if (/(?:^|\s)مرفوع(?:\s|،|\.|$)/u.test(value)) return "raf3";
  if (/(?:^|\s)منصوب(?:\s|،|\.|$)/u.test(value)) return "nasb";
  if (/(?:^|\s)مجرور(?:\s|،|\.|$)/u.test(value)) return "jarr";
  if (/(?:^|\s)مجزوم(?:\s|،|\.|$)/u.test(value)) return "jazm";
  return null;
}

export function isPracticeStructuredResult(text: string): boolean {
  // ملاحظة جملة الصلة تشرح الاسم الموصول، وليست هي وحدة الهدف نفسها.
  const value = clean(text).replace(
    /،?\s*(?:و)?جملة الصلة[^.؛]*[.؛]?/gu,
    "",
  );

  return (
    /(?:(?:ال)?جملة (?:ال)?(?:فعلية|اسمية)|شبه جملة|جار ومجرور)/u.test(value) &&
    /(?:في محل (?:رفع|نصب|جر|جزم)|لا محل لها)/u.test(value)
  );
}

function isFullVerbResult(text: string): boolean {
  const value = clean(text);
  return (
    /فعل\s+(?:ماض|مضارع|أمر)/u.test(value) &&
    /(?:مبني(?: على)?|معرب|مرفوع|منصوب|مجزوم|علامة (?:رفعه|نصبه|جزمه|بنائه)|في محل)/u.test(value)
  );
}

export function practiceOptionScope(label: string): PracticeOptionScope {
  const value = clean(label);
  const primary = primaryResultClause(label);

  if (routingClassification(value) !== null) return "routing";
  if (isPracticeStructuredResult(primary)) return "structure";

  // نتيجة الفعل الكاملة تُحسم قبل البحث عن أدوار الأسماء.
  // وإلا فإن ألفاظًا داخل سبب البناء مثل «نون التوكيد»
  // قد تُفهم خطأً على أنها دور نحوي من ROLE_RE.
  if (isFullVerbResult(primary) && /^فعل\s+(?:ماض|مضارع|أمر)/u.test(primary)) return "verb";

  if (ROLE_RE.test(primary)) return "role";
  if (/(?:مرفوع|منصوب|مجرور|مجزوم|مبني|معرب)/u.test(primary)) return "case";
  return "generic";
}

function nominalForm(text: string): NominalForm {
  const value = clean(text);
  if (/جمع مؤنث سالم/u.test(value)) return "jfs";
  if (/جمع مذكر سالم/u.test(value)) return "jms";
  if (/مثنى/u.test(value)) return "dual";
  if (/الأسماء الخمسة/u.test(value)) return "five";
  if (/مقصور|الألف.*التعذر/u.test(value)) return "maqsur";
  if (/منقوص/u.test(value)) return "manqus";
  if (/ياء المتكلم/u.test(value)) return "attached-ya";
  return "singular";
}

function caseName(value: ArabicCase): "رفع" | "نصب" | "جر" | "جزم" {
  return value === "مرفوع" ? "رفع" : value === "منصوب" ? "نصب" : value === "مجرور" ? "جر" : "جزم";
}

function markerClause(grammaticalCase: ArabicCase, form: NominalForm): string {
  const c = caseName(grammaticalCase);
  const markerWord = c === "رفع" ? "رفعه" : c === "نصب" ? "نصبه" : c === "جر" ? "جره" : "جزمه";
  let marker = "";
  if (form === "jfs") marker = c === "رفع" ? "الضمة الظاهرة على آخره لأنه جمع مؤنث سالم" : c === "نصب" ? "الكسرة نيابة عن الفتحة لأنه جمع مؤنث سالم" : "الكسرة الظاهرة على آخره لأنه جمع مؤنث سالم";
  else if (form === "jms") marker = c === "رفع" ? "الواو لأنه جمع مذكر سالم" : "الياء لأنه جمع مذكر سالم";
  else if (form === "dual") marker = c === "رفع" ? "الألف لأنه مثنى" : "الياء لأنه مثنى";
  else if (form === "five") marker = c === "رفع" ? "الواو لأنه من الأسماء الخمسة" : c === "نصب" ? "الألف لأنه من الأسماء الخمسة" : "الياء لأنه من الأسماء الخمسة";
  else if (form === "maqsur") marker = c === "رفع" ? "الضمة المقدرة على الألف للتعذر" : c === "نصب" ? "الفتحة المقدرة على الألف للتعذر" : "الكسرة المقدرة على الألف للتعذر";
  else if (form === "manqus") marker = c === "رفع" ? "الضمة المقدرة على الياء للثقل" : c === "نصب" ? "الفتحة الظاهرة على الياء" : "الكسرة المقدرة على الياء للثقل";
  else if (form === "attached-ya") marker = c === "رفع" ? "الضمة المقدرة على ما قبل ياء المتكلم" : c === "نصب" ? "الفتحة المقدرة على ما قبل ياء المتكلم" : "الكسرة المقدرة على ما قبل ياء المتكلم";
  else marker = c === "رفع" ? "الضمة الظاهرة على آخره" : c === "نصب" ? "الفتحة الظاهرة على آخره" : c === "جر" ? "الكسرة الظاهرة على آخره" : "السكون";
  return `وعلامة ${markerWord} ${marker}`;
}

function coherentCaseMarker(text: string): boolean {
  const value = clean(text);
  if (/مرفوع/u.test(value) && /علامة (?:نصبه|جره|جزمه)/u.test(value)) return false;
  if (/منصوب/u.test(value) && /علامة (?:رفعه|جره|جزمه)/u.test(value)) return false;
  if (/مجرور/u.test(value) && /علامة (?:رفعه|نصبه|جزمه)/u.test(value)) return false;
  if (/مجزوم/u.test(value) && /علامة (?:رفعه|نصبه|جره)/u.test(value)) return false;
  return true;
}

function structuredRoleExpectedMahal(text: string): "رفع" | "نصب" | "جر" | "جزم" | "" {
  const value = clean(text);

  // نقرأ الوظيفة المكتوبة مباشرة بعد «في محل» فقط.
  // بهذا لا تُفهم ألفاظ داخلية مثل «واو الحال» على أنها وظيفة التركيب كله.
  const match = value.match(
    /في محل (رفع|نصب|جر|جزم) (اسم الفعل الناسخ|خبر الفعل الناسخ|اسم كان|خبر كان|اسم إن|خبر إن|حال|نعت|خبر|مضاف إليه)/u,
  );
  if (!match) return "";

  const actual = match[1] as "رفع" | "نصب" | "جر" | "جزم";
  const role = match[2] || "";

  if (/^(?:اسم الفعل الناسخ|اسم كان|خبر إن|خبر)$/u.test(role)) return "رفع";
  if (/^(?:خبر الفعل الناسخ|خبر كان|اسم إن|حال)$/u.test(role)) return "نصب";
  if (role === "مضاف إليه") return "جر";

  // النعت يتبع متبوعه؛ لذلك يكفي اتساق المحل المكتوب نفسه.
  return actual;
}

function coherentFixedRole(text: string): boolean {
  const value = clean(text);
  if (/اسم لا(?: النافية للجنس)?/u.test(value) && /في محل/u.test(value)) {
    return /في محل نصب/u.test(value);
  }

  const structuredExpected = structuredRoleExpectedMahal(value);
  const structuredActual = value.match(/في محل (رفع|نصب|جر|جزم)/u)?.[1] || "";
  if (structuredExpected && structuredActual) {
    return structuredExpected === structuredActual;
  }

  const actual = value.match(/(?:^|\s)(مرفوع|منصوب|مجرور|مجزوم)(?:\s|،|\.|$)/u)?.[1];
  if (!actual) return true;
  const expected = /(?:اسم الفعل الناسخ|اسم كان|فاعل|نائب فاعل|مبتدأ)/u.test(value) ? "مرفوع"
    : /(?:خبر الفعل الناسخ|خبر كان|اسم إن|مفعول (?:به|فيه|لأجله|معه|مطلق)|حال|تمييز|منادى (?:مضاف|شبيه بالمضاف|نكرة غير مقصودة))/u.test(value) ? "منصوب"
      : /(?:خبر إن|خبر لا)/u.test(value) ? "مرفوع"
        : /مضاف إليه/u.test(value) ? "مجرور"
          : "";
  return !expected || actual === expected;
}

export function practiceGrammarPolicyAllows(correct: string, candidate: string): boolean {
  const source = clean(correct);
  const value = clean(candidate);
  const sourceScope = practiceOptionScope(correct);
  const candidateScope = practiceOptionScope(candidate);

  if (!value || sourceScope !== candidateScope) return false;
  if (!coherentCaseMarker(value)) return false;
  // نتائج الأفعال قد تتبعها جملة مستقلة تصف الفاعل؛ لا يجوز أن تُقرأ كلمة
  // «فاعل» في هذا الذيل بوصفها وظيفة الفعل نفسه.
  if (sourceScope !== "verb" && !coherentFixedRole(value)) return false;
  if (/مبتدأ الفعل الناسخ/u.test(value)) return false;

  // قيود الإعراب الكامل تخص نتائج الأفعال فقط، ولا تمتد إلى قرار التصنيف/التوجيه.
  if (sourceScope === "verb" && /فعل مضارع/u.test(source)) {
    if (!/فعل مضارع/u.test(value) || /(?:^|\s)مجرور(?:\s|،|\.|$)/u.test(value)) return false;
    const outer = practiceOuterCase(value);
    if (outer && !["raf3", "nasb", "jazm"].includes(outer)) return false;
  }

  if (sourceScope === "verb" && /فعل (?:ماض|أمر)/u.test(source)) {
    const tense = /فعل ماض/u.test(source) ? /فعل ماض/u : /فعل أمر/u;
    if (!tense.test(value) || /(?:^|\s)معرب(?:\s|،|\.|$)|(?:^|\s)(?:مرفوع|منصوب|مجرور|مجزوم)(?:\s|،|\.|$)/u.test(value)) return false;
  }

  if (sourceScope !== "verb" && !isPracticeStructuredResult(source) && /(?:^|\s)مجزوم(?:\s|،|\.|$)/u.test(value)) return false;
  if (isPracticeStructuredResult(source) && !isPracticeStructuredResult(value)) return false;
  return true;
}

function dedupe(correct: string, candidates: string[]): string[] {
  const output: string[] = [];
  for (const candidate of candidates.map(oneLine)) {
    if (!candidate || same(candidate, correct) || !practiceGrammarPolicyAllows(correct, candidate)) continue;
    if (!output.some((item) => same(item, candidate))) output.push(candidate);
  }
  return output.slice(0, 2);
}

function routingDistractors(correct: string, facts: Facts = {}): string[] {
  const prefix = prefixOf(correct);
  const kind = routingClassificationFromFacts(facts) || routingClassification(correct);
  const value = clean(correct);
  const wrap = (label: string) => `${prefix}${label}.`;

  const firstWordVerb = (verbKind: Exclude<RoutingClassification, "noun" | "verb" | "particle" | null>) => {
    if (verbKind === "past") return "الكلمة الأولى فعل ماضٍ؛ الخطوة التالية تحديد علامة البناء.";
    if (verbKind === "present") return "الكلمة الأولى فعل مضارع؛ الخطوة التالية فحص اتصال نون النسوة أو نون التوكيد أولًا.";
    return "الكلمة الأولى فعل أمر؛ الخطوة التالية فحص الاتصال وآخر الفعل.";
  };

  if (/^حرف مبني لا محل له من الإعراب، وبعده (?:فعل|اسم)/u.test(value)) {
    const after = clean(facts.afterParticle);
    if (after === "verb" || /بعده فعل/u.test(value)) {
      return [correct.replace(/بعده فعل/u, "بعده اسم")];
    }
    if (after === "noun" || /بعده اسم/u.test(value)) {
      return [correct.replace(/بعده اسم/u, "بعده فعل")];
    }
  }

  if (/^الكلمة الأولى فعل/u.test(value)) {
    const kinds = ["past", "present", "imperative"] as const;
    return kinds.filter((item) => item !== kind).map(firstWordVerb);
  }

  if (kind === "present") return [wrap("فعل ماضٍ"), wrap("فعل أمر")];
  if (kind === "past") return [wrap("فعل مضارع"), wrap("فعل أمر")];
  if (kind === "imperative") return [wrap("فعل مضارع"), wrap("فعل ماضٍ")];
  if (kind === "verb") return [wrap("اسم"), wrap("حرف")];
  if (kind === "noun") {
    if (/^الكلمة الأولى اسم/u.test(value)) {
      return [
        "الكلمة الأولى فعل؛ ننتقل بعدها إلى مسار الفعل لتحديد زمنه.",
        "الكلمة الأولى حرف؛ ننتقل بعدها إلى مسار الحرف بحسب ما يأتي بعده.",
      ];
    }
    return [wrap("فعل"), wrap("حرف")];
  }
  if (kind === "particle") {
    if (/^الكلمة الأولى حرف/u.test(value)) {
      return [
        "الكلمة الأولى اسم؛ ننتقل بعدها إلى مسار الاسم بحسب موقعه.",
        "الكلمة الأولى فعل؛ ننتقل بعدها إلى مسار الفعل لتحديد زمنه.",
      ];
    }
    return [wrap("اسم"), wrap("فعل")];
  }
  return [];
}

function structureDistractors(correct: string, facts: Facts = {}): string[] {
  const value = clean(correct);
  const unit = practiceTargetUnit(facts, correct);

  const finish = (candidate: string) =>
    candidate
      .replace(
        /((?:في محل (?:رفع|نصب|جر|جزم) (?:خبر الفعل الناسخ|اسم الفعل الناسخ|خبر كان|اسم كان|خبر إن|اسم إن|حال|نعت|خبر|مضاف إليه)|لا محل لها من الإعراب)(?: مقدم)?)[\s\S]*$/u,
        "$1.",
      )
      .replace(/\.\.+$/u, ".")
      .trim();

  const noMahal = () =>
    finish(
      correct.replace(
        /في محل (?:رفع|نصب|جر|جزم) (?:خبر الفعل الناسخ|اسم الفعل الناسخ|خبر كان|اسم كان|خبر إن|اسم إن|حال|نعت|خبر)/u,
        "لا محل لها من الإعراب",
      ),
    );

  if (unit === "shibh-jar" || unit === "shibh-zarf") {
    // في شبه الجملة نُبقي الوظيفة/المحل الخارجي ثابتين،
    // ونغيّر نوع التركيب فقط حتى لا يختلط الجر الداخلي بمحل الخبر.
    const alternatives = [
      "شبه جملة من الجار والمجرور",
      "شبه جملة ظرفية",
      "جملة اسمية",
      "جملة فعلية",
    ];
    const current = alternatives.find((item) => value.includes(item));

    if (current) {
      return alternatives
        .filter((item) => item !== current)
        .slice(0, 2)
        .map((item) => finish(correct.replace(current, item)));
    }
  }

  if (unit !== "word") {
    if (/في محل نصب خبر (?:الفعل الناسخ|كان)/u.test(value)) {
      return [
        finish(
          correct.replace(
            /في محل نصب خبر (الفعل الناسخ|كان)/u,
            (_match, label: string) => `في محل رفع اسم ${label}`,
          ),
        ),
        noMahal(),
      ];
    }

    if (/في محل رفع خبر إن/u.test(value)) {
      return [
        finish(correct.replace(/في محل رفع خبر إن/u, "في محل نصب اسم إن")),
        noMahal(),
      ];
    }

    if (/في محل رفع خبر(?! إن)/u.test(value)) {
      return [
        finish(correct.replace(/في محل رفع خبر/u, "في محل نصب حال")),
        noMahal(),
      ];
    }

    if (/في محل نصب حال/u.test(value)) {
      return [
        finish(correct.replace(/في محل نصب حال/u, "في محل رفع خبر")),
        noMahal(),
      ];
    }

    const naatMahal = value.match(/في محل (رفع|نصب|جر) نعت/u)?.[1];
    if (naatMahal) {
      const alternative =
        naatMahal === "رفع"
          ? "في محل رفع خبر"
          : naatMahal === "نصب"
            ? "في محل نصب حال"
            : "في محل جر مضاف إليه";
      return [
        finish(correct.replace(/في محل (?:رفع|نصب|جر) نعت/u, alternative)),
        noMahal(),
      ];
    }
  }

  const kinds = ["شبه جملة من الجار والمجرور", "شبه جملة ظرفية", "جملة اسمية", "جملة فعلية"];
  const current = kinds.find((item) => value.includes(item));
  return current
    ? kinds
        .filter((item) => item !== current)
        .slice(0, 2)
        .map((item) => correct.replace(current, item))
    : [];
}

function presentForm(facts: Facts, correct: string): "five" | "alif" | "waw" | "ya" | "sahih" {
  const value = clean(correct);
  if (facts.shape === "five" || /الأفعال الخمسة|ثبوت النون|حذف النون/u.test(value)) return "five";
  const weak = String(facts.weakLetter || "").toLowerCase();
  if (weak === "alif") return "alif";
  if (weak === "waw") return "waw";
  if (weak === "ya" || weak === "yaa") return "ya";
  return "sahih";
}

function presentCase(
  prefix: string,
  c: "raf3" | "nasb" | "jazm",
  form: ReturnType<typeof presentForm>,
  includeMarker = true,
): string {
  const caseWord = c === "raf3" ? "مرفوع" : c === "nasb" ? "منصوب" : "مجزوم";
  if (!includeMarker) return `${prefix}فعل مضارع ${caseWord}.`;

  let marker = "";
  if (form === "five") marker = c === "raf3" ? "وعلامة رفعه ثبوت النون؛ لأنه من الأفعال الخمسة" : c === "nasb" ? "وعلامة نصبه حذف النون؛ لأنه من الأفعال الخمسة" : "وعلامة جزمه حذف النون؛ لأنه من الأفعال الخمسة";
  else if (form === "alif") marker = c === "raf3" ? "وعلامة رفعه الضمة المقدرة على الألف للتعذر" : c === "nasb" ? "وعلامة نصبه الفتحة المقدرة على الألف للتعذر" : "وعلامة جزمه حذف حرف العلة";
  else if (form === "waw" || form === "ya") marker = c === "raf3" ? `وعلامة رفعه الضمة المقدرة على ${form === "waw" ? "الواو" : "الياء"} للثقل` : c === "nasb" ? "وعلامة نصبه الفتحة الظاهرة على آخره" : "وعلامة جزمه حذف حرف العلة";
  else marker = c === "raf3" ? "وعلامة رفعه الضمة الظاهرة على آخره" : c === "nasb" ? "وعلامة نصبه الفتحة الظاهرة على آخره" : "وعلامة جزمه السكون";
  return `${prefix}فعل مضارع ${caseWord}، ${marker}.`;
}

function verbDistractors(correct: string, facts: Facts): string[] {
  const value = clean(correct);
  const prefix = prefixOf(correct);
  if (/فعل مضارع/u.test(value)) {
    const connection = String(facts.buildConnection || "");
    if (/مبني/u.test(value) || connection === "niswa" || connection === "tawkid") {
      const isNiswa = /مبني على السكون/u.test(value) || connection === "niswa";
      const hasOuterMahal = /في محل (?:رفع|نصب|جزم)/u.test(value);
      const hasAttachmentDetail = /نون (?:النسوة|التوكيد):/u.test(value);

      // النتيجة المختصرة تبقى مختصرة؛ وهذا يحافظ على عقد السياسة المستقل
      // بدل تضخيم المشتتات بتفاصيل لا توجد أصلًا في السؤال.
      if (!hasOuterMahal && !hasAttachmentDetail) {
        return [
          isNiswa
            ? `${prefix}فعل مضارع مبني على الفتح لاتصاله بنون التوكيد.`
            : `${prefix}فعل مضارع مبني على السكون لاتصاله بنون النسوة.`,
          `${prefix}فعل مضارع معرب مرفوع؛ لم يتصل به ما يوجب البناء.`,
        ];
      }

      const currentOuter = practiceOuterCase(value) || "raf3";
      const currentMahal =
        currentOuter === "nasb"
          ? "نصب"
          : currentOuter === "jazm"
            ? "جزم"
            : "رفع";
      const alternativeMahal =
        currentOuter === "raf3" ? "نصب" : "رفع";

      const withAttachment = (
        build: "niswa" | "tawkid",
        mahal: "رفع" | "نصب" | "جزم",
      ) =>
        build === "niswa"
          ? `${prefix}فعل مضارع مبني على السكون لاتصاله بنون النسوة، في محل ${mahal}. نون النسوة: ضمير متصل مبني على الفتح في محل رفع فاعل.`
          : `${prefix}فعل مضارع مبني على الفتح لاتصاله المباشر بنون التوكيد، في محل ${mahal}. نون التوكيد: حرف توكيد لا محل له من الإعراب.`;

      return [
        withAttachment(isNiswa ? "tawkid" : "niswa", currentMahal),
        withAttachment(isNiswa ? "niswa" : "tawkid", alternativeMahal),
      ];
    }
    const current = practiceOuterCase(value);
    if (!current || current === "jarr") return [];
    const form = presentForm(facts, correct);
    const includeMarker = /علامة (?:رفعه|نصبه|جزمه)/u.test(value);
    const body = bodyOf(correct);
    const dotIndex = body.indexOf(".");
    const tail = dotIndex >= 0 ? body.slice(dotIndex + 1).trim() : "";
    return (["raf3", "nasb", "jazm"] as const)
      .filter((item) => item !== current)
      .map((item) => {
        const candidate = presentCase(prefix, item, form, includeMarker);
        return tail ? `${candidate} ${tail}` : candidate;
      });
  }
  if (/فعل ماض/u.test(value)) {
    const builds = ["الفتح", "السكون", "الضم"] as const;
    const current = builds.find((item) => value.includes(`مبني على ${item}`));
    const body = bodyOf(correct);
    const dotIndex = body.indexOf(".");
    const tail = dotIndex >= 0 ? body.slice(dotIndex + 1).trim() : "";
    const attachedObjectTail = body.match(
      /(،\s*(?:و)?(?:الهاء|الكاف|الياء|ياء المتكلم|نا)\s+ضمير متصل[^.]*\.)$/u,
    )?.[1] || "";
    const label = (item: (typeof builds)[number]) =>
      attachedObjectTail
        ? `${prefix}فعل ماضٍ مبني على ${item}${attachedObjectTail}`
        : `${prefix}فعل ماضٍ مبني على ${item}.${tail ? ` ${tail}` : ""}`;
    return builds.filter((item) => item !== current).slice(0, 2).map(label);
  }
  if (/فعل أمر/u.test(value)) {
    const builds = ["السكون", "حذف النون", "حذف حرف العلة", "الفتح"] as const;
    const current = builds.find((item) => value.includes(item));
    const body = bodyOf(correct);
    const dotIndex = body.indexOf(".");
    const tail = dotIndex >= 0 ? body.slice(dotIndex + 1).trim() : "";
    const label = (item: (typeof builds)[number]) =>
      `${prefix}فعل أمر مبني على ${item}.${tail ? ` ${tail}` : ""}`;
    return builds.filter((item) => item !== current).slice(0, 2).map(label);
  }
  return [];
}

function replaceCase(text: string, grammaticalCase: ArabicCase): string {
  const form = nominalForm(text);
  const targetCase = caseName(grammaticalCase);
  let candidate = text;

  if (/في محل (?:رفع|نصب|جر|جزم)/u.test(candidate)) {
    candidate = candidate.replace(/في محل (?:رفع|نصب|جر|جزم)/u, `في محل ${targetCase}`);
  } else {
    candidate = candidate.replace(/(مرفوع|منصوب|مجرور|مجزوم)/u, grammaticalCase);
  }

  if (/وعلامة (?:رفعه|نصبه|جره|جزمه)/u.test(clean(candidate))) {
    candidate = candidate.replace(/وعلامة (?:رفعه|نصبه|جره|جزمه)[^،.;؛]*/u, markerClause(grammaticalCase, form));
  }
  return candidate;
}

function specialRoleDistractors(correct: string): string[] {
  const value = clean(correct);
  const currentOuter = practiceOuterCase(correct);
  const swap = (from: RegExp, to: string, grammaticalCase?: ArabicCase) => {
    let candidate = correct.replace(from, to);
    if (grammaticalCase && currentOuter) candidate = replaceCase(candidate, grammaticalCase);
    return candidate;
  };

  if (/اسم الفعل الناسخ/u.test(value)) return [swap(/اسم الفعل الناسخ/u, "خبر الفعل الناسخ", "منصوب"), swap(/اسم الفعل الناسخ/u, "مبتدأ", "مرفوع")];
  if (/خبر الفعل الناسخ/u.test(value)) return [swap(/خبر الفعل الناسخ/u, "اسم الفعل الناسخ", "مرفوع"), swap(/خبر الفعل الناسخ/u, "خبر إن", "مرفوع")];
  if (/اسم كان/u.test(value)) return [swap(/اسم كان/u, "خبر كان", "منصوب"), swap(/اسم كان/u, "مبتدأ", "مرفوع")];
  if (/خبر كان/u.test(value)) return [swap(/خبر كان/u, "اسم كان", "مرفوع"), swap(/خبر كان/u, "خبر إن", "مرفوع")];
  if (/اسم إن/u.test(value)) return [swap(/اسم إن/u, "خبر إن", "مرفوع"), swap(/اسم إن/u, "مبتدأ", "مرفوع")];
  if (/خبر إن/u.test(value)) return [swap(/خبر إن/u, "اسم إن", "منصوب"), swap(/خبر إن/u, "خبر كان", "منصوب")];

  const munada = value.match(/منادى (مضاف|شبيه بالمضاف|نكرة غير مقصودة)/u)?.[1];
  if (munada) return ["مضاف", "شبيه بالمضاف", "نكرة غير مقصودة"].filter((item) => item !== munada).slice(0, 2).map((item) => correct.replace(/منادى (?:مضاف|شبيه بالمضاف|نكرة غير مقصودة)/u, `منادى ${item}`).replace(/،?\s*وهو مضاف\.?$/u, "."));

  if (/اسم.*لا.*النافية للجنس/u.test(value) && /في محل نصب/u.test(value)) {
    const prefix = prefixOf(correct);
    return [
      `${prefix}خبر «لا» النافية للجنس مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.`,
      `${prefix}اسم «لا» النافية للجنس منصوب، وعلامة نصبه الفتحة الظاهرة على آخره، وهو مضاف.`,
    ];
  }

  if (/اسم.*لا.*النافية للجنس/u.test(value) && /منصوب/u.test(value)) {
    const label = /اسم\s*[«»]?لا[«»]?\s*النافية للجنس/u;
    const first = replaceCase(
      correct.replace(label, "خبر «لا» النافية للجنس"),
      "مرفوع",
    );
    const second = /شبيه بالمضاف/u.test(value)
      ? correct.replace(/شبيه بالمضاف/u, "مضاف")
      : /مضاف/u.test(value)
        ? correct.replace(/مضاف/u, "شبيه بالمضاف")
        : first;
    return [first, second];
  }

  const roleGroups: Array<{ pattern: RegExp; alternatives: string[] }> = [
    { pattern: /مفعول معه/u, alternatives: ["مفعول فيه", "مفعول به"] },
    { pattern: /مفعول فيه/u, alternatives: ["مفعول به", "مفعول لأجله"] },
    { pattern: /مفعول لأجله/u, alternatives: ["مفعول فيه", "مفعول به"] },
    { pattern: /مفعول مطلق(?: مبين للعدد| مبين للنوع)?/u, alternatives: ["مفعول به", "مفعول فيه"] },
    { pattern: /مفعول به/u, alternatives: ["مفعول مطلق", "مفعول فيه"] },
    { pattern: /حال/u, alternatives: ["تمييز", "مفعول به"] },
    { pattern: /تمييز(?: ملفوظ| ملحوظ)?/u, alternatives: ["حال", "مفعول به"] },
    { pattern: /مبتدأ/u, alternatives: ["فاعل", "نائب فاعل"] },
    { pattern: /نائب فاعل/u, alternatives: ["فاعل", "مبتدأ"] },
    { pattern: /فاعل/u, alternatives: ["نائب فاعل", "مبتدأ"] },
    { pattern: /مضاف إليه/u, alternatives: ["نعت", "بدل"] },
    { pattern: /نعت/u, alternatives: ["بدل", "توكيد"] },
    { pattern: /بدل(?: اشتمال| بعض من كل)?/u, alternatives: ["نعت", "توكيد"] },
    { pattern: /توكيد(?: لفظي| معنوي)?/u, alternatives: ["نعت", "معطوف"] },
    { pattern: /معطوف/u, alternatives: ["توكيد", "نعت"] },
  ];

  for (const group of roleGroups) {
    if (!group.pattern.test(value)) continue;
    return group.alternatives.map((role) =>
      correct
        .replace(group.pattern, role)
        .replace(/\s*\((?:ظرف مكان|ظرف زمان)\)/u, ""),
    );
  }

  if (/^.*خبر(?! (?:كان|إن|الفعل الناسخ|لا))/u.test(value) && /مرفوع/u.test(value)) {
    return [correct.replace(/خبر/u, "مبتدأ"), correct.replace(/خبر/u, "فاعل")];
  }

  return [];
}

function manqousDistractors(correct: string, facts: Facts): string[] {
  const prefix = prefixOf(correct);
  const value = clean(correct);
  const actualCase =
    String(facts.case || "") === "nasb"
      ? "nasb"
      : String(facts.case || "") === "jar"
        ? "jarr"
        : String(facts.case || "") === "raf3"
          ? "raf3"
          : practiceOuterCase(value);
  const actualStatus = String(facts.yStatus || "");
  const keepsYaByContext = facts.hasAl === true || facts.isAdded === true;

  const render = (
    grammaticalCase: "raf3" | "nasb" | "jarr",
    status?: "kept" | "deleted",
  ) => {
    if (grammaticalCase === "nasb") {
      return `${prefix}اسم منقوص منصوب، وعلامة نصبه الفتحة الظاهرة على الياء.`;
    }
    const deleted =
      status === "deleted" ||
      (!status && !keepsYaByContext);
    if (grammaticalCase === "raf3") {
      return deleted
        ? `${prefix}اسم منقوص مرفوع، وعلامة رفعه الضمة المقدرة على الياء المحذوفة.`
        : `${prefix}اسم منقوص مرفوع، وعلامة رفعه الضمة المقدرة على الياء للثقل.`;
    }
    return deleted
      ? `${prefix}اسم منقوص مجرور، وعلامة جره الكسرة المقدرة على الياء المحذوفة.`
      : `${prefix}اسم منقوص مجرور، وعلامة جره الكسرة المقدرة على الياء للثقل.`;
  };

  if (actualCase === "nasb") {
    const hypotheticalStatus: "kept" | "deleted" =
      keepsYaByContext ? "kept" : "deleted";
    return [
      render("raf3", hypotheticalStatus),
      render("jarr", hypotheticalStatus),
    ];
  }

  if (actualCase === "raf3" || actualCase === "jarr") {
    const status: "kept" | "deleted" =
      actualStatus === "deleted" ? "deleted" : "kept";
    const oppositeStatus: "kept" | "deleted" =
      status === "kept" ? "deleted" : "kept";
    const otherCase = actualCase === "raf3" ? "jarr" : "raf3";
    return [
      render(actualCase, oppositeStatus),
      render(otherCase, status),
    ];
  }

  return [];
}

function caseDistractors(correct: string, facts: Facts = {}): string[] {
  if (/اسم منقوص/u.test(clean(correct))) {
    return manqousDistractors(correct, facts);
  }
  const value = clean(correct);
  const mahal = value.match(/في محل (رفع|نصب|جر)/u)?.[1];
  if (mahal) {
    return ["رفع", "نصب", "جر"]
      .filter((item) => item !== mahal)
      .map((item) => correct.replace(/في محل (?:رفع|نصب|جر)/u, `في محل ${item}`));
  }

  const current = value.match(/(?:^|\s)(مرفوع|منصوب|مجرور)(?:\s|،|\.|$)/u)?.[1] as ArabicCase | undefined;
  if (current) {
    return (["مرفوع", "منصوب", "مجرور"] as ArabicCase[])
      .filter((item) => item !== current)
      .map((item) => replaceCase(correct, item));
  }

  if (/(?:^|\s)معرب(?:\s|،|\.|$)/u.test(value)) {
    return [correct.replace(/معرب/u, "مبني"), `${prefixOf(correct)}اسم مبني.`];
  }
  if (/(?:^|\s)مبني(?:\s|،|\.|$)/u.test(value)) {
    return [correct.replace(/مبني/u, "معرب"), `${prefixOf(correct)}اسم معرب.`];
  }
  return [];
}

export function buildPracticePolicyDistractors(correct: string, facts: Facts = {}): string[] {
  const scope = practiceOptionScope(correct);
  const unit = practiceTargetUnit(facts, correct);
  const candidates = unit !== "word"
    ? structureDistractors(correct, facts)
    : scope === "routing" ? routingDistractors(correct, facts)
      : scope === "structure" ? structureDistractors(correct, facts)
        : scope === "verb" ? verbDistractors(correct, facts)
          : scope === "role" ? specialRoleDistractors(correct)
            : scope === "case" ? caseDistractors(correct, facts)
              : [];
  return dedupe(correct, candidates);
}

function roleOf(text: string): string {
  return clean(text).match(/(اسم الفعل الناسخ|خبر الفعل الناسخ|اسم كان|خبر كان|اسم إن|خبر إن)/u)?.[1] || "";
}

function formSummary(facts: Facts, text: string): string {
  const value = clean(text);
  if (/جمع مؤنث سالم/u.test(value)) return "جمع مؤنث سالم";
  if (/جمع مذكر سالم/u.test(value)) return "جمع مذكر سالم";
  if (/مثنى/u.test(value)) return "مثنى";
  if (/الأسماء الخمسة/u.test(value)) return "من الأسماء الخمسة";
  if (/مقصور/u.test(value)) return "اسم مقصور";
  if (/منقوص/u.test(value)) return "اسم منقوص";
  if (/ياء المتكلم/u.test(value)) return "اسم متصل بياء المتكلم";
  const number = String(facts.number || facts.shape || "");
  const ending = String(facts.ending || "");
  if (number === "jfs") return "جمع مؤنث سالم";
  if (number === "jms") return "جمع مذكر سالم";
  if (number === "dual") return "مثنى";
  if (number === "five") return "من الأسماء الخمسة";
  if (number === "singular" && ending === "sahih") return "اسم مفرد صحيح الآخر";
  if (number === "singular" && ending === "moatal") return "اسم مفرد معتل الآخر";
  return number === "singular" ? "اسم مفرد" : "";
}

function structureSummary(text: string): string {
  const value = clean(text);
  if (/شبه جملة من الجار والمجرور/u.test(value)) return "جار ومجرور، فهو شبه جملة";
  if (/شبه جملة ظرفية/u.test(value)) return "ظرف، فهو شبه جملة";
  if (/جملة اسمية/u.test(value)) return "جملة اسمية";
  if (/جملة فعلية/u.test(value)) return "جملة فعلية";
  return /شبه جملة/u.test(value) ? "شبه جملة" : "";
}

function nasikhGuidance(text: string, target: string, facts: Facts): PracticeGuidance | null {
  const role = roleOf(text);
  if (!role) return null;
  const outer = practiceOuterCase(text);
  const caseWord = outer === "raf3" ? "مرفوع" : outer === "nasb" ? "منصوب" : "";

  if (isPracticeStructuredResult(text)) {
    const structure = structureSummary(text);
    const roleText = role.replace(/الفعل الناسخ/u, "الناسخ");
    return {
      level1: [`هل «${target}» كلمة واحدة، أم جملة، أم شبه جملة؟`, /خبر/u.test(role) ? "إذا كان خبرًا للناسخ، فما محله الإعرابي؟" : "إذا كان اسمًا للناسخ، فما محله الإعرابي؟"],
      level2: [structure ? `«${target}»: ${structure}.` : `«${target}»: تركيب غير مفرد.`, `وظيفته ${roleText}.`, /مقدم/u.test(clean(text)) ? "بقي الترتيب: هل جاء الخبر قبل اسم الناسخ أم بعده؟" : "بقي أن تحدد موضع هذا التركيب في الجملة."],
      correction: [structure ? `«${target}»: ${structure}.` : `«${target}»: تركيب غير مفرد.`, `وظيفته ${roleText}.`, caseWord ? `${roleText} هنا في محل ${caseName(caseWord as ArabicCase)}.` : "ثم نحدد المحل الإعرابي للتركيب."],
    };
  }

  const form = formSummary(facts, text);
  return {
    level1: [/خبر/u.test(role) ? `هل «${target}» كلمة واحدة، أم جملة، أم شبه جملة؟` : `هل «${target}» هو اسم الناسخ أم خبره؟`, /خبر/u.test(role) ? "ما حكم خبر الناسخ: الرفع أم النصب؟" : "ما حكم اسم الناسخ: الرفع أم النصب؟"],
    level2: [caseWord ? `«${target}»: ${role} ${caseWord}.` : `«${target}»: ${role}.`, form ? `«${target}»: ${form}.` : "حدّد صورة الاسم لتعرف العلامة.", caseWord && form ? `بقيت العلامة: ما علامة ${caseName(caseWord as ArabicCase)} ${form}؟` : "بقيت العلامة: اختر العلامة المناسبة بنفسك."],
    correction: [/خبر/u.test(role) ? `«${target}» تتمم معنى الاسم بعد الناسخ؛ إذن موقعها ${role}.` : `«${target}» هو الاسم المسند إليه معنى الناسخ؛ إذن موقعه ${role}.`, caseWord ? `حكم ${role}: ${caseWord}.` : `حدّد حكم ${role}.`, form ? `«${target}»: ${form}.` : "حدّد صورة الاسم قبل اختيار العلامة."],
  };
}

function laGuidance(text: string, target: string, facts: Facts): PracticeGuidance | null {
  const value = clean(text);
  if (!/اسم.*لا.*النافية للجنس/u.test(value) && !(facts.laWorks === true && facts.isLaName === true)) return null;
  const kind = facts.laNameKind === "mudaf" ? "مضاف" : facts.laNameKind === "shibh" ? "شبيه بالمضاف" : facts.laNameKind === "mufrad" ? "مفرد" : /شبيه بالمضاف/u.test(value) ? "شبيه بالمضاف" : /مضاف/u.test(value) ? "مضاف" : "";
  const shape = facts.shape === "dual" ? "مثنى" : facts.shape === "jms" ? "جمع مذكر سالم" : facts.shape === "jfs" ? "جمع مؤنث سالم" : facts.shape === "singular" ? "مفرد" : formSummary(facts, text);
  return {
    level1: ["هل «لا» هنا نافية للجنس عاملة عمل «إنَّ»؟", `انظر إلى «${target}»: هل اسم «لا» مفرد، أم مضاف، أم شبيه بالمضاف؟`],
    level2: [`«لا» هنا نافية للجنس عاملة، و«${target}» اسمها.`, [kind, shape].filter(Boolean).length ? `«${target}»: ${[kind, shape].filter(Boolean).join("، وهو ")}.` : `حدّد صورة «${target}» قبل اختيار العلامة.`, shape ? `بقيت العلامة: ما علامة نصب ${shape}؟` : "بقيت العلامة: ما علامة نصب اسم «لا» هنا؟"],
    correction: ["«لا» هنا نافية للجنس عاملة عمل «إنَّ».", `«${target}» اسم «لا»${kind ? `، وهو ${kind}` : ""}.`, shape ? `حدّد علامة النصب المناسبة لـ${shape}.` : "حدّد صورة الاسم ثم اختر علامة النصب المناسبة."],
  };
}

function manqousGuidance(text: string, target: string, facts: Facts): PracticeGuidance | null {
  if (!/اسم منقوص/u.test(clean(text))) return null;
  const c = facts.case === "raf3" ? "رفع" : facts.case === "nasb" ? "نصب" : facts.case === "jar" ? "جر" : practiceOuterCase(text) === "raf3" ? "رفع" : practiceOuterCase(text) === "nasb" ? "نصب" : practiceOuterCase(text) === "jarr" ? "جر" : "";
  const caseWord = c === "رفع" ? "مرفوع" : c === "نصب" ? "منصوب" : c === "جر" ? "مجرور" : "";
  const yLine = facts.yStatus === "kept" ? facts.hasAl === true ? "الياء ثابتة لأنه معرّف بـ«الـ»." : facts.isAdded === true ? "الياء ثابتة لأنه مضاف." : "الياء ثابتة في هذه الصورة." : facts.yStatus === "dropped" ? "الياء محذوفة في هذه الصورة." : "انظر إلى ثبوت الياء أو حذفها في هذه الصورة.";
  return {
    level1: ["هل الكلمة اسم معرب آخره ياء لازمة مكسور ما قبلها، مثل: القاضي والساعي؟", "ما الحالة الإعرابية للاسم المنقوص في الجملة؟"],
    level2: [caseWord ? `«${target}»: اسم منقوص، وهو هنا ${caseWord}.` : `«${target}»: اسم منقوص.`, yLine, c ? `بقيت العلامة: هل تظهر حركة ${c} على الياء أم تُقدَّر؟` : "بقيت العلامة: هل تظهر الحركة على الياء أم تُقدَّر؟"],
    correction: [`«${target}» اسم منقوص.`, caseWord ? `حالته الإعرابية هنا: ${caseWord}.` : "حدّد حالته الإعرابية من موقعه.", yLine],
  };
}

export function buildPracticePolicyGuidance(args: { resultText: string; target: string; facts?: Facts }): PracticeGuidance {
  const facts = args.facts || {};
  const empty: PracticeGuidance = { level1: [], level2: [], correction: [] };
  const text = oneLine(args.resultText);
  if (!text) return empty;
  return laGuidance(text, args.target, facts) || manqousGuidance(text, args.target, facts) || nasikhGuidance(text, args.target, facts) || empty;
}

export function normalizePracticeDecisionWording(text: string): string {
  return String(text || "")
    .replace(/عرفنا أنه معرب\s*[,،:]?\s*يوجد ناصب ولا جازم/gu, "عرفنا أنه معرب، ولا يسبقه ناصب ولا جازم")
    .replace(/(?:لم\s+)?يوجد\s+(?:قبله\s+)?ناصب\s+(?:و|أو)?لا\s+جازم/gu, "لا يسبقه ناصب ولا جازم")
    .replace(/لم\s+يسبقه\s+ناصب\s+أو\s+جازم/gu, "لا يسبقه ناصب ولا جازم")
    .replace(/لا\s+ناصب\s+ولا\s+جازم/gu, "لا يسبقه ناصب ولا جازم")
    .replace(/\s+/gu, " ")
    .trim();
}
