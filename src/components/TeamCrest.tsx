import { teamOf } from '../data/teams'

/** Mock HS crest: a colored badge shape with the program's initials. */
export default function TeamCrest({ team, size = 48, className = '' }: { team: string; size?: number; className?: string }) {
  const t = teamOf(team)
  const fs = size * 0.36
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} role="img" aria-label={`${t.name} ${t.mascot} crest`}>
      <Shape shape={t.shape} fill={t.primary} stroke={t.secondary} />
      {/* inner band */}
      {t.shape === 'shield' && <path d="M22 30 H78 V40 H22 Z" fill={t.secondary} opacity="0.9" />}
      {t.shape === 'circle' && <circle cx="50" cy="50" r="33" fill="none" stroke={t.secondary} strokeWidth="3" />}
      {t.shape === 'hex' && <path d="M50 18 L76 33 V67 L50 82 L24 67 V33 Z" fill="none" stroke={t.secondary} strokeWidth="3" />}
      {t.shape === 'diamond' && <path d="M50 16 L84 50 L50 84 L16 50 Z" fill="none" stroke={t.secondary} strokeWidth="3" />}
      <text x="50" y={t.shape === 'shield' ? 70 : 61} textAnchor="middle" fontSize={fs + 18} fontWeight="700" fontFamily="var(--font-display)" fill={t.shape === 'shield' ? t.secondary : t.secondary} letterSpacing="1">
        {t.initials}
      </text>
    </svg>
  )
}

function Shape({ shape, fill, stroke }: { shape: string; fill: string; stroke: string }) {
  switch (shape) {
    case 'shield':
      return <path d="M50 4 L90 16 V50 C90 74 72 90 50 97 C28 90 10 74 10 50 V16 Z" fill={fill} stroke={stroke} strokeWidth="4" />
    case 'hex':
      return <path d="M50 4 L90 27 V73 L50 96 L10 73 V27 Z" fill={fill} stroke={stroke} strokeWidth="4" />
    case 'diamond':
      return <path d="M50 4 L96 50 L50 96 L4 50 Z" fill={fill} stroke={stroke} strokeWidth="4" />
    default:
      return <circle cx="50" cy="50" r="46" fill={fill} stroke={stroke} strokeWidth="4" />
  }
}
