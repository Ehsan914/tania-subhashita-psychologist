// Programs: one structured program as a three-column band (design: section.program).
import { Link } from 'react-router-dom';
import type { ProgramData } from '../../context/SiteDataContext';
import { SplitWords } from '../motion';

export function ProgramSection({ program, index }: { program: ProgramData; index: number }) {
  return (
    <section className="program" id={program.slug}>
      <div className="wrap grid">
        <div className="meta" data-reveal="rise">
          <span className="n">{String(index + 1).padStart(2, '0')}</span>
          <span>{program.duration}</span>
        </div>
        <div>
          <h2 className="h2" data-reveal="split"><SplitWords>{program.title}</SplitWords></h2>
          <p className="sub" data-reveal="rise">{program.subtitle}</p>
          <p className="desc" data-reveal="rise">{program.description}</p>
          <p className="fit" data-reveal="rise"><strong>Suited to:</strong> {program.suitability}</p>
          <Link className="btn" to={`/book?program=${encodeURIComponent(program.slug)}`} data-reveal="rise">
            Register interest <span className="arrow" aria-hidden="true">→</span>
          </Link>
        </div>
        {program.details.length > 0 && (
          <div>
            <h3 data-reveal="rise">What we&rsquo;ll cover</h3>
            <ol className="rule-list" data-reveal="list">
              {program.details.map((d, i) => <li key={i}><span>{d}</span></li>)}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}
