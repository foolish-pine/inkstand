import Stripe from "stripe";

// parseSession は payment_intent が文字列かどうかしか見ないので、
// PaymentIntent の全プロパティを要求する必要がない。
// テストで最小のオブジェクトを渡せるようにするため、型を広げる。
export type ParseSessionInput = Pick<
  Stripe.Checkout.Session,
  "payment_status" | "amount_total" | "metadata"
> & {
  payment_intent: string | object | null;
};

type ParseResult =
  | {
      success: false;
      message: string;
    }
  | {
      success: true;
      buyerId: string;
      articleId: string;
      paymentAmount: number;
      stripePaymentIntentId: string;
    };

export function parseSession(session: ParseSessionInput): ParseResult {
  if (session.payment_status !== "paid") {
    return {
      success: false,
      message: "'payment_status' is not 'paid'",
    };
  }

  const paymentAmount = session.amount_total;
  if (paymentAmount === null || paymentAmount === 0) {
    return {
      success: false,
      message: "Missing 'amount_total'",
    };
  }

  const stripePaymentIntentId = session.payment_intent;
  if (typeof stripePaymentIntentId !== "string") {
    return {
      success: false,
      message: "Missing 'payment_intent'",
    };
  }

  if (!session.metadata) {
    return {
      success: false,
      message: "Missing 'metadata'",
    };
  }

  const { buyerId, articleId } = session.metadata;
  if (!buyerId || !articleId) {
    return {
      success: false,
      message: "Missing 'buyerId' and/or 'articleId'",
    };
  }

  return {
    success: true,
    buyerId,
    articleId,
    paymentAmount,
    stripePaymentIntentId,
  };
}
