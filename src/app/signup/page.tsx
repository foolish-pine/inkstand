"use client";

import {
  type HTMLInputTypeAttribute,
  type HTMLInputAutoCompleteAttribute,
} from "react";
import { useActionState } from "react";
import { signUp, type SignUpFormState } from "@/actions/auth";

const initialState: SignUpFormState = {
  defaultValues: {
    email: "",
    username: "",
  },
  formErrors: [],
  fieldErrors: {},
};

function TextField({
  label,
  name,
  type,
  autoComplete,
  defaultValue,
  hint,
  errors,
}: {
  label: string;
  name: string;
  type: HTMLInputTypeAttribute;
  autoComplete: HTMLInputAutoCompleteAttribute;
  defaultValue?: string;
  hint?: string;
  errors: string[] | undefined;
}) {
  const hintId = hint ? `${name}-hint` : undefined;
  const errorId = errors && errors.length > 0 ? `${name}-error` : undefined;

  return (
    <div>
      <label htmlFor={name} className="text-muted block text-xs tracking-wider">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        aria-invalid={errors && errors.length > 0 ? true : undefined}
        aria-describedby={
          [hintId, errorId].filter((i) => i !== undefined).length > 0
            ? [hintId, errorId].filter((i) => i !== undefined).join(" ")
            : undefined
        }
        className="border-rule focus:border-accent aria-invalid:border-seal mt-2 w-full border-b-2 bg-transparent pb-2 text-base transition-colors outline-none"
      />
      {hint && (
        <p id={hintId} className="text-muted mt-2 text-xs">
          {hint}
        </p>
      )}
      {errors && errors.length > 0 && (
        <ul id={errorId}>
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

export default function SignUp() {
  const [state, formAction, isPending] = useActionState(signUp, initialState);

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5">
          <span aria-hidden className="bg-seal size-2" />
          <span className="font-display text-lg tracking-[0.3em]">
            inkstand
          </span>
        </div>
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
      </div>
    </main>
  );
}
