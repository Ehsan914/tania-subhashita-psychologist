// Side panel for one appointment (admin/assets/appointments.js `open`): reach the client,
// set the status, read their message and keep a private note.
import { useId, useState } from 'react';
import { Drawer, ConfirmDelete } from '../ui/overlay';
import { Icon } from '../ui/icons';
import { STATUS, fmtDate, fmtStamp, waLink } from '../ui/format';
import { useAdmin } from '../ui/AdminContext';
import { errorMessage, formatLabel, type Appointment, type AppointmentStatus } from './types';

interface Props {
  appointment: Appointment;
  serviceName: string;
  open: boolean;
  onClose: () => void;
  onStatus: (id: string, status: AppointmentStatus) => Promise<void>;
  onSaveNote: (id: string, note: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function AppointmentDrawer({ appointment: a, serviceName, open, onClose, onStatus, onSaveNote, onDelete }: Props) {
  const { toast } = useAdmin();
  const [note, setNote] = useState(a.psychologistComment);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const noteId = useId();
  const statusLabelId = useId();

  const pickStatus = async (status: AppointmentStatus) => {
    if (status === a.status || busy) return;
    setBusy(true);
    try {
      await onStatus(a.id, status);
      toast(`Marked as ${STATUS[status].toLowerCase()}.`);
    } catch (err) {
      toast(errorMessage(err), 'err');
    } finally {
      setBusy(false);
    }
  };

  const saveNote = async () => {
    setBusy(true);
    try {
      await onSaveNote(a.id, note.trim());
      onClose();
      toast('Note saved.');
    } catch (err) {
      toast(errorMessage(err), 'err');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setConfirming(false);
    try {
      await onDelete(a.id);
      onClose();
      toast('Appointment deleted.');
    } catch (err) {
      toast(errorMessage(err), 'err');
    }
  };

  const footer = (
    <>
      <button className="abtn ghost left" type="button" onClick={() => setConfirming(true)}><Icon name="trash" />Delete</button>
      <button className="abtn ghost" type="button" onClick={onClose}>Close</button>
      <button className="abtn primary" type="button" onClick={saveNote} disabled={busy}>Save note</button>
    </>
  );

  return (
    <>
      {/* while the delete check is up, Esc closes only that, not the panel behind it */}
      <Drawer open={open} onClose={confirming ? () => setConfirming(false) : onClose} title={a.clientName} sub={`Requested ${fmtStamp(a.createdAt)}`} footer={footer}>
        <div className="quick">
          <a className="abtn primary sm" href={waLink(a.clientPhone)} target="_blank" rel="noopener noreferrer"><Icon name="chat" />WhatsApp</a>
          <a className="abtn ghost sm" href={`tel:${a.clientPhone.replace(/\D/g, '')}`}><Icon name="phone" />Call</a>
          {a.clientEmail && <a className="abtn ghost sm" href={`mailto:${a.clientEmail}`}><Icon name="mail" />Email</a>}
        </div>
        <p className="sec-label" id={statusLabelId}>Status</p>
        <div className="status-pick" role="group" aria-labelledby={statusLabelId}>
          {(Object.keys(STATUS) as AppointmentStatus[]).map((s) => (
            <button key={s} type="button" data-s={s} aria-pressed={a.status === s} onClick={() => pickStatus(s)}>{STATUS[s]}</button>
          ))}
        </div>
        <p className="sec-label">Session</p>
        <dl className="dl">
          <dt>Service</dt><dd>{serviceName || '—'}</dd>
          <dt>Date</dt><dd>{fmtDate(a.preferredDate)}</dd>
          <dt>Time</dt><dd>{a.preferredTime}</dd>
          <dt>Session</dt><dd>{a.sessionType}</dd>
          <dt>Format</dt><dd>{formatLabel(a.format)}</dd>
          <dt>Phone</dt><dd className="num">{a.clientPhone}</dd>
          <dt>Email</dt><dd>{a.clientEmail || '—'}</dd>
        </dl>
        <p className="sec-label">Their message</p>
        <div className="note-box">
          {a.message || <span style={{ color: 'var(--ink-soft)' }}>No message left.</span>}
        </div>
        <p className="sec-label">Your note</p>
        <div className="f">
          <label className="visually-hidden" htmlFor={noteId}>Your note</label>
          <textarea
            id={noteId} value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="Session notes, follow-ups, anything to remember"
          />
          <span className="hint">Private. Only people with admin access can read this.</span>
        </div>
      </Drawer>
      <ConfirmDelete
        open={confirming} what={`${a.clientName}'s appointment`}
        onCancel={() => setConfirming(false)} onConfirm={remove}
      />
    </>
  );
}
