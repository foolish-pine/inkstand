import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { purchases } from "@/db/schema";
import { requireUser } from "@/lib/current-user";

export async function hasPurchasedArticle(articleId: string) {
  const user = await requireUser();

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
