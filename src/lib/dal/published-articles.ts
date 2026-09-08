import { and, desc, eq } from "drizzle-orm";
import { cacheTag } from "next/cache";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { articleTag, latestArticlesTag } from "@/lib/cache-tags";

export async function getLatestArticles() {
  "use cache";
  cacheTag(latestArticlesTag);

  return await db
    .select({
      id: articles.id,
      title: articles.title,
      price: articles.price,
      publishedAt: articles.publishedAt,
    })
    .from(articles)
    .where(eq(articles.status, "published"))
    .orderBy(desc(articles.publishedAt))
    .limit(20);
}

export async function getPublishedArticle(id: string) {
  "use cache";
  cacheTag(articleTag(id));

  const [article] = await db
    .select({
      id: articles.id,
      authorId: articles.authorId,
      title: articles.title,
      body: articles.body,
      status: articles.status,
      price: articles.price,
      publishedAt: articles.publishedAt,
    })
    .from(articles)
    .where(and(eq(articles.id, id), eq(articles.status, "published")));

  return article;
}
