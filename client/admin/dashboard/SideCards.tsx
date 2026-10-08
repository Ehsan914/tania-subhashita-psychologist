// The dashboard's right-hand column: today's confirmed sessions and the website's content counts.
import { Link } from 'react-router-dom';
import { Icon } from '../ui/icons';
import { fmtDate } from '../ui/format';
import { formatLabel, type Appointment } from '../appointments/types';

export function TodayCard({ today, sessions }: { today: string; sessions: Appointment[] }) {
  return (
    <section className="card" aria-labelledby="today-h">
      <div className="hd"><h2 id="today-h">Today</h2><p>{fmtDate(today)}</p></div>
      {sessions.length
        ? sessions.map((a) => (
          <Link key={a.id} className="day" to={`/admin/appointments?id=${encodeURIComponent(a.id)}`}>
            <time>{a.preferredTime}</time>
            <div><strong>{a.clientName}</strong><small>{a.sessionType} · {formatLabel(a.format)}</small></div>
          </Link>
        ))
        : <div className="empty"><strong>No sessions</strong>Nothing is booked for today.</div>}
    </section>
  );
}

export interface ContentCount { label: string; n: number; to: string }

export function ContentCard({ counts }: { counts: ContentCount[] }) {
  return (
    <section className="card" aria-labelledby="site-h">
      <div className="hd">
        <h2 id="site-h">Website content</h2>
        <a className="abtn ghost sm" href="/" target="_blank" rel="noopener noreferrer"><Icon name="ext" />Open</a>
      </div>
      <ul className="counts">
        {counts.map((c) => <li key={c.to}><Link to={c.to}>{c.label}<b>{c.n}</b></Link></li>)}
      </ul>
    </section>
  );
}
