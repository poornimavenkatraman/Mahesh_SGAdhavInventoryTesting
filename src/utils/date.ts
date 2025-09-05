/**
 * Formats a Firestore Timestamp or ISO date string into a readable string.
 * @param {object|string} dateInput - Firestore Timestamp object or ISO date string.
 * @returns {string} Formatted date string (e.g., '28 Aug 2025, 2:15:30 PM')
 */
export function formatReadableDate(dateInput: { seconds: number } | string) {
  let dateObj;
  if (typeof dateInput === "object" && dateInput && dateInput.seconds) {
    dateObj = new Date(dateInput.seconds * 1000);
  } else if (typeof dateInput === "string" && dateInput) {
    dateObj = new Date(dateInput);
  }
  if (dateObj && !isNaN(dateObj.getTime())) {
    const day = dateObj.getDate();
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = monthNames[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    let hours = dateObj.getHours();
    const minutes = dateObj.getMinutes().toString().padStart(2, "0");
    const seconds = dateObj.getSeconds().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${day} ${month} ${year}, ${hours}:${minutes}:${seconds} ${ampm}`;
  }
  return dateInput || "";
}
// src/utils/date.ts
/**
 * Format a date string as "DD MMM YYYY" (e.g., "23 Aug 2025")
 */
export function formatDate(dateStr: string | Date): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);
  const day = d.getDate();
  const month = d.toLocaleString("en-GB", { month: "short" });
  const year = d.getFullYear();
  // Ordinal suffix logic
  const getOrdinal = (n: number) => {
    if (n > 3 && n < 21) return "th";
    switch (n % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };
  return `${day}${getOrdinal(day)} ${month} ${year}`;
}
