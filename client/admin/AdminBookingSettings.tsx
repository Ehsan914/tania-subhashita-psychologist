import { useState, useEffect, useRef } from 'react';
import { useAdminData, adminApi } from '../hooks/useApi';
import { Save, Loader2, MessageCircle, Plus, X, ExternalLink, Clock, TimerIcon } from 'lucide-react';

function ChipEditor({
  label, icon, items, newValue, setNewValue, onAdd, onRemove, placeholder, hint,
}: {
  label: string;
  icon: React.ReactNode;
  items: string[];
  newValue: string;
  setNewValue: (v: string) => void;
  onAdd: () => void;
  onRemove: (v: string) => void;
  placeholder: string;
  hint: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const add = () => { onAdd(); setTimeout(() => ref.current?.focus(), 0); };
  return (
    <section className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">{icon}{label}</h2>
        <span className="text-xs text-gray-500">{items.length} option{items.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="flex gap-2">
        <input
          ref={ref}
          type="text"
          value={newValue}
          onChange={e => setNewValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder={placeholder}
          className="flex-1 bg-[#12121f] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
        />
        <button
          type="button" onClick={add}
          disabled={!newValue.trim() || items.includes(newValue.trim())}
          className="flex items-center gap-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 disabled:opacity-40 text-indigo-400 text-xs font-semibold px-4 py-2.5 rounded-xl border border-indigo-500/20 transition-all cursor-pointer disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item, i) => (
            <div key={item} className="flex items-center gap-1.5 bg-[#12121f] border border-white/10 text-white text-xs px-3 py-1.5 rounded-lg">
              <span className="text-gray-500 text-[10px] mr-0.5">{i + 1}.</span>
              {item}
              <button type="button" onClick={() => onRemove(item)} className="text-gray-600 hover:text-red-400 transition-colors cursor-pointer ml-1">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-600 italic">No options yet. Type above and press Add or Enter.</p>
      )}
      <p className="text-[11px] text-gray-600">{hint}</p>
    </section>
  );
}

export default function AdminBookingSettings() {
  const { data, loading } = useAdminData<any>('booking-settings', {});

  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [introText, setIntroText] = useState('');
  const [slotsText, setSlotsText] = useState('');
  const [durations, setDurations] = useState<string[]>([]);
  const [newDuration, setNewDuration] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const parse = (s: string) => (s || '').split('\n').map((x: string) => x.trim()).filter(Boolean);

  useEffect(() => {
    if (data?.id) {
      setWhatsappNumber(data.whatsappNumber || '');
      setIntroText(data.introText || '');
      setSlotsText(data.timeSlots || '');
      setDurations(parse(data.sessionDurations));
    }
  }, [data]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApi('booking-settings', 'PUT', {
        whatsappNumber,
        introText,
        timeSlots: slotsText,
        sessionDurations: durations.join('\n'),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert('Failed to save: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const whatsappPreviewUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, '')}`
    : null;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Booking Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Configure WhatsApp, time slots, and session duration options</p>
        </div>
        <div className="flex items-center gap-3">
          {success && (
            <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-lg">
              ✓ Saved
            </span>
          )}
          <button
            onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-500/20"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* WhatsApp */}
      <section className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/5 space-y-4">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-emerald-400" />
          WhatsApp Number
        </h2>
        <div className="flex gap-3 items-start">
          <div className="flex-1">
            <input
              type="text"
              value={whatsappNumber}
              onChange={e => setWhatsappNumber(e.target.value)}
              placeholder="e.g. 8801580700700"
              className="w-full bg-[#12121f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all font-mono"
            />
            <p className="text-[11px] text-gray-600 mt-1.5">
              International format, no +. Bangladesh: 01580700700 → <span className="text-gray-400 font-mono">8801580700700</span>
            </p>
          </div>
          {whatsappPreviewUrl && (
            <a
              href={whatsappPreviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-emerald-400 border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 px-3 py-3 rounded-xl transition-all whitespace-nowrap"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Test Link
            </a>
          )}
        </div>
      </section>

      {/* Intro Text */}
      <section className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/5 space-y-4">
        <h2 className="text-sm font-semibold text-white">Booking Page Intro Text</h2>
        <textarea
          rows={3}
          value={introText}
          onChange={e => setIntroText(e.target.value)}
          placeholder="Text shown at the top of the booking form..."
          className="w-full bg-[#12121f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none"
        />
      </section>

      {/* Time Slots */}
      <section className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            Available Time Slots
          </h2>
          <span className="text-xs text-gray-500">{slotsText.split('\n').filter(Boolean).length} slots</span>
        </div>
        <textarea
          rows={6}
          value={slotsText}
          onChange={e => setSlotsText(e.target.value)}
          placeholder={"10:00 AM\n11:00 AM\n02:00 PM\n04:00 PM"}
          className="w-full bg-[#12121f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none font-mono"
        />
        {slotsText.split('\n').filter(Boolean).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {slotsText.split('\n').map(s => s.trim()).filter(Boolean).map((slot, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-[#12121f] border border-white/10 text-white text-xs px-3 py-1.5 rounded-lg">
                <span className="text-gray-500 text-[10px] mr-0.5">{i + 1}.</span>
                {slot}
              </div>
            ))}
          </div>
        )}
        <p className="text-[11px] text-gray-600">One time slot per line. These appear as options in the booking form's time slot dropdown.</p>
      </section>

      {/* Session Durations */}
      <ChipEditor
        label="Session Duration Options"
        icon={<TimerIcon className="w-4 h-4 text-amber-400" />}
        items={durations}
        newValue={newDuration}
        setNewValue={setNewDuration}
        onAdd={() => {
          const v = newDuration.trim();
          if (v && !durations.includes(v)) { setDurations(p => [...p, v]); setNewDuration(''); }
        }}
        onRemove={v => setDurations(p => p.filter(d => d !== v))}
        placeholder="e.g. 20-Min Intro (Free)"
        hint="These appear as radio button options in the booking form's session duration section."
      />
    </div>
  );
}
