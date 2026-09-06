import { db } from "@/db";
import { purchases } from "@/db/schema";

export async function createPurchase({
  buyerId,
  articleId,
  paymentAmount,
  stripePaymentIntentId,
}: {
  buyerId: string;
  articleId: string;
  paymentAmount: number;
  stripePaymentIntentId: string;
}) {
  const [purchase] = await db
    .insert(purchases)
    .values({
      buyerId,
      articleId,
      paymentAmount,
      stripePaymentIntentId,
    })
    .onConflictDoNothing({ target: [purchases.buyerId, purchases.articleId] })
    .returning({ id: purchases.id });

  return purchase;
}
