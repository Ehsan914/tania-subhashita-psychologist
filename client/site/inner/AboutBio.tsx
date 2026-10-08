// About: the portrait with key facts beside the bio and pull quote (design: .bio).
import type { AboutData } from '../../context/SiteDataContext';
import { sanitizeHtml } from '../../lib/sanitizeHtml';

// The design's About portrait, used until one is set in the admin.
const DEFAULT_PORTRAIT = '/images/warm-editorial-portrait-in-mauve-saree.png';

const EDUCATION = 'Honours & Master’s in Psychology; Professional Master’s in Clinical Social Work, University of Dhaka';
const FOCUS = 'Psychiatric conditions, substance use, emotional dysregulation, family relationships';

// The DB stores the quote bare or already quoted; show it once in curly quotes.
function quoted(text: string): string {
  return `“${text.trim().replace(/^["“]+|["”]+$/g, '')}”`;
}

export function AboutBio({ about }: { about: AboutData | null }) {
  const paragraphs = [about?.paragraph1, about?.paragraph2].filter((p): p is string => Boolean(p?.trim()));
  const facts = [
    { term: 'Practice', value: about?.profileLocation || 'MIND CARE, New Eskaton, and online' },
    { term: 'Education', value: EDUCATION },
    { term: 'Experience', value: about?.profileExperience || 'Psychiatric clinics and rehabilitation centres across Dhaka' },
    { term: 'Focus', value: FOCUS },
  ];

  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="wrap bio">
        <aside className="side">
          <figure className="portrait" data-reveal="mask">
            <img src={about?.portraitImageUrl || DEFAULT_PORTRAIT} alt="Tania Subhashita, psychologist" width={1024} height={1536} />
          </figure>
          <dl className="facts" data-reveal="rise">
            {facts.map((f) => <div key={f.term}><dt>{f.term}</dt><dd>{f.value}</dd></div>)}
          </dl>
        </aside>
        <div>
          {paragraphs.length > 0 && (
            <div className="prose" data-reveal="rise">
              {paragraphs.map((p, i) => <p key={i} dangerouslySetInnerHTML={{ __html: sanitizeHtml(p) }} />)}
            </div>
          )}
          {about?.highlightQuote && <blockquote data-reveal="rise">{quoted(about.highlightQuote)}</blockquote>}
        </div>
      </div>
    </section>
  );
}
