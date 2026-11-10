// Intl gives "GMT+1" for Lagos; the product says "WAT".
const ZONE_LABELS: Record<string, string> = {
  "Africa/Lagos": "WAT",
  "Africa/Accra": "GMT",
  "Africa/Nairobi": "EAT",
};

// A zone string Intl rejects must not crash the page.
export function safeZone(timeZone: string): string {
  try {
    new Intl.DateTimeFormat("en-GB", { timeZone });
    return timeZone;
  } catch {
    return "UTC";
  }
}

export function zoneLabel(timeZone: string, at: Date): string {
  const known = ZONE_LABELS[timeZone];
  if (known) return known;
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: safeZone(timeZone),
    timeZoneName: "short",
  }).formatToParts(at);
  return parts.find((part) => part.type === "timeZoneName")?.value ?? "UTC";
}

/** "UTC+01:00" for the hero badge; a zero offset (or unknown zone) is "UTC+00:00". */
export function utcOffset(timeZone: string, at: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: safeZone(timeZone),
    timeZoneName: "longOffset",
  }).formatToParts(at);
  const value = parts.find((part) => part.type === "timeZoneName")?.value ?? "GMT";
  return value === "GMT" ? "UTC+00:00" : value.replace("GMT", "UTC");
}

// en-US keeps month abbreviations stable ("Sep", where en-GB says "Sept").
function dayAndTime(iso: string, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: safeZone(timeZone),
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    date: `${get("day")} ${get("month")}`,
    time: `${get("hour")}:${get("minute")}`,
  };
}

export function formatEventWindow(
  startsAt: string,
  endsAt: string,
  timeZone: string,
): string {
  const start = dayAndTime(startsAt, timeZone);
  const end = dayAndTime(endsAt, timeZone);
  const label = zoneLabel(timeZone, new Date(startsAt));
  return `${start.date}, ${start.time} → ${end.date}, ${end.time} ${label}`;
}

export function formatEventLine(
  event: {
    startsAt: string;
    venue: { name: string | null; city: string | null };
  },
  timeZone: string,
): string {
  const { date, time } = dayAndTime(event.startsAt, timeZone);
  const label = zoneLabel(timeZone, new Date(event.startsAt));
  return [date, `${time} ${label}`, event.venue.name, event.venue.city]
    .filter(Boolean)
    .join(" · ");
}

export function formatLongDate(now: Date): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("weekday")}, ${get("day")} ${get("month")} ${get("year")}`;
}
