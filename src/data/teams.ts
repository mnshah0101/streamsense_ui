export type CrestShape = 'shield' | 'circle' | 'hex' | 'diamond'

export interface Team {
  name: string
  mascot: string
  initials: string
  primary: string
  secondary: string
  shape: CrestShape
}

/* Mock high-school programs. Colors are content imagery (like a photo), not UI tokens. */
export const TEAMS: Record<string, Team> = {
  Westview:      { name: 'Westview',      mascot: 'Wolves',     initials: 'WV', primary: '#1f3a93', secondary: '#c9a227', shape: 'shield' },
  Lakeside:      { name: 'Lakeside',      mascot: 'Lakers',     initials: 'LS', primary: '#0e7c7b', secondary: '#f2f2f2', shape: 'circle' },
  Northgate:     { name: 'Northgate',     mascot: 'Knights',    initials: 'NG', primary: '#2b2b2b', secondary: '#c0c0c0', shape: 'shield' },
  'Pine Ridge':  { name: 'Pine Ridge',    mascot: 'Pioneers',   initials: 'PR', primary: '#1e5631', secondary: '#f4d35e', shape: 'hex' },
  'Cedar Hill':  { name: 'Cedar Hill',    mascot: 'Cardinals',  initials: 'CH', primary: '#9b1c1c', secondary: '#f2f2f2', shape: 'circle' },
  Brookfield:    { name: 'Brookfield',    mascot: 'Bears',      initials: 'BF', primary: '#5a3a1a', secondary: '#e8c07d', shape: 'shield' },
  Eastbrook:     { name: 'Eastbrook',     mascot: 'Eagles',     initials: 'EB', primary: '#1b4b8f', secondary: '#f2f2f2', shape: 'diamond' },
  'Harbor View': { name: 'Harbor View',   mascot: 'Mariners',   initials: 'HV', primary: '#0b3d5c', secondary: '#7fd1e8', shape: 'circle' },
  Summit:        { name: 'Summit',        mascot: 'Storm',      initials: 'SM', primary: '#4b2a7a', secondary: '#c9b6ea', shape: 'hex' },
  Riverside:     { name: 'Riverside',     mascot: 'Rapids',     initials: 'RS', primary: '#0f6e56', secondary: '#f2f2f2', shape: 'shield' },
  'Oak Valley':  { name: 'Oak Valley',    mascot: 'Oaks',       initials: 'OV', primary: '#6b4f1d', secondary: '#9bbf3a', shape: 'diamond' },
  Mesa:          { name: 'Mesa',          mascot: 'Mustangs',   initials: 'MS', primary: '#b5471b', secondary: '#f2d16b', shape: 'hex' },
}

export function teamOf(name: string): Team {
  return TEAMS[name] ?? { name, mascot: '', initials: name.slice(0, 2).toUpperCase(), primary: '#444', secondary: '#ddd', shape: 'circle' }
}
