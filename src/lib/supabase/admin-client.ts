/**
 * Untyped Supabase client untuk mutation di admin panel.
 * Dipakai karena TypeScript inference dari @supabase/ssr
 * perlu env vars saat compile; di sini kita skip type-safety
 * untuk mutasi dan rely pada runtime validation.
 */
import { createBrowserClient } from "@supabase/ssr";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createAdminClient(): any {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
