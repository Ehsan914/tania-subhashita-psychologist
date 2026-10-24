// Contact: "Ask a question". There is no contact endpoint, so a valid form opens the
// visitor's email app with the question addressed to the practice inbox.
import { useState, type FormEvent } from 'react';

const FIELDS = ['name', 'email', 'phone', 'message'] as const;
type FieldName = (typeof FIELDS)[number];
type Values = Record<FieldName, string>;

interface ContactFormProps {
  to: string;
  onSent: (name: string) => void;
}

// Same rule as the design's UI.validate: the browser's own constraint check per field.
function invalidFields(form: HTMLFormElement): FieldName[] {
  return FIELDS.filter((name) => {
    const el = form.elements.namedItem(name);
    return (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) && !el.checkValidity();
  });
}

function composeMailto(to: string, v: Values): string {
  const contactLines = [v.name, `Email: ${v.email}`, v.phone && `Phone: ${v.phone}`].filter(Boolean);
  const body = [v.message || '(No question written yet.)', '', ...contactLines].join('\n');
  const subject = `A question from ${v.name}`;
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function ContactForm({ to, onSent }: ContactFormProps) {
  const [errors, setErrors] = useState<ReadonlySet<FieldName>>(new Set());

  const fieldClass = (name: FieldName, full = false) =>
    ['field', full && 'full', errors.has(name) && 'has-error'].filter(Boolean).join(' ');
  const clearError = (name: FieldName) => {
    if (errors.has(name)) setErrors(new Set([...errors].filter((n) => n !== name)));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const bad = invalidFields(form);
    setErrors(new Set(bad));
    if (bad.length > 0) {
      (form.elements.namedItem(bad[0]) as HTMLElement | null)?.focus();
      return;
    }
    const data = new FormData(form);
    const values = Object.fromEntries(FIELDS.map((n) => [n, String(data.get(n) ?? '').trim()])) as Values;
    window.location.href = composeMailto(to, values);
    onSent(values.name);
  };

  return (
    <form noValidate onSubmit={handleSubmit}>
      <h2 className="h3">Ask a question</h2>
      <p className="intro">Have something to ask before booking? Write a line or two — Tania replies personally, usually within a day.</p>
      <div className="form-grid">
        <div className={fieldClass('name', true)}>
          <label htmlFor="c-name">Your name</label>
          <input className="input" id="c-name" name="name" required autoComplete="name"
            aria-invalid={errors.has('name')} aria-describedby="c-name-error" onInput={() => clearError('name')} />
          <span className="error" id="c-name-error">Please tell me what to call you.</span>
        </div>
        <div className={fieldClass('email')}>
          <label htmlFor="c-email">Email</label>
          <input className="input" id="c-email" name="email" type="email" required autoComplete="email"
            aria-invalid={errors.has('email')} aria-describedby="c-email-error" onInput={() => clearError('email')} />
          <span className="error" id="c-email-error">Please enter an email I can reply to.</span>
        </div>
        <div className={fieldClass('phone')}>
          <label htmlFor="c-phone">
            Phone <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 500 }}>(optional)</span>
          </label>
          <input className="input" id="c-phone" name="phone" type="tel" autoComplete="tel" placeholder="+880 1…" />
        </div>
        <div className={fieldClass('message', true)}>
          <label htmlFor="c-msg">Your question</label>
          <textarea className="input" id="c-msg" name="message" rows={4} placeholder="A sentence or two is plenty." />
        </div>
      </div>
      <div className="submit-row">
        <small>Everything you write stays confidential.</small>
        <button className="btn" type="submit">Send question <span className="arrow" aria-hidden="true">→</span></button>
      </div>
    </form>
  );
}
