// Change your own password (design: users.js "Change your password"). Other sessions are
// signed out when it changes.
import { useEffect, useState } from 'react';
import { authClient } from '../../lib/authClient';
import { useAdmin } from '../ui/AdminContext';
import { Field, type FieldDef } from '../ui/fields';
import { FormDialog, useDialogForm } from './FormDialog';

const MIN_PASSWORD_LENGTH = 8;
const EMPTY = { current: '', next: '', again: '' };

const FIELDS: FieldDef[] = [
  { k: 'current', label: 'Current password', req: true, input: 'password', autoComplete: 'current-password' },
  {
    k: 'next', label: 'New password', req: true, input: 'password', autoComplete: 'new-password',
    hint: `At least ${MIN_PASSWORD_LENGTH} characters. A short sentence works well.`,
    pattern: new RegExp(`^.{${MIN_PASSWORD_LENGTH},}$`), patternMsg: `Use at least ${MIN_PASSWORD_LENGTH} characters.`,
  },
  { k: 'again', label: 'New password again', req: true, input: 'password', autoComplete: 'new-password' },
];

export default function PasswordDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useAdmin();
  const form = useDialogForm(FIELDS, EMPTY);
  const { reset } = form;
  const [saving, setSaving] = useState(false);

  // never keep typed passwords between openings
  useEffect(() => {
    if (open) reset(EMPTY);
  }, [open, reset]);

  const save = async () => {
    const { current, next, again } = form.values;
    const mismatch: Record<string, string> = next !== again ? { again: 'The two new passwords don’t match.' } : {};
    if (!form.check(mismatch)) return;
    form.setServerError('');
    setSaving(true);
    const { error } = await authClient.changePassword({ currentPassword: current, newPassword: next, revokeOtherSessions: true });
    setSaving(false);
    if (error) {
      form.setServerError(error.message || 'Could not change the password.');
      return;
    }
    reset(EMPTY);
    toast('Password changed. Other devices are signed out.');
    onClose();
  };

  return (
    <FormDialog
      open={open} onClose={onClose} title="Change your password" submitLabel="Change password" savingLabel="Changing…"
      saving={saving} serverError={form.serverError} formRef={form.formRef} onSubmit={save}
    >
      {FIELDS.map((f) => (
        <Field key={f.k} f={f} value={form.values[f.k]} error={form.errors[f.k]} onChange={(v) => form.setValue(f.k, String(v))} />
      ))}
    </FormDialog>
  );
}
