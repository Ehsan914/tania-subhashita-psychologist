// Pure rules behind api/bookings.ts: which Status changes are allowed, how a Sheet row becomes
// what the Studio's Dashboard and Appointments tools show, the dashboard's weekly and status
// counts, who may call, and which origins may read the answer.
// No I/O here, so every rule is tested on its own (tests/bookings.test.ts).
import { COLUMN } from './_sheet.js';

export const STATUSES = ['New', 'Confirmed', 'Declined', 'Attended', 'No-show'] as const;
export type Status = (typeof STATUSES)[number];

// docs/booking-plan.md: New → Confirmed | Declined, Confirmed → Attended | No-show. Nothing else.
const TRANSITIONS: Partial<Record<Status, readonly Status[]>> = {
  New: ['Confirmed', 'Declined'],
  Confirmed: ['Attended', 'No-show'],
};

export const isStatus = (value: unknown): value is Status => STATUSES.includes(value as Status);

export function canTransition(from: string, to: string): boolean {
  return isStatus(from) && isStatus(to) && (TRANSITIONS[from]?.includes(to) ?? false);
}

/** One request as the dashboard shows it. */
export interface Booking {
  id: string;
  received: string; // "2026-10-24 14:05", Dhaka
  status: string;
  name: string;
  phone: string;
  email: string;
  concern: string;
  session: string;
  format: string;
  date: string; // YYYY-MM-DD
  time: string;
  message: string;
  notes: string;
}

const BOOKING_ID = /^BK-\d{8}-[0-9A-F]{4}$/;
export const isBookingId = (value: unknown): value is string => typeof value === 'string' && BOOKING_ID.test(value);

// Sheets counts days from 1899-12-30; the fraction is the time of day.
const SHEETS_EPOCH_MS = Date.UTC(1899, 11, 30);
const MINUTES_PER_DAY = 24 * 60;

const fromSerial = (serial: number) => new Date(SHEETS_EPOCH_MS + Math.round(serial * MINUTES_PER_DAY) * 60_000);
const isoDate = (d: Date) => d.toISOString().slice(0, 10);
const text = (value: unknown) => (value === undefined || value === null ? '' : String(value).trim());

// A date or date-time cell: a serial number when the Sheet parsed it, text when it didn't.
function cellDate(value: unknown, withTime: boolean): string {
  if (typeof value !== 'number') return text(value);
  const d = fromSerial(value);
  return withTime ? `${isoDate(d)} ${d.toISOString().slice(11, 16)}` : isoDate(d);
}

// The form writes the time as text ("4:00 pm"); a time typed into the Sheet is a day fraction.
function cellTime(value: unknown): string {
  if (typeof value !== 'number') return text(value);
  const minutes = Math.round((value % 1) * MINUTES_PER_DAY);
  const h = Math.floor(minutes / 60);
  const m = String(minutes % 60).padStart(2, '0');
  return `${h % 12 || 12}:${m} ${h < 12 ? 'am' : 'pm'}`;
}

/** A Sheet row as a booking, or null for the header and anything that isn't a booking row. */
export function toBooking(row: readonly unknown[]): Booking | null {
  const id = text(row[COLUMN.id]);
  if (!isBookingId(id)) return null;
  return {
    id,
    received: cellDate(row[COLUMN.received], true),
    status: text(row[COLUMN.status]),
    name: text(row[COLUMN.name]),
    phone: text(row[COLUMN.phone]),
    email: text(row[COLUMN.email]),
    concern: text(row[COLUMN.concern]),
    session: text(row[COLUMN.session]),
    format: text(row[COLUMN.format]),
    date: cellDate(row[COLUMN.date], false),
    time: cellTime(row[COLUMN.time]),
    message: text(row[COLUMN.message]),
    notes: text(row[COLUMN.notes]),
  };
}

/** Every booking row, in Sheet order, for the Appointments list; the header and blank rows dropped. */
export function allBookings(rows: readonly (readonly unknown[])[]): Booking[] {
  return rows.map(toBooking).filter((b): b is Booking => b !== null);
}

// ── dashboard aggregates ──

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_DAYS = 7;
export const TREND_WEEKS = 12;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}/;

const dayNumber = (iso: string) => Math.floor(Date.parse(`${iso.slice(0, 10)}T00:00:00Z`) / DAY_MS);
const dayIso = (n: number) => new Date(n * DAY_MS).toISOString().slice(0, 10);

// A request counts as confirmed once Tania has said yes to it, whatever happened at the session.
const CONFIRMED = new Set<string>(['Confirmed', 'Attended']);

export interface WeekCount {
  start: string; // YYYY-MM-DD, the week's first day
  requests: number; // rows received that week
  confirmed: number; // of those, rows now Confirmed or Attended
}

/**
 * The trend chart: `weeks` seven-day weeks, oldest first, the last one ending on `today` (Dhaka).
 * Each row is counted in the week its Received date falls in, which the Sheet holds in Dhaka time;
 * "confirmed" is the part of that week's requests whose status is now Confirmed or Attended.
 */
export function weeklyCounts(bookings: readonly Booking[], today: string, weeks = TREND_WEEKS): WeekCount[] {
  const first = dayNumber(today) - weeks * WEEK_DAYS + 1;
  const counts = Array.from({ length: weeks }, (_, i) => ({ start: dayIso(first + i * WEEK_DAYS), requests: 0, confirmed: 0 }));
  for (const b of bookings) {
    if (!ISO_DATE.test(b.received)) continue;
    const offset = dayNumber(b.received) - first;
    const week = counts[Math.floor(offset / WEEK_DAYS)];
    if (offset < 0 || !week) continue;
    week.requests += 1;
    if (CONFIRMED.has(b.status)) week.confirmed += 1;
  }
  return counts;
}

export interface StatusTotals {
  confirmed: number;
  pending: number;
  cancelled: number;
}

// The donut's three slices from the Sheet's five statuses:
//   Confirmed = Confirmed + Attended, Pending = New, Cancelled = Declined + No-show.
// A blank or hand-typed status matches none and is left out.
const SLICE: Record<string, keyof StatusTotals> = {
  Confirmed: 'confirmed', Attended: 'confirmed', New: 'pending', Declined: 'cancelled', 'No-show': 'cancelled',
};

export function statusTotals(bookings: readonly Booking[]): StatusTotals {
  const totals: StatusTotals = { confirmed: 0, pending: 0, cancelled: 0 };
  for (const b of bookings) {
    const slice = SLICE[b.status];
    if (slice) totals[slice] += 1;
  }
  return totals;
}

/** The Sheet's 1-based row number holding this booking, or null. */
export function findRowNumber(rows: readonly (readonly unknown[])[], id: string): number | null {
  const index = rows.findIndex((row) => text(row[COLUMN.id]) === id);
  return index === -1 ? null : index + 1;
}

// ── who may call ──

/** "a, b ,c" → the set {a, b, c}; empty entries dropped. */
export const parseList = (value: string | undefined) =>
  new Set((value ?? '').split(',').map((x) => x.trim()).filter(Boolean));

export function bearerToken(header: string | undefined): string | null {
  const match = /^Bearer\s+(\S+)$/i.exec(header ?? '');
  return match ? match[1] : null;
}

// ── which origins may read the answer ──

const CORS_HEADERS = {
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Max-Age': '600',
};

/** The CORS headers for this origin: none at all unless it is on the list. */
export function corsHeaders(origin: string | undefined, allowed: ReadonlySet<string>): Record<string, string> {
  if (!origin || !allowed.has(origin)) return {};
  return { 'Access-Control-Allow-Origin': origin, ...CORS_HEADERS };
}
