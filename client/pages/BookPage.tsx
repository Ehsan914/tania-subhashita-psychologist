// Book a session (design: site/book.html + assets/book.js). Choices update a live summary;
// the request is saved through /api/book, then a confirmation offers the WhatsApp hand-off.
import { useMemo, useRef, useState, type FormEvent } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useSiteData } from '../context/SiteDataContext';
import { SplitWords, isMotionOff, useReveal } from '../site/motion';
import { Segmented } from '../site/controls';
import { useContactDetails } from '../site/SiteChrome';
import { submitBooking, useBookingOptions } from '../site/book/api';
import {
  DEFAULT_DAY_INDEX, DETAIL_FIELDS, defaultSession, defaultSlot, formatLabel, groupServices, isFreeSession,
  splitDuration, upcomingDays, validateDetails, whatsappLink,
  type BookingChoice, type BookingFormat, type ClientDetails, type DetailErrors,
} from '../site/book/booking';
import { programHint, readPreset } from '../site/book/preset';
import { BookingSummary } from '../site/book/BookingSummary';
import { BookingConfirmation } from '../site/book/BookingConfirmation';
import { DetailsFields } from '../site/book/DetailsFields';
import { WhenPicker } from '../site/book/WhenPicker';
import { usePageMeta } from '../hooks/usePageMeta';

const LEDE = 'Your first 20 minutes are free, with no obligation to continue. Choose what suits you and Tania will confirm on WhatsApp.';
const FORMAT_OPTIONS = [
  { value: 'in-person', label: 'In person', sub: 'New Eskaton' },
  { value: 'online', label: 'Online', sub: 'Zoom or Meet' },
];
const CONFIRMATION_STYLE = { paddingBottom: 'var(--section)', paddingTop: 'calc(84px + clamp(56px, 8vw, 112px))' };

interface SentRequest {
  id: string;
  details: ClientDetails;
}

export default function BookPage() {
  usePageMeta('Book a session — Tania Subhashita, Psychologist', 'Request a free 20-minute consultation or a 60-minute session, in person at MIND CARE or online.');
  const rootRef = useRef<HTMLDivElement>(null);
  const [params] = useSearchParams();
  const location = useLocation();
  const { services, programs } = useSiteData();
  const { clinic } = useContactDetails();
  const options = useBookingOptions();
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
  const [sending, setSending] = useState(false);
  const [serverError, setServerError] = useState('');
  const [sent, setSent] = useState<SentRequest | null>(null);
  const isPreview = params.get('state') === 'success';
  const showConfirmation = sent !== null || isPreview;

  // Settings can arrive after the first paint; a pick that is no longer offered falls back.
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

  useReveal(rootRef, [showConfirmation]);

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
      service,
      sessionType: session,
      format,
      preferredDate: chosenDay.iso,
      preferredTime: time,
      message: trimmed.message,
    });
    setSending(false);
    if (!result.ok) {
      setServerError(result.error);
      return;
    }
    setSent({ id: result.id, details: trimmed });
    window.scrollTo({ top: 0, behavior: isMotionOff() ? 'auto' : 'smooth' });
  };

  if (showConfirmation) {
    return (
      <div ref={rootRef}>
        <section className="wrap" style={CONFIRMATION_STYLE}>
          <BookingConfirmation
            choice={choice}
            firstName={sent?.details.name.split(' ')[0]}
            reference={sent?.id.slice(0, 10)}
            whatsappHref={sent ? whatsappLink(options.whatsappNumber, choice, sent.details) : undefined}
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
    </div>
  );
}
