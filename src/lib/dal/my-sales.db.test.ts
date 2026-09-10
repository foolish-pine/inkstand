import { describe, expect, it } from "vitest";
import { getMySales, getMySalesByMonth } from "./my-sales";
import { signInAs } from "@/test/current-user-stub";
import {
  createTestArticle,
  createTestPurchase,
  createTestUser,
} from "@/test/fixtures";

describe("getMySales", () => {
  it("自分の記事の売上数と売上高の集計を記事ごとに取得する", async () => {
    const { userId: myId } = await createTestUser();
    const { userId: buyer1Id } = await createTestUser();
    const { userId: buyer2Id } = await createTestUser();
    signInAs(myId);
    const article1 = await createTestArticle({
      authorId: myId,
      publishedAt: new Date("2026-01-01"),
    });
    const article2 = await createTestArticle({
      authorId: myId,
      publishedAt: new Date("2026-01-02"),
    });
    await createTestPurchase({
      buyerId: buyer1Id,
      articleId: article1.id,
      paymentAmount: 100,
    });
    await createTestPurchase({
      buyerId: buyer1Id,
      articleId: article2.id,
      paymentAmount: 1000,
    });
    await createTestPurchase({
      buyerId: buyer2Id,
      articleId: article2.id,
      paymentAmount: 1000,
    });

    expect(await getMySales()).toStrictEqual([
      {
        articleId: article2.id,
        articleTitle: article2.title,
        salesCount: 2,
        salesAmount: 2000,
      },
      {
        articleId: article1.id,
        articleTitle: article1.title,
        salesCount: 1,
        salesAmount: 100,
      },
    ]);
  });
  it("1回も売れてない記事の売上数と売上高の集計は0になる", async () => {
    const { userId: myId } = await createTestUser();
    const { userId: buyer1Id } = await createTestUser();
    const { userId: buyer2Id } = await createTestUser();
    signInAs(myId);
    const soldArticle = await createTestArticle({
      authorId: myId,
      publishedAt: new Date("2026-01-01"),
    });
    const unsoldArticle = await createTestArticle({
      authorId: myId,
      publishedAt: new Date("2026-01-02"),
    });
    await createTestPurchase({
      buyerId: buyer1Id,
      articleId: soldArticle.id,
      paymentAmount: 100,
    });
    await createTestPurchase({
      buyerId: buyer2Id,
      articleId: soldArticle.id,
      paymentAmount: 1000,
    });

    expect(await getMySales()).toStrictEqual([
      {
        articleId: unsoldArticle.id,
        articleTitle: unsoldArticle.title,
        salesCount: 0,
        salesAmount: 0,
      },
      {
        articleId: soldArticle.id,
        articleTitle: soldArticle.title,
        salesCount: 2,
        salesAmount: 1100,
      },
    ]);
  });
  it("他人の記事の売上数と売上高は集計に含まれない", async () => {
    const { userId: myId } = await createTestUser();
    const { userId: otherId } = await createTestUser();
    const { userId: buyer1Id } = await createTestUser();
    signInAs(myId);
    const myArticle = await createTestArticle({
      authorId: myId,
    });
    const otherArticle = await createTestArticle({
      authorId: otherId,
    });
    await createTestPurchase({
      buyerId: buyer1Id,
      articleId: myArticle.id,
      paymentAmount: 100,
    });
    await createTestPurchase({
      buyerId: buyer1Id,
      articleId: otherArticle.id,
      paymentAmount: 1000,
    });

    expect(await getMySales()).toStrictEqual([
      {
        articleId: myArticle.id,
        articleTitle: myArticle.title,
        salesCount: 1,
        salesAmount: 100,
      },
    ]);
  });
  it("publishedAt が null の記事の売上数と売上高は集計に含まれない", async () => {
    const { userId: myId } = await createTestUser();
    const { userId: buyer1Id } = await createTestUser();
    signInAs(myId);
    const article = await createTestArticle({
      authorId: myId,
      publishedAt: new Date("2026-01-01"),
    });
    await createTestArticle({
      authorId: myId,
      status: "draft",
      publishedAt: null,
    });
    await createTestPurchase({
      buyerId: buyer1Id,
      articleId: article.id,
      paymentAmount: 100,
    });

    expect(await getMySales()).toStrictEqual([
      {
        articleId: article.id,
        articleTitle: article.title,
        salesCount: 1,
        salesAmount: 100,
      },
    ]);
  });
  it("status が draft であっても、publishedAt が null でなければ記事の売上数と売上高は集計に含まれる", async () => {
    const { userId: myId } = await createTestUser();
    const { userId: buyer1Id } = await createTestUser();
    signInAs(myId);
    const article = await createTestArticle({
      authorId: myId,
      status: "draft",
      publishedAt: new Date("2026-01-01"),
    });
    await createTestPurchase({
      buyerId: buyer1Id,
      articleId: article.id,
      paymentAmount: 100,
    });

    expect(await getMySales()).toStrictEqual([
      {
        articleId: article.id,
        articleTitle: article.title,
        salesCount: 1,
        salesAmount: 100,
      },
    ]);
  });
});

