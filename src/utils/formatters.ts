import { isToday } from "./validators";

function getOrdinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export const formatDate = (dateStr: string) => {
  // Create date object (uses local system timezone)
  const date = new Date(dateStr);

  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "long" });
  const year = date.getFullYear();

  // Format time (e.g., 5:30 PM)
  const time = date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (isToday(dateStr)) {
    return `Today @ ${time}`;
  }

  return `${getOrdinal(day)} ${month}, ${year} @ ${time}`;
};
