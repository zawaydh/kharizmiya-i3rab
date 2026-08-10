import { NextResponse } from "next/server";
import { parseProgressSubmission } from "../../../lib/progressEvents";
import { saveVerifiedProgress } from "../../../lib/server/progressRepository";
import {
  ProgressVerificationError,
  verifyProgressSubmission,
} from "../../../lib/server/progressVerification";
import {
  createSupabaseAdminClient,
  ServerConfigurationError,
} from "../../../lib/server/supabaseServer";

export const runtime = "nodejs";

function json(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function bearerToken(request: Request): string | null {
  const match = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (Number.isFinite(contentLength) && contentLength > 64_000) {
    return json({ error: "REQUEST_TOO_LARGE" }, 413);
  }

  const token = bearerToken(request);
  if (!token) return json({ error: "NOT_AUTHENTICATED" }, 401);

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return json({ error: "INVALID_JSON" }, 400);
  }

  const submission = parseProgressSubmission(rawBody);
  if (!submission) return json({ error: "INVALID_PROGRESS_SUBMISSION" }, 400);

  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.auth.getUser(token);
    if (error || !data.user) return json({ error: "NOT_AUTHENTICATED" }, 401);

    const verified = verifyProgressSubmission(submission);
    const progress = await saveVerifiedProgress({
      admin,
      userId: data.user.id,
      verified,
    });
    return json({ progress }, 200);
  } catch (error) {
    if (error instanceof ProgressVerificationError) {
      return json({ error: error.code }, 422);
    }
    if (error instanceof ServerConfigurationError) {
      return json({ error: error.message }, 503);
    }
    console.error("authoritative progress save failed", error);
    return json({ error: "PROGRESS_SAVE_FAILED" }, 500);
  }
}
