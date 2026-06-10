import { createClient as createBrowserClient } from "@supabase/supabase-js";
import { getSupabaseEnv, isSupabaseConfigured } from "./env";

export function createClient() {
  if (!isSupabaseConfigured()) return null as any;

  const { url, anonKey } = getSupabaseEnv();

  return createBrowserClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
