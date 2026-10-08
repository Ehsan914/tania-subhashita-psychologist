// "What people carry away": anonymous notes, labelled only by what they speak to.
// Privacy: a testimonial's name is never shown; `role` holds its theme ("On feeling safe"),
// as in the admin's testimonial editor.
import type { Testimonial } from '../../context/SiteDataContext';
import { SplitWords } from '../motion';

export default function Voices({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <section className="section section--band voices">
      <div className="wrap">
        <div className="head">
          <div>
            <p className="eyebrow" data-reveal="rise">In their words</p>
            <h2 className="h2" data-reveal="split" style={{ marginTop: 22 }}>
              <SplitWords>What people <em>carry away.</em></SplitWords>
            </h2>
          </div>
          <p className="privacy" data-reveal="rise">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2.5" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
            <span>Shared anonymously and with permission. Names, dates and personal details are never published.</span>
          </p>
        </div>
        <ul className="notes" id="voice-notes" data-reveal="paper">
          {testimonials.map((t) => (
            <li key={t.id}>
              <figure>
                <span className="mark" aria-hidden="true">“</span>
                <blockquote><p>{t.text}</p></blockquote>
                {t.role && <figcaption>{t.role}</figcaption>}
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
