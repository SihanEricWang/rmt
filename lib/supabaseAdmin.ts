// lib/supabaseAdmin.ts
import "server-only";
import { createClient } from "@supabase/supabase-js";

function mustGetEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable: ${name}`);
  return v;
}

export function createSupabaseAdminClient() {
  return createClient(mustGetEnv("NEXT_PUBLIC_SUPABASE_URL"), mustGetEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
