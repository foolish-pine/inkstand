import Link from "next/link";
import { ArticleForm } from "../article-form";
import { createArticle } from "@/actions/articles";
import { requireUser } from "@/lib/current-user";

export default async function NewArticle() {
  await requireUser();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <Link
        href="/dashboard"
        className="text-muted hover:text-foreground focus-visible:outline-accent text-xs tracking-wider underline underline-offset-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        ダッシュボードへ戻る
      </Link>
      <h1 className="font-display mt-8 text-3xl tracking-wide">記事を書く</h1>
      <ArticleForm
        defaultValues={{
          title: "",
          body: "",
          status: "draft",
          price: "",
        }}
        action={createArticle}
      />
    </main>
  );
}
