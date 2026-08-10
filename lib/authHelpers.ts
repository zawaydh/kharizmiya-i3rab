import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";

export const DEFAULT_NEXT_URL = "/topics?welcome=1";
export const PENDING_NAME_KEY = "khwarizmia_pending_full_name";
export const PENDING_NEXT_KEY = "khwarizmia_pending_next_url";

export function normalizeEmail(value: unknown): string {
  return String(value || "").trim().toLowerCase();
}

export function isSafeInternalUrl(value: unknown): value is string {
  if (typeof value !== "string" || !value.startsWith("/")) return false;

  const pathOnly = value.split(/[?#]/, 1)[0] ?? "";
  if (
    value.startsWith("//") ||
    /[\\\u0000-\u001f\u007f]/.test(value) ||
    /%(?:2f|5c)/i.test(pathOnly)
  ) {
    return false;
  }

  try {
    const siteOrigin = "https://kharizmiya.local";
    return new URL(value, siteOrigin).origin === siteOrigin;
  } catch {
    return false;
  }
}

export function getVerifiedAt(user: User | null | undefined): string | null {
  return user?.email_confirmed_at || user?.confirmed_at || null;
}

export function getNameFromUser(user: User | null | undefined): string {
  const fullName = user?.user_metadata?.full_name;
  return typeof fullName === "string" ? fullName.trim() : "";
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error && "message" in error) {
    return String((error as { message?: unknown }).message || error);
  }
  return String(error);
}

export async function trySyncStudentRow(
  user: User | null | undefined,
  fullName?: string,
): Promise<void> {
  if (!user?.id || !user.email) return;

  const verifiedAt = getVerifiedAt(user) || new Date().toISOString();
  const payload = {
    auth_user_id: user.id,
    full_name: fullName || getNameFromUser(user) || null,
    email: normalizeEmail(user.email),
    email_verified: true,
    email_verified_at: verifiedAt,
    updated_at: new Date().toISOString(),
  };

  try {
    const claimOldRow = await supabase
      .from("students")
      .update(payload)
      .eq("email", payload.email)
      .is("auth_user_id", null)
      .select("id")
      .maybeSingle();

    if (!claimOldRow.error && claimOldRow.data) return;

    const { error } = await supabase
      .from("students")
      .upsert(payload, { onConflict: "auth_user_id" });

    if (error) console.warn("students sync skipped:", error.message);
  } catch (error) {
    console.warn("students sync skipped:", errorMessage(error));
  }
}
