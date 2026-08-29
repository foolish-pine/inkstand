"use server";

import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import postgres from "postgres";
import z from "zod";
import { signInSchema } from "./auth/sign-in-schema";
import { signUpSchema } from "./auth/sign-up-schema";
import { getString } from "./form-data";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";

export type SignUpFormState = {
  defaultValues: {
    email: string;
    username: string;
  };
  formErrors: string[];
  fieldErrors: { email?: string[]; password?: string[]; username?: string[] };
};

export async function signUp(
  prevState: SignUpFormState,
  formData: FormData,
): Promise<SignUpFormState> {
  const defaultValues = {
    email: getString(formData, "email"),
    username: getString(formData, "username"),
  };

  const validated = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    username: formData.get("username"),
  });

  if (!validated.success)
    return {
      defaultValues,
      ...z.flattenError(validated.error),
    };

  const { email, password, username } = validated.data;

  const [existingProfile] = await db
    .select({
      id: profiles.id,
    })
    .from(profiles)
    .where(
      eq(
        sql<string>`lower(${profiles.username})`,
        sql<string>`lower(${username})`,
      ),
    );

  if (existingProfile)
    return {
      defaultValues,
      formErrors: [],
      fieldErrors: {
        username: ["このユーザー名は登録済みです。"],
      },
    };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (!data.user || error)
    return {
      defaultValues,
      formErrors: ["ユーザー登録に失敗しました。もう一度お試しください。"],
      fieldErrors: {},
    };

  try {
    await db.insert(profiles).values({
      id: data.user.id,
      username,
      displayName: username,
    });
  } catch (e) {
    if (
      e instanceof postgres.PostgresError &&
      e.code === "23505" &&
      e.constraint_name === "profiles_username_lower_idx"
    ) {
      return {
        defaultValues,
        formErrors: [],
        fieldErrors: {
          username: ["このユーザー名は登録済みです。"],
        },
      };
    }

    return {
      defaultValues,
      formErrors: ["ユーザー登録に失敗しました。もう一度お試しください。"],
      fieldErrors: {},
    };
  }

  redirect("/dashboard");
}

export type SignInFormState = {
  defaultValues: {
    email: string;
  };
  formErrors: string[];
  fieldErrors: { email?: string[]; password?: string[] };
};

export async function signIn(
  prevState: SignInFormState,
  formData: FormData,
): Promise<SignInFormState> {
  const defaultValues = {
    email: getString(formData, "email"),
  };

  const validated = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success)
    return {
      defaultValues,
      ...z.flattenError(validated.error),
    };

  const { email, password } = validated.data;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (!data.user || error)
    return {
      defaultValues,
      formErrors: [
        "ログインに失敗しました。メールアドレスとパスワードをご確認の上もう一度お試しください。",
      ],
      fieldErrors: {},
    };

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) throw error;

  redirect("/login");
}
