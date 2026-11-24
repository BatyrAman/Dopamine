/**
 * Calendar-date helpers.
 *
 * A delivery date is a *calendar day*, not an instant, so it is stored as an ISO
 * "YYYY-MM-DD" string (the same format `<input type="date">` produces).
 * Day differences are computed on UTC day numbers built from the y/m/d parts,
 * which has no DST and no local-timezone drift.
 */

/** The shop is in Almaty — "today" means today in Almaty, whatever the visitor's device timezone is. */
export const BUSINESS_TIME_ZONE = "Asia/Almaty";

/** ISO calendar date, "YYYY-MM-DD". */
export type CalendarDate = string;

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 86_400_000;

/** Parses "YYYY-MM-DD" into parts; returns null for malformed or impossible dates (e.g. 2026-02-30). */
export function parseCalendarDate(value: string): { year: number; month: number; day: number } | null {
  const m = ISO_DATE.exec(value);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (probe.getUTCFullYear() !== year || probe.getUTCMonth() !== month - 1 || probe.getUTCDate() !== day) return null;
  return { year, month, day };
}

export function isValidCalendarDate(value: string): value is CalendarDate {
  return parseCalendarDate(value) !== null;
}

/** Whole days since 1970-01-01 for a calendar date (timezone-free). */
function dayNumber(value: CalendarDate): number {
  const p = parseCalendarDate(value);
  if (!p) throw new RangeError(`Invalid calendar date: ${value}`);
  return Date.UTC(p.year, p.month - 1, p.day) / MS_PER_DAY;
}

/** Calendar days from `from` to `to` (negative if `to` is earlier). */
export function daysBetween(from: CalendarDate, to: CalendarDate): number {
  return dayNumber(to) - dayNumber(from);
}

export function addDays(value: CalendarDate, days: number): CalendarDate {
  const d = new Date((dayNumber(value) + days) * MS_PER_DAY);
  return d.toISOString().slice(0, 10);
}

/** The calendar date of `instant` in `timeZone` (default: Almaty). */
export function toCalendarDate(instant: Date, timeZone: string = BUSINESS_TIME_ZONE): CalendarDate {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(instant);
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function todayCalendarDate(now: Date = new Date()): CalendarDate {
  return toCalendarDate(now, BUSINESS_TIME_ZONE);
}

const KK_MONTHS = ["қаңтар", "ақпан", "наурыз", "сәуір", "мамыр", "маусым", "шілде", "тамыз", "қыркүйек", "қазан", "қараша", "желтоқсан"];

/** "2026-12-20" → "20 желтоқсан 2026" */
export function formatKazakhDate(value: CalendarDate): string {
  const p = parseCalendarDate(value);
  if (!p) return value;
  return `${p.day} ${KK_MONTHS[p.month - 1]} ${p.year}`;
}
