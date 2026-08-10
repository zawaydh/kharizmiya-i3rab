import type { Example } from "./types";

function normalizeQuestion(text: string) {
  return String(text || "").replace(/\\n/g, "\n").replace(/[ \t]+/g, " ").trim();
}

function quotedTarget(target?: string) {
  return target ? `«${target}»` : "الكلمة";
}

function placeTarget(text: string, target?: string) {
  if (!target || text.includes(`«${target}»`)) return text;
  const quoted = quotedTarget(target);
  const replacements: Array<[RegExp, string]> = [
    [/هذه الكلمة أو هذا التركيب/u, quoted],
    [/هذه الكلمة/u, quoted],
    [/هذا التركيب/u, quoted],
    [/هذا الاسم/u, quoted],
    [/هذا الفعل/u, quoted],
    [/الكلمة هنا/u, quoted],
    [/الاسم هنا/u, quoted],
    [/الفعل هنا/u, quoted],
    [/المبتدأ هنا/u, `المبتدأ ${quoted}`],
    [/الخبر هنا/u, `الخبر ${quoted}`],
    [/الكلمة المحددة|الاسم المحدد|الفعل المحدد|المحدد/u, quoted],
  ];
  for (const [pattern, value] of replacements) {
    if (pattern.test(text)) return text.replace(pattern, value);
  }
  return text.replace(/[؟?]\s*$/u, ` ${quoted}؟`);
}

function visualNodeQuestion(nodeId: string, target: string | undefined, example: Example | null) {
  const quoted = quotedTarget(target);
  const particleLabel = String(example?.facts?.particleLabel || "").trim();
  const particle = particleLabel ? `«${particleLabel}»` : "الحرف الناسخ";
  const questions: Record<string, string> = {
    inna_kaffa_effect: `ما أثر «ما» الكافة في عمل ${particle}؟`,
    inna_kaffa_base_role: `ما وظيفة ${quoted} بعد «إنما»؟`,
    inna_meaning: `ما الذي يشمله معنى ${particle} في الجملة؟`,
    inna_compact_role: `ما وظيفة ${quoted} بعد ${particle}؟`,
    inna_ism_start: `ما طبيعة اسم الحرف الناسخ ${quoted}؟`,
    inna_ism_number: `ما صورة اسم الحرف الناسخ المعرب ${quoted}؟`,
    inna_ism_ending: `ما حالة آخر اسم الحرف الناسخ ${quoted}؟`,
    inna_ism_built: `ما نوع اسم الحرف الناسخ المبني ${quoted}؟`,
    inna_khabar_kind: `ما نوع خبر الحرف الناسخ ${quoted}؟`,
    inna_khabar_single_start: `ما طبيعة الخبر المفرد ${quoted}؟`,
    inna_khabar_single_number: `ما صورة الخبر المفرد المعرب ${quoted}؟`,
    inna_khabar_single_ending: `ما حالة آخر الخبر المفرد ${quoted}؟`,
    inna_khabar_single_built: `ما نوع الخبر المبني ${quoted}؟`,
    inna_khabar_sentence_type: `ما نوع الجملة الواقعة خبرًا ${quoted}؟`,
    inna_khabar_shibh_type: `ما نوع شبه الجملة الواقعة خبرًا ${quoted}؟`,
    inna_khabar_shibh_position_jar: `ما موقع الجار والمجرور ${quoted} بالنسبة إلى اسم الحرف الناسخ؟`,
    inna_khabar_shibh_position_zarf: `ما موقع الظرف ${quoted} بالنسبة إلى اسم الحرف الناسخ؟`,
  };
  if (nodeId === "inna_kaffa_gate") {
    return particleLabel.endsWith("ما")
      ? `هل «ما» في ${particle} كافة تكف الحرف عن العمل؟`
      : `هل اتصلت «ما» بـ${particle} في الجملة؟`;
  }
  return questions[nodeId] || "";
}

function contextualQuestion(text: string, target?: string) {
  const quoted = quotedTarget(target);
  if (/^عرفنا أن آخر الفعل اتصل به شيء/u.test(text)) {
    return `ما نوع المتصل بآخر الفعل ${quoted}؟`;
  }
  if (/^هل اتصل بآخر فعل الأمر شيء/u.test(text)) {
    return `ما حال آخر فعل الأمر ${quoted}؟`;
  }
  if (/^هل بدأت جملة الخبر باسم أم بفعل/u.test(text)) {
    return `بماذا بدأت جملة الخبر ${quoted}؟`;
  }
  if (/^هل جاء بعد هذا الجار والمجرور اسم نكرة/u.test(text)) {
    return `ما موقع الجار والمجرور ${quoted} في الجملة؟`;
  }
  if (/^هل جاء بعد هذا الظرف اسم نكرة/u.test(text)) {
    return `ما موقع الظرف ${quoted} في الجملة؟`;
  }
  return text;
}

