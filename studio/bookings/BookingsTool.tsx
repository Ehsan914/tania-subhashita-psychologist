// The Bookings tool: loads the requests from the bookings function with the signed-in user's
// Sanity token, and after every Confirm / Decline / Attended / No-show reloads from the Sheet
// rather than guessing the result, so what Tania sees is always what the Sheet holds.
import {useToast} from '@sanity/ui/toast'
import {useCallback, useEffect, useRef, useState} from 'react'
import {useClient, useCurrentUser} from 'sanity'
import {ApiError, fetchBookings, setStatus, type Booking, type BookingsResponse, type NextStatus} from './api'
import {BookingsView, type Busy} from './BookingsView'

// The token this Studio session signed in with (sanity.config.ts sets loginMethod: 'token').
const CLIENT_OPTIONS = {apiVersion: '2025-02-07'}

const DONE: Record<NextStatus, (name: string) => string> = {
  Confirmed: (name) => `${name}’s session is confirmed.`,
  Declined: (name) => `${name}’s request was declined.`,
  Attended: (name) => `${name} is marked as attended.`,
  'No-show': (name) => `${name} is marked as a no-show.`,
}

const asApiError = (err: unknown) =>
  err instanceof ApiError ? err : new ApiError('server', 'Something went wrong. Try again in a moment.')

export function BookingsTool() {
  const client = useClient(CLIENT_OPTIONS)
  const user = useCurrentUser()
  const toast = useToast()
  const [data, setData] = useState<BookingsResponse>()
  const [error, setError] = useState<ApiError>()
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<Busy>()
  const latest = useRef(0)

  const token = useCallback(() => client.config().token, [client])

  const load = useCallback(async () => {
    const request = ++latest.current
    setLoading(true)
    try {
      const next = await fetchBookings(token())
      if (request !== latest.current) return
      setData(next)
      setError(undefined)
    } catch (err) {
      if (request !== latest.current) return
      setError(asApiError(err))
      // a refused or unreachable list must not leave the old one up as if current
      setData(undefined)
    } finally {
      if (request === latest.current) setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void load()
  }, [load])

  const onSetStatus = useCallback(
    async (booking: Booking, status: NextStatus) => {
      setBusy({id: booking.id, status})
      try {
        await setStatus(token(), booking.id, status)
        toast.push({status: 'success', title: DONE[status](booking.name || 'The client')})
      } catch (err) {
        const apiError = asApiError(err)
        if (apiError.kind === 'denied' || apiError.kind === 'token' || apiError.kind === 'config') setError(apiError)
        else toast.push({status: 'error', title: 'Not changed', description: apiError.message})
      } finally {
        setBusy(undefined)
      }
      await load()
    },
    [load, toast, token],
  )

  return (
    <BookingsView
      firstName={user?.name?.split(/\s+/)[0]}
      userId={user?.id}
      data={data}
      error={error}
      loading={loading}
      busy={busy}
      onRefresh={() => void load()}
      onSetStatus={(booking, status) => void onSetStatus(booking, status)}
    />
  )
}
