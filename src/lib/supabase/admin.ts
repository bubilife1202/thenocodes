import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

export function createAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    if (isBuildPhase) {
      return createClient("http://localhost:0", "build-placeholder", {
        auth: { autoRefreshToken: false, persistSession: false },
      });
    }
    throw new Error("Supabase service role environment variables are not configured.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
