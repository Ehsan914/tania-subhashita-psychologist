// How the Dashboard and Appointments tools group, order and label bookings. No React, no I/O.
import type {Booking, BookingsResponse, NextStatus} from './api'

const DAY_MS = 24 * 60 * 60 * 1000
const WEEK_DAYS = 7
const TREND_WEEKS = 12 // as client/api/_dashboard.ts
const MINUTES_PER_HOUR = 60
const NOON = 12

const addDays = (iso: string, days: number) =>
  new Date(Date.parse(`${iso}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10)

// "4:00 pm" → 960; anything unreadable sorts last.
export function timeMinutes(time: string): number {
  const match = /^(\d{1,2})(?::(\d{2}))?\s*([ap])\.?m\.?$/i.exec(time.trim())
  if (!match) return Number.MAX_SAFE_INTEGER
  const hour = (Number(match[1]) % NOON) + (match[3].toLowerCase() === 'p' ? NOON : 0)
  return hour * MINUTES_PER_HOUR + Number(match[2] ?? 0)
}

export const byWhen = (a: Booking, b: Booking) => a.date.localeCompare(b.date) || timeMinutes(a.time) - timeMinutes(b.time)

export interface DashboardGroups {
  waiting: Booking[] // New: needs Confirm or Decline
  today: Booking[] // Confirmed for today
  nextWeek: number // Confirmed from today through the next 6 days
}

export function dashboardGroups(bookings: Booking[], today: string): DashboardGroups {
  const confirmed = bookings.filter((b) => b.status === 'Confirmed').sort(byWhen)
  const weekEnd = addDays(today, WEEK_DAYS - 1)
  return {
    waiting: bookings.filter((b) => b.status === 'New').sort(byWhen),
    today: confirmed.filter((b) => b.date === today),
    nextWeek: confirmed.filter((b) => b.date >= today && b.date <= weekEnd).length,
  }
}

/** Today in Dhaka, as the bookings function counts it. */
export function dhakaToday(now: Date): string {
  return new Intl.DateTimeFormat('en-CA', {timeZone: 'Asia/Dhaka', year: 'numeric', month: '2-digit', day: '2-digit'}).format(now)
}

/** What the pages show while the Sheet can't be read: no bookings, 12 empty weeks. */
export function emptyResponse(now: Date): BookingsResponse {
  const today = dhakaToday(now)
  const first = addDays(today, -TREND_WEEKS * WEEK_DAYS + 1)
  return {
    today,
    bookings: [],
    weeks: Array.from({length: TREND_WEEKS}, (_, i) => ({start: addDays(first, i * WEEK_DAYS), requests: 0, confirmed: 0})),
    totals: {confirmed: 0, pending: 0, cancelled: 0},
  }
}

// ── statuses ──

/** The Sheet's statuses in the order the Appointments tabs list them. */
export const STATUSES = ['New', 'Confirmed', 'Attended', 'Declined', 'No-show'] as const

/** The design's pill colour for each Sheet status. */
export const PILL: Record<string, 'pending' | 'confirmed' | 'cancelled' | 'off'> = {
  New: 'pending',
  Confirmed: 'confirmed',
  Attended: 'confirmed',
  Declined: 'cancelled',
  'No-show': 'off',
}

/** The status changes the function allows from each status (client/api/_dashboard.ts). */
export const NEXT: Record<string, {status: NextStatus; text: string; primary: boolean}[]> = {
  New: [
    {status: 'Declined', text: 'Decline', primary: false},
    {status: 'Confirmed', text: 'Confirm', primary: true},
  ],
  Confirmed: [
    {status: 'No-show', text: 'No-show', primary: false},
    {status: 'Attended', text: 'Attended', primary: true},
  ],
}

// ── labels ──

const dayFormat = new Intl.DateTimeFormat('en-GB', {weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC'})
const stampFormat = new Intl.DateTimeFormat('en-GB', {day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC'})
const ISO_DATE = /^\d{4}-\d{2}-\d{2}/

const label = (format: Intl.DateTimeFormat, iso: string) => {
  const ms = Date.parse(`${iso.slice(0, 10)}T00:00:00Z`)
  return ISO_DATE.test(iso) && !Number.isNaN(ms) ? format.format(ms) : iso
}

/** "2026-10-28" → "Wed 28 Oct"; text the Sheet holds in another shape is shown as it is. */
export const formatDay = (iso: string) => label(dayFormat, iso)

/** The Received stamp "2026-10-24 14:05" → "24 Oct 2026". */
export const formatStamp = (stamp: string) => label(stampFormat, stamp)

export function initials(name: string): string {
  const parts = name.replace(/[^\p{L}\s]/gu, ' ').split(/\s+/).filter(Boolean)
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase() || '?'
}

/**
 * A wa.me chat link to the client, built like the site's whatsappLink (client/site/book/booking.ts):
 * digits only, country code first. A Bangladeshi number written locally (01XXXXXXXXX) gets 880.
 */
export function whatsappLink(phone: string): string | null {
  let digits = phone.replace(/\D/g, '')
  if (digits.startsWith('00')) digits = digits.slice(2)
  else if (digits.startsWith('0')) digits = `880${digits.slice(1)}`
  const MIN_DIGITS = 8
  return digits.length >= MIN_DIGITS ? `https://wa.me/${digits}` : null
}
