// Edit your own name and sign-in email through Better Auth.
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authClient } from '../../lib/authClient';
import { useAdmin } from '../ui/AdminContext';
import { Field, type FieldDef } from '../ui/fields';
import { FormDialog, useDialogForm } from './FormDialog';

const FIELDS: FieldDef[] = [
  { k: 'name', label: 'Name', req: true, autoComplete: 'name' },
  { k: 'email', label: 'Email', req: true, input: 'email', autoComplete: 'email', hint: 'You sign in with this address.' },
];

export default function ProfileDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, refreshUser } = useAuth();
  const { toast } = useAdmin();
  const form = useDialogForm(FIELDS, { name: '', email: '' });
  const { reset } = form;
  const [saving, setSaving] = useState(false);

  const currentName = user?.name ?? '';
  const currentEmail = user?.email ?? '';

  // Start from the current details when the dialog opens. Only on opening: a save refreshes the
  // session mid-flight, and resetting then would wipe the typed email and any server error.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open && !wasOpen.current) reset({ name: currentName, email: currentEmail });
    wasOpen.current = open;
  }, [open, currentName, currentEmail, reset]);

  const save = async () => {
    if (!user || !form.check()) return;
    const name = form.values.name.trim();
    const email = form.values.email.trim();
    form.setServerError('');
    setSaving(true);
    try {
      if (name !== user.name) {
        const { error } = await authClient.updateUser({ name });
        if (error) throw new Error(error.message);
      }
      if (email !== user.email) {
        const { error } = await authClient.changeEmail({ newEmail: email });
        if (error) throw new Error(error.message);
      }
      await refreshUser();
      toast('Profile saved.');
      onClose();
    } catch (err) {
      form.setServerError((err instanceof Error && err.message) || 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormDialog
      open={open} onClose={onClose} title="Edit your profile" submitLabel="Save" savingLabel="Saving…"
      saving={saving} serverError={form.serverError} formRef={form.formRef} onSubmit={save}
    >
      {FIELDS.map((f) => (
        <Field key={f.k} f={f} value={form.values[f.k]} error={form.errors[f.k]} onChange={(v) => form.setValue(f.k, String(v))} />
      ))}
    </FormDialog>
  );
}
