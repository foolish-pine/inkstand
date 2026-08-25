import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { signOut } from "@/actions/auth";
import { Wordmark } from "@/components/wordmark";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";

export default async function Dashboard() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) redirect("/login");

  const myArticles = await db
    .select({
      id: articles.id,
      title: articles.title,
      status: articles.status,
      price: articles.price,
      updatedAt: articles.updatedAt,
    })
    .from(articles)
    .where(eq(articles.authorId, user.id))
    .orderBy(desc(articles.createdAt));

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
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <h1 className="font-display text-3xl tracking-wide">ダッシュボード</h1>
        <p className="text-muted mt-3 text-sm">{user.email}でログイン中</p>
        <h2 className="font-display mt-16 text-xl tracking-wide">
          あなたの記事
        </h2>
        {myArticles.length > 0 ? (
          <ul className="border-rule mt-6 border-t">
            {myArticles.map((article) => (
              <li
                key={article.id}
                className="border-rule flex items-baseline justify-between gap-6 border-b py-4"
              >
                <span className="min-w-0 flex-1 truncate text-sm">
                  {article.title}
                </span>
                <span className="text-muted shrink-0 text-xs tabular-nums">
                  {article.price === 0
                    ? "無料"
                    : `¥${article.price.toLocaleString("ja-JP")}`}
                </span>
                <span
                  className={`shrink-0 text-xs tracking-wider ${
                    article.status === "published"
                      ? "text-accent"
                      : "text-muted"
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
    </>
  );
}
