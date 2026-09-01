import { describe, expect, it } from "vitest";
import { getMyArticle, getMyArticles } from "@/lib/dal/my-articles";
import { signInAs } from "@/test/current-user-stub";
import { createTestArticle, createTestUser } from "@/test/fixtures";

describe("getMyArticles", () => {
  it("自分の記事のみ取得できる", async () => {
    const { userId: myId } = await createTestUser();
    const { userId: otherId } = await createTestUser();
    const myArticle = await createTestArticle({ authorId: myId });
    await createTestArticle({ authorId: otherId });
    signInAs(myId);
    const result = await getMyArticles();

    expect(result.map((article) => article.id)).toStrictEqual([myArticle.id]);
  });
  it("作成日の新しい順で取得する", async () => {
    const { userId } = await createTestUser();
    const oldArticle = await createTestArticle({
      authorId: userId,
      createdAt: new Date("2026-01-01"),
    });
    const newArticle = await createTestArticle({
      authorId: userId,
      createdAt: new Date("2026-01-02"),
    });
    signInAs(userId);
    const result = await getMyArticles();

    expect(result.map((article) => article.id)).toStrictEqual([
      newArticle.id,
      oldArticle.id,
    ]);
  });
});

describe("getMyArticle", () => {
  it("存在するidの自分の記事のみ取得できる", async () => {
    const { userId: myId } = await createTestUser();
    const { userId: otherId } = await createTestUser();
    const myArticle = await createTestArticle({ authorId: myId });
    await createTestArticle({ authorId: otherId });
    signInAs(myId);
    const result = await getMyArticle(myArticle.id);

    expect(result?.id).toStrictEqual(myArticle.id);
  });
  it("他人の記事は取得できない", async () => {
    const { userId: myId } = await createTestUser();
    const { userId: otherId } = await createTestUser();
    const otherArticle = await createTestArticle({ authorId: otherId });
    signInAs(myId);
    const result = await getMyArticle(otherArticle.id);

    expect(result).toBeUndefined();
  });
  it("存在しない id を渡すと undefined が返る", async () => {
    const { userId: myId } = await createTestUser();
    await createTestArticle({ authorId: myId });
    signInAs(myId);
    const result = await getMyArticle("notExistingId");

    expect(result).toBeUndefined();
  });
});
