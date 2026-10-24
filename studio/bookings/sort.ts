// How the Bookings tool groups, orders and labels requests. No React, no I/O.
import type {Booking} from './api'

const DAY_MS = 24 * 60 * 60 * 1000
const WEEK_DAYS = 7
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

const byWhen = (a: Booking, b: Booking) => a.date.localeCompare(b.date) || timeMinutes(a.time) - timeMinutes(b.time)

export interface Groups {
  waiting: Booking[] // New: needs Confirm or Decline
  today: Booking[] // Confirmed for today
  upcoming: Booking[] // Confirmed, after today
  unmarked: Booking[] // Confirmed, day passed, not yet marked Attended / No-show
  nextWeek: number // Confirmed from today through the next 6 days
}

export function groupBookings(bookings: Booking[], today: string): Groups {
  const confirmed = bookings.filter((b) => b.status === 'Confirmed').sort(byWhen)
  const weekEnd = addDays(today, WEEK_DAYS - 1)
  return {
    waiting: bookings.filter((b) => b.status === 'New').sort(byWhen),
    today: confirmed.filter((b) => b.date === today),
    upcoming: confirmed.filter((b) => b.date > today),
    unmarked: confirmed.filter((b) => b.date < today),
    nextWeek: confirmed.filter((b) => b.date >= today && b.date <= weekEnd).length,
  }
}

const dayFormat = new Intl.DateTimeFormat('en-GB', {weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC'})

/** "2026-10-28" → "Wed 28 Oct"; text the Sheet holds in another shape is shown as it is. */
export function formatDay(iso: string): string {
  const ms = Date.parse(`${iso}T00:00:00Z`)
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) && !Number.isNaN(ms) ? dayFormat.format(ms) : iso
}

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
