import { describe, expect, it } from "vitest";
import { hasPurchasedArticle } from "./my-purchases";
import { signInAs, signOut } from "@/test/current-user-stub";
import {
  createTestArticle,
  createTestPurchase,
  createTestUser,
} from "@/test/fixtures";

describe("hasPurchasedArticle", () => {
  it("未ログインなら false を返す", async () => {
    const { userId: authorId } = await createTestUser();
    const article = await createTestArticle({ authorId });
    signOut();
    const result = await hasPurchasedArticle(article.id);

    expect(result).toBe(false);
  });
  it("購入済みなら true を返す", async () => {
    const { userId: myId } = await createTestUser();
    const { userId: authorId } = await createTestUser();
    const article = await createTestArticle({ authorId });
    signInAs(myId);
    await createTestPurchase({ articleId: article.id, buyerId: myId });
    const result = await hasPurchasedArticle(article.id);

    expect(result).toBe(true);
  });
  it("未購入なら false を返す", async () => {
    const { userId: myId } = await createTestUser();
    const { userId: authorId } = await createTestUser();
    const article = await createTestArticle({ authorId });
    signInAs(myId);
    const result = await hasPurchasedArticle(article.id);

    expect(result).toBe(false);
  });
  it("別の記事を購入していても対象の記事が未購入なら false を返す", async () => {
    const { userId: myId } = await createTestUser();
    const { userId: authorId } = await createTestUser();
    const purchasedArticle = await createTestArticle({ authorId });
    const article = await createTestArticle({ authorId });
    signInAs(myId);
    await createTestPurchase({ articleId: purchasedArticle.id, buyerId: myId });
    const result = await hasPurchasedArticle(article.id);

    expect(result).toBe(false);
  });
  it("別のユーザーが対象の記事を購入済みでも自身が未購入なら false を返す", async () => {
    const { userId: myId } = await createTestUser();
    const { userId: authorId } = await createTestUser();
    const { userId: otherId } = await createTestUser();
    const article = await createTestArticle({ authorId });
    signInAs(myId);
    await createTestPurchase({ articleId: article.id, buyerId: otherId });
    const result = await hasPurchasedArticle(article.id);

    expect(result).toBe(false);
  });
});
