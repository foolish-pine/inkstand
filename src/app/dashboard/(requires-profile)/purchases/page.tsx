import Link from "next/link";
import { getMyPurchases } from "@/lib/dal/my-purchases";
import { dateFormatter } from "@/lib/date-formatter";

export default async function Purchases() {
  const myPurchases = await getMyPurchases();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <Link
        href="/dashboard"
        className="text-muted hover:text-foreground focus-visible:outline-accent text-xs tracking-wider underline underline-offset-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        ダッシュボードへ戻る
      </Link>
      <h1 className="font-display mt-8 text-3xl tracking-wide">購入履歴</h1>
      {myPurchases.length > 0 ? (
        <ul className="border-rule mt-10 border-t">
          {myPurchases.map((purchase) => (
            <li key={purchase.articleId} className="border-rule border-b">
              <Link
                href={`/articles/${purchase.articleId}`}
                className="group focus-visible:outline-accent flex items-baseline justify-between gap-6 py-5 focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <span className="min-w-0 flex-1">
                  <span className="group-hover:text-accent block truncate text-base underline-offset-4 transition-colors group-hover:underline">
                    {purchase.articleTitle}
                  </span>
                  <time
                    dateTime={purchase.createdAt.toISOString()}
                    className="text-muted mt-2 block text-xs tracking-wider tabular-nums"
                  >
                    {dateFormatter.format(purchase.createdAt)}
                  </time>
                </span>
                <span className="text-muted shrink-0 text-xs tabular-nums">
                  ¥{purchase.paymentAmount.toLocaleString("ja-JP")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="border-rule mt-10 border-y py-16 text-center">
          <p className="font-display text-lg tracking-wide">
            購入履歴がありません
          </p>
          <p className="text-muted mt-3 text-sm">
            記事を購入すると、ここに並びます。
          </p>
        </div>
      )}
    </main>
  );
}
