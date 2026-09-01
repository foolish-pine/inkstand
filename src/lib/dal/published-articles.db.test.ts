import { describe, expect, it } from "vitest";
import {
  getLatestArticles,
  getPublishedArticle,
} from "@/lib/dal/published-articles";
import { createTestArticle, createTestUser } from "@/test/fixtures";

describe("getLatestArticles", () => {
  it("公開状態の記事のみ取得できる", async () => {
    const { userId } = await createTestUser();
    const published = await createTestArticle({ authorId: userId });
    await createTestArticle({ authorId: userId, status: "draft" });
    const result = await getLatestArticles();

    expect(result.map((article) => article.id)).toStrictEqual([published.id]);
  });
  it("公開日の新しい順で取得する", async () => {
    const { userId } = await createTestUser();
    const oldArticle = await createTestArticle({
      authorId: userId,
      publishedAt: new Date("2026-01-01"),
    });
    const newArticle = await createTestArticle({
      authorId: userId,
      publishedAt: new Date("2026-01-02"),
    });
    const result = await getLatestArticles();

    expect(result.map((article) => article.id)).toStrictEqual([
      newArticle.id,
      oldArticle.id,
    ]);
  });
});

describe("getPublishedArticle", () => {
  it("存在する公開記事の id を指定すると、その記事を取得する", async () => {
    const { userId } = await createTestUser();
    const article = await createTestArticle({
      authorId: userId,
      status: "published",
    });
    const result = await getPublishedArticle(article.id);

    expect(result?.id).toBe(article.id);
  });
  it("存在しない id を渡すと undefined が返る", async () => {
    const { userId } = await createTestUser();
    await createTestArticle({ authorId: userId });
    const result = await getPublishedArticle("notExistingId");

    expect(result).toBeUndefined();
  });
  it("下書き状態の記事の id を渡すと undefined が返る", async () => {
    const { userId } = await createTestUser();
    const article = await createTestArticle({
      authorId: userId,
      status: "draft",
    });
    const result = await getPublishedArticle(article.id);

    expect(result).toBeUndefined();
  });
});
