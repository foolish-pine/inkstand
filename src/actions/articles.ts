"use server";

import { redirect } from "next/navigation";
import z from "zod";
import { createArticleSchema } from "./articles/create-article-schema";
import { getString } from "./form-data";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";

export type CreateArticleFormState = {
  defaultValues: {
    title: string;
    body: string;
    status: string;
    price: string;
  };
  formErrors: string[];
  fieldErrors: {
    title?: string[];
    body?: string[];
    status?: string[];
    price?: string[];
  };
};

export async function createArticle(
  prevState: CreateArticleFormState,
  formData: FormData,
): Promise<CreateArticleFormState> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) redirect("/login");

  const defaultValues = {
    title: getString(formData, "title"),
    body: getString(formData, "body"),
    status: getString(formData, "status"),
    price: getString(formData, "price"),
  };

  const validated = createArticleSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    status: formData.get("status"),
    price: formData.get("price"),
  });

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

  redirect("/dashboard");
}
