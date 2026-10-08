// "See all therapies": every therapy under its area as photo cards, with a quiet search and
// area chips (design: therapies.js, renderAll()).
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import type { ProgramData, ServiceData } from '../../context/SiteDataContext';
import { ChipGroup } from '../controls';
import { TherapyCard } from './TherapyItems';

export const ALL_AREAS = 'All';

interface TherapyListProps {
  areas: string[];
  services: ServiceData[];
  programFor: Map<string, ProgramData>;
  query: string;
  onQuery: (query: string) => void;
  listArea: string;
  onListArea: (area: string) => void;
}

export function TherapyList({ areas, services, programFor, query, onQuery, listArea, onListArea }: TherapyListProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const q = query.trim().toLowerCase();
  const isHit = (s: ServiceData) => !q || `${s.name} ${s.description}`.toLowerCase().includes(q);

  const groups = areas
    .filter((area) => listArea === ALL_AREAS || area === listArea)
    .map((area) => ({ area, rows: services.filter((s) => s.category === area && isHit(s)) }))
    .filter((group) => group.rows.length > 0);

  // the chips scroll sideways on small screens: keep the chosen one in view
  const chooseArea = (area: string) => {
    onListArea(area);
    requestAnimationFrame(() => {
      barRef.current?.querySelector('.chip[aria-pressed="true"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });
  };

  return (
    <div className="all" id="all">
      <div className="all-bar" ref={barRef}>
        <label className="all-filter">
          <span className="visually-hidden">Filter therapies</span>
          <svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="5.2" /><path d="M11 11l3.5 3.5" /></svg>
          <input
            className="input" type="search" id="filter" placeholder="Type to narrow, e.g. sleep" autoComplete="off"
            value={query} onChange={(e) => onQuery(e.target.value)}
          />
        </label>
        <ChipGroup className="all-chips" label="Filter by area" options={[ALL_AREAS, ...areas]} value={listArea} onChange={chooseArea} />
      </div>
      <div id="all-groups" aria-live="polite">
        {groups.length > 0 ? groups.map(({ area, rows }) => (
          <section className="all-group" key={area}>
            <h3>{area}</h3>
            <ul className="s-cards">
              {rows.map((s, i) => <TherapyCard key={s.slug} service={s} index={i} program={programFor.get(s.slug)} />)}
            </ul>
          </section>
        )) : (
          <p className="none">
            Nothing matches “{query.trim()}”. You can describe it in your own words in a <Link className="link" to="/book">free consult</Link>.
          </p>
        )}
      </div>
    </div>
  );
}
