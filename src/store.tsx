import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Alert, Feedback, Job, GameStatus } from './data/types'
import { GAMES, seedAlerts, totalFrames } from './data/games'

interface Store {
  alerts: Alert[]
  feedback: Feedback[]
  jobs: Job[]
  gameStatus: Record<string, GameStatus>
  threshold: number
  savedThreshold: number
  sidebarOpen: boolean
  unseenAlerts: number
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  reviewAlert: (id: string, decision: 'confirmed' | 'dismissed') => void
  addFeedback: (f: Omit<Feedback, 'id' | 'createdAt'>) => void
  removeFeedback: (id: string) => void
  startJob: (job: Omit<Job, 'id' | 'doneFrames' | 'status' | 'createdAt'>) => string
  setThreshold: (n: number) => void
  saveThreshold: () => void
}

const Ctx = createContext<Store | null>(null)

// Demo persistence: survive a page refresh mid-demo. Cleared via "Reset demo" in the nav.
const KEY = 'streamsense-demo-v1'
function load<T>(field: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return fallback
    const obj = JSON.parse(raw) as Record<string, unknown>
    return (obj[field] as T) ?? fallback
  } catch {
    return fallback
  }
}
export function resetDemo() {
  try { localStorage.removeItem(KEY) } catch { /* ignore */ }
  window.location.href = '/'
}

let counter = 100
const nextId = (p: string) => `${p}-${++counter}`

export function StoreProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>(() => load('alerts', seedAlerts()))
  const [feedback, setFeedback] = useState<Feedback[]>(() => load('feedback', []))
  const [jobs, setJobs] = useState<Job[]>([])
  const [gameStatus, setGameStatus] = useState<Record<string, GameStatus>>(() =>
    Object.fromEntries(GAMES.map((g) => [g.id, g.status])),
  )
  const [threshold, setThreshold] = useState(() => load('threshold', 2))
  const [savedThreshold, setSavedThreshold] = useState(() => load('threshold', 2))
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [seenCount, setSeenCount] = useState(0)

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify({ alerts, feedback, threshold: savedThreshold })) } catch { /* ignore */ }
  }, [alerts, feedback, savedThreshold])

  const openCount = alerts.filter((a) => a.status === 'open').length
  const unseenAlerts = sidebarOpen ? 0 : Math.max(0, openCount - seenCount)

  // Opening the sidebar marks everything as seen.
  useEffect(() => {
    if (sidebarOpen) setSeenCount(openCount)
  }, [sidebarOpen, openCount])
  // First load: the initial queue counts as unseen only for the live-stream alert.
  useEffect(() => {
    setSeenCount(openCount - 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Demo: the live game raises a fresh alert ~25 s after load, once.
  const raised = useRef(false)
  useEffect(() => {
    const t = setTimeout(() => {
      if (raised.current) return
      raised.current = true
      setAlerts((prev) => prev.some((a) => a.id === 'alr-gam1063-live') ? prev : [
        {
          id: 'alr-gam1063-live',
          gameId: 'gam1063',
          frameIndex: 640,
          raisedAt: '8:23 PM',
          detections: [{ type: 'Low light', severity: 3 }],
          modelOutput: [{ type: 'Low light', severity: 3 }],
          status: 'open',
        },
        ...prev,
      ])
    }, 25000)
    return () => clearTimeout(t)
  }, [])

  const reviewAlert = useCallback((id: string, decision: 'confirmed' | 'dismissed') => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: 'reviewed', decision, reviewedBy: 'm.shah', reviewedAt: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }
          : a,
      ),
    )
  }, [])

  const addFeedback = useCallback((f: Omit<Feedback, 'id' | 'createdAt'>) => {
    setFeedback((prev) => [
      { ...f, id: nextId('fb'), createdAt: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) },
      ...prev,
    ])
  }, [])
  const removeFeedback = useCallback((id: string) => {
    setFeedback((prev) => prev.filter((f) => f.id !== id))
  }, [])

  // Simulated async job runner: queued → running → done, frames arrive incrementally.
  const timers = useRef<Record<string, number>>({})
  const startJob = useCallback((spec: Omit<Job, 'id' | 'doneFrames' | 'status' | 'createdAt'>) => {
    const id = nextId('job')
    const job: Job = { ...spec, id, doneFrames: 0, status: 'queued', createdAt: Date.now() }
    setJobs((prev) => [job, ...prev])
    if (spec.gameId) setGameStatus((s) => ({ ...s, [spec.gameId!]: 'queued' }))
    const startDelay = 1400
    window.setTimeout(() => {
      setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status: 'running' } : j)))
      if (spec.gameId) setGameStatus((s) => ({ ...s, [spec.gameId!]: 'processing' }))
      const step = Math.max(1, Math.round(spec.totalFrames / 90))
      timers.current[id] = window.setInterval(() => {
        setJobs((prev) =>
          prev.map((j) => {
            if (j.id !== id) return j
            const done = Math.min(j.totalFrames, j.doneFrames + step)
            if (done >= j.totalFrames) {
              window.clearInterval(timers.current[id])
              if (spec.gameId) setGameStatus((s) => ({ ...s, [spec.gameId!]: 'analyzed' }))
              return { ...j, doneFrames: done, status: 'done' }
            }
            return { ...j, doneFrames: done }
          }),
        )
      }, 220)
    }, startDelay)
    return id
  }, [])
  useEffect(() => () => Object.values(timers.current).forEach((t) => window.clearInterval(t)), [])

  const saveThreshold = useCallback(() => setSavedThreshold(threshold), [threshold])

  const value = useMemo<Store>(
    () => ({
      alerts, feedback, jobs, gameStatus, threshold, savedThreshold, sidebarOpen, unseenAlerts,
      setSidebarOpen, toggleSidebar: () => setSidebarOpen((o) => !o),
      reviewAlert, addFeedback, removeFeedback, startJob, setThreshold, saveThreshold,
    }),
    [alerts, feedback, jobs, gameStatus, threshold, savedThreshold, sidebarOpen, unseenAlerts, reviewAlert, addFeedback, removeFeedback, startJob, saveThreshold],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore(): Store {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore outside provider')
  return s
}

/** Frames visible for a game right now: all when analyzed, partial while a job runs. */
export function useVisibleFrames(gameId: string): { visible: number; total: number; job?: Job } {
  const { jobs, gameStatus } = useStore()
  const game = GAMES.find((g) => g.id === gameId)
  if (!game) return { visible: 0, total: 0 }
  const total = totalFrames(game)
  const job = jobs.find((j) => j.gameId === gameId && j.status !== 'failed')
  const status = gameStatus[gameId]
  if (job && job.status !== 'done') return { visible: job.doneFrames, total, job }
  if (status === 'queued' || status === 'no-video') return { visible: 0, total, job }
  if (status === 'live') return { visible: Math.round(total * 0.9), total, job }
  if (status === 'processing' && !job) return { visible: Math.round(total * 0.35), total }
  return { visible: total, total, job }
}
