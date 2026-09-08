import { describe, expect, it } from "vitest";
import { type BuildReceiptInput, buildReceipt } from "./build-receipt";

const validInput: BuildReceiptInput = {
  buyerEmail: "buyer-1@example.com",
  articleId: "article-1",
  articleTitle: "記事タイトル",
  paymentAmount: 1000,
  origin: "https://example.com",
};

describe("buildReceipt", () => {
  it("すべての入力値が正常かつ articleTitle があるとき、to, subject, 「記事: 〜」行ありの text を返す", () => {
    expect(buildReceipt(validInput)).toStrictEqual({
      from: "inkstand <onboarding@resend.dev>",
      to: "buyer-1@example.com",
      subject: "【inkstand】ご購入ありがとうございます",
      text: `inkstand をご利用いただきありがとうございます。
以下のお支払いが完了しました。

記事: 記事タイトル
金額: ¥1,000
URL: https://example.com/articles/article-1`,
    });
  });
  it.each(["", null])(
    "すべての入力値が正常かつ articleTitle が %j のとき、to, subject, 「記事: 〜」行なしの text を返す",
    (articleTitle) => {
      expect(
        buildReceipt({
          ...validInput,
          articleTitle,
        }),
      ).toStrictEqual({
        from: "inkstand <onboarding@resend.dev>",
        to: "buyer-1@example.com",
        subject: "【inkstand】ご購入ありがとうございます",
        text: `inkstand をご利用いただきありがとうございます。
以下のお支払いが完了しました。

金額: ¥1,000
URL: https://example.com/articles/article-1`,
      });
    },
  );
  it.each(["", null])("buyerEmail が %j のとき、null を返す", (buyerEmail) => {
    expect(
      buildReceipt({
        ...validInput,
        buyerEmail,
      }),
    ).toBeNull();
  });
});
