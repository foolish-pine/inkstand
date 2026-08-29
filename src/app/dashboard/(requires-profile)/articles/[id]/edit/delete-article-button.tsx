"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";
import { deleteArticle } from "@/actions/articles";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-seal text-background focus-visible:outline-seal w-full cursor-pointer px-5 py-2.5 text-sm tracking-wider transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "削除中です…" : "削除する"}
    </button>
  );
}

export function DeleteArticleButton({
  articleId,
  title,
}: {
  articleId: string;
  title: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="text-muted hover:text-seal focus-visible:outline-seal cursor-pointer text-xs tracking-wider underline underline-offset-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        この記事を削除する
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby="delete-dialog-title"
        className="bg-surface text-foreground border-rule m-auto w-[calc(100%-3rem)] max-w-md border p-8 backdrop:bg-black/50"
      >
        <h2
          id="delete-dialog-title"
          className="font-display text-xl tracking-wide"
        >
          記事を削除しますか
        </h2>
        <p className="mt-4 text-sm">
          「{title}」を削除します。この操作は取り消せません。
        </p>
        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="border-rule hover:border-foreground focus-visible:outline-accent flex-1 cursor-pointer border px-5 py-2.5 text-sm tracking-wider transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            やめる
          </button>
          <form action={deleteArticle} className="flex-1">
            <input type="hidden" name="articleId" defaultValue={articleId} />
            <SubmitButton />
          </form>
        </div>
      </dialog>
    </>
  );
}
