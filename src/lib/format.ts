import type { Preferences } from "@/lib/profile/schema";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parts(date: Date, timeZone?: string) {
  const f = new Intl.DateTimeFormat("en-GB", {
    timeZone, year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", hourCycle: "h23",
  });
  const o: Record<string, string> = {};
  f.formatToParts(date).forEach((p) => { o[p.type] = p.value; });
  return { y: +o.year, m: +o.month, d: +o.day, h: +o.hour, min: +o.minute };
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Formats with the user's chosen date/time style and time zone (defaults to UTC for stable server output). */
export function formatDate(iso: string | null | undefined, prefs: Preferences, timeZone = "UTC"): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(+date)) return "—";
  const { y, m, d } = parts(date, timeZone);
  switch (prefs.date_format) {
    case "iso": return `${y}-${pad(m)}-${pad(d)}`;
    case "mdy": return `${MONTHS[m - 1]} ${d}, ${y}`;
    default: return `${d} ${MONTHS[m - 1]} ${y}`;
  }
}

export function formatTime(iso: string | null | undefined, prefs: Preferences, timeZone = "UTC"): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(+date)) return "—";
  const { h, min } = parts(date, timeZone);
  if (prefs.time_format === "12h") return `${h % 12 === 0 ? 12 : h % 12}:${pad(min)} ${h < 12 ? "AM" : "PM"}`;
  return `${pad(h)}:${pad(min)}`;
}

export function formatDateTime(iso: string | null | undefined, prefs: Preferences, timeZone = "UTC"): string {
  if (!iso) return "—";
  return `${formatDate(iso, prefs, timeZone)}, ${formatTime(iso, prefs, timeZone)}`;
}
