import type { Sport } from '../data/types'

/** Inline sport glyphs, stroke 1.5, currentColor. */
export default function SportIcon({ sport, className = 'h-4 w-4' }: { sport: Sport; className?: string }) {
  const p = { className, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true }
  switch (sport) {
    case 'Soccer':
      return (
        <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7l4.5 3.3-1.7 5.4H9.2L7.5 10.3Z" /><path d="M12 3v4M7.5 10.3 4 8.5M16.5 10.3 20 8.5M9.2 15.7 7 19M14.8 15.7 17 19" /></svg>
      )
    case 'Basketball':
      return (
        <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3v18" /><path d="M5.6 5.6c3.6 3.6 3.6 9.2 0 12.8M18.4 5.6c-3.6 3.6-3.6 9.2 0 12.8" /></svg>
      )
    case 'Football':
      return (
        <svg {...p}><path d="M4 20C2.5 14 9.5 3.5 20 4c1.5 6-5.5 16.5-16 16Z" /><path d="M8 16l8-8M10 12l1.5 1.5M12 10l1.5 1.5M14 8l1.5 1.5" /></svg>
      )
    case 'Volleyball':
      return (
        <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 3c-1 5 1 9 7 11M3.5 14c4-3 10-2 13 3M9 20.5c2-5 6-7 11.5-6" /></svg>
      )
    case 'Lacrosse':
      return (
        <svg {...p}><path d="M4 20l9-9" /><ellipse cx="16" cy="8" rx="4.5" ry="5.5" transform="rotate(45 16 8)" /><path d="M13.5 5.5l5 5M12.5 8l3.5 3.5M15 5l3.5 3.5" /></svg>
      )
    case 'Hockey':
      return (
        <svg {...p}><path d="M5 3l7 13" /><path d="M12 16h5a2 2 0 0 1 2 2v1H9a2 2 0 0 1-2-2v-1" /><ellipse cx="6" cy="19.5" rx="3" ry="1.3" /></svg>
      )
  }
}
