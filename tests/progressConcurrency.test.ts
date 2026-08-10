import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import type { ProgressRecord } from "../lib/progressMerge";
import { getTopicByCode } from "../lib/topics";
import { resolveExpectedResultNodeId, verifyProgressSubmission } from "../lib/server/progressVerification";
import { saveVerifiedProgress } from "../lib/server/progressRepository";

type QueryError = { code?: string; message?: string } | null;
type QueryResult = { data: ProgressRecord | null; error: QueryError };

class ProgressQuery {
  private operation: "select" | "update" | "insert" | null = null;
  private payload: ProgressRecord | null = null;
  private filters = new Map<string, unknown>();

  constructor(private readonly database: ConcurrentProgressDatabase) {}

  select(): this {
    if (!this.operation) this.operation = "select";
    return this;
  }

  update(payload: ProgressRecord): this {
    this.operation = "update";
    this.payload = payload;
    return this;
  }

  insert(payload: ProgressRecord): this {
    this.operation = "insert";
    this.payload = payload;
    return this;
  }

  eq(column: string, value: unknown): this {
    this.filters.set(column, value);
    return this;
  }

  maybeSingle(): Promise<QueryResult> {
    if (this.operation === "update" && this.payload) {
      return this.database.update(this.payload, this.filters);
    }
    return this.database.read();
  }

  single(): Promise<QueryResult> {
    if (!this.payload) return Promise.resolve({ data: null, error: { message: "missing payload" } });
    return this.database.insert(this.payload);
  }
}

class ConcurrentProgressDatabase {
  record: ProgressRecord;
  private firstReadCount = 0;
  private releaseFirstReads: (() => void) | null = null;
  private readonly firstReadBarrier = new Promise<void>((resolve) => {
    this.releaseFirstReads = resolve;
  });

  constructor(record: ProgressRecord) {
    this.record = record;
  }

  from(table: string): ProgressQuery {
    if (table !== "progress") throw new Error("UNEXPECTED_TABLE");
    return new ProgressQuery(this);
  }

  async read(): Promise<QueryResult> {
    const snapshot = structuredClone(this.record);
    if (this.firstReadCount < 2) {
      this.firstReadCount += 1;
      if (this.firstReadCount === 2) this.releaseFirstReads?.();
      await this.firstReadBarrier;
    }
    return { data: snapshot, error: null };
  }

  async update(payload: ProgressRecord, filters: Map<string, unknown>): Promise<QueryResult> {
    if (filters.get("updated_at") !== this.record.updated_at) {
      return { data: null, error: null };
    }
    this.record = structuredClone(payload);
    return { data: structuredClone(this.record), error: null };
  }

  async insert(payload: ProgressRecord): Promise<QueryResult> {
    this.record = structuredClone(payload);
    return { data: structuredClone(this.record), error: null };
  }
}

describe("optimistic progress concurrency", () => {
  it("merges two simultaneous session saves without losing either coverage key", async () => {
    const topic = getTopicByCode("present-verb");
    if (!topic) throw new Error("TEST_TOPIC_MISSING");
    const first = topic.examples[0];
    const second = topic.examples.find((example) => example.covers?.[0] !== first?.covers?.[0]);
    if (!first || !second || first.id === undefined || second.id === undefined) {
      throw new Error("TEST_EXAMPLES_MISSING");
    }

    const verified = [first, second].map((example) => verifyProgressSubmission({
      kind: "stage-result",
      topicId: topic.code,
      level: topic.level,
      mode: "learn",
      exampleId: String(example.id),
      resultNodeId: resolveExpectedResultNodeId(topic.tree, example, "learn"),
    }));
    const database = new ConcurrentProgressDatabase({
      user_id: "00000000-0000-0000-0000-000000000001",
      topic_code: topic.code,
      level: topic.level,
      percent: 0,
      coverage: [],
      practice_percent: 0,
      practice_coverage: [],
      learn_completed: false,
      practice_completed: false,
      quiz_passed: false,
      quiz_score: null,
      quiz_total: null,
      certificate_earned_at: null,
      updated_at: "2026-01-01T00:00:00.000Z",
    });
    const admin = database as unknown as SupabaseClient;

    await Promise.all(verified.map((item) => saveVerifiedProgress({
      admin,
      userId: database.record.user_id,
      verified: item,
    })));

    expect(database.record.coverage).toEqual(expect.arrayContaining([
      first.covers?.[0],
      second.covers?.[0],
    ]));
    expect(database.record.coverage).toHaveLength(2);
    expect(database.record.percent).toBeGreaterThan(0);
  });
});
