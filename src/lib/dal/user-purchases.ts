import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { purchases } from "@/db/schema";

export async function hasUserPurchasedArticle({
  userId,
  articleId,
}: {
  userId: string;
  articleId: string;
}) {
  const [purchase] = await db
    .select({
      id: purchases.id,
    })
    .from(purchases)
    .where(
      and(eq(purchases.articleId, articleId), eq(purchases.buyerId, userId)),
    );

  return purchase !== undefined;
}
