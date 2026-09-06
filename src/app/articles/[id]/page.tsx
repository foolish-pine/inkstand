import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import Markdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { canPurchase } from "./can-purchase";
import { buildExcerpt } from "./excerpt";
import { createCheckout } from "@/actions/checkout";
import { getCurrentUser } from "@/lib/current-user";
import { hasPurchasedArticle } from "@/lib/dal/my-purchases";
import { getPublishedArticle } from "@/lib/dal/published-articles";
import { publishedAtFormatter } from "@/lib/published-at-formatter";

async function ArticleContent({
  params,
}: Pick<PageProps<"/articles/[id]">, "params">) {
  const { id } = await params;
  const article = await getPublishedArticle(id);

  if (!article) notFound();

  const isFree = article.price === 0;
  const excerpt = buildExcerpt(article.body);

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
      <Suspense fallback={<ArticleExcerptBody excerptText={excerpt.text} />}>
        <ArticleBody
          articleBody={article.body}
          excerptText={excerpt.text}
          articleId={article.id}
          authorId={article.authorId}
          price={article.price}
        />
      </Suspense>
      {!isFree && (
        <Suspense fallback={<PaywallSkeleton />}>
          <Paywall
            articleId={article.id}
            authorId={article.authorId}
            price={article.price}
          />
        </Suspense>
      )}
    </>
  );
}

async function ArticleBody({
  articleBody,
  excerptText,
  articleId,
  authorId,
  price,
}: {
  articleBody: string;
  excerptText: string;
  articleId: string;
  authorId: string;
  price: number;
}) {
  const user = await getCurrentUser();
  const userId = user?.id ?? null;
  const canViewFullBody = !canPurchase({
    userId,
    authorId,
    price,
    hasPurchased: await hasPurchasedArticle(articleId),
  });

  if (!canViewFullBody) return <ArticleExcerptBody excerptText={excerptText} />;

  return (
    <div className="border-rule relative mt-10 border-t pt-10">
      <div className="article-body">
        <Markdown rehypePlugins={[rehypeSanitize]} remarkPlugins={[remarkGfm]}>
          {articleBody}
        </Markdown>
      </div>
    </div>
  );
}

function ArticleExcerptBody({ excerptText }: { excerptText: string }) {
  return (
    <div className="border-rule relative mt-10 border-t pt-10">
      <div className="article-body">
        <Markdown rehypePlugins={[rehypeSanitize]} remarkPlugins={[remarkGfm]}>
          {excerptText}
        </Markdown>
      </div>
      {/* 抜粋の末尾が唐突に切れて見えないよう、下端を背景色へ溶かす。
          隠しているのはサーバー側なので、これは見た目だけの処理。 */}
      <div className="from-background pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-linear-to-t to-transparent" />
    </div>
  );
}

async function Paywall({
  articleId,
  authorId,
  price,
}: {
  articleId: string;
  authorId: string;
  price: number;
}) {
  const user = await getCurrentUser();

  if (!user)
    return (
      <PaywallContent
        message="続きを読むにはログインと記事の購入が必要です。"
        price={price}
      />
    );

  if (
    canPurchase({
      userId: user.id,
      authorId,
      price,
      hasPurchased: await hasPurchasedArticle(articleId),
    })
  )
    return (
      <PaywallContent
        message="続きを読むには記事の購入が必要です。"
        price={price}
        action={
          <form action={createCheckout}>
            <input type="hidden" name="articleId" defaultValue={articleId} />
            <button
              type="submit"
              className="bg-foreground text-background focus-visible:outline-accent cursor-pointer px-10 py-3 text-sm tracking-wider transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              購入する
            </button>
          </form>
        }
      />
    );

  return null;
}

// 枠線は本番と同じものをそのまま出し、中の 4 行だけを棒に置き換える。
// 外側の余白（mt-10 p-10）と行の高さ（28 / 20 / 36 / 44px）と行間（mt-3 mt-8）を
// 購入ボタンありの Paywall と一致させてあるので、中身が届いても高さが変わらない。
// 未ログインのときはボタンが無いぶん実物が 76px 低くなる。
function PaywallSkeleton() {
  return (
    <div className="border-rule mt-10 border p-10 text-center">
      <div className="animate-pulse" aria-hidden>
        <div className="flex h-7 items-center justify-center">
          <div className="bg-rule h-4 w-48" />
        </div>
        <div className="mt-3 flex h-5 items-center justify-center">
          <div className="bg-rule h-3 w-64" />
        </div>
        <div className="mt-8 flex h-9 items-center justify-center">
          <div className="bg-rule h-6 w-28" />
        </div>
        <div className="mt-8 flex justify-center">
          <div className="bg-rule h-11 w-40" />
        </div>
      </div>
    </div>
  );
}

function PaywallContent({
  message,
  price,
  action,
}: {
  message: string;
  price: number;
  action?: ReactNode;
}) {
  return (
    <div className="border-rule mt-10 border p-10 text-center">
      <p className="font-display text-lg tracking-wide">ここから先は有料です</p>
      <p className="text-muted mt-3 text-sm">{message}</p>
      <p className="mt-8 text-3xl tabular-nums">
        ¥{price.toLocaleString("ja-JP")}
      </p>
      {action && <div className="mt-8 flex justify-center">{action}</div>}
    </div>
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
