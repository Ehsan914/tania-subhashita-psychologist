// Small helpers for the content list editor (design: admin/assets/content.js).
import type { FieldValue } from '../ui/fields';
import type { ContentItem, FormValues, SectionConfig } from './types';

export const text = (it: ContentItem, k: string) => {
  const v = it[k];
  return v === undefined || v === null ? '' : String(v);
};

export const lines = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean);

export const slugify = (s: string) =>
  s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const capitalize = (s: string) => `${s[0].toUpperCase()}${s.slice(1)}`;

export const plural = (n: number, sec: SectionConfig) => `${n} ${n === 1 ? sec.one : sec.many}`;

export const errorMessage = (err: unknown) => (err instanceof Error ? err.message : 'Something went wrong.');

export function arrayMove<T>(list: T[], from: number, to: number) {
  const next = [...list];
  const [x] = next.splice(from, 1);
  next.splice(to, 0, x);
  return next;
}

export function isFlagOn(sec: SectionConfig, it: ContentItem) {
  return sec.flag ? Boolean(it[sec.flag]) : true;
}

// The drawer's starting values: the item's own fields, or the section defaults for a new one.
export function formValues(sec: SectionConfig, it: ContentItem | null): FormValues {
  if (!it) return { ...(sec.flag ? { [sec.flag]: true } : {}), ...sec.defaults };
  if (sec.toForm) return sec.toForm(it);
  return Object.fromEntries(sec.fields.map((f) => {
    const v = it[f.k];
    const value: FieldValue = typeof v === 'boolean' || typeof v === 'number' ? v : text(it, f.k);
    return [f.k, value];
  }));
}

// The request body: only the section's editable fields, with text trimmed.
export function payload(sec: SectionConfig, values: FormValues) {
  const picked: FormValues = Object.fromEntries(sec.fields.map((f) => {
    const v = values[f.k];
    if (f.type === 'switch') return [f.k, Boolean(v)];
    return [f.k, typeof v === 'string' ? v.trim() : v ?? ''];
  }));
  return sec.fromForm ? sec.fromForm(picked) : picked;
}

// The order value a new item takes when it joins the end of the list.
export const nextOrder = (items: ContentItem[]) =>
  items.reduce((max, x) => Math.max(max, Number(x.order ?? -1)), -1) + 1;
