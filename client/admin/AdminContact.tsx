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

export default function AdminContact() {
  const { data, loading } = useAdminData<any>('contact', {});
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => { if (data?.id) setForm(data); }, [data]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { id, createdAt, updatedAt, ...cleanData } = form;
      await adminApi('contact', 'PUT', cleanData);
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Contact Information</h1>
          <p className="text-sm text-gray-500 mt-1">Edit clinic details shown on the contact page</p>
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

      <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Clinic Name" value={form.clinicName || ''} onChange={(v) => setForm({ ...form, clinicName: v })} />
          <FormField label="City" value={form.city || ''} onChange={(v) => setForm({ ...form, city: v })} />
          <FormField label="Phone" value={form.phone || ''} onChange={(v) => setForm({ ...form, phone: v })} placeholder="+880 1580 700 700" />
          <FormField label="Email" value={form.email || ''} onChange={(v) => setForm({ ...form, email: v })} />
        </div>
        <FormField label="Full Address" value={form.address || ''} onChange={(v) => setForm({ ...form, address: v })} rows={2} />
        <FormField label="Office Hours" value={form.officeHours || ''} onChange={(v) => setForm({ ...form, officeHours: v })} placeholder="10:00 AM to 8:00 PM" />
        <FormField label="Map Embed URL (optional)" value={form.mapEmbedUrl || ''} onChange={(v) => setForm({ ...form, mapEmbedUrl: v })} placeholder="https://maps.google.com/..." />
      </div>
    </div>
  );
}
