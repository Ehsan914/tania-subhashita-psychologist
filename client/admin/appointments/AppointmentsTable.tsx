// The sortable appointments table (admin/assets/appointments.js `render`). A row opens
// the side panel on click, Enter or Space; on phones the table stacks into cards.
import type { KeyboardEvent, MouseEvent } from 'react';
import { Icon } from '../ui/icons';
import { Pill, fmtDate, fmtStamp, waLink } from '../ui/format';
import { formatLabel, type Appointment } from './types';

export type SortKey = 'client' | 'date' | 'requested';
export interface Sort { key: SortKey; dir: 1 | -1 }

interface Props {
  rows: Appointment[];
  sort: Sort;
  onSort: (key: SortKey) => void;
  onOpen: (a: Appointment) => void;
  serviceName: (service: string) => string;
}

function SortHeader({ k, label, sort, onSort }: { k: SortKey; label: string; sort: Sort; onSort: (key: SortKey) => void }) {
  const active = sort.key === k;
  return (
    <th aria-sort={active ? (sort.dir > 0 ? 'ascending' : 'descending') : undefined}>
      <button type="button" onClick={() => onSort(k)}>
        {label}<Icon name={active ? (sort.dir > 0 ? 'up' : 'down') : 'sort'} />
      </button>
    </th>
  );
}

export default function AppointmentsTable({ rows, sort, onSort, onOpen, serviceName }: Props) {
  const onRowClick = (e: MouseEvent<HTMLTableRowElement>, a: Appointment) => {
    if ((e.target as HTMLElement).closest('a')) return;
    onOpen(a);
  };
  const onRowKey = (e: KeyboardEvent<HTMLTableRowElement>, a: Appointment) => {
    if (e.target !== e.currentTarget || (e.key !== 'Enter' && e.key !== ' ')) return;
    e.preventDefault();
    onOpen(a);
  };

  return (
    <table className="t stackable">
      <thead>
        <tr>
          <SortHeader k="client" label="Client" sort={sort} onSort={onSort} />
          <th>Service</th>
          <SortHeader k="date" label="Session" sort={sort} onSort={onSort} />
          <th>Format</th>
          <th>Status</th>
          <SortHeader k="requested" label="Requested" sort={sort} onSort={onSort} />
          <th><span className="visually-hidden">Actions</span></th>
        </tr>
      </thead>
      <tbody>
        {rows.map((a) => (
          <tr
            key={a.id} tabIndex={0} aria-label={`Open ${a.clientName}`}
            onClick={(e) => onRowClick(e, a)} onKeyDown={(e) => onRowKey(e, a)}
          >
            <td className="who"><strong>{a.clientName}</strong><small className="num">{a.clientPhone}</small></td>
            <td data-l="Service">{serviceName(a.service)}<br /><small className="tag">{a.sessionType}</small></td>
            <td className="num" data-l="Session">{fmtDate(a.preferredDate)}<br /><small>{a.preferredTime}</small></td>
            <td data-l="Format">{formatLabel(a.format)}</td>
            <td><Pill status={a.status} /></td>
            <td className="num" data-l="Requested">{fmtStamp(a.createdAt)}</td>
            <td className="row-actions">
              <a
                className="icon-btn" href={waLink(a.clientPhone)} target="_blank" rel="noopener noreferrer"
                title="WhatsApp" aria-label={`Message ${a.clientName} on WhatsApp`}
              >
                <Icon name="chat" />
              </a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
