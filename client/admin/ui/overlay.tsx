// Drawer and dialog from the design's admin shell: they slide or fade in, close on
// Esc, the backdrop or the × button, and hand focus back to whatever opened them.
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Icon } from './icons';

const CLOSE_MS = 320;

interface OverlayProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  sub?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

function Overlay({ kind, open, onClose, title, sub, footer, children }: OverlayProps & { kind: 'drawer' | 'modal' }) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    if (open) {
      returnTo.current = document.activeElement as HTMLElement | null;
      setMounted(true);
      // two frames: mount in the hidden state first, so the transition runs
      let inner = 0;
      const outer = requestAnimationFrame(() => { inner = requestAnimationFrame(() => setShown(true)); });
      return () => { cancelAnimationFrame(outer); cancelAnimationFrame(inner); };
    }
    setShown(false);
    const t = setTimeout(() => setMounted(false), CLOSE_MS);
    returnTo.current?.focus?.();
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!shown) return;
    const first = panel.current?.querySelector<HTMLElement>('[autofocus], .bd .form :is(.in, select, textarea), .hd .icon-btn');
    first?.focus();
  }, [shown]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  return (
    <>
      <div className={shown ? 'overlay show' : 'overlay'} onClick={onClose} />
      <div ref={panel} className={shown ? `${kind} show` : kind} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="hd">
          <div style={{ flex: 1 }}>
            <h2 id={titleId}>{title}</h2>
            {sub && <p>{sub}</p>}
          </div>
          <button className="icon-btn" type="button" onClick={onClose} aria-label="Close"><Icon name="x" /></button>
        </div>
        <div className="bd">{children}</div>
        {footer && <div className="ft">{footer}</div>}
      </div>
    </>
  );
}

export function Drawer(props: OverlayProps) {
  return <Overlay kind="drawer" {...props} />;
}

export function Modal(props: OverlayProps) {
  return <Overlay kind="modal" {...props} />;
}

// A real confirmation in place of window.confirm, with the danger spelled out.
export function ConfirmDelete({ open, what, onCancel, onConfirm }: {
  open: boolean;
  what: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      open={open} onClose={onCancel} title="Delete this?"
      footer={(
        <>
          <button className="abtn ghost" type="button" onClick={onCancel}>Keep it</button>
          <button className="abtn danger" type="button" onClick={onConfirm}><Icon name="trash" />Delete</button>
        </>
      )}
    >
      <div className="warnbox"><strong>{what}</strong> will be removed for good. This can't be undone.</div>
    </Modal>
  );
}
