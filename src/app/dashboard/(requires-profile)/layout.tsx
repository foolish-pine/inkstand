import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) redirect("/login");

  const [existingProfile] = await db
    .select({
      id: profiles.id,
    })
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

  if (!existingProfile) redirect("/dashboard/profile/new");

  return <>{children}</>;
}
