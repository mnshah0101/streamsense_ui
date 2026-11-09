import type { Game, Frame, Alert, Stretch } from './types'

export const FRAME_INTERVAL_SEC = 5

const g = (
  id: string,
  home: string,
  away: string,
  sport: Game['sport'],
  league: string,
  venue: string,
  camera: Game['camera'],
  date: string,
  startTime: string,
  status: Game['status'],
  stretches: Stretch[],
  seed: number,
  durationMin = 60,
): Game => ({ id, home, away, sport, league, venue, camera, date, startTime, status, stretches, seed, durationMin })

export const GAMES: Game[] = [
  g('gam1063', 'Westview', 'Lakeside', 'Soccer', 'Varsity Boys', 'Westview Stadium', 'Pixellot', '2026-11-08', '7:30 PM', 'live',
    [{ start: 480, end: 500, worst: 492, defects: [{ type: 'Miscalibration', severity: 4 }], region: 'left third of frame', heat: { cx: 0.18, cy: 0.42, r: 0.22 } }], 3),
  g('gam1042', 'Northgate', 'Pine Ridge', 'Basketball', 'Varsity Girls', 'Northgate Gym', 'Hudl Focus', '2026-11-08', '6:00 PM', 'analyzed',
    [{ start: 200, end: 218, worst: 207, defects: [{ type: 'Blur', severity: 3 }, { type: 'Overexposure', severity: 2 }], heat: { cx: 0.55, cy: 0.5, r: 0.3 } }], 7, 40),
  g('gam1077', 'Cedar Hill', 'Brookfield', 'Football', 'JV', 'Cedar Hill Field', 'Pixellot', '2026-11-08', '7:00 PM', 'analyzed',
    [{ start: 40, end: 130, worst: 88, defects: [{ type: 'Low light', severity: 1 }] }], 11),
  g('gam1051', 'Eastbrook', 'Harbor View', 'Soccer', 'Varsity Girls', 'Harbor Park', 'Pixellot', '2026-11-07', '7:00 PM', 'analyzed',
    [{ start: 400, end: 430, worst: 417, defects: [{ type: 'Miscalibration', severity: 4 }], region: 'left third of frame', heat: { cx: 0.2, cy: 0.45, r: 0.24 } },
     { start: 610, end: 622, worst: 615, defects: [{ type: 'Weather', severity: 2 }] }], 5),
  g('gam1080', 'Summit', 'Riverside', 'Volleyball', 'Varsity Girls', 'Summit Fieldhouse', 'Spiideo', '2026-11-08', '5:30 PM', 'processing',
    [{ start: 150, end: 165, worst: 158, defects: [{ type: 'Stitching', severity: 3 }], region: 'center seam', heat: { cx: 0.5, cy: 0.5, r: 0.12 } }], 13, 45),
  g('gam1088', 'Oak Valley', 'Mesa', 'Lacrosse', 'Varsity Boys', 'Oak Valley Turf', 'Hudl Focus', '2026-11-08', '4:00 PM', 'queued', [], 17),
  g('gam1032', 'Lakeside', 'Cedar Hill', 'Soccer', 'JV', 'Lakeside Stadium', 'Pixellot', '2026-11-06', '5:00 PM', 'analyzed', [], 19),
  g('gam1029', 'Harbor View', 'Northgate', 'Basketball', 'Varsity Boys', 'Harbor Gym', 'Hudl Focus', '2026-11-06', '7:30 PM', 'analyzed',
    [{ start: 300, end: 320, worst: 311, defects: [{ type: 'Overexposure', severity: 3 }] }], 23, 40),
  g('gam1017', 'Pine Ridge', 'Summit', 'Hockey', 'Varsity', 'Pine Ridge Arena', 'Spiideo', '2026-11-05', '8:00 PM', 'analyzed',
    [{ start: 90, end: 104, worst: 97, defects: [{ type: 'Blur', severity: 2 }], heat: { cx: 0.7, cy: 0.4, r: 0.2 } }], 29),
  g('gam1011', 'Brookfield', 'Oak Valley', 'Football', 'Varsity', 'Brookfield Field', 'Pixellot', '2026-11-04', '7:00 PM', 'analyzed',
    [{ start: 500, end: 560, worst: 541, defects: [{ type: 'Low light', severity: 4 }] }], 31),
  g('gam1095', 'Mesa', 'Westview', 'Soccer', 'Varsity Boys', 'Mesa Park', 'Spiideo', '2026-11-09', '3:00 PM', 'no-video', [], 37),
  g('gam1008', 'Riverside', 'Eastbrook', 'Volleyball', 'JV', 'Riverside Gym', 'Hudl Focus', '2026-11-03', '6:00 PM', 'analyzed', [], 41, 45),
  g('gam1004', 'Northgate', 'Westview', 'Lacrosse', 'Varsity Girls', 'Northgate Turf', 'Pixellot', '2026-11-02', '1:00 PM', 'analyzed',
    [{ start: 220, end: 236, worst: 229, defects: [{ type: 'Stitching', severity: 2 }], heat: { cx: 0.5, cy: 0.5, r: 0.1 } }], 43),
  g('gam1001', 'Cedar Hill', 'Pine Ridge', 'Hockey', 'JV', 'Cedar Arena', 'Spiideo', '2026-11-01', '5:00 PM', 'analyzed',
    [{ start: 10, end: 30, worst: 19, defects: [{ type: 'Weather', severity: 1 }] }], 47),
]

