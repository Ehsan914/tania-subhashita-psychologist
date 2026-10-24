// Book a session (design: site/book.html + assets/book.js). Choices update a live summary;
// the request goes to the bookings Sheet (api/book.ts), then a confirmation offers the WhatsApp hand-off.
import { useMemo, useRef, useState, type FormEvent } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useSiteData } from '../context/SiteDataContext';
import { SplitWords, isMotionOff, useReveal } from '../site/motion';
import { Segmented } from '../site/controls';
import { useContactDetails } from '../site/SiteChrome';
import { submitBooking } from '../site/book/api';
import {
  DEFAULT_DAY_INDEX, DETAIL_FIELDS, defaultSession, defaultSlot, formatLabel, groupServices, isFreeSession,
  parseSettings, splitDuration, upcomingDays, validateDetails, whatsappLink,
  type BookingChoice, type BookingFormat, type ClientDetails, type DetailErrors,
} from '../site/book/booking';
import { programHint, readPreset } from '../site/book/preset';
import { BookingSummary } from '../site/book/BookingSummary';
import { BookingConfirmation } from '../site/book/BookingConfirmation';
import { DetailsFields } from '../site/book/DetailsFields';
import { WhenPicker } from '../site/book/WhenPicker';
import { usePageMeta, useJsonLd } from '../hooks/usePageMeta';
import { useHydrated } from '../hooks/useHydrated';
import { pageGraph } from '../lib/schema';

const LEDE = 'Your first 20 minutes are free, with no obligation to continue. Choose what suits you and Tania will confirm on WhatsApp.';
const FORMAT_OPTIONS = [
  { value: 'in-person', label: 'In person', sub: 'New Eskaton' },
  { value: 'online', label: 'Online', sub: 'Zoom or Meet' },
];
const CONFIRMATION_STYLE = { paddingBottom: 'var(--section)', paddingTop: 'calc(84px + clamp(56px, 8vw, 112px))' };

interface SentRequest {
  id: string;
  details: ClientDetails;
  saved: boolean; // false: the Sheet could not take it, so WhatsApp is the only copy
}

