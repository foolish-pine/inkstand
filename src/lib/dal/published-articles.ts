import { desc, and, eq } from "drizzle-orm";
import { cacheTag } from "next/cache";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { articleTag, latestArticlesTag } from "@/lib/cache-tags";

export const getLatestArticles = async () => {
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
};

export const getPublishedArticle = async (id: string) => {
  "use cache";
  cacheTag(articleTag(id));

  const [article] = await db
    .select({
      id: articles.id,
      title: articles.title,
      body: articles.body,
      price: articles.price,
      publishedAt: articles.publishedAt,
    })
    .from(articles)
    .where(and(eq(articles.id, id), eq(articles.status, "published")));

  return article;
};
