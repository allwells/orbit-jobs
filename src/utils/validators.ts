import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export const isToday = (dateStr: string) => {
  // Parse as UTC explicitly, then convert to local for "today" check
  return dayjs.utc(dateStr).local().isSame(dayjs(), "day");
};
