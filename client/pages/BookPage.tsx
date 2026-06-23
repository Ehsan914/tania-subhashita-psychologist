import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, ShieldAlert, MessageCircle, Loader2 } from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';
import { API } from '../hooks/useApi';
import { Reveal } from '../components/Reveal';

interface BookingSettings {
  whatsappNumber: string;
  timeSlots: string;
  sessionDurations: string;
  introText: string;
}

export default function BookPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { services } = useSiteData();
  const locationState = location.state as { serviceId?: string; sessionType?: 'free' | 'full' } | null;

  const [settings, setSettings] = useState<BookingSettings | null>(null);
  const [bookingService, setBookingService] = useState<string>(locationState?.serviceId || '');
  const [sessionDuration, setSessionDuration] = useState<string>('');
  const [bookingFormat, setBookingFormat] = useState<'in-person' | 'online'>('in-person');
  const [bookingDate, setBookingDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [bookingTime, setBookingTime] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientMessage, setClientMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetch(`${API}/api/booking-settings`)
      .then(r => r.ok ? r.json() : null)
      .then((data: BookingSettings | null) => {
        if (data) {
          setSettings(data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (services.length > 0 && !bookingService) {
      setBookingService(locationState?.serviceId || services[0].slug);
    }
  }, [services]);

  const parse = (s: string | undefined, fallback: string) =>
    (s || fallback).split('\n').map(x => x.trim()).filter(Boolean);

  const timeSlots = parse(settings?.timeSlots, '10:00 AM\n11:00 AM\n02:00 PM\n04:00 PM\n06:00 PM\n07:00 PM');
  const sessionDurations = parse(settings?.sessionDurations, '20-Min Intro (Free)\n60-Min Full Session');

  useEffect(() => {
    if (timeSlots.length > 0 && !bookingTime) setBookingTime(timeSlots[0]);
  }, [timeSlots.join(',')]);

  useEffect(() => {
    if (sessionDurations.length > 0 && !sessionDuration) setSessionDuration(sessionDurations[0]);
  }, [sessionDurations.join(',')]);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone) {
      alert('Please provide your name and phone number.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName,
          clientPhone,
          clientEmail,
          service: bookingService,
          sessionType: sessionDuration,
          format: bookingFormat,
          preferredDate: bookingDate,
          preferredTime: bookingTime,
          message: clientMessage,
        }),
      });
      if (!res.ok) throw new Error('Server error');
      const appointment = await res.json();

      const serviceName = services.find(s => s.slug === bookingService)?.name || bookingService;
      const lines = [
        '🏥 *New Appointment Request — MindCare*',
        '',
        `👤 *Name:* ${clientName}`,
        `📱 *Phone:* ${clientPhone}`,
        clientEmail ? `📧 *Email:* ${clientEmail}` : null,
        `🩺 *Service:* ${serviceName}`,
        `📅 *Date:* ${bookingDate}`,
        `⏰ *Time:* ${bookingTime}`,
        `🏠 *Format:* ${bookingFormat === 'in-person' ? 'In-Person (Chamber)' : 'Online (Zoom)'}`,
        `⏱ *Session:* ${sessionDuration}`,
        clientMessage ? `💬 *Message:* ${clientMessage}` : null,
      ].filter((l): l is string => l !== null).join('\n');

      const whatsappNum = settings?.whatsappNumber || '8801580700700';
      window.open(`https://wa.me/${whatsappNum}?text=${encodeURIComponent(lines)}`, '_blank');
      setSuccessId(appointment.id);
      setClientName(''); setClientEmail(''); setClientPhone(''); setClientMessage('');
    } catch {
      alert('Failed to submit your appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedServiceName = services.find(s => s.slug === bookingService)?.name || bookingService;

  return (
    <div className="py-16 px-4 max-w-4xl mx-auto text-left">
      <Reveal delay={100} className="mb-12 text-center space-y-4">
        <span className="text-[10px] tracking-[0.28em] font-bold text-[#6E7C4E] uppercase block">Appointment Desk</span>
        <h1 className="font-serif-cormorant text-4xl sm:text-5xl text-[#1C4751] font-light">Schedule a Consultation</h1>
        <p className="text-sm text-[#5C6A6C] max-w-xl mx-auto leading-relaxed">
          {settings?.introText || 'Your first introductory consultation includes '}
          {!settings?.introText && <><strong className="text-[#1C4751]">20 free minutes</strong> to walk you through options with absolutely zero obligation.</>}
        </p>
      </Reveal>

      {successId ? (
        <Reveal delay={200} className="bg-[#EFE5C8] border-2 border-[#1C4751] p-8 rounded-xl space-y-6 shadow-md text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#6E7C4E]/20 text-[#6E7C4E] flex items-center justify-center mx-auto">
            <Check className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="text-[9px] tracking-[0.25em] font-bold text-[#6E7C4E] uppercase block">Appointment Submitted</span>
            <h2 className="font-serif-cormorant text-3xl font-bold text-[#1C4751]">Request Sent!</h2>
            <p className="text-xs text-[#5C6A6C] max-w-md mx-auto leading-relaxed">
              Your appointment has been saved and a WhatsApp message has been opened for confirmation. Please send it to complete your booking.
            </p>
          </div>
          <div className="bg-[#FAF4E2] border border-[#1C4751]/12 p-5 rounded-lg text-left text-xs max-w-md mx-auto space-y-3">
            <div className="flex justify-between pb-2 border-b border-[#1C4751]/10">
              <span className="text-[#5C6A6C]">Reference ID:</span>
              <strong className="text-[#1C4751] tracking-wider font-mono">{successId}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5C6A6C]">Service:</span>
              <strong className="text-[#1C4751]">{selectedServiceName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5C6A6C]">Date:</span>
              <strong className="text-[#1C4751]">{bookingDate}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5C6A6C]">Time:</span>
              <strong className="text-[#1C4751]">{bookingTime}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5C6A6C]">Format:</span>
              <strong className="text-[#1C4751] capitalize">{bookingFormat}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5C6A6C]">Session:</span>
              <strong className="text-[#C9923A]">{sessionDuration}</strong>
            </div>
          </div>
          <div className="flex justify-center gap-4 pt-2">
            <button
              onClick={() => setSuccessId(null)}
              className="bg-[#1C4751] hover:bg-[#4F8E99] text-[#FAF4E2] text-xs font-bold uppercase tracking-widest px-6 py-3 rounded cursor-pointer transition"
            >
              Book Another
            </button>
            <button
              onClick={() => navigate('/')}
              className="border border-[#1C4751]/20 text-[#1C4751] text-xs font-bold uppercase tracking-widest px-6 py-3 rounded cursor-pointer hover:bg-[#1C4751]/5 transition"
            >
              Return Home
            </button>
          </div>
        </Reveal>
      ) : (
        <Reveal delay={200}>
          <form onSubmit={handleSubmit} className="bg-[#FAF4E2] border border-[#1C4751]/12 p-8 rounded-xl shadow-sm space-y-6">

            {/* Service + Format */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-[#1C4751]/10">
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-[#1C4751] uppercase mb-1.5">
                  Therapies
                </label>
                <select
                  value={bookingService}
                  onChange={e => setBookingService(e.target.value)}
                  className="w-full bg-[#EFE5C8] border border-[#1C4751]/15 px-3 py-2.5 rounded text-xs focus:outline-none font-semibold text-[#1C4751]"
                >
                  {[...services].sort((a, b) => a.name.localeCompare(b.name)).map(srv => (
                    <option key={srv.id} value={srv.slug}>{srv.name} ({srv.category})</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="block text-[10px] font-bold tracking-widest text-[#1C4751] uppercase mb-1.5">Delivery Format</label>
                <div className="grid grid-cols-2 gap-2 flex-1">
                  <button type="button" onClick={() => setBookingFormat('in-person')} className={`text-xs px-3 rounded uppercase font-semibold transition cursor-pointer text-center w-full h-full ${bookingFormat === 'in-person' ? 'bg-[#1C4751] text-[#FAF4E2]' : 'bg-[#EFE5C8] text-[#5C6A6C]'}`}>
                    Chamber In-Person
                  </button>
                  <button type="button" onClick={() => setBookingFormat('online')} className={`text-xs px-3 rounded uppercase font-semibold transition cursor-pointer text-center w-full h-full ${bookingFormat === 'online' ? 'bg-[#1C4751] text-[#FAF4E2]' : 'bg-[#EFE5C8] text-[#5C6A6C]'}`}>
                    Encrypted Zoom
                  </button>
                </div>
              </div>
            </div>

            {/* Session type + Date + Time */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-[#1C4751] uppercase mb-1.5">Session Duration</label>
                <div className="space-y-2">
                  {sessionDurations.map(dur => (
                    <label key={dur} className="flex items-center gap-2 p-2 bg-[#EFE5C8]/40 hover:bg-[#EFE5C8] rounded border border-[#1C4751]/5 cursor-pointer">
                      <input type="radio" name="session_type" checked={sessionDuration === dur} onChange={() => setSessionDuration(dur)} className="accent-[#1C4751]" />
                      <span className="text-[11px] font-semibold text-[#1C4751]">{dur}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-[#1C4751] uppercase mb-1.5">Preferred Date</label>
                <input
                  type="date" required value={bookingDate} min={todayStr}
                  onChange={e => setBookingDate(e.target.value)}
                  className="w-full bg-[#EFE5C8]/70 border border-[#1C4751]/15 px-3 py-2 rounded text-xs text-[#1C4751] font-semibold focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-[#1C4751] uppercase mb-1.5">Available Time Slot</label>
                <select
                  value={bookingTime}
                  onChange={e => setBookingTime(e.target.value)}
                  className="w-full bg-[#EFE5C8]/70 border border-[#1C4751]/15 px-3 py-2 rounded text-xs text-[#1C4751] font-semibold focus:outline-none"
                >
                  {timeSlots.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-[#EFE5C8]/50 p-6 rounded-lg space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#1C4751] border-b border-[#1C4751]/10 pb-2">Your Contact Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-[#1C4751] uppercase mb-1">Full Name *</label>
                  <input
                    type="text" required placeholder="e.g. Tanzim Rahman"
                    value={clientName} onChange={e => setClientName(e.target.value)}
                    className="w-full bg-[#FAF4E2] border border-[#1C4751]/15 px-3 py-2 rounded text-xs text-[#2A3A3E] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-[#1C4751] uppercase mb-1">Email Address</label>
                  <input
                    type="email" placeholder="you@email.com"
                    value={clientEmail} onChange={e => setClientEmail(e.target.value)}
                    className="w-full bg-[#FAF4E2] border border-[#1C4751]/15 px-3 py-2 rounded text-xs text-[#2A3A3E] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-[#1C4751] uppercase mb-1">WhatsApp Phone *</label>
                  <input
                    type="tel" required placeholder="+880 1XXXXXXXXX"
                    value={clientPhone} onChange={e => setClientPhone(e.target.value)}
                    className="w-full bg-[#FAF4E2] border border-[#1C4751]/15 px-3 py-2 rounded text-xs text-[#2A3A3E] focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-[#1C4751] uppercase mb-1">What brings you in? (Optional)</label>
                <textarea
                  rows={3} placeholder="Brief description of what you'd like to address..."
                  value={clientMessage} onChange={e => setClientMessage(e.target.value)}
                  className="w-full bg-[#FAF4E2] border border-[#1C4751]/15 px-3 py-2 rounded text-xs text-[#2A3A3E] focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#1C4751]/12">
              <div className="flex items-start gap-1.5 text-[11px] text-[#5C6A6C]">
                <ShieldAlert className="w-4 h-4 text-[#6E7C4E] mt-0.5 shrink-0" />
                <span>After submitting, a WhatsApp message will open for you to send to confirm your slot.</span>
              </div>
              <button
                type="submit" disabled={submitting}
                className="bg-[#1C4751] border-2 border-[#1C4751] text-[#FAF4E2] hover:bg-[#FAF4E2] hover:text-[#1C4751] disabled:opacity-60 text-xs font-bold uppercase tracking-widest py-3.5 px-8 rounded transition duration-200 cursor-pointer w-full sm:w-auto text-center flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
                {submitting ? 'Submitting...' : 'Book via WhatsApp'}
              </button>
            </div>
          </form>
        </Reveal>
      )}
    </div>
  );
}
