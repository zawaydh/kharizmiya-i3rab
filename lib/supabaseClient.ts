import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const hasSupabaseEnv = Boolean(supabaseUrl && supabaseAnonKey);
const isBrowser = typeof window !== "undefined";
const missingEnvError = () => new Error("SUPABASE_ENV_MISSING");

function createSafeFallbackClient(): SupabaseClient {
  const authResponse = Promise.resolve({ data: { user: null, session: null }, error: null });
  const queryBuilder = {
    select() { return this; },
    eq() { return this; },
    is() { return this; },
    update() { return this; },
    insert() { return this; },
    order() { return Promise.resolve({ data: [], error: null }); },
    maybeSingle() { return Promise.resolve({ data: null, error: null }); },
    single() { return Promise.resolve({ data: null, error: missingEnvError() }); },
    upsert() { return Promise.resolve({ data: null, error: missingEnvError() }); },
  };

  const fallback = {
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
      signInWithPassword() { return Promise.resolve({ data: null, error: missingEnvError() }); },
      signInWithOtp() { return Promise.resolve({ data: null, error: missingEnvError() }); },
      resend() { return Promise.resolve({ data: null, error: missingEnvError() }); },
      signUp() { return Promise.resolve({ data: null, error: missingEnvError() }); },
      updateUser() { return Promise.resolve({ data: null, error: missingEnvError() }); },
      exchangeCodeForSession() { return Promise.resolve({ data: null, error: missingEnvError() }); },
      setSession() { return Promise.resolve({ data: null, error: missingEnvError() }); },
      signOut() { return Promise.resolve({ error: null }); },
    },
    from() {
      return queryBuilder;
    },
  };

  return fallback as unknown as SupabaseClient;
}

if (!hasSupabaseEnv && isBrowser) {
  console.warn("Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

// نستخدم implicit flow لروابط تأكيد البريد حتى تعمل حتى لو فُتح الرابط في متصفح مختلف.
// صفحة /auth/callback تتولى قراءة الرمز/التوكن وتحويل المستخدم بعد نجاح الدخول.
export const supabase: SupabaseClient = hasSupabaseEnv && isBrowser
  ? createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: {
        flowType: "implicit",
        detectSessionInUrl: false,
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : createSafeFallbackClient();
