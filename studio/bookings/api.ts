// Talks to the site's bookings function (client/api/bookings.ts). Booking data lives only in
// the private Google Sheet; the Studio reads it through the function and never stores it.
// Every call carries the signed-in user's Sanity token, which the function checks with Sanity.

/** As client/api/_dashboard.ts sends it. */
export interface Booking {
  id: string
  received: string
  status: string
  name: string
  phone: string
  email: string
  concern: string
  session: string
  format: string
  date: string // YYYY-MM-DD
  time: string
  message: string
  notes: string
}

export interface BookingsResponse {
  today: string // YYYY-MM-DD in Dhaka
  bookings: Booking[]
}

export type NextStatus = 'Confirmed' | 'Declined' | 'Attended' | 'No-show'

export type ApiErrorKind =
  | 'config' // SANITY_STUDIO_BOOKINGS_API is not set
  | 'token' // this Studio session holds no token to send
  | 'denied' // 401 / 403
  | 'network' // no answer at all
  | 'gone' // 404: the row left the Sheet
  | 'rejected' // 400: the change isn't allowed from the row's current status
  | 'not-connected' // 503 from a function with no Sheet configured yet
  | 'server' // 5xx and anything else

export class ApiError extends Error {
  constructor(
    readonly kind: ApiErrorKind,
    message: string,
  ) {
    super(message)
  }
}

// The deployed Studio lives on the site (/studio), so the function is same-origin by default;
// `sanity dev` on localhost sets the full address in studio/.env.
export const BOOKINGS_API = process.env.SANITY_STUDIO_BOOKINGS_API || '/api/bookings'

async function call<T>(token: string | undefined, init: RequestInit = {}): Promise<T> {
  if (!BOOKINGS_API) throw new ApiError('config', 'The bookings address is not set (SANITY_STUDIO_BOOKINGS_API).')
  if (!token) throw new ApiError('token', 'This Studio session has no sign-in token. Sign out, then sign in again.')
  let res: Response
  try {
    res = await fetch(BOOKINGS_API, {
      ...init,
      headers: {...init.headers, Authorization: `Bearer ${token}`},
      cache: 'no-store',
    })
  } catch {
    throw new ApiError('network', 'Could not reach the bookings service. Check the connection and try again.')
  }
  const body = (await res.json().catch(() => ({}))) as {error?: string; code?: string}
  if (res.ok) return body as T
  const message = body.error ?? `The bookings service answered ${res.status}.`
  if (body.code === 'not-connected') throw new ApiError('not-connected', message)
  if (res.status === 401 || res.status === 403) throw new ApiError('denied', message)
  if (res.status === 404) throw new ApiError('gone', message)
  if (res.status === 400) throw new ApiError('rejected', message)
  throw new ApiError('server', message)
}

export const fetchBookings = (token: string | undefined) => call<BookingsResponse>(token)

export const setStatus = (token: string | undefined, id: string, status: NextStatus) =>
  call<{id: string; status: NextStatus}>(token, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({id, status}),
  })
