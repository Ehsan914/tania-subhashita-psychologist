import type { Stat } from '../../context/SiteDataContext';
import { CountUp } from '../motion';

export default function Numbers({ stats }: { stats: Stat[] }) {
  return (
    <section className="numbers">
      <div className="wrap">
        <ul>
          {stats.map((stat) => (
            <li key={stat._key}>
              <span className="n" data-reveal="count"><CountUp value={stat.figure} /></span>
              <span className="t">{stat.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
