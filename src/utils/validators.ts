import dayjs from "dayjs";

export const isToday = (dateStr: string) => {
  return dayjs(dateStr).isSame(dayjs(), "day");
};