export function compactQuestion(raw: string, target?: string) {
  const quoted = quotedTarget(target);
  let text = normalizeQuestion(raw)
    .replace(/الكلمة المحددة|الكلمة المطلوبة|الكلمة المستهدفة/g, quoted)
    .replace(/الفعل المحدد/g, `الفعل ${quoted}`)
    .replace(/الاسم المحدد/g, `الاسم ${quoted}`)
    .replace(/^بالنظر إلى «[^»]+»[:：]\s*/u, "")
    .replace(/اختر الإجابة الصحيحة مما (?:يلي|يأتي)[:：]?/u, "")
    .replace(/اختر الإجابة المناسبة مما (?:يلي|يأتي)[:：]?/u, "")
    .replace(/^أي(?:ُّ|ّ|ُ)?\s+الخيارات الآتية يصف\s+/u, "ما ")
    .replace(/^أي(?:ُّ|ّ|ُ)?\s+الخيارات التالية يصف\s+/u, "ما ")
    .replace(/^اختر نوع\s+/u, "ما نوع ")
    .replace(/[:：]\s*$/u, "؟")
    .replace(/\s+([؟?])/gu, "$1")
    .trim();

  text = contextualQuestion(text, target);
  text = placeTarget(text, target);
  return text.replace(/\s+هنا(?=\s*«)/u, "");
}

function choiceStem(label: string) {
  return (normalizeQuestion(label).split(/[：:]/u)[0] ?? "")
    .replace(/^(?:خبر|اسم|فعل)\s+/u, "")
    .trim();
}

function semanticStem(text: string, target?: string) {
  const quoted = quotedTarget(target);
  if (/خبر (?:إن|الحرف الناسخ)/u.test(text)) return `ما صورة خبر الحرف الناسخ ${quoted}؟`;
  if (/اسم (?:إن|الحرف الناسخ)/u.test(text)) return `ما صورة اسم الحرف الناسخ ${quoted}؟`;
  if (/خبر (?:كان|الناسخ)/u.test(text)) return `ما صورة خبر الناسخ ${quoted}؟`;
  if (/اسم (?:كان|الناسخ)/u.test(text)) return `ما صورة اسم الناسخ ${quoted}؟`;
  if (/موقع/u.test(text) && /الحرف الناسخ/u.test(text)) return `ما وظيفة ${quoted} بعد الحرف الناسخ؟`;
  if (/المبتدأ/u.test(text)) return `ما صورة المبتدأ ${quoted}؟`;
  if (/الخبر/u.test(text)) return `ما صورة الخبر ${quoted}؟`;
  if (/الفعل/u.test(text)) return `ما الوصف المناسب للفعل ${quoted}؟`;
  return `ما الوصف المناسب لـ${quoted}؟`;
}

export function questionWithoutRepeatedOptions(
  raw: string,
  target: string | undefined,
  labels: string[],
  nodeId = "",
  example: Example | null = null,
) {
  const direct = visualNodeQuestion(nodeId, target, example);
  if (direct) return direct;
  const text = compactQuestion(raw, target);
  const normalizedLabels = labels.map((label) => normalizeQuestion(label).split(/[：:]/u)[0] ?? "");
  const quoted = quotedTarget(target);

  if (normalizedLabels.some((label) => label.startsWith("خبر مفرد"))
    && normalizedLabels.some((label) => label.startsWith("خبر جملة"))
    && normalizedLabels.some((label) => label.startsWith("خبر شبه جملة"))) {
    return `ما نوع الخبر ${quoted}؟`;
  }
  if (normalizedLabels.includes("اسم معرب")
    && normalizedLabels.includes("اسم مبني")
    && normalizedLabels.includes("مصدر مؤول")
    && /الخبر/u.test(text)) {
    return `ما صورة الخبر المفرد ${quoted}؟`;
  }

  const choiceNames = [...new Set(labels.map(choiceStem).filter((label) => label.length >= 2))];
  const repeated = choiceNames.filter((label) => text.includes(label)).length;
  if (repeated < 2) return text;
  return semanticStem(text, target);
}
