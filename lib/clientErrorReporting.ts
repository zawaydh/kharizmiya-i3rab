"use client";

import type { ClientErrorReport, ClientErrorSource } from "./errorReports";

type ReportInput = {
  source: ClientErrorSource;
  message: unknown;
  digest?: string | null;
  route?: string;
};

export async function reportClientError({
  source,
  message,
  digest = null,
  route,
}: ReportInput): Promise<void> {
  try {
    const report: ClientErrorReport = {
      source,
      message: message instanceof Error ? message.message : String(message || "Unknown client error"),
      digest,
      route: route || window.location.pathname || "/",
    };
    const { supabase } = await import("./supabaseClient");
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    await fetch("/api/client-errors", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(report),
      cache: "no-store",
      keepalive: true,
    });
  } catch {
    // Error reporting must never trigger a second user-facing failure.
  }
}
