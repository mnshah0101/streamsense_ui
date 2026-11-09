import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DEFECT_TYPES } from '../data/types'
import { useStore } from '../store'
import { Eyebrow, Kpi, Pill, btnGhost, btnPrimary, cardCls, inputCls } from '../components/ui'

const RUNS = [
  { id: 'E-03-lite', split: 'locked test split', precision: 0.93, recall: 0.86, f1: 0.89, published: true },
  { id: 'E-03-lite', split: 'validation split', precision: 0.94, recall: 0.88, f1: 0.91, published: false },
  { id: 'E-02', split: 'locked test split', precision: 0.9, recall: 0.81, f1: 0.85, published: false },
]

// Threshold tradeoff preview (validation data only, never the final test set).
const TRADEOFF: Record<number, { precision: number; recall: number }> = {
  1: { precision: 0.81, recall: 0.97 },
  2: { precision: 0.93, recall: 0.86 },
  3: { precision: 0.96, recall: 0.74 },
  4: { precision: 0.98, recall: 0.52 },
  5: { precision: 0.99, recall: 0.31 },
}

// Per-defect metrics: null = not yet measured (shown as unavailable, not 0).
const PER_DEFECT: Record<string, { p: number | null; r: number | null; support: number }> = {
  Blur: { p: 0.91, r: 0.84, support: 412 },
  Overexposure: { p: 0.95, r: 0.88, support: 263 },
  'Low light': { p: 0.9, r: 0.9, support: 380 },
  Miscalibration: { p: 0.97, r: 0.79, support: 148 },
  Stitching: { p: null, r: null, support: 22 },
  Weather: { p: null, r: null, support: 9 },
}

