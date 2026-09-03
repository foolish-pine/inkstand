import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { articles } from "@/db/schema";

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
