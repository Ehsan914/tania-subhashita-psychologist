// The Dashboard page of the admin design (design-demo/calm-elegant/admin/index.html), as plain
// props → markup so it renders the same with live data, sample data or none at all.
import {useEffect, useRef, useState, type CSSProperties, type MouseEvent} from 'react'
import type {ApiError, Booking, BookingsResponse, NextStatus} from './api'
import {Ring, Trend, type Series} from './charts'
import {Icon} from './icons'
import {Notice} from './shell'
import {dashboardGroups, emptyResponse, formatDay, initials, whatsappLink} from './sort'
import type {Busy} from './useBookings'

/** An in-Studio link: a real href for new tabs, and a click handler that routes in place. */
export interface LinkProps {
  href: string
  onClick: (event: MouseEvent<HTMLAnchorElement>) => void
}

export interface DashboardViewProps {
  firstName?: string
  userId?: string
  data?: BookingsResponse // undefined while loading, or when the bookings can't be read
  error?: ApiError
  loading: boolean
  published?: number // documents on the website; undefined until counted
  busy?: Busy
  linkToAppointments: (id?: string) => LinkProps
  onRetry: () => void
  onSetStatus: (booking: Booking, status: NextStatus) => void
}

const TREND: Series[] = [
  {k: 'requests', label: 'Requests', c: 'var(--accent)'},
  {k: 'confirmed', label: 'Confirmed', c: 'var(--ok)'},
]

