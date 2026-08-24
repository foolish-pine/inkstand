"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUp, type SignUpFormState } from "@/actions/auth";
import { TextField } from "@/components/text-field";
import { Wordmark } from "@/components/wordmark";

const initialState: SignUpFormState = {
  defaultValues: {
    email: "",
    username: "",
  },
  formErrors: [],
  fieldErrors: {},
};

export default function SignUp() {
  const [state, formAction, isPending] = useActionState(signUp, initialState);

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Wordmark />
        <h1 className="font-display mt-12 text-3xl tracking-wide">
          アカウントを作成
        </h1>
        <p className="text-muted mt-3 text-sm leading-relaxed">
          書いた記事に価格をつけて公開できます。
        </p>
        {state.formErrors.length > 0 && (
          <p
            role="alert"
            className="border-seal bg-seal/10 text-seal mt-8 border-l-2 px-4 py-3 text-sm leading-relaxed"
          >
            {state.formErrors[0]}
          </p>
        )}
        <form action={formAction} className="mt-10 space-y-7">
          <TextField
            label="メールアドレス"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={state.defaultValues.email}
            errors={state.fieldErrors.email}
          />
          <TextField
            label="パスワード"
            name="password"
            type="password"
            autoComplete="new-password"
            hint="12文字以上で入力してください。"
            errors={state.fieldErrors.password}
          />
          <TextField
            label="ユーザー名"
            name="username"
            type="text"
            autoComplete="username"
            hint="プロフィールのURLに使われます。"
            defaultValue={state.defaultValues.username}
            errors={state.fieldErrors.username}
          />
          <button
            type="submit"
            disabled={isPending}
            className="bg-foreground text-background focus-visible:outline-accent mt-4 w-full cursor-pointer py-3 text-sm tracking-wider transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "作成しています…" : "アカウントを作成"}
          </button>
        </form>
        <p className="text-muted mt-10 text-xs">
          すでにアカウントをお持ちの方は
          <Link
            href="/login"
            className="text-foreground focus-visible:outline-accent ml-1 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            ログイン
          </Link>
        </p>
      </div>
    </main>
  );
}
