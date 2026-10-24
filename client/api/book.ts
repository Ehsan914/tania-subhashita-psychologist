// POST /api/book (Vercel Function): one booking request → one row in the private bookings
// Sheet (docs/booking-plan.md). The Google key lives only in this function's environment;
// the request body is never logged, since it holds names, numbers and what someone is facing.
import { randomBytes } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { JWT } from 'google-auth-library';

const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets';
const SHEET_RANGE = 'Bookings!A:L';
const TIME_ZONE = 'Asia/Dhaka';
const DAY_MS = 24 * 60 * 60 * 1000;
const DAYS_AHEAD_MAX = 30;

const FIELD_MAX_LENGTH = {
  clientName: 200,
  clientPhone: 30,
  clientEmail: 254,
  service: 100,
  sessionType: 100,
  format: 30,
  preferredDate: 10,
  preferredTime: 50,
  message: 2000,
} as const;

const FORMAT_LABEL: Record<string, string> = { online: 'Online', 'in-person': 'In person' };

type Booking = Record<keyof typeof FIELD_MAX_LENGTH, string>;

// The same rules as the old Express route, plus the 30-day window the form already keeps to.
function bookingInputError(body: Record<string, unknown>): string | null {
  for (const [field, max] of Object.entries(FIELD_MAX_LENGTH)) {
    const value = body[field];
    if (value === undefined) continue;
    if (typeof value !== 'string') return `${field} must be text.`;
    if (value.length > max) return `${field} is too long.`;
  }
  const { clientName, clientPhone, preferredDate, preferredTime, format } = body as Partial<Booking>;
  if (!clientName?.trim() || !clientPhone?.trim() || !preferredDate || !preferredTime) {
    return 'Name, phone, date, and time are required.';
  }
  if (format !== undefined && !(format in FORMAT_LABEL)) return 'Format must be online or in-person.';
  const date = new Date(`${preferredDate}T00:00:00Z`);
  // The round trip rejects calendar-invalid dates such as 2026-02-31.
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== preferredDate) {
    return 'Date must be a real date in YYYY-MM-DD format.';
  }
  // One day of slack so a client in a timezone behind UTC can still book "today".
  const todayUtc = new Date(`${new Date().toISOString().slice(0, 10)}T00:00:00Z`).getTime();
  if (date.getTime() < todayUtc - DAY_MS) return 'Date cannot be in the past.';
  if (date.getTime() > todayUtc + DAYS_AHEAD_MAX * DAY_MS) return `Date must be within the next ${DAYS_AHEAD_MAX} days.`;
  return null;
}

// "2026-10-24 14:05" in Dhaka, whatever zone the function runs in.
function dhakaParts(now: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? '';
  return { date: `${get('year')}-${get('month')}-${get('day')}`, time: `${get('hour')}:${get('minute')}` };
}

// BK-20261024-7F3A: the day it arrived and four random hex digits.
function bookingId(now: Date): string {
  return `BK-${dhakaParts(now).date.replace(/-/g, '')}-${randomBytes(2).toString('hex').toUpperCase()}`;
}

// The Sheet reads values as if typed (USER_ENTERED), so a leading apostrophe keeps what a
// visitor wrote as text: "=…" stays words, not a formula, and "+880…" keeps its plus.
const asText = (value: string | undefined) => `'${(value ?? '').trim()}`;

// Columns as in docs/booking-plan.md: ID, Received, Status, Name, Phone, Email,
// Concern / service, Session, Format, Preferred date, Preferred time, Message.
function sheetRow(id: string, now: Date, b: Partial<Booking>): string[] {
  const received = dhakaParts(now);
  return [
    id,
    `${received.date} ${received.time}`,
    'New',
    asText(b.clientName),
    asText(b.clientPhone),
    asText(b.clientEmail),
    asText(b.service),
    asText(b.sessionType),
    b.format ? FORMAT_LABEL[b.format] : '',
    b.preferredDate ?? '',
    asText(b.preferredTime),
    asText(b.message),
  ];
}

interface SheetConfig {
  sheetId: string;
  auth: JWT;
}

function sheetConfig(): SheetConfig | null {
  const sheetId = process.env.BOOKINGS_SHEET_ID;
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!sheetId || !keyJson) return null;
  const key = JSON.parse(keyJson) as { client_email?: string; private_key?: string };
  if (!key.client_email || !key.private_key) return null;
  return { sheetId, auth: new JWT({ email: key.client_email, key: key.private_key, scopes: [SHEETS_SCOPE] }) };
}

async function appendRow({ sheetId, auth }: SheetConfig, row: string[]): Promise<void> {
  const range = encodeURIComponent(SHEET_RANGE);
  await auth.request({
    url: `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}:append?valueInputOption=USER_ENTERED`,
    method: 'POST',
    data: { values: [row] },
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }
  const body: unknown = req.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    res.status(400).json({ error: 'Send the booking as JSON.' });
    return;
  }
  const fields = body as Record<string, unknown>;
  const now = new Date();
  // A filled honeypot is a bot: it sees the same success a person does, and nothing is written.
  if (typeof fields.website === 'string' && fields.website !== '') {
    res.status(200).json({ id: bookingId(now) });
    return;
  }
  const inputError = bookingInputError(fields);
  if (inputError) {
    res.status(400).json({ error: inputError });
    return;
  }
  await saveBooking(res, fields as Partial<Booking>, now);
}

async function saveBooking(res: VercelResponse, booking: Partial<Booking>, now: Date) {
  let config: SheetConfig | null;
  try {
    config = sheetConfig();
  } catch {
    config = null;
  }
  if (!config) {
    console.error('Bookings: BOOKINGS_SHEET_ID or GOOGLE_SERVICE_ACCOUNT_JSON is missing or unreadable.');
    res.status(503).json({ error: 'Bookings are unavailable right now.' });
    return;
  }
  const id = bookingId(now);
  try {
    await appendRow(config, sheetRow(id, now, booking));
  } catch (err) {
    // the status and Google's message only: the error object also carries the row
    console.error('Bookings: appending to the Sheet failed.', (err as { status?: number }).status ?? '', (err as Error).message);
    res.status(503).json({ error: 'Bookings are unavailable right now.' });
    return;
  }
  res.status(200).json({ id });
}
