"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, type SignInFormState } from "@/actions/auth";
import { TextField } from "@/components/text-field";
import { Wordmark } from "@/components/wordmark";

const initialState: SignInFormState = {
  defaultValues: {
    email: "",
  },
  formErrors: [],
  fieldErrors: {},
};

export default function Login() {
  const [state, formAction, isPending] = useActionState(signIn, initialState);

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Wordmark />
        <h1 className="font-display mt-12 text-3xl tracking-wide">ログイン</h1>
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
            autoComplete="current-password"
            errors={state.fieldErrors.password}
          />
          <button
            type="submit"
            disabled={isPending}
            className="bg-foreground text-background focus-visible:outline-accent mt-4 w-full cursor-pointer py-3 text-sm tracking-wider transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "ログインしています…" : "ログイン"}
          </button>
        </form>
        <p className="text-muted mt-10 text-xs">
          アカウントをお持ちでない方は
          <Link
            href="/signup"
            className="text-foreground focus-visible:outline-accent ml-1 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            アカウントを作成
          </Link>
        </p>
      </div>
    </main>
  );
}
