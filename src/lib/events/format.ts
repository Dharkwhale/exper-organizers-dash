import { safeZone } from "@/lib/overview/format";

const MS_PER_DAY = 86_400_000;

type LocalTime = { date: string; time: string; dayNumber: number };

// en-US keeps month abbreviations stable ("Sep", where en-GB says "Sept").
function localTime(iso: string, timeZone: string): LocalTime {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";

  const month = new Date(`${get("month")} 1, 2000`).getMonth();
  return {
    date: `${get("day")} ${get("month")} ${get("year")}`,
    time: `${get("hour")}:${get("minute")}`,
    dayNumber: Date.UTC(Number(get("year")), month, Number(get("day"))) / MS_PER_DAY,
  };
}

/** "31 Oct 2026 · 19:00-23:30", plus " (+1 day)" when it ends on a later local date. */
export function formatEventRange(
  startsAt: string,
  endsAt: string,
  timeZone: string,
): string {
  const zone = safeZone(timeZone);
  const start = localTime(startsAt, zone);
  const end = localTime(endsAt, zone);
  const extra = Math.round(end.dayNumber - start.dayNumber);
  const suffix = extra > 0 ? ` (+${extra} ${extra === 1 ? "day" : "days"})` : "";
  return `${start.date} · ${start.time} - ${end.time}${suffix}`;
}
