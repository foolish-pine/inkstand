import { sql } from "drizzle-orm";
import { afterAll, beforeEach } from "vitest";
import { db } from "@/db";
import { resetCurrentUser } from "@/test/current-user-stub";

// 各テストの前に、このアプリが作ったデータを消す。
// auth.users を消せば profiles と articles は外部キーの cascade で消える。
beforeEach(async () => {
  await db.execute(sql`TRUNCATE TABLE auth.users CASCADE`);
  resetCurrentUser();
});

afterAll(async () => {
  await db.$client.end();
});
