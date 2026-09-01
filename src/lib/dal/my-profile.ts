import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { requireUser } from "@/lib/current-user";

export async function getMyProfile() {
  const user = await requireUser();

  const [myProfile] = await db
    .select({
      id: profiles.id,
    })
    .from(profiles)
    .where(eq(profiles.id, user.id));

  return myProfile;
}
