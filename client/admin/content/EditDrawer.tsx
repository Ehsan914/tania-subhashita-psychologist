// The add/edit side panel for one item, with the section's fields and in-place validation.
import { useRef, useState, type FormEvent } from 'react';
import { flushSync } from 'react-dom';
import { useAdmin } from '../ui/AdminContext';
import { Field, focusFirstError, validateFields, type FieldValue } from '../ui/fields';
import { Icon } from '../ui/icons';
import { Drawer } from '../ui/overlay';
import { errorMessage, formValues, payload, slugify, text } from './helpers';
import type { ContentItem, FormValues, SectionConfig } from './types';

interface EditDrawerProps {
  sec: SectionConfig;
  open: boolean;
  item: ContentItem | null; // null adds a new item
  items: ContentItem[]; // the whole list, to keep web addresses unique
  onClose: () => void;
  onSave: (body: Record<string, unknown>) => Promise<void>;
  onDelete: () => void;
}

// New items get a web address from their name until it is edited by hand.
const SLUG_SOURCES = ['name', 'title'];

export function EditDrawer({ sec, open, item, items, onClose, onSave, onDelete }: EditDrawerProps) {
  const { toast } = useAdmin();
  const isNew = item === null;
  const [values, setValues] = useState<FormValues>(() => formValues(sec, item));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const slugTouched = useRef(false);
  const form = useRef<HTMLFormElement>(null);
  const hasSlug = sec.fields.some((f) => f.k === 'slug');

  const change = (k: string, v: FieldValue) => {
    if (k === 'slug') slugTouched.current = true;
    setValues((prev) => {
      const next = { ...prev, [k]: v };
      if (isNew && hasSlug && !slugTouched.current && SLUG_SOURCES.includes(k)) next.slug = slugify(String(v));
      return next;
    });
  };

  const isTaken = () => {
    if (!sec.unique) return false;
    const v = String(values[sec.unique] ?? '').trim();
    return items.some((x) => x.id !== item?.id && text(x, sec.unique as string) === v);
  };

  const save = async () => {
    if (saving) return;
    const errs = validateFields(sec.fields, values);
    if (!Object.keys(errs).length && sec.unique && isTaken()) errs[sec.unique] = 'Another item already uses this web address.';
    flushSync(() => setErrors(errs));
    if (Object.keys(errs).length) {
      focusFirstError(form.current);
      return;
    }
    setSaving(true);
    try {
      await onSave(payload(sec, values));
    } catch (err) {
      toast(errorMessage(err), 'err');
      setSaving(false);
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    save();
  };

  return (
    <Drawer
      open={open} onClose={onClose}
      title={isNew ? `New ${sec.one}` : sec.main(item)}
      sub={isNew ? 'Fill in the details, then add it.' : `Editing this ${sec.one}`}
      footer={(
        <>
          {!isNew && <button className="abtn ghost left" type="button" onClick={onDelete}><Icon name="trash" />Delete</button>}
          <button className="abtn ghost" type="button" onClick={onClose}>Cancel</button>
          <button className="abtn primary" type="button" onClick={save} disabled={saving}>
            {saving && <span className="spin" aria-hidden="true" />}
            {isNew ? `Add ${sec.one}` : 'Save changes'}
          </button>
        </>
      )}
    >
      <form ref={form} className="form" noValidate onSubmit={submit}>
        {sec.fields.map((f) => (
          <Field key={f.k} f={f} value={values[f.k]} error={errors[f.k]} onChange={(v) => change(f.k, v)} />
        ))}
      </form>
    </Drawer>
  );
}
