// api/bookings.ts and its rules. The Sheet and Sanity's users/me are faked; nothing leaves
// the machine. Run with `npm test`.
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { allBookings, canTransition, corsHeaders, statusTotals, STATUSES, toBooking, weeklyCounts, type Booking } from '../api/_dashboard.ts';
import { createHandler, type Deps, type SheetAccess } from '../api/bookings.ts';

// ── fakes ──

const STUDIO = 'http://localhost:3333';
const TANIA = 'pTania123';
const GOOD_TOKEN = 'sk-good';
const STRANGER_TOKEN = 'sk-stranger';
const NOW = new Date('2026-10-25T08:30:00Z'); // 14:30 in Dhaka

// The tab as Sheets returns it: header, then rows; dates as serial numbers.
const HEADER = ['Booking ID', 'Received', 'Status', 'Name', 'Phone', 'Email', 'Concern / service', 'Session', 'Format',
  'Preferred date', 'Preferred time', 'Message', 'Reply to client', 'Notes', 'Status changed'];
const SERIAL_2026_10_24_1405 = 46319 + (14 * 60 + 5) / 1440;
const SERIAL_2026_10_28 = 46323;
const row = (id: string, status: string) =>
  [id, SERIAL_2026_10_24_1405, status, 'A. Rahman', '+8801700000000', '', 'Anxiety', '20-min intro (Free)', 'Online',
    SERIAL_2026_10_28, '4:00 pm', 'Hello', 'https://wa.me/…', 'called once'];

function fakeSheet(rows: unknown[][]) {
  const writes: { rowNumber: number; status: string; stamp: string }[] = [];
  const sheet: SheetAccess = {
    readRows: async () => rows.map((r) => [...r]),
    writeStatus: async (rowNumber, status, stamp) => {
      writes.push({ rowNumber, status, stamp });
    },
  };
  return { sheet, writes };
}

// users/me: Tania and a stranger are real users; any other token is a dead session.
const fakeSanity: typeof fetch = async (_url, init) => {
  const auth = new Headers(init?.headers).get('Authorization');
  if (auth === `Bearer ${GOOD_TOKEN}`) return Response.json({ id: TANIA, name: 'Tania' });
  if (auth === `Bearer ${STRANGER_TOKEN}`) return Response.json({ id: 'pSomeoneElse' });
  return Response.json({ message: 'Unauthorized - Session not found' }, { status: 401 });
};

function deps(sheet: SheetAccess, overrides: Partial<Deps> = {}): Deps {
  return {
    env: { ALLOWED_SANITY_USER_IDS: `${TANIA}, pOwner`, STUDIO_ORIGINS: `${STUDIO},https://tania.sanity.studio` },
    fetch: fakeSanity,
    sheet: () => sheet,
    now: () => NOW,
    ...overrides,
  };
}

interface Sent { status: number; headers: Record<string, string>; body: unknown }

async function call(d: Deps, req: { method: string; token?: string; origin?: string | null; body?: unknown }): Promise<Sent> {
  const headers: Record<string, string> = {};
  if (req.origin !== null) headers.origin = req.origin ?? STUDIO;
  if (req.token) headers.authorization = `Bearer ${req.token}`;
  const sent: Sent = { status: 0, headers: {}, body: undefined };
  const res = {
    setHeader(name: string, value: string) { sent.headers[name.toLowerCase()] = value; return res; },
    status(code: number) { sent.status = code; return res; },
    json(body: unknown) { sent.body = body; return res; },
    end() { return res; },
  };
  await createHandler(d)({ method: req.method, headers, body: req.body } as unknown as VercelRequest, res as unknown as VercelResponse);
  return sent;
}

const ID = 'BK-20261024-7F3A';

// ── the transition table ──

describe('canTransition', () => {
  const allowed: [string, string][] = [['New', 'Confirmed'], ['New', 'Declined'], ['Confirmed', 'Attended'], ['Confirmed', 'No-show']];

  for (const [from, to] of allowed) {
    it(`allows ${from} → ${to}`, () => assert.equal(canTransition(from, to), true));
  }

  it('rejects every other pair of statuses', () => {
    for (const from of STATUSES) {
      for (const to of STATUSES) {
        if (allowed.some(([f, t]) => f === from && t === to)) continue;
        assert.equal(canTransition(from, to), false, `${from} → ${to}`);
      }
    }
  });

  it('rejects unknown and blank statuses', () => {
    assert.equal(canTransition('', 'Confirmed'), false);
    assert.equal(canTransition('new', 'Confirmed'), false);
    assert.equal(canTransition('New', 'Cancelled'), false);
  });
});

// ── row mapping ──

