// Dashboard figures, all counted from the real appointments.
import { timeValue } from '../ui/format';
import { addDays, localIso, type Appointment } from '../appointments/types';
import type { TrendRow } from '../charts/TrendChart';
import type { BarRow } from '../charts/BarCharts';

const TREND_WEEKS = 12;

// Requests made per week (by createdAt) over the last 12 weeks, ending today, and how
// many of each week's requests are now confirmed. Oldest week first.
export function weeklyTrend(list: Appointment[], today: string): TrendRow[] {
  const firstStart = addDays(today, -(7 * TREND_WEEKS - 1));
  const made = list.map((a) => ({ day: localIso(new Date(a.createdAt)), confirmed: a.status === 'confirmed' }));
  return Array.from({ length: TREND_WEEKS }, (_, i) => {
    const start = addDays(firstStart, 7 * i);
    const end = addDays(start, 6);
    const inWeek = made.filter((m) => m.day >= start && m.day <= end);
    return { week: start, values: { requests: inWeek.length, confirmed: inWeek.filter((m) => m.confirmed).length } };
  });
}

// minutes after midnight → "10 am", "2:30 pm"
function clockLabel(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h % 12 || 12}${m ? `:${String(m).padStart(2, '0')}` : ''} ${h < 12 ? 'am' : 'pm'}`;
}

// Requested start times: every bookable slot (even unrequested ones), plus any other time
// someone asked for, in clock order.
export function popularTimes(list: Appointment[], slots: string[]): BarRow[] {
  const times = [...new Set([...slots, ...list.map((a) => a.preferredTime)].map(timeValue))]
    .filter((t) => t > 0)
    .sort((a, b) => a - b);
  return times.map((t) => ({ label: clockLabel(t), n: list.filter((a) => timeValue(a.preferredTime) === t).length }));
}

// Requests per area of care, most asked-for first.
export function byArea(list: Appointment[], categories: string[], categoryOf: (service: string) => string | undefined): BarRow[] {
  return categories
    .map((c) => ({ label: c, n: list.filter((a) => categoryOf(a.service) === c).length }))
    .sort((a, b) => b.n - a.n);
}
