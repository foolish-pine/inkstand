import { and, count, desc, eq, inArray, isNotNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { articles, purchases } from "@/db/schema";
import { requireUser } from "@/lib/current-user";

export async function getMySales() {
  const user = await requireUser();

  return await db
    .select({
      articleId: articles.id,
      articleTitle: articles.title,
      salesCount: count(purchases.id),
      salesAmount:
        sql<number>`coalesce(sum(${purchases.paymentAmount}), 0)`.mapWith(
          Number,
        ),
    })
    .from(articles)
    .leftJoin(purchases, eq(articles.id, purchases.articleId))
    .where(and(eq(articles.authorId, user.id), isNotNull(articles.publishedAt)))
    .groupBy(articles.id)
    .orderBy(desc(articles.publishedAt), desc(articles.id));
}

export async function getMySalesByMonth(range: string[]) {
  const user = await requireUser();

  const month = sql<string>`to_char(${purchases.createdAt} AT TIME ZONE 'Asia/Tokyo', 'YYYY-MM')`;

  return await db
    .select({
      month,
      salesCount: count(purchases.id),
      salesAmount:
        sql<number>`coalesce(sum(${purchases.paymentAmount}), 0)`.mapWith(
          Number,
        ),
    })
    .from(purchases)
    .innerJoin(articles, eq(purchases.articleId, articles.id))
    .where(and(eq(articles.authorId, user.id), inArray(month, range)))
    .groupBy(month)
    .orderBy(month);
}
