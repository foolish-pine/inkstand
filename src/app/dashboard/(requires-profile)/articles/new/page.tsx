import Link from "next/link";
import { redirect } from "next/navigation";
import { ArticleForm } from "./article-form";
import { createClient } from "@/lib/supabase/server";

export default async function NewArticle() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) redirect("/login");

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <Link
        href="/dashboard"
        className="text-muted hover:text-foreground focus-visible:outline-accent text-xs tracking-wider underline underline-offset-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        ダッシュボードへ戻る
      </Link>
      <h1 className="font-display mt-8 text-3xl tracking-wide">記事を書く</h1>
      <ArticleForm />
    </main>
  );
}
