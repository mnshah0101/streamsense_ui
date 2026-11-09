import { Link } from 'react-router-dom'
import type { Game } from '../data/types'
import { gameTitle } from '../data/games'
import { useStore } from '../store'
import MatchupThumb from './MatchupThumb'
import { StatusPill } from './ui'

export default function GameCard({ game, wide = false }: { game: Game; wide?: boolean }) {
  const { alerts, gameStatus } = useStore()
  const status = gameStatus[game.id]
  const open = alerts.filter((a) => a.gameId === game.id && a.status === 'open')
  const worst = game.stretches[0]
  const date = new Date(game.date + 'T12:00:00').toLocaleDateString([], { month: 'short', day: 'numeric' })
  return (
    <Link
      to={`/games/${game.id}`}
      className={`group block shrink-0 overflow-hidden rounded-xl border border-border-subtle bg-bg-card transition-colors hover:border-text-muted focus:outline-none focus:ring-1 focus:ring-accent ${wide ? 'w-full' : 'w-64'}`}
    >
      <div className="relative aspect-video border-b border-border-subtle bg-bg-primary">
        <MatchupThumb game={game} />
        {status === 'no-video' && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/70 text-xs text-red-400">No video available</div>
        )}
        <div className="absolute left-2 top-2"><StatusPill status={status} openAlerts={open.length} /></div>
        <div className="absolute bottom-2 right-2 rounded-md bg-bg-primary/85 px-1.5 py-0.5 text-[10px] text-text-secondary">{game.durationMin} min</div>
      </div>
      <div className="p-3">
        <div className="flex items-baseline justify-between gap-2">
          <div className="truncate font-display text-base font-bold uppercase tracking-wide">{gameTitle(game)}</div>
          <div className="shrink-0 text-[11px] text-text-muted">{game.id}</div>
        </div>
        <div className="mt-0.5 truncate text-xs text-text-secondary">
          {game.sport} · {game.league} · {date} {game.startTime}
        </div>
        <div className="mt-1 truncate text-[11px] text-text-muted">
          {game.camera} · {game.venue}
          {worst && status !== 'no-video' && status !== 'queued' && <> · worst: {worst.defects[0].type.toLowerCase()} sev {worst.defects[0].severity}</>}
        </div>
      </div>
    </Link>
  )
}
