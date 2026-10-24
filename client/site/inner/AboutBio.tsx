// About: the portrait with key facts beside the bio and pull quote (design: .bio).
import type { AboutPage } from '../../context/SiteDataContext';
import { imageUrl } from '../../lib/sanity';
import { InlineText } from '../RichText';

// The design's About portrait, used until one is set in Sanity.
const DEFAULT_PORTRAIT = '/images/warm-editorial-portrait-in-mauve-saree.png';
const PORTRAIT_WIDTH = 1024;

const EDUCATION = 'Honours & Master’s in Psychology; Professional Master’s in Clinical Social Work, University of Dhaka';
const FOCUS = 'Psychiatric conditions, substance use, emotional dysregulation, family relationships';

// The quote may be stored bare or already quoted; show it once in curly quotes.
function quoted(text: string): string {
  return `“${text.trim().replace(/^["“]+|["”]+$/g, '')}”`;
}

export function AboutBio({ about }: { about: AboutPage | null }) {
  const body = about?.body;
  const facts = [
    { term: 'Practice', value: about?.practice || 'MIND CARE, New Eskaton, and online' },
    { term: 'Education', value: EDUCATION },
    { term: 'Experience', value: about?.experience || 'Psychiatric clinics and rehabilitation centres across Dhaka' },
    { term: 'Focus', value: FOCUS },
  ];

  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="wrap bio">
        <aside className="side">
          <figure className="portrait" data-reveal="mask">
            <img
              src={imageUrl(about?.image, PORTRAIT_WIDTH) ?? DEFAULT_PORTRAIT}
              alt={about?.image?.alt || 'Tania Subhashita, psychologist'} width={1024} height={1536}
            />
          </figure>
          <dl className="facts" data-reveal="rise">
            {facts.map((f) => <div key={f.term}><dt>{f.term}</dt><dd>{f.value}</dd></div>)}
          </dl>
        </aside>
        <div>
          {body && body.length > 0 && (
            <div className="prose" data-reveal="rise"><InlineText value={body} /></div>
          )}
          {about?.pullQuote && <blockquote data-reveal="rise">{quoted(about.pullQuote)}</blockquote>}
        </div>
      </div>
    </section>
  );
}
