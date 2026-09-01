import { sql } from "drizzle-orm";
import { db } from "@/db";
import { articles, PAID_ARTICLE_BODY_MIN_LENGTH, profiles } from "@/db/schema";

// テストごとに一意な値を作るための連番。TRUNCATE で消えるのはデータだけなので、
// 実行中は増え続けてよい。
let sequence = 0;
const nextSequence = () => ++sequence;

// auth.users は Supabase の管理領域で、Drizzle のスキーマには id しか宣言していない。
// テストで認証を通すわけではないので、外部キーを満たす行だけを直接入れる。
// プロフィールの作成そのものをテストしたい場合はこちらを使う。
export async function createTestAuthUser(): Promise<string> {
  const userId = crypto.randomUUID();

  await db.execute(sql`INSERT INTO auth.users (id) VALUES (${userId})`);

  return userId;
}

// 認証ユーザーとプロフィールをまとめて作る。ほとんどのテストはこちらでよい。
export async function createTestUser(): Promise<{
  userId: string;
  username: string;
}> {
  const userId = await createTestAuthUser();
  const username = `tester${nextSequence()}`;

  await db.insert(profiles).values({
    id: userId,
    username,
    displayName: username,
  });

  return { userId, username };
}

type ArticleOverrides = Partial<typeof articles.$inferInsert> & {
  authorId: string;
};

// 有料記事には本文の下限があるため、既定の本文はそれを満たす長さにしてある。
export async function createTestArticle(overrides: ArticleOverrides) {
  const [article] = await db
    .insert(articles)
    .values({
      title: `記事${nextSequence()}`,
      body: "あ".repeat(PAID_ARTICLE_BODY_MIN_LENGTH),
      status: "published",
      price: 0,
      publishedAt: new Date(),
      ...overrides,
    })
    .returning();

  // insert ... returning は必ず 1 行返すが、型の上では undefined を含む。
  // 嘘をつかずに絞り込むため、実行時に確認する。
  if (!article) throw new Error("テスト用の記事を作成できませんでした。");

  return article;
}
