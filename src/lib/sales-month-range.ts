import { jst } from "@/lib/dayjs";

export function salesMonthRange(baseDate: Date): string[] {
  return Array.from({ length: 12 }, (_, i) =>
    jst(baseDate)
      .add(-11 + i, "month")
      .format("YYYY-MM"),
  );
}