describe('toBooking', () => {
  it('maps a Sheet row, turning serial dates back into the text the form wrote', () => {
    assert.deepEqual(toBooking(row(ID, 'New')), {
      id: ID, received: '2026-10-24 14:05', status: 'New', name: 'A. Rahman', phone: '+8801700000000', email: '',
      concern: 'Anxiety', session: '20-min intro (Free)', format: 'Online', date: '2026-10-28', time: '4:00 pm',
      message: 'Hello', notes: 'called once',
    });
  });

  it('keeps text dates and turns a typed time into "h:mm am/pm"', () => {
    const r = row(ID, 'New');
    r[9] = '2026-10-28';
    r[10] = (16 * 60) / 1440;
    const b = toBooking(r);
    assert.equal(b?.date, '2026-10-28');
    assert.equal(b?.time, '4:00 pm');
  });

  it('skips the header and blank rows', () => {
    assert.equal(toBooking(HEADER), null);
    assert.equal(toBooking([]), null);
  });

  it('lists every booking row, whatever its status, and nothing else', () => {
    const rows = [HEADER, row('BK-20261024-0001', 'New'), row('BK-20261024-0002', 'Confirmed'), [],
      row('BK-20261024-0003', 'Declined'), row('BK-20261024-0004', 'Attended'), row('BK-20261024-0005', 'No-show')];
    assert.deepEqual(allBookings(rows).map((b) => b.id),
      ['BK-20261024-0001', 'BK-20261024-0002', 'BK-20261024-0003', 'BK-20261024-0004', 'BK-20261024-0005']);
  });
});

// ── dashboard aggregates ──

const booking = (received: string, status: string): Booking => ({
  id: 'BK-20261024-0001', received, status, name: '', phone: '', email: '', concern: '', session: '', format: '',
  date: '', time: '', message: '', notes: '',
});

describe('weeklyCounts', () => {
  const TODAY = '2026-10-25';

  it('gives 12 seven-day weeks, oldest first, the last one ending today', () => {
    const weeks = weeklyCounts([], TODAY);
    assert.equal(weeks.length, 12);
    assert.equal(weeks[11].start, '2026-10-19');
    assert.equal(weeks[10].start, '2026-10-12');
    assert.equal(weeks[0].start, '2026-08-03');
    assert.ok(weeks.every((w) => w.requests === 0 && w.confirmed === 0));
  });

  it('counts requests by the day they were received, and Confirmed or Attended ones as confirmed', () => {
    const weeks = weeklyCounts([
      booking('2026-10-25 09:00', 'New'), // today: last week
      booking('2026-10-19 00:05', 'Confirmed'), // first day of the last week
      booking('2026-10-18 23:59', 'Attended'), // last day of the week before
      booking('2026-10-18 10:00', 'Declined'),
      booking('2026-10-17 10:00', 'No-show'),
    ], TODAY);
    assert.deepEqual(weeks[11], { start: '2026-10-19', requests: 2, confirmed: 1 });
    assert.deepEqual(weeks[10], { start: '2026-10-12', requests: 3, confirmed: 1 });
  });

  it('leaves out rows received outside the 12 weeks, or with no readable date', () => {
    const weeks = weeklyCounts([
      booking('2026-08-02 12:00', 'Confirmed'), // the day before the first week
      booking('2026-08-03 12:00', 'Confirmed'), // the first week's first day
      booking('2026-10-26 08:00', 'New'), // tomorrow (a clock ahead of the function's)
      booking('', 'New'),
      booking('last Tuesday', 'New'),
    ], TODAY);
    assert.deepEqual(weeks[0], { start: '2026-08-03', requests: 1, confirmed: 1 });
    assert.equal(weeks.reduce((n, w) => n + w.requests, 0), 1);
  });
});

describe('statusTotals', () => {
  it('folds the five Sheet statuses into the three donut slices, ignoring anything else', () => {
    const statuses = ['New', 'New', 'Confirmed', 'Attended', 'Attended', 'Declined', 'No-show', '', 'Maybe'];
    assert.deepEqual(statusTotals(statuses.map((s) => booking('2026-10-25 09:00', s))), { confirmed: 3, pending: 2, cancelled: 2 });
  });
});

// ── who may call ──

