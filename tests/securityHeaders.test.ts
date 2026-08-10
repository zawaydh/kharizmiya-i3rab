import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("response security headers", () => {
  it("applies the baseline browser protections to every route", () => {
    const config = readFileSync(resolve(process.cwd(), "next.config.mjs"), "utf8");
    expect(config).toContain('source: "/:path*"');
    for (const header of [
      "X-Content-Type-Options",
      "X-Frame-Options",
      "Referrer-Policy",
      "Permissions-Policy",
      "Strict-Transport-Security",
      "X-Permitted-Cross-Domain-Policies",
    ]) {
      expect(config).toContain(header);
    }
    expect(config).toContain('value: "nosniff"');
    expect(config).toContain('value: "DENY"');
    expect(config).not.toContain("unsafe-eval");
  });
});
