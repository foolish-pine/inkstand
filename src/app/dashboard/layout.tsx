import { signOut } from "@/actions/auth";
import { Wordmark } from "@/components/wordmark";
import { requireUser } from "@/lib/current-user";

export const instant = false;

export default async function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  await requireUser();

  return (
    <>
      <header className="border-rule border-b">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-5">
          <Wordmark />
          <form action={signOut}>
            <button
              type="submit"
              className="text-muted hover:text-foreground focus-visible:outline-accent cursor-pointer text-xs tracking-wider underline underline-offset-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              ログアウト
            </button>
          </form>
        </div>
      </header>
      {children}
    </>
  );
}