describe("getMySalesByMonth", () => {
  it("与えられた range の自分の記事の売上数と売上高の集計を月ごとに取得する", async () => {
    const { userId: myId } = await createTestUser();
    const { userId: buyer1Id } = await createTestUser();
    const { userId: buyer2Id } = await createTestUser();
    signInAs(myId);
    const article1 = await createTestArticle({
      authorId: myId,
      publishedAt: new Date("2025-01-01"),
    });
    const article2 = await createTestArticle({
      authorId: myId,
      publishedAt: new Date("2025-01-01"),
    });
    await createTestPurchase({
      buyerId: buyer1Id,
      articleId: article1.id,
      paymentAmount: 100,
      createdAt: new Date("2025-12-15"),
    });
    await createTestPurchase({
      buyerId: buyer1Id,
      articleId: article2.id,
      paymentAmount: 1000,
      createdAt: new Date("2026-03-15"),
    });
    await createTestPurchase({
      buyerId: buyer2Id,
      articleId: article2.id,
      paymentAmount: 1000,
      createdAt: new Date("2026-03-16"),
    });

    expect(
      await getMySalesByMonth([
        "2025-07",
        "2025-08",
        "2025-09",
        "2025-10",
        "2025-11",
        "2025-12",
        "2026-01",
        "2026-02",
        "2026-03",
        "2026-04",
        "2026-05",
        "2026-06",
      ]),
    ).toStrictEqual([
      {
        month: "2025-12",
        salesCount: 1,
        salesAmount: 100,
      },
      {
        month: "2026-03",
        salesCount: 2,
        salesAmount: 2000,
      },
    ]);
  });
  it("集計期間より前に発生した売上は集計に含まれない", async () => {
    const { userId: myId } = await createTestUser();
    const { userId: buyerId } = await createTestUser();
    signInAs(myId);
    const article1 = await createTestArticle({
      authorId: myId,
      publishedAt: new Date("2025-01-01"),
    });
    const article2 = await createTestArticle({
      authorId: myId,
      publishedAt: new Date("2025-01-01"),
    });
    await createTestPurchase({
      buyerId,
      articleId: article1.id,
      paymentAmount: 100,
      createdAt: new Date("2026-02-28T23:59+09:00"),
    });
    await createTestPurchase({
      buyerId,
      articleId: article2.id,
      paymentAmount: 1000,
      createdAt: new Date("2026-03-01T00:00+09:00"),
    });

    expect(await getMySalesByMonth(["2026-03"])).toStrictEqual([
      {
        month: "2026-03",
        salesCount: 1,
        salesAmount: 1000,
      },
    ]);
  });
  it("集計期間よりあとに発生した売上は集計に含まれない", async () => {
    const { userId: myId } = await createTestUser();
    const { userId: buyerId } = await createTestUser();
    signInAs(myId);
    const article1 = await createTestArticle({
      authorId: myId,
      publishedAt: new Date("2025-01-01"),
    });
    const article2 = await createTestArticle({
      authorId: myId,
      publishedAt: new Date("2025-01-01"),
    });
    await createTestPurchase({
      buyerId,
      articleId: article2.id,
      paymentAmount: 1000,
      createdAt: new Date("2026-03-31T23:59+09:00"),
    });
    await createTestPurchase({
      buyerId,
      articleId: article1.id,
      paymentAmount: 100,
      createdAt: new Date("2026-04-01T00:00+09:00"),
    });

    expect(await getMySalesByMonth(["2026-03"])).toStrictEqual([
      {
        month: "2026-03",
        salesCount: 1,
        salesAmount: 1000,
      },
    ]);
  });
  it("他人の記事の売上数と売上高は集計に含まれない", async () => {
    const { userId: myId } = await createTestUser();
    const { userId: otherId } = await createTestUser();
    const { userId: buyerId } = await createTestUser();
    signInAs(myId);
    const myArticle = await createTestArticle({
      authorId: myId,
      publishedAt: new Date("2025-01-01"),
    });
    const otherArticle = await createTestArticle({
      authorId: otherId,
      publishedAt: new Date("2025-01-01"),
    });
    await createTestPurchase({
      buyerId,
      articleId: myArticle.id,
      paymentAmount: 100,
      createdAt: new Date("2026-03-15"),
    });
    await createTestPurchase({
      buyerId,
      articleId: otherArticle.id,
      paymentAmount: 1000,
      createdAt: new Date("2026-03-15"),
    });

    expect(await getMySalesByMonth(["2026-03"])).toStrictEqual([
      {
        month: "2026-03",
        salesCount: 1,
        salesAmount: 100,
      },
    ]);
  });
});