const greeting = (hour: number) => (hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening')

function statusLine(waiting: number): string {
  if (waiting === 0) return 'Nobody is waiting on a reply. Everything is up to date.'
  return `${waiting} ${waiting === 1 ? 'person is' : 'people are'} waiting to hear back about a session.`
}

export function DashboardView(props: DashboardViewProps) {
  const {firstName, data, error, loading, published, linkToAppointments} = props
  // Not connected (or any other failure): the full page with nothing in it, under the notice.
  const view = data ?? emptyResponse(new Date())
  const counting = !data && !error && loading
  const groups = dashboardGroups(view.bookings, view.today)
  const value = (n: number) => (counting ? '–' : n)
  const {totals} = view
  return (
    <div className="main">
      <div className="inner">
        <div className="ph">
          <div>
            <h1>
              {greeting(new Date().getHours())}
              {firstName ? `, ${firstName}` : ''}.
            </h1>
            <p>{counting ? 'Loading booking requests…' : error ? 'Booking requests from the website, from the bookings Sheet.' : statusLine(groups.waiting.length)}</p>
          </div>
          <div className="actions">
            <a className="btn primary" {...linkToAppointments()}>
              <Icon name="cal" />
              All appointments
            </a>
          </div>
        </div>

        {error && <Notice error={error} userId={props.userId} onRetry={props.onRetry} />}

        <div className="kpis">
          <a className="card kpi hot" {...linkToAppointments()}>
            <p className="k"><Icon name="clock" />Waiting for a reply</p>
            <p className="v">{value(groups.waiting.length)}</p>
            <p className="s">New booking requests</p>
          </a>
          <div className="card kpi">
            <p className="k"><Icon name="cal" />Sessions today</p>
            <p className="v">{value(groups.today.length)}</p>
            <p className="s">{groups.today[0] ? `Next at ${groups.today[0].time}` : 'A free day'}</p>
          </div>
          <div className="card kpi">
            <p className="k"><Icon name="check" />Next 7 days</p>
            <p className="v">{value(groups.nextWeek)}</p>
            <p className="s">Confirmed sessions</p>
          </div>
          <div className="card kpi">
            <p className="k"><Icon name="layers" />On the website</p>
            <p className="v">{published ?? '–'}</p>
            <p className="s">Published items</p>
          </div>
        </div>

        <div className="charts">
          <section className="card" aria-labelledby="trend-h">
            <div className="hd">
              <div>
                <h2 id="trend-h">Booking requests</h2>
                <p>Last 12 weeks</p>
              </div>
              <ul className="legend">
                {TREND.map((s) => (
                  <li key={s.k} style={{'--c': s.c} as CSSProperties}>
                    <i />
                    <span>{s.label}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bd">
              <TrendBox data={view} />
            </div>
          </section>
          <section className="card" aria-labelledby="status-h">
            <div className="hd">
              <div>
                <h2 id="status-h">Where requests stand</h2>
                <p>All appointments</p>
              </div>
            </div>
            <div className="bd">
              <Ring
                caption="requests"
                parts={[
                  {label: 'Confirmed', n: totals.confirmed, c: 'var(--ok)'},
                  {label: 'Pending', n: totals.pending, c: 'var(--gold)'},
                  {label: 'Cancelled', n: totals.cancelled, c: 'var(--muted)'},
                ]}
              />
            </div>
          </section>
        </div>

        <div className="dash">
          <section className="card" aria-labelledby="req-h">
            <div className="hd">
              <div>
                <h2 id="req-h">Requests waiting for a reply</h2>
                <p>Message them on WhatsApp, then confirm or decline here.</p>
              </div>
            </div>
            {groups.waiting.length ? (
              groups.waiting.map((b) => <RequestRow key={b.id} booking={b} {...props} />)
            ) : (
              <div className="empty">
                <strong>All caught up</strong>
                New requests from the booking form will appear here.
              </div>
            )}
          </section>
          <div className="stack">
            <section className="card" aria-labelledby="today-h">
              <div className="hd">
                <h2 id="today-h">Today</h2>
                <p>{formatDay(view.today)}</p>
              </div>
              {groups.today.length ? (
                groups.today.map((b) => (
                  <a key={b.id} className="day" {...linkToAppointments(b.id)}>
                    <time>{b.time}</time>
                    <div>
                      <strong>{b.name || 'No name given'}</strong>
                      <small>{[b.session, b.format].filter(Boolean).join(' · ')}</small>
                    </div>
                  </a>
                ))
              ) : (
                <div className="empty">
                  <strong>No sessions</strong>
                  Nothing is booked for today.
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

// The trend is drawn at the box's real width, so its axis text never shrinks with the screen.
function TrendBox({data}: {data: BookingsResponse}) {
  const box = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const el = box.current
    if (!el) return
    const observer = new ResizeObserver(() => setWidth(el.clientWidth))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return (
    <div className="chart-box" ref={box}>
      {width > 0 && <Trend rows={data.weeks} series={TREND} width={width} />}
    </div>
  )
}

function RequestRow({booking: b, busy, onSetStatus, linkToAppointments}: {booking: Booking} & DashboardViewProps) {
  const chat = whatsappLink(b.phone)
  const when = b.date && [formatDay(b.date), b.time].filter(Boolean).join(', ')
  const details = [b.concern, when, b.format].filter(Boolean).join(' · ')
  const working = (status: NextStatus) => busy?.id === b.id && busy.status === status
  return (
    <div className="req">
      <span className="avatar" aria-hidden="true">{initials(b.name)}</span>
      <a className="txt" {...linkToAppointments(b.id)}>
        <strong>{b.name || 'No name given'}</strong>
        <small>{details}</small>
      </a>
      <div className="acts">
        {chat && (
          <a className="icon-btn" href={chat} target="_blank" rel="noopener noreferrer" title="Message on WhatsApp" aria-label={`Message ${b.name} on WhatsApp`}>
            <Icon name="chat" />
          </a>
        )}
        <button className="btn ghost sm" type="button" disabled={Boolean(busy)} onClick={() => onSetStatus(b, 'Declined')}>
          {working('Declined') && <span className="spin" aria-hidden="true" />}
          Decline
        </button>
        <button className="btn ok sm" type="button" disabled={Boolean(busy)} onClick={() => onSetStatus(b, 'Confirmed')}>
          {working('Confirmed') ? <span className="spin" aria-hidden="true" /> : <Icon name="check" />}
          Confirm
        </button>
      </div>
    </div>
  )
}
