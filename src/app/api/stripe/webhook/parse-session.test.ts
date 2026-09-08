import { describe, expect, it } from "vitest";
import { type ParseSessionInput, parseSession } from "./parse-session";

const validInput: ParseSessionInput = {
  payment_status: "paid",
  amount_total: 1000,
  payment_intent: "valid-payment-intent",
  metadata: {
    buyerId: "buyer-1",
    buyerEmail: "buyer-1@example.com",
    articleId: "article-1",
    articleTitle: "記事タイトル",
  },
};

describe("parseSession", () => {
  it("すべての入力値が正常なとき、success が true となり、buyerId, buyerEmail, articleId, articleTitle, paymentAmount, stripePaymentIntentId を返す", () => {
    expect(parseSession(validInput)).toStrictEqual({
      success: true,
      buyerId: "buyer-1",
      buyerEmail: "buyer-1@example.com",
      articleId: "article-1",
      articleTitle: "記事タイトル",
      paymentAmount: 1000,
      stripePaymentIntentId: "valid-payment-intent",
    });
  });
  it.each([
    [
      "buyerEmail が空文字で",
      {
        buyerId: "buyer-1",
        buyerEmail: "",
        articleId: "article-1",
        articleTitle: "記事タイトル",
      },
    ],
    [
      "buyerEmail が存在せず",
      {
        buyerId: "buyer-1",
        articleId: "article-1",
        articleTitle: "記事タイトル",
      },
    ],
  ])(
    "%sその他の入力値が正常なとき、success が true となり、buyerEmail が null になる",
    (_reason, metadata) => {
      expect(
        parseSession({
          ...validInput,
          metadata,
        }),
      ).toStrictEqual({
        success: true,
        buyerId: "buyer-1",
        buyerEmail: null,
        articleId: "article-1",
        articleTitle: "記事タイトル",
        paymentAmount: 1000,
        stripePaymentIntentId: "valid-payment-intent",
      });
    },
  );
  it.each([
    [
      "articleTitle が空文字で",
      {
        buyerId: "buyer-1",
        buyerEmail: "buyer-1@example.com",
        articleId: "article-1",
        articleTitle: "",
      },
    ],
    [
      "articleTitle が存在せず",
      {
        buyerId: "buyer-1",
        buyerEmail: "buyer-1@example.com",
        articleId: "article-1",
      },
    ],
  ])(
    "%sその他の入力値が正常なとき、success が true となり、articleTitle が null になる",
    (_reason, metadata) => {
      expect(
        parseSession({
          ...validInput,
          metadata,
        }),
      ).toStrictEqual({
        success: true,
        buyerId: "buyer-1",
        buyerEmail: "buyer-1@example.com",
        articleId: "article-1",
        articleTitle: null,
        paymentAmount: 1000,
        stripePaymentIntentId: "valid-payment-intent",
      });
    },
  );
  it.each([
    [
      "payment_status が paid 以外のとき",
      {
        ...validInput,
        payment_status: "unpaid",
      },
      "'payment_status' is not 'paid'",
    ],
    [
      "amount_total が null のとき",
      {
        ...validInput,
        amount_total: null,
      },
      "Missing 'amount_total'",
    ],
    [
      "amount_total が 0 のとき",
      {
        ...validInput,
        amount_total: 0,
      },
      "Missing 'amount_total'",
    ],
    [
      "payment_intent が null のとき",
      {
        ...validInput,
        payment_intent: null,
      },
      "Missing 'payment_intent'",
    ],
    [
      "payment_intent が string でないとき",
      {
        ...validInput,
        payment_intent: {},
      },
      "Missing 'payment_intent'",
    ],
    [
      "metadata が null のとき",
      {
        ...validInput,
        metadata: null,
      },
      "Missing 'metadata'",
    ],
    [
      "buyerId が存在しないとき",
      {
        ...validInput,
        metadata: {
          buyerEmail: "buyer-1@example.com",
          articleId: "article-1",
          articleTitle: "記事タイトル",
        },
      },
      "Missing 'buyerId' and/or 'articleId'",
    ],
    [
      "articleId が存在しないとき",
      {
        ...validInput,
        metadata: {
          buyerId: "buyer-1",
          buyerEmail: "buyer-1@example.com",
          articleTitle: "記事タイトル",
        },
      },
      "Missing 'buyerId' and/or 'articleId'",
    ],
  ])(
    "%s、success が false となり、個別の message を返す",
    (_reason, input, message) => {
      expect(parseSession(input)).toStrictEqual({
        success: false,
        message,
      });
    },
  );
});
