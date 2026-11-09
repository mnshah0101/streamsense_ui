import { useRef, useState, type DragEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GAMES, gameById, gameTitle, totalFrames } from '../data/games'
import { useStore } from '../store'
import { Eyebrow, HelpNote, Pill, Spinner, btnGhost, btnPrimary, cardCls, inputCls } from '../components/ui'

const ACCEPT = ['video/mp4', 'video/quicktime', 'image/jpeg', 'image/png']

export default function TestStream() {
  const { startJob, jobs } = useStore()
  const nav = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [fileErr, setFileErr] = useState<string | null>(null)
  const [drag, setDrag] = useState(false)
  const [matchId, setMatchId] = useState('gam1088')
  const [picking, setPicking] = useState(false)
  const match = gameById(matchId)!

  const take = (f: File | undefined) => {
    setFileErr(null)
    if (!f) return
    if (!ACCEPT.includes(f.type)) { setFile(null); setFileErr(`Unsupported file type (${f.type || 'unknown'}). Use MP4, MOV, JPG or PNG.`); return }
    if (f.size > 200 * 1024 * 1024) { setFile(null); setFileErr('File is over 200 MB. Trim the clip to 60 s or less.'); return }
    setFile(f)
  }
  const onDrop = (e: DragEvent) => { e.preventDefault(); setDrag(false); take(e.dataTransfer.files[0]) }

  const runClip = () => {
    if (!file) return
    const isImage = file.type.startsWith('image/')
    startJob({ label: file.name, kind: isImage ? 'image' : 'clip', totalFrames: isImage ? 1 : 12, hardware: 'T4 · us-east', meanLatencyMs: 1900 })
    setFile(null)
  }
  const runMatch = () => {
    const id = startJob({ label: `${match.id} · ${gameTitle(match)}`, gameId: match.id, kind: 'match', totalFrames: totalFrames(match), hardware: 'T4 · us-east', meanLatencyMs: 1900 })
    nav(`/games/${match.id}?job=${id}`)
  }
  const busy = jobs.some((j) => j.gameId === match.id && j.status !== 'done' && j.status !== 'failed')

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link to="/" className="text-xs text-text-secondary hover:text-text-primary">← Back to Games</Link>
        <h1 className="mt-1 font-display text-xl font-bold uppercase tracking-wide">Test a Stream or Clip</h1>
        <p className="text-sm text-text-secondary">Check one camera on demand: upload a clip or image, or run a whole recorded match.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-3 lg:col-span-2">
          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
            onDragLeave={() => setDrag(false)}
            onDrop={onDrop}
            className={`flex min-h-72 flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-bg-card p-6 text-center transition-colors ${drag ? 'border-text-primary' : 'border-border-subtle'}`}
          >
            <div className="font-display text-base font-bold uppercase tracking-wide">Drag a clip or image here</div>
            <div className="text-sm text-text-secondary">Accepted: MP4, MOV up to 60 s; JPG, PNG</div>
            <button className={`${btnGhost} mt-2`} onClick={() => fileRef.current?.click()}>Choose File…</button>
            <input ref={fileRef} type="file" accept={ACCEPT.join(',')} className="hidden" onChange={(e) => take(e.target.files?.[0])} />
            {file && (
              <div className="mt-3 flex items-center gap-2 text-xs">
                <Pill tone="green">selected</Pill>
                <span className="text-text-primary">{file.name}</span>
                <span className="text-text-muted">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                <button className="text-text-secondary underline hover:text-text-primary" onClick={() => setFile(null)}>remove</button>
              </div>
            )}
            {fileErr && <div className="mt-3 text-xs text-red-400">{fileErr}</div>}
          </div>
          <div className="flex items-center gap-3">
            <button className={btnPrimary} disabled={!file} onClick={runClip}>Run Analysis</button>
            <HelpNote>We analyze one frame every five seconds, same as production.</HelpNote>
          </div>
        </div>

        <div className={`${cardCls} p-5`}>
          <div className="font-display text-base font-bold uppercase tracking-wide">Full match analysis</div>
          <p className="mt-1 text-xs text-text-secondary">Run every sampled frame of a recorded match. Results stream into the timeline as they arrive.</p>
          <Eyebrow className="mt-4">Match</Eyebrow>
          {picking ? (
            <select autoFocus value={matchId} onChange={(e) => { setMatchId(e.target.value); setPicking(false) }} onBlur={() => setPicking(false)} className={`${inputCls} mt-1 w-full`}>
              {GAMES.map((g) => <option key={g.id} value={g.id}>{g.id} · {gameTitle(g)} · {g.sport}</option>)}
            </select>
          ) : (
            <button onClick={() => setPicking(true)} className="mt-1 flex w-full items-center justify-between rounded-lg border border-border-subtle bg-bg-primary px-3 py-2 text-left text-sm transition-colors hover:border-text-muted focus:outline-none focus:ring-1 focus:ring-accent">
              <span>{match.id} · {gameTitle(match)}</span>
              <span className="text-xs text-text-secondary">Change ›</span>
            </button>
          )}
          <div className="mt-1 text-[11px] text-text-muted">{match.sport} · {match.camera} · {match.durationMin} min</div>
          <button className={`${btnPrimary} mt-4 w-full`} disabled={busy || match.status === 'no-video'} onClick={runMatch}>
            {busy ? <span className="inline-flex items-center gap-2 text-yellow-400"><Spinner />Running…</span> : 'Run Full Match Analysis'}
          </button>
          <div className="mt-2 text-[11px] text-text-muted">
            {match.status === 'no-video' ? 'No video available for this match.' : `${match.durationMin} min match = ${totalFrames(match)} sampled frames`}
          </div>
        </div>
      </div>

      <section>
        <h2 className="mb-2 font-display text-base font-bold uppercase tracking-wide">Jobs this session</h2>
        {jobs.length === 0 ? (
          <div className="text-sm text-text-muted">No jobs yet. Run a clip or a full match and its progress will appear here.</div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border-subtle bg-bg-card">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-bg-card text-left text-[10px] uppercase tracking-wide text-text-muted">
                <tr className="border-b border-border-subtle">
                  <th className="px-4 py-2 font-medium">Job</th>
                  <th className="px-4 py-2 font-medium">Kind</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 text-right font-medium">Frames</th>
                  <th className="px-4 py-2 font-medium">Hardware</th>
                  <th className="px-4 py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((j) => (
                  <tr key={j.id} className="border-b border-border-subtle last:border-0 transition-colors hover:bg-bg-card-hover">
                    <td className="px-4 py-2 text-text-primary">{j.label}</td>
                    <td className="px-4 py-2 text-text-secondary">{j.kind}</td>
                    <td className="px-4 py-2">
                      {j.status === 'queued' && <span className="text-yellow-400">queued</span>}
                      {j.status === 'running' && <span className="inline-flex items-center gap-1.5 text-yellow-400"><Spinner />running</span>}
                      {j.status === 'done' && <span className="text-green-400">complete</span>}
                      {j.status === 'failed' && <span className="text-red-400">failed</span>}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums text-text-secondary">{j.doneFrames} / {j.totalFrames}</td>
                    <td className="px-4 py-2 text-text-secondary">{j.hardware}</td>
                    <td className="px-4 py-2 text-right">
                      {j.gameId ? <Link to={`/games/${j.gameId}`} className="text-text-secondary underline hover:text-text-primary">Open match analysis</Link> : <span className="text-text-muted">{j.status === 'done' ? `${j.totalFrames === 1 ? 'no defects' : '1 frame flagged'}` : ''}</span>}
                    </td>
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
