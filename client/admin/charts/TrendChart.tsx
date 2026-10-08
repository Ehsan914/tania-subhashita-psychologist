// Line + area over time (admin/assets/charts.js `trend`). It is drawn at the box's real
// pixel width, so the 11px axis text never shrinks with the screen.
import { useEffect, useRef, useState } from 'react';

export interface TrendSeries { k: string; label: string; c: string }
export interface TrendRow { week: string; values: Record<string, number> } // week: YYYY-MM-DD

const H = 230;
const L = 30;
const R = 10;
const T = 14;
const B = 28;
const STEPS = [1, 2, 5, 10, 20, 25, 50, 100];

const dayLabel = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

function TrendSvg({ rows, series, width }: { rows: TrendRow[]; series: TrendSeries[]; width: number }) {
  const W = Math.max(280, Math.round(width));
  const v = (r: TrendRow, k: string) => r.values[k] ?? 0;
  const max = Math.max(...rows.flatMap((r) => series.map((s) => v(r, s.k))), 1);
  const step = STEPS.find((s) => s * 5 >= max) ?? 100; // round ticks: 0, 5, 10…
  const top = Math.ceil(max / step) * step;
  const x = (i: number) => L + (i * (W - L - R)) / Math.max(rows.length - 1, 1);
  const y = (n: number) => T + (H - T - B) * (1 - n / top);
  const d = (k: string) => rows.map((r, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v(r, k)).toFixed(1)}`).join('');
  const every = Math.ceil((rows.length * 52) / (W - L - R)); // keep date labels from colliding
  const ticks = Array.from({ length: top / step + 1 }, (_, i) => i * step);
  const first = series[0];
  const summary = series.map((s) => `${s.label}: ${rows.map((r) => v(r, s.k)).join(', ')}`).join('. ');

  return (
    <svg className="trend" viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label={summary}>
      <defs>
        <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#A84B65" stopOpacity=".22" />
          <stop offset="1" stopColor="#A84B65" stopOpacity="0" />
        </linearGradient>
      </defs>
      {ticks.map((t) => (
        <g key={t}>
          <line className="grid" x1={L} x2={W - R} y1={y(t)} y2={y(t)} />
          <text className="axis" x={L - 8} y={y(t) + 4} textAnchor="end">{t}</text>
        </g>
      ))}
      {rows.map((r, i) => ((rows.length - 1 - i) % every ? null : (
        <text key={r.week} className="axis" x={x(i)} y={H - 6} textAnchor="middle">{dayLabel(r.week)}</text>
      )))}
      {first && <path className="area" d={`${d(first.k)}L${x(rows.length - 1)},${y(0)}L${x(0)},${y(0)}Z`} fill="url(#trend-fill)" />}
      {series.map((s) => <path key={s.k} className="line" pathLength={1} style={{ stroke: s.c }} d={d(s.k)} />)}
      {series.map((s) => rows.map((r, i) => (
        <circle key={`${s.k}-${r.week}`} className="dot" cx={x(i)} cy={y(v(r, s.k))} r="3.5" style={{ stroke: s.c }}>
          <title>{`Week of ${dayLabel(r.week)}: ${v(r, s.k)} ${s.label.toLowerCase()}`}</title>
        </circle>
      )))}
    </svg>
  );
}

export default function TrendChart({ rows, series }: { rows: TrendRow[]; series: TrendSeries[] }) {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => setWidth(el.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="chart-box" ref={box}>
      {width > 0 && rows.length > 0 && <TrendSvg rows={rows} series={series} width={width} />}
    </div>
  );
}
