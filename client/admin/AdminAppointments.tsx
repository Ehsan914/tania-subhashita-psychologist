// Appointments (design: admin/appointments.html): status tabs with counts, search and a
// date filter, a sortable table, and a side panel per appointment.
// Deep links: ?status=pending picks the tab, ?id=… opens that appointment's panel.
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Icon } from './ui/icons';
import { STATUS, timeValue } from './ui/format';
import { useAppointments } from './appointments/useAppointments';
import { useServiceLookup } from './appointments/useServiceLookup';
import AppointmentsTable, { type Sort, type SortKey } from './appointments/AppointmentsTable';
import AppointmentDrawer from './appointments/AppointmentDrawer';
import type { Appointment } from './appointments/types';
import { usePageMeta } from '../hooks/usePageMeta';

const TABS = ['all', 'pending', 'confirmed', 'cancelled'] as const;
type Tab = typeof TABS[number];

const SORTS: Record<SortKey, (a: Appointment, b: Appointment) => number> = {
  client: (a, b) => a.clientName.localeCompare(b.clientName),
  date: (a, b) => a.preferredDate.localeCompare(b.preferredDate) || timeValue(a.preferredTime) - timeValue(b.preferredTime),
  requested: (a, b) => a.createdAt.localeCompare(b.createdAt),
};

const isTab = (v: string | null): v is Tab => TABS.includes(v as Tab);

// The panel keeps the appointment it opened with, so it can slide out after a delete.
interface Panel { id: string; open: boolean; n: number; snapshot?: Appointment }

export default function AdminAppointments() {
  usePageMeta('Appointments · Admin');
  const [params, setParams] = useSearchParams();
  const { appointments, loading, error, setStatus, saveNote, remove } = useAppointments();
  const services = useServiceLookup();
  const [tab, setTab] = useState<Tab>(() => (isTab(params.get('status')) ? params.get('status') as Tab : 'all'));
  const [q, setQ] = useState('');
  const [date, setDate] = useState('');
  const [sort, setSort] = useState<Sort>({ key: 'date', dir: 1 });
  const [panel, setPanel] = useState<Panel | null>(() => {
    const id = params.get('id');
    return id ? { id, open: true, n: 0 } : null;
  });

  const counts = useMemo(() => {
    const n: Record<Tab, number> = { all: appointments.length, pending: 0, confirmed: 0, cancelled: 0 };
    for (const a of appointments) if (a.status in n) n[a.status as Tab] += 1;
    return n;
  }, [appointments]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return appointments
      .filter((a) => tab === 'all' || a.status === tab)
      .filter((a) => !date || a.preferredDate === date)
      .filter((a) => !needle || [a.clientName, a.clientPhone, a.clientEmail, a.service, services.nameOf(a.service)]
        .join(' ').toLowerCase().includes(needle))
      .sort((a, b) => SORTS[sort.key](a, b) * sort.dir);
  }, [appointments, tab, date, q, sort, services]);

  const onSort = (key: SortKey) =>
    setSort((s) => ({ key, dir: s.key === key ? (s.dir > 0 ? -1 : 1) : 1 }));

  const openPanel = (a: Appointment) => setPanel((p) => ({ id: a.id, open: true, n: (p?.n ?? 0) + 1, snapshot: a }));
  const closePanel = () => {
    setPanel((p) => (p ? { ...p, open: false } : p));
    if (params.has('id')) {
      const next = new URLSearchParams(params);
      next.delete('id');
      setParams(next, { replace: true });
    }
  };

  const current = panel && (appointments.find((a) => a.id === panel.id) ?? panel.snapshot);
  const filtered = Boolean(q || date);

  const body = () => {
    if (loading) return <div className="empty" role="status"><strong>Loading</strong>Fetching booking requests…</div>;
    if (error) return <div className="empty" role="alert"><strong>Couldn't load appointments</strong>{error}</div>;
    if (!rows.length) {
      return (
        <div className="empty">
          <strong>Nothing here</strong>
          {filtered ? 'No appointments match these filters.' : 'No appointments with this status yet.'}
        </div>
      );
    }
    return <AppointmentsTable rows={rows} sort={sort} onSort={onSort} onOpen={openPanel} serviceName={services.nameOf} />;
  };

  return (
    <>
      <div className="ph">
        <div>
          <h1>Appointments</h1>
          <p>Booking requests from the website. Reply on WhatsApp, then set the status here so everyone sees the same picture.</p>
        </div>
      </div>
      <div className="toolbar">
        <div className="tabs" role="tablist" aria-label="Filter by status">
          {TABS.map((s) => (
            <button key={s} type="button" role="tab" aria-selected={tab === s} onClick={() => setTab(s)}>
              {s === 'all' ? 'All' : STATUS[s]}<span className="n">{counts[s]}</span>
            </button>
          ))}
        </div>
        <span className="grow" />
        <label className="search">
          <span className="visually-hidden">Search appointments</span>
          <Icon name="search" />
          <input className="in" type="search" placeholder="Name, phone or service" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <label>
          <span className="visually-hidden">Preferred date</span>
          <input className="in" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <button className="abtn ghost sm" type="button" hidden={!filtered} onClick={() => { setQ(''); setDate(''); }}>
          Clear filters
        </button>
      </div>
      <section className="card"><div className="table-wrap">{body()}</div></section>
      {panel && current && (
        <AppointmentDrawer
          key={`${panel.id}-${panel.n}`}
          appointment={current}
          serviceName={services.nameOf(current.service)}
          open={panel.open}
          onClose={closePanel}
          onStatus={setStatus}
          onSaveNote={saveNote}
          onDelete={remove}
        />
      )}
    </>
  );
}
