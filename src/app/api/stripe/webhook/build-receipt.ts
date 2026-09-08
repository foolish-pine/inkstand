export type BuildReceiptInput = {
  buyerEmail: string | null;
  articleId: string;
  articleTitle: string | null;
  paymentAmount: number;
  origin: string;
};

type ReceiptMail = {
  from: string;
  to: string;
  subject: string;
  text: string;
};

export function buildReceipt({
  buyerEmail,
  articleId,
  articleTitle,
  paymentAmount,
  origin,
}: BuildReceiptInput): ReceiptMail | null {
  if (!buyerEmail) return null;

  const text = [
    "inkstand をご利用いただきありがとうございます。",
    "以下のお支払いが完了しました。",
    "",
    articleTitle ? `記事: ${articleTitle}` : null,
    `金額: ¥${paymentAmount.toLocaleString("ja-JP")}`,
    `URL: ${origin}/articles/${articleId}`,
  ]
    .filter((line) => line !== null)
    .join("\n");

  return {
    from: "inkstand <onboarding@resend.dev>",
    to: buyerEmail,
    subject: "【inkstand】ご購入ありがとうございます",
    text,
  };
}
