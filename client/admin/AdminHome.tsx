import { useState, useEffect } from 'react';
import { useAdminData, adminApi } from '../hooks/useApi';
import { Save, Loader2 } from 'lucide-react';

// Reusable form field component for admin pages
function FormField({ label, value, onChange, type = 'text', rows, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; rows?: number; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{label}</label>
      {rows ? (
        <textarea
          value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder}
          className="w-full bg-[#12121f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none"
        />
      ) : (
        <input
          type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="w-full bg-[#12121f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
        />
      )}
    </div>
  );
}

function SaveButton({ saving, onClick }: { saving: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick} disabled={saving}
      className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-500/20"
    >
      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
      {saving ? 'Saving...' : 'Save Changes'}
    </button>
  );
}

function SuccessMessage({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-lg">
      ✓ Changes saved successfully
    </div>
  );
}

export default function AdminHome() {
  const { data: hero, loading: heroLoading } = useAdminData<any>('hero', {});
  const { data: welcome, loading: welcomeLoading } = useAdminData<any>('welcome', {});
  const { data: quote, loading: quoteLoading } = useAdminData<any>('methodology-quote', {});
  const { data: cta, loading: ctaLoading } = useAdminData<any>('cta', {});

  const [heroForm, setHeroForm] = useState<any>({});
  const [welcomeForm, setWelcomeForm] = useState<any>({});
  const [quoteForm, setQuoteForm] = useState<any>({});
  const [ctaForm, setCtaForm] = useState<any>({});

  const [saving, setSaving] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { if (hero?.id) setHeroForm(hero); }, [hero]);
  useEffect(() => { if (welcome?.id) setWelcomeForm(welcome); }, [welcome]);
  useEffect(() => { if (quote?.id) setQuoteForm(quote); }, [quote]);
  useEffect(() => { if (cta?.id) setCtaForm(cta); }, [cta]);

  const saveSection = async (endpoint: string, data: any, sectionName: string) => {
    setSaving(sectionName);
    try {
      const { id, createdAt, updatedAt, ...cleanData } = data;
      await adminApi(endpoint, 'PUT', cleanData);
      setSuccess(sectionName);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      alert('Failed to save: ' + (err as Error).message);
    } finally {
      setSaving('');
    }
  };

  const loading = heroLoading || welcomeLoading || quoteLoading || ctaLoading;
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Home Page</h1>
        <p className="text-sm text-gray-500 mt-1">Edit the main sections of the homepage</p>
      </div>

      {/* Hero Section */}
      <section className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Hero Section</h2>
          <div className="flex items-center gap-3">
            <SuccessMessage show={success === 'hero'} />
            <SaveButton saving={saving === 'hero'} onClick={() => saveSection('hero', heroForm, 'hero')} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Tagline" value={heroForm.tagline || ''} onChange={(v) => setHeroForm({ ...heroForm, tagline: v })} />
          <FormField label="Title Line 1" value={heroForm.titleLine1 || ''} onChange={(v) => setHeroForm({ ...heroForm, titleLine1: v })} />
          <FormField label="Title Line 2" value={heroForm.titleLine2 || ''} onChange={(v) => setHeroForm({ ...heroForm, titleLine2: v })} />
          <FormField label="Title Line 3 (italic)" value={heroForm.titleLine3 || ''} onChange={(v) => setHeroForm({ ...heroForm, titleLine3: v })} />
        </div>
        <FormField label="Description" value={heroForm.description || ''} onChange={(v) => setHeroForm({ ...heroForm, description: v })} rows={3} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Primary CTA Text" value={heroForm.ctaPrimaryText || ''} onChange={(v) => setHeroForm({ ...heroForm, ctaPrimaryText: v })} />
          <FormField label="Secondary CTA Text" value={heroForm.ctaSecondaryText || ''} onChange={(v) => setHeroForm({ ...heroForm, ctaSecondaryText: v })} />
          <div className='flex flex-col gap-3'>
          <FormField
            label="Portrait Image URL (Google Drive link)"
            value={heroForm.portraitImageUrl || ''}
            onChange={(v) => setHeroForm({ ...heroForm, portraitImageUrl: v })}
            placeholder="https://drive.google.com/file/d/.../view"
          />
          <p className="text-[11px] text-gray-500 -mt-2">
            In Drive: right-click the file → Share → set General access to "Anyone with the link." Paste that link here.
          </p>
          </div>
          <FormField label="Portrait Quote" value={heroForm.portraitQuote || ''} onChange={(v) => setHeroForm({ ...heroForm, portraitQuote: v })} />
          <FormField label="Portrait Attribution" value={heroForm.portraitAttribution || ''} onChange={(v) => setHeroForm({ ...heroForm, portraitAttribution: v })} />
        </div>
      </section>

      {/* Welcome Section */}
      <section className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Welcome Section</h2>
          <div className="flex items-center gap-3">
            <SuccessMessage show={success === 'welcome'} />
            <SaveButton saving={saving === 'welcome'} onClick={() => saveSection('welcome', welcomeForm, 'welcome')} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Script Title" value={welcomeForm.scriptTitle || ''} onChange={(v) => setWelcomeForm({ ...welcomeForm, scriptTitle: v })} />
          <FormField label="Heading" value={welcomeForm.heading || ''} onChange={(v) => setWelcomeForm({ ...welcomeForm, heading: v })} />
        </div>
        <FormField label="Paragraph 1" value={welcomeForm.paragraph1 || ''} onChange={(v) => setWelcomeForm({ ...welcomeForm, paragraph1: v })} rows={3} />
        <FormField label="Paragraph 2 (supports HTML)" value={welcomeForm.paragraph2 || ''} onChange={(v) => setWelcomeForm({ ...welcomeForm, paragraph2: v })} rows={3} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Credential Name" value={welcomeForm.credentialName || ''} onChange={(v) => setWelcomeForm({ ...welcomeForm, credentialName: v })} />
          <FormField label="Credential Title" value={welcomeForm.credentialTitle || ''} onChange={(v) => setWelcomeForm({ ...welcomeForm, credentialTitle: v })} />
        </div>
        <FormField label="Portrait Image URL" value={welcomeForm.portraitImageUrl || ''} onChange={(v) => setWelcomeForm({ ...welcomeForm, portraitImageUrl: v })} placeholder="https://..." />
      </section>

      {/* Methodology Quote */}
      <section className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Methodology Quote</h2>
          <div className="flex items-center gap-3">
            <SuccessMessage show={success === 'methodology-quote'} />
            <SaveButton saving={saving === 'methodology-quote'} onClick={() => saveSection('methodology-quote', quoteForm, 'methodology-quote')} />
          </div>
        </div>
        <FormField label="Script Title" value={quoteForm.scriptTitle || ''} onChange={(v) => setQuoteForm({ ...quoteForm, scriptTitle: v })} />
        <FormField label="Quote Text" value={quoteForm.quote || ''} onChange={(v) => setQuoteForm({ ...quoteForm, quote: v })} rows={3} />
        <FormField label="Attribution" value={quoteForm.attribution || ''} onChange={(v) => setQuoteForm({ ...quoteForm, attribution: v })} />
      </section>

      {/* CTA Section */}
      <section className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Call to Action Section</h2>
          <div className="flex items-center gap-3">
            <SuccessMessage show={success === 'cta'} />
            <SaveButton saving={saving === 'cta'} onClick={() => saveSection('cta', ctaForm, 'cta')} />
          </div>
        </div>
        <FormField label="Heading" value={ctaForm.heading || ''} onChange={(v) => setCtaForm({ ...ctaForm, heading: v })} rows={2} />
        <FormField label="Subtitle" value={ctaForm.subtitle || ''} onChange={(v) => setCtaForm({ ...ctaForm, subtitle: v })} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Script Title" value={ctaForm.scriptTitle || ''} onChange={(v) => setCtaForm({ ...ctaForm, scriptTitle: v })} />
          <FormField label="Button Text" value={ctaForm.buttonText || ''} onChange={(v) => setCtaForm({ ...ctaForm, buttonText: v })} />
        </div>
      </section>
    </div>
  );
}
