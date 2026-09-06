import Link from "next/link";
import { Suspense } from "react";
import { Wordmark } from "@/components/wordmark";
import { getCurrentUser } from "@/lib/current-user";

// ログインしているかどうかは閲覧者ごとに変わるので、ここだけ独立した
// <Suspense> に入れる。ヘッダー全体を閲覧者依存にすると、記事一覧や本文が
// 認証の HTTP 往復を待つことになる。
async function AccountLink() {
  const user = await getCurrentUser();

  if (!user)
    return (
      <Link
        href="/login"
        className="text-muted hover:text-foreground focus-visible:outline-accent text-xs tracking-wider underline underline-offset-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        ログイン
      </Link>
    );

  return (
    <Link
      href="/dashboard"
      className="text-muted hover:text-foreground focus-visible:outline-accent text-xs tracking-wider underline underline-offset-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      ダッシュボード
    </Link>
  );
}

// 「ログイン」も「ダッシュボード」も入る幅を先に確保しておく。
// 後から差し込まれてもヘッダーの中身が動かない。
function AccountLinkFallback() {
  return <div className="bg-rule h-3 w-24 animate-pulse" aria-hidden />;
}

export function SiteHeader() {
  return (
    <header className="border-rule border-b">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-5">
        <Wordmark />
        <Suspense fallback={<AccountLinkFallback />}>
          <AccountLink />
        </Suspense>
      </div>
    </header>
  );
}
