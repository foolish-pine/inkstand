import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { coverImageUrl } from "@/lib/cover-image-url";
import { getLatestArticles } from "@/lib/dal/published-articles";
import { formatDate } from "@/lib/format-date";

export default async function Home() {
  const latestArticles = await getLatestArticles();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <h1 className="font-display text-3xl tracking-wide">新着記事一覧</h1>
        {latestArticles.length > 0 ? (
          <ul className="border-rule mt-10 border-t">
            {latestArticles.map((article) => {
              const imageUrl = coverImageUrl(article.coverImagePath);

              return (
                <li key={article.id} className="border-rule border-b">
                  <Link
                    href={`/articles/${article.id}`}
                    className="group focus-visible:outline-accent flex items-center gap-6 py-5 focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    {/* 画像の有無で行の高さが変わらないよう、枠は常に置く。
                      サムネイルは 96x64 の固定表示なので sizes もそれに合わせる。 */}
                    <span className="border-rule bg-rule/30 relative h-16 w-24 shrink-0 overflow-hidden border">
                      {imageUrl && (
                        <Image
                          src={imageUrl}
                          alt=""
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <h2 className="group-hover:text-accent truncate text-base underline-offset-4 transition-colors group-hover:underline">
                        {article.title}
                      </h2>
                      {article.publishedAt && (
                        <time
                          dateTime={article.publishedAt.toISOString()}
                          className="text-muted mt-2 block text-xs tracking-wider tabular-nums"
                        >
                          {formatDate(article.publishedAt)}
                        </time>
                      )}
                    </span>
                    <span className="text-muted shrink-0 text-xs tabular-nums">
                      {article.price === 0
                        ? "無料"
                        : `¥${article.price.toLocaleString("ja-JP")}`}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="border-rule mt-10 border-y py-16 text-center">
            <p className="font-display text-lg tracking-wide">
              まだ記事がありません
            </p>
            <p className="text-muted mt-3 text-sm">
              最初の記事が公開されるのをお待ちください。
            </p>
          </div>
        )}
      </main>
    </>
  );
}
