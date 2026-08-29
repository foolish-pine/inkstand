import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleForm } from "../../article-form";
import { DeleteArticleButton } from "./delete-article-button";
import { updateArticle } from "@/actions/articles";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { requireUser } from "@/lib/current-user";

export default async function EditArticle({
  params,
}: PageProps<"/dashboard/articles/[id]/edit">) {
  const user = await requireUser();
  const { id } = await params;
  const [article] = await db
    .select({
      id: articles.id,
      title: articles.title,
      body: articles.body,
      status: articles.status,
      price: articles.price,
    })
    .from(articles)
    .where(and(eq(articles.authorId, user.id), eq(articles.id, id)));

  if (!article) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <Link
        href="/dashboard"
        className="text-muted hover:text-foreground focus-visible:outline-accent text-xs tracking-wider underline underline-offset-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        ダッシュボードへ戻る
      </Link>
      <h1 className="font-display mt-8 text-3xl tracking-wide">
        記事を編集する
      </h1>
      <ArticleForm
        defaultValues={{
          title: article.title,
          body: article.body,
          status: article.status,
          price: article.price.toString(),
        }}
        action={updateArticle}
        articleId={article.id}
      />
      <div className="border-rule mt-16 border-t pt-8">
        <DeleteArticleButton articleId={article.id} title={article.title} />
      </div>
    </main>
  );
}
