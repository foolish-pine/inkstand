import { requireEnv } from "@/lib/require-env";

const publicSupabaseUrl = requireEnv(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  "NEXT_PUBLIC_SUPABASE_URL",
);

export function coverImageUrl(path: string | null): string | null {
  if (!path) return null;

  return `${publicSupabaseUrl}/storage/v1/object/public/images/${path}`;
}
