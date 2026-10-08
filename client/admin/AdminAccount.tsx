import { useEffect, useState } from 'react';
import { authClient } from '../lib/authClient';
import { useAuth } from '../context/AuthContext';

const MIN_PASSWORD_LENGTH = 8;

type Status = { kind: 'ok' | 'error'; text: string } | null;

function InputField({ label, value, onChange, type = 'text', autoComplete }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{label}</span>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)} autoComplete={autoComplete}
        className="w-full bg-[#12121f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all"
      />
    </label>
  );
}

function StatusLine({ status }: { status: Status }) {
  if (!status) return null;
  return <p className={`text-sm ${status.kind === 'ok' ? 'text-emerald-400' : 'text-red-400'}`}>{status.text}</p>;
}

function ProfileCard() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user?.name, user?.email]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setStatus(null);
    try {
      if (name.trim() && name.trim() !== user.name) {
        const { error } = await authClient.updateUser({ name: name.trim() });
        if (error) throw new Error(error.message);
      }
      if (email.trim() && email.trim() !== user.email) {
        const { error } = await authClient.changeEmail({ newEmail: email.trim() });
        if (error) throw new Error(error.message);
      }
      await refreshUser();
      setStatus({ kind: 'ok', text: 'Profile saved.' });
    } catch (err: any) {
      setStatus({ kind: 'error', text: err.message || 'Could not save your profile.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="bg-[#1a1a2e] border border-white/8 rounded-2xl p-6 space-y-4">
      <h2 className="text-lg font-semibold text-white">Profile</h2>
      <InputField label="Name" value={name} onChange={setName} autoComplete="name" />
      <InputField label="Email (used to sign in)" value={email} onChange={setEmail} type="email" autoComplete="email" />
      <StatusLine status={status} />
      <button type="submit" disabled={saving}
        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
        {saving ? 'Saving…' : 'Save profile'}
      </button>
    </form>
  );
}

function PasswordCard() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setStatus({ kind: 'error', text: `The new password needs at least ${MIN_PASSWORD_LENGTH} characters.` });
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus({ kind: 'error', text: 'The new passwords do not match.' });
      return;
    }
    setSaving(true);
    setStatus(null);
    const { error } = await authClient.changePassword({ currentPassword, newPassword, revokeOtherSessions: true });
    setSaving(false);
    if (error) {
      setStatus({ kind: 'error', text: error.message || 'Could not change the password.' });
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setStatus({ kind: 'ok', text: 'Password changed. Other devices have been signed out.' });
  };

  return (
    <form onSubmit={save} className="bg-[#1a1a2e] border border-white/8 rounded-2xl p-6 space-y-4">
      <h2 className="text-lg font-semibold text-white">Password</h2>
      <InputField label="Current password" value={currentPassword} onChange={setCurrentPassword} type="password" autoComplete="current-password" />
      <InputField label="New password" value={newPassword} onChange={setNewPassword} type="password" autoComplete="new-password" />
      <InputField label="Confirm new password" value={confirmPassword} onChange={setConfirmPassword} type="password" autoComplete="new-password" />
      <StatusLine status={status} />
      <button type="submit" disabled={saving || !currentPassword || !newPassword}
        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
        {saving ? 'Changing…' : 'Change password'}
      </button>
    </form>
  );
}

export default function AdminAccount() {
  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Account</h1>
        <p className="text-gray-400 text-sm mt-1">Your sign-in details for the admin panel.</p>
      </div>
      <ProfileCard />
      <PasswordCard />
    </div>
  );
}
