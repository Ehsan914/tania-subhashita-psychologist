// "What brings you here?": the therapies grouped by area, a few per group.
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { ServiceData } from '../../context/SiteDataContext';
import { SplitWords } from '../motion';
import { serviceHref } from '../therapies/therapyData';

// The order the design lists the areas in (DB spelling). Any other category follows.
const CATEGORY_ORDER = ['Mood & Emotion', 'Self & Relationships', 'Addiction & Behavior', 'Specialized Care'];
const PER_GROUP = 5;

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
  'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

// The design writes the count as a word at the start of a sentence: 26 → "Twenty-six".
function countWord(n: number): string {
  const word = n < 20 ? ONES[n] : n < 100 ? TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : '') : String(n);
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function groupByCategory(services: ServiceData[]) {
  const present = [...new Set(services.map((s) => s.category))];
  const categories = [
    ...CATEGORY_ORDER.filter((c) => present.includes(c)),
    ...present.filter((c) => !CATEGORY_ORDER.includes(c)),
  ];
  return categories.map((category) => ({
    category,
    items: services.filter((s) => s.category === category).slice(0, PER_GROUP),
  }));
}

export default function Concerns({ services }: { services: ServiceData[] }) {
  const groups = useMemo(() => groupByCategory(services), [services]);

  return (
    <section className="section concerns" style={{ paddingTop: 0 }}>
      <div className="wrap layout">
        <div className="intro">
          <h2 className="h2" data-reveal="split"><SplitWords>What brings you <em>here?</em></SplitWords></h2>
          <p className="lede" data-reveal="rise">
            {countWord(services.length)} areas of care, grouped the way people usually describe them. Start wherever feels closest.
          </p>
          <Link className="link" to="/services" data-reveal="rise">See all {services.length} therapies</Link>
        </div>
        <div className="cols" id="concern-cols">
          {groups.map(({ category, items }) => (
            <div key={category}>
              <h3 className="eyebrow" data-reveal="rise">{category}</h3>
              <ul className="rule-list" data-reveal="list">
                {items.map((s) => (
                  <li key={s._id}><Link to={serviceHref(s.slug)}>{s.name}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
