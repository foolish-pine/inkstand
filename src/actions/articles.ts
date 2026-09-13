"use server";

import { updateTag } from "next/cache";
import { notFound, redirect } from "next/navigation";
import z from "zod";
import { articleFormSchema } from "./articles/article-form-schema";
import { getString } from "./form-data";
import { articleTag, latestArticlesTag } from "@/lib/cache-tags";
import {
  ArticleHasPurchasesError,
  createMyArticle,
  deleteMyArticle,
  updateMyArticle,
} from "@/lib/dal/my-articles";

export type ArticleFormValues = {
  title: string;
  body: string;
  status: string;
  price: string;
  coverImagePath: string;
};

export type ArticleFormState = {
  defaultValues: ArticleFormValues;
  formErrors: string[];
  fieldErrors: {
    title?: string[];
    body?: string[];
    status?: string[];
    price?: string[];
    coverImagePath?: string[];
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
    coverImagePath: getString(formData, "coverImagePath"),
  };

  const validated = articleFormSchema.safeParse(defaultValues);

  if (!validated.success)
    return {
      defaultValues,
      ...z.flattenError(validated.error),
    };

  const { title, body, status, price, coverImagePath } = validated.data;

  await createMyArticle({
    title,
    body,
    status,
    price,
    coverImagePath,
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
    coverImagePath: getString(formData, "coverImagePath"),
  };

  const validated = articleFormSchema.safeParse(defaultValues);

  if (!validated.success)
    return {
      defaultValues,
      ...z.flattenError(validated.error),
    };

  const articleId = getString(formData, "articleId");
  const { title, body, status, price, coverImagePath } = validated.data;

  const article = await updateMyArticle(articleId, {
    title,
    body,
    status,
    price,
    coverImagePath,
  });

  if (!article) notFound();

  updateTag(latestArticlesTag);
  updateTag(articleTag(article.id));

  redirect("/dashboard");
}

export type DeleteArticleFormState = {
  formErrors: string[];
};

export async function deleteArticle(
  prevState: DeleteArticleFormState,
  formData: FormData,
): Promise<DeleteArticleFormState> {
  const articleId = getString(formData, "articleId");

  // try の中は DAL の 1 行だけにする。notFound() と redirect() は例外を投げて
  // 制御するので、catch の範囲に入れると条件を広げたときに飲み込んでしまう。
  // そのために const ではなく let で受けている。
  let article: Awaited<ReturnType<typeof deleteMyArticle>>;
  try {
    article = await deleteMyArticle(articleId);
  } catch (e) {
    if (e instanceof ArticleHasPurchasesError) {
      return {
        formErrors: ["購入された記事は削除できません。"],
      };
    }

    throw e;
  }

  if (!article) notFound();

  updateTag(latestArticlesTag);
  updateTag(articleTag(article.id));

  redirect("/dashboard");
}
