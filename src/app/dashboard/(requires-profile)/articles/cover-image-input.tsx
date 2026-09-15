"use client";

import Image from "next/image";
import { type ChangeEvent, type Dispatch, type SetStateAction } from "react";
import { CoverImageState } from "./article-form";
import { validateImageFile } from "@/lib/validate-image-file";

export function CoverImageInput({
  coverImage,
  setCoverImage,
  currentImageUrl,
  errors,
}: {
  coverImage: CoverImageState;
  setCoverImage: Dispatch<SetStateAction<CoverImageState>>;
  currentImageUrl: string | null;
  errors: string[] | undefined;
}) {
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setCoverImage({
      file: null,
      extension: null,
      errorMessage: "",
    });

    const file = e.target.files?.[0];
    if (!file) return;

    const result = validateImageFile({
      type: file.type,
      size: file.size,
    });

    if (!result.success) {
      setCoverImage({
        file: null,
        extension: null,
        errorMessage: result.message,
      });

      return;
    }

    setCoverImage({
      file,
      extension: result.extension,
      errorMessage: "",
    });
  }

  const hintId = "cover-image-hint";
  const validationErrorId = coverImage.errorMessage
    ? "cover-image-validation-error"
    : undefined;
  const uploadErrorId =
    errors && errors.length > 0 ? "cover-image-upload-error" : undefined;

  return (
    <div>
      <label
        htmlFor="cover-image"
        className="text-muted block text-xs tracking-wider"
      >
        カバー画像
      </label>
      <input
        id="cover-image"
        type="file"
        accept="image/*"
        onChange={handleChange}
        aria-invalid={coverImage.errorMessage ? true : undefined}
        aria-describedby={
          [hintId, validationErrorId, uploadErrorId].filter(
            (i) => i !== undefined,
          ).length > 0
            ? [hintId, validationErrorId, uploadErrorId]
                .filter((i) => i !== undefined)
                .join(" ")
            : undefined
        }
        className="border-rule file:bg-foreground file:text-background focus-visible:outline-accent mt-2 w-full cursor-pointer border-b-2 pb-2 text-sm file:mr-4 file:cursor-pointer file:border-0 file:px-4 file:py-2 file:text-xs file:tracking-wider file:transition-opacity hover:file:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2"
      />
      {/* ファイル入力には値を復元できない（ブラウザが許さない）ので、
          いま保存されている画像は別に見せる。新しく選んだ場合は、
          保存されるのはそちらなのでファイル名に差し替える。 */}
      {coverImage.file ? (
        <p className="text-muted mt-2 truncate text-xs">
          選択中: {coverImage.file.name}
        </p>
      ) : (
        currentImageUrl && (
          <div className="mt-3">
            <p className="text-muted text-xs">現在の画像</p>
            <div className="border-rule relative mt-2 h-20 w-32 overflow-hidden border">
              <Image
                src={currentImageUrl}
                alt=""
                fill
                sizes="128px"
                className="object-cover"
              />
            </div>
          </div>
        )
      )}
      <p id={hintId} className="text-muted mt-2 text-xs">
        アップロードできる画像はJPG、PNG、WebPのいずれかで、サイズが10MB以下のものです。
      </p>
      {coverImage.errorMessage && (
        <p
          id="cover-image-validation-error"
          className="text-seal mt-2 text-xs"
          role="alert"
        >
          {coverImage.errorMessage}
        </p>
      )}
      {errors && errors.length > 0 && (
        <ul id={uploadErrorId}>
          {errors.map((error) => (
            <li className="text-seal mt-2 text-xs" key={error}>
              {error}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
