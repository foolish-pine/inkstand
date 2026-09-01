import { redirect } from "next/navigation";
import { getMyProfile } from "@/lib/dal/my-profile";

export default async function RequiresProfileLayout({
  children,
}: LayoutProps<"/dashboard">) {
  const myProfile = await getMyProfile();

  if (!myProfile) redirect("/dashboard/profile/new");

  return <>{children}</>;
}
