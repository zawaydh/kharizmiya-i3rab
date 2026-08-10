import { NextResponse } from "next/server";
import { parseClientErrorReport } from "../../../lib/errorReports";
import {
  createSupabaseAdminClient,
  ServerConfigurationError,
} from "../../../lib/server/supabaseServer";
import {
  errorEventRetentionCutoff,
  shouldSweepErrorEvents,
} from "../../../lib/server/errorEventRetention";

export const runtime = "nodejs";

const WINDOW_MS = 60_000;
const MAX_REPORTS_PER_WINDOW = 12;
const MAX_TRACKED_CLIENTS = 1_000;
const reportWindows = new Map<string, { count: number; startedAt: number }>();
let lastRetentionSweepAt = 0;

function clientKey(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",", 1)[0]?.trim()
    || request.headers.get("x-real-ip")?.trim()
    || "unknown";
}

function rateLimited(request: Request): boolean {
  const now = Date.now();
  const key = clientKey(request);
  if (reportWindows.size >= MAX_TRACKED_CLIENTS && !reportWindows.has(key)) {
    for (const [storedKey, window] of reportWindows) {
      if (now - window.startedAt >= WINDOW_MS) reportWindows.delete(storedKey);
    }
    if (reportWindows.size >= MAX_TRACKED_CLIENTS) {
      const oldestKey = reportWindows.keys().next().value;
      if (typeof oldestKey === "string") reportWindows.delete(oldestKey);
    }
  }
  const current = reportWindows.get(key);
  if (!current || now - current.startedAt >= WINDOW_MS) {
    reportWindows.set(key, { count: 1, startedAt: now });
    return false;
  }
  current.count += 1;
  return current.count > MAX_REPORTS_PER_WINDOW;
}

function bearerToken(request: Request): string | null {
  return request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/iu)?.[1]?.trim() || null;
}

async function purgeExpiredEvents(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  now = Date.now(),
) {
  if (!shouldSweepErrorEvents(lastRetentionSweepAt, now)) return;
  lastRetentionSweepAt = now;
  const { error } = await admin
    .from("app_error_events")
    .delete()
    .lt("created_at", errorEventRetentionCutoff(now));
  if (error) console.error("client error event retention sweep failed", error.message);
}

function storageUnavailable() {
  return NextResponse.json(
    { error: "REPORT_STORAGE_UNAVAILABLE" },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (Number.isFinite(contentLength) && contentLength > 8_000) {
    return NextResponse.json({ error: "REQUEST_TOO_LARGE" }, { status: 413 });
  }
  if (rateLimited(request)) {
    return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }
  const report = parseClientErrorReport(rawBody);
  if (!report) return NextResponse.json({ error: "INVALID_REPORT" }, { status: 400 });

  const userAgent = String(request.headers.get("user-agent") || "unknown").slice(0, 320);
  let userId: string | null = null;

  try {
    const admin = createSupabaseAdminClient();
    const token = bearerToken(request);
    if (token) {
      const { data } = await admin.auth.getUser(token);
      userId = data.user?.id || null;
    }
    const { error } = await admin.from("app_error_events").insert({
      user_id: userId,
      source: report.source,
      message: report.message,
      digest: report.digest,
      route: report.route,
      user_agent: userAgent,
    });
    if (error) {
      console.error("client error event persistence failed", error.message);
      console.error("client error report", { ...report, userId, userAgent });
      return storageUnavailable();
    }
    await purgeExpiredEvents(admin);
  } catch (error) {
    if (error instanceof ServerConfigurationError) {
      console.error("client error event persistence unavailable");
    } else console.error("client error event persistence failed", error);
    console.error("client error report", { ...report, userId, userAgent });
    return storageUnavailable();
  }

  console.error("client error report", { ...report, userId, userAgent });
  return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}
