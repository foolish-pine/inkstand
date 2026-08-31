import { describe, expect, it } from "vitest";
import { createTestArticle, createTestUser } from "./fixtures";
import { getLatestArticles } from "@/lib/dal/published-articles";

// 基盤が動いていることだけを確かめる足場。
// 本物のテストが揃ったら消してよい。
describe("テスト用 DB の足場", () => {
  it("テスト間でデータが残らない", async () => {
    const { userId } = await createTestUser();
    await createTestArticle({ authorId: userId });

    expect(await getLatestArticles()).toHaveLength(1);
  });

  it("前のテストのデータが見えない", async () => {
    expect(await getLatestArticles()).toHaveLength(0);
  });
});
