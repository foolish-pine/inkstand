import { desc, and, eq } from "drizzle-orm";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { requireUser } from "@/lib/current-user";

export async function getMyArticles() {
  const user = await requireUser();

  return await db
    .select({
      id: articles.id,
      title: articles.title,
      status: articles.status,
      price: articles.price,
    })
    .from(articles)
    .where(eq(articles.authorId, user.id))
    .orderBy(desc(articles.createdAt));
}

export async function getMyArticle(id: string) {
  const user = await requireUser();

  const [article] = await db
    .select({
      id: articles.id,
      title: articles.title,
      body: articles.body,
      status: articles.status,
      price: articles.price,
    })
    .from(articles)
    .where(and(eq(articles.authorId, user.id), eq(articles.id, id)));

  return article;
}
