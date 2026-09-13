import { ArticleForm } from "../article-form";
import { createArticle } from "@/actions/articles";
import { requireUser } from "@/lib/current-user";

export const instant = false;

export default async function NewArticle() {
  await requireUser();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <h1 className="font-display text-3xl tracking-wide">記事を書く</h1>
      <ArticleForm
        defaultValues={{
          title: "",
          body: "",
          status: "draft",
          price: "",
          coverImagePath: "",
        }}
        action={createArticle}
      />
    </main>
  );
}
