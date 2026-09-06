import { describe, expect, it } from "vitest";
import { parseSession, type ParseSessionInput } from "./parse-session";

const validInput: ParseSessionInput = {
  payment_status: "paid",
  amount_total: 1000,
  payment_intent: "valid-payment-intent",
  metadata: {
    buyerId: "buyer-1",
    articleId: "article-1",
  },
};

describe("parseSession", () => {
  it("正常な購入のセッションの場合、success が true となり、buyerId, articleId, paymentAmount, stripePaymentIntentId を返す", () => {
    expect(parseSession(validInput)).toStrictEqual({
      success: true,
      buyerId: "buyer-1",
      articleId: "article-1",
      paymentAmount: 1000,
      stripePaymentIntentId: "valid-payment-intent",
    });
  });
  it.each([
    [
      "payment_status が paid 以外",
      {
        ...validInput,
        payment_status: "unpaid",
      },
      "'payment_status' is not 'paid'",
    ],
    [
      "amount_total が null",
      {
        ...validInput,
        amount_total: null,
      },
      "Missing 'amount_total'",
    ],
    [
      "amount_total が 0",
      {
        ...validInput,
        amount_total: 0,
      },
      "Missing 'amount_total'",
    ],
    [
      "payment_intent が null",
      {
        ...validInput,
        payment_intent: null,
      },
      "Missing 'payment_intent'",
    ],
    [
      "payment_intent が string でない",
      {
        ...validInput,
        payment_intent: {},
      },
      "Missing 'payment_intent'",
    ],
    [
      "metadata が null",
      {
        ...validInput,
        metadata: null,
      },
      "Missing 'metadata'",
    ],
    [
      "buyerId が存在しない",
      {
        ...validInput,
        metadata: {
          articleId: "article-1",
        },
      },
      "Missing 'buyerId' and/or 'articleId'",
    ],
    [
      "articleId が存在しない",
      {
        ...validInput,
        metadata: {
          buyerId: "buyer-1",
        },
      },
      "Missing 'buyerId' and/or 'articleId'",
    ],
  ])(
    "%sのとき、success が false となり、個別の message を返す",
    (_reason, input, message) => {
      expect(parseSession(input)).toStrictEqual({
        success: false,
        message,
      });
    },
  );
});
