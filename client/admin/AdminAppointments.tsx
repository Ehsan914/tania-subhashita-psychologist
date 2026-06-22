import { useState, useEffect, useCallback, useMemo } from 'react';
import { adminApi } from '../hooks/useApi';
import { Search, Trash2, ChevronUp, ChevronDown, ChevronsUpDown, Loader2 } from 'lucide-react';

interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  service: string;
  sessionType: string;
  format: string;
  preferredDate: string;
  preferredTime: string;
  message: string;
  status: string;
  createdAt: string;
}

type SortCol = keyof Appointment;

const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  confirmed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
};

function SortIcon({ col, sortCol, sortDir }: { col: SortCol; sortCol: SortCol | null; sortDir: 'asc' | 'desc' }) {
  if (sortCol !== col) return <ChevronsUpDown className="w-3 h-3 opacity-30" />;
  return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-indigo-400" /> : <ChevronDown className="w-3 h-3 text-indigo-400" />;
}

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sortCol, setSortCol] = useState<SortCol>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (dateFilter) params.set('date', dateFilter);
      const query = params.toString();
      const data = await adminApi<Appointment[]>(`appointments${query ? '?' + query : ''}`, 'GET');
      setAppointments(data ?? []);
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [search, dateFilter]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const handleSort = (col: SortCol) => {
    if (sortCol === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  };

  const sorted = useMemo(() => {
    return [...appointments].sort((a, b) => {
      const av = (a[sortCol] ?? '').toString().toLowerCase();
      const bv = (b[sortCol] ?? '').toString().toLowerCase();
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [appointments, sortCol, sortDir]);

  const handleStatusChange = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      await adminApi(`appointments/${id}/status`, 'PUT', { status });
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this appointment record?')) return;
    setDeletingId(id);
    try {
      await adminApi(`appointments/${id}`, 'DELETE');
      setAppointments(prev => prev.filter(a => a.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const Th = ({ col, label }: { col: SortCol; label: string }) => (
    <th className="text-left px-4 py-3">
      <button
        onClick={() => handleSort(col)}
        className="flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase text-gray-500 hover:text-white transition-colors cursor-pointer select-none"
      >
        {label}
        <SortIcon col={col} sortCol={sortCol} sortDir={sortDir} />
      </button>
    </th>
  );

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Appointments</h1>
        <p className="text-sm text-gray-500 mt-1">All booking requests submitted through the website</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text" placeholder="Search name, phone, email, service..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#12121f] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-400 font-semibold">Date:</label>
          <input
            type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
            className="bg-[#12121f] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all [&::-webkit-calendar-picker-indicator]:invert"
          />
          {dateFilter && (
            <button onClick={() => setDateFilter('')} className="text-xs text-gray-500 hover:text-white transition-colors cursor-pointer">
              Clear
            </button>
          )}
        </div>
        <span className="text-xs text-gray-500 ml-auto">{sorted.length} records</span>
      </div>

      {/* Table */}
      <div className="bg-[#1a1a2e] rounded-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-sm">No appointments found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/5">
                <tr>
                  <Th col="clientName" label="Client" />
                  <Th col="clientPhone" label="Phone" />
                  <Th col="service" label="Service" />
                  <Th col="preferredDate" label="Date" />
                  <Th col="preferredTime" label="Time" />
                  <Th col="format" label="Format" />
                  <Th col="sessionType" label="Session" />
                  <Th col="status" label="Status" />
                  <Th col="createdAt" label="Submitted" />
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sorted.map(appt => (
                  <tr key={appt.id} className="hover:bg-white/2 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{appt.clientName}</div>
                      {appt.clientEmail && (
                        <div className="text-[11px] text-gray-500 mt-0.5">{appt.clientEmail}</div>
                      )}
                      <div className="text-[10px] text-gray-600 font-mono mt-0.5">{appt.id.slice(0, 10)}…</div>
                    </td>
                    <td className="px-4 py-3 text-[#4F8E99] font-mono text-xs">{appt.clientPhone}</td>
                    <td className="px-4 py-3 text-gray-300 text-xs max-w-35 truncate">{appt.service || '—'}</td>
                    <td className="px-4 py-3 text-white text-xs whitespace-nowrap">{appt.preferredDate}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{appt.preferredTime}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs capitalize">{appt.format}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-indigo-500/10 text-indigo-300 border-indigo-500/20 whitespace-nowrap">
                        {appt.sessionType || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {updatingId === appt.id ? (
                        <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                      ) : (
                        <select
                          value={appt.status}
                          onChange={e => handleStatusChange(appt.id, e.target.value)}
                          className={`text-[10px] font-bold px-2 py-1 rounded border bg-transparent cursor-pointer focus:outline-none ${STATUS_COLORS[appt.status] ?? 'bg-white/5 text-gray-400 border-white/10'}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-[11px] whitespace-nowrap">
                      {new Date(appt.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(appt.id)}
                        disabled={deletingId === appt.id}
                        className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all cursor-pointer disabled:opacity-50"
                        title="Delete appointment"
                      >
                        {deletingId === appt.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Message preview */}
      {sorted.some(a => a.message) && (
        <details className="bg-[#1a1a2e] rounded-2xl border border-white/5 p-4">
          <summary className="text-xs font-semibold text-gray-400 cursor-pointer select-none">Show client messages</summary>
          <div className="mt-4 space-y-3">
            {sorted.filter(a => a.message).map(appt => (
              <div key={appt.id} className="bg-[#12121f] rounded-xl p-3 text-xs">
                <span className="font-semibold text-indigo-400">{appt.clientName}</span>
                <span className="text-gray-600 ml-2">{appt.clientPhone}</span>
                <p className="text-gray-400 mt-1 leading-relaxed">{appt.message}</p>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
