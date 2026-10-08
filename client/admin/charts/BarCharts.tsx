// Bar charts from admin/assets/charts.js: `hbars` (horizontal, longest first) and
// `columns` (vertical, in a fixed order such as time of day).
export interface BarRow { label: string; n: number }

const maxOf = (rows: BarRow[]) => Math.max(...rows.map((r) => r.n), 1);

export function HBars({ rows }: { rows: BarRow[] }) {
  const max = maxOf(rows);
  return (
    <ul className="hbars">
      {rows.map((r, i) => (
        <li key={r.label}>
          <span>{r.label}</span><b>{r.n}</b>
          <span className="bar"><i style={{ width: `${(r.n / max) * 100}%`, animationDelay: `${i * 70}ms` }} /></span>
        </li>
      ))}
    </ul>
  );
}

export function Columns({ rows }: { rows: BarRow[] }) {
  const max = maxOf(rows);
  return (
    <ul className="vbars">
      {rows.map((r, i) => (
        <li key={r.label}>
          <b>{r.n}</b>
          <span
            className={r.n === max ? 'col peak' : 'col'}
            style={{ height: `${(r.n / max) * 100}%`, animationDelay: `${i * 60}ms` }}
            title={`${r.label}: ${r.n}`}
          />
          <span>{r.label}</span>
        </li>
      ))}
    </ul>
  );
}
