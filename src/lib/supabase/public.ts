import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Read-only client using the public "anon" key.
 * The database only lets this key see rows marked Public, and only safe columns
 * (see supabase/migrations). Member-only details can't be read with it.
 */
// A fresh client per call: Cloudflare Workers don't allow sharing I/O between requests.
export function publicDb(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
}
