import { describe, expect, it } from "vitest";
import { getMyPurchases, hasPurchasedArticle } from "./my-purchases";
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

describe("getMyPurchases", () => {
  it("自分の purchases のみ取得できる", async () => {
    const { userId: myId } = await createTestUser();
    const { userId: otherId } = await createTestUser();
    const { userId: authorId } = await createTestUser();
    signInAs(myId);
    const article1 = await createTestArticle({ authorId });
    const article2 = await createTestArticle({ authorId });
    const myPurchase = await createTestPurchase({
      buyerId: myId,
      articleId: article1.id,
    });
    await createTestPurchase({
      buyerId: otherId,
      articleId: article2.id,
    });

    expect(await getMyPurchases()).toStrictEqual([
      {
        articleId: article1.id,
        articleTitle: article1.title,
        createdAt: myPurchase.createdAt,
        paymentAmount: myPurchase.paymentAmount,
      },
    ]);
  });
  it("降順で取得する", async () => {
    const { userId: myId } = await createTestUser();
    const { userId: authorId } = await createTestUser();
    signInAs(myId);
    const article1 = await createTestArticle({ authorId });
    const article2 = await createTestArticle({ authorId });
    const olderMyPurchase = await createTestPurchase({
      buyerId: myId,
      articleId: article1.id,
      createdAt: new Date("2026-01-01"),
    });
    const newerMyPurchase = await createTestPurchase({
      buyerId: myId,
      articleId: article2.id,
      createdAt: new Date("2026-01-02"),
    });

    expect(await getMyPurchases()).toStrictEqual([
      {
        articleId: article2.id,
        articleTitle: article2.title,
        createdAt: new Date("2026-01-02"),
        paymentAmount: newerMyPurchase.paymentAmount,
      },
      {
        articleId: article1.id,
        articleTitle: article1.title,
        createdAt: new Date("2026-01-01"),
        paymentAmount: olderMyPurchase.paymentAmount,
      },
    ]);
  });
  it("paymentAmount は purchases 由来である", async () => {
    const { userId: myId } = await createTestUser();
    const { userId: authorId } = await createTestUser();
    signInAs(myId);
    const article = await createTestArticle({ authorId, price: 500 });
    const paidAmount = 1000;
    const myPurchase = await createTestPurchase({
      buyerId: myId,
      articleId: article.id,
      paymentAmount: paidAmount,
    });

    expect(await getMyPurchases()).toStrictEqual([
      {
        articleId: article.id,
        articleTitle: article.title,
        createdAt: myPurchase.createdAt,
        paymentAmount: paidAmount,
      },
    ]);
  });
});
