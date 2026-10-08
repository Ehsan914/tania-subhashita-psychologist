// Booking logic for the Book page: settings parsing, the day strip, validation and the
// WhatsApp hand-off. Kept free of React so the page only wires state to markup.
import type { ServiceData } from '../../context/SiteDataContext';

export interface BookingSettings {
  whatsappNumber: string;
  timeSlots: string;
  sessionDurations: string;
  introText: string;
}

export interface BookingOptions {
  whatsappNumber: string;
  timeSlots: string[];
  sessionDurations: string[];
  introText: string;
}

// The design's options, used until booking settings are saved in the admin.
const FALLBACK_WHATSAPP = '8801580700700';
const FALLBACK_SLOTS = '10:00 am\n11:00 am\n2:00 pm\n4:00 pm\n6:00 pm\n7:00 pm';
const FALLBACK_DURATIONS = '20-min intro (Free)\n60-min session (Standard)';

const lines = (value: string | undefined, fallback: string) => {
  const parsed = (value ?? '').split('\n').map((x) => x.trim()).filter(Boolean);
  return parsed.length > 0 ? parsed : fallback.split('\n');
};

export function parseSettings(settings: BookingSettings | null): BookingOptions {
  return {
    whatsappNumber: (settings?.whatsappNumber ?? '').replace(/\D/g, '') || FALLBACK_WHATSAPP,
    timeSlots: lines(settings?.timeSlots, FALLBACK_SLOTS),
    sessionDurations: lines(settings?.sessionDurations, FALLBACK_DURATIONS),
    introText: settings?.introText?.trim() ?? '',
  };
}

// "20-min intro (Free)" → label "20-min intro", sub "Free".
export function splitDuration(duration: string): { label: string; sub?: string } {
  const match = /^(.*?)\s*\(([^)]+)\)\s*$/.exec(duration);
  return match ? { label: match[1], sub: match[2] } : { label: duration };
}

export const isFreeSession = (duration: string, durations: string[]) =>
  durations.some((d) => /free/i.test(d)) ? /free/i.test(duration) : duration === durations[0];

// The design pre-selects the fourth time; fewer slots fall back to the last one.
const DEFAULT_SLOT_INDEX = 3;
export const defaultSlot = (slots: string[]) => slots[Math.min(DEFAULT_SLOT_INDEX, slots.length - 1)] ?? '';

export function defaultSession(durations: string[], wantsFull: boolean): string {
  if (!wantsFull) return durations[0] ?? '';
  return durations.find((d) => !isFreeSession(d, durations)) ?? durations[0] ?? '';
}

// ── day strip: the next 12 days, starting tomorrow, so no past day is ever offered ──
const DAYS_AHEAD = 12;
const FIRST_OFFSET = 1;
export const DEFAULT_DAY_INDEX = 1;

export interface BookingDay {
  iso: string; // YYYY-MM-DD in the visitor's calendar, as /api/book expects
  weekday: string;
  date: number;
  month: string;
  long: string;
}

const fmtDay = new Intl.DateTimeFormat('en-GB', { weekday: 'short' });
const fmtMonth = new Intl.DateTimeFormat('en-GB', { month: 'short' });
const fmtLong = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
const pad = (n: number) => String(n).padStart(2, '0');

export function upcomingDays(from = new Date()): BookingDay[] {
  return Array.from({ length: DAYS_AHEAD }, (_, i) => {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + FIRST_OFFSET + i);
    return {
      iso: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      weekday: fmtDay.format(d),
      date: d.getDate(),
      month: fmtMonth.format(d),
      long: fmtLong.format(d),
    };
  });
}

// ── services, grouped like the Therapies page ──
const CATEGORY_ORDER = ['Mood & Emotion', 'Self & Relationships', 'Addiction & Behavior', 'Specialized Care'];

export function groupServices(services: ServiceData[]): { category: string; items: ServiceData[] }[] {
  const extra = services.map((s) => s.category).filter((c) => !CATEGORY_ORDER.includes(c));
  const categories = [...new Set([...CATEGORY_ORDER, ...extra])];
  return categories
    .map((category) => ({ category, items: services.filter((s) => s.category === category) }))
    .filter((group) => group.items.length > 0);
}

// ── format ──
export type BookingFormat = 'in-person' | 'online';

export const formatLabel = (format: BookingFormat, clinic: string) =>
  format === 'online' ? 'Online, Zoom or Meet' : `In person, ${clinic || 'MIND CARE'}`;

// ── the visitor's details ──
export interface ClientDetails {
  name: string;
  phone: string;
  email: string;
  message: string;
}

export type DetailField = 'name' | 'phone' | 'email';
export type DetailErrors = Partial<Record<DetailField, boolean>>;

export const DETAIL_FIELDS: DetailField[] = ['name', 'phone', 'email'];
const PHONE_PATTERN = /^[+0-9 ()-]{8,}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateDetails(d: ClientDetails): DetailErrors {
  const errors: DetailErrors = {};
  if (!d.name.trim()) errors.name = true;
  if (!PHONE_PATTERN.test(d.phone.trim())) errors.phone = true;
  if (d.email.trim() && !EMAIL_PATTERN.test(d.email.trim())) errors.email = true;
  return errors;
}

// ── the request as shown in the summary, the confirmation and on WhatsApp ──
export interface BookingChoice {
  service: string; // display name
  session: string;
  format: string; // display label
  day: string; // long date
  time: string;
}

export function whatsappLink(number: string, choice: BookingChoice, d: ClientDetails): string {
  const text = [
    'New appointment request — MIND CARE',
    '',
    `Name: ${d.name}`,
    `Phone: ${d.phone}`,
    d.email ? `Email: ${d.email}` : null,
    `Therapy: ${choice.service}`,
    `Day: ${choice.day}`,
    `Time: ${choice.time}`,
    `Where: ${choice.format}`,
    `Session: ${choice.session}`,
    d.message ? `Message: ${d.message}` : null,
  ].filter((l): l is string => l !== null).join('\n');
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
