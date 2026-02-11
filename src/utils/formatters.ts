import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { isToday } from "./validators";

dayjs.extend(advancedFormat);

export const formatDate = (dateStr: string) => {
  if (isToday(dateStr)) {
    return `Today @ ${dayjs(dateStr).format("h:mm A")}`;
  }

  return dayjs(dateStr).format("Do MMMM, YYYY @ h:mm A");
};
