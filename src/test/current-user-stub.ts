import type { User } from "@supabase/supabase-js";

// Next.js の外（Vitest）では cookies() を読めないため、本物の requireUser() を
// そのまま実行できない。
//
// DB テストで確かめたいのは「認証された人のデータだけを返すか」（認可）であって、
// Supabase Auth が正しく動くか（認証）ではない。ここでは認証だけを差し替え、
// テストが「今は誰としてアクセスするか」を指定できるようにする。
//
// vitest.db.config.mts で @/lib/current-user をこのファイルに向けている。

let currentUserId: string | null = null;

export function signInAs(userId: string) {
  currentUserId = userId;
}

// 各テストの前に呼ぶ。指定を忘れたテストが、前のテストのユーザーで
// 走ってしまうのを防ぐ。
export function resetCurrentUser() {
  currentUserId = null;
}

export async function requireUser(): Promise<User> {
  if (!currentUserId) {
    throw new Error(
      "signInAs() が呼ばれていません。誰としてアクセスするかを指定してください。",
    );
  }

  return {
    id: currentUserId,
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    created_at: new Date(0).toISOString(),
  };
}