describe('auth', () => {
  const { sheet } = fakeSheet([HEADER, row(ID, 'New')]);

  it('401 without a token, and never asks Sanity', async () => {
    let asked = false;
    const res = await call(deps(sheet, { fetch: async (...a) => { asked = true; return fakeSanity(...a); } }), { method: 'GET' });
    assert.equal(res.status, 401);
    assert.equal(asked, false);
  });

  it('401 when Sanity says the token is not a session', async () => {
    assert.equal((await call(deps(sheet), { method: 'GET', token: 'sk-dead' })).status, 401);
  });

  it('401 when Sanity answers with no user (anonymous)', async () => {
    const anonymous: typeof fetch = async () => Response.json({});
    assert.equal((await call(deps(sheet, { fetch: anonymous }), { method: 'GET', token: GOOD_TOKEN })).status, 401);
  });

  it('403 for a real user who is not on the allowlist', async () => {
    assert.equal((await call(deps(sheet), { method: 'GET', token: STRANGER_TOKEN })).status, 403);
  });

  it('403 for everyone when the allowlist is empty', async () => {
    const d = deps(sheet, { env: { STUDIO_ORIGINS: STUDIO } });
    assert.equal((await call(d, { method: 'GET', token: GOOD_TOKEN })).status, 403);
  });

  it('never touches the Sheet before the caller is allowed', async () => {
    let opened = false;
    const d = deps(sheet, { sheet: () => { opened = true; return sheet; } });
    await call(d, { method: 'POST', token: STRANGER_TOKEN, body: { id: ID, status: 'Confirmed' } });
    assert.equal(opened, false);
  });

  it('503 when Sanity cannot be reached', async () => {
    const down: typeof fetch = async () => { throw new TypeError('fetch failed'); };
    assert.equal((await call(deps(sheet, { fetch: down }), { method: 'GET', token: GOOD_TOKEN })).status, 503);
  });

  it('lets an allowed user list the requests, with the weekly counts and status totals', async () => {
    const { sheet: full } = fakeSheet([HEADER, row(ID, 'New'), row('BK-20261024-0002', 'Attended')]);
    const res = await call(deps(full), { method: 'GET', token: GOOD_TOKEN });
    assert.equal(res.status, 200);
    const body = res.body as {
      today: string; bookings: { id: string }[];
      weeks: { start: string; requests: number; confirmed: number }[];
      totals: { confirmed: number; pending: number; cancelled: number };
    };
    assert.equal(body.today, '2026-10-25');
    assert.deepEqual(body.bookings.map((b) => b.id), [ID, 'BK-20261024-0002']);
    assert.equal(body.weeks.length, 12);
    assert.deepEqual(body.weeks[11], { start: '2026-10-19', requests: 2, confirmed: 1 });
    assert.deepEqual(body.totals, { confirmed: 1, pending: 1, cancelled: 0 });
  });
});

// ── setting a status ──

describe('POST', () => {
  it('writes the new status and a Dhaka timestamp to the right row', async () => {
    const { sheet, writes } = fakeSheet([HEADER, row('BK-20261024-0001', 'New'), row(ID, 'New')]);
    const res = await call(deps(sheet), { method: 'POST', token: GOOD_TOKEN, body: { id: ID, status: 'Confirmed' } });
    assert.equal(res.status, 200);
    assert.deepEqual(writes, [{ rowNumber: 3, status: 'Confirmed', stamp: '2026-10-25 14:30' }]);
  });

  it('404 for an id that is not in the Sheet', async () => {
    const { sheet, writes } = fakeSheet([HEADER, row(ID, 'New')]);
    const res = await call(deps(sheet), { method: 'POST', token: GOOD_TOKEN, body: { id: 'BK-20261024-FFFF', status: 'Confirmed' } });
    assert.equal(res.status, 404);
    assert.equal(writes.length, 0);
  });

  it('400 for a disallowed change, judged by the Sheet, not the caller', async () => {
    const { sheet, writes } = fakeSheet([HEADER, row(ID, 'New')]);
    const res = await call(deps(sheet), { method: 'POST', token: GOOD_TOKEN, body: { id: ID, status: 'Attended', from: 'Confirmed' } });
    assert.equal(res.status, 400);
    assert.equal(writes.length, 0);
  });

  it('400 for a malformed body', async () => {
    const { sheet } = fakeSheet([HEADER, row(ID, 'New')]);
    for (const body of [undefined, {}, { id: ID }, { id: ID, status: 'Done' }, { id: '=HYPERLINK()', status: 'Confirmed' }]) {
      assert.equal((await call(deps(sheet), { method: 'POST', token: GOOD_TOKEN, body })).status, 400, JSON.stringify(body));
    }
  });

  it('503 marked not-connected when the Sheet env is missing', async () => {
    const res = await call(deps(fakeSheet([]).sheet, { sheet: () => null }), { method: 'GET', token: GOOD_TOKEN });
    assert.equal(res.status, 503);
    assert.equal((res.body as { code?: string }).code, 'not-connected');
  });
});

// ── CORS ──

describe('CORS', () => {
  const allowed = new Set([STUDIO]);

  it('echoes an allowed origin', () => {
    assert.equal(corsHeaders(STUDIO, allowed)['Access-Control-Allow-Origin'], STUDIO);
  });

  it('sends no CORS headers to any other origin', () => {
    assert.deepEqual(corsHeaders('https://evil.example', allowed), {});
    assert.deepEqual(corsHeaders(undefined, allowed), {});
  });

  it('answers a disallowed origin with 403, no ACAO, and Vary: Origin', async () => {
    const res = await call(deps(fakeSheet([]).sheet), { method: 'OPTIONS', origin: 'https://evil.example' });
    assert.equal(res.status, 403);
    assert.equal(res.headers['access-control-allow-origin'], undefined);
    assert.equal(res.headers.vary, 'Origin');
  });

  it('answers the Studio preflight with 204 and the allowed headers', async () => {
    const res = await call(deps(fakeSheet([]).sheet), { method: 'OPTIONS' });
    assert.equal(res.status, 204);
    assert.equal(res.headers['access-control-allow-origin'], STUDIO);
    assert.match(res.headers['access-control-allow-headers'], /Authorization/);
  });
});
