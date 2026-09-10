import { notFound } from "next/navigation";
import { ArticleForm } from "../../article-form";
import { DeleteArticleButton } from "./delete-article-button";
import { updateArticle } from "@/actions/articles";
import { getMyArticle } from "@/lib/dal/my-articles";

export default async function EditArticle({
  params,
}: PageProps<"/dashboard/articles/[id]/edit">) {
  const { id } = await params;
  const article = await getMyArticle(id);

  if (!article) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <h1 className="font-display text-3xl tracking-wide">記事を編集する</h1>
      <ArticleForm
        defaultValues={{
          title: article.title,
          body: article.body,
          status: article.status,
          price: article.price.toString(),
        }}
        action={updateArticle}
        articleId={article.id}
      />
      <div className="border-rule mt-16 border-t pt-8">
        <DeleteArticleButton articleId={article.id} title={article.title} />
      </div>
    </main>
  );
}
