// Form fields shared by the edit drawers, page editors and account page
// (admin/assets/admin.js `field`, `checkFields`), as controlled components.
import { useId } from 'react';

export interface FieldDef {
  k: string;
  label: string;
  type?: 'text' | 'textarea' | 'select' | 'switch' | 'image';
  input?: 'text' | 'email' | 'url' | 'tel' | 'number' | 'password';
  req?: boolean;
  full?: boolean;
  hint?: string;
  mono?: boolean;
  tall?: boolean;
  options?: string[];
  on?: string; // switch caption
  ph?: string;
  pattern?: RegExp;
  patternMsg?: string;
  autoComplete?: string;
}

export type FieldValue = string | boolean | number;

interface FieldProps {
  f: FieldDef;
  value: FieldValue | undefined;
  onChange: (value: FieldValue) => void;
  error?: string;
}

export function Field({ f, value, onChange, error }: FieldProps) {
  const id = `${useId()}-${f.k}`;
  const cls = ['f', f.full && 'full', error && 'bad'].filter(Boolean).join(' ');
  const hint = f.hint ? <span className="hint" id={`${id}-hint`}>{f.hint}</span> : null;
  const err = error ? <span className="err" id={`${id}-err`}>{error}</span> : null;
  // screen readers announce the hint and the error with the control
  const describedBy = [f.hint && `${id}-hint`, error && `${id}-err`].filter(Boolean).join(' ') || undefined;
  const label = <label htmlFor={id}>{f.label}{!f.req && <> <span className="hint">(optional)</span></>}</label>;
  const text = value === undefined || value === null ? '' : String(value);

  if (f.type === 'switch') {
    return (
      <div className={cls}>
        <span className="label">{f.label}</span>
        <label className="switch">
          <input type="checkbox" id={id} aria-describedby={describedBy} checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
          <span className="track" />
          <span>{f.on || 'Shown on the site'}</span>
        </label>
        {hint}{err}
      </div>
    );
  }

  if (f.type === 'select') {
    return (
      <div className={cls}>
        {label}
        <select id={id} aria-describedby={describedBy} value={text} onChange={(e) => onChange(e.target.value)}>
          {!f.options?.includes(text) && <option value={text}>{text}</option>}
          {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        {hint}{err}
      </div>
    );
  }

  if (f.type === 'textarea') {
    return (
      <div className={cls}>
        {label}
        <textarea
          id={id} value={text} onChange={(e) => onChange(e.target.value)}
          className={[f.tall && 'tall', f.mono && 'mono'].filter(Boolean).join(' ') || undefined}
          aria-invalid={Boolean(error)} aria-describedby={describedBy}
        />
        {hint}{err}
      </div>
    );
  }

  const input = (
    <input
      className={f.mono || f.type === 'image' ? 'in mono' : 'in'} id={id} type={f.input || 'text'}
      value={text} placeholder={f.ph} autoComplete={f.autoComplete} aria-invalid={Boolean(error)} aria-describedby={describedBy}
      onChange={(e) => onChange(f.input === 'number' ? Number(e.target.value) : e.target.value)}
    />
  );

  if (f.type === 'image') {
    return (
      <div className={cls}>
        {label}
        <div className="img-field">
          {input}
          <span className="prev">{text && <img src={text} alt="" />}</span>
        </div>
        {hint}{err}
      </div>
    );
  }

  return <div className={cls}>{label}{input}{hint}{err}</div>;
}

// Returns a message per invalid field (empty object when everything is valid).
export function validateFields(fields: FieldDef[], values: Record<string, FieldValue | undefined>) {
  const errors: Record<string, string> = {};
  for (const f of fields) {
    if (f.type === 'switch') continue;
    const v = String(values[f.k] ?? '').trim();
    if (f.req && !v) errors[f.k] = `${f.label} is needed.`;
    else if (v && f.input === 'email' && !/^\S+@\S+\.\S+$/.test(v)) errors[f.k] = 'Enter a full email address, like name@example.com.';
    else if (v && f.input === 'url' && !/^https?:\/\/\S+$/.test(v)) errors[f.k] = 'Paste the full link, starting with https://';
    else if (v && f.pattern && !f.pattern.test(v)) errors[f.k] = f.patternMsg ?? `${f.label} is not in the expected format.`;
  }
  return errors;
}

// Moves focus to the first field marked invalid inside `root`.
export function focusFirstError(root: HTMLElement | null) {
  root?.querySelector<HTMLElement>('.f.bad :is(input, select, textarea)')?.focus();
}
