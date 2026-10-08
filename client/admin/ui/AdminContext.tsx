// Shell-wide admin state: toasts, and the pending-request count shown on the
// Appointments link. Pages call refreshPending() after changing an appointment.
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { adminApi } from '../../hooks/useApi';
import { Icon } from './icons';

const TOAST_MS = 2600;
const TOAST_OUT_MS = 260;

type ToastKind = '' | 'err';
interface Toast { id: number; msg: string; kind: ToastKind; out: boolean }

interface AdminContextValue {
  toast: (msg: string, kind?: ToastKind) => void;
  pendingCount: number;
  refreshPending: () => Promise<void>;
}

const AdminContext = createContext<AdminContextValue>({
  toast: () => {},
  pendingCount: 0,
  refreshPending: async () => {},
});

export function AdminProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const nextId = useRef(0);

  const toast = useCallback((msg: string, kind: ToastKind = '') => {
    const id = nextId.current++;
    setToasts((list) => [...list, { id, msg, kind, out: false }]);
    setTimeout(() => {
      setToasts((list) => list.map((t) => (t.id === id ? { ...t, out: true } : t)));
      setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), TOAST_OUT_MS);
    }, TOAST_MS);
  }, []);

  const refreshPending = useCallback(async () => {
    try {
      const appointments = await adminApi<{ status: string }[]>('appointments', 'GET');
      setPendingCount(appointments.filter((a) => a.status === 'pending').length);
    } catch {
      // the badge is a hint; a failed count must not break the page
    }
  }, []);

  useEffect(() => { refreshPending(); }, [refreshPending]);

  return (
    <AdminContext.Provider value={{ toast, pendingCount, refreshPending }}>
      {children}
      <div className="toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={['toast', t.kind, t.out && 'out'].filter(Boolean).join(' ')}>
            <Icon name={t.kind === 'err' ? 'x' : 'check'} /><span>{t.msg}</span>
          </div>
        ))}
      </div>
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}
