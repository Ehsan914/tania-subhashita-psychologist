// The appointment list shared by the dashboard and the appointments page: loaded once,
// then kept in step with each change the server confirms, without reloading the list.
import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../../hooks/useApi';
import { useAdmin } from '../ui/AdminContext';
import { errorMessage, type Appointment, type AppointmentStatus } from './types';

export function useAppointments() {
  const { refreshPending } = useAdmin();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    adminApi<Appointment[]>('appointments', 'GET')
      .then((list) => { if (live) setAppointments(list); })
      .catch((err: unknown) => { if (live) setError(errorMessage(err)); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, []);

  const replace = (updated: Appointment) =>
    setAppointments((list) => list.map((a) => (a.id === updated.id ? updated : a)));

  const setStatus = useCallback(async (id: string, status: AppointmentStatus) => {
    replace(await adminApi<Appointment>(`appointments/${id}/status`, 'PUT', { status }));
    void refreshPending();
  }, [refreshPending]);

  const saveNote = useCallback(async (id: string, psychologistComment: string) => {
    replace(await adminApi<Appointment>(`appointments/${id}/comment`, 'PUT', { psychologistComment }));
  }, []);

  const remove = useCallback(async (id: string) => {
    await adminApi(`appointments/${id}`, 'DELETE');
    setAppointments((list) => list.filter((a) => a.id !== id));
    void refreshPending();
  }, [refreshPending]);

  return { appointments, loading, error, setStatus, saveNote, remove };
}
