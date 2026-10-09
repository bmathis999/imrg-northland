import { site } from "./site";

const TZ = site.timeZone;

type Parts = { year: number; month: number; day: number; hour: number; minute: number };

function partsIn(date: Date, timeZone: string = TZ): Parts {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const get = (type: string) => Number(fmt.formatToParts(date).find((p) => p.type === type)?.value);
  return { year: get("year"), month: get("month"), day: get("day"), hour: get("hour"), minute: get("minute") };
}

/** Minutes the zone is ahead of UTC at a given instant (Central: -300 or -360). */
export function offsetMinutes(date: Date, timeZone: string = TZ): number {
  const p = partsIn(date, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
  return Math.round((asUtc - Math.floor(date.getTime() / 60000) * 60000) / 60000);
}

/** The UTC instant of local midnight on y-m-d in the chapter's time zone. */
export function zonedMidnight(year: number, month: number, day: number, timeZone: string = TZ): Date {
  let guess = Date.UTC(year, month - 1, day);
  // Two passes settle the offset even on daylight-saving change days.
  for (let i = 0; i < 2; i++) {
    guess = Date.UTC(year, month - 1, day) - offsetMinutes(new Date(guess), timeZone) * 60000;
  }
  return new Date(guess);
}

export type YearMonth = { year: number; month: number };

export function monthRange({ year, month }: YearMonth) {
  const next = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
  return { start: zonedMidnight(year, month, 1), end: zonedMidnight(next.year, next.month, 1) };
}

export function shiftMonth({ year, month }: YearMonth, delta: number): YearMonth {
  const index = year * 12 + (month - 1) + delta;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

export function currentMonth(now: Date = new Date()): YearMonth {
  const p = partsIn(now);
  return { year: p.year, month: p.month };
}

/** Accepts "2026-10"; anything else (or a year far out of range) returns null. */
export function parseMonthParam(value: unknown): YearMonth | null {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12 || year < 2000 || year > 2100) return null;
  return { year, month };
}

export function monthParam({ year, month }: YearMonth): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function monthLabel({ year, month }: YearMonth): string {
  return new Date(Date.UTC(year, month - 1, 15)).toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}

/** "YYYY-MM-DD" for the local calendar day an instant falls on. */
export function localDayKey(iso: string | Date): string {
  const p = partsIn(typeof iso === "string" ? new Date(iso) : iso);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

export type GridDay = { key: string; day: number; inMonth: boolean };

/** Weeks (Sunday first) covering the month, padded with neighbouring days. */
export function monthGrid({ year, month }: YearMonth): GridDay[][] {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const lead = first.getUTCDay();
  const total = Math.ceil((lead + daysInMonth) / 7) * 7;
  const weeks: GridDay[][] = [];
  for (let i = 0; i < total; i++) {
    const d = new Date(Date.UTC(year, month - 1, 1 - lead + i));
    const day: GridDay = {
      key: d.toISOString().slice(0, 10),
      day: d.getUTCDate(),
      inMonth: d.getUTCMonth() === month - 1,
    };
    if (i % 7 === 0) weeks.push([]);
    weeks[weeks.length - 1].push(day);
  }
  return weeks;
}

const dateFmt = new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "short", month: "short", day: "numeric" });
const longDateFmt = new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "long", month: "long", day: "numeric", year: "numeric" });
const timeFmt = new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit" });

export const formatDate = (iso: string) => dateFmt.format(new Date(iso));
export const formatLongDate = (iso: string) => longDateFmt.format(new Date(iso));

export function formatTimeRange(startIso: string, endIso: string | null, allDay: boolean): string {
  if (allDay) return "All day";
  const start = timeFmt.format(new Date(startIso));
  if (!endIso) return start;
  const sameDay = localDayKey(startIso) === localDayKey(endIso);
  return sameDay ? `${start} – ${timeFmt.format(new Date(endIso))}` : `${start} – ${formatDate(endIso)}`;
}
