import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { isToday } from "./validators";

dayjs.extend(advancedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

export const formatDate = (dateStr: string) => {
  // Ensure we parse as UTC if the string is ambiguous, or handle ISO string correctly
  // .local() coverts it to the user's browser timezone
  const date = dayjs.utc(dateStr).local();

  if (isToday(dateStr)) {
    return `Today @ ${date.format("h:mm A")}`;
  }

  return date.format("Do MMM, YYYY @ h:mm A");
};
