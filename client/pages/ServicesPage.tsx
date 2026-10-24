// Therapies (design: site/therapies.html + assets/therapies.js). The URL holds the state:
// ?c=<area> chooses an area, #<slug> chooses that therapy's area and highlights its row,
// ?view=list shows the plain list of every therapy.
import { useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useSiteData } from '../context/SiteDataContext';
import { Segmented } from '../site/controls';
import { SplitWords, useReveal } from '../site/motion';
import { TherapyGuide } from '../site/therapies/TherapyGuide';
import { ALL_AREAS, TherapyList } from '../site/therapies/TherapyList';
import { areasOf, linkPrograms } from '../site/therapies/therapyData';
import { usePageMeta, useJsonLd } from '../hooks/usePageMeta';
import { useHydrated } from '../hooks/useHydrated';
import { pageGraph } from '../lib/schema';

const VIEW_OPTIONS = [
  { value: 'guide', label: 'Help me choose' },
  { value: 'list', label: 'See all therapies' },
];

function Essentials() {
  return (
    <ul className="essentials" aria-label="How sessions work">
      <li><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>60-minute sessions</li>
      <li><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>First 20 minutes free</li>
      <li><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.3" /></svg>New Eskaton, Dhaka, or online</li>
      <li><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2.5" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>Strictly confidential</li>
    </ul>
  );
}

export default function ServicesPage() {
  usePageMeta('Therapies in Dhaka & Online | Tania Subhashita, Psychologist', 'Twenty-six areas of care, from anxiety, depression and trauma to addiction and couple counselling, in New Eskaton, Dhaka, or online.');
  useJsonLd('page', pageGraph('CollectionPage', '/services', 'Therapies', [{ name: 'Therapies', path: '/services' }]));
  const { services, programs } = useSiteData();
  const [params] = useSearchParams();
  const { hash } = useLocation();
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement>(null);
  // the list view's search and area survive switching views, as in the design
  const [query, setQuery] = useState('');
  const [listArea, setListArea] = useState(ALL_AREAS);

  const areas = useMemo(() => areasOf(services), [services]);
  const programFor = useMemo(() => linkPrograms(programs), [programs]);

  // The prerendered page is the plain guide; the URL's view, area and therapy apply from the
  // first render after hydration, so the two renders agree.
  const hydrated = useHydrated();
  const view = hydrated && params.get('view') === 'list' ? 'list' : 'guide';
  const target = hydrated ? services.find((s) => s.slug === hash.slice(1)) : undefined;
  const requested = hydrated ? params.get('c') : null;
  const area = target?.category ?? (requested && areas.includes(requested) ? requested : null);

  useReveal(rootRef, [hydrated]);

  const replaceUrl = (search: URLSearchParams, keepHash: boolean) => {
    const qs = search.toString();
    navigate({ search: qs ? `?${qs}` : '', hash: keepHash ? hash : '' }, { replace: true });
  };

  const chooseArea = (next: string) => replaceUrl(new URLSearchParams({ c: next }), false);

  const showView = (next: string) => {
    const search = new URLSearchParams(params);
    if (next === 'list') search.set('view', 'list'); else search.delete('view');
    replaceUrl(search, true);
  };

  return (
    <div ref={rootRef}>
      <header className="page-head wrap calm-head">
        <p className="eyebrow" data-reveal="rise">Therapies</p>
        <h1 className="h1" data-reveal="split"><SplitWords>Let's find the <em>right support.</em></SplitWords></h1>
        <p className="lede" data-reveal="rise">Take your time. Choose what feels closest, then the kind of help. There is no wrong answer, and we can always change course together.</p>
      </header>

      <section className="wrap calm">
        <Segmented name="view" className="view-switch" aria-label="How to browse" value={view} options={VIEW_OPTIONS} onChange={showView} />

        {view === 'guide' ? (
          <TherapyGuide
            areas={areas} area={area} services={services} programFor={programFor}
            targetSlug={target?.slug ?? null} onChoose={chooseArea}
          />
        ) : (
          <TherapyList
            areas={areas} services={services} programFor={programFor}
            query={query} onQuery={setQuery} listArea={listArea} onListArea={setListArea}
          />
        )}

        <Essentials />
      </section>
    </div>
  );
}
