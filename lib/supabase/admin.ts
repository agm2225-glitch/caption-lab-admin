import { createClient } from "@supabase/supabase-js";

// SERVER ONLY. Call requireAdmin() before using this.
export function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}