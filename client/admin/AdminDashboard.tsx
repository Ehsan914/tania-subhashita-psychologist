// Dashboard (design: admin/index.html): what needs a reply first, then today's sessions,
// then the website at a glance. Every figure is counted from the real appointments.
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAdminData } from '../hooks/useApi';
import { Icon } from './ui/icons';
import { timeValue } from './ui/format';
import { useAppointments } from './appointments/useAppointments';
import { useServiceLookup } from './appointments/useServiceLookup';
import { addDays, localIso, type Appointment } from './appointments/types';
import TrendChart, { type TrendSeries } from './charts/TrendChart';
import RingChart from './charts/RingChart';
import { Columns, HBars } from './charts/BarCharts';
import { colorVar } from './charts/color';
import PendingRequests from './dashboard/PendingRequests';
import { ContentCard, TodayCard, type ContentCount } from './dashboard/SideCards';
import { byArea, popularTimes, weeklyTrend } from './dashboard/stats';
import { usePageMeta } from '../hooks/usePageMeta';

const TREND: TrendSeries[] = [
  { k: 'requests', label: 'Requests', c: 'var(--accent)' },
  { k: 'confirmed', label: 'Confirmed', c: 'var(--ok)' },
];
// charts animate in once; later updates (a confirm or decline) just change in place
const SETTLE_MS = 1600;

interface DashboardCounts {
  servicesCount?: number;
  programsCount?: number;
  blogPostsCount?: number;
  testimonialsCount?: number;
  faqsCount?: number;
  galleryCount?: number;
}

const contentCounts = (c: DashboardCounts): ContentCount[] => [
  { label: 'Services', n: c.servicesCount ?? 0, to: '/admin/services' },
  { label: 'Programs', n: c.programsCount ?? 0, to: '/admin/programs' },
  { label: 'Journal posts', n: c.blogPostsCount ?? 0, to: '/admin/blog' },
  { label: 'Testimonials', n: c.testimonialsCount ?? 0, to: '/admin/testimonials' },
  { label: 'FAQs', n: c.faqsCount ?? 0, to: '/admin/faq' },
  { label: 'Gallery photos', n: c.galleryCount ?? 0, to: '/admin/gallery' },
];

const byWhen = (a: Appointment, b: Appointment) =>
  a.preferredDate.localeCompare(b.preferredDate) || timeValue(a.preferredTime) - timeValue(b.preferredTime);

function greeting() {
  const hour = new Date().getHours();
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
}

