import { useState } from 'react';
import { useAdminData, adminApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { Plus, Pencil, Trash2, X, Loader2, Shield, ShieldCheck, KeyRound, User, RefreshCw } from 'lucide-react';

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: string | null;
  isSuperAdmin: boolean;
  createdAt: string;
}

type Modal =
  | { type: 'add' }
  | { type: 'edit'; user: AdminUser }
  | { type: 'password'; user: AdminUser }
  | { type: 'delete'; user: AdminUser }
  | null;

function InputField({ label, value, onChange, type = 'text', placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#12121f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all"
      />
    </div>
  );
}

function Avatar({ user }: { user: AdminUser }) {
  if (user.avatarUrl) {
    return <img src={user.avatarUrl} alt={user.name ?? user.email} className="w-10 h-10 rounded-full object-cover" />;
  }
  const initials = (user.name ?? user.email).slice(0, 2).toUpperCase();
  return (
    <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-sm font-semibold text-indigo-300">
      {initials}
    </div>
  );
}

export default function AdminUsers() {
  const { user: me, refreshUser } = useAuth();
  const { data: users, loading, refetch } = useAdminData<AdminUser[]>('users', []);
  const [modal, setModal] = useState<Modal>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [regenResult, setRegenResult] = useState<{ user: AdminUser; password: string } | null>(null);
  const [regenLoading, setRegenLoading] = useState<string | null>(null); // holds user id while regenerating

  const isSuperAdmin = me?.isSuperAdmin ?? false;

  // ── Add user form state ──
  const [addForm, setAddForm] = useState({ email: '', name: '', role: '', isSuperAdmin: false });

  // ── Edit profile form state ──
  const [editForm, setEditForm] = useState({ email: '', name: '', role: '', avatarUrl: '' });

  // ── Password form state ──
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  function openEdit(user: AdminUser) {
    setEditForm({ email: user.email, name: user.name ?? '', role: user.role ?? '', avatarUrl: user.avatarUrl ?? '' });
    setError('');
    setModal({ type: 'edit', user });
  }

  function openPassword(user: AdminUser) {
    setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setError('');
    setModal({ type: 'password', user });
  }

  function openAdd() {
    setAddForm({ email: '', name: '', role: '', isSuperAdmin: false });
    setGeneratedPassword(null);
    setError('');
    setModal({ type: 'add' });
  }

  async function handleAdd() {
    if (!addForm.email) { setError('Email is required.'); return; }
    setSaving(true); setError('');
    try {
      const result = await adminApi<AdminUser & { generatedPassword: string }>('users', 'POST', addForm);
      setGeneratedPassword(result.generatedPassword);
      await refetch();
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  }

  async function handleEdit() {
    if (modal?.type !== 'edit') return;
    setSaving(true); setError('');
    try {
      await adminApi(`users/${modal.user.id}`, 'PUT', editForm);
      if (modal.user.id === me?.id) await refreshUser();
      await refetch();
      setModal(null);
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  }

  async function handlePassword() {
    if (modal?.type !== 'password') return;
    if (pwForm.newPassword !== pwForm.confirmPassword) { setError('Passwords do not match.'); return; }
    if (pwForm.newPassword.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setSaving(true); setError('');
    try {
      await adminApi(`users/${modal.user.id}/change-password`, 'POST', {
        currentPassword: modal.user.id === me?.id ? pwForm.currentPassword : undefined,
        newPassword: pwForm.newPassword,
      });
      setModal(null);
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (modal?.type !== 'delete') return;
    setSaving(true); setError('');
    try {
      await adminApi(`users/${modal.user.id}`, 'DELETE');
      await refetch();
      setModal(null);
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  }

  async function handleRegen(u: AdminUser) {
    setRegenLoading(u.id);
    try {
      const result = await adminApi<{ generatedPassword: string }>(`users/${u.id}/regenerate-password`, 'POST');
      setRegenResult({ user: u, password: result.generatedPassword });
    } catch (e: any) {
      alert(e.message);
    } finally {
      setRegenLoading(null);
    }
  }

  const canEdit = (u: AdminUser) => isSuperAdmin || u.id === me?.id;
  const canDelete = (u: AdminUser) => isSuperAdmin && u.id !== me?.id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Users</h1>
          <p className="text-gray-400 text-sm mt-1">
            {isSuperAdmin ? 'Manage who can access this admin panel.' : 'View admin team members.'}
          </p>
        </div>
        {isSuperAdmin && (
          <button onClick={openAdd}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Add User
          </button>
        )}
      </div>

      {/* User list */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-indigo-400 animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {users.map(u => (
            <div key={u.id} className="bg-[#1a1a2e] border border-white/8 rounded-2xl p-4 flex items-center gap-4">
              <Avatar user={u} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-white truncate">{u.name ?? u.email}</span>
                  {u.isSuperAdmin && (
                    <span className="flex items-center gap-1 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-full px-2 py-0.5 text-xs font-medium">
                      <ShieldCheck className="w-3 h-3" /> Super Admin
                    </span>
                  )}
                  {u.role && !u.isSuperAdmin && (
                    <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-full px-2 py-0.5 text-xs">
                      {u.role}
                    </span>
                  )}
                  {u.id === me?.id && (
                    <span className="bg-white/5 text-gray-400 rounded-full px-2 py-0.5 text-xs">You</span>
                  )}
                </div>
                <p className="text-gray-400 text-sm truncate">{u.email}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {canEdit(u) && (
                  <button onClick={() => openEdit(u)} title="Edit profile"
                    className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                )}
                {isSuperAdmin && (
                  <>
                    <button onClick={() => openPassword(u)} title="Change password"
                      className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                      <KeyRound className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleRegen(u)} title="Regenerate password" disabled={regenLoading === u.id}
                      className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors disabled:opacity-50">
                      {regenLoading === u.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <RefreshCw className="w-4 h-4" />}
                    </button>
                  </>
                )}
                {canDelete(u) && (
                  <button onClick={() => { setError(''); setModal({ type: 'delete', user: u }); }} title="Delete user"
                    className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add Modal ── */}
      {modal?.type === 'add' && (
        <ModalShell title="Add Admin User" onClose={() => { setGeneratedPassword(null); setModal(null); }}>
          <div className="space-y-4">
            {generatedPassword ? (
              <>
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                  <p className="text-green-400 text-sm font-medium mb-3">User created! Share this password with them:</p>
                  <div className="flex items-center gap-2 bg-[#12121f] border border-white/10 rounded-xl px-4 py-3">
                    <span className="flex-1 font-mono text-white tracking-widest text-lg">{generatedPassword}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(generatedPassword)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 shrink-0 transition-colors"
                    >Copy</button>
                  </div>
                  <p className="text-gray-500 text-xs mt-2">This password will not be shown again.</p>
                </div>
                <button
                  onClick={() => { setGeneratedPassword(null); setModal(null); }}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
                >Done</button>
              </>
            ) : (
              <>
                <InputField label="Email" value={addForm.email} onChange={v => setAddForm(f => ({ ...f, email: v }))} type="email" placeholder="user@example.com" required />
                <InputField label="Display Name" value={addForm.name} onChange={v => setAddForm(f => ({ ...f, name: v }))} placeholder="Defaults to username part of email" />
                <InputField label="Role" value={addForm.role} onChange={v => setAddForm(f => ({ ...f, role: v }))} placeholder="Defaults to User" />
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={addForm.isSuperAdmin}
                    onChange={e => setAddForm(f => ({ ...f, isSuperAdmin: e.target.checked }))}
                    className="w-4 h-4 rounded accent-amber-500 bg-[#12121f] border-white/10" />
                  <span className="text-sm text-gray-300 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-amber-400" /> Grant super admin privileges
                  </span>
                </label>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <ModalActions onCancel={() => setModal(null)} onConfirm={handleAdd} saving={saving} confirmLabel="Add User" />
              </>
            )}
          </div>
        </ModalShell>
      )}

      {/* ── Edit Modal ── */}
      {modal?.type === 'edit' && (
        <ModalShell title="Edit Profile" onClose={() => setModal(null)}>
          <div className="space-y-4">
            {isSuperAdmin && (
              <InputField label="Email" value={editForm.email} onChange={v => setEditForm(f => ({ ...f, email: v }))} type="email" placeholder="user@example.com" required />
            )}
            <InputField label="Display Name" value={editForm.name} onChange={v => setEditForm(f => ({ ...f, name: v }))} placeholder="e.g. Tania Subhashita" />
            <InputField label="Role" value={editForm.role} onChange={v => setEditForm(f => ({ ...f, role: v }))} placeholder="e.g. Content Editor" />
            <InputField label="Avatar URL" value={editForm.avatarUrl} onChange={v => setEditForm(f => ({ ...f, avatarUrl: v }))} placeholder="https://..." />
            {editForm.avatarUrl && (
              <div className="flex items-center gap-3">
                <img src={editForm.avatarUrl} alt="preview" className="w-10 h-10 rounded-full object-cover border border-white/10" onError={e => (e.currentTarget.style.display = 'none')} />
                <span className="text-xs text-gray-500">Preview</span>
              </div>
            )}
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <ModalActions onCancel={() => setModal(null)} onConfirm={handleEdit} saving={saving} confirmLabel="Save" />
          </div>
        </ModalShell>
      )}

      {/* ── Password Modal ── */}
      {modal?.type === 'password' && (
        <ModalShell title={modal.user.id === me?.id ? 'Change Password' : `Reset Password — ${modal.user.name ?? modal.user.email}`} onClose={() => setModal(null)}>
          <div className="space-y-4">
            {modal.user.id === me?.id && (
              <InputField label="Current Password" value={pwForm.currentPassword} onChange={v => setPwForm(f => ({ ...f, currentPassword: v }))} type="password" required />
            )}
            <InputField label="New Password" value={pwForm.newPassword} onChange={v => setPwForm(f => ({ ...f, newPassword: v }))} type="password" placeholder="Min. 8 characters" required />
            <InputField label="Confirm New Password" value={pwForm.confirmPassword} onChange={v => setPwForm(f => ({ ...f, confirmPassword: v }))} type="password" required />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <ModalActions onCancel={() => setModal(null)} onConfirm={handlePassword} saving={saving} confirmLabel="Change Password" />
          </div>
        </ModalShell>
      )}

      {/* ── Regenerate Password Result Modal ── */}
      {regenResult && (
        <ModalShell title="New Password Generated" onClose={() => setRegenResult(null)}>
          <div className="space-y-4">
            <p className="text-gray-300 text-sm">
              Share this new password with <span className="text-white font-medium">{regenResult.user.name ?? regenResult.user.email}</span>. Their previous password and all active sessions have been invalidated.
            </p>
            <div className="flex items-center gap-2 bg-[#12121f] border border-white/10 rounded-xl px-4 py-3">
              <span className="flex-1 font-mono text-white tracking-widest text-lg">{regenResult.password}</span>
              <button
                onClick={() => navigator.clipboard.writeText(regenResult.password)}
                className="text-xs text-indigo-400 hover:text-indigo-300 shrink-0 transition-colors"
              >Copy</button>
            </div>
            <p className="text-gray-500 text-xs">This password will not be shown again.</p>
            <button
              onClick={() => setRegenResult(null)}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
            >Done</button>
          </div>
        </ModalShell>
      )}

      {/* ── Delete Confirm Modal ── */}
      {modal?.type === 'delete' && (
        <ModalShell title="Delete User" onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <User className="w-8 h-8 text-red-400 shrink-0" />
              <div>
                <p className="text-white font-medium">{modal.user.name ?? modal.user.email}</p>
                <p className="text-gray-400 text-sm">{modal.user.email}</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm">This will permanently delete the user and revoke all their sessions. This cannot be undone.</p>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <ModalActions onCancel={() => setModal(null)} onConfirm={handleDelete} saving={saving} confirmLabel="Delete" danger />
          </div>
        </ModalShell>
      )}
    </div>
  );
}

function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <h2 className="font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function ModalActions({ onCancel, onConfirm, saving, confirmLabel, danger }: {
  onCancel: () => void; onConfirm: () => void; saving: boolean; confirmLabel: string; danger?: boolean;
}) {
  return (
    <div className="flex gap-3 justify-end pt-2">
      <button onClick={onCancel} disabled={saving}
        className="px-4 py-2 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50">
        Cancel
      </button>
      <button onClick={onConfirm} disabled={saving}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50 ${
          danger ? 'bg-red-600 hover:bg-red-500' : 'bg-indigo-600 hover:bg-indigo-500'
        }`}>
        {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        {confirmLabel}
      </button>
    </div>
  );
}
