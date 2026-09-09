import { describe, expect, it } from "vitest";
import { sumSales } from "./sum-sales";

describe("sumSales", () => {
  it("salesCount と salesAmount をそれぞれ合計して返す", () => {
    const result = sumSales([
      {
        salesCount: 0,
        salesAmount: 0,
      },
      {
        salesCount: 1,
        salesAmount: 100,
      },
      {
        salesCount: 2,
        salesAmount: 1000,
      },
    ]);

    expect(result).toStrictEqual({
      totalSalesCount: 3,
      totalSalesAmount: 1100,
    });
  });
  it("入力が空配列のとき、totalSalesCount と totalSalesAmount はそれぞれ 0 になる", () => {
    const result = sumSales([]);

    expect(result).toStrictEqual({
      totalSalesCount: 0,
      totalSalesAmount: 0,
    });
  });
});
