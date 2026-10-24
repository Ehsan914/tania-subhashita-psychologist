// The booking request, sent to the site's own function (api/book.ts), which adds it to
// the bookings Sheet.

export interface BookingPayload {
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  service: string;
  sessionType: string;
  format: string;
  preferredDate: string;
  preferredTime: string;
  message: string;
  website: string; // honeypot: hidden from people, so only bots fill it
}

// saved: the row is in the Sheet. unsaved: our side failed (503), so the visitor is sent to
// WhatsApp anyway and the request still reaches Tania. error: the visitor can fix and resend.
export type BookingResult =
  | { status: 'saved'; id: string }
  | { status: 'unsaved' }
  | { status: 'error'; error: string };

const GENERIC_ERROR = "Your request couldn't be sent. Please try again in a moment.";
const NETWORK_ERROR = "Your request couldn't be sent. Please check your connection and try again.";
const UNAVAILABLE = 503;

async function errorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json() as { error?: unknown };
    return typeof body.error === 'string' && body.error ? body.error : GENERIC_ERROR;
  } catch {
    return GENERIC_ERROR;
  }
}

export async function submitBooking(payload: BookingPayload): Promise<BookingResult> {
  let res: Response;
  try {
    res = await fetch('/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    return { status: 'error', error: NETWORK_ERROR };
  }
  if (res.status === UNAVAILABLE) return { status: 'unsaved' };
  if (!res.ok) return { status: 'error', error: await errorMessage(res) };
  try {
    const booking = await res.json() as { id?: unknown };
    return { status: 'saved', id: typeof booking.id === 'string' ? booking.id : '' };
  } catch {
    return { status: 'saved', id: '' };
  }
}
