"use server";

import { and, eq, sql } from "drizzle-orm";
import { updateTag } from "next/cache";
import { notFound, redirect } from "next/navigation";
import z from "zod";
import { articleFormSchema } from "./articles/article-form-schema";
import { getString } from "./form-data";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { latestArticlesTag } from "@/lib/cache-tags";
import { requireUser } from "@/lib/current-user";

export type ArticleFormValues = {
  title: string;
  body: string;
  status: string;
  price: string;
};

export type ArticleFormState = {
  defaultValues: ArticleFormValues;
  formErrors: string[];
  fieldErrors: {
    title?: string[];
    body?: string[];
    status?: string[];
    price?: string[];
  };
};

export async function createArticle(
  prevState: ArticleFormState,
  formData: FormData,
): Promise<ArticleFormState> {
  const user = await requireUser();

  const defaultValues = {
    title: getString(formData, "title"),
    body: getString(formData, "body"),
    status: getString(formData, "status"),
    price: getString(formData, "price"),
  };

  const validated = articleFormSchema.safeParse(defaultValues);

  if (!validated.success)
    return {
      defaultValues,
      ...z.flattenError(validated.error),
    };

  const { title, body, status, price } = validated.data;

  await db.insert(articles).values({
    authorId: user.id,
    title,
    body,
    status,
    price,
    ...(status === "published" && { publishedAt: new Date() }),
  });

  updateTag(latestArticlesTag);

  redirect("/dashboard");
}

export async function updateArticle(
  prevState: ArticleFormState,
  formData: FormData,
): Promise<ArticleFormState> {
  const user = await requireUser();

  const defaultValues = {
    title: getString(formData, "title"),
    body: getString(formData, "body"),
    status: getString(formData, "status"),
    price: getString(formData, "price"),
  };

  const validated = articleFormSchema.safeParse(defaultValues);

  if (!validated.success)
    return {
      defaultValues,
      ...z.flattenError(validated.error),
    };

  const articleId = getString(formData, "articleId");
  const { title, body, status, price } = validated.data;

  const [article] = await db
    .update(articles)
    .set({
      title,
      body,
      status,
      price,
      ...(status === "published" && {
        publishedAt: sql`COALESCE(${articles.publishedAt}, NOW())`,
      }),
    })
    .where(and(eq(articles.authorId, user.id), eq(articles.id, articleId)))
    .returning({ id: articles.id });

  if (!article) notFound();

  updateTag(latestArticlesTag);

  redirect("/dashboard");
}

export async function deleteArticle(formData: FormData): Promise<void> {
  const user = await requireUser();

  const articleId = getString(formData, "articleId");

  const [article] = await db
    .delete(articles)
    .where(and(eq(articles.id, articleId), eq(articles.authorId, user.id)))
    .returning({ id: articles.id });

  if (!article) notFound();

  updateTag(latestArticlesTag);

  redirect("/dashboard");
}
