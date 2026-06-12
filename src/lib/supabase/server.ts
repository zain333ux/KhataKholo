import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseDatabaseEnv } from "@/lib/env";
import type { Database } from "@/types/database";

if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export type AppSupabaseClient = SupabaseClient<Database>;

export async function createServerSupabaseClient(): Promise<AppSupabaseClient | null> {
  const env = getSupabaseDatabaseEnv();

  if (!env) {
    return null;
  }

  return createClient<Database>(env.url, env.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

