import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const productionMigrations = [
  "supabase/migrations/20260803_production_schema_hardening.sql",
  "supabase/migrations/20260805_server_authoritative_progress.sql",
  "supabase/migrations/20260806_error_observability.sql",
];

const executableLines = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim().toLowerCase())
    .filter((line) => line.length > 0 && !line.startsWith("--"));

describe("Supabase production migrations", () => {
  it.each(productionMigrations)("keeps %s atomic", (relativePath) => {
    const lines = executableLines(relativePath);

    expect(lines[0]).toBe("begin;");
    expect(lines.at(-1)).toBe("commit;");
  });
});

describe("Supabase reference schema", () => {
  it("uses the index names required by the read-only schema verifier", () => {
    const schema = readFileSync(resolve(process.cwd(), "supabase/schema.sql"), "utf8");

    expect(schema).toMatch(
      /constraint\s+progress_user_topic_level_unique\s+primary key\s*\(user_id, topic_code, level\)/iu,
    );
    expect(schema).toMatch(
      /auth_user_id\s+uuid\s+constraint\s+students_auth_user_id_unique\s+unique/iu,
    );
  });
});
