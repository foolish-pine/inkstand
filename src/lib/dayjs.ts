import dayjs, { type ConfigType } from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Tokyo");

// 常に JST の Dayjs を返す。.tz() の付け忘れを構造的に防ぐ。
export const jst = (input?: ConfigType) => dayjs(input).tz();
