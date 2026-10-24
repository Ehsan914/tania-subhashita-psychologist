// Loads the bookings from the bookings function with the signed-in user's Sanity token, and after
// every Confirm / Decline / Attended / No-show reloads from the Sheet rather than guessing the
// result, so what Tania sees is always what the Sheet holds. Shared by both tools.
import {useToast} from '@sanity/ui/toast'
import {useCallback, useEffect, useRef, useState} from 'react'
import {useClient} from 'sanity'
import {ApiError, fetchBookings, setStatus, type Booking, type BookingsResponse, type NextStatus} from './api'

// The token this Studio session signed in with (sanity.config.ts sets loginMethod: 'token').
export const CLIENT_OPTIONS = {apiVersion: '2025-02-07'}

export interface Busy {
  id: string
  status: NextStatus
}

const DONE: Record<NextStatus, (name: string) => string> = {
  Confirmed: (name) => `${name}’s session is confirmed.`,
  Declined: (name) => `${name}’s request was declined.`,
  Attended: (name) => `${name} is marked as attended.`,
  'No-show': (name) => `${name} is marked as a no-show.`,
}

// these mean the list can't be shown at all; anything else is about the one change
const BLOCKING = new Set(['denied', 'token', 'config', 'not-connected'])

const asApiError = (err: unknown) =>
  err instanceof ApiError ? err : new ApiError('server', 'Something went wrong. Try again in a moment.')

export function useBookings() {
  const client = useClient(CLIENT_OPTIONS)
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

  const changeStatus = useCallback(
    async (booking: Booking, status: NextStatus) => {
      setBusy({id: booking.id, status})
      try {
        await setStatus(token(), booking.id, status)
        toast.push({status: 'success', title: DONE[status](booking.name || 'The client')})
      } catch (err) {
        const apiError = asApiError(err)
        if (BLOCKING.has(apiError.kind)) setError(apiError)
        else toast.push({status: 'error', title: 'Not changed', description: apiError.message})
      } finally {
        setBusy(undefined)
      }
      await load()
    },
    [load, toast, token],
  )

  return {data, error, loading, busy, reload: load, changeStatus}
}
