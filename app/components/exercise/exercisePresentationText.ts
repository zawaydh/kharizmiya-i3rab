import type { Mode } from "../../../lib/exercise/model";

export function getStageMeta(mode: Mode) {
  if (mode === "learn") {
    return {
      badge: "التعلّم الموجّه",
      subtitle: "الإعراب خطوات؛ كل خطوة تفتح مسارًا وتغلق آخر حتى تصل إلى الإعراب الكامل.",
      nextLabel: "انتقل إلى التدريب →",
      nextHrefPrefix: "/train/",
    } as const;
  }
  if (mode === "practice") {
    return {
      badge: "التدريب",
      subtitle: "تدرّب بطريقة أخف وأكثر متعة، واجمع التعزيز قبل الاختبار.",
      nextLabel: "انتقل إلى الاختبار النهائي →",
      nextHrefPrefix: "/quiz/",
    } as const;
  }
  return {
    badge: "الاختبار النهائي",
    subtitle: "اختبار نهائي بلا تلميحات؛ النجاح يفتح شهادة الإنجاز.",
    nextLabel: "",
    nextHrefPrefix: "",
  } as const;
}

export function extractTopicName(title?: string) {
  const [firstPart = ""] = String(title || "").split("—");
  const raw = firstPart.trim();
  return raw || "الموضوع";
}

export function stageLearningTitle(stageBadge: string, title?: string) {
  const topic = extractTopicName(title);
  if (stageBadge === "الاختبار النهائي") return `الاختبار النهائي — ${topic}`;
  if (stageBadge === "التدريب") return `التدريب — ${topic}`;
  return `التعلّم الموجّه — ${topic}`;
}

export function i3rabTokensFromDraft(draft: string) {
  const clean = String(draft || "").trim();
  if (!clean || clean.includes("ابدأ")) return [];
  return clean.split(/\s+/).filter(Boolean);
}

export function firstLine(text?: string) {
  const [line = ""] = String(text || "").split("\n");
  return line.trim();
}

export function shortStudentText(text?: string, fallback = "جرّب مرة أخرى.") {
  const clean = firstLine(text).replace(/^💡\s*/, "").trim();
  if (!clean) return fallback;
  return clean.length > 72 ? `${clean.slice(0, 69)}...` : clean;
}
