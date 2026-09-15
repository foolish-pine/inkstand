"use client";

import { nanoid } from "nanoid";
import { useActionState, useState } from "react";
import { CoverImageInput } from "./cover-image-input";
import {
  type ArticleFormState,
  type ArticleFormValues,
} from "@/actions/articles";
import { getString } from "@/actions/form-data";
import { TextField } from "@/components/text-field";
import { TextareaField } from "@/components/textarea-field";
import { coverImageUrl } from "@/lib/cover-image-url";
import { createClient } from "@/lib/supabase/client";

export type CoverImageState =
  | {
      file: File;
      extension: string;
      errorMessage: "";
    }
  | {
      file: null;
      extension: null;
      errorMessage: string;
    };

export function ArticleForm({
  defaultValues,
  action,
  articleId,
}: {
  defaultValues: ArticleFormValues;
  action: (
    prevState: ArticleFormState,
    formData: FormData,
  ) => Promise<ArticleFormState>;
  articleId?: string;
}) {
  const initialState: ArticleFormState = {
    defaultValues,
    formErrors: [],
    fieldErrors: {},
  };
  const [coverImage, setCoverImage] = useState<CoverImageState>({
    file: null,
    extension: null,
    errorMessage: "",
  });

  const [state, formAction, isPending] = useActionState(
    async (
      prevState: ArticleFormState,
      formData: FormData,
    ): Promise<ArticleFormState> => {
      const defaultValues = {
        title: getString(formData, "title"),
        body: getString(formData, "body"),
        status: getString(formData, "status"),
        price: getString(formData, "price"),
        coverImagePath: getString(formData, "coverImagePath"),
      };

      const { file, extension } = coverImage;

      if (!file) return action(prevState, formData);

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user)
        return {
          defaultValues,
          formErrors: [
            "セッションが切断されました。もう一度ログインしてください。",
          ],
          fieldErrors: {},
        };

      const { data, error } = await supabase.storage
        .from("images")
        .upload(`${user.id}/covers/${nanoid()}.${extension}`, file);

      if (error)
        return {
          defaultValues,
          formErrors: [],
          fieldErrors: {
            coverImagePath: [
              "カバー画像のアップロードに失敗しました。もう一度お試しください。",
            ],
          },
        };

      formData.set("coverImagePath", data.path);

      return action(prevState, formData);
    },
    initialState,
  );

  return (
    <form action={formAction} className="mt-12 space-y-10">
      {articleId && (
        <input type="hidden" name="articleId" defaultValue={articleId} />
      )}
      <TextField
        label="タイトル"
        name="title"
        type="text"
        defaultValue={state.defaultValues.title}
        errors={state.fieldErrors.title}
      />
      <TextareaField
        label="本文"
        name="body"
        hint="Markdownで書けます。"
        defaultValue={state.defaultValues.body}
        errors={state.fieldErrors.body}
      />
      <fieldset
        aria-invalid={
          state.fieldErrors.status && state.fieldErrors.status.length > 0
            ? true
            : undefined
        }
        aria-describedby={state.fieldErrors.status ? "status-error" : undefined}
      >
        <legend className="text-muted text-xs tracking-wider">公開状態</legend>
        <div className="mt-3 flex gap-6">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="radio"
              name="status"
              value="draft"
              defaultChecked={state.defaultValues.status === "draft"}
              className="accent-accent"
            />
            下書き
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="radio"
              name="status"
              value="published"
              defaultChecked={state.defaultValues.status === "published"}
              className="accent-accent"
            />
            公開
          </label>
        </div>
        {state.fieldErrors.status && state.fieldErrors.status.length > 0 && (
          <ul id="status-error">
            {state.fieldErrors.status.map((error) => (
              <li className="text-seal mt-2 text-xs" key={error}>
                {error}
              </li>
            ))}
          </ul>
        )}
      </fieldset>
      <TextField
        label="価格（円）"
        name="price"
        type="text"
        inputMode="numeric"
        defaultValue={state.defaultValues.price}
        hint="0円にすると無料記事になります。また、有料記事の最低価格は50円、最高価格は50000円です。"
        errors={state.fieldErrors.price}
      />
      <CoverImageInput
        coverImage={coverImage}
        setCoverImage={setCoverImage}
        currentImageUrl={coverImageUrl(state.defaultValues.coverImagePath)}
        errors={state.fieldErrors.coverImagePath}
      />
      <input
        type="hidden"
        name="coverImagePath"
        defaultValue={state.defaultValues.coverImagePath}
      />
      <button
        type="submit"
        disabled={isPending}
        className="bg-foreground text-background focus-visible:outline-accent w-full cursor-pointer py-3 text-sm tracking-wider transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "保存中です…" : "保存する"}
      </button>
    </form>
  );
}
