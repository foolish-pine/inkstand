import { describe, expect, it } from "vitest";
import { formatDate } from "./format-date";

describe("formatDate", () => {
  it.each([
    [new Date("2026-06-01T01:00+09:00"), "2026年6月1日"],
    [new Date("2026-05-31T16:00Z"), "2026年6月1日"],
  ])("%j を JST に変換し、YYYY年M月D日の文字列を返す", (input, expected) => {
    expect(formatDate(input)).toBe(expected);
  });
});
