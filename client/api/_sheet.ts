// The private bookings Sheet, shared by api/book.ts (appends a row) and api/bookings.ts (reads
// rows, sets a Status). The underscore keeps Vercel from serving this file as a function.
// The Google key lives only in the functions' environment (docs/booking-plan.md).
import { JWT } from 'google-auth-library';

const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets';
const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';
const TAB = 'Bookings';
export const TIME_ZONE = 'Asia/Dhaka';

// Column positions (0-based) as in docs/booking-plan.md. M is the "Reply to client" formula.
export const COLUMN = {
  id: 0, // A Booking ID
  received: 1, // B
  status: 2, // C
  name: 3, // D
  phone: 4, // E
  email: 5, // F
  concern: 6, // G Concern / service
  session: 7, // H
  format: 8, // I
  date: 9, // J Preferred date
  time: 10, // K Preferred time
  message: 11, // L
  notes: 13, // N, Tania's own
  statusChanged: 14, // O, written when the dashboard changes the Status
} as const;

const letter = (index: number) => String.fromCharCode('A'.charCodeAt(0) + index);

// "2026-10-24 14:05" in Dhaka, whatever zone the function runs in.
export function dhakaParts(now: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? '';
  return { date: `${get('year')}-${get('month')}-${get('day')}`, time: `${get('hour')}:${get('minute')}` };
}

/** The Received / Status changed timestamp: "2026-10-24 14:05", Dhaka time. */
export function dhakaStamp(now: Date): string {
  const { date, time } = dhakaParts(now);
  return `${date} ${time}`;
}

export interface SheetConfig {
  sheetId: string;
  auth: JWT;
}

/** null when the env is missing; throws when GOOGLE_SERVICE_ACCOUNT_JSON isn't JSON. */
export function sheetConfig(): SheetConfig | null {
  const sheetId = process.env.BOOKINGS_SHEET_ID;
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!sheetId || !keyJson) return null;
  const key = JSON.parse(keyJson) as { client_email?: string; private_key?: string };
  if (!key.client_email || !key.private_key) return null;
  return { sheetId, auth: new JWT({ email: key.client_email, key: key.private_key, scopes: [SHEETS_SCOPE] }) };
}

const valuesUrl = (sheetId: string, range: string) => `${SHEETS_API}/${sheetId}/values/${encodeURIComponent(range)}`;

export async function appendRow({ sheetId, auth }: SheetConfig, row: string[]): Promise<void> {
  await auth.request({
    url: `${valuesUrl(sheetId, `${TAB}!A:${letter(COLUMN.message)}`)}:append?valueInputOption=USER_ENTERED`,
    method: 'POST',
    data: { values: [row] },
  });
}

/**
 * Every row of the tab, header included, A to the Status changed column. Dates come back as
 * serial numbers rather than in the Sheet's display locale, so reading them never depends on
 * how the Sheet happens to format a date.
 */
export async function readRows({ sheetId, auth }: SheetConfig): Promise<unknown[][]> {
  const res = await auth.request<{ values?: unknown[][] }>({
    url: `${valuesUrl(sheetId, `${TAB}!A:${letter(COLUMN.statusChanged)}`)}?valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=SERIAL_NUMBER`,
    method: 'GET',
  });
  return res.data.values ?? [];
}

/** Sets one row's Status and its Status changed stamp. rowNumber is the Sheet's 1-based row. */
export async function writeStatus({ sheetId, auth }: SheetConfig, rowNumber: number, status: string, stamp: string): Promise<void> {
  await auth.request({
    url: `${SHEETS_API}/${sheetId}/values:batchUpdate`,
    method: 'POST',
    data: {
      // as if typed, like the Received column, so the stamp is a real date-time in the Sheet
      valueInputOption: 'USER_ENTERED',
      data: [
        { range: `${TAB}!${letter(COLUMN.status)}${rowNumber}`, values: [[status]] },
        { range: `${TAB}!${letter(COLUMN.statusChanged)}${rowNumber}`, values: [[stamp]] },
      ],
    },
  });
}
