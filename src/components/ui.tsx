import type { ReactNode } from 'react'
import type { Detection, GameStatus } from '../data/types'

/* Button variants from DESIGN.md §5 — three, that's it. */
export const btnPrimary =
  'rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-accent'
export const btnPrimarySm =
  'rounded-lg bg-accent px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-accent'
export const btnGhost =
  'rounded-lg border border-border-subtle px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-text-muted hover:text-text-primary hover:bg-bg-card-hover disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-accent'
export const btnGhostRow =
  'rounded-lg border border-border-subtle px-3 py-1 text-xs font-medium text-text-secondary transition-colors hover:border-text-muted hover:text-text-primary hover:bg-bg-card-hover disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-accent'
export const btnDestructive =
  'rounded-lg bg-red-500/20 border border-red-500/40 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/30 focus:outline-none focus:ring-1 focus:ring-accent'

export const inputCls =
  'rounded-lg border border-border-subtle bg-bg-primary px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent placeholder:text-text-muted'

export const cardCls = 'rounded-xl border border-border-subtle bg-bg-card p-4'

export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`text-[10px] uppercase tracking-wide text-text-muted ${className}`}>{children}</div>
}

export function Display({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`font-display font-bold uppercase tracking-wide ${className}`}>{children}</span>
}

export function Kpi({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div className={cardCls}>
      <Eyebrow>{label}</Eyebrow>
      <div className="mt-1 font-display text-3xl font-bold tabular-nums">{value}</div>
      {sub && <div className="mt-1 text-xs text-text-secondary">{sub}</div>}
    </div>
  )
}

type Tone = 'red' | 'yellow' | 'green' | 'neutral'
const tones: Record<Tone, string> = {
  red: 'bg-red-500/20 text-red-400',
  yellow: 'bg-yellow-500/20 text-yellow-400',
  green: 'bg-green-500/20 text-green-400',
  neutral: 'bg-bg-card-hover text-text-secondary',
}

export function Pill({ tone = 'neutral', children, className = '' }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${tones[tone]} ${className}`}>
      {children}
    </span>
  )
}

export function severityTone(sev: number): Tone {
  if (sev >= 4) return 'red'
  if (sev === 3) return 'yellow'
  return 'neutral'
}

export function DefectPill({ d, long = false }: { d: Detection; long?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-bg-primary py-0.5 pl-2.5 pr-1 text-xs">
      <span className="text-text-primary">{d.type}</span>
      <Pill tone={severityTone(d.severity)}>{long ? `Severity ${d.severity}` : `Sev ${d.severity}`}</Pill>
    </span>
  )
}

export function StatusPill({ status, openAlerts = 0 }: { status: GameStatus; openAlerts?: number }) {
  switch (status) {
    case 'live':
      return <Pill tone="red"><span className="inline-block h-1.5 w-1.5 rounded-full bg-red-400" aria-hidden />live</Pill>
    case 'processing':
      return <Pill tone="yellow"><Spinner />processing</Pill>
    case 'queued':
      return <Pill tone="yellow">queued</Pill>
    case 'no-video':
      return <Pill tone="red">no video</Pill>
    default:
      return openAlerts > 0 ? <Pill tone="yellow">{openAlerts} open alert{openAlerts === 1 ? '' : 's'}</Pill> : <Pill tone="green">analyzed</Pill>
  }
}

export function Spinner() {
  return <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden />
}

export function HelpNote({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-border-subtle bg-bg-card px-3 py-2 text-xs text-text-secondary">
      <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-bg-card-hover text-[10px] text-text-primary" aria-hidden>?</span>
      <span>{children}</span>
    </div>
  )
}

export function EmptyState({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center text-sm text-text-muted">
      <div>{children}</div>
      {action}
    </div>
  )
}

export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="inline-flex rounded-lg border border-border-subtle bg-bg-primary p-0.5" role="tablist">
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-md px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-accent ${
            value === o.value ? 'bg-bg-card text-text-primary' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="inline-flex items-center gap-3 rounded-lg border border-border-subtle px-3 py-2 text-sm transition-colors hover:border-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
    >
      <span className={`relative inline-block h-4 w-7 rounded-full transition-colors ${on ? 'bg-accent' : 'bg-border-subtle'}`} aria-hidden>
        <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-text-primary transition-colors ${on ? 'left-3.5' : 'left-0.5'}`} />
      </span>
      <span className="font-medium">{label}: {on ? 'On' : 'Off'}</span>
    </button>
  )
}

/* Icons (inline SVG, stroke 1.5, currentColor). */
export function IconBell({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  )
}
export function IconPlus({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}
export function IconSearch({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
      <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
    </svg>
  )
}
export function IconX({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  )
}
export function IconChevron({ className = 'h-4 w-4', dir = 'right' }: { className?: string; dir?: 'left' | 'right' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {dir === 'right' ? <path d="m9 6 6 6-6 6" /> : <path d="m15 6-6 6 6 6" />}
    </svg>
  )
}
export function IconThumb({ className = 'h-4 w-4', down = false }: { className?: string; down?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={down ? { transform: 'rotate(180deg)' } : undefined}>
      <path d="M7 10v11H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h3Z" />
      <path d="M7 10l4-7a2 2 0 0 1 2 2v4h5.5a2 2 0 0 1 2 2.3l-1.2 7a2 2 0 0 1-2 1.7H7" />
    </svg>
  )
}
export function IconFlag({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 21V4" /><path d="M5 4h12l-2 4 2 4H5" />
    </svg>
  )
}
