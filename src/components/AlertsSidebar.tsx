import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { gameById, gameTitle } from '../data/games'
import FrameThumb from './FrameThumb'
import TeamCrest from './TeamCrest'
import { DefectPill, EmptyState, IconX, Pill, Segmented, btnGhostRow, btnPrimarySm } from './ui'

export default function AlertsSidebar() {
  const { sidebarOpen, setSidebarOpen, alerts, reviewAlert } = useStore()
  const [tab, setTab] = useState<'open' | 'reviewed'>('open')
  const [failing, setFailing] = useState<string | null>(null)
  const nav = useNavigate()
  if (!sidebarOpen) return null

  const list = alerts.filter((a) => a.status === tab)
  const open = (a: (typeof alerts)[number]) => {
    nav(`/games/${a.gameId}?frame=${a.frameIndex}&alert=${a.id}`)
  }

  return (
    <aside className="fixed inset-y-12 right-0 z-10 flex w-[420px] flex-col border-l border-border-subtle bg-bg-card" aria-label="Alerts">
      <div className="flex items-center gap-3 border-b border-border-subtle px-4 py-3">
        <h2 className="font-display text-base font-bold uppercase tracking-wide">Alerts</h2>
        <Segmented value={tab} onChange={setTab} options={[{ value: 'open', label: `Open (${alerts.filter((a) => a.status === 'open').length})` }, { value: 'reviewed', label: `Reviewed (${alerts.filter((a) => a.status === 'reviewed').length})` }]} />
        <button onClick={() => setSidebarOpen(false)} aria-label="Close alerts" className="ml-auto rounded-lg p-1 text-text-secondary transition-colors hover:bg-bg-card-hover hover:text-text-primary focus:outline-none focus:ring-1 focus:ring-accent">
          <IconX />
        </button>
      </div>
      <div className="px-4 py-2 text-[11px] text-text-muted">{tab === 'open' ? 'Sorted: most severe first' : 'Sorted: most recent first'}</div>
      <div className="flex-1 overflow-y-auto">
        {list.length === 0 ? (
          <EmptyState>{tab === 'open' ? 'No open alerts. New alerts from live streams will appear here.' : 'No reviewed alerts yet. Confirm or dismiss an open alert to see it here.'}</EmptyState>
        ) : (
          <ul className="divide-y divide-border-subtle">
            {list.map((a) => {
              const game = gameById(a.gameId)!
              const worst = Math.max(...a.detections.map((d) => d.severity))
              return (
                <li key={a.id} className="transition-colors hover:bg-bg-card-hover">
                  <div className="flex gap-3 px-4 py-3">
                    <button onClick={() => open(a)} className="w-24 shrink-0 overflow-hidden rounded-lg border border-border-subtle focus:outline-none focus:ring-1 focus:ring-accent" aria-label={`Open frame ${a.frameIndex} of ${game.id}`}>
                      <FrameThumb sport={game.sport} seed={game.seed} detections={a.detections} />
                    </button>
                    <div className="min-w-0 flex-1">
                      <button onClick={() => open(a)} className="flex items-baseline gap-2 text-left focus:outline-none focus:ring-1 focus:ring-accent rounded">
                        <span className="font-display text-base font-bold uppercase tracking-wide">{game.id}</span>
                        <span className="text-xs text-text-muted">{a.raisedAt}</span>
                      </button>
                      <div className="flex items-center gap-1.5 truncate text-xs text-text-secondary">
                        <TeamCrest team={game.home} size={14} /><TeamCrest team={game.away} size={14} />
                        <span className="truncate">{gameTitle(game)} · {game.camera}</span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {a.detections.map((d) => <DefectPill key={d.type} d={d} />)}
                      </div>
                      {tab === 'open' ? (
                        <div className="mt-2 flex items-center gap-2">
                          <button className={btnPrimarySm} onClick={() => reviewAlert(a.id, 'confirmed')}>Confirm</button>
                          <button
                            className={btnGhostRow}
                            onClick={() => {
                              // Demo of the failed-save branch: one alert fails on first try.
                              if (a.id === 'alr-gam1042-0' && failing !== a.id) { setFailing(a.id); return }
                              reviewAlert(a.id, 'dismissed')
                            }}
                          >
                            Dismiss
                          </button>
                          {worst >= 4 && <span className="text-[11px] text-red-400">severity {worst}</span>}
                        </div>
                      ) : (
                        <div className="mt-2 flex items-center gap-2 text-[11px] text-text-muted">
                          {a.decision === 'confirmed' ? <Pill tone="green">confirmed</Pill> : <Pill tone="neutral">dismissed</Pill>}
                          <span>by {a.reviewedBy} · {a.reviewedAt}</span>
                        </div>
                      )}
                      {failing === a.id && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-red-400">
                          <span>Save failed. The alert stays open.</span>
                          <button className={btnGhostRow} onClick={() => { setFailing(null); reviewAlert(a.id, 'dismissed') }}>Retry</button>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
      <div className="border-t border-border-subtle px-4 py-3 text-[11px] text-text-muted">
        Click an alert to see its frame and defects. Confirm records the review; Dismiss records a false alarm. The original model output is kept either way.
      </div>
    </aside>
  )
}