export default function AdminDashboard() {
  usePageMeta('Dashboard · Admin');
  const { user } = useAuth();
  const { appointments: all, loading, error, setStatus } = useAppointments();
  const services = useServiceLookup();
  const counts = useAdminData<DashboardCounts>('dashboard', {});
  const booking = useAdminData<{ timeSlots?: string }>('booking-settings', {});
  const ready = !loading && !services.loading && !counts.loading && !booking.loading;
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => setSettled(true), SETTLE_MS);
    return () => clearTimeout(t);
  }, [ready]);

  const today = localIso(new Date());
  const view = useMemo(() => {
    const weekEnd = addDays(today, 6);
    const pending = all.filter((a) => a.status === 'pending').sort(byWhen);
    const confirmed = all.filter((a) => a.status === 'confirmed');
    const slots = (booking.data.timeSlots ?? '').split('\n').map((s) => s.trim()).filter(Boolean);
    return {
      pending,
      confirmed,
      cancelled: all.filter((a) => a.status === 'cancelled').length,
      todays: confirmed.filter((a) => a.preferredDate === today).sort(byWhen),
      week: confirmed.filter((a) => a.preferredDate >= today && a.preferredDate <= weekEnd).length,
      trend: weeklyTrend(all, today),
      areas: byArea(all, services.categories, services.categoryOf),
      times: popularTimes(all, slots),
      online: all.filter((a) => a.format === 'online').length,
    };
  }, [all, today, services, booking.data]);

  const content = contentCounts(counts.data);
  const published = content.reduce((n, c) => n + c.n, 0);
  const firstName = (user?.name ?? '').split(' ')[0];
  const { pending, todays } = view;

  const header = (
    <div className="ph">
      <div>
        <h1>{greeting()}{firstName && `, ${firstName}`}.</h1>
        <p>
          {!ready ? 'Gathering the latest requests…'
            : pending.length ? `${pending.length} ${pending.length === 1 ? 'person is' : 'people are'} waiting to hear back about a session.`
              : 'Nobody is waiting on a reply. Everything is up to date.'}
        </p>
      </div>
      <div className="actions"><Link className="abtn primary" to="/admin/appointments"><Icon name="cal" />All appointments</Link></div>
    </div>
  );

  if (!ready) return header;
  const failure = error ? { what: 'appointments', why: error }
    : counts.error || booking.error ? { what: 'the dashboard', why: counts.error || booking.error } : null;
  if (failure) {
    return <>{header}<section className="card"><div className="empty" role="alert"><strong>Couldn't load {failure.what}</strong>{failure.why}</div></section></>;
  }

  return (
    <div className={settled ? 'settled' : undefined}>
      {header}

      <div className="kpis">
        <Link className="card kpi hot" to="/admin/appointments?status=pending">
          <p className="k"><Icon name="clock" />Waiting for a reply</p><p className="v">{pending.length}</p><p className="s">New booking requests</p>
        </Link>
        <div className="card kpi">
          <p className="k"><Icon name="cal" />Sessions today</p><p className="v">{todays.length}</p>
          <p className="s">{todays.length ? `Next at ${todays[0].preferredTime}` : 'A free day'}</p>
        </div>
        <div className="card kpi"><p className="k"><Icon name="check" />Next 7 days</p><p className="v">{view.week}</p><p className="s">Confirmed sessions</p></div>
        <div className="card kpi"><p className="k"><Icon name="layers" />On the website</p><p className="v">{published}</p><p className="s">Published items</p></div>
      </div>

      <div className="charts">
        <section className="card" aria-labelledby="trend-h">
          <div className="hd">
            <div><h2 id="trend-h">Booking requests</h2><p>Last 12 weeks</p></div>
            <ul className="legend">{TREND.map((s) => <li key={s.k} style={colorVar(s.c)}><i /><span>{s.label}</span></li>)}</ul>
          </div>
          <div className="bd"><TrendChart rows={view.trend} series={TREND} /></div>
        </section>
        <section className="card" aria-labelledby="status-h">
          <div className="hd"><div><h2 id="status-h">Where requests stand</h2><p>All appointments</p></div></div>
          <div className="bd">
            <RingChart caption="requests" parts={[
              { label: 'Confirmed', n: view.confirmed.length, c: 'var(--ok)' },
              { label: 'Pending', n: pending.length, c: 'var(--gold)' },
              { label: 'Cancelled', n: view.cancelled, c: 'var(--muted)' },
            ]} />
          </div>
        </section>
      </div>

      <div className="dash">
        <PendingRequests pending={pending} serviceName={services.nameOf} onStatus={setStatus} />
        <div className="stack">
          <TodayCard today={today} sessions={todays} />
          <ContentCard counts={content} />
        </div>
      </div>

      <div className="charts three">
        <section className="card" aria-labelledby="area-h">
          <div className="hd"><div><h2 id="area-h">What people ask for</h2><p>Requests by area of care</p></div></div>
          <div className="bd"><HBars rows={view.areas} /></div>
        </section>
        <section className="card" aria-labelledby="format-h">
          <div className="hd"><div><h2 id="format-h">Online or in person</h2><p>How people prefer to meet</p></div></div>
          <div className="bd">
            <RingChart pie parts={[
              { label: 'In person', n: all.length - view.online, c: 'var(--accent)' },
              { label: 'Online', n: view.online, c: 'var(--night)' },
            ]} />
          </div>
        </section>
        <section className="card" aria-labelledby="times-h">
          <div className="hd"><div><h2 id="times-h">Popular times</h2><p>Requested start times</p></div></div>
          <div className="bd"><Columns rows={view.times} /></div>
        </section>
      </div>
    </div>
  );
}
