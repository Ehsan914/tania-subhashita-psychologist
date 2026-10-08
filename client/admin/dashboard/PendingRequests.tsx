// "Requests waiting for a reply": message the client, then confirm or decline in place.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../ui/icons';
import { fmtDate, initials, waLink } from '../ui/format';
import { useAdmin } from '../ui/AdminContext';
import { errorMessage, formatLabel, type Appointment, type AppointmentStatus } from '../appointments/types';

interface Props {
  pending: Appointment[];
  serviceName: (service: string) => string;
  onStatus: (id: string, status: AppointmentStatus) => Promise<void>;
}

function RequestRow({ a, serviceName, busy, onSet }: {
  a: Appointment;
  serviceName: string;
  busy: boolean;
  onSet: (a: Appointment, status: AppointmentStatus) => void;
}) {
  return (
    <div className="req">
      <span className="avatar">{initials(a.clientName)}</span>
      <Link className="txt" to={`/admin/appointments?id=${encodeURIComponent(a.id)}`}>
        <strong>{a.clientName}</strong>
        <small>{serviceName} · {fmtDate(a.preferredDate)}, {a.preferredTime} · {formatLabel(a.format)}</small>
      </Link>
      <div className="acts">
        <a
          className="icon-btn" href={waLink(a.clientPhone)} target="_blank" rel="noopener noreferrer"
          title="Message on WhatsApp" aria-label={`Message ${a.clientName} on WhatsApp`}
        >
          <Icon name="chat" />
        </a>
        <button className="abtn ghost sm" type="button" disabled={busy} onClick={() => onSet(a, 'cancelled')}>Decline</button>
        <button className="abtn ok sm" type="button" disabled={busy} onClick={() => onSet(a, 'confirmed')}><Icon name="check" />Confirm</button>
      </div>
    </div>
  );
}

export default function PendingRequests({ pending, serviceName, onStatus }: Props) {
  const { toast } = useAdmin();
  const [busyId, setBusyId] = useState<string | null>(null);

  const onSet = async (a: Appointment, status: AppointmentStatus) => {
    setBusyId(a.id);
    try {
      await onStatus(a.id, status);
      toast(status === 'confirmed' ? `${a.clientName}'s session is confirmed.` : `${a.clientName}'s request was declined.`);
    } catch (err) {
      toast(errorMessage(err), 'err');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="card" aria-labelledby="req-h">
      <div className="hd">
        <div><h2 id="req-h">Requests waiting for a reply</h2><p>Message them on WhatsApp, then confirm or decline here.</p></div>
      </div>
      {pending.length
        ? pending.map((a) => (
          <RequestRow key={a.id} a={a} serviceName={serviceName(a.service)} busy={busyId === a.id} onSet={onSet} />
        ))
        : <div className="empty"><strong>All caught up</strong>New requests from the booking form will appear here.</div>}
    </section>
  );
}
