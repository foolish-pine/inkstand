import { describe, expect, it } from "vitest";
import { fillMissingMonths } from "./fill-missing-months";

const range = [
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
];

describe("fillMissingMonths", () => {
  it("売上のある月は salesCount と salesAmount が設定され、ない月は 0になる", () => {
    const result = fillMissingMonths({
      range,
      salesByMonth: [
        {
          month: "2025-08",
          salesCount: 2,
          salesAmount: 1000,
        },
        {
          month: "2026-01",
          salesCount: 3,
          salesAmount: 3000,
        },
      ],
    });

    expect(result).toStrictEqual([
      {
        month: "2025-07",
        salesCount: 0,
        salesAmount: 0,
      },
      {
        month: "2025-08",
        salesCount: 2,
        salesAmount: 1000,
      },
      {
        month: "2025-09",
        salesCount: 0,
        salesAmount: 0,
      },
      {
        month: "2025-10",
        salesCount: 0,
        salesAmount: 0,
      },
      {
        month: "2025-11",
        salesCount: 0,
        salesAmount: 0,
      },
      {
        month: "2025-12",
        salesCount: 0,
        salesAmount: 0,
      },
      {
        month: "2026-01",
        salesCount: 3,
        salesAmount: 3000,
      },
      {
        month: "2026-02",
        salesCount: 0,
        salesAmount: 0,
      },
      {
        month: "2026-03",
        salesCount: 0,
        salesAmount: 0,
      },
      {
        month: "2026-04",
        salesCount: 0,
        salesAmount: 0,
      },
      {
        month: "2026-05",
        salesCount: 0,
        salesAmount: 0,
      },
      {
        month: "2026-06",
        salesCount: 0,
        salesAmount: 0,
      },
    ]);
  });
  it("salesByMonth が空配列のとき、すべての月の salesCount と salesAmount はそれぞれ 0 になる", () => {
    const result = fillMissingMonths({
      range,
      salesByMonth: [],
    });

    expect(result.length).toBe(12);
    expect(
      result.filter((r) => r.salesCount !== 0 || r.salesAmount !== 0),
    ).toStrictEqual([]);
  });
  it("与えた range に含まれない売上は返却値に含まれない", () => {
    const result = fillMissingMonths({
      range,
      salesByMonth: [
        {
          month: "2025-06",
          salesCount: 1,
          salesAmount: 1000,
        },
        {
          month: "2025-07",
          salesCount: 2,
          salesAmount: 2000,
        },
        {
          month: "2026-06",
          salesCount: 3,
          salesAmount: 3000,
        },
        {
          month: "2026-07",
          salesCount: 4,
          salesAmount: 4000,
        },
      ],
    });

    expect(result.map((r) => r.month)).toStrictEqual(range);
  });
});
