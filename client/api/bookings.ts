// GET/POST /api/bookings (Vercel Function), used only by the Dashboard and Appointments tools in
// Sanity Studio (docs/booking-plan.md, "The dashboard's functions").
//   GET               → every booking row (the dashboard's fields only), plus the last 12 weeks'
//                       request counts and the status totals, worked out here from the same rows
//   POST {id, status} → sets that row's Status, if the change is an allowed one
// Every call must carry the Studio user's Sanity token; the function asks Sanity who that is
// and serves only the user IDs in ALLOWED_SANITY_USER_IDS. No secret lives in the Studio.
// Request bodies are never logged: they name people and what they are facing.
import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  allBookings, bearerToken, canTransition, corsHeaders, findRowNumber, isBookingId, isStatus, parseList,
  statusTotals, weeklyCounts, type Booking, type StatusTotals, type WeekCount,
} from './_dashboard.js';
import { COLUMN, dhakaParts, dhakaStamp, readRows, sheetConfig, writeStatus } from './_sheet.js';

const SANITY_API_VERSION = 'v2021-06-07';
const SANITY_PROJECT_FALLBACK = 'v75epg3m'; // as in lib/sanity.ts
const SANITY_TIMEOUT_MS = 5000;

/** The Sheet as this function uses it; swapped for an in-memory one in the tests. */
export interface SheetAccess {
  readRows(): Promise<unknown[][]>;
  writeStatus(rowNumber: number, status: string, stamp: string): Promise<void>;
}

export interface Deps {
  env: Record<string, string | undefined>;
  fetch: typeof fetch;
  /** null when the Sheet env is missing; may throw when it is malformed. */
  sheet: () => SheetAccess | null;
  now: () => Date;
}

export interface BookingsResponse {
  today: string; // YYYY-MM-DD in Dhaka, so the Studio and the function agree on "today"
  bookings: Booking[];
  weeks: WeekCount[]; // the trend chart, oldest first
  totals: StatusTotals; // the donut
}

type Auth = { ok: true } | { ok: false; status: 401 | 403 | 503; error: string };

const NOT_SIGNED_IN: Auth = { ok: false, status: 401, error: 'Sign in to the Studio to see bookings.' };

