import { describe, expect, it } from "vitest";
import {
  type ArticleValues,
  createMyArticle,
  deleteMyArticle,
  getMyArticle,
  getMyArticles,
  updateMyArticle,
} from "@/lib/dal/my-articles";
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
  it("存在する id の自分の記事のみ取得できる", async () => {
    const { userId: myId } = await createTestUser();
    const { userId: otherId } = await createTestUser();
    const myArticle = await createTestArticle({ authorId: myId });
    await createTestArticle({ authorId: otherId });
    signInAs(myId);
    const result = await getMyArticle(myArticle.id);

    expect(result?.id).toBe(myArticle.id);
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

describe("createMyArticle", () => {
  const values: ArticleValues = {
    title: "タイトル",
    body: "あ".repeat(10000),
    status: "draft",
    price: 500,
  };

  it("自分の記事を作成できる", async () => {
    const { userId } = await createTestUser();
    signInAs(userId);
    const result = await createMyArticle(values);

    expect(result?.authorId).toBe(userId);
  });
  it("下書きの記事は publishedAt が null になる", async () => {
    const { userId } = await createTestUser();
    signInAs(userId);
    const result = await createMyArticle(values);

    expect(result?.publishedAt).toBeNull();
  });
  it("公開記事は publishedAt に公開日が設定される", async () => {
    const { userId } = await createTestUser();
    signInAs(userId);
    const result = await createMyArticle({
      ...values,
      status: "published",
    });

    expect(result?.publishedAt).not.toBeNull();
  });
});

describe("updateMyArticle", () => {
  const initialValues: ArticleValues = {
    title: "タイトル",
    body: "あ".repeat(10000),
    status: "draft",
    price: 500,
  };
  const updatedValues: ArticleValues = {
    title: "更新後のタイトル",
    body: "あ".repeat(20000),
    status: "published",
    price: 1000,
  };

  it("存在する id の自分の記事を更新できる", async () => {
    const { userId } = await createTestUser();
    const article = await createTestArticle({
      authorId: userId,
      ...initialValues,
    });
    signInAs(userId);
    const result = await updateMyArticle(article.id, updatedValues);

    expect(result?.id).toBe(article.id);
    expect(result).toMatchObject(updatedValues);
  });
  it("下書きのままの記事の更新では publishedAt を更新しない", async () => {
    const { userId } = await createTestUser();
    const article = await createTestArticle({
      authorId: userId,
      ...initialValues,
      publishedAt: null,
    });
    signInAs(userId);
    const result = await updateMyArticle(article.id, {
      ...updatedValues,
      status: "draft",
    });

    expect(result?.status).toBe("draft");
    expect(result?.publishedAt).toBeNull();
  });
  it("status を更新して公開した記事は publishedAt に公開日が設定される", async () => {
    const { userId } = await createTestUser();
    const article = await createTestArticle({
      authorId: userId,
      ...initialValues,
      publishedAt: null,
    });
    signInAs(userId);
    const result = await updateMyArticle(article.id, {
      ...initialValues,
      status: "published",
    });

    expect(result?.status).toBe("published");
    expect(result?.publishedAt).not.toBeNull();
  });
  it("公開済みの記事を下書きに戻すと、publishedAt が残る", async () => {
    const { userId } = await createTestUser();
    const article = await createTestArticle({
      authorId: userId,
      ...initialValues,
      status: "published",
    });
    signInAs(userId);
    const result = await updateMyArticle(article.id, {
      ...initialValues,
      status: "draft",
    });

    expect(result?.status).toBe("draft");
    expect(result?.publishedAt).not.toBeNull();
  });
  it("他人の記事は更新できない", async () => {
    const { userId: myId } = await createTestUser();
    const { userId: otherId } = await createTestUser();
    const article = await createTestArticle({ authorId: otherId });
    signInAs(myId);
    const result = await updateMyArticle(article.id, updatedValues);

    expect(result).toBeUndefined();
  });
  it("存在しない id を渡すと undefined が返る", async () => {
    const { userId } = await createTestUser();
    await createTestArticle({ authorId: userId });
    signInAs(userId);
    const result = await updateMyArticle("notExistingId", updatedValues);

    expect(result).toBeUndefined();
  });
});

describe("deleteMyArticle", () => {
  it("存在する id の自分の記事を削除できる", async () => {
    const { userId } = await createTestUser();
    const article = await createTestArticle({ authorId: userId });
    signInAs(userId);
    const result = await deleteMyArticle(article.id);
    const deletedArticle = await getMyArticle(article.id);

    expect(result?.id).toBe(article.id);
    expect(deletedArticle).toBeUndefined();
  });
  it("他人の記事は削除できない", async () => {
    const { userId: myId } = await createTestUser();
    const { userId: otherId } = await createTestUser();
    const article = await createTestArticle({ authorId: otherId });
    signInAs(myId);
    const result = await deleteMyArticle(article.id);

    expect(result).toBeUndefined();
  });
  it("存在しない id を渡すと undefined が返る", async () => {
    const { userId } = await createTestUser();
    await createTestArticle({ authorId: userId });
    signInAs(userId);
    const result = await deleteMyArticle("notExistingId");

    expect(result).toBeUndefined();
  });
});
