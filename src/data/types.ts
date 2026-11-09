export type DefectType =
  | 'Blur'
  | 'Overexposure'
  | 'Low light'
  | 'Miscalibration'
  | 'Stitching'
  | 'Weather'

export const DEFECT_TYPES: DefectType[] = [
  'Blur',
  'Overexposure',
  'Low light',
  'Miscalibration',
  'Stitching',
  'Weather',
]

/** Spatial defects can show a heat map; global ones cannot. */
export const SPATIAL_DEFECTS: DefectType[] = ['Miscalibration', 'Stitching', 'Blur']

export type Sport = 'Soccer' | 'Basketball' | 'Football' | 'Volleyball' | 'Lacrosse' | 'Hockey'
export const SPORTS: Sport[] = ['Soccer', 'Basketball', 'Football', 'Volleyball', 'Lacrosse', 'Hockey']

export type Camera = 'Pixellot' | 'Hudl Focus' | 'Spiideo'
export const CAMERAS: Camera[] = ['Pixellot', 'Hudl Focus', 'Spiideo']

export type GameStatus = 'live' | 'analyzed' | 'processing' | 'queued' | 'no-video'

export interface Detection {
  type: DefectType
  severity: number // 1..5
}

export interface Stretch {
  start: number // frame index inclusive
  end: number // frame index inclusive
  worst: number // worst frame index
  defects: Detection[] // detections at the worst frame
  region?: string // text region, only when validated
  heat?: { cx: number; cy: number; r: number } // 0..1 coords, only for spatial defects
}

export interface Game {
  id: string
  home: string
  away: string
  sport: Sport
  league: string
  venue: string
  camera: Camera
  date: string // ISO date
  startTime: string // "7:30 PM"
  durationMin: number
  status: GameStatus
  stretches: Stretch[]
  /** Visual seed for the placeholder frame. */
  seed: number
}

export interface Frame {
  index: number
  tSec: number
  score: number // 0..1 defect signal
  detections: Detection[]
  stretch?: Stretch
}

export interface Alert {
  id: string
  gameId: string
  frameIndex: number
  raisedAt: string // wall-clock label
  detections: Detection[]
  status: 'open' | 'reviewed'
  decision?: 'confirmed' | 'dismissed'
  reviewedBy?: string
  reviewedAt?: string
  /** Original model output is preserved even after review. */
  modelOutput: Detection[]
}

export type FeedbackKind = 'correct' | 'incorrect' | 'missed'

export interface Feedback {
  id: string
  gameId: string
  frameIndex: number
  kind: FeedbackKind
  defect?: DefectType
  severity?: number
  region?: { x: number; y: number } // 0..1 coords on the frame
  note?: string
  createdAt: string
}

export type JobStatus = 'queued' | 'running' | 'done' | 'failed'

export interface Job {
  id: string
  label: string
  gameId?: string
  kind: 'clip' | 'image' | 'match'
  totalFrames: number
  doneFrames: number
  status: JobStatus
  createdAt: number
  hardware: string
  meanLatencyMs: number
}
