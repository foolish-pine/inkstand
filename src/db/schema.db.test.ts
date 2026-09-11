import { DrizzleQueryError } from "drizzle-orm";
import postgres from "postgres";
import { assert, describe, expect, it } from "vitest";
import { createTestArticle, createTestUser } from "@/test/fixtures";

describe("articles", () => {
  it("coverImagePath は null を許容する", async () => {
    const { userId } = await createTestUser();
    const article = await createTestArticle({ authorId: userId });

    expect(article.coverImagePath).toBeNull();
  });
  it("coverImagePath は {userId}/ から始まる", async () => {
    const { userId } = await createTestUser();
    const article = await createTestArticle({
      authorId: userId,
      coverImagePath: `${userId}/covers/xxx.jpg`,
    });

    expect(article.coverImagePath).toBe(`${userId}/covers/xxx.jpg`);
  });
  it("coverImagePath は {userId}xxx/ の形を許容しない", async () => {
    const { userId } = await createTestUser();
    const error = await createTestArticle({
      authorId: userId,
      coverImagePath: `${userId}xxx/covers/xxx.jpg`,
    }).catch((e: unknown) => e);

    assert(error instanceof DrizzleQueryError);
    assert(error.cause instanceof postgres.PostgresError);

    expect(error.cause.code).toBe("23514");
    expect(error.cause.constraint_name).toBe("cover_image_in_author_folder");
  });
  it("coverImagePath は 他人のユーザーIDから始まらない", async () => {
    const { userId: myId } = await createTestUser();
    const { userId: otherId } = await createTestUser();
    const error = await createTestArticle({
      authorId: myId,
      coverImagePath: `${otherId}/covers/xxx.jpg`,
    }).catch((e: unknown) => e);

    assert(error instanceof DrizzleQueryError);
    assert(error.cause instanceof postgres.PostgresError);

    expect(error.cause.code).toBe("23514");
    expect(error.cause.constraint_name).toBe("cover_image_in_author_folder");
  });
});
