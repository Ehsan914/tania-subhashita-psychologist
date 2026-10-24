// About: training and credentials as a two-column drawn list (design: .training).
import type { Credential } from '../../context/SiteDataContext';
import { SplitWords } from '../motion';

export function Credentials({ credentials }: { credentials: Credential[] }) {
  if (credentials.length === 0) return null;

  return (
    <section className="section section--band training">
      <div className="wrap">
        <div className="section-head">
          <h2 className="h2" data-reveal="split"><SplitWords>Training &amp; <em>credentials</em></SplitWords></h2>
        </div>
        <ol className="rule-list" data-reveal="list">
          {credentials.map((c) => (
            <li key={c._key}><div><h3>{c.title}</h3>{c.description && <p>{c.description}</p>}</div></li>
          ))}
        </ol>
      </div>
    </section>
  );
}
