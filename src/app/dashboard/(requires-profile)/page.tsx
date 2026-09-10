import Link from "next/link";
import { requireUser } from "@/lib/current-user";
import { getMyArticles } from "@/lib/dal/my-articles";

export const instant = false;

export default async function Dashboard() {
  const user = await requireUser();

  const myArticles = await getMyArticles();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <h1 className="font-display text-3xl tracking-wide">ダッシュボード</h1>
      <p className="text-muted mt-3 text-sm">{user.email}でログイン中</p>
      <div className="mt-16 flex items-baseline justify-between gap-6">
        <h2 className="font-display text-xl tracking-wide">あなたの記事</h2>
        <Link
          href="/dashboard/articles/new"
          className="border-foreground hover:bg-foreground hover:text-background focus-visible:outline-accent shrink-0 border px-4 py-2 text-xs tracking-wider transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          記事を書く
        </Link>
      </div>
      {myArticles.length > 0 ? (
        <ul className="border-rule mt-6 border-t">
          {myArticles.map((article) => (
            <li
              key={article.id}
              className="border-rule flex items-baseline justify-between gap-6 border-b py-4"
            >
              <Link
                href={`/dashboard/articles/${article.id}/edit`}
                className="hover:text-accent focus-visible:outline-accent min-w-0 flex-1 truncate text-sm underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {article.title}
              </Link>
              <span className="text-muted shrink-0 text-xs tabular-nums">
                {article.price === 0
                  ? "無料"
                  : `¥${article.price.toLocaleString("ja-JP")}`}
              </span>
              <span
                className={`shrink-0 text-xs tracking-wider ${
                  article.status === "published" ? "text-accent" : "text-muted"
                }`}
              >
                {article.status === "published" ? "公開" : "下書き"}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="border-rule mt-6 border-y py-16 text-center">
          <p className="font-display text-lg tracking-wide">
            まだ記事がありません
          </p>
          <p className="text-muted mt-3 text-sm">
            最初の記事を書いてみましょう。
          </p>
        </div>
      )}
    </main>
  );
}
