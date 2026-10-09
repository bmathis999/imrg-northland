import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only client with the service-role key. It bypasses row-level security,
 * so it is used only inside server actions after input is validated and the
 * spam check has passed. The "server-only" import makes the build fail if this
 * file is ever pulled into browser code.
 */
export function adminDb(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
