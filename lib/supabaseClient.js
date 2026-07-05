import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const hasSupabaseEnv = Boolean(supabaseUrl && supabaseAnonKey);
const isBrowser = typeof window !== "undefined";

function createSafeFallbackClient() {
  const authResponse = Promise.resolve({ data: { user: null, session: null }, error: null });
  const queryBuilder = {
    select() { return this; },
    eq() { return this; },
    is() { return this; },
    order() { return Promise.resolve({ data: [], error: null }); },
    maybeSingle() { return Promise.resolve({ data: null, error: null }); },
    upsert() { return Promise.resolve({ data: null, error: new Error("SUPABASE_ENV_MISSING") }); },
    update() { return this; },
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
      signInWithOtp() { return Promise.resolve({ data: null, error: new Error("SUPABASE_ENV_MISSING") }); },
      signUp() { return Promise.resolve({ data: null, error: new Error("SUPABASE_ENV_MISSING") }); },
      updateUser() { return Promise.resolve({ data: null, error: new Error("SUPABASE_ENV_MISSING") }); },
      exchangeCodeForSession() { return Promise.resolve({ data: null, error: new Error("SUPABASE_ENV_MISSING") }); },
      setSession() { return Promise.resolve({ data: null, error: new Error("SUPABASE_ENV_MISSING") }); },
      signOut() { return Promise.resolve({ error: null }); },
    },
    from() {
      return queryBuilder;
    },
  };
}

if (!hasSupabaseEnv && isBrowser) {
  console.warn("Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

// نستخدم implicit flow لروابط البريد حتى تعمل حتى لو فُتح رابط Gmail في متصفح مختلف.
// صفحة /auth/callback تتولى قراءة الرمز/التوكن وتحويل الطالبة بعد نجاح الدخول.
export const supabase = hasSupabaseEnv && isBrowser
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        flowType: "implicit",
        detectSessionInUrl: false,
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : createSafeFallbackClient();