export function gameById(id: string | undefined): Game | undefined {
  return GAMES.find((x) => x.id === id)
}

export function gameTitle(game: Game): string {
  return `${game.home} vs ${game.away}`
}

export function totalFrames(game: Game): number {
  return Math.round((game.durationMin * 60) / FRAME_INTERVAL_SEC)
}

/** mulberry32 — stable noise per game so the timeline never changes between renders. */
function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const frameCache = new Map<string, Frame[]>()

export function framesFor(game: Game): Frame[] {
  const cached = frameCache.get(game.id)
  if (cached) return cached
  const n = totalFrames(game)
  const rand = rng(game.seed * 7919)
  const frames: Frame[] = []
  for (let i = 0; i < n; i++) {
    const stretch = game.stretches.find((s) => i >= s.start && i <= s.end)
    let score = 0.05 + rand() * 0.12
    let detections = [] as Frame['detections']
    if (stretch) {
      const span = Math.max(1, stretch.end - stretch.start)
      const dist = Math.abs(i - stretch.worst) / span
      const peak = Math.max(...stretch.defects.map((d) => d.severity)) / 5
      score = Math.max(score, peak * (1 - dist * 0.8))
      detections = stretch.defects.map((d) => ({
        type: d.type,
        severity: Math.max(1, Math.round(d.severity * (1 - dist * 0.6))),
      }))
    }
    frames.push({ index: i, tSec: i * FRAME_INTERVAL_SEC, score, detections, stretch })
  }
  frameCache.set(game.id, frames)
  return frames
}

export function clockLabel(tSec: number): string {
  const m = Math.floor(tSec / 60)
  const s = tSec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

/** Wall-clock label for a frame given the match start, e.g. "7:30 PM" + 34:05 → "8:04 PM". */
export function wallClock(game: Game, tSec: number): string {
  const [time, ampm] = game.startTime.split(' ')
  const [hh, mm] = time.split(':').map(Number)
  let h24 = hh % 12 + (ampm === 'PM' ? 12 : 0)
  let minutes = h24 * 60 + mm + Math.floor(tSec / 60)
  minutes %= 24 * 60
  h24 = Math.floor(minutes / 60)
  const m = minutes % 60
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12
  return `${h12}:${m.toString().padStart(2, '0')} ${h24 >= 12 ? 'PM' : 'AM'}`
}

export const ALERT_THRESHOLD_DEFAULT = 2

/** Seed alerts: one per stretch whose worst severity clears the threshold. */
export function seedAlerts(): Alert[] {
  const alerts: Alert[] = []
  for (const game of GAMES) {
    if (game.status === 'queued' || game.status === 'no-video') continue
    game.stretches.forEach((s, idx) => {
      const worst = Math.max(...s.defects.map((d) => d.severity))
      if (worst < ALERT_THRESHOLD_DEFAULT && !(game.id === 'gam1077')) return
      const old = ['gam1051', 'gam1029', 'gam1017', 'gam1011', 'gam1004'].includes(game.id)
      alerts.push({
        id: `alr-${game.id}-${idx}`,
        gameId: game.id,
        frameIndex: s.worst,
        raisedAt: wallClock(game, s.worst * FRAME_INTERVAL_SEC),
        detections: s.defects,
        modelOutput: s.defects,
        status: old ? 'reviewed' : 'open',
        decision: old ? (game.id === 'gam1017' ? 'dismissed' : 'confirmed') : undefined,
        reviewedBy: old ? 'm.shah' : undefined,
        reviewedAt: old ? `${game.date} 10:12 PM` : undefined,
      })
    })
  }
  const order = (a: Alert) => Math.max(...a.detections.map((d) => d.severity))
  return alerts.sort((a, b) => order(b) - order(a))
}
