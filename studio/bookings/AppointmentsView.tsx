// The Appointments page of the admin design (design-demo/calm-elegant/admin/appointments.html):
// status tabs with counts, search and date filter, a sortable table that stacks on a phone, and
// a side panel per booking. Plain props → markup; the filters are this page's own state.
import {Fragment, useEffect, useMemo, useState, type KeyboardEvent} from 'react'
import type {ApiError, Booking, BookingsResponse, NextStatus} from './api'
import {Icon} from './icons'
import {Notice} from './shell'
import {byWhen, formatDay, formatStamp, NEXT, PILL, STATUSES, whatsappLink} from './sort'
import type {Busy} from './useBookings'

export interface AppointmentsViewProps {
  userId?: string
  data?: BookingsResponse
  error?: ApiError
  loading: boolean
  busy?: Busy
  openId?: string // the booking whose panel is open
  onOpen: (id?: string) => void // undefined closes the panel
  onRetry: () => void
  onSetStatus: (booking: Booking, status: NextStatus) => void
}

type Tab = 'all' | (typeof STATUSES)[number]
type SortKey = 'client' | 'date' | 'requested'

const SORTS: Record<SortKey, (a: Booking, b: Booking) => number> = {
  client: (a, b) => a.name.localeCompare(b.name),
  date: byWhen,
  requested: (a, b) => a.received.localeCompare(b.received),
}

function Pill({status}: {status: string}) {
  return <span className={`pill ${PILL[status] ?? 'off'}`}>{status || 'No status'}</span>
}

export function AppointmentsView(props: AppointmentsViewProps) {
  const {data, error, loading, openId, onOpen} = props
  const [tab, setTab] = useState<Tab>('all')
  const [q, setQ] = useState('')
  const [date, setDate] = useState('')
  // latest session first: with every row listed, the newest are the ones that need Tania
  const [sort, setSort] = useState<{key: SortKey; dir: 1 | -1}>({key: 'date', dir: -1})
  const all = useMemo(() => data?.bookings ?? [], [data])

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return all
      .filter((b) => tab === 'all' || b.status === tab)
      .filter((b) => !date || b.date === date)
      .filter((b) => !needle || [b.name, b.phone, b.email, b.concern].join(' ').toLowerCase().includes(needle))
      .sort((a, b) => SORTS[sort.key](a, b) * sort.dir)
  }, [all, tab, date, q, sort])

  const count = (t: Tab) => all.filter((b) => t === 'all' || b.status === t).length
  const filtered = Boolean(q || date)
  const open = openId ? all.find((b) => b.id === openId) : undefined

  const th = (key: SortKey, label: string) => {
    const active = sort.key === key
    return (
      <th aria-sort={active ? (sort.dir > 0 ? 'ascending' : 'descending') : undefined}>
        <button type="button" onClick={() => setSort({key, dir: active ? (sort.dir > 0 ? -1 : 1) : 1})}>
          {label}
          <Icon name={active ? (sort.dir > 0 ? 'up' : 'down') : 'sort'} />
        </button>
      </th>
    )
  }

  const onRowKey = (event: KeyboardEvent<HTMLTableRowElement>, id: string) => {
    if (event.target !== event.currentTarget || (event.key !== 'Enter' && event.key !== ' ')) return
    event.preventDefault()
    onOpen(id)
  }

  return (
    <div className="main">
      <div className="inner wide">
        <div className="ph">
          <div>
            <h1>Appointments</h1>
            <p>Booking requests from the website. Reply on WhatsApp, then set the status here so the bookings Sheet shows the same picture.</p>
          </div>
        </div>

        {error && <Notice error={error} userId={props.userId} onRetry={props.onRetry} />}

        <div className="toolbar">
          <div className="tabs" role="tablist" aria-label="Filter by status">
            {(['all', ...STATUSES] as Tab[]).map((t) => (
              <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)}>
                {t === 'all' ? 'All' : t}
                <span className="n">{count(t)}</span>
              </button>
            ))}
          </div>
          <span className="grow" />
          <label className="search">
            <span className="visually-hidden">Search appointments</span>
            <Icon name="search" />
            <input className="in" type="search" placeholder="Name, phone or concern" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          <label>
            <span className="visually-hidden">Preferred date</span>
            <input className="in" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          {filtered && (
            <button className="btn ghost sm" type="button" onClick={() => { setQ(''); setDate('') }}>
              Clear filters
            </button>
          )}
        </div>

        <section className="card">
          <div className="table-wrap">
            {rows.length ? (
              <table className="t stackable">
                <thead>
                  <tr>
                    {th('client', 'Client')}
                    <th>Concern</th>
                    {th('date', 'Session')}
                    <th>Format</th>
                    <th>Status</th>
                    {th('requested', 'Requested')}
                    <th><span className="visually-hidden">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((b) => (
                    <tr key={b.id} tabIndex={0} aria-label={`Open ${b.name || b.id}`} onClick={() => onOpen(b.id)} onKeyDown={(e) => onRowKey(e, b.id)}>
                      <td className="who">
                        <strong>{b.name || 'No name given'}</strong>
                        <small className="num">{b.phone}</small>
                      </td>
                      <td data-l="Concern">
                        {b.concern}
                        {b.session && <><br /><small className="tag">{b.session}</small></>}
                      </td>
                      <td className="num" data-l="Session">
                        {formatDay(b.date)}
                        <br />
                        <small>{b.time}</small>
                      </td>
                      <td data-l="Format">{b.format}</td>
                      <td><Pill status={b.status} /></td>
                      <td className="num" data-l="Requested">{formatStamp(b.received)}</td>
                      <td className="row-actions" onClick={(e) => e.stopPropagation()}>
                        <RowActions booking={b} {...props} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty">
                <strong>{!data && loading ? 'Loading…' : 'Nothing here'}</strong>
                {!data && loading ? 'Reading the bookings Sheet.' : filtered ? 'No appointments match these filters.' : 'No appointments with this status yet.'}
              </div>
            )}
          </div>
        </section>
      </div>
      {open && <Panel booking={open} {...props} />}
    </div>
  )
}

