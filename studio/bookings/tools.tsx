// The two Studio tools: each wires the shared bookings hook, the signed-in user and the Studio's
// router into its plain view. Nothing here is stored in Sanity.
import {useCallback, useEffect, useState, type MouseEvent} from 'react'
import {useClient, useCurrentUser} from 'sanity'
import {useRouter} from 'sanity/router'
import {AppointmentsView} from './AppointmentsView'
import {DashboardView, type LinkProps} from './DashboardView'
import {AdminRoot} from './shell'
import {CLIENT_OPTIONS, useBookings} from './useBookings'

export const DASHBOARD = 'dashboard'
export const APPOINTMENTS = 'appointments'

// "On the website": published services, programs, posts and FAQs that the site shows. The
// published perspective leaves drafts out; isVisible != false leaves out what Tania has hidden.
const PUBLISHED_TYPES = ['service', 'program', 'post', 'faq']
const PUBLISHED_QUERY = 'count(*[_type in $types && isVisible != false])'

function usePublishedCount(): number | undefined {
  const client = useClient(CLIENT_OPTIONS)
  const [count, setCount] = useState<number>()
  useEffect(() => {
    let live = true
    client
      .fetch<number>(PUBLISHED_QUERY, {types: PUBLISHED_TYPES}, {perspective: 'published'})
      .then((n) => live && setCount(n))
      // the card shows "–" rather than a number it couldn't check
      .catch(() => live && setCount(undefined))
    return () => {
      live = false
    }
  }, [client])
  return count
}

const isPlainClick = (e: MouseEvent) => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey

/**
 * Links from one tool to another. A tool's router is scoped to the tool itself, so the other
 * tool's path is worked out from this one's: "/studio/dashboard" → "/studio/appointments/BK-…".
 */
function useToolLink(self: string) {
  const router = useRouter()
  const own = router.resolvePathFromState({})
  const cut = own.lastIndexOf(`/${self}`)
  const base = cut >= 0 ? own.slice(0, cut) : own.replace(/\/+$/, '')
  const {navigateUrl} = router
  return useCallback(
    (tool: string, sub?: string): LinkProps => {
      const href = `${base}/${tool}${sub ? `/${encodeURIComponent(sub)}` : ''}`
      return {
        href,
        onClick: (e) => {
          if (!isPlainClick(e)) return // a new tab or window follows the href
          e.preventDefault()
          navigateUrl({path: href})
        },
      }
    },
    [base, navigateUrl],
  )
}

const firstName = (name?: string) => name?.trim().split(/\s+/)[0] || undefined

export function DashboardTool() {
  const user = useCurrentUser()
  const {data, error, loading, busy, reload, changeStatus} = useBookings()
  const published = usePublishedCount()
  const link = useToolLink(DASHBOARD)
  return (
    <AdminRoot>
      <DashboardView
        firstName={firstName(user?.name)}
        userId={user?.id}
        data={data}
        error={error}
        loading={loading}
        published={published}
        busy={busy}
        linkToAppointments={(id) => link(APPOINTMENTS, id)}
        onRetry={() => void reload()}
        onSetStatus={(booking, status) => void changeStatus(booking, status)}
      />
    </AdminRoot>
  )
}

export function AppointmentsTool() {
  const user = useCurrentUser()
  const router = useRouter()
  const {data, error, loading, busy, reload, changeStatus} = useBookings()
  // The open booking lives in the URL (/appointments/BK-…), so Back closes the panel.
  const openId = typeof router.state.id === 'string' ? router.state.id : undefined
  const {navigate} = router
  const onOpen = useCallback((id?: string) => navigate(id ? {id} : {}), [navigate])
  return (
    <AdminRoot>
      <AppointmentsView
        userId={user?.id}
        data={data}
        error={error}
        loading={loading}
        busy={busy}
        openId={openId}
        onOpen={onOpen}
        onRetry={() => void reload()}
        onSetStatus={(booking, status) => void changeStatus(booking, status)}
      />
    </AdminRoot>
  )
}
