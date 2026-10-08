// An appointment as GET /api/admin/appointments returns it (server/prisma/schema.prisma).
export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  service: string; // a service slug
  sessionType: string;
  format: string;
  preferredDate: string; // YYYY-MM-DD
  preferredTime: string; // e.g. "2:00 pm"
  message: string;
  status: string;
  psychologistComment: string;
  createdAt: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled';

export const formatLabel = (format: string) => (format === 'online' ? 'Online' : 'In person');

export const errorMessage = (err: unknown) =>
  err instanceof Error ? err.message : 'Something went wrong. Please try again.';

// a date as YYYY-MM-DD in the browser's own time zone (toISOString would give the UTC day)
export function localIso(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// YYYY-MM-DD shifted by a number of days
export function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return localIso(d);
}
