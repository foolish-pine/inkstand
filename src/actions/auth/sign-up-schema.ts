import z from "zod";

const RESERVED_USERNAMES = new Set([
  "login",
  "signup",
  "logout",
  "settings",
  "admin",
  "api",
  "auth",
  "dashboard",
  "new",
  "edit",
  "search",
  "explore",
  "support",
  "help",
  "official",
  "staff",
  "root",
  "system",
  "about",
  "terms",
  "privacy",
  "contact",
  "null",
  "undefined",
]);

export const signUpSchema = z.object({
  email: z.email({ error: "メールアドレスの形式が正しくありません。" }),
  password: z
    .string()
    .min(12, "パスワードは12文字以上で入力してください。")
    .refine(
      (v) => v === v.trim(),
      "パスワードの先頭・末尾に空白は使用できません。",
    )
    .refine(
      (v) => !/[\u0000-\u001F\u007F]/.test(v),
      "パスワードに使用できない文字が含まれています。",
    )
    .refine(
      (v) => new TextEncoder().encode(v).length <= 72,
      "パスワードが長すぎます（72バイト以内）。",
    ),
  username: z
    .string()
    .trim()
    .min(3, "3文字以上で入力してください。")
    .max(30, "30文字以内で入力してください。")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "半角英数字とアンダースコア（_）のみ使用できます。",
    )
    .regex(/^[a-zA-Z]/, "先頭は英字にしてください。")
    .refine((v) => !v.includes("__"), "アンダースコアは連続できません。")
    .refine((v) => !v.endsWith("_"), "末尾にアンダースコアは使用できません。")
    .refine(
      (v) => !RESERVED_USERNAMES.has(v.toLowerCase()),
      "このユーザー名は使用できません。",
    ),
});
