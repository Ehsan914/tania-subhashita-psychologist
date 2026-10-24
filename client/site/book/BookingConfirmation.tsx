// Shown once the request is sent: a check that draws itself, the request, and the
// WhatsApp hand-off so Tania can confirm the time. If the Sheet could not take the request
// (isUnsaved), the hand-off is the only copy, so the page says to send it or call.
import { Link } from 'react-router-dom';
import type { BookingChoice } from './booking';
import { CHOICE_LINES } from './BookingSummary';

interface BookingConfirmationProps {
  choice: BookingChoice;
  firstName?: string;
  reference?: string;
  whatsappHref?: string;
  isUnsaved?: boolean;
  phone?: string;
  phoneHref?: string;
}

function UnsavedNote({ phone, phoneHref }: { phone?: string; phoneHref?: string }) {
  return (
    <p>
      <strong>Our booking system couldn't save this request just now.</strong> Please send it on WhatsApp below
      {phone ? <>, or message Tania directly on <a className="nowrap" href={`tel:${phoneHref}`}>{phone}</a></> : ' or message Tania directly'},
      so it reaches her.
    </p>
  );
}

export function BookingConfirmation({
  choice, firstName, reference, whatsappHref, isUnsaved, phone, phoneHref,
}: BookingConfirmationProps) {
  const heading = isUnsaved ? 'One more step' : 'Your request is in';
  return (
    <div className="confirmation sent" role="status">
      <span className="mark"><svg viewBox="0 0 28 28" aria-hidden="true"><path d="M6 14.5l5 5 11-12" /></svg></span>
      <h3>{firstName ? `${heading}, ${firstName}.` : `${heading}.`}</h3>
      {isUnsaved
        ? <UnsavedNote phone={phone} phoneHref={phoneHref} />
        : <p>Tania will confirm your time personally. To speed things up, send the prepared message on WhatsApp.</p>}
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
