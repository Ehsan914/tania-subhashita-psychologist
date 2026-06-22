import { useState, useEffect } from 'react';
import { useAdminData, adminApi } from '../hooks/useApi';
import { Save, Loader2 } from 'lucide-react';

function FormField({ label, value, onChange, rows, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{label}</label>
      {rows ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder}
          className="w-full bg-[#12121f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all resize-none" />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="w-full bg-[#12121f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all" />
      )}
    </div>
  );
}

function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-indigo-500' : 'bg-gray-700'}`}
        onClick={() => onChange(!checked)}>
        <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-sm ${checked ? 'translate-x-5' : ''}`} />
      </div>
      <span className="text-sm text-gray-300">{label}</span>
    </label>
  );
}

export default function AdminSettings() {
  const { data, loading } = useAdminData<any>('site-settings', {});
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => { if (data?.id) setForm(data); }, [data]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { id, createdAt, updatedAt, ...cleanData } = form;
      await adminApi('site-settings', 'PUT', cleanData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert('Failed: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-indigo-500 animate-spin" /></div>;

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Site Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Global configuration for the website</p>
        </div>
        <div className="flex items-center gap-3">
          {success && <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-lg">✓ Saved</span>}
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-500/20">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/5 space-y-6">
        <h2 className="text-lg font-semibold text-white">Branding</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Site Name" value={form.siteName || ''} onChange={(v) => setForm({ ...form, siteName: v })} />
          <FormField label="Site Tagline" value={form.siteTagline || ''} onChange={(v) => setForm({ ...form, siteTagline: v })} />
        </div>
      </div>

      <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/5 space-y-6">
        <h2 className="text-lg font-semibold text-white">Announcement Banner</h2>
        <ToggleField label="Show announcement banner" checked={form.announcementActive ?? true} onChange={(v) => setForm({ ...form, announcementActive: v })} />
        <FormField label="Announcement HTML" value={form.announcementText || ''} onChange={(v) => setForm({ ...form, announcementText: v })} rows={2} />
      </div>

      <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/5 space-y-6">
        <h2 className="text-lg font-semibold text-white">Social Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Facebook URL" value={form.facebookUrl || ''} onChange={(v) => setForm({ ...form, facebookUrl: v })} placeholder="https://facebook.com/..." />
          <FormField label="Instagram URL" value={form.instagramUrl || ''} onChange={(v) => setForm({ ...form, instagramUrl: v })} placeholder="https://instagram.com/..." />
          <FormField label="LinkedIn URL" value={form.linkedinUrl || ''} onChange={(v) => setForm({ ...form, linkedinUrl: v })} placeholder="https://linkedin.com/..." />
        </div>
      </div>
    </div>
  );
}
