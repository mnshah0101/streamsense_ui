import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { FRAME_INTERVAL_SEC, clockLabel, framesFor, gameById, gameTitle, wallClock } from '../data/games'
import { DEFECT_TYPES, SPATIAL_DEFECTS, type DefectType, type Frame } from '../data/types'
import { useStore, useVisibleFrames } from '../store'
import FrameThumb from '../components/FrameThumb'
import TeamCrest from '../components/TeamCrest'
import SportIcon from '../components/SportIcon'
import Timeline from '../components/Timeline'
import { DefectPill, Eyebrow, HelpNote, IconFlag, IconThumb, Pill, Spinner, StatusPill, Toggle, btnGhost, btnGhostRow, btnPrimary, btnPrimarySm, cardCls, inputCls } from '../components/ui'

export default function MatchAnalysis() {
  const { id } = useParams()
  const game = gameById(id)
  const [params, setParams] = useSearchParams()
  const { alerts, feedback, addFeedback, removeFeedback, reviewAlert, threshold, gameStatus, startJob } = useStore()
  const { visible, total, job } = useVisibleFrames(id ?? '')
  const frames = useMemo(() => (game ? framesFor(game) : []), [game])
  const status = gameStatus[id ?? '']

  const selected = params.get('frame') !== null ? Number(params.get('frame')) : null
  const select = (i: number | null) => {
    const next = new URLSearchParams(params)
    if (i === null) next.delete('frame'); else next.set('frame', String(i))
    next.delete('alert')
    setParams(next, { replace: true })
  }

  // Default to the worst frame once results exist.
  useEffect(() => {
    if (!game || selected !== null) return
    const worst = game.stretches.map((s) => s.worst).filter((w) => w < visible)[0]
    if (worst !== undefined) select(worst)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.id, visible])

  if (!game) {
    return (
      <div className="text-sm text-text-muted">
        No game with id “{id}”. <Link to="/" className="underline">Back to Games</Link>
      </div>
    )
  }

  const gameAlerts = alerts.filter((a) => a.gameId === game.id)
  const gameFeedback = feedback.filter((f) => f.gameId === game.id)
  const frame = selected !== null ? frames[selected] : undefined
  const badFrames = frames.slice(0, visible).filter((f) => f.detections.length > 0).length
  const worstStretch = [...game.stretches].sort((a, b) => Math.max(...b.defects.map((d) => d.severity)) - Math.max(...a.defects.map((d) => d.severity)))[0]
  const alertAtFrame = frame ? gameAlerts.find((a) => a.frameIndex === frame.index) : undefined
  const progress = total ? visible / total : 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-0">
          <Link to="/" className="text-xs text-text-secondary hover:text-text-primary">← Back to Games</Link>
          <div className="mt-1 flex items-center gap-3">
            <div className="flex items-center -space-x-1">
              <TeamCrest team={game.home} size={28} />
              <TeamCrest team={game.away} size={28} />
            </div>
            <h1 className="font-display text-xl font-bold uppercase tracking-wide">{gameTitle(game)}</h1>
            <span className="inline-flex items-center gap-1 text-xs text-text-secondary"><SportIcon sport={game.sport} /> {game.sport}</span>
            <StatusPill status={status} openAlerts={gameAlerts.filter((a) => a.status === 'open').length} />
          </div>
          <div className="text-xs text-text-secondary">
            {game.id} · {game.sport} · {game.league} · {game.venue} · {game.camera} · {new Date(game.date + 'T12:00:00').toLocaleDateString([], { month: 'short', day: 'numeric' })} {game.startTime} · {game.durationMin} min
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Link to="/test" className={btnGhost}>Test a Clip</Link>
          <button
            className={btnPrimary}
            disabled={status === 'no-video' || (job && job.status !== 'done') || status === 'live'}
            onClick={() => startJob({ label: `${game.id} · ${gameTitle(game)}`, gameId: game.id, kind: 'match', totalFrames: total, hardware: 'T4 · us-east', meanLatencyMs: 1900 })}
          >
            {status === 'analyzed' ? 'Re-run Full Match Analysis' : 'Run Full Match Analysis'}
          </button>
        </div>
      </div>

      {/* Run stats */}
      <div className="grid grid-cols-3 gap-4 lg:grid-cols-6">
        <Stat label="Frames sampled" value={`${visible}`} sub={visible < total ? `of ${total}` : `1 every ${FRAME_INTERVAL_SEC} s`} />
        <Stat label="Frames flagged" value={`${badFrames}`} sub={badFrames ? `${((badFrames / Math.max(1, visible)) * 100).toFixed(1)}% of sampled` : 'none so far'} />
        <Stat label="Open alerts" value={`${gameAlerts.filter((a) => a.status === 'open').length}`} sub={`${gameAlerts.filter((a) => a.status === 'reviewed').length} reviewed`} />
        <Stat label="Mean latency" value="1.9 s" sub="per frame · T4 us-east" />
        <Stat label="Max latency" value="3.4 s" sub="0 timeouts" />
        <Stat label="Reviewer labels" value={`${gameFeedback.length}`} sub={gameFeedback.length ? `${gameFeedback.filter((f) => f.kind === 'missed').length} missed issues flagged` : 'none yet'} />
      </div>

      {/* Timeline */}
      <section className={cardCls}>
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <div>
            <div className="text-sm font-medium">Timeline · sampled frames along the match clock</div>
            <div className="text-[11px] text-text-muted">one frame every {FRAME_INTERVAL_SEC} s · {game.durationMin} min · bright = defect at or above threshold {threshold} · dim = below threshold · <span className="text-ground-truth">amber</span> = reviewer-flagged missed issue</div>
          </div>
          {job && job.status !== 'done' && (
            <div className="ml-auto flex items-center gap-2 text-xs text-yellow-400"><Spinner />{job.status === 'queued' ? 'queued' : `running · ${job.doneFrames} / ${job.totalFrames} frames`}</div>
          )}
          {status === 'live' && <div className="ml-auto text-xs text-red-400">live · frames still arriving</div>}
        </div>
        {visible === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center text-sm text-text-muted">
            {status === 'no-video' ? 'No video available for this match. Upload the recording to analyze it.' : 'No results yet. Run a full match analysis to populate the timeline.'}
            {status !== 'no-video' && !job && <button className={btnGhost} onClick={() => startJob({ label: `${game.id} · ${gameTitle(game)}`, gameId: game.id, kind: 'match', totalFrames: total, hardware: 'T4 · us-east', meanLatencyMs: 1900 })}>Run Full Match Analysis</button>}
          </div>
        ) : (
          <>
            {visible < total && (
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-2 flex-1 gap-1" aria-hidden>
                  <div className="h-2 flex-1 rounded-sm bg-border-subtle"><div className="h-2 rounded-sm bg-green-500" style={{ width: `${progress * 100}%` }} /></div>
                </div>
                <span className="text-[11px] tabular-nums text-text-secondary">{Math.round(progress * 100)}% · partial results</span>
              </div>
            )}
            <Timeline frames={frames} visible={visible} selected={selected} onSelect={select} feedback={gameFeedback} threshold={threshold} />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {worstStretch && worstStretch.worst < visible && (
                <button onClick={() => select(worstStretch.worst)} className="rounded-md bg-text-primary px-2.5 py-1 text-[11px] font-medium text-bg-primary transition-colors hover:bg-white focus:outline-none focus:ring-1 focus:ring-accent">
                  Worst stretch at {clockLabel(worstStretch.start * FRAME_INTERVAL_SEC)} · frames {worstStretch.start}–{worstStretch.end} · worst frame {worstStretch.worst}
                </button>
              )}
              <HelpNote>Click any marker to open that frame. Bar height is the model's defect signal.</HelpNote>
            </div>
          </>
        )}
      </section>

      {/* Frame detail */}
      {frame && (
        <FrameDetail
          key={frame.index}
          frame={frame}
          game={game}
          alertId={alertAtFrame?.id}
          alertStatus={alertAtFrame?.status}
          alertDecision={alertAtFrame?.decision}
          onReview={(d) => alertAtFrame && reviewAlert(alertAtFrame.id, d)}
          onFeedback={(f) => addFeedback({ gameId: game.id, frameIndex: frame.index, ...f })}
          existing={gameFeedback.filter((f) => f.frameIndex === frame.index)}
          onRemove={removeFeedback}
          onStep={(d) => select(Math.max(0, Math.min(visible - 1, frame.index + d)))}
        />
      )}

      {/* Feedback log */}
      <section>
        <div className="mb-2 flex items-baseline gap-3">
          <h2 className="font-display text-base font-bold uppercase tracking-wide">Reviewer feedback</h2>
          <span className="text-[11px] text-text-muted">supervised labels collected this session · feeds the next training run</span>
        </div>
        {gameFeedback.length === 0 ? (
          <div className="rounded-xl border border-border-subtle bg-bg-card p-6 text-center text-sm text-text-muted">
            No feedback on this match yet. Open a frame and mark the detection correct or incorrect, or flag an issue the model missed.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border-subtle bg-bg-card">
            <table className="w-full text-xs">
              <thead className="bg-bg-card text-left text-[10px] uppercase tracking-wide text-text-muted">
                <tr className="border-b border-border-subtle">
                  <th className="px-4 py-2 font-medium">Time</th>
                  <th className="px-4 py-2 text-right font-medium">Frame</th>
                  <th className="px-4 py-2 font-medium">Label</th>
                  <th className="px-4 py-2 font-medium">Defect</th>
                  <th className="px-4 py-2 text-right font-medium">Severity</th>
                  <th className="px-4 py-2 font-medium">Note</th>
                  <th className="px-4 py-2 font-medium">Logged</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {gameFeedback.map((f) => (
                  <tr key={f.id} className="border-b border-border-subtle last:border-0 transition-colors hover:bg-bg-card-hover">
                    <td className="px-4 py-2 tabular-nums"><button className="underline-offset-2 hover:underline" onClick={() => select(f.frameIndex)}>{clockLabel(f.frameIndex * FRAME_INTERVAL_SEC)}</button></td>
                    <td className="px-4 py-2 text-right tabular-nums text-text-secondary">{f.frameIndex}</td>
                    <td className="px-4 py-2">
                      {f.kind === 'correct' && <Pill tone="green">detection correct</Pill>}
                      {f.kind === 'incorrect' && <Pill tone="red">detection wrong</Pill>}
                      {f.kind === 'missed' && <Pill tone="yellow">missed issue</Pill>}
                    </td>
                    <td className="px-4 py-2">{f.defect ?? <span className="text-text-muted">—</span>}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{f.severity ?? <span className="text-text-muted">—</span>}</td>
                    <td className="max-w-xs truncate px-4 py-2 text-text-secondary">{f.note || <span className="text-text-muted">—</span>}{f.region && <span className="text-text-muted"> · region marked</span>}</td>
                    <td className="px-4 py-2 text-text-muted">{f.createdAt}</td>
                    <td className="px-4 py-2 text-right"><button className={btnGhostRow} onClick={() => removeFeedback(f.id)}>Undo</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className={cardCls}>
      <Eyebrow>{label}</Eyebrow>
      <div className="mt-1 font-display text-3xl font-bold tabular-nums">{value}</div>
      {sub && <div className="mt-1 text-[11px] text-text-muted">{sub}</div>}
    </div>
  )
}

interface DetailProps {
  frame: Frame
  game: NonNullable<ReturnType<typeof gameById>>
  alertId?: string
  alertStatus?: 'open' | 'reviewed'
  alertDecision?: 'confirmed' | 'dismissed'
  onReview: (d: 'confirmed' | 'dismissed') => void
  onFeedback: (f: { kind: 'correct' | 'incorrect' | 'missed'; defect?: DefectType; severity?: number; region?: { x: number; y: number }; note?: string }) => void
  existing: { id: string; kind: string; defect?: string }[]
  onRemove: (id: string) => void
  onStep: (d: number) => void
}

function FrameDetail({ frame, game, alertId, alertStatus, alertDecision, onReview, onFeedback, existing, onRemove, onStep }: DetailProps) {
  const [heat, setHeat] = useState(false)
  const [mode, setMode] = useState<'none' | 'incorrect' | 'missed'>('none')
  const [defect, setDefect] = useState<DefectType>('Blur')
  const [severity, setSeverity] = useState(3)
  const [note, setNote] = useState('')
  const [region, setRegion] = useState<{ x: number; y: number } | null>(null)
  const [wrongReason, setWrongReason] = useState<'false-positive' | 'wrong-type' | 'wrong-severity'>('false-positive')

  const stretch = frame.stretch
  const spatial = frame.detections.some((d) => SPATIAL_DEFECTS.includes(d.type))
  const heatAvailable = spatial && !!stretch?.heat
  const t = frame.tSec
  const hasDetections = frame.detections.length > 0
  const verdict = existing.find((e) => e.kind === 'correct' || e.kind === 'incorrect')
  const missedHere = existing.filter((e) => e.kind === 'missed')

  const reset = () => { setMode('none'); setNote(''); setRegion(null) }
  const submitIncorrect = () => {
    onFeedback({ kind: 'incorrect', defect: frame.detections[0]?.type, severity: frame.detections[0]?.severity, note: `${wrongReason}${note ? ` · ${note}` : ''}` })
    reset()
  }
  const submitMissed = () => {
    onFeedback({ kind: 'missed', defect, severity, region: region ?? undefined, note: note || undefined })
    reset()
  }

  return (
    <section className={cardCls}>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <h2 className="font-display text-base font-bold uppercase tracking-wide">Frame {frame.index} · {clockLabel(t)}</h2>
        <span className="text-xs text-text-secondary">{wallClock(game, t)} · {game.id} · {game.camera}</span>
        {alertId && (alertStatus === 'open' ? <Pill tone="yellow">open alert</Pill> : <Pill tone={alertDecision === 'confirmed' ? 'green' : 'neutral'}>{alertDecision}</Pill>)}
        <div className="ml-auto flex gap-1">
          <button className={btnGhostRow} onClick={() => onStep(-1)} aria-label="Previous frame">‹ Prev</button>
          <button className={btnGhostRow} onClick={() => onStep(1)} aria-label="Next frame">Next ›</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Frame */}
        <div className="lg:col-span-3">
          <div className="relative aspect-video overflow-hidden rounded-lg border border-border-subtle bg-bg-primary">
            <FrameThumb
              sport={game.sport}
              seed={game.seed + frame.index}
              detections={frame.detections}
              heat={stretch?.heat}
              showHeat={heat && heatAvailable}
              marker={region}
              onClickFrame={mode === 'missed' ? setRegion : undefined}
              cornerLabel={`Sampled frame · ${clockLabel(t)} · panoramic`}
              label={`Sampled frame ${frame.index} at ${clockLabel(t)}`}
            />
            {heat && heatAvailable && (
              <div className="absolute bottom-2 left-2 rounded-md bg-bg-primary/85 px-1.5 py-0.5 text-[10px] text-text-primary">Heat map: brighter = stronger defect signal</div>
            )}
            {mode === 'missed' && (
              <div className="absolute bottom-2 right-2 rounded-md bg-bg-primary/85 px-1.5 py-0.5 text-[10px] text-ground-truth">{region ? 'Region marked · click again to move' : 'Click the frame to mark where the issue is (optional)'}</div>
            )}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Toggle on={heat && heatAvailable} onChange={setHeat} label="Heat Map" />
            <span className="text-[11px] text-text-muted">
              {heatAvailable ? 'Localization validated for this defect.' : spatial ? 'Heat map unavailable: localization not validated for this frame.' : hasDetections ? 'Heat maps appear only for spatial defects.' : 'No detections on this frame.'}
            </span>
          </div>
        </div>

        {/* Detail + review */}
        <div className="flex flex-col gap-5 lg:col-span-2">
          <div>
            <Eyebrow>Detected defects</Eyebrow>
            {hasDetections ? (
              <div className="mt-1.5 flex flex-wrap gap-2">{frame.detections.map((d) => <DefectPill key={d.type} d={d} long />)}</div>
            ) : (
              <div className="mt-1.5 flex items-center gap-2 text-sm"><Pill tone="green">good frame</Pill><span className="text-text-secondary">no defects at or above threshold</span></div>
            )}
            {stretch?.region && frame.detections.length > 0 && <div className="mt-2 text-sm">Region: {frame.detections[0].type.toLowerCase()}, {stretch.region}.</div>}
            {hasDetections && !stretch?.region && <div className="mt-2 text-xs text-text-muted">Region: unavailable (global defect or localization not validated).</div>}
          </div>

          <div>
            <Eyebrow>Timestamps</Eyebrow>
            <div className="mt-1 text-xs text-text-secondary">
              <div>Frame sampled: {wallClock(game, t)} · match clock {clockLabel(t)} · frame {frame.index}</div>
              {alertId && <div>Alert raised: {wallClock(game, t)}</div>}
              <div>Stream: {game.id}, {game.camera} camera · model E-03-lite</div>
            </div>
          </div>

          {alertId && alertStatus === 'open' && (
            <div>
              <Eyebrow>Alert review</Eyebrow>
              <div className="mt-1.5 flex items-center gap-2">
                <button className={btnPrimarySm} onClick={() => onReview('confirmed')}>Confirm</button>
                <button className={btnGhost} onClick={() => onReview('dismissed')}>Dismiss</button>
                <span className="text-[11px] text-text-muted">Confirm records a human review only.</span>
              </div>
            </div>
          )}

          {/* Supervised feedback */}
          <div className="border-t border-border-subtle pt-4">
            <div className="flex items-center gap-2">
              <Eyebrow>Model feedback</Eyebrow>
              <span className="text-[11px] text-text-muted">labels train the next model version</span>
            </div>

            {hasDetections && (
              <div className="mt-2">
                <div className="text-sm">Was this detection correct?</div>
                {verdict ? (
                  <div className="mt-1.5 flex items-center gap-2 text-xs">
                    {verdict.kind === 'correct' ? <Pill tone="green">marked correct</Pill> : <Pill tone="red">marked wrong</Pill>}
                    <button className="text-text-secondary underline hover:text-text-primary" onClick={() => onRemove(verdict.id)}>undo</button>
                  </div>
                ) : (
                  <div className="mt-1.5 flex items-center gap-2">
                    <button className={`${btnGhost} inline-flex items-center gap-1.5`} onClick={() => { onFeedback({ kind: 'correct', defect: frame.detections[0].type, severity: frame.detections[0].severity }); setMode('none') }}>
                      <IconThumb />Correct
                    </button>
                    <button className={`${btnGhost} inline-flex items-center gap-1.5 ${mode === 'incorrect' ? 'border-text-muted text-text-primary' : ''}`} onClick={() => setMode(mode === 'incorrect' ? 'none' : 'incorrect')}>
                      <IconThumb down />Incorrect
                    </button>
                  </div>
                )}
                {mode === 'incorrect' && (
                  <div className="mt-3 flex flex-col gap-2 rounded-lg border border-border-subtle p-3">
                    <label className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase tracking-wide text-text-muted">What's wrong</span>
                      <select value={wrongReason} onChange={(e) => setWrongReason(e.target.value as typeof wrongReason)} className={inputCls}>
                        <option value="false-positive">False positive, the frame is fine</option>
                        <option value="wrong-type">Wrong defect type</option>
                        <option value="wrong-severity">Severity is off</option>
                      </select>
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase tracking-wide text-text-muted">Note (optional)</span>
                      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. it's shadow from the stands, not low light" className={inputCls} />
                    </label>
                    <div className="flex gap-2">
                      <button className={btnPrimarySm} onClick={submitIncorrect}>Save Label</button>
                      <button className={btnGhost} onClick={reset}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-3">
              <div className="text-sm">{hasDetections ? 'Is there another issue the model missed?' : 'Is there an issue the model missed?'}</div>
              {missedHere.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {missedHere.map((m) => <Pill key={m.id} tone="yellow">missed: {m.defect}</Pill>)}
                </div>
              )}
              {mode !== 'missed' ? (
                <button className={`${btnGhost} mt-1.5 inline-flex items-center gap-1.5`} onClick={() => setMode('missed')}>
                  <IconFlag />Flag Missed Issue
                </button>
              ) : (
                <div className="mt-2 flex flex-col gap-2 rounded-lg border border-border-subtle p-3">
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase tracking-wide text-text-muted">Defect</span>
                      <select value={defect} onChange={(e) => setDefect(e.target.value as DefectType)} className={inputCls}>
                        {DEFECT_TYPES.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase tracking-wide text-text-muted">Severity</span>
                      <select value={severity} onChange={(e) => setSeverity(Number(e.target.value))} className={inputCls}>
                        {[1, 2, 3, 4, 5].map((s) => <option key={s} value={s}>{s} {s === 1 ? '· minimal' : s === 5 ? '· extreme' : ''}</option>)}
                      </select>
                    </label>
                  </div>
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-wide text-text-muted">Note (optional)</span>
                    <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="what you see and where" className={inputCls} />
                  </label>
                  <div className="text-[11px] text-text-muted">{region ? `Region marked at ${Math.round(region.x * 100)}%, ${Math.round(region.y * 100)}% of frame.` : 'Click the frame on the left to mark the region (optional).'}</div>
                  <div className="flex gap-2">
                    <button className={btnPrimarySm} onClick={submitMissed}>Save Label</button>
                    <button className={btnGhost} onClick={reset}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
