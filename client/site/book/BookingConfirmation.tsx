// Shown once the request is saved: a check that draws itself, the request, and the
// WhatsApp hand-off so Tania can confirm the time.
import { Link } from 'react-router-dom';
import type { BookingChoice } from './booking';
import { CHOICE_LINES } from './BookingSummary';

interface BookingConfirmationProps {
  choice: BookingChoice;
  firstName?: string;
  reference?: string;
  whatsappHref?: string;
}

export function BookingConfirmation({ choice, firstName, reference, whatsappHref }: BookingConfirmationProps) {
  return (
    <div className="confirmation sent" role="status">
      <span className="mark"><svg viewBox="0 0 28 28" aria-hidden="true"><path d="M6 14.5l5 5 11-12" /></svg></span>
      <h3>{firstName ? `Your request is in, ${firstName}.` : 'Your request is in.'}</h3>
      <p>Tania will confirm your time personally. To speed things up, send the prepared message on WhatsApp.</p>
      {reference && <span className="ref">Reference {reference}</span>}
      <dl>
        {CHOICE_LINES.map(([key, term]) => <div key={key}><dt>{term}</dt><dd>{choice[key]}</dd></div>)}
      </dl>
      <div className="actions">
        {whatsappHref && (
          <a className="btn" href={whatsappHref} target="_blank" rel="noopener noreferrer">
            Confirm on WhatsApp <span aria-hidden="true">↗</span>
          </a>
        )}
        <Link className="link" to="/">Back to home</Link>
      </div>
    </div>
  );
}