function StatusButtons({booking: b, busy, onSetStatus}: {booking: Booking} & Pick<AppointmentsViewProps, 'busy' | 'onSetStatus'>) {
  return (
    <>
      {(NEXT[b.status] ?? []).map((a) => {
        const working = busy?.id === b.id && busy.status === a.status
        return (
          <button key={a.status} className={`btn sm ${a.primary ? 'ok' : 'ghost'}`} type="button" disabled={Boolean(busy)} onClick={() => onSetStatus(b, a.status)}>
            {working ? <span className="spin" aria-hidden="true" /> : a.primary && <Icon name="check" />}
            {a.text}
          </button>
        )
      })}
    </>
  )
}

function RowActions(props: {booking: Booking} & AppointmentsViewProps) {
  const chat = whatsappLink(props.booking.phone)
  return (
    <>
      {chat && (
        <a className="icon-btn" href={chat} target="_blank" rel="noopener noreferrer" title="WhatsApp" aria-label={`Message ${props.booking.name} on WhatsApp`}>
          <Icon name="chat" />
        </a>
      )}
      <StatusButtons {...props} />
    </>
  )
}

// The side panel: everything the Sheet holds for one booking, the ways to reach the client, and
// the status changes allowed from where it stands. Notes are edited in the Sheet itself.
function Panel({booking: b, onOpen, ...props}: {booking: Booking} & AppointmentsViewProps) {
  const close = () => onOpen(undefined)
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onOpen(undefined)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onOpen])
  const chat = whatsappLink(b.phone)
  const phoneDigits = b.phone.replace(/[^\d+]/g, '')
  const rows: [string, string][] = [
    ['Concern', b.concern],
    ['Date', formatDay(b.date)],
    ['Time', b.time],
    ['Session', b.session],
    ['Format', b.format],
    ['Phone', b.phone],
    ['Email', b.email],
  ]
  return (
    <>
      <div className="overlay" onClick={close} />
      <div className="drawer" role="dialog" aria-modal="true" aria-labelledby="panel-h">
        <div className="hd">
          <div>
            <h2 id="panel-h">{b.name || 'No name given'}</h2>
            <p>Requested {formatStamp(b.received)}</p>
          </div>
          {/* a dialog moves focus into itself */}
          <button className="icon-btn" type="button" aria-label="Close" onClick={close} autoFocus>
            <Icon name="x" />
          </button>
        </div>
        <div className="bd">
          <div className="quick">
            {chat && (
              <a className="btn primary sm" href={chat} target="_blank" rel="noopener noreferrer"><Icon name="chat" />WhatsApp</a>
            )}
            {phoneDigits && <a className="btn ghost sm" href={`tel:${phoneDigits}`}><Icon name="phone" />Call</a>}
            {b.email && <a className="btn ghost sm" href={`mailto:${b.email}`}><Icon name="mail" />Email</a>}
          </div>
          <p className="sec-label">Status</p>
          <div className="status-now">
            <Pill status={b.status} />
            {NEXT[b.status] && <div className="acts"><StatusButtons booking={b} {...props} /></div>}
          </div>
          <p className="sec-label">Session</p>
          <dl className="dl">
            {rows.map(([label, value]) => (
              <Fragment key={label}>
                <dt>{label}</dt>
                <dd>{value || '—'}</dd>
              </Fragment>
            ))}
          </dl>
          <p className="sec-label">Their message</p>
          <div className="note-box">{b.message || <span className="none">No message left.</span>}</div>
          <p className="sec-label">Your notes</p>
          <div className="note-box">{b.notes || <span className="none">No notes. Add them in the bookings Sheet.</span>}</div>
        </div>
        <div className="ft">
          <button className="btn ghost" type="button" onClick={close}>Close</button>
        </div>
      </div>
    </>
  )
}
