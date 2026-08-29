import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { requireUser } from "@/lib/current-user";

export default async function EditArticle({
  params,
}: PageProps<"/dashboard/articles/[id]/edit">) {
  const user = await requireUser();
  const { id } = await params;
  const [article] = await db
    .select({ id: articles.id })
    .from(articles)
    .where(and(eq(articles.authorId, user.id), eq(articles.id, id)));

  if (!article) notFound();

  return <p>article: {article.id}</p>;
}
