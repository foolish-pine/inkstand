import { describe, expect, it } from "vitest";
import { canPurchase } from "./can-purchase";

describe("canPurchase", () => {
  const validInput = {
    userId: "user-1",
    authorId: "user-2",
    price: 1000,
    hasPurchased: false,
  };

  it("記事が有料かつ自身がその記事の著者でないかつその記事を未購入のとき、true を返す", () => {
    expect(canPurchase(validInput)).toBe(true);
  });
  it("未ログイン（userId が null）で記事が有料のとき、true を返す", () => {
    expect(canPurchase({ ...validInput, userId: null })).toBe(true);
  });
  it.each([
    [
      "記事が無料",
      {
        ...validInput,
        price: 0,
      },
    ],
    [
      "自身がその記事の著者",
      {
        ...validInput,
        authorId: "user-1",
      },
    ],
    [
      "その記事を購入済み",
      {
        ...validInput,
        hasPurchased: true,
      },
    ],
  ])("%sのとき、false を返す", (_reason, input) => {
    expect(canPurchase(input)).toBe(false);
  });
});
