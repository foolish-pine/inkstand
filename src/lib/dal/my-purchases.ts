import { and, desc, eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import { articles, purchases } from "@/db/schema";
import { getCurrentUser, requireUser } from "@/lib/current-user";

async function fetchHasPurchasedArticle(articleId: string) {
  const user = await getCurrentUser();

  if (!user) return false;

  const [purchase] = await db
    .select({
      id: purchases.id,
    })
    .from(purchases)
    .where(
      and(eq(purchases.articleId, articleId), eq(purchases.buyerId, user.id)),
    );

  return purchase !== undefined;
}

export const hasPurchasedArticle = cache(fetchHasPurchasedArticle);

export async function getMyPurchases() {
  const user = await requireUser();

  return await db
    .select({
      articleId: articles.id,
      articleTitle: articles.title,
      createdAt: purchases.createdAt,
      paymentAmount: purchases.paymentAmount,
    })
    .from(purchases)
    .innerJoin(articles, eq(purchases.articleId, articles.id))
    .where(eq(purchases.buyerId, user.id))
    .orderBy(desc(purchases.createdAt));
}
