// Contact: the confirmation that replaces the form once the question is composed.
import { useEffect, useRef } from 'react';

interface ContactSentProps {
  name: string;
  phone: string;
  // Move focus here when the form was just submitted, so screen readers land on it.
  focusOnMount: boolean;
}

export function ContactSent({ name, phone, focusOnMount }: ContactSentProps) {
  const ref = useRef<HTMLDivElement>(null);
  const firstName = name.trim().split(/\s+/)[0];

  useEffect(() => {
    if (focusOnMount) ref.current?.focus();
  }, [focusOnMount]);

  return (
    <div className="sent" role="status" tabIndex={-1} ref={ref} style={{ outline: 'none' }}>
      <span className="mark"><svg viewBox="0 0 28 28" aria-hidden="true"><path d="M6 14.5l5 5 11-12" /></svg></span>
      <h3>Thank you{firstName ? `, ${firstName}` : ''}.</h3>
      <p>
        Your question is ready in your email app, addressed to Tania. Press send and she&rsquo;ll reply personally,
        usually within 24 hours.{phone && ` If anything feels urgent, call or WhatsApp ${phone}.`}
      </p>
    </div>
  );
}