export default function ModelPerformance() {
  const { threshold, setThreshold, saveThreshold, savedThreshold, feedback } = useStore()
  const [runIdx, setRunIdx] = useState(0)
  const [picking, setPicking] = useState(false)
  const [saved, setSaved] = useState(false)
  const run = RUNS[runIdx]
  const t = TRADEOFF[threshold]

  const correct = feedback.filter((f) => f.kind === 'correct').length
  const incorrect = feedback.filter((f) => f.kind === 'incorrect').length
  const missed = feedback.filter((f) => f.kind === 'missed').length
  const total = feedback.length

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-xl font-bold uppercase tracking-wide">Model Performance</h1>
        <Eyebrow className="mt-3">Run</Eyebrow>
        {picking ? (
          <select autoFocus value={runIdx} onChange={(e) => { setRunIdx(Number(e.target.value)); setPicking(false) }} onBlur={() => setPicking(false)} className={`${inputCls} mt-1`}>
            {RUNS.map((r, i) => <option key={i} value={i}>{r.id}, {r.split}</option>)}
          </select>
        ) : (
          <button onClick={() => setPicking(true)} className="mt-1 inline-flex items-center gap-4 rounded-lg border border-border-subtle bg-bg-primary px-3 py-1.5 text-sm transition-colors hover:border-text-muted focus:outline-none focus:ring-1 focus:ring-accent">
            <span>{run.id}, {run.split}</span>
            {run.published && <Pill tone="green">published v3</Pill>}
            <span className="text-xs text-text-secondary">Change ›</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-3 gap-4">
            <Kpi label="Binary precision" value={run.precision.toFixed(2)} />
            <Kpi label="Binary recall" value={run.recall.toFixed(2)} />
            <Kpi label="Binary F1" value={run.f1.toFixed(2)} />
          </div>

          <section>
            <h2 className="mb-2 text-sm font-medium">Per-defect metrics ({run.split})</h2>
            <div className="overflow-hidden rounded-xl border border-border-subtle bg-bg-card">
              <table className="w-full text-xs">
                <thead className="bg-bg-card text-left text-[10px] uppercase tracking-wide text-text-muted">
                  <tr className="border-b border-border-subtle">
                    <th className="px-4 py-2 font-medium">Defect</th>
                    <th className="px-4 py-2 text-right font-medium">Precision</th>
                    <th className="px-4 py-2 text-right font-medium">Recall</th>
                    <th className="px-4 py-2 text-right font-medium">F1</th>
                    <th className="px-4 py-2 text-right font-medium">Support</th>
                  </tr>
                </thead>
                <tbody>
                  {DEFECT_TYPES.map((d, i) => {
                    const m = PER_DEFECT[d]
                    const f1 = m.p !== null && m.r !== null ? (2 * m.p * m.r) / (m.p + m.r) : null
                    return (
                      <tr key={d} className="border-b border-border-subtle last:border-0 transition-colors hover:bg-bg-card-hover">
                        <td className="px-4 py-2"><span className="mr-2 inline-block h-2 w-2 rounded-sm align-middle" style={{ background: `var(--color-model-${i})` }} aria-hidden />{d}</td>
                        <td className="px-4 py-2 text-right tabular-nums">{m.p === null ? <span className="text-text-muted">unavailable</span> : m.p.toFixed(2)}</td>
                        <td className="px-4 py-2 text-right tabular-nums">{m.r === null ? <span className="text-text-muted">unavailable</span> : m.r.toFixed(2)}</td>
                        <td className="px-4 py-2 text-right tabular-nums">{f1 === null ? <span className="text-text-muted">unavailable</span> : f1.toFixed(2)}</td>
                        <td className="px-4 py-2 text-right tabular-nums text-text-secondary">{m.support}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-1 text-[11px] text-text-muted">Unavailable = support below 50 labeled frames. Per-defect severity is unavailable until validated, so severity-based suppression stays off.</div>
          </section>

          <section className={cardCls}>
            <div className="flex items-baseline gap-3">
              <h2 className="text-sm font-medium">Human feedback</h2>
              <span className="text-[11px] text-text-muted">supervised labels from match analysis · this session</span>
            </div>
            {total === 0 ? (
              <div className="mt-3 text-sm text-text-muted">
                No labels yet. Open a match, pick a frame and mark detections correct or wrong, or flag missed issues. <Link to="/" className="underline">Go to Games</Link>
              </div>
            ) : (
              <>
                <div className="mt-3 grid grid-cols-4 gap-4">
                  <Mini label="Labels" value={total} />
                  <Mini label="Confirmed correct" value={correct} tone="text-green-400" />
                  <Mini label="Marked wrong" value={incorrect} tone="text-red-400" />
                  <Mini label="Missed issues" value={missed} tone="text-yellow-400" />
                </div>
                <div className="mt-3 flex h-2 gap-1" aria-hidden>
                  <div className="h-2 rounded-sm bg-green-500" style={{ flex: Math.max(correct, 0.05) }} />
                  <div className="h-2 rounded-sm bg-red-500" style={{ flex: Math.max(incorrect, 0.05) }} />
                  <div className="h-2 rounded-sm bg-yellow-500" style={{ flex: Math.max(missed, 0.05) }} />
                </div>
                <div className="mt-1 text-[11px] text-text-muted">
                  Observed precision on reviewed detections: {correct + incorrect ? (correct / (correct + incorrect)).toFixed(2) : '—'} · labels queue for the next training run.
                </div>
                <div className="mt-3 flex gap-2">
                  <button className={btnGhost}>Export Labels (CSV)</button>
                  <button className={btnGhost} disabled={total < 50}>Queue Fine-Tune Run</button>
                  <span className="self-center text-[11px] text-text-muted">{total < 50 ? `${50 - total} more labels to queue a run` : 'ready'}</span>
                </div>
              </>
            )}
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <section className={cardCls}>
            <h2 className="text-sm font-medium">Calibration curve</h2>
            <CalibrationCurve />
            <div className="mt-2 flex justify-between text-[11px] text-text-muted"><span>Predicted probability →</span><span>Dashed = perfect calibration</span></div>
          </section>

          <section className={cardCls}>
            <h2 className="text-sm font-medium">Alert threshold</h2>
            <div className="text-xs text-text-secondary">Alerts fire at severity {savedThreshold} or above{threshold !== savedThreshold ? ` · previewing ${threshold}` : ''}</div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <input type="range" min={1} max={5} step={1} value={threshold} onChange={(e) => { setThreshold(Number(e.target.value)); setSaved(false) }} aria-label="Alert severity threshold" />
                <div className="mt-1 flex justify-between text-xs">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => { setThreshold(n); setSaved(false) }} className={`rounded px-1 tabular-nums transition-colors focus:outline-none focus:ring-1 focus:ring-accent ${n === threshold ? 'font-medium text-text-primary' : 'text-text-muted hover:text-text-primary'}`}>{n}</button>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-border-subtle p-3">
                <Eyebrow>At severity {threshold}</Eyebrow>
                <div className="mt-1 text-sm">Precision <span className="font-medium tabular-nums">{t.precision.toFixed(2)}</span></div>
                <div className="text-sm">Recall <span className="font-medium tabular-nums">{t.recall.toFixed(2)}</span></div>
              </div>
            </div>
            <p className="mt-3 text-sm">Precision first: a false positive can kill a healthy stream.</p>
            <p className="text-xs text-text-muted">Preview uses the validation split only. Drag the knob or click a number to preview.</p>
            <div className="mt-4 flex items-center gap-3">
              <button className={btnPrimary} disabled={threshold === savedThreshold} onClick={() => { saveThreshold(); setSaved(true) }}>Save Threshold</button>
              {saved && threshold === savedThreshold && <span className="text-xs text-green-400">Saved · v4 published, tied to E-03-lite</span>}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function Mini({ label, value, tone = '' }: { label: string; value: number; tone?: string }) {
  return (
    <div>
      <Eyebrow>{label}</Eyebrow>
      <div className={`mt-0.5 font-display text-3xl font-bold tabular-nums ${tone}`}>{value}</div>
    </div>
  )
}

function CalibrationCurve() {
  const pts = [[0, 0.02], [0.1, 0.06], [0.2, 0.13], [0.3, 0.22], [0.4, 0.33], [0.5, 0.45], [0.6, 0.57], [0.7, 0.68], [0.8, 0.78], [0.9, 0.87], [1, 0.95]]
  const W = 520, H = 220, px = 36, py = 12
  const sx = (x: number) => px + x * (W - px - 8)
  const sy = (y: number) => H - py - y * (H - py - 8)
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${sx(x)} ${sy(y)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full" role="img" aria-label="Calibration curve: observed frequency versus predicted probability">
      <line x1={sx(0)} y1={sy(0)} x2={sx(0)} y2={sy(1)} stroke="var(--color-border-subtle)" />
      <line x1={sx(0)} y1={sy(0)} x2={sx(1)} y2={sy(0)} stroke="var(--color-border-subtle)" />
      {[0.25, 0.5, 0.75, 1].map((g) => <line key={g} x1={sx(0)} y1={sy(g)} x2={sx(1)} y2={sy(g)} stroke="var(--color-border-subtle)" strokeDasharray="2 4" />)}
      {[0, 0.5, 1].map((g) => <text key={g} x={sx(0) - 6} y={sy(g) + 3} textAnchor="end" fontSize="10" fill="var(--color-text-muted)">{g.toFixed(1)}</text>)}
      <line x1={sx(0)} y1={sy(0)} x2={sx(1)} y2={sy(1)} stroke="var(--color-text-muted)" strokeDasharray="4 4" />
      <path d={d} fill="none" stroke="var(--color-model-0)" strokeWidth="2" />
      {pts.map(([x, y]) => <circle key={x} cx={sx(x)} cy={sy(y)} r="2.5" fill="var(--color-model-0)" />)}
    </svg>
  )
}
