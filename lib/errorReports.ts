export type ClientErrorSource =
  | "route-boundary"
  | "global-boundary"
  | "window-error"
  | "unhandled-rejection";

export type ClientErrorReport = {
  source: ClientErrorSource;
  message: string;
  digest: string | null;
  route: string;
};

const SOURCES = new Set<ClientErrorSource>([
  "route-boundary",
  "global-boundary",
  "window-error",
  "unhandled-rejection",
]);

function cleanText(value: unknown, maximumLength: number): string {
  return String(value || "")
    .replace(/[\u0000-\u001f\u007f]/gu, " ")
    .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/gu, "[email]")
    .replace(/(bearer|token|key|secret)\s*[:=]\s*[^\s,;]+/giu, "$1=[redacted]")
    .replace(/\s+/gu, " ")
    .trim()
    .slice(0, maximumLength);
}

export function parseClientErrorReport(value: unknown): ClientErrorReport | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.source !== "string" || !SOURCES.has(candidate.source as ClientErrorSource)) {
    return null;
  }
  const message = cleanText(candidate.message, 500);
  if (!message) return null;

  const rawRoute = cleanText(candidate.route, 240).split(/[?#]/u, 1)[0] || "/";
  const route = rawRoute.startsWith("/") ? rawRoute : "/";
  const rawDigest = cleanText(candidate.digest, 120);
  const digest = rawDigest && /^[A-Za-z0-9._:-]+$/u.test(rawDigest) ? rawDigest : null;

  return {
    source: candidate.source as ClientErrorSource,
    message,
    digest,
    route,
  };
}
