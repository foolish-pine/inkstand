"use server";

import { updateTag } from "next/cache";
import { notFound, redirect } from "next/navigation";
import z from "zod";
import { articleFormSchema } from "./articles/article-form-schema";
import { getString } from "./form-data";
import { latestArticlesTag, articleTag } from "@/lib/cache-tags";
import {
  createMyArticle,
  deleteMyArticle,
  updateMyArticle,
} from "@/lib/dal/my-articles";

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

  await createMyArticle({
    title,
    body,
    status,
    price,
  });

  updateTag(latestArticlesTag);

  redirect("/dashboard");
}

export async function updateArticle(
  prevState: ArticleFormState,
  formData: FormData,
): Promise<ArticleFormState> {
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

  const article = await updateMyArticle(articleId, {
    title,
    body,
    status,
    price,
  });

  if (!article) notFound();

  updateTag(latestArticlesTag);
  updateTag(articleTag(article.id));

  redirect("/dashboard");
}

export async function deleteArticle(formData: FormData): Promise<void> {
  const articleId = getString(formData, "articleId");

  const article = await deleteMyArticle(articleId);

  if (!article) notFound();

  updateTag(latestArticlesTag);
  updateTag(articleTag(article.id));

  redirect("/dashboard");
}
