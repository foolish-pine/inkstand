"use server";

import { redirect } from "next/navigation";
import z from "zod";
import { signUpSchema } from "./auth/sign-up-schema";
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
  const validated = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    username: formData.get("username"),
  });

  if (!validated.success)
    return {
      defaultValues: {
        email: formData.get("email")?.toString() || "",
        username: formData.get("username")?.toString() || "",
      },
      ...z.flattenError(validated.error),
    };

  const { email, password, username } = validated.data;

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error)
    return {
      defaultValues: {
        email,
        username,
      },
      formErrors: ["ユーザー登録に失敗しました。もう一度お試しください。"],
      fieldErrors: {},
    };

  redirect("/");
}
