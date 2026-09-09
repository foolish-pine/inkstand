import { jst } from "@/lib/dayjs";

export function formatDate(date: Date) {
  return jst(date).format("YYYY年M月D日");
}
