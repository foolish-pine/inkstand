"use client";

import { nanoid } from "nanoid";
import { type ChangeEvent, type SubmitEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function StorageTest() {
  const supabase = createClient();
  const [image, setImage] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [imagePath, setImagePath] = useState("");

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setImage(e.target.files?.[0] ?? null);
  }

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setImage(null);
    setErrorMessage("");
    setImagePath("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErrorMessage("ログインしてください。");
      return;
    }

    if (!image) {
      setErrorMessage("画像を選択してください。");
      return;
    }

    const result = await supabase.storage
      .from("images")
      .upload(`${user.id}/covers/${nanoid()}`, image);

    if (result.error) {
      setErrorMessage(result.error.message);
      return;
    }

    setImagePath(result.data.path);
  }

  return (
    <form onSubmit={handleSubmit}>
      {errorMessage && <p>{errorMessage}</p>}
      {imagePath && <p>アップロードに成功しました: {imagePath}</p>}
      <input type="file" accept="image/*" onChange={handleChange} />
      <button type="submit" disabled={image === null}>
        アップロード
      </button>
    </form>
  );
}