// Who is calling, according to Sanity. users/me answers 401 for a dead token and {} for none.
async function authorise(req: VercelRequest, deps: Deps): Promise<Auth> {
  const token = bearerToken(req.headers.authorization);
  if (!token) return NOT_SIGNED_IN;
  const projectId = deps.env.VITE_SANITY_PROJECT_ID || SANITY_PROJECT_FALLBACK;
  let userId: unknown;
  try {
    const res = await deps.fetch(`https://${projectId}.api.sanity.io/${SANITY_API_VERSION}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(SANITY_TIMEOUT_MS),
    });
    if (res.status === 401 || res.status === 403) return NOT_SIGNED_IN;
    if (!res.ok) throw new Error(`Sanity answered ${res.status}`);
    userId = ((await res.json()) as { id?: unknown }).id;
  } catch (err) {
    console.error('Bookings dashboard: could not verify the Sanity token.', (err as Error).message);
    return { ok: false, status: 503, error: 'Could not check your sign-in. Try again in a moment.' };
  }
  if (typeof userId !== 'string' || !userId) return NOT_SIGNED_IN;
  const allowed = parseList(deps.env.ALLOWED_SANITY_USER_IDS);
  if (allowed.size === 0) console.error('Bookings dashboard: ALLOWED_SANITY_USER_IDS is empty, so nobody is let in.');
  if (!allowed.has(userId)) return { ok: false, status: 403, error: 'This account is not allowed to see bookings.' };
  return { ok: true };
}

function openSheet(deps: Deps): SheetAccess | null {
  try {
    return deps.sheet();
  } catch {
    return null;
  }
}

const UNAVAILABLE = 'Bookings are unavailable right now.';

// the status and Google's message only: the error object also carries row data
const logSheetError = (what: string, err: unknown) =>
  console.error(`Bookings dashboard: ${what} failed.`, (err as { status?: number }).status ?? '', (err as Error).message);

async function list(res: VercelResponse, sheet: SheetAccess, deps: Deps) {
  let rows: unknown[][];
  try {
    rows = await sheet.readRows();
  } catch (err) {
    logSheetError('reading the Sheet', err);
    res.status(503).json({ error: UNAVAILABLE });
    return;
  }
  const today = dhakaParts(deps.now()).date;
  const bookings = allBookings(rows);
  const body: BookingsResponse = { today, bookings, weeks: weeklyCounts(bookings, today), totals: statusTotals(bookings) };
  res.status(200).json(body);
}

async function setStatus(req: VercelRequest, res: VercelResponse, sheet: SheetAccess, deps: Deps) {
  const body: unknown = req.body;
  const { id, status } = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  if (!isBookingId(id) || !isStatus(status)) {
    res.status(400).json({ error: 'Send {"id": "BK-…", "status": "Confirmed"} as JSON.' });
    return;
  }
  try {
    // Re-read the row now: Tania may have changed it in the Sheet since the dashboard loaded.
    const rows = await sheet.readRows();
    const rowNumber = findRowNumber(rows, id);
    if (rowNumber === null) {
      res.status(404).json({ error: 'That request is no longer in the Sheet.' });
      return;
    }
    const current = String(rows[rowNumber - 1][COLUMN.status] ?? '').trim();
    if (!canTransition(current, status)) {
      res.status(400).json({ error: `A request that is ${current || 'blank'} cannot be marked ${status}.` });
      return;
    }
    await sheet.writeStatus(rowNumber, status, dhakaStamp(deps.now()));
  } catch (err) {
    logSheetError('updating the Status', err);
    res.status(503).json({ error: UNAVAILABLE });
    return;
  }
  res.status(200).json({ id, status });
}

export function createHandler(deps: Deps) {
  return async function handler(req: VercelRequest, res: VercelResponse) {
    const origin = req.headers.origin;
    res.setHeader('Vary', 'Origin');
    res.setHeader('Cache-Control', 'no-store');
    const cors = corsHeaders(origin, parseList(deps.env.STUDIO_ORIGINS));
    for (const [name, value] of Object.entries(cors)) res.setHeader(name, value);
    // A browser on any other site gets nothing, not even a preflight answer.
    if (origin && !cors['Access-Control-Allow-Origin']) {
      res.status(403).json({ error: 'Origin not allowed.' });
      return;
    }
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }
    if (req.method !== 'GET' && req.method !== 'POST') {
      res.setHeader('Allow', 'GET, POST, OPTIONS');
      res.status(405).json({ error: 'Method not allowed.' });
      return;
    }
    const auth = await authorise(req, deps);
    if (!auth.ok) {
      res.status(auth.status).json({ error: auth.error });
      return;
    }
    const sheet = openSheet(deps);
    if (!sheet) {
      console.error('Bookings dashboard: BOOKINGS_SHEET_ID or GOOGLE_SERVICE_ACCOUNT_JSON is missing or unreadable.');
      // only signed-in, allowlisted callers get this far, so naming the cause leaks nothing
      res.status(503).json({ error: 'Bookings aren’t connected to Google Sheets yet.', code: 'not-connected' });
      return;
    }
    if (req.method === 'GET') await list(res, sheet, deps);
    else await setStatus(req, res, sheet, deps);
  };
}

function liveSheet(): SheetAccess | null {
  const config = sheetConfig();
  if (!config) return null;
  return {
    readRows: () => readRows(config),
    writeStatus: (rowNumber, status, stamp) => writeStatus(config, rowNumber, status, stamp),
  };
}

export default createHandler({ env: process.env, fetch: (...args) => fetch(...args), sheet: liveSheet, now: () => new Date() });
