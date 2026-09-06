import type { User } from "@supabase/supabase-js";

// Next.js の外（Vitest）では cookies() を読めないため、本物の requireUser() を
// そのまま実行できない。
//
// DB テストで確かめたいのは「認証された人のデータだけを返すか」（認可）であって、
// Supabase Auth が正しく動くか（認証）ではない。ここでは認証だけを差し替え、
// テストが「今は誰としてアクセスするか」を指定できるようにする。
//
// vitest.db.config.mts で @/lib/current-user をこのファイルに向けている。

type CurrentUser =
  | { type: "unset" }
  | { type: "anonymous" }
  | { type: "signedIn"; userId: string };

let currentUser: CurrentUser = { type: "unset" };

export function signInAs(userId: string) {
  currentUser = { type: "signedIn", userId };
}

export function signOut() {
  currentUser = { type: "anonymous" };
}

// 各テストの前に呼ぶ。指定を忘れたテストが、前のテストのユーザーで
// 走ってしまうのを防ぐ。
export function resetCurrentUser() {
  currentUser = { type: "unset" };
}

export async function getCurrentUser(): Promise<User | null> {
  if (currentUser.type === "unset") {
    throw new Error(
      "signInAs() または signOut() が呼ばれていません。誰としてアクセスするかを指定してください。",
    );
  }

  if (currentUser.type === "anonymous") return null;

  return {
    id: currentUser.userId,
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    created_at: new Date(0).toISOString(),
  };
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("未ログインです。実際は /login へリダイレクトします。");
  }

  return user;
}
