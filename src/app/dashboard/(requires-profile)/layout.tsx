import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { requireUser } from "@/lib/current-user";

export default async function RequiresProfileLayout({
  children,
}: LayoutProps<"/dashboard">) {
  const user = await requireUser();

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
