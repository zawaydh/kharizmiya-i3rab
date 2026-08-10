import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { POST as storeClientError } from "../app/api/client-errors/route";
import { parseClientErrorReport } from "../lib/errorReports";
import {
  ERROR_EVENT_RETENTION_MS,
  errorEventRetentionCutoff,
  shouldSweepErrorEvents,
} from "../lib/server/errorEventRetention";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("production error handling", () => {
  it("sanitizes client reports and removes route query data", () => {
    const report = parseClientErrorReport({
      source: "route-boundary",
      message: "Failed for student@example.com token=abc123",
      digest: "next:abc-123",
      route: "/quiz/present-verb?attempt=private#result",
    });

    expect(report).toEqual({
      source: "route-boundary",
      message: "Failed for [email] token=[redacted]",
      digest: "next:abc-123",
      route: "/quiz/present-verb",
    });
  });

  it("rejects malformed or unknown reports", () => {
    expect(parseClientErrorReport(null)).toBeNull();
    expect(parseClientErrorReport({ source: "other", message: "failure" })).toBeNull();
    expect(parseClientErrorReport({ source: "window-error", message: "" })).toBeNull();
  });

  it("provides route and global recovery boundaries without sending stacks", () => {
    const routeBoundary = read("app/error.tsx");
    const globalBoundary = read("app/global-error.tsx");
    const reporter = read("lib/clientErrorReporting.ts");
    const monitor = read("app/components/ClientErrorMonitor.tsx");

    expect(routeBoundary).toContain("حاول مجددًا");
    expect(globalBoundary).toContain("إعادة المحاولة");
    expect(reporter).not.toContain(".stack");
    expect(reporter).toContain('await import("./supabaseClient")');
    expect(monitor).toContain('"unhandledrejection"');
  });

  it("keeps error storage server-only and bounded", () => {
    const route = read("app/api/client-errors/route.ts");
    const schema = read("supabase/schema.sql");
    const migration = read("supabase/migrations/20260806_error_observability.sql");

    expect(route).toContain("contentLength > 8_000");
    expect(route).toContain("MAX_REPORTS_PER_WINDOW");
    expect(route).toContain("MAX_TRACKED_CLIENTS");
    expect(route).toContain('error: "REPORT_STORAGE_UNAVAILABLE"');
    expect(route).toContain('.delete()');
    expect(route).toContain('errorEventRetentionCutoff(now)');
    expect(schema).toContain("revoke all on table public.app_error_events from anon, authenticated");
    expect(migration).not.toContain("create policy");
  });

  it("retains error events for thirty days and sweeps at most daily per process", () => {
    const now = Date.parse("2026-08-05T12:00:00.000Z");
    expect(ERROR_EVENT_RETENTION_MS).toBe(30 * 24 * 60 * 60 * 1_000);
    expect(errorEventRetentionCutoff(now)).toBe("2026-07-06T12:00:00.000Z");
    expect(shouldSweepErrorEvents(0, now)).toBe(true);
    expect(shouldSweepErrorEvents(now - 23 * 60 * 60 * 1_000, now)).toBe(false);
    expect(shouldSweepErrorEvents(now - 24 * 60 * 60 * 1_000, now)).toBe(true);
  });

  it("returns a real failure when server-side error storage is not configured", async () => {
    const previousUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const previousKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => undefined);
    try {
      const response = await storeClientError(new Request("http://localhost/api/client-errors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "window-error",
          message: "A bounded test failure",
          route: "/learn/start",
        }),
      }));
      expect(response.status).toBe(503);
      await expect(response.json()).resolves.toEqual({ error: "REPORT_STORAGE_UNAVAILABLE" });
    } finally {
      errorLog.mockRestore();
      if (previousUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      else process.env.NEXT_PUBLIC_SUPABASE_URL = previousUrl;
      if (previousKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      else process.env.SUPABASE_SERVICE_ROLE_KEY = previousKey;
    }
  });
});
