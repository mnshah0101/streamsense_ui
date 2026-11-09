import type { Detection, Sport } from '../data/types'
import type { MouseEvent } from 'react'

interface Props {
  sport: Sport
  seed: number
  detections?: Detection[]
  heat?: { cx: number; cy: number; r: number } | null
  showHeat?: boolean
  className?: string
  /** Optional marker placed by the reviewer (0..1 coords). */
  marker?: { x: number; y: number } | null
  onClickFrame?: (p: { x: number; y: number }) => void
  label?: string
  cornerLabel?: string
}

/**
 * Placeholder "sampled frame" — a flat broadcast-style venue drawing in neutral
 * grays. Detected defects are rendered as visual treatments on the drawing so the
 * demo reads correctly without client footage. This is synthetic, not inference.
 */
export default function FrameThumb({ sport, seed, detections = [], heat, showHeat, className = '', marker, onClickFrame, label, cornerLabel }: Props) {
  const has = (t: Detection['type']) => detections.find((d) => d.type === t)
  const blur = has('Blur')
  const low = has('Low light')
  const over = has('Overexposure')
  const miscal = has('Miscalibration')
  const stitch = has('Stitching')
  const weather = has('Weather')

  const filters: string[] = []
  if (blur) filters.push(`blur(${blur.severity * 0.35}px)`)
  if (low) filters.push(`brightness(${1 - low.severity * 0.16})`)
  if (over) filters.push(`brightness(${1 + over.severity * 0.22}) contrast(${1 - over.severity * 0.1})`)
  if (weather) filters.push(`contrast(${1 - weather.severity * 0.12}) brightness(1.05)`)
  const skew = miscal ? miscal.severity * 1.6 : 0
  const seam = stitch ? stitch.severity * 3 : 0
  const hue = (seed * 37) % 360 // tiny tint variation so cards aren't identical

  const handleClick = (e: MouseEvent<SVGSVGElement>) => {
    if (!onClickFrame) return
    const rect = e.currentTarget.getBoundingClientRect()
    onClickFrame({ x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height })
  }

  return (
    <div className="relative h-full w-full">
    <svg
      viewBox="0 0 320 180"
      className={`block h-full w-full ${onClickFrame ? 'cursor-crosshair' : ''} ${className}`}
      role="img"
      aria-label={label ?? `Sampled frame, ${sport}`}
      onClick={handleClick}
    >
      <defs>
        <radialGradient id={`heat-${seed}`}>
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g style={{ filter: filters.join(' ') || undefined }}>
        {/* crowd / background band */}
        <rect width="320" height="180" fill={`hsl(${hue} 4% 22%)`} />
        <rect y="0" width="320" height="52" fill={`hsl(${hue} 4% 17%)`} />
        {/* playing surface, skewed when miscalibrated */}
        <g transform={`translate(${skew * 2} 0) skewX(${-skew})`}>
          <Surface sport={sport} />
        </g>
        {/* stitching seam */}
        {stitch && (
          <g>
            <rect x={160} y={0} width={seam} height={180} fill={`hsl(${hue} 4% 12%)`} />
            <g transform={`translate(${seam} 0)`}><Surface sport={sport} clipRight /></g>
          </g>
        )}
        {/* weather speckle */}
        {weather && Array.from({ length: 30 }).map((_, i) => (
          <circle key={i} cx={(i * 53 + seed * 11) % 320} cy={(i * 29 + seed * 7) % 180} r={1.2} fill="#fff" opacity={0.35} />
        ))}
      </g>
      {showHeat && heat && (
        <circle cx={heat.cx * 320} cy={heat.cy * 180} r={heat.r * 320} fill={`url(#heat-${seed})`} />
      )}
      {marker && (
        <g transform={`translate(${marker.x * 320} ${marker.y * 180})`}>
          <circle r="10" fill="none" stroke="var(--color-ground-truth)" strokeWidth="2" />
          <circle r="2" fill="var(--color-ground-truth)" />
        </g>
      )}
    </svg>
    {cornerLabel && (
      <div className="pointer-events-none absolute left-2 top-2 rounded-md bg-bg-primary/85 px-1.5 py-0.5 text-[10px] text-text-primary">{cornerLabel}</div>
    )}
    </div>
  )
}

