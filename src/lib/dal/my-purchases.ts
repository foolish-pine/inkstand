import { and, eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import { purchases } from "@/db/schema";
import { getCurrentUser } from "@/lib/current-user";

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
