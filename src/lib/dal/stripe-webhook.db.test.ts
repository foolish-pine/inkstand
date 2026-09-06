import { describe, expect, it } from "vitest";
import { createPurchase } from "@/lib/dal/stripe-webhook";
import {
  createTestArticle,
  createTestUser,
  getTestPurchase,
} from "@/test/fixtures";

const validPaymentAmount = 1000;
const validStripePaymentIntentId = "valid-payment-intent";

describe("createPurchase", () => {
  it("指定した buyerId と articleId を持つ行が存在しないとき、purchases を作成する", async () => {
    const { userId: buyerId } = await createTestUser();
    const { userId: articleAuthorId } = await createTestUser();
    const { id: articleId } = await createTestArticle({
      authorId: articleAuthorId,
    });
    const result = await createPurchase({
      buyerId,
      articleId,
      paymentAmount: validPaymentAmount,
      stripePaymentIntentId: validStripePaymentIntentId,
    });
    const purchase = await getTestPurchase({
      buyerId,
      articleId,
    });

    expect(result).not.toBeUndefined();
    expect(purchase.length).toBe(1);
    expect(purchase[0]).toMatchObject({
      buyerId,
      articleId,
      paymentAmount: validPaymentAmount,
      stripePaymentIntentId: validStripePaymentIntentId,
    });
  });
  it("指定した buyerId と articleId を持つ行が存在するとき、purchases を作成せず undefined を返す", async () => {
    const { userId: buyerId } = await createTestUser();
    const { userId: articleAuthorId } = await createTestUser();
    const { id: articleId } = await createTestArticle({
      authorId: articleAuthorId,
    });
    await createPurchase({
      buyerId,
      articleId,
      paymentAmount: validPaymentAmount,
      stripePaymentIntentId: validStripePaymentIntentId,
    });
    const result = await createPurchase({
      buyerId,
      articleId,
      paymentAmount: validPaymentAmount,
      stripePaymentIntentId: validStripePaymentIntentId,
    });
    const purchase = await getTestPurchase({
      buyerId,
      articleId,
    });

    expect(result).toBeUndefined();
    expect(purchase.length).toBe(1);
    expect(purchase[0]).toMatchObject({
      buyerId,
      articleId,
      paymentAmount: validPaymentAmount,
      stripePaymentIntentId: validStripePaymentIntentId,
    });
  });
});
