import Link from "next/link";
import { redirect } from "next/navigation";
import { TextField } from "@/components/text-field";
import { TextareaField } from "@/components/textarea-field";
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
      <form className="mt-12 space-y-10">
        <TextField
          label="タイトル"
          name="title"
          type="text"
          errors={undefined}
        />
        <TextareaField
          label="本文"
          name="body"
          hint="Markdownで書けます。"
          errors={undefined}
        />
        <fieldset>
          <legend className="text-muted text-xs tracking-wider">
            公開状態
          </legend>
          <div className="mt-3 flex gap-6">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name="status"
                value="draft"
                defaultChecked
                className="accent-accent"
              />
              下書き
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name="status"
                value="published"
                className="accent-accent"
              />
              公開
            </label>
          </div>
        </fieldset>
        <TextField
          label="価格（円）"
          name="price"
          type="number"
          defaultValue="0"
          hint="0円にすると無料記事になります。"
          errors={undefined}
        />
        <button
          type="submit"
          className="bg-foreground text-background focus-visible:outline-accent w-full cursor-pointer py-3 text-sm tracking-wider transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          保存する
        </button>
      </form>
    </main>
  );
}
