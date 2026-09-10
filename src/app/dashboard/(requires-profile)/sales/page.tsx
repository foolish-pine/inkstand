import Link from "next/link";
import { connection } from "next/server";
import { fillMissingMonths } from "./fill-missing-months";
import { sumSales } from "./sum-sales";
import { getMySales, getMySalesByMonth } from "@/lib/dal/my-sales";
import { salesMonthRange } from "@/lib/sales-month-range";

export default async function Sales() {
  // cacheComponents が有効なので、new Date() のような実行のたびに変わる値は
  // 静的なプリレンダリングでは扱えない。ここから先はリクエスト時に描画する。
  await connection();

  const baseDate = new Date();
  const range = salesMonthRange(baseDate);
  const [mySales, mySalesByMonth] = await Promise.all([
    getMySales(),
    getMySalesByMonth(range),
  ]);
  const monthlySales = fillMissingMonths({
    range,
    salesByMonth: mySalesByMonth,
  });
  const salesSummary = sumSales(monthlySales);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <Link
        href="/dashboard"
        className="text-muted hover:text-foreground focus-visible:outline-accent text-xs tracking-wider underline underline-offset-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        ダッシュボードへ戻る
      </Link>
      <h1 className="font-display mt-8 text-3xl tracking-wide">売上</h1>
      <h2 className="font-display mt-16 text-xl tracking-wide">
        記事ごとの売上
      </h2>
      {mySales.length > 0 ? (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-rule border-y">
                <th
                  scope="col"
                  className="text-muted py-3 pr-6 text-left text-xs font-normal tracking-wider"
                >
                  記事
                </th>
                <th
                  scope="col"
                  className="text-muted py-3 pr-6 text-right text-xs font-normal tracking-wider"
                >
                  販売数
                </th>
                <th
                  scope="col"
                  className="text-muted py-3 text-right text-xs font-normal tracking-wider"
                >
                  売上
                </th>
              </tr>
            </thead>
            <tbody>
              {mySales.map((sales) => (
                <tr key={sales.articleId} className="border-rule border-b">
                  <td className="max-w-xs truncate py-4 pr-6">
                    <Link
                      href={`/articles/${sales.articleId}`}
                      className="hover:text-accent focus-visible:outline-accent underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                      {sales.articleTitle}
                    </Link>
                  </td>
                  <td className="py-4 pr-6 text-right tabular-nums">
                    {sales.salesCount}
                  </td>
                  <td className="py-4 text-right tabular-nums">
                    ¥{sales.salesAmount.toLocaleString("ja-JP")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="border-rule mt-6 border-y py-16 text-center">
          <p className="font-display text-lg tracking-wide">
            公開した記事がありません
          </p>
          <p className="text-muted mt-3 text-sm">
            記事を公開すると、ここに売上が並びます。
          </p>
        </div>
      )}
      <h2 className="font-display mt-16 text-xl tracking-wide">月別推移</h2>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-rule border-y">
              <th
                scope="col"
                className="text-muted py-3 pr-6 text-left text-xs font-normal tracking-wider"
              >
                月
              </th>
              <th
                scope="col"
                className="text-muted py-3 pr-6 text-right text-xs font-normal tracking-wider"
              >
                販売数
              </th>
              <th
                scope="col"
                className="text-muted py-3 text-right text-xs font-normal tracking-wider"
              >
                売上
              </th>
            </tr>
          </thead>
          <tbody>
            {monthlySales.map((sales) => (
              <tr key={sales.month} className="border-rule border-b">
                <td className="py-4 pr-6 tabular-nums">{sales.month}</td>
                <td className="py-4 pr-6 text-right tabular-nums">
                  {sales.salesCount}
                </td>
                <td className="py-4 text-right tabular-nums">
                  ¥{sales.salesAmount.toLocaleString("ja-JP")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 className="font-display mt-16 text-xl tracking-wide">
        直近12ヶ月の合計売上
      </h2>
      <dl className="border-rule mt-6 grid grid-cols-2 gap-px border-y">
        <div className="py-8">
          <dt className="text-muted text-xs tracking-wider">販売数</dt>
          <dd className="font-display mt-2 text-3xl tabular-nums">
            {salesSummary.totalSalesCount}
          </dd>
        </div>
        <div className="py-8">
          <dt className="text-muted text-xs tracking-wider">売上</dt>
          <dd className="font-display mt-2 text-3xl tabular-nums">
            ¥{salesSummary.totalSalesAmount.toLocaleString("ja-JP")}
          </dd>
        </div>
      </dl>
    </main>
  );
}
