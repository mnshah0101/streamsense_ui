import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { GAMES, gameTitle } from '../data/games'
import { CAMERAS, DEFECT_TYPES, SPORTS, type Game, type GameStatus } from '../data/types'
import { useStore } from '../store'
import GameCard from '../components/GameCard'
import { EmptyState, IconChevron, IconPlus, IconSearch, btnGhost, inputCls } from '../components/ui'

type StatusFilter = 'all' | GameStatus | 'needs-review'

export default function Home() {
  const { alerts, gameStatus } = useStore()
  const [q, setQ] = useState('')
  const [sport, setSport] = useState('all')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [defect, setDefect] = useState('all')
  const [camera, setCamera] = useState('all')
  const [sort, setSort] = useState<'recent' | 'severity' | 'title'>('recent')

  const openFor = (g: Game) => alerts.filter((a) => a.gameId === g.id && a.status === 'open').length
  const worstSev = (g: Game) => Math.max(0, ...g.stretches.flatMap((s) => s.defects.map((d) => d.severity)))

  const filtering = q.trim() !== '' || sport !== 'all' || status !== 'all' || defect !== 'all' || camera !== 'all'

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    let list = GAMES.filter((g) => {
      if (needle && !`${g.id} ${gameTitle(g)} ${g.sport} ${g.league} ${g.venue} ${g.camera}`.toLowerCase().includes(needle)) return false
      if (sport !== 'all' && g.sport !== sport) return false
      if (camera !== 'all' && g.camera !== camera) return false
      if (defect !== 'all' && !g.stretches.some((s) => s.defects.some((d) => d.type === defect))) return false
      const st = gameStatus[g.id]
      if (status === 'needs-review') return openFor(g) > 0
      if (status !== 'all' && st !== status) return false
      return true
    })
    list = [...list].sort((a, b) => {
      if (sort === 'severity') return worstSev(b) - worstSev(a)
      if (sort === 'title') return gameTitle(a).localeCompare(gameTitle(b))
      return (b.date + b.startTime).localeCompare(a.date + a.startTime)
    })
    return list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, sport, status, defect, camera, sort, alerts, gameStatus])

  const clear = () => { setQ(''); setSport('all'); setStatus('all'); setDefect('all'); setCamera('all') }

  const needsReview = GAMES.filter((g) => openFor(g) > 0).sort((a, b) => worstSev(b) - worstSev(a))
  const live = GAMES.filter((g) => ['live', 'processing', 'queued'].includes(gameStatus[g.id]))
  const recent = GAMES.filter((g) => gameStatus[g.id] === 'analyzed').sort((a, b) => (b.date + b.startTime).localeCompare(a.date + a.startTime))
  const bySport = SPORTS.map((s) => ({ sport: s, games: GAMES.filter((g) => g.sport === s) })).filter((x) => x.games.length > 0)

  const selectCls = `${inputCls} pr-7`

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <h1 className="font-display text-xl font-bold uppercase tracking-wide">Games</h1>
          <p className="text-xs text-text-secondary">{GAMES.length} recorded matches · {alerts.filter((a) => a.status === 'open').length} open alerts · click a game to open its match analysis</p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <label className="relative">
            <span className="sr-only">Search games</span>
            <IconSearch className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search team, game id, venue…" className={`${inputCls} w-64 pl-8`} />
          </label>
          <Filter label="Sport" value={sport} onChange={setSport} options={SPORTS} cls={selectCls} />
          <Filter label="Status" value={status} onChange={(v) => setStatus(v as StatusFilter)} cls={selectCls}
            options={[['needs-review', 'Needs review'], ['live', 'Live'], ['processing', 'Processing'], ['queued', 'Queued'], ['analyzed', 'Analyzed'], ['no-video', 'No video']]} />
          <Filter label="Defect" value={defect} onChange={setDefect} options={DEFECT_TYPES} cls={selectCls} />
          <Filter label="Camera" value={camera} onChange={setCamera} options={CAMERAS} cls={selectCls} />
          <Filter label="Sort" value={sort} onChange={(v) => setSort(v as typeof sort)} cls={selectCls} noAll
            options={[['recent', 'Most recent'], ['severity', 'Most severe'], ['title', 'Title A–Z']]} />
          {filtering && <button className={btnGhost} onClick={clear}>Clear Filters</button>}
        </div>
      </div>

      {filtering ? (
        <section>
          <div className="mb-3 text-xs text-text-secondary">{filtered.length} result{filtered.length === 1 ? '' : 's'}</div>
          {filtered.length === 0 ? (
            <EmptyState action={<button className={btnGhost} onClick={clear}>Clear Filters</button>}>
              No results match {q.trim() ? <>“{q.trim()}”</> : 'these filters'}.
            </EmptyState>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((g) => <GameCard key={g.id} game={g} wide />)}
            </div>
          )}
        </section>
      ) : (
        <>
          {needsReview.length > 0 && <Row title="Needs review" sub="open alerts, most severe first" games={needsReview} />}
          {live.length > 0 && <Row title="Live and in progress" sub="streams and jobs still producing frames" games={live} />}
          <Row title="Recently analyzed" sub="complete timelines, newest first" games={recent} />
          {bySport.map((x) => <Row key={x.sport} title={x.sport} sub={`${x.games.length} match${x.games.length === 1 ? '' : 'es'}`} games={x.games} />)}
          <Link to="/test" className="flex items-center justify-between rounded-xl border border-border-subtle bg-bg-card p-4 transition-colors hover:border-text-muted focus:outline-none focus:ring-1 focus:ring-accent">
            <div>
              <div className="font-display text-base font-bold uppercase tracking-wide">Test a Stream or Clip</div>
              <div className="text-xs text-text-secondary">Upload a clip or image, or queue a full match analysis. It appears in this catalog as it runs.</div>
            </div>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white" aria-hidden><IconPlus /></span>
          </Link>
        </>
      )}
    </div>
  )
}

function Filter({ label, value, onChange, options, cls, noAll = false }: { label: string; value: string; onChange: (v: string) => void; options: (string | [string, string])[]; cls: string; noAll?: boolean }) {
  return (
    <label className="inline-flex items-center gap-1.5">
      <span className="text-[10px] uppercase tracking-wide text-text-muted">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={cls}>
        {!noAll && <option value="all">All</option>}
        {options.map((o) => {
          const [v, l] = Array.isArray(o) ? o : [o, o]
          return <option key={v} value={v}>{l}</option>
        })}
      </select>
    </label>
  )
}

function Row({ title, sub, games }: { title: string; sub: string; games: Game[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * 560, behavior: 'smooth' })
  return (
    <section>
      <div className="mb-2 flex items-baseline gap-3">
        <h2 className="font-display text-base font-bold uppercase tracking-wide">{title}</h2>
        <span className="text-[11px] text-text-muted">{sub}</span>
        <div className="ml-auto flex gap-1">
          <button onClick={() => scroll(-1)} aria-label={`Scroll ${title} left`} className="rounded-lg border border-border-subtle p-1 text-text-secondary transition-colors hover:border-text-muted hover:text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"><IconChevron dir="left" /></button>
          <button onClick={() => scroll(1)} aria-label={`Scroll ${title} right`} className="rounded-lg border border-border-subtle p-1 text-text-secondary transition-colors hover:border-text-muted hover:text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"><IconChevron /></button>
        </div>
      </div>
      <div ref={ref} className="row-scroll -mx-6 flex gap-4 overflow-x-auto px-6 pb-1">
        {games.map((g) => <GameCard key={g.id} game={g} />)}
      </div>
    </section>
  )
}
