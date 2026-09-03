import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { articles, purchases } from "@/db/schema";

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

export async function getArticleForCheckout(articleId: string) {
  const [article] = await db
    .select({
      id: articles.id,
      authorId: articles.authorId,
      title: articles.title,
      price: articles.price,
    })
    .from(articles)
    .where(and(eq(articles.id, articleId), eq(articles.status, "published")));

  return article;
}
