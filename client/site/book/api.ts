// Booking settings and the request itself, against the public API.
import { useEffect, useMemo, useState } from 'react';
import { API } from '../../hooks/useApi';
import { parseSettings, type BookingOptions, type BookingSettings } from './booking';

// Loads /api/booking-settings once; the seed defaults stand in until it answers.
export function useBookingOptions(): BookingOptions {
  const [settings, setSettings] = useState<BookingSettings | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API}/api/booking-settings`, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() as Promise<BookingSettings | null> : null))
      .then((data) => { if (data) setSettings(data); })
      // The defaults keep the form usable; the request itself still reports errors.
      .catch(() => {});
    return () => controller.abort();
  }, []);

  return useMemo(() => parseSettings(settings), [settings]);
}

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
}

export type BookingResult = { ok: true; id: string } | { ok: false; error: string };

const GENERIC_ERROR = "Your request couldn't be sent. Please try again in a moment.";
const NETWORK_ERROR = "Your request couldn't be sent. Please check your connection and try again.";

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
    res = await fetch(`${API}/api/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    return { ok: false, error: NETWORK_ERROR };
  }
  if (!res.ok) return { ok: false, error: await errorMessage(res) };
  try {
    const appointment = await res.json() as { id?: unknown };
    return { ok: true, id: typeof appointment.id === 'string' ? appointment.id : '' };
  } catch {
    return { ok: true, id: '' };
  }
}
