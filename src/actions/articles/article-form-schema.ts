import z from "zod";
import { countCharacters } from "./count-characters";
import {
  ARTICLE_TITLE_MAX_LENGTH,
  PAID_ARTICLE_BODY_MIN_LENGTH,
  articleStatus,
} from "@/db/schema";

export const articleFormSchema = z
  .object({
    title: z
      .string()
      .min(1, "タイトルを入力してください。")
      .refine((s) => countCharacters(s) <= ARTICLE_TITLE_MAX_LENGTH, {
        message: `タイトルは${ARTICLE_TITLE_MAX_LENGTH}文字以内にしてください。`,
      }),
    body: z.string().min(1, "本文を入力してください。"),
    status: z.enum(
      articleStatus.enumValues,
      "公開状態は「下書き」または「公開」を選択してください。",
    ),
    price: z
      .string()
      .trim()
      .regex(/^\d+$/, "価格を入力してください。")
      .transform(Number)
      .refine((n) => n === 0 || n >= 50, {
        message:
          "無料の場合は0円を、有料の場合は50円以上の価格を設定してください。",
      })
      .refine((n) => n <= 50000, {
        message: "50000円以下の価格を設定してください。",
      }),
  })
  .refine(
    (val) =>
      val.price === 0 ||
      countCharacters(val.body) >= PAID_ARTICLE_BODY_MIN_LENGTH,
    {
      message: `有料の場合、本文は${PAID_ARTICLE_BODY_MIN_LENGTH}文字以上必要です。`,
      path: ["body"],
    },
  );
