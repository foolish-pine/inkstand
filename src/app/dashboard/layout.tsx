import { signOut } from "@/actions/auth";
import { Wordmark } from "@/components/wordmark";
import { requireUser } from "@/lib/current-user";

// ダッシュボードはセッションを確かめてからでないと描けないので、ブロックしてよい
// ルートだと宣言する。Next.js はこの宣言を 2 つの別々の走査で読む。ここ（layout）の
// 宣言は「ブロックしてよいか」の判定にしか効かず、「検証が要るか」の走査は子まで
// 辿り続けて、宣言の無いページ segment で暗黙に有効になる。そのため各ページにも
// 同じ宣言が要る（無いと dev のログに blocking-prerender-dynamic が出続ける）。
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
