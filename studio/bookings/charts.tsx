// The dashboard's two charts, ported from the design's charts.js (trend and ring) to React SVG.
// Same geometry, classes and palette; styled by admin.css.
import {useId, type CSSProperties} from 'react'
import type {WeekCount} from './api'

export interface Series {
  k: 'requests' | 'confirmed'
  label: string
  c: string // a CSS colour
}

const H = 230
const L = 30
const R = 10
const T = 14
const B = 28
const MIN_WIDTH = 280
const LABEL_SPACE = 52 // px per date label, so they never collide
const STEPS = [1, 2, 5, 10, 20, 25, 50, 100]

const shortDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {day: 'numeric', month: 'short', timeZone: 'UTC'})

/** Line and area over the weeks. `width` is the box's real pixel width, so axis text stays 11px. */
export function Trend({rows, series, width}: {rows: WeekCount[]; series: Series[]; width: number}) {
  const fillId = `trend-fill-${useId().replace(/[^\w-]/g, '')}` // a plain id, safe inside url(#…)
  const W = Math.max(MIN_WIDTH, Math.round(width))
  const max = Math.max(...rows.flatMap((r) => series.map((s) => r[s.k])), 1)
  const step = STEPS.find((s) => s * 5 >= max) ?? 100 // round ticks: 0, 5, 10…
  const top = Math.ceil(max / step) * step
  const x = (i: number) => L + (i * (W - L - R)) / Math.max(rows.length - 1, 1)
  const y = (v: number) => T + (H - T - B) * (1 - v / top)
  const d = (k: Series['k']) => rows.map((r, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(r[k]).toFixed(1)}`).join('')
  const every = Math.ceil((rows.length * LABEL_SPACE) / (W - L - R))
  const ticks = Array.from({length: top / step + 1}, (_, i) => i * step)
  const first = series[0]
  const summary = series.map((s) => `${s.label}: ${rows.map((r) => r[s.k]).join(', ')}`).join('. ')
  if (!rows.length) return null
  return (
    <svg className="trend" viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label={summary}>
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#A84B65" stopOpacity=".22" />
          <stop offset="1" stopColor="#A84B65" stopOpacity="0" />
        </linearGradient>
      </defs>
      {ticks.map((v) => (
        <g key={v}>
          <line className="grid" x1={L} x2={W - R} y1={y(v)} y2={y(v)} />
          <text className="axis" x={L - 8} y={y(v) + 4} textAnchor="end">{v}</text>
        </g>
      ))}
      {rows.map((r, i) =>
        (rows.length - 1 - i) % every ? null : (
          <text key={r.start} className="axis" x={x(i)} y={H - 6} textAnchor="middle">{shortDate(r.start)}</text>
        ),
      )}
      <path className="area" d={`${d(first.k)}L${x(rows.length - 1)},${y(0)}L${x(0)},${y(0)}Z`} fill={`url(#${fillId})`} />
      {series.map((s) => <path key={s.k} className="line" pathLength={1} style={{stroke: s.c}} d={d(s.k)} />)}
      {series.map((s) =>
        rows.map((r, i) => (
          <circle key={`${s.k}-${r.start}`} className="dot" cx={x(i)} cy={y(r[s.k])} r="3.5" style={{stroke: s.c}}>
            <title>{`Week of ${shortDate(r.start)}: ${r[s.k]} ${s.label.toLowerCase()}`}</title>
          </circle>
        )),
      )}
    </svg>
  )
}

export interface Part {
  label: string
  n: number
  c: string
}

const CX = 21
const RADIUS = 16
const STROKE = 6
const GAP = 0.012 // of a turn, between slices

// a point on the ring, `f` a fraction of a turn from 3 o'clock (the svg is turned -90deg)
const pt = (f: number) =>
  `${(CX + RADIUS * Math.cos(f * 2 * Math.PI)).toFixed(3)},${(CX + RADIUS * Math.sin(f * 2 * Math.PI)).toFixed(3)}`

/** A donut with its total in the middle and a legend of counts and shares. */
export function Ring({parts, caption}: {parts: Part[]; caption: string}) {
  const total = parts.reduce((s, p) => s + p.n, 0)
  const shown = parts.filter((p) => p.n)
  const gap = shown.length > 1 ? GAP : 0
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0)
  let at = 0
  const segs = shown.map((p) => {
    const f0 = at
    const f1 = at + p.n / total
    at = f1
    const title = <title>{`${p.label}: ${p.n}`}</title>
    if (shown.length === 1) {
      return <circle key={p.label} className="seg" cx={CX} cy={CX} r={RADIUS} fill="none" strokeWidth={STROKE} style={{stroke: p.c}}>{title}</circle>
    }
    const large = f1 - f0 > 0.5 ? 1 : 0
    return (
      <path key={p.label} className="seg" d={`M${pt(f0 + gap / 2)}A${RADIUS},${RADIUS} 0 ${large} 1 ${pt(f1 - gap / 2)}`} fill="none" strokeWidth={STROKE} style={{stroke: p.c}}>
        {title}
      </path>
    )
  })
  return (
    <div className="ring-chart">
      <div className="ring">
        <svg viewBox="0 0 42 42" role="img" aria-label={parts.map((p) => `${p.label} ${p.n}`).join(', ')}>
          <circle cx={CX} cy={CX} r={RADIUS} fill="none" strokeWidth={STROKE} className="track" />
          {segs}
        </svg>
        <p className="total"><b>{total}</b><span>{caption}</span></p>
      </div>
      <ul className="legend">
        {parts.map((p) => (
          <li key={p.label} style={{'--c': p.c} as CSSProperties}>
            <i />
            <span>{p.label}</span>
            <b>{p.n}</b>
            <small>{pct(p.n)}%</small>
          </li>
        ))}
      </ul>
    </div>
  )
}
