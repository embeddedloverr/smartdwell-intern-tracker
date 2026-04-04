import { format, toZonedTime } from "date-fns-tz";

const IST = "Asia/Kolkata";

export function formatIST(date: Date | string, fmt: string = "dd MMM yyyy") {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(toZonedTime(d, IST), fmt, { timeZone: IST });
}

export function nowIST() {
  return toZonedTime(new Date(), IST);
}

export function getGreeting(): string {
  const hour = nowIST().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export const STATUS_COLORS: Record<string, string> = {
  pending: "bg-gray-500",
  in_progress: "bg-amber-700",
  done: "bg-green-800",
  needs_retry: "bg-red-700",
};

export const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  done: "Done",
  needs_retry: "Needs Retry",
};
