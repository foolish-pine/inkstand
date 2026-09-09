import { describe, expect, it } from "vitest";
import { salesMonthRange } from "./sales-month-range";

describe("salesMonthRange", () => {
  it("入力された日付を JST に変換し、1 年前の翌月から基準月までの年月のラベルを YYYY-MM 形式で返す", () => {
    expect(salesMonthRange(new Date("2026-05-31T16:00Z"))).toStrictEqual([
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
    ]);
  });
});
