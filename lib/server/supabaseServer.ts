import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export class ServerConfigurationError extends Error {
  constructor() {
    super("SERVER_PROGRESS_CONFIGURATION_MISSING");
    this.name = "ServerConfigurationError";
  }
}

export function createSupabaseAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new ServerConfigurationError();

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