// Hidden from people and screen readers; a bot that fills every field fills this one too.
function Honeypot({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="visually-hidden" aria-hidden="true">
      <label htmlFor="b-website">Website</label>
      <input
        id="b-website" name="website" type="text" autoComplete="off" tabIndex={-1}
        value={value} onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export default function BookPage() {
  usePageMeta('Book a Session in Dhaka or Online | Tania Subhashita, Psychologist', 'Request a free 20-minute consultation or a 60-minute session, in person at MIND CARE, New Eskaton, Dhaka, or online by Zoom or Google Meet.');
  useJsonLd('page', pageGraph('WebPage', '/book', 'Book a session', [{ name: 'Book a session', path: '/book' }]));
  // the form starts from today's date and the query string, which the prerender cannot know
  const hydrated = useHydrated();
  const rootRef = useRef<HTMLDivElement>(null);
  const [params] = useSearchParams();
  const location = useLocation();
  const { services, programs, booking } = useSiteData();
  const { clinic, phone, phoneHref } = useContactDetails();
  const options = useMemo(() => parseSettings(booking), [booking]);
  const days = useMemo(() => upcomingDays(), []);
  const groups = useMemo(() => groupServices(services), [services]);

  const [preset] = useState(() => readPreset(params, location.state, services, programs));
  const [service, setService] = useState(preset.service);
  const [sessionPick, setSessionPick] = useState('');
  const [format, setFormat] = useState<BookingFormat>('in-person');
  const [day, setDay] = useState(days[DEFAULT_DAY_INDEX].iso);
  const [timePick, setTimePick] = useState('');
  const [details, setDetails] = useState<ClientDetails>({ name: '', phone: '', email: '', message: preset.message });
  const [errors, setErrors] = useState<DetailErrors>({});
  const [website, setWebsite] = useState('');
  const [sending, setSending] = useState(false);
  const [serverError, setServerError] = useState('');
  const [sent, setSent] = useState<SentRequest | null>(null);
  const isPreview = params.get('state') === 'success';
  const showConfirmation = hydrated && (sent !== null || isPreview);

  // A pick that is not offered (an option renamed since the link was made) falls back.
  const { sessionDurations, timeSlots } = options;
  const session = sessionDurations.includes(sessionPick) ? sessionPick : defaultSession(sessionDurations, preset.wantsFull);
  const time = timeSlots.includes(timePick) ? timePick : defaultSlot(timeSlots);
  const chosenDay = days.find((d) => d.iso === day) ?? days[DEFAULT_DAY_INDEX];
  const choice: BookingChoice = {
    service: services.find((s) => s.slug === service)?.name ?? service,
    session,
    format: formatLabel(format, clinic),
    day: chosenDay.long,
    time,
  };

  useReveal(rootRef, [showConfirmation, hydrated]);

  const setDetail = (key: keyof ClientDetails, value: string) => {
    setDetails((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key as keyof DetailErrors] ? { ...prev, [key]: false } : prev));
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sending) return;
    const form = e.currentTarget;
    const found = validateDetails(details);
    setErrors(found);
    const firstBad = DETAIL_FIELDS.find((key) => found[key]);
    if (firstBad) {
      form.querySelector<HTMLInputElement>(`[name="${firstBad}"]`)?.focus();
      return;
    }

    const trimmed: ClientDetails = {
      name: details.name.trim(), phone: details.phone.trim(), email: details.email.trim(), message: details.message.trim(),
    };
    setServerError('');
    setSending(true);
    const result = await submitBooking({
      clientName: trimmed.name,
      clientPhone: trimmed.phone,
      clientEmail: trimmed.email,
      // the therapy's name, as Tania reads it in the Sheet
      service: choice.service,
      sessionType: session,
      format,
      preferredDate: chosenDay.iso,
      preferredTime: time,
      message: trimmed.message,
      website,
    });
    setSending(false);
    if (result.status === 'error') {
      setServerError(result.error);
      return;
    }
    setSent(result.status === 'saved'
      ? { id: result.id, details: trimmed, saved: true }
      : { id: '', details: trimmed, saved: false });
    window.scrollTo({ top: 0, behavior: isMotionOff() ? 'auto' : 'smooth' });
  };

  if (showConfirmation) {
    return (
      <div ref={rootRef}>
        <section className="wrap" style={CONFIRMATION_STYLE}>
          <BookingConfirmation
            choice={choice}
            firstName={sent?.details.name.split(' ')[0]}
            reference={sent?.id || undefined}
            whatsappHref={sent ? whatsappLink(options.whatsappNumber, choice, sent.details) : undefined}
            isUnsaved={sent !== null && !sent.saved}
            phone={phone}
            phoneHref={phoneHref}
          />
        </section>
      </div>
    );
  }

  const sessionOptions = sessionDurations.map((d) => ({ value: d, ...splitDuration(d) }));

  return (
    <div ref={rootRef}>
      <header className="page-head wrap" style={{ paddingBottom: 'clamp(40px, 5vw, 64px)' }}>
        <p className="eyebrow" data-reveal="rise">Book a session</p>
        <h1 className="h1" data-reveal="split"><SplitWords>Let's find a <em>time.</em></SplitWords></h1>
        <p className="lede" data-reveal="rise">{options.introText || LEDE}</p>
      </header>

      {!hydrated ? <section className="wrap" style={{ minHeight: '100vh' }} aria-hidden="true" /> : (
      <section className="wrap" style={{ paddingBottom: 'var(--section)' }}>
        <div className="book-grid">
          <form className="book-form" noValidate onSubmit={onSubmit}>
            <fieldset>
              <legend><span>01</span> What would you like help with?</legend>
              <div className="field">
                <label htmlFor="service">Area of care</label>
                <select
                  className="input" id="service" name="service" value={service}
                  aria-describedby={preset.program ? 'service-hint' : undefined}
                  onChange={(e) => setService(e.target.value)}
                >
                  {groups.map((group) => (
                    <optgroup key={group.category} label={group.category}>
                      {group.items.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
                    </optgroup>
                  ))}
                </select>
                {preset.program && <span className="hint" id="service-hint">{programHint(preset.program)}</span>}
              </div>
            </fieldset>

            <fieldset>
              <legend><span>02</span> Session</legend>
              <div className="two">
                <div className="field">
                  <span className="label" id="session-label">Length</span>
                  <Segmented name="session" value={session} options={sessionOptions} onChange={setSessionPick} aria-labelledby="session-label" />
                </div>
                <div className="field">
                  <span className="label" id="format-label">Where</span>
                  <Segmented
                    name="format" value={format} options={FORMAT_OPTIONS} aria-labelledby="format-label"
                    onChange={(v) => setFormat(v === 'online' ? 'online' : 'in-person')}
                  />
                </div>
              </div>
            </fieldset>

            <WhenPicker days={days} day={chosenDay.iso} onDay={setDay} slots={timeSlots} time={time} onTime={setTimePick} />
            <DetailsFields details={details} errors={errors} onChange={setDetail} />
            <Honeypot value={website} onChange={setWebsite} />

            <div className="submit-row">
              {serverError && (
                <div className="field has-error" role="alert" style={{ flexBasis: '100%' }}>
                  <span className="error">{serverError}</span>
                </div>
              )}
              <small>After you send this, WhatsApp opens with your request so you can confirm the time.</small>
              <button className="btn" type="submit" disabled={sending}>
                {sending
                  ? <><span className="spinner" aria-hidden="true" /> Sending…</>
                  : <>Request this time <span className="arrow" aria-hidden="true">→</span></>}
              </button>
            </div>
          </form>

          <BookingSummary choice={choice} isFree={isFreeSession(session, sessionDurations)} />
        </div>
      </section>
      )}
    </div>
  );
}
