// Formatting helpers shared by the dashboard and appointments pages (admin/assets/admin.js).

export const STATUS: Record<string, string> = { pending: 'Pending', confirmed: 'Confirmed', cancelled: 'Cancelled' };
export const STATUS_KEYS = Object.keys(STATUS);

// "2026-10-08" → "Thu 8 Oct"
export const fmtDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

// a timestamp → "8 Oct 2026"
export const fmtStamp = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export function Pill({ status }: { status: string }) {
  return <span className={`pill ${STATUS[status] ? status : 'off'}`}>{STATUS[status] || status}</span>;
}

// Local Bangladeshi numbers (01…) become wa.me/8801…; numbers already written with a country code stay as they are.
export function waLink(phone: string) {
  const digits = String(phone).replace(/\D/g, '');
  return `https://wa.me/${digits.startsWith('0') ? `88${digits}` : digits}`;
}

// '2:00 pm' → minutes after midnight, so slots sort by the clock rather than as text
export function timeValue(t: string) {
  const m = /(\d+):(\d+)\s*(am|pm)/i.exec(t || '');
  if (!m) return 0;
  return ((Number(m[1]) % 12) + (m[3].toLowerCase() === 'pm' ? 12 : 0)) * 60 + Number(m[2]);
}

export const initials = (name: string) =>
  String(name || '?').split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
