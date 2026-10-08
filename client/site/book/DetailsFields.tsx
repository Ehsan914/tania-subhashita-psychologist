// Fieldset 04: who the request is from, with the design's inline error states.
import type { ClientDetails, DetailErrors } from './booking';

interface DetailsFieldsProps {
  details: ClientDetails;
  errors: DetailErrors;
  onChange: (key: keyof ClientDetails, value: string) => void;
}

const OPTIONAL_STYLE = { textTransform: 'none', letterSpacing: 0, fontWeight: 500 } as const;
const fieldClass = (bad?: boolean) => (bad ? 'field has-error' : 'field');

export function DetailsFields({ details, errors, onChange }: DetailsFieldsProps) {
  return (
    <fieldset>
      <legend><span>04</span> About you</legend>
      <div className="two">
        <div className={fieldClass(errors.name)}>
          <label htmlFor="b-name">Your name</label>
          <input
            className="input" id="b-name" name="name" required autoComplete="name" maxLength={200}
            aria-invalid={errors.name ?? false} aria-describedby={errors.name ? 'b-name-error' : undefined}
            value={details.name} onChange={(e) => onChange('name', e.target.value)}
          />
          <span className="error" id="b-name-error">Please tell me what to call you.</span>
        </div>
        <div className={fieldClass(errors.phone)}>
          <label htmlFor="b-phone">WhatsApp number</label>
          <input
            className="input" id="b-phone" name="phone" type="tel" required pattern="[+0-9 ()\-]{8,}"
            autoComplete="tel" placeholder="+880 1…" maxLength={30}
            aria-invalid={errors.phone ?? false} aria-describedby={errors.phone ? 'b-phone-error' : undefined}
            value={details.phone} onChange={(e) => onChange('phone', e.target.value)}
          />
          <span className="error" id="b-phone-error">A WhatsApp number lets Tania confirm your time.</span>
        </div>
      </div>
      <div className={fieldClass(errors.email)}>
        <label htmlFor="b-email">Email <span style={OPTIONAL_STYLE}>(optional)</span></label>
        <input
          className="input" id="b-email" name="email" type="email" autoComplete="email" maxLength={254}
          aria-invalid={errors.email ?? false} aria-describedby={errors.email ? 'b-email-error' : undefined}
          value={details.email} onChange={(e) => onChange('email', e.target.value)}
        />
        <span className="error" id="b-email-error">That email doesn't look quite right.</span>
      </div>
      <div className="field">
        <label htmlFor="b-msg">Anything you'd like Tania to know? <span style={OPTIONAL_STYLE}>(optional)</span></label>
        <textarea
          className="input" id="b-msg" name="message" rows={3} maxLength={5000}
          placeholder="A sentence is plenty — or leave it for when we talk."
          value={details.message} onChange={(e) => onChange('message', e.target.value)}
        />
      </div>
    </fieldset>
  );
}