function Surface({ sport, clipRight = false }: { sport: Sport; clipRight?: boolean }) {
  const field = '#8a8a8a'
  const line = '#d9d9d9'
  const clip = clipRight ? { clipPath: 'inset(0 0 0 50%)' } : undefined
  switch (sport) {
    case 'Basketball':
    case 'Volleyball':
      return (
        <g style={clip}>
          <rect x="40" y="62" width="240" height="96" fill={field} />
          <rect x="40" y="62" width="240" height="96" fill="none" stroke={line} strokeWidth="1.5" />
          <line x1="160" y1="62" x2="160" y2="158" stroke={line} strokeWidth="1.5" />
          {sport === 'Basketball' && <circle cx="160" cy="110" r="16" fill="none" stroke={line} strokeWidth="1.5" />}
          {sport === 'Basketball' && <><path d="M40 86 h30 a24 24 0 0 1 0 48 h-30" fill="none" stroke={line} strokeWidth="1.5" /><path d="M280 86 h-30 a24 24 0 0 0 0 48 h30" fill="none" stroke={line} strokeWidth="1.5" /></>}
          {sport === 'Volleyball' && <><line x1="120" y1="62" x2="120" y2="158" stroke={line} strokeWidth="1" strokeDasharray="3 3" /><line x1="200" y1="62" x2="200" y2="158" stroke={line} strokeWidth="1" strokeDasharray="3 3" /></>}
          <Players />
        </g>
      )
    case 'Hockey':
      return (
        <g style={clip}>
          <rect x="24" y="60" width="272" height="100" rx="22" fill="#b5b5b5" />
          <rect x="24" y="60" width="272" height="100" rx="22" fill="none" stroke={line} strokeWidth="1.5" />
          <line x1="160" y1="60" x2="160" y2="160" stroke={line} strokeWidth="1.5" />
          <line x1="100" y1="60" x2="100" y2="160" stroke={line} strokeWidth="1" />
          <line x1="220" y1="60" x2="220" y2="160" stroke={line} strokeWidth="1" />
          <circle cx="160" cy="110" r="14" fill="none" stroke={line} strokeWidth="1.5" />
          <Players dark />
        </g>
      )
    case 'Football':
      return (
        <g style={clip}>
          <rect x="24" y="62" width="272" height="96" fill={field} />
          {Array.from({ length: 11 }).map((_, i) => (
            <line key={i} x1={24 + i * 27.2} y1="62" x2={24 + i * 27.2} y2="158" stroke={line} strokeWidth={i === 0 || i === 10 ? 1.5 : 1} />
          ))}
          <Players />
        </g>
      )
    case 'Lacrosse':
      return (
        <g style={clip}>
          <rect x="24" y="62" width="272" height="96" fill={field} />
          <rect x="24" y="62" width="272" height="96" fill="none" stroke={line} strokeWidth="1.5" />
          <line x1="160" y1="62" x2="160" y2="158" stroke={line} strokeWidth="1.5" />
          <circle cx="160" cy="110" r="8" fill="none" stroke={line} strokeWidth="1.5" />
          <rect x="60" y="92" width="18" height="36" fill="none" stroke={line} strokeWidth="1" />
          <rect x="242" y="92" width="18" height="36" fill="none" stroke={line} strokeWidth="1" />
          <Players />
        </g>
      )
    default:
      return (
        <g style={clip}>
          <rect x="24" y="62" width="272" height="96" fill={field} />
          <rect x="24" y="62" width="272" height="96" fill="none" stroke={line} strokeWidth="1.5" />
          <line x1="160" y1="62" x2="160" y2="158" stroke={line} strokeWidth="1.5" />
          <circle cx="160" cy="110" r="14" fill="none" stroke={line} strokeWidth="1.5" />
          <rect x="24" y="86" width="30" height="48" fill="none" stroke={line} strokeWidth="1" />
          <rect x="266" y="86" width="30" height="48" fill="none" stroke={line} strokeWidth="1" />
          <Players />
        </g>
      )
  }
}

function Players({ dark = false }: { dark?: boolean }) {
  const c = dark ? '#1a1a1a' : '#111'
  const pts = [[70, 92], [110, 118], [150, 88], [190, 120], [232, 94], [250, 130], [95, 140]]
  return (
    <g>
      {pts.map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="7" height="18" rx="1.5" fill={c} />
      ))}
    </g>
  )
}
