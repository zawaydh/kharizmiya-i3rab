import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { getTopicByCode } from "../../lib/topics";
import { resolveExpectedResultNodeId } from "../../lib/server/progressVerification";

function requiredEnvironment(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`LIVE_INTEGRATION_ENV_MISSING:${name}`);
  return value;
}

async function resolveSessionTokens(supabaseUrl: string, anonKey: string): Promise<[string, string]> {
  const providedTokenA = process.env.SUPABASE_INTEGRATION_ACCESS_TOKEN_A?.trim();
  const providedTokenB = process.env.SUPABASE_INTEGRATION_ACCESS_TOKEN_B?.trim();
  if (providedTokenA && providedTokenB) return [providedTokenA, providedTokenB];

  const email = requiredEnvironment("SUPABASE_INTEGRATION_EMAIL");
  const password = requiredEnvironment("SUPABASE_INTEGRATION_PASSWORD");
  const createLoginClient = () => createClient(supabaseUrl, anonKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
  const [loginA, loginB] = await Promise.all([
    createLoginClient().auth.signInWithPassword({ email, password }),
    createLoginClient().auth.signInWithPassword({ email, password }),
  ]);
  if (loginA.error || loginB.error) {
    throw new Error(`LIVE_INTEGRATION_LOGIN_FAILED:${loginA.error?.message || loginB.error?.message}`);
  }
  const tokenA = loginA.data.session?.access_token;
  const tokenB = loginB.data.session?.access_token;
  if (!tokenA || !tokenB) throw new Error("LIVE_INTEGRATION_SESSION_MISSING");
  return [tokenA, tokenB];
}

describe("live Supabase progress concurrency", () => {
  it("preserves evidence submitted simultaneously from two sessions of one test user", async () => {
    const baseUrl = requiredEnvironment("INTEGRATION_BASE_URL").replace(/\/$/u, "");
    const supabaseUrl = requiredEnvironment("NEXT_PUBLIC_SUPABASE_URL");
    const anonKey = requiredEnvironment("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    const [tokenA, tokenB] = await resolveSessionTokens(supabaseUrl, anonKey);
    const topicCode = process.env.SUPABASE_INTEGRATION_TOPIC_CODE?.trim() || "present-verb";
    const topic = getTopicByCode(topicCode);
    if (!topic) throw new Error(`LIVE_INTEGRATION_TOPIC_MISSING:${topicCode}`);

    const first = topic.examples[0];
    const second = topic.examples.find((example) => example.covers?.[0] !== first?.covers?.[0]);
    if (!first || !second || first.id === undefined || second.id === undefined) {
      throw new Error(`LIVE_INTEGRATION_EXAMPLES_MISSING:${topicCode}`);
    }

    const client = (token: string) => createClient(supabaseUrl, anonKey, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const sessionA = client(tokenA);
    const sessionB = client(tokenB);
    const [userA, userB] = await Promise.all([
      sessionA.auth.getUser(tokenA),
      sessionB.auth.getUser(tokenB),
    ]);
    expect(userA.error).toBeNull();
    expect(userB.error).toBeNull();
    expect(userA.data.user?.id).toBeTruthy();
    expect(userB.data.user?.id).toBe(userA.data.user?.id);

    const submissions = [first, second].map((example) => ({
      kind: "stage-result" as const,
      topicId: topic.code,
      level: topic.level,
      mode: "learn" as const,
      exampleId: String(example.id),
      resultNodeId: resolveExpectedResultNodeId(topic.tree, example, "learn"),
    }));
    const post = (token: string, body: (typeof submissions)[number]) => fetch(
      `${baseUrl}/api/progress`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    const [responseA, responseB] = await Promise.all([
      post(tokenA, submissions[0]),
      post(tokenB, submissions[1]),
    ]);
    expect(responseA.status, await responseA.text()).toBe(200);
    expect(responseB.status, await responseB.text()).toBe(200);

    const { data: progress, error } = await sessionA
      .from("progress")
      .select("coverage, percent, updated_at")
      .eq("user_id", userA.data.user?.id)
      .eq("topic_code", topic.code)
      .eq("level", topic.level)
      .maybeSingle();
    expect(error).toBeNull();
    expect(progress?.coverage).toEqual(expect.arrayContaining([
      first.covers?.[0],
      second.covers?.[0],
    ]));
    expect(progress?.percent).toBeGreaterThan(0);
  });
});
