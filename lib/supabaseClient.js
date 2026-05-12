import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const hasSupabaseEnv = Boolean(supabaseUrl && supabaseAnonKey);

function createSafeFallbackClient() {
  const authResponse = Promise.resolve({ data: { user: null, session: null }, error: null });
  const queryBuilder = {
    select() { return this; },
    eq() { return this; },
    order() { return Promise.resolve({ data: [], error: null }); },
    maybeSingle() { return Promise.resolve({ data: null, error: null }); },
    upsert() { return Promise.resolve({ data: null, error: new Error("SUPABASE_ENV_MISSING") }); },
  };

  return {
    auth: {
      getUser() { return authResponse; },
      getSession() { return authResponse; },
      onAuthStateChange() {
        return {
          data: {
            subscription: {
              unsubscribe() {},
            },
          },
        };
      },
      signInWithPassword() { return Promise.resolve({ data: null, error: new Error("SUPABASE_ENV_MISSING") }); },
      signUp() { return Promise.resolve({ data: null, error: new Error("SUPABASE_ENV_MISSING") }); },
      signOut() { return Promise.resolve({ error: null }); },
    },
    from() {
      return queryBuilder;
    },
  };
}

if (!hasSupabaseEnv) {
  console.warn("Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export const supabase = hasSupabaseEnv
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createSafeFallbackClient();
