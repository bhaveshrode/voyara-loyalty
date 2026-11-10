import type { ChainActivity } from "@/lib/types";

export function isIncoming(type: ChainActivity["type"]) {
  return type === "earn" || type === "transfer-in";
}

export function signedPoints(event: ChainActivity) {
  return `${isIncoming(event.type) ? "+" : "−"}${new Intl.NumberFormat("en-US").format(event.points)}`;
}

export function weeklyEarnings(activity: ChainActivity[], weeks = 8) {
  const now = new Date();
  const currentWeekStart = startOfWeek(now);
  const buckets = Array.from({ length: weeks }, (_, index) => {
    const start = new Date(currentWeekStart);
    start.setUTCDate(start.getUTCDate() - (weeks - 1 - index) * 7);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 7);
    return {
      label: new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        timeZone: "UTC",
      }).format(start),
      start: start.getTime(),
      end: end.getTime(),
      value: 0,
      current: index === weeks - 1,
    };
  });

  for (const event of activity) {
    if (event.type !== "earn") continue;
    const bucket = buckets.find((entry) => event.timestamp >= entry.start && event.timestamp < entry.end);
    if (bucket) bucket.value += event.points;
  }

  return buckets.map(({ label, value, current }) => ({ label, value, current }));
}

function startOfWeek(date: Date) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const offset = (start.getUTCDay() + 6) % 7;
  start.setUTCDate(start.getUTCDate() - offset);
  return start;
}

export function pointsThisWeek(activity: ChainActivity[]) {
  const start = startOfWeek(new Date()).getTime();
  return activity
    .filter((event) => event.type === "earn" && event.timestamp >= start)
    .reduce((sum, event) => sum + event.points, 0);
}
