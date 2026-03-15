import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment");
}

/**
 * Server-side Supabase client. Use only in API routes and server code.
 * Never import this in client components or hooks.
 */
export const supabaseServer = createClient(supabaseUrl, supabaseAnonKey);
