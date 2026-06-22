import { useState, useEffect } from 'react';
import { useAdminData, adminApi } from '../hooks/useApi';
import { Save, Loader2 } from 'lucide-react';
import AdminCrudPage from './AdminCrudPage';

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

function AboutSectionEditor() {
  const { data, loading } = useAdminData<any>('about', {});
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => { if (data?.id) setForm(data); }, [data]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { id, createdAt, updatedAt, ...cleanData } = form;
      await adminApi('about', 'PUT', cleanData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert('Failed: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-indigo-500 animate-spin" /></div>;

  return (
    <section className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/5 space-y-4 mb-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">About Section Content</h2>
        <div className="flex items-center gap-3">
          {success && <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-lg">✓ Saved</span>}
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all cursor-pointer">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Tagline" value={form.tagline || ''} onChange={(v) => setForm({ ...form, tagline: v })} />
        <FormField label="Heading" value={form.heading || ''} onChange={(v) => setForm({ ...form, heading: v })} />
        <FormField label="Location" value={form.location || ''} onChange={(v) => setForm({ ...form, location: v })} />
        <FormField label="Experience" value={form.experience || ''} onChange={(v) => setForm({ ...form, experience: v })} />
      </div>
      <FormField label="Portrait Image URL" value={form.portraitImageUrl || ''} onChange={(v) => setForm({ ...form, portraitImageUrl: v })} placeholder="https://..." />
      <FormField label="Bio Paragraph 1 (supports HTML)" value={form.bio1 || ''} onChange={(v) => setForm({ ...form, bio1: v })} rows={3} />
      <FormField label="Bio Paragraph 2 (supports HTML)" value={form.bio2 || ''} onChange={(v) => setForm({ ...form, bio2: v })} rows={3} />
      <FormField label="Quote" value={form.quote || ''} onChange={(v) => setForm({ ...form, quote: v })} rows={2} />
    </section>
  );
}

export default function AdminAbout() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">About Page</h1>
        <p className="text-sm text-gray-500 mt-1">Edit about page content, credentials, and methodology steps</p>
      </div>

      <AboutSectionEditor />

      <AdminCrudPage
        title="Credentials"
        subtitle="Training and accreditation badges"
        endpoint="credentials"
        displayField="title"
        newItemDefaults={{ title: '', description: '', order: 0 }}
        fields={[
          { key: 'title', label: 'Credential Title', placeholder: 'e.g. CBT (Cognitive Therapy)' },
          { key: 'description', label: 'Description', type: 'textarea', rows: 2 },
          { key: 'order', label: 'Display Order', type: 'number' },
        ]}
      />

      <AdminCrudPage
        title="Methodology Steps"
        subtitle="Three pillars of healing"
        endpoint="methodology-steps"
        displayField="title"
        secondaryField="stepNumber"
        newItemDefaults={{ stepNumber: '01/', title: '', description: '', order: 0 }}
        fields={[
          { key: 'stepNumber', label: 'Step Number', placeholder: 'e.g. 01/' },
          { key: 'title', label: 'Title' },
          { key: 'description', label: 'Description', type: 'textarea', rows: 3 },
          { key: 'order', label: 'Display Order', type: 'number' },
        ]}
      />
    </div>
  );
}
