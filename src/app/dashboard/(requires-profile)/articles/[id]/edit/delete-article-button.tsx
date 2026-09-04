"use client";

import { useActionState, useRef, useState } from "react";
import { deleteArticle, DeleteArticleFormState } from "@/actions/articles";

const initialState: DeleteArticleFormState = {
  formErrors: [],
};

// useActionState の結果に依存する部分をここにまとめてある。親から渡す key が
// 変わるとこのコンポーネントごと作り直され、前回のエラーが消える。
// 「やめる」も含めているのは、エラーを 2 つのボタンの上へ出すため。
function DeleteArticleActions({
  articleId,
  onCancel,
}: {
  articleId: string;
  onCancel: () => void;
}) {
  const [state, formAction, isPending] = useActionState(
    deleteArticle,
    initialState,
  );

  return (
    <>
      {state.formErrors.length > 0 && (
        <p
          role="alert"
          className="border-seal bg-seal/10 text-seal mt-6 border-l-2 px-4 py-3 text-sm leading-relaxed"
        >
          {state.formErrors[0]}
        </p>
      )}
      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="border-rule hover:border-foreground focus-visible:outline-accent flex-1 cursor-pointer border px-5 py-2.5 text-sm tracking-wider transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          やめる
        </button>
        <form action={formAction} className="flex-1">
          <input type="hidden" name="articleId" defaultValue={articleId} />
          <button
            type="submit"
            disabled={isPending}
            className="bg-seal text-background focus-visible:outline-seal w-full cursor-pointer px-5 py-2.5 text-sm tracking-wider transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "削除中です…" : "削除する"}
          </button>
        </form>
      </div>
    </>
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
  // ダイアログを閉じるたびに増やし、DeleteArticleActions の key にする。
  // 開き直したときに前回の「削除できません」が残っていると、まだ何かが
  // 進行中のように見えてしまう。onClose は close() でも Esc でも発火する。
  const [formGeneration, setFormGeneration] = useState(0);

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
        onClose={() => setFormGeneration((generation) => generation + 1)}
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
        <DeleteArticleActions
          key={formGeneration}
          articleId={articleId}
          onCancel={() => dialogRef.current?.close()}
        />
      </dialog>
    </>
  );
}
