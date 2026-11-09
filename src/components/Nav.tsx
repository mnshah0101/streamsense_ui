import { NavLink, Link, useLocation } from 'react-router-dom'
import { resetDemo, useStore } from '../store'
import { IconBell, IconPlus } from './ui'

const linkCls = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-1.5 text-sm transition-colors focus:outline-none focus:ring-1 focus:ring-accent ${
    isActive ? 'font-medium text-text-primary' : 'text-text-secondary hover:text-text-primary'
  }`

export default function Nav() {
  const { toggleSidebar, sidebarOpen, unseenAlerts, alerts } = useStore()
  const loc = useLocation()
  const openCount = alerts.filter((a) => a.status === 'open').length
  const badge = unseenAlerts > 0 ? unseenAlerts : openCount
  return (
    <header className="sticky top-0 z-20 h-12 border-b border-border-subtle bg-bg-card">
      <div className="flex h-full items-center gap-4 px-6">
        <Link to="/" className="flex items-center gap-2 focus:outline-none focus:ring-1 focus:ring-accent rounded-lg">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-text-primary" aria-hidden>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round"><path d="M6 8h12M6 12h12M6 16h7" /></svg>
          </span>
          <span className="font-display text-xl font-bold uppercase tracking-wide">StreamSense</span>
        </Link>
        <nav className="ml-4 flex items-center gap-1" aria-label="Primary">
          <NavLink to="/" end className={linkCls}>Games</NavLink>
          <NavLink to="/performance" className={linkCls}>Model Performance</NavLink>
          {loc.pathname.startsWith('/games/') && (
            <span className="rounded-lg px-3 py-1.5 text-sm font-medium text-text-primary">Match Analysis</span>
          )}
          {loc.pathname === '/test' && (
            <span className="rounded-lg px-3 py-1.5 text-sm font-medium text-text-primary">Test a Stream or Clip</span>
          )}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={resetDemo} className="rounded-lg px-2 py-1.5 text-[11px] text-text-muted transition-colors hover:text-text-primary focus:outline-none focus:ring-1 focus:ring-accent">Reset demo</button>
          <Link to="/test" className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent-hover focus:outline-none focus:ring-1 focus:ring-accent" aria-label="Test a stream or clip">
            <IconPlus className="h-4 w-4" />
            <span>Test Stream or Clip</span>
          </Link>
          <button
            onClick={toggleSidebar}
            aria-label={`Alerts, ${openCount} open`}
            aria-pressed={sidebarOpen}
            className={`relative inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors focus:outline-none focus:ring-1 focus:ring-accent ${
              sidebarOpen ? 'border-text-muted bg-bg-card-hover text-text-primary' : 'border-border-subtle text-text-secondary hover:border-text-muted hover:text-text-primary hover:bg-bg-card-hover'
            }`}
          >
            <IconBell />
            {badge > 0 && (
              <span className={`absolute -right-1.5 -top-1.5 min-w-4 rounded-full px-1 text-center text-[10px] font-medium leading-4 ${unseenAlerts > 0 ? 'bg-accent text-white' : 'bg-bg-card-hover text-text-secondary border border-border-subtle'}`}>
                {badge}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
