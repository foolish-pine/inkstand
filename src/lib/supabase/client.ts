import { createBrowserClient } from "@supabase/ssr";
import { requireEnv } from "@/lib/require-env";

const publicSupabaseUrl = requireEnv(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  "NEXT_PUBLIC_SUPABASE_URL",
);
const publicSupabasePublishableKey = requireEnv(
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
);

export function createClient() {
  return createBrowserClient(publicSupabaseUrl, publicSupabasePublishableKey);
}
