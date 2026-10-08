// Donut, or a full pie with `pie` (admin/assets/charts.js `ring`). Each slice is a real
// arc path, measured as a fraction of a turn from 3 o'clock (the svg is turned -90deg).
import { colorVar } from './color';

export interface RingPart { label: string; n: number; c: string }

const C = 21; // centre of the 42×42 viewBox
const DONUT_R = 16;
const pt = (r: number, f: number) =>
  `${(C + r * Math.cos(f * 2 * Math.PI)).toFixed(3)},${(C + r * Math.sin(f * 2 * Math.PI)).toFixed(3)}`;

function Segments({ parts, pie }: { parts: RingPart[]; pie: boolean }) {
  const total = parts.reduce((s, p) => s + p.n, 0);
  const shown = parts.filter((p) => p.n);
  const gap = shown.length > 1 && !pie ? 0.012 : 0;
  let at = 0;

  return (
    <>
      {shown.map((p) => {
        const f0 = at;
        const f1 = at + p.n / total;
        at = f1;
        const title = <title>{`${p.label}: ${p.n}`}</title>;
        if (shown.length === 1) {
          return pie
            ? <circle key={p.label} className="seg" cx={C} cy={C} r={C} style={{ fill: p.c }}>{title}</circle>
            : <circle key={p.label} className="seg" cx={C} cy={C} r={DONUT_R} fill="none" strokeWidth="6" style={{ stroke: p.c }}>{title}</circle>;
        }
        const large = f1 - f0 > 0.5 ? 1 : 0;
        return pie
          ? <path key={p.label} className="seg" d={`M${C},${C}L${pt(C, f0)}A${C},${C} 0 ${large} 1 ${pt(C, f1)}Z`} style={{ fill: p.c }} stroke="#fff" strokeWidth=".6">{title}</path>
          : <path key={p.label} className="seg" d={`M${pt(DONUT_R, f0 + gap / 2)}A${DONUT_R},${DONUT_R} 0 ${large} 1 ${pt(DONUT_R, f1 - gap / 2)}`} fill="none" strokeWidth="6" style={{ stroke: p.c }}>{title}</path>;
      })}
    </>
  );
}

export default function RingChart({ parts, pie = false, caption = '' }: { parts: RingPart[]; pie?: boolean; caption?: string }) {
  const total = parts.reduce((s, p) => s + p.n, 0);
  const pctOf = (n: number) => (total ? Math.round((n / total) * 100) : 0);

  return (
    <div className={pie ? 'ring-chart is-pie' : 'ring-chart'}>
      <div className="ring">
        <svg viewBox="0 0 42 42" role="img" aria-label={parts.map((p) => `${p.label} ${p.n}`).join(', ')}>
          {!pie && <circle cx={C} cy={C} r={DONUT_R} fill="none" strokeWidth="6" className="track" />}
          <Segments parts={parts} pie={pie} />
        </svg>
        {!pie && <p className="total"><b>{total}</b><span>{caption}</span></p>}
      </div>
      <ul className="legend">
        {parts.map((p) => (
          <li key={p.label} style={colorVar(p.c)}><i /><span>{p.label}</span><b>{p.n}</b><small>{pctOf(p.n)}%</small></li>
        ))}
      </ul>
    </div>
  );
}
