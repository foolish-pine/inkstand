// このページはビルド時に生成されるため、タイムゾーンを明示しないと
// ビルド環境（Vercel は UTC）の時刻で日付が決まる。日本時間の夜に公開した
// 記事が前日の日付で表示されるのを防ぐ。
export const publishedAtFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "Asia/Tokyo",
});
