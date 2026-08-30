import { and, eq } from "drizzle-orm";
import { cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Markdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { buildExcerpt } from "./excerpt";
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
      price: articles.price,
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

  const isFree = article.price === 0;
  const excerpt = buildExcerpt(article.body);
  const bodyToRender = isFree ? article.body : excerpt.text;

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
      <div className="border-rule relative mt-10 border-t pt-10">
        <div className="article-body">
          <Markdown
            rehypePlugins={[rehypeSanitize]}
            remarkPlugins={[remarkGfm]}
          >
            {bodyToRender}
          </Markdown>
        </div>
        {/* 抜粋の末尾が唐突に切れて見えないよう、下端を背景色へ溶かす。
            隠しているのはサーバー側なので、これは見た目だけの処理。 */}
        {!isFree && (
          <div className="from-background pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-linear-to-t to-transparent" />
        )}
      </div>
      {!isFree && (
        <div className="border-rule mt-10 border p-10 text-center">
          <p className="font-display text-lg tracking-wide">
            ここから先は有料です
          </p>
          <p className="text-muted mt-3 text-sm">
            続きを読むには記事の購入が必要です。
          </p>
          <p className="mt-8 text-3xl tabular-nums">
            ¥{article.price.toLocaleString("ja-JP")}
          </p>
        </div>
      )}
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
