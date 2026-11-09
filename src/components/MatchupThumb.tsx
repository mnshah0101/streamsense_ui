import type { Game } from '../data/types'
import { teamOf } from '../data/teams'
import FrameThumb from './FrameThumb'
import SportIcon from './SportIcon'
import TeamCrest from './TeamCrest'

/** Catalog poster: both crests over a dimmed sampled frame, with the sport glyph. */
export default function MatchupThumb({ game, dim = true }: { game: Game; dim?: boolean }) {
  const home = teamOf(game.home)
  const away = teamOf(game.away)
  const worst = game.stretches[0]
  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className={dim ? 'opacity-40' : ''}>
        <FrameThumb sport={game.sport} seed={game.seed} detections={worst?.defects} />
      </div>
      <div className="absolute inset-0 flex items-center justify-center gap-3">
        <div className="flex flex-col items-center gap-1">
          <TeamCrest team={game.home} size={52} />
          <span className="text-[10px] font-medium uppercase tracking-wide text-text-primary">{home.mascot}</span>
        </div>
        <span className="font-display text-base font-bold uppercase tracking-wide text-text-secondary">vs</span>
        <div className="flex flex-col items-center gap-1">
          <TeamCrest team={game.away} size={52} />
          <span className="text-[10px] font-medium uppercase tracking-wide text-text-primary">{away.mascot}</span>
        </div>
      </div>
      <div className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-md bg-bg-primary/85 px-1.5 py-0.5 text-[10px] text-text-secondary">
        <SportIcon sport={game.sport} className="h-3 w-3" />
        <span>{game.sport}</span>
      </div>
    </div>
  )
}
