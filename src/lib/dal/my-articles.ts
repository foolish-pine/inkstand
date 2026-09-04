import { desc, and, eq, sql, DrizzleQueryError } from "drizzle-orm";
import postgres from "postgres";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { requireUser } from "@/lib/current-user";

export class ArticleHasPurchasesError extends Error {
  constructor(articleId: string, options?: ErrorOptions) {
    super(
      `Cannot delete article ${articleId}: it has existing purchases`,
      options,
    );
    this.name = "ArticleHasPurchasesError";
  }
}

export type ArticleValues = Required<
  Pick<typeof articles.$inferInsert, "title" | "body" | "status" | "price">
>;

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

export async function getMyArticle(articleId: string) {
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
    .where(and(eq(articles.authorId, user.id), eq(articles.id, articleId)));

  return article;
}

export async function createMyArticle(values: ArticleValues) {
  const user = await requireUser();

  const [article] = await db
    .insert(articles)
    .values({
      authorId: user.id,
      ...values,
      ...(values.status === "published" && {
        publishedAt: sql`NOW()`,
      }),
    })
    .returning();

  return article;
}

export async function updateMyArticle(
  articleId: string,
  values: ArticleValues,
) {
  const user = await requireUser();

  const [article] = await db
    .update(articles)
    .set({
      ...values,
      ...(values.status === "published" && {
        publishedAt: sql`COALESCE(${articles.publishedAt}, NOW())`,
      }),
    })
    .where(and(eq(articles.authorId, user.id), eq(articles.id, articleId)))
    .returning();

  return article;
}

export async function deleteMyArticle(articleId: string) {
  const user = await requireUser();

  try {
    const [article] = await db
      .delete(articles)
      .where(and(eq(articles.authorId, user.id), eq(articles.id, articleId)))
      .returning({
        id: articles.id,
      });

    return article;
  } catch (e) {
    if (
      e instanceof DrizzleQueryError &&
      e.cause instanceof postgres.PostgresError &&
      e.cause.code === "23503" &&
      e.cause.constraint_name === "purchases_article_id_articles_id_fk"
    ) {
      throw new ArticleHasPurchasesError(articleId, { cause: e });
    }

    throw e;
  }
}
