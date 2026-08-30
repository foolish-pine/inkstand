import { and, eq } from "drizzle-orm";
import { cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Markdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { articleTag } from "@/lib/cache-tags";
import { publishedAtFormatter } from "@/lib/published-at-formatter";

async function getPublishedArticle(id: string) {
  "use cache";
  cacheTag(articleTag(id));

  const [article] = await db
    .select({
      id: articles.id,
      title: articles.title,
      body: articles.body,
      publishedAt: articles.publishedAt,
    })
    .from(articles)
    .where(and(eq(articles.id, id), eq(articles.status, "published")));

  return article;
}

async function ArticleContent({
  params,
}: Pick<PageProps<"/articles/[id]">, "params">) {
  const { id } = await params;
  const article = await getPublishedArticle(id);

  if (!article) notFound();

  return (
    <>
      <h1 className="font-display text-3xl leading-relaxed tracking-wide">
        {article.title}
      </h1>
      {article.publishedAt && (
        <time
          dateTime={article.publishedAt.toISOString()}
          className="text-muted mt-4 block text-xs tracking-wider tabular-nums"
        >
          {publishedAtFormatter.format(article.publishedAt)}
        </time>
      )}
      <div className="article-body border-rule mt-10 border-t pt-10">
        <Markdown rehypePlugins={[rehypeSanitize]} remarkPlugins={[remarkGfm]}>
          {article.body}
        </Markdown>
      </div>
    </>
  );
}

// 記事を開いた瞬間に見える唯一のもの。読み込み後の形と合わせておくと、
// 中身が届いたときに要素が飛び跳ねない。
function ArticleSkeleton() {
  return (
    <div className="animate-pulse" aria-hidden>
      <div className="bg-rule h-8 w-4/5" />
      <div className="bg-rule mt-6 h-3 w-28" />
      <div className="border-rule mt-10 space-y-4 border-t pt-12">
        <div className="bg-rule h-3 w-full" />
        <div className="bg-rule h-3 w-full" />
        <div className="bg-rule h-3 w-11/12" />
        <div className="bg-rule h-3 w-2/3" />
      </div>
    </div>
  );
}

export default function Article({ params }: PageProps<"/articles/[id]">) {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <Suspense fallback={<ArticleSkeleton />}>
        <ArticleContent params={params} />
      </Suspense>
    </main>
  );
}
