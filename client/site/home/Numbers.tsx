import type { StatisticData } from '../../context/SiteDataContext';
import { CountUp } from '../motion';

export default function Numbers({ statistics }: { statistics: StatisticData[] }) {
  return (
    <section className="numbers">
      <div className="wrap">
        <ul>
          {statistics.map((stat) => (
            <li key={stat.id}>
              <span className="n" data-reveal="count"><CountUp value={stat.value} /></span>
              <span className="t">{stat.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
