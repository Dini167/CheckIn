import { env } from '../config/env';
import { rules } from '../config/rules';
import { now } from './clock';

/**
 * Date helpers. A "date key" is a calendar day in the company time zone, written 'YYYY-MM-DD'.
 * A "month key" is 'YYYY-MM'. PostgreSQL DATE columns are stored as UTC midnight of the key.
 */

const TZ = env.APP_TIMEZONE;

const partsFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

function zonedParts(date: Date) {
  const map: Record<string, string> = {};
  for (const p of partsFormatter.formatToParts(date)) map[p.type] = p.value;
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
    second: Number(map.second),
  };
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Calendar day (company time zone) of an instant. */
export function dateKey(date: Date): string {
  const p = zonedParts(date);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

export function todayKey(): string {
  return dateKey(now());
}

/** 'HH:mm' wall-clock time (company time zone) of an instant. */
export function timeOfDay(date: Date): string {
  const p = zonedParts(date);
  return `${pad(p.hour)}:${pad(p.minute)}`;
}

/** Converts a date key to the Date value stored in a DATE column. */
export function keyToDb(key: string): Date {
  return new Date(`${key}T00:00:00.000Z`);
}

/** Converts a DATE column value back to a date key. */
export function dbToKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(key: string, days: number): string {
  const d = keyToDb(key);
  d.setUTCDate(d.getUTCDate() + days);
  return dbToKey(d);
}

/** 0 = Sunday ... 6 = Saturday. */
export function dayOfWeek(key: string): number {
  return keyToDb(key).getUTCDay();
}

export function isWorkDay(key: string): boolean {
  return rules.workDays.includes(dayOfWeek(key));
}

/** Next work day after the given day. */
export function nextWorkDay(key: string): string {
  let next = addDays(key, 1);
  while (!isWorkDay(next)) next = addDays(next, 1);
  return next;
}

/** Sunday that starts the week of the given day. */
export function weekStartKey(key: string): string {
  return addDays(key, -dayOfWeek(key));
}

export function daysBetween(fromKey: string, toKey: string): string[] {
  const days: string[] = [];
  for (let k = fromKey; k <= toKey; k = addDays(k, 1)) days.push(k);
  return days;
}

/** Offset (ms) of the company time zone from UTC at a given instant. */
function tzOffsetMs(date: Date): number {
  const p = zonedParts(date);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

/** Converts a wall-clock time on a given day (company time zone) to an instant. */
export function zonedTimeToUtc(key: string, time: string): Date {
  const [y, m, d] = key.split('-').map(Number) as [number, number, number];
  const [hh, mm] = time.split(':').map(Number) as [number, number];
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  let result = guess - tzOffsetMs(new Date(guess));
  // Second pass handles days where the offset changes (daylight saving).
  result = guess - tzOffsetMs(new Date(result));
  return new Date(result);
}

/** Instant at which a calendar day starts in the company time zone. */
export function startOfDay(key: string): Date {
  return zonedTimeToUtc(key, '00:00');
}

export function currentMonthKey(): string {
  return todayKey().slice(0, 7);
}

export function parseMonthKey(monthKey: string): { year: number; month: number } {
  const [year, month] = monthKey.split('-').map(Number) as [number, number];
  return { year, month };
}

export function toMonthKey(year: number, month: number): string {
  return `${year}-${pad(month)}`;
}

export function monthRange(monthKey: string): { from: string; to: string } {
  const { year, month } = parseMonthKey(monthKey);
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return { from: `${monthKey}-01`, to: `${monthKey}-${pad(last)}` };
}

export function addMonths(monthKey: string, delta: number): string {
  const { year, month } = parseMonthKey(monthKey);
  const d = new Date(Date.UTC(year, month - 1 + delta, 1));
  return toMonthKey(d.getUTCFullYear(), d.getUTCMonth() + 1);
}

export const DATE_KEY_REGEX = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
export const MONTH_KEY_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;
export const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

/** True when the string is a real calendar date (rejects 2026-02-31). */
export function isValidDateKey(key: string): boolean {
  return DATE_KEY_REGEX.test(key) && dbToKey(keyToDb(key)) === key;
}
